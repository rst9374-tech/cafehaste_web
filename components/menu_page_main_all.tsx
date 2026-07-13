import React, { useState, useEffect } from 'react';
import { Sparkles, Play, ShieldAlert } from 'lucide-react';

// Import submodules and shared types
import { MenuCustomizeModal } from './menu_modal_customize';
import { MenuDrawerCart } from './menu_drawer_cart';
import type { MenuItem, CartItem } from './menu_types';
import { getDrinkSvg, handleImageError } from './menu_types';
import { MENU_CATEGORIES } from '../src/menuData';

interface HasteMenuAllProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  defaultPickupBranch: string;
  onCheckout: () => void;
  isMobile?: boolean;
  useMobileCompact?: boolean;
  selectedMenuItemId?: string | null;
  setSelectedMenuItemId?: (id: string | null) => void;
}

export const HasteMenuAll: React.FC<HasteMenuAllProps> = ({ 
  cart, 
  setCart, 
  defaultPickupBranch, 
  onCheckout,
  isMobile = false,
  useMobileCompact = false,
  selectedMenuItemId = null,
  setSelectedMenuItemId
}) => {
  const [selectedBean, setSelectedBean] = useState<'ALL' | 'S' | 'D' | 'P'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [temp, setTemp] = useState<'ICE' | 'HOT'>('ICE');
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const categories = MENU_CATEGORIES;

  // Fetch items once on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/menu-items-all');
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setMenuItems(data.items);
        }
      } catch (err) {
        console.error('Failed to load menu all items:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedMenuItemId && menuItems.length > 0) {
      const targetItem = menuItems.find(item => item.id === selectedMenuItemId);
      if (targetItem) {
        openCustomizeModal(targetItem);
      }
    }
  }, [selectedMenuItemId, menuItems]);

  const searchFilteredItems = React.useMemo(() => {
    let list = [...menuItems];
    if (selectedBean === 'S') {
      list = list.filter(item => (item as any).bean_type === 'S' || !(item as any).bean_type || (item as any).bean_type === null);
    } else if (selectedBean === 'D') {
      list = list.filter(item => (item as any).bean_type === 'D' || (item.category !== 'AMERICANO' && item.category !== 'COFFEE_LATTE'));
    } else if (selectedBean === 'P') {
      list = list.filter(item => (item as any).bean_type === 'P' || (item.category !== 'AMERICANO' && item.category !== 'COFFEE_LATTE'));
    }
    return list.sort((a, b) => {
      const orderA = (a as any).order_index !== undefined ? (a as any).order_index : ((a as any).orderIndex !== undefined ? (a as any).orderIndex : 99999);
      const orderB = (b as any).order_index !== undefined ? (b as any).order_index : ((b as any).orderIndex !== undefined ? (b as any).orderIndex : 99999);
      return orderA - orderB;
    });
  }, [menuItems, selectedBean]);

  const filteredItems = searchFilteredItems.filter(item => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'SIGNATURE') {
      return (item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true) && (item as any).bean_type !== 'D' && (item as any).bean_type !== 'P';
    }
    return item.category === selectedCategory;
  });

  const openCustomizeModal = (item: MenuItem) => {
    setDetailItem(item);
    setTemp('ICE');
  };

  const handleCloseDetail = () => {
    setDetailItem(null);
    if (setSelectedMenuItemId) {
      setSelectedMenuItemId(null);
    }
  };

  const updateQuantity = (cartItemId: string, change: number) => {
    setCart(prev => {
      const copy = prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + change;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      });
      return copy;
    });
  };

  const removeItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  return (
    <div id="haste-menu-all-view-root" className="pt-2 md:pt-4 pb-4 md:pb-10 bg-[var(--haste-body-bg)] relative">


      {/* Unified single-line menu filter navigation */}
      <section className="max-w-[1440px] mx-auto px-3 md:px-6 mb-4 flex justify-start items-center overflow-x-auto gap-2 scrollbar-none select-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-1.5 flex-nowrap items-center shrink-0 py-1">
          <button
            id="menu-all-cat-btn-ALL"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all tracking-wider cursor-pointer whitespace-nowrap ${ selectedCategory === 'ALL' ? 'bg-stone-900 text-[#C5A059] shadow-md' : 'bg-white hover:bg-stone-50 border border-stone-200 haste-body-text-2 !font-bold' }`}
          >
            전체 메뉴 ({searchFilteredItems.length})
          </button>

          {/* Bean filter buttons are permanently fixed and visible */}
          <button
            onClick={() => setSelectedBean('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all tracking-wider cursor-pointer whitespace-nowrap bg-stone-900 border ${
              selectedBean === 'ALL'
                ? 'text-[#C5A059] border-[#C5A059] shadow-md font-extrabold'
                : 'text-stone-400 border-transparent hover:text-white'
            }`}
          >
            전체 원두
          </button>
          <button
            onClick={() => setSelectedBean('S')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all tracking-wider cursor-pointer whitespace-nowrap bg-stone-900 border ${
              selectedBean === 'S'
                ? 'text-[#C5A059] border-[#C5A059] shadow-md font-extrabold'
                : 'text-stone-400 border-transparent hover:text-white'
            }`}
          >
            일반 원두
          </button>
          <button
            onClick={() => setSelectedBean('D')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all tracking-wider cursor-pointer whitespace-nowrap bg-stone-900 border ${
              selectedBean === 'D'
                ? 'text-[#C5A059] border-[#C5A059] shadow-md font-extrabold'
                : 'text-stone-400 border-transparent hover:text-white'
            }`}
          >
            디카페인
          </button>
          <button
            onClick={() => setSelectedBean('P')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all tracking-wider cursor-pointer whitespace-nowrap bg-stone-900 border ${
              selectedBean === 'P'
                ? 'text-[#C5A059] border-[#C5A059] shadow-md font-extrabold'
                : 'text-stone-400 border-transparent hover:text-white'
            }`}
          >
            프리미엄
          </button>
          <div className="h-5 w-[1px] bg-stone-300 mx-2 shrink-0" />

          <button
            id="menu-all-cat-btn-SIGNATURE"
            onClick={() => setSelectedCategory('SIGNATURE')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all tracking-wider cursor-pointer whitespace-nowrap ${ selectedCategory === 'SIGNATURE' ? 'bg-[#C5A059] text-stone-950 font-extrabold shadow-md' : 'bg-white hover:bg-stone-50 border border-stone-200 haste-body-text-2 !font-bold' }`}
          >
            ⭐ 시그니처 ({searchFilteredItems.filter(item => (item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true) && (item as any).bean_type !== 'D' && (item as any).bean_type !== 'P').length})
          </button>
          {categories.map(cat => {
            const catItemCount = searchFilteredItems.filter(it => it.category === cat.id).length;
            return (
              <button
                id={`menu-all-cat-btn-${cat.id}`}
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all tracking-wider cursor-pointer whitespace-nowrap ${ selectedCategory === cat.id ? 'bg-stone-900 text-[#C5A059] shadow-md' : 'bg-white hover:bg-stone-50 border border-stone-200 haste-body-text-2 !font-bold' }`}
              >
                {cat.name} ({catItemCount})
              </button>
            );
          })}
        </div>
      </section>

      {/* Main menu item cards bento-grid */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 mb-4 md:mb-10">

        {isLoading ? (
          <div className="w-full">
            <div className="mb-4 pb-1 pl-1 animate-pulse">
              <div className="h-3 bg-stone-200/80 rounded w-24 mb-2" />
              <div className="h-6 bg-stone-200/90 rounded w-44" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-4.5">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-stone-200/40 overflow-hidden shadow-xs animate-pulse flex flex-col">
                  <div className="w-full aspect-[3/4] bg-stone-100/60 flex items-center justify-center relative">
                    <div className="w-10 h-10 rounded-full bg-stone-200/40" />
                  </div>
                  <div className="p-3 text-center flex-grow flex flex-col justify-center gap-2 items-center bg-white border-t border-stone-50">
                    <div className="h-3.5 bg-stone-200/80 rounded w-2/3" />
                    <div className="h-2.5 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (selectedCategory === 'ALL') ? (
          <div className="space-y-4 md:space-y-8">
            {categories.map((catGroup) => {
              const groupItems = filteredItems.filter(it => it.category === catGroup.id);
              if (groupItems.length === 0) return null;
              return (
                <div key={catGroup.id} className="w-full">
                  <div className="mb-1.5 md:mb-3 pb-0.5 md:pb-1 pl-1">
                    <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-3">CATEGORY : {catGroup.id}</span>
                    <h3 className="font-sans text-sm sm:text-2xl font-bold text-stone-900 flex items-center gap-2 mb-2">
                      {catGroup.name}
                    </h3>
                    {catGroup.desc && (
                      <p className="text-stone-650 font-sans text-[10px] sm:text-xs font-light mt-0.5 leading-relaxed">
                        {catGroup.desc} <span className="text-[#C5A059] font-bold ml-1.5 text-[9px] sm:text-[11px]">(음료 {groupItems.length}개)</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-l border-stone-200/40 overflow-hidden rounded-xl">
                    {groupItems.map(item => {
                      const isSig = (item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true) && (item as any).bean_type !== 'D' && (item as any).bean_type !== 'P';
                      return (
                        <div
                          id={`menu-all-item-card-${item.id}`}
                          key={item.id}
                          onClick={() => openCustomizeModal(item)}
                          className={`bg-white rounded-none border-r border-b border-stone-200/40 overflow-hidden shadow-none hover:bg-stone-50/40 transition-all duration-300 flex flex-col group cursor-pointer ${ isSig ? 'bg-stone-50/10 border-r border-b border-stone-200/40' : '' }`}
                        >
                          <div className="w-full aspect-[3/4] overflow-hidden relative bg-stone-50/50 group-hover:opacity-95 transition-all flex items-center justify-center">
                            {isSig && (
                              <span className="absolute top-2 left-2 z-10 bg-[#C5A059]/10 backdrop-blur-xs text-[#C5A059] border border-[#C5A059]/30 px-2 py-0.5 rounded-full text-[9px] font-sans font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                                <Sparkles size={8} className="fill-[#C5A059]" />
                                SIGNATURE
                              </span>
                            )}
                            <img 
                              src={getDrinkSvg(item)} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => handleImageError(e, item.id)}
                            />
                            {item.videoUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCustomizeModal({ ...item, autoPlayVideo: true });
                                }}
                                className="absolute bottom-2.5 right-2.5 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-1.5 px-2.5 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                                title="영상 재생"
                              >
                                <Play size={9} className="fill-white text-white ml-[0.5px] shrink-0" />
                              </button>
                            )}
                          </div>
                          <div className="p-1.5 md:p-3 flex-grow flex flex-col justify-center text-center border-t border-stone-50">
                            <h4 className="font-sans text-[11px] sm:text-sm font-bold text-stone-900 leading-tight flex items-center justify-center gap-1">
                              <span>{item.nameKr}</span>
                            </h4>
                            <p className="font-sans text-[9px] md:text-[10px] text-stone-650 font-mono font-light truncate mt-0.5 md:mt-1" title={item.name}>
                              {item.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full">


            <div className="mb-1.5 md:mb-3 pb-0.5 md:pb-1 pl-1">
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-3">CATEGORY : {selectedCategory}</span>
              <h3 className="font-sans text-sm sm:text-2xl font-bold text-stone-900 uppercase mb-2">
                {(() => {
                  if (selectedCategory === 'SIGNATURE') return '⭐ 시그니처 추천 메뉴';
                  const baseName = categories.find(c => c.id === selectedCategory)?.name || selectedCategory;
                  if (selectedCategory === 'AMERICANO' || selectedCategory === 'COFFEE_LATTE') {
                    if (selectedBean === 'D') return `디카페인 ${baseName}`;
                    if (selectedBean === 'P') return `프리미엄 ${baseName}`;
                    if (selectedBean === 'ALL') return `전체 ${baseName}`;
                  }
                  return baseName;
                })()}
              </h3>
              <p className="text-stone-650 font-sans text-[10px] sm:text-xs font-light mt-0.5 leading-relaxed">
                {selectedCategory === 'SIGNATURE' 
                  ? '스마트 바리스타 시스템이 제안하는 대표 시그니처 메뉴' 
                  : (categories.find(c => c.id === selectedCategory)?.desc || '다이렉트 명품 기획 음료품목')} 
                <span className="text-[#C5A059] font-bold ml-1.5 text-[9px] sm:text-[11px]">(음료 {filteredItems.length}개)</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-l border-stone-200/40 overflow-hidden rounded-xl">
              {filteredItems.map(item => {
                const isSig = (item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true) && (item as any).bean_type !== 'D' && (item as any).bean_type !== 'P';
                return (
                  <div
                    id={`menu-all-item-card-${item.id}`}
                    key={item.id}
                    onClick={() => openCustomizeModal(item)}
                    className={`bg-white rounded-none border-r border-b border-stone-200/40 overflow-hidden shadow-none hover:bg-stone-50/40 transition-all duration-300 flex flex-col group cursor-pointer ${ isSig ? 'bg-stone-50/10 border-r border-b border-stone-200/40' : '' }`}
                  >
                    <div className="w-full aspect-[3/4] overflow-hidden relative bg-stone-50/50 group-hover:opacity-95 transition-all flex items-center justify-center">
                      {isSig && (
                        <span className="absolute top-2 left-2 z-10 bg-[#C5A059]/10 backdrop-blur-xs text-[#C5A059] border border-[#C5A059]/30 px-2 py-0.5 rounded-full text-[9px] font-sans font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                          <Sparkles size={8} className="fill-[#C5A059]" />
                          SIGNATURE
                        </span>
                      )}
                      <img 
                        src={getDrinkSvg(item)} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, item.id)}
                      />
                      {item.videoUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCustomizeModal({ ...item, autoPlayVideo: true });
                          }}
                          className="absolute bottom-2.5 right-2.5 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-1.5 px-2.5 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                          title="영상 재생"
                        >
                          <Play size={9} className="fill-white text-white ml-[0.5px] shrink-0" />
                        </button>
                      )}
                    </div>
                    <div className="p-1.5 md:p-3 flex-grow flex flex-col justify-center text-center border-t border-stone-50">
                      <h4 className="font-sans text-[11px] sm:text-sm font-bold text-stone-900 leading-tight flex items-center justify-center gap-1">
                        <span>{item.nameKr}</span>
                      </h4>
                      <p className="font-sans text-[9px] md:text-[10px] text-stone-650 font-mono font-light truncate mt-0.5 md:mt-1" title={item.name}>
                        {item.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* DETAILED CUSTOMIZATION POPUP MODAL */}
      <MenuCustomizeModal
        detailItem={detailItem}
        temp={temp}
        handleCloseDetail={handleCloseDetail}
        onUpdateImage={(newUrl) => {
          if (detailItem) {
            setMenuItems(prev => prev.map(item => item.id === detailItem.id ? { ...item, image: newUrl } : item));
            setDetailItem({ ...detailItem, image: newUrl });
          }
        }}
        onDeleteItem={(deletedId) => {
          setMenuItems(prev => prev.filter(item => item.id !== deletedId));
          handleCloseDetail();
        }}
        onUpdateItem={(updatedItem) => {
          setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
          setDetailItem(updatedItem);
        }}
      />

      {/* SHOPPING CART OVERLAY SIDEBAR */}
      <MenuDrawerCart
        isMiniCartOpen={isMiniCartOpen}
        setIsMiniCartOpen={setIsMiniCartOpen}
        cart={cart}
        defaultPickupBranch={defaultPickupBranch}
        removeItem={removeItem}
        updateQuantity={updateQuantity}
        onCheckout={onCheckout}
      />
    </div>
  );
};
