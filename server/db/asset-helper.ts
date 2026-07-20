import fs from 'fs';
import path from 'path';
import { supabase } from '../database';
import * as serverDefaults from '../serverDefaults';
import {
  BACKUP_DRAFTS_FILE,
  BACKUP_INTERIORS_FILE,
  readBackupDrafts,
  writeBackupDrafts,
  readBackupInteriors,
  writeBackupInteriors
} from './cache-io';

/**
 * Base64 file converter to Supabase Storage Public URL with zero local file dependency
 */
export const saveBase64ToFile = (base64Data: string, prefix: string): string => {
  if (!base64Data || typeof base64Data !== 'string') return base64Data;
  
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://') || base64Data.startsWith('/uploads/')) {
    return base64Data;
  }

  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let mimeType = 'image/png';
  let buffer: Buffer;
  let extension = 'png';

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    buffer = Buffer.from(matches[2], 'base64');
    
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      extension = 'jpg';
    } else if (mimeType.includes('webp')) {
      extension = 'webp';
    } else if (mimeType.includes('gif')) {
      extension = 'gif';
    } else if (mimeType.includes('svg')) {
      extension = 'svg';
    }
  } else {
    try {
      buffer = Buffer.from(base64Data, 'base64');
    } catch (e) {
      return base64Data;
    }
  }

  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, '').slice(0, 14); 
    const uniqueSuffix = Math.floor(100 + Math.random() * 900);
    const filename = `${timestamp}_${uniqueSuffix}_${prefix}.${extension}`;

    const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
    console.log(`[Local Storage] saveBase64ToFile synced locally: ${filename}`);

    supabase.storage.from('cafehaste-bucket').upload(filename, buffer, {
      contentType: mimeType,
      upsert: true
    }).then(({ data, error }) => {
      if (error) {
        console.error(`[Supabase Storage] Background upload error for ${filename}:`, error.message);
      } else {
        console.log(`[Supabase Storage] Background upload success: ${filename}`);
      }
    }).catch(err => {
      console.error(`[Supabase Storage] Unexpected error for ${filename}:`, err.message);
    });

    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[Supabase Storage Upload Error]:', err);
    return base64Data;
  }
};

let isBase64MigrationDone = false;

export async function convertExistingBase64ToFiles(dbPool: any) {
  if (isBase64MigrationDone) return;
  isBase64MigrationDone = true;
  
  console.log('[Base64 Migration] Scanning system dataset for base64 contents to optimize as static assets.');

  try {
    if (fs.existsSync(BACKUP_DRAFTS_FILE)) {
      const drafts = readBackupDrafts();
      let updatedDraftsCount = 0;
      const updatedDrafts = drafts.map((draft: any) => {
        if (draft.bg_image && draft.bg_image.startsWith('data:')) {
          const newUrl = saveBase64ToFile(draft.bg_image, 'draft_hero');
          if (newUrl !== draft.bg_image) {
            updatedDraftsCount++;
            return { ...draft, bg_image: newUrl };
          }
        }
        return draft;
      });
      if (updatedDraftsCount > 0) {
        writeBackupDrafts(updatedDrafts);
        console.log(`[Base64 Migration] Local backup drafts optimized: ${updatedDraftsCount} instances synced.`);
      }
    }

    if (fs.existsSync(BACKUP_INTERIORS_FILE)) {
      const interiors = readBackupInteriors();
      let updatedInteriorsCount = 0;
      const updatedInteriors = interiors.map((item: any) => {
        let isModified = false;
        let mock_image = item.mock_image;
        let blueprint_image = item.blueprint_image;
        let gallery = item.gallery;

        if (mock_image && mock_image.startsWith('data:')) {
          const newUrl = saveBase64ToFile(mock_image, 'interior_mock');
          if (newUrl !== mock_image) {
            mock_image = newUrl;
            isModified = true;
          }
        }

        if (blueprint_image && blueprint_image.startsWith('data:')) {
          const newUrl = saveBase64ToFile(blueprint_image, 'interior_blueprint');
          if (newUrl !== blueprint_image) {
            blueprint_image = newUrl;
            isModified = true;
          }
        }

        if (gallery) {
          try {
            let parsedGallery = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
            if (Array.isArray(parsedGallery)) {
              let galleryModified = false;
              const nextGallery = parsedGallery.map((g: string, idx: number) => {
                if (g && g.startsWith('data:')) {
                  const newUrl = saveBase64ToFile(g, `interior_gallery_${idx}`);
                  if (newUrl !== g) {
                    galleryModified = true;
                    return newUrl;
                  }
                }
                return g;
              });
              if (galleryModified) {
                gallery = typeof item.gallery === 'string' ? JSON.stringify(nextGallery) : nextGallery;
                isModified = true;
              }
            }
          } catch(e) {}
        }

        if (isModified) {
          updatedInteriorsCount++;
          return { ...item, mock_image, blueprint_image, gallery };
        }
        return item;
      });
      
      if (updatedInteriorsCount > 0) {
        writeBackupInteriors(updatedInteriors);
        console.log(`[Base64 Migration] Local backup interiors optimized: ${updatedInteriorsCount} instances synced.`);
      }
    }
  } catch (err: any) {
    console.error('[Base64 Migration Scan Error]:', err);
  }

  if (dbPool && dbPool.dbType !== 'fallback') {
    try {
      const [drafts]: any = await dbPool.query('SELECT id, bg_image FROM web_home_main');
      if (Array.isArray(drafts)) {
        for (const d of drafts) {
          if (d.bg_image && d.bg_image.startsWith('data:')) {
            const newUrl = saveBase64ToFile(d.bg_image, `sql_draft_${d.id}`);
            if (newUrl !== d.bg_image) {
              await dbPool.query('UPDATE web_home_main SET bg_image = ? WHERE id = ?', [newUrl, d.id]);
            }
          }
        }
      }

      const [interiors]: any = await dbPool.query('SELECT type_id, mock_image, blueprint_image, gallery FROM web_interior_layouts');
      if (Array.isArray(interiors)) {
        for (const item of interiors) {
          let updatedMock = item.mock_image;
          let updatedBlueprint = item.blueprint_image;
          let updatedGalleryStr = item.gallery;
          let needsUpdate = false;

          if (item.mock_image && item.mock_image.startsWith('data:')) {
            updatedMock = saveBase64ToFile(item.mock_image, `sql_interior_mock_${item.type_id}`);
            needsUpdate = true;
          }

          if (item.blueprint_image && item.blueprint_image.startsWith('data:')) {
            updatedBlueprint = saveBase64ToFile(item.blueprint_image, `sql_interior_blueprint_${item.type_id}`);
            needsUpdate = true;
          }

          if (item.gallery) {
            try {
              let galleryArr = typeof item.gallery === 'string' ? JSON.parse(item.gallery) : item.gallery;
              if (Array.isArray(galleryArr)) {
                let galModified = false;
                const nextGal = galleryArr.map((g: string, idx: number) => {
                   if (g && g.startsWith('data:')) {
                    galModified = true;
                    return saveBase64ToFile(g, `sql_interior_gallery_${item.type_id}_${idx}`);
                  }
                  return g;
                });
                if (galModified) {
                   updatedGalleryStr = JSON.stringify(nextGal);
                   needsUpdate = true;
                }
              }
            } catch (e) {}
          }

          if (needsUpdate) {
            await dbPool.query(
              'UPDATE web_interior_layouts SET mock_image = ?, blueprint_image = ?, gallery = ? WHERE type_id = ?',
              [updatedMock, updatedBlueprint, updatedGalleryStr, item.type_id]
            );
          }
        }
      }

      const [menuItems]: any = await dbPool.query('SELECT id, image FROM web_menu_items');
      if (Array.isArray(menuItems)) {
        for (const item of menuItems) {
          if (item.image && item.image.startsWith('data:')) {
            const newUrl = saveBase64ToFile(item.image, `sql_menu_item_${item.id}`);
            if (newUrl !== item.image) {
              await dbPool.query('UPDATE web_menu_items SET image = ? WHERE id = ?', [newUrl, item.id]);
            }
          }
        }
      }

      // Removed database menu item images alignment with defaults to prevent overwriting user changes on startup
    } catch (dbErr: any) {
      console.error('[Base64 Migration Error] Failed cleaning database schema entries:', dbErr);
    }
  }
}
