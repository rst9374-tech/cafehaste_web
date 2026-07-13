import { Router } from 'express';
import { 
  getDbPool, 
  readBackupPermissions, 
  writeBackupPermissions,
  dbCache
} from '../../database';

const router = Router();

// GET /api/grade-permissions - 등급별 게시판 권한 조회
router.get('/api/grade-permissions', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    if (dbPool.isFallback) {
      const perms = readBackupPermissions();
      // Ensure camelCase fields are mapped
      const mapped = perms.map((p: any) => ({
        id: p.id,
        gradeType: p.gradeType || p.grade_type,
        categoryKey: p.categoryKey || p.category_key,
        canRead: p.canRead !== undefined ? Number(p.canRead) : Number(p.can_read),
        canWrite: p.canWrite !== undefined ? Number(p.canWrite) : Number(p.can_write),
        canList: p.canList !== undefined ? Number(p.canList) : (p.can_list !== undefined ? Number(p.can_list) : 1)
      }));
      return res.json({ success: true, permissions: mapped });
    } else {
      const [rows]: any = await dbPool.query(
        'SELECT id, grade_type, category_key, can_read, can_write, can_list FROM web_grade_permissions ORDER BY id ASC'
      );
      const mapped = rows.map((r: any) => ({
        id: r.id,
        gradeType: r.grade_type,
        categoryKey: r.category_key,
        canRead: Number(r.can_read),
        canWrite: Number(r.can_write),
        canList: r.can_list !== undefined ? Number(r.can_list) : 1
      }));
      res.json({ success: true, permissions: mapped });
    }
  } catch (err: any) {
    console.error('[API error] Fetch grade permissions failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/grade-permissions/update - 등급별 게시판 권한 일괄 업데이트
router.post('/api/grade-permissions/update', async (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ success: false, message: '권한 설정 데이터가 올바르지 않습니다.' });
  }

  try {
    const dbPool = await getDbPool();
    
    // In-memory cache bust
    dbCache.gradePermissions = null;

    if (dbPool.isFallback) {
      const mapped = permissions.map((p: any, idx: number) => ({
        id: idx + 1,
        gradeType: p.gradeType,
        grade_type: p.gradeType,
        categoryKey: p.categoryKey,
        category_key: p.categoryKey,
        canRead: p.canRead ? 1 : 0,
        can_read: p.canRead ? 1 : 0,
        canWrite: p.canWrite ? 1 : 0,
        can_write: p.canWrite ? 1 : 0,
        canList: p.canList ? 1 : 0,
        can_list: p.canList ? 1 : 0
      }));
      writeBackupPermissions(mapped);
      
      // Global cache invalidation trigger
      if (typeof (global as any).flushPublicReadCache === 'function') {
        (global as any).flushPublicReadCache();
      }

      return res.json({ success: true, message: '등급 권한 설정이 성공적으로 저장되었습니다.' });
    } else {
      const conn = await dbPool.getConnection();
      try {
        // Safe cross-platform overwrite strategy: Truncate/Delete then Insert
        await conn.query('DELETE FROM web_grade_permissions');
        
        for (const perm of permissions) {
          const gType = perm.gradeType;
          const cKey = perm.categoryKey;
          const readVal = perm.canRead ? 1 : 0;
          const writeVal = perm.canWrite ? 1 : 0;
          const listVal = perm.canList ? 1 : 0;
          
          await conn.query(
            'INSERT INTO web_grade_permissions (grade_type, category_key, can_read, can_write, can_list) VALUES (?, ?, ?, ?, ?)',
            [gType, cKey, readVal, writeVal, listVal]
          );
        }
        
        // Global cache invalidation trigger
        if (typeof (global as any).flushPublicReadCache === 'function') {
          (global as any).flushPublicReadCache();
        }

        res.json({ success: true, message: '등급 권한 설정이 성공적으로 저장되었습니다.' });
      } finally {
        // CRITICAL: release connection immediately to avoid pool exhaustion
        conn.release();
      }
    }
  } catch (err: any) {
    console.error('[API error] Update grade permissions failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
