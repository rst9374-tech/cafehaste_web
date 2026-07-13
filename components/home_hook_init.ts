import { useState, useEffect } from 'react';
import { HeroDraft } from '../types';
import { DEFAULT_INTERIOR_TYPES } from '../src/data';
import { loadMigratedHeroDrafts } from './home_utils_migration';

export function useHomeInit() {
  const [interiorTypes, setInteriorTypes] = useState<any[]>(() => {
    const cached = localStorage.getItem('haste_interior_types');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_INTERIOR_TYPES;
  });

  const [heroDrafts, setHeroDrafts] = useState<HeroDraft[]>(() => loadMigratedHeroDrafts());
  const [appFilms, setAppFilms] = useState<any[]>([]);
  const [draftRandomShow, setDraftRandomShow] = useState(false);
  const [filmRandomShow, setFilmRandomShow] = useState(false);

  const fetchFreshDbContent = async () => {
    try {
      // 1. Try unified bulk loading first (Aggressive 1-request optimization under Section 17 guidelines to avoid browser connection limit)
      const resBulk = await fetch(`/api/main-bulk?t=${Date.now()}`);
      if (resBulk.ok) {
        const textStr = await resBulk.text();
        const data = textStr ? JSON.parse(textStr) : null;
        if (data && data.success) {
          if (Array.isArray(data.drafts) && data.drafts.length > 0) {
            setHeroDrafts(data.drafts);
            localStorage.setItem('haste_hero_drafts', JSON.stringify(data.drafts));
          }
          if (data.draftRandomShow !== undefined) {
            setDraftRandomShow(!!data.draftRandomShow);
          }
          if (data.filmRandomShow !== undefined) {
            setFilmRandomShow(!!data.filmRandomShow);
          }
          if (Array.isArray(data.interiors) && data.interiors.length > 0) {
            setInteriorTypes(data.interiors);
            localStorage.setItem('haste_interior_types', JSON.stringify(data.interiors));
          }
          if (Array.isArray(data.films)) {
            setAppFilms(data.films);
          }
          return; // Early return to completely avoid unnecessary network noise
        }
      }
    } catch (bulkErr) {
      console.warn('[Home Init] Main bulk fetch failed, falling back to individual calls:', bulkErr);
    }

    // 2. Fallbacks (Individual calls in case bulk fails)
    try {
      const resDrafts = await fetch(`/api/hero-drafts?t=${Date.now()}`);
      if (resDrafts.ok) {
        const textStr = await resDrafts.text();
        const data = textStr ? JSON.parse(textStr) : null;
        if (data && data.success && Array.isArray(data.drafts) && data.drafts.length > 0) {
          setHeroDrafts(data.drafts);
          localStorage.setItem('haste_hero_drafts', JSON.stringify(data.drafts));
          if (data.draftRandomShow !== undefined) {
            setDraftRandomShow(!!data.draftRandomShow);
          }
          if (data.filmRandomShow !== undefined) {
            setFilmRandomShow(!!data.filmRandomShow);
          }
        }
      }
    } catch (e) {
      console.warn('[DB Fetch] Failed loading live hero drafts:', e);
    }

    try {
      const resInteriors = await fetch(`/api/interiors?t=${Date.now()}`);
      if (resInteriors.ok) {
        const textStr = await resInteriors.text();
        const data = textStr ? JSON.parse(textStr) : null;
        if (data && data.success && Array.isArray(data.interiors) && data.interiors.length > 0) {
          setInteriorTypes(data.interiors);
          localStorage.setItem('haste_interior_types', JSON.stringify(data.interiors));
        }
      }
    } catch (e) {
      console.warn('[DB Fetch] Failed loading live interiors:', e);
    }

    try {
      const resFilms = await fetch(`/api/films?t=${Date.now()}`);
      if (resFilms.ok) {
        const textStr = await resFilms.text();
        const data = textStr ? JSON.parse(textStr) : null;
        if (data && data.success && Array.isArray(data.films)) {
          setAppFilms(data.films);
          if (data.filmRandomShow !== undefined) {
            setFilmRandomShow(!!data.filmRandomShow);
          }
        }
      }
    } catch (e) {
      console.warn('[DB Fetch] Failed loading live films:', e);
    }
  };

  useEffect(() => {
    fetchFreshDbContent();

    const handleStorageUpdate = () => {
      const cached = localStorage.getItem('haste_interior_types');
      if (cached) {
        try {
          setInteriorTypes(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      }
      const cachedDrafts = localStorage.getItem('haste_hero_drafts');
      if (cachedDrafts) {
        try {
          setHeroDrafts(JSON.parse(cachedDrafts));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('haste_interior_updated', fetchFreshDbContent);
    window.addEventListener('haste_films_updated', fetchFreshDbContent);
    window.addEventListener('haste_hero_updated', fetchFreshDbContent);
    window.addEventListener('haste_data_refreshed', fetchFreshDbContent);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('haste_interior_updated', fetchFreshDbContent);
      window.removeEventListener('haste_films_updated', fetchFreshDbContent);
      window.removeEventListener('haste_hero_updated', fetchFreshDbContent);
      window.removeEventListener('haste_data_refreshed', fetchFreshDbContent);
    };
  }, []);

  return {
    interiorTypes,
    setInteriorTypes,
    heroDrafts,
    setHeroDrafts,
    appFilms,
    setAppFilms,
    draftRandomShow,
    setDraftRandomShow,
    filmRandomShow,
    setFilmRandomShow,
    fetchFreshDbContent
  };
}
