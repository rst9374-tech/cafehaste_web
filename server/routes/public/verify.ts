import { Router } from 'express';
import crypto from 'crypto';
import { getDbPool, readBackupLicenses, addVerifyLog, storeVerifyCache } from '../../database';

const router = Router();

const pendingVerifications = new Map<string, Promise<any>>();
const HASTE_SECRET_LIVE_KEY = process.env.HASTE_SECRET_LIVE_KEY || 'HASTE_SECRET_LIVE_9363';

// POS/Hardware Merchant Verification API Endpoint
router.post('/api/v1/store/verify', async (req, res) => {
  const clientApiKey = req.headers['x-haste-api-key'] || req.headers['X-Haste-Api-Key'];
  const clientTimestamp = req.headers['x-haste-timestamp'] || req.headers['X-Haste-Timestamp'];
  const { storeId } = req.body || {};

  console.log(`[License Checkpoint] Kiosk verifying storeId: "${storeId}" from IP: ${req.ip}`);

  // 1) API Master Key Check
  if (!clientApiKey || clientApiKey !== HASTE_SECRET_LIVE_KEY) {
    const errMsg = `비정상적인 API Key 접근 차단: ${clientApiKey}`;
    console.log(`🚨 [경고] ${errMsg}`);
    addVerifyLog('누락', req, false, "INVALID_KEY: 인증되지 않은 접근 시도");
    return res.status(412).json({ 
      isApproved: false, 
      reason: "INVALID_KEY",
      allowOfflineGrace: false,
      offlineLicenseToken: null
    });
  }

  // 2) Anti-Replay Attack Timestamp Validation (5 mins skew limit)
  if (!clientTimestamp) {
    const errMsg = "TIMESTAMP_MISSING";
    addVerifyLog(storeId || '누락', req, false, errMsg);
    return res.status(400).json({ isApproved: false, reason: "MISSING_TIMESTAMP" });
  }
  
  const serverTime = Date.now();
  const requestTime = Number(clientTimestamp);
  const timeDifference = Math.abs(serverTime - requestTime);
  const fiveMinutesInMs = 5 * 60 * 1000;

  if (isNaN(requestTime) || timeDifference > fiveMinutesInMs) {
    const errMsg = `타임스탬프 만료 (오차: ${timeDifference}ms)`;
    console.log(`🚨 [경고] ${errMsg}`);
    addVerifyLog(storeId || '누락', req, false, "TIMESTAMP_EXPIRED");
    return res.status(401).json({ 
      isApproved: false, 
      reason: "TIMESTAMP_EXPIRED",
      allowOfflineGrace: false,
      offlineLicenseToken: null
    });
  }

  if (!storeId) {
    const errMsg = "매장 고유 번호(storeId)가 누락되었습니다.";
    addVerifyLog('누락', req, false, errMsg);
    return res.status(400).json({
      isApproved: false,
      reason: "MISSING_STORE_ID",
      message: errMsg
    });
  }

  const now = Date.now();
  const cachedItem = storeVerifyCache[storeId];
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache duration

  // Serving cached response if requests are too frequent
  if (cachedItem && (now - cachedItem.timestamp < CACHE_TTL)) {
    console.log(`[Rate Limit Guarded] Serving cached response for storeId: "${storeId}" (Cache hit, TTL: 5m)`);
    const isApproved = cachedItem.response.isApproved;
    const msg = isApproved 
      ? `[동시성 중복] 캐시 히트 통과 (${cachedItem.response.storeName || 'N/A'} / ${cachedItem.response.storeGrade || 'PREMIUM'})`
      : `[동시성 중복] 캐시 히트 차단 (${cachedItem.response.reason || 'N/A'}) - ${cachedItem.response.message || ''}`;
    
    addVerifyLog(storeId, req, isApproved, msg);
    return res.status(200).json(cachedItem.response);
  }

  // Coalescence mechanism for multi-concurrent requests
  if (pendingVerifications.has(storeId)) {
    console.log(`[Coalescing Requests] storeId: "${storeId}" is already being queried.`);
    try {
      const coalescedResponse = await pendingVerifications.get(storeId);
      const isApproved = !!coalescedResponse.isApproved;
      const msg = isApproved
        ? `[동시성 병합] 실시간 검증 병합 통과 (${coalescedResponse.storeName || 'N/A'})`
        : `[동시성 병합] 실시간 검증 병합 차단 (${coalescedResponse.reason || 'N/A'})`;
      addVerifyLog(storeId, req, isApproved, msg);
      return res.status(200).json(coalescedResponse);
    } catch (err: any) {
      return res.status(500).json({
        isApproved: false,
        reason: "COALESCE_ERROR",
        message: "인증 처리 진행 중 오류 발생: " + err.message
      });
    }
  }

  // Core verification worker Promise
  const verificationPromise = (async () => {
    try {
      // 🔽 [HASTE 임시 제어 우회 수정 지점] DB로부터 디스코드 중계 설정 1, 2 로드
      let discordTokenPrimary = '';
      let discordTokenSecondary = '';
      try {
        const dbPool = await getDbPool();
        const [settingsRows]: any = await dbPool.query(`
          SELECT setting_key, setting_value 
          FROM web_system_settings 
          WHERE setting_key IN ('discord_bot_token_primary', 'discord_bot_token_secondary')
        `);
        if (settingsRows && settingsRows.length > 0) {
          settingsRows.forEach((r: any) => {
            if (r.setting_key === 'discord_bot_token_primary') discordTokenPrimary = r.setting_value;
            if (r.setting_key === 'discord_bot_token_secondary') discordTokenSecondary = r.setting_value;
          });
        }
      } catch (err) {
        console.warn('[License Checkpoint Warning] Failed to query discord tokens from DB, fallback to env:', err);
        discordTokenPrimary = process.env.DISCORD_BOT_TOKEN || '';
      }

      // [CASE A] 정상 승인 매장 (storex1001 - PREMIUM)
      if (storeId === "storex1001") {
        const sevenDaysLater = Date.now() + (7 * 24 * 60 * 60 * 1000);
        const tokenPayload = JSON.stringify({ storeId, expire: sevenDaysLater });
        const offlineToken = crypto.createHash('sha256').update(tokenPayload).digest('hex');

        const successMsg = "정식 승인 통과 (강남본점 / PREMIUM)";
        addVerifyLog(storeId, req, true, successMsg);

        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = {
          isApproved: true,
          storeGrade: "PREMIUM",
          storeType: "헤이스트멤버십",
          storeName: "강남본점",
          expireDate: "2026-12-31",
          offlineLicenseToken: `Haste_SecureToken_${offlineToken}`,
          discordTokenPrimary,
          discordTokenSecondary
        };

        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };
        return payload;
      }

      // [CASE A-2] 정상 승인 매장 (storex1002 - STANDARD)
      if (storeId === "storex1002") {
        const sevenDaysLater = Date.now() + (7 * 24 * 60 * 60 * 1000);
        const tokenPayload = JSON.stringify({ storeId, expire: sevenDaysLater });
        const offlineToken = crypto.createHash('sha256').update(tokenPayload).digest('hex');

        const successMsg = "정식 승인 통과 (역삼지점 / STANDARD)";
        addVerifyLog(storeId, req, true, successMsg);

        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = {
          isApproved: true,
          storeGrade: "STANDARD",
          storeType: "헤이스트멤버십",
          storeName: "역삼지점",
          expireDate: "2026-08-15",
          offlineLicenseToken: `Haste_SecureToken_${offlineToken}`,
          discordTokenPrimary,
          discordTokenSecondary
        };

        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };
        return payload;
      }

      // [CASE B] 라이선스 기간 만료 매장 -> 7일 유예 작동 허용 (storex1003)
      if (storeId === "storex1003") {
        const failMsg = "라이선스 기간 만료. 7일 임시 구동 유예 토큰 발급 완료.";
        console.log(`⚠️ [알림] ${storeId} 매장 ${failMsg}`);
        addVerifyLog(storeId, req, false, "EXPIRED: 유예 토큰 발급");

        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = { 
          isApproved: false, 
          reason: "EXPIRED",
          storeType: "일반",
          allowOfflineGrace: true,
          offlineLicenseToken: "Haste_Expired_GraceToken_Sample_9363",
          discordTokenPrimary,
          discordTokenSecondary
        };

        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };
        return payload;
      }

      // [CASE C] 본사 이용 제한 매장 -> 즉시 전산 제한 (storex1004)
      if (storeId === "storex1004") {
        const failMsg = "미정산 등으로 인하여 전산 가동이 일시 제한되었습니다. 본사에 문의 바랍니다.";
        console.log(`🚨 [제한] ${storeId} 매장 ${failMsg}`);
        addVerifyLog(storeId, req, false, "SUSPENDED: 전산 가동 제한 완료");

        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = { 
          isApproved: false, 
          reason: "SUSPENDED",
          storeType: "일반",
          allowOfflineGrace: false,
          offlineLicenseToken: null,
          discordTokenPrimary,
          discordTokenSecondary
        };

        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };
        return payload;
      }

      // [CASE D] 인증 대기 상태 매장 -> 심사 대기 (storex1005)
      if (storeId === "storex1005") {
        const failMsg = "회원 심사 통과 대기 (인증 대기) 상태 접근.";
        console.log(`⚠️ [대기] ${storeId} 매장 ${failMsg}`);
        addVerifyLog(storeId, req, false, "PENDING_APPROVAL: 가입 승인 대기중");

        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = { 
          isApproved: false, 
          reason: "PENDING_APPROVAL",
          storeType: "일반",
          allowOfflineGrace: false,
          offlineLicenseToken: null,
          discordTokenPrimary,
          discordTokenSecondary
        };

        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };
        return payload;
      }

      // Safe DB Fallback for actual operational records
      const dbPool = await getDbPool();
      let licenseItem: any = null;

      if (dbPool.isFallback) {
        const list = readBackupLicenses();
        licenseItem = list.find((item: any) => item.storeId === storeId);
      } else {
        // [HASTE 임시 제어 우회 수정 지점] - 매장유형(store_type) 서브쿼리 조인 추가
        const [rows]: any = await dbPool.query(`
          SELECT 
            l.id, 
            l.store_name, 
            l.store_id, 
            l.license_start_date, 
            l.license_end_date, 
            l.is_approved, 
            l.store_grade,
            COALESCE((SELECT store_type FROM web_membership_users WHERE store_code = l.store_id LIMIT 1), '일반') as store_type
          FROM web_store_licenses l
          WHERE l.store_id = ? 
          LIMIT 1
        `, [storeId]);
        if (rows && rows.length > 0) {
          const r = rows[0];
          licenseItem = {
            id: r.id,
            storeName: r.store_name,
            storeId: r.store_id,
            licenseStartDate: r.license_start_date ? new Date(r.license_start_date).toISOString().split('T')[0] : '',
            licenseEndDate: r.license_end_date ? new Date(r.license_end_date).toISOString().split('T')[0] : '',
            isApproved: r.is_approved !== undefined ? Number(r.is_approved) : 1,
            storeGrade: r.store_grade || 'PREMIUM',
            storeType: r.store_type || '일반'
          };
        }
      }

      if (!licenseItem) {
        const errMsg = "유효하지 않거나 등록되지 않은 매장 고유번호입니다.";
        addVerifyLog(storeId, req, false, errMsg);
        
        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = {
          isApproved: false,
          reason: "UNKNOWN_STORE",
          storeType: "일반",
          message: "유효하지 않거나 만료된 매장 번호입니다.",
          allowOfflineGrace: false,
          offlineLicenseToken: null,
          discordTokenPrimary,
          discordTokenSecondary
        };
        
        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };
        return payload;
      }

      const serverTimeDate = new Date();
      const expiryTime = new Date(`${licenseItem.licenseEndDate}T23:59:59`);

      const isApprovedActive = (licenseItem.isApproved === 1 || licenseItem.isApproved === true);
      const isNotExpired = expiryTime.getTime() >= serverTimeDate.getTime();

      if (isApprovedActive && isNotExpired) {
        const successMsg = `정식 승인 통과 (${licenseItem.storeName} / ${licenseItem.storeGrade || "PREMIUM"})`;
        addVerifyLog(storeId, req, true, successMsg);

        // Crypto token generation for regular approved stores too
        const sevenDaysLater = Date.now() + (7 * 24 * 60 * 60 * 1000);
        const tokenPayload = JSON.stringify({ storeId, expire: sevenDaysLater });
        const offlineToken = crypto.createHash('sha256').update(tokenPayload).digest('hex');
        
        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = {
          isApproved: true,
          storeGrade: licenseItem.storeGrade || "PREMIUM",
          storeType: licenseItem.storeType || "일반",
          expireDate: licenseItem.licenseEndDate,
          storeName: licenseItem.storeName,
          offlineLicenseToken: `Haste_SecureToken_${offlineToken}`,
          discordTokenPrimary,
          discordTokenSecondary
        };

        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };

        return payload;
      } else {
        let failMessage = "유효하지 않거나 만료된 매장 번호입니다.";
        let reasonCode = "EXPIRED";
        let isGraceAllowed = true;
        
        if (!isApprovedActive) {
          if (licenseItem.isApproved === 2) {
            failMessage = "회원 심사 통과 대기 (인증 대기) 상태입니다.";
            reasonCode = "PENDING_APPROVAL";
          } else {
            failMessage = "라이선스가 비활성화(정지) 상태이거나 승인 대기 상태입니다.";
            reasonCode = "SUSPENDED";
          }
          isGraceAllowed = false;
        } else if (!isNotExpired) {
          failMessage = "라이선스 유효기간이 끝났습니다. 연장이 필요합니다.";
          reasonCode = "EXPIRED";
          isGraceAllowed = true;
        }
        addVerifyLog(storeId, req, false, failMessage);
        
        // [HASTE 임시 제어 우회 수정 지점] - storeType 추가
        const payload = {
          isApproved: false,
          reason: reasonCode,
          storeType: licenseItem.storeType || "일반",
          message: failMessage,
          allowOfflineGrace: isGraceAllowed,
          offlineLicenseToken: isGraceAllowed ? "Haste_Expired_GraceToken_Sample_9363" : null
        };

        storeVerifyCache[storeId] = {
          timestamp: Date.now(),
          response: payload
        };

        return payload;
      }
    } finally {
      pendingVerifications.delete(storeId);
    }
  })();

  pendingVerifications.set(storeId, verificationPromise);

  try {
    const finalResult = await verificationPromise;
    return res.status(200).json(finalResult);
  } catch (err: any) {
    console.error('[API error] Store verification API error:', err);
    try {
      addVerifyLog(storeId || '오류', req, false, `[DB 실시간 연동 에러] HTTP 500 - ${err.message}`);
    } catch (logErr) {
      console.error('[API error] Logging verification error failed:', logErr);
    }
    res.status(500).json({
      isApproved: false,
      reason: "SERVER_ERROR",
      message: "서버 내부 검문소 인증 오류: " + err.message
    });
  }
});

export default router;
