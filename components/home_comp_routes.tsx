import React, { Suspense } from 'react';
import { Song } from '../types';

// High-speed Lazy Loading for Heavy sensory workspace components of Cafe Haste
const HasteIntro = React.lazy(() => import('./home_page_intro').then(m => ({ default: m.HasteIntro })));
const HasteBrand = React.lazy(() => import('./brand_page_main').then(m => ({ default: m.HasteBrand })));
const HasteMenu = React.lazy(() => import('./menu_page_main').then(m => ({ default: m.HasteMenu })));
const HasteStore = React.lazy(() => import('./store_page_main').then(m => ({ default: m.HasteStore })));
const HasteFranchise = React.lazy(() => import('./franchise_page_main').then(m => ({ default: m.HasteFranchise })));
const HasteAdmin = React.lazy(() => import('./admin_page_main').then(m => ({ default: m.HasteAdmin })));
const HasteSignUpModal = React.lazy(() => import('./membership_modal_signup').then(m => ({ default: m.HasteSignUpModal })));
const HasteInquiryModal = React.lazy(() => import('./membership_modal_inquiry').then(m => ({ default: m.HasteInquiryModal })));
const HasteTermsModal = React.lazy(() => import('./membership_modal_terms').then(m => ({ default: m.HasteTermsModal })));
const HasteInterior = React.lazy(() => import('./interior_page_main').then(m => ({ default: m.HasteInterior })));
const HasteBoard = React.lazy(() => import('./board_page_main').then(m => ({ default: m.HasteBoard })));
const HasteControl = React.lazy(() => import('./membership_page_control').then(m => ({ default: m.HasteControlPage })));
const AdminPageTestValidator = React.lazy(() => import('./admin/admin_page_test_validator').then(m => ({ default: m.AdminPageTestValidator })));


// Mobile equivalents of primary application routes
const HasteHomeMobile = React.lazy(() => import('./mobile/home_page_mobile').then(m => ({ default: m.HasteHomeMobile })));
const HasteBrandMobile = React.lazy(() => import('./mobile/brand_page_mobile').then(m => ({ default: m.HasteBrandMobile })));
const HasteMenuMobile = React.lazy(() => import('./mobile/menu_page_mobile').then(m => ({ default: m.HasteMenuMobile })));
const HasteStoreMobile = React.lazy(() => import('./mobile/store_page_mobile').then(m => ({ default: m.HasteStoreMobile })));
const HasteFranchiseMobile = React.lazy(() => import('./mobile/franchise_page_mobile').then(m => ({ default: m.HasteFranchiseMobile })));
const HasteInteriorMobile = React.lazy(() => import('./mobile/interior_page_mobile').then(m => ({ default: m.HasteInteriorMobile })));
const HasteFilm = React.lazy(() => import('./film_page_main').then(m => ({ default: m.HasteFilm })));
const HasteFilmMobile = React.lazy(() => import('./mobile/film_page_mobile').then(m => ({ default: m.HasteFilmMobile })));
const HasteMyInfoMobile = React.lazy(() => import('./mobile/membership_page_myinfo_mobile').then(m => ({ default: m.HasteMyInfoMobile })));
const HasteMusic = React.lazy(() => import('./music_page_main').then(m => ({ default: m.HasteMusic })));
const HasteMusicMobile = React.lazy(() => import('./mobile/music_page_mobile').then(m => ({ default: m.HasteMusicMobile })));
const MusicStandaloneApp = React.lazy(() => import('./music_page_home').then(m => ({ default: m.MusicStandaloneApp })));
const MusicAdminPage = React.lazy(() => import('./music_page_admin').then(m => ({ default: m.MusicAdminPage })));
const MusicNavbar = React.lazy(() => import('./music_comp_navbar').then(m => ({ default: m.MusicNavbar })));
const MusicFooter = React.lazy(() => import('./music_comp_footer').then(m => ({ default: m.MusicFooter })));

import { HasteLoginModal } from './membership_modal_login';
import { HasteMyInfoPage } from './membership_page_myinfo';
import { HasteHome } from './home_page_main';
import { HasteNavbar } from './home_comp_navbar';
import { HasteFooter } from './home_comp_footer';
import { HasteOrderSuccessModal } from './menu_modal_ordersuccess';

// 관리자 세션 mock user 상수 (MYINFO/CONTROL 공통)
const ADMIN_MOCK_USER = {
  id: -999,
  role: 'ADMIN',
  username: 'admin',
  store_code: 'HASTE-HQS-ADMIN',
  store_name: '헤이스트',
  owner_name: '최고 권한자',
  email: 'cafehaste@gmail.com',
  phone: '02-543-9878',
  address: '서울특별시 마포구 독막로 헤이스트 오피스 3F',
  business_number: '543-85-11200',
  approval_status: '승인',
  created_at: new Date('2026-01-01T00:00:00Z').toISOString()
};


interface HomeCompRoutesProps {
  ctrl: any;
  interiorTypes: any[];
  setInteriorTypes: (v: any) => void;
  heroDrafts: any[];
  appFilms: any[];
  draftRandomShow?: boolean;
  setDraftRandomShow?: (v: boolean) => void;
  filmRandomShow?: boolean;
  setFilmRandomShow?: (v: boolean) => void;
  isNavbarLight: boolean;
  globalIsPlaying: boolean;
  currentGlobalSound: any;
  toggleGlobalPlay: () => void;
  playNextGlobalSound: () => void;
  globalSounds: any[];
  FallbackLoader: React.ComponentType;
}

export function HomeCompRoutes({
  ctrl,
  interiorTypes,
  setInteriorTypes,
  heroDrafts,
  appFilms,
  draftRandomShow = false,
  setDraftRandomShow = () => {},
  filmRandomShow = false,
  setFilmRandomShow = () => {},
  isNavbarLight,
  globalIsPlaying,
  currentGlobalSound,
  toggleGlobalPlay,
  playNextGlobalSound,
  globalSounds,
  FallbackLoader
}: HomeCompRoutesProps) {
  if (ctrl.currentRoute === 'MUSIC_ADMIN') {
    return (
      <div className="min-h-screen bg-[#070708] text-stone-300 pb-0 font-sans antialiased music-theme-body flex flex-col justify-between">
        <Suspense fallback={<FallbackLoader />}>
          <MusicNavbar 
            activeTab={'ADMIN' as any} 
            setActiveTab={(tab: any) => {
              window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'MUSIC' } }));
            }} 
          />
        </Suspense>
        <main className="w-full flex-grow">
          <Suspense fallback={<FallbackLoader />}>
            <MusicAdminPage />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <MusicFooter />
        </Suspense>
      </div>
    );
  }

  if (ctrl.isStandaloneMusic) {
    return (
      <Suspense fallback={<FallbackLoader />}>
        <MusicStandaloneApp />
      </Suspense>
    );
  }

  return (
    <>
      {ctrl.currentRoute !== 'TEST_VALIDATOR' && (
        <HasteNavbar
          currentRoute={ctrl.currentRoute}
          navigateTo={ctrl.navigateTo}
          navigateToSection={ctrl.navigateToSection}
          isCurrentlyMobile={ctrl.isCurrentlyMobile}
          mockMobileFrame={ctrl.mockMobileFrame}
          mobileMenuOpen={ctrl.mobileMenuOpen}
          setMobileMenuOpen={ctrl.setMobileMenuOpen}
          mobileBrandOpen={ctrl.mobileBrandOpen}
          setMobileBrandOpen={ctrl.setMobileBrandOpen}
          mobileMembershipOpen={ctrl.mobileMembershipOpen}
          setMobileMembershipOpen={ctrl.setMobileMembershipOpen}
          isNavbarLight={isNavbarLight}
          isFranchiseHovered={ctrl.isFranchiseHovered}
          setIsFranchiseHovered={ctrl.setIsFranchiseHovered}
          isBrandHovered={ctrl.isBrandHovered}
          setIsBrandHovered={ctrl.setIsBrandHovered}
          isAdminHovered={ctrl.isAdminHovered}
          setIsAdminHovered={ctrl.setIsAdminHovered}
          setActiveAdminTab={ctrl.setActiveAdminTab}
          setIsSignUpOpen={ctrl.setIsSignUpOpen}
          setIsInquiryOpen={ctrl.setIsInquiryOpen}
          handleReplayIntro={ctrl.handleReplayIntro}
          loggedUser={ctrl.loggedUser}
          onOpenLogin={() => ctrl.setIsLoginOpen(true)}
          onOpenMyInfo={() => ctrl.navigateTo('MYINFO')}
          onLogout={() => {
            localStorage.removeItem('haste_admin_auth');
            localStorage.removeItem('haste_logged_user');
            ctrl.setLoggedUser(null);
            ctrl.navigateTo('HOME');
          }}
          globalIsPlaying={globalIsPlaying}
          currentGlobalSound={currentGlobalSound}
          toggleGlobalPlay={toggleGlobalPlay}
          playNextGlobalSound={playNextGlobalSound}
          hasSounds={globalSounds.length > 0}
        />
      )}

      <main className={`min-h-[calc(100vh-250px)] ${(ctrl.currentRoute === 'FILM' || ctrl.currentRoute === 'MUSIC') ? 'bg-[#0A0A0C]' : ''} ${ctrl.currentRoute === 'TEST_VALIDATOR' ? 'pt-0 pb-6' : ctrl.currentRoute === 'HOME' ? '' : (ctrl.currentRoute === 'FRANCHISE' || ctrl.currentRoute === 'INTERIOR') ? 'pt-[40px] md:pt-28 pb-6 md:pb-12' : 'pt-[80px] md:pt-28 pb-6 md:pb-12'}`}>
        <div className="w-full">
          {ctrl.currentRoute === 'HOME' && (
            ctrl.isCurrentlyMobile ? (
              <Suspense fallback={<FallbackLoader />}>
                <HasteHomeMobile
                  filteredDrafts={ctrl.filteredDrafts}
                  currentDraftIndex={ctrl.currentDraftIndex}
                  setCurrentDraftIndex={ctrl.setCurrentDraftIndex}
                  isAutoRotationActive={ctrl.isAutoRotationActive}
                  setIsAutoRotationActive={ctrl.setIsAutoRotationActive}
                  signatureItems={ctrl.signatureItems}
                  interiorTypes={interiorTypes}
                  setSelectedInteriorId={ctrl.setSelectedInteriorId}
                  navigateTo={ctrl.navigateTo}
                  navigateToSection={ctrl.navigateToSection}
                  handlePrevDraft={ctrl.handlePrevDraft}
                  handleNextDraft={ctrl.handleNextDraft}
                  setSelectedPickupBranch={ctrl.setSelectedPickupBranch}
                  setActivePlayFilm={ctrl.setActivePlayFilm}
                  appFilms={appFilms}
                  draftRandomShow={draftRandomShow}
                  filmRandomShow={filmRandomShow}
                />
              </Suspense>
            ) : (
              <HasteHome
                filteredDrafts={ctrl.filteredDrafts}
                currentDraftIndex={ctrl.currentDraftIndex}
                setCurrentDraftIndex={ctrl.setCurrentDraftIndex}
                isAutoRotationActive={ctrl.isAutoRotationActive}
                setIsAutoRotationActive={ctrl.setIsAutoRotationActive}
                signatureItems={ctrl.signatureItems}
                interiorTypes={interiorTypes}
                setSelectedInteriorId={ctrl.setSelectedInteriorId}
                navigateTo={ctrl.navigateTo}
                navigateToSection={ctrl.navigateToSection}
                handlePrevDraft={ctrl.handlePrevDraft}
                handleNextDraft={ctrl.handleNextDraft}
                setSelectedMenuItemId={ctrl.setSelectedMenuItemId}
                setActivePlayFilm={ctrl.setActivePlayFilm}
                appFilms={appFilms}
                draftRandomShow={draftRandomShow}
                filmRandomShow={filmRandomShow}
              />
            )
          )}

          {ctrl.currentRoute === 'MUSIC' && (
            <div id="music-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? (
                  <HasteMusicMobile />
                ) : (
                  <HasteMusic />
                )}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'BRAND' && (
            <div id="brand-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? (
                  <HasteBrandMobile appFilms={appFilms} />
                ) : (
                  <HasteBrand appFilms={appFilms} />
                )}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'MENU' && (
            <div id="menu-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? (
                  <HasteMenuMobile
                    cart={ctrl.cart}
                    setCart={ctrl.setCart}
                    defaultPickupBranch={ctrl.selectedPickupBranch}
                    onCheckout={ctrl.handlePlaceOrder}
                  />
                ) : (
                  <HasteMenu 
                     cart={ctrl.cart} 
                     setCart={ctrl.setCart} 
                     defaultPickupBranch={ctrl.selectedPickupBranch}
                     onCheckout={ctrl.handlePlaceOrder}
                     isMobile={ctrl.isCurrentlyMobile}
                     useMobileCompact={false}
                     selectedMenuItemId={ctrl.selectedMenuItemId}
                     setSelectedMenuItemId={ctrl.setSelectedMenuItemId}
                  />
                )}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'STORE' && (
            <div id="store-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? (
                  <HasteStoreMobile
                    onQuickOrder={(branchName) => {
                      ctrl.setSelectedPickupBranch(branchName);
                      ctrl.navigateTo('MENU');
                    }}
                  />
                ) : (
                  <HasteStore 
                     isMobile={ctrl.isCurrentlyMobile}
                     useMobileCompact={false}
                     onQuickOrder={(branchName) => {
                       ctrl.setSelectedPickupBranch(branchName);
                       ctrl.navigateTo('MENU');
                     }}
                  />
                )}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'BOARD' && (
            <div id="board-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                <HasteBoard 
                  loggedUser={ctrl.loggedUser}
                  onOpenLogin={() => ctrl.setIsLoginOpen(true)}
                  onOpenSignUp={() => ctrl.setIsSignUpOpen(true)}
                  setActivePlayFilm={ctrl.setActivePlayFilm}
                />
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'FILM' && (
            <div id="film-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? (
                  <HasteFilmMobile 
                    appFilms={appFilms}
                    filmRandomShow={filmRandomShow}
                    startMuted={ctrl.isFilmDirectLoad}
                  />
                ) : (
                  <HasteFilm 
                    appFilms={appFilms}
                    filmRandomShow={filmRandomShow}
                    startMuted={ctrl.isFilmDirectLoad}
                  />
                )}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'FRANCHISE' && (
            <div id="franchise-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? <HasteFranchiseMobile /> : <HasteFranchise />}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'INTERIOR' && (
            <div id="interior-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? (
                  <HasteInteriorMobile
                    interiorTypes={interiorTypes}
                    onNavigateToSignup={() => ctrl.setIsSignUpOpen(true)}
                    onNavigateToInquiry={() => ctrl.setIsInquiryOpen(true)}
                    selectedInteriorId={ctrl.selectedInteriorId}
                    setSelectedInteriorId={ctrl.setSelectedInteriorId}
                  />
                ) : (
                  <HasteInterior 
                    interiorTypes={interiorTypes}
                    onNavigateToSignup={() => ctrl.setIsSignUpOpen(true)}
                    onNavigateToInquiry={() => ctrl.setIsInquiryOpen(true)}
                    selectedInteriorId={ctrl.selectedInteriorId}
                    setSelectedInteriorId={ctrl.setSelectedInteriorId}
                  />
                )}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'MYINFO' && (
            <div id="myinfo-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                {ctrl.isCurrentlyMobile ? (
                  <HasteMyInfoMobile
                    user={ctrl.loggedUser || (localStorage.getItem('haste_admin_auth') === 'true' ? ADMIN_MOCK_USER : null)}
                    onLogout={() => {
                      localStorage.removeItem('haste_admin_auth');
                      localStorage.removeItem('haste_logged_user');
                      ctrl.setLoggedUser(null);
                      ctrl.navigateTo('HOME');
                    }}
                    navigateTo={ctrl.navigateTo}
                  />
                ) : (
                  <HasteMyInfoPage
                    user={ctrl.loggedUser || (localStorage.getItem('haste_admin_auth') === 'true' ? ADMIN_MOCK_USER : null)}
                    onLogout={() => {
                      localStorage.removeItem('haste_admin_auth');
                      localStorage.removeItem('haste_logged_user');
                      ctrl.setLoggedUser(null);
                      ctrl.navigateTo('HOME');
                    }}
                    navigateTo={ctrl.navigateTo}
                  />
                )}
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'CONTROL' && (
            <div id="control-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                <HasteControl
                  user={ctrl.loggedUser || (localStorage.getItem('haste_admin_auth') === 'true' ? ADMIN_MOCK_USER : null)}
                  navigateTo={ctrl.navigateTo}
                />
              </Suspense>
            </div>
          )}

          {ctrl.currentRoute === 'TEST_VALIDATOR' && (
            <div id="test-validator-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                <AdminPageTestValidator />
              </Suspense>
            </div>
          )}



          {ctrl.currentRoute === 'ADMIN' && (
            <div id="admin-view-wrapper">
              <Suspense fallback={<FallbackLoader />}>
                <HasteAdmin 
                  heroDrafts={heroDrafts} 
                  onUpdateDrafts={ctrl.handleUpdateDrafts} 
                  activeAdminTab={ctrl.activeAdminTab}
                  setActiveAdminTab={(tab: any) => ctrl.setActiveAdminTab(tab as any)}
                  interiorsList={interiorTypes}
                  onUpdateInteriors={setInteriorTypes}
                  mockMobileFrame={ctrl.mockMobileFrame}
                  setMockMobileFrame={ctrl.setMockMobileFrame}
                  useMobileCompact={false}
                  setUseMobileCompact={() => {}}
                  setShowQRModal={() => {}}
                  loggedUser={ctrl.loggedUser}
                  draftRandomShow={draftRandomShow}
                  setDraftRandomShow={setDraftRandomShow}
                  filmRandomShow={filmRandomShow}
                  setFilmRandomShow={setFilmRandomShow}
                />
              </Suspense>
            </div>
          )}
        </div>
      </main>

      <Suspense fallback={null}>
        <HasteSignUpModal 
          isOpen={ctrl.isSignUpOpen} 
          onClose={() => ctrl.setIsSignUpOpen(false)} 
        />
      </Suspense>

      <HasteLoginModal
        isOpen={ctrl.isLoginOpen}
        onClose={() => ctrl.setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          ctrl.setLoggedUser(user);
          localStorage.setItem('haste_logged_user', JSON.stringify(user));
          ctrl.setIsLoginOpen(false);
          ctrl.navigateTo('MYINFO');
        }}
        onOpenSignUp={() => ctrl.setIsSignUpOpen(true)}
      />

      <Suspense fallback={null}>
        <HasteInquiryModal
          isOpen={ctrl.isInquiryOpen}
          onClose={() => ctrl.setIsInquiryOpen(false)}
        />
      </Suspense>

      {ctrl.currentRoute !== 'TEST_VALIDATOR' && (
        <HasteFooter
          navigateTo={ctrl.navigateTo}
          setActiveAdminTab={ctrl.setActiveAdminTab}
          setMockMobileFrame={ctrl.setMockMobileFrame}
          mockMobileFrame={ctrl.mockMobileFrame}
          setIsSignUpOpen={ctrl.setIsSignUpOpen}
          setIsInquiryOpen={ctrl.setIsInquiryOpen}
          footerDocType={ctrl.footerDocType}
          setFooterDocType={ctrl.setFooterDocType}
          activePlayFilm={ctrl.activePlayFilm}
          setActivePlayFilm={ctrl.setActivePlayFilm}
          appFilms={appFilms}
        />
      )}

      <HasteOrderSuccessModal
        isOpen={ctrl.isOrderSuccessOpen}
        onClose={() => ctrl.setIsOrderSuccessOpen(false)}
        orderInfo={ctrl.orderInfo}
      />
    </>
  );
}
