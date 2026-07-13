import { Router } from 'express';
import { getDbPool } from '../../database';

const router = Router();

// 1. Fetch comments list
router.get('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const dbPool = await getDbPool();
    const [comments]: any = await dbPool.query(`
      SELECT C.*, M.store_name, M.owner_name, M.store_code
      FROM web_board_comments C
      LEFT JOIN web_membership_users M ON C.member_id = M.id
      WHERE C.post_id = ?
      ORDER BY C.created_at ASC
    `, [id]);
    
    return res.json({ success: true, comments });
  } catch (err: any) {
    console.error('Fetch comments error:', err);
    return res.status(500).json({ success: false, message: '댓글 집계 중 문제 유발되었습니다.' });
  }
});

// 2. Create comment
router.post('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { memberId, content } = req.body;
  
  if (!memberId || !content) {
    return res.status(400).json({ success: false, message: '수식어 또는 본문 내용이 공란입니다.' });
  }
  
  try {
    const dbPool = await getDbPool();
    await dbPool.query(
      'INSERT INTO web_board_comments (post_id, member_id, content) VALUES (?, ?, ?)',
      [id, memberId, content]
    );
    
    return res.json({ success: true, message: '소중한 답변/댓글 등록이 성공하였습니다.' });
  } catch (err: any) {
    console.error('Add comment error:', err);
    return res.status(500).json({ success: false, message: '댓글 추가 도중 통신 장애: ' + err.message });
  }
});

// 3. Delete comment
router.delete('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dbPool = await getDbPool();
    await dbPool.query('DELETE FROM web_board_comments WHERE id = ?', [id]);
    return res.json({ success: true, message: '댓글이 안전하게 차단/삭제되었습니다.' });
  } catch (err: any) {
    console.error('Delete comment error', err);
    return res.status(500).json({ success: false, message: '댓글 삭제 쿼리 고장: ' + err.message });
  }
});

export default router;
