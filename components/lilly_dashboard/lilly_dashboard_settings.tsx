import React, { useState, useEffect } from 'react';
import {
  CoffeeIcon, ChevronRight, ClipboardList, CupSoda, DatabaseZap,
  Droplets, Info, PlugZap, SlidersHorizontal, RefreshCw, RotateCcw,
  MoonIcon, SunIcon, UploadIcon, DownloadIcon, ChevronLeft, Play, Sparkles
} from 'lucide-react';

import { SettingsSerialport } from './lilly_dashboard_settings_serialport';
import { SettingsParts } from './lilly_dashboard_settings_parts';
import { SettingsCoffee } from './lilly_dashboard_settings_coffee';
import { SettingsCup } from './lilly_dashboard_settings_cup';
import { SettingsSyrups } from './lilly_dashboard_settings_syrups';
import { SettingsWater } from './lilly_dashboard_settings_water';
import { SettingsInformation } from './lilly_dashboard_settings_information';

const SETTINGS_ITEMS = [
  { id: 'serialport', heading: '시리얼포트', description: '통신포트, 보레이트, 패리티, 전송 간격과 패킷 검증 설정', icon: PlugZap },
  { id: 'parts',      heading: '파츠',        description: '유량센서, 보드, 함수, 파트번호 등 장비 파츠 설정',  icon: DatabaseZap },
  { id: 'coffee',     heading: '커피 / 커피머신', description: '커피 프로토콜, 우유 프로토콜, 원두 센서와 머신 설정', icon: CoffeeIcon },
  { id: 'cup',        heading: '컵',           description: '컵 배출 방식, 컵 감지 센서, 컵 세부 동작 설정',  icon: CupSoda },
  { id: 'syrups',     heading: '시럽',         description: '시럽 배출 방식, 프로토콜, 용량, 재고관리 설정',  icon: SlidersHorizontal },
  { id: 'water',      heading: '물',           description: '정수, 온수, 탄산수, 얼음 추출과 재고관리 설정', icon: Droplets },
  { id: 'information', heading: '기타',        description: 'API, 매장 정보, 알림톡, DID 설정',            icon: Info },
];

export function LillyDashboardSettings({ storeCode }: { storeCode: string }) {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [patchData, setPatchData] = useState<any>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 물리 배출 테스트 버튼들의 개별 로딩 상태 관리
  const [testActions, setTestActions] = useState<Record<string, 'idle' | 'sending' | 'success' | 'failed'>>({
    hotCup: 'idle',
    icedCup: 'idle',
    hotWater: 'idle',
    purifiedWater: 'idle'
  });

  const activeStoreCode = storeCode || 'store075575';

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/remote/settings?storeCode=${activeStoreCode}`);
      const data = await response.json();
      if (data.success && data.result) {
        setSettings(data.result);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [activeStoreCode]);

  const handleToggle = async (key: 'isDark' | 'devTools') => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await fetch('/api/remote/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: activeStoreCode, settings: updated })
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleSaveConfig = async () => {
    if (!settings || !activeTab) return;
    const updated = { ...settings, [activeTab]: { ...settings[activeTab], ...patchData } };
    setIsSaving(true);
    try {
      const response = await fetch('/api/remote/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: activeStoreCode, settings: updated })
      });
      const data = await response.json();
      if (data.success) {
        setSettings(updated);
        setPatchData({});
        setActiveTab(null);
        alert('설정이 릴리 로컬 기기에 실시간으로 동기화되어 반영/저장되었습니다.');
      } else {
        alert('설정 저장에 실패했습니다.');
      }
    } catch (err) {
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 물리 배출 테스트 격발 핸들러 (Lilly API v3 라우트 매칭)
  const triggerDispenseAction = async (actionKey: string, endpoint: string, body: any) => {
    setTestActions(prev => ({ ...prev, [actionKey]: 'sending' }));
    try {
      const response = await fetch(`/api/remote/did/open/remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeCode: activeStoreCode,
          endpoint: endpoint,
          payload: body
        })
      });
      const resData = await response.json();
      if (resData.success || resData.result) {
        setTestActions(prev => ({ ...prev, [actionKey]: 'success' }));
      } else {
        setTestActions(prev => ({ ...prev, [actionKey]: 'failed' }));
      }
    } catch (err) {
      setTestActions(prev => ({ ...prev, [actionKey]: 'failed' }));
    }
    setTimeout(() => {
      setTestActions(prev => ({ ...prev, [actionKey]: 'idle' }));
    }, 1500);
  };

  const currentTabItem = SETTINGS_ITEMS.find(x => x.id === activeTab);

  return (
    <div className="flex flex-col gap-0 min-h-0 text-[#E4E4E7] font-sans text-left w-full h-full">

      {/* ─── 헤더 ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {activeTab ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setActiveTab(null);
                    setPatchData({});
                  }}
                  className="p-1 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-[#FAFAFA] font-sans">{currentTabItem?.heading} 설정</h1>
                  <p className="text-xs text-[#A1A1AA] font-light">{currentTabItem?.description}</p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">설정</h1>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">매장 앱과 장비 동작에 필요한 설정을 관리합니다.</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-[#18181B] border border-[#27272A]/80 px-2 py-1 rounded-md">
            <span className={`w-1.5 h-1.5 rounded-full ${settings ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${settings ? 'text-emerald-500' : 'text-amber-500'}`}>
              {settings ? 'TELEMETRY SYNCED' : 'AWAITING LINK'}
            </span>
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      {/* ─── 콘텐츠 ─── */}
      <div className="mx-auto flex w-full max-w-[892px] flex-col gap-3.5 px-5 pb-6">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 w-full border border-[#27272A]/60 bg-[#141414] rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-[#27272A] border-t-[#C5A059] animate-spin" />
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">LOADING SETTINGS DATA...</span>
          </div>
        ) : activeTab ? (
          // ─── 분할된 개별 설정 서브 탭 화면 마운트 ───
          <div className="flex flex-col gap-4">
            {activeTab === 'serialport' && (
              <SettingsSerialport
                data={settings.serialport || {}}
                onChange={(patch) => setPatchData((p: any) => ({ ...p, ...patch }))}
              />
            )}
            {activeTab === 'parts' && (
              <div className="flex flex-col gap-4">
                <SettingsParts
                  data={settings.parts || {}}
                  onChange={(patch) => setPatchData((p: any) => ({ ...p, ...patch }))}
                />

                {/* 물리 기기 테스트 제어판 (마스터 지침 - 세부버튼 전부 동일 동작 이식) */}
                <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5">
                  <div className="flex items-center gap-2 mb-2 border-b border-[#27272A]/40 pb-2">
                    <Sparkles className="size-4 text-[#C5A059]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">세부 장치 물리 작동 테스트</h3>
                  </div>
                  <p className="text-[10px] text-[#71717A] mb-3">각 버튼을 클릭하면 중계 게이트웨이를 거쳐 실제 컵 배출기 및 밸브가 동작을 수행합니다.</p>
                  
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {/* HOT 컵 */}
                    <button
                      onClick={() => triggerDispenseAction('hotCup', '/v3/parts/cup/dispense', { type: 'HOT' })}
                      disabled={testActions.hotCup !== 'idle'}
                      className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border-0 ${
                        testActions.hotCup === 'sending' ? 'bg-zinc-800 text-zinc-500' :
                        testActions.hotCup === 'success' ? 'bg-emerald-600 text-white' :
                        testActions.hotCup === 'failed' ? 'bg-rose-600 text-white' : 'bg-[#27272A] hover:bg-[#3F3F46] text-white'
                      }`}
                    >
                      <Play className="size-3" />
                      {testActions.hotCup === 'sending' ? '작동 중...' :
                       testActions.hotCup === 'success' ? '배출 성공' :
                       testActions.hotCup === 'failed' ? '배출 실패' : 'HOT 컵 배출'}
                    </button>

                    {/* ICE 컵 */}
                    <button
                      onClick={() => triggerDispenseAction('icedCup', '/v3/parts/cup/dispense', { type: 'ICE' })}
                      disabled={testActions.icedCup !== 'idle'}
                      className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border-0 ${
                        testActions.icedCup === 'sending' ? 'bg-zinc-800 text-zinc-500' :
                        testActions.icedCup === 'success' ? 'bg-emerald-600 text-white' :
                        testActions.icedCup === 'failed' ? 'bg-rose-600 text-white' : 'bg-sky-900/50 hover:bg-sky-800 text-sky-200'
                      }`}
                    >
                      <Play className="size-3" />
                      {testActions.icedCup === 'sending' ? '작동 중...' :
                       testActions.icedCup === 'success' ? '배출 성공' :
                       testActions.icedCup === 'failed' ? '배출 실패' : 'ICED 컵 배출'}
                    </button>

                    {/* 온수 */}
                    <button
                      onClick={() => triggerDispenseAction('hotWater', '/v3/parts/water/dispense', { type: '온수', volume: 100 })}
                      disabled={testActions.hotWater !== 'idle'}
                      className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border-0 ${
                        testActions.hotWater === 'sending' ? 'bg-zinc-800 text-zinc-500' :
                        testActions.hotWater === 'success' ? 'bg-emerald-600 text-white' :
                        testActions.hotWater === 'failed' ? 'bg-rose-600 text-white' : 'bg-[#27272A] hover:bg-[#3F3F46] text-white'
                      }`}
                    >
                      <Play className="size-3" />
                      {testActions.hotWater === 'sending' ? '작동 중...' :
                       testActions.hotWater === 'success' ? '추출 성공' :
                       testActions.hotWater === 'failed' ? '추출 실패' : '온수 100ml'}
                    </button>

                    {/* 정수 */}
                    <button
                      onClick={() => triggerDispenseAction('purifiedWater', '/v3/parts/water/dispense', { type: '정수', volume: 100 })}
                      disabled={testActions.purifiedWater !== 'idle'}
                      className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border-0 ${
                        testActions.purifiedWater === 'sending' ? 'bg-zinc-800 text-zinc-500' :
                        testActions.purifiedWater === 'success' ? 'bg-emerald-600 text-white' :
                        testActions.purifiedWater === 'failed' ? 'bg-rose-600 text-white' : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200'
                      }`}
                    >
                      <Play className="size-3" />
                      {testActions.purifiedWater === 'sending' ? '작동 중...' :
                       testActions.purifiedWater === 'success' ? '추출 성공' :
                       testActions.purifiedWater === 'failed' ? '추출 실패' : '정수 100ml'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'coffee' && (
              <SettingsCoffee
                data={settings.coffee || {}}
                onChange={(patch) => setPatchData((p: any) => ({ ...p, ...patch }))}
              />
            )}
            {activeTab === 'cup' && (
              <SettingsCup
                data={settings.cup || {}}
                onChange={(patch) => setPatchData((p: any) => ({ ...p, ...patch }))}
              />
            )}
            {activeTab === 'syrups' && (
              <SettingsSyrups
                data={settings.syrups || {}}
                onChange={(patch) => setPatchData((p: any) => ({ ...p, ...patch }))}
              />
            )}
            {activeTab === 'water' && (
              <SettingsWater
                data={settings.water || {}}
                onChange={(patch) => setPatchData((p: any) => ({ ...p, ...patch }))}
              />
            )}
            {activeTab === 'information' && (
              <SettingsInformation
                data={settings.information || {}}
                onChange={(patch) => setPatchData((p: any) => ({ ...p, ...patch }))}
              />
            )}

            {/* 하단 저장 컨트롤 플로팅 바 */}
            <div className="flex items-center justify-end gap-2.5 mt-3 border-t border-[#27272A]/40 pt-4 bg-[#141414]">
              <button
                onClick={() => {
                  setActiveTab(null);
                  setPatchData({});
                }}
                className="px-4.5 py-2.5 bg-transparent hover:bg-[#27272A]/50 text-[#A1A1AA] hover:text-white font-bold rounded-xl transition-all text-xs cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] text-black font-extrabold rounded-xl transition-all active:scale-95 text-xs cursor-pointer shadow-md border-0"
              >
                {isSaving ? '저장 동기화 중...' : '설정 저장 및 기기 적용'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 장비 설정 카드 (2열 그리드) */}
            <section className="rounded-xl border border-[#27272A]/60 bg-[#141414] shadow-sm">
              <div className="px-4 py-3">
                <h2 className="text-sm font-semibold text-[#FAFAFA]">장비 설정</h2>
                <p className="mt-1 text-xs text-[#71717A]">통신, 제조, 장비 동작 값을 영역별로 조정합니다.</p>
              </div>
              <div className="h-px bg-[#27272A]/40 w-full" />
              <div className="grid divide-y divide-[#27272A]/30 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
                <div className="divide-y divide-[#27272A]/30">
                  {SETTINGS_ITEMS.slice(0, 4).map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="group flex min-h-[64px] w-full items-center justify-between gap-5 px-5 py-2.5 text-left transition-colors hover:bg-[#27272A]/30 cursor-pointer border-none"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-[#27272A] text-[#A1A1AA]">
                            <item.icon className="size-4" />
                          </span>
                          <p className="truncate text-sm font-semibold text-[#FAFAFA]">{item.heading}</p>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-[#71717A]">{item.description}</p>
                      </div>
                      <ChevronRight className="size-4 text-[#52525B] transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
                <div className="divide-y divide-[#27272A]/30">
                  {SETTINGS_ITEMS.slice(4).map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="group flex min-h-[64px] w-full items-center justify-between gap-5 px-5 py-2.5 text-left transition-colors hover:bg-[#27272A]/30 cursor-pointer border-none"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-[#27272A] text-[#A1A1AA]">
                            <item.icon className="size-4" />
                          </span>
                          <p className="truncate text-sm font-semibold text-[#FAFAFA]">{item.heading}</p>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-[#71717A]">{item.description}</p>
                      </div>
                      <ChevronRight className="size-4 text-[#52525B] transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 앱 설정 카드 */}
            <section className="rounded-xl border border-[#27272A]/60 bg-[#141414] shadow-sm">
              <div className="px-4 py-3">
                <h2 className="text-sm font-semibold text-[#FAFAFA]">앱 설정</h2>
                <p className="mt-1 text-xs text-[#71717A]">화면 표시 방식, 앱 버전, 설정 백업을 관리합니다.</p>
              </div>
              <div className="h-px bg-[#27272A]/40 w-full" />

              <div className="divide-y divide-[#27272A]/30">
                <div className="flex min-h-[64px] w-full items-center justify-between gap-5 px-5 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-[#27272A] text-[#A1A1AA]">
                        <MoonIcon className="size-4" />
                      </span>
                      <p className="truncate text-sm font-semibold text-[#FAFAFA]">화면 모드</p>
                    </div>
                    <p className="mt-1 text-xs text-[#71717A]">운영 화면의 라이트/다크 모드를 전환합니다.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 select-none">
                    <span className="text-xs text-[#71717A] font-bold">
                      {settings?.isDark ? "다크" : "라이트"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle('isDark')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${settings?.isDark ? 'bg-white' : 'bg-[#3F3F46]'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${settings?.isDark ? 'translate-x-5 bg-zinc-900' : 'translate-x-0 bg-white'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex min-h-[64px] w-full items-center justify-between gap-5 px-5 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-[#27272A] text-[#A1A1AA]">
                        <Info className="size-4" />
                      </span>
                      <p className="truncate text-sm font-semibold text-[#FAFAFA]">크롬 디버깅 모드</p>
                    </div>
                    <p className="mt-1 text-xs text-[#71717A]">앱 가동 시 우측에 크롬 개발자 도구(DevTools) 화면을 표시합니다.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 select-none">
                    <span className="text-xs text-[#71717A] font-bold">
                      {settings?.devTools ? "ON" : "OFF"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle('devTools')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${settings?.devTools ? 'bg-white' : 'bg-[#3F3F46]'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${settings?.devTools ? 'translate-x-5 bg-zinc-900' : 'translate-x-0 bg-white'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
