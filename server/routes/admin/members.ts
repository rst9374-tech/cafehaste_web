import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { 
  getDbPool, 
  supabase, 
  readBackupLicenses, 
  writeBackupLicenses, 
  readBackupDb, 
  writeBackupDb, 
  storeVerifyCache 
} from '../../database';
import { updateMemberDetails } from './members_helpers';

const router = Router();

// 2. Fetch registered users from Cloud SQL
router.get('/api/registered-members', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query('SELECT * FROM web_membership_users ORDER BY id DESC');
    
    const mappedRows = rows.map((row: any) => ({
      id: `DB-HST-${row.id}`,
      storeName: row.store_name,
      storeCode: row.store_code || '',
      ownerName: row.owner_name,
      phone: row.phone,
      email: row.email,
      address: row.address || '',
      content: row.content || '',
      joinDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      joinDateTime: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      approvalStatus: row.approval_status || '요청',
      storeType: row.store_type || '일반',
      businessNumber: row.business_number || '',
      businessCertPath: row.business_cert_path || '',
      signupPath: row.signup_path || '맴버십가입신청',
      source: 'CLOUD_SQL'
    }));

    res.json({
      success: true,
      count: mappedRows.length,
      members: mappedRows
    });
  } catch (err: any) {
    console.error('[API error] Fetch failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Cloud SQL에서 회원 데이터를 가져올 수 없습니다.'
    });
  }
});

// Update member approval status and/or store type in Cloud SQL
router.put('/api/registered-members/:id', async (req, res) => {
  const { id } = req.params;
  const numericId = id.replace('DB-HST-', '');

  try {
    await updateMemberDetails(numericId, req.body);
    console.log(`[API success] Updated member #${numericId} via helper`);
    res.json({
      success: true,
      message: '회원 데이터가 성공적으로 변경되었습니다.'
    });
  } catch (err: any) {
    console.error('[API error] Update member failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Cloud SQL에서 회원 데이터를 업데이트하지 못했습니다.'
    });
  }
});

// Delete member in Cloud SQL / Local backup
router.delete('/api/registered-members/:id', async (req, res) => {
  const { id } = req.params;
  const numericId = id.replace('DB-HST-', '');

  try {
    const dbPool = await getDbPool();
    
    try {
      const [rows]: any = await dbPool.query(
        'SELECT business_cert_path FROM web_membership_users WHERE id = ?',
        [numericId]
      );
      
      if (rows && rows.length > 0) {
        const certPath = rows[0].business_cert_path;
        if (certPath && certPath !== '없음' && typeof certPath === 'string') {
          const cleanPath = certPath.replace(/^\//, '');
          const fullPath = path.join(process.cwd(), cleanPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`[File System delete] Successfully deleted business certificate file on disk: ${fullPath}`);
          }
        }
      }
    } catch (getFileErr) {
      console.warn('[Warning] Failed to query or delete associated business certification file from disk:', getFileErr);
    }

    await dbPool.query(
      'DELETE FROM web_membership_users WHERE id = ?',
      [numericId]
    );

    console.log(`[API success] Deleted member #${numericId}`);
    res.json({
      success: true,
      message: '성공적으로 회원 데이터와 첨부파일이 영구 삭제되었습니다.'
    });
  } catch (err: any) {
    console.error('[API error] Delete member failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Cloud SQL에서 회원 데이터를 삭제하지 못했습니다.'
    });
  }
});

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

// [1회의 JOIN 효과] 통합 마스터 Bulk API 엔드포인트
router.get('/api/admin-master-bulk', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    let members: any[] = [];
    let licenses: any[] = [];

    if (dbPool.isFallback) {
      const bMembers = readBackupDb();
      const bLicenses = readBackupLicenses();
      members = bMembers.map((row: any) => ({
        id: `DB-HST-${row.id}`,
        storeName: row.store_name || row.storeName,
        storeCode: row.store_code || row.storeCode || '',
        ownerName: row.owner_name || row.ownerName,
        phone: row.phone,
        email: row.email,
        address: row.address || '',
        content: row.content || '',
        joinDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : (row.joinDate || new Date().toISOString().split('T')[0]),
        joinDateTime: row.created_at ? new Date(row.created_at).toISOString() : (row.joinDateTime || new Date().toISOString()),
        approvalStatus: row.approval_status || row.approvalStatus || '요청',
        storeType: row.store_type || row.storeType || '일반',
        businessNumber: row.business_number || row.businessNumber || '',
        businessCertPath: row.business_cert_path || row.businessCertPath || '',
        signupPath: row.signup_path || row.signupPath || '맴버십가입신청',
        source: 'LOCAL_SIM'
      }));
      licenses = bLicenses.map((r: any) => ({
        id: r.id,
        storeName: r.storeName || r.store_name,
        storeId: r.storeId || r.store_id,
        licenseStartDate: r.licenseStartDate || r.license_start_date || '',
        licenseEndDate: r.licenseEndDate || r.license_end_date || '',
        isApproved: r.isApproved !== undefined ? Number(r.isApproved) : (r.is_approved !== undefined ? Number(r.is_approved) : 1),
        storeGrade: r.storeGrade || r.store_grade || 'PREMIUM'
      }));
    } else {
      // 30개 커넥션 극소 활용을 위해 쿼리 즉시 동시 비동기 수행 후 connection 즉시 반환
      const [membRows]: any = await dbPool.query('SELECT * FROM web_membership_users ORDER BY id DESC');
      const [licRows]: any = await dbPool.query('SELECT id, store_name, store_id, license_start_date, license_end_date, is_approved, store_grade FROM web_store_licenses ORDER BY id DESC');

      members = membRows.map((row: any) => ({
        id: `DB-HST-${row.id}`,
        storeName: row.store_name,
        storeCode: row.store_code || '',
        ownerName: row.owner_name,
        phone: row.phone,
        email: row.email,
        address: row.address || '',
        content: row.content || '',
        joinDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        joinDateTime: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        approvalStatus: row.approval_status || '요청',
        storeType: row.store_type || '일반',
        businessNumber: row.business_number || '',
        businessCertPath: row.business_cert_path || '',
        signupPath: row.signup_path || '맴버십가입신청',
        source: 'CLOUD_SQL'
      }));

      licenses = licRows.map((r: any) => ({
        id: r.id,
        storeName: r.store_name,
        storeId: r.store_id,
        licenseStartDate: r.license_start_date ? new Date(r.license_start_date).toISOString().split('T')[0] : '',
        licenseEndDate: r.license_end_date ? new Date(r.license_end_date).toISOString().split('T')[0] : '',
        isApproved: r.is_approved !== undefined ? Number(r.is_approved) : 1,
        storeGrade: r.store_grade || 'PREMIUM'
      }));
    }

    res.json({
      success: true,
      count: members.length,
      members,
      licenses
    });
  } catch (err: any) {
    console.error('[API error] Bulk Master API failed:', err);
    res.status(500).json({ success: false, error: err.message, message: '통합 데이터를 조회하지 못했습니다.' });
  }
});

// [실시간 제어 및 초경량 캐시 버스터 연동] 라이선스 신속 토글 API
router.post('/api/licenses/quick-toggle', async (req, res) => {
  const { memberId, action, months } = req.body;
  if (!memberId || !action) {
    return res.status(400).json({ success: false, message: '회원 식별ID와 동작정보는 필수값입니다.' });
  }

  try {
    const dbPool = await getDbPool();
    let targetStoreCode = '';
    let targetStoreName = '없음';

    let targetStoreType = '일반';

    // 1. 회원 찾기
    if (dbPool.isFallback) {
      const bMembers = readBackupDb();
      const found = bMembers.find((m: any) => m.id === memberId || `HST-M${m.id}` === memberId || `DB-HST-${m.id}` === memberId);
      if (found) {
        targetStoreCode = found.storeCode || '';
        targetStoreName = found.storeName || '없음';
        targetStoreType = found.storeType || '일반';
      }
    } else {
      const numericId = memberId.replace('DB-HST-', '');
      const [mRows]: any = await dbPool.query('SELECT store_code, store_name, store_type FROM web_membership_users WHERE id = ? LIMIT 1', [numericId]);
      if (mRows && mRows.length > 0) {
        targetStoreCode = mRows[0].store_code || '';
        targetStoreName = mRows[0].store_name || '없음';
        targetStoreType = mRows[0].store_type || '일반';
      }
    }

    const finalStoreId = targetStoreCode ? targetStoreCode.trim() : `없음_${memberId}`;
    const targetApproved = action === 'APPROVE' ? 1 : 0; // 1: 정상인증, 0: 가동정지
    const targetStoreGrade = (targetStoreType === '프리미엄' || targetStoreType === 'premium') ? 'PREMIUM' : 'STANDARD';

    let updateLicense: any = null;

    // 대기·요청 처리용 날짜 산출 (KST 보정)
    const today = new Date();
    const kstToday = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    const startDateStr = kstToday.toISOString().split('T')[0];

    const monthsToSet = months || 12;
    const endKst = new Date(kstToday.getTime());
    endKst.setMonth(endKst.getMonth() + monthsToSet);
    const endDateStr = endKst.toISOString().split('T')[0];

    if (dbPool.isFallback) {
      const bLicenses = readBackupLicenses();
      let licItem = bLicenses.find((l: any) => l.storeId === finalStoreId);

      if (!licItem) {
        // 새로 생성
        const newId = bLicenses.length > 0 ? Math.max(...bLicenses.map((item: any) => item.id)) + 1 : 1;
        licItem = {
          id: newId,
          storeName: targetStoreName,
          storeId: finalStoreId,
          licenseStartDate: startDateStr,
          licenseEndDate: endDateStr,
          isApproved: targetApproved,
          storeGrade: targetStoreGrade
        };
        bLicenses.unshift(licItem);
      } else {
        licItem.isApproved = targetApproved;
        if (action === 'APPROVE') {
          if (months !== undefined) {
            licItem.licenseStartDate = startDateStr;
            licItem.licenseEndDate = endDateStr;
          } else {
            const isNotExpired = new Date(licItem.licenseEndDate).getTime() >= new Date().getTime();
            if (!isNotExpired || licItem.licenseStartDate === '1970-01-01') {
              licItem.licenseStartDate = startDateStr;
              licItem.licenseEndDate = endDateStr;
            }
          }
        }
      }
      writeBackupLicenses(bLicenses);
      updateLicense = licItem;
    } else {
      const [lRows]: any = await dbPool.query('SELECT * FROM web_store_licenses WHERE store_id = ? LIMIT 1', [finalStoreId]);
      
      if (lRows.length === 0) {
        // 신규 발급
        const [insRes]: any = await dbPool.query(
          'INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade) VALUES (?, ?, ?, ?, ?, ?)',
          [targetStoreName, finalStoreId, startDateStr, endDateStr, targetApproved === 1, targetStoreGrade]
        );
        updateLicense = {
          id: insRes.insertId,
          storeName: targetStoreName,
          storeId: finalStoreId,
          licenseStartDate: startDateStr,
          licenseEndDate: endDateStr,
          isApproved: targetApproved,
          storeGrade: targetStoreGrade
        };
      } else {
        const existing = lRows[0];
        let start = existing.license_start_date ? new Date(existing.license_start_date).toISOString().split('T')[0] : startDateStr;
        let end = existing.license_end_date ? new Date(existing.license_end_date).toISOString().split('T')[0] : endDateStr;
        
        if (action === 'APPROVE') {
          if (months !== undefined) {
            start = startDateStr;
            end = endDateStr;
          } else {
            const isNotExpired = new Date(end).getTime() >= new Date().getTime();
            if (!isNotExpired || start === '1970-01-01') {
              start = startDateStr;
              end = endDateStr;
            }
          }
        }

        await dbPool.query(
          'UPDATE web_store_licenses SET is_approved = ?, license_start_date = ?, license_end_date = ? WHERE store_id = ?',
          [targetApproved === 1, start, end, finalStoreId]
        );

        updateLicense = {
          id: existing.id,
          storeName: existing.store_name,
          storeId: finalStoreId,
          licenseStartDate: start,
          licenseEndDate: end,
          isApproved: targetApproved,
          storeGrade: existing.store_grade || 'PREMIUM'
        };
      }
    }

    // [캐시 버스트 실천] 전산 검증 캐시 유닛에서 해당 매장의 ID를 즉시 찾아 폭파시킴
    delete storeVerifyCache[finalStoreId];
    console.log(`[Cache Bust Target Success] Outlaw store verification cache destroyed for: "${finalStoreId}"`);

    res.json({
      success: true,
      message: action === 'APPROVE' ? '라이선스가 성공적으로 정상인증 승인처리 되었습니다.' : '라이선스가 즉시 가동정지 소거 차단되었습니다.',
      license: updateLicense
    });
  } catch (err: any) {
    console.error('[API error] Quick toggle status failed:', err);
    res.status(500).json({ success: false, error: err.message, message: '실시간 제어 토글 중 에러가 발생했습니다.' });
  }
});

export default router;
