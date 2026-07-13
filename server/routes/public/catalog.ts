import { Router } from 'express';
import {
  getDbPool,
  readBackupDrafts,
  readBackupFilms,
  readBackupInteriors,
  readBackupCategories,
  readBackupMenuItems
} from '../../database';
import { seedInitialData } from '../../db/seeder';
import * as serverDefaults from '../../../serverDefaults';

import fs from 'fs';
import path from 'path';

const router = Router();

// Helper to parse filename category folder for virtual translation
function getCategoryFolderForImage(filename: string): string | null {
  if (filename.startsWith('menu_americano_')) return 'menu/americano';
  if (filename.startsWith('menu_coffee_latte_')) return 'menu/coffee_latte';
  if (filename.startsWith('menu_milk_latte_')) return 'menu/milk_latte';
  if (filename.startsWith('menu_tea_base_')) return 'menu/tea_base';
  if (filename.startsWith('menu_ade_etc_')) return 'menu/ade_etc';
  return null;
}

// Helper to convert local upload path to live Supabase Storage URL under production/missing environments
function transformProductionImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
}

// Clear public cache stub for backward compatibility
(global as any).flushPublicReadCache = () => {
  console.log('[InMemory Cache] Public read cache flush requested (No-Op: RAM cache disabled for public catalog).');
};

// 전역 설정 (메모리 싱글톤 + JSON 백업 영구 로드)

function formatFilmsToCamelCase(films: any[]): any[] {
  return films.map((f: any) => ({
    id: f.id,
    title: f.title,
    desc: f.desc || f.description || '',
    videoUrl: f.video_url || f.videoUrl || '',
    visible: f.visible === 1 || f.visible === true || String(f.visible) === '1',
    orderIndex: f.order_index || f.orderIndex || 0,
    category: f.category || 'THEATER'
  }));
}


// 1. Fetch hero drafts
router.get('/api/hero-drafts', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let drafts: any[] = [];
    let draftRandomShow = false;

    if (dbPool.isFallback) {
      drafts = readBackupDrafts();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_home_main ORDER BY order_index ASC, id ASC');
      drafts = rows || [];
    }

    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        draftRandomShow = data.draft_random_show === 'true';
      } catch (_) {}
    }

    try {
      if (!dbPool.isFallback) {
        const [sRows]: any = await dbPool.query('SELECT setting_value FROM web_system_settings WHERE setting_key = ?', ['draft_random_show']);
        if (sRows && sRows.length > 0) {
          draftRandomShow = sRows[0].setting_value === 'true';
        }
      }
    } catch (_) {}

    drafts = drafts.map((row: any) => ({
      ...row,
      bg_image: transformProductionImageUrl(row.bg_image),
      bgImage: transformProductionImageUrl(row.bg_image || row.bgImage),
      default_bg_image: transformProductionImageUrl(row.default_bg_image || row.defaultBgImage),
      defaultBgImage: transformProductionImageUrl(row.default_bg_image || row.defaultBgImage)
    }));

    return res.json({ success: true, drafts, draftRandomShow, source: 'LIVE_DATABASE' });
  } catch (err: any) {
    console.error('Fetch drafts error:', err);
    const fallbackList = readBackupDrafts();
    
    let draftRandomShow = false;
    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        draftRandomShow = data.draft_random_show === 'true';
      } catch (_) {}
    }

    return res.json({ success: true, drafts: fallbackList, draftRandomShow, source: 'LOCAL_JSON_FALLBACK', error: err.message });
  }
});

// 2. Fetch films
router.get('/api/films', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let films: any[] = [];
    let filmRandomShow = false;

    if (dbPool.isFallback) {
      films = readBackupFilms();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_brand_films ORDER BY order_index ASC, id ASC');
      films = rows || [];
    }

    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        filmRandomShow = data.film_random_show === 'true';
      } catch (_) {}
    }

    try {
      if (!dbPool.isFallback) {
        const [sRows]: any = await dbPool.query('SELECT setting_value FROM web_system_settings WHERE setting_key = ?', ['film_random_show']);
        if (sRows && sRows.length > 0) {
          filmRandomShow = sRows[0].setting_value === 'true';
        }
      }
    } catch (_) {}

    const formattedFilms = formatFilmsToCamelCase(films);
    const finalFilms = formattedFilms;
    return res.json({ success: true, films: finalFilms, filmRandomShow, source: 'LIVE_DATABASE' });
  } catch (err: any) {
    console.error('Fetch films error:', err);
    const fallbackList = formatFilmsToCamelCase(readBackupFilms());
    const finalFilms = fallbackList;
    
    let filmRandomShow = false;
    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        filmRandomShow = data.film_random_show === 'true';
      } catch (_) {}
    }

    return res.json({ success: true, films: finalFilms, filmRandomShow, source: 'LOCAL_JSON_FALLBACK', error: err.message });
  }
});

function formatSoundsToCamelCase(sounds: any[]): any[] {
  return sounds.map((s: any) => ({
    id: s.id,
    title: s.title,
    desc: s.desc || '',
    soundUrl: s.sound_url || s.soundUrl || '',
    visible: s.visible === 1 || s.visible === true || String(s.visible) === '1',
    orderIndex: s.order_index || 0
  }));
}

// 2.5. Fetch sounds
router.get('/api/sounds', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let sounds: any[] = [];
    const { readBackupSounds } = await import('../../database');

    if (dbPool.isFallback) {
      sounds = readBackupSounds();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_brand_sounds ORDER BY order_index ASC, id ASC');
      sounds = rows || [];
    }

    const formattedSounds = formatSoundsToCamelCase(sounds);
    return res.json({ success: true, sounds: formattedSounds, source: 'LIVE_DATABASE' });
  } catch (err: any) {
    console.error('Fetch sounds error:', err);
    const { readBackupSounds } = await import('../../database');
    const fallbackList = formatSoundsToCamelCase(readBackupSounds());
    return res.json({ success: true, sounds: fallbackList, source: 'LOCAL_JSON_FALLBACK', error: err.message });
  }
});

// 3. Fetch interiors
router.get('/api/interiors', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let interiors: any[] = [];

    if (dbPool.isFallback) {
      interiors = readBackupInteriors();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_interior_layouts ORDER BY order_index ASC, id ASC');
      interiors = rows || [];
    }

    // Safety parse of tags, highlights, gallery, and videoLinks arrays
    interiors = interiors.map((row: any) => {
      let t = row.tags;
      let h = row.highlights;
      let g = row.gallery;
      let vl = row.video_links || row.videoLinks || '[]';
      try {
        if (typeof t === 'string') t = JSON.parse(t);
      } catch (e) {}
      try {
        if (typeof h === 'string') h = JSON.parse(h);
      } catch (e) {}
      try {
        if (typeof g === 'string') g = JSON.parse(g);
      } catch (e) {}
      try {
        if (typeof vl === 'string') vl = JSON.parse(vl);
      } catch (e) {}
      return {
        ...row,
        id: row.type_id || row.typeId || row.id,
        mock_image: transformProductionImageUrl(row.mock_image),
        blueprint_image: transformProductionImageUrl(row.blueprint_image),
        gallery: (Array.isArray(g) ? g : []).map((img: string) => transformProductionImageUrl(img)),
        videoLinks: Array.isArray(vl) ? vl : ['', '', ''],
        tags: Array.isArray(t) ? t : [],
        highlights: Array.isArray(h) ? h : []
      };
    });

    return res.json({ success: true, interiors, source: 'LIVE_DATABASE' });
  } catch (err: any) {
    console.error('Fetch interiors error:', err);
    const fallbackList = readBackupInteriors();
    return res.json({ success: true, interiors: fallbackList, source: 'LOCAL_JSON_FALLBACK', error: err.message });
  }
});

// 4. Fetch menu categories
router.get('/api/menu-categories', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let categories: any[] = [];

    if (dbPool.isFallback) {
      categories = readBackupCategories();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_menu_categories ORDER BY order_index ASC, id ASC');
      categories = rows || [];
    }

    return res.json({ success: true, categories, source: 'LIVE_DATABASE' });
  } catch (err: any) {
    console.error('Fetch categories error:', err);
    const fallbackList = readBackupCategories();
    return res.json({ success: true, categories: fallbackList, source: 'LOCAL_JSON_FALLBACK', error: err.message });
  }
});



// 5. Fetch menu items
router.get('/api/menu-items', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    // 룰 9: 미니벤티(M% 접두사) 상품군 중 활성화(visible = true)된 상품만 홈페이지 메뉴판에 노출
    const [rows]: any = await dbPool.query("SELECT * FROM web_menu_items_all WHERE id LIKE 'M%' AND visible = true ORDER BY order_index ASC, id ASC");
    const items = (rows || []).map((row: any) => ({
      ...row,
      nameKr: row.name_kr || row.nameKr || '',
      nameEng: row.name || row.nameEng || '',
      image: transformProductionImageUrl(row.image),
      beanType: row.bean_type || 'S',
      bean_type: row.bean_type || 'S',
      isSignature: row.is_signature === 1 || row.is_signature === true
    }));

    return res.json({ success: true, items, source: 'LIVE_DATABASE_ITEMS' });
  } catch (err: any) {
    console.error('Fetch menu items error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5.5. Fetch menu items all (MENU_ALL version 2)
router.get('/api/menu-items-all', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let items: any[] = [];

    if (dbPool.isFallback) {
      items = STATIC_MENU_ITEMS;
    } else {
      // 대표 메뉴 304종 조회 (M% 접두사 필터링)
      const [rows]: any = await dbPool.query("SELECT * FROM web_menu_items_all WHERE visible = true AND id LIKE 'M%' ORDER BY order_index ASC, id ASC");
      items = (rows || []).map((row: any) => ({
        ...row,
        nameKr: row.name_kr || row.nameKr || '',
        nameEng: row.name || row.nameEng || '',
        image: transformProductionImageUrl(row.image),
        beanType: row.bean_type || 'S',
        bean_type: row.bean_type || 'S',
        isSignature: row.is_signature === 1 || row.is_signature === true
      }));
    }

    return res.json({ success: true, items, source: 'LIVE_DATABASE_ITEMS_ALL' });
  } catch (err: any) {
    console.error('Fetch menu items all error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Unified Main Page Bulk Endpoint (Combines drafts, interiors, and films to avoid 6-connection browser ceiling)
router.get('/api/main-bulk', async (req, res) => {
  try {
    let drafts: any[] = [];
    let films: any[] = [];
    let interiors: any[] = [];
    let draftRandomShow = false;
    let filmRandomShow = false;
    
    // 1) Drafts
    const dbPool = await getDbPool();
    if (dbPool.isFallback) {
      drafts = readBackupDrafts();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_home_main ORDER BY order_index ASC, id ASC');
      drafts = rows || [];
    }

    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        draftRandomShow = data.draft_random_show === 'true';
        filmRandomShow = data.film_random_show === 'true';
      } catch (_) {}
    }

    try {
      if (!dbPool.isFallback) {
        const [sRows]: any = await dbPool.query('SELECT setting_value FROM web_system_settings WHERE setting_key = ?', ['draft_random_show']);
        if (sRows && sRows.length > 0) {
          draftRandomShow = sRows[0].setting_value === 'true';
        }
        const [fRows]: any = await dbPool.query('SELECT setting_value FROM web_system_settings WHERE setting_key = ?', ['film_random_show']);
        if (fRows && fRows.length > 0) {
          filmRandomShow = fRows[0].setting_value === 'true';
        }
      }
    } catch (_) {}

    drafts = drafts.map((row: any) => ({
      ...row,
      bg_image: transformProductionImageUrl(row.bg_image),
      bgImage: transformProductionImageUrl(row.bg_image || row.bgImage),
      default_bg_image: transformProductionImageUrl(row.default_bg_image || row.defaultBgImage),
      defaultBgImage: transformProductionImageUrl(row.default_bg_image || row.defaultBgImage)
    }));
    
    // 2) Films
    let rawFilms: any[] = [];
    if (dbPool.isFallback) {
      rawFilms = readBackupFilms();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_brand_films ORDER BY order_index ASC, id ASC');
      rawFilms = rows || [];
    }
    const formattedFilms = formatFilmsToCamelCase(rawFilms);
    films = formattedFilms;
    
    // 3) Interiors
    if (dbPool.isFallback) {
      interiors = readBackupInteriors();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_interior_layouts ORDER BY order_index ASC, id ASC');
      interiors = rows || [];
    }
    
    interiors = interiors.map((row: any) => {
      let t = row.tags;
      let h = row.highlights;
      let g = row.gallery;
      let vl = row.video_links || row.videoLinks || '[]';
      try {
        if (typeof t === 'string') t = JSON.parse(t);
      } catch (e) {}
      try {
        if (typeof h === 'string') h = JSON.parse(h);
      } catch (e) {}
      try {
        if (typeof g === 'string') g = JSON.parse(g);
      } catch (e) {}
      try {
        if (typeof vl === 'string') vl = JSON.parse(vl);
      } catch (e) {}
      return {
        ...row,
        id: row.type_id || row.typeId || row.id,
        mock_image: transformProductionImageUrl(row.mock_image),
        blueprint_image: transformProductionImageUrl(row.blueprint_image),
        gallery: (Array.isArray(g) ? g : []).map((img: string) => transformProductionImageUrl(img)),
        videoLinks: Array.isArray(vl) ? vl : ['', '', ''],
        tags: Array.isArray(t) ? t : [],
        highlights: Array.isArray(h) ? h : []
      };
    });
    
    res.json({
      success: true,
      drafts,
      films,
      interiors,
      draftRandomShow,
      filmRandomShow,
      source: 'UNIFIED_BULK_LIVE'
    });
  } catch (err: any) {
    console.error('Unified main bulk fetch error:', err);
    let draftRandomShow = false;
    let filmRandomShow = false;
    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        draftRandomShow = data.draft_random_show === 'true';
        filmRandomShow = data.film_random_show === 'true';
      } catch (_) {}
    }
    res.json({
      success: true,
      drafts: readBackupDrafts(),
      films: formatFilmsToCamelCase(readBackupFilms()),
      interiors: readBackupInteriors(),
      draftRandomShow,
      filmRandomShow,
      source: 'LOCAL_JSON_FALLBACK_BULK',
      error: err.message
    });
  }
});

// 7. Unified Menu Page Bulk Endpoint (Combines categories and items to serve 266 static items)
router.get('/api/menu-bulk', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let categories: any[] = [];
    
    // 1) Categories
    if (dbPool.isFallback) {
      categories = readBackupCategories();
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_menu_categories ORDER BY order_index ASC, id ASC');
      categories = rows || [];
    }
    
    // 2) Items (DB Live Load)
    let items: any[] = [];
    if (dbPool.isFallback) {
      items = STATIC_MENU_ITEMS;
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_menu_items WHERE visible = true');
      items = rows || [];
    }
    
    res.json({
      success: true,
      categories,
      items,
      source: 'DATABASE_LIVE_BULK'
    });
  } catch (err: any) {
    console.error('Unified menu bulk fetch error:', err);
    res.json({
      success: true,
      categories: readBackupCategories(),
      items: STATIC_MENU_ITEMS,
      source: 'STATIC_STATIC_SPEC_FALLBACK',
      error: err.message
    });
  }
});

export default router;
