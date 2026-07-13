import React from 'react';
import { HasteMusic } from '../music_page_main';

interface SoundItem {
  id: number;
  title: string;
  desc: string;
  soundUrl?: string;
  sound_url?: string;
  visible: number | boolean;
}

interface HasteMusicMobileProps {
  appFilms?: any[]; // Dummy for compatibility
}

export const HasteMusicMobile: React.FC<HasteMusicMobileProps> = () => {
  return <HasteMusic isMobile={true} />;
};
