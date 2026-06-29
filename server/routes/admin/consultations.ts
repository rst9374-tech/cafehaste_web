import { Router } from 'express';
import { getDbPool } from '../../database';

const router = Router();

// Fetch consultation enquiries from Cloud SQL
router.get('/api/consultations', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query('SELECT * FROM web_membership_consultations ORDER BY id DESC');
    
    const mappedRows = rows.map((row: any) => ({
      id: `DB-CNS-${row.id}`,
      regionName: row.region_name,
      ownerName: row.owner_name,
      phone: row.phone,
      email: row.email,
      capital: row.capital || '',
      hasStore: row.has_store || '없음',
      inquiryPath: row.inquiry_path || '',
      signupPath: row.signup_path || '창업문의',
      content: row.content || '',
      joinDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      joinDateTime: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      approvalStatus: row.approval_status || '요청',
      source: 'CLOUD_SQL'
    }));

    res.json({
      success: true,
      count: mappedRows.length,
      consultations: mappedRows
    });
  } catch (err: any) {
    console.error('[API error] Fetch consultations failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Cloud SQL에서 상담문의 데이터를 가져올 수 없습니다.'
    });
  }
});

// Update consultation approval status in Cloud SQL
router.put('/api/consultations/:id', async (req, res) => {
  const { id } = req.params;
  const { approval_status } = req.body;
  const numericId = id.replace('DB-CNS-', '');

  if (!approval_status) {
    return res.status(400).json({
      success: false,
      message: '업데이트할 인가 상태(approval_status)가 전달되지 않았습니다.'
    });
  }

  try {
    const dbPool = await getDbPool();
    await dbPool.query(
      'UPDATE web_membership_consultations SET approval_status = ? WHERE id = ?',
      [approval_status, numericId]
    );

    console.log(`[API success] Updated approval status of consultation #${numericId} to ${approval_status}`);
    res.json({
      success: true,
      message: '상담문의 인가 상태가 성공적으로 변경되었습니다.'
    });
  } catch (err: any) {
    console.error('[API error] Update consultation status failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Cloud SQL에서 상담문의 데이터를 업데이트하지 못했습니다.'
    });
  }
});

// Delete consultation in Cloud SQL
router.delete('/api/consultations/:id', async (req, res) => {
  const { id } = req.params;
  const numericId = id.replace('DB-CNS-', '');

  try {
    const dbPool = await getDbPool();
    await dbPool.query(
      'DELETE FROM web_membership_consultations WHERE id = ?',
      [numericId]
    );

    console.log(`[API success] Deleted consultation #${numericId}`);
    res.json({
      success: true,
      message: '성공적으로 상담문의 데이터가 영구 삭제되었습니다.'
    });
  } catch (err: any) {
    console.error('[API error] Delete consultation failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Cloud SQL에서 상담문의 데이터를 삭제하지 못했습니다.'
    });
  }
});

export default router;
