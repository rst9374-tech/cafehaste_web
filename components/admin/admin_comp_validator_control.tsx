import React from 'react';
import { Play, RefreshCw, Trash2, Maximize } from 'lucide-react';
import { ApiLog } from './admin_hook_licenses';

interface ValidatorControlProps {
  testStoreId: string;
  setTestStoreId: (storeId: string) => void;
  testApiKey: string;
  setTestApiKey: (key: string) => void;
  handleTestVerify: () => void;
  isTesting: boolean;
  isLoadingLogs: boolean;
  dbSize: number | null;
  logAnalysis: any;
  setIsKioskPopupOpen: (b: boolean) => void;
  handleClearLogs: () => void;
  handleClearSimulation: () => void;
  isSimulating: boolean;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  simProgress: any;
  runDbSimulation: (count: number) => void;
  fetchApiLogs: () => void;
  fetchLicenses?: () => void;
  testResult: any;
}

export const AdminValidatorControl: React.FC<ValidatorControlProps> = ({
  testStoreId,
  setTestStoreId,
  testApiKey,
  setTestApiKey,
  handleTestVerify,
  isTesting,
  isLoadingLogs,
  dbSize,
  logAnalysis,
  setIsKioskPopupOpen,
  handleClearLogs,
  handleClearSimulation,
  isSimulating,
  simSpeed,
  setSimSpeed,
  simProgress,
  runDbSimulation,
  fetchApiLogs,
  fetchLicenses,
  testResult
}) => {

  return (
    <div className="xl:col-span-5 bg-stone-900 border border-stone-850 rounded-3xl p-5 shadow-lg flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-sans font-extrabold text-[12px]">멤버십 API 실시간 연동 모니터</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => {
              fetchApiLogs();
              if (fetchLicenses) fetchLicenses();
            }}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1"
          >
            <RefreshCw size={11} className={isLoadingLogs ? "animate-spin text-[#C5A039]" : ""} />
            <span className="text-[9px] font-sans font-bold">새로고침</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleClearLogs();
              handleClearSimulation();
            }}
            className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-[#FF6B6B] cursor-pointer transition-colors"
          >
            <Trash2 size={11} />
          </button>
          <button
            type="button"
            onClick={() => setIsKioskPopupOpen(true)}
            className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white cursor-pointer transition-colors flex items-center gap-0.5"
          >
            <Maximize size={11} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-stone-950/80 p-2.5 rounded-xl border border-emerald-500/40 font-mono text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.05)]">
        <div className="flex flex-col gap-0.5 text-stone-500 font-sans">
          <span>종합 검진</span>
          <span className="font-bold text-white text-[11px]">{logAnalysis.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5 text-stone-500 items-end font-sans">
            <span>DB 사용량</span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-[#C5A039]/15 text-[#C5A039] border border-[#C5A039]/25 px-1.5 py-0.5 rounded leading-none select-none tracking-tight">
              DB {dbSize !== null ? `${dbSize.toFixed(2)}M` : "..."} / 400M
            </span>
          </div>
          <div className="border-l border-stone-800 h-6 shrink-0" />
          <div className="flex flex-col gap-0.5 text-stone-500 items-end font-sans">
            <span>차단 비율 | 카운트</span>
            <span className="font-mono font-semibold text-rose-400">
              {logAnalysis.rate}% ({logAnalysis.deniedCount}건)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-stone-950/60 p-3.5 rounded-xl border border-emerald-500/40 space-y-3 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
        <h4 className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block font-sans">
          ■ API 검증기 간편 테스트 (Test Checker)
        </h4>
        <div className="flex flex-col gap-2 font-mono">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testApiKey}
              onChange={(e) => setTestApiKey(e.target.value)}
              placeholder="보안 Key (예: HASTE_SECRET_LIVE_9363)"
              className="bg-stone-900 border border-stone-800 hover:border-stone-700 focus:border-stone-600 rounded px-2.5 py-1.5 text-[11px] text-white flex-1 focus:outline-none placeholder-stone-600 font-semibold font-mono"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={testStoreId}
                onChange={(e) => setTestStoreId(e.target.value)}
                placeholder="매장 ID (예: store123456)"
                className="bg-stone-900 border border-stone-800 hover:border-stone-700 focus:border-stone-600 rounded px-2.5 py-1.5 text-[11px] text-white w-2/3 sm:w-28 focus:outline-none placeholder-stone-600 font-semibold font-mono"
              />
              <button
                type="button"
                onClick={handleTestVerify}
                disabled={isTesting || !testStoreId.trim() || isSimulating}
                className="bg-[#C5A059] hover:bg-[#D5B069] disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all active:scale-95 disabled:scale-100 flex items-center justify-center gap-1 cursor-pointer font-sans disabled:cursor-not-allowed flex-1 sm:flex-initial"
              >
                <Play size={11} className={isTesting ? "animate-bounce" : ""} />
                <span>{isTesting ? "호출 중" : "검증"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-stone-850/60">
          <span className="text-[10px] text-stone-400 font-sans font-extrabold select-none">
            ⚙️ 시뮬레이션/시험 배속 선택 (Speed Factor)
          </span>
          <div className="flex items-center gap-1 bg-stone-905 border border-stone-800 p-0.5 rounded-lg font-mono">
            {[1, 2, 4].map((mult) => (
              <button
                key={`speed-${mult}`}
                type="button"
                onClick={() => setSimSpeed(mult)}
                className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all ${
                  simSpeed === mult
                    ? "bg-[#C5A059] text-stone-950 font-black"
                    : "text-stone-400 hover:text-white hover:bg-stone-800"
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-850/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#C5A059] font-sans font-extrabold select-none">
              🖧 실제 DB 연동 트래픽 시뮬레이터 (멤버십 DB 연동)
            </span>
            <span className="text-[9px] text-stone-500 font-mono font-bold">
              속도: 회/{(10 / simSpeed).toFixed(simSpeed === 4 ? 1 : 0)}초
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 font-mono">
            {[1, 10, 100, 500].map((count) => (
              <button
                key={`db-${count}`}
                type="button"
                onClick={() => runDbSimulation(count)}
                disabled={isSimulating || isTesting}
                className="bg-stone-900 border border-[#C5A059]/20 hover:border-[#C5A059]/50 text-stone-300 hover:text-[#C5A059] py-1 px-1 rounded text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-40"
              >
                {count}회 DB시험
              </button>
            ))}
          </div>
        </div>

        {simProgress.total > 0 && (
          <div className="bg-stone-950 border border-stone-850 p-2.5 rounded-lg space-y-2 font-mono text-[10px] text-stone-300">
            <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 select-none text-[10.5px]">
              <span className="font-sans font-extrabold text-[#C5A059]">
                📊 DB 연동 실시간 누락 검출기 성적표 (이번 회차)
              </span>
              <span className="font-bold text-stone-400">
                진척도: {simProgress.current} / {simProgress.total} (X{simSpeed} 배속)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-[10.5px]">
              <div className="bg-emerald-950/30 border border-emerald-900/20 p-2 rounded-lg text-emerald-400 flex flex-col justify-center">
                <div className="font-sans font-bold text-stone-400 text-[10px] mb-0.5 flex flex-col items-center justify-center gap-1 shrink-0">
                  <span>정상 인증군 (Expected Approved)</span>
                  {simProgress.expectedApproved - simProgress.approvedSuccess > 0 && (
                    <span className="text-[8.5px] bg-rose-950 text-rose-450 px-1 py-0.2 rounded font-mono font-black animate-pulse leading-normal">
                      <span>누락 {simProgress.expectedApproved - simProgress.approvedSuccess}건</span>
                      <span className="opacity-40">|</span>
                      <span>실패율 {Math.round(((simProgress.expectedApproved - simProgress.approvedSuccess) / simProgress.expectedApproved) * 100)}%</span>
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-mono font-extrabold flex items-center justify-center gap-1 mt-1">
                  <span>인증자 {simProgress.approvedSuccess}</span>
                  <span className="text-stone-500 font-normal">/</span>
                  <span className="text-emerald-500">{simProgress.expectedApproved}</span>
                </div>
              </div>
              <div className="bg-rose-950/30 border border-rose-900/20 p-2 rounded-lg text-rose-400 flex flex-col justify-center">
                <div className="font-sans font-bold text-stone-400 text-[10px] mb-0.5 flex flex-col items-center justify-center gap-1 shrink-0">
                  <span>미인증/정지군 (Expected Denied)</span>
                  {simProgress.expectedDenied - simProgress.deniedSuccess > 0 && (
                    <span className="text-[8.5px] bg-amber-950 text-amber-500 px-1 py-0.2 rounded font-mono font-black leading-normal">
                      <span>이상 {simProgress.expectedDenied - simProgress.deniedSuccess}건</span>
                      <span className="opacity-40">|</span>
                      <span>오차율 {Math.round(((simProgress.expectedDenied - simProgress.deniedSuccess) / simProgress.expectedDenied) * 100)}%</span>
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-mono font-extrabold flex items-center justify-center gap-1 mt-1">
                  <span>비인증자 {simProgress.deniedSuccess}</span>
                  <span className="text-stone-500 font-normal">/</span>
                  <span className="text-rose-500">{simProgress.expectedDenied}</span>
                </div>
              </div>
            </div>
            {isSimulating && (
              <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-[#C5A059] bg-stone-900/40 p-1 rounded border border-stone-850 animate-pulse select-none font-sans font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                <span>트래픽 무정지 오버헤드 실시간 측정 중...</span>
              </div>
            )}
          </div>
        )}

        {testResult && (
          <div className="bg-stone-950 border border-stone-850 p-2.5 rounded-lg space-y-2 font-mono text-[10px] text-stone-350">
            <div className="flex items-center justify-between border-b border-stone-800 pb-1 mb-1.5">
              <span className="text-stone-500 font-bold font-sans">검증기 응답 Payload 결론</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${testResult.isApproved ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" : "bg-rose-950/60 text-rose-400 border border-rose-900/40"}`}>
                {testResult.isApproved ? "인증 승인 (Approved)" : "구동 거절 (Denied)"}
              </span>
            </div>
            <pre className="text-stone-300 font-mono text-[10.5px] leading-tight select-all">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <p className="text-[9px] text-stone-500 font-sans leading-normal italic select-none">
        ※ 실제 자바 프로그램 연동 시 REST API 헤더에 마스터 시크릿 키를 동봉하지 않거나 Timestamp 불일치 또는 미등록 매장 정보인 경우 즉시 FAIL 로깅 차단 제어됩니다.
      </p>
    </div>
  );
};
