import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Activity,
  Server,
  PlugZap,
  Coffee,
  RadioTower,
  ShieldCheck,
  MonitorPlay,
  Sparkles,
  Sliders,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface LillyDashboardStatusProps {
  user: any;
  navigateTo: (route: string) => void;
  license?: any;
  isExpired?: boolean;
  isMonthlyPaid?: boolean;
}

export function LillyDashboardStatus({
  user,
  navigateTo,
  license,
  isExpired = false,
  isMonthlyPaid = false,
}: LillyDashboardStatusProps) {
  const [isSelling, setIsSelling] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState({
    ws: false,
    serialport: false,
    api: false,
    thirdparty: false,
    did: false,
    remoteDid: false,
  });
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActionError, setIsActionError] = useState<boolean>(false);

  const showFeedback = (msg: string, isErr: boolean = false) => {
    setActionMessage(msg);
    setIsActionError(isErr);
    const timer = setTimeout(() => {
      setActionMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  const isHqAdmin =
    user?.store_code === "HASTE-HQS-ADMIN" ||
    user?.storeCode === "HASTE-HQS-ADMIN";

  const storeCode = user?.store_code || user?.storeCode || "store075575";
  const storeName = isHqAdmin
    ? "본사 마스터 매장 (HQ)"
    : user?.storeName || user?.store_name || "대표운영매장";

  // 가맹점 유형 및 솔루션 등급
  const rawStoreType = isHqAdmin
    ? "HASTE_HQ"
    : user?.storeType || "HASTE_MEMBERSHIP";
  const rawStoreGrade = isHqAdmin ? "MASTER" : user?.storeGrade || "PREMIUM";

  const storeTypeLabel = isHqAdmin
    ? "헤이스트 본사"
    : rawStoreType.toUpperCase().includes("HASTE")
      ? "헤이스트멤버십"
      : "일반멤버십";
  const storeGradeLabel = rawStoreGrade.toUpperCase();

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `/api/remote/status?storeCode=${encodeURIComponent(storeCode)}`,
      );
      const data = await response.json();
      if (data.success && data.status) {
        setConnectionStatus({
          ws: !!(data.status.ws ?? data.status.ws_connected),
          serialport: !!(
            data.status.serialport ?? data.status.serialport_connected
          ),
          api: !!(data.status.api ?? data.status.local_api_connected),
          thirdparty: !!(
            data.status.thirdparty ?? data.status.thirdparty_connected
          ),
          did: !!(data.status.did ?? data.status.did_connected),
          remoteDid: !!(
            data.status.remoteDid ?? data.status.remote_did_connected
          ),
        });
      }
    } catch (err) {
      console.error("Failed to fetch store connection status:", err);
    }
  };

  // 실시간 기기 연결 상태 API 온디맨드 단발성 연동 (타이머 일절 제거)
  useEffect(() => {
    fetchStatus();
  }, [storeCode]);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      setCurrentTime(
        `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // 동적 상태가 적용된 DEPENDENCIES 배열 구성 (주문, 시리얼, 머신 3대 요소로 최정예 정돈!)
  const DEPENDENCIES = [
    {
      title: "주문 처리 시스템",
      description: "주문 접수와 기기 제어 엔진을 담당합니다.",
      recovery: "오류 로그를 확인하고 주문 처리 시스템을 재시작하세요.",
      icon: Server,
      ok: connectionStatus.api,
    },
    {
      title: "시리얼포트",
      description: "컵, 물, 시럽 추출 보드와 통신합니다.",
      recovery: "포트 번호, 보드 전원, 케이블 상태를 확인한 뒤 재연결하세요.",
      icon: PlugZap,
      ok: connectionStatus.serialport,
    },
    {
      title: "커피머신",
      description: "커피 추출 장비 연결 상태입니다.",
      recovery: "커피머신 전원, 네트워크, 장비 IP를 확인한 뒤 재연결하세요.",
      icon: Coffee,
      ok: connectionStatus.thirdparty,
    },
  ];

  const healthyCount = DEPENDENCIES.filter((d) => d.ok).length;

  const hasControlPermission = isHqAdmin || (isMonthlyPaid && !isExpired);

  const handleSalesToggle = async () => {
    if (!hasControlPermission) {
      alert(
        "❌ 제어 권한 없음:\n라이선스가 만료되었거나 비활성 상태입니다. [결제 관리] 탭에서 구독 플랜을 활성화해 주세요.",
      );
      return;
    }
    const nextSelling = !isSelling;
    setIsSelling(nextSelling);
    try {
      const response = await fetch("/api/remote/v3/sales/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeCode, isSelling: nextSelling }),
      });
      const data = await response.json();
      if (data.success) {
        showFeedback(
          nextSelling
            ? "판매가 정상적으로 시작되었습니다."
            : "판매가 일시 중지되었습니다.",
          false,
        );
      } else {
        showFeedback(
          `판매 토글 제어 실패: ${data.message || "알 수 없는 오류"}`,
          true,
        );
      }
    } catch (err) {
      showFeedback("판매 상태 제어 중 통신 오류가 발생했습니다.", true);
    }
  };

  const handleLocalDidOpen = async () => {
    if (!hasControlPermission) {
      alert(
        "❌ 제어 권한 없음:\n라이선스가 만료되었거나 비활성 상태입니다. [결제 관리] 탭에서 구독 플랜을 활성화해 주세요.",
      );
      return;
    }
    try {
      // 낙관적 업데이트(Optimistic Update)로 버튼 비주얼 즉시 실시간 전환!
      setConnectionStatus((prev) => ({
        ...prev,
        did: true,
        remoteDid: false,
      }));
      const response = await fetch("/api/remote/v3/did/open/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeCode }),
      });
      const data = await response.json();
      if (data.success) {
        showFeedback("로컬 DID 화면이 정상 기동되었습니다.", false);
      } else {
        showFeedback(
          `로컬 DID 기동 실패: ${data.message || "알 수 없는 오류"}`,
          true,
        );
      }
    } catch (err) {
      showFeedback("로컬 DID 실행 중 통신 오류가 발생했습니다.", true);
    }
  };

  const handleRemoteDidOpen = async () => {
    if (!hasControlPermission) {
      alert(
        "❌ 제어 권한 없음:\n라이선스가 만료되었거나 비활성 상태입니다. [결제 관리] 탭에서 구독 플랜을 활성화해 주세요.",
      );
      return;
    }
    try {
      // 낙관적 업데이트(Optimistic Update)로 버튼 비주얼 즉시 실시간 전환!
      setConnectionStatus((prev) => ({
        ...prev,
        did: false,
        remoteDid: true,
      }));
      const response = await fetch("/api/remote/v3/did/open/remote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeCode }),
      });
      const data = await response.json();
      if (data.success) {
        showFeedback("원격 DID 화면이 정상 기동되었습니다.", false);
      } else {
        showFeedback(
          `원격 DID 기동 실패: ${data.message || "알 수 없는 오류"}`,
          true,
        );
      }
    } catch (err) {
      showFeedback("원격 DID 실행 중 통신 오류가 발생했습니다.", true);
    }
  };

  const formatLicenseDate = (dateStr: any) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `만료 ${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) {
      return "-";
    }
  };

  const formatVerifiedDate = (dateStr: any) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="flex flex-col gap-0 select-none w-full h-full overflow-y-auto">
      {/* ─── 헤더 (릴리 오리지널 Header 레이아웃 100% 동일화) ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">
                런타임 상태
              </h1>
              <button
                onClick={fetchStatus}
                className="p-1.5 rounded-lg bg-[#18181B]/80 border border-[#27272A]/80 text-[#A1A1AA] hover:text-[#C5A059] hover:border-[#C5A059]/50 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="대시보드 새로고침"
              >
                <RefreshCw className="size-3.5" />
              </button>
            </div>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">
              오늘도 원활한 주문 수신을 위해 매장 장비의 연결 상태와 판매 준비
              현황을 지능적으로 관리합니다.
            </p>
          </div>
          {/* 버전 정보 우상단 은은하게 노출 (신보드 기원 버전 v1.0.0 정밀 적용!) */}
          <div className="text-xs font-semibold text-[#A1A1AA] bg-[#18181B]/80 border border-[#27272A]/70 px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
            v1.0.0
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      {/* ─── 콘텐츠 영역 ─── */}
      <div className="flex w-full flex-col gap-4 px-6 pb-6">
        {/* 1) 2-column Grid: 매장 라이선스 + 프로그램 실행 */}
        <section className="grid gap-4 lg:grid-cols-2">
          {/* 매장 라이선스 정보 카드 (마스터님 2행 대칭 기획 및 w-[122px] 동일 버튼 폭 완벽 싱크 적용) */}
          <div className="rounded-xl border border-[#27272A]/70 bg-[#0E0E10] p-5 shadow-xs flex flex-col gap-5 justify-between min-h-[148px]">
            {/* 1행: 매장 라이선스 정보 타이틀 + 등급 뱃지 2개 나란히 1줄 배치 */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-[#C5A059] shrink-0 font-sans">
                <ShieldCheck className="size-4 shrink-0" />
                <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider whitespace-nowrap">
                  매장 라이선스 정보
                </h3>
              </div>
              <div className="flex items-center gap-1.5 select-none font-sans">
                <span className="text-[#C5A059]/90 border border-[#C5A059]/25 bg-[#C5A059]/10 px-2 py-0.5 rounded-xl text-xs font-bold whitespace-nowrap">
                  {storeTypeLabel}
                </span>
                <span className="text-[#C5A059]/90 border border-[#C5A059]/20 bg-[#C5A059]/10 px-2 py-0.5 rounded-xl text-xs font-bold whitespace-nowrap">
                  {storeGradeLabel}
                </span>
              </div>
            </div>

            {/* 2행: 인증됨 및 판매 가능 뱃지 우측 정렬 (w-[122px] h-10 고정 크기 대통합) */}
            <div className="flex flex-row items-center justify-end gap-2.5">
              {/* 1. 인증 상태 뱃지 */}
              <div className="w-[122px] h-10 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm rounded-xl border border-emerald-500/20 bg-emerald-700 text-white shrink-0 select-none">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span className="tracking-tight">인증됨</span>
              </div>

              {/* 2. 판매가능 뱃지 */}
              <div
                className={`w-[122px] h-10 flex items-center justify-center gap-1.5 px-3 border rounded-xl text-xs font-bold shrink-0 shadow-sm transition-all select-none ${isSelling ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse"}`}
              >
                {isSelling ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                )}
                <span className="tracking-tight">
                  {isSelling ? "판매 가능" : "판매 중지"}
                </span>
              </div>
            </div>
          </div>

          {/* 프로그램 실행 카드 (좌측 카드와 완벽한 1:1 대칭 비주얼 구성) */}
          <div className="rounded-xl border border-[#27272A]/70 bg-[#0E0E10] p-5 shadow-xs flex flex-col gap-5 justify-between min-h-[148px]">
            {/* 1행: 프로그램 실행 타이틀 + 그 자리에 피드백 메시지 직접 노출 (판매구동 설명 글씨 삭제!) */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 text-stone-300 font-sans shrink-0">
                <MonitorPlay className="size-4 shrink-0 text-[#A1A1AA]" />
                <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider whitespace-nowrap">
                  프로그램 실행
                </h3>
              </div>

              {/* 피드백 구동 메세지를 캡션 설명 자리에 은은하게 직접 노출 */}
              <div className="min-w-0 select-none">
                {actionMessage && (
                  <span
                    className={`text-xs font-bold ${isActionError ? "text-rose-500" : "text-emerald-500"} transition-all whitespace-nowrap`}
                  >
                    {isActionError ? "⚠️" : "✓"} {actionMessage}
                  </span>
                )}
              </div>
            </div>

            {/* 2행: 판매 중, 원격 DID, 로컬 DID 3개 버튼 우측 정렬 (w-[122px] h-10 고정 크기 대통합!) */}
            <div className="flex flex-row items-center justify-end gap-2.5">
              {/* 1. 판매 중 스위치 캡슐 */}
              <div
                className={`w-[122px] h-10 flex items-center justify-between px-2.5 text-xs font-bold border rounded-xl shadow-sm select-none shrink-0 transition-all ${!hasControlPermission ? "opacity-40 cursor-not-allowed border-stone-800 text-stone-500" : isSelling ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse"}`}
              >
                <span>{isSelling ? "판매 중" : "판매 중지"}</span>
                <button
                  type="button"
                  onClick={handleSalesToggle}
                  disabled={!hasControlPermission}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border border-transparent transition-colors duration-200 ease-in-out outline-none ${!hasControlPermission ? "bg-stone-800 cursor-not-allowed" : "cursor-pointer"} ${isSelling ? "bg-emerald-600" : "bg-[#3F3F46]"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isSelling ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* 2. 원격 DID 실행 버튼 */}
              <button
                onClick={handleRemoteDidOpen}
                disabled={!hasControlPermission}
                className={`w-[122px] h-10 px-2 text-xs font-bold rounded-xl shadow-sm shrink-0 transition-all flex items-center justify-center gap-1 ${
                  !hasControlPermission
                    ? "opacity-40 cursor-not-allowed bg-transparent text-stone-500 border border-stone-850"
                    : "cursor-pointer active:scale-95"
                } ${
                  hasControlPermission &&
                  connectionStatus.remoteDid &&
                  !connectionStatus.did
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20"
                    : !hasControlPermission
                      ? ""
                      : "bg-transparent hover:bg-white/5 text-[#A1A1AA] hover:text-white border border-[#27272A]"
                }`}
              >
                <ExternalLink
                  className={`size-3.5 shrink-0 ${hasControlPermission && connectionStatus.remoteDid && !connectionStatus.did ? "text-white" : "text-[#A1A1AA]"}`}
                />
                <span>원격 DID 실행</span>
              </button>

              {/* 3. 로컬 DID 실행 버튼 */}
              <button
                onClick={handleLocalDidOpen}
                disabled={!hasControlPermission}
                className={`w-[122px] h-10 px-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 ${
                  !hasControlPermission
                    ? "opacity-40 cursor-not-allowed bg-transparent text-stone-500 border border-stone-850"
                    : "cursor-pointer active:scale-95"
                } ${
                  hasControlPermission &&
                  connectionStatus.did &&
                  !connectionStatus.remoteDid
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20"
                    : !hasControlPermission
                      ? ""
                      : "bg-transparent hover:bg-white/5 text-[#A1A1AA] hover:text-white border border-[#27272A]"
                }`}
              >
                <ExternalLink
                  className={`size-3.5 shrink-0 ${hasControlPermission && connectionStatus.did && !connectionStatus.remoteDid ? "text-white" : "text-[#A1A1AA]"}`}
                />
                <span>로컬 DID 실행</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2) 장비 연결 상태 카드 (중단 정렬) */}
        <section className="rounded-xl border border-[#27272A]/70 bg-[#0E0E10] shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]/40 bg-[#0E0E10]/80">
            <div>
              <h2 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wide">
                장비 연결 상태
              </h2>
              <p className="mt-0.5 text-[10.5px] text-[#71717A]">
                주문 처리에 필요한 로컬 서비스와 장비 연결 상태입니다.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#A1A1AA] bg-[#18181B] border border-[#27272A]/80 px-2 py-0.5 rounded-md">
              {healthyCount}/{DEPENDENCIES.length} 정상
            </span>
          </div>

          <div className="divide-y divide-[#27272A]/30 bg-[#070609]/10">
            {DEPENDENCIES.map(({ title, description, icon: Icon, ok }, i) => (
              <div
                key={i}
                className="flex min-h-[64px] w-full items-center justify-between gap-4 px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#1C1C1E] text-[#A1A1AA] shrink-0">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs sm:text-sm font-bold text-[#FAFAFA]">
                        {title}
                      </p>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider ${ok ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20" : "bg-red-950/60 text-red-400 border border-red-500/20"}`}
                      >
                        {ok ? "정상" : "연결 실패"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#71717A] font-light leading-normal">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3) 매장 인증 정보 표 (최하단 정렬 - 릴리 프로그램 FM 레이아웃과 100% 동일화!) */}
        <section className="rounded-xl border border-[#27272A]/70 bg-[#0E0E10] p-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#27272A]/40 pb-2.5 mb-3.5">
            <ShieldCheck className="size-4 text-[#A1A1AA]" />
            <h2 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wide">
              매장 인증 상세
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 font-sans">
            <div className="min-w-0 rounded-xl border border-[#27272A]/70 bg-[#18181B]/40 px-3 py-2">
              <p className="text-xs text-[#71717A] font-semibold">매장번호</p>
              <p className="mt-1 min-w-0 truncate text-xs font-bold text-[#FAFAFA]">
                {isHqAdmin ? "HASTE-HQS-ADMIN" : license?.storeId || storeCode}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#27272A]/70 bg-[#18181B]/40 px-3 py-2">
              <p className="text-xs text-[#71717A] font-semibold">매장명</p>
              <p className="mt-1 min-w-0 truncate text-xs font-bold text-[#FAFAFA]">
                {isHqAdmin
                  ? "본사 마스터 채널"
                  : license?.storeName || storeName}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#27272A]/70 bg-[#18181B]/40 px-3 py-2">
              <p className="text-xs text-[#71717A] font-semibold">
                라이선스 기간
              </p>
              <p className="mt-1 min-w-0 truncate text-xs font-bold text-[#FAFAFA]">
                {isHqAdmin
                  ? "무기한 (본사 마스터)"
                  : formatLicenseDate(license?.licenseEndDate)}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#27272A]/70 bg-[#18181B]/40 px-3 py-2">
              <p className="text-xs text-[#71717A] font-semibold">
                마지막 확인
              </p>
              <p className="mt-1 min-w-0 truncate text-xs font-bold text-[#FAFAFA]">
                {isHqAdmin
                  ? "실시간 인증 중"
                  : formatVerifiedDate(license?.lastVerifiedAt)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
