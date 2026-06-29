import { Router } from 'express';
import { 
  getDbPool, 
  readBackupDb, 
  writeBackupDb, 
  readBackupLicenses, 
  writeBackupLicenses,
  storeVerifyCache,
  dbCache
} from '../../database';

const router = Router();

// Helper to calculate extended license date based on months selected (6, 12 months with buffers, or 1 month)
function getExtendedLicenseDate(months: number = 1, date: Date = new Date()): { startStr: string; endStr: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const startStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const mValue = Number(months || 1);
  // 12 months = 15 days buffer, 6 months = 7 days buffer, 1 month = 0 days buffer
  const bufferDays = mValue === 12 ? 15 : (mValue === 1 ? 0 : 7);
  
  const nextDate = new Date(year, month + mValue, day + bufferDays);
  const endYear = nextDate.getFullYear();
  const endMonth = nextDate.getMonth();
  const endDay = nextDate.getDate();
  const endStr = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
  
  return { startStr, endStr };
}

// POST /api/membership/subscribe - PortOne 결제 검증 및 라이선스 승인 연장
router.post('/api/membership/subscribe', async (req, res) => {
  const { impUid, merchantUid, storeCode, amount, months, documentUrl } = req.body;
  
  if (!storeCode) {
    return res.status(400).json({ success: false, message: '매장 코드가 누락되었습니다.' });
  }

  const impKey = process.env.PORTONE_IMP_KEY;
  const impSecret = process.env.PORTONE_IMP_SECRET;
  
  let isPaymentVerified = false;
  let verifiedAmount = Number(amount || 0);

  try {
    // 1. Perform actual PortOne verification if REST API credentials exist
    if (impKey && impSecret && impUid && impUid.startsWith('imp_')) {
      console.log(`[PortOne Verification] Verifying payment for impUid: ${impUid}...`);
      
      // Get Access Token
      const tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imp_key: impKey, imp_secret: impSecret })
      });
      
      const tokenData = await tokenRes.json();
      if (tokenRes.ok && tokenData.response?.access_token) {
        const accessToken = tokenData.response.access_token;
        
        // Get Payment details
        const paymentRes = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
          method: 'GET',
          headers: { 'Authorization': accessToken }
        });
        
        const paymentData = await paymentRes.json();
        if (paymentRes.ok && paymentData.response) {
          const { status, amount: apiAmount } = paymentData.response;
          if (status === 'paid' && Number(apiAmount) === Number(amount)) {
            isPaymentVerified = true;
            verifiedAmount = Number(apiAmount);
            console.log(`[PortOne Verification Success] Verified paid amount: ${apiAmount}`);
          } else {
            console.warn(`[PortOne Verification Failed] status: ${status}, expected amount: ${amount}, actual: ${apiAmount}`);
          }
        }
      }
    } else {
      // Sandbox Simulator Pass (If keys do not exist or test payment bypass triggered)
      console.log('[PortOne Sandbox Mode] Bypassing real PortOne HTTP handshake. Verifying sandbox transaction.');
      isPaymentVerified = true;
    }

    if (!isPaymentVerified) {
      return res.status(400).json({ 
        success: false, 
        message: '포트원 결제 검증에 실패했습니다. 결제 상태 혹은 금액이 일치하지 않습니다.' 
      });
    }

    // 2. Perform membership update & license extension
    const dbPool = await getDbPool();
    const targetMonths = Number(months || 1);
    const { startStr, endStr } = getExtendedLicenseDate(targetMonths);
    
    // In-memory caching invalidation
    delete storeVerifyCache[storeCode];
    dbCache.licenses = null;
    dbCache.members = null;

    if (dbPool.isFallback) {
      // Local JSON Fallback Update
      const members = readBackupDb();
      const memberIdx = members.findIndex((m: any) => (m.store_code || m.storeCode) === storeCode);
      let storeName = '헤이스트 매장';
      
      if (memberIdx !== -1) {
        members[memberIdx] = {
          ...members[memberIdx],
          approval_status: '인증 완료',
          approvalStatus: '인증 완료',
          agreement_document_url: documentUrl || '',
          agreementDocumentUrl: documentUrl || ''
        };
        storeName = members[memberIdx].store_name || members[memberIdx].storeName || storeName;
        writeBackupDb(members);
      }

      const licenses = readBackupLicenses();
      const licIdx = licenses.findIndex((l: any) => l.storeId === storeCode);
      const newLicenseKey = `HST-LIC-${storeCode.toUpperCase()}-${Math.floor(Math.random()*89999+10000)}`;

      if (licIdx !== -1) {
        licenses[licIdx] = {
          ...licenses[licIdx],
          licenseStartDate: startStr,
          licenseEndDate: endStr,
          isApproved: 1,
          agreementDocumentUrl: documentUrl || ''
        };
      } else {
        licenses.push({
          id: licenses.length > 0 ? Math.max(...licenses.map((l: any) => l.id || 0)) + 1 : 1,
          storeName,
          storeId: storeCode,
          licenseStartDate: startStr,
          licenseEndDate: endStr,
          isApproved: 1,
          storeGrade: 'PREMIUM',
          licenseKey: newLicenseKey,
          agreementDocumentUrl: documentUrl || ''
        });
      }
      writeBackupLicenses(licenses);

    } else {
      // Real Cloud Database Update
      // A. Update user approval status & agreement document URL
      await dbPool.query(
        "UPDATE web_membership_users SET approval_status = '인증 완료', agreement_document_url = ? WHERE store_code = ?",
        [documentUrl || null, storeCode]
      );


      // B. Fetch store name for license insertion
      const [userRows]: any = await dbPool.query(
        "SELECT store_name FROM web_membership_users WHERE store_code = ? LIMIT 1",
        [storeCode]
      );
      const storeName = userRows?.[0]?.store_name || '헤이스트 매장';

      // C. Update or insert license key (1 month validity)
      const [licenseRows]: any = await dbPool.query(
        "SELECT id FROM web_store_licenses WHERE store_id = ? LIMIT 1",
        [storeCode]
      );

      if (licenseRows && licenseRows.length > 0) {
        await dbPool.query(
          "UPDATE web_store_licenses SET license_start_date = ?, license_end_date = ?, is_approved = 1 WHERE store_id = ?",
          [startStr, endStr, storeCode]
        );
      } else {
        await dbPool.query(
          "INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade) VALUES (?, ?, ?, ?, 1, 'PREMIUM')",
          [storeName, storeCode, startStr, endStr]
        );
      }
    }

    // 3. Clear public caches
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    console.log(`[Subscription Complete] Extended license for store ${storeCode} until ${endStr}`);
    
    const labelDays = targetMonths === 12 ? 15 : (targetMonths === 1 ? 0 : 7);
    return res.json({ 
      success: true, 
      message: `성공적으로 신용카드 구독 결제 검증 및 ${targetMonths}개월${labelDays > 0 ? `(${labelDays}일 추가 연장)` : ''} 라이선스 연장 발급이 완료되었습니다!`,
      licenseEndDate: endStr
    });

  } catch (err: any) {
    console.error('[Subscribe API Error]', err);
    return res.status(500).json({ success: false, error: err.message, message: '서버 내부 결제 처리 연동 실패' });
  }
});

export default router;
