import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AdminFilmsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: 'CREATE' | 'EDIT';
  formTitle: string;
  setFormTitle: (val: string) => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  formVideoUrl: string;
  setFormVideoUrl: (val: string) => void;
  formVisible: boolean;
  setFormVisible: (val: boolean) => void;
  formCategory: string[];
  handleCategoryChange: (cat: string, checked: boolean) => void;
  handleSaveFilm: (e: React.FormEvent) => void;
}

export const AdminFilmsFormModal: React.FC<AdminFilmsFormModalProps> = ({
  isOpen,
  onClose,
  formMode,
  formTitle,
  setFormTitle,
  formDesc,
  setFormDesc,
  formVideoUrl,
  setFormVideoUrl,
  formVisible,
  setFormVisible,
  formCategory,
  handleCategoryChange,
  handleSaveFilm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="dashboard-modal w-full max-w-lg"
          >
            <div className="dashboard-header">
              <span className="text-sm font-black text-stone-100 tracking-wider">
                {formMode === 'CREATE' ? '새로운 시네마틱 필름 등록' : '동영상 필름 카드 편집 수정'}
              </span>
              <button
                onClick={onClose}
                className="p-1 px-2 text-stone-400 hover:text-stone-100 bg-stone-800 border border-stone-700 rounded-xl hover:bg-stone-850 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveFilm} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-stone-400 text-xs font-bold block">필름 제목 (Title) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="비주얼 에스프레소 축제 세레모니"
                  className="dashboard-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-400 text-xs font-bold block">동영상 설명 및 내용 (Description) <span className="text-rose-500">*</span></label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="이 동영상의 구체적인 메인 가치와 비주얼 연출 테스크를 서술합니다."
                  rows={3}
                  className="dashboard-textarea"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-400 text-xs font-bold block">영상 게재 위치 (중복 선택 가능) <span className="text-rose-500">*</span></label>
                <div className="flex flex-wrap gap-4 bg-stone-955 border border-stone-800 rounded-xl px-4 py-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formCategory.includes('THEATER')}
                      onChange={(e) => handleCategoryChange('THEATER', e.target.checked)}
                      className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                    />
                    <span>홍보관</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formCategory.includes('BRAND1')}
                      onChange={(e) => handleCategoryChange('BRAND1', e.target.checked)}
                      className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                    />
                    <span>브랜드1</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formCategory.includes('BRAND2')}
                      onChange={(e) => handleCategoryChange('BRAND2', e.target.checked)}
                      className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                    />
                    <span>브랜드2</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-400 text-xs font-bold block">동영상 스트리밍 링크 (URL) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://assets.mixkit.co/... .mp4 또는 YouTube 공유 주소"
                  className="dashboard-input font-mono"
                />
                <p className="text-[10px] text-stone-550 pt-0.5">
                  * 표준 MP4 동영상 파일 주소 및 일반 YouTube 주소가 정상 호출 및 재생 처리됩니다.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="film-visible-checkbox"
                  type="checkbox"
                  checked={formVisible}
                  onChange={(e) => setFormVisible(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                />
                <label htmlFor="film-visible-checkbox" className="text-stone-400 text-xs font-medium cursor-pointer select-none">
                  사용자 가시성이 확보된 고유한 노출 상태로 유지 (노출 체크)
                </label>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="dashboard-btn-dark flex-1"
                >
                  작업 취소
                </button>
                <button
                  type="submit"
                  className="dashboard-btn-gold flex-1"
                >
                  데이터 저장 및 게재
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
