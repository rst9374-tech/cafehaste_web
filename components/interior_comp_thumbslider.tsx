import React, { useState, useEffect } from 'react';

interface InteriorThumbnailSliderProps {
  styleId: string;
  previewImages: string[];
  hasVideo0: boolean;
  hasVideo1: boolean;
  hasVideo2: boolean;
  isComp: boolean;
  onSelectImage: (idx: number) => void;
}

export const InteriorThumbnailSlider: React.FC<InteriorThumbnailSliderProps> = ({
  styleId,
  previewImages,
  hasVideo0,
  hasVideo1,
  hasVideo2,
  isComp,
  onSelectImage,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    setCurrentIdx(0);
  }, [styleId]);

  const hasVideoList = [hasVideo0, hasVideo1, hasVideo2];

  // Render a clean 3-column grid for both Desktop and Mobile (No horizontal swipe/scroll inside the card)
  return (
    <div 
      className={`grid grid-cols-3 overflow-hidden relative bg-stone-100 border border-stone-100/50
        ${isComp 
          ? 'gap-1 mb-2.5 rounded-xl' 
          : 'gap-1.5 rounded-xl md:rounded-[20px] mb-4'
        }`}
      style={{ aspectRatio: '3 / 1' }}
    >
      {previewImages.slice(0, 3).map((imgSrc, idx) => {
        const isSelected = idx === currentIdx;
        return (
          <div 
            key={idx}
            className={`col-span-1 h-full overflow-hidden relative cursor-pointer group/img border-2 transition-all
              ${isSelected 
                ? 'border-[#C5A059] scale-[1.01]' 
                : 'border-transparent hover:border-stone-200'
              }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIdx(idx);
              onSelectImage(idx);
            }}
            title="상세 사진 선택"
          >
            {imgSrc ? (
              <>
                <img 
                  src={imgSrc} 
                  alt={`Preview ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/5 group-hover/img:bg-black/15 transition-all flex items-center justify-center">
                  <span className="text-[8px] md:text-[9px] text-white font-bold bg-stone-900/80 px-1.5 py-0.5 rounded opacity-0 group-hover/img:opacity-100 transition-opacity font-sans">
                    선택
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 text-[9px]">
                No Image
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
