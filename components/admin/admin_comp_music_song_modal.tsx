import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AdminMusicSongFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: 'CREATE' | 'EDIT';
  formTitle: string;
  setFormTitle: (val: string) => void;
  formArtist: string;
  setFormArtist: (val: string) => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  formGenre: string;
  setFormGenre: (val: string) => void;
  formMood: string;
  setFormMood: (val: string) => void;
  formSoundUrl: string;
  setFormSoundUrl: (val: string) => void;
  formCoverUrl: string;
  setFormCoverUrl: (val: string) => void;
  formLyrics: string;
  setFormLyrics: (val: string) => void;
  formVisible: boolean;
  setFormVisible: (val: boolean) => void;
  formOwnerPick: boolean;
  setFormOwnerPick: (val: boolean) => void;
  handleSaveSong: (e: React.FormEvent) => void;
}

const GENRE_PRESETS = ["재즈", "보사노바", "어쿠스틱", "Lo-Fi", "인디팝", "클래식"];
const MOOD_PRESETS = ["맑음", "비", "눈", "나른", "집중", "로맨틱", "노을"];

export const AdminMusicSongFormModal: React.FC<AdminMusicSongFormModalProps> = ({
  isOpen,
  onClose,
  formMode,
  formTitle,
  setFormTitle,
  formArtist,
  setFormArtist,
  formDesc,
  setFormDesc,
  formGenre,
  setFormGenre,
  formMood,
  setFormMood,
  formSoundUrl,
  setFormSoundUrl,
  formCoverUrl,
  setFormCoverUrl,
  formLyrics,
  setFormLyrics,
  formVisible,
  setFormVisible,
  formOwnerPick,
  setFormOwnerPick,
  handleSaveSong
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-stone-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-8"
      >
        <div className="border-b border-stone-150 p-5 flex justify-between items-center bg-stone-50/50">
          <span className="text-sm font-black text-stone-800 tracking-wider">
            {formMode === 'CREATE' ? '새 BGM 노래 등록' : 'BGM 노래 카드 수정'}
          </span>
          <button
            onClick={onClose}
            className="p-1 px-2 text-stone-400 hover:text-stone-700 bg-stone-100 border border-stone-200 rounded-xl hover:bg-stone-200 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSaveSong} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 제목 & 아티스트 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-stone-700 text-xs font-bold block">노래 제목 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="비 내리는 오후의 센티멘탈 재즈"
                className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-stone-700 text-xs font-bold block">아티스트</label>
              <input
                type="text"
                value={formArtist}
                onChange={(e) => setFormArtist(e.target.value)}
                placeholder="헤이스트 어쿠스틱 오케스트라"
                className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <label className="text-stone-700 text-xs font-bold block">곡 소개 및 묘사</label>
            <input
              type="text"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="빗방울이 유리창을 노크할 때 어울리는 따뜻한 아날로그 재즈 선율입니다."
              className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
            />
          </div>

          {/* 장르 선택 */}
          <div className="space-y-1.5">
            <label className="text-stone-700 text-xs font-bold block">장르</label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {GENRE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormGenre(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    formGenre === preset
                      ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formGenre}
              onChange={(e) => setFormGenre(e.target.value)}
              placeholder="직접 입력하거나 위의 칩을 클릭하세요"
              className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
            />
          </div>

          {/* 무드(날씨) 선택 */}
          <div className="space-y-1.5">
            <label className="text-stone-700 text-xs font-bold block">무드 및 연동 날씨</label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {MOOD_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormMood(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    formMood === preset
                      ? 'bg-[#C5A059] border-[#C5A059] text-stone-950 shadow-sm font-black'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formMood}
              onChange={(e) => setFormMood(e.target.value)}
              placeholder="직접 입력하거나 위의 칩을 클릭하세요"
              className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
            />
          </div>

          {/* 음원 주소 & 커버 이미지 주소 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-stone-700 text-xs font-bold block">음원 재생 주소 (MP3 또는 YouTube) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={formSoundUrl}
                onChange={(e) => setFormSoundUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-stone-700 text-xs font-bold block">커버 이미지 주소</label>
              <input
                type="text"
                value={formCoverUrl}
                onChange={(e) => setFormCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* 가사 입력 */}
          <div className="space-y-1.5">
            <label className="text-stone-700 text-xs font-bold block">가사 (Lyrics)</label>
            <textarea
              value={formLyrics}
              onChange={(e) => setFormLyrics(e.target.value)}
              placeholder="이곳에 노래 가사를 입력하세요. 연주곡일 경우 [Inst.] 등의 표시를 해주면 좋습니다."
              rows={4}
              className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors resize-none font-sans"
            />
          </div>

          {/* 토글 체크박스들 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1 select-none">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formVisible}
                onChange={(e) => setFormVisible(e.target.checked)}
                className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
              />
              <span>감상실/플레이어에 즉시 노출</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formOwnerPick}
                onChange={(e) => setFormOwnerPick(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
              <span className="text-red-600 font-bold">OWNER&apos;S PICK 추천곡 지정</span>
            </label>
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-2.5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-300 text-stone-600 hover:text-stone-900 py-2.5 rounded-xl font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              작업 취소
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#C5A059] hover:bg-[#B38F46] text-stone-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
            >
              BGM 저장 및 게시
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
