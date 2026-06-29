import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, Settings, User } from 'lucide-react';
import { HasteFullLogo } from './home_comp_logo';
import { BRAND_SUB_MENUS, MEMBERSHIP_SUB_MENUS } from '../src/data';
import { HasteNavbarMobileDrawer } from './home_drawer_mobilenav';

interface HasteNavbarProps {
  currentRoute: string;
  navigateTo: (route: any, keepMobileMenuOpen?: boolean) => void;
  navigateToSection: (sectionId: string) => void;
  isCurrentlyMobile: boolean;
  mockMobileFrame: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  mobileBrandOpen: boolean;
  setMobileBrandOpen: (open: boolean) => void;
  mobileMembershipOpen: boolean;
  setMobileMembershipOpen: (open: boolean) => void;
  isNavbarLight: boolean;
  isFranchiseHovered: boolean;
  setIsFranchiseHovered: (h: boolean) => void;
  isBrandHovered: boolean;
  setIsBrandHovered: (h: boolean) => void;
  isAdminHovered: boolean;
  setIsAdminHovered: (h: boolean) => void;
  setActiveAdminTab: (tab: any) => void;
  setIsSignUpOpen: (open: boolean) => void;
  setIsInquiryOpen: (open: boolean) => void;
  handleReplayIntro: () => void;
  loggedUser?: any;
  onOpenLogin: () => void;
  onOpenMyInfo: () => void;
  onLogout?: () => void;
  globalIsPlaying?: boolean;
  currentGlobalSound?: any;
  toggleGlobalPlay?: () => void;
  playNextGlobalSound?: () => void;
  hasSounds?: boolean;
}

export const HasteNavbar: React.FC<HasteNavbarProps> = ({
  currentRoute,
  navigateTo,
  navigateToSection,
  isCurrentlyMobile,
  mockMobileFrame,
  mobileMenuOpen,
  setMobileMenuOpen,
  mobileBrandOpen,
  setMobileBrandOpen,
  mobileMembershipOpen,
  setMobileMembershipOpen,
  isNavbarLight,
  isFranchiseHovered,
  setIsFranchiseHovered,
  isBrandHovered,
  setIsBrandHovered,
  isAdminHovered,
  setIsAdminHovered,
  setActiveAdminTab,
  setIsSignUpOpen,
  setIsInquiryOpen,
  handleReplayIntro,
  loggedUser,
  onOpenLogin,
  onOpenMyInfo,
  onLogout,
  globalIsPlaying = false,
  currentGlobalSound = null,
  toggleGlobalPlay = () => {},
  playNextGlobalSound = () => {},
  hasSounds = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <nav className={`${mockMobileFrame ? 'absolute' : 'fixed'} left-0 right-0 z-50 backdrop-blur-lg py-4 shadow-xl transition-all duration-300 ${ isNavbarLight ? 'bg-white/92 border-b border-stone-200/80' : 'bg-[#15141D]/92 border-b border-[#C5A059]/30' }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          {/* Left Side: Logo brand and permanently visible Cinema Film Badge */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="cursor-pointer flex items-center group transition-transform duration-350 hover:scale-105" onClick={() => navigateTo('HOME')} title="Go Home">
              <HasteFullLogo size={30} light={!isNavbarLight} logoGlow={!isNavbarLight} wordmarkSizeClass="text-xl md:text-2xl" color={isScrolled ? '#4A3525' : undefined} />
            </div>

            <div className="flex flex-col items-start gap-1 ml-1.5 shrink-0 select-none">
              <button
                id="nav-link-intro"
                onClick={() => navigateTo('FILM')}
                onMouseEnter={() => {
                  setIsFranchiseHovered(false);
                  setIsBrandHovered(false);
                  setIsAdminHovered(false);
                }}
                className="w-full px-2 py-0.5 rounded-full bg-stone-950 hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/50 transition-all duration-300 tracking-[0.12em] text-[8px] cursor-pointer font-sans font-black flex items-center gap-1 shadow-md active:scale-95"
                title="헤이스트 홍보관 열기"
              >
                <Zap size={8} className="text-[#C5A059] fill-[#C5A059]/50 animate-pulse" />
                홍보관
              </button>
            </div>

            {/* Navbar Global Sound Equalizer (사운드바) */}
            {hasSounds && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGlobalPlay();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] cursor-pointer select-none transition-all ml-1.5 active:scale-95 shrink-0"
                title={globalIsPlaying ? `음악 일시정지: ${currentGlobalSound?.title}` : `음악 재생: ${currentGlobalSound?.title}`}
              >
                {/* Rhythm bars */}
                <div className="flex items-end gap-[1.5px] h-2.5 w-3.5 shrink-0">
                  {[0, 1, 2, 3].map((idx) => (
                    <motion.div
                      key={idx}
                      className="w-[1.5px] bg-[#C5A059] rounded-full"
                      animate={globalIsPlaying ? {
                        height: [2.5, 9.5, 2.5],
                      } : {
                        height: 2.5
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: idx * 0.15,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] font-bold text-[#C5A059]/85 max-w-[65px] truncate hidden sm:inline">
                  {globalIsPlaying ? 'PLAYING' : 'PAUSED'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Nav Actions */}
          <div 
            className={`${isCurrentlyMobile ? 'hidden' : 'hidden lg:flex'} flex-col items-end gap-1`}
            onMouseLeave={() => {
              setIsFranchiseHovered(false);
              setIsBrandHovered(false);
              setIsAdminHovered(false);
            }}
          >
            <div className={`flex items-center gap-2 text-sm tracking-[0.12em] font-sans font-bold ${ isNavbarLight ? 'text-stone-800' : 'text-stone-200' }`}>
              {[
                { id: 'BRAND', nameEn: 'BRAND STORY' },
                { id: 'FRANCHISE', nameEn: 'MEMBERSHIP' },
                { id: 'INTERIOR', nameEn: 'INTERIOR' },
                { id: 'MENU', nameEn: 'MENU' },
                { id: 'STORE', nameEn: '매장안내' },
                { id: 'BOARD', nameEn: '커뮤니티' },
                { id: 'USER_BTN', nameEn: '내 정보' },
                { id: 'ADMIN', nameEn: 'ADMIN' },
                { id: 'SIGNUP', nameEn: '멤버십 가입신청' },
                { id: 'INQUIRY_BTN', nameEn: '창업문의' }
              ].map((item) => {
                const isFranchise = item.id === 'FRANCHISE';
                const isBrand = item.id === 'BRAND';
                const isAdmin = item.id === 'ADMIN';
                const isUserBtn = item.id === 'USER_BTN';
                const isSignUp = item.id === 'SIGNUP';
                const isInquiryBtn = item.id === 'INQUIRY_BTN';
                
                if (isSignUp) {
                  return (
                    <button
                      key="SIGNUP"
                      id="nav-link-signup"
                      onClick={() => setIsSignUpOpen(true)}
                      onMouseEnter={() => {
                        setIsFranchiseHovered(false);
                        setIsBrandHovered(false);
                        setIsAdminHovered(false);
                      }}
                      className="ml-3 px-4 py-2 rounded-xl bg-[#C5A059] text-stone-950 hover:bg-[#B8964C] hover:text-stone-950 transition-all duration-300 text-xs cursor-pointer font-extrabold flex items-center gap-1.5 shadow-md shadow-[#C5A059]/15 hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-950"></span>
                      </span>
                      <span>멤버십 가입신청</span>
                    </button>
                  );
                }

                if (isInquiryBtn) {
                  return (
                    <button
                      key="INQUIRY_BTN"
                      id="nav-link-inquiry-btn"
                      onClick={() => setIsInquiryOpen(true)}
                      onMouseEnter={() => {
                        setIsFranchiseHovered(false);
                        setIsBrandHovered(false);
                        setIsAdminHovered(false);
                      }}
                      className="haste-dark-btn ml-2 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>창업문의</span>
                    </button>
                  );
                }

                if (isUserBtn) {
                  const isAdminLoggedIn = localStorage.getItem('haste_admin_auth') === 'true';
                  const hasUserOrAdmin = !!loggedUser || isAdminLoggedIn;
                  return (
                    <button
                      key="USER_BTN"
                      id="nav-link-user"
                      onClick={() => {
                        if (hasUserOrAdmin) {
                          onOpenMyInfo();
                        } else {
                          onOpenLogin();
                        }
                      }}
                      onMouseEnter={() => {
                        setIsFranchiseHovered(false);
                        setIsBrandHovered(false);
                        setIsAdminHovered(false);
                      }}
                      className={`relative px-4 py-2.5 rounded-xl cursor-pointer hover:text-[#C5A059] transition-all duration-300 ease-out select-none flex items-center ${ hasUserOrAdmin ? 'text-[#C5A059] bg-[#C5A059]/5' : (isScrolled ? 'text-[#4A3525]' : (isNavbarLight ? 'text-stone-700' : 'text-stone-300')) }`}
                      title={hasUserOrAdmin ? "내 정보 및 플랫폼 현황" : "멤버십 로그인"}
                    >
                      <User size={18} className="w-[18px] h-[18px]" />
                      {hasUserOrAdmin && (
                        <span className="text-[10px] font-serif font-black ml-1 text-[#C5A059] hidden lg:inline truncate max-w-[70px]">
                          {loggedUser 
                            ? loggedUser.store_name?.replace('헤이스트 ', '') 
                            : '통합관리자'}
                        </span>
                      )}
                    </button>
                  );
                }
                
                const buttonElement = (
                  <button 
                    key={item.id}
                    id={`nav-link-${item.id.toLowerCase()}`}
                    onClick={() => {
                      if (item.id === 'ADMIN') {
                        setActiveAdminTab('MEMBERS');
                      }
                      navigateTo(item.id);
                    }} 
                    onMouseEnter={() => {
                      if (item.id === 'FRANCHISE') {
                        setIsFranchiseHovered(true);
                        setIsBrandHovered(false);
                        setIsAdminHovered(false);
                      } else if (item.id === 'BRAND') {
                        setIsBrandHovered(true);
                        setIsFranchiseHovered(false);
                        setIsAdminHovered(false);
                      } else if (item.id === 'ADMIN') {
                        setIsAdminHovered(true);
                        setIsFranchiseHovered(false);
                        setIsBrandHovered(false);
                      } else {
                        setIsFranchiseHovered(false);
                        setIsBrandHovered(false);
                        setIsAdminHovered(false);
                      }
                    }}
                    className={`haste-topmenu ${
                      item.id === 'FILM'
                        ? 'special-film'
                        : isScrolled
                          ? 'scrolled'
                          : currentRoute === item.id
                            ? 'active'
                            : currentRoute === 'FILM'
                              ? 'film'
                              : isNavbarLight
                                ? 'light'
                                : 'dark'
                    }`}
                  >
                    <span className="relative z-10">
                      {item.id === 'ADMIN' ? (
                        <span className="flex items-center" title="Admin Board/Settings">
                          <Settings size={18} className="w-[18px] h-[18px]" />
                        </span>
                      ) : (
                        item.nameEn
                      )}
                    </span>
                    
                    {/* Active golden line indicator */}
                    {currentRoute === item.id && (
                      <motion.div 
                        layoutId="nav-active-pill"
                        className="absolute bottom-0 inset-x-4 h-0.5 bg-[#C5A059] shadow-[0_0_12px_#C5A059]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );

                if (isFranchise) {
                  return (
                    <div 
                      key={item.id} 
                      className="relative inline-flex items-center"
                      onMouseEnter={() => {
                        setIsFranchiseHovered(true);
                        setIsBrandHovered(false);
                        setIsAdminHovered(false);
                      }}
                      onMouseLeave={() => setIsFranchiseHovered(false)}
                    >
                      {buttonElement}
                      
                      <AnimatePresence>
                        {(currentRoute === 'FRANCHISE' || isFranchiseHovered) && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-4 pt-4 -mt-4 flex gap-4 sm:gap-5 items-center z-50 py-1"
                          >
                            {MEMBERSHIP_SUB_MENUS.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToSection(sub.id);
                                }}
                                className={`text-xs font-bold transition-all duration-200 cursor-pointer hover:text-[#C5A059] whitespace-nowrap ${ isNavbarLight ? 'text-stone-500 hover:text-[#C5A059]' : 'text-stone-400 hover:text-[#C5A059]' }`}
                              >
                                <span>{sub.name}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                if (isBrand) {
                  return (
                    <div 
                      key={item.id} 
                      className="relative inline-flex items-center"
                      onMouseEnter={() => {
                        setIsBrandHovered(true);
                        setIsFranchiseHovered(false);
                        setIsAdminHovered(false);
                      }}
                      onMouseLeave={() => setIsBrandHovered(false)}
                    >
                      {buttonElement}
                      
                      <AnimatePresence>
                        {(currentRoute === 'BRAND' || isBrandHovered) && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-4 pt-4 -mt-4 flex gap-4 sm:gap-5 items-center z-50 py-1"
                          >
                            {BRAND_SUB_MENUS.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToSection(sub.id);
                                }}
                                className={`text-xs font-bold transition-all duration-200 cursor-pointer hover:text-[#C5A059] whitespace-nowrap ${ isNavbarLight ? 'text-stone-500 hover:text-[#C5A059]' : 'text-stone-400 hover:text-[#C5A059]' }`}
                              >
                                <span>{sub.name}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return buttonElement;
              })}
            </div>
          </div>

          {/* Mobile menu trigger */}
          <button 
            id="mobile-nav-toggle"
            className={`${isCurrentlyMobile ? 'flex' : 'lg:hidden'} p-2.5 border rounded-xl transition-colors ${ isNavbarLight ? 'text-stone-800 border-stone-200 bg-stone-100 hover:bg-stone-200' : 'text-stone-200 border-stone-800 bg-stone-900/50 hover:bg-stone-900' }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
        </div>
      </nav>

      <HasteNavbarMobileDrawer
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mockMobileFrame={mockMobileFrame}
        mobileBrandOpen={mobileBrandOpen}
        setMobileBrandOpen={setMobileBrandOpen}
        mobileMembershipOpen={mobileMembershipOpen}
        setMobileMembershipOpen={setMobileMembershipOpen}
        navigateTo={navigateTo}
        navigateToSection={navigateToSection}
        setIsSignUpOpen={setIsSignUpOpen}
        setIsInquiryOpen={setIsInquiryOpen}
        handleReplayIntro={handleReplayIntro}
        loggedUser={loggedUser}
        onOpenLogin={onOpenLogin}
        onOpenMyInfo={onOpenMyInfo}
        onLogout={onLogout}
      />
    </>
  );
};
