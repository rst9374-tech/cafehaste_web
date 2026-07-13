import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, GripVertical, Play } from 'lucide-react';
import { getDrinkSvg, FALLBACK_DRINK_SVG } from './menu_comp_drinksvg';
import { HASTE_ITEMS } from './menu_page_main';
import { useHomeSlider } from './home_hook_slider';

interface HomeShowcaseProps {
  signatureItems: any[];
  navigateTo: (route: any) => void;
  setLocalDetailItem: (item: any) => void;
}

export const HasteHomeShowcase: React.FC<HomeShowcaseProps> = ({
  signatureItems,
  navigateTo,
  setLocalDetailItem
}) => {
  const { drinkSliderRef, scrollSlider } = useHomeSlider();
  const [orderedItems, setOrderedItems] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const isAdmin = localStorage.getItem('haste_admin_auth') === 'true';

  useEffect(() => {
    const base = signatureItems.length > 0 ? signatureItems : HASTE_ITEMS;
    const uniqueItems = [
      ...base,
      ...HASTE_ITEMS.filter(h => !base.some(b => b.id === h.id))
    ].slice(0, 10);
    setOrderedItems(uniqueItems);
  }, [signatureItems]);

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = async (idx: number) => {
    if (draggedIndex === null || draggedIndex === idx) return;
    const listCopy = [...orderedItems];
    const draggedItem = listCopy[draggedIndex];
    listCopy.splice(draggedIndex, 1);
    listCopy.splice(idx, 0, draggedItem);
    setOrderedItems(listCopy);
    setDraggedIndex(null);

    // Call API to save reorder
    try {
      const response = await fetch('/api/menu-items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: listCopy.map(it => it.id) })
      });
      if (response.ok) {
        console.log('[Drag&Drop] Signature menu order successfully updated.');
      }
    } catch (err) {
      console.error('Failed to update signature order via drag & drop:', err);
    }
  };

  return (
    <section className="container mx-auto px-4 md:px-6 mb-12 md:mb-24 max-w-7xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-4 border-b border-stone-200 pb-4 md:pb-6 mb-6 md:mb-12">
        <div>
          <span className="haste-category-label-en mb-1">HASTE COLLECTION</span>
          <h2 className="haste-section-title-2 uppercase tracking-wide flex items-center gap-2">
            HASTE SIGNATURE TOP10 DRINKS
            {isAdmin && (
              <span className="bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-sans font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse select-none">
                순서 변경 활성화 (드래그)
              </span>
            )}
          </h2>
        </div>
        <button
          id="showcase-all-menu-btn"
          onClick={() => navigateTo('MENU')}
          className="group flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-[#C5A059] transition-colors uppercase cursor-pointer"
        >
          상세 커스텀 옵션 보기
          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Mobile Swipe Helper Text */}
      <div className="md:hidden text-[10px] text-stone-400 font-sans tracking-wide text-center mb-4 flex items-center justify-center gap-1">
        <span>← 손가락으로 좌우로 가볍게 밀어서 10대 시그니처 음료를 확인해 보세요 →</span>
      </div>

      {/* Slider Wrap Element */}
      <div className="relative w-full">
        <button 
          onClick={() => scrollSlider('left')}
          className="absolute -left-2 top-[120px] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-stone-200 shadow flex items-center justify-center text-stone-750 hover:text-[#C5A059] active:scale-90 transition-all md:hidden"
          aria-label="이전 음료"
        >
          <ChevronLeft size={16} />
        </button>

        <div 
          ref={drinkSliderRef}
          className="no-swipe flex overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6"
        >
          {orderedItems.map((item, idx) => {
            const isSig = item.isSignature === 1 || item.isSignature === true || item.is_signature === 1 || item.is_signature === true;
            return (
              <motion.div
                id={`hero-showcase-item-${item.id}`}
                key={item.id}
                whileHover={{ y: isAdmin ? 0 : -8 }}
                draggable={isAdmin}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between w-[44vw] sm:w-[45vw] md:w-auto shrink-0 snap-center md:shrink-1 select-none border-0 ${ isAdmin ? 'cursor-grab active:cursor-grabbing bg-stone-50/10' : '' }`}
              >
                <div className="w-full aspect-[3/4] p-3 overflow-hidden relative bg-stone-50/50 group hover:opacity-95 transition-all flex items-center justify-center">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 bg-stone-900/65 text-stone-400 p-1.5 rounded-lg border border-stone-800">
                      <GripVertical size={12} />
                    </div>
                  )}
                  <img 
                    src={getDrinkSvg(item)} 
                    alt={item.nameKr} 
                    className="w-full h-full object-cover scale-[1.15] group-hover:scale-[1.25] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_DRINK_SVG;
                    }}
                  />
                  {/* Youtube Red Play Button */}
                  {item.videoUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLocalDetailItem({ ...item, autoPlayVideo: true });
                      }}
                      className="absolute bottom-2.5 right-2.5 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-1.5 px-2.5 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                      title="음료 영상 재생"
                    >
                      <Play size={9} className="fill-white text-white ml-[0.5px] shrink-0" />
                    </button>
                  )}
                </div>
                
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 justify-start min-w-0 max-w-full">
                      <h4 className="font-serif text-base font-bold text-stone-900 leading-tight truncate">{item.nameKr}</h4>
                    </div>
                    <h5 className="font-sans text-[10px] text-stone-400 font-normal truncate mt-0.5">{item.name}</h5>
                    <p className="haste-body-text-2 text-stone-600 mt-2.5 text-ellipsis overflow-hidden h-12" title={item.description}>{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-150">
                    <div />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLocalDetailItem(item);
                      }}
                      className="text-[10px] text-[#C5A059] font-bold hover:underline uppercase transition-all font-sans cursor-pointer py-1 px-2 mb-0 bg-[#C5A059]/5 hover:bg-[#C5A059]/10 rounded-lg active:scale-95"
                    >
                      상세보기 →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button 
          onClick={() => scrollSlider('right')}
          className="absolute -right-2 top-[120px] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-stone-200 shadow flex items-center justify-center text-stone-750 hover:text-[#C5A059] active:scale-90 transition-all md:hidden"
          aria-label="다음 음료"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};
