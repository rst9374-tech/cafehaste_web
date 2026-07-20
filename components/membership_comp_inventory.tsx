import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  statusName: string;
  name: string;
  type: string;
  amount: number;
  maxAmount: number;
  ratio: number;
  protocol: string;
  stockManagement: boolean;
}

interface InventoryData {
  stocks: Record<string, number>;
  max: Record<string, number>;
  ratio: Record<string, number>;
  items?: InventoryItem[];
}

// 릴리 오리지널 카테고리 메뉴 스펙 이식
const INVENTORY_MENU = ["CUP", "SYRUPS", "WATER", "COFFEE", "BEAN", "MILK"];
const INVENTORY_MENU_KR: Record<string, string> = {
  CUP: "컵",
  SYRUPS: "시럽",
  WATER: "물",
  COFFEE: "커피",
  BEAN: "원두",
  MILK: "우유",
};

export const MembershipCompInventory: React.FC<{ storeCode: string }> = ({ storeCode }) => {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(INVENTORY_MENU[0]);

  const fetchInventoryData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/remote/inventory?storeCode=${storeCode}`);
      if (!response.ok) {
        throw new Error(`서버 응답 실패 (HTTP: ${response.status})`);
      }
      const data = await response.json();
      if (data.success && data.result) {
        setInventory(data.result);
      } else {
        setErrorMsg(data.message || '재고 데이터를 분석하지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err);
      setErrorMsg(err.message || '매장 릴리 데몬 또는 백엔드 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // [HASTE 임시 제어 우회 수정 지점] Rule 13 준수: setInterval 폴링 제거 → 마운트 시 1회 온디맨드 호출
    // 원복 주소: hat.md/operations/operation_lilly_production_restore.md
    if (storeCode) {
      fetchInventoryData();
    }
  }, [storeCode]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInventoryData();
  };

  // [HASTE 임시 제어 우회 수정 지점] E2E 패스스루 원칙 준수: items[].type 직접 사용
  // 근거: system_integration_three_axis_network.md §5 "번역/매핑 차단"
  // 원복 주소: hat.md/operations/operation_lilly_production_restore.md
  const getSelectedItems = (): InventoryItem[] => {
    if (!inventory?.items) return [];
    return inventory.items.filter(item => item.type === selectedType);
  };

  const selectedItems = getSelectedItems();
  // 관리 대상 항목: stockManagement === true 인 항목만 집계 (릴리 UI 기준 동일)
  const managedItems = selectedItems.filter(item => item.stockManagement);
  const totalAmount = managedItems.reduce((sum, item) => sum + item.amount, 0);
  const totalMax = managedItems.reduce((sum, item) => sum + item.maxAmount, 0);
  const capacityLabel = totalMax > 0 ? `${Math.round((totalAmount / totalMax) * 100)}%` : "-";

  return (
    <div 
      className="h-[960px] max-h-[960px] bg-[#070609]/95 border border-stone-900 rounded-2xl p-4 md:p-5 text-stone-300 font-sans shadow-lg text-left flex flex-col gap-4 overflow-y-hidden mx-auto"
      style={{ width: '940px', minWidth: '940px', maxWidth: '940px' }}
    >
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stone-900 pb-2 mb-1 select-none">
        <span className="text-[10.5px] font-sans font-bold text-[#C5A059] tracking-wider uppercase flex items-center gap-1.5">
          <Archive className="w-3 h-3 text-[#C5A059]" />
          03-1 REALTIME WAREHOUSE & INGREDIENT INVENTORY
        </span>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="p-1 bg-[#121118]/80 border border-stone-900 rounded-md hover:bg-stone-900 transition-all text-[#C5A059] active:scale-95 cursor-pointer shadow-md flex items-center justify-center w-6 h-6 disabled:opacity-40"
          >
            <RefreshCw size={10} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${inventory ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${inventory ? 'text-emerald-500' : 'text-amber-500'}`}>
              {inventory ? 'TELEMETRY SYNCED' : 'AWAITING LINK'}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11.5px] text-stone-400 font-light leading-relaxed mb-1.5">
        매장 내 실물 릴리 에이전트 및 컵 디스펜서 센서 기판으로부터 수집된 원재료 잔여 수량 및 원부자재 실재고 현황을 실시간 가시화합니다.
      </p>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-800 border-t-[#C5A059] animate-spin" />
          <span className="text-[10.5px] font-mono text-stone-500 uppercase tracking-widest">LOADING REALTIME TELEMETRY...</span>
        </div>
      )}

      {/* 에러 상태 */}
      {!isLoading && errorMsg && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center gap-4 bg-[#111015] border border-stone-900 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-lg">
            <AlertTriangle size={22} className="animate-bounce" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-[13px] font-bold text-stone-200">원격 실재고 수집 실패</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed break-all">
              {errorMsg}
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleRefresh}
            className="px-4 py-1.5 bg-[#C5A059] hover:bg-[#b08e4d] text-black text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <RefreshCw size={11} />
            원격 서버 재노크
          </button>
        </div>
      )}

      {/* 정상 수신 렌더링 - 릴리 오리지널 레이아웃 100% 복제 */}
      {!isLoading && !errorMsg && inventory && (
        <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-stone-900 bg-[#111015]/40 shadow-xs">
          
          {/* 카테고리 설명 및 상단 요약 메트릭 그리드 (릴리 UI 완전 일치) */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b border-stone-900/60 bg-[#111015]/80">
            <div>
              <h2 className="text-xs font-bold text-stone-200 uppercase tracking-wide">카테고리</h2>
              <p className="mt-0.5 text-[10.5px] text-stone-500">선택한 재고군의 현재 상태입니다.</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-stone-900 rounded-lg border border-stone-900 bg-[#070609] text-right">
              <div className="min-w-16 px-3 py-1.5">
                <p className="text-[9.5px] font-medium text-stone-500">항목</p>
                <p className="mt-0.5 text-xs font-bold text-stone-200">{selectedItems.length}</p>
              </div>
              <div className="min-w-16 px-3 py-1.5">
                <p className="text-[9.5px] font-medium text-stone-500">관리</p>
                <p className="mt-0.5 text-xs font-bold text-stone-200">{managedItems.length}</p>
              </div>
              <div className="min-w-16 px-3 py-1.5">
                <p className="text-[9.5px] font-medium text-stone-500">적재율</p>
                <p className="mt-0.5 text-xs font-bold text-[#C5A059]">{capacityLabel}</p>
              </div>
            </div>
          </div>

          {/* 탭 리스트 (릴리 UI 완전 일치) */}
          <div className="px-3 py-3 border-b border-stone-900/60 bg-[#111015]/20">
            <div className="flex flex-wrap gap-1.5">
              {INVENTORY_MENU.map((menu) => {
                const isSelected = selectedType === menu;
                const itemsCount = (inventory.items ?? []).filter(i => i.type === menu).length;
                return (
                  <button
                    key={menu}
                    type="button"
                    onClick={() => setSelectedType(menu)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#C5A059] text-black border-[#C5A059] font-black'
                        : 'bg-[#18171E] text-stone-400 border-stone-900 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    <span>{INVENTORY_MENU_KR[menu] || menu}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                      isSelected ? 'bg-black/15 text-black' : 'bg-stone-900 text-stone-500'
                    }`}>
                      {itemsCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 재고 정보 테이블 (릴리 UI 100% 복제) */}
          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead className="sticky top-0 z-10 bg-[#0e0e12] border-b border-stone-900 select-none">
                <tr className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4 w-[34%]">품목 / 프로토콜</th>
                  <th className="py-2.5 px-2 w-[18%] text-right">현재량</th>
                  <th className="py-2.5 px-2 w-[16%] text-right">최대</th>
                  <th className="py-2.5 px-2 w-[18%] text-center">빠른 작업</th>
                  <th className="py-2.5 px-4 w-[14%] text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900/60 bg-[#070609]/20">
                {selectedItems.map((item) => {
                  const isWarning = item.ratio <= 15;
                  return (
                    <tr key={item.statusName} className="hover:bg-stone-900/20 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-bold text-stone-200">{item.name}</p>
                          <p className="mt-0.5 font-mono text-[9px] text-stone-600 tracking-wider">{item.protocol}</p>
                        </div>
                      </td>
                      <td className={`py-3.5 px-2 text-right font-mono text-[12px] font-bold ${isWarning ? 'text-rose-500 animate-pulse font-black' : 'text-stone-300'}`}>
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono text-[12px] text-stone-600">
                        {item.maxAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`[재고 보충 알림] 매장의 ${item.name} 재고 채우기가 무선으로 전달되었습니다. (실물 리필 유상옵션 준비중)`)}
                          className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#C5A059]/10 hover:bg-[#C5A059]/30 text-[#C5A059] border border-[#C5A059]/20 transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center h-5"
                        >
                          채우기
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          isWarning 
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                            : 'bg-stone-900 text-stone-500 border border-stone-850'
                        }`}>
                          {isWarning ? '품절 임박' : '정상 관리'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {selectedItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-600 font-mono tracking-widest select-none">
                      NO ACTIVE STOCK ITEMS IN THIS CATEGORY
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
      )}

    </div>
  );
};
