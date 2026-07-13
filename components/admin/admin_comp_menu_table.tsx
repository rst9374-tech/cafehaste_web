import React from 'react';
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
        <div className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs select-none">
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
            className="w-4 h-4 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
          />
          <span className="font-extrabold text-stone-700">전체 선택</span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {currentItemsToShow.map((item, relativeIdx) => {
            const isSig = item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true;
            const itemIndex = (menuItemsPage - 1) * MENU_ITEMS_PER_PAGE + relativeIdx + 1;
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs flex flex-col group relative"
              >
                {/* Select Checkbox & Index Badge Overlay */}
                <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-1.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1.5 shadow-sm">
                  <input 
                    type="checkbox"
                    checked={selectedMenuIds.includes(item.id)}
                    onChange={() => {
                      setSelectedMenuIds(prev => 
                        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                      );
                    }}
                    className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                  />
                  <span className="font-mono text-[9px] font-bold text-stone-500">{itemIndex}</span>
                </div>

                {/* Big Image Section matching menu page aspect ratio */}
                <div className="w-full aspect-[3/4] overflow-hidden relative bg-stone-50 flex items-center justify-center border-b border-stone-100 p-1">
                  <img 
                    src={getDrinkSvg(item)} 
                    alt={item.nameKr} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Card Details */}
                <div className="p-2 flex-grow flex flex-col justify-between gap-2.5">
                  <div>
                    <div className="font-extrabold text-stone-900 text-xs truncate" title={item.nameKr}>{item.nameKr}</div>
                    <div className="text-[9px] font-mono text-stone-400 uppercase truncate mt-0.5" title={item.name}>{item.name || 'ENG NAME UNSET'}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="font-bold text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase">
                        {adminCategories.find(c => c.id === item.category)?.name || item.category}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        item.visible ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-400'
                      }`}>
                        {item.visible ? '노출 설정 ✓' : '숨김 상태 ✕'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
                    <button
                      onClick={() => handleToggleSignature(item)}
                      className={`w-full py-1 rounded text-[9px] font-bold border transition-all cursor-pointer text-center ${
                        isSig 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-stone-50 text-stone-400 border-stone-200'
                      }`}
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
                        className="flex-1 py-1 text-[9px] font-bold bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-850 rounded transition-colors cursor-pointer text-center"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="flex-1 py-1 text-[9px] font-bold bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 rounded transition-colors cursor-pointer text-center"
                      >
                        삭제
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
    <div className="overflow-x-auto border border-stone-200 rounded-xl">
      <table className="w-full text-left border-collapse min-w-[800px] text-xs font-sans">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase font-sans text-[10px] tracking-wider">
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
                  className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                />
                <span>선택 | 순서</span>
              </div>
            </th>
            <th className="py-2.5 px-4 text-center w-28 font-bold">사진 (IMAGE)</th>
            <th 
              className="py-2.5 px-4 font-bold cursor-pointer select-none hover:text-stone-900 group"
              onClick={() => {
                if (setSortByName) {
                  setSortByName(prev => prev === 'NONE' ? 'ASC' : prev === 'ASC' ? 'DESC' : 'NONE');
                }
              }}
              title="클릭하여 가나다순 정렬"
            >
              <div className="flex items-center gap-1">
                <span>음료명 (NAME)</span>
                {sortByName === 'ASC' && <span className="text-[#C5A059] font-sans font-bold">▲</span>}
                {sortByName === 'DESC' && <span className="text-[#C5A059] font-sans font-bold">▼</span>}
                {sortByName === 'NONE' && <span className="text-stone-300 group-hover:text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity font-sans font-bold">▲</span>}
              </div>
            </th>
            <th className="py-2.5 px-4 font-bold">소속 카테고리 (CATEGORY)</th>
            <th className="py-2.5 px-4 text-center w-28 font-bold">대표 설정 (SIGNATURE)</th>
            <th className="py-2.5 px-4 text-center w-36 font-bold">노출상태 (VISIBILITY)</th>
            <th className="py-2.5 px-4 text-center w-36 font-bold">관리 제어</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-150">
          {currentItemsToShow.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-stone-500 font-light">
                해당 카테고리에 할당된 음료 품목이 없습니다. 우측 상단의 [음료 추가하기]로 새 품목을 추가해 보세요.
              </td>
            </tr>
          ) : (
            currentItemsToShow.map((item, relativeIdx) => {
              const itemIndex = (menuItemsPage - 1) * MENU_ITEMS_PER_PAGE + relativeIdx + 1;
              return (
                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
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
                        className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                      />
                      <span>{itemIndex}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <img
                      src={getDrinkSvg(item)}
                      alt={item.nameKr}
                      referrerPolicy="no-referrer"
                      className={`${isLargeImages ? 'w-44 h-44' : 'w-20 h-20'} object-contain p-1 rounded-lg border border-stone-250 bg-stone-150 shadow-sm mx-auto transition-all duration-300`}
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-extrabold text-stone-955 text-xs whitespace-nowrap">{item.nameKr}</div>
                    <div className="text-[9px] font-mono text-stone-400 uppercase mt-0.5">{item.name || 'ENG NAME UNSET'}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded inline-block text-[10px] font-mono uppercase">
                      {adminCategories.find(c => c.id === item.category)?.name || item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-sans">
                    <button
                      onClick={() => handleToggleSignature(item)}
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        (item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true)
                          ? 'bg-amber-100 text-amber-850 border-amber-300 hover:bg-amber-200'
                          : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200 hover:text-stone-600'
                      }`}
                      title="클릭하여 시그니처 / 일반 메뉴 전환"
                    >
                      {(item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true) ? '시그니처 ★' : '일반 메뉴'}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-center font-sans">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.visible ? 'bg-emerald-100 text-emerald-850' : 'bg-stone-140 text-stone-400'
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
                        className="p-1 px-2.5 text-[10px] font-bold bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-850 rounded-md transition-colors cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-1 px-2.5 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 rounded-md transition-colors cursor-pointer"
                      >
                        삭제
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
