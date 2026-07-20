import React from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { HeroDraft } from '../home_types';

interface AdminDraftsPreviewProps {
  previewDraft: HeroDraft | null;
  heroDrafts: HeroDraft[];
  handlePrevPreview: () => void;
  handleNextPreview: () => void;
  setPreviewDraft: (draft: HeroDraft | null) => void;
}

export const AdminDraftsPreview: React.FC<AdminDraftsPreviewProps> = ({
  previewDraft,
  heroDrafts,
  handlePrevPreview,
  handleNextPreview,
  setPreviewDraft
}) => {
  const activePreview = previewDraft || heroDrafts[0];

  if (!activePreview) {
    return (
      <div className="aspect-[16/9] w-full flex flex-col items-center justify-center text-stone-500 text-xs p-8 bg-stone-900 rounded-2xl border border-stone-850">
        <span>기획 디자인이 비어있습니다.</span>
      </div>
    );
  }

  return (
    <div className="bg-stone-955 rounded-2xl overflow-hidden shadow-2xl relative shadow-stone-950/20">
      <div className="relative aspect-[16/9] w-full bg-stone-950 overflow-hidden flex flex-col justify-end p-6 select-none group">
        <div className="absolute inset-0">
          <img
            src={activePreview.bgImage}
            alt="simulator"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/25" />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevPreview();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-950/70 backdrop-blur-md border border-stone-800 hover:border-[#C5A059] text-[#FAF9F6] hover:text-[#C5A059] flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextPreview();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-950/70 backdrop-blur-md border border-stone-800 hover:border-[#C5A059] text-[#FAF9F6] hover:text-[#C5A059] flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        >
          <ChevronRight size={16} />
        </button>

        <div className="relative z-10 flex flex-col gap-1.5 text-left">
          <div>
            <span className="font-mono text-[8px] font-extrabold tracking-widest uppercase bg-[#C5A059] text-stone-955 px-2 py-0.5 rounded shadow-sm">
              {activePreview.tag || 'HASTE DESIGN'}
            </span>
          </div>
          <h3 className="font-serif text-base font-normal text-white tracking-tight leading-tight drop-shadow-md">
            {activePreview.slogan || 'Slogan text'}
          </h3>
          <p className="font-mono text-[8px] text-[#C5A059] tracking-[0.2em] font-bold uppercase drop-shadow-sm leading-none">
            {activePreview.subtext || 'Subtext description'}
          </p>
          <p className="text-[10px] text-stone-300 font-light max-w-sm leading-relaxed line-clamp-2 mt-1">
            {activePreview.description || 'No description.'}
          </p>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-stone-950/70 backdrop-blur-md px-2 py-1 rounded-full border border-stone-850">
          <span className="font-mono text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
            PREVIEWING
          </span>
        </div>
      </div>

      <div className="bg-stone-900 px-4 py-2.5 text-[10px] font-sans text-stone-400 flex items-center justify-between">
        <span>장착: <strong className="text-white">{activePreview.tag || '없음'}</strong></span>
        <div className="flex items-center gap-2">
          {activePreview.bgImage && (
            <button
              onClick={async () => {
                try {
                  const response = await fetch(activePreview.bgImage.split('?')[0] + "?q=90&w=2400", { mode: 'cors' });
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = `${activePreview.tag.replace(/[^a-zA-Z0-9가-힣\s]/g, '').trim() || 'haist_draft'}.jpg`;
                  link.click();
                  URL.revokeObjectURL(blobUrl);
                } catch (e) {
                  const link = document.createElement('a');
                  link.href = activePreview.bgImage;
                  link.target = '_blank';
                  link.rel = 'noreferrer';
                  link.click();
                }
              }}
              className="text-[9px] font-bold text-[#C5A059] hover:text-[#FFA033] flex items-center gap-1 cursor-pointer"
            >
              <Download size={10} />
              다운로드
            </button>
          )}
          <span className="text-stone-700">|</span>
          <button onClick={() => setPreviewDraft(null)} disabled={!previewDraft} className="text-[9px] font-bold text-stone-500 hover:text-white disabled:opacity-30 cursor-pointer">
            해제
          </button>
        </div>
      </div>
    </div>
  );
};
