import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { getDbPool, supabase } from '../../database';
import { runGarbageCollector } from '../../cli/clean_orphaned_attachments';

const router = Router();
const UPLOADS_DIR = path.join(process.cwd(), 'external_uploads');

// Clean unused dummy uploaded files to protect system disk space
router.post('/api/admin/clean-unused-images', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    const activeFilenames = new Set<string>();

    const recordPath = (val: any) => {
      if (typeof val === 'string' && val.startsWith('/uploads/')) {
        const filename = val.replace('/uploads/', '').trim();
        if (filename) activeFilenames.add(filename);
      }
    };

    const recordComplex = (val: any) => {
      if (!val) return;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => recordPath(item));
          } else if (typeof parsed === 'object' && parsed !== null) {
            Object.values(parsed).forEach(item => recordPath(item));
          } else {
            recordPath(val);
          }
        } catch (_) {
          recordPath(val);
        }
      } else if (Array.isArray(val)) {
        val.forEach(item => recordPath(item));
      }
    };

    const [drafts]: any = await dbPool.query('SELECT bg_image, default_bg_image FROM web_home_main');
    for (const d of drafts) {
      recordPath(d.bg_image);
      recordPath(d.default_bg_image);
    }

    const [interiors]: any = await dbPool.query('SELECT mock_image, blueprint_image, gallery, default_mock_image, default_blueprint_image, default_gallery FROM web_interior_layouts');
    for (const item of interiors) {
      recordPath(item.mock_image);
      recordPath(item.blueprint_image);
      recordPath(item.default_mock_image);
      recordPath(item.default_blueprint_image);
      recordComplex(item.gallery);
      recordComplex(item.default_gallery);
    }

    const [menuItems]: any = await dbPool.query('SELECT image FROM web_menu_items');
    for (const item of menuItems) {
      recordPath(item.image);
    }

    // Scan board attachments to protect community board files
    try {
      const [attachments]: any = await dbPool.query('SELECT file_path, stored_name FROM web_board_attachments');
      for (const att of attachments) {
        recordPath(att.file_path);
        if (att.stored_name) activeFilenames.add(att.stored_name.trim());
      }
    } catch (e) {
      console.error('[Cleanup Scan] Failed to scan web_board_attachments table:', e);
    }

    // Scan registered member business certificate uploads
    try {
      const [members]: any = await dbPool.query('SELECT business_cert_path FROM web_membership_users');
      for (const m of members) {
        recordPath(m.business_cert_path);
      }
    } catch (e) {
      console.error('[Cleanup Scan] Failed to scan web_membership_users table:', e);
    }

    // Scan board post content for any embedded local uploads (rich text editor images)
    try {
      const [posts]: any = await dbPool.query('SELECT content FROM web_board_posts');
      for (const post of posts) {
        if (post.content && typeof post.content === 'string') {
          const regex = /\/uploads\/([a-zA-Z0-9_\-\.]+)/g;
          let match;
          while ((match = regex.exec(post.content)) !== null) {
            const filename = match[1].trim();
            if (filename) activeFilenames.add(filename);
          }
        }
      }
    } catch (e) {
      console.error('[Cleanup Scan] Failed to scan web_board_posts content:', e);
    }

    try {
      const DRAFTS_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_hero_drafts_checkpoints.json');
      if (fs.existsSync(DRAFTS_CHECKPOINTS_FILE)) {
        const contentStr = fs.readFileSync(DRAFTS_CHECKPOINTS_FILE, 'utf-8');
        const list = JSON.parse(contentStr);
        if (Array.isArray(list)) {
          for (const cp of list) {
            if (Array.isArray(cp.drafts)) {
              for (const draft of cp.drafts) {
                recordPath(draft.bg_image);
                recordPath(draft.default_bg_image);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[Cleanup Scan] Failed to parse drafts checkpoints:', e);
    }

    try {
      const INTERIORS_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_interiors_checkpoints.json');
      if (fs.existsSync(INTERIORS_CHECKPOINTS_FILE)) {
        const contentStr = fs.readFileSync(INTERIORS_CHECKPOINTS_FILE, 'utf-8');
        const list = JSON.parse(contentStr);
        if (Array.isArray(list)) {
          for (const cp of list) {
            if (Array.isArray(cp.interiors)) {
              for (const item of cp.interiors) {
                recordPath(item.mock_image);
                recordPath(item.blueprint_image);
                recordPath(item.default_mock_image);
                recordPath(item.default_blueprint_image);
                recordComplex(item.gallery);
                recordComplex(item.default_gallery);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[Cleanup Scan] Failed to parse interiors checkpoints:', e);
    }

    // 1. Scan haste_menu_checkpoints.json
    try {
      const MENU_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_menu_checkpoints.json');
      if (fs.existsSync(MENU_CHECKPOINTS_FILE)) {
        const contentStr = fs.readFileSync(MENU_CHECKPOINTS_FILE, 'utf-8');
        const list = JSON.parse(contentStr);
        if (Array.isArray(list)) {
          for (const cp of list) {
            if (Array.isArray(cp.items)) {
              for (const item of cp.items) {
                recordPath(item.image);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[Cleanup Scan] Failed to parse menu checkpoints:', e);
    }

    // 2. Scan haste_hero_drafts_custom_defaults.json if it exists
    try {
      const DRAFTS_DEFAULTS_FILE = path.join(process.cwd(), 'haste_hero_drafts_custom_defaults.json');
      if (fs.existsSync(DRAFTS_DEFAULTS_FILE)) {
        const list = JSON.parse(fs.readFileSync(DRAFTS_DEFAULTS_FILE, 'utf-8'));
        if (Array.isArray(list)) {
          for (const d of list) {
            recordPath(d.bg_image);
            recordPath(d.default_bg_image);
          }
        }
      }
    } catch (e) {}

    // 3. Scan haste_interiors_custom_defaults.json if it exists
    try {
      const INTERIORS_DEFAULTS_FILE = path.join(process.cwd(), 'haste_interiors_custom_defaults.json');
      if (fs.existsSync(INTERIORS_DEFAULTS_FILE)) {
        const list = JSON.parse(fs.readFileSync(INTERIORS_DEFAULTS_FILE, 'utf-8'));
        if (Array.isArray(list)) {
          for (const item of list) {
            recordPath(item.mock_image);
            recordPath(item.blueprint_image);
            recordPath(item.default_mock_image);
            recordPath(item.default_blueprint_image);
            recordComplex(item.gallery);
            recordComplex(item.default_gallery);
          }
        }
      }
    } catch (e) {}

    // 4. Scan active persistent .json files as a fail-safe backup fallback scan
    try {
      const BACKUP_DRAFTS_FILE = path.join(process.cwd(), 'haste_hero_drafts.json');
      if (fs.existsSync(BACKUP_DRAFTS_FILE)) {
        const list = JSON.parse(fs.readFileSync(BACKUP_DRAFTS_FILE, 'utf-8'));
        if (Array.isArray(list)) {
          for (const d of list) {
            recordPath(d.bg_image);
            recordPath(d.default_bg_image);
          }
        }
      }
    } catch (e) {}

    try {
      const BACKUP_INTERIORS_FILE = path.join(process.cwd(), 'haste_interiors.json');
      if (fs.existsSync(BACKUP_INTERIORS_FILE)) {
        const list = JSON.parse(fs.readFileSync(BACKUP_INTERIORS_FILE, 'utf-8'));
        if (Array.isArray(list)) {
          for (const item of list) {
            recordPath(item.mock_image);
            recordPath(item.blueprint_image);
            recordPath(item.default_mock_image);
            recordPath(item.default_blueprint_image);
            recordComplex(item.gallery);
            recordComplex(item.default_gallery);
          }
        }
      }
    } catch (e) {}

    try {
      const BACKUP_MENU_ITEMS_FILE = path.join(process.cwd(), 'haste_menu_items.json');
      if (fs.existsSync(BACKUP_MENU_ITEMS_FILE)) {
        const list = JSON.parse(fs.readFileSync(BACKUP_MENU_ITEMS_FILE, 'utf-8'));
        if (Array.isArray(list)) {
          for (const item of list) {
            recordPath(item.image);
          }
        }
      }
    } catch (e) {}

    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json({ success: true, message: '업로드 디렉토리가 아직 생성되지 않았습니다.', deletedFiles: [], reclaimedBytes: 0 });
    }

    const filesOnDisk = fs.readdirSync(UPLOADS_DIR);
    const deletedFiles: string[] = [];
    let reclaimedBytes = 0;

    for (const filename of filesOnDisk) {
      if (filename.startsWith('.')) continue;

      if (!activeFilenames.has(filename)) {
        const filePath = path.join(UPLOADS_DIR, filename);
        try {
          const stats = fs.statSync(filePath);
          reclaimedBytes += stats.size;
          fs.unlinkSync(filePath);
          deletedFiles.push(filename);
        } catch (err: any) {
          console.error(`[Cleanup] Failed to delete file ${filename}:`, err);
        }
      }
    }

    res.json({
      success: true,
      message: `${deletedFiles.length}개의 미사용 더미 이미지 자원(${Math.round(reclaimedBytes / 1024)} KB)이 서버 디스크 공간에서 성공적으로 영구 소거되었습니다.`,
      deletedFiles,
      reclaimedBytes
    });
  } catch (err: any) {
    console.error('[API error] Clean unused images failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Purge unreferenced attachments from Supabase Storage bucket
router.post('/api/admin/clean-orphaned-attachments', async (req, res) => {
  const dryRun = req.body.dryRun === true;
  try {
    const result = await runGarbageCollector(dryRun);
    res.json(result);
  } catch (err: any) {
    console.error('[API error] Clean orphaned attachments failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
