import { Router } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { getDbPool, isCloudSqlConnected, readBackupConsultations, writeBackupConsultations, supabase, readBackupDb, writeBackupDb } from '../../database';

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

// 1. Members Login API
router.post('/api/login', async (req, res) => {
  const { storeCode, password } = req.body;
  if (!storeCode || !password) {
    return res.status(400).json({ success: false, message: '매장고유번호와 비밀번호를 모두 입력해 주세요.' });
  }

  try {
    const dbPool = await getDbPool();
    let user: any = null;

    if (storeCode) {
      const trimmed = storeCode.trim();
      const candidates = [trimmed];
      if (/^[0-9]+$/.test(trimmed)) {
        candidates.push(`store${trimmed}`);
        candidates.push(`storex${trimmed}`);
      }

      for (const candidate of candidates) {
        const [rows]: any = await dbPool.query(
          'SELECT * FROM web_membership_users WHERE store_code = ? LIMIT 1',
          [candidate]
        );
        if (rows && rows.length > 0) {
          user = rows[0];
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: '가입되지 않은 매장고유번호이거나 매장 정보가 일치하지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.' });
    }

    const sessionUser = {
      id: user.id,
      storeName: user.store_name || user.storeName,
      storeCode: user.store_code || user.storeCode,
      ownerName: user.owner_name || user.ownerName,
      phone: user.phone,
      email: user.email,
      address: user.address,
      approvalStatus: user.approval_status || user.approvalStatus,
      storeType: user.store_type || user.storeType,
      businessNumber: user.business_number || user.businessNumber,
      businessCertPath: user.business_cert_path || user.businessCertPath,
      agreementDocumentUrl: user.agreement_document_url || user.agreementDocumentUrl || '',
      agreement_document_url: user.agreement_document_url || user.agreementDocumentUrl || '',
      role: user.role || 'USER'
    };

    return res.json({
      success: true,
      message: `${user.owner_name} 점주님, 카페헤이스트 공식 플랫폼에 로그인되었습니다.`,
      user: sessionUser
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: '서버 인증 장애: ' + err.message });
  }
});

// 2. Member Franchise Core Signup with Transactional Rollback
async function handleUserRegistration(req: any, res: any) {
  const {
    storeName,
    storeCode,
    ownerName,
    phone,
    email,
    password,
    address,
    content,
    storeType,
    businessNumber,
    businessCertBase64,
    businessCertName,
    signupPath
  } = req.body;

  if (!ownerName || !phone || !email || !storeName || !storeCode || !password || !address || !businessNumber || !businessCertBase64) {
    return res.status(400).json({ success: false, message: '가입을 위한 모든 필수 항목(사업자등록증 첨부 포함)이 누락되었습니다.' });
  }

  // 데이터 형식 정규식 검증 (실제: store[숫자], 테스트: storex[숫자] 형식 검증)
  const isStoreCodeValid = /^(store|storex)[0-9]+$/.test(storeCode);
  if (!isStoreCodeValid || !/^[0-9]+$/.test(phone) || !/^[0-9]+$/.test(businessNumber) || businessNumber.length !== 10) {
    return res.status(400).json({ success: false, message: '매장 코드, 연락처, 사업자번호의 숫자 규격이 올바르지 않습니다.' });
  }

  const finalStoreCode = storeCode || 'store' + Math.floor(1000 + Math.random() * 9000);
  const finalStoreName = storeName || `${ownerName}_신규가맹`;
  const type = storeType || '멤버십';
  const finalBizNumber = businessNumber || '없음';
  const status = '요청';

  let businessCertPath = '없음';
  let uploadedFilenameToRollback = '';

  if (businessCertBase64) {
    try {
      const timestamp = getFormattedTimestamp();
      const actualCertName = businessCertName || `cert_${finalStoreCode}.jpg`;
      const ext = path.extname(actualCertName) || '.png';
      
      // Enforce immutable business cert path schema: member_certs/cert_[store_code]_[timestamp].[ext]
      const uniqueFilename = `member_certs/cert_${finalStoreCode.toLowerCase()}_${timestamp}${ext}`;
      const matches = businessCertBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let fileBuffer: Buffer;
      let mime = 'image/png';

      if (matches && matches.length === 3) {
        mime = matches[1];
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else {
        fileBuffer = Buffer.from(businessCertBase64, 'base64');
      }

      uploadedFilenameToRollback = uniqueFilename;

      const { error } = await supabase.storage.from('cafehaste-bucket').upload(uniqueFilename, fileBuffer, {
        contentType: mime,
        upsert: true
      });

      if (error) {
        throw new Error('Supabase Storage Error: ' + error.message);
      }

      businessCertPath = `https://fuzhdcsdfblwcgwfylsx.supabase.co/storage/v1/object/public/cafehaste-bucket/${uniqueFilename}`;
    } catch (saveErr: any) {
      console.error('[Cert Upload Error]', saveErr);
      return res.status(500).json({ success: false, message: '사업자등록증 파일 업로드 실패: ' + saveErr.message });
    }
  }

  try {
    const dbPool = await getDbPool();
    const [existing]: any = await dbPool.query('SELECT id FROM web_membership_users WHERE store_code = ? OR email = ?', [finalStoreCode, email]);

    if (existing && existing.length > 0) {
      // Rollback uploaded file before returning duplicate entry block
      if (uploadedFilenameToRollback) {
        await supabase.storage.from('cafehaste-bucket').remove([uploadedFilenameToRollback]);
      }
      return res.status(400).json({ success: false, message: '이미 등록된 매장코드 혹은 이메일 주소입니다.' });
    }

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const [insertResult]: any = await dbPool.query(
      'INSERT INTO web_membership_users (store_name, store_code, owner_name, phone, email, address, content, approval_status, store_type, business_number, business_cert_path, signup_path, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [finalStoreName, finalStoreCode, ownerName, phone, email, address, content || '', status, type, finalBizNumber, businessCertPath, signupPath || '맴버십가입신청', hashedPassword, 'USER']
    );

    const insertedId = insertResult ? (insertResult.insertId || (insertResult[0] && insertResult[0].id)) : null;

    return res.json({ 
      success: true, 
      message: '가맹점 정식 멤버십 가입 신청서 작성이 안전하게 접수되었습니다!',
      data: { id: insertedId || finalStoreCode }
    });
  } catch (err: any) {
    console.error('Registration/Database write failed:', err);
    // Dynamic Storage Transactional rollback rule 11
    if (uploadedFilenameToRollback) {
      try {
        await supabase.storage.from('cafehaste-bucket').remove([uploadedFilenameToRollback]);
        console.log('[Rollback Success] Unlinked certificate upload from storage due to DB insertion failure.');
      } catch (rollErr: any) {
        console.error('[Rollback Error] Failed to unlink storage path:', rollErr);
      }
    }
    return res.status(500).json({ success: false, message: '서버 등록 오류: ' + err.message });
  }
}

router.post('/api/register', handleUserRegistration);
router.post('/api/owner-registrations', handleUserRegistration);

// 3. Online Consultations Form Submission API
router.post('/api/consultations', async (req, res) => {
  const { regionName, ownerName, phone, email, capital, hasStore, inquiryPath, content, signupPath } = req.body;
  if (!ownerName || !phone || !email || !regionName || !capital || !inquiryPath || !content) {
    return res.status(400).json({ success: false, message: '창업 문의를 위한 모든 필수 항목을 입력해 주세요.' });
  }

  if (!/^[0-9]+$/.test(phone) || !/^[0-9]+$/.test(capital)) {
    return res.status(400).json({ success: false, message: '연락처 및 자본금은 숫자 형식만 입력 가능합니다.' });
  }

  try {
    const dbPool = await getDbPool();
    let insertedId: any = null;
    
    if (dbPool.isFallback) {
      const list = readBackupConsultations();
      const newId = list.length > 0 ? Math.max(...list.map((c: any) => c.id || 0)) + 1 : 1;
      const newC = {
        id: newId,
        region_name: regionName || '미지정',
        owner_name: ownerName,
        phone,
        email,
        capital: capital || '',
        has_store: hasStore || '없음',
        inquiry_path: inquiryPath || '',
        content: content || '',
        approval_status: '요청',
        signup_path: signupPath || '창업문의',
        created_at: new Date().toISOString()
      };
      list.push(newC);
      writeBackupConsultations(list);
      insertedId = newId;
    } else {
      const [insertResult]: any = await dbPool.query(
        'INSERT INTO web_membership_consultations (region_name, owner_name, phone, email, capital, has_store, inquiry_path, content, approval_status, signup_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [regionName || '미정', ownerName, phone, email, capital || '', hasStore || '없음', inquiryPath || '', content || '', '요청', signupPath || '창업문의']
      );
      insertedId = insertResult ? (insertResult.insertId || (insertResult[0] && insertResult[0].id)) : null;
    }

    return res.json({ 
      success: true, 
      message: '신규 오프라인 가맹 지원/문의 사항이 성공적으로 입수되었습니다.',
      data: { id: insertedId || Date.now() }
    });
  } catch (err: any) {
    console.error('Consultation insert error:', err);
    return res.status(500).json({ success: false, message: '문의 접수 실패: ' + err.message });
  }
});

// 4. Database Connection Integrity Status API
router.get('/api/db-status', async (req, res) => {
  try {
    const isCloudConnected = isCloudSqlConnected;
    const dbPool = await getDbPool();

    res.json({
      success: true,
      status: isCloudConnected ? 'CONNECTED' : 'DISCONNECTED',
      mode: dbPool.isFallback ? 'LOCAL_JSON_EMULATOR' : 'SUPABASE_DIRECT_POSTGRES',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      error: err.message
    });
  }
});

// 5. Change Password API for Merchants
router.post('/api/membership/change-password', async (req, res) => {
  const { storeCode, currentPassword, newPassword } = req.body;
  if (!storeCode || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '현재 비밀번호와 새 비밀번호를 모두 기재해주세요.' });
  }

  try {
    const dbPool = await getDbPool();
    let user: any = null;

    const trimmed = storeCode.trim();
    const candidates = [trimmed];
    if (/^[0-9]+$/.test(trimmed)) {
      candidates.push(`store${trimmed}`);
      candidates.push(`storex${trimmed}`);
    }

    if (dbPool.isFallback) {
      const list = readBackupDb();
      let idx = -1;
      for (const candidate of candidates) {
        idx = list.findIndex((item: any) => (item.storeCode || item.store_code || '').trim() === candidate);
        if (idx !== -1) break;
      }
      if (idx === -1) {
        return res.status(404).json({ success: false, message: '가입된 점주 정보를 찾을 수 없습니다.' });
      }
      user = list[idx];

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      list[idx].password = hashedPassword;
      writeBackupDb(list);
    } else {
      let rows: any[] = [];
      for (const candidate of candidates) {
        const [candidateRows]: any = await dbPool.query(
          'SELECT * FROM web_membership_users WHERE store_code = ? LIMIT 1',
          [candidate]
        );
        if (candidateRows && candidateRows.length > 0) {
          rows = candidateRows;
          user = rows[0];
          break;
        }
      }
      if (!user) {
        return res.status(404).json({ success: false, message: '가입된 점주 정보를 찾을 수 없습니다.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await dbPool.query(
        'UPDATE web_membership_users SET password = ? WHERE store_code = ?',
        [hashedPassword, user.store_code]
      );
    }

    return res.json({ success: true, message: '비밀번호가 정상적으로 변경되었습니다.' });
  } catch (err: any) {
    console.error('Password change error:', err);
    return res.status(500).json({ success: false, message: '서버 에러: ' + err.message });
  }
});

// 6. Bulk Test Accounts Creation API (50 random status accounts)
router.post('/api/owner-registrations/bulk-test', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1234', salt);

    const count = Math.min(Math.max(parseInt(req.body.count || req.query.count || 50, 10), 1), 1000);
    const startId = Math.floor(1000 + Math.random() * 9000);
    const statuses = ['인증 완료', '인증 대기', '가동 정지중'];
    
    let localMembers = [];
    let localLicenses = [];

    // 로컬 JSON 백업 파일 경로 로드
    const membersFile = path.join(process.cwd(), 'local_members.json');
    const licensesFile = path.join(process.cwd(), 'local_licenses.json');

    if (fs.existsSync(membersFile)) {
      localMembers = JSON.parse(fs.readFileSync(membersFile, 'utf8'));
    }
    if (fs.existsSync(licensesFile)) {
      localLicenses = JSON.parse(fs.readFileSync(licensesFile, 'utf8'));
    }

    let nextMemberId = localMembers.length > 0 ? Math.max(...localMembers.map((m) => m.id)) + 1 : 1;
    let nextLicenseId = localLicenses.length > 0 ? Math.max(...localLicenses.map((l) => l.id)) + 1 : 1;

    const insertedMembers = [];
    const insertedLicenses = [];

    for (let i = 0; i < count; i++) {
      const num = startId + i;
      const storeCode = `store${num}`;
      const storeName = `테스트헤이스트 ${num}호점`;
      const ownerName = `테스트점주 ${num}`;
      
      // 랜덤 인증 상태 배분
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // 라이선스 승인 여부 매핑
      let isApprovedVal = true;
      if (randomStatus === '인증 대기' || randomStatus === '가동 정지중') {
        isApprovedVal = false;
      }

      // 만료 여부도 랜덤으로 10% 비율로 적용
      const isExpired = Math.random() < 0.1;
      const startDate = isExpired ? '2026-05-01' : '2026-06-01';
      const endDate = isExpired ? '2026-06-01' : '2026-07-01';

      const memberItem = {
        id: nextMemberId++,
        storeName,
        storeCode,
        ownerName,
        phone: `0109999${num}`,
        email: `test_${num}@haste.cafe`,
        address: `서울시 마포구 창전동 테스트 ${num}길`,
        content: `자동 생성된 테스트 계정 (번호: ${num})`,
        approvalStatus: randomStatus,
        storeType: '멤버십',
        businessNumber: `12345${num}`,
        businessCertPath: '없음',
        signupPath: '멤버십가입신청',
        joinDate: '2026-06-06',
        createdAt: new Date().toISOString(),
        password: hashedPassword,
        signup_path: '멤버십가입신청',
        store_type: '멤버십',
        business_number: `12345${num}`,
        business_cert_path: '없음',
        store_code: storeCode
      };

      const licenseItem = {
        id: nextLicenseId++,
        storeName,
        storeId: storeCode,
        licenseStartDate: startDate,
        licenseEndDate: endDate,
        isApproved: isApprovedVal,
        storeGrade: 'PREMIUM',
        password: '1234'
      };

      insertedMembers.push(memberItem);
      insertedLicenses.push(licenseItem);

      // 실 Supabase DB에도 동기화 인서트
      if (!dbPool.isFallback) {
        try {
          await dbPool.query(
            'INSERT INTO web_membership_users (store_name, store_code, owner_name, phone, email, address, content, approval_status, store_type, business_number, business_cert_path, signup_path, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [storeName, storeCode, ownerName, memberItem.phone, memberItem.email, memberItem.address, memberItem.content, randomStatus, '멤버십', memberItem.business_number, '없음', '멤버십가입신청', hashedPassword, 'USER']
          );
          
          await dbPool.query(
            'INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [storeName, storeCode, startDate, endDate, isApprovedVal, 'PREMIUM', '1234']
          );
        } catch (dbErr) {
          console.error(`DB Insert failed for ${storeCode}:`, dbErr.message);
        }
      }
    }

    // 로컬 JSON 파일에 동기화 저장
    fs.writeFileSync(membersFile, JSON.stringify([...localMembers, ...insertedMembers], null, 2), 'utf8');
    fs.writeFileSync(licensesFile, JSON.stringify([...localLicenses, ...insertedLicenses], null, 2), 'utf8');

    // 메모리 캐시 무효화
    const { dbCache } = require('../../database');
    dbCache.members = null;
    dbCache.licenses = null;

    return res.json({ 
      success: true, 
      message: `랜덤 인증 상태를 가진 ${count}개의 테스트 계정이 일괄 정상 주입되었습니다!` 
    });
  } catch (err) {
    console.error('Bulk test seeding failed:', err);
    return res.status(500).json({ success: false, error: err.message, message: '테스트 계정 생성 실패' });
  }
});

// GET user profile to sync session details in frontend
router.get('/api/user-profile/:storeCode', async (req, res) => {
  const { storeCode } = req.params;
  try {
    const dbPool = await getDbPool();
    let user: any = null;

    if (dbPool.isFallback) {
      const bMembers = readBackupDb();
      user = bMembers.find((m: any) => m.storeCode === storeCode || m.store_code === storeCode);
    } else {
      const [rows]: any = await dbPool.query(
        'SELECT * FROM web_membership_users WHERE store_code = ? LIMIT 1',
        [storeCode]
      );
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    const sessionUser = {
      id: user.id,
      storeName: user.store_name || user.storeName,
      storeCode: user.store_code || user.storeCode,
      ownerName: user.owner_name || user.ownerName,
      phone: user.phone,
      email: user.email,
      address: user.address,
      approvalStatus: user.approval_status || user.approvalStatus,
      storeType: user.store_type || user.storeType,
      businessNumber: user.business_number || user.businessNumber,
      businessCertPath: user.business_cert_path || user.businessCertPath,
      agreementDocumentUrl: user.agreement_document_url || user.agreementDocumentUrl || '',
      agreement_document_url: user.agreement_document_url || user.agreementDocumentUrl || '',
      role: user.role || 'USER'
    };

    return res.json({ success: true, user: sessionUser });
  } catch (err: any) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch total likes for a member
router.get('/api/members/:id/total-likes', async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);
  
  if (isNaN(numericId) || numericId <= 0) {
    return res.json({ success: true, totalLikes: 0 });
  }

  try {
    const dbPool = await getDbPool();
    // Count total likes given by this member
    const [rows]: any = await dbPool.query(
      'SELECT COUNT(*) as count FROM web_post_likes WHERE member_id = ?',
      [numericId]
    );
    const count = rows[0]?.count || 0;
    return res.json({ success: true, totalLikes: count });
  } catch (err: any) {
    console.error(`[API error] Failed to fetch total likes for member ${id}:`, err);
    // Return 0 gracefully to prevent frontend crashing
    return res.json({ success: true, totalLikes: 0 });
  }
});

export default router;
