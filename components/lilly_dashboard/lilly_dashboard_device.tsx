import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, FlaskConical, ChevronRight, ChevronLeft, RefreshCw, Coffee, PlayCircle, Eye, EyeOff
} from 'lucide-react';

interface TestItem {
  id: string;
  heading: string;
  description: string;
}

const TEST_ITEMS: TestItem[] = [
  { id: 'cup',       heading: '컵',              description: '컵 추출 테스트' },
  { id: 'syrups',     heading: '시럽',            description: '시럽 추출 테스트' },
  { id: 'water',      heading: '물 / 얼음',       description: '정수, 온수, 탄산수, 얼음 추출 테스트' },
  { id: 'coffee',     heading: '커피머신',         description: '커피머신 테스트' },
  { id: 'api',        heading: '로컬 API 테스트',  description: '재고 조회, 주문' },
  { id: 'task',       heading: '주문 및 스케줄러',  description: '주문 및 스케줄러 작업 큐 테스트' },
  { id: 'did',        heading: 'DID',             description: 'DID 콜백 테스트' }
];

export function LillyDashboardDevice({ storeCode }: { storeCode: string }) {
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 기기 데이터 상태
  const [inventory, setInventory] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  // 개별 탭 선택 상태 (컵/시럽/물 등)
  const [activeCupSeq, setActiveCupSeq] = useState<number>(1);
  const [activeSyrupSeq, setActiveSyrupSeq] = useState<number>(1);
  const [activeWaterSeq, setActiveWaterSeq] = useState<number>(1);

  // API 테스트 전용 상태 (Lilly TestApiActionView 복제)
  const [apiType, setApiType] = useState<string>('v2Inventory');
  const [apiBody, setApiBody] = useState<string>('');
  const [showSensitive, setShowSensitive] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  // 수동 주입량 다이얼로그 대용 값
  const [dispenseVolume, setDispenseVolume] = useState<number>(30); // 시럽용 30ml
  const [waterDispenseVolume, setWaterDispenseVolume] = useState<number>(100); // 물용 100ml

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const activeStoreCode = storeCode || 'store075575';
  const consoleContainerRef = useRef<HTMLDivElement>(null);

  // 1. 설정 및 실시간 재고 조회
  const loadDeviceData = async () => {
    try {
      const invRes = await fetch(`/api/remote/inventory?storeCode=${activeStoreCode}`);
      if (invRes.ok) {
        const invJson = await invRes.json();
        if (invJson && invJson.success) setInventory(invJson.result);
      }
      const setRes = await fetch(`/api/remote/settings?storeCode=${activeStoreCode}`);
      if (setRes.ok) {
        const setJson = await setRes.json();
        if (setJson && setJson.success) setSettings(setJson.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 실시간 로그 로드
  const fetchLogs = async () => {
    const logName = activeTestId === 'api' ? 'api' :
                    activeTestId === 'cup' ? 'cup' :
                    activeTestId === 'syrups' ? 'syrup' :
                    activeTestId === 'water' ? 'water' :
                    activeTestId === 'coffee' ? 'coffee' :
                    activeTestId === 'task' ? 'task' : 'total';
    try {
      const response = await fetch(`/api/remote/logs?storeCode=${activeStoreCode}&name=${logName}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.logs)) {
          setLogs(json.logs);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadDeviceData();
  }, [activeStoreCode]);

  useEffect(() => {
    fetchLogs();
  }, [activeStoreCode, activeTestId]);

  // 로컬 API 테스트용 JSON 본문 자동 구성
  useEffect(() => {
    if (apiType === 'v2Inventory') {
      setApiBody('V2 API는 Authorization: Bearer <token> 방식으로 동작합니다.');
    } else if (apiType === 'v2Menu') {
      setApiBody('V2 API는 Authorization: Bearer <token> 방식으로 동작합니다.');
    } else if (apiType === 'v2Order') {
      setApiBody(JSON.stringify({
        productNo: "p100",
        option: {
          wmfOption: {
            button: 5,
            seq: 1
          }
        }
      }, null, 3));
    } else if (apiType === 'v1Status') {
      setApiBody(JSON.stringify({
        action: "status",
        token: activeStoreCode
      }, null, 3));
    } else if (apiType === 'v1Order') {
      setApiBody(JSON.stringify({
        action: "order",
        token: activeStoreCode,
        order: {
          orderNo: "ORD-TEST-001",
          menuName: "아메리카노",
          recipe: "COFFEE:15 / WATER:120"
        }
      }, null, 3));
    }
  }, [apiType, activeStoreCode]);

  // 테스트 신호 발송 프록시 격발
  const handleTriggerAction = async (actionKey: string, endpoint: string, payload: any) => {
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      const response = await fetch(`/api/remote/did/open/remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeCode: activeStoreCode,
          endpoint,
          payload
        })
      });
      const data = await response.json();
      if (data.success || data.result) {
        alert('테스트 배출 명령이 중계 게이트웨이를 거쳐 실제 기기에 정상 전송되었습니다.');
      } else {
        alert(`명령 전송 실패: ${data.message || '응답 오류'}`);
      }
    } catch (err: any) {
      alert(`통신 장애: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
      fetchLogs();
    }
  };

  const handleSendApiRequest = async () => {
    setSending(true);
    let url = `/api/remote/inventory`;
    let method = 'GET';
    let bodyObj: any = null;

    if (apiType === 'v2Menu') {
      url = `/api/remote/v3/menu?storeCode=${activeStoreCode}`;
    } else if (apiType === 'v2Order') {
      url = `/api/remote/did/open/remote`;
      method = 'POST';
      bodyObj = {
        storeCode: activeStoreCode,
        endpoint: '/v3/order',
        payload: JSON.parse(apiBody)
      };
    } else if (apiType === 'v1Status') {
      url = `/api/remote/did/open/remote`;
      method = 'POST';
      bodyObj = {
        storeCode: activeStoreCode,
        endpoint: '/v3/status',
        payload: {}
      };
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: bodyObj ? JSON.stringify(bodyObj) : undefined
      });
      const resText = await response.text();
      alert(`[로컬 API 응답 수신]\n\n${resText.slice(0, 450)}`);
    } catch (err: any) {
      alert(`API 테스트 전송 실패: ${err.message}`);
    } finally {
      setSending(false);
      fetchLogs();
    }
  };

  const currentTab = TEST_ITEMS.find(x => x.id === activeTestId);

  return (
    <div className="flex flex-col gap-0 min-h-0 text-[#E4E4E7] font-sans text-left w-full h-full select-none">
      
      {/* ─── 헤더 (Lilly Header 100% 동일) ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {activeTestId ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTestId(null)}
                  className="p-1 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-[#FAFAFA] font-sans">{currentTab?.heading}</h1>
                  <p className="text-xs text-[#A1A1AA] font-light">{currentTab?.description}</p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">테스트</h1>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">장비별 테스트 액션과 실행 결과를 확인합니다.</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-[#18181B] border border-[#27272A]/80 px-2 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">TEST LINK SYNCED</span>
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      {/* ─── 콘텐츠 ─── */}
      <div className="mx-auto flex w-full max-w-[892px] flex-col gap-3.5 px-5 pb-6">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 w-full border border-[#27272A]/60 bg-[#141414] rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-[#27272A] border-t-[#C5A059] animate-spin" />
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">LOADING TEST MODULES...</span>
          </div>
        ) : activeTestId ? (
          // ─── 2. 개별 테스트 상세화면 (Lilly TEST_SPLIT_PANEL_CLASS 1:1 대칭화) ───
          <div className="grid gap-4.5 md:grid-cols-2">
            
            {/* 좌측 패널 - 로그 모니터 (Lilly TestLogView 복제) */}
            <div className="rounded-xl border border-[#27272A]/60 bg-[#141414] p-4 flex flex-col gap-3.5 h-[500px]">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Terminal className="size-3 text-[#C5A059]" />
                  {currentTab?.heading} 실시간 수신 로그
                </span>
                <button
                  onClick={fetchLogs}
                  className="p-1 rounded-md bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors cursor-pointer border-0"
                >
                  <RefreshCw className="size-3" />
                </button>
              </div>
              <div 
                ref={consoleContainerRef}
                className="w-full flex-1 bg-[#0A0A0C] border border-[#27272A]/60 rounded-xl p-3 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] leading-relaxed flex flex-col gap-1.5"
              >
                {logs.length === 0 ? (
                  <div className="text-stone-600 text-center py-20 select-none">수신된 테스트 로그가 존재하지 않습니다.</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="break-all border-b border-stone-900/10 pb-1 text-left">
                      <span className="text-stone-700 mr-2">[{idx + 1}]</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 우측 패널 - 파라미터 요약 dl 카드 & 격발 버튼 (Lilly TestInfoView 복제) */}
            <div className="rounded-xl border border-[#27272A]/60 bg-[#141414] p-4.5 flex flex-col justify-between h-[500px] text-left">
              <div className="flex flex-col gap-3.5 overflow-y-auto">
                
                {activeTestId === 'cup' && settings?.cup?.cups && (
                  <div className="flex flex-col gap-3">
                    {/* 컵 서브 탭 */}
                    <div className="flex gap-1 p-1 bg-[#141416] rounded-lg border border-[#27272A] mb-1">
                      {settings.cup.cups.map((cup: any) => (
                        <button
                          key={cup.seq}
                          onClick={() => setActiveCupSeq(cup.seq)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border-0 ${
                            activeCupSeq === cup.seq ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'
                          }`}
                        >
                          {cup.name}
                        </button>
                      ))}
                    </div>

                    {/* dl 속성 리스트 (Lilly 1:1 매핑) */}
                    {(() => {
                      const cup = settings.cup.cups.find((c: any) => c.seq === activeCupSeq) || settings.cup.cups[0];
                      const currentStock = activeCupSeq === 1 ? inventory?.stocks?.icedCup : inventory?.stocks?.hotCup;
                      const maxStock = activeCupSeq === 1 ? inventory?.max?.icedCup : inventory?.max?.hotCup;
                      return (
                        <div className="flex flex-col gap-3">
                          <dl className="grid grid-cols-[1fr_2fr] gap-y-2.5 gap-x-4 border border-[#27272A]/60 bg-[#141416]/50 rounded-xl p-4.5 text-xs text-[#E4E4E7]">
                            <dt className="text-[#71717A] font-semibold text-left">컵 이름</dt>
                            <dd className="text-white text-right font-bold">{cup.name}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">컵 타입</dt>
                            <dd className="text-white text-right font-mono">{cup.type}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">우선순위</dt>
                            <dd className="text-white text-right font-mono">{cup.priority}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">컵드랍모터</dt>
                            <dd className="text-white text-right font-mono">{cup.cupDropMotor}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">컵감지센서</dt>
                            <dd className="text-white text-right font-mono">{cup.cupDetectSensor}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">재고</dt>
                            <dd className="text-[#C5A059] text-right font-bold font-mono">
                              {currentStock !== undefined ? `${currentStock} / ${maxStock || 150}개` : '-'}
                            </dd>
                          </dl>
                          <button
                            onClick={() => handleTriggerAction('cupDisp', '/v3/parts/cup/dispense', { cupName: cup.name })}
                            disabled={actionLoading.cupDisp}
                            className="w-full py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black rounded-lg transition-all active:scale-95 text-xs border-0 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <PlayCircle className="size-3.5" />
                            {cup.name} 추출
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeTestId === 'syrups' && settings?.syrups?.syrups && (
                  <div className="flex flex-col gap-3">
                    {/* 시럽 서브 탭 */}
                    <div className="flex gap-1 p-1 bg-[#141416] rounded-lg border border-[#27272A] mb-1">
                      {settings.syrups.syrups.map((s: any) => (
                        <button
                          key={s.seq}
                          onClick={() => setActiveSyrupSeq(s.seq)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border-0 ${
                            activeSyrupSeq === s.seq ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'
                          }`}
                        >
                          {s.name || `시럽 ${s.seq}`}
                        </button>
                      ))}
                    </div>

                    {/* dl 속성 리스트 (Lilly 1:1 매핑) */}
                    {(() => {
                      const syrup = settings.syrups.syrups.find((s: any) => s.seq === activeSyrupSeq) || settings.syrups.syrups[0];
                      const currentStock = inventory?.stocks?.[`syrup${activeSyrupSeq}`] || 0;
                      return (
                        <div className="flex flex-col gap-3">
                          <dl className="grid grid-cols-[1fr_2fr] gap-y-2.5 gap-x-4 border border-[#27272A]/60 bg-[#141416]/50 rounded-xl p-4.5 text-xs text-[#E4E4E7]">
                            <dt className="text-[#71717A] font-semibold text-left">시럽 이름</dt>
                            <dd className="text-white text-right font-bold">{syrup.name}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">프로토콜</dt>
                            <dd className="text-white text-right font-mono">{syrup.protocol || 'NONE'}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">밸브모터</dt>
                            <dd className="text-white text-right font-mono">{syrup.syrupPump}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">1ml당 펄스</dt>
                            <dd className="text-white text-right font-mono">{syrup.pulsePerMl} pulse/ml</dd>
                            <dt className="text-[#71717A] font-semibold text-left">재고</dt>
                            <dd className="text-[#C5A059] text-right font-bold font-mono">{currentStock}ml</dd>
                          </dl>

                          <div className="flex flex-col gap-1.5 mt-1">
                            <label className="text-[10px] font-bold text-stone-500">배출 용량 (ml)</label>
                            <input 
                              type="number" 
                              value={dispenseVolume}
                              onChange={(e) => setDispenseVolume(Number(e.target.value))}
                              className="bg-[#0A0A0C] border border-[#27272A] rounded-lg text-xs text-white px-3 py-1.5 outline-none font-mono"
                            />
                            <button
                              onClick={() => handleTriggerAction('syrupDisp', '/v3/parts/syrup/dispense', { syrupName: syrup.name, amount: dispenseVolume })}
                              disabled={actionLoading.syrupDisp}
                              className="w-full py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black rounded-lg transition-all active:scale-95 text-xs border-0 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <PlayCircle className="size-3.5" />
                              {syrup.name} 추출
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeTestId === 'water' && settings?.water?.waters && (
                  <div className="flex flex-col gap-3">
                    {/* 물 서브 탭 */}
                    <div className="flex gap-1 p-1 bg-[#141416] rounded-lg border border-[#27272A] mb-1">
                      {settings.water.waters.map((w: any) => (
                        <button
                          key={w.seq}
                          onClick={() => setActiveWaterSeq(w.seq)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border-0 ${
                            activeWaterSeq === w.seq ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'
                          }`}
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>

                    {/* dl 속성 리스트 (Lilly 1:1 매핑) */}
                    {(() => {
                      const water = settings.water.waters.find((w: any) => w.seq === activeWaterSeq) || settings.water.waters[0];
                      return (
                        <div className="flex flex-col gap-3">
                          <dl className="grid grid-cols-[1fr_2fr] gap-y-2.5 gap-x-4 border border-[#27272A]/60 bg-[#141416]/50 rounded-xl p-4.5 text-xs text-[#E4E4E7]">
                            <dt className="text-[#71717A] font-semibold text-left">이름</dt>
                            <dd className="text-white text-right font-bold">{water.name}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">프로토콜</dt>
                            <dd className="text-white text-right font-mono">{water.protocol || 'NONE'}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">밸브모터</dt>
                            <dd className="text-white text-right font-mono">{water.inletValve}</dd>
                            <dt className="text-[#71717A] font-semibold text-left">유량센서</dt>
                            <dd className="text-white text-right font-mono">{water.waterSensor}</dd>
                          </dl>

                          <div className="flex flex-col gap-1.5 mt-1">
                            <label className="text-[10px] font-bold text-stone-500">추출 용량 (ml)</label>
                            <input 
                              type="number" 
                              value={waterDispenseVolume}
                              onChange={(e) => setWaterDispenseVolume(Number(e.target.value))}
                              className="bg-[#0A0A0C] border border-[#27272A] rounded-lg text-xs text-white px-3 py-1.5 outline-none font-mono"
                            />
                            <button
                              onClick={() => handleTriggerAction('waterDisp', '/v3/parts/water/dispense', { waterType: water.name === '온수' ? 'hot' : 'purified', amount: waterDispenseVolume })}
                              disabled={actionLoading.waterDisp}
                              className="w-full py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black rounded-lg transition-all active:scale-95 text-xs border-0 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <PlayCircle className="size-3.5" />
                              {water.name} 추출
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeTestId === 'coffee' && (
                  <div className="flex flex-col gap-3">
                    <dl className="grid grid-cols-[1fr_2fr] gap-y-2.5 gap-x-4 border border-[#27272A]/60 bg-[#141416]/50 rounded-xl p-4.5 text-xs text-[#E4E4E7]">
                      <dt className="text-[#71717A] font-semibold text-left">커피머신 IP</dt>
                      <dd className="text-white text-right font-mono">{settings?.coffee?.machines?.[0]?.ip || '192.168.0.10'}</dd>
                      <dt className="text-[#71717A] font-semibold text-left">통신 포트</dt>
                      <dd className="text-white text-right font-mono">{settings?.coffee?.machines?.[0]?.port || '80'}</dd>
                    </dl>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={() => handleTriggerAction('rinse', '/v3/parts/coffee/rinse', {})}
                        disabled={actionLoading.rinse}
                        className="py-2.5 bg-[#27272A] hover:bg-[#3F3F46] text-white font-extrabold rounded-lg transition-all text-xs border border-[#27272A] cursor-pointer"
                      >
                        커피머신 원격 린싱 (세척)
                      </button>
                      <button
                        onClick={() => handleTriggerAction('coffeeOut', '/v3/parts/coffee/dispense', { button: 5 })}
                        disabled={actionLoading.coffeeOut}
                        className="py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] text-black font-black rounded-lg transition-all text-xs border-0 cursor-pointer"
                      >
                        커피 단독 추출 (버튼 5번)
                      </button>
                    </div>
                  </div>
                )}

                {activeTestId === 'api' && (
                  <div className="flex flex-col gap-2 h-full text-xs">
                    <label className="text-[#71717A] font-bold">API 타입 선택</label>
                    <select
                      value={apiType}
                      onChange={(e) => setApiType(e.target.value)}
                      className="bg-[#0A0A0C] border border-[#27272A] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none font-bold"
                    >
                      <option value="v2Inventory">{"[V2] 재고 조회 (GET /v2/inventory)"}</option>
                      <option value="v2Menu">{"[V2] 메뉴 조회 (GET /v2/menu)"}</option>
                      <option value="v2Order">{"[V2] 주문 접수 (POST /v2/order)"}</option>
                      <option value="v1Status">{"[V1] 상태 조회 (POST /api)"}</option>
                      <option value="v1Order">{"[V1] 주문 처리 (POST /api)"}</option>
                    </select>

                    <label className="text-[#71717A] font-bold mt-2">JSON 요청 본문</label>
                    <textarea
                      value={apiBody}
                      onChange={(e) => setApiBody(e.target.value)}
                      className="flex-1 min-h-[140px] bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2.5 font-mono text-[10px] text-white resize-none focus:outline-none focus:border-[#C5A059]"
                    />
                    
                    <button
                      onClick={handleSendApiRequest}
                      disabled={sending}
                      className="py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] disabled:bg-zinc-800 text-black font-black rounded-lg transition-all text-xs cursor-pointer border-0 mt-2"
                    >
                      {sending ? '요청 중...' : 'API 요청 보내기'}
                    </button>
                  </div>
                )}

                {activeTestId === 'task' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">주문 스케줄러와 백그라운드 스레드의 작동 큐 처리를 테스트 격발합니다.</p>
                    <button
                      onClick={() => handleTriggerAction('schedulerRun', '/v3/task/scheduler/run', {})}
                      className="py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] text-black font-extrabold rounded-lg transition-all text-xs border-0 cursor-pointer mt-2"
                    >
                      린싱/에러 스케줄러 강제 1회 작동
                    </button>
                  </div>
                )}

                {activeTestId === 'did' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">DID 음료 제조 완료 알림 패킷 및 콜백 경로를 테스트 격발합니다.</p>
                    <button
                      onClick={() => handleTriggerAction('didOpen', '/v3/did/open/remote', {})}
                      className="py-2.5 bg-[#C5A059] hover:bg-[#B08E4D] text-black font-extrabold rounded-lg transition-all text-xs border-0 cursor-pointer mt-2"
                    >
                      DID 원격 콜백 격발
                    </button>
                  </div>
                )}

              </div>
              
              <span className="text-[10px] text-[#71717A] border-t border-[#27272A]/40 pt-2.5 font-bold block select-none">
                ⚠️ 본 테스트 전송은 HASTE HQ 비공개 암전 중계망을 통해서만 기기로 릴레이되며 디코드 명칭은 스텔스(Stealth) 처리됩니다.
              </span>
            </div>

          </div>
        ) : (
          // ─── 1. Lilly TestPage.tsx 1:1 대칭형 타일 메뉴 리스트 ───
          <section className="rounded-xl border border-[#27272A]/60 bg-[#141414] shadow-sm">
            <div className="px-4 py-3 border-b border-[#27272A]/40">
              <h2 className="text-sm font-semibold text-[#FAFAFA]">테스트 항목</h2>
              <p className="mt-1 text-xs text-[#71717A]">장비 명령과 로컬 API 동작을 분석해서 실행합니다.</p>
            </div>
            
            <div className="grid divide-y divide-[#27272A]/30 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
              <div className="divide-y divide-[#27272A]/30">
                {TEST_ITEMS.slice(0, 4).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTestId(item.id)}
                    className="group flex min-h-[72px] w-full items-center justify-between gap-5 px-5 py-3 text-left transition-colors hover:bg-[#27272A]/30 cursor-pointer border-none"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-md bg-[#27272A] text-[#A1A1AA]">
                          <FlaskConical className="size-4" />
                        </span>
                        <p className="truncate text-sm font-semibold text-[#FAFAFA]">{item.heading}</p>
                      </div>
                      <p className="mt-1 text-xs text-[#71717A] pl-10 leading-relaxed">{item.description}</p>
                    </div>
                    <ChevronRight className="size-4 text-[#52525B] transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </button>
                ))}
              </div>
              
              <div className="divide-y divide-[#27272A]/30">
                {TEST_ITEMS.slice(4).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTestId(item.id)}
                    className="group flex min-h-[72px] w-full items-center justify-between gap-5 px-5 py-3 text-left transition-colors hover:bg-[#27272A]/30 cursor-pointer border-none"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-md bg-[#27272A] text-[#A1A1AA]">
                          <FlaskConical className="size-4" />
                        </span>
                        <p className="truncate text-sm font-semibold text-[#FAFAFA]">{item.heading}</p>
                      </div>
                      <p className="mt-1 text-xs text-[#71717A] pl-10 leading-relaxed">{item.description}</p>
                    </div>
                    <ChevronRight className="size-4 text-[#52525B] transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
