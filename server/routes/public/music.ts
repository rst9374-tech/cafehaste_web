import { Router } from 'express';
import { getDbPool } from '../../database';
import { songsJsonPath, readJsonFile, writeJsonFile } from './music_helpers';
import coversRouter from './music_covers';
import communityRouter from './music_community';

const router = Router();

// ==========================================
// 1. MUSIC SONGS API (BGM 관리)
// ==========================================

// GET /api/music/songs
router.get('/api/music/songs', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let songs: any[] = [];

    if (dbPool.isFallback) {
      songs = readJsonFile<any[]>(songsJsonPath, []);
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM music_songs ORDER BY order_index ASC, id ASC');
      songs = rows || [];
      
      if (songs.length === 0) {
        const localSongs = readJsonFile<any[]>(songsJsonPath, []);
        if (localSongs.length > 0) {
          for (const s of localSongs) {
            await dbPool.query(
              'INSERT INTO music_songs (id, title, artist, "desc", genre, mood, sound_url, cover_url, lyrics, visible, order_index, owner_pick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                s.id, 
                s.title, 
                s.artist || '', 
                s.desc || '', 
                s.genre || '', 
                s.mood || '', 
                s.soundUrl, 
                s.coverUrl || '', 
                s.lyrics || '',
                s.visible !== false ? 1 : 0, 
                s.orderIndex || 0,
                s.ownerPick ? 1 : 0
              ]
            );
          }
          const [reFetched]: any = await dbPool.query('SELECT * FROM music_songs ORDER BY order_index ASC, id ASC');
          songs = reFetched || [];
        }
      }
    }

    const formatted = songs.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist || '',
      desc: s.desc || s.description || '',
      genre: s.genre || '',
      mood: s.mood || '',
      soundUrl: s.sound_url || s.soundUrl || '',
      coverUrl: s.cover_url || s.coverUrl || '',
      lyrics: s.lyrics || '',
      visible: s.visible === 1 || s.visible === true || String(s.visible) === '1' || s.visible === null || s.visible === undefined,
      orderIndex: s.order_index || 0,
      ownerPick: s.owner_pick === 1 || s.owner_pick === true || String(s.owner_pick) === '1'
    }));

    return res.json({ success: true, songs: formatted });
  } catch (err: any) {
    console.warn('[BGM API Warning] Database read fails. Serving local backup:', err.message);
    const fallback = readJsonFile<any[]>(songsJsonPath, []);
    return res.json({ success: true, songs: fallback, error: err.message });
  }
});

// POST /api/music/songs (등록)
router.post('/api/music/songs', async (req, res) => {
  const { title, artist, desc, genre, mood, soundUrl, coverUrl, lyrics, visible, ownerPick } = req.body;
  if (!title || !soundUrl) {
    return res.status(400).json({ success: false, message: '곡 제목과 재생 링크는 필수 입력 항목입니다.' });
  }

  try {
    const localSongs = readJsonFile<any[]>(songsJsonPath, []);
    const newId = localSongs.length > 0 ? Math.max(...localSongs.map(s => s.id)) + 1 : 1;
    const orderIdx = localSongs.length > 0 ? Math.max(...localSongs.map(s => s.orderIndex || 0)) + 1 : 1;

    const newSong = {
      id: newId,
      title,
      artist: artist || '',
      desc: desc || '',
      genre: genre || '',
      mood: mood || '',
      soundUrl,
      coverUrl: coverUrl || '',
      lyrics: lyrics || '',
      visible: visible !== false,
      orderIndex: orderIdx,
      ownerPick: !!ownerPick
    };

    localSongs.push(newSong);
    writeJsonFile(songsJsonPath, localSongs);

    // Write to DB if pool is available and not in fallback mode
    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query(
        'INSERT INTO music_songs (id, title, artist, "desc", genre, mood, sound_url, cover_url, lyrics, visible, order_index, owner_pick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          newSong.id,
          newSong.title,
          newSong.artist,
          newSong.desc,
          newSong.genre,
          newSong.mood,
          newSong.soundUrl,
          newSong.coverUrl,
          newSong.lyrics,
          newSong.visible ? 1 : 0,
          newSong.orderIndex,
          newSong.ownerPick ? 1 : 0
        ]
      );
    }

    return res.json({ success: true, message: '새 BGM이 등록되었습니다.', song: newSong });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/music/songs/:id (수정)
router.put('/api/music/songs/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, artist, desc, genre, mood, soundUrl, coverUrl, lyrics, visible, ownerPick } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: '유효한 ID가 아닙니다.' });
  }

  try {
    const localSongs = readJsonFile<any[]>(songsJsonPath, []);
    const songIdx = localSongs.findIndex(s => s.id === id);

    if (songIdx === -1) {
      return res.status(404).json({ success: false, message: '해당 BGM을 찾을 수 없습니다.' });
    }

    const updatedSong = {
      ...localSongs[songIdx],
      title: title || localSongs[songIdx].title,
      artist: artist !== undefined ? artist : localSongs[songIdx].artist,
      desc: desc !== undefined ? desc : localSongs[songIdx].desc,
      genre: genre !== undefined ? genre : localSongs[songIdx].genre,
      mood: mood !== undefined ? mood : localSongs[songIdx].mood,
      soundUrl: soundUrl || localSongs[songIdx].soundUrl,
      coverUrl: coverUrl !== undefined ? coverUrl : localSongs[songIdx].coverUrl,
      lyrics: lyrics !== undefined ? lyrics : localSongs[songIdx].lyrics,
      visible: visible !== undefined ? !!visible : localSongs[songIdx].visible,
      ownerPick: ownerPick !== undefined ? !!ownerPick : localSongs[songIdx].ownerPick
    };

    localSongs[songIdx] = updatedSong;
    writeJsonFile(songsJsonPath, localSongs);

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query(
        'UPDATE music_songs SET title = ?, artist = ?, "desc" = ?, genre = ?, mood = ?, sound_url = ?, cover_url = ?, lyrics = ?, visible = ?, owner_pick = ? WHERE id = ?',
        [
          updatedSong.title,
          updatedSong.artist,
          updatedSong.desc,
          updatedSong.genre,
          updatedSong.mood,
          updatedSong.soundUrl,
          updatedSong.coverUrl,
          updatedSong.lyrics,
          updatedSong.visible ? 1 : 0,
          updatedSong.ownerPick ? 1 : 0,
          id
        ]
      );
    }

    return res.json({ success: true, message: 'BGM 정보가 수정되었습니다.', song: updatedSong });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/music/songs/:id (삭제)
router.delete('/api/music/songs/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: '유효한 ID가 아닙니다.' });
  }

  try {
    const localSongs = readJsonFile<any[]>(songsJsonPath, []);
    const filtered = localSongs.filter(s => s.id !== id);
    writeJsonFile(songsJsonPath, filtered);

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query('DELETE FROM music_songs WHERE id = ?', [id]);
    }

    return res.json({ success: true, message: 'BGM 카드가 삭제되었습니다.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/music/songs/reorder (순서 정렬)
router.put('/api/music/songs/reorder', async (req, res) => {
  const { reorderedIds } = req.body;
  if (!Array.isArray(reorderedIds)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 순서 배열입니다.' });
  }

  try {
    const localSongs = readJsonFile<any[]>(songsJsonPath, []);
    
    // Sort local songs based on reorderedIds
    const sorted = [...localSongs].sort((a, b) => {
      const idxA = reorderedIds.indexOf(a.id);
      const idxB = reorderedIds.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    // Assign new orderIndex
    sorted.forEach((song, index) => {
      song.orderIndex = index + 1;
    });

    writeJsonFile(songsJsonPath, sorted);

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      for (const song of sorted) {
        await dbPool.query('UPDATE music_songs SET order_index = ? WHERE id = ?', [song.orderIndex, song.id]);
      }
    }

    return res.json({ success: true, message: 'BGM 정렬 순서가 저장되었습니다.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/music/songs/:id/toggle-visibility (노출 여부 토글)
router.put('/api/music/songs/:id/toggle-visibility', async (req, res) => {
  const id = Number(req.params.id);
  const { visible } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: '유효한 ID가 아닙니다.' });
  }

  try {
    const localSongs = readJsonFile<any[]>(songsJsonPath, []);
    const song = localSongs.find(s => s.id === id);
    if (song) {
      song.visible = !!visible;
      writeJsonFile(songsJsonPath, localSongs);
    }

    const dbPool = await getDbPool();
    if (!dbPool.isFallback) {
      await dbPool.query('UPDATE music_songs SET visible = ? WHERE id = ?', [visible ? 1 : 0, id]);
    }

    return res.json({ success: true, message: '노출 상태가 토글되었습니다.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/music/songs/like (좋아요 기능)
router.post('/api/music/songs/like', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: '곡 ID가 유효하지 않습니다.' });
  }

  try {
    const localSongs = readJsonFile<any[]>(songsJsonPath, []);
    const song = localSongs.find(s => s.id === Number(id));
    if (song) {
      song.likesCount = (song.likesCount || 0) + 1;
      writeJsonFile(songsJsonPath, localSongs);
    }
    return res.json({ success: true, message: '좋아요 반영 완료' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Sub routers mount
router.use(coversRouter);
router.use(communityRouter);

export default router;
