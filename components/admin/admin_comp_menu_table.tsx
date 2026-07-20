import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { getDrinkSvg } from '../menu_comp_drinksvg';

interface AdminMenuTableProps {
  currentItemsToShow: any[];
  adminCategories: any[];
  selectedMenuIds: number[];
  setSelectedMenuIds: React.Dispatch<React.SetStateAction<number[]>>;
  menuItemsPage: number;
  MENU_ITEMS_PER_PAGE: number;
  totalPages: number;
  setMenuItemsPage: React.Dispatch<React.SetStateAction<number>>;
  handleToggleSignature: (item: any) => Promise<void> | void;
  handleDeleteMenuItem: (id: string) => Promise<void> | void;
  
  // Setters to open the menu item edit modal
  setMenuFormMode: (mode: 'CREATE' | 'EDIT') => void;
  setMenuFormId: (id: string) => void;
  setMenuFormName: (name: string) => void;
  setMenuFormNameKr: (nameKr: string) => void;
  setMenuFormCategory: (category: string) => void;
  setMenuFormImage: (image: string) => void;
  setMenuFormDesc: (desc: string) => void;
  setMenuFormAcidity: (val: number) => void;
  setMenuFormSweetness: (val: number) => void;
  setMenuFormBody: (val: number) => void;
  setMenuFormBitterness: (val: number) => void;
  setMenuFormVisible: (val: boolean) => void;
  setMenuFormIsSignature: (val: boolean) => void;
  setMenuFormVideoUrl: (url: string) => void;
  setIsMenuModalOpen: (open: boolean) => void;
  
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  isLargeImages?: boolean;
  sortByName?: 'NONE' | 'ASC' | 'DESC';
  setSortByName?: React.Dispatch<React.SetStateAction<'NONE' | 'ASC' | 'DESC'>>;
}

export const AdminMenuTable: React.FC<AdminMenuTableProps> = ({
  currentItemsToShow,
  adminCategories,
  selectedMenuIds,
  setSelectedMenuIds,
  menuItemsPage,
  MENU_ITEMS_PER_PAGE,
  totalPages,
  setMenuItemsPage,
  handleToggleSignature,
  handleDeleteMenuItem,
  setMenuFormMode,
  setMenuFormId,
  setMenuFormName,
  setMenuFormNameKr,
  setMenuFormCategory,
  setMenuFormImage,
  setMenuFormDesc,
  setMenuFormAcidity,
  setMenuFormSweetness,
  setMenuFormBody,
  setMenuFormBitterness,
  setMenuFormVisible,
  setMenuFormIsSignature,
  setMenuFormVideoUrl,
  setIsMenuModalOpen,
  renderPagination,
  isLargeImages = false,
  sortByName = 'NONE',
  setSortByName
}) => {
  if (isLargeImages) {
    return (
      <div className="space-y-4">
        {/* Bulk select checkbox bar for visual grid convenience */}
        <div className="flex items-center gap-2 p-2.5 bg-stone-950 border border-stone-900 rounded-xl text-xs select-none">
          <input 
            type="checkbox"
            checked={currentItemsToShow.length > 0 && currentItemsToShow.every(item => selectedMenuIds.includes(item.id))}
            onChange={(e) => {
              if (e.target.checked) {
                const pageIds = currentItemsToShow.map(item => item.id);
                setSelectedMenuIds(prev => Array.from(new Set([...prev, ...pageIds])));
              } else {
                const pageIds = currentItemsToShow.map(item => item.id);
                setSelectedMenuIds(prev => prev.filter(id => !pageIds.includes(id)));
              }
            }}
            className="w-4 h-4 rounded border-stone-800 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer bg-stone-950"
          />
          <span className="font-extrabold text-stone-300">전체 선택</span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {currentItemsToShow.map((item, relativeIdx) => {
            const isSig = item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true;
            const itemIndex = (menuItemsPage - 1) * MENU_ITEMS_PER_PAGE + relativeIdx + 1;
            return (
              <div 
                key={item.id} 
                className="bg-[#0c0a09]/95 rounded-xl border border-stone-900 overflow-hidden shadow-xs flex flex-col group relative"
              >
                {/* Select Checkbox & Index Badge Overlay */}
                <div className="absolute top-2 left-2 z-10 bg-stone-950/90 backdrop-blur-xs px-1.5 py-1 rounded-lg border border-stone-900 flex items-center gap-1.5 shadow-sm">
                  <input 
                    type="checkbox"
                    checked={selectedMenuIds.includes(item.id)}
                    onChange={() => {
                      setSelectedMenuIds(prev => 
                        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                      );
                    }}
                    className="w-3.5 h-3.5 rounded border-stone-800 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer bg-stone-950"
                  />
                  <span className="font-mono text-[9px] font-bold text-stone-400">{itemIndex}</span>
                </div>

                {/* Big Image Section matching menu page aspect ratio */}
                <div className="w-full aspect-[3/4] overflow-hidden relative bg-stone-950/40 flex items-center justify-center border-b border-stone-900 p-1">
                  <img 
                    src={getDrinkSvg(item)} 
                    alt={item.nameKr} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><path d='M17 8h1a4 4 0 1 1 0 8h-1'/><path d='M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z'/><line x1='6' y1='2' x2='6' y2='4'/><line x1='10' y1='2' x2='10' y2='4'/><line x1='14' y1='2' x2='14' y2='4'/></svg>";
                    }}
                  />
                </div>

                {/* Card Details */}
                <div className="p-2 flex-grow flex flex-col justify-between gap-2.5">
                  <div>
                    <div className="font-extrabold text-stone-200 text-xs truncate" title={item.nameKr}>{item.nameKr}</div>
                    <div className="text-[9px] font-mono text-stone-500 uppercase truncate mt-0.5" title={item.name}>{item.name || 'ENG NAME UNSET'}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="font-bold text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase">
                        {adminCategories.find(c => c.id === item.category)?.name || item.category}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                        item.visible ? 'bg-emerald-950/30 text-emerald-450 border-emerald-900/40' : 'bg-stone-900 text-stone-500 border-stone-850'
                      }`}>
                        {item.visible ? '노출 설정 ✓' : '숨김 상태 ✕'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-stone-900">
                    <button
                      onClick={() => handleToggleSignature(item)}
                      className={isSig ? 'dashboard-btn-amber py-1 text-[9px] rounded-lg w-full' : 'dashboard-btn-dark py-1 text-[9px] rounded-lg w-full'}
                    >
                      {isSig ? '시그니처 ★' : '일반 설정'}
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setMenuFormMode('EDIT');
                          setMenuFormId(item.id);
                          setMenuFormName(item.name || '');
                          setMenuFormNameKr(item.nameKr || '');
                          setMenuFormCategory(item.category || 'AMERICANO');
                          setMenuFormImage(item.image || '');
                          setMenuFormDesc(item.description || '');
                          setMenuFormAcidity(item.acidity || 1);
                          setMenuFormSweetness(item.sweetness || 3);
                          setMenuFormBody(item.body || 2);
                          setMenuFormBitterness(item.bitterness || 1);
                          setMenuFormVisible(item.visible === 1 || item.visible === true);
                          setMenuFormIsSignature(item.isSignature === 1 || item.isSignature === true);
                          setMenuFormVideoUrl(item.videoUrl || '');
                          setIsMenuModalOpen(true);
                        }}
                        className="admin-btn-action-edit flex-1 py-1 text-[9px]"
                        title="수정"
                      >
                        <Edit size={11} className="mr-1" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="admin-btn-action-delete flex-1 py-1 text-[9px]"
                        title="삭제"
                      >
                        <Trash2 size={11} className="mr-1" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {renderPagination(menuItemsPage, totalPages, setMenuItemsPage)}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-stone-900 rounded-xl">
      <table className="w-full text-left border-collapse min-w-[800px] text-xs font-sans">
        <thead>
          <tr className="bg-stone-900 border-b border-stone-800 text-stone-400 font-bold uppercase font-sans text-[12px] tracking-wider">
            <th className="py-2.5 px-4 text-center w-28 text-stone-500">
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <input 
                  type="checkbox"
                  checked={currentItemsToShow.length > 0 && currentItemsToShow.every(item => selectedMenuIds.includes(item.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const pageIds = currentItemsToShow.map(item => item.id);
                      setSelectedMenuIds(prev => Array.from(new Set([...prev, ...pageIds])));
                    } else {
                      const pageIds = currentItemsToShow.map(item => item.id);
                      setSelectedMenuIds(prev => prev.filter(id => !pageIds.includes(id)));
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-stone-800 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer bg-stone-950"
                />
                <span>선택 | 순서</span>
              </div>
            </th>
            <th className="py-2.5 px-4 text-center w-28 font-bold">사진</th>
            <th 
              className="py-2.5 px-4 font-bold cursor-pointer select-none hover:text-stone-200 group"
              onClick={() => {
                if (setSortByName) {
                  setSortByName(prev => prev === 'NONE' ? 'ASC' : prev === 'ASC' ? 'DESC' : 'NONE');
                }
              }}
              title="클릭하여 가나다순 정렬"
            >
              <div className="flex items-center gap-1">
                <span>음료명</span>
                {sortByName === 'ASC' && <span className="text-[#C5A059] font-sans font-bold">▲</span>}
                {sortByName === 'DESC' && <span className="text-[#C5A059] font-sans font-bold">▼</span>}
                {sortByName === 'NONE' && <span className="text-stone-600 group-hover:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity font-sans font-bold">▲</span>}
              </div>
            </th>
            <th className="py-2.5 px-4 text-center w-28 font-bold">대표 설정</th>
            <th className="py-2.5 px-4 text-center w-36 font-bold">노출상태</th>
            <th className="py-2.5 px-4 text-center w-36 font-bold">관리 제어</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-900">
          {currentItemsToShow.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-stone-500 font-light">
                해당 카테고리에 할당된 음료 품목이 없습니다. 우측 상단의 [음료 추가하기]로 새 품목을 추가해 보세요.
              </td>
            </tr>
          ) : (
            currentItemsToShow.map((item, relativeIdx) => {
              const itemIndex = (menuItemsPage - 1) * MENU_ITEMS_PER_PAGE + relativeIdx + 1;
              return (
                <tr key={item.id} className="hover:bg-stone-900/40 transition-colors border-b border-stone-900">
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-stone-500 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedMenuIds.includes(item.id)}
                        onChange={() => {
                          setSelectedMenuIds(prev => 
                            prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                          );
                        }}
                        className="w-3.5 h-3.5 rounded border-stone-800 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer bg-stone-950"
                      />
                      <span>{itemIndex}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <img
                      src={item.image || getDrinkSvg(item)}
                      alt={item.nameKr}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><path d='M17 8h1a4 4 0 1 1 0 8h-1'/><path d='M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z'/><line x1='6' y1='2' x2='6' y2='4'/><line x1='10' y1='2' x2='10' y2='4'/><line x1='14' y1='2' x2='14' y2='4'/></svg>";
                      }}
                      className={`${isLargeImages ? 'w-44 h-44' : 'w-20 h-20'} object-contain p-1 rounded-lg border border-stone-900 bg-stone-950 shadow-sm mx-auto transition-all duration-300`}
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-stone-200 text-[13px] whitespace-nowrap">{item.nameKr}</div>
                    <div className="text-[11px] font-sans font-normal text-stone-450 uppercase mt-0.5">{item.name || 'ENG NAME UNSET'}</div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-sans">
                    <button
                      onClick={() => handleToggleSignature(item)}
                      className={
                        (item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true)
                          ? 'dashboard-btn-amber py-0.5 px-2.5 text-[10px] rounded-full'
                          : 'dashboard-btn-dark py-0.5 px-2.5 text-[10px] rounded-full'
                      }
                      title="클릭하여 시그니처 / 일반 메뉴 전환"
                    >
                      {(item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true) ? '시그니처 ★' : '일반'}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-center font-sans">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.visible ? 'bg-emerald-950/40 text-emerald-450 border-emerald-900/40' : 'bg-stone-950/40 text-stone-500 border border-stone-900'
                    }`}>
                      {item.visible ? '노출 설정 ✓' : '숨김 상태 ✕'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setMenuFormMode('EDIT');
                          setMenuFormId(item.id);
                          setMenuFormName(item.name || '');
                          setMenuFormNameKr(item.nameKr || '');
                          setMenuFormCategory(item.category || 'AMERICANO');
                          setMenuFormImage(item.image || '');
                          setMenuFormDesc(item.description || '');
                          setMenuFormAcidity(item.acidity || 1);
                          setMenuFormSweetness(item.sweetness || 3);
                          setMenuFormBody(item.body || 2);
                          setMenuFormBitterness(item.bitterness || 1);
                          setMenuFormVisible(item.visible === 1 || item.visible === true);
                          setMenuFormIsSignature(item.isSignature === 1 || item.isSignature === true);
                          setMenuFormVideoUrl(item.videoUrl || '');
                          setIsMenuModalOpen(true);
                        }}
                        className="admin-btn-action-edit"
                        title="수정"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="admin-btn-action-delete"
                        title="삭제"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {renderPagination(menuItemsPage, totalPages, setMenuItemsPage)}
    </div>
  );
};
