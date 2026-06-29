import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';

interface AdminMenuBulkImageModalProps {
  isBulkImageModalOpen: boolean;
  setIsBulkImageModalOpen: (open: boolean) => void;
  selectedMenuIds: number[];
  bulkImageValue: string;
  setBulkImageValue: (val: string) => void;
  handleBulkImageUpdate: (e: React.FormEvent) => Promise<void> | void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, setValue: (val: string) => void) => void;
  isUploading: boolean;
  isBulkLoading: boolean;
}

export const AdminMenuBulkImageModal: React.FC<AdminMenuBulkImageModalProps> = ({
  isBulkImageModalOpen,
  setIsBulkImageModalOpen,
  selectedMenuIds,
  bulkImageValue,
  setBulkImageValue,
  handleBulkImageUpdate,
  handleFileChange,
  isUploading,
  isBulkLoading
}) => {
  return (
    <AnimatePresence>
      {isBulkImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBulkImageModalOpen(false)}
            className="absolute inset-0 bg-stone-900" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl z-10 font-sans"
          >
            <div className="mb-6 flex justify-between items-start font-sans">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#C5A059] font-bold uppercase block mb-1">
                  Bulk Operation Board
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  선택 품목 {selectedMenuIds.length}개 이미지 일괄 변경
                </h3>
              </div>
              <button 
                onClick={() => setIsBulkImageModalOpen(false)}
                className="p-1 px-3 text-xs text-stone-400 hover:text-stone-850 bg-stone-50 rounded font-extrabold cursor-pointer"
              >✕</button>
            </div>

            <form onSubmit={handleBulkImageUpdate} className="space-y-4 font-sans">
              <div className="flex flex-col gap-2 p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                <span className="text-[10px] font-bold text-amber-850">적용 대상 품목 ({selectedMenuIds.length}개):</span>
                <p className="text-[10px] text-[#A68444] font-medium leading-relaxed">
                  선택하신 모든 메뉴 아이템들의 다른 정보(명칭, 설명 등)는 그대로 유지하면서, 오직 이미지 파일만 일시에 하나로 업데이트합니다.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase font-semibold">새 이미지 (URL 주소 또는 로컬 이미지 직접 업로드)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={bulkImageValue}
                    onChange={(e) => setBulkImageValue(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 font-mono"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-250 rounded-lg cursor-pointer text-xs font-semibold text-stone-700 transition-colors select-none">
                    <Upload size={13} />
                    <span>업로드</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, setBulkImageValue)} 
                    />
                  </label>
                </div>
                
                {/* Visual Preset Helpers */}
                <div className="flex gap-1.5 flex-wrap mt-1">
                  <span className="text-[9.5px] text-stone-400 flex items-center font-bold">빠른 이미지 배정:</span>
                  <button
                    type="button"
                    onClick={() => setBulkImageValue('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=300')}
                    className="text-[9.5px] text-stone-600 hover:text-stone-900 bg-stone-100 py-0.5 px-2 rounded-full cursor-pointer hover:bg-stone-200"
                  >
                    ☕ 커피
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkImageValue('https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&q=80&w=300')}
                    className="text-[9.5px] text-stone-600 hover:text-stone-900 bg-stone-100 py-0.5 px-2 rounded-full cursor-pointer hover:bg-stone-200"
                  >
                    🥛 라떼
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkImageValue('https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=300')}
                    className="text-[9.5px] text-stone-600 hover:text-stone-900 bg-stone-100 py-0.5 px-2 rounded-full cursor-pointer hover:bg-stone-200"
                  >
                    🍹 에이드/소다
                  </button>
                </div>
              </div>

              {bulkImageValue && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-400">이미지 미리보기</span>
                  <div className="p-2 border border-stone-150 bg-stone-50 rounded-xl flex items-center justify-center">
                    <img 
                      src={bulkImageValue} 
                      alt="Preview" 
                      referrerPolicy="no-referrer"
                      className="max-h-24 object-contain rounded-lg max-w-full"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }} 
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isBulkLoading || isUploading}
                className="w-full py-3 bg-stone-900 border border-stone-900 text-[#C5A059] disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-400 hover:bg-stone-850 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-colors pt-3 pb-3 mt-4 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Plus size={12} className="animate-spin" />
                    <span>이미지 생성 중...</span>
                  </>
                ) : isBulkLoading ? (
                  '이미지 일괄 적용 가공중...'
                ) : (
                  `선택된 ${selectedMenuIds.length}개 상품 이미지 일괄 일치`
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
