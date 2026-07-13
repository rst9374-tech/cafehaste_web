import {
  readBackupDrafts,
  writeBackupDrafts,
  readBackupInteriors,
  writeBackupInteriors,
  readBackupFilms,
  writeBackupFilms,
  readBackupSounds,
  writeBackupSounds
} from '../cache-io';

export function handleContentSim(formattedSql: string, params: any[] = []): { handled: boolean; result?: any } {
  // 1. Hero Drafts Simulator
  if (formattedSql.includes('FROM HASTE_HERO_DRAFTS') || formattedSql.includes('HASTE_HERO_DRAFTS')) {
    if (formattedSql.startsWith('SELECT *')) {
      return { handled: true, result: [readBackupDrafts()] };
    }
    if (formattedSql.startsWith('INSERT INTO') && formattedSql.includes('HASTE_HERO_DRAFTS')) {
      const drafts = readBackupDrafts();
      const insertId = drafts.length > 0 ? Math.max(...drafts.map((d: any) => d.id)) + 1 : 1;
      const [tag, slogan, subtext, bg_image, description, visible] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const newDraft = {
        id: insertId,
        tag: tag || '',
        slogan: slogan || '',
        subtext: subtext || '',
        bg_image: bg_image || '',
        description: description || '',
        visible: isVisible,
        default_tag: tag || '',
        default_slogan: slogan || '',
        default_subtext: subtext || '',
        default_bg_image: bg_image || '',
        default_description: description || '',
        order_index: insertId,
        created_at: new Date().toISOString()
      };
      drafts.push(newDraft);
      writeBackupDrafts(drafts);
      return { handled: true, result: [{ insertId }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_HERO_DRAFTS SET VISIBLE')) {
      const drafts = readBackupDrafts();
      const [visible, id] = params;
      const updated = drafts.map((item: any) => 
        item.id === parseInt(id) ? { ...item, visible: visible === 1 ? 1 : 0 } : item
      );
      writeBackupDrafts(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_HERO_DRAFTS SET ORDER_INDEX')) {
      const drafts = readBackupDrafts();
      const [order_index, id] = params;
      const updated = drafts.map((item: any) => 
        item.id === parseInt(id) ? { ...item, order_index: parseInt(order_index) } : item
      );
      writeBackupDrafts(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE') && formattedSql.includes('HASTE_HERO_DRAFTS')) {
      const drafts = readBackupDrafts();
      const [tag, slogan, subtext, bg_image, description, visible, id] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const updated = drafts.map((item: any) => {
        if (item.id === parseInt(id)) {
          return {
            ...item,
            tag: tag || item.tag,
            slogan: slogan || item.slogan,
            subtext: subtext || item.subtext,
            bg_image: bg_image || item.bg_image,
            description: description || item.description,
            visible: isVisible
          };
        }
        return item;
      });
      writeBackupDrafts(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE')) {
      const drafts = readBackupDrafts();
      const [id] = params;
      const filtered = drafts.filter((item: any) => item.id !== parseInt(id));
      writeBackupDrafts(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 2. Interiors Simulator
  if (formattedSql.includes('FROM HASTE_INTERIORS') || formattedSql.includes('HASTE_INTERIORS')) {
    if (formattedSql.startsWith('SELECT *')) {
      return { handled: true, result: [readBackupInteriors()] };
    }
    if (formattedSql.startsWith('INSERT INTO') && formattedSql.includes('HASTE_INTERIORS')) {
      const interiors = readBackupInteriors();
      const insertId = interiors.length > 0 ? Math.max(...interiors.map((i: any) => i.id)) + 1 : 1;
      const [type_id, title, subtitle, desc, tags, highlights, gallery, mock_image, blueprint_image, visible] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const newItem = {
        id: insertId,
        type_id: type_id || '',
        title: title || '',
        subtitle: subtitle || '',
        desc: desc || '',
        tags: tags || '',
        highlights: highlights || '',
        gallery: gallery || '[]',
        mock_image: mock_image || '',
        blueprint_image: blueprint_image || '',
        visible: isVisible,
        default_title: title || '',
        default_subtitle: subtitle || '',
        default_desc: desc || '',
        default_tags: tags || '',
        default_highlights: highlights || '',
        default_gallery: gallery || '[]',
        default_mock_image: mock_image || '',
        default_blueprint_image: blueprint_image || '',
        order_index: insertId,
        created_at: new Date().toISOString()
      };
      interiors.push(newItem);
      writeBackupInteriors(interiors);
      return { handled: true, result: [{ insertId }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_INTERIORS SET VISIBLE')) {
      const interiors = readBackupInteriors();
      const [visible, id] = params;
      const updated = interiors.map((item: any) => 
        item.id === parseInt(id) ? { ...item, visible: visible === 1 ? 1 : 0 } : item
      );
      writeBackupInteriors(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_INTERIORS SET ORDER_INDEX')) {
      const interiors = readBackupInteriors();
      const [order_index, id] = params;
      const updated = interiors.map((item: any) => 
        item.id === parseInt(id) ? { ...item, order_index: parseInt(order_index) } : item
      );
      writeBackupInteriors(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE') && formattedSql.includes('HASTE_INTERIORS')) {
      const interiors = readBackupInteriors();
      const [title, subtitle, desc, tags, highlights, gallery, mock_image, blueprint_image, visible, type_id] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const updated = interiors.map((item: any) => {
        if (item.type_id === type_id) {
          return {
            ...item,
            title: title || item.title,
            subtitle: subtitle || item.subtitle,
            desc: desc || item.desc,
            tags: tags || item.tags,
            highlights: highlights || item.highlights,
            gallery: gallery || item.gallery,
            mock_image: mock_image || item.mock_image,
            blueprint_image: blueprint_image || item.blueprint_image,
            visible: isVisible
          };
        }
        return item;
      });
      writeBackupInteriors(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE')) {
      const interiors = readBackupInteriors();
      const [type_id] = params;
      const filtered = interiors.filter((item: any) => item.type_id !== type_id);
      writeBackupInteriors(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 3. Brand Films Simulator
  if (formattedSql.includes('FROM HASTE_FILMS') || formattedSql.includes('HASTE_FILMS')) {
    if (formattedSql.startsWith('SELECT *')) {
      return { handled: true, result: [readBackupFilms()] };
    }
    if (formattedSql.startsWith('INSERT INTO') && formattedSql.includes('HASTE_FILMS')) {
      const films = readBackupFilms();
      const insertId = films.length > 0 ? Math.max(...films.map((f: any) => f.id)) + 1 : 1;
      const [title, desc, video_url, visible, category] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const newFilm = {
        id: insertId,
        title: title || '',
        desc: desc || '',
        video_url: video_url || '',
        visible: isVisible,
        category: category || 'THEATER',
        created_at: new Date().toISOString()
      };
      films.push(newFilm);
      writeBackupFilms(films);
      return { handled: true, result: [{ insertId }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_FILMS SET VISIBLE')) {
      const films = readBackupFilms();
      const [visible, id] = params;
      const updated = films.map((item: any) => 
        item.id === parseInt(id) ? { ...item, visible: visible === 1 ? 1 : 0 } : item
      );
      writeBackupFilms(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE') && formattedSql.includes('HASTE_FILMS')) {
      const films = readBackupFilms();
      const [title, desc, video_url, visible, category, id] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const updated = films.map((item: any) => {
        if (item.id === parseInt(id)) {
          return {
            ...item,
            title: title || item.title,
            desc: desc || item.desc,
            video_url: video_url || item.video_url,
            visible: isVisible,
            category: category || item.category || 'THEATER'
          };
        }
        return item;
      });
      writeBackupFilms(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE')) {
      const films = readBackupFilms();
      const [id] = params;
      const filtered = films.filter((item: any) => item.id !== parseInt(id));
      writeBackupFilms(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 4. Brand Sounds Simulator
  if (formattedSql.includes('FROM HASTE_SOUNDS') || formattedSql.includes('HASTE_SOUNDS')) {
    if (formattedSql.startsWith('SELECT *')) {
      return { handled: true, result: [readBackupSounds()] };
    }
    if (formattedSql.startsWith('INSERT INTO') && formattedSql.includes('HASTE_SOUNDS')) {
      const sounds = readBackupSounds();
      const insertId = sounds.length > 0 ? Math.max(...sounds.map((f: any) => f.id)) + 1 : 1;
      const [title, desc, sound_url, visible] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const newSound = {
        id: insertId,
        title: title || '',
        desc: desc || '',
        sound_url: sound_url || '',
        visible: isVisible,
        created_at: new Date().toISOString()
      };
      sounds.push(newSound);
      writeBackupSounds(sounds);
      return { handled: true, result: [{ insertId }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_SOUNDS SET VISIBLE')) {
      const sounds = readBackupSounds();
      const [visible, id] = params;
      const updated = sounds.map((item: any) => 
        item.id === parseInt(id) ? { ...item, visible: visible === 1 ? 1 : 0 } : item
      );
      writeBackupSounds(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE') && formattedSql.includes('HASTE_SOUNDS')) {
      const sounds = readBackupSounds();
      const [title, desc, sound_url, visible, id] = params;
      const isVisible = (visible === undefined || visible === true || visible === 1) ? 1 : 0;
      const updated = sounds.map((item: any) => {
        if (item.id === parseInt(id)) {
          return {
            ...item,
            title: title || item.title,
            desc: desc || item.desc,
            sound_url: sound_url || item.sound_url,
            visible: isVisible
          };
        }
        return item;
      });
      writeBackupSounds(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE')) {
      const sounds = readBackupSounds();
      const [id] = params;
      const filtered = sounds.filter((item: any) => item.id !== parseInt(id));
      writeBackupSounds(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 5. System Settings Simulator
  if (formattedSql.includes('HASTE_SETTINGS')) {
    const { readBackupSettings, writeBackupSettings } = require('../cache-io');
    const settings = readBackupSettings();

    if (formattedSql.startsWith('SELECT *') || formattedSql.startsWith('SELECT SETTING_VALUE')) {
      // Find matching key
      // Extract key from WHERE setting_key = ?
      const keyParam = params?.[0];
      if (keyParam) {
        const found = settings.find((s: any) => s.setting_key === keyParam);
        return { handled: true, result: found ? [[found]] : [[]] };
      }
      return { handled: true, result: [settings] };
    }

    if (formattedSql.includes('INSERT INTO') || formattedSql.includes('ON CONFLICT') || formattedSql.includes('UPDATE')) {
      // Upsert
      let key = params[0];
      let val = params[1];
      
      // Check if it's an UPDATE query where params order is [value, key]
      if (formattedSql.startsWith('UPDATE') && params.length >= 2) {
        val = params[0];
        key = params[1];
      } else if (params.length >= 4) {
        // INSERT INTO ... ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
        // params could be [key, val, key, val] or similar
        key = params[0];
        val = params[1];
      }

      const existingIdx = settings.findIndex((s: any) => s.setting_key === key);
      if (existingIdx > -1) {
        settings[existingIdx].setting_value = val;
      } else {
        settings.push({ setting_key: key, setting_value: val, updated_at: new Date().toISOString() });
      }
      writeBackupSettings(settings);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  return { handled: false };
}
