import React, { useState } from 'react';
import { Search, Heart, Clock, Music } from 'lucide-react';
import { StandaloneSong } from './music_comp_player';
import musicBgNew from '../src/assets/images/music_bg_new.jpg';

interface DiscoverPageProps {
  songs: StandaloneSong[];
  activeSong: StandaloneSong | null;
  onPlaySong: (song: StandaloneSong) => void;
  isSidebar?: boolean;
}

export const MusicDiscoverPage: React.FC<DiscoverPageProps> = ({
  songs,
  activeSong,
  onPlaySong,
  isSidebar = false
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [songLikes, setSongLikes] = useState<Record<number, number>>({});
  const [likedSongIds, setLikedSongIds] = useState<Set<number>>(new Set());

  // Extracted tag pools based on song data
  const moodTags = ['비', '나른', '집중', '로맨틱', '활기찬', '새벽감성', '차분'];
  const genreTags = ['Lo-Fi', '재즈', '어쿠스틱', '보사노바', '인디팝', '앰비언트'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Like interaction (Interacts with local CUD bypass API)
  const handleLike = async (e: React.MouseEvent, songId: number) => {
    e.stopPropagation();
    if (likedSongIds.has(songId)) return;

    try {
      const res = await fetch(`/api/music/songs/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: songId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLikedSongIds(prev => {
            const next = new Set(prev);
            next.add(songId);
            return next;
          });
          setSongLikes(prev => ({
            ...prev,
            [songId]: (prev[songId] || 0) + 1
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to like song:', err);
    }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Filter songs based on search query and multi-selected tags
  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.desc || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags = 
      selectedTags.length === 0 ||
      selectedTags.every(tag => 
        song.mood?.toLowerCase().includes(tag.toLowerCase()) || 
        song.genre?.toLowerCase().includes(tag.toLowerCase())
      );

    return matchesSearch && matchesTags;
  });

  return (
    <div 
      className={isSidebar ? "flex flex-col gap-4 items-stretch w-full" : "w-full text-stone-300 font-sans bg-cover bg-center bg-no-repeat relative pt-8 pb-16 px-4 md:pt-11 md:pb-24 md:px-6 min-h-screen rounded-none"}
      style={isSidebar ? {} : {
        backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 6, 0.72), rgba(5, 5, 6, 0.92)), url('${musicBgNew}')`
      }}
    >
      <div className={isSidebar ? "" : "max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"}>
        {/* Left Column: Tag Filter Panel */}
        <div className={isSidebar ? "bg-stone-950/50 border border-stone-900/40 rounded-2xl p-3 space-y-4 text-left shadow-md w-full" : "lg:col-span-1 bg-stone-950/80 border border-[#C5A059]/15 rounded-3xl p-5 md:p-6 space-y-6 text-left shadow-xl"}>
          <div className="space-y-1.5">
            <h4 className="text-[9px] font-mono font-black text-[#C5A059] tracking-wider uppercase">SEARCH ARCHIVE</h4>
            <div className="relative">
              <input
                type="text"
                placeholder="곡명, 아티스트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-[#C5A059]/20 rounded-xl py-1.5 pl-8 pr-3 text-[10px] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40"
              />
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-600" />
            </div>
          </div>

          {/* Mood Tags */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-sans font-bold text-stone-400">분위기별 태그</h4>
            <div className="flex flex-wrap gap-1.5">
              {moodTags.map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      active 
                        ? 'bg-[#C5A059] text-stone-950 shadow-md shadow-[#C5A059]/30' 
                        : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre Tags */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-sans font-bold text-stone-400">장르별 태그</h4>
            <div className="flex flex-wrap gap-1.5">
              {genreTags.map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      active 
                        ? 'bg-[#C5A059] text-stone-950 shadow-md shadow-[#C5A059]/30' 
                        : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="w-full py-1.5 bg-stone-900 hover:bg-stone-850 text-[9px] font-bold text-[#C5A059] border border-[#C5A059]/15 rounded-xl transition-all cursor-pointer"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Right Column: Playlist Grid */}
        <div className={isSidebar ? "space-y-3 w-full" : "lg:col-span-3 space-y-6"}>
          <div className="flex justify-between items-center text-left">
            <div className="space-y-0.5">
              <h3 className={`haste-section-title-1 text-white ${isSidebar ? '!text-[10.5px] font-bold' : '!text-lg'}`}>탐색 결과 ({filteredSongs.length})</h3>
              <p className="text-[8.5px] text-stone-500">선택된 무드와 장르 조건에 매칭되는 BGM입니다.</p>
            </div>
          </div>

          {filteredSongs.length === 0 ? (
            <div className={`w-full ${isSidebar ? 'py-12' : 'py-24'} bg-stone-950/30 border border-[#C5A059]/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-500`}>
              <Music className="w-6 h-6 text-stone-700 animate-pulse" />
              <span className="text-[9px] font-light">해당 조건의 곡이 보관소에 존재하지 않습니다.</span>
            </div>
          ) : (
            <div className={isSidebar ? "grid grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-stone-900" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
              {filteredSongs.map((song) => {
                const isCurrent = activeSong?.id === song.id;
                const ytId = getYoutubeId(song.soundUrl);
                const thumbUrl = ytId 
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                  : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=320';

                const displayLikes = (songLikes[song.id] !== undefined)
                  ? songLikes[song.id]
                  : (song.id * 7 % 13 + 5);

                return (
                  <div
                    key={song.id}
                    onClick={() => onPlaySong(song)}
                    className={`group relative flex items-center gap-2 py-1 px-1.5 rounded-lg border text-left transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                      isCurrent 
                        ? 'bg-black border-[#C5A059] shadow-[0_2px_8px_rgba(197,160,89,0.15)] text-[#C5A059]' 
                        : 'bg-stone-900/40 border-transparent text-stone-400 hover:bg-stone-900/80 hover:text-stone-200'
                    }`}
                  >
                    {/* Image Poster */}
                    <div className={isSidebar ? "w-7.5 h-6 rounded-xs overflow-hidden shrink-0 bg-stone-950 relative shadow-inner" : "w-12 h-9 rounded-md overflow-hidden shrink-0 bg-stone-950 relative shadow-inner"}>
                      <img src={thumbUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 bg-black/40" />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-[#C5A059]/10 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-[#C5A059] animate-ping" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-grow space-y-0 overflow-hidden pr-1 text-left">
                      <div className="flex items-center gap-1 leading-none mb-0.5">
                        <span className="text-[5.5px] font-mono tracking-widest text-stone-500 uppercase">
                          HST-BGM-{song.id}
                        </span>
                        {song.ownerPick && (
                          <span className="text-[5px] px-0.5 bg-[#C5A059]/15 border border-[#C5A059]/15 text-[#C5A059] font-bold rounded">
                            PICK
                          </span>
                        )}
                      </div>
                      <h4 className={`text-[7.5px] font-bold truncate leading-tight ${isCurrent ? 'text-white' : 'text-stone-250'}`}>
                        {song.title}
                      </h4>
                      <p className="text-[6px] text-stone-500 truncate leading-none">{song.desc || '헤이스트 공간 BGM 보관소'}</p>
                      <div className="flex items-center gap-2 pt-0.5 text-stone-600 leading-none">
                        <span className="flex items-center gap-0.5 text-[6px] font-mono">
                          <Clock size={7} />
                          03:40
                        </span>
                        <button 
                          onClick={(e) => handleLike(e, song.id)}
                          className={`flex items-center gap-0.5 text-[6px] font-mono transition-all hover:text-[#C5A059] ${
                            likedSongIds.has(song.id) ? 'text-[#C5A059] font-bold' : ''
                          }`}
                        >
                          <Heart size={7} className={likedSongIds.has(song.id) ? 'fill-[#C5A059] text-[#C5A059]' : ''} />
                          {displayLikes}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
