import React, { useState, useEffect } from 'react';
import { Server, Eye, EyeOff, Save, Link2, Info, Activity } from 'lucide-react';

interface SystemHubProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  onRefreshInteriors?: () => any;
  onRefreshMenu?: () => any;
  onRefreshDrafts?: () => any;
  activeAdminTab?: string;
}

export const AdminSystemHub: React.FC<SystemHubProps> = ({
  showTemporaryToast,
  showTemporaryError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [primaryToken, setPrimaryToken] = useState('');
  const [secondaryToken, setSecondaryToken] = useState('');
  const [showPrimary, setShowPrimary] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/system-settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setPrimaryToken(data.settings.discord_bot_token_primary || '');
          setSecondaryToken(data.settings.discord_bot_token_secondary || '');
        }
      } catch (err: any) {
        console.error('Failed to fetch system settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discord_bot_token_primary: primaryToken,
          discord_bot_token_secondary: secondaryToken
        })
      });
      const data = await res.json();
      if (data.success) {
        showTemporaryToast(data.message || 'HQ 원격 중계 게이트웨이 연동 설정이 정상 저장되었습니다.');
      } else {
        showTemporaryError(data.message || '설정 저장 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      showTemporaryError(err.message || '서버 통신 실패');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-theme font-sans text-stone-300 w-full mx-auto space-y-6">

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-stone-400 animate-pulse">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-stone-800 border-t-[#C5A059]" />
          <span className="text-[11px] font-bold">원격 게이트웨이 데이터 동기화 중...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          
          {/* 1. HQ 원격 중계 게이트웨이 설정 (가로 폭 100%) */}
          <form onSubmit={handleSave} className="w-full bg-stone-900 p-6 rounded-3xl shadow-xl text-left border border-stone-850">
            <div className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Bot Token */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="discord_bot_token_primary" className="text-xs font-black text-stone-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      <span>중계 주 서버 토큰 (Discord 1)</span>
                    </div>
                    <span className="text-[#C5A059] text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/20">[Primary]</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="discord_bot_token_primary"
                      type={showPrimary ? 'text' : 'password'}
                      value={primaryToken}
                      onChange={(e) => setPrimaryToken(e.target.value)}
                      placeholder="디스코드 봇 토큰 1(Primary)을 입력해 주세요."
                      required
                      className="dashboard-input font-mono pr-12 text-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrimary(!showPrimary)}
                      className="absolute right-3.5 text-stone-400 hover:text-stone-300 transition-colors p-1 cursor-pointer"
                    >
                      {showPrimary ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Secondary Bot Token */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="discord_bot_token_secondary" className="text-xs font-black text-stone-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                      <span>중계 비상 서버 토큰 (Discord 2)</span>
                    </div>
                    <span className="text-stone-500 text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-950/80 border border-stone-850/50">[Secondary]</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="discord_bot_token_secondary"
                      type={showSecondary ? 'text' : 'password'}
                      value={secondaryToken}
                      onChange={(e) => setSecondaryToken(e.target.value)}
                      placeholder="비상 디스코드 봇 토큰 2(Secondary)를 입력해 주세요 (선택 사항)."
                      className="dashboard-input font-mono pr-12 text-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecondary(!showSecondary)}
                      className="absolute right-3.5 text-stone-400 hover:text-stone-300 transition-colors p-1 cursor-pointer"
                    >
                      {showSecondary ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-800/60 pt-4 mt-5">
              <span className="text-[10px] text-stone-500 font-bold">※ 주 서버 장애 시 비상 토큰으로 자동 릴레이 복구를 시도합니다.</span>
              <button
                type="submit"
                disabled={isSaving}
                className="dashboard-btn-gold disabled:opacity-50 disabled:scale-100 active:scale-[0.98] select-none"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-stone-955/20 border-t-transparent" />
                ) : (
                  <Save size={13} />
                )}
                <span>연동 설정 저장하기</span>
              </button>
            </div>
          </form>

          {/* 2. HASTE Lilly API v3 로컬 기기 연동 정보 패널 */}
          <div className="w-full bg-stone-900 p-6 rounded-3xl shadow-xl text-left border border-stone-850 space-y-5">
            <div className="border-b border-stone-800 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-[#C5A059]" />
                <div>
                  <h3 className="text-sm font-extrabold text-stone-200">Lilly API v3 로컬 기기 연동 명세</h3>
                  <p className="text-[9.5px] text-stone-500 font-bold">매장 로컬 기기(WMF 커피머신/디스펜서) 제어를 위한 로컬 API v3 규격 정보입니다.</p>
                </div>
              </div>
              <span className="text-[9px] font-bold font-mono bg-stone-950 text-stone-300 border border-stone-800 px-2.5 py-1 rounded-md tracking-wider">
                PORT: 8080
              </span>
            </div>

            {/* Address Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-850">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-stone-500 font-bold">HOMEPAGE API SERVER ADDRESS (HQ)</span>
                <span className="text-xs font-mono font-bold text-[#C5A059]">
                  https://cafehaste.com <span className="text-stone-500 font-sans font-bold text-[9px]">({typeof window !== 'undefined' ? window.location.origin : ''})</span>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-stone-500 font-bold">LILLY LOCAL API SERVER ADDRESS</span>
                <span className="text-xs font-mono font-bold text-stone-250">http://127.0.0.1:8080</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-stone-500 font-bold">LILLY LOCAL HOST API ENDPOINT</span>
                <span className="text-xs font-mono font-bold text-stone-250">http://localhost:8080</span>
              </div>
            </div>

            {/* Endpoints Table (Using Standard admin-dark-table-wrap table) */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[11px] text-stone-400 font-bold pl-1">
                <Activity size={13} className="text-[#C5A059]" />
                <span>실시간 연동 API v3 엔드포인트 리스트</span>
              </div>
              
              <div className="admin-dark-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="p-3 w-[80px]">METHOD</th>
                      <th className="p-3 w-[200px]">ENDPOINT</th>
                      <th className="p-3">DESCRIPTION</th>
                      <th className="p-3 w-[120px]">MODULE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded text-[9.5px] font-bold">GET</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/status</td>
                      <td className="p-3 text-stone-400">커피머신/디스펜서 원격 연결 상태 및 핑백 관제</td>
                      <td className="p-3 text-stone-500 font-bold">Lilly Core</td>
                    </tr>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9.5px] font-bold">POST</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/did/open/local</td>
                      <td className="p-3 text-stone-400">매장 로컬 DID(무인 디스플레이 기기) 강제 화면 구동</td>
                      <td className="p-3 text-stone-500 font-bold">DID SDK</td>
                    </tr>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9.5px] font-bold">POST</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/did/open/remote</td>
                      <td className="p-3 text-stone-400">본사 HQ 중계 터널을 통한 가맹점 DID 원격 실행</td>
                      <td className="p-3 text-stone-500 font-bold">Relay Bridge</td>
                    </tr>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9.5px] font-bold">POST</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/menu/sync</td>
                      <td className="p-3 text-stone-400">본사 메뉴 및 이미지 원격 레시피 데이터 주입</td>
                      <td className="p-3 text-stone-500 font-bold">Menu Sync</td>
                    </tr>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9.5px] font-bold">POST</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/sales/toggle</td>
                      <td className="p-3 text-stone-400">가맹점 무인 결제 판매 일시 정지 및 활성화 토글</td>
                      <td className="p-3 text-stone-500 font-bold">Sales Control</td>
                    </tr>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded text-[9.5px] font-bold">GET</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/inventory</td>
                      <td className="p-3 text-stone-400">원두, 파우더, 우유 등 원자재의 인벤토리 재고 현황 조회</td>
                      <td className="p-3 text-stone-500 font-bold">Inventory</td>
                    </tr>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9.5px] font-bold">POST</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/inventory/save</td>
                      <td className="p-3 text-stone-400">디바이스 원자재 재고 차감 및 세팅 업데이트 보존</td>
                      <td className="p-3 text-stone-500 font-bold">Inventory</td>
                    </tr>
                    <tr>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded text-[9.5px] font-bold">GET</span></td>
                      <td className="p-3 font-mono font-semibold text-stone-250">/v3/logs</td>
                      <td className="p-3 text-stone-400">기기 에러 코드 및 결제 전송 로그 추출 (name 파라미터 매핑)</td>
                      <td className="p-3 text-stone-500 font-bold">Logger</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2 items-start p-3 bg-stone-950 rounded-xl border border-stone-850 text-stone-500 text-[10.5px] leading-relaxed">
              <Info size={14} className="text-[#C5A059] shrink-0 mt-0.5" />
              <span>
                위 로컬 API v3 규격 정보는 가맹점 점주 전산 단말기의 `cafehaste-lilly` 일렉트론 모듈과 본사 백엔드 중계망 간의 양방향 소켓 통신 백본(Backbone) 정보입니다.
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
