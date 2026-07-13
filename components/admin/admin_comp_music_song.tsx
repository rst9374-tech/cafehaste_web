import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Play, Pause, Plus, Trash2, Edit, Eye, EyeOff, Volume2, AlertCircle, GripVertical
} from 'lucide-react';
import { AdminConfirmModal } from './admin_comp_shared';
import { AdminMusicSongFormModal } from './admin_comp_music_song_modal';
import { adminFetch } from './admin_utils_api';

export interface StandaloneSong {
  id: number;
  title: string;
  artist?: string;
  desc?: string;
  genre?: string;
  mood?: string;
  soundUrl: string;
  coverUrl?: string;
  lyrics?: string;
  visible: boolean;
  orderIndex: number;
  ownerPick?: boolean;
}

interface AdminMusicSongTabProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
}

export const AdminMusicSongTab: React.FC<AdminMusicSongTabProps> = ({
  showTemporaryToast,
  showTemporaryError,
  renderPagination
}) => {
  const [songs, setSongs] = useState<StandaloneSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Audio Playback
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formId, setFormId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formMood, setFormMood] = useState('');
  const [formSoundUrl, setFormSoundUrl] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formLyrics, setFormLyrics] = useState('');
  const [formVisible, setFormVisible] = useState(true);
  const [formOwnerPick, setFormOwnerPick] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchSongs = async () => {
    setIsLoading(true);
    const res = await adminFetch('/api/music/songs', { showTemporaryError });
    if (res.success && res.data) {
      setSongs(res.data.songs || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSongs();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePlaySound = (song: StandaloneSong) => {
    if (getYoutubeId(song.soundUrl)) {
      showTemporaryError('유튜브 영상 음악은 관리자 미리보기 재생이 불가합니다. 감상실 페이지에서는 정상 재생됩니다.');
      return;
    }

    if (playingId === song.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(song.soundUrl);
      audioRef.current.play().then(() => {
        setPlayingId(song.id);
        audioRef.current!.onended = () => setPlayingId(null);
      }).catch(() => {
        showTemporaryError('재생 실패: 유효하지 않은 오디오 링크입니다.');
        setPlayingId(null);
      });
    }
  };

  const handleReorder = async (newOrder: StandaloneSong[]) => {
    setSongs(newOrder);
    const reorderedIds = newOrder.map(s => s.id);
    const res = await adminFetch('/api/music/songs/reorder', {
      method: 'PUT',
      body: JSON.stringify({ reorderedIds }),
      showTemporaryToast,
      showTemporaryError,
      successMessage: 'BGM 정렬 순서가 저장되었습니다.'
    });
    if (res.success) {
      window.dispatchEvent(new Event('haste_bgm_updated'));
    }
  };

  const handleOpenCreateModal = () => {
    setFormMode('CREATE');
    setFormId(null);
    setFormTitle('');
    setFormArtist('');
    setFormDesc('');
    setFormGenre('');
    setFormMood('');
    setFormSoundUrl('');
    setFormCoverUrl('');
    setFormLyrics('');
    setFormVisible(true);
    setFormOwnerPick(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (song: StandaloneSong) => {
    setFormMode('EDIT');
    setFormId(song.id);
    setFormTitle(song.title || '');
    setFormArtist(song.artist || '');
    setFormDesc(song.desc || '');
    setFormGenre(song.genre || '');
    setFormMood(song.mood || '');
    setFormSoundUrl(song.soundUrl || '');
    setFormCoverUrl(song.coverUrl || '');
    setFormLyrics(song.lyrics || '');
    setFormVisible(!!song.visible);
    setFormOwnerPick(!!song.ownerPick);
    setIsModalOpen(true);
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return showTemporaryError('곡 제목을 입력해주세요.');
    if (!formSoundUrl.trim()) return showTemporaryError('재생 주소를 입력해주세요.');

    const payload = {
      title: formTitle,
      artist: formArtist,
      desc: formDesc,
      genre: formGenre,
      mood: formMood,
      soundUrl: formSoundUrl,
      coverUrl: formCoverUrl,
      lyrics: formLyrics,
      visible: formVisible,
      ownerPick: formOwnerPick
    };

    const url = formMode === 'CREATE' ? '/api/music/songs' : `/api/music/songs/${formId}`;
    const method = formMode === 'CREATE' ? 'POST' : 'PUT';

    const res = await adminFetch(url, {
      method,
      body: JSON.stringify(payload),
      showTemporaryToast,
      showTemporaryError,
      successMessage: formMode === 'CREATE' ? '새 BGM이 등록되었습니다.' : 'BGM이 수정되었습니다.'
    });

    if (res.success) {
      setIsModalOpen(false);
      fetchSongs();
      window.dispatchEvent(new Event('haste_bgm_updated'));
    }
  };

  const handleToggleVisibility = async (song: StandaloneSong) => {
    const res = await adminFetch(`/api/music/songs/${song.id}/toggle-visibility`, {
      method: 'PUT',
      body: JSON.stringify({ visible: !song.visible }),
      showTemporaryToast,
      showTemporaryError,
      successMessage: `"${song.title}" 노출 상태가 변경되었습니다.`
    });
    if (res.success) {
      fetchSongs();
      window.dispatchEvent(new Event('haste_bgm_updated'));
    }
  };

  const handleDeleteSong = async (id: number) => {
    setConfirmModal({
      message: '해당 BGM 카드를 정말 삭제하시겠습니까?',
      onConfirm: async () => {
        const res = await adminFetch(`/api/music/songs/${id}`, {
          method: 'DELETE',
          showTemporaryToast,
          showTemporaryError,
          successMessage: 'BGM이 정상적으로 삭제되었습니다.'
        });
        if (res.success) {
          if (playingId === id) {
            if (audioRef.current) audioRef.current.pause();
            setPlayingId(null);
          }
          fetchSongs();
          window.dispatchEvent(new Event('haste_bgm_updated'));
        }
      }
    });
  };

  const totalPages = Math.ceil(songs.length / itemsPerPage);
  const currentSongs = songs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div id="admin-music-board-wrapper" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent py-1 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 select-none cursor-pointer bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl">
            <input 
              type="checkbox"
              checked={currentSongs.length > 0 && currentSongs.every(f => selectedIds.includes(f.id))}
              onChange={(e) => {
                if (e.target.checked) {
                  const pageIds = currentSongs.map(f => f.id);
                  setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
                } else {
                  const pageIds = currentSongs.map(f => f.id);
                  setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                }
              }}
              className="w-3.5 h-3.5 accent-[#C5A059] rounded cursor-pointer"
            />
            <span>전체선택</span>
          </label>
          
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                setConfirmModal({
                  message: `선택한 ${selectedIds.length}개의 BGM을 일괄 삭제하시겠습니까?`,
                  onConfirm: async () => {
                    setIsLoading(true);
                    try {
                      await Promise.all(
                        selectedIds.map(id =>
                          fetch(`/api/music/songs/${id}`, { method: 'DELETE' })
                        )
                      );
                      showTemporaryToast('선택한 BGM이 일괄 삭제되었습니다.');
                      setSelectedIds([]);
                      fetchSongs();
                      window.dispatchEvent(new Event('haste_bgm_updated'));
                    } catch (err: any) {
                      showTemporaryError('일괄 삭제 중 오류: ' + err.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                });
              }}
              className="admin-btn-action admin-btn-action-danger"
            >
              <Trash2 size={11} className="mr-1" />
              <span>선택 일괄 삭제 ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none bg-[#C5A059] hover:bg-[#B38F46] text-stone-950 font-black py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus size={13} className="stroke-[3]" />
            <span>음악 추가</span>
          </button>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-500 gap-3">
          <AlertCircle size={32} className="text-stone-400" />
          <p className="text-xs tracking-wider">등록된 음악이 없습니다. ‘음악 추가’ 버튼을 눌러 등록해주세요.</p>
        </div>
      ) : (
        <Reorder.Group 
          values={songs} 
          onReorder={handleReorder} 
          axis="y" 
          className="flex flex-col gap-3 select-none"
        >
          {songs.map((song) => {
            const isPlaying = playingId === song.id;
            return (
              <Reorder.Item
                value={song}
                key={song.id}
                id={String(song.id)}
                className={`group border rounded-2xl overflow-hidden transition-all duration-300 bg-white flex flex-col sm:flex-row items-stretch sm:items-center p-3.5 gap-4 cursor-grab active:cursor-grabbing ${
                  song.visible 
                    ? 'border-stone-200 hover:border-stone-300 hover:shadow-md' 
                    : 'border-dashed border-stone-250 opacity-60 bg-stone-50/30'
                }`}
              >
                <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="text-stone-400 group-hover:text-stone-600 transition-colors cursor-row-resize py-2 px-1">
                    <GripVertical size={16} />
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(song.id)}
                    onChange={() => {
                      setSelectedIds(prev => 
                        prev.includes(song.id) ? prev.filter(id => id !== song.id) : [...prev, song.id]
                      );
                    }}
                    className="w-3.5 h-3.5 accent-[#C5A059] rounded cursor-pointer"
                  />
                </div>

                <div 
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm border shrink-0 ${
                    isPlaying 
                      ? 'bg-emerald-600 border-emerald-500 text-white animate-pulse' 
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-800'
                  }`}
                  onClick={() => handlePlaySound(song)}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </div>

                {/* Cover thumbnail */}
                {song.coverUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 shrink-0 hidden sm:block">
                    <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-red-500 text-[9px] font-mono font-bold bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Volume2 size={8} />
                      BGM
                    </span>
                    {song.ownerPick && (
                      <span className="text-rose-600 text-[8px] font-bold border border-rose-200 bg-rose-50/50 px-1 py-0.2 rounded">
                        PICK
                      </span>
                    )}
                    <h3 className="text-stone-900 font-bold text-sm tracking-tight truncate max-w-xs sm:max-w-md">
                      {song.title} {song.artist ? ` - ${song.artist}` : ''}
                    </h3>
                  </div>
                  <p className="text-stone-650 font-sans font-light text-[11px] leading-relaxed line-clamp-1">
                    {song.desc}
                  </p>
                  <div className="font-mono text-[9px] text-stone-400 truncate max-w-xs sm:max-w-md select-all">
                    {song.soundUrl}
                  </div>
                </div>

                <div 
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3 justify-between sm:justify-end flex-shrink-0" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm ${
                      song.visible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {song.visible ? '노출중' : '숨김'}
                    </span>
                    {song.genre && (
                      <span className="text-stone-500 text-[9px] font-mono bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
                        {song.genre}
                      </span>
                    )}
                    {song.mood && (
                      <span className="text-[#C5A059] text-[9px] font-mono bg-[#C5A059]/10 border border-[#C5A059]/20 px-1.5 py-0.5 rounded">
                        #{song.mood}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleVisibility(song)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        song.visible 
                          ? 'border-emerald-100 text-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/50' 
                          : 'border-stone-200 text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                      }`}
                      title={song.visible ? "숨기기" : "노출시키기"}
                    >
                      {song.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(song)}
                      className="p-2 border border-stone-200 text-stone-500 hover:text-[#C5A059] hover:border-[#C5A059]/40 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                      title="수정하기"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteSong(song.id)}
                      className="p-2 border border-stone-200 hover:border-rose-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {totalPages > 1 && (
        <div className="pt-4">
          {renderPagination(currentPage, totalPages, setCurrentPage)}
        </div>
      )}

      <AnimatePresence>
        <AdminMusicSongFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formMode={formMode}
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formArtist={formArtist}
          setFormArtist={setFormArtist}
          formDesc={formDesc}
          setFormDesc={setFormDesc}
          formGenre={formGenre}
          setFormGenre={setFormGenre}
          formMood={formMood}
          setFormMood={setFormMood}
          formSoundUrl={formSoundUrl}
          setFormSoundUrl={setFormSoundUrl}
          formCoverUrl={formCoverUrl}
          setFormCoverUrl={setFormCoverUrl}
          formLyrics={formLyrics}
          setFormLyrics={setFormLyrics}
          formVisible={formVisible}
          setFormVisible={setFormVisible}
          formOwnerPick={formOwnerPick}
          setFormOwnerPick={setFormOwnerPick}
          handleSaveSong={handleSaveSong}
        />
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
    </div>
  );
};
