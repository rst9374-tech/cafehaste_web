import {
  readBackupLicenses,
  writeBackupLicenses
} from '../cache-io';

export function handleLicenseSim(formattedSql: string, params: any[] = []): { handled: boolean; result?: any } {
  if (formattedSql.includes('FROM HASTE_LICENSES') || formattedSql.includes('HASTE_LICENSES')) {
    if (formattedSql.startsWith('SELECT COUNT(*)')) {
      const licenses = readBackupLicenses();
      return { handled: true, result: [[{ count: licenses.length }]] };
    }
    
    if (formattedSql.startsWith('SELECT * FROM HASTE_LICENSES WHERE STORE_ID =')) {
      const licenses = readBackupLicenses();
      const storeId = params ? params[0] : '';
      const matched = licenses.filter((item: any) => item.storeId === storeId);
      const dbRows = matched.map((item: any) => ({
        id: item.id || 1,
        store_name: item.storeName,
        store_id: item.storeId,
        license_start_date: item.licenseStartDate,
        license_end_date: item.licenseEndDate,
        is_approved: item.isApproved ? 1 : 0,
        store_grade: item.storeGrade || 'PREMIUM',
        created_at: new Date().toISOString()
      }));
      return { handled: true, result: [dbRows] };
    }

    if (formattedSql.startsWith('SELECT *')) {
      const licenses = readBackupLicenses();
      const dbRows = licenses.map((item: any) => ({
        id: item.id || 1,
        store_name: item.storeName,
        store_id: item.storeId,
        license_start_date: item.licenseStartDate,
        license_end_date: item.licenseEndDate,
        is_approved: item.isApproved ? 1 : 0,
        store_grade: item.storeGrade || 'PREMIUM',
        created_at: new Date().toISOString()
      }));
      return { handled: true, result: [dbRows] };
    }

    if (formattedSql.startsWith('INSERT INTO') && formattedSql.includes('HASTE_LICENSES')) {
      const licenses = readBackupLicenses();
      const [store_name, store_id, license_start_date, license_end_date, is_approved, store_grade] = params;
      const insertId = licenses.length > 0 ? Math.max(...licenses.map((l: any) => l.id || 0)) + 1 : 1;
      const newLicense = {
        id: insertId,
        storeName: store_name || '',
        storeId: store_id || '',
        licenseStartDate: license_start_date || '',
        licenseEndDate: license_end_date || '',
        isApproved: is_approved === 1 || is_approved === true || is_approved === undefined,
        storeGrade: store_grade || 'PREMIUM'
      };
      licenses.push(newLicense);
      writeBackupLicenses(licenses);
      return { handled: true, result: [{ insertId }] };
    }

    if (formattedSql.startsWith('UPDATE') && formattedSql.includes('HASTE_LICENSES')) {
      const licenses = readBackupLicenses();
      const [store_name, license_start_date, license_end_date, is_approved, store_grade, store_id] = params;
      const updated = licenses.map((item: any) => {
        if (item.storeId === store_id) {
          return {
            ...item,
            storeName: store_name || item.storeName,
            licenseStartDate: license_start_date || item.licenseStartDate,
            licenseEndDate: license_end_date || item.licenseEndDate,
            isApproved: is_approved === 1 || is_approved === true,
            storeGrade: store_grade || item.storeGrade
          };
        }
        return item;
      });
      writeBackupLicenses(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }

    if (formattedSql.startsWith('DELETE')) {
      const licenses = readBackupLicenses();
      const [store_id] = params;
      const filtered = licenses.filter((item: any) => item.storeId !== store_id);
      writeBackupLicenses(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  return { handled: false };
}
