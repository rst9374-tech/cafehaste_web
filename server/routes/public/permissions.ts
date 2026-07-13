import { Router } from 'express';
import { getDbPool } from '../../database';

const router = Router();

// 1. Get all grade-level permissions mapped to camelCase
router.get('/api/grade-permissions', async (req, res) => {
  let conn;
  try {
    const dbPool = await getDbPool();
    conn = await dbPool.getConnection();
    const [rows]: any = await conn.query('SELECT * FROM web_grade_permissions ORDER BY id ASC');
    
    // Map snake_case to camelCase
    const permissions = (rows || []).map((row: any) => ({
      id: row.id,
      gradeType: row.grade_type,
      categoryKey: row.category_key,
      canRead: row.can_read,
      canWrite: row.can_write,
      canList: row.can_list !== undefined ? row.can_list : 1
    }));

    return res.json({
      success: true,
      permissions
    });
  } catch (err: any) {
    console.error('Fetch grade permissions error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: '등급별 권한 목록 로드 중 오류가 발생했습니다.'
    });
  } finally {
    if (conn) conn.release();
  }
});

// 2. Update grade-level permissions
router.post('/api/grade-permissions/update', async (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 권한 데이터 형식입니다.' });
  }

  let conn;
  try {
    const dbPool = await getDbPool();
    conn = await dbPool.getConnection();

    // Clear existing permissions and bulk insert for simplicity and consistency
    await conn.query('DELETE FROM web_grade_permissions');

    for (const perm of permissions) {
      const gradeType = perm.gradeType || '일반';
      const categoryKey = perm.categoryKey || 'Q&A';
      const canRead = perm.canRead === 1 || perm.canRead === true ? 1 : 0;
      const canWrite = perm.canWrite === 1 || perm.canWrite === true ? 1 : 0;
      const canList = perm.canList === 1 || perm.canList === true ? 1 : 0;

      await conn.query(
        'INSERT INTO web_grade_permissions (grade_type, category_key, can_read, can_write, can_list) VALUES (?, ?, ?, ?, ?)',
        [gradeType, categoryKey, canRead, canWrite, canList]
      );
    }

    return res.json({
      success: true,
      message: '등급별 권한 설정이 성공적으로 저장되었습니다.'
    });
  } catch (err: any) {
    console.error('Update grade permissions error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: '권한 설정 반영 중 오류가 발생했습니다.'
    });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
