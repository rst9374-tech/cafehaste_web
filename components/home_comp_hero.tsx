import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { HasteSymbol } from './home_comp_logo';

interface HasteHomeHeroProps {
  filteredDrafts: any[];
  currentDraftIndex: number;
  setCurrentDraftIndex: (index: number) => void;
  isAutoRotationActive: boolean;
  setIsAutoRotationActive: (active: boolean) => void;
  handlePrevDraft: () => void;
  handleNextDraft: () => void;
  navigateTo: (route: any) => void;
}

export const HasteHomeHero: React.FC<HasteHomeHeroProps> = ({
  filteredDrafts,
  currentDraftIndex,
  setCurrentDraftIndex,
  isAutoRotationActive,
  setIsAutoRotationActive,
  handlePrevDraft,
  handleNextDraft,
  navigateTo,
}) => {
  // 메인 페이지 헤더 배너(Home draft banner) 스와이프 슬라이더 기능
  const bannerTouchStartX = React.useRef<number | null>(null);
  const bannerTouchStartY = React.useRef<number | null>(null);
  const isDraggingBanner = React.useRef<boolean>(false);

  const handleBannerTouchStart = (e: React.TouchEvent) => {
    bannerTouchStartX.current = e.touches[0].clientX;
    bannerTouchStartY.current = e.touches[0].clientY;
    isDraggingBanner.current = false;
    e.stopPropagation();
  };

  const handleBannerTouchMove = (e: React.TouchEvent) => {
    if (bannerTouchStartX.current === null || bannerTouchStartY.current === null) return;
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    const diffX = Math.abs(clientX - bannerTouchStartX.current);
    const diffY = Math.abs(clientY - bannerTouchStartY.current);

    if (diffX > 10 || diffY > 10) {
      isDraggingBanner.current = true;
    }
    e.stopPropagation();
  };

  const handleBannerTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (bannerTouchStartX.current === null || bannerTouchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - bannerTouchStartX.current;
    const diffY = e.changedTouches[0].clientY - bannerTouchStartY.current;

    // 수평 드래그 감지
    if (Math.abs(diffX) > 40 && Math.abs(diffY) < 40) {
      if (diffX > 0) {
        handlePrevDraft();
      } else {
        handleNextDraft();
      }
    }
    bannerTouchStartX.current = null;
    bannerTouchStartY.current = null;

    setTimeout(() => {
      isDraggingBanner.current = false;
    }, 150);
  };

  return (
    <header 
      onTouchStart={handleBannerTouchStart}
      onTouchMove={handleBannerTouchMove}
      onTouchEnd={handleBannerTouchEnd}
      className="no-swipe relative w-full py-10 md:py-24 px-4 overflow-hidden flex flex-col justify-center items-center min-h-[45vh] md:min-h-[60vh] text-white shadow-xl mb-6 md:mb-12 border-b border-stone-850"
    >
      {/* Multi-Draft Background Image Rotater using AnimatePresence for cinematic fading transitions */}
      <AnimatePresence mode="wait">
        {filteredDrafts[currentDraftIndex] && (
          <motion.div 
            key={`draft-bg-${filteredDrafts[currentDraftIndex].id}`}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: filteredDrafts[currentDraftIndex].bgImage 
                ? `linear-gradient(to bottom, rgba(28, 24, 20, 0.18), rgba(15, 13, 11, 0.38)), url('${filteredDrafts[currentDraftIndex].bgImage}')` 
                : 'linear-gradient(to bottom, rgba(44, 39, 35, 0.9), rgba(28, 24, 22, 0.95))',
            }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ 
              opacity: 1, 
              scale: 1.01,
              transition: { duration: 1.2, ease: "easeOut" }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.98,
              transition: { duration: 0.8, ease: "easeIn" }
            }}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-amber-900/10 via-transparent to-stone-950/30 pointer-events-none" />

      {/* Floating Amber Fluid Particle Sparks (Active Motion) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#C5A059]"
            style={{
              left: `${15 + i * 14}%`,
              bottom: `-20px`,
              opacity: 0.15,
              filter: 'blur(1px)'
            }}
            animate={{
              y: [-25, -550],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0, 0.7, 0],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Main Interactive Content Panel */}
      <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center pt-24">
        
        <AnimatePresence mode="wait">
          {filteredDrafts[currentDraftIndex] && (
            <motion.div
              key={`draft-text-${filteredDrafts[currentDraftIndex].id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              {/* Interactive concept design blueprint chip */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C5A059]/10 backdrop-blur-md rounded-full border border-[#C5A059]/25 mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
                <span className="haste-hero-tag">
                  {filteredDrafts[currentDraftIndex].tag}
                </span>
              </div>

              {/* Glowing Brand Symbol with pulsating rotation effect */}
              <div 
                className="mb-6 cursor-pointer group transition-transform duration-300 hover:scale-105"
                onClick={() => {
                  if (isDraggingBanner.current) return;
                  navigateTo('BRAND');
                }}
                title="브랜드 스토리 보기"
              >
                <div className="hidden md:block">
                  <HasteSymbol 
                    size={136} 
                    color="#C5A059" 
                    glow={true} 
                    animated={true}
                    className="filter drop-shadow-[0_0_20px_rgba(255,177,86,0.55)]" 
                  />
                </div>
                <div className="block md:hidden">
                  <HasteSymbol 
                    size={68} 
                    color="#C5A059" 
                    glow={true} 
                    animated={true}
                    className="filter drop-shadow-[0_0_10px_rgba(255,177,86,0.55)]" 
                  />
                </div>
              </div>

              {/* Giant Logo font name HASTE */}
              <h1 className="haste-hero-title-giant drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] select-none mb-4 transition-all duration-300">
                HASTE
              </h1>

              {/* Concept Specific Dynamic Slogan */}
              <h2 className="haste-hero-slogan drop-shadow-md mb-3 select-none px-4">
                {filteredDrafts[currentDraftIndex].slogan}
              </h2>

              {/* Concept Specific English Subtext */}
              <p className="haste-hero-subtext mb-4 select-none">
                {filteredDrafts[currentDraftIndex].subtext}
              </p>

              {/* Concept Specicific Description Overlay Box */}
              <p className="max-w-xl text-stone-300/80 text-xs font-light leading-relaxed mb-8 px-6 select-none border-l border-r border-[#C5A059]/20 py-1">
                {filteredDrafts[currentDraftIndex].description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll dynamic design elements mouse indicator */}
        <div className="flex flex-col items-center mb-8 opacity-60">
          <div className="w-5 h-8 border-2 border-stone-400/50 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1 h-1.5 bg-[#C5A059] rounded-full"
            />
          </div>
        </div>

        {/* Action Pill Buttons */}
        <div className="flex flex-col items-center font-sans z-20">
          <button
            id="hero-co-consult-btn"
            onClick={() => {
              if (isDraggingBanner.current) return;
              window.dispatchEvent(new Event('haste_open_inquiry_modal'));
            }}
            className="px-12 py-4.5 bg-white hover:bg-stone-50 text-stone-950 font-bold text-sm md:text-base tracking-[0.2em] uppercase rounded-xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-stone-300"
          >
            상담 신청하기 →
          </button>
          
          <button
            id="hero-secondary-pickup-btn"
            onClick={() => {
              if (isDraggingBanner.current) return;
              navigateTo('BRAND');
            }}
            className="mt-4 text-stone-200 hover:text-[#C5A059] font-mono text-[10px] tracking-[0.18em] uppercase transition-colors underline underline-offset-4 cursor-pointer"
          >
            EXPLORE OUR COFFEE MISSION & BRAND →
          </button>
        </div>

      </div>

      {/* Left Floating Chevron Control */}
      <button 
        onClick={handlePrevDraft}
        className="haste-slider-arrow haste-slider-arrow-left"
        title="이전 시안으로 변경"
      >
        <ChevronLeft />
      </button>

      {/* Right Floating Chevron Control */}
      <button 
        onClick={handleNextDraft}
        className="haste-slider-arrow haste-slider-arrow-right"
        title="다음 시안으로 변경"
      >
        <ChevronRight />
      </button>

      {/* Floating Glassmorphism Draft Console at the bottom margin */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-0.5 bg-stone-900/75 border border-stone-800/80 backdrop-blur-lg px-6 py-1.5 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          {/* Compact controls inside console */}
          <button 
            onClick={handlePrevDraft} 
            className="p-1 hover:bg-stone-800/80 rounded-full text-stone-400 hover:text-[#C5A059] transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="flex items-center gap-2">
            {filteredDrafts.map((draft, idx) => (
              <button
                key={draft.id}
                onClick={() => {
                  setCurrentDraftIndex(idx);
                  setIsAutoRotationActive(false);
                }}
                className={`h-1 transition-all duration-300 ${ currentDraftIndex === idx ? 'w-6 bg-[#C5A059] rounded-full' : 'w-2 bg-stone-600 hover:bg-stone-400 rounded-full' }`}
                title={`시안 ${draft.id}: ${draft.slogan}`}
              />
            ))}
          </div>

          <button 
            onClick={handleNextDraft}
            className="p-1 hover:bg-stone-800/80 rounded-full text-stone-400 hover:text-[#C5A059] transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>

          <div className="w-px h-3.5 bg-stone-800" />

          {/* Auto playing toggle */}
          <button
            onClick={() => setIsAutoRotationActive(!isAutoRotationActive)}
            className={`p-1 rounded-full transition-colors cursor-pointer ${ isAutoRotationActive ? 'text-[#C5A059]/90 hover:bg-stone-800' : 'text-stone-500 hover:text-white hover:bg-stone-800' }`}
            title={isAutoRotationActive ? '자동 로테이션 일시정지' : '자동 로테이션 시작'}
          >
            {isAutoRotationActive ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
        
        <span className="text-[9px] font-mono tracking-wider text-stone-500 select-none uppercase font-semibold">
          {isAutoRotationActive ? 'Rotation ON' : 'Rotation PAUSED'} • {currentDraftIndex + 1}/{filteredDrafts.length} DRAFTS
        </span>
      </div>

    </header>
  );
};
