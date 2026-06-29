import {
  readBackupDb,
  writeBackupDb,
  readBackupConsultations,
  writeBackupConsultations,
  readBackupAdmins
} from '../cache-io';
import fs from 'fs';
import path from 'path';

export function handleMemberSim(formattedSql: string, params: any[] = []): { handled: boolean; result?: any } {
  if (formattedSql.startsWith('SELECT * FROM HASTE_KAKAO_MEMBERS')) {
    try {
      const kakaoPath = path.join(process.cwd(), 'local_kakao_members.json');
      if (fs.existsSync(kakaoPath)) {
        const members = JSON.parse(fs.readFileSync(kakaoPath, 'utf8'));
        return { handled: true, result: [members] };
      }
    } catch (e) {
      console.warn('[Simulator Warn] Failed to read HASTE_KAKAO_MEMBERS:', e);
    }
    return { handled: true, result: [[]] };
  }
  if (formattedSql.startsWith('INSERT INTO HASTE_MEMBERS')) {
    const members = readBackupDb();
    const insertId = members.length > 0 ? Math.max(...members.map((m: any) => m.id)) + 1 : 1;
    const [
      store_name,
      store_code,
      owner_name,
      phone,
      email,
      address,
      content,
      approval_status,
      store_type,
      business_number,
      business_cert_path,
      signup_path
    ] = params;
    const newMember = {
      id: insertId,
      store_name: store_name || '',
      store_code: store_code || '',
      owner_name: owner_name || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      content: content || '',
      approval_status: approval_status || '요청',
      store_type: store_type || '일반',
      business_number: business_number || '',
      business_cert_path: business_cert_path || '',
      signup_path: signup_path || '맴버십가입신청',
      created_at: new Date().toISOString()
    };
    members.push(newMember);
    writeBackupDb(members);
    return { handled: true, result: [{ insertId }] };
  }

  if (formattedSql.startsWith('SELECT * FROM HASTE_MEMBERS')) {
    const members = readBackupDb();
    let matchedMembers = members.map((m: any) => ({
      ...m,
      store_name: m.storeName || m.store_name || '',
      store_code: m.storeCode || m.store_code || '',
      owner_name: m.ownerName || m.owner_name || '',
      approval_status: m.approvalStatus || m.approval_status || '요청',
      store_type: m.storeType || m.store_type || '일반',
      business_number: m.businessNumber || m.business_number || '',
      business_cert_path: m.businessCertPath || m.business_cert_path || '',
      signup_path: m.signupPath || m.signup_path || '맴버십가입신청'
    }));
    
    if (formattedSql.includes('WHERE STORE_CODE =') && params.length > 0) {
      const targetStoreCode = params[0]?.trim();
      matchedMembers = matchedMembers.filter((m: any) => (m.store_code || '').trim() === targetStoreCode);
    }
    
    return { handled: true, result: [matchedMembers] };
  }

  if (formattedSql.startsWith('UPDATE HASTE_MEMBERS SET APPROVAL_STATUS')) {
    const members = readBackupDb();
    const [status, id] = params;
    const updated = members.map((m: any) => 
      m.id === parseInt(id) ? { ...m, approval_status: status } : m
    );
    writeBackupDb(updated);
    return { handled: true, result: [{ affectedRows: 1 }] };
  }

  if (formattedSql.startsWith('INSERT INTO HASTE_CONSULTATIONS')) {
    const consultations = readBackupConsultations();
    const insertId = consultations.length > 0 ? Math.max(...consultations.map((c: any) => c.id)) + 1 : 1;
    const [
      region_name,
      owner_name,
      phone,
      email,
      capital,
      has_store,
      inquiry_path,
      signup_path,
      content,
      approval_status
    ] = params;
    const newConsultation = {
      id: insertId,
      region_name: region_name || '',
      owner_name: owner_name || '',
      phone: phone || '',
      email: email || '',
      capital: capital || '',
      has_store: has_store || '없음',
      inquiry_path: inquiry_path || '',
      signup_path: signup_path || '창업문의',
      content: content || '',
      approval_status: approval_status || '요청',
      created_at: new Date().toISOString()
    };
    consultations.push(newConsultation);
    writeBackupConsultations(consultations);
    return { handled: true, result: [{ insertId }] };
  }

  if (formattedSql.startsWith('SELECT * FROM HASTE_CONSULTATIONS')) {
    const consultations = readBackupConsultations();
    const updatedConsultations = consultations.map((c: any) => ({
      ...c,
      capital: c.capital || '',
      has_store: c.has_store || '없음',
      inquiry_path: c.inquiry_path || '',
      signup_path: c.signup_path || '창업문의',
      content: c.content || '',
      approval_status: c.approval_status || '요청'
    }));
    if (JSON.stringify(consultations) !== JSON.stringify(updatedConsultations)) {
      writeBackupConsultations(updatedConsultations);
    }
    return { handled: true, result: [updatedConsultations] };
  }

  if (formattedSql.startsWith('UPDATE HASTE_CONSULTATIONS SET APPROVAL_STATUS')) {
    const consultations = readBackupConsultations();
    const [status, id] = params;
    const updated = consultations.map((c: any) => 
      c.id === parseInt(id) ? { ...c, approval_status: status } : c
    );
    writeBackupConsultations(updated);
    return { handled: true, result: [{ affectedRows: 1 }] };
  }

  if (formattedSql.startsWith('SELECT * FROM HASTE_ADMINS') || formattedSql.startsWith('SELECT * FROM WEB_ADMIN_ACCOUNTS')) {
    const admins = readBackupAdmins();
    const [username] = params;
    const matched = admins.filter((a: any) => a.username === username);
    return { handled: true, result: [matched] };
  }

  return { handled: false };
}
