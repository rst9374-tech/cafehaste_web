import React from 'react';
import { Loader2, Camera } from 'lucide-react';
import { MenuItem } from './menu_page_main';

interface MenuCustomizeEditProps {
  detailItem: MenuItem;
  editNameKr: string;
  setEditNameKr: (val: string) => void;
  editName: string;
  setEditName: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  editImage: string;
  setEditImage: (val: string) => void;
  editVideoUrl: string;
  setEditVideoUrl: (val: string) => void;
  handleSaveEdit: (e: React.FormEvent) => void;
  handleEditFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  setIsEditing: (val: boolean) => void;
}

export const MenuCustomizeEdit: React.FC<MenuCustomizeEditProps> = ({
  detailItem,
  editNameKr,
  setEditNameKr,
  editName,
  setEditName,
  editDesc,
  setEditDesc,
  editImage,
  setEditImage,
  editVideoUrl,
  setEditVideoUrl,
  handleSaveEdit,
  handleEditFileChange,
  isUploading,
  setIsEditing
}) => {
  return (
    <form onSubmit={handleSaveEdit} className="space-y-4 font-sans text-left flex flex-col justify-between h-full pt-4">
      <div className="space-y-3 flex-grow">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest">{detailItem.category} EDIT MODE</span>
          <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">메뉴 정보 수정</h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">음료명 (한글) [필수]</label>
          <input
            type="text"
            required
            value={editNameKr}
            onChange={(e) => setEditNameKr(e.target.value)}
            placeholder="예: 청포도 에이드, 바닐라 라떼"
            className="w-full text-xs font-bold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">음료명 (영문) [필수]</label>
          <input
            type="text"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Green Grape Ade"
            className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">대표 사진 (URL 또는 업로드)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={editImage}
              onChange={(e) => setEditImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-grow text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 font-mono"
            />
            <label className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-250 rounded-lg cursor-pointer text-xs font-semibold text-stone-700 transition-colors select-none">
              <Camera size={13} />
              <span>업로드</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleEditFileChange} 
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">동영상 링크 (선택)</label>
          <input
            type="text"
            value={editVideoUrl}
            onChange={(e) => setEditVideoUrl(e.target.value)}
            placeholder="예: https://www.youtube.com/watch?v=..."
            className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-450 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">대표 레시피 설명</label>
          <textarea
            rows={3}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="메뉴 상세 설명"
            className="w-full text-xs font-light p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 leading-relaxed"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-stone-155 mt-8 flex justify-end items-center gap-4 w-full">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors rounded-xl"
        >
          취소 (CANCEL)
        </button>
        <button
          type="submit"
          disabled={isUploading}
          className="px-6 py-3 bg-stone-900 hover:bg-stone-850 text-[#C5A059] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors rounded-xl"
        >
          {isUploading && <Loader2 size={12} className="animate-spin" />}
          <span>저장 (SAVE)</span>
        </button>
      </div>
    </form>
  );
};
