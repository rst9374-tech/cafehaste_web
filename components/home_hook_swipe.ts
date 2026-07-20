
export type PageRoute = 'HOME' | 'BRAND' | 'MENU' | 'STORE' | 'BOARD' | 'FRANCHISE' | 'INTERIOR' | 'ADMIN' | 'MYINFO' | 'CONTROL' | 'FILM' | 'MUSIC' | 'MUSIC_ADMIN' | 'TEST_VALIDATOR' | 'LILLY_DASHBOARD' | 'DID';

export function useHomeSwipe(currentRoute: PageRoute, navigateTo: (route: PageRoute) => void) {
  const handleTouchStart = (e: React.TouchEvent) => {
    // Swipe navigation disabled
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Swipe navigation disabled
  };

  return { handleTouchStart, handleTouchEnd };
}
