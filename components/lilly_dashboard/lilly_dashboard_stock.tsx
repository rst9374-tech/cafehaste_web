import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, AlertTriangle } from 'lucide-react';

interface InventoryData {
  stocks: Record<string, number>;
  max: Record<string, number>;
  ratio: Record<string, number>;
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

export function LillyDashboardStock({ storeCode }: { storeCode: string }) {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [editStocks, setEditStocks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(INVENTORY_MENU[0]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
        // 편집용 임시 상태 초기화
        setEditStocks(data.result.stocks || {});
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
    if (storeCode) {
      fetchInventoryData();
      const timer = setInterval(() => {
        fetchInventoryData(true);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [storeCode]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInventoryData();
  };

  const handleStockChange = (name: string, value: number) => {
    setEditStocks(prev => ({
      ...prev,
      [name]: Math.max(0, value)
    }));
  };

  const handleSaveStocks = async () => {
    if (!storeCode) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/remote/inventory/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode, stocks: editStocks })
      });
      const data = await response.json();
      if (data.success) {
        alert('매장 릴리 재고 정보가 성공적으로 업데이트 및 동기화되었습니다.');
        fetchInventoryData(true);
      } else {
        alert(data.message || '재고 정보 저장 실패');
      }
    } catch (err: any) {
      alert('재고 동기화 중 통신 장애가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 릴리 원본 품목 카테고리 매핑 함수
  const resolveItemCategory = (itemName: string): string => {
    const name = itemName.toLowerCase();
    if (name.includes('컵')) return 'CUP';
    if (name.includes('시럽')) return 'SYRUPS';
    if (name.includes('탄산수') || name.includes('물')) return 'WATER';
    if (name.includes('커피')) return 'COFFEE';
    if (name.includes('원두')) return 'BEAN';
    if (name.includes('우유')) return 'MILK';
    return 'CUP'; // 기본값
  };

  // 릴리 프로토콜 매핑 헬퍼
  const resolveItemProtocol = (itemName: string, category: string): string => {
    const cleanName = itemName.replace(/\s/g, '').toUpperCase();
    return `${category}_${cleanName}`;
  };

  // 전체 데이터 중 현재 선택된 탭에 속하는 아이템 필터링
  const getSelectedItems = () => {
    if (!inventory) return [];
    return Object.keys(inventory.stocks)
      .map(key => ({
        name: key,
        amount: editStocks[key] ?? inventory.stocks[key],
        maxAmount: inventory.max[key] || 100,
        ratio: inventory.ratio[key] || 0,
        category: resolveItemCategory(key),
        protocol: resolveItemProtocol(key, resolveItemCategory(key))
      }))
      .filter(item => item.category === selectedType);
  };

  const selectedItems = getSelectedItems();
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const maxAmount = selectedItems.reduce((sum, item) => sum + item.maxAmount, 0);
  const capacityLabel = maxAmount > 0 ? `${Math.round((totalAmount / maxAmount) * 100)}%` : "-";

  return (
    <div className="flex flex-col gap-0 min-h-0 text-[#E4E4E7] font-sans text-left w-full h-full">
      
      {/* ─── 헤더 (릴리 Header 100% 동일화) ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">재고 관리</h1>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">프로토콜별 재고 상태와 적재량을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg bg-[#18181B]/80 border border-[#27272A]/80 text-[#A1A1AA] hover:text-[#C5A059] hover:border-[#C5A059]/50 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="대시보드 새로고침"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <div className="flex items-center gap-1.5 bg-[#18181B] border border-[#27272A]/80 px-2 py-1 rounded-md">
              <span className={`w-1.5 h-1.5 rounded-full ${inventory ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${inventory ? 'text-emerald-500' : 'text-amber-500'}`}>
                {inventory ? 'TELEMETRY SYNCED' : 'AWAITING LINK'}
              </span>
            </div>
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      {/* ─── 콘텐츠 (릴리 인셋 레이아웃) ─── */}
      <div className="mx-auto flex w-full max-w-[892px] flex-col gap-3 px-5 pb-6">

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 w-full border border-[#27272A]/60 bg-[#141414] rounded-xl shadow-sm">
            <div className="w-8 h-8 rounded-full border-2 border-[#27272A] border-t-[#C5A059] animate-spin" />
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">LOADING REALTIME TELEMETRY...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {!isLoading && errorMsg && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4 border border-[#27272A]/60 bg-[#141414] rounded-xl shadow-sm w-full">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-lg">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h4 className="text-[13px] font-bold text-[#E4E4E7]">원격 실재고 수집 실패</h4>
              <p className="text-[11px] text-[#71717A] leading-relaxed break-all">
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
          <div className="flex flex-col gap-3.5 w-full">
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#27272A]/60 bg-[#141414] shadow-sm w-full">
              
              {/* 카테고리 설명 및 상단 요약 메트릭 그리드 (릴리 UI 완전 일치) */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b border-[#27272A]/40 bg-[#141414]">
                <div>
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">카테고리</h2>
                  <p className="mt-1 text-xs text-[#71717A]">선택한 재고군의 현재 상태입니다.</p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-[#27272A]/50 rounded-lg border border-[#27272A]/50 bg-[#0E0E10] text-right">
                  <div className="min-w-20 px-3 py-2">
                    <p className="text-xs font-medium text-[#71717A]">항목</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#FAFAFA]">{selectedItems.length}</p>
                  </div>
                  <div className="min-w-20 px-3 py-2">
                    <p className="text-xs font-medium text-[#71717A]">관리</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#FAFAFA]">{selectedItems.length}</p>
                  </div>
                  <div className="min-w-20 px-3 py-2">
                    <p className="text-xs font-medium text-[#71717A]">적재율</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#C5A059]">{capacityLabel}</p>
                  </div>
                </div>
              </div>

              {/* 탭 리스트 (릴리 둥근 캡슐 및 투명 배경 스타일 완전 동일화) */}
              <div className="px-3 py-3 border-b border-[#27272A]/40">
                <div className="flex flex-wrap gap-1.5 bg-[#0C0A0F] border border-[#27272A]/60 rounded-xl p-1 w-fit">
                  {INVENTORY_MENU.map((menu) => {
                    const isSelected = selectedType === menu;
                    const catItems = Object.keys(inventory.stocks).map(key => ({
                      name: key,
                      amount: editStocks[key] ?? inventory.stocks[key],
                      maxAmount: inventory.max[key] || 100,
                      ratio: inventory.ratio[key] || 0,
                      category: resolveItemCategory(key)
                    })).filter(item => item.category === menu);
                    
                    const totalCount = catItems.length;
                    const normalCount = catItems.filter(item => item.ratio > 15).length;

                    return (
                      <button
                        key={menu}
                        type="button"
                        onClick={() => setSelectedType(menu)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-stone-950 font-black shadow-sm'
                            : 'bg-transparent text-stone-400 font-bold hover:text-[#E4E4E7]'
                        }`}
                      >
                        <span>{INVENTORY_MENU_KR[menu] || menu}</span>
                        <span className="text-[10px] opacity-80 ml-0.5">
                          {normalCount}/{totalCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 재고 정보 테이블 (릴리 인풋 폼 및 톤앤매너 100% 동일화) */}
              <div className="overflow-y-auto max-h-[500px]">
                <table className="w-full border-collapse text-sm text-left">
                  <thead className="sticky top-0 z-10 bg-[#18181B] border-b border-[#27272A]/40 select-none">
                    <tr className="text-[#71717A] font-semibold text-xs">
                      <th className="px-4 py-2.5 w-[34%]">품목 / 프로토콜</th>
                      <th className="px-2 py-2.5 w-[18%] text-center">현재량</th>
                      <th className="px-2 py-2.5 w-[16%] text-center">최대</th>
                      <th className="px-2 py-2.5 w-[18%] text-center">빠른 작업</th>
                      <th className="px-4 py-2.5 w-[14%] text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]/20">
                    {selectedItems.map((item) => {
                      const isWarning = item.ratio <= 15;
                      return (
                        <tr key={item.name} className="hover:bg-[#1A1A1C] transition-colors">
                          <td className="px-4 py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#FAFAFA]">{item.name}</p>
                              <p className="mt-0.5 font-mono text-xs text-[#71717A]">{item.protocol}</p>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="number"
                              value={editStocks[item.name] ?? item.amount}
                              onChange={(e) => handleStockChange(item.name, Number(e.target.value))}
                              className={`w-20 px-2 py-1 bg-stone-950 border border-stone-800 rounded-lg text-center font-bold font-mono text-sm focus:outline-none focus:border-[#C5A059] transition-all ${
                                isWarning ? 'text-rose-500 border-rose-500/30' : 'text-[#FAFAFA]'
                              }`}
                            />
                          </td>
                          <td className="px-2 py-3 text-center font-mono text-sm text-[#71717A]">
                            {item.maxAmount.toLocaleString()}
                          </td>
                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                handleStockChange(item.name, item.maxAmount);
                              }}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-[#27272A] text-[#A1A1AA] hover:bg-white hover:text-zinc-900 transition-all active:scale-95 cursor-pointer"
                            >
                              채우기
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                              isWarning 
                                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500' 
                                : 'bg-[#27272A] text-[#71717A]'
                            }`}>
                              {isWarning ? '품절 임박' : '정상 관리'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {selectedItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-[#71717A] font-mono tracking-widest select-none">
                          NO ACTIVE STOCK ITEMS IN THIS CATEGORY
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            
            {/* 우측 하단 저장 버튼 추가 */}
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleSaveStocks}
                disabled={isSaving}
                className="px-6 py-2 bg-white hover:bg-stone-200 text-stone-950 text-xs font-black rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
