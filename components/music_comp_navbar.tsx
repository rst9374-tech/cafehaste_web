import React, { useState } from 'react';
import { Lock, Home, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MusicLoginModal } from './music_modal_login';
import { HasteSymbol, HasteWordmark } from './home_comp_logo';

interface MusicNavbarProps {
  activeTab: 'HOME' | 'DISCOVER' | 'CHART' | 'MUSIC_ROOM' | 'COMMUNITY';
  setActiveTab: (tab: 'HOME' | 'DISCOVER' | 'CHART' | 'MUSIC_ROOM' | 'COMMUNITY') => void;
  onBackToHome?: () => void;
}

export const MusicNavbar: React.FC<MusicNavbarProps> = ({
  activeTab,
  setActiveTab
}) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'MUSIC_ROOM', label: '음악감상실' },
    { id: 'DISCOVER', label: '무드 탐색' },
    { id: 'CHART', label: '베스트 차트' },
    { id: 'COMMUNITY', label: '사장님 라운지' }
  ];

  return (
    <>
      <header className="w-full py-4 px-6 border-b border-[#C5A059]/20 bg-black/40 backdrop-blur-md flex justify-between items-center z-50 sticky top-0">
        {/* Brand Logo & Back to Cafe Icon */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 select-none cursor-pointer group" onClick={() => window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'MUSIC' } }))}>
            <HasteSymbol size={32} color="#C5A059" glow={true} className="filter drop-shadow-[0_0_8px_rgba(197,160,89,0.4)] group-hover:scale-105 transition-transform duration-300" />
            <div className="flex items-center gap-1">
              <HasteWordmark light={true} />
              <span className="font-sans font-[200] tracking-[0.1em] italic text-[#C5A059] group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(197,160,89,0.8)] transition-all duration-300 text-lg md:text-xl">
                Playlist
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'HOME' } }))}
            className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-stone-900 border border-[#C5A059]/30 hover:border-[#C5A059] flex items-center justify-center text-[#C5A059] hover:bg-stone-850 hover:text-white transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
            title="카페 홈으로 이동"
          >
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Desktop Tab Navigation (Visible on MD and above) */}
        <nav className="hidden md:flex items-center flex-wrap justify-center gap-1 md:gap-3 bg-stone-950/80 p-1 rounded-xl border border-[#C5A059]/15 max-w-full">
          {menuItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold tracking-[0.12em] transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#C5A059] text-stone-950 font-extrabold shadow-[0_0_12px_rgba(197,160,89,0.4)]'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Desktop Admin Login Trigger (Visible on MD and above) */}
        <button
          onClick={() => setIsLoginOpen(true)}
          className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-[#C5A059] border border-[#C5A059]/60 hover:bg-[#C5A059]/10 rounded-xl px-3.5 py-1.5 transition-all bg-transparent cursor-pointer active:scale-95 whitespace-nowrap"
          title="관리자 로그인"
        >
          <Lock size={12} className="text-[#C5A059] animate-pulse" />
          <span>관리자 로그인</span>
        </button>

        {/* Mobile Menu Trigger (Visible on mobile under MD) */}
        <button 
          className="md:hidden flex p-2 border rounded-xl transition-colors text-stone-200 border-stone-850 bg-stone-900/50 hover:bg-stone-900 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Slide-out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-[110]"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-[210px] sm:w-[240px] z-[120] bg-stone-950 border-l border-[#C5A059]/20 shadow-2xl p-4 pt-14 flex flex-col justify-between font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-stone-800 mb-2">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-[#C5A059]">HASTE PLAYLIST</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-400 hover:text-stone-250 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Tabs Link List */}
                <div className="flex flex-col gap-1">
                  {menuItems.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left py-2 px-3 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[#C5A059] text-stone-950 font-extrabold shadow-md'
                          : 'text-stone-300 hover:text-white hover:bg-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-800 mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'HOME' } }));
                  }}
                  className="w-full py-2 px-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/30 text-[#C5A059] rounded-lg text-center text-[10px] font-bold tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Home size={10} />
                  <span>카페 홈으로</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="w-full py-2 px-1.5 bg-[#C5A059] hover:bg-[#B8964C] text-stone-950 rounded-lg text-center text-[10px] font-extrabold tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Lock size={10} />
                  <span>관리자 로그인</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal Popup */}
      <AnimatePresence>
        {isLoginOpen && <MusicLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

