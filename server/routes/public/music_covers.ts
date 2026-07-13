import { Router } from 'express';
import { getDbPool } from '../../database';
import { coversJsonPath, readJsonFile, writeJsonFile } from './music_helpers';

const router = Router();

// GET /api/music/covers
router.get('/api/music/covers', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let covers: any[] = [];

    if (dbPool.isFallback) {
      covers = readJsonFile<any[]>(coversJsonPath, []);
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM music_covers ORDER BY order_index ASC, id ASC');
      covers = rows || [];

      if (covers.length === 0) {
        const localCovers = readJsonFile<any[]>(coversJsonPath, []);
        if (localCovers.length > 0) {
          for (const c of localCovers) {
            await dbPool.query(
              'INSERT INTO music_covers (id, title, "desc", video_url, weather, visible, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [c.id, c.title, c.desc || '', c.videoUrl, c.weather || '', c.visible !== false ? 1 : 0, c.orderIndex || 0]
            );
          }
          const [reFetched]: any = await dbPool.query('SELECT * FROM music_covers ORDER BY order_index ASC, id ASC');
          covers = reFetched || [];
        }
      }
    }

    const formatted = covers.map((c: any) => ({
      id: c.id,
      title: c.title,
      desc: c.desc || '',
      videoUrl: c.video_url || c.videoUrl || '',
      weather: c.weather || '',
      visible: c.visible === 1 || c.visible === true || String(c.visible) === '1' || c.visible === null || c.visible === undefined,
      orderIndex: c.order_index || 0
    }));

    return res.json({ success: true, covers: formatted });
  } catch (err: any) {
    console.warn('[BGM API Warning] Database read fails (Covers). Serving local backup:', err.message);
    const fallback = readJsonFile<any[]>(coversJsonPath, []);
    return res.json({ success: true, covers: fallback, error: err.message });
  }
});

// POST /api/music/covers (등록)
router.post('/api/music/covers', async (req, res) => {
  const { title, desc, videoUrl, weather, visible } = req.body;
  if (!title || !videoUrl) {
    return res.status(400).json({ success: false, message: '커버 제목과 비디오 주소는 필수 입력 항목입니다.' });
  }

  try {
    const localCovers = readJsonFile<any[]>(coversJsonPath, []);
    const newId = localCovers.length > 0 ? Math.max(...localCovers.map(c => c.id)) + 1 : 1;
    const orderIdx = localCovers.length > 0 ? Math.max(...localCovers.map(c => c.orderIndex || 0)) + 1 : 1;

    const newCover = {
      id: newId,
      title,
      desc: desc || '',
      videoUrl,
      weather: weather || '',
      visible: visible !== false,
      orderIndex: orderIdx
    };

    localCovers.push(newCover);
    writeJsonFile(coversJsonPath, localCovers);

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query(
        'INSERT INTO music_covers (id, title, "desc", video_url, weather, visible, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newCover.id,
          newCover.title,
          newCover.desc,
          newCover.videoUrl,
          newCover.weather,
          newCover.visible ? 1 : 0,
          newCover.orderIndex
        ]
      );
    }

    return res.json({ success: true, message: '새 플레이커버가 등록되었습니다.', cover: newCover });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/music/covers/:id (수정)
router.put('/api/music/covers/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, desc, videoUrl, weather, visible } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: '유효한 ID가 아닙니다.' });
  }

  try {
    const localCovers = readJsonFile<any[]>(coversJsonPath, []);
    const coverIdx = localCovers.findIndex(c => c.id === id);

    if (coverIdx === -1) {
      return res.status(404).json({ success: false, message: '해당 플레이커버를 찾을 수 없습니다.' });
    }

    const updatedCover = {
      ...localCovers[coverIdx],
      title: title || localCovers[coverIdx].title,
      desc: desc !== undefined ? desc : localCovers[coverIdx].desc,
      videoUrl: videoUrl || localCovers[coverIdx].videoUrl,
      weather: weather !== undefined ? weather : localCovers[coverIdx].weather,
      visible: visible !== undefined ? !!visible : localCovers[coverIdx].visible
    };

    localCovers[coverIdx] = updatedCover;
    writeJsonFile(coversJsonPath, localCovers);

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query(
        'UPDATE music_covers SET title = ?, "desc" = ?, video_url = ?, weather = ?, visible = ? WHERE id = ?',
        [
          updatedCover.title,
          updatedCover.desc,
          updatedCover.videoUrl,
          updatedCover.weather,
          updatedCover.visible ? 1 : 0,
          id
        ]
      );
    }

    return res.json({ success: true, message: '플레이커버가 수정되었습니다.', cover: updatedCover });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/music/covers/:id (삭제)
router.delete('/api/music/covers/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: '유효한 ID가 아닙니다.' });
  }

  try {
    const localCovers = readJsonFile<any[]>(coversJsonPath, []);
    const filtered = localCovers.filter(c => c.id !== id);
    writeJsonFile(coversJsonPath, filtered);

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query('DELETE FROM music_covers WHERE id = ?', [id]);
    }

    return res.json({ success: true, message: '플레이커버가 삭제되었습니다.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/music/covers/reorder (순서 정렬)
router.put('/api/music/covers/reorder', async (req, res) => {
  const { reorderedIds } = req.body;
  if (!Array.isArray(reorderedIds)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 순서 배열입니다.' });
  }

  try {
    const localCovers = readJsonFile<any[]>(coversJsonPath, []);
    const sorted = [...localCovers].sort((a, b) => {
      const idxA = reorderedIds.indexOf(a.id);
      const idxB = reorderedIds.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    sorted.forEach((cover, index) => {
      cover.orderIndex = index + 1;
    });

    writeJsonFile(coversJsonPath, sorted);

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      for (const cover of sorted) {
        await dbPool.query('UPDATE music_covers SET order_index = ? WHERE id = ?', [cover.orderIndex, cover.id]);
      }
    }

    return res.json({ success: true, message: '플레이커버 정렬 순서가 저장되었습니다.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/music/covers/:id/toggle-visibility (노출 여부 토글)
router.put('/api/music/covers/:id/toggle-visibility', async (req, res) => {
  const id = Number(req.params.id);
  const { visible } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: '유효한 ID가 아닙니다.' });
  }

  try {
    const localCovers = readJsonFile<any[]>(coversJsonPath, []);
    const cover = localCovers.find(c => c.id === id);
    if (cover) {
      cover.visible = !!visible;
      writeJsonFile(coversJsonPath, localCovers);
    }

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query('UPDATE music_covers SET visible = ? WHERE id = ?', [visible ? 1 : 0, id]);
    }

    return res.json({ success: true, message: '노출 상태가 토글되었습니다.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
