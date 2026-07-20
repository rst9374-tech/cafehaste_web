import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import type { MenuItem } from './menu_types';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
  onPlayVideoClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onClick,
  onPlayVideoClick
}) => {
  const isSig =
    item.isSignature === 1 ||
    item.isSignature === true ||
    (item as any).is_signature === 1 ||
    (item as any).is_signature === true;

  // Render using relative paths to import helpers securely
  const getDrinkSvgLocal = (itm: MenuItem) => {
    return itm.image;
  };

  const handleImageErrorLocal = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231c1917"/><circle cx="50" cy="50" r="30" fill="%23292524"/><path d="M35,60 C40,45 60,45 65,60" stroke="%23C5A059" stroke-width="3" fill="none"/></svg>';
  };

  return (
    <div
      id={`menu-item-card-${item.id}`}
      onClick={() => onClick(item)}
      className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer ${
        isSig
          ? 'border-[#C5A059]/45 bg-stone-50/10 hover:border-[#C5A059]'
          : 'border-stone-200/60 hover:border-[#C5A059]/50'
      }`}
    >
      <div className="w-full aspect-[3/4] overflow-hidden relative bg-stone-50/50 group-hover:opacity-95 transition-all flex items-center justify-center">
        {isSig && (
          <span className="absolute top-2 left-2 z-10 bg-[#C5A059]/10 backdrop-blur-xs text-[#C5A059] border border-[#C5A059]/30 px-2 py-0.5 rounded-full text-[9px] font-sans font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-sm">
            <Sparkles size={8} className="fill-[#C5A059]" />
            SIGNATURE
          </span>
        )}
        <img
          src={getDrinkSvgLocal(item)}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={handleImageErrorLocal}
        />
        {item.videoUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayVideoClick(item);
            }}
            className="absolute bottom-2.5 right-2.5 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-1.5 px-2.5 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
            title="영상 재생"
          >
            <Play size={9} className="fill-white text-white ml-[0.5px] shrink-0" />
          </button>
        )}
      </div>
      <div className="p-1.5 md:p-3 flex-grow flex flex-col justify-center text-center border-t border-stone-50">
        <h4 className="font-sans text-[13px] sm:text-[15px] font-extrabold text-black tracking-tight leading-tight flex items-center justify-center gap-1">
          <span>{item.nameKr || (item as any).name_kr}</span>
        </h4>
        <p
          className="font-sans text-[9px] md:text-[10px] text-[#C5A059] font-semibold tracking-wide truncate mt-0.5 md:mt-1"
          title={item.nameEn || item.name}
        >
          {item.nameEn || (item as any).name_en || item.name}
        </p>
      </div>
    </div>
  );
};
