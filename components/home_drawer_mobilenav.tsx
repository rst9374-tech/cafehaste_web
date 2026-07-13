import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ArrowRight, Zap } from 'lucide-react';
import { BRAND_SUB_MENUS, MEMBERSHIP_SUB_MENUS } from '../src/data';

// Import local modal popups to serve dynamic actions from mobile drawer
import { HasteGuidebookModal } from './membership_modal_guidebook';
import { HasteBenefitModal } from './membership_modal_benefit';
import { HastePasswordChangeModal } from './membership_modal_password';

interface HasteNavbarMobileDrawerProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  mockMobileFrame: boolean;
  mobileBrandOpen: boolean;
  setMobileBrandOpen: (open: boolean) => void;
  mobileMembershipOpen: boolean;
  setMobileMembershipOpen: (open: boolean) => void;
  navigateTo: (route: any, keepMobileMenuOpen?: boolean) => void;
  navigateToSection: (sectionId: string) => void;
  setIsSignUpOpen: (open: boolean) => void;
  setIsInquiryOpen: (open: boolean) => void;
  handleReplayIntro: () => void;
  loggedUser?: any;
  onOpenLogin: () => void;
  onOpenMyInfo: () => void;
  onLogout?: () => void;
}

export const HasteNavbarMobileDrawer: React.FC<HasteNavbarMobileDrawerProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  mockMobileFrame,
  mobileBrandOpen,
  setMobileBrandOpen,
  mobileMembershipOpen,
  setMobileMembershipOpen,
  navigateTo,
  navigateToSection,
  setIsSignUpOpen,
  setIsInquiryOpen,
  handleReplayIntro,
  loggedUser,
  onOpenLogin,
  onOpenMyInfo,
  onLogout,
}) => {
  const isAdminLoggedIn = localStorage.getItem('haste_admin_auth') === 'true';
  const hasUserOrAdmin = !!loggedUser || isAdminLoggedIn;

  // Local popup control states for newly integrated footer actions
  const [isGuidebookLocalOpen, setIsGuidebookLocalOpen] = React.useState(false);
  const [isBenefitLocalOpen, setIsBenefitLocalOpen] = React.useState(false);
  const [isPasswordLocalOpen, setIsPasswordLocalOpen] = React.useState(false);

  const uStoreCode = loggedUser ? (loggedUser.store_code || loggedUser.storeCode || '') : '';

  return (
    <>
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop layer */}
            <motion.div
              id="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className={`${mockMobileFrame ? 'absolute' : 'fixed'} inset-0 bg-stone-950/40 backdrop-blur-xs z-[110]`}
            />

            <motion.div
              id="mobile-nav-overlay"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className={`${mockMobileFrame ? 'absolute' : 'fixed'} right-0 top-0 bottom-0 w-[210px] sm:w-[240px] z-[120] bg-white border-l border-stone-200 shadow-2xl p-4 pt-14 flex flex-col gap-4 font-sans overflow-y-auto max-h-screen`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4">
                {/* Header close button */}
                <div className="flex justify-between items-center pb-2 border-b border-stone-100 mb-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-stone-400">HASTE NAV</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-400 hover:text-stone-850 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Action Buttons (최상단 콤팩트 배치) */}
                <div className="grid grid-cols-2 gap-1 pb-3 border-b border-stone-100">
                  {hasUserOrAdmin ? (
                    <>
                      <button
                        id="mobile-nav-myinfo"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenMyInfo();
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        대시보드
                      </button>
                      <button
                        id="mobile-nav-password-local"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsPasswordLocalOpen(true);
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        비번변경
                      </button>
                      <button
                        id="mobile-nav-benefit-local"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsBenefitLocalOpen(true);
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        멤버십 혜택
                      </button>
                      <button
                        id="mobile-nav-signup"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsSignUpOpen(true);
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        가입신청
                      </button>
                      <button
                        id="mobile-nav-inquiry-btn"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsInquiryOpen(true);
                        }}
                        className="col-span-2 haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        창업 문의
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        id="mobile-nav-login"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenLogin();
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        로그인
                      </button>
                      <button
                        id="mobile-nav-benefit-local"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsBenefitLocalOpen(true);
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        멤버십 혜택
                      </button>
                      <button
                        id="mobile-nav-signup"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsSignUpOpen(true);
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        가입신청
                      </button>
                      <button
                        id="mobile-nav-inquiry-btn"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsInquiryOpen(true);
                        }}
                        className="haste-dark-mini-btn w-full text-center py-1 font-bold whitespace-nowrap"
                      >
                        창업 문의
                      </button>
                    </>
                  )}
                </div>

                {/* BRAND STORY Accordion */}
                <div className="border-b border-stone-100 py-1 flex flex-col text-xs font-bold uppercase tracking-wider">
                  <button 
                    id="mobile-nav-brand-toggle" 
                    onClick={() => {
                      setMobileBrandOpen(!mobileBrandOpen);
                      setMobileMembershipOpen(false);
                    }} 
                    className="w-full flex justify-between items-center py-1 hover:text-[#C5A059] text-left text-stone-850"
                  >
                    <span>BRAND STORY</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${mobileBrandOpen ? 'rotate-180 text-[#C5A059]' : 'text-stone-400'}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {mobileBrandOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden pl-3 flex flex-col gap-1.5 border-l border-[#C5A059]/30 my-1 pb-1"
                      >
                        {BRAND_SUB_MENUS.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              navigateToSection(sub.id);
                            }}
                            className="text-left py-0.5 text-[10px] text-stone-500 hover:text-[#C5A059] flex items-center justify-between cursor-pointer font-bold"
                          >
                            <span className="text-stone-600">{sub.name}</span>
                            <ArrowRight size={8} className="text-[#C5A059]" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* MEMBERSHIP Accordion */}
                <div className="border-b border-stone-100 py-1 flex flex-col text-xs font-bold uppercase tracking-wider">
                  <button 
                    id="mobile-nav-franchise-toggle" 
                    onClick={() => {
                      setMobileMembershipOpen(!mobileMembershipOpen);
                      setMobileBrandOpen(false);
                    }} 
                    className="w-full flex justify-between items-center py-1 hover:text-[#C5A059] text-left text-stone-850"
                  >
                    <span>MEMBERSHIP</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${mobileMembershipOpen ? 'rotate-180 text-[#C5A059]' : 'text-stone-400'}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {mobileMembershipOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden pl-3 flex flex-col gap-1.5 border-l border-[#C5A059]/30 my-1 pb-1"
                      >
                        {MEMBERSHIP_SUB_MENUS.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              navigateToSection(sub.id);
                            }}
                            className="text-left py-0.5 text-[10px] text-stone-500 hover:text-[#C5A059] flex items-center justify-between cursor-pointer font-bold"
                          >
                            <span className="text-stone-600">{sub.name}</span>
                            {sub.id !== 'franchise-membership' && <ArrowRight size={8} className="text-[#C5A059]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <button id="mobile-nav-menu" onClick={() => { setMobileMenuOpen(false); navigateTo('MENU'); }} className="text-left py-1.5 border-b border-stone-100 text-xs font-bold tracking-wider text-stone-850 hover:text-[#C5A059] uppercase transition-colors">MENU</button>
                
                <button id="mobile-nav-interior" onClick={() => { setMobileMenuOpen(false); navigateTo('INTERIOR'); }} className="text-left py-1.5 border-b border-stone-100 text-xs font-bold tracking-wider text-stone-850 hover:text-[#C5A059] uppercase transition-colors">INTERIOR</button>
                <button id="mobile-nav-store" onClick={() => { setMobileMenuOpen(false); navigateTo('STORE'); }} className="text-left py-1.5 border-b border-stone-100 text-xs font-bold tracking-wider text-stone-850 hover:text-[#C5A059] uppercase transition-colors">매장안내</button>
                <button id="mobile-nav-board" onClick={() => { setMobileMenuOpen(false); navigateTo('BOARD'); }} className="text-left py-1.5 border-b border-stone-100 text-xs font-bold tracking-wider text-stone-850 hover:text-[#C5A059] uppercase transition-colors">커뮤니티</button>
                <button id="mobile-nav-film" onClick={() => { setMobileMenuOpen(false); navigateTo('FILM'); }} className="text-left py-1.5 border-b border-stone-100 text-xs font-bold tracking-wider text-stone-850 hover:text-[#C5A059] transition-colors">홍보관</button>
                <button id="mobile-nav-music" onClick={() => { setMobileMenuOpen(false); navigateTo('MUSIC'); }} className="text-left py-1.5 border-b border-stone-100 text-xs font-bold tracking-wider text-[#C5A059] hover:text-[#C5A059]/80 uppercase transition-colors">MUSIC</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Render local modal popups */}
      <HasteGuidebookModal
        isOpen={isGuidebookLocalOpen}
        onClose={() => setIsGuidebookLocalOpen(false)}
      />

      <HasteBenefitModal
        isOpen={isBenefitLocalOpen}
        onClose={() => setIsBenefitLocalOpen(false)}
      />

      <HastePasswordChangeModal
        isOpen={isPasswordLocalOpen}
        onClose={() => setIsPasswordLocalOpen(false)}
        uStoreCode={uStoreCode}
      />
    </>
  );
};
