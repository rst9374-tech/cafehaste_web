import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RefreshCw } from 'lucide-react';

interface AdminDesignModalProps {
  isInteriorModalOpen: boolean;
  setIsInteriorModalOpen: (open: boolean) => void;
  interiorFormMode: 'CREATE' | 'EDIT';
  interiorFormId: string;
  setInteriorFormId: (id: string) => void;
  interiorFormTitle: string;
  setInteriorFormTitle: (title: string) => void;
  interiorFormSubtitle: string;
  setInteriorFormSubtitle: (sub: string) => void;
  interiorFormDesc: string;
  setInteriorFormDesc: (desc: string) => void;
  interiorFormTags: string;
  setInteriorFormTags: (tags: string) => void;
  interiorFormGallery: string[];
  interiorFormVideoLinks: string[];
  setInteriorFormVideoLinks: React.Dispatch<React.SetStateAction<string[]>>;
  isUploading: boolean;
  handleSaveInterior: (e: React.FormEvent) => void;
  handleGalleryFileChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
}

export const AdminDesignModal: React.FC<AdminDesignModalProps> = ({
  isInteriorModalOpen,
  setIsInteriorModalOpen,
  interiorFormMode,
  interiorFormId,
  setInteriorFormId,
  interiorFormTitle,
  setInteriorFormTitle,
  interiorFormSubtitle,
  setInteriorFormSubtitle,
  interiorFormDesc,
  setInteriorFormDesc,
  interiorFormTags,
  setInteriorFormTags,
  interiorFormGallery,
  interiorFormVideoLinks,
  setInteriorFormVideoLinks,
  isUploading,
  handleSaveInterior,
  handleGalleryFileChange
}) => {
  return (
    <AnimatePresence>
      {isInteriorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsInteriorModalOpen(false)}
            className="absolute inset-0 bg-stone-900" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10"
          >
            <div className="mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#C5A059] font-bold uppercase block mb-1">
                Franchise Design Board Form
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {interiorFormMode === 'EDIT' ? '디자인 게시글 수정하기' : '새로운 디자인 게시글 글쓰기'}
              </h3>
            </div>

            <form onSubmit={handleSaveInterior} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">스타일고유 코드 (Code ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="TYPE3"
                    disabled={interiorFormMode === 'EDIT'}
                    value={interiorFormId}
                    onChange={(e) => setInteriorFormId(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 disabled:opacity-50 text-stone-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">지점스타일 명칭 (Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="타입 03: 가든 포레스트 사색"
                    value={interiorFormTitle}
                    onChange={(e) => setInteriorFormTitle(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">서브 슬로건 테마 (Subtitle)</label>
                <input
                  type="text"
                  value={interiorFormSubtitle}
                  onChange={(e) => setInteriorFormSubtitle(e.target.value)}
                  placeholder="싱그러운 식물군과 프라이빗 아늑한 조명"
                  className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">공간 테마 포괄 해설 (Description)</label>
                <textarea
                  rows={2}
                  value={interiorFormDesc}
                  onChange={(e) => setInteriorFormDesc(e.target.value)}
                  placeholder="자연미와 우디 오크 상판 하프를 레이어한 전산 제어형 매장 배치 공간 테마 구성입니다."
                  className="w-full text-xs font-light p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 leading-relaxed text-stone-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">카테고리 태그 분류 (콤마구분)</label>
                <input
                  type="text"
                  value={interiorFormTags}
                  onChange={(e) => setInteriorFormTags(e.target.value)}
                  placeholder="아이보리 미장, 노출 콘크리트, 황동 에칭 데칼"
                  className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900"
                />
              </div>

              <div className="flex flex-col gap-2.5 pt-2 border-t border-stone-100">
                <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase block">
                  완공 매장 사진 최대 3장 파일 첨부 (Attach Photos)
                </label>
                
                {[0, 1, 2].map((gIdx) => (
                  <div key={gIdx} className="flex flex-col gap-2 p-3 bg-stone-50 border border-stone-150 rounded-xl">
                    <div className="flex gap-3 items-center text-xs">
                      <span className="w-4 text-stone-400 font-mono font-bold">{gIdx + 1}</span>
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-250 rounded-lg cursor-pointer text-[11px] font-semibold text-stone-700 transition-colors select-none shrink-0">
                        <Upload size={12} />
                        <span>사진 올리기</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleGalleryFileChange(e, gIdx)} 
                          className="hidden" 
                        />
                      </label>
                      <div className="text-[9px] text-stone-400 font-mono truncate max-w-[150px] flex-1">
                        {interiorFormGallery[gIdx]?.startsWith('data:') ? '✓ 첨부 완불' : interiorFormGallery[gIdx] ? '기본 이미지 장착' : '비어있음'}
                      </div>
                      {interiorFormGallery[gIdx] && (
                        <div className="w-10 h-8 rounded border overflow-hidden bg-stone-150 shrink-0">
                          <img src={interiorFormGallery[gIdx]} alt="interior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 pl-7">
                      <span className="text-[9px] font-bold text-stone-400 font-mono tracking-wider uppercase shrink-0">동영상 링크</span>
                      <input
                        type="text"
                        placeholder="https://youtu.be/... 또는 MP4 동영상 주소"
                        value={interiorFormVideoLinks[gIdx] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInteriorFormVideoLinks((prev) => {
                            const copied = [...prev];
                            copied[gIdx] = val;
                            return copied;
                          });
                        }}
                        className="flex-1 text-[10px] font-semibold p-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 text-stone-900"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2.5 justify-end pt-4 border-t border-stone-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsInteriorModalOpen(false)}
                  className="px-4 py-2.5 border border-stone-250 text-stone-600 hover:bg-stone-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md disabled:bg-stone-400 disabled:text-stone-200 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>이미지 생성 중...</span>
                    </>
                  ) : interiorFormMode === 'EDIT' ? (
                    '게시글 저장(Update)'
                  ) : (
                    '디자인 게시판 글쓰기(Create)'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
