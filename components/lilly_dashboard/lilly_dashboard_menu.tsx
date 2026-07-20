import React, { useState, useMemo } from 'react';
import { WandSparkles, Pencil, Trash2, RefreshCw, X, FileText, Download, Upload, Plus, Search, Trash } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  nameKr: string;
  category: string;
  imageUrl?: string;
  description?: string;
  acidity?: number;
  sweetness?: number;
  body?: number;
  bitterness?: number;
  visible: boolean;
  isSignature?: boolean;
  videoUrl?: string;
  price: number;
  steps?: any;
}

type StepTuple = [string, string | number];

// 릴리 카테고리 한글 변환 매핑 사전
const CATEGORY_MAP: Record<string, string> = {
  'AMERICANO': '아메리카노',
  'COFFEE_LATTE': '에스프레소 라떼',
  'MILK_LATTE': '콜드브루/라떼',
  'ADE_ETC': '에이드/스파클링',
  'ADE': '에이드/스파클링',
  'TEA_BASE': '티/전통차'
};

// 원부자재 한글명 사전 (Lilly getLabel 매핑용)
const INGREDIENT_LABELS: Record<string, string> = {
  'CUP': '컵 종류',
  'COFFEE': '커피 추출',
  'MILK': '우유 추출',
  'WATER': '물 급수',
  'HOT': '온수 급수',
  'ICE': '얼음 공급',
  'SPARKLE': '탄산수 공급',
  'SIRUP1': '시럽1',
  'SIRUP2': '시럽2',
  'SIRUP3': '시럽3',
  'SIRUP4': '시럽4'
};

// 릴리 순정 레시피 요약 문자열 빌더 (getRecipeSummary 100% 이식)
const getRecipeSummary = (item: MenuItem) => {
  const steps = Object.entries(item.steps ?? {})
    .filter((entry): entry is [string, [string, string | number]] =>
      Array.isArray(entry[1])
    )
    .map(([, value]) => `${value[0]}:${value[1]}`)
    .filter((value) => !value.startsWith("NONE:"));

  if (steps.length === 0) return "레시피 없음";
  return steps.join(" / ");
};

const range = (start: number, end: number) =>
  Array.from({ length: Math.max(end - start, 0) }, (_, index) => start + index);

const buildPageModel = (page: number, lastPage: number): (number | "gap")[] => {
  const start = range(1, Math.min(1, lastPage) + 1);
  const end = range(Math.max(lastPage, 1), lastPage + 1);
  const window = range(Math.max(page - 1, 1), Math.min(page + 1, lastPage) + 1);
  const merged = [...new Set([...start, ...window, ...end])].sort(
    (a, b) => a - b,
  );
  const pages: (number | "gap")[] = [];

  merged.forEach((current, index) => {
    const previous = merged[index - 1];
    if (previous != null && current - previous > 1) pages.push("gap");
    pages.push(current);
  });

  return pages;
};

export function LillyDashboardMenu() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 검색, 필터, 페이지네이션 상태
  const [searches, setSearches] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // 상세 레시피 수정 모달 상태 관리 (Lilly 1:1 이식)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [editNameKr, setEditNameKr] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  
  // 릴리 순정 방식의 단계별 레시피 상태 보존
  const [recipeSteps, setRecipeSteps] = useState<[string, StepTuple][]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [newIngredientProtocol, setNewIngredientProtocol] = useState('WATER');

  // 로컬/대시보드의 현재 매장 코드를 안전하게 획득
  const activeStoreCode = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('branch') || 'store075575') : 'store075575';

  // 릴리 자체 DB (SQLite) 정보 실시간 pull 조회
  const loadMenuFromDevice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/remote/v3/menu?storeCode=${activeStoreCode}`);
      if (response.ok) {
        const json = await response.json();
        // 릴리 단말기 데이터를 대칭성(Symmetry) 유지를 위해 100% 순정 그대로 적재
        const mapped = (json.result || []).map((m: any) => ({
          id: m.productNo || m.id,
          name: m.name || '',
          nameKr: m.name || '',
          category: m.category || 'AMERICANO',
          visible: m.isPurchasable === true || Number(m.isPurchasable) === 1 || m.visible === true,
          price: m.price || 0,
          steps: m.steps || {}
        }));
        setMenus(mapped);
      } else {
        const errJson = await response.json().catch(() => ({}));
        alert(`❌ 메뉴 정보 불러오기 실패:\n${errJson.message || '알 수 없는 서버 에러가 발생했습니다.'}`);
      }
    } catch (err: any) {
      console.error('[Dashboard Menu Load Error]', err);
      alert(`❌ 네트워크 통신 장애 발생:\n${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadMenuFromDevice();
  }, [activeStoreCode]);

  // 릴리 순정 규격(MENU_SETTING) 데이터 포맷 변환 헬퍼
  const toLillyFormat = (items: MenuItem[]) => {
    return items.map(m => ({
      productNo: m.id,
      name: m.nameKr || m.name,
      category: m.category,
      isPurchasable: m.visible,
      price: m.price || 0,
      steps: m.steps || {}
    }));
  };

  // 릴리 자체 SQLite DB 및 JSON 설정 덮어쓰기 동기화 격발
  const handleSyncMenu = async (customMenus?: MenuItem[]) => {
    setIsSyncing(true);
    try {
      const targetMenus = customMenus || menus;
      const response = await fetch('/api/remote/v3/menu/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: activeStoreCode, menus: toLillyFormat(targetMenus) })
      });

      if (response.ok) {
        alert('단말기 자체 SQLite DB 및 설정으로 메뉴 동기화가 성공적으로 완료되었습니다!');
      } else {
        const errText = await response.text();
        alert(`메뉴 동기화 전송에 실패했습니다: ${errText}`);
      }
    } catch (err: any) {
      alert(`에러 발생: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 판매 상태 토글 및 즉시 자체 SQLite DB 연동 격발
  const togglePurchasable = async (id: string) => {
    const updated = menus.map(m => m.id === id ? { ...m, visible: !m.visible } : m);
    setMenus(updated);

    try {
      await fetch('/api/remote/v3/menu/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: activeStoreCode, menus: toLillyFormat(updated) })
      });
    } catch (err) {
      console.error('[Realtime Purchasable Sync Failed]', err);
    }
  };

  // 메뉴 삭제 기능 구현 (양방향 반영)
  const handleDeleteMenu = async (id: string) => {
    const confirmDelete = window.confirm('선택하신 메뉴를 삭제하시겠습니까?\n삭제 후에는 기기에서도 제거됩니다.');
    if (!confirmDelete) return;

    const updated = menus.filter(m => m.id !== id);
    setMenus(updated);

    try {
      await fetch('/api/remote/v3/menu/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: activeStoreCode, menus: toLillyFormat(updated) })
      });
    } catch (err) {
      console.error('[Realtime Delete Sync Failed]', err);
    }
  };

  // 메뉴 수정 모달 열기
  const openEditModal = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setEditNameKr(menu.nameKr || menu.name);
    setEditPrice(menu.price || 0);

    // 릴리 순정 스텝 데이터를 가져와서 행 리스트로 변환 기입
    const stepsObj = menu.steps || {};
    const parsedSteps = Object.entries(stepsObj)
      .filter((entry): entry is [string, StepTuple] => Array.isArray(entry[1]))
      .sort((a, b) => {
        // step1, step2 순서대로 정렬
        const numA = parseInt(a[0].replace('step', ''), 10) || 0;
        const numB = parseInt(b[0].replace('step', ''), 10) || 0;
        return numA - numB;
      });
    setRecipeSteps(parsedSteps);
    setIsEditModalOpen(true);
  };

  // 레시피 특정 행 수정 핸들러
  const handleUpdateStepValue = (stepKey: string, protocol: string, nextValue: string | number) => {
    setRecipeSteps(prev => 
      prev.map(([k, val]) => k === stepKey ? [k, [protocol, nextValue]] : [k, val])
    );
  };

  // 레시피 특정 행 삭제 핸들러 (Lilly onDeleteItem 동일)
  const handleDeleteStep = (stepKey: string) => {
    setRecipeSteps(prev => prev.filter(([k]) => k !== stepKey));
  };

  // 신규 원부자재 행 추가 핸들러 (Lilly onAddItem 동일)
  const handleAddRecipeStep = () => {
    const nextIndex = recipeSteps.length + 1;
    const defaultVal = newIngredientProtocol === 'COFFEE' ? 5 : newIngredientProtocol === 'MILK' ? 200 : 100;
    
    setRecipeSteps(prev => [
      ...prev,
      [`step${nextIndex}`, [newIngredientProtocol, defaultVal]]
    ]);
    setIsAddingIngredient(false);
  };

  // 메뉴 정보 저장 및 자체 SQLite DB 연동 격발
  const handleSaveEdit = async () => {
    if (!selectedMenu) return;

    // 단계별 리스트를 다시 원래의 릴리 JSON 오브젝트로 병합 
    const finalSteps: Record<string, StepTuple> = {};
    recipeSteps.forEach(([key, val], idx) => {
      finalSteps[`step${idx + 1}`] = val;
    });

    const updated = menus.map(m => m.id === selectedMenu.id ? { ...m, nameKr: editNameKr, price: editPrice, steps: finalSteps } : m);
    setMenus(updated);
    setIsEditModalOpen(false);

    try {
      await fetch('/api/remote/v3/menu/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: activeStoreCode, menus: toLillyFormat(updated) })
      });
    } catch (err) {
      console.error('[Realtime Edit Sync Failed]', err);
    }
  };

  // 검색 및 필터 가공 처리
  const filteredMenus = useMemo(() => {
    return menus.filter(m => {
      const cleanSearch = searches.toLowerCase().trim();
      const matchSearch = cleanSearch === '' || 
        m.name.toLowerCase().includes(cleanSearch) || 
        m.nameKr.toLowerCase().includes(cleanSearch) || 
        m.id.toLowerCase().includes(cleanSearch);

      const matchStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && m.visible) || 
        (filterStatus === 'inactive' && !m.visible);

      return matchSearch && matchStatus;
    });
  }, [menus, searches, filterStatus]);

  // 카운트 계산
  const totalCount = menus.length;
  const activeCount = menus.filter(m => m.visible).length;
  const inactiveCount = totalCount - activeCount;

  // 페이징 가공 처리
  const totalPages = Math.ceil(filteredMenus.length / PAGE_SIZE) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMenus.slice(start, start + PAGE_SIZE);
  }, [filteredMenus, currentPage]);

  return (
    <div className="flex flex-col gap-0 min-h-0 w-full h-full text-stone-300 font-sans">

      {/* ─── 헤더 (릴리 Header 100% 동일) ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">메뉴 관리</h1>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">매장에서 판매할 메뉴와 레시피 구성을 관리합니다.</p>
          </div>
          {/* 액션 버튼 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadMenuFromDevice}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-[#E4E4E7] text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60 font-sans"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <button
              onClick={() => handleSyncMenu()}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60 font-sans"
            >
              <WandSparkles className="size-3.5" />
              메뉴 동기화
            </button>
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      {/* ─── 콘텐츠 ─── */}
      <div className="mx-auto flex w-full flex-col gap-4.5 px-5 pb-6">

        {/* 1. 필터 및 액션바 영역 (릴리 UI 100% 동일하게 모사) */}
        <section className="flex flex-col gap-3 rounded-xl border border-[#27272A]/60 bg-[#141414] p-4.5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-[#0E0E10] p-1 rounded-lg border border-[#27272A]/50">
              <span className="text-[11px] text-[#71717A] px-2 font-bold font-sans">메뉴 필터</span>
              <button
                onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition-all cursor-pointer font-sans ${
                  filterStatus === 'all'
                    ? 'bg-[#27272A] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                전체 {totalCount}
              </button>
              <button
                onClick={() => { setFilterStatus('active'); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition-all cursor-pointer font-sans ${
                  filterStatus === 'active'
                    ? 'bg-[#27272A] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                판매 중 {activeCount}
              </button>
              <button
                onClick={() => { setFilterStatus('inactive'); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition-all cursor-pointer font-sans ${
                  filterStatus === 'inactive'
                    ? 'bg-[#27272A] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                판매 중지 {inactiveCount}
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer border border-[#27272A]">
                <Upload size={12} />
                가져오기
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer border border-[#27272A]">
                <Download size={12} />
                XLSX
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer">
                <Plus size={12} />
                메뉴 등록
              </button>
            </div>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#71717A]" />
            <input
              type="text"
              value={searches}
              onChange={(e) => { setSearches(e.target.value); setCurrentPage(1); }}
              placeholder="상품번호 또는 상품명 검색"
              className="w-full rounded-lg border border-[#27272A]/80 bg-[#0E0E10] pl-10 pr-4 py-2.5 text-xs text-[#FAFAFA] placeholder-[#71717A] outline-none focus:border-[#FAFAFA]/40 transition-colors font-sans"
            />
          </div>
        </section>

        {/* 2. 메뉴 목록 테이블 영역 */}
        <section className="rounded-xl border border-[#27272A]/60 bg-[#141414] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-[#71717A] text-xs">
                <RefreshCw className="size-4 animate-spin mr-2" />
                단말기 자체 DB에서 메뉴 목록을 로드하는 중...
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-[#71717A] text-xs">
                검색 조건에 맞는 등록된 메뉴가 존재하지 않습니다.
              </div>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#18181B]/60 border-b border-[#27272A]/40 select-none">
                    <th className="px-4.5 py-3 text-xs font-bold text-[#71717A] text-left w-[64%] font-sans">메뉴</th>
                    <th className="px-4.5 py-3 text-xs font-bold text-[#71717A] text-center w-[18%] font-sans">판매 상태</th>
                    <th className="px-4.5 py-3 text-xs font-bold text-[#71717A] text-center w-[18%] font-sans">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(menu => (
                    <tr key={menu.id} className="border-b border-[#27272A]/20 hover:bg-[#1A1A1C] transition-colors">
                      <td className="px-4.5 py-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-[#FAFAFA] font-sans">
                            {menu.nameKr || menu.name}{" "}
                            <span className="font-normal text-[#71717A] text-xs">
                              ({menu.id})
                            </span>
                          </p>
                          <p className="mt-1 font-mono text-[10.5px] text-[#71717A] truncate">
                            {getRecipeSummary(menu)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4.5 py-3.5 text-center">
                        <button
                          onClick={() => togglePurchasable(menu.id)}
                          className={`px-3 py-1 rounded-full text-[10.5px] font-black transition-colors cursor-pointer font-sans shadow-sm ${
                            menu.visible
                              ? 'bg-white hover:bg-zinc-100 text-zinc-900'
                              : 'bg-[#27272A] hover:bg-[#3F3F46] text-[#71717A]'
                          }`}
                        >
                          {menu.visible ? '판매 중' : '판매 중단'}
                        </button>
                      </td>
                      <td className="px-4.5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(menu)}
                            className="p-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-all active:scale-95 cursor-pointer border border-[#27272A]"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(menu.id)}
                            className="p-1.5 rounded-lg bg-[#27272A] hover:bg-rose-950/20 text-[#A1A1AA] hover:text-rose-400 transition-all active:scale-95 cursor-pointer border border-[#27272A]"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* 3. 페이지네이션 영역 */}
        {!isLoading && filteredMenus.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 py-2 select-none">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs text-[#A1A1AA] hover:text-white disabled:text-[#71717A] disabled:hover:text-[#71717A] transition-all cursor-pointer font-sans font-bold"
            >
              이전
            </button>
            
            {buildPageModel(currentPage, totalPages).map((pageItem, index) =>
              pageItem === "gap" ? (
                <span key={`gap-${index}`} className="text-xs text-[#71717A] px-1 font-bold select-none">
                  ...
                </span>
              ) : (
                <button
                  key={pageItem}
                  onClick={() => setCurrentPage(pageItem)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                    currentPage === pageItem
                      ? 'bg-[#27272A] text-[#FAFAFA] font-extrabold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {pageItem}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-xs text-[#A1A1AA] hover:text-white disabled:text-[#71717A] disabled:hover:text-[#71717A] transition-all cursor-pointer font-sans font-bold"
            >
              다음
            </button>
          </div>
        )}

      </div>

      {/* ─── 메뉴 상세 수정 & 레시피 에디터 모달 (Lilly UI 100% 동일하게 모사) ─── */}
      {isEditModalOpen && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-[#27272A] bg-[#141414] p-6 shadow-2xl text-stone-300">
            
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between border-b border-[#27272A]/80 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4.5 text-white" />
                <h3 className="text-base font-bold text-[#FAFAFA]">레시피 및 메뉴 편집</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded p-1 hover:bg-[#27272A] text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="mt-4 flex flex-col gap-4 max-h-[62vh] overflow-y-auto pr-1">
              
              {/* 1. 기본 정보 섹션 */}
              <div className="flex flex-col gap-3 rounded-lg border border-[#27272A]/50 bg-[#0E0E10] p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">기본 정보</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#71717A]">상품 코드</label>
                    <input
                      type="text"
                      value={selectedMenu.id}
                      disabled
                      className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#71717A] outline-none select-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#71717A]">카테고리</label>
                    <input
                      type="text"
                      value={CATEGORY_MAP[selectedMenu.category] || selectedMenu.category}
                      disabled
                      className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#71717A] outline-none select-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA]">메뉴 이름 (한글)</label>
                  <input
                    type="text"
                    value={editNameKr}
                    onChange={(e) => setEditNameKr(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#27272A] bg-[#1A1A1C] px-3 py-2 text-xs text-[#FAFAFA] outline-none focus:border-[#FAFAFA]/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA]">메뉴 가격 (원)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-[#27272A] bg-[#1A1A1C] px-3 py-2 text-xs text-[#FAFAFA] outline-none focus:border-[#FAFAFA]/40 transition-colors"
                  />
                </div>
              </div>

              {/* 2. 레시피 구성 섹션 (릴리 MenuRecipeEditorView 1:1 대응) */}
              <div className="flex flex-col gap-3 rounded-lg border border-[#27272A]/50 bg-[#0E0E10] p-4">
                <div className="flex items-center justify-between border-b border-[#27272A]/40 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">레시피 구성</h4>
                    <p className="text-[10px] text-[#71717A] mt-0.5">추출 프로토콜과 값을 조합합니다.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingIngredient(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-[10.5px] font-bold rounded transition-colors cursor-pointer border border-[#27272A]"
                  >
                    <Plus size={11} />
                    원부자재 추가
                  </button>
                </div>

                {/* 원부자재 추가 팝업 입력창 */}
                {isAddingIngredient && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141416] border border-[#27272A] mt-1">
                    <select
                      value={newIngredientProtocol}
                      onChange={(e) => setNewIngredientProtocol(e.target.value)}
                      className="flex-1 rounded border border-[#27272A] bg-[#0E0E10] px-2.5 py-1 text-xs text-white outline-none"
                    >
                      <option value="WATER">물 급수 (WATER)</option>
                      <option value="HOT">온수 급수 (HOT)</option>
                      <option value="COFFEE">커피 추출 (COFFEE)</option>
                      <option value="MILK">우유 추출 (MILK)</option>
                      <option value="ICE">얼음 공급 (ICE)</option>
                      <option value="SPARKLE">탄산수 공급 (SPARKLE)</option>
                      <option value="SIRUP1">시럽1 (SIRUP1)</option>
                      <option value="SIRUP2">시럽2 (SIRUP2)</option>
                      <option value="SIRUP3">시럽3 (SIRUP3)</option>
                      <option value="SIRUP4">시럽4 (SIRUP4)</option>
                    </select>
                    <button
                      onClick={handleAddRecipeStep}
                      className="px-2.5 py-1 bg-white text-zinc-950 text-[11px] font-bold rounded cursor-pointer transition-transform active:scale-95"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => setIsAddingIngredient(false)}
                      className="px-2.5 py-1 bg-[#27272A] text-[#A1A1AA] text-[11px] font-bold rounded cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                )}

                {/* 단계별 리스트 렌더러 (MenuRecipeEditor 1:1 대응) */}
                <div className="flex flex-col divide-y divide-[#27272A]/40 mt-1">
                  {recipeSteps.map(([key, [protocol, val]]) => {
                    if (protocol === 'NONE') return null;
                    return (
                      <div key={key} className="flex items-center justify-between py-2.5 gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#FAFAFA]">{INGREDIENT_LABELS[protocol] || protocol}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#27272A] text-[9.5px] font-mono text-[#A1A1AA] uppercase">{protocol}</span>
                          </div>
                          <p className="text-[10px] text-[#71717A] mt-0.5">추출 제어 명령값 설정</p>
                        </div>
                        
                        {/* 상세 입력 장치 (MenuRecipeEditorInput 1:1 대칭 구현) */}
                        <div className="flex items-center gap-2 shrink-0">
                          {protocol === 'CUP' ? (
                            <select
                              value={String(val)}
                              onChange={(e) => handleUpdateStepValue(key, protocol, e.target.value)}
                              className="rounded border border-[#27272A] bg-[#141416] px-2 py-1 text-xs text-white outline-none w-28"
                            >
                              <option value="ICE">ICE</option>
                              <option value="HOT">HOT</option>
                              <option value="NONE">NONE</option>
                            </select>
                          ) : protocol === 'COFFEE' ? (
                            <select
                              value={String(val)}
                              onChange={(e) => handleUpdateStepValue(key, protocol, Number(e.target.value))}
                              className="rounded border border-[#27272A] bg-[#141416] px-2 py-1 text-xs text-white outline-none w-28 font-mono"
                            >
                              {/* WMF 추출 규격 버튼 리스트 */}
                              {[5, 15, 1, 11, 2, 12, 3, 13, 4, 16].map(btn => (
                                <option key={btn} value={btn}>{btn}번 추출버튼</option>
                              ))}
                            </select>
                          ) : protocol === 'MILK' ? (
                            <select
                              value={String(val)}
                              onChange={(e) => handleUpdateStepValue(key, protocol, Number(e.target.value))}
                              className="rounded border border-[#27272A] bg-[#141416] px-2 py-1 text-xs text-white outline-none w-28 font-mono"
                            >
                              {[5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map(btn => (
                                <option key={btn} value={btn}>{btn}번 밀크버튼</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => handleUpdateStepValue(key, protocol, Number(e.target.value))}
                              className="rounded border border-[#27272A] bg-[#141416] px-2 py-1 text-xs text-white outline-none w-28 text-right font-mono"
                            />
                          )}

                          {protocol !== 'CUP' && (
                            <button
                              onClick={() => handleDeleteStep(key)}
                              className="p-1.5 rounded hover:bg-rose-950/20 text-[#71717A] hover:text-rose-400 transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 모달 푸터 */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#27272A]/60 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer font-sans"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer font-sans"
              >
                레시피 저장 및 적용
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
