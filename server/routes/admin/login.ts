import { Router } from 'express';
import { getDbPool } from '../../database';

const router = Router();

// 1. Admin login authentication
router.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '아이디와 패스워드를 모두 입력해 주세요.'
    });
  }

  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query(
      'SELECT * FROM web_admin_accounts WHERE username = ?',
      [username]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '존재하지 않는 관리자 아이디입니다.'
      });
    }

    const adminUser = rows[0];

    if (adminUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 올바르지 않습니다.'
      });
    }

    return res.json({
      success: true,
      message: '관리자 계정 인증에 성공했습니다.',
      admin: {
        id: adminUser.id,
        username: adminUser.username
      }
    });
  } catch (err: any) {
    console.error('[API Admin Login Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: '관리자 검증 도중 오류가 발생했습니다. DB 설정을 확인해 주세요.'
    });
  }
});

export default router;
