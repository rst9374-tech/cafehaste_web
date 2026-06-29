import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import musicBgNew from '../src/assets/images/music_bg_new.jpg';

interface SoundItem {
  id: number;
  title: string;
  desc: string;
  soundUrl?: string;
  sound_url?: string;
  visible: number | boolean;
}

interface HasteMusicPageProps {
  isMobile?: boolean;
}

export const HasteMusic: React.FC<HasteMusicPageProps> = ({
  isMobile = false
}) => {
  const isComp = isMobile;
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [activeSound, setActiveSound] = useState<SoundItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch live sounds from DB
  const fetchSounds = async () => {
    try {
      const res = await fetch('/api/sounds');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const visibleSounds = (data.sounds || []).filter(
            (s: any) => s.visible === 1 || s.visible === true || String(s.visible) === '1'
          );
          setSounds(visibleSounds);
        }
      }
    } catch (e) {
      console.error('Failed to load sounds:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  // Set default active sound once loaded
  useEffect(() => {
    if (sounds.length > 0 && !activeSound) {
      const randomIndex = Math.floor(Math.random() * sounds.length);
      setActiveSound(sounds[randomIndex]);
    }
  }, [sounds, activeSound]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const currentSoundUrl = activeSound ? (activeSound.soundUrl || activeSound.sound_url || '') : '';
  const youtubeId = getYoutubeId(currentSoundUrl);

  // Control Audio Element if it's a direct music file
  useEffect(() => {
    if (!youtubeId && currentSoundUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(currentSoundUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Audio play blocked or failed:', err);
          setIsPlaying(false);
        });
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeSound, youtubeId, currentSoundUrl]);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Playback failed:', err);
      });
    }
  };

  const handlePrevSound = () => {
    if (sounds.length <= 1 || !activeSound) return;
    const currentIndex = sounds.findIndex((s) => s.id === activeSound.id);
    const prevIndex = currentIndex === 0 ? sounds.length - 1 : currentIndex - 1;
    setActiveSound(sounds[prevIndex]);
    setIsPlaying(true);
  };

  const handleNextSound = () => {
    if (sounds.length <= 1 || !activeSound) return;
    const currentIndex = sounds.findIndex((s) => s.id === activeSound.id);
    const nextIndex = currentIndex === sounds.length - 1 ? 0 : currentIndex + 1;
    setActiveSound(sounds[nextIndex]);
    setIsPlaying(true);
  };

  if (isLoading || !activeSound) {
    return (
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center text-stone-500 bg-[#070708] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-900 border-t-[#C5A059] animate-spin" />
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-stone-600">LOADING AUDIO ARCHIVE...</span>
      </div>
    );
  }

  return (
    <div 
      id="music-desktop-page" 
      className="w-full text-stone-300 font-sans bg-cover bg-center bg-no-repeat relative py-4 px-3 md:py-12 md:px-6 min-h-screen"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 6, 0.65), rgba(5, 5, 6, 0.88)), url('${musicBgNew}')`
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2 border-b border-[#C5A059]/20 text-left pb-2.5 mb-4 md:pb-5 md:mb-10">
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block">
            HASTE AUDIO ARCHIVE
          </span>
          <p className="text-stone-400 font-sans font-light leading-relaxed mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-[11px] md:text-base max-w-3xl">
            헤이스트 무인 카페의 분위기를 완성하는 시그니처 사운드 보관소입니다. 결 고운 아날로그 선율과 모던한 시티 포크, 클래식 감성을 듬뿍 머금은 음악들을 고음질로 감상해보세요.
          </p>
        </div>

        {/* Main Audio Board layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-4 md:gap-8">
          
          {/* Left 8 Cols: Audio Screen & Music Player */}
          <div className="lg:col-span-8 flex flex-col gap-3.5 md:gap-6">
            <div className="relative w-full aspect-video bg-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.98)] rounded-xl md:rounded-3xl border-2 border-[#C5A059]/40 md:border-0 group/screen flex flex-col items-center justify-center">
              
              {/* Curved Cinema Frame Overlay */}
              <div className="absolute inset-0 border-[6px] border-stone-950 pointer-events-none z-10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.95)]" />
              
              {/* Projection Beam Light Effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.18)_0%,transparent_70%)] pointer-events-none z-10 animate-pulse" style={{ animationDuration: '6s' }} />
              
              {/* Screen reflection highlight */}
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />

              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={activeSound.title}
                  className="w-full h-full border-0 relative z-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-6 w-full h-full bg-[#09090b]/80 relative z-0">
                  {/* Vinyl LP Turn-table Art */}
                  <div className="relative flex items-center justify-center">
                    <motion.div 
                      className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-neutral-900 via-stone-950 to-neutral-900 border-4 border-stone-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden"
                      animate={isPlaying ? { rotate: 360 } : {}}
                      transition={{ ease: "linear", duration: 8, repeat: Infinity }}
                    >
                      {/* Groove lines */}
                      <div className="absolute inset-2 rounded-full border border-stone-800/40" />
                      <div className="absolute inset-5 rounded-full border border-stone-800/50" />
                      <div className="absolute inset-8 rounded-full border border-stone-800/60" />
                      <div className="absolute inset-12 rounded-full border border-stone-800/70" />
                      {/* Gold Center Label */}
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#C5A059] flex items-center justify-center border-2 border-stone-850 shadow-inner z-10">
                        <Music size={16} className="text-stone-950 fill-stone-950/20" />
                      </div>
                    </motion.div>
                    
                    {/* Tone arm needle */}
                    <div 
                      className={`absolute right-[-15px] top-[-10px] w-14 h-24 md:w-20 md:h-36 origin-top-right transition-transform duration-750 ease-in-out pointer-events-none z-20`}
                      style={{
                        transform: isPlaying ? 'rotate(15deg)' : 'rotate(-15deg)',
                        backgroundImage: `radial-gradient(circle at 100% 0%, #78716c 6px, transparent 6px)`
                      }}
                    >
                      {/* Metal tone arm draw */}
                      <div className="w-1 md:w-1.5 h-full bg-stone-500 rounded-full ml-auto mr-1 border border-stone-600 shadow-sm" />
                      <div className="w-2.5 h-4 bg-stone-700 rounded-sm ml-auto mr-0.5 shadow-md" style={{ transform: 'rotate(20deg)' }} />
                    </div>
                  </div>

                  {/* Play controls for direct audio */}
                  <div className="flex items-center gap-4 z-10 mt-2">
                    <button
                      onClick={handleTogglePlay}
                      className="w-12 h-12 rounded-full bg-[#C5A059] hover:bg-[#b08e4f] text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? <Pause size={20} className="fill-stone-950" /> : <Play size={20} className="fill-stone-950 ml-0.5" />}
                    </button>
                    <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[9px] uppercase tracking-wider bg-stone-900/60 border border-stone-800 px-3 py-1 rounded-full">
                      <Volume2 size={11} className="text-[#C5A059]" />
                      <span>Vol: 40%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Slider controls */}
              {sounds.length >= 2 && (
                <>
                  <button
                    onClick={handlePrevSound}
                    className="absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 border border-[#C5A059]/30 text-[#C5A059] hover:bg-black/80 hover:text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer shadow-md left-3 p-1.5 md:left-6 md:p-3"
                    title="이전 음악"
                  >
                    <ChevronLeft size={isComp ? 14 : 20} />
                  </button>
                  <button
                    onClick={handleNextSound}
                    className="absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 border border-[#C5A059]/30 text-[#C5A059] hover:bg-black/80 hover:text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer shadow-md right-3 p-1.5 md:right-6 md:p-3"
                    title="다음 음악"
                  >
                    <ChevronRight size={isComp ? 14 : 20} />
                  </button>
                </>
              )}
            </div>

            {/* Sound Details Info Box */}
            <div className="bg-black/80 border border-red-950/20 shadow-lg text-left backdrop-blur-xs p-3.5 rounded-2xl space-y-2 md:p-6.5 md:rounded-3xl md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 tracking-wider font-sans uppercase">
                      HASTE MUSIC LOUNGE
                    </span>
                    <span className="text-[9px] font-mono text-stone-500 hidden md:inline">AUDIOPHILE HQ RECORD</span>
                  </div>
                  <h2 className="haste-section-title-2 !text-white flex items-center gap-1.5 mt-1.5 !text-sm md:!text-xl">
                    <Play size={isComp ? 11 : 14} className="text-red-500 fill-red-500" />
                    {activeSound.title}
                  </h2>
                </div>

                {/* Decorative Ticket Stub Barcode */}
                <div className="flex items-center bg-stone-900/60 rounded-2xl border border-red-950/15 shrink-0 p-2 gap-2.5 md:p-3 md:gap-3">
                  <div className="flex flex-col font-mono text-[7px] text-stone-500 leading-none tracking-widest uppercase text-left">
                    <span>TRACK NO</span>
                    <span className="text-red-500 font-bold mt-0.5">HST-MSC-00{activeSound.id}</span>
                  </div>
                  <div className="w-12 h-6 flex gap-[1.5px] items-center shrink-0 bg-stone-200 p-1 rounded opacity-80">
                    <div className="w-[2px] h-full bg-stone-900" />
                    <div className="w-[1px] h-full bg-stone-900" />
                    <div className="w-[3px] h-full bg-stone-900" />
                    <div className="w-[1px] h-full bg-stone-900" />
                    <div className="w-[2px] h-full bg-stone-900" />
                    <div className="w-[1px] h-full bg-stone-900" />
                    <div className="w-[3px] h-full bg-stone-900" />
                    <div className="w-[1px] h-full bg-stone-900" />
                  </div>
                </div>
              </div>

              <p className="haste-body-text-2-3 pt-3 border-t border-stone-850 text-[11px] pt-2 leading-normal md:text-sm md:leading-relaxed">
                {activeSound.desc}
              </p>
            </div>
          </div>

          {/* Right 4 Cols: Playlists Box Office Program */}
          <div className="lg:col-span-4 bg-black/75 border border-[#C5A059]/25 shadow-lg text-left backdrop-blur-xs p-3.5 rounded-2xl md:p-5 md:rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Music size={14} className="text-[#C5A059]" />
                음악 감상 목록
              </span>
              <span className="text-[9px] font-mono text-[#C5A059] font-bold tracking-wider">TRACKLIST</span>
            </div>
            
            <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-900 scrollbar-track-transparent max-h-[220px] md:max-h-[520px]">
              {sounds.map((oth) => {
                const ytId = getYoutubeId(oth.soundUrl || oth.sound_url || '');
                const thumbUrl = ytId
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                  : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=240';

                const isCurrent = oth.id === activeSound.id;

                return (
                  <button
                    key={oth.id}
                    onClick={() => {
                      setActiveSound(oth);
                      setIsPlaying(true);
                    }}
                    className={`relative flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.01] cursor-pointer overflow-hidden ${ isCurrent ? 'bg-black border-[#C5A059] shadow-[0_4px_16px_rgba(197,160,89,0.18)] text-[#C5A059]' : 'bg-stone-900/40 border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/80' }`}
                  >
                    {/* Ticket Punch Hole (데코) */}
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#050506] border-r border-transparent" />
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#050506] border-l border-transparent" />
 
                    {/* Poster Thumbnail */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-950 border-0 relative shadow-inner">
                      <img src={thumbUrl} alt={oth.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-[#C5A059]/10 flex items-center justify-center">
                          <Play size={14} className="text-[#C5A059] fill-[#C5A059] animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-grow space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[7.5px] font-mono font-bold tracking-widest text-stone-550 uppercase">
                          TRACK {oth.id}
                        </span>
                        <span className="text-[7.5px] font-mono px-1 py-0.2 bg-stone-950 rounded border-0 text-stone-400">
                          HQ
                        </span>
                      </div>
                      <h4 className={`text-[11px] font-bold truncate ${isCurrent ? 'text-white' : 'text-stone-300'}`}>
                        {oth.title}
                      </h4>
                      <p className={`text-[8.5px] truncate ${isCurrent ? 'text-[#C5A059]/60' : 'text-stone-500'}`}>
                        {oth.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
