import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_FILMS } from '../serverDefaults';
import theaterBg from '../src/assets/images/theater_bg.jpg';

interface FilmItem {
  id: number;
  title: string;
  desc: string;
  videoUrl?: string;
  video_url?: string;
  visible: number | boolean;
  category?: 'BRAND' | 'THEATER';
}

interface HasteFilmProps {
  appFilms: FilmItem[];
  isMobile?: boolean;
  filmRandomShow?: boolean;
  startMuted?: boolean;
}

export const HasteFilm: React.FC<HasteFilmProps> = ({
  appFilms,
  isMobile = false,
  filmRandomShow = false,
  startMuted = false
}) => {
  const isComp = isMobile;
  const [activeFilm, setActiveFilm] = useState<FilmItem | null>(null);
  const [isMuted, setIsMuted] = useState(startMuted);

  useEffect(() => {
    setIsMuted(startMuted);
  }, [startMuted]);

  // Filter only visible films that belong to the THEATER category (or default fallback)
  const visibleFilms = appFilms.filter(
    (f) => (f.visible || f.visible === 1 || String(f.visible) === '1') &&
           (!f.category || f.category.includes('THEATER'))
  );

  // Fallback to DEFAULT_FILMS if appFilms is empty
  const displayFilms = visibleFilms.length > 0 ? visibleFilms : DEFAULT_FILMS;

  useEffect(() => {
    if (displayFilms.length > 0 && !activeFilm) {
      if (filmRandomShow) {
        const randomIndex = Math.floor(Math.random() * displayFilms.length);
        setActiveFilm(displayFilms[randomIndex]);
      } else {
        setActiveFilm(displayFilms[0]);
      }
    }
  }, [displayFilms, activeFilm, filmRandomShow]);

  const handlePrevVideo = () => {
    if (displayFilms.length <= 1 || !activeFilm) return;
    const currentIndex = displayFilms.findIndex((f) => f.id === activeFilm.id);
    const prevIndex = currentIndex === 0 ? displayFilms.length - 1 : currentIndex - 1;
    setActiveFilm(displayFilms[prevIndex]);
    setIsMuted(false);
  };

  const handleNextVideo = () => {
    if (displayFilms.length <= 1 || !activeFilm) return;
    const currentIndex = displayFilms.findIndex((f) => f.id === activeFilm.id);
    const nextIndex = currentIndex === displayFilms.length - 1 ? 0 : currentIndex + 1;
    setActiveFilm(displayFilms[nextIndex]);
    setIsMuted(false);
  };

  if (!activeFilm) {
    return (
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center text-stone-500 bg-[#0A0A0C] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-900 border-t-[#C5A059] animate-spin" />
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-stone-650">LOADING CINEMA THEATER...</span>
      </div>
    );
  }

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const currentVideoUrl = activeFilm.videoUrl || activeFilm.video_url || '';
  const youtubeId = getYoutubeId(currentVideoUrl);

  return (
    <div 
      id="film-desktop-page" 
      className="w-full text-stone-300 font-sans bg-cover bg-center bg-no-repeat relative py-4 px-3 md:py-12 md:px-6 min-h-screen"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 12, 0.45), rgba(10, 10, 12, 0.75)), url('${theaterBg}')`
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2 border-b border-stone-900 text-left pb-2.5 mb-4 md:pb-5 md:mb-10">
          {!isComp && (
            <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block">
              HASTE SENSORY RECONSTRUCTION
            </span>
          )}
          <h1 className="font-sans font-normal leading-tight text-white tracking-tight flex items-center gap-3 flex-wrap text-lg md:text-4xl">
            <div className="flex items-center gap-3">
              <Film className="text-[#C5A059] w-5 h-5 md:w-9 md:h-9 shrink-0 animate-pulse" />
              홍보관
            </div>
          </h1>
          {!isComp && (
            <p className="text-stone-400 font-sans font-light leading-relaxed mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-[11px] md:text-base max-w-3xl">
              헤이스트의 감성을 정교한 시각 자산으로 담아낸 전용 시네마 시어터입니다. 따스한 빔 아래 번지는 커피 향과 아름다운 영사 미학을 고화질로 감상해 보십시오.
            </p>
          )}
        </div>

        {/* Main Theater Board layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-4 md:gap-8">
          
          {/* Left 8 Cols: Theater Screen & Video Player */}
          <div className="lg:col-span-8 flex flex-col gap-3.5 md:gap-6">
            <div className="relative w-full aspect-video bg-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded-xl md:rounded-3xl border-2 border-stone-900 md:border-0 group/screen">
              {/* Curved Cinema Frame Overlay */}
              <div className="absolute inset-0 border-[6px] border-stone-950 pointer-events-none z-10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.95)]" />
              
              {/* Projection Beam Light Effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.18)_0%,transparent_70%)] pointer-events-none z-10 animate-pulse" style={{ animationDuration: '5s' }} />
              
              {/* Screen reflection highlight */}
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />

              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1${isMuted ? '&mute=1' : ''}&rel=0`}
                  title={activeFilm.title}
                  className="w-full h-full border-0 relative z-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  key={currentVideoUrl}
                  src={currentVideoUrl}
                  className="w-full h-full object-contain relative z-0"
                  controls
                  autoPlay
                  muted={isMuted}
                  playsInline
                />
              )}

              {/* Slider controls if 2 or more videos */}
              {displayFilms.length >= 2 && (
                <>
                  <button
                    onClick={handlePrevVideo}
                    className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 border border-[#C5A059]/30 text-[#C5A059] hover:bg-black/80 hover:text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer shadow-md left-3 p-1.5 md:left-6 md:p-3`}
                    title="이전 영상"
                  >
                    <ChevronLeft size={isComp ? 14 : 20} />
                  </button>
                  <button
                    onClick={handleNextVideo}
                    className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 border border-[#C5A059]/30 text-[#C5A059] hover:bg-black/80 hover:text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer shadow-md right-3 p-1.5 md:right-6 md:p-3`}
                    title="다음 영상"
                  >
                    <ChevronRight size={isComp ? 14 : 20} />
                  </button>
                </>
              )}
            </div>

            {/* Film Details Info Box */}
            <div className="bg-stone-950/75 border-0 shadow-lg text-left backdrop-blur-xs p-3.5 rounded-2xl space-y-2 md:p-6.5 md:rounded-3xl md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 tracking-wider font-sans uppercase">
                      HASTE CINEMA CLASSIC
                    </span>
                    <span className="text-[9px] font-mono text-stone-500 hidden md:inline">SEAT EX-01 (VIP LOUNGE)</span>
                  </div>
                  <h2 className={`haste-section-title-2 !text-white flex items-center gap-1.5 mt-1.5 !text-sm md:!text-xl`}>
                    <Play size={isComp ? 11 : 14} className="text-[#C5A059] fill-[#C5A059]" />
                    {activeFilm.title}
                  </h2>
                </div>

                {/* Decorative Ticket Stub Barcode */}
                <div className="flex items-center bg-stone-900/60 rounded-2xl border-0 shrink-0 p-2 gap-2.5 md:p-3 md:gap-3">
                  <div className="flex flex-col font-mono text-[7px] text-stone-500 leading-none tracking-widest uppercase text-left">
                    <span>TICKET NO</span>
                    <span className="text-[#C5A059] font-bold mt-0.5">HST-FLM-00{activeFilm.id}</span>
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

              <p className="haste-body-text-2-3 pt-3 border-t border-stone-800 text-[11px] pt-2 leading-normal md:text-sm md:leading-relaxed">
                {activeFilm.desc}
              </p>
            </div>
          </div>

          {/* Right 4 Cols: Playlists Box Office Program */}
          <div className="lg:col-span-4 bg-stone-950/70 border border-[#C5A059]/40 shadow-lg text-left backdrop-blur-xs p-3.5 rounded-2xl md:p-5 md:rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Film size={14} className="text-[#C5A059]" />
                홍보 프로그램 목록
              </span>
              <span className="text-[9px] font-mono text-[#C5A059] font-bold tracking-wider">BOX OFFICE</span>
            </div>
            <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent max-h-[220px] md:max-h-[520px]">
              {displayFilms.map((oth) => {
                const ytId = getYoutubeId(oth.videoUrl || oth.video_url || '');
                const thumbUrl = ytId
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                  : 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=240';

                const isCurrent = oth.id === activeFilm.id;

                return (
                  <button
                    key={oth.id}
                    onClick={() => {
                      setActiveFilm(oth);
                      setIsMuted(false);
                    }}
                    className={`relative flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.01] cursor-pointer overflow-hidden ${ isCurrent ? 'bg-stone-950 border-[#C5A059] shadow-[0_4px_16px_rgba(197,160,89,0.15)] text-[#C5A059]' : 'bg-stone-900/40 border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/80' }`}
                  >
                    {/* Ticket Punch Hole (데코) */}
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0A0A0C] border-r border-transparent" />
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0A0A0C] border-l border-transparent" />

                    {/* Poster Thumbnail */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-950 border-0 relative shadow-inner">
                      <img src={thumbUrl} alt={oth.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30" />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-[#C5A059]/10 flex items-center justify-center">
                          <Play size={14} className="text-[#C5A059] fill-[#C5A059] animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Ticket Info */}
                    <div className="flex-grow space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[7.5px] font-mono font-bold tracking-widest text-stone-550 uppercase">
                          PROGRAM {oth.id}
                        </span>
                        <span className="text-[7.5px] font-mono px-1 py-0.2 bg-stone-950 rounded border-0 text-stone-400">
                          HD
                        </span>
                      </div>
                      <h4 className={`text-[11px] font-bold truncate ${isCurrent ? 'text-white' : 'text-stone-300'}`}>
                        {oth.title}
                      </h4>
                      <p className={`text-[8.5px] truncate ${isCurrent ? 'text-stone-450' : 'text-stone-500'}`}>
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
