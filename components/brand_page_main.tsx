import React from 'react';
import { motion } from 'framer-motion';
import { HasteSymbol } from './home_comp_logo';
import { Compass, ShieldCheck, ArrowDown, Sparkles, Award, MapPin, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import brandSketchFinalClean from '../src/assets/images/brand_sketch_final_clean.jpg';
import { HasteSlogans } from './brand_comp_slogans';
import { HasteSignboards } from './brand_comp_signboards';
import { HasteVision } from './brand_comp_vision';
import { HasteColor } from './brand_comp_color';

interface FilmItem {
  id: number;
  title: string;
  desc: string;
  videoUrl?: string;
  video_url?: string;
  visible: number | boolean;
  category?: 'BRAND' | 'THEATER';
}

interface HasteBrandProps {
  isMobile?: boolean;
  useMobileCompact?: boolean;
  appFilms?: FilmItem[];
}

export const HasteBrand: React.FC<HasteBrandProps> = ({ isMobile, useMobileCompact, appFilms = [] }) => {
  const isComp = isMobile || useMobileCompact;
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const visionScrollRef = React.useRef<HTMLDivElement>(null);
  
  const scrollVision = (direction: 'left' | 'right') => {
    if (visionScrollRef.current) {
      const cardWidth = visionScrollRef.current.offsetWidth * 0.8;
      const currentScroll = visionScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - cardWidth 
        : currentScroll + cardWidth;
      
      visionScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const defaultBrandFilm: FilmItem = {
    id: -1,
    title: "헤이스트 브랜드 인트로",
    desc: "느린 도심 속 기분 좋은 가속을 지향하는 헤이스트의 공간과 에스프레소 예술의 깊이를 담은 브랜드 시네마 필름입니다.",
    videoUrl: "https://www.youtube.com/watch?v=Gl9rF028at4",
    visible: true,
    category: "BRAND"
  };

  const dbBrandFilms = appFilms.filter(
    (f) => (f.visible || f.visible === 1 || String(f.visible) === 'true') && 
           f.category && f.category.includes('BRAND')
  );

  const brandFilmsRaw = [...dbBrandFilms];
  
  const brand1Index = brandFilmsRaw.findIndex(
    (f) => f.category && ((f.category as string) === 'BRAND1' || f.category.includes('BRAND1'))
  );
  const brand2Index = brandFilmsRaw.findIndex(
    (f) => f.category && ((f.category as string) === 'BRAND2' || f.category.includes('BRAND2'))
  );

  let sortedBrandFilms: FilmItem[] = [];

  if (brand1Index !== -1) {
    sortedBrandFilms.push(brandFilmsRaw[brand1Index]);
  }
  if (brand2Index !== -1) {
    sortedBrandFilms.push(brandFilmsRaw[brand2Index]);
  }

  brandFilmsRaw.forEach((f) => {
    if (f.category && !f.category.includes('BRAND1') && !f.category.includes('BRAND2')) {
      sortedBrandFilms.push(f);
    }
  });

  const brandFilms = sortedBrandFilms.length > 0 ? sortedBrandFilms : [defaultBrandFilm];

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderVideoPlayer = (videoUrl: string, title: string) => {
    const youtubeId = getYoutubeId(videoUrl);
    if (youtubeId) {
      return (
        <iframe
          className="w-full h-full border-0"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=0&loop=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      return (
        <video
          src={videoUrl}
          className="w-full h-full object-contain"
          controls
          onLoadedMetadata={(e) => { e.currentTarget.volume = 0.3; }}
        />
      );
    }
  };

  return (
    <div 
      id="brand-story-view" 
      className="relative w-full min-h-screen bg-[var(--haste-body-bg)] text-stone-800 select-none overflow-hidden pb-4 pt-2 md:pb-32 md:pt-0"
    >
      
      {/* Luxury Background Architectural Grids & Fine Coordinate Points */}
      <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden z-0 opacity-40">
        {/* Delicate structural grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffbd59_0.75px,transparent_0.75px)] [background-size:32px_32px] opacity-[0.25]" />
        
        {/* Architectural coordinates and crosshairs at various static depths */}
        <div className="absolute top-24 left-8 text-[9px] font-mono tracking-widest text-stone-400 opacity-60">X: 104.293 // Y: 593.181</div>
        <div className="absolute top-[800px] right-12 text-[9px] font-mono tracking-widest text-stone-400 opacity-60">HEI_SYS_STAGE_01 [DOCK_ACTIVE]</div>
        <div className="absolute top-[1600px] left-12 text-[9px] font-mono tracking-widest text-stone-400 opacity-60">OAK_WOOD_SPECTRUM_620NM</div>
        <div className="absolute top-[2400px] right-16 text-[9px] font-mono tracking-widest text-stone-400 opacity-60">LAT. 37.541 // LON. 127.054</div>

        {/* Delicate structural crosshairs (+) */}
        <div className="absolute top-[400px] left-1/4 text-stone-300 font-light select-none text-sm">+</div>
        <div className="absolute top-[1200px] right-1/4 text-stone-300 font-light select-none text-sm">+</div>
        <div className="absolute top-[2000px] left-1/3 text-stone-300 font-light select-none text-sm">+</div>
        <div className="absolute top-[2800px] right-1/3 text-stone-300 font-light select-none text-sm">+</div>

        {/* Faint geometric circle rings */}
        <div className="absolute top-[600px] -left-32 w-[300px] h-[300px] rounded-full border border-[#ffbd59]/5" />
        <div className="absolute top-[1800px] -right-32 w-[400px] h-[400px] rounded-full border border-stone-250/10" />
      </div>
      
      {/* Ambient background glow & guides */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-60">
        <div className="sticky top-0 left-0 h-screen w-full flex items-center justify-center">
          {/* Backlit Solar Glow Sphere */}
          <div className="absolute w-[360px] h-[360px] md:w-[650px] md:h-[650px] rounded-full bg-gradient-to-tr from-[#ffbd59]/12 via-[#ffbd59]/8 to-transparent blur-[90px] pointer-events-none" />

          {/* Luxury Thin Circular Geometry Guide Line */}
          <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full border border-[#ffbd59]/5 animate-[spin_180s_linear_infinite]" />
          <div className="absolute w-[320px] h-[320px] md:w-[490px] md:h-[490px] rounded-full border border-dashed border-stone-200/20" />
        </div>
      </div>

      {/* Main Interactive Content Layer */}
      <div className="relative z-10 w-full overflow-visible pt-0 pb-4 px-3.5 md:pb-16 md:px-12 lg:px-24">
        
        {/* Brand Philosophy Segment with Sketch Background & Large YouTube Video */}
        <section 
          id="brand-philosophy" 
          className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 mt-0 overflow-hidden select-none mb-4 py-4 px-3 md:mb-20 md:py-16 md:py-24 md:px-12"
          style={{ 
            backgroundImage: `url(${brandSketchFinalClean})`,
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto 100%'
          }}
        >
          {/* Ambient overlays to keep background soft & sketch visible */}
          <div className="absolute inset-0 bg-[var(--haste-body-bg)]/50 pointer-events-none" />
          
          <div className="relative z-10 max-w-5xl mx-auto text-center px-4 md:px-12">
            {/* Large Video Player or Slider */}
            <div className="w-full max-w-4xl mx-auto aspect-video overflow-hidden border-2 border-[#ffbd59]/30 shadow-xl bg-stone-950 relative group rounded-2xl md:rounded-3xl">
              {renderVideoPlayer(
                brandFilms[currentVideoIndex].videoUrl || brandFilms[currentVideoIndex].video_url || '',
                brandFilms[currentVideoIndex].title
              )}
              
              {/* Slider controls if 2 or more videos */}
              {brandFilms.length >= 2 && (
                <>
                  <button
                    onClick={() => setCurrentVideoIndex((prev) => (prev === 0 ? brandFilms.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#ffbd59] border border-[#ffbd59]/30 flex items-center justify-center md:left-4 md:w-10 md:h-10 md:bg-black/50 md:text-white md:border-stone-800 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="이전 영상"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentVideoIndex((prev) => (prev === brandFilms.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#ffbd59] border border-[#ffbd59]/30 flex items-center justify-center md:right-4 md:w-10 md:h-10 md:bg-black/50 md:text-white md:border-stone-800 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="다음 영상"
                  >
                    <ChevronRight size={18} />
                  </button>
                  
                  {/* Video index dot indicator */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-20">
                    {brandFilms.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentVideoIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${ idx === currentVideoIndex ? 'bg-[#ffbd59] w-4' : 'bg-white/40' }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Active brand film metadata below the player */}
            {brandFilms.length > 0 && (
              <div className="mt-4 max-w-xl mx-auto space-y-1 text-center">
                <h4 className="haste-category-label-en !mb-0 tracking-widest">
                  HASTE BRAND FILM
                </h4>
                <h3 className="haste-section-title-3 tracking-tight">
                  {brandFilms[currentVideoIndex].title}
                </h3>
                <p className="text-stone-655 font-sans font-light text-xs leading-relaxed">
                  {brandFilms[currentVideoIndex].desc}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Relocated Content Block: Philosophy Text (Under the main visual segment) */}
        <section className="max-w-4xl mx-auto text-center mb-4 px-2 md:mb-24 md:px-12">
          <h2 className="haste-title-main !text-sm !mb-2 md:!text-3xl md:!mb-6">
            느린 도심 속, 기분 좋은 가속.<br/>
            지친 일상에 건네는 <span className="font-sans italic text-[#ffbd59] underline decoration-[#ffbd59] decoration-2 underline-offset-4 font-normal">가벼운 주문, HASTE</span>
          </h2>
          
          <div className="flex items-center justify-center gap-3 mb-2 md:mb-10">
            <div className="w-8 h-px bg-stone-300/60" />
            <Quote size={14} className="text-[#ffbd59]/50" />
            <div className="w-8 h-px bg-stone-300/60" />
          </div>
          
          <div className="max-w-3xl mx-auto space-y-2.5 haste-body-text-1">
            <p>
              헤이스트는 정체되고 단조로운 일상의 흐름에 활력을 채워 넣는 온전한 안식과 회복의 공간을 지향합니다.
            </p>
            <p>
              복잡한 프랜차이즈의 불필요한 비용 거품을 과감히 걷어내고, 한 잔의 프리미엄 커피 품질에 더욱 집중하는<br/>
              <span className="text-[#ffbd59] font-medium underline decoration-[#ffbd59] decoration-2 underline-offset-4">'경량 스마트 무인 공간'</span>의 차별화된 미래를 엽니다.
            </p>
          </div>

          {/* 상생 블록 */}
          <div className="mt-8 md:mt-14 max-w-2xl mx-auto">
            <div className="relative flex items-center justify-center gap-0 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
              {/* 점주 쪽 */}
              <div className="flex-1 bg-stone-950 px-5 py-6 md:px-8 md:py-8 flex flex-col items-center text-center gap-2">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#ffbd59]/70 mb-1">Owner</span>
                <span className="text-base md:text-xl font-bold text-white font-sans leading-tight">점주가<br/><span className="text-[#ffbd59]">헤이스트</span>가 됩니다</span>
                <p className="text-[10px] md:text-xs text-stone-400 font-light leading-relaxed mt-1">
                  모든 운영 결정권은 점주에게.<br/>헤이스트의 개입 없이 내 매장을 경영합니다.
                </p>
              </div>

              {/* 중앙 교차 심볼 */}
              <div className="relative z-10 shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#ffbd59] rounded-full shadow-lg border-4 border-white" style={{marginLeft: '-1.25rem', marginRight: '-1.25rem'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 16 L17 8"/><path d="M17 16 L7 8"/>
                </svg>
              </div>

              {/* 본사 쪽 */}
              <div className="flex-1 bg-[#FFFDF8] px-5 py-6 md:px-8 md:py-8 flex flex-col items-center text-center gap-2">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#ffbd59]/70 mb-1">HQ</span>
                <span className="text-base md:text-xl font-bold text-stone-900 font-sans leading-tight">헤이스트가<br/><span className="text-[#ffbd59]">점주</span>가 됩니다</span>
                <p className="text-[10px] md:text-xs text-stone-500 font-light leading-relaxed mt-1">
                  헤이스트는 데이터를 수집하고 방향을 제시합니다.<br/>주인공은 언제나 점주님입니다.
                </p>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-stone-400 font-light text-center mt-4 tracking-wide">
              "같이 고민하고 함께 성장·발전하는" — HASTE 상생 철학
            </p>
          </div>
        </section>

        {/* Elegant Section Divider: CATEGORY 02 COLOR PALETTE */}
        <div className="max-w-5xl mx-auto flex items-center gap-4 pointer-events-none select-none my-3 md:my-10">
          <div className="h-px flex-grow border-t border-stone-300" />
          <div className="flex items-center gap-2 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full font-mono text-[8px] tracking-[0.2em] uppercase text-[#ffbd59] font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
            <span>02 COLOR PALETTE & VISUALITY</span>
          </div>
          <div className="h-px flex-grow border-t border-stone-300" />
        </div>

        <HasteColor />


        {/* Elegant Section Divider: CATEGORY 03 SENSORY SELECTIONS */}
        <div className="max-w-5xl mx-auto flex items-center gap-4 pointer-events-none select-none my-3 md:my-10">
          <div className="h-px flex-grow border-t border-stone-300" />
          <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-900 border border-stone-800 rounded-full font-mono text-[9px] tracking-[0.25em] uppercase text-[#ffbd59] font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
            <span>03 SENSORY SELECTIONS</span>
          </div>
          <div className="h-px flex-grow border-t border-stone-300" />
        </div>

        {/* Slogans Showcase Section (Imported from brand_comp_slogans) */}
        <HasteSlogans isComp={isComp} />

        {/* Elegant Section Divider: CATEGORY 04 DUAL ESSENCE ARCHIVE */}
        <div className="max-w-5xl mx-auto flex items-center gap-4 pointer-events-none select-none my-3 md:my-10">
          <div className="h-px flex-grow border-t border-stone-300" />
          <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-900 border border-stone-800 rounded-full font-mono text-[9px] tracking-[0.25em] uppercase text-[#ffbd59] font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
            <span>04 DUAL ESSENCE ARCHIVE</span>
          </div>
          <div className="h-px flex-grow border-t border-stone-300" />
        </div>

        {/* Dual Identity Section (Blueprints-inspired classy visual) */}
        <section id="brand-essence" className="max-w-5xl mx-auto scroll-mt-28 bg-white border border-stone-300 rounded-[24px] shadow-md overflow-hidden relative mb-4 p-4 md:mb-36 md:p-8 md:p-14">
            {/* Soft grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            <div className="relative z-10 mb-4 md:mb-14">
              <span className="haste-category-label-en tracking-[0.3em]">
                <Award size={12} className="inline mr-1" /> Dual Essence
              </span>
              <h2 className="font-sans text-stone-900 font-bold leading-tight text-xl md:text-5xl">
                공간과 감성,<br/>
                그리고 <span className="text-[#ffbd59] font-sans italic underline decoration-[#ffbd59] decoration-2 underline-offset-4 font-normal">기술과 정밀함</span>의 융합
              </h2>
              <div className="w-16 h-[2px] bg-[#ffbd59] mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 relative z-10 gap-4 md:gap-12">
              <div className="flex flex-col gap-4 p-1">
                <div className="w-10 h-10 rounded-xl bg-[#ffbd59]/5 border border-[#ffbd59]/20 flex items-center justify-center text-[#ffbd59] shadow-sm">
                  <Compass size={18} className="stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="haste-section-title-3 mb-2 tracking-tight">
                    감성 컬렉션 (Chic & Minimal)
                  </h4>
                  <p className="haste-body-text-2 leading-relaxed font-light">
                    과도한 장식을 덜어내고 머무는 사람의 감각에 초점을 맞췄습니다. 차분한 깊이감이 묻어나는 정갈한 미니멀리즘 인테리어로 공간 본연의 격조를 선사합니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-1">
                <div className="w-10 h-10 rounded-xl bg-[#ffbd59]/5 border border-[#ffbd59]/20 flex items-center justify-center text-[#ffbd59] shadow-sm">
                  <ShieldCheck size={18} className="stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="haste-section-title-3 mb-2 tracking-tight">
                    지능형 휴게 (Smart Control Platform)
                  </h4>
                  <p className="haste-body-text-2 leading-relaxed font-light">
                    점주와 고객 모두의 안락한 쉼을 설계합니다. IoT 기반 무인 관리 기술과 정밀한 자동화 시스템으로 24시간 철저한 위생 및 균일한 에스프레소 풍미를 유지합니다.
                  </p>
                </div>
              </div>
            </div>
        </section>

        {/* Elegant Section Divider: CATEGORY 05 BRAND VISION & FUTURE */}
        <div className="max-w-6xl mx-auto flex items-center gap-4 pointer-events-none select-none my-3 md:my-10">
          <div className="h-px flex-grow border-t border-stone-300" />
          <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-900 border border-stone-800 rounded-full font-mono text-[9px] tracking-[0.25em] uppercase text-[#ffbd59] font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
            <span>05 BRAND VISION & FUTURE</span>
          </div>
          <div className="h-px flex-grow border-t border-stone-300" />
        </div>

        {/* Haste Brand Vision Section */}
        <HasteVision isComp={isComp} />

        {/* Elegant Section Divider: CATEGORY 06 BRAND SIGNBOARDS */}
        <div className="max-w-6xl mx-auto flex items-center gap-4 pointer-events-none select-none my-3 md:my-10">
          <div className="h-px flex-grow border-t border-stone-300" />
          <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-900 border border-stone-800 rounded-full font-mono text-[9px] tracking-[0.25em] uppercase text-[#ffbd59] font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
            <span>06 BRAND SIGNBOARDS</span>
          </div>
          <div className="h-px flex-grow border-t border-stone-300" />
        </div>
        
        {/* Haste Brand Signboards Showcase Section (Imported from brand_comp_signboards) */}
        <HasteSignboards />

      </div>

    </div>
  );
};
