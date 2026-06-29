import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { getDbPool, supabase } from '../../database';

const router = Router();

function getFormattedTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

export async function saveBase64File(
  base64Data: string, 
  originalName: string, 
  boardName: string = 'general', 
  categoryId: string = 'ATT_HST'
): Promise<{ storedName: string; filePath: string }> {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let fileBuffer: Buffer;
  let ext = path.extname(originalName) || '.png';
  let mimeType = 'image/png';
  let cleanBase64 = base64Data;
  
  if (matches && matches.length === 3) {
    mimeType = matches[1];
    cleanBase64 = matches[2];
    fileBuffer = Buffer.from(cleanBase64, 'base64');
  } else {
    fileBuffer = Buffer.from(base64Data, 'base64');
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
  }
  
  const sanitizedBoard = boardName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const sanitizedCategory = categoryId.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  
  const timestamp = getFormattedTimestamp();
  const extWithoutDot = ext.replace('.', '').toLowerCase();
  
  // Immutable Format: [board_name]/[Category_Unique_ID]_[YYYYMMDD_HHMMSS].[extension]
  const storedName = `${sanitizedCategory}_${timestamp}.${extWithoutDot}`;
  const fullPathInBucket = `${sanitizedBoard}/${storedName}`;
  
  const { error } = await supabase.storage.from('cafehaste-bucket').upload(fullPathInBucket, fileBuffer, {
    contentType: mimeType,
    upsert: true
  });

  if (error) {
    throw new Error('Supabase Storage Error: ' + error.message);
  }

  const supabaseUrl = (process.env.SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co').trim();
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${fullPathInBucket}`;
  console.log(`[Attachment Upload] Successfully saved to Supabase Storage: ${fullPathInBucket}`);

  return {
    storedName: fullPathInBucket,
    filePath: publicUrl
  };
}

// 1. Fetch posts with search and pagination support
router.get('/api/posts', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const offset = (page - 1) * limit;
  const searchKwd = req.query.keyword as string || '';
  const category = req.query.category as string || '';
  const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : null;
  
  try {
    const dbPool = await getDbPool();
    let queryStr = '';
    let queryParams: any[] = [];
    let countQuery = '';
    let countParams: any[] = [];

    if (!category && !searchKwd) {
      // 카테고리/검색어가 없는 전체 목록 조회 시 각 카테고리별 최대 100개 제한 적용 (CTE 윈도우 함수 사용)
      queryStr = `
        WITH RankedPosts AS (
          SELECT P.*, 
                 COALESCE(M.store_name, KM.store_name, P.writer_name) as store_name, 
                 COALESCE(M.owner_name, KM.owner_name) as owner_name, 
                 COALESCE(M.store_code, KM.store_code) as store_code,
                 (SELECT COUNT(*) FROM web_board_comments WHERE post_id = P.id) as comment_count,
                 (SELECT COUNT(*) FROM web_board_attachments WHERE post_id = P.id) as attachment_count,
                 (SELECT file_path FROM web_board_attachments WHERE post_id = P.id ORDER BY id ASC LIMIT 1) as first_attachment_path,
                 (SELECT original_name FROM web_board_attachments WHERE post_id = P.id ORDER BY id ASC LIMIT 1) as first_attachment_name,
                 CASE WHEN ? IS NULL THEN 0 ELSE (SELECT COUNT(*) FROM web_post_likes WHERE post_id = P.id AND member_id = ?) END as liked,
                 ROW_NUMBER() OVER (PARTITION BY P.category ORDER BY P.is_notice DESC, P.created_at DESC) as category_rank
          FROM web_board_posts P
          LEFT JOIN web_membership_users M ON P.member_id = M.id
          LEFT JOIN web_kakao_members KM ON P.member_id = KM.id
          WHERE P.title NOT LIKE '%테스트%'
            AND P.title NOT LIKE '%test%'
            AND P.title NOT LIKE '%Test%'
            AND P.category NOT LIKE '%테스트%'
            AND P.category NOT LIKE '%test%'
            AND P.category NOT LIKE '%Test%'
        )
        SELECT * FROM RankedPosts
        WHERE category_rank <= 100
        ORDER BY is_notice DESC, category ASC, created_at DESC
        LIMIT ? OFFSET ?
      `;
      queryParams = [memberId, memberId, limit, offset];

      countQuery = `
        WITH RankedCounts AS (
          SELECT P.id, P.category,
                 ROW_NUMBER() OVER (PARTITION BY P.category ORDER BY P.id DESC) as category_rank
          FROM web_board_posts P
          WHERE P.title NOT LIKE '%테스트%'
            AND P.title NOT LIKE '%test%'
            AND P.title NOT LIKE '%Test%'
            AND P.category NOT LIKE '%테스트%'
            AND P.category NOT LIKE '%test%'
            AND P.category NOT LIKE '%Test%'
        )
        SELECT COUNT(*) as total FROM RankedCounts WHERE category_rank <= 100
      `;
      countParams = [];
    } else {
      // 카테고리 필터링이 있거나 검색어가 있는 경우 제한 없이 노출
      queryStr = `
        SELECT P.*, 
               COALESCE(M.store_name, KM.store_name, P.writer_name) as store_name, 
               COALESCE(M.owner_name, KM.owner_name) as owner_name, 
               COALESCE(M.store_code, KM.store_code) as store_code,
               (SELECT COUNT(*) FROM web_board_comments WHERE post_id = P.id) as comment_count,
               (SELECT COUNT(*) FROM web_board_attachments WHERE post_id = P.id) as attachment_count,
               (SELECT file_path FROM web_board_attachments WHERE post_id = P.id ORDER BY id ASC LIMIT 1) as first_attachment_path,
               (SELECT original_name FROM web_board_attachments WHERE post_id = P.id ORDER BY id ASC LIMIT 1) as first_attachment_name,
               CASE WHEN ? IS NULL THEN 0 ELSE (SELECT COUNT(*) FROM web_post_likes WHERE post_id = P.id AND member_id = ?) END as liked
        FROM web_board_posts P
        LEFT JOIN web_membership_users M ON P.member_id = M.id
        LEFT JOIN web_kakao_members KM ON P.member_id = KM.id
      `;
      queryParams = [memberId, memberId];
      let whereClauses: string[] = [];
      
      if (searchKwd) {
        whereClauses.push(`P.title LIKE ?`);
        queryParams.push(`%${searchKwd}%`);
      }
      
      if (category) {
        whereClauses.push(`P.category = ?`);
        queryParams.push(category);
      }
      
      if (whereClauses.length > 0) {
        queryStr += ` WHERE ` + whereClauses.join(' AND ');
      }
      
      queryStr += ` ORDER BY P.is_notice DESC, P.created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      countQuery = `
        SELECT COUNT(*) as total 
        FROM web_board_posts P 
        LEFT JOIN web_membership_users M ON P.member_id = M.id
        LEFT JOIN web_kakao_members KM ON P.member_id = KM.id
      `;
      countParams = [];
      if (whereClauses.length > 0) {
        let countWhereClauses: string[] = [];
        if (searchKwd) {
          countWhereClauses.push(`P.title LIKE ?`);
          countParams.push(`%${searchKwd}%`);
        }
        if (category) {
          countWhereClauses.push(`P.category = ?`);
          countParams.push(category);
        }
        countQuery += ` WHERE ` + countWhereClauses.join(' AND ');
      }
    }

    const [posts]: any = await dbPool.query(queryStr, queryParams);
    const [totalRows]: any = await dbPool.query(countQuery, countParams);
    const total = totalRows[0]?.total || 0;
    
    return res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('Fetch posts error:', err);
    return res.status(500).json({ success: false, message: '게시글 목록 로드 중 오류: ' + err.message });
  }
});

// 2. Fetch single post details with attachments
router.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : null;
  try {
    const dbPool = await getDbPool();
    await dbPool.query('UPDATE web_board_posts SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    const [rows]: any = await dbPool.query(`
      SELECT P.*, 
             COALESCE(M.store_name, KM.store_name, P.writer_name) as store_name, 
             COALESCE(M.owner_name, KM.owner_name) as owner_name, 
             COALESCE(M.store_code, KM.store_code) as store_code,
             CASE WHEN ? IS NULL THEN 0 ELSE (SELECT COUNT(*) FROM web_post_likes WHERE post_id = P.id AND member_id = ?) END as liked
      FROM web_board_posts P
      LEFT JOIN web_membership_users M ON P.member_id = M.id
      LEFT JOIN web_kakao_members KM ON P.member_id = KM.id
      WHERE P.id = ?
    `, [memberId, memberId, id]);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: '존재하지 않는 게시글입니다.' });
    }
    
    const post = rows[0];
    const [attachments]: any = await dbPool.query('SELECT * FROM web_board_attachments WHERE post_id = ?', [id]);
    
    return res.json({
      success: true,
      post,
      attachments
    });
  } catch (err: any) {
    console.error('Fetch post detail error:', err);
    return res.status(500).json({ success: false, message: '게시글 상세 로드 중 오류: ' + err.message });
  }
});

// 3. Post creation API with file attachment transactional rollbacks
router.post('/api/posts', async (req, res) => {
  const { memberId, title, content, isSecret, files, category } = req.body;
  
  if (!memberId || !title || !content) {
    return res.status(400).json({ success: false, message: '필수 항목(작성자, 제목, 내용)이 유실되었습니다.' });
  }
  
  const uploadedUrlsToRollback: string[] = [];
  try {
    const dbPool = await getDbPool();
    let approvalStatus = '';
    const [mRows]: any = await dbPool.query('SELECT approval_status FROM web_membership_users WHERE id = ?', [memberId]);
    if (mRows && mRows.length > 0) {
      approvalStatus = mRows[0].approval_status;
    } else {
      // Check kakao member
      const [kRows]: any = await dbPool.query('SELECT approval_status FROM web_kakao_members WHERE id = ?', [memberId]);
      if (kRows && kRows.length > 0) {
        approvalStatus = kRows[0].approval_status;
      }
    }

    if (!approvalStatus) {
      return res.status(403).json({ success: false, message: '유효하지 않은 계정 정보입니다.' });
    }
    
    if (approvalStatus !== '승인' && approvalStatus !== '인증 완료') {
      return res.status(403).json({ success: false, message: '승인 완료된 정식 본사 제휴 회원만 고객게시글 작성이 가능합니다.' });
    }
    
    const [result]: any = await dbPool.query(
      'INSERT INTO web_board_posts (member_id, title, content, is_secret, category) VALUES (?, ?, ?, ?, ?)',
      [memberId, title, content, !!isSecret, category || 'Q&A']
    );
    const postId = result.insertId;
    
    if (files && Array.isArray(files) && files.length > 0) {
      const bName = (category || 'Q&A').toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const file of files) {
        if (file.base64 && file.name) {
          const saved = await saveBase64File(file.base64, file.name, bName, 'ATT_HST');
          uploadedUrlsToRollback.push(saved.storedName);
          const fileSize = Buffer.byteLength(file.base64, 'base64');
          
          await dbPool.query(
            'INSERT INTO web_board_attachments (post_id, original_name, stored_name, file_path, file_size) VALUES (?, ?, ?, ?, ?)',
            [postId, file.name, saved.storedName, saved.filePath, fileSize]
          );
        }
      }
    }
    
    return res.json({ success: true, message: '성공적으로 게시글이 게시되었습니다.', postId });
  } catch (err: any) {
    console.error('Write post error:', err);
    // Rollback uploaded files to preserve clean bucket structure
    if (uploadedUrlsToRollback.length > 0) {
      try {
        await supabase.storage.from('cafehaste-bucket').remove(uploadedUrlsToRollback);
        console.log('[Rollback Success] Removed orphan attachments from bucket:', uploadedUrlsToRollback);
      } catch (rollErr: any) {
        console.error('[Rollback Failure] Failed to remove orphan attachments:', rollErr);
      }
    }
    return res.status(500).json({ success: false, message: '게시글 저장 중 서버 내부 결함: ' + err.message });
  }
});

// 4. Update post details
router.put('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, isSecret, files, deletedFileIds, category } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ success: false, message: '수정할 제목 및 내용을 확인해주세요.' });
  }
  
  const uploadedUrlsToRollback: string[] = [];
  try {
    const dbPool = await getDbPool();
    await dbPool.query(
      'UPDATE web_board_posts SET title = ?, content = ?, is_secret = ?, category = ? WHERE id = ?',
      [title, content, !!isSecret, category || 'Q&A', id]
    );
    
    if (deletedFileIds && Array.isArray(deletedFileIds) && deletedFileIds.length > 0) {
      for (const dId of deletedFileIds) {
        const [attRows]: any = await dbPool.query('SELECT stored_name FROM web_board_attachments WHERE id = ?', [dId]);
        if (attRows && attRows[0] && attRows[0].stored_name) {
          try {
            await supabase.storage.from('cafehaste-bucket').remove([attRows[0].stored_name]);
          } catch (_) {}
        }
        await dbPool.query('DELETE FROM web_board_attachments WHERE id = ?', [dId]);
      }
    }
    
    if (files && Array.isArray(files) && files.length > 0) {
      const bName = (category || 'Q&A').toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const file of files) {
        if (file.base64 && file.name) {
          const saved = await saveBase64File(file.base64, file.name, bName, 'ATT_HST');
          uploadedUrlsToRollback.push(saved.storedName);
          const fileSize = Buffer.byteLength(file.base64, 'base64');
          
          await dbPool.query(
            'INSERT INTO web_board_attachments (post_id, original_name, stored_name, file_path, file_size) VALUES (?, ?, ?, ?, ?)',
            [id, file.name, saved.storedName, saved.filePath, fileSize]
          );
        }
      }
    }
    
    return res.json({ success: true, message: '성공적으로 게시글을 갱신하였습니다.' });
  } catch (err: any) {
    console.error('Update post error:', err);
    if (uploadedUrlsToRollback.length > 0) {
      try {
        await supabase.storage.from('cafehaste-bucket').remove(uploadedUrlsToRollback);
      } catch (_) {}
    }
    return res.status(500).json({ success: false, message: '게시글 상세 정보 반영 실패: ' + err.message });
  }
});

// 5. Delete post completely
router.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dbPool = await getDbPool();
    const [attachments]: any = await dbPool.query('SELECT stored_name FROM web_board_attachments WHERE post_id = ?', [id]);
    
    const filesToDelete = attachments
      .map((att: any) => att.stored_name)
      .filter((name: any) => !!name);
      
    if (filesToDelete.length > 0) {
      try {
        await supabase.storage.from('cafehaste-bucket').remove(filesToDelete);
      } catch (_) {}
    }
    
    await dbPool.query('DELETE FROM web_board_attachments WHERE post_id = ?', [id]);
    await dbPool.query('DELETE FROM web_board_comments WHERE post_id = ?', [id]);
    await dbPool.query('DELETE FROM web_board_posts WHERE id = ?', [id]);
    
    return res.json({ success: true, message: '해당 게시글이 정리되었습니다.' });
  } catch (err: any) {
    console.error('Delete post error:', err);
    return res.status(500).json({ success: false, message: '글 삭제 도중 예외가 야기되었습니다: ' + err.message });
  }
});

// 5.5 Bulk delete posts
router.post('/api/posts/bulk-delete', async (req, res) => {
  const { postIds } = req.body;
  if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
    return res.status(400).json({ success: false, message: '삭제할 게시글 ID 목록이 필요합니다.' });
  }

  try {
    const dbPool = await getDbPool();
    
    // Fetch all attachments for these posts to delete from storage
    const [attachments]: any = await dbPool.query(
      'SELECT stored_name FROM web_board_attachments WHERE post_id IN (?)',
      [postIds]
    );
    
    const filesToDelete = attachments
      .map((att: any) => att.stored_name)
      .filter((name: any) => !!name);
      
    if (filesToDelete.length > 0) {
      try {
        await supabase.storage.from('cafehaste-bucket').remove(filesToDelete);
        console.log('[Bulk Delete] Removed attachments from storage:', filesToDelete);
      } catch (err) {
        console.error('[Bulk Delete Warning] Failed to remove files from storage:', err);
      }
    }
    
    // Delete DB records
    await dbPool.query('DELETE FROM web_board_attachments WHERE post_id IN (?)', [postIds]);
    await dbPool.query('DELETE FROM web_board_comments WHERE post_id IN (?)', [postIds]);
    await dbPool.query('DELETE FROM web_board_posts WHERE id IN (?)', [postIds]);
    
    return res.json({ success: true, message: '선택한 게시글들이 성공적으로 삭제되었습니다.' });
  } catch (err: any) {
    console.error('Bulk delete posts error:', err);
    return res.status(500).json({ success: false, message: '선택 삭제 처리 중 오류가 발생했습니다: ' + err.message });
  }
});

// 6. Toggle post like
router.post('/api/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;
  if (!memberId) {
    return res.status(400).json({ success: false, message: '회원 정보가 필요합니다.' });
  }
  try {
    const dbPool = await getDbPool();
    // 이미 좋아요를 눌렀는지 확인
    const [likes]: any = await dbPool.query(
      'SELECT id FROM web_post_likes WHERE post_id = ? AND member_id = ?',
      [id, memberId]
    );
    let liked = false;
    if (likes && likes.length > 0) {
      // 좋아요 취소
      await dbPool.query('DELETE FROM web_post_likes WHERE post_id = ? AND member_id = ?', [id, memberId]);
      await dbPool.query('UPDATE web_board_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = ?', [id]);
    } else {
      // 좋아요 추가
      await dbPool.query('INSERT INTO web_post_likes (post_id, member_id) VALUES (?, ?)', [id, memberId]);
      await dbPool.query('UPDATE web_board_posts SET like_count = like_count + 1 WHERE id = ?', [id]);
      liked = true;
    }
    const [postRows]: any = await dbPool.query('SELECT like_count FROM web_board_posts WHERE id = ?', [id]);
    const likeCount = postRows[0]?.like_count || 0;
    return res.json({ success: true, liked, likeCount });
  } catch (err: any) {
    console.error('Toggle like error:', err);
    return res.status(500).json({ success: false, message: '좋아요 처리 중 오류: ' + err.message });
  }
});

// 7. Delete single attachment completely from DB and Storage
router.delete('/api/attachments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dbPool = await getDbPool();
    // 1. Find the attachment stored_name
    const [attRows]: any = await dbPool.query('SELECT stored_name FROM web_board_attachments WHERE id = ?', [id]);
    if (!attRows || attRows.length === 0) {
      return res.status(404).json({ success: false, message: '존재하지 않는 첨부파일입니다.' });
    }
    
    const storedName = attRows[0].stored_name;
    
    // 2. Delete from Supabase Storage
    if (storedName) {
      try {
        const { error } = await supabase.storage.from('cafehaste-bucket').remove([storedName]);
        if (error) {
          console.warn('[Storage delete Warning] Failed to delete file from bucket:', error.message);
        } else {
          console.log(`[Storage delete Success] Removed file from bucket: ${storedName}`);
        }
      } catch (storageErr: any) {
        console.warn('[Storage delete Warning] Failed to delete file from bucket:', storageErr.message);
      }
      
      // Also delete from local disk to keep local files synchronized
      const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
      const EXTERNAL_DIR = path.join(process.cwd(), 'external_uploads');
      const localPath1 = path.join(UPLOADS_DIR, storedName);
      const localPath2 = path.join(EXTERNAL_DIR, storedName);
      
      if (fs.existsSync(localPath1)) {
        try {
          fs.unlinkSync(localPath1);
        } catch (e) {}
      }
      if (fs.existsSync(localPath2)) {
        try {
          fs.unlinkSync(localPath2);
        } catch (e) {}
      }
    }
    
    // 3. Delete from DB
    await dbPool.query('DELETE FROM web_board_attachments WHERE id = ?', [id]);
    
    return res.json({ success: true, message: '첨부파일이 성공적으로 삭제되었습니다.' });
  } catch (err: any) {
    console.error('Delete attachment error:', err);
    return res.status(500).json({ success: false, message: '첨부파일 삭제 도중 예외가 발생했습니다: ' + err.message });
  }
});

export default router;
