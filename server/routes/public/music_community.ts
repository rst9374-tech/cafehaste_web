import { Router } from 'express';
import { getDbPool } from '../../database';
import { commentsJsonPath, postsJsonPath, readJsonFile, writeJsonFile } from './music_helpers';

const router = Router();

// ==========================================
// 1. MUSIC COMMENTS API
// ==========================================

// GET /api/music/comments
router.get('/api/music/comments', async (req, res) => {
  const songId = Number(req.query.songId);
  if (isNaN(songId)) {
    return res.status(400).json({ success: false, message: '유효한 곡 ID가 아닙니다.' });
  }

  try {
    const dbPool = await getDbPool();
    let comments: any[] = [];

    if (dbPool.isFallback) {
      comments = readJsonFile<any[]>(commentsJsonPath, []);
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM music_comments WHERE song_id = ? ORDER BY id DESC', [songId]);
      comments = rows || [];
    }

    const filtered = comments
      .filter((c: any) => Number(c.song_id || c.songId) === songId)
      .map((c: any) => ({
        id: c.id,
        songId: Number(c.song_id || c.songId),
        storeName: c.store_name || c.storeName || '',
        ownerName: c.owner_name || c.ownerName || '',
        comment: c.comment || '',
        createdAt: c.created_at || c.createdAt || new Date().toISOString()
      }));

    return res.json({ success: true, comments: filtered });
  } catch (err: any) {
    console.warn('[BGM API Warning] Database read fails. Serving local backup comments:', err.message);
    const fallback = readJsonFile<any[]>(commentsJsonPath, [])
      .filter((c: any) => Number(c.songId) === songId);
    return res.json({ success: true, comments: fallback, error: err.message });
  }
});

// POST /api/music/comments
router.post('/api/music/comments', async (req, res) => {
  const { songId, storeName, ownerName, comment } = req.body;
  if (!songId || !storeName || !ownerName || !comment) {
    return res.status(400).json({ success: false, message: '필수 필드가 비어 있습니다.' });
  }

  try {
    const localComments = readJsonFile<any[]>(commentsJsonPath, []);
    const newId = localComments.length > 0 ? Math.max(...localComments.map(c => c.id)) + 1 : 1;
    const item = {
      id: newId,
      songId: Number(songId),
      storeName,
      ownerName,
      comment,
      createdAt: new Date().toISOString()
    };
    localComments.unshift(item);
    writeJsonFile(commentsJsonPath, localComments);

    return res.json({ success: true, message: '한 줄 평 피드백이 등록되었습니다.', comment: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. MUSIC POSTS API
// ==========================================

// GET /api/music/posts
router.get('/api/music/posts', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let posts: any[] = [];

    if (dbPool.isFallback) {
      posts = readJsonFile<any[]>(postsJsonPath, []);
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM music_posts ORDER BY id DESC');
      posts = rows || [];
    }

    const formatted = posts.map((p: any) => ({
      id: p.id,
      category: p.category || 'LOUNGE',
      title: p.title || '',
      content: p.content || '',
      storeName: p.store_name || p.storeName || '',
      ownerName: p.owner_name || p.ownerName || '',
      likesCount: Number(p.likes_count !== undefined ? p.likes_count : (p.likesCount || 0)),
      createdAt: p.created_at || p.createdAt || new Date().toISOString()
    }));

    return res.json({ success: true, posts: formatted });
  } catch (err: any) {
    console.warn('[BGM API Warning] Database read fails. Serving local backup posts:', err.message);
    const fallback = readJsonFile<any[]>(postsJsonPath, []);
    return res.json({ success: true, posts: fallback, error: err.message });
  }
});

// POST /api/music/posts
router.post('/api/music/posts', async (req, res) => {
  const { category, title, content, storeName, ownerName } = req.body;
  if (!title || !content || !storeName || !ownerName) {
    return res.status(400).json({ success: false, message: '필수 입력 항목이 누락되었습니다.' });
  }

  try {
    const localPosts = readJsonFile<any[]>(postsJsonPath, []);
    const newId = localPosts.length > 0 ? Math.max(...localPosts.map(p => p.id)) + 1 : 1;
    const item = {
      id: newId,
      category: category || 'LOUNGE',
      title,
      content,
      storeName,
      ownerName,
      likesCount: 0,
      createdAt: new Date().toISOString()
    };
    localPosts.unshift(item);
    writeJsonFile(postsJsonPath, localPosts);

    return res.json({ success: true, message: '게시글이 성공적으로 등록되었습니다.', post: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/music/posts/like
router.post('/api/music/posts/like', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: '게시글 ID가 유효하지 않습니다.' });
  }

  try {
    const localPosts = readJsonFile<any[]>(postsJsonPath, []);
    const post = localPosts.find(p => p.id === Number(id));
    if (post) {
      post.likesCount = (post.likesCount || 0) + 1;
      writeJsonFile(postsJsonPath, localPosts);
    }
    return res.json({ success: true, message: '추천 반영 완료' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
