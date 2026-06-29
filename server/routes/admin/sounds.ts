import { Router } from 'express';
import { writeBackupSounds } from '../../database';
import { withDbConnection } from '../../db/common-handler';

const router = Router();

async function syncSoundsBackup() {
  try {
    const rows: any = await withDbConnection(async (conn) => {
      const [data]: any = await conn.query('SELECT * FROM web_brand_sounds ORDER BY order_index ASC, id ASC');
      return data || [];
    });
    const frontendSounds = rows.map((f: any) => ({
      id: f.id,
      title: f.title,
      desc: f.desc || '',
      soundUrl: f.sound_url || f.soundUrl || '',
      visible: f.visible === 1 || f.visible === true || String(f.visible) === '1',
      orderIndex: f.order_index || 0
    }));
    writeBackupSounds(frontendSounds);
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
  } catch (err) {
    console.error('[Sync Sounds Backup Error]', err);
  }
}

// Sounds Operations
router.post('/api/sounds', async (req, res) => {
  const { title, desc, soundUrl, visible } = req.body;
  if (!title || !desc) {
    return res.status(400).json({ success: false, message: '제목, 내용은 필수값입니다.' });
  }
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    const soundUrlVal = soundUrl || '';
    const result: any = await withDbConnection(async (conn) => {
      const [res]: any = await conn.query(
        'INSERT INTO web_brand_sounds (title, "desc", sound_url, visible) VALUES (?, ?, ?, ?)',
        [title, desc, soundUrlVal, visibleVal]
      );
      return res;
    });

    await syncSoundsBackup();

    res.json({
      success: true,
      message: '사운드가 등록되었습니다.',
      sound: {
        id: result.insertId,
        title,
        desc,
        soundUrl,
        visible: !!visibleVal
      }
    });
  } catch (err: any) {
    console.error('[API error] Create sound failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/sounds/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, desc, soundUrl, visible } = req.body;
  if (!title || !desc) {
    return res.status(400).json({ success: false, message: '제목, 내용은 필수값입니다.' });
  }
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    const soundUrlVal = soundUrl || '';
    await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_brand_sounds SET title = ?, "desc" = ?, sound_url = ?, visible = ? WHERE id = ?',
        [title, desc, soundUrlVal, visibleVal, id]
      );
    });

    await syncSoundsBackup();

    res.json({
      success: true,
      message: '사운드가 수정되었습니다.',
      sound: {
        id,
        title,
        desc,
        soundUrl,
        visible: !!visibleVal
      }
    });
  } catch (err: any) {
    console.error('[API error] Update sound failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/sounds/:id/toggle-visibility', async (req, res) => {
  const id = parseInt(req.params.id);
  const { visible } = req.body;
  try {
    const visibleVal = !!visible;
    await withDbConnection(async (conn) => {
      await conn.query('UPDATE web_brand_sounds SET visible = ? WHERE id = ?', [visibleVal, id]);
    });
    await syncSoundsBackup();
    res.json({ success: true, message: '사운드 노출 상태가 변경되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Toggle sound visibility failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/sounds/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_brand_sounds WHERE id = ?', [id]);
    });
    await syncSoundsBackup();
    res.json({ success: true, message: '사운드가 삭제되었습니다.', deletedId: id });
  } catch (err: any) {
    console.error('[API error] Delete sound failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/sounds/reorder', async (req, res) => {
  const { reorderedIds } = req.body || {};
  if (!Array.isArray(reorderedIds)) {
    return res.status(400).json({ success: false, error: 'reorderedIds array is required.' });
  }
  try {
    await withDbConnection(async (conn) => {
      for (let i = 0; i < reorderedIds.length; i++) {
        const id = reorderedIds[i];
        await conn.query('UPDATE web_brand_sounds SET order_index = ? WHERE id = ?', [i, id]);
      }
    });

    await syncSoundsBackup();

    res.json({ success: true, message: '순서가 성공적으로 변경되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reorder sounds failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
