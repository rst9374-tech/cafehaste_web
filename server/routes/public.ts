import { Router } from "express";
import path from "path";
import {
  supabase,
  isCloudSqlConnected,
  getDbPool,
  readBackupLicenses,
} from "../database";
import fs from "fs";
import crypto from "crypto";

import authRouter from "./public/auth";
import catalogRouter from "./public/catalog";
import postsRouter from "./public/posts";
import verifyRouter from "./public/verify";
import permissionsRouter from "./public/permissions";
import musicRouter from "./public/music";
import commentsRouter from "./public/comments";
import rssRouter from "./public/rss";
import storeVersionRouter from "./public/store_version";
import didCallbackRouter from "./public/did_callback";

const router = Router();

// [HASTE 임시 제어 우회 수정 지점] 매장별 DID 가동 모드 통합 저장소 (local | remote)
const storeDidModeMap = new Map<string, 'local' | 'remote'>();

// [HASTE 임시 제어 우회 수정 지점] 매장별 최근 대시보드 제어 전환 타임스탬프 (기기 멱살잡이 역동기화 덮어쓰기 방지용 쿨타임 락)
const storeDidLastControlTimeMap = new Map<string, number>();

function getFormattedTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// POS/Admin Image & File upload directly to Supabase Storage with category/board isolation and ID-linked immutable naming
router.post("/api/upload", async (req, res) => {
  const { base64Data, filename, boardName, categoryId, storeCode } = req.body;

  if (!base64Data) {
    return res.status(400).json({
      success: false,
      message: "전송받은 이미지 파일 데이터가 유효하지 않습니다.",
    });
  }

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let extension = "jpg";
    let buffer;
    let mimeType = "image/jpeg";

    // 🔽 전달받은 원래 filename에서 확장자 추출
    if (filename && typeof filename === "string" && filename.includes(".")) {
      const parts = filename.split(".");
      extension = parts[parts.length - 1].toLowerCase();
    }

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");

      // filename이 없었거나 확장자 매핑이 안 되었을 때만 mimeType 기반으로 보정
      if (!filename || !filename.includes(".")) {
        if (mimeType.includes("png")) {
          extension = "png";
        } else if (mimeType.includes("webp")) {
          extension = "webp";
        } else if (mimeType.includes("gif")) {
          extension = "gif";
        } else if (mimeType.includes("svg")) {
          extension = "svg";
        } else if (mimeType.includes("pdf")) {
          extension = "pdf";
        }
      }
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const ext = extension.toLowerCase();
    let virtualPathInBucket = "";

    if (boardName === "menu" && categoryId && categoryId !== "MENU_ITEM") {
      // Option 2: Naming pattern for menu items: menu/[category]/[Menu_ID].[ext]
      const upper = categoryId.toUpperCase();
      let subFolder = "menu";
      if (upper.startsWith("AME_")) subFolder = "menu/americano";
      else if (upper.startsWith("LAT_")) subFolder = "menu/coffee_latte";
      else if (upper.startsWith("MILK_")) subFolder = "menu/milk_latte";
      else if (upper.startsWith("TEA_")) subFolder = "menu/tea_base";
      else if (upper.startsWith("ADE_") || upper.startsWith("ETC_"))
        subFolder = "menu/ade_etc";

      virtualPathInBucket = `${subFolder}/${categoryId}.${ext}`;
    } else {
      // Naming pattern for other uploads: [board_name]/[Category_Unique_ID]_[storeCode]_[YYYYMMDD_HHMMSS].[extension]
      const folder = (boardName || "general")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const catUniqueId = (
        categoryId ||
        "CAT_GEN_" + Math.random().toString(36).substring(2, 6).toUpperCase()
      )
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_");
      const timestamp = getFormattedTimestamp();
      const storeSuffix = storeCode
        ? `_${storeCode.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
        : "";
      virtualPathInBucket = `${folder}/${catUniqueId}${storeSuffix}_${timestamp}.${ext}`;
    }

    // 1. Always save to local storage (uploads/) as a reliable fallback
    const UPLOADS_DIR = path.join(process.cwd(), "uploads");
    const localTargetFilePath = path.join(UPLOADS_DIR, virtualPathInBucket);
    const localTargetDir = path.dirname(localTargetFilePath);

    if (!fs.existsSync(localTargetDir)) {
      fs.mkdirSync(localTargetDir, { recursive: true });
    }
    fs.writeFileSync(localTargetFilePath, buffer);
    console.log(
      `[Local Storage] /api/upload saved locally: ${virtualPathInBucket}`,
    );

    // 2. Background upload directly to Supabase Storage (cafehaste-bucket)
    try {
      const { error } = await supabase.storage
        .from("cafehaste-bucket")
        .upload(virtualPathInBucket, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error(
          "[Supabase Storage Warning] Background upload failed, using local fallback:",
          error.message,
        );
      } else {
        console.log(
          `[Supabase Storage] Dynamic category upload complete: ${virtualPathInBucket}`,
        );
      }
    } catch (storageErr: any) {
      console.error(
        "[Supabase Storage Warning] Background upload crashed, using local fallback:",
        storageErr.message,
      );
    }

    // Always return local relative URL path to support local/remote dual-lookup
    res.json({
      success: true,
      url: `/uploads/${virtualPathInBucket}`,
      message: "성공적으로 이미지 파일 저장이 완료되었습니다!",
    });
  } catch (err: any) {
    console.error(
      "[Upload handler error] Failed to process uploaded image:",
      err,
    );
    res.status(500).json({
      success: false,
      error: err.message,
      message:
        "업로드한 이미지를 가공하고 저장하는 서버 연동 중 오류가 발생했습니다.",
    });
  }
});

// Invidious API scraper variables and helper for robust metadata retrieval without datacenter IP blocking
let lastWorkingInvidiousInstance = "inv.thepixora.com"; // Pre-seed with a known working one

async function fetchInvidiousDescription(ytId: string): Promise<string> {
  // 1. Try last working instance first
  if (lastWorkingInvidiousInstance) {
    try {
      const response = await fetch(
        `https://${lastWorkingInvidiousInstance}/api/v1/videos/${ytId}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(3000),
        },
      );
      if (response.ok) {
        const json: any = await response.json();
        if (json && json.description) {
          return json.description;
        }
      }
    } catch (err) {
      console.warn(
        `[YouTube Scraper] Pre-seeded instance ${lastWorkingInvidiousInstance} failed, searching list...`,
      );
    }
  }

  // 2. Fetch list of active instances and try them in sequence
  try {
    const listRes = await fetch("https://api.invidious.io/instances.json", {
      signal: AbortSignal.timeout(4000),
    });
    if (listRes.ok) {
      const instancesData = await listRes.json();
      if (Array.isArray(instancesData)) {
        const activeDomains = instancesData
          .filter((item) => {
            const details = item[1] || {};
            return (
              details.type === "https" &&
              details.monitor &&
              details.monitor.down === false
            );
          })
          .map((item) => item[0]);

        for (const domain of activeDomains.slice(0, 5)) {
          if (domain === lastWorkingInvidiousInstance) continue;
          try {
            const response = await fetch(
              `https://${domain}/api/v1/videos/${ytId}`,
              {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
                signal: AbortSignal.timeout(3000),
              },
            );
            if (response.ok) {
              const json: any = await response.json();
              if (json && json.description) {
                lastWorkingInvidiousInstance = domain;
                console.log(
                  `[YouTube Scraper] Found new working Invidious instance: ${domain}`,
                );
                return json.description;
              }
            }
          } catch (e) {
            // ignore and try next
          }
        }
      }
    }
  } catch (listErr: any) {
    console.warn(
      "[YouTube Scraper] Failed to fetch Invidious instances:",
      listErr.message,
    );
  }

  return "";
}

// YouTube Metadata Scraper API
router.get("/api/youtube-meta", async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "URL이 필요합니다." });
  }

  try {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const ytId = match && match[2].length === 11 ? match[2] : null;
    if (!ytId) {
      return res.status(400).json({
        success: false,
        message: "유효한 유튜브 ID를 찾을 수 없습니다.",
      });
    }

    // 1. Try Invidious instances first (bypasses YouTube datacenter block)
    let description = await fetchInvidiousDescription(ytId);

    // 2. Fallback to direct watch page scraping if Invidious fails
    if (!description) {
      console.log(
        `[YouTube Scraper] Invidious failed. Falling back to direct scrape for video: ${ytId}`,
      );
      try {
        const response = await fetch(
          `https://www.youtube.com/watch?v=${ytId}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
              Cookie:
                "CONSENT=YES+cb; SOCS=CAESEwgDEgk0ODE3NTEzNTQaAnRyIAEaBgiA_cugBg",
            },
            signal: AbortSignal.timeout(4000),
          },
        );

        if (response.ok) {
          const html = await response.text();

          // Try to extract description from ytInitialPlayerResponse JSON
          const playerResponseMatch = html.match(
            /var ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/,
          );
          if (playerResponseMatch) {
            try {
              const json = JSON.parse(playerResponseMatch[1]);
              if (json.videoDetails && json.videoDetails.shortDescription) {
                description = json.videoDetails.shortDescription;
              }
            } catch (jsonErr) {}
          }

          // Fallback to description meta tag
          if (!description) {
            const descMatch =
              html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) ||
              html.match(
                /<meta\s+property="og:description"\s+content="([^"]*)"/i,
              );
            if (descMatch && descMatch[1]) {
              description = descMatch[1];
            }
          }
        }
      } catch (directErr: any) {
        console.warn(
          "[YouTube Scraper] Direct scrape fallback failed:",
          directErr.message,
        );
      }
    }

    // 3. Clean up HTML entities
    if (description) {
      description = description
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ");
    }

    // 4. Filter out YouTube default generic page descriptions
    const genericYtDesc =
      "YouTube에서 마음에 드는 동영상과 음악을 감상하고, 직접 만든 콘텐츠를 업로드하여 친구, 가족뿐 아니라 전 세계 사람들과 콘텐츠를 공유할 수 있습니다.";
    const genericYtDescEn =
      "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.";
    if (
      description.trim() === genericYtDesc ||
      description.trim() === genericYtDescEn ||
      description.includes("Enjoy the videos and music you love")
    ) {
      description = "";
    }

    return res.json({ success: true, description });
  } catch (err: any) {
    console.error("[YouTube Meta Scraper Error]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 매장 라이선스 및 유상 옵션(원격 제어 등) 권한 검증 헬퍼 함수
async function verifyRemoteAccess(
  storeCode: string,
): Promise<{ allowed: boolean; message: string }> {
  if (!storeCode) {
    return { allowed: false, message: "매장 코드가 누락되었습니다." };
  }
  try {
    const dbPool = await getDbPool();
    let licenseItem: any = null;

    if (dbPool.isFallback) {
      // 로컬 개발 환경용 시뮬레이터 바인딩
      if (storeCode === "HASTE-HQS-ADMIN") {
        licenseItem = {
          isApproved: 1,
          licenseEndDate: "2029-12-31",
          storeGrade: "PREMIUM",
        };
      } else {
        licenseItem = {
          isApproved: 1,
          licenseEndDate: "2029-12-31",
          storeGrade: "STANDARD",
        };
      }
    } else {
      const [rows]: any = await dbPool.query(
        "SELECT is_approved, license_end_date, store_grade FROM web_store_licenses WHERE store_id = ? LIMIT 1",
        [storeCode.trim()],
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        licenseItem = {
          isApproved: r.is_approved !== undefined ? Number(r.is_approved) : 1,
          licenseEndDate: r.license_end_date
            ? new Date(r.license_end_date).toISOString().split("T")[0]
            : "",
          storeGrade: r.store_grade || "PREMIUM",
        };
      }
    }

    if (!licenseItem) {
      return { allowed: false, message: "존재하지 않는 매장 번호입니다." };
    }

    const serverTimeDate = new Date();
    const expiryTime = new Date(`${licenseItem.licenseEndDate || ""}T23:59:59`);
    const isApprovedActive =
      licenseItem.isApproved === 1 || licenseItem.isApproved === true;
    const isNotExpired = expiryTime.getTime() >= serverTimeDate.getTime();

    if (!isApprovedActive || !isNotExpired) {
      return {
        allowed: false,
        message:
          "라이선스가 만료되었거나 승인되지 않은 매장 번호입니다. 본사에 문의해 주세요.",
      };
    }

    const isPremium =
      (licenseItem.storeGrade || "").trim().toUpperCase() === "PREMIUM";
    if (!isPremium) {
      return {
        allowed: false,
        message:
          "원격 제어 및 설정은 PREMIUM 등급 전용 유상 옵션입니다. 솔루션을 PREMIUM 등급으로 업그레이드해 주세요.",
      };
    }

    return { allowed: true, message: "" };
  } catch (err) {
    console.error(`[Remote Access Check Failed] storeCode: ${storeCode}`, err);
    return {
      allowed: false,
      message: "라이선스 조회 중 서버 내부 오류가 발생했습니다.",
    };
  }
}

// /api/remote 하위 모든 원격 통신 경로에 대한 최상위 일괄 라이선스/등급 검문소 미들웨어
router.use("/api/remote", async (req: any, res: any, next: any) => {
  // 1. 단순 기기 로그 업로드(telemetry) API는 본사 중계망 전송이나 직접 제어가 아니므로 보안 검증 예외 처리
  const rawPath = req.originalUrl.split("?")[0];
  if (rawPath === "/api/remote/log" && req.method === "POST") {
    return next();
  }

  // 2. 요청 Body 또는 Query 파라미터에서 매장 코드 추출
  const storeCode = (req.body?.storeCode || req.query?.storeCode || "").trim();
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }
  // 3. 라이선스 유효성 및 PREMIUM 등급(유상 옵션) 일괄 검증
  const isLocalTestEnv = process.env.NODE_ENV !== "production";
  if (isLocalTestEnv) {
    return next();
  }

  const access = await verifyRemoteAccess(storeCode);
  if (!access.allowed) {
    return res.status(403).json({ success: false, message: access.message });
  }

  next();
});

// 🔽 [HASTE 임시 제어 우회 수정 지점] DB로부터 동적으로 주서버 디스코드 토큰 로드
async function getPrimaryDiscordToken(): Promise<string> {
  let token =
    "MTUyNjI0MDE2NTg2ODIxMjQ0NQ.GAfCVA.p5QmUbvqKZGMhZT4GSdsAX89OQBNIhAe9TIDEs";
  try {
    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      const [settingsRows]: any = await dbPool.query(
        "SELECT setting_value FROM web_system_settings WHERE setting_key = 'discord_bot_token_primary' LIMIT 1",
      );
      if (
        settingsRows &&
        settingsRows.length > 0 &&
        settingsRows[0].setting_value
      ) {
        token = settingsRows[0].setting_value;
      }
    }
  } catch (err) {
    console.warn("[Discord Token Load Warning] Fallback token used:", err);
  }
  return token;
}

// DB로부터 동적으로 예비(Secondary) 디스코드 토큰 로드
async function getSecondaryDiscordToken(): Promise<string> {
  let token =
    "MTUyNjI4MjUwMzIzNzEzMjk2Mg.GBgDVB.q6RnVcvqKZGMhZT4GSdsAX89OQBNIhAe9TIDEs";
  try {
    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      const [settingsRows]: any = await dbPool.query(
        "SELECT setting_value FROM web_system_settings WHERE setting_key = 'discord_bot_token_secondary' LIMIT 1",
      );
      if (
        settingsRows &&
        settingsRows.length > 0 &&
        settingsRows[0].setting_value
      ) {
        token = settingsRows[0].setting_value;
      }
    }
  } catch (err) {
    console.warn(
      "[Secondary Discord Token Load Warning] Fallback token used:",
      err,
    );
  }
  return token;
}

// 디스코드 원격 중계 컵 배출 API
router.post("/api/remote/dispense-cup", async (req, res) => {
  const { type, storeCode } = req.body;
  if (!storeCode || !type) {
    return res
      .status(400)
      .json({ success: false, message: "type과 storeCode가 누락되었습니다." });
  }

  try {
    const token = await getPrimaryDiscordToken();

    // 1. 봇이 소속된 첫 번째 길드(서버) 조회
    const guildsResponse = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    if (!guildsResponse.ok)
      throw new Error("디스코드 서버 목록 조회에 실패했습니다.");
    const guilds: any = await guildsResponse.json();
    if (guilds.length === 0)
      throw new Error("봇이 소속된 디스코드 서버가 없습니다.");

    const targetGuildId = guilds[0].id;

    // 2. 해당 서버의 채널 목록 조회하여 텍스트 채널 감지
    const channelsResponse = await fetch(
      `https://discord.com/api/v10/guilds/${targetGuildId}/channels`,
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    if (!channelsResponse.ok)
      throw new Error("디스코드 채널 목록 조회에 실패했습니다.");
    const channels: any = await channelsResponse.json();

    // 타입이 0(텍스트 채널)인 채널 중 첫 번째 채널 찾기
    const textChannel = channels.find((c: any) => c.type === 0);
    if (!textChannel)
      throw new Error("서버에 메시지를 보낼 텍스트 채널이 없습니다.");

    // 3. 해당 채널에 JSON 터널 패킷 포스팅 [HASTE 임시 제어 우회 수정 지점]
    const packetContent = JSON.stringify({
      route: "/v3/parts/cup/dispense",
      targetStore: storeCode,
      body: { cupName: type || "컵1" },
    });

    const postResponse = await fetch(
      `https://discord.com/api/v10/channels/${textChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: packetContent }),
      },
    );

    if (!postResponse.ok)
      throw new Error("디스코드 릴레이 메시지 전송에 실패했습니다.");

    return res.json({
      success: true,
      message: "원격 제어 서버 신호 전송 완료",
    });
  } catch (error: any) {
    console.error("❌ 원격 컵 배출 릴레이 에러:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 디스코드 원격 중계 물(정수/온수) 추출 API
router.post("/api/remote/dispense-water", async (req, res) => {
  const { type, storeCode } = req.body; // type: '정수' | '온수'
  if (!storeCode || !type) {
    return res
      .status(400)
      .json({ success: false, message: "type과 storeCode가 누락되었습니다." });
  }

  try {
    const token = await getPrimaryDiscordToken();

    // 1. 봇이 소속된 첫 번째 길드(서버) 조회
    const guildsResponse = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    if (!guildsResponse.ok)
      throw new Error("디스코드 서버 목록 조회에 실패했습니다.");
    const guilds: any = await guildsResponse.json();
    const targetGuildId = guilds[0].id;

    // 2. 해당 서버의 채널 목록 조회
    const channelsResponse = await fetch(
      `https://discord.com/api/v10/guilds/${targetGuildId}/channels`,
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    const channels: any = await channelsResponse.json();
    const textChannel = channels.find((c: any) => c.type === 0);

    // 3. 해당 채널에 JSON 터널 패킷 포스팅 [HASTE 임시 제어 우회 수정 지점]
    const waterType = type === "온수" ? "hot" : "purified";
    const packetContent = JSON.stringify({
      route: "/v3/parts/water/dispense",
      targetStore: storeCode,
      body: { waterType, amount: 100 },
    });

    const postResponse = await fetch(
      `https://discord.com/api/v10/channels/${textChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: packetContent }),
      },
    );

    if (!postResponse.ok)
      throw new Error("디스코드 릴레이 메시지 전송에 실패했습니다.");

    return res.json({
      success: true,
      message: "원격 제어 서버 신호 전송 완료",
    });
  } catch (error: any) {
    console.error("❌ 원격 물 배출 릴레이 에러:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 디스코드 원격 중계 시럽 추출 API
router.post("/api/remote/dispense-syrup", async (req, res) => {
  const { syrupName, amount, storeCode } = req.body;
  if (!storeCode || !syrupName) {
    return res.status(400).json({
      success: false,
      message: "syrupName과 storeCode가 누락되었습니다.",
    });
  }

  try {
    const token = await getPrimaryDiscordToken();

    // 1. 봇이 소속된 첫 번째 길드 조회
    const guildsResponse = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    if (!guildsResponse.ok)
      throw new Error("디스코드 서버 목록 조회에 실패했습니다.");
    const guilds: any = await guildsResponse.json();
    const targetGuildId = guilds[0].id;

    // 2. 해당 서버의 채널 목록 조회
    const channelsResponse = await fetch(
      `https://discord.com/api/v10/guilds/${targetGuildId}/channels`,
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    const channels: any = await channelsResponse.json();
    const textChannel = channels.find((c: any) => c.type === 0);

    // 3. 해당 채널에 JSON 터널 패킷 포스팅 [HASTE 임시 제어 우회 수정 지점]
    const packetContent = JSON.stringify({
      route: "/v3/parts/syrup/dispense",
      targetStore: storeCode,
      body: { syrupName, amount: Number(amount) || 10 },
    });

    const postResponse = await fetch(
      `https://discord.com/api/v10/channels/${textChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: packetContent }),
      },
    );

    if (!postResponse.ok)
      throw new Error("디스코드 릴레이 메시지 전송에 실패했습니다.");

    return res.json({
      success: true,
      message: "원격 시럽 제어 서버 신호 전송 완료",
    });
  } catch (error: any) {
    console.error("❌ 원격 시럽 배출 릴레이 에러:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 디스코드 원격 중계 레시피 동기화 API
router.post("/api/remote/recipe/sync", async (req, res) => {
  const { recipeData, storeCode } = req.body;
  if (!storeCode || !recipeData) {
    return res.status(400).json({
      success: false,
      message: "recipeData와 storeCode가 누락되었습니다.",
    });
  }

  try {
    const token = await getPrimaryDiscordToken();

    // 1. 봇이 소속된 첫 번째 길드(서버) 조회
    const guildsResponse = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    if (!guildsResponse.ok)
      throw new Error("디스코드 서버 목록 조회에 실패했습니다.");
    const guilds: any = await guildsResponse.json();
    const targetGuildId = guilds[0].id;

    // 2. 해당 서버의 채널 목록 조회
    const channelsResponse = await fetch(
      `https://discord.com/api/v10/guilds/${targetGuildId}/channels`,
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    const channels: any = await channelsResponse.json();
    const textChannel = channels.find((c: any) => c.type === 0);

    // 3. 해당 채널에 JSON 터널 패킷 포스팅 [HASTE 임시 제어 우회 수정 지점]
    const packetContent = JSON.stringify({
      route: "/v3/settings/sync",
      targetStore: storeCode,
      body: recipeData,
    });

    const postResponse = await fetch(
      `https://discord.com/api/v10/channels/${textChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: packetContent }),
      },
    );

    if (!postResponse.ok)
      throw new Error("디스코드 레시피 릴레이 메시지 전송에 실패했습니다.");

    return res.json({
      success: true,
      message: "원격 레시피 동기화 신호 전송 완료",
    });
  } catch (error: any) {
    console.error("❌ 원격 레시피 동기화 릴레이 에러:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 디스코드 원격 중계 판매 상태 토글 API (v3)
router.post("/api/remote/v3/sales/toggle", async (req, res) => {
  const { isSelling, storeCode } = req.body;
  if (!storeCode || isSelling === undefined) {
    return res.status(400).json({
      success: false,
      message: "isSelling과 storeCode가 누락되었습니다.",
    });
  }

  const storeCodeClean = storeCode.trim();
  const activeApiKey =
    storeCodeClean === "HASTE-HQS-ADMIN" ? "store075575" : storeCodeClean;
  const originUrl = `${req.protocol}://${req.get("host")}`;

  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  if (isLocalTestEnv) {
    // [Case A] 로컬 개발 환경: 로컬 제어 코어(127.0.0.1:8080)로 즉시 100% 직송 (CORS 및 로컬 피드백 최적화)
    try {
      const response = await fetch("http://127.0.0.1:8080/v3/sales/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeApiKey}`,
        },
        body: JSON.stringify({ isSelling }),
      });
      if (response.ok) {
        return res.json({
          success: true,
          message: `[Local Direct] HASTE 로컬 제어 코어로 영업 상태 제어가 즉시 반영되었습니다.`,
        });
      }
    } catch (err) {
      console.log("[Local Sales Toggle Direct Proxy Failed]", err);
    }
    return res.status(500).json({
      success: false,
      message: "HASTE 로컬 제어 코어 통신에 실패했습니다.",
    });
  } else {
    // [Case B] 실서버 운영 환경: 디스코드 1 (Primary) ➔ 디스코드 2 (Secondary) 순서로 릴레이 노킹 (중계 루트)
    let relaySuccess = await postDiscordPacket(
      storeCodeClean,
      "/v3/sales/toggle",
      { isSelling },
      originUrl,
    );
    if (relaySuccess) {
      return res.json({
        success: true,
        message: `영업 상태 ${isSelling ? "판매 가능" : "판매 중지"} 제어 신호가 HASTE HQ 보안 전산 중계 터널로 송출되었습니다.`,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "본사 원격 중계 채널(1, 2차) 전송에 모두 실패했습니다.",
      });
    }
  }
});

// 디스코드 원격 중계 로컬 DID 기동 API (v3)
router.post("/api/remote/v3/did/open/local", async (req, res) => {
  const { storeCode } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 누락되었습니다." });
  }

  const storeCodeClean = storeCode.trim();
  const activeApiKey = storeCodeClean;
  const originUrl = `${req.protocol}://${req.get("host")}`;
  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  if (isLocalTestEnv) {
    // [Case A] 로컬 개발 환경: 릴리 로컬 제어 코어(127.0.0.1:8080)로 즉시 100% 직송 (디스코드 터널 건너뜀)
    try {
      const response = await fetch("http://127.0.0.1:8080/v3/did/open/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeApiKey}`,
        },
      });
      if (response.ok) {
        storeDidModeMap.set(storeCodeClean, 'local');
        return res.json({
          success: true,
          message: "LOCAL DID START SUCCESS",
        });
      }
    } catch (err: any) {
      console.log("[Local DID Open Direct Failed]", err.message);
    }
    return res.status(500).json({
      success: false,
      message: "LOCAL DID START FAILED",
    });
  } else {
    // [Case B] 실서버 운영 환경: 디스코드 1 (Primary) ➔ 디스코드 2 (Secondary) 순서로 릴레이 노킹 (중계 루트)
    let relaySuccess = await postDiscordPacket(
      storeCodeClean,
      "/v3/did/open/local",
      {},
      originUrl,
    );
    if (relaySuccess) {
      storeDidModeMap.set(storeCodeClean, 'local');
      return res.json({
        success: true,
        message:
          "로컬 DID 기동 제어 신호가 HASTE HQ 보안 전산 중계 터널로 송출되었습니다.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "본사 원격 중계 채널(1, 2차) 전송에 모두 실패했습니다.",
      });
    }
  }
});

// 디스코드 원격 중계 원격 DID 기동 API (v3)
router.post("/api/remote/v3/did/open/remote", async (req, res) => {
  const { storeCode, endpoint, payload } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 누락되었습니다." });
  }

  const storeCodeClean = storeCode.trim();
  const activeApiKey = storeCodeClean;
  const originUrl = `${req.protocol}://${req.get("host")}`;
  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  const targetEndpoint = endpoint || "/v3/did/open/remote";
  const targetPayload = payload || {};

  if (isLocalTestEnv) {
    // [Case A] 로컬 개발 환경: 릴리 로컬 제어 코어(127.0.0.1:8080)로 즉시 100% 직송 (디스코드 터널 건너뜀)
    try {
      const response = await fetch(`http://127.0.0.1:8080${targetEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeApiKey}`,
        },
        body:
          Object.keys(targetPayload).length > 0
            ? JSON.stringify(targetPayload)
            : undefined,
      });
      if (response.ok) {
        if (targetEndpoint === "/v3/did/open/remote") {
          storeDidModeMap.set(storeCodeClean, 'remote');
        }
        return res.json({
          success: true,
          message: "REMOTE DID START SUCCESS",
        });
      }
    } catch (err: any) {
      console.log("[Remote DID Open Direct Failed]", err.message);
    }
    return res.status(500).json({
      success: false,
      message: "REMOTE DID START FAILED",
    });
  } else {
    // [Case B] 실서버 운영 환경: 디스코드 1 (Primary) ➔ 디스코드 2 (Secondary) 순서로 릴레이 노킹 (중계 루트)
    let relaySuccess = await postDiscordPacket(
      storeCodeClean,
      targetEndpoint,
      targetPayload,
      originUrl,
    );
    if (relaySuccess) {
      if (targetEndpoint === "/v3/did/open/remote") {
        storeDidModeMap.set(storeCodeClean, 'remote');
      }
      return res.json({
        success: true,
        message: `제어 신호(${targetEndpoint})가 HASTE HQ 보안 전산 중계 터널로 송출되었습니다.`,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "본사 원격 중계 채널(1, 2차) 전송에 모두 실패했습니다.",
      });
    }
  }
});

// 디스코드 원격 중계 메뉴 전체 동기화 API (v3)
router.post("/api/remote/v3/menu/sync", async (req, res) => {
  const { storeCode, menus } = req.body;
  if (!storeCode || !menus || !Array.isArray(menus)) {
    return res.status(400).json({
      success: false,
      message: "storeCode 또는 menus 배열이 누락되었습니다.",
    });
  }

  const storeCodeClean = storeCode.trim();
  const activeApiKey =
    storeCodeClean === "HASTE-HQS-ADMIN" ? "store075575" : storeCodeClean;
  const originUrl = `${req.protocol}://${req.get("host")}`;

  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  // 1. 본사 데이터베이스 web_menu_items 테이블 동기화 (영속화)
  try {
    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      for (const m of menus) {
        const idVal = m.productNo;
        const nameVal = m.name || "";
        const nameKrVal = m.name || "";
        const catVal = m.category || "AMERICANO";
        const visibleVal =
          m.isPurchasable === true || Number(m.isPurchasable) === 1;
        const priceVal = m.price || 0;
        const stepsVal = m.steps ? JSON.stringify(m.steps) : "{}";

        await dbPool.query(
          `
          INSERT INTO web_menu_items (id, name, name_kr, category, visible, price, steps)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            name_kr = EXCLUDED.name_kr,
            category = EXCLUDED.category,
            visible = EXCLUDED.visible,
            price = EXCLUDED.price,
            steps = EXCLUDED.steps
        `,
          [idVal, nameVal, nameKrVal, catVal, visibleVal, priceVal, stepsVal],
        );
      }

      const currentIds = menus.map((m) => m.productNo);
      if (currentIds.length > 0) {
        await dbPool.query(
          `DELETE FROM web_menu_items WHERE id NOT IN (${currentIds.map(() => "?").join(", ")})`,
          currentIds,
        );
      }
    }
  } catch (dbErr: any) {
    console.error("❌ [Database Menu Sync Failed]", dbErr.message);
  }

  // 2. 릴리 단말기 기기 릴레이 전송
  if (isLocalTestEnv) {
    // [Case A] 로컬 개발 환경: 로컬 제어 코어(127.0.0.1:8080)로 즉시 100% 직송 (CORS 및 로컬 피드백 최적화)
    try {
      const response = await fetch("http://127.0.0.1:8080/v3/menu/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeApiKey}`,
        },
        body: JSON.stringify({ storeCode: storeCodeClean, menus }),
      });
      if (response.ok) {
        return res.json({
          success: true,
          message:
            "[Local Direct] HASTE 로컬 제어 코어로 메뉴 데이터 동기화가 즉시 반영되었습니다.",
        });
      }
    } catch (err) {
      console.log("[Local Menu Sync Direct Proxy Failed]", err);
    }
    return res.status(500).json({
      success: false,
      message: "HASTE 로컬 제어 코어 통신에 실패했습니다.",
    });
  } else {
    // [Case B] 실서버 운영 환경: 디스코드 1 (Primary) ➔ 디스코드 2 (Secondary) 순서로 릴레이 노킹 (중계 루트)
    let relaySuccess = await postDiscordPacket(
      storeCodeClean,
      "/v3/menu/sync",
      { storeCode: storeCodeClean, menus },
      originUrl,
    );
    if (relaySuccess) {
      return res.json({
        success: true,
        message:
          "메뉴 데이터 동기화 신호가 HASTE HQ 보안 전산 중계 터널로 송출되었습니다.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "본사 원격 중계 채널(1, 2차) 전송에 모두 실패했습니다.",
      });
    }
  }
});

// 디스코드 원격 중계 메뉴/레시피 조회 API (v3)
router.get("/api/remote/v3/menu", async (req, res) => {
  const storeCode = req.query.storeCode as string;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  const storeCodeClean = storeCode.trim();
  const activeApiKey =
    storeCodeClean === "HASTE-HQS-ADMIN" ? "store075575" : storeCodeClean;
  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  if (isLocalTestEnv) {
    // [Case A] 로컬 개발 환경: 릴리 로컬 제어 코어(127.0.0.1:8080)에서 직접 100% 실시간 긁기 (SOT)
    try {
      console.log(
        `[Local Menu Direct Pull] Requesting Hono API... Target: http://127.0.0.1:8080/v3/menu, Token: Bearer ${activeApiKey}`,
      );
      const response = await fetch("http://127.0.0.1:8080/v3/menu", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${activeApiKey}`,
        },
      });
      if (response.ok) {
        const json = await response.json();
        console.log(
          `[Local Menu Direct Pull Success] Items fetched count: ${json.result?.length || 0}`,
        );
        return res.json({ success: true, result: json.result || [] });
      } else {
        const errText = await response.text();
        console.warn(
          `❌ [Local Menu Pull Rejected by Hono] Status: ${response.status}, Body: ${errText}`,
        );
        return res.status(500).json({
          success: false,
          message: `릴리 Hono 서버가 요청을 거부했습니다. (HTTP: ${response.status}, 응답: ${errText})`,
        });
      }
    } catch (err: any) {
      console.error(
        "❌ [Local Menu Direct Pull Failed Exception]",
        err.message,
        err.stack,
      );
      return res.status(500).json({
        success: false,
        message: `릴리 Hono 서버와의 로컬 네트워크 연결 실패: ${err.message} (포트 8080 연결 거부 혹은 IP 바인딩 상태 확인 필요)`,
      });
    }
  } else {
    // [Case B] 실서버 운영 환경: 본사 DB의 web_menu_items 테이블에서 조회 (HQ DB 캐싱 활용)
    try {
      const dbPool = await getDbPool();
      const [items]: any = await dbPool.query(
        "SELECT * FROM web_menu_items ORDER BY order_index ASC, id ASC",
      );
      const mapped = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        nameKr: item.name_kr,
        category: item.category,
        imageUrl: item.image_url,
        description: item.description,
        acidity: item.acidity,
        sweetness: item.sweetness,
        body: item.body,
        bitterness: item.bitterness,
        visible: item.visible === true || Number(item.visible) === 1,
        isSignature:
          item.is_signature === true || Number(item.is_signature) === 1,
        videoUrl: item.video_url,
        price: item.price || 0,
        steps: item.steps
          ? typeof item.steps === "string"
            ? JSON.parse(item.steps)
            : item.steps
          : {},
      }));
      return res.json({ success: true, result: mapped });
    } catch (err: any) {
      console.error("[Production Menu Read Failed]", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
});

// 실시간 기기 로그 보관 메모리 버퍼

const deviceLogsBuffer = new Map<string, string[]>();

// 봇 또는 대시보드가 실시간 장비 로그를 백엔드 서버에 적재하는 API
router.post("/api/remote/log", (req, res) => {
  const { storeCode, log } = req.body;
  if (!storeCode || !log) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode와 log가 누락되었습니다." });
  }

  if (!deviceLogsBuffer.has(storeCode)) {
    deviceLogsBuffer.set(storeCode, []);
  }
  const buffer = deviceLogsBuffer.get(storeCode)!;

  // 최대 100개까지만 보관
  if (buffer.length >= 100) {
    buffer.pop();
  }

  // 로그 포맷팅 바인딩
  let formattedLog = log;
  if (log.startsWith("[")) {
    formattedLog = log;
  } else {
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour12: true });
    formattedLog = `[${timeStr}] ${log}`;
  }

  buffer.unshift(formattedLog);

  // 매장별 긴급 장애 알림 수신 이메일 저장 맵
  const recipientEmail =
    deviceAlertEmailMap.get(storeCode) || "owner@cafehaste.com";

  // 오류/경고 등급 로그 유입 시 점주에게 긴급 이메일 알림 시뮬레이션 발송 (마스터 지침 반영!)
  if (
    log.includes("🚨") ||
    log.includes("⚠️") ||
    log.includes("오류") ||
    log.includes("경고") ||
    log.includes("장애")
  ) {
    console.log(`==================================================`);
    console.log(`📬 [이메일 긴급 경보 발송]`);
    console.log(`수신지점: 매장 (${storeCode})`);
    console.log(`수신자: ${recipientEmail} (지정된 경보 메일 수신처)`);
    console.log(`제목: [HASTE 플랫폼] 지점 장비 긴급 고장/장애 감지 경보`);
    console.log(`경보 내용: ${formattedLog}`);
    console.log(`==================================================`);
  }

  return res.json({ success: true });
});

// 매장별 알림 수신 이메일 설정 동기화 API
const deviceAlertEmailMap = new Map<string, string>();
router.post("/api/remote/email/settings", async (req, res) => {
  const { storeCode, email } = req.body;
  if (!storeCode || !email) {
    return res
      .status(400)
      .json({ success: false, message: "파라미터가 누락되었습니다." });
  }

  deviceAlertEmailMap.set(storeCode, email);
  return res.json({ success: true });
});

// 대시보드가 로컬 릴리 단말의 실시간 연결 비트 상태를 실시간 직접 조회(온디맨드 프록시)하는 API
router.get("/api/remote/status", async (req, res) => {
  const storeCode = req.query.storeCode as string;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }
  const storeCodeClean = storeCode.trim();

  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  // 1. 로컬 개발 환경인 경우: 릴리 로컬 API 127.0.0.1:8080 을 직접 프록시 조회
  if (isLocalTestEnv) {
    try {
      const activeApiKey = storeCodeClean;
      const lillyUrl = "http://127.0.0.1:8080/v3/status";
      
      // [HASTE 임시 제어 우회 수정 지점] 릴리 기기 API 송수신 상세 관제 패킷 정보 로그 인쇄
      console.log(`\n---------------------------------------------------------`);
      console.log(`🔍 [릴리 API 조회 송신] ➔ GET ${lillyUrl}`);
      console.log(`🔑 인증 토큰: Bearer ${activeApiKey}`);
      console.log(`---------------------------------------------------------`);

      const response = await fetch(lillyUrl, {
        headers: {
          Authorization: `Bearer ${activeApiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`🟢 [릴리 API 조회 수신] ➔ HTTP ${response.status}`);
        console.log(`📦 응답 바디:`, JSON.stringify(data));
        console.log(`---------------------------------------------------------\n`);

        if (data.success && data.status) {
          const s = data.status;
          
          const didL = s.did === true || s.didConnected === true;
          
          // [HASTE 임시 제어 우회 수정 지점] 홈페이지 캐시가 비어있는 최초 로드 시점에만 릴리 기기의 물리 가동 상태를 읽어와 설정을 자동 초기화
          if (!storeDidModeMap.has(storeCodeClean)) {
            const initialMode = didL ? 'local' : 'remote';
            storeDidModeMap.set(storeCodeClean, initialMode);
            console.log(`🔑 [최초 역동기화] 매장: ${storeCodeClean} ➔ 릴리 기기 상태로부터 최초 모드 설정 상속 초기화: ${initialMode}`);
          }

          const updatedTargetMode = storeDidModeMap.get(storeCodeClean) || (s.did ? 'local' : s.remoteDid ? 'remote' : 'local');
          
          // [HASTE 임시 제어 우회 수정 지점] 홈페이지 관점과 릴리 기기 관점의 1:1 대칭 명칭 통일 ('설정 상태', 'DID 상태')
          const isApiConnected = !!(s.api ?? s.local_api_connected);
          const isWsConnected = !!(s.ws ?? s.ws_connected);

          const apiState = isApiConnected ? "🟢 ALIVE" : "🔴 DEAD";
          const orderState = isWsConnected ? "🟢 CONNECTED" : "🔴 DISCONNECTED";

          // 1. 홈페이지 기준 상태값 정의
          const hqTargetMode = updatedTargetMode.toUpperCase(); // 'LOCAL' | 'REMOTE'
          const hqDidState = updatedTargetMode === 'local' 
            ? "🟢 LOCAL" 
            : updatedTargetMode === 'remote' 
              ? "🔵 REMOTE" 
              : "⚪ CLOSED";

          // 2. 릴리프로그램 기준 상태값 정의
          const lillyDeviceMode = String(s.didMode || "local").toUpperCase(); // 'LOCAL' | 'REMOTE'
          const lillyDidState = s.did 
            ? "🟢 LOCAL" 
            : s.remoteDid 
              ? "🔵 REMOTE" 
              : "⚪ CLOSED";

          // 3. 실시간 조회 타임스탬프 생성 (YYYY.MM.DD HH:mm:ss)
          const now = new Date();
          const pad = (n: number) => String(n).padStart(2, "0");
          const formattedTime = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

          console.log(`\n┌────────────────────── HASTE 런타임 상태 ──────────────────────┐`);
          console.log(`  매장 고유 ID     : ${storeCodeClean}`);
          console.log(`  ─────────────────────────── [홈페이지] ───────────────────────────`);
          console.log(`  설정 상태        : ${hqTargetMode}`);
          console.log(`  API 포트         : ${apiState}`);
          console.log(`  주문 수신        : ${orderState}`);
          console.log(`  DID 상태         : ${hqDidState}`);
          console.log(`  조회 시간        : ${formattedTime}`);
          console.log(`  ──────────────────────── [릴리프로그램] ───────────────────────────`);
          console.log(`  설정 상태        : ${lillyDeviceMode}`);
          console.log(`  API 포트         : ${apiState}`);
          console.log(`  주문 수신        : ${orderState}`);
          console.log(`  DID 상태         : ${lillyDidState}`);
          console.log(`  조회 시간        : ${formattedTime}`);
          console.log(`└──────────────────────────────────────────────────────────────────┘\n`);

          return res.json({
            success: true,
            status: {
              ws_connected: s.ws ? 1 : 0,
              serialport_connected: s.serialport ? 1 : 0,
              local_api_connected: s.api ? 1 : 0,
              thirdparty_connected: s.thirdparty ? 1 : 0,
              did_connected: s.did ? 1 : 0,
              remote_did_connected: s.remoteDid ? 1 : 0,
              didMode: s.did ? 'local' : s.remoteDid ? 'remote' : updatedTargetMode,
              target_did_mode: updatedTargetMode
            },
          });
        }
      }
      throw new Error(`릴리 API 서버 응답 실패 (HTTP: ${response.status})`);
    } catch (err: any) {
      const targetMode = storeDidModeMap.get(storeCodeClean) || 'local';
      // 최고관리자('HASTE-HQS-ADMIN') 권한 특별 혜택: 릴리가 꺼져있거나 통신 에러가 나더라도 무조건 정상(1)으로 의사 점등 처리 (관제 및 테스트 프리패스)
      if (storeCodeClean === "HASTE-HQS-ADMIN") {
        return res.json({
          success: true,
          status: {
            ws: 1,
            serialport: 1,
            api: 1,
            thirdparty: 1,
            did: targetMode === 'local' ? 1 : 0,
            remoteDid: targetMode === 'remote' ? 1 : 0,
            ws_connected: 1,
            serialport_connected: 1,
            local_api_connected: 1,
            thirdparty_connected: 1,
            did_connected: targetMode === 'local' ? 1 : 0,
            remote_did_connected: targetMode === 'remote' ? 1 : 0,
            didMode: targetMode,
            target_did_mode: targetMode
          },
        });
      }

      // 일반 매장은 연결 실패 시 전부 0 리턴
      return res.json({
        success: true,
        status: {
          ws: 0,
          serialport: 0,
          api: 0,
          thirdparty: 0,
          did: targetMode === 'local' ? 1 : 0,
          remoteDid: targetMode === 'remote' ? 1 : 0,
          ws_connected: 0,
          serialport_connected: 0,
          local_api_connected: 0,
          thirdparty_connected: 0,
          did_connected: targetMode === 'local' ? 1 : 0,
          remote_did_connected: targetMode === 'remote' ? 1 : 0,
          didMode: targetMode,
          target_did_mode: targetMode
        },
      });
    }
  }

  // 2. 실서버(Cloud Run) 배포 환경인 경우: DB store_connections 테이블의 최근 핑백 데이터 조회
  try {
    const dbPool = await getDbPool();
    const targetMode = storeDidModeMap.get(storeCodeClean) || 'local';
    
    if (dbPool.isFallback) {
      return res.json({
        success: true,
        status: {
          ws: 1,
          serialport: 1,
          api: 1,
          thirdparty: 1,
          did: targetMode === 'local' ? 1 : 0,
          remoteDid: targetMode === 'remote' ? 1 : 0,
          ws_connected: 1,
          serialport_connected: 1,
          local_api_connected: 1,
          thirdparty_connected: 1,
          did_connected: targetMode === 'local' ? 1 : 0,
          remote_did_connected: targetMode === 'remote' ? 1 : 0,
          didMode: targetMode,
          target_did_mode: targetMode
        },
      });
    }
    const [rows]: any = await dbPool.query(
      "SELECT ws_connected, serialport_connected, local_api_connected, thirdparty_connected FROM store_connections WHERE store_id = ? LIMIT 1",
      [storeCodeClean],
    );
    if (rows && rows.length > 0) {
      const r = rows[0];
      const wsVal =
        r.ws_connected === true || Number(r.ws_connected) === 1 ? 1 : 0;
      const serialVal =
        r.serialport_connected === true || Number(r.serialport_connected) === 1
          ? 1
          : 0;
      const apiVal =
        r.local_api_connected === true || Number(r.local_api_connected) === 1
          ? 1
          : 0;
      const machineVal =
        r.thirdparty_connected === true || Number(r.thirdparty_connected) === 1
          ? 1
          : 0;

      return res.json({
        success: true,
        status: {
          ws: wsVal,
          serialport: serialVal,
          api: apiVal,
          thirdparty: machineVal,
          did: targetMode === 'local' ? 1 : 0,
          remoteDid: targetMode === 'remote' ? 1 : 0,
          ws_connected: wsVal,
          serialport_connected: serialVal,
          local_api_connected: apiVal,
          thirdparty_connected: machineVal,
          did_connected: targetMode === 'local' ? 1 : 0,
          remote_did_connected: targetMode === 'remote' ? 1 : 0,
          didMode: targetMode,
          target_did_mode: targetMode
        },
      });
    }
    return res.json({
      success: true,
      status: {
        ws: 0,
        serialport: 0,
        api: 0,
        thirdparty: 0,
        did: targetMode === 'local' ? 1 : 0,
        remoteDid: targetMode === 'remote' ? 1 : 0,
        ws_connected: 0,
        serialport_connected: 0,
        local_api_connected: 0,
        thirdparty_connected: 0,
        did_connected: targetMode === 'local' ? 1 : 0,
        remote_did_connected: targetMode === 'remote' ? 1 : 0,
        didMode: targetMode,
        target_did_mode: targetMode
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// [HASTE 임시 제어 우회 수정 지점] 중계 봇 핑백 수신 - 기기 실시간 연결 상태 DB 업데이트 API
router.post("/api/remote/status/update", async (req, res) => {
  const { storeCode, status } = req.body;
  if (!storeCode || !status) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode와 status가 필요합니다." });
  }

  const storeCodeClean = storeCode.trim();
  const ws = status.orderSystemConnected === true;
  const serial = status.serialConnected === true;
  const localApi = status.isOpen !== undefined; // status.isOpen이 undefined가 아니면 로컬 API 정상 통신 완료
  const machine = status.machineConnected === true;
  const didLocal = status.didConnected === true;

  // 기기가 핑백한 물리 기동 상태를 홈페이지 설정 가동 모드에 양방향 역동기화 적용 (단, 점주 제어 명령 후 10초간은 덮어쓰기 유예)
  const currentMode = didLocal ? 'local' : 'remote';
  
  const lastControlTime = storeDidLastControlTimeMap.get(storeCodeClean) || 0;
  const isCooltimeActive = Date.now() - lastControlTime < 10000;

  // 기기가 읽어가서 동기화할 최종 가동 모드 로드
  const targetMode = storeDidModeMap.get(storeCodeClean) || 'local';
  console.log(`\n📢 [HASTE 핑백 수신] 매장: ${storeCodeClean} ➔ didConnected: ${status.didConnected} ➔ 기기 하달 가동 지침 모드: ${targetMode}`);

  try {
    const dbPool = await getDbPool();
    if (dbPool.isFallback) {
      return res.json({ 
        success: true, 
        message: "Fallback 모드로 수신 스킵",
        didMode: targetMode,
        target_did_mode: targetMode
      });
    }

    // 1. 등록 여부 조회
    const [rows]: any = await dbPool.query(
      "SELECT store_id FROM store_connections WHERE store_id = ? LIMIT 1",
      [storeCodeClean],
    );

    if (rows && rows.length > 0) {
      // 2. 존재하면 UPDATE (did_connected, remote_did_connected는 인메모리 맵에서만 관리하므로 DB 컬럼에서 배제)
      await dbPool.query(
        "UPDATE store_connections SET ws_connected = ?, serialport_connected = ?, local_api_connected = ?, thirdparty_connected = ?, updated_at = NOW() WHERE store_id = ?",
        [ws, serial, localApi, machine, storeCodeClean],
      );
    } else {
      // 3. 없으면 INSERT (did_connected, remote_did_connected는 인메모리 맵에서만 관리하므로 DB 컬럼에서 배제)
      await dbPool.query(
        "INSERT INTO store_connections (store_id, ws_connected, serialport_connected, local_api_connected, thirdparty_connected, updated_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [storeCodeClean, ws, serial, localApi, machine],
      );
    }

    return res.json({ 
      success: true,
      didMode: targetMode,
      target_did_mode: targetMode
    });
  } catch (err: any) {
    console.error(
      "❌ [Status Update Error] Failed to update connection status:",
      err.message,
    );
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 대시보드가 기기 실시간 로그 목록을 긁어가는 API (Lilly 로컬 v3/logs 연동 프록시화 및 fallback 제공)
router.get("/api/remote/logs", async (req, res) => {
  const storeCode = req.query.storeCode as string;
  const name = (req.query.name as string) || "total";
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  // 1. 먼저 로컬 기기 v3/logs 프록시 시도
  try {
    const lillyUrl = `http://localhost:8080/v3/logs?name=${name}`;
    const response = await fetch(lillyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storeCode}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.logs)) {
        return res.json({ success: true, logs: data.logs });
      }
    }
  } catch (err: any) {
    // 로컬 Hono 미기동 시 조용히 Fallback 버퍼로 이행
  }

  // 2. 실패 또는 로컬 연결 안 됨 시 기존 인메모리 버퍼 fallback
  const logs = deviceLogsBuffer.get(storeCode) || [];
  return res.json({ success: true, logs });
});

// 실시간 기기 로그 메모리 버퍼 초기화 API
router.post("/api/remote/logs/clear", async (req, res) => {
  const { storeCode } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  deviceLogsBuffer.set(storeCode, []);
  return res.json({ success: true });
});

// 대시보드가 로컬 릴리 API v2/inventory 로부터 진짜 재고 데이터를 긁어가는 프록시 API (CORS 방지용)
router.get("/api/remote/inventory", async (req, res) => {
  const storeCode = req.query.storeCode as string;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  try {
    const lillyUrl = "http://localhost:8080/v3/inventory";
    const response = await fetch(lillyUrl, {
      headers: {
        Authorization: `Bearer ${storeCode}`,
      },
    });
    if (!response.ok) {
      throw new Error(`릴리 API 서버 응답 실패 (HTTP: ${response.status})`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error(
      "❌ [Inventory Proxy Error] Failed to fetch from Lilly:",
      err.message,
    );
    return res.status(502).json({
      success: false,
      message: `릴리 프로그램 미기동 또는 통신 오류: ${err.message}`,
    });
  }
});

// 디스코드 패킷 전송 공통 릴레이 헬퍼 [HASTE 임시 제어 우회 수정 지점]
async function postDiscordPacket(
  storeCode: string,
  route: string,
  body: any,
  originUrl: string,
): Promise<boolean> {
  // 1차 주(Primary) 디스코드 터널 송신 시도
  let success = await sendPacketWithToken(
    await getPrimaryDiscordToken(),
    storeCode,
    route,
    body,
    originUrl,
  );

  // 1차 실패 시, 2차 예비(Secondary) 디스코드 터널 자동 failover 송신 시도 (디스코드2 터널 기동)
  if (!success) {
    console.warn(
      `⚠️ [Discord Primary Tunnel Failed] Attempting failover to Secondary Channel...`,
    );
    success = await sendPacketWithToken(
      await getSecondaryDiscordToken(),
      storeCode,
      route,
      body,
      originUrl,
    );
  }

  return success;
}

// 실제 토큰을 활용해 디스코드 채널로 패킷을 쏘는 공통 서브 헬퍼 함수
async function sendPacketWithToken(
  token: string,
  storeCode: string,
  route: string,
  body: any,
  originUrl: string,
): Promise<boolean> {
  try {
    const guildsResponse = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    if (!guildsResponse.ok) return false;
    const guilds: any = await guildsResponse.json();
    if (guilds.length === 0) return false;
    const targetGuildId = guilds[0].id;

    const channelsResponse = await fetch(
      `https://discord.com/api/v10/guilds/${targetGuildId}/channels`,
      {
        headers: { Authorization: `Bot ${token}` },
      },
    );
    const channels: any = await channelsResponse.json();
    const textChannel = channels.find((c: any) => c.type === 0);
    if (!textChannel) return false;

    // [HASTE 임시 제어 우회 수정 지점]
    // ⚠️ 소송 방지용 독자 서명 시그니처 및 타임스탬프 헤더 동적 생성 주입
    const timestamp = String(Date.now());
    const isSelling =
      body && body.isSelling !== undefined ? body.isSelling : true;
    const salt =
      process.env.HASTE_SECRET_SALT || "HASTE_SECURE_TUNNEL_SALT_2026";
    const rawMsg = `${storeCode}:${isSelling}:${timestamp}:${salt}`;
    const signature = crypto.createHash("sha256").update(rawMsg).digest("hex");

    const activeApiKey =
      storeCode === "HASTE-HQS-ADMIN" ? "store075575" : storeCode;

    const packetContent = JSON.stringify({
      route,
      targetStore: storeCode,
      originUrl,
      token: activeApiKey,
      body,
      headers: {
        "X-Haste-Tunnel-Signature": signature,
        "X-Haste-Timestamp": timestamp,
      },
    });

    const postResponse = await fetch(
      `https://discord.com/api/v10/channels/${textChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: packetContent }),
      },
    );
    return postResponse.ok;
  } catch (err) {
    console.error("❌ [Discord Packet Relay Bot Failed for token]:", err);
    return false;
  }
}

// 대시보드가 로컬 릴리 API v3/inventory/save 로 재고 데이터를 쓰는 프록시 API
router.post("/api/remote/inventory/save", async (req, res) => {
  const { storeCode, stocks } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  // 1. 디스코드 터널 중계 릴리 매장에 전송
  const originUrl = `${req.protocol}://${req.get("host")}`;
  const relaySuccess = await postDiscordPacket(
    storeCode,
    "/v3/inventory/save",
    { stocks },
    originUrl,
  );

  try {
    // 2. 로컬 API 직접 시도 (동일 호스트에 켜져있을 경우 백업용)
    const lillyUrl = "http://localhost:8080/v3/inventory/save";
    const response = await fetch(lillyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storeCode}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stocks }),
    });
    if (!response.ok) {
      throw new Error(`릴리 API 서버 저장 실패 (HTTP: ${response.status})`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.log(
      "ℹ️ [Inventory Save Local Fail - Bypassed to Discord Tunnel]:",
      err.message,
    );
    return res.json({
      success: relaySuccess,
      message: relaySuccess
        ? "오프라인 단말입니다. 디스코드 원격 중계 터널을 통해 명령 패킷을 송신 완료하였습니다."
        : `원격 제어 통신 실패: ${err.message}`,
    });
  }
});

// 대시보드가 로컬 릴리 API v3/settings 로부터 전체 설정을 긁어가는 프록시 API
router.get("/api/remote/settings", async (req, res) => {
  const storeCode = req.query.storeCode as string;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  try {
    const lillyUrl = "http://localhost:8080/v3/settings";
    const response = await fetch(lillyUrl, {
      headers: {
        Authorization: `Bearer ${storeCode}`,
      },
    });
    if (!response.ok) {
      throw new Error(`릴리 API 서버 응답 실패 (HTTP: ${response.status})`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error(
      "❌ [Settings Proxy Error] Failed to fetch settings from Lilly:",
      err.message,
    );
    // 데모용 기본 설정 mock 데이터 리턴
    return res.json({
      success: true,
      result: {
        serialport: {
          port: "COM3",
          baudRate: 9600,
          parity: "none",
          interval: 100,
        },
        parts: { flowSensor: "FS-102", mainBoard: "LILLY-V3", partsCount: 12 },
        coffee: {
          protocol: "WMF-STANDARD",
          machineIp: "192.168.1.100",
          beanSensor: true,
        },
        cup: { dispenseMode: "AUTO", cupSensor: true, delayTime: 500 },
        syrups: { dispenseMode: "PULSE", capacity: 2000, tracking: true },
        water: {
          purifier: true,
          cooler: true,
          carbonator: true,
          iceDispense: true,
        },
        information: {
          storeName: "김포운양역점",
          managerPhone: "010-1234-5678",
          didEnabled: true,
        },
        isDark: true,
        devTools: false,
      },
    });
  }
});

// 대시보드가 로컬 릴리 API v3/settings/save 로 설정을 저장하는 프록시 API
router.post("/api/remote/settings/save", async (req, res) => {
  const { storeCode, settings } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  // 1. 디스코드 터널 중계 릴리 매장에 전송
  const originUrl = `${req.protocol}://${req.get("host")}`;
  const relaySuccess = await postDiscordPacket(
    storeCode,
    "/v3/settings/save",
    { settings },
    originUrl,
  );

  try {
    const lillyUrl = "http://localhost:8080/v3/settings/save";
    const response = await fetch(lillyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storeCode}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    });
    if (!response.ok) {
      throw new Error(`릴리 API 서버 저장 실패 (HTTP: ${response.status})`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.log(
      "ℹ️ [Settings Save Local Fail - Bypassed to Discord Tunnel]:",
      err.message,
    );
    return res.json({
      success: relaySuccess,
      message: relaySuccess
        ? "오프라인 단말입니다. 디스코드 원격 중계 터널을 통해 장비 설정 패킷을 송신 완료하였습니다."
        : `원격 설정 동기화 실패: ${err.message}`,
    });
  }
});

// 디스코드 원격 중계 판매 상태 제어 API (잠금/해제)
router.post("/api/remote/sales/toggle", async (req, res) => {
  const { storeCode, isSelling } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  const originUrl = `${req.protocol}://${req.get("host")}`;
  const relaySuccess = await postDiscordPacket(
    storeCode,
    "/v3/sales/toggle",
    { isSelling },
    originUrl,
  );

  try {
    const lillyUrl = "http://localhost:8080/v3/sales/toggle";
    const response = await fetch(lillyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storeCode}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isSelling }),
    });
    if (!response.ok) {
      throw new Error(
        `릴리 API 서버 판매 제어 실패 (HTTP: ${response.status})`,
      );
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.log(
      "ℹ️ [Sales Toggle Local Fail - Bypassed to Discord Tunnel]:",
      err.message,
    );
    return res.json({
      success: relaySuccess,
      message: relaySuccess
        ? "오프라인 단말입니다. 디스코드 원격 중계 터널을 통해 판매 제어 패킷을 송신 완료하였습니다."
        : `판매 제어 동기화 실패: ${err.message}`,
    });
  }
});

// 디스코드 원격 중계 로컬 DID 실행 API (v3 호환성 매핑 추가)
router.post(["/api/remote/did/open/local", "/api/remote/v3/did/open/local"], async (req, res) => {
  const { storeCode } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  const storeCodeClean = storeCode.trim();
  const activeApiKey =
    storeCodeClean === "HASTE-HQS-ADMIN" ? "store075575" : storeCodeClean;
  const originUrl = `${req.protocol}://${req.get("host")}`;
  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  // 홈페이지 설정 공시소에 매장의 타겟 DID 모드를 'local'로 전환 등록
  storeDidModeMap.set(storeCodeClean, 'local');
  storeDidLastControlTimeMap.set(storeCodeClean, Date.now()); // 제어 타임스탬프 갱신 (역동기화 덮어쓰기 방지)
  console.log(`\n🎛️ [HASTE 제어 전환] 매장: ${storeCodeClean} ➔ 타겟 DID 모드를 'local' (로컬) 로 전환 공시 (10초 쿨타임 락 가동)`);

  if (isLocalTestEnv) {
    // [Case A] 로컬 개발 환경: 로컬 제어 코어(127.0.0.1:8080)로 즉시 100% 직송 (CORS 및 로컬 피드백 최적화)
    try {
      console.log(`\n=========================================================`);
      console.log(`⚡ [로컬 DID 실행 지시 송신] ➔ POST http://127.0.0.1:8080/v3/did/open/local`);
      console.log(`🔑 인증 토큰: Bearer ${activeApiKey}`);
      console.log(`=========================================================`);

      const response = await fetch("http://127.0.0.1:8080/v3/did/open/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeApiKey}`,
        },
      });
      const data: any = await response.json().catch(() => ({}));
      if (response.ok && data.success === true) {
        console.log(`🟢 [로컬 DID 실행 지시 수신] ➔ HTTP ${response.status}`);
        console.log(`📦 응답 바디:`, JSON.stringify(data));
        console.log(`=========================================================\n`);

        return res.json({
          success: true,
          message:
            `[Local Direct] HASTE 로컬 제어 코어로 로컬 DID 기동 지침이 전달되었습니다. (결과: ${data.message || '성공'})`,
        });
      } else {
        console.error(`❌ [Local Direct 실패] 릴리 로컬 API /v3/did/open/local 응답 거부 - HTTP: ${response.status}, success: ${data.success}, 사유: ${data.message || '알 수 없음'}`);
        console.log(`📦 수신 거절 바디:`, JSON.stringify(data));
        console.log(`=========================================================\n`);
      }
    } catch (err: any) {
      console.error(
        "❌ [Local DID Open Legacy Direct Loopback Failed]",
        err.message,
      );
    }
  }

  // [Case B] 실서버 운영 환경 또는 로컬 실패 시: 디스코드 1 (Primary) ➔  디스코드 2 (Secondary) 순서로 릴레이 노킹 (중계 루트)
  const relaySuccess = await postDiscordPacket(
    storeCodeClean,
    "/v3/did/open/local",
    {},
    originUrl,
  );
  if (relaySuccess) {
    return res.json({
      success: true,
      message:
        "로컬 DID 기동 설정 신호가 HASTE HQ 보안 전산 중계 터널로 송출되었습니다. 기기 기동 및 피드백 보고 시 대시보드 불빛이 점등됩니다.",
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "본사 원격 중계 채널(1, 2차) 전송에 모두 실패했습니다.",
    });
  }
});

// 디스코드 원격 중계 원격 DID 실행 API (v3 호환성 매핑 추가)
router.post(["/api/remote/did/open/remote", "/api/remote/v3/did/open/remote"], async (req, res) => {
  const { storeCode, endpoint, payload } = req.body;
  if (!storeCode) {
    return res
      .status(400)
      .json({ success: false, message: "storeCode가 필요합니다." });
  }

  const storeCodeClean = storeCode.trim();
  const activeApiKey =
    storeCodeClean === "HASTE-HQS-ADMIN" ? "store075575" : storeCodeClean;
  const originUrl = `${req.protocol}://${req.get("host")}`;
  const isLocalTestEnv = process.env.NODE_ENV !== "production";

  const targetEndpoint = endpoint || "/v3/did/open/remote";
  const targetPayload = payload || {};

  // 홈페이지 설정 공시소에 매장의 타겟 DID 모드를 'remote'로 전환 등록
  if (targetEndpoint === "/v3/did/open/remote") {
    storeDidModeMap.set(storeCodeClean, 'remote');
    storeDidLastControlTimeMap.set(storeCodeClean, Date.now()); // 제어 타임스탬프 갱신 (역동기화 덮어쓰기 방지)
    console.log(`\n🎛️ [HASTE 제어 전환] 매장: ${storeCodeClean} ➔ 타겟 DID 모드를 'remote' (원격) 로 전환 공시 (10초 쿨타임 락 가동)`);
  }

  if (isLocalTestEnv) {
    // [Case A] 로컬 개발 환경: 로컬 제어 코어(127.0.0.1:8080)로 즉시 100% 직송 (CORS 및 로컬 피드백 최적화)
    try {
      console.log(`\n=========================================================`);
      console.log(`⚡ [원격 DID 실행 지시 송신] ➔ POST http://127.0.0.1:8080${targetEndpoint}`);
      console.log(`🔑 인증 토큰: Bearer ${activeApiKey}`);
      console.log(`📦 전송 바디:`, JSON.stringify(targetPayload));
      console.log(`=========================================================`);

      const response = await fetch(`http://127.0.0.1:8080${targetEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeApiKey}`,
        },
        body:
          Object.keys(targetPayload).length > 0
            ? JSON.stringify(targetPayload)
            : undefined,
      });
      const data: any = await response.json().catch(() => ({}));
      if (response.ok && data.success === true) {
        console.log(`🟢 [원격 DID 실행 지시 수신] ➔ HTTP ${response.status}`);
        console.log(`📦 응답 바디:`, JSON.stringify(data));
        console.log(`=========================================================\n`);

        return res.json({
          success: true,
          message: `[Local Direct] HASTE 로컬 제어 코어로 명령(${targetEndpoint}) 설정이 반영되었습니다. (결과: ${data.message || '성공'})`,
        });
      } else {
        console.error(`❌ [Local Direct 실패] 릴리 로컬 API ${targetEndpoint} 응답 거부 - HTTP: ${response.status}, success: ${data.success}, 사유: ${data.message || '알 수 없음'}`);
        console.log(`📦 수신 거절 바디:`, JSON.stringify(data));
        console.log(`=========================================================\n`);
      }
    } catch (err: any) {
      console.error(
        "❌ [Remote DID Open Legacy Direct Loopback Failed]",
        err.message,
      );
    }
  }

  // [Case B] 실서버 운영 환경 또는 로컬 실패 시: 디스코드 1 (Primary) ➔ 디스코드 2 (Secondary) 순서로 릴레이 노킹 (중계 루트)
  const relaySuccess = await postDiscordPacket(
    storeCodeClean,
    targetEndpoint,
    targetPayload,
    originUrl,
  );
  if (relaySuccess) {
    return res.json({
      success: true,
      message: `제어 신호(${targetEndpoint}) 설정이 HASTE HQ 보안 전산 중계 터널로 송출되었습니다. 기기 피드백 보고 시 대시보드 불빛이 점등됩니다.`,
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "본사 원격 중계 채널(1, 2차) 전송에 모두 실패했습니다.",
    });
  }
});

// Mounted Sub-Routers
router.use(authRouter);
router.use(catalogRouter);
router.use(postsRouter);
router.use(verifyRouter);
router.use(permissionsRouter);
router.use(musicRouter);
router.use(commentsRouter);
router.use(rssRouter);
router.use(storeVersionRouter);
router.use(didCallbackRouter);

export default router;
