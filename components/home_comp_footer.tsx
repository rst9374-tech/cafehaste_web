import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headset, ArrowUp, X, Play, Mail, Film, Music } from 'lucide-react';
import { HasteSymbol, HasteWordmark } from './home_comp_logo';

const HasteTermsModal = React.lazy(() => import('./membership_modal_terms').then(m => ({ default: m.HasteTermsModal })));

interface HasteFooterProps {
  navigateTo: (route: any) => void;
  setActiveAdminTab: (tab: any) => void;
  setMockMobileFrame: React.Dispatch<React.SetStateAction<boolean>>;
  mockMobileFrame: boolean;
  setIsSignUpOpen: (open: boolean) => void;
  setIsInquiryOpen: (open: boolean) => void;
  footerDocType: 'TERMS' | 'PRIVACY' | 'EMAIL' | null;
  setFooterDocType: (type: 'TERMS' | 'PRIVACY' | 'EMAIL' | null) => void;
  activePlayFilm: any | null;
  setActivePlayFilm: (film: any | null) => void;
  appFilms: any[];
  currentRoute?: string;
}

export const HasteFooter: React.FC<HasteFooterProps> = ({
  navigateTo,
  setActiveAdminTab,
  setMockMobileFrame,
  mockMobileFrame,
  setIsSignUpOpen,
  setIsInquiryOpen,
  footerDocType,
  setFooterDocType,
  activePlayFilm,
  setActivePlayFilm,
  appFilms,
  currentRoute,
}) => {
  const isDarkTheme = currentRoute === 'FILM' || currentRoute === 'CONTROL' || currentRoute === 'MUSIC';

  return (
    <>
      {/* Primary Brand Footer block with dark luxury aesthetic */}
      <footer className={`text-stone-300 mt-16 py-16 px-6 font-sans transition-colors duration-300 ${
        isDarkTheme 
          ? 'bg-[#0B0A0F] border-t border-stone-950' 
          : 'bg-[var(--haste-footer-bg)] border-t border-[#C5A059]/20'
      }`}>
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <HasteSymbol size={36} color="#C5A059" glow={true} className="filter drop-shadow-[0_0_8px_rgba(255,177,86,0.5)]" />
              <HasteWordmark light={true} />
            </div>
            <p className="haste-body-text-2 !text-stone-300 mt-1 max-w-sm leading-relaxed font-light">
              경영의 간섭과 거품을 걷어낸 열린 플랫폼 안에서, 점주님은 공간의 안락함에 집중하고 고객님은 도심 속 편안한 휴식만을 경험하는 공간, HASTE.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-col gap-4 md:pt-[52px]">
            <div className="haste-body-text-2-3 flex flex-col gap-1 tracking-wide leading-relaxed">
              <span>상호: (주)헤이스트 에이아이</span>
              <span>소재지: 경기도 김포시 모담공원로16 | 상담문의 대표번호: 050-21919-9363</span>
              <a 
                href="mailto:cafehaste@gmail.com" 
                className="inline-flex items-center gap-1 text-stone-450 hover:text-[#C5A059] mt-0.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-white mr-1" /> 
                이메일: cafehaste@gmail.com
              </a>
            </div>
          </div>

        </div>

        <div className="container mx-auto max-w-6xl mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-500 font-mono tracking-wider gap-4">
          <span className="font-mono tracking-wider">© 2026 HASTE AI CO., LTD. ALL RIGHTS RESERVED.</span>
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <a 
                href="https://pf.kakao.com" 
                target="_blank" 
                rel="noopener noreferrer"
                title="카카오톡 채널 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                  <rect width="24" height="24" rx="6" fill="#FEE500"/>
                  <path fill="#3C1E1E" d="M12 6c-3.87 0-7 2.43-7 5.43 0 1.95 1.3 3.66 3.27 4.54l-.83 3.03c-.05.17.14.32.3.22l3.58-2.38c.23.03.47.05.7.05 3.87 0 7-2.43 7-5.43S15.87 6 12 6z"/>
                </svg>
              </a>
              <a 
                href="https://cafe.naver.com" 
                target="_blank" 
                rel="noopener noreferrer"
                title="네이버 카페 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                  <rect width="24" height="24" rx="6" fill="#03C75A"/>
                  <path fill="white" d="M6 9h10v4c0 2.2-1.8 4-4 4H10c-2.2 0-4-1.8-4-4V9zm11 1.5c1.1 0 2 .9 2 2s-.9 2-2 2v-4z" />
                  <path fill="#FFE600" d="M13 5c-.5-.7-1.5-1-2.5-.5S9.3 6 9.5 7c.2.8.8 1.2 1.5 1.2h2c.8 0 1.5-.5 1.8-1.2.3-.8 0-1.6-.8-2z" />
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/cafehaste/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="인스타그램 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <div className="w-[18px] h-[18px] flex items-center justify-center rounded-[5px] bg-[#E1306C] text-white">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845a1.44 1.44 0 100-2.881 1.44 1.44 0 000 2.881z"/>
                  </svg>
                </div>
              </a>
              <a 
                href="https://www.youtube.com/@cafehaste" 
                target="_blank" 
                rel="noopener noreferrer"
                title="유튜브 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                  <rect width="24" height="24" rx="6" fill="#FF0000"/>
                  <path fill="white" d="M10 8.5v7l6-3.5z"/>
                </svg>
              </a>
              <button
                onClick={() => navigateTo('MUSIC')}
                title="헤이스트 음악감상실 바로가기"
                className="w-[18px] h-[18px] flex items-center justify-center rounded-[5px] bg-stone-800 text-stone-400 hover:text-[#C5A059] font-mono font-black text-[10px] leading-none select-none filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                M
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] whitespace-nowrap select-none font-sans font-medium text-stone-500">
              <span onClick={() => setFooterDocType('TERMS')} className="hover:text-[#C5A059] active:scale-95 transition-all duration-250 cursor-pointer hover:underline">이용약관</span>
              <span className="text-stone-800 select-none">|</span>
              <span onClick={() => setFooterDocType('PRIVACY')} className="hover:text-[#C5A059] active:scale-95 transition-all duration-250 cursor-pointer hover:underline">개인정보처리방침</span>
              <span className="text-stone-800 select-none">|</span>
              <span onClick={() => setFooterDocType('EMAIL')} className="hover:text-[#C5A059] active:scale-95 transition-all duration-250 cursor-pointer hover:underline">이메일무단수집거부</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 오른쪽 고정 퀵 배너 세트 */}
      <div className={`fixed right-2 bottom-4 sm:right-6 sm:bottom-10 z-50 flex flex-col gap-1 sm:gap-3.5 items-end select-none ${mockMobileFrame ? 'hidden' : ''}`}>
        
        {/* 창업문의 전화번호 카드 */}
        <button 
          onClick={() => setIsInquiryOpen(true)}
          className="hidden sm:flex bg-white text-stone-900 sm:w-[84px] sm:h-[80px] rounded-md sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone-100 flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_36px_rgb(0,0,0,0.12)] cursor-pointer hover:border-[#C5A059]/40 text-center font-sans"
          title="창업문의 전산 상담 열기"
        >
          <span className="text-[5.5px] sm:text-[11px] font-extrabold text-stone-900 sm:mb-0.5 font-sans leading-none">창업문의</span>
          <span className="font-sans text-[6.5px] sm:text-sm font-black text-stone-900 tracking-tight leading-none mt-0.5">050-21919</span>
          <span className="font-sans text-[6.5px] sm:text-sm font-black text-stone-900 tracking-tight leading-none sm:mt-0.5">-9363</span>
        </button>
 
         {/* 멤버십가입문의 Headset 카드 */}
         <button
           onClick={() => setIsSignUpOpen(true)}
           className="bg-white text-stone-900 w-[31px] h-[28px] sm:w-[84px] sm:h-[80px] rounded-md sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone-100 flex flex-col items-center justify-center gap-0.5 sm:gap-1.5 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_36px_rgb(0,0,0,0.12)] hover:border-[#C5A059]/40 group cursor-pointer"
         >
           <Headset className="w-2.5 h-2.5 sm:w-6 sm:h-6 text-stone-800 group-hover:text-[#C5A059] transition-colors stroke-[2]" />
           <span className="text-[5.5px] sm:text-[10px] font-extrabold text-stone-900 group-hover:text-[#C5A059] transition-colors font-sans text-center leading-tight">
             가입신청
           </span>
         </button>
 
         {/* TOP 스크롤 버튼 */}
         <button
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="bg-white text-stone-800 hover:text-[#C5A059] hover:bg-stone-900 w-5 h-5 sm:w-12 sm:h-12 rounded-full shadow-[0_8px_24px_rgb(0,0,0,0.08)] border border-stone-100 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group"
           title="위로 이동"
         >
           <ArrowUp className="w-2.5 h-2.5 sm:w-5 sm:h-5 stroke-[2.5] transition-transform duration-300 group-hover:-translate-y-0.5" />
         </button>
      </div>

      {/* Elegant Pop-up Video Player Overlay for visible cinematic films */}
      <AnimatePresence>
        {activePlayFilm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="relative w-full max-w-4xl bg-stone-950 border border-stone-850 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Close Button overlay */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setActivePlayFilm(null)}
                  className="p-2.5 bg-black/70 hover:bg-black/90 border border-stone-800 rounded-full text-stone-300 hover:text-white transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Theater Screen / Video Wrapper */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center shadow-inner group/screen">
                {/* Curved Cinema Frame Overlay */}
                <div className="absolute inset-0 border-[6px] border-stone-950 pointer-events-none z-10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)]" />
                
                {/* Projection Beam Light Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.18)_0%,transparent_70%)] pointer-events-none z-10 animate-pulse" style={{ animationDuration: '4s' }} />
                
                {/* Screen reflection highlight */}
                <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
                
                {(() => {
                  const getYoutubeId = (url: string) => {
                    if (!url) return null;
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                    const match = url.match(regExp);
                    return (match && match[2].length === 11) ? match[2] : null;
                  };
                  const youtubeId = getYoutubeId(activePlayFilm.videoUrl || activePlayFilm.video_url);
                  if (youtubeId) {
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                        title={activePlayFilm.title}
                        className="w-full h-full border-0 relative z-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  } else {
                    return (
                      <video
                        src={activePlayFilm.videoUrl || activePlayFilm.video_url}
                        className="w-full h-full object-contain relative z-0"
                        controls
                        autoPlay
                      />
                    );
                  }
                })()}
              </div>

              {/* Theater details drawer panel */}
              <div className="p-6 bg-stone-950 border-t border-stone-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 tracking-wider font-mono uppercase">
                        HASTE CINEMA THEATER
                      </span>
                      <span className="text-[8px] font-mono text-stone-500">SEAT F-12 (ROYAL CONCIERGE)</span>
                    </div>
                    <h3 className="text-stone-150 font-extrabold text-base tracking-tight flex items-center gap-1.5">
                      <Play size={12} className="text-[#C5A059] fill-[#C5A059]" />
                      {activePlayFilm.title}
                    </h3>
                  </div>
                  
                  {/* Decorative Ticket Stub Barcode */}
                  <div className="flex items-center gap-3 bg-stone-900/40 p-2.5 rounded-xl border border-stone-850/80 shrink-0">
                    <div className="flex flex-col font-mono text-[7px] text-stone-500 leading-none tracking-widest uppercase text-left">
                      <span>TICKET NO</span>
                      <span className="text-[#C5A059] font-bold mt-0.5">HST-FLM-00{activePlayFilm.id}</span>
                    </div>
                    <div className="w-12 h-6 flex gap-[1px] items-center shrink-0 bg-stone-200 p-1 rounded opacity-80">
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

                <p className="text-stone-400 text-xs leading-relaxed max-w-3xl font-sans font-light">
                  {activePlayFilm.desc}
                </p>
                
                {/* Playlist navigation with Ticket-inspired program cards */}
                {appFilms.filter((f: any) => f.visible || f.visible === 1 || f.visible === '1').length > 1 && (
                  <div className="pt-4 border-t border-stone-900/60 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono text-stone-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Film size={12} className="text-[#C5A059]" />
                        NOW SHOWING / 상영 프로그램 선택
                      </span>
                      <span className="text-[9px] font-mono text-[#C5A059]/70 font-semibold tracking-wider">HASTE THEATER BOX OFFICE</span>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                      {appFilms.filter((f: any) => f.visible || f.visible === 1 || f.visible === '1').map((oth: any) => {
                        const getYoutubeId = (url: string) => {
                          if (!url) return null;
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                          const match = url.match(regExp);
                          return (match && match[2].length === 11) ? match[2] : null;
                        };
                        const ytId = getYoutubeId(oth.videoUrl || oth.video_url);
                        const thumbUrl = ytId 
                          ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                          : 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=240';
                        
                        const isCurrent = oth.id === activePlayFilm.id;
                        
                        return (
                          <button
                            key={oth.id}
                            onClick={() => setActivePlayFilm(oth)}
                            className={`relative flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer min-w-[280px] md:min-w-[310px] overflow-hidden ${ isCurrent ? 'bg-stone-900 border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.15)] text-[#C5A059]' : 'bg-stone-900/60 border-stone-850 text-stone-400 hover:text-stone-200 hover:border-stone-800' }`}
                          >
                            {/* Ticket Punch Hole (데코) */}
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border-r border-stone-850" />
                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border-l border-stone-850" />
                            
                            {/* Poster Thumbnail */}
                            <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-950 border border-stone-800 relative">
                              <img 
                                src={thumbUrl} 
                                alt={oth.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20" />
                              {isCurrent && (
                                <div className="absolute inset-0 bg-[#C5A059]/10 flex items-center justify-center">
                                  <Play size={16} className="text-[#C5A059] fill-[#C5A059] animate-pulse" />
                                </div>
                              )}
                            </div>
                            
                            {/* Ticket Info */}
                            <div className="flex-grow space-y-1 overflow-hidden pr-2 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[7.5px] font-mono font-bold tracking-widest text-stone-500 uppercase">PROGRAM {oth.id}</span>
                                <span className="text-[7.5px] font-mono px-1 py-0.2 bg-stone-950 rounded border border-stone-800/80 text-stone-400">G CLASS</span>
                              </div>
                              <h4 className="text-[10px] font-bold truncate leading-tight">{oth.title}</h4>
                              <p className="text-[8px] text-stone-500 truncate">{oth.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <HasteTermsModal
          isOpen={footerDocType !== null}
          docType={footerDocType}
          onClose={() => setFooterDocType(null)}
        />
      </Suspense>
    </>
  );
};
