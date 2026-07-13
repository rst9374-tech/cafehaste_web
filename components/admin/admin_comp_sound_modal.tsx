import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AdminSoundFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: 'CREATE' | 'EDIT';
  formTitle: string;
  setFormTitle: (val: string) => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  formSoundUrl: string;
  setFormSoundUrl: (val: string) => void;
  formVisible: boolean;
  setFormVisible: (val: boolean) => void;
  handleSaveSound: (e: React.FormEvent) => void;
}

export const AdminSoundFormModal: React.FC<AdminSoundFormModalProps> = ({
  isOpen,
  onClose,
  formMode,
  formTitle,
  setFormTitle,
  formDesc,
  setFormDesc,
  formSoundUrl,
  setFormSoundUrl,
  formVisible,
  setFormVisible,
  handleSaveSound
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-stone-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="border-b border-stone-150 p-5 flex justify-between items-center bg-stone-50/50">
          <span className="text-sm font-black text-stone-800 tracking-wider">
            {formMode === 'CREATE' ? '새로운 사운드 등록' : '사운드 카드 편집 수정'}
          </span>
          <button
            onClick={onClose}
            className="p-1 px-2 text-stone-400 hover:text-stone-700 bg-stone-100 border border-stone-200 rounded-xl hover:bg-stone-200 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSaveSound} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-stone-700 text-xs font-bold block">음악 제목 (Title) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Lo-fi Chill beats for work"
              className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-3 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-stone-700 text-xs font-bold block">설명 및 코멘트 (Description) <span className="text-rose-500">*</span></label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="헤이스트 매장에 어울리는 감각적인 로파이 비트입니다."
              rows={3}
              className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-3 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-stone-700 text-xs font-bold block">사운드 링크 URL (선택)</label>
            <input
              type="text"
              value={formSoundUrl}
              onChange={(e) => setFormSoundUrl(e.target.value)}
              placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
              className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-3 text-stone-900 text-xs placeholder-stone-450 focus:outline-none transition-colors font-mono"
            />
            <p className="text-[10px] text-stone-500 pt-0.5 leading-relaxed">
              * 표준 MP3 오디오 주소를 입력하면 사용자 화면의 필름홍보관 옆 오디오 플레이어와 실시간 연동되어 재생됩니다.
              <br />
              <span className="text-[#C5A059] font-semibold">* 구글 드라이브 폴더 주소는 재생이 불가합니다. 반드시 폴더 내부의 개별 음악 파일 우클릭 후 &apos;링크 복사&apos;를 통해 개별 파일 공유 주소를 등록해주세요.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="sound-visible-checkbox"
              type="checkbox"
              checked={formVisible}
              onChange={(e) => setFormVisible(e.target.checked)}
              className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
            />
            <label htmlFor="sound-visible-checkbox" className="text-stone-700 text-xs font-medium cursor-pointer select-none">
              사용자 가시성이 확보된 고유한 노출 상태로 유지 (노출 체크)
            </label>
          </div>

          <div className="flex gap-2.5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-300 text-stone-600 hover:text-stone-900 py-3 rounded-xl font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              작업 취소
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#C5A059] hover:bg-[#B38F46] text-stone-950 font-extrabold py-3 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
            >
              데이터 저장 및 게재
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
