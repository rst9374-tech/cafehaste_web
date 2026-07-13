import { Router } from 'express';
import { 
  getDbPool, 
  readBackupLicenses, 
  writeBackupLicenses, 
  verifyApiLogs, 
  clearVerifyApiLogs,
  getAvailableLogDays,
  storeVerifyCache,
  getKstTimeInfo,
  flushPendingLogs,
  getLogStatusType
} from '../../database';
import { getDbSize } from '../../db/size_util';
import path from 'path';
import fs from 'fs';

const router = Router();

router.get('/api/db-info', async (req, res) => {
  try {
    const size = await getDbSize();
    res.json({ success: true, sizeMb: size });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/licenses', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    if (dbPool.isFallback) {
      return res.json({ success: true, count: readBackupLicenses().length, licenses: readBackupLicenses() });
    } else {
      const [rows]: any = await dbPool.query('SELECT id, store_name, store_id, license_start_date, license_end_date, is_approved, store_grade, password FROM web_store_licenses ORDER BY id DESC');
      const mapped = rows.map((r: any) => ({
        id: r.id,
        storeName: r.store_name,
        storeId: r.store_id,
        licenseStartDate: r.license_start_date ? new Date(r.license_start_date).toISOString().split('T')[0] : '',
        licenseEndDate: r.license_end_date ? new Date(r.license_end_date).toISOString().split('T')[0] : '',
        isApproved: r.is_approved ? 1 : 0,
        storeGrade: r.store_grade || 'PREMIUM',
        password: r.password || ''
      }));
      res.json({ success: true, count: mapped.length, licenses: mapped });
    }
  } catch (err: any) {
    console.error('[API error] Fetch licenses failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/licenses', async (req, res) => {
  const { storeName, storeId, licenseStartDate, licenseEndDate, isApproved, storeGrade, password } = req.body;
  if (!storeName || !storeId || !licenseStartDate || !licenseEndDate) {
    return res.status(400).json({ success: false, message: '매장명, 매장고유번호, 시작일, 종료일은 필수값입니다.' });
  }
  try {
    const dbPool = await getDbPool();
    const approvedVal = isApproved !== undefined ? (isApproved === true || isApproved === 1 || String(isApproved) === 'true') : true;
    const grade = storeGrade || 'PREMIUM';
    const pwdVal = password || '';

    if (dbPool.isFallback) {
      const list = readBackupLicenses();
      if (list.some((item: any) => item.storeId === storeId)) {
        return res.status(400).json({ success: false, message: '이미 존재하는 매장 고유번호입니다.' });
      }
      const newId = list.length > 0 ? Math.max(...list.map((item: any) => item.id)) + 1 : 1;
      const newItem = {
        id: newId,
        storeName,
        storeId,
        licenseStartDate,
        licenseEndDate,
        isApproved: approvedVal ? 1 : 0,
        storeGrade: grade,
        password: pwdVal
      };
      list.unshift(newItem);
      writeBackupLicenses(list);
      delete storeVerifyCache[storeId];
      return res.json({ success: true, message: '라이선스가 등록되었습니다.', license: newItem });
    } else {
      const [exRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM web_store_licenses WHERE store_id = ?', [storeId]);
      if (exRows[0]?.count > 0) {
        return res.status(400).json({ success: false, message: '이미 존재하는 매장 고유번호입니다.' });
      }
      const [result]: any = await dbPool.query(
        'INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [storeName, storeId, licenseStartDate, licenseEndDate, approvedVal, grade, pwdVal]
      );
      delete storeVerifyCache[storeId];
      res.json({
        success: true,
        message: '라이선스가 등록되었습니다.',
        license: {
          id: result.insertId,
          storeName,
          storeId,
          licenseStartDate,
          licenseEndDate,
          isApproved: approvedVal ? 1 : 0,
          storeGrade: grade,
          password: pwdVal
        }
      });
    }
  } catch (err: any) {
    console.error('[API error] Create license failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/licenses/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { storeName, storeId, licenseStartDate, licenseEndDate, isApproved, storeGrade, password } = req.body;
  if (!storeName || !storeId || !licenseStartDate || !licenseEndDate) {
    return res.status(400).json({ success: false, message: '매장명, 매장고유번호, 시작일, 종료일은 필수값입니다.' });
  }
  try {
    const dbPool = await getDbPool();
    const approvedVal = isApproved !== undefined ? (isApproved === true || isApproved === 1 || String(isApproved) === 'true') : true;
    const grade = storeGrade || 'PREMIUM';
    const pwdVal = password || '';

    // Old store ID lookup for cache busting
    let oldStoreId: string | null = null;
    let oldPassword = '';
    try {
      if (dbPool.isFallback) {
        const list = readBackupLicenses();
        const oldItem = list.find((item: any) => item.id === id);
        if (oldItem) {
          oldStoreId = oldItem.storeId;
          oldPassword = oldItem.password || '';
        }
      } else {
        const [rows]: any = await dbPool.query('SELECT store_id, password FROM web_store_licenses WHERE id = ? LIMIT 1', [id]);
        if (rows && rows.length > 0) {
          oldStoreId = rows[0].store_id;
          oldPassword = rows[0].password || '';
        }
      }
    } catch (e) {
      console.error('[Cache Bust Lookup Error]', e);
    }

    const finalPassword = password !== undefined ? pwdVal : oldPassword;

    if (dbPool.isFallback) {
      const list = readBackupLicenses();
      const idx = list.findIndex((item: any) => item.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: '대상을 찾을 수 없습니다.' });
      }
      if (list.some((item: any) => item.storeId === storeId && item.id !== id)) {
        return res.status(400).json({ success: false, message: '이미 존재하는 다른 매장 고유번호입니다.' });
      }
      list[idx] = {
        id,
        storeName,
        storeId,
        licenseStartDate,
        licenseEndDate,
        isApproved: approvedVal ? 1 : 0,
        storeGrade: grade,
        password: finalPassword
      };
      writeBackupLicenses(list);
      
      if (oldStoreId) delete storeVerifyCache[oldStoreId];
      if (storeId) delete storeVerifyCache[storeId];
      console.log(`[Cache Bust Success] Invalidated oldStoreId: "${oldStoreId}", newStoreId: "${storeId}"`);

      return res.json({ success: true, message: '라이선스 정보가 정상 업데이트되었습니다.', license: list[idx] });
    } else {
      const [exRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM web_store_licenses WHERE store_id = ? AND id != ?', [storeId, id]);
      if (exRows[0]?.count > 0) {
        return res.status(400).json({ success: false, message: '이미 존재하는 다른 매장 고유번호입니다.' });
      }
      await dbPool.query(
        'UPDATE web_store_licenses SET store_name=?, store_id=?, license_start_date=?, license_end_date=?, is_approved=?, store_grade=?, password=? WHERE id=?',
        [storeName, storeId, licenseStartDate, licenseEndDate, approvedVal, grade, finalPassword, id]
      );

      if (oldStoreId) delete storeVerifyCache[oldStoreId];
      if (storeId) delete storeVerifyCache[storeId];
      console.log(`[Cache Bust Success] Invalidated oldStoreId: "${oldStoreId}", newStoreId: "${storeId}"`);

      res.json({
        success: true,
        message: '라이선스 정보가 정상 업데이트되었습니다.',
        license: {
          id,
          storeName,
          storeId,
          licenseStartDate,
          licenseEndDate,
          isApproved: approvedVal ? 1 : 0,
          storeGrade: grade,
          password: finalPassword
        }
      });
    }
  } catch (err: any) {
    console.error('[API error] Update license failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/licenses/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const dbPool = await getDbPool();

    // Old store ID lookup for cache busting
    let storeIdToBust: string | null = null;
    try {
      if (dbPool.isFallback) {
        const list = readBackupLicenses();
        const oldItem = list.find((item: any) => item.id === id);
        if (oldItem) storeIdToBust = oldItem.storeId;
      } else {
        const [rows]: any = await dbPool.query('SELECT store_id FROM web_store_licenses WHERE id = ? LIMIT 1', [id]);
        if (rows && rows.length > 0) {
          storeIdToBust = rows[0].store_id;
        }
      }
    } catch (e) {
      console.error('[Cache Bust Lookup Error]', e);
    }

    if (dbPool.isFallback) {
      const list = readBackupLicenses();
      const filtered = list.filter((item: any) => item.id !== id);
      writeBackupLicenses(filtered);

      if (storeIdToBust) {
        delete storeVerifyCache[storeIdToBust];
        console.log(`[Cache Bust Success] Deleted storeVerifyCache for storeId: "${storeIdToBust}"`);
      }

      res.json({ success: true, message: '라이선스가 삭제되었습니다.', deletedId: id });
    } else {
      await dbPool.query('DELETE FROM web_store_licenses WHERE id = ?', [id]);

      if (storeIdToBust) {
        delete storeVerifyCache[storeIdToBust];
        console.log(`[Cache Bust Success] Deleted storeVerifyCache for storeId: "${storeIdToBust}"`);
      }

      res.json({ success: true, message: '라이선스가 삭제되었습니다.', deletedId: id });
    }
  } catch (err: any) {
    console.error('[API error] Delete license failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/db-status', (req, res) => {
  res.json({ success: true, host: process.env.DB_HOST || 'internal' });
});

export default router;
