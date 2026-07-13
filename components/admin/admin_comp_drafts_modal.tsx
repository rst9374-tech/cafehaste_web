import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RefreshCw } from 'lucide-react';
import { AdminConfirmModal } from './admin_comp_shared';

interface DraftsModalProps {
  isDraftModalOpen: boolean;
  setIsDraftModalOpen: (val: boolean) => void;
  draftFormMode: 'CREATE' | 'EDIT';
  draftFormTag: string;
  setDraftFormTag: (val: string) => void;
  draftFormSlogan: string;
  setDraftFormSlogan: (val: string) => void;
  draftFormSubtext: string;
  setDraftFormSubtext: (val: string) => void;
  draftFormBgImage: string;
  setDraftFormBgImage: (val: string) => void;
  draftFormDesc: string;
  setDraftFormDesc: (val: string) => void;
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, setValue: (val: string) => void) => void;
  handleSaveDraft: (e: React.FormEvent) => void;
  confirmModal: { message: string; onConfirm: () => void } | null;
  setConfirmModal: (val: { message: string; onConfirm: () => void } | null) => void;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({
  isDraftModalOpen,
  setIsDraftModalOpen,
  draftFormMode,
  draftFormTag,
  setDraftFormTag,
  draftFormSlogan,
  setDraftFormSlogan,
  draftFormSubtext,
  setDraftFormSubtext,
  draftFormBgImage,
  setDraftFormBgImage,
  draftFormDesc,
  setDraftFormDesc,
  isUploading,
  handleFileChange,
  handleSaveDraft,
  confirmModal,
  setConfirmModal
}) => {
  return (
    <>
      <AnimatePresence>
        {isDraftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDraftModalOpen(false)}
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
                  Draft Editorial Form
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {draftFormMode === 'EDIT' ? '디자인 변경 수정하기' : '새로운 기획 디자인 글쓰기'}
                </h3>
              </div>

              <form onSubmit={handleSaveDraft} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">태그 및 기획 분류 (Tag)</label>
                  <input
                    type="text"
                    required
                    value={draftFormTag}
                    onChange={(e) => setDraftFormTag(e.target.value)}
                    placeholder="Concept 01 / CERAMIC"
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">메인 슬로건 문구 (Slogan)</label>
                  <input
                    type="text"
                    required
                    value={draftFormSlogan}
                    onChange={(e) => setDraftFormSlogan(e.target.value)}
                    placeholder="따스한 햇살 아래 스며드는 우드의 영원함"
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">하위 타이포 부제 (Subtext)</label>
                  <input
                    type="text"
                    value={draftFormSubtext}
                    onChange={(e) => setDraftFormSubtext(e.target.value)}
                    placeholder="STURDY WOOD BAR & SOLEMN CLAY FACADE"
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">상세 기획 해설 (Description)</label>
                  <textarea
                    rows={3}
                    value={draftFormDesc}
                    onChange={(e) => setDraftFormDesc(e.target.value)}
                    placeholder="에스프레소 장비와 크라프트 상자 및 세라믹 컵이 자아내는 오가닉 감성 레이아웃 디자인"
                    className="w-full text-xs font-light p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">
                    슬라이드 배경 이미지 파일 로드 / 첨부 (Upload Photo)
                  </label>
                  <div className="flex gap-3 items-center">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-250 rounded-lg cursor-pointer text-xs font-semibold text-stone-700 transition-colors select-none">
                      <Upload size={13} />
                      <span>파일 선택</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, setDraftFormBgImage)} 
                        className="hidden" 
                      />
                    </label>
                    <div className="text-[9px] text-stone-400 font-mono truncate max-w-[200px] flex-1">
                      {draftFormBgImage.startsWith('data:') ? '✓ 이미지 파일 올리기 승인' : draftFormBgImage}
                    </div>
                    {draftFormBgImage && (
                      <div className="w-12 h-10 rounded overflow-hidden border border-stone-200 bg-stone-150 flex-shrink-0">
                        <img src={draftFormBgImage} alt="bg view" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 justify-end pt-4 border-t border-stone-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsDraftModalOpen(false)}
                    className="px-4 py-2.5 border border-stone-255 text-stone-600 hover:bg-stone-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
                    ) : draftFormMode === 'EDIT' ? (
                      '디자인 저장완료(Update)'
                    ) : (
                      '신규 디자인 글쓰기(Create)'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {confirmModal && (
        <AdminConfirmModal
          message={confirmModal.message}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
        />
      )}
    </>
  );
};
