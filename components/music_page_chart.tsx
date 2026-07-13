import React, { useState, useEffect } from 'react';
import { Flame, Award, MessageSquare, Plus, ChevronRight, User } from 'lucide-react';
import { StandaloneSong } from './music_comp_player';
import musicBgNew from '../src/assets/images/music_bg_new.jpg';

interface ChartPageProps {
  songs: StandaloneSong[];
  activeSong: StandaloneSong | null;
  onPlaySong: (song: StandaloneSong) => void;
}

interface OwnerComment {
  id: number;
  songId: number;
  storeName: string;
  ownerName: string;
  comment: string;
  createdAt: string;
}

export const MusicChartPage: React.FC<ChartPageProps> = ({
  songs,
  activeSong,
  onPlaySong
}) => {
  const [selectedSong, setSelectedSong] = useState<StandaloneSong | null>(null);
  const [comments, setComments] = useState<OwnerComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial selected song once songs load
  useEffect(() => {
    if (songs.length > 0 && !selectedSong) {
      setSelectedSong(songs[0]);
    }
  }, [songs, selectedSong]);

  // Fetch comments for the selected song
  const fetchComments = async (songId: number) => {
    try {
      const res = await fetch(`/api/music/comments?songId=${songId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      }
    } catch (err) {
      console.warn('Failed to load comments for song:', songId, err);
    }
  };

  useEffect(() => {
    if (selectedSong) {
      fetchComments(selectedSong.id);
    }
  }, [selectedSong]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSong || !newComment.trim() || !storeName.trim() || !ownerName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/music/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: selectedSong.id,
          storeName: storeName.trim(),
          ownerName: ownerName.trim(),
          comment: newComment.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNewComment('');
          // Re-fetch comments to show new contribution instantly
          await fetchComments(selectedSong.id);
        }
      }
    } catch (err) {
      console.warn('Failed to submit owner comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartSongs = songs.slice(0, 10);
  const ownerPicks = songs.filter(s => s.ownerPick);

  return (
    <div 
      className="w-full text-stone-300 font-sans bg-cover bg-center bg-no-repeat relative pt-8 pb-16 px-4 md:pt-11 md:pb-24 md:px-6 min-h-screen rounded-none"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 6, 0.72), rgba(5, 5, 6, 0.92)), url('${musicBgNew}')`
      }}
    >
      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left 2 Columns: Lists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Real-time popular chart */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
              <Flame className="text-[#C5A059] animate-pulse w-5 h-5" />
              <h3 className="haste-section-title-2 !text-white">실시간 매장 인기 순위</h3>
            </div>

            <div className="bg-stone-950/60 border border-[#C5A059]/15 rounded-3xl p-3 md:p-5 flex flex-col gap-2.5 shadow-xl">
              {chartSongs.map((song, idx) => {
                const active = selectedSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.005] ${
                      active 
                        ? 'bg-[#C5A059]/10 border border-[#C5A059]/20 text-white' 
                        : 'bg-stone-900/10 hover:bg-stone-900/40 border border-transparent text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-4 truncate">
                      <span className={`font-mono text-xs w-6 text-center ${active ? 'text-[#C5A059]' : 'text-stone-600'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col truncate">
                        <span className={`text-xs font-bold ${active ? 'text-[#C5A059]' : 'text-stone-200'}`}>{song.title}</span>
                        <span className="text-[9px] text-stone-500 mt-0.5">{song.artist || 'Cafe Haste BGM'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {song.genre && (
                        <span className="text-[8px] font-mono border border-stone-800 px-1.5 py-0.5 rounded text-stone-500 uppercase">
                          {song.genre}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySong(song);
                        }}
                        className="p-1.5 rounded-full bg-[#C5A059]/10 hover:bg-[#b08e4f] text-[#C5A059] hover:text-stone-950 transition-all"
                        title="재생하기"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Owner's Pick playlist list */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
              <Award className="text-[#C5A059] w-5 h-5" />
              <h3 className="haste-section-title-2 !text-white">베테랑 점주 추천 (Owner's Pick)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerPicks.map((song) => {
                const active = selectedSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className={`p-4 rounded-2xl bg-stone-950/60 border transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col gap-2 ${
                      active ? 'border-[#C5A059] bg-black' : 'border-[#C5A059]/15'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-[#C5A059]/15 text-[#C5A059] text-[8.5px] rounded font-bold tracking-widest">
                        OWNER PICK
                      </span>
                      <span className="text-[8.5px] font-mono text-stone-500 uppercase">#{song.mood}</span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-200 truncate mt-1">{song.title}</h4>
                    <p className="text-[9px] text-stone-500 truncate leading-relaxed">
                      {song.desc || '가맹점 반응 보증 시그니처 트랙'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaySong(song);
                      }}
                      className="w-full mt-2 py-2 bg-stone-900 hover:bg-stone-850 text-[10px] font-bold text-stone-300 hover:text-white rounded-xl text-center transition-all cursor-pointer"
                    >
                      이 플레이리스트 재생
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Owner feedback 한 줄 평 코멘트 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-stone-950/80 border border-[#C5A059]/15 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl sticky top-28">
            {selectedSong ? (
              <>
                {/* Selected Track info */}
                <div className="space-y-1.5 border-b border-[#C5A059]/20 pb-3">
                  <span className="text-[8.5px] font-mono font-bold tracking-widest text-[#C5A059] uppercase">
                    TRACK REVIEW
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight truncate">
                    {selectedSong.title}
                  </h3>
                  <p className="text-[10px] text-stone-500 truncate">{selectedSong.artist || 'Cafe Haste BGM'}</p>
                </div>

                {/* Comments list */}
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                  <h4 className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-[#C5A059]" />
                    실제 매장 피드백 ({comments.length})
                  </h4>

                  {comments.length === 0 ? (
                    <p className="text-[10px] text-stone-600 py-6 text-center italic">
                      등록된 사장님의 피드백 코멘트가 없습니다. 첫 한 줄 평을 남겨보세요!
                    </p>
                  ) : (
                    <div className="space-y-3.5">
                      {comments.map((comm) => (
                        <div key={comm.id} className="p-3 bg-stone-900/60 rounded-xl space-y-1.5 border border-stone-850/40">
                          <p className="text-xs text-stone-200 leading-normal font-light">"{comm.comment}"</p>
                          <div className="flex justify-between items-center text-[8.5px] text-stone-500 font-mono pt-1">
                            <span className="text-[#C5A059] font-bold">{comm.storeName}</span>
                            <span>점주: {comm.ownerName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-3 border-t border-[#C5A059]/20 pt-4">
                  <h4 className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5">
                    <Plus size={12} className="text-[#C5A059]" />
                    한 줄 평 코멘트 남기기
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="매장 명 (가맹점)"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-stone-900 border border-[#C5A059]/20 rounded-lg py-1.5 px-2.5 text-[10px] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40"
                    />
                    <input
                      type="text"
                      placeholder="점주 성함"
                      required
                      value={ownerName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-stone-900 border border-[#C5A059]/20 rounded-lg py-1.5 px-2.5 text-[10px] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40"
                    />
                  </div>

                  <textarea
                    placeholder="매장에서 실제 틀었을 때의 반응이나 코멘트를 적어주세요..."
                    required
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-stone-900 border border-[#C5A059]/20 rounded-lg p-2.5 text-[10px] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-[#C5A059] hover:bg-[#b08e4f] disabled:bg-stone-900 text-stone-950 rounded-xl text-[10px] font-bold shadow-md shadow-[#C5A059]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? '저장 중...' : '피드백 등록 완료'}
                  </button>
                </form>
              </>
            ) : (
              <p className="text-[10px] text-stone-600 py-12 text-center">곡을 선택해 주십시오.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
