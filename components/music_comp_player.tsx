import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Minimize2, Volume2, Music, Tv, FileText } from 'lucide-react';

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
  ownerPick?: boolean;
}

interface MusicPlayerProps {
  currentSong: StandaloneSong | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  volume,
  onVolumeChange
}) => {
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mouseMoved, setMouseMoved] = useState(true);
  const [covers, setCovers] = useState<any[]>([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load playcovers from backend database
  const fetchCovers = async () => {
    try {
      const res = await fetch('/api/music/covers');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCovers(data.covers || []);
        }
      }
    } catch (e) {
      console.error('Failed to load covers:', e);
    }
  };

  useEffect(() => {
    fetchCovers();
    // Listen for updates in cover database
    window.addEventListener('haste_bgm_covers_updated', fetchCovers);
    return () => {
      window.removeEventListener('haste_bgm_covers_updated', fetchCovers);
    };
  }, []);

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset lyrics display when song changes
  useEffect(() => {
    setShowLyrics(false);
  }, [currentSong?.id]);

  // Hide UI overlay in projector mode when mouse is inactive
  useEffect(() => {
    if (!isProjectorMode) return;
    const handleMouseMove = () => {
      setMouseMoved(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        setMouseMoved(false);
      }, 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, [isProjectorMode]);

  if (!currentSong) return null;

  // Map mood/genre to a dynamic 4K ambient video loop URL
  const getAmbientVideoUrl = (mood: string = '', genre: string = '') => {
    const normMood = mood.toLowerCase().trim();
    const normGenre = genre.toLowerCase().trim();

    // 1. Try mapping from active covers in database
    const activeCovers = covers.filter(c => c.visible);
    const matched = activeCovers.find(c => {
      const w = (c.weather || '').toLowerCase().trim();
      return w && (normMood.includes(w) || w.includes(normMood));
    });

    if (matched) {
      return matched.videoUrl;
    }

    // 2. Default Fallbacks
    if (normMood.includes('비') || normMood.includes('rain') || normMood.includes('우울')) {
      return 'https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-pane-1410-large.mp4';
    }
    if (normMood.includes('나른') || normMood.includes('chill') || normMood.includes('relax')) {
      return 'https://assets.mixkit.co/videos/preview/mixkit-fire-in-a-fireplace-close-up-42413-large.mp4';
    }
    if (normMood.includes('노을') || normMood.includes('sunset') || normMood.includes('로맨틱')) {
      return 'https://assets.mixkit.co/videos/preview/mixkit-dramatic-sunset-over-the-ocean-4006-large.mp4';
    }
    if (normGenre.includes('lo-fi') || normGenre.includes('lofi') || normMood.includes('집중')) {
      return 'https://assets.mixkit.co/videos/preview/mixkit-neon-light-from-a-shop-window-at-night-42217-large.mp4';
    }
    return 'https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-quickly-across-the-sky-34190-large.mp4';
  };

  const ambientVideo = getAmbientVideoUrl(currentSong.mood, currentSong.genre);

  return (
    <>
      {/* Bottom Sticky Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 border-t border-[#C5A059]/25 backdrop-blur-lg z-45 flex items-center justify-between px-6 text-stone-200">
        {/* Track Info */}
        <div className="flex items-center gap-3.5 max-w-[28%] truncate">
          <div className="w-12 h-12 bg-stone-900 border border-stone-800/80 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner shadow-black">
            {currentSong.coverUrl ? (
              <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <Music className="text-[#C5A059] w-5 h-5 animate-pulse" />
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-[#C5A059]/10 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-ping" />
              </div>
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white truncate">{currentSong.title}</span>
            <span className="text-[10px] text-stone-500 truncate mt-0.5">{currentSong.artist || 'Cafe Haste BGM'}</span>
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button 
              onClick={onPrev}
              className="text-stone-400 hover:text-red-500 active:scale-95 transition-all p-1 cursor-pointer"
              title="이전 곡"
            >
              <SkipBack size={18} />
            </button>
            <div className="relative group">
              {/* 플레이 버튼 주변 빨강-노랑 네온 그라데이션 광채 */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 opacity-60 blur-md group-hover:opacity-90 transition duration-500 animate-pulse pointer-events-none"></div>
              <button
                onClick={onTogglePlay}
                className="relative w-10 h-10 rounded-full bg-[#C5A059] hover:bg-[#b08e4f] text-stone-950 font-bold hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                title={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying ? <Pause size={16} className="fill-stone-950 text-stone-950" /> : <Play size={16} className="fill-stone-950 text-stone-950 ml-0.5" />}
              </button>
            </div>
            <button 
              onClick={onNext}
              className="text-stone-400 hover:text-[#C5A059] active:scale-95 transition-all p-1 cursor-pointer"
              title="다음 곡"
            >
              <SkipForward size={18} />
            </button>
          </div>
          {currentSong.mood && (
            <div className="flex gap-1.5 text-[8.5px] font-mono font-black tracking-widest uppercase">
              <span className="text-yellow-400/90">#{currentSong.mood}</span>
              <span className="text-[#C5A059]/90">#{currentSong.genre || 'BGM'}</span>
            </div>
          )}
        </div>

        {/* Utility Volume & Projector Vibe buttons */}
        <div className="flex items-center gap-4.5">
          {/* Lyrics Button */}
          {currentSong.lyrics && (
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] transition-all cursor-pointer font-bold active:scale-95 ${
                showLyrics 
                  ? 'border-red-500 bg-red-950/20 text-red-400' 
                  : 'border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
              }`}
              title="BGM 가사 보기"
            >
              <FileText size={13} />
              <span>가사</span>
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-stone-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
          </div>

          {/* Projector Vibe Toggle */}
          <button
            onClick={() => setIsProjectorMode(true)}
            className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-[#C5A059]/30 hover:border-[#C5A059]/60 hover:bg-stone-900/50 text-[9px] md:text-[10px] text-stone-400 hover:text-white transition-all cursor-pointer font-bold active:scale-95"
            title="빔프로젝터 전용 Vibe 모드 켜기"
          >
            <Tv size={11} className="text-[#C5A059] md:w-[13px] md:h-[13px]" />
            <span>프로젝터 모드</span>
          </button>
        </div>
      </div>

      {/* Floating Lyrics Overlay on Main view */}
      <AnimatePresence>
        {showLyrics && !isProjectorMode && currentSong.lyrics && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-24 right-6 w-80 max-h-96 bg-black/95 border border-[#C5A059]/30 backdrop-blur-xl p-5 rounded-2xl z-40 shadow-2xl flex flex-col text-left"
          >
            <div className="flex justify-between items-center border-b border-stone-850 pb-2 mb-3">
              <span className="text-[10px] font-bold text-[#C5A059] tracking-wider font-mono">LYRICS</span>
              <button 
                onClick={() => setShowLyrics(false)}
                className="text-stone-500 hover:text-white text-xs cursor-pointer"
              >
                닫기
              </button>
            </div>
            <div className="overflow-y-auto pr-1 flex-1 font-sans text-xs font-light text-stone-300 leading-relaxed white-space-pre-wrap max-h-72 select-text whitespace-pre-wrap">
              {currentSong.lyrics}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projector Mode Modal Overlay */}
      <AnimatePresence>
        {isProjectorMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-100 overflow-hidden font-sans select-none"
          >
            {/* 4K ambient video loop background */}
            <video
              src={ambientVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-60 scale-102 filter blur-[1px]"
            />

            {/* Cinematic Overlay Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

            {/* Minimalist Clock and Song info (Always visible) */}
            <div className="absolute inset-0 flex flex-col justify-between p-12 text-center pointer-events-none z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="font-serif italic text-[#C5A059] font-bold tracking-widest text-lg">HASTE VIBE</span>
                <span className="text-[10px] text-stone-500 tracking-[0.3em] font-mono">AMBIENT PROJECTOR SCREENS</span>
              </div>

              {/* Center Screen: Clock or Lyrics */}
              <div className="flex flex-col items-center gap-6 pointer-events-auto">
                {showLyrics && currentSong.lyrics ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl max-h-[40vh] overflow-y-auto bg-black/60 backdrop-blur-md border border-stone-850 p-6 rounded-2xl text-left select-text whitespace-pre-wrap text-stone-300 text-xs md:text-sm font-light leading-relaxed scrollbar-thin shadow-2xl"
                  >
                    <div className="font-mono text-[9px] text-[#C5A059] font-bold tracking-widest border-b border-stone-800 pb-1.5 mb-2.5">SONG LYRICS</div>
                    {currentSong.lyrics}
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <h1 className="text-6xl md:text-8xl font-mono font-light tracking-widest text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                      {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </h1>
                    <p className="text-xs md:text-sm font-light text-stone-400 tracking-wider">
                      {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Current Song Details */}
              <div className="flex flex-col gap-1.5 items-center">
                {currentSong.ownerPick && (
                  <span className="px-2 py-0.5 bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#C5A059] text-[8.5px] rounded font-bold tracking-widest mb-1.5 animate-pulse">
                    OWNER&apos;S PICK
                  </span>
                )}
                <h2 className="text-xl md:text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  {currentSong.title}
                </h2>
                <p className="text-xs md:text-sm font-light text-stone-400 tracking-wide">
                  {currentSong.artist || 'Cafe Haste BGM Collection'}
                </p>
              </div>
            </div>

            {/* Hover-activated Control Panel */}
            <div 
              className={`absolute inset-0 z-20 flex flex-col justify-between p-12 transition-opacity duration-500 ${
                mouseMoved ? 'opacity-100' : 'opacity-0 cursor-none'
              }`}
            >
              {/* Header actions */}
              <div className="w-full flex justify-end gap-2">
                {currentSong.lyrics && (
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`flex items-center gap-1.5 px-4 py-2 bg-black/60 border rounded-xl transition-all cursor-pointer font-bold active:scale-95 text-xs ${
                      showLyrics 
                        ? 'border-red-500 text-red-400 bg-black/90' 
                        : 'border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-black/95'
                    }`}
                  >
                    <FileText size={13} className="text-red-500" />
                    <span>가사 보기</span>
                  </button>
                )}
                <button
                  onClick={() => setIsProjectorMode(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-black/60 border border-stone-800 hover:border-[#C5A059]/50 hover:bg-black/90 text-xs text-stone-300 rounded-xl transition-all cursor-pointer font-bold active:scale-95"
                >
                  <Minimize2 size={13} className="text-[#C5A059]" />
                  프로젝터 모드 나가기
                </button>
              </div>

              {/* Bottom media panel inside projector mode */}
              <div className="w-full bg-black/75 border border-[#C5A059]/20 backdrop-blur-md p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto shadow-2xl">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 bg-stone-900 border border-stone-800/80 rounded-xl overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                    {currentSong.coverUrl ? (
                      <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="text-[#C5A059] w-6 h-6 animate-pulse" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{currentSong.title}</span>
                    <span className="text-xs text-stone-400 mt-0.5">{currentSong.artist || 'Cafe Haste BGM'}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                  <button 
                    onClick={onPrev}
                    className="text-stone-400 hover:text-red-500 active:scale-95 transition-all cursor-pointer"
                  >
                    <SkipBack size={20} />
                  </button>
                  <div className="relative group">
                    {/* 프로젝터 모드 내 플레이 버튼 주변 빨강-노랑 네온 그라데이션 광채 */}
                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 opacity-60 blur-md group-hover:opacity-90 transition duration-500 animate-pulse pointer-events-none"></div>
                    <button
                      onClick={onTogglePlay}
                      className="relative w-12 h-12 rounded-full bg-[#C5A059] hover:bg-[#b08e4f] hover:scale-105 active:scale-95 text-stone-950 font-bold flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    >
                      {isPlaying ? <Pause size={18} className="fill-stone-950 text-stone-950" /> : <Play size={18} className="fill-stone-950 text-stone-950 ml-0.5" />}
                    </button>
                  </div>
                  <button 
                    onClick={onNext}
                    className="text-stone-400 hover:text-[#C5A059] active:scale-95 transition-all cursor-pointer"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2.5">
                  <Volume2 size={16} className="text-stone-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
