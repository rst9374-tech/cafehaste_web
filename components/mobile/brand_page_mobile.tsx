import React from 'react';
import { HasteBrand } from '../brand_page_main';

interface FilmItem {
  id: number;
  title: string;
  desc: string;
  videoUrl?: string;
  video_url?: string;
  visible: number | boolean;
  category?: 'BRAND' | 'THEATER';
}

interface HasteBrandMobileProps {
  appFilms?: FilmItem[];
}

export const HasteBrandMobile: React.FC<HasteBrandMobileProps> = ({ appFilms = [] }) => {
  return <HasteBrand isMobile={true} appFilms={appFilms} />;
};
