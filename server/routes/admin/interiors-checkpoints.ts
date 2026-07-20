import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { 
  saveBase64ToFile, 
  writeBackupInteriors 
} from '../../database';
import { withDbConnection, getLocalCheckpoints, saveLocalCheckpoint, deleteLocalCheckpoint } from '../../db/common-handler';
import * as serverDefaults from '../../serverDefaults';

const { DEFAULT_INTERIORS } = serverDefaults;

const router = Router();

router.get('/api/interiors/checkpoints', async (req, res) => {
  try {
    const list = getLocalCheckpoints('haste_interiors_checkpoints.json');
    res.json({ success: true, checkpoints: list });
  } catch (err: any) {
    console.error('[API error] Get interiors checkpoints failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors/save-checkpoint', async (req, res) => {
  try {
    const rows: any = await withDbConnection(async (conn) => {
      const [data]: any = await conn.query('SELECT * FROM web_interior_layouts ORDER BY order_index ASC, id ASC');
      return data;
    });

    const list = await saveLocalCheckpoint(
      'haste_interiors_checkpoints.json',
      'cp_interior',
      { interiorsCount: rows.length },
      { interiors: rows }
    );

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '현재 활성화된 모든 매외 도면 구성 목록이 성공적으로 백업되었습니다! (최대 3개 유지)' 
    });
  } catch (err: any) {
    console.error('[API error] Save interiors checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors/restore-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const INTERIORS_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_interiors_checkpoints.json');
    if (!fs.existsSync(INTERIORS_CHECKPOINTS_FILE)) {
      return res.status(404).json({ success: false, error: '이동 가능한 도면 백업 파일이 존재하지 않습니다.' });
    }
    const list = getLocalCheckpoints('haste_interiors_checkpoints.json');
    const cp = list.find((item: any) => item.id === checkpointId);
    if (!cp) {
      return res.status(404).json({ success: false, error: '선택하신 백업 시점을 찾을 수 없습니다.' });
    }

    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_interior_layouts');
      for (const item of cp.interiors) {
        const isVisible = item.visible !== undefined && item.visible !== false ? 1 : 0;
        const typeIdVal = item.type_id || ("TYPE" + item.id);
        const highlightsVal = typeof item.highlights === 'string' ? item.highlights : JSON.stringify(item.highlights || []);
        const defaultHighlightsVal = typeof item.default_highlights === 'string' ? item.default_highlights : JSON.stringify(item.default_highlights || item.highlights || []);

        await conn.query(
          `INSERT INTO web_interior_layouts (
            id, type_id, title, subtitle, \`desc\`, tags, highlights, gallery, mock_image, blueprint_image, order_index, visible, 
            default_title, default_subtitle, default_desc, default_tags, default_highlights, default_gallery, default_mock_image, default_blueprint_image
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            typeIdVal,
            item.title,
            item.subtitle,
            item.desc || item.description || '',
            typeof item.tags === 'string' ? item.tags : JSON.stringify(item.tags || []),
            highlightsVal,
            typeof item.gallery === 'string' ? item.gallery : JSON.stringify(item.gallery || []),
            item.mock_image || item.mockImage || '',
            item.blueprint_image || item.blueprintImage || '',
            item.order_index !== undefined ? item.order_index : 0,
            isVisible,
            item.default_title || item.title,
            item.default_subtitle || item.subtitle,
            item.default_desc || item.desc || item.description || '',
            typeof item.default_tags === 'string' ? item.default_tags : JSON.stringify(item.default_tags || item.tags || []),
            defaultHighlightsVal,
            typeof item.default_gallery === 'string' ? item.default_gallery : JSON.stringify(item.default_gallery || item.gallery || []),
            item.default_mock_image || item.mock_image || item.mockImage || '',
            item.default_blueprint_image || item.blueprint_image || item.blueprintImage || ''
          ]
        );
      }
    });

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    writeBackupInteriors(cp.interiors);

    res.json({ 
      success: true, 
      message: '선택한 백업 시점의 도면 목록으로 복구가 완료되었습니다.',
      interiors: cp.interiors
    });
  } catch (err: any) {
    console.error('[API error] Restore interiors checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors/delete-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const list = await deleteLocalCheckpoint('haste_interiors_checkpoints.json', checkpointId);

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '선택하신 복원용 도면 체크포인트가 성공적으로 파기되었습니다.' 
    });
  } catch (err: any) {
    console.error('[API error] Delete interiors checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors/sync', async (req, res) => {
  const { interiors } = req.body;
  if (!Array.isArray(interiors)) {
    return res.status(400).json({ success: false, message: '올바르지 않은 데이터 형식입니다.' });
  }
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_interior_layouts');
      for (const item of interiors) {
        const cleanMock = saveBase64ToFile(item.mockImage || '', 'interior_mock');
        const cleanBlueprint = saveBase64ToFile(item.blueprintImage || '', 'interior_blueprint');
        const cleanGalleryList = Array.isArray(item.gallery)
          ? item.gallery.map((galleryImg: any) => saveBase64ToFile(galleryImg, 'interior_gallery'))
          : [];

        const tagsStr = Array.isArray(item.tags) ? JSON.stringify(item.tags) : JSON.stringify([]);
        const highlightsStr = Array.isArray(item.highlights) ? JSON.stringify(item.highlights) : JSON.stringify([]);
        const galleryStr = JSON.stringify(cleanGalleryList);
        
        await conn.query(
          'INSERT INTO web_interior_layouts (type_id, title, subtitle, `desc`, tags, highlights, gallery, mock_image, blueprint_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.title, item.subtitle || '', item.desc || '', tagsStr, highlightsStr, galleryStr, cleanMock, cleanBlueprint]
        );
      }
    });

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
    res.json({ success: true, message: '모든 인테리어 설정이 DB에 성공적으로 동기화되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Bulk sync interiors failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors/reset', async (req, res) => {
  const { useCustom } = req.body || {};
  try {
    const BACKUP_INTERIORS_CUSTOM_DEFAULTS_FILE = path.join(process.cwd(), 'haste_interiors_custom_defaults.json');

    if (useCustom && fs.existsSync(BACKUP_INTERIORS_CUSTOM_DEFAULTS_FILE)) {
      const fileContent = fs.readFileSync(BACKUP_INTERIORS_CUSTOM_DEFAULTS_FILE, 'utf-8');
      const customInteriors = JSON.parse(fileContent);

      await withDbConnection(async (conn) => {
        await conn.query('DELETE FROM web_interior_layouts');
        for (const item of customInteriors) {
          await conn.query(
            `INSERT INTO web_interior_layouts (
              id, type_id, title, subtitle, \`desc\`, tags, highlights, gallery, mock_image, blueprint_image, visible, order_index,
              default_title, default_subtitle, default_desc, default_tags, default_highlights, default_gallery, default_mock_image, default_blueprint_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.id, item.type_id || item.id, item.title, item.subtitle, item.desc || '', 
              typeof item.tags === 'string' ? item.tags : JSON.stringify(item.tags || []), 
              typeof item.highlights === 'string' ? item.highlights : JSON.stringify(item.highlights || []), 
              typeof item.gallery === 'string' ? item.gallery : JSON.stringify(item.gallery || []), 
              item.mock_image || item.mockImage || '', 
              item.blueprint_image || item.blueprintImage || '', 
              item.visible !== undefined && item.visible !== false ? 1 : 0,
              item.order_index !== undefined ? item.order_index : item.id,
              item.default_title || item.title,
              item.default_subtitle || item.subtitle,
              item.default_desc || item.desc || '',
              typeof item.default_tags === 'string' ? item.default_tags : JSON.stringify(item.default_tags || item.tags || []),
              typeof item.default_highlights === 'string' ? item.default_highlights : JSON.stringify(item.default_highlights || item.highlights || []),
              typeof item.default_gallery === 'string' ? item.default_gallery : JSON.stringify(item.default_gallery || item.gallery || []),
              item.default_mock_image || item.mock_image || '',
              item.default_blueprint_image || item.blueprint_image || ''
            ]
          );
        }
      });
      if (typeof (global as any).flushPublicReadCache === 'function') {
        (global as any).flushPublicReadCache();
      }
      res.json({ 
        success: true, 
        message: '도면/인테리어 목록이 이전에 저장하신 사용자 정의 복원값으로 성공적으로 리셋 완료되었습니다.',
        interiors: customInteriors
      });
    } else {
      await withDbConnection(async (conn) => {
        await conn.query('DELETE FROM web_interior_layouts');
        for (const item of DEFAULT_INTERIORS) {
          await conn.query(
            `INSERT INTO web_interior_layouts (
              id, type_id, title, subtitle, \`desc\`, tags, highlights, gallery, mock_image, blueprint_image, visible, order_index,
              default_title, default_subtitle, default_desc, default_tags, default_highlights, default_gallery, default_mock_image, default_blueprint_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.id, item.type_id, item.title, item.subtitle, item.desc, item.tags, item.highlights, item.gallery, item.mock_image, item.blueprint_image,
              item.id, item.title, item.subtitle, item.desc, item.tags, item.highlights, item.gallery, item.mock_image, item.blueprint_image
            ]
          );
        }
      });
      if (typeof (global as any).flushPublicReadCache === 'function') {
        (global as any).flushPublicReadCache();
      }
      res.json({ 
        success: true, 
        message: '도면/인테리어 목록이 HAIST 순정 프리미엄 가맹 공간 디자인으로 성공적으로 리셋 완료되었습니다.',
        interiors: DEFAULT_INTERIORS 
      });
    }
  } catch (err: any) {
    console.error('[API error] Reset interiors failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
