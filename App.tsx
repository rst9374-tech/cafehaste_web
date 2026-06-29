import React from 'react';
import { useHomeSwipe } from './components/home_hook_swipe';
import { useHomeInit } from './components/home_hook_init';
import { HomeSimulator } from './components/home_comp_simulator';
import { useAppController } from './components/home_hook_app';
import { useHomeSound } from './components/home_hook_sound';
import { useHomeSecurity } from './components/home_hook_security';
import { HomeCompAudio } from './components/home_comp_audio';
import { HomeCompRoutes } from './components/home_comp_routes';

const FallbackLoader = () => (
  <div className="w-full min-h-[350px] flex flex-col items-center justify-center p-12 text-stone-400 gap-3 animate-pulse">
    <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-[#C5A059] animate-spin" />
    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-stone-500">HASTE SENSORY RECONSTRUCTION...</span>
  </div>
);

export default function App() {
  const {
    interiorTypes,
    setInteriorTypes,
    heroDrafts,
    setHeroDrafts,
    appFilms,
    draftRandomShow,
    setDraftRandomShow,
    filmRandomShow,
    setFilmRandomShow
  } = useHomeInit();

  const ctrl = useAppController(
    interiorTypes,
    setInteriorTypes,
    heroDrafts,
    setHeroDrafts,
    appFilms
  );

  // Security restrictions hook (우클릭/선택 방지)
  useHomeSecurity(ctrl.currentRoute);

  const { handleTouchStart, handleTouchEnd } = useHomeSwipe(ctrl.currentRoute, ctrl.navigateTo);

  const {
    globalSounds,
    currentGlobalSound,
    globalIsPlaying,
    toggleGlobalPlay,
    playNextGlobalSound
  } = useHomeSound();

  if (ctrl.isIntroActive) {
    const HasteIntro = React.lazy(() => import('./components/home_page_intro').then(m => ({ default: m.HasteIntro })));
    return (
      <React.Suspense fallback={<FallbackLoader />}>
        <HasteIntro onComplete={ctrl.handleIntroComplete} />
      </React.Suspense>
    );
  }

  const isNavbarLight = (ctrl.currentRoute !== 'HOME' && ctrl.currentRoute !== 'FILM' && ctrl.currentRoute !== 'MUSIC') || ctrl.mobileMenuOpen;

  return (
    <HomeSimulator
      mockMobileFrame={ctrl.mockMobileFrame}
      setMockMobileFrame={ctrl.setMockMobileFrame}
      handleTouchStart={handleTouchStart}
      handleTouchEnd={handleTouchEnd}
      isFilm={ctrl.currentRoute === 'FILM' || ctrl.currentRoute === 'MUSIC'}
    >
      <HomeCompRoutes
        ctrl={ctrl}
        interiorTypes={interiorTypes}
        setInteriorTypes={setInteriorTypes}
        heroDrafts={heroDrafts}
        appFilms={appFilms}
        draftRandomShow={draftRandomShow}
        setDraftRandomShow={setDraftRandomShow}
        filmRandomShow={filmRandomShow}
        setFilmRandomShow={setFilmRandomShow}
        isNavbarLight={isNavbarLight}
        globalIsPlaying={globalIsPlaying}
        currentGlobalSound={currentGlobalSound}
        toggleGlobalPlay={toggleGlobalPlay}
        playNextGlobalSound={playNextGlobalSound}
        globalSounds={globalSounds}
        FallbackLoader={FallbackLoader}
      />
      
      {/* Background YouTube Audio Player */}
      <HomeCompAudio
        currentGlobalSound={currentGlobalSound}
        globalIsPlaying={globalIsPlaying}
      />
    </HomeSimulator>
  );
}
