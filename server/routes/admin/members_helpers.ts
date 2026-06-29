import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  getDbPool, 
  supabase, 
  readBackupLicenses, 
  writeBackupLicenses, 
  readBackupDb, 
  writeBackupDb, 
  storeVerifyCache 
} from '../../database';

export async function updateMemberDetails(numericId: string, body: any) {
  const { 
    approval_status, 
    store_type,
    storeName,
    storeCode,
    ownerName,
    phone,
    email,
    address,
    businessNumber,
    content,
    businessCertPath,
    businessCertBase64,
    businessCertName,
    licenseStartDate,
    licenseEndDate,
    storeGrade,
    password
  } = body;

  const dbPool = await getDbPool();
  const fieldsToUpdate: string[] = [];
  const values: any[] = [];
  
  if (approval_status !== undefined) { fieldsToUpdate.push('approval_status = ?'); values.push(approval_status); }
  if (store_type !== undefined) { fieldsToUpdate.push('store_type = ?'); values.push(store_type); }
  if (storeName !== undefined) { fieldsToUpdate.push('store_name = ?'); values.push(storeName); }
  if (storeCode !== undefined) { fieldsToUpdate.push('store_code = ?'); values.push(storeCode); }
  if (ownerName !== undefined) { fieldsToUpdate.push('owner_name = ?'); values.push(ownerName); }
  if (phone !== undefined) { fieldsToUpdate.push('phone = ?'); values.push(phone); }
  if (email !== undefined) { fieldsToUpdate.push('email = ?'); values.push(email); }
  if (address !== undefined) { fieldsToUpdate.push('address = ?'); values.push(address); }
  if (businessNumber !== undefined) { fieldsToUpdate.push('business_number = ?'); values.push(businessNumber); }
  if (content !== undefined) { fieldsToUpdate.push('content = ?'); values.push(content); }

  if (password !== undefined && password.trim() !== '') {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    fieldsToUpdate.push('password = ?');
    values.push(hashedPassword);
  }

  let finalCertPath = businessCertPath;
  if (businessCertBase64) {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const actualCertName = businessCertName || `edit_cert_${numericId}.jpg`;
    const ext = path.extname(actualCertName) || '.png';
    const cleanName = actualCertName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
    
    const uniqueFilename = `member_certs/${cleanName}_${timestamp}${ext}`;
    const matches = businessCertBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let fileBuffer: Buffer;
    let mime = 'image/png';

    if (matches && matches.length === 3) {
      mime = matches[1];
      fileBuffer = Buffer.from(matches[2], 'base64');
    } else {
      fileBuffer = Buffer.from(businessCertBase64, 'base64');
    }

    const { error } = await supabase.storage.from('cafehaste-bucket').upload(uniqueFilename, fileBuffer, {
      contentType: mime,
      upsert: true
    });

    if (error) {
      throw new Error('Supabase Storage Error: ' + error.message);
    }

    finalCertPath = `https://fuzhdcsdfblwcgwfylsx.supabase.co/storage/v1/object/public/cafehaste-bucket/${uniqueFilename}`;
  }

  if (finalCertPath !== undefined) {
    fieldsToUpdate.push('business_cert_path = ?');
    values.push(finalCertPath);
  }

  // Support Live & Fallback for members PUT
  if (dbPool.isFallback) {
    const bMembers = readBackupDb();
    const foundIdx = bMembers.findIndex((m: any) => m.id === Number(numericId));
    if (foundIdx !== -1) {
      if (approval_status !== undefined) bMembers[foundIdx].approval_status = approval_status;
      if (store_type !== undefined) bMembers[foundIdx].storeType = store_type;
      if (storeName !== undefined) bMembers[foundIdx].storeName = storeName;
      if (storeCode !== undefined) bMembers[foundIdx].storeCode = storeCode;
      if (ownerName !== undefined) bMembers[foundIdx].ownerName = ownerName;
      if (phone !== undefined) bMembers[foundIdx].phone = phone;
      if (email !== undefined) bMembers[foundIdx].email = email;
      if (address !== undefined) bMembers[foundIdx].address = address;
      if (businessNumber !== undefined) bMembers[foundIdx].businessNumber = businessNumber;
      if (content !== undefined) bMembers[foundIdx].content = content;
      if (finalCertPath !== undefined) bMembers[foundIdx].businessCertPath = finalCertPath;
      if (password !== undefined && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        bMembers[foundIdx].password = hashedPassword;
      }
      writeBackupDb(bMembers);
    }
  } else {
    if (fieldsToUpdate.length > 0) {
      values.push(numericId);
      const query = `UPDATE web_membership_users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      await dbPool.query(query, values);
    }
  }

  // [인증 시작일 & 인증 종료일 수정대장 반영]
  if (licenseStartDate !== undefined || licenseEndDate !== undefined || storeGrade !== undefined) {
    let currentStoreCode = storeCode;
    if (!currentStoreCode) {
      if (dbPool.isFallback) {
        const bMembers = readBackupDb();
        const found = bMembers.find((m: any) => m.id === Number(numericId));
        if (found) currentStoreCode = found.storeCode;
      } else {
        const [mRows]: any = await dbPool.query('SELECT store_code FROM web_membership_users WHERE id = ?', [numericId]);
        if (mRows.length > 0) currentStoreCode = mRows[0].store_code;
      }
    }
    const finalStoreId = currentStoreCode ? currentStoreCode.trim() : `없음_${numericId}`;

    if (dbPool.isFallback) {
      const bLicenses = readBackupLicenses();
      let licItem = bLicenses.find((l: any) => l.storeId === finalStoreId || l.storeId === `없음_${numericId}`);
      if (!licItem) {
        const newId = bLicenses.length > 0 ? Math.max(...bLicenses.map((item: any) => item.id)) + 1 : 1;
        licItem = {
          id: newId,
          storeName: storeName || '미지정',
          storeId: finalStoreId,
          licenseStartDate: licenseStartDate || new Date().toISOString().split('T')[0],
          licenseEndDate: licenseEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          isApproved: 0,
          storeGrade: storeGrade || 'PREMIUM'
        };
        bLicenses.unshift(licItem);
      } else {
        if (licItem.storeId.startsWith('없음_') && finalStoreId && !finalStoreId.startsWith('없음_')) {
          licItem.storeId = finalStoreId;
        }
        if (licenseStartDate !== undefined) licItem.licenseStartDate = licenseStartDate;
        if (licenseEndDate !== undefined) licItem.licenseEndDate = licenseEndDate;
        if (storeGrade !== undefined) licItem.storeGrade = storeGrade;
      }
      writeBackupLicenses(bLicenses);
    } else {
      const [lRows]: any = await dbPool.query(
        'SELECT store_id FROM web_store_licenses WHERE store_id = ? OR store_id = ? LIMIT 1', 
        [finalStoreId, `없음_${numericId}`]
      );
      if (lRows.length > 0) {
        const matchedStoreId = lRows[0].store_id;
        const lUpdates: string[] = [];
        const lValues: any[] = [];
        if (licenseStartDate !== undefined) {
          lUpdates.push('license_start_date = ?');
          lValues.push(licenseStartDate);
        }
        if (licenseEndDate !== undefined) {
          lUpdates.push('license_end_date = ?');
          lValues.push(licenseEndDate);
        }
        if (storeGrade !== undefined) {
          lUpdates.push('store_grade = ?');
          lValues.push(storeGrade);
        }
        if (matchedStoreId.startsWith('없음_') && finalStoreId && !finalStoreId.startsWith('없음_')) {
          lUpdates.push('store_id = ?');
          lValues.push(finalStoreId);
        }
        if (lUpdates.length > 0) {
          lValues.push(matchedStoreId);
          await dbPool.query(`UPDATE web_store_licenses SET ${lUpdates.join(', ')} WHERE store_id = ?`, lValues);
        }
      } else {
        const start = licenseStartDate || new Date().toISOString().split('T')[0];
        const end = licenseEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
        const grade = storeGrade || 'PREMIUM';
        await dbPool.query(
          'INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade) VALUES (?, ?, ?, ?, ?, ?)',
          [storeName || '미지정', finalStoreId, start, end, 0, grade]
        );
      }
    }

    // 캐시 무효화 (Cache Bust)
    if (storeVerifyCache && typeof storeVerifyCache === 'object') {
      delete storeVerifyCache[finalStoreId];
      if (currentStoreCode) {
        delete storeVerifyCache[`없음_${numericId}`];
      }
    }
  }
}
