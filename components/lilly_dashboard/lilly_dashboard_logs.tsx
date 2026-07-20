import React, { useState } from 'react';
import { FileText, ChevronRight, ChevronLeft, RefreshCw, Terminal } from 'lucide-react';

import { LogTotal } from './lilly_dashboard_logs_total';
import { LogTask } from './lilly_dashboard_logs_task';
import { LogApi } from './lilly_dashboard_logs_api';
import { LogSerialport } from './lilly_dashboard_logs_serialport';
import { LogCoffee } from './lilly_dashboard_logs_coffee';
import { LogSyrup } from './lilly_dashboard_logs_syrup';
import { LogWater } from './lilly_dashboard_logs_water';
import { LogCup } from './lilly_dashboard_logs_cup';

const LOG_ITEMS = [
  { id: 'task',       heading: '주문 및 스케줄러', description: '주문 처리 상태, 린싱, 에러체크 스케줄러 관련 로그' },
  { id: 'api',        heading: 'API',             description: '로컬 API 서버 관련 로그' },
  { id: 'serialport', heading: '시리얼포트',       description: '시리얼포트 관련 로그' },
  { id: 'coffee',     heading: '커피머신',         description: '커피머신 관련 로그' },
  { id: 'syrup',      heading: '시럽',            description: '시럽 관련 로그' },
  { id: 'water',      heading: '물 / 얼음',       description: '물 / 얼음 관련 로그' },
  { id: 'cup',        heading: '컵',              description: '컵 관련 로그' },
  { id: 'total',      heading: '종합 로그',        description: '모든 로그를 한번에 확인' },
];

export function LillyDashboardLogs({ storeCode }: { storeCode: string }) {
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const activeStoreCode = storeCode || 'store075575';

  const currentLogItem = LOG_ITEMS.find(x => x.id === activeLogId);

  const handleClearLogs = async () => {
    if (!confirm('실시간 기기 중계망 로그 버퍼를 지우시겠습니까?')) return;
    try {
      await fetch('/api/remote/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: activeStoreCode })
      });
      alert('로그 버퍼 초기화 완료');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-0 min-h-0 text-[#E4E4E7] font-sans text-left w-full h-full">

      {/* ─── 헤더 ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {activeLogId ? (
              <div className="flex items-center gap-2.5 animate-fadeIn">
                <button
                  onClick={() => setActiveLogId(null)}
                  className="p-1 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-[#FAFAFA] font-sans">{currentLogItem?.heading} 로그</h1>
                  <p className="text-xs text-[#A1A1AA] font-light">{currentLogItem?.description}</p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">로그 콘솔</h1>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">기기 제조, 시리얼 포트 통신 및 스케줄러 실행 로그를 실시간 모니터링합니다.</p>
              </div>
            )}
          </div>
          {activeLogId && (
            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 text-xs font-bold bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
            >
              로그 초기화
            </button>
          )}
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      {/* ─── 콘텐츠 ─── */}
      <div className="mx-auto flex w-full max-w-[892px] flex-col gap-3.5 px-5 pb-6">

        {activeLogId ? (
          // ─── 분할된 개별 로그 서브 화면 마운트 ───
          <div className="flex flex-col gap-4 animate-fadeIn">
            {activeLogId === 'total' && <LogTotal storeCode={activeStoreCode} />}
            {activeLogId === 'task' && <LogTask storeCode={activeStoreCode} />}
            {activeLogId === 'api' && <LogApi storeCode={activeStoreCode} />}
            {activeLogId === 'serialport' && <LogSerialport storeCode={activeStoreCode} />}
            {activeLogId === 'coffee' && <LogCoffee storeCode={activeStoreCode} />}
            {activeLogId === 'syrup' && <LogSyrup storeCode={activeStoreCode} />}
            {activeLogId === 'water' && <LogWater storeCode={activeStoreCode} />}
            {activeLogId === 'cup' && <LogCup storeCode={activeStoreCode} />}
          </div>
        ) : (
          // ─── 로그 리스트 카드 (Lilly LogRouteRow 복제) ───
          <section className="rounded-xl border border-[#27272A]/60 bg-[#141414] shadow-sm divide-y divide-[#27272A]/30">
            {LOG_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveLogId(item.id)}
                className="group flex min-h-[64px] w-full items-center justify-between gap-5 px-5 py-3 text-left transition-colors hover:bg-[#27272A]/30 cursor-pointer border-none"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[#27272A] text-[#A1A1AA]">
                      <FileText className="size-4" />
                    </span>
                    <p className="truncate text-sm font-semibold text-[#FAFAFA]">{item.heading}</p>
                  </div>
                  <p className="mt-1 text-xs text-[#71717A] pl-11">{item.description}</p>
                </div>
                <ChevronRight className="size-4 text-[#52525B] transition-transform group-hover:translate-x-0.5 shrink-0" />
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
