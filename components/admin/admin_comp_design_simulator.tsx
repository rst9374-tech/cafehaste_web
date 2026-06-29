import React from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface AdminDesignSimulatorProps {
  previewInterior: any | null;
  interiors: any[];
  interiorImageIndex: number;
  setInteriorImageIndex: React.Dispatch<React.SetStateAction<number>>;
  setPreviewInterior: (item: any | null) => void;
}

export const AdminDesignSimulator: React.FC<AdminDesignSimulatorProps> = ({
  previewInterior,
  interiors,
  interiorImageIndex,
  setInteriorImageIndex,
  setPreviewInterior
}) => {
  const activePreview = previewInterior || interiors[0];

  if (!activePreview) {
    return (
      <div className="lg:col-span-4 sticky top-28 flex flex-col gap-6">
        <div className="bg-stone-955 rounded-2xl border border-stone-850 overflow-hidden shadow-2xl relative shadow-stone-950/20 font-sans">
          <div className="aspect-[16/9] w-full flex flex-col items-center justify-center text-stone-500 text-xs p-8 bg-stone-900">
            <AlertTriangle size={24} className="text-stone-600 mb-2" />
            <span>인테리어 구성이 비어있습니다.</span>
          </div>
          <div className="bg-stone-900 px-4 py-2.5 border-t border-stone-850 text-[10px] font-sans text-stone-400 flex items-center justify-between">
            <span>장착: <strong className="text-white">없음</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Gather all unique non-empty images (mock image, gallery, and blueprint)
  const imgs: string[] = [];
  if (activePreview.mockImage) imgs.push(activePreview.mockImage);
  if (Array.isArray(activePreview.gallery)) {
    activePreview.gallery.forEach((g: string) => {
      if (g && !imgs.includes(g)) imgs.push(g);
    });
  }
  if (activePreview.blueprintImage && !imgs.includes(activePreview.blueprintImage)) {
    imgs.push(activePreview.blueprintImage);
  }

  if (imgs.length === 0) {
    return (
      <div className="lg:col-span-4 sticky top-28 flex flex-col gap-6">
        <div className="bg-stone-955 rounded-2xl border border-stone-850 overflow-hidden shadow-2xl relative shadow-stone-950/20 font-sans">
          <div className="aspect-[16/9] w-full flex flex-col items-center justify-center text-stone-500 text-xs p-8 bg-stone-900">
            <AlertTriangle size={24} className="text-stone-600 mb-2" />
            <span>등록된 이미지가 없습니다.</span>
          </div>
          <div className="bg-stone-900 px-4 py-2.5 border-t border-stone-850 text-[10px] font-sans text-stone-400 flex items-center justify-between">
            <span>장착: <strong className="text-white">{activePreview.id}</strong></span>
            <button 
              type="button"
              onClick={() => setPreviewInterior(null)} 
              disabled={!previewInterior}
              className="text-[9px] font-bold text-stone-500 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              해제
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = Math.min(interiorImageIndex, imgs.length - 1);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;
  const currentImg = imgs[safeIndex];

  return (
    <div className="lg:col-span-4 sticky top-28 flex flex-col gap-6">
      <div className="bg-stone-950 rounded-2xl border border-stone-850 overflow-hidden shadow-2xl relative shadow-stone-950/20 font-sans">
        <div className="relative aspect-[16/9] w-full bg-stone-955 overflow-hidden flex flex-col justify-end p-6 select-none group">
          <div className="absolute inset-0">
            <img
              src={currentImg}
              alt="simulator"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/20" />
          </div>

          {/* Chevron Left / Right Slide Navigation */}
          {imgs.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInteriorImageIndex((prev) => (prev > 0 ? prev - 1 : imgs.length - 1));
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
                title="이전 이미지"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInteriorImageIndex((prev) => (prev < imgs.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
                title="다음 이미지"
              >
                <ChevronRight size={16} />
              </button>

              {/* Page Indicator Bubble */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-stone-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/5 font-mono text-[9px] text-[#C5A059] font-bold">
                {safeIndex + 1} / {imgs.length}
              </div>
            </>
          )}

          <div className="relative z-10 flex flex-col gap-1.5 text-left">
            <div>
              <span className="font-mono text-[8px] font-extrabold tracking-widest uppercase bg-[#C5A059] text-stone-950 px-2 py-0.5 rounded shadow-sm">
                {activePreview.id || 'HASTE INT'}
              </span>
            </div>
            <h3 className="font-serif text-base font-normal text-white tracking-tight leading-tight drop-shadow-md">
              {activePreview.title || 'Theme Title'}
            </h3>
            <p className="font-mono text-[8px] text-[#C5A059] tracking-[0.2em] font-bold uppercase drop-shadow-sm leading-none">
              {activePreview.subtitle || 'Subtitle info'}
            </p>
            <p className="text-[10px] text-stone-300 font-light max-w-sm leading-relaxed line-clamp-2 mt-1">
              {activePreview.desc || 'No description provided.'}
            </p>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-stone-950/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <span className="font-mono text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
              PREVIEWING
            </span>
          </div>
        </div>

        <div className="bg-stone-900 px-4 py-2.5 border-t border-stone-850 text-[10px] font-sans text-stone-400 flex flex-col xs:flex-row gap-2 xs:items-center justify-between">
          <span>장착: <strong className="text-white">{activePreview.id}</strong></span>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(currentImg.split('?')[0] + "?q=90&w=2400", { mode: 'cors' });
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  const imageType = currentImg === activePreview.blueprintImage ? 'blueprint' : 'preview';
                  const safeIdStr = String(activePreview.id || 'haste');
                  link.download = `${safeIdStr.replace(/[^a-zA-Z0-9가-힣\s]/g, '').trim() || 'haste'}_${imageType}.jpg`;
                  link.click();
                  URL.revokeObjectURL(blobUrl);
                } catch (e) {
                  const link = document.createElement('a');
                  link.href = currentImg;
                  link.target = '_blank';
                  link.rel = 'noreferrer';
                  link.click();
                }
              }}
              className="text-[9px] font-bold text-[#C5A059] hover:text-[#FFA033] flex items-center gap-1 cursor-pointer bg-stone-950/40 px-2 py-1 rounded hover:bg-stone-950/80 transition-all border border-white/5"
              title="현재 미리보기로 보이는 화면 이미지 다운로드"
            >
              <Download size={10} />
              다운로드
            </button>

            <span className="text-stone-750 hidden xs:inline">|</span>
            
            <button 
              type="button"
              onClick={() => setPreviewInterior(null)} 
              disabled={!previewInterior}
              className="text-[9px] font-bold text-stone-500 hover:text-white disabled:opacity-30 cursor-pointer bg-stone-950/20 px-1.5 py-1 rounded transition-all border border-transparent"
            >
              해제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
