import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';

interface AdminMenuModalProps {
  isMenuModalOpen: boolean;
  setIsMenuModalOpen: (open: boolean) => void;
  menuFormMode: 'CREATE' | 'EDIT';
  menuFormId: string;
  setMenuFormId: (id: string) => void;
  menuFormName: string;
  setMenuFormName: (name: string) => void;
  menuFormNameKr: string;
  setMenuFormNameKr: (nameKr: string) => void;
  menuFormCategory: string;
  setMenuFormCategory: (category: string) => void;
  adminCategories: any[];
  menuFormImage: string;
  setMenuFormImage: (image: string) => void;
  menuFormDesc: string;
  setMenuFormDesc: (desc: string) => void;
  menuFormVisible: boolean;
  setMenuFormVisible: (visible: boolean) => void;
  menuFormIsSignature: boolean;
  setMenuFormIsSignature: (sig: boolean) => void;
  menuFormVideoUrl: string;
  setMenuFormVideoUrl: (url: string) => void;
  
  handleSaveMenuItem: (e: React.FormEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, setValue: (val: string) => void) => void;
  isUploading: boolean;
}

export const AdminMenuModal: React.FC<AdminMenuModalProps> = ({
  isMenuModalOpen,
  setIsMenuModalOpen,
  menuFormMode,
  menuFormId,
  setMenuFormId,
  menuFormName,
  setMenuFormName,
  menuFormNameKr,
  setMenuFormNameKr,
  menuFormCategory,
  setMenuFormCategory,
  adminCategories,
  menuFormImage,
  setMenuFormImage,
  menuFormDesc,
  setMenuFormDesc,
  menuFormVisible,
  setMenuFormVisible,
  menuFormIsSignature,
  setMenuFormIsSignature,
  menuFormVideoUrl,
  setMenuFormVideoUrl,
  handleSaveMenuItem,
  handleFileChange,
  isUploading
}) => {
  return (
    <AnimatePresence>
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuModalOpen(false)}
            className="absolute inset-0 bg-stone-900" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 font-sans"
          >
            <div className="mb-6 flex justify-between items-start font-sans">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#C5A059] font-bold uppercase block mb-1">
                  Drink Recipe Board Form
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {menuFormMode === 'EDIT' ? '음료 메뉴 상세 수정하기' : '신규 음료 메뉴 등록 글쓰기'}
                </h3>
              </div>
              <button 
                onClick={() => setIsMenuModalOpen(false)}
                className="p-1 px-3 text-xs text-stone-400 hover:text-stone-850 bg-stone-50 rounded font-extrabold cursor-pointer"
              >✕</button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4 font-sans justify-normal flex flex-col gap-0.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">음료명 (한글 본명) [필수]</label>
                  <input
                    type="text"
                    required
                    value={menuFormNameKr}
                    onChange={(e) => setMenuFormNameKr(e.target.value)}
                    placeholder="예: 청포도 에이드, 바닐라 라떼"
                    className="w-full text-xs font-bold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">음료명 (영문 표식명)</label>
                  <input
                    type="text"
                    required
                    value={menuFormName}
                    onChange={(e) => setMenuFormName(e.target.value)}
                    placeholder="예: Green Grape Ade, Vanilla Latte"
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">음료 식별 코드 (ID) [수정불가]</label>
                  <input
                    type="text"
                    required
                    disabled={menuFormMode === 'EDIT'}
                    value={menuFormId}
                    onChange={(e) => setMenuFormId(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    placeholder="예: DRINK_LATTE"
                    className="w-full text-xs font-semibold p-3 bg-stone-50 disabled:opacity-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase font-semibold">소속 카테고리 [필수]</label>
                  <select
                    value={menuFormCategory}
                    onChange={(e) => setMenuFormCategory(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 cursor-pointer"
                  >
                    {adminCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase font-semibold">음료 대표 사진 (URL 주소 또는 로컬 업로드) [필수]</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={menuFormImage}
                    onChange={(e) => setMenuFormImage(e.target.value)}
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
                      onChange={(e) => handleFileChange(e, setMenuFormImage)} 
                    />
                  </label>
                </div>
                {/* Visual Preset Helpers - 4 beautiful templates for instant creation */}
                <div className="flex gap-1.5 flex-wrap mt-1">
                  <span className="text-[9.5px] text-stone-400 flex items-center font-bold">빠른 이미지 배정:</span>
                  <button
                    type="button"
                    onClick={() => setMenuFormImage('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=300')}
                    className="text-[9.5px] text-stone-600 hover:text-stone-900 bg-stone-100 py-0.5 px-2 rounded-full cursor-pointer hover:bg-stone-200"
                  >
                    ☕ 커피
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFormImage('https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&q=80&w=300')}
                    className="text-[9.5px] text-stone-600 hover:text-stone-900 bg-stone-100 py-0.5 px-2 rounded-full cursor-pointer hover:bg-stone-200"
                  >
                    🥛 라떼
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFormImage('https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=300')}
                    className="text-[9.5px] text-stone-600 hover:text-stone-900 bg-stone-100 py-0.5 px-2 rounded-full cursor-pointer hover:bg-stone-200"
                  >
                    🍹 에이드/소다
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFormImage('https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=300')}
                    className="text-[9.5px] text-stone-600 hover:text-stone-900 bg-stone-100 py-0.5 px-2 rounded-full cursor-pointer hover:bg-stone-200"
                  >
                    🍑 아이스티/밀크티
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase font-semibold">음료 소개 동영상 링크 (선택)</label>
                <input
                  type="text"
                  value={menuFormVideoUrl}
                  onChange={(e) => setMenuFormVideoUrl(e.target.value)}
                  placeholder="예: https://www.youtube.com/watch?v=... 또는 https://assets.mixkit.co/..."
                  className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">대표 레시피 설명 (선택)</label>
                <textarea
                  rows={2}
                  value={menuFormDesc}
                  onChange={(e) => setMenuFormDesc(e.target.value)}
                  placeholder="신선한 원재료의 청량함과 풍부한 영양소 밸런스를 간직한 헤이스트 엄선 시그니처 음료"
                  className="w-full text-xs font-light p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 pointer-events-auto leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <input
                  type="checkbox"
                  id="menu_visible_chk"
                  checked={menuFormVisible}
                  onChange={(e) => setMenuFormVisible(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 cursor-pointer text-stone-900"
                />
                <label htmlFor="menu_visible_chk" className="text-xs font-bold text-stone-700 cursor-pointer select-none">
                  사용자 쇼핑 및 오더 디렉토리에 전체 공개로 즉시 노출시킵니다. [노출상태]
                </label>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-stone-100 mb-2">
                <input
                  type="checkbox"
                  id="menu_is_signature_chk"
                  checked={menuFormIsSignature}
                  onChange={(e) => setMenuFormIsSignature(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 cursor-pointer text-stone-900"
                />
                <label htmlFor="menu_is_signature_chk" className="text-xs font-bold text-stone-700 cursor-pointer select-none">
                  홈페이지 메인 화면의 [HASTE SIGNATURE 4 DRINKS] 대표음료 구역에 노출합니다. [시그니처 설정]
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-stone-900 border border-stone-900 text-[#C5A059] hover:bg-stone-850 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-colors pt-3 pb-3 mt-4 cursor-pointer disabled:bg-stone-400 disabled:border-stone-400 disabled:text-stone-200 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Plus size={12} className="animate-spin" />
                    <span>이미지 생성 중...</span>
                  </>
                ) : menuFormMode === 'EDIT' ? (
                  '수정 데이터 게시판에 최종 저장'
                ) : (
                  '새 음료 메뉴 게시글 등록 저장'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
