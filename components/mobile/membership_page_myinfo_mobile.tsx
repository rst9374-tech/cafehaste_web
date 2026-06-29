import React from 'react';
import { HasteMyInfoPage } from '../membership_page_myinfo';
import { PageRoute } from '../home_hook_swipe';

interface HasteMyInfoMobileProps {
  user: any;
  onLogout: () => void;
  navigateTo: (route: PageRoute) => void;
}

export const HasteMyInfoMobile: React.FC<HasteMyInfoMobileProps> = ({ user, onLogout, navigateTo }) => {
  return (
    <HasteMyInfoPage
      user={user}
      onLogout={onLogout}
      navigateTo={navigateTo}
      isMobile={true}
    />
  );
};
