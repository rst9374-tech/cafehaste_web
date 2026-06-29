import { HeroDraft } from '../types';
import { HASTE_HERO_DRAFTS } from '../src/data';

export function migrateHeroDrafts(parsed: any[]): HeroDraft[] {
  return parsed.map((draft: any) => {
    if (!draft) return draft;
    const nextD = { ...draft };
    
    // Support both snake_case and camelCase for image fields to avoid broken image URLs
    if (nextD.bg_image && !nextD.bgImage) nextD.bgImage = nextD.bg_image;
    if (nextD.bgImage && !nextD.bg_image) nextD.bg_image = nextD.bgImage;

    if (typeof nextD.bgImage === 'string') {
      let updated = nextD.bgImage;
      
      // Map any keywords or broken local files to beautiful Unsplash images
      if (updated.includes('sunny_wood_cafe') || updated.includes('main_1.png')) { 
        updated = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('cafe_espresso_extraction') || updated.includes('main_2.png')) { 
        updated = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('cafe_pour_over_bloom') || updated.includes('main_3.png')) { 
        updated = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('unmanned_cafe_wood_white') || updated.includes('main_4.png')) { 
        updated = 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('cafe_warm_reading_corner') || updated.includes('main_5.png')) { 
        updated = 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('bright_smart_unmanned') || updated.includes('main_6.png')) { 
        updated = 'https://images.unsplash.com/photo-1541119638723-c51cbe2262aa?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('sunlit_latte_wood') || updated.includes('main_7.png')) { 
        updated = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('cafe_minimalist_counter') || updated.includes('main_8.png')) { 
        updated = 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('cafe_roasting_drum_detail') || updated.includes('main_9.png')) { 
        updated = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200'; 
      } else if (updated.includes('cafe_cold_brew_tower') || updated.includes('main_10.png')) { 
        updated = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=1200'; 
      }
      
      nextD.bgImage = updated;
      nextD.bg_image = updated;
    }
    return nextD;
  });
}

export function loadMigratedHeroDrafts(): HeroDraft[] {
  const cached = localStorage.getItem('haste_hero_drafts');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return migrateHeroDrafts(parsed);
      }
    } catch (e) {
      console.error("Failed parsing cached drafts", e);
    }
  }
  return HASTE_HERO_DRAFTS;
}
