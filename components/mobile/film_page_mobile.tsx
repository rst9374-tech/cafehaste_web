import React from 'react';
import { HasteFilm } from '../film_page_main';

interface FilmItem {
  id: number;
  title: string;
  desc: string;
  videoUrl?: string;
  video_url?: string;
  visible: number | boolean;
  category?: 'BRAND' | 'THEATER';
}

interface HasteFilmMobileProps {
  appFilms: FilmItem[];
  filmRandomShow?: boolean;
  startMuted?: boolean;
}

export const HasteFilmMobile: React.FC<HasteFilmMobileProps> = ({ appFilms, filmRandomShow, startMuted }) => {
  return <HasteFilm isMobile={true} appFilms={appFilms} filmRandomShow={filmRandomShow} startMuted={startMuted} />;
};
