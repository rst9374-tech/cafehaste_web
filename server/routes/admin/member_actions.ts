import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getDbPool, readBackupConsultations, writeBackupConsultations, readBackupDb, writeBackupDb, readBackupLicenses, writeBackupLicenses } from '../../database';
import { updateMemberDetails } from './members_helpers';

const router = Router();

// 1. 창업상담신청서 -> 맴버 이동 후 삭제 API
router.post('/api/consultations/move-to-member', async (req, res) => {
  const { consultationId } = req.body;
  if (!consultationId) {
    return res.status(400).json({ success: false, message: '상담 신청서 ID가 누락되었습니다.' });
  }

  try {
    const dbPool = await getDbPool();
    let consultation: any = null;

    const numericId = Number(String(consultationId).replace('DB-CNS-', ''));
    if (isNaN(numericId)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 상담 신청서 ID 형식입니다.' });
    }

    if (dbPool.isFallback) {
      const backupConsultations = readBackupConsultations();
      consultation = backupConsultations.find((c: any) => c.id === numericId);
    } else {
      const [rows]: any = await dbPool.query('SELECT * FROM web_membership_consultations WHERE id = ? LIMIT 1', [numericId]);
      if (rows && rows.length > 0) {
        consultation = rows[0];
      }
    }

    if (!consultation) {
      return res.status(404).json({ success: false, message: '해당 상담 신청서를 찾을 수 없습니다.' });
    }

    // 신규 매장 코드 및 정보 합성
    const randomCode = 'store' + Math.floor(100000 + Math.random() * 900000);
    const newStoreName = consultation.company_name || `${consultation.owner_name || '신규'}점`;
    const finalStoreType = consultation.has_store === '있음' ? '프리미엄' : '일반';

    const phoneVal = (consultation.phone || '').trim();
    const hasPhone = phoneVal !== '' && phoneVal !== '없음' && phoneVal !== '기재 안 됨' && phoneVal !== '010-0000-0000';

    let insertedId: any = null;

    if (!hasPhone) {
      let nextId = 90000;

      // 1. nextId 결정 (90000대)
      if (dbPool.isFallback) {
        const localKakaoMembersFile = path.join(process.cwd(), 'local_kakao_members.json');
        let members = [];
        if (fs.existsSync(localKakaoMembersFile)) {
          try {
            members = JSON.parse(fs.readFileSync(localKakaoMembersFile, 'utf8'));
          } catch (_) {}
        }
        if (members.length > 0) {
          const maxVal = Math.max(...members.map((m: any) => m.id || 0));
          nextId = Math.max(90000, maxVal + 1);
        }
      } else {
        const [maxRows]: any = await dbPool.query('SELECT MAX(id) as maxId FROM web_kakao_members');
        if (maxRows && maxRows[0]) {
          const maxVal = maxRows[0].maxId ?? maxRows[0].maxid ?? maxRows[0].MAXID;
          if (maxVal !== null && maxVal !== undefined) {
            nextId = Math.max(90000, parseInt(String(maxVal), 10) + 1);
          }
        }
      }

      const storeCode = `KKT-${nextId}`;
      const ownerName = consultation.owner_name || '베테랑 점주';
      const phone = '010-0000-0000';
      const email = `kakao_${nextId}@haste.cafe`;

      if (dbPool.isFallback) {
        // Fallback 등록
        const localKakaoMembersFile = path.join(process.cwd(), 'local_kakao_members.json');
        let members = [];
        if (fs.existsSync(localKakaoMembersFile)) {
          try {
            members = JSON.parse(fs.readFileSync(localKakaoMembersFile, 'utf8'));
          } catch (_) {}
        }
        members.push({
          id: nextId,
          storeName: newStoreName,
          store_name: newStoreName,
          storeCode,
          store_code: storeCode,
          ownerName,
          owner_name: ownerName,
          phone,
          email,
          approvalStatus: '인증 완료',
          approval_status: '인증 완료',
          storeType: '일반',
          store_type: '일반',
          createdAt: new Date().toISOString()
        });
        fs.writeFileSync(localKakaoMembersFile, JSON.stringify(members, null, 2), 'utf8');

        // 상담서에서 삭제
        const backupConsultations = readBackupConsultations();
        const filtered = backupConsultations.filter((c: any) => c.id !== numericId);
        writeBackupConsultations(filtered);
      } else {
        // Direct SQL 등록
        await dbPool.query(
          `INSERT INTO web_kakao_members (id, store_name, owner_name, store_code, phone, email, approval_status, store_type) 
           VALUES (?, ?, ?, ?, ?, ?, '인증 완료', '일반')`,
          [nextId, newStoreName, ownerName, storeCode, phone, email]
        );

        // 상담 데이터베이스에서 삭제
        await dbPool.query('DELETE FROM web_membership_consultations WHERE id = ?', [numericId]);

        // 로컬 JSON 동기화 (SQL 모드여도 개발 편의상 로컬 파일 갱신)
        const localKakaoMembersFile = path.join(process.cwd(), 'local_kakao_members.json');
        if (fs.existsSync(localKakaoMembersFile)) {
          try {
            const members = JSON.parse(fs.readFileSync(localKakaoMembersFile, 'utf8'));
            if (Array.isArray(members) && !members.some(m => m.id === nextId)) {
              members.push({
                id: nextId,
                storeName: newStoreName,
                store_name: newStoreName,
                storeCode,
                store_code: storeCode,
                ownerName,
                owner_name: ownerName,
                phone,
                email,
                approvalStatus: '인증 완료',
                approval_status: '인증 완료',
                storeType: '일반',
                store_type: '일반',
                createdAt: new Date().toISOString()
              });
              fs.writeFileSync(localKakaoMembersFile, JSON.stringify(members, null, 2), 'utf8');
            }
          } catch (_) {}
        }
      }

      return res.json({
        success: true,
        message: '전화번호가 누락되어 커뮤니티 가상 회원으로 이전 완료되었습니다.',
        memberId: nextId,
        isVirtual: true
      });
    }

    if (dbPool.isFallback) {
      const bMembers = readBackupDb();
      const nextId = bMembers.length > 0 ? Math.max(...bMembers.map((m: any) => m.id || 0)) + 1 : 1001;
      const newMember = {
        id: nextId,
        storeName: newStoreName,
        storeCode: randomCode,
        ownerName: consultation.owner_name || '신규',
        phone: consultation.phone || '',
        email: consultation.email || '',
        address: consultation.region_name || '',
        content: consultation.content || '',
        approvalStatus: '요청',
        storeType: finalStoreType,
        businessNumber: '',
        businessCertPath: '',
        signupPath: '창업문의이동',
        role: 'USER',
        created_at: new Date().toISOString()
      };
      bMembers.unshift(newMember);
      writeBackupDb(bMembers);
      insertedId = nextId;

      // 상담서에서 삭제
      const backupConsultations = readBackupConsultations();
      const filtered = backupConsultations.filter((c: any) => c.id !== numericId);
      writeBackupConsultations(filtered);
    } else {
      // Direct SQL Insertion using translated schema web_membership_users
      const query = `
        INSERT INTO web_membership_users 
        (store_name, store_code, owner_name, phone, email, address, content, approval_status, store_type, business_number, business_cert_path, signup_path, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [meta] = await dbPool.query(query, [
        newStoreName,
        randomCode,
        consultation.owner_name,
        consultation.phone,
        consultation.email,
        consultation.region_name || '',
        consultation.content || '',
        '요청',
        finalStoreType,
        '',
        '',
        '창업문의이동',
        'USER'
      ]);

      insertedId = (meta as any).insertId || numericId;

      // 상담 데이터베이스에서 삭제
      await dbPool.query('DELETE FROM web_membership_consultations WHERE id = ?', [numericId]);
    }

    return res.json({ 
      success: true, 
      message: '성공적으로 맴버로 이전 처리가 완료되었습니다.',
      memberId: insertedId 
    });

  } catch (err: any) {
    console.error('[Move to Member API Error]:', err);
    return res.status(500).json({ success: false, message: '서버 에러로 이전에 실패했습니다: ' + err.message });
  }
});

// 2. 통합대장 선택 맴버 일괄 인증정지 API
router.post('/api/licenses/bulk-suspend', async (req, res) => {
  const { memberIds } = req.body;
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ success: false, message: '정지할 맴버 식별 ID가 누락되었습니다.' });
  }

  try {
    const dbPool = await getDbPool();
    let updatedCount = 0;

    for (const memberId of memberIds) {
      let storeCode = '';
      let storeName = '';

      if (dbPool.isFallback) {
        const bMembers = readBackupDb();
        const found = bMembers.find((m: any) => m.id === memberId || `HST-M${m.id}` === memberId || `DB-HST-${m.id}` === memberId);
        if (found) {
          storeCode = found.storeCode || '';
          storeName = found.storeName || '';
        }
      } else {
        const numericId = String(memberId).replace('DB-HST-', '');
        const [mRows]: any = await dbPool.query('SELECT store_code, store_name FROM web_membership_users WHERE id = ? LIMIT 1', [numericId]);
        if (mRows && mRows.length > 0) {
          storeCode = mRows[0].store_code || '';
          storeName = mRows[0].store_name || '';
        }
      }

      if (!storeCode) continue;

      const targetStoreId = storeCode.trim();

      if (dbPool.isFallback) {
        const bLicenses = readBackupLicenses();
        const licIndex = bLicenses.findIndex((l: any) => l.storeId === targetStoreId);
        if (licIndex !== -1) {
          bLicenses[licIndex].isApproved = 0;
          writeBackupLicenses(bLicenses);
          updatedCount++;
        } else {
          // 라이선스가 없으면 새로 비인가로 저장
          const nextLicId = bLicenses.length > 0 ? Math.max(...bLicenses.map((l: any) => l.id || 0)) + 1 : 1;
          bLicenses.push({
            id: nextLicId,
            storeName: storeName || '미계약점',
            storeId: targetStoreId,
            licenseStartDate: new Date().toISOString().split('T')[0],
            licenseEndDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
            isApproved: 0,
            storeGrade: 'STANDARD'
          });
          writeBackupLicenses(bLicenses);
          updatedCount++;
        }
      } else {
        // SQL에서 라이선스 검사 진행
        const [licRows]: any = await dbPool.query('SELECT id FROM web_store_licenses WHERE store_id = ? LIMIT 1', [targetStoreId]);
        if (licRows && licRows.length > 0) {
          await dbPool.query('UPDATE web_store_licenses SET is_approved = 0 WHERE store_id = ?', [targetStoreId]);
          updatedCount++;
        } else {
          // 라이선스 테이블에 비인가로 신규 등록
          const startDateStr = new Date().toISOString().split('T')[0];
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          const endDateStr = endDate.toISOString().split('T')[0];

          const query = `
            INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade) 
            VALUES (?, ?, ?, ?, 0, 'STANDARD')
          `;
          await dbPool.query(query, [storeName || '미계약점', targetStoreId, startDateStr, endDateStr]);
          updatedCount++;
        }
      }
    }

    return res.json({
      success: true,
      message: `${updatedCount}개의 대상 맴버 라이선스를 일괄 비인가(정지) 완료했습니다.`
    });

  } catch (err: any) {
    console.error('[Bulk Suspend API Error]:', err);
    return res.status(500).json({ success: false, message: '서버 에러로 일괄 정지에 실패했습니다: ' + err.message });
  }
});

// 3. 통합대장 선택 멤버 일괄 인증승인 API (인증만료, 종료임박 모드 통합)
router.post('/api/licenses/bulk-approve', async (req, res) => {
  const { memberIds, months, mode } = req.body;
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ success: false, message: '승인할 멤버 식별 ID가 누락되었습니다.' });
  }
  const monthsVal = months ? Number(months) : 1;

  try {
    const dbPool = await getDbPool();
    let updatedCount = 0;

    for (const memberId of memberIds) {
      let storeCode = '';
      let storeName = '';
      let storeType = '';

      if (dbPool.isFallback) {
        const bMembers = readBackupDb();
        const found = bMembers.find((m: any) => m.id === memberId || `HST-M${m.id}` === memberId || `DB-HST-${m.id}` === memberId);
        if (found) {
          storeCode = found.storeCode || '';
          storeName = found.storeName || '';
          storeType = found.storeType || '일반';
        }
      } else {
        const numericId = String(memberId).replace('DB-HST-', '');
        const [mRows]: any = await dbPool.query('SELECT store_code, store_name, store_type FROM web_membership_users WHERE id = ? LIMIT 1', [numericId]);
        if (mRows && mRows.length > 0) {
          storeCode = mRows[0].store_code || '';
          storeName = mRows[0].store_name || '';
          storeType = mRows[0].store_type || '일반';
        }
      }

      if (!storeCode) continue;

      const targetStoreId = storeCode.trim();
      let startDateStr = new Date().toISOString().split('T')[0];
      let endDate = new Date();

      if (mode === 'expire') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        startDateStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = yesterday;
      } else if (mode === 'imminent') {
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        startDateStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = sevenDaysLater;
      } else {
        endDate.setMonth(endDate.getMonth() + monthsVal);
      }
      
      const endDateStr = endDate.toISOString().split('T')[0];
      const isApprovedVal = 1; // 인증만료/종료임박 등도 기본 승인 가동 씰 상태에서 만료일자로 판정함

      const targetStoreGrade = (storeType === '프리미엄' || storeType === 'premium') ? 'PREMIUM' : 'STANDARD';

      if (dbPool.isFallback) {
        const bLicenses = readBackupLicenses();
        const licIndex = bLicenses.findIndex((l: any) => l.storeId === targetStoreId);
        if (licIndex !== -1) {
          bLicenses[licIndex].isApproved = isApprovedVal;
          bLicenses[licIndex].licenseStartDate = startDateStr;
          bLicenses[licIndex].licenseEndDate = endDateStr;
          bLicenses[licIndex].storeGrade = targetStoreGrade;
          writeBackupLicenses(bLicenses);
          updatedCount++;
        } else {
          const nextLicId = bLicenses.length > 0 ? Math.max(...bLicenses.map((l: any) => l.id || 0)) + 1 : 1;
          bLicenses.push({
            id: nextLicId,
            storeName: storeName || '미계약점',
            storeId: targetStoreId,
            licenseStartDate: startDateStr,
            licenseEndDate: endDateStr,
            isApproved: isApprovedVal,
            storeGrade: targetStoreGrade
          });
          writeBackupLicenses(bLicenses);
          updatedCount++;
        }
      } else {
        const [licRows]: any = await dbPool.query('SELECT id FROM web_store_licenses WHERE store_id = ? LIMIT 1', [targetStoreId]);
        if (licRows && licRows.length > 0) {
          await dbPool.query(
            'UPDATE web_store_licenses SET is_approved = ?, license_start_date = ?, license_end_date = ?, store_grade = ? WHERE store_id = ?',
            [isApprovedVal, startDateStr, endDateStr, targetStoreGrade, targetStoreId]
          );
          updatedCount++;
        } else {
          await dbPool.query(
            'INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade) VALUES (?, ?, ?, ?, ?, ?)',
            [storeName || '미계약점', targetStoreId, startDateStr, endDateStr, isApprovedVal, targetStoreGrade]
          );
          updatedCount++;
        }
      }
    }

    return res.json({
      success: true,
      message: `${updatedCount}개의 대상 멤버 라이선스를 일괄 승인 완료했습니다.`
    });

  } catch (err: any) {
    console.error('[Bulk Approve API Error]:', err);
    return res.status(500).json({ success: false, message: '서버 에러로 일괄 승인에 실패했습니다: ' + err.message });
  }
});

// 4. 통합대장 선택 멤버 매장유형 / 솔루션등급 일괄 변경 API
router.post('/api/registered-members/bulk-update', async (req, res) => {
  const { memberIds, storeType, storeGrade } = req.body;
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ success: false, message: '변경할 멤버 식별 ID가 누락되었습니다.' });
  }

  try {
    let updatedCount = 0;

    for (const memberId of memberIds) {
      const numericId = String(memberId).replace('DB-HST-', '');
      const payload: any = {};
      
      // storeType이 명시적으로 전달되고 빈 문자열이 아닌 경우 반영
      if (storeType !== undefined && storeType !== '') {
        payload.store_type = storeType;
      }
      
      // storeGrade가 명시적으로 전달되고 빈 문자열이 아닌 경우 반영
      if (storeGrade !== undefined && storeGrade !== '') {
        payload.storeGrade = storeGrade;
      }

      if (Object.keys(payload).length > 0) {
        await updateMemberDetails(numericId, payload);
        updatedCount++;
      }
    }

    return res.json({
      success: true,
      message: `${updatedCount}개의 매장 정보를 정상적으로 일괄 변경했습니다.`
    });
  } catch (err: any) {
    console.error('[Bulk Update API Error]:', err);
    return res.status(500).json({ success: false, message: '서버 에러로 일괄 변경에 실패했습니다: ' + err.message });
  }
});

export default router;
