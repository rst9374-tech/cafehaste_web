import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { 
  saveBase64ToFile, 
  writeBackupCategories, 
  writeBackupMenuItems 
} from '../../database';
import { withDbConnection, getLocalCheckpoints, saveLocalCheckpoint, deleteLocalCheckpoint } from '../../db/common-handler';
import * as serverDefaults from '../../../serverDefaults';

const { DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS } = serverDefaults;

const router = Router();

// 6. Menu Categories Operations
router.post('/api/menu-categories', async (req, res) => {
  const { id, name, desc, visible } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, message: '카테고리 ID와 카테고리명은 필수 입력 사항입니다.' });
  }
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    
    await withDbConnection(async (conn) => {
      if (conn.isFallback) {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, desc, visible) VALUES (?, ?, ?, ?)',
          [id, name, desc || '', visibleVal]
        );
      } else {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, `desc`, visible) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), `desc` = VALUES(`desc`), visible = VALUES(visible)',
          [id, name, desc || '', visibleVal]
        );
      }
    });
    
    res.json({
      success: true,
      message: '카테고리 정보가 성공적으로 등록 되었습니다.',
      category: { id, name, desc: desc || '', visible: visibleVal }
    });
  } catch (err: any) {
    console.error('[API error] Upsert menu-category failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/menu-categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, desc, visible } = req.body;
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_menu_categories SET name = ?, `desc` = ?, visible = ? WHERE id = ?',
        [name, desc || '', visibleVal, id]
      );
    });
    res.json({
      success: true,
      message: '카테고리가 수정되었습니다.',
      category: { id, name, desc, visible: visibleVal }
    });
  } catch (err: any) {
    console.error('[API error] Update menu-category failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/menu-categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_categories WHERE id = ?', [id]);
    });
    res.json({ success: true, message: '카테고리가 삭제되었습니다.', deletedId: id });
  } catch (err: any) {
    console.error('[API error] Delete menu-category failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu-categories/reset', async (req, res) => {
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_categories');
      for (const cat of DEFAULT_CATEGORIES) {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, `desc`, visible) VALUES (?, ?, ?, 1)',
          [cat.id, cat.name, cat.desc]
        );
      }
    });
    res.json({ success: true, message: '카테고리 목록이 기본값으로 초기화되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reset menu-categories failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Menu Items Operations
router.post('/api/menu-items', async (req, res) => {
  const { id, name, nameKr, category, image, description, acidity, sweetness, body, bitterness, visible, isSignature, videoUrl } = req.body;
  if (!id || !nameKr) {
    return res.status(400).json({ success: false, message: '메뉴 ID와 한글 메뉴명은 필수 입력 사항입니다.' });
  }
  try {
    const cleanImage = saveBase64ToFile(image || '', 'menu_item');
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    const isSignatureVal = (isSignature === true || isSignature === 1);
    const acidityVal = parseInt(acidity || 0);
    const sweetnessVal = parseInt(sweetness || 0);
    const bodyVal = parseInt(body || 0);
    const bitternessVal = parseInt(bitterness || 0);
    const videoUrlVal = videoUrl || '';

    await withDbConnection(async (conn) => {
      if (conn.isFallback) {
        await conn.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, name || '', nameKr, category || 'AMERICANO', cleanImage, description || '', acidityVal, sweetnessVal, bodyVal, bitternessVal, visibleVal, isSignatureVal, videoUrlVal]
        );
      } else {
        await conn.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), name_kr = VALUES(name_kr), category = VALUES(category), image = VALUES(image), description = VALUES(description), acidity = VALUES(acidity), sweetness = VALUES(sweetness), body = VALUES(body), bitterness = VALUES(bitterness), visible = VALUES(visible), is_signature = VALUES(is_signature), video_url = VALUES(video_url)',
          [id, name || '', nameKr, category || 'AMERICANO', cleanImage, description || '', acidityVal, sweetnessVal, bodyVal, bitternessVal, visibleVal, isSignatureVal, videoUrlVal]
        );
      }
    });

    res.json({
      success: true,
      message: '메뉴 항목이 데이터베이스에 등록되었습니다.',
      item: { id, name, nameKr, category, image: cleanImage, description, acidity: acidityVal, sweetness: sweetnessVal, body: bodyVal, bitterness: bitternessVal, visible: visibleVal, isSignature: isSignatureVal, videoUrl: videoUrlVal }
    });
  } catch (err: any) {
    console.error('[API error] Upsert menu-item failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nameKr, category, image, description, acidity, sweetness, body, bitterness, visible, isSignature, videoUrl } = req.body;
  try {
    const cleanImage = saveBase64ToFile(image || '', 'menu_item');
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    const isSignatureVal = (isSignature === true || isSignature === 1);
    const acidityVal = parseInt(acidity || 0);
    const sweetnessVal = parseInt(sweetness || 0);
    const bodyVal = parseInt(body || 0);
    const bitternessVal = parseInt(bitterness || 0);

    await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_menu_items SET name = ?, name_kr = ?, category = ?, image = ?, description = ?, acidity = ?, sweetness = ?, body = ?, bitterness = ?, visible = ?, is_signature = ?, video_url = ? WHERE id = ?',
        [name || '', nameKr, category, cleanImage, description || '', acidityVal, sweetnessVal, bodyVal, bitternessVal, visibleVal, isSignatureVal, videoUrl || '', id]
      );
    });

    res.json({
      success: true,
      message: '메뉴 항목이 수정되었습니다.',
      item: { id, name, nameKr, category, image: cleanImage, description, acidity: acidityVal, sweetness: sweetnessVal, body: bodyVal, bitterness: bitternessVal, visible: visibleVal, isSignature: isSignatureVal, videoUrl: videoUrl || '' }
    });
  } catch (err: any) {
    console.error('[API error] Update menu-item failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_items WHERE id = ?', [id]);
    });
    res.json({ success: true, message: '메뉴가 삭제되었습니다.', deletedId: id });
  } catch (err: any) {
    console.error('[API error] Delete menu-item failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reorder Menu Items
router.post('/api/menu-items/reorder', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: '올바른 메뉴 ID 배열이 전달되지 않았습니다.' });
  }
  try {
    await withDbConnection(async (conn) => {
      for (let i = 0; i < ids.length; i++) {
        await conn.query(
          'UPDATE web_menu_items SET order_index = ? WHERE id = ?',
          [i + 1, ids[i]]
        );
      }
      
      const [items]: any = await conn.query('SELECT * FROM web_menu_items ORDER BY order_index ASC, id ASC');
      const mappedItems = items.map((r: any) => ({
        id: r.id,
        name: r.name,
        nameKr: r.name_kr !== undefined ? r.name_kr : r.nameKr,
        category: r.category,
        image: r.image || '',
        description: r.description || '',
        acidity: r.acidity || 0,
        sweetness: r.sweetness || 0,
        body: r.body || 0,
        bitterness: r.bitterness || 0,
        visible: r.visible !== 0,
        isSignature: r.is_signature !== undefined ? (r.is_signature !== 0 && r.is_signature !== false) : (r.isSignature !== undefined && r.isSignature !== false)
      }));
      writeBackupMenuItems(mappedItems);
    });

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    res.json({ success: true, message: '메뉴 순서가 성공적으로 정렬되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reorder menu-items failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Edit Images
router.post('/api/menu-items/bulk-image', async (req, res) => {
  const { ids, image } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || image === undefined) {
    return res.status(400).json({ success: false, message: '올바른 메뉴 ID 배열과 이미지 정보가 전달되지 않았습니다.' });
  }
  try {
    const cleanImage = saveBase64ToFile(image || '', 'menu_item');
    await withDbConnection(async (conn) => {
      const placeholders = ids.map(() => '?').join(',');
      await conn.query(
        `UPDATE web_menu_items SET image = ? WHERE id IN (${placeholders})`,
        [cleanImage, ...ids]
      );
    });
    res.json({
      success: true,
      message: `선택한 ${ids.length}개 메뉴 품목의 이미지가 성공적으로 일괄 수정되었습니다.`,
      image: cleanImage
    });
  } catch (err: any) {
    console.error('[API error] Bulk update menu-item images failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu-items/reset', async (req, res) => {
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_items');
      for (const item of DEFAULT_MENU_ITEMS) {
        const isSig = (item.isSignature || item.is_signature || ['AME_HOT_LIGHT', 'AME_ICED_LIGHT', 'AME_HOT', 'AME_ICED'].includes(item.id)) ? 1 : 0;
        await conn.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
          [
            item.id,
            item.name || item.nameEng || '',
            item.name_kr || item.nameKr || '',
            item.category,
            item.image || '',
            item.description || '',
            item.acidity || 0,
            item.sweetness || 0,
            item.body || 0,
            item.bitterness || 0,
            isSig
          ]
        );
      }
    });
    res.json({ success: true, message: '메뉴 목록이 기본값으로 초기화되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reset menu-items failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Menu checkpoints
router.get('/api/menu/checkpoints', async (req, res) => {
  try {
    const list = getLocalCheckpoints('haste_menu_checkpoints.json');
    res.json({ success: true, checkpoints: list });
  } catch (err: any) {
    console.error('[API error] Get menu checkpoints failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu/save-checkpoint', async (req, res) => {
  try {
    const { cats, items } = await withDbConnection(async (conn) => {
      const [cats]: any = await conn.query('SELECT * FROM web_menu_categories ORDER BY id ASC');
      const [items]: any = await conn.query('SELECT * FROM web_menu_items ORDER BY category ASC, id ASC');
      return { cats, items };
    });

    const list = await saveLocalCheckpoint(
      'haste_menu_checkpoints.json',
      'cp_menu',
      { categoriesCount: cats.length, itemsCount: items.length },
      { categories: cats, items: items }
    );

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '현재 활성화된 메뉴판 구성(카테고리&음료)이 백업되었습니다! (최대 3개 유지)' 
    });
  } catch (err: any) {
    console.error('[API error] Save menu checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu/restore-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const MENU_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_menu_checkpoints.json');
    if (!fs.existsSync(MENU_CHECKPOINTS_FILE)) {
      return res.status(404).json({ success: false, error: '메뉴 백업 파일이 존재하지 않습니다.' });
    }
    const list = getLocalCheckpoints('haste_menu_checkpoints.json');
    const cp = list.find((item: any) => item.id === checkpointId);
    if (!cp) {
      return res.status(404).json({ success: false, error: '선택하신 백업 시점을 찾을 수 없습니다.' });
    }

    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_categories');
      for (const cat of cp.categories) {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, `desc`, visible) VALUES (?, ?, ?, ?)',
          [cat.id, cat.name, cat.desc || '', cat.visible]
        );
      }

      await conn.query('DELETE FROM web_menu_items');
      for (const item of cp.items) {
        await conn.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            item.id, item.name || '', item.name_kr || item.nameKr || '', item.category || 'AMERICANO', 
            item.image || '', item.description || '', item.acidity || 0, item.sweetness || 0, 
            item.body || 0, item.bitterness || 0, item.visible !== undefined && item.visible !== false ? 1 : 0, 
            item.is_signature !== undefined ? (item.is_signature ? 1 : 0) : (item.isSignature ? 1 : 0)
          ]
        );
      }
    });
    
    const mappedCats = cp.categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      desc: c.desc || '',
      visible: c.visible !== 0
    }));

    const mappedItems = cp.items.map((r: any) => ({
      id: r.id,
      name: r.name,
      nameKr: r.name_kr || r.nameKr,
      category: r.category,
      image: r.image || '',
      description: r.description || '',
      acidity: r.acidity || 0,
      sweetness: r.sweetness || 0,
      body: r.body || 0,
      bitterness: r.bitterness || 0,
      visible: r.visible !== 0,
      isSignature: r.is_signature !== undefined ? (r.is_signature !== 0 && r.is_signature !== false) : (r.isSignature !== undefined && r.isSignature !== false)
    }));

    writeBackupCategories(mappedCats);
    writeBackupMenuItems(mappedItems);

    res.json({ 
      success: true, 
      message: '선택한 백업 시점의 메뉴/카테고리 구성으로 복구가 완료되었습니다.',
      categories: mappedCats,
      items: mappedItems
    });
  } catch (err: any) {
    console.error('[API error] Restore menu checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu/delete-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const list = await deleteLocalCheckpoint('haste_menu_checkpoints.json', checkpointId);

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '선택하신 복원용 메뉴 체크포인트가 성공적으로 파기되었습니다.' 
    });
  } catch (err: any) {
    console.error('[API error] Delete menu checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
