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
  // 실서버 메인 도메인은 100% 차단하며,
  // 로컬 개발 환경(localhost) 또는 '/test' 테스트 도구 페이지 직접 접근, 또는 본부 관리자 로그인 인증(24시간 유효) 시에만 진입 허용
  const [isBypassed, setIsBypassed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;

      const isMobileDevice = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

      // 1. 로컬 개발 환경은 항상 허용 (단, 실제 모바일 디바이스 접속 시에는 잠금 화면 테스트를 위해 로컬 바이패스를 미적용)
      if (
        !isMobileDevice && (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.')
        )
      ) {
        return true;
      }

      // 2. 중요 검수 및 테스트 페이지인 '/test' 경로는 가림막 대상에서 제외하여 항시 오픈
      if (pathname === '/test' || pathname === '/test/') {
        return true;
      }

      // 3. 실제 본사 관리자 로그인 세션 정보 체크 (24시간 동안 유효)
      const adminAuth = localStorage.getItem('haste_admin_auth') === 'true';
      const loginTimeStr = localStorage.getItem('haste_admin_login_time');
      
      if (adminAuth && loginTimeStr) {
        const loginTime = parseInt(loginTimeStr, 10);
        const currentTime = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000; // 24시간 세션 유효 기간 설정
        
        if (currentTime - loginTime < oneDayMs) {
          return true; // 24시간 이내의 유효한 어드민 세션인 경우 통과
        }
      }
      
      // 세션이 만료되었거나 없을 경우 인증 정보 자동 파기
      localStorage.removeItem('haste_admin_auth');
      localStorage.removeItem('haste_admin_login_time');
      localStorage.removeItem('haste_bypass_construction');
    }
    return false;
  });

  // 관리자 로그인 폼 제어를 위한 상태
  const [adminUsername, setAdminUsername] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [showLoginInput, setShowLoginInput] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      setLoginError('아이디와 패스워드를 모두 입력해 주세요.');
      return;
    }
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('haste_admin_auth', 'true');
        localStorage.setItem('haste_admin_login_time', Date.now().toString());
        setIsBypassed(true);
      } else {
        setLoginError(data.message || '인증 정보가 올바르지 않습니다.');
      }
    } catch (err) {
      setLoginError('서버 연결 중 에러가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

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

  if (!isBypassed) {
    return (
      <div className="w-full min-h-screen bg-[#1E1C26] flex flex-col items-center justify-center p-6 text-center select-none font-sans relative">
        <div className="flex flex-col items-center gap-8 max-w-md">
          {/* HASTE 브랜드 시그니처 엠블럼 심볼 */}
          <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
            <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current">
              <path d="M50 15 L85 75 L15 75 Z" />
            </svg>
          </div>
          
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl md:text-3xl font-sans font-black tracking-[0.15em] text-[#C5A059] uppercase italic drop-shadow-[0_0_12px_rgba(197,160,89,0.35)]">
              HASTE PLATFORM
            </h1>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent mx-auto mt-1" />
          </div>

          <div className="flex flex-col gap-4 text-stone-300">
            <p className="text-base font-bold tracking-tight text-white leading-relaxed">
              공식 홈페이지 업데이트 진행 중입니다.
            </p>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto font-light">
              더 나은 환경과 완벽한 공간 제어 플랫폼을 구성하기 위해 시스템 안정화 패치를 진행하고 있습니다. 잠시 후 찾아뵙겠습니다.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2.5 mt-4">
            <div className="w-5 h-5 rounded-full border border-stone-700 border-t-[#C5A059] animate-spin" />
            <span className="font-mono text-[8px] tracking-[0.25em] text-stone-500 uppercase">
              UNDER CONSTRUCTION &bull; MAINTENANCE
            </span>
          </div>
        </div>

        {/* 하단 관리자 로그인 비밀 진입부 */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center z-10 px-4">
          {!showLoginInput ? (
            <button
              onClick={() => setShowLoginInput(true)}
              className="text-[9px] font-mono tracking-widest text-stone-600 hover:text-[#C5A059] transition-colors uppercase py-2 cursor-pointer"
            >
              [ SYSTEM ACCESS &bull; ADMIN LOGIN ]
            </button>
          ) : (
            <form onSubmit={handleAdminLoginSubmit} className="flex flex-col items-center gap-2.5 animate-fade-in max-w-[260px] w-full bg-stone-950/80 p-4 rounded-2xl border border-stone-850 backdrop-blur-xs">
              <span className="text-[10px] font-mono text-stone-450 tracking-wider">본사 원격 전산 인증</span>
              <div className="flex flex-col gap-1.5 w-full">
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="관리자 ID"
                  className="w-full text-center bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-full py-1.5 px-4 outline-none focus:border-[#C5A059] transition-all"
                  autoFocus
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="패스워드"
                  className="w-full text-center bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-full py-1.5 px-4 outline-none focus:border-[#C5A059] transition-all"
                />
              </div>
              <div className="flex gap-2 w-full justify-center mt-1">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="text-[10px] font-bold text-[#C5A059] hover:underline px-3 py-1 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? '인증중...' : '인증완료'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginInput(false);
                    setAdminUsername('');
                    setAdminPassword('');
                    setLoginError('');
                  }}
                  className="text-[10px] text-stone-500 hover:underline px-3 py-1 cursor-pointer"
                >
                  취소
                </button>
              </div>
              {loginError && (
                <span className="text-[9.5px] text-red-500 font-bold animate-pulse text-center leading-tight">
                  {loginError}
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    );
  }

  if (ctrl.isIntroActive) {
    const HasteIntro = React.lazy(() => import('./components/home_page_intro').then(m => ({ default: m.HasteIntro })));
    return (
      <React.Suspense fallback={<FallbackLoader />}>
        <HasteIntro onComplete={ctrl.handleIntroComplete} />
      </React.Suspense>
    );
  }

  const isNavbarLight = (ctrl.currentRoute !== 'HOME' && ctrl.currentRoute !== 'FILM' && ctrl.currentRoute !== 'MUSIC' && ctrl.currentRoute !== 'CONTROL' && ctrl.currentRoute !== 'MYINFO') || ctrl.mobileMenuOpen;

  return (
    <HomeSimulator
      mockMobileFrame={ctrl.mockMobileFrame}
      setMockMobileFrame={ctrl.setMockMobileFrame}
      handleTouchStart={handleTouchStart}
      handleTouchEnd={handleTouchEnd}
      isFilm={ctrl.currentRoute === 'FILM' || ctrl.currentRoute === 'MUSIC' || ctrl.currentRoute === 'CONTROL'}
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
