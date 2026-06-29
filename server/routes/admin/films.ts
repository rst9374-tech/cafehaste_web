import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { saveBase64ToFile, writeBackupFilms } from '../../database';
import { withDbConnection, getLocalCheckpoints, saveLocalCheckpoint, deleteLocalCheckpoint } from '../../db/common-handler';
import * as serverDefaults from '../../../serverDefaults';

const { DEFAULT_FILMS } = serverDefaults;

const router = Router();

async function syncFilmsBackup() {
  try {
    const rows: any = await withDbConnection(async (conn) => {
      const [data]: any = await conn.query('SELECT * FROM web_brand_films ORDER BY order_index ASC, id ASC');
      return data || [];
    });
    const frontendFilms = rows.map((f: any) => ({
      id: f.id,
      title: f.title,
      desc: f.desc || f.description || '',
      videoUrl: f.video_url || f.videoUrl || '',
      visible: f.visible === 1 || f.visible === true || String(f.visible) === '1',
      orderIndex: f.order_index || f.orderIndex || 0,
      category: f.category || 'THEATER'
    }));
    writeBackupFilms(frontendFilms);
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
  } catch (err) {
    console.error('[Sync Films Backup Error]', err);
  }
}

// 4. Films Operations
router.post('/api/films', async (req, res) => {
  const { title, desc, videoUrl, visible, category } = req.body;
  if (!title || !desc || !videoUrl) {
    return res.status(400).json({ success: false, message: '제목, 내용, 비디오 링크는 필수값입니다.' });
  }
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1 || String(visible) === 'true');
    const categoryVal = category || 'THEATER';
    const result: any = await withDbConnection(async (conn) => {
      const [res]: any = await conn.query(
        'INSERT INTO web_brand_films (title, "desc", video_url, visible, category) VALUES (?, ?, ?, ?, ?)',
        [title, desc, videoUrl, visibleVal, categoryVal]
      );
      return res;
    });

    await syncFilmsBackup();

    res.json({
      success: true,
      message: '필름이 등록되었습니다.',
      film: {
        id: result.insertId,
        title,
        desc,
        videoUrl,
        visible: visibleVal,
        category: categoryVal
      }
    });
  } catch (err: any) {
    console.error('[API error] Create film failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/films/reorder', async (req, res) => {
  const { reorderedIds } = req.body || {};
  if (!Array.isArray(reorderedIds)) {
    return res.status(400).json({ success: false, error: 'reorderedIds array is required.' });
  }
  try {
    await withDbConnection(async (conn) => {
      for (let i = 0; i < reorderedIds.length; i++) {
        const id = reorderedIds[i];
        await conn.query('UPDATE web_brand_films SET order_index = ? WHERE id = ?', [i, id]);
      }
    });

    await syncFilmsBackup();

    res.json({ success: true, message: '순서가 성공적으로 변경되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reorder films failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/films/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, desc, videoUrl, visible, category } = req.body;
  if (!title || !desc || !videoUrl) {
    return res.status(400).json({ success: false, message: '제목, 내용, 비디오 링크는 필수값입니다.' });
  }
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1 || String(visible) === 'true');
    const categoryVal = category || 'THEATER';
    await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_brand_films SET title = ?, "desc" = ?, video_url = ?, visible = ?, category = ? WHERE id = ?',
        [title, desc, videoUrl, visibleVal, categoryVal, id]
      );
    });

    await syncFilmsBackup();

    res.json({
      success: true,
      message: '필름이 수정되었습니다.',
      film: {
        id,
        title,
        desc,
        videoUrl,
        visible: visibleVal,
        category: categoryVal
      }
    });
  } catch (err: any) {
    console.error('[API error] Update film failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/films/:id/toggle-visibility', async (req, res) => {
  const id = parseInt(req.params.id);
  const { visible } = req.body;
  try {
    const visibleVal = !!visible;
    await withDbConnection(async (conn) => {
      await conn.query('UPDATE web_brand_films SET visible = ? WHERE id = ?', [visibleVal, id]);
    });
    await syncFilmsBackup();
    res.json({ success: true, message: '필름 노출 상태가 변경되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Toggle film visibility failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/films/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_brand_films WHERE id = ?', [id]);
    });
    await syncFilmsBackup();
    res.json({ success: true, message: '필름이 삭제되었습니다.', deletedId: id });
  } catch (err: any) {
    console.error('[API error] Delete film failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});



router.post('/api/films/reset', async (req, res) => {
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_brand_films');
      for (const film of DEFAULT_FILMS) {
        await conn.query(
          'INSERT INTO web_brand_films (title, "desc", video_url, visible) VALUES (?, ?, ?, 1)',
          [film.title, film.desc, film.video_url]
        );
      }
    });
    writeBackupFilms(DEFAULT_FILMS);
    res.json({ success: true, message: '필름 리스트가 순정 상태로 리셋되었습니다.', films: DEFAULT_FILMS });
  } catch (err: any) {
    console.error('[API error] Reset films failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/films/checkpoints', async (req, res) => {
  try {
    const list = getLocalCheckpoints('haste_films_checkpoints.json');
    res.json({ success: true, checkpoints: list });
  } catch (err: any) {
    console.error('[API error] Get films checkpoints failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/films/save-checkpoint', async (req, res) => {
  try {
    const rows: any = await withDbConnection(async (conn) => {
      const [data]: any = await conn.query('SELECT * FROM web_brand_films ORDER BY id ASC');
      return data;
    });

    const list = await saveLocalCheckpoint(
      'haste_films_checkpoints.json',
      'cp_films',
      { filmsCount: rows.length },
      { films: rows }
    );

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '현재 활성화된 필름 목록이 성공적으로 백업되었습니다! (최대 3개 유지)' 
    });
  } catch (err: any) {
    console.error('[API error] Save films checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/films/restore-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const FILMS_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_films_checkpoints.json');
    if (!fs.existsSync(FILMS_CHECKPOINTS_FILE)) {
      return res.status(404).json({ success: false, error: '필름 백업 파일이 존재하지 않습니다.' });
    }
    const list = getLocalCheckpoints('haste_films_checkpoints.json');
    const cp = list.find((item: any) => item.id === checkpointId);
    if (!cp) {
      return res.status(404).json({ success: false, error: '선택하신 백업 시점을 찾을 수 없습니다.' });
    }

    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_brand_films');
      for (const film of cp.films) {
        await conn.query(
          'INSERT INTO web_brand_films (id, title, "desc", video_url, visible, category) VALUES (?, ?, ?, ?, ?, ?)',
          [film.id, film.title, film.desc, film.video_url || film.videoUrl, film.visible, film.category || 'THEATER']
        );
      }
    });
    
    const frontendFilms = cp.films.map((row: any) => ({
      id: row.id,
      title: row.title,
      desc: row.desc,
      videoUrl: row.video_url || row.videoUrl,
      visible: row.visible !== 0,
      category: row.category || 'THEATER'
    }));

    writeBackupFilms(frontendFilms);

    res.json({ 
      success: true, 
      message: '선택한 백업 시점의 필름 목록으로 복구가 완료되었습니다.',
      films: frontendFilms
    });
  } catch (err: any) {
    console.error('[API error] Restore films checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/films/delete-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const list = await deleteLocalCheckpoint('haste_films_checkpoints.json', checkpointId);

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '선택하신 복원용 필름 체크포인트가 성공적으로 파기되었습니다.' 
    });
  } catch (err: any) {
    console.error('[API error] Delete films checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get film random show setting
router.get('/api/films/settings', async (req, res) => {
  try {
    let randomShow = false;
    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    
    await withDbConnection(async (conn) => {
      if (conn.isFallback) {
        if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
          const raw = fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8');
          const data = JSON.parse(raw);
          randomShow = data.film_random_show === 'true';
        }
      } else {
        const [rows]: any = await conn.query('SELECT setting_value FROM web_system_settings WHERE setting_key = ?', ['film_random_show']);
        if (rows && rows.length > 0) {
          randomShow = rows[0].setting_value === 'true';
        }
      }
    });

    res.json({ success: true, filmRandomShow: randomShow });
  } catch (err: any) {
    console.error('[API error] Get films settings failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update film random show setting
router.post('/api/films/settings', async (req, res) => {
  const { filmRandomShow } = req.body;
  const showVal = filmRandomShow ? 'true' : 'false';
  try {
    const BACKUP_SETTINGS_FILE = path.join(process.cwd(), 'local_system_settings.json');
    let existingSettings: any = {};
    if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
      try {
        existingSettings = JSON.parse(fs.readFileSync(BACKUP_SETTINGS_FILE, 'utf-8'));
      } catch (_) {}
    }
    
    await withDbConnection(async (conn) => {
      if (conn.isFallback) {
        existingSettings.film_random_show = showVal;
        fs.writeFileSync(BACKUP_SETTINGS_FILE, JSON.stringify(existingSettings, null, 2));
      } else {
        const [result]: any = await conn.query(
          'UPDATE web_system_settings SET setting_value = ? WHERE setting_key = ?',
          [showVal, 'film_random_show']
        );
        let affectedRows = 0;
        if (result) {
          affectedRows = result.affectedRows || result.rowCount || 0;
        }
        if (affectedRows === 0) {
          try {
            await conn.query(
              'INSERT INTO web_system_settings (setting_key, setting_value) VALUES (?, ?)',
              ['film_random_show', showVal]
            );
          } catch (_) {}
        }
      }
    });

    existingSettings.film_random_show = showVal;
    fs.writeFileSync(BACKUP_SETTINGS_FILE, JSON.stringify(existingSettings, null, 2));

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    res.json({ success: true, message: '필름 정렬 세팅이 수정되었습니다.', filmRandomShow: !!filmRandomShow });
  } catch (err: any) {
    console.error('[API error] Update films settings failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
