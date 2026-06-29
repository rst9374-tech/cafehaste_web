import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { 
  saveBase64ToFile, 
  syncDraftsBackup, 
  writeBackupDrafts,
  getDbPool
} from '../../database';
import { withDbConnection, getLocalCheckpoints, saveLocalCheckpoint, deleteLocalCheckpoint } from '../../db/common-handler';
import * as serverDefaults from '../../../serverDefaults';

const { DEFAULT_DRAFTS } = serverDefaults;

const router = Router();

// 3. Hero drafts reorder
router.post('/api/hero-drafts/reorder', async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: '배열 타입의 ids가 필요합니다.' });
  }
  try {
    await withDbConnection(async (conn) => {
      for (let i = 0; i < ids.length; i++) {
        await conn.query('UPDATE web_home_main SET order_index = ? WHERE id = ?', [i, ids[i]]);
      }
    });
    await syncDraftsBackup();
    res.json({ success: true, message: '시안 노출 순서가 성공적으로 동기화 저장되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reorder hero-drafts failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create draft
router.post('/api/hero-drafts', async (req, res) => {
  const { tag, slogan, subtext, bgImage, description, visible } = req.body;
  if (!tag || !slogan || !bgImage) {
    return res.status(400).json({ success: false, message: '태그, 슬로건, 배경 이미지는 필수값입니다.' });
  }
  try {
    const cleanBgImage = saveBase64ToFile(bgImage, 'draft_hero');
    const visibleVal = (visible === undefined || visible === true || visible === 1 || String(visible) === 'true');
    
    const result: any = await withDbConnection(async (conn) => {
      const [res]: any = await conn.query(
        'INSERT INTO web_home_main (tag, slogan, subtext, bg_image, description, visible, default_tag, default_slogan, default_subtext, default_bg_image, default_description, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
        [tag, slogan, subtext || '', cleanBgImage, description || '', visibleVal, tag, slogan, subtext || '', cleanBgImage, description || '']
      );
      await conn.query('UPDATE web_home_main SET order_index = id WHERE id = ?', [res.insertId]);
      return res;
    });
    
    await syncDraftsBackup();
    
    res.json({
      success: true,
      message: '시안이 데이터베이스에 등록되었습니다.',
      draft: {
        id: result.insertId,
        tag,
        slogan,
        subtext: subtext || '',
        bgImage: cleanBgImage,
        description: description || '',
        visible: visibleVal,
        defaultTag: tag,
        defaultSlogan: slogan,
        defaultSubtext: subtext || '',
        defaultBgImage: cleanBgImage,
        defaultDescription: description || ''
      }
    });
  } catch (err: any) {
    console.error('[API error] Create hero-draft failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Edit draft
router.put('/api/hero-drafts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { tag, slogan, subtext, bgImage, description, visible } = req.body;
  if (!tag || !slogan || !bgImage) {
    return res.status(400).json({ success: false, message: '태그, 슬로건, 배경 이미지는 필수값입니다.' });
  }
  try {
    const cleanBgImage = saveBase64ToFile(bgImage, 'draft_hero');
    const visibleVal = (visible === undefined || visible === true || visible === 1 || String(visible) === 'true');
    
    const r = await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_home_main SET tag = ?, slogan = ?, subtext = ?, bg_image = ?, description = ?, visible = ? WHERE id = ?',
        [tag, slogan, subtext || '', cleanBgImage, description || '', visibleVal, id]
      );
      const [rows]: any = await conn.query('SELECT * FROM web_home_main WHERE id = ?', [id]);
      return rows[0] || {};
    });

    await syncDraftsBackup();

    res.json({
      success: true,
      message: '시안이 수정되었습니다.',
      draft: { 
        id, 
        tag, 
        slogan, 
        subtext, 
        bgImage: cleanBgImage, 
        description, 
        visible: visibleVal,
        defaultTag: r.default_tag || tag,
        defaultSlogan: r.default_slogan || slogan,
        defaultSubtext: r.default_subtext || subtext,
        defaultBgImage: r.default_bg_image || cleanBgImage,
        defaultDescription: r.default_description || description
      }
    });
  } catch (err: any) {
    console.error('[API error] Update hero-draft failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle draft visibility
router.put('/api/hero-drafts/:id/toggle-visibility', async (req, res) => {
  const id = parseInt(req.params.id);
  const { visible } = req.body;
  try {
    const visibleVal = !!visible;
    await withDbConnection(async (conn) => {
      await conn.query('UPDATE web_home_main SET visible = ? WHERE id = ?', [visibleVal, id]);
    });
    await syncDraftsBackup();
    res.json({ success: true, message: '시안 노출 상태가 변경되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Toggle draft visibility failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete draft
router.delete('/api/hero-drafts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await withDbConnection(async (conn) => {
      const [rows]: any = await conn.query('SELECT bg_image FROM web_home_main WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const bgImage = rows[0].bg_image;
        if (bgImage && bgImage.startsWith('/uploads/')) {
          const filename = bgImage.replace('/uploads/', '');
          const filePath = path.join(process.cwd(), 'uploads', filename);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`[Disk Cleanup] Deleted associated uploads user image: ${filePath}`);
            }
          } catch (fileErr) {
            console.error('[Disk Cleanup Error] Failed to delete image file from disk:', fileErr);
          }
        }
      }
      await conn.query('DELETE FROM web_home_main WHERE id = ?', [id]);
    });
    await syncDraftsBackup();
    res.json({ success: true, message: '시안이 삭제되었습니다.', deletedId: id });
  } catch (err: any) {
    console.error('[API error] Delete hero-draft failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save current values as default for this individual draft post
router.post('/api/hero-drafts/:id/save-default', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const r = await withDbConnection(async (conn) => {
      await conn.query(
        `UPDATE web_home_main 
         SET default_tag = tag, 
             default_slogan = slogan, 
             default_subtext = subtext, 
             default_bg_image = bg_image, 
             default_description = description 
         WHERE id = ?`,
        [id]
      );
      const [rows]: any = await conn.query('SELECT * FROM web_home_main WHERE id = ?', [id]);
      return rows[0];
    });

    if (!r) {
      return res.status(404).json({ success: false, message: '시안을 찾을 수 없습니다.' });
    }
    await syncDraftsBackup();

    res.json({
      success: true,
      message: '이 시안 게시글의 현재 기획 내용이 개별 복원용 디폴트값으로 안전하게 등록 저장되었습니다.',
      draft: {
        id: r.id,
        tag: r.tag,
        slogan: r.slogan,
        subtext: r.subtext,
        bgImage: r.bg_image,
        description: r.description,
        visible: r.visible !== 0,
        defaultTag: r.default_tag || r.tag,
        defaultSlogan: r.default_slogan || r.slogan,
        defaultSubtext: r.default_subtext || r.subtext,
        defaultBgImage: r.default_bg_image || r.bg_image,
        defaultDescription: r.default_description || r.description
      }
    });
  } catch (err: any) {
    console.error('[API error] Save draft level default failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restore this individual draft post to its saved default values
router.post('/api/hero-drafts/:id/restore-default', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const r = await withDbConnection(async (conn) => {
      const [rows]: any = await conn.query('SELECT * FROM web_home_main WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      const r = rows[0];

      const targetTag = r.default_tag || r.tag;
      const targetSlogan = r.default_slogan || r.slogan;
      const targetSubtext = r.default_subtext || r.subtext;
      const targetBgImage = r.default_bg_image || r.bg_image;
      const targetDescription = r.default_description || r.description;

      await conn.query(
        `UPDATE web_home_main 
         SET tag = ?, 
             slogan = ?, 
             subtext = ?, 
             bg_image = ?, 
             description = ? 
         WHERE id = ?`,
        [targetTag, targetSlogan, targetSubtext, targetBgImage, targetDescription, id]
      );
      return { ...r, tag: targetTag, slogan: targetSlogan, subtext: targetSubtext, bg_image: targetBgImage, description: targetDescription };
    });

    if (!r) {
      return res.status(404).json({ success: false, message: '시안을 찾을 수 없습니다.' });
    }
    await syncDraftsBackup();

    res.json({
      success: true,
      message: '이 시안 게시글이 미리 설정해둔 전용 디폴트값 상태로 복원되었습니다.',
      draft: {
        id,
        tag: r.tag,
        slogan: r.slogan,
        subtext: r.subtext,
        bgImage: r.bg_image,
        description: r.description,
        visible: r.visible !== 0,
        defaultTag: r.default_tag || r.tag,
        defaultSlogan: r.default_slogan || r.slogan,
        defaultSubtext: r.default_subtext || r.subtext,
        defaultBgImage: r.default_bg_image || r.bg_image,
        defaultDescription: r.default_description || r.description
      }
    });
  } catch (err: any) {
    console.error('[API error] Restore draft level default failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset drafts
router.post('/api/hero-drafts/reset', async (req, res) => {
  const { useCustom } = req.body || {};
  try {
    const BACKUP_CUSTOM_DEFAULTS_FILE = path.join(process.cwd(), 'haste_hero_drafts_custom_defaults.json');

    if (useCustom && fs.existsSync(BACKUP_CUSTOM_DEFAULTS_FILE)) {
      const fileContent = fs.readFileSync(BACKUP_CUSTOM_DEFAULTS_FILE, 'utf-8');
      const customDrafts = JSON.parse(fileContent);

      await withDbConnection(async (conn) => {
        await conn.query('DELETE FROM web_home_main');
        for (const draft of customDrafts) {
          const bg = draft.bg_image || draft.bgImage || '';
          await conn.query(
            `INSERT INTO web_home_main (
              id, tag, slogan, subtext, bg_image, description, visible, order_index, 
              default_tag, default_slogan, default_subtext, default_bg_image, default_description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              draft.id, draft.tag, draft.slogan, draft.subtext, bg, draft.description, 
              draft.visible !== undefined && draft.visible !== false ? 1 : 0,
              draft.order_index !== undefined ? draft.order_index : draft.id,
              draft.default_tag || draft.tag,
              draft.default_slogan || draft.slogan,
              draft.default_subtext || draft.subtext,
              draft.default_bg_image || bg,
              draft.default_description || draft.description
            ]
          );
        }
      });
      writeBackupDrafts(customDrafts);
      res.json({ 
        success: true, 
        message: '시안 목록이 이전에 저장하신 사용자 정의 복원값으로 성공적으로 리셋 완료되었습니다.',
        drafts: customDrafts
      });
    } else {
      await withDbConnection(async (conn) => {
        await conn.query('DELETE FROM web_home_main');
        for (const draft of DEFAULT_DRAFTS) {
          await conn.query(
            `INSERT INTO web_home_main (
              id, tag, slogan, subtext, bg_image, description, visible, order_index,
              default_tag, default_slogan, default_subtext, default_bg_image, default_description
            ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
            [
              draft.id, draft.tag, draft.slogan, draft.subtext, draft.bg_image, draft.description,
              draft.id, draft.tag, draft.slogan, draft.subtext, draft.bg_image, draft.description
            ]
          );
        }
      });
      writeBackupDrafts(DEFAULT_DRAFTS);
      res.json({ 
        success: true, 
        message: '시안 목록이 HAIST 40대 순정 프리미엄 기획 시안으로 성공적으로 리셋 완료되었습니다.',
        drafts: DEFAULT_DRAFTS 
      });
    }
  } catch (err: any) {
    console.error('[API error] Reset hero-drafts failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save current drafts as a checkpoint
router.get('/api/hero-drafts/checkpoints', async (req, res) => {
  try {
    const list = getLocalCheckpoints('haste_hero_drafts_checkpoints.json');
    res.json({ success: true, checkpoints: list });
  } catch (err: any) {
    console.error('[API error] Get drafts checkpoints failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/hero-drafts/save-checkpoint', async (req, res) => {
  try {
    const rows: any = await withDbConnection(async (conn) => {
      const [data]: any = await conn.query('SELECT * FROM web_home_main ORDER BY order_index ASC, id ASC');
      return data;
    });

    const list = await saveLocalCheckpoint(
      'haste_hero_drafts_checkpoints.json',
      'cp_draft',
      { draftsCount: rows.length },
      { drafts: rows }
    );

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '현재 활성화된 메인 시안 목록이 성공적으로 백업되었습니다! (최대 3개 유지)' 
    });
  } catch (err: any) {
    console.error('[API error] Save drafts checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/hero-drafts/restore-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const DRAFTS_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_hero_drafts_checkpoints.json');
    if (!fs.existsSync(DRAFTS_CHECKPOINTS_FILE)) {
      return res.status(404).json({ success: false, error: '이동 가능한 시안 백업 파일이 존재하지 않습니다.' });
    }
    const list = getLocalCheckpoints('haste_hero_drafts_checkpoints.json');
    const cp = list.find((item: any) => item.id === checkpointId);
    if (!cp) {
      return res.status(404).json({ success: false, error: '선택하신 백업 시점을 찾을 수 없습니다.' });
    }

    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_home_main');
      for (const draft of cp.drafts) {
        const bg = draft.bg_image || draft.bgImage || '';
        await conn.query(
          `INSERT INTO web_home_main (
            id, tag, slogan, subtext, bg_image, description, visible, order_index, 
            default_tag, default_slogan, default_subtext, default_bg_image, default_description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            draft.id, draft.tag, draft.slogan, draft.subtext, bg, draft.description, 
            draft.visible !== undefined && draft.visible !== false ? 1 : 0,
            draft.order_index !== undefined ? draft.order_index : draft.id,
            draft.default_tag || draft.tag,
            draft.default_slogan || draft.slogan,
            draft.default_subtext || draft.subtext,
            draft.default_bg_image || bg,
            draft.default_description || draft.description
          ]
        );
      }
    });
    writeBackupDrafts(cp.drafts);

    res.json({ 
      success: true, 
      message: '선택한 백업 시점의 시안 목록으로 복구가 완료되었습니다.',
      drafts: cp.drafts
    });
  } catch (err: any) {
    console.error('[API error] Restore drafts checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/hero-drafts/delete-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const list = await deleteLocalCheckpoint('haste_hero_drafts_checkpoints.json', checkpointId);

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '선택하신 복원용 시안 체크포인트가 성공적으로 파기되었습니다.' 
    });
  } catch (err: any) {
    console.error('[API error] Delete drafts checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get draft random show setting
router.get('/api/hero-drafts/settings', async (req, res) => {
  try {
    let randomShow = false;
    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    const dbPool = await getDbPool();
    
    await withDbConnection(async (conn) => {
      if (conn.isFallback) {
        if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
          const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
          const data = JSON.parse(raw);
          randomShow = data.draft_random_show === 'true';
        }
      } else {
        const [rows]: any = await conn.query('SELECT setting_value FROM web_system_settings WHERE setting_key = ?', ['draft_random_show']);
        if (rows && rows.length > 0) {
          randomShow = rows[0].setting_value === 'true';
        }
      }
    });

    res.json({ success: true, draftRandomShow: randomShow });
  } catch (err: any) {
    console.error('[API error] Get hero-drafts settings failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update draft random show setting
router.post('/api/hero-drafts/settings', async (req, res) => {
  const { draftRandomShow } = req.body;
  const showVal = draftRandomShow ? 'true' : 'false';
  try {
    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    const dbPool = await getDbPool();
    
    await withDbConnection(async (conn) => {
      if (conn.isFallback) {
        fs.writeFileSync(BACKUP_SETTINGS_FILE, JSON.stringify({ draft_random_show: showVal }, null, 2));
      } else {
        const [result]: any = await conn.query(
          'UPDATE web_system_settings SET setting_value = ? WHERE setting_key = ?',
          [showVal, 'draft_random_show']
        );
        let affectedRows = 0;
        if (result) {
          affectedRows = result.affectedRows || result.rowCount || 0;
        }
        if (affectedRows === 0) {
          try {
            await conn.query(
              'INSERT INTO web_system_settings (setting_key, setting_value) VALUES (?, ?)',
              ['draft_random_show', showVal]
            );
          } catch (_) {}
        }
      }
    });

    // Fallback sync (always keep local JSON in sync)
    fs.writeFileSync(BACKUP_SETTINGS_FILE, JSON.stringify({ draft_random_show: showVal }, null, 2));

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    res.json({ success: true, message: '배너 정렬 세팅이 수정되었습니다.', draftRandomShow: !!draftRandomShow });
  } catch (err: any) {
    console.error('[API error] Update hero-drafts settings failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
