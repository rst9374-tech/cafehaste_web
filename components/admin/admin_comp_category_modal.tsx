import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminCategoryModalProps {
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  categoryFormMode: 'CREATE' | 'EDIT';
  categoryFormId: string;
  setCategoryFormId: (id: string) => void;
  categoryFormName: string;
  setCategoryFormName: (name: string) => void;
  categoryFormDesc: string;
  setCategoryFormDesc: (desc: string) => void;
  categoryFormVisible: boolean;
  setCategoryFormVisible: (visible: boolean) => void;
  handleSaveCategory: (e: React.FormEvent) => void;
}

export const AdminCategoryModal: React.FC<AdminCategoryModalProps> = ({
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  categoryFormMode,
  categoryFormId,
  setCategoryFormId,
  categoryFormName,
  setCategoryFormName,
  categoryFormDesc,
  setCategoryFormDesc,
  categoryFormVisible,
  setCategoryFormVisible,
  handleSaveCategory
}) => {
  return (
    <AnimatePresence>
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCategoryModalOpen(false)}
            className="absolute inset-0 bg-stone-900" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl z-10 font-sans"
          >
            <div className="mb-6 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#C5A059] font-bold uppercase block mb-1">
                  Category Setup Board
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {categoryFormMode === 'EDIT' ? '대분류 카테고리 수정' : '새 카테고리 글쓰기'}
                </h3>
              </div>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 px-2.5 text-xs text-stone-400 hover:text-stone-800 bg-stone-50 rounded cursor-pointer font-bold"
              >✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">카테고리 ID 코드 (수정불가, 영어대문자)</label>
                <input
                  type="text"
                  required
                  disabled={categoryFormMode === 'EDIT'}
                  value={categoryFormId}
                  onChange={(e) => setCategoryFormId(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  placeholder="예: AMERICANO, COFFEE_LATTE, MILK_LATTE"
                  className="w-full text-xs font-semibold p-3 bg-stone-50 disabled:opacity-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase font-semibold">카테고리 표시 한글/영문명 (필수)</label>
                <input
                  type="text"
                  required
                  value={categoryFormName}
                  onChange={(e) => setCategoryFormName(e.target.value)}
                  placeholder="예: 커피 (Espresso)"
                  className="w-full text-xs font-bold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase font-normal">카테고리 세부 설명 (선택)</label>
                <textarea
                  rows={2}
                  value={categoryFormDesc}
                  onChange={(e) => setCategoryFormDesc(e.target.value)}
                  placeholder="추출 온도 제어 시스템으로 일관성을 높인 시그니처 카테고리"
                  className="w-full text-xs font-light p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat_visible_chk"
                  checked={categoryFormVisible}
                  onChange={(e) => setCategoryFormVisible(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 cursor-pointer text-stone-900"
                />
                <label htmlFor="cat_visible_chk" className="text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  사용자 쇼핑 인터페이스에 카테고리를 그대로 노출합니다.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 border border-stone-900 text-[#C5A059] hover:bg-stone-850 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-colors pt-3 pb-3 mt-4 cursor-pointer"
              >
                {categoryFormMode === 'EDIT' ? '수정 데이터 완료 저장' : '새 카테고리 등록 게시하기'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
