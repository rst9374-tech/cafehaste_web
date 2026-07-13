import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { supabase } from '../../database';

const router = Router();

// [한글 주석] 본사 직인 이미지를 업로드하고 로컬 디스크 및 Supabase Storage에 동기화 저장하는 API입니다.
router.post('/api/hq/upload-stamp', async (req, res) => {
  const { base64Data } = req.body;

  if (!base64Data) {
    return res.status(400).json({
      success: false,
      message: '전송받은 이미지 파일 데이터가 유효하지 않습니다.'
    });
  }

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType = 'image/png';

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const filename = 'haste_hq_stamp.png';
    const externalDir = path.join(process.cwd(), 'external_uploads');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Ensure folders exist
    if (!fs.existsSync(externalDir)) {
      fs.mkdirSync(externalDir, { recursive: true });
    }
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const externalPath = path.join(externalDir, filename);
    const uploadsPath = path.join(uploadsDir, filename);

    // Save to local disk (both locations for fallback & serving)
    fs.writeFileSync(externalPath, buffer);
    fs.writeFileSync(uploadsPath, buffer);

    console.log(`[HQ Stamp Upload] Local sync complete: ${uploadsPath}`);

    // Synchronize to Supabase Storage Bucket root
    const { error } = await supabase.storage
      .from('cafehaste-bucket')
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.warn('[HQ Stamp Upload] Supabase sync failed, continuing with local cache:', error.message);
    } else {
      console.log(`[HQ Stamp Upload] Supabase Storage sync complete: ${filename}`);
    }

    // Clear public cache to ensure instant updates
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    const publicUrl = `/uploads/${filename}`;

    res.json({
      success: true,
      url: publicUrl,
      message: '성공적으로 본사 직인 업로드가 완료되었습니다!'
    });
  } catch (err: any) {
    console.error('[HQ Stamp handler error] Failed to process uploaded stamp:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: '본사 직인 이미지를 가공하고 저장하는 서버 연동 중 오류가 발생했습니다.'
    });
  }
});

// [한글 주석] 약정서 제목, 부제목, 조항 본문을 조회하는 API입니다.
router.get('/api/public/agreement', async (req, res) => {
  try {
    const { getDbPool } = require('../../database');
    const dbPool = await getDbPool();
    let configRow: any = null;

    if (dbPool.isFallback) {
      const { readBackupSettings } = require('../../database');
      const settings = readBackupSettings();
      configRow = settings.find((s: any) => s.setting_key === 'agreement_config');
    } else {
      const [rows]: any = await dbPool.query('SELECT setting_value FROM web_system_settings WHERE setting_key = ? LIMIT 1', ['agreement_config']);
      if (rows && rows.length > 0) {
        configRow = rows[0];
      }
    }

    if (configRow) {
      const val = configRow.setting_value;
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      return res.json({
        success: true,
        title: parsed.title,
        subtitle: parsed.subtitle,
        lines: parsed.lines,
        provider: parsed.provider || {
          name: '주식회사 헤이스트 에이아이',
          bizNo: '(발급 후 기재)',
          ceo: '김성규',
          address: '(법인 등기부상 본점 주소)',
          phone: '1644-8999'
        }
      });
    }

    // Fallback to static defaults
    const { AGREEMENT_TITLE, AGREEMENT_SUBTITLE, AGREEMENT_LINES } = require('../../../serverDefaults');
    res.json({
      success: true,
      title: AGREEMENT_TITLE,
      subtitle: AGREEMENT_SUBTITLE,
      lines: AGREEMENT_LINES,
      provider: {
        name: '주식회사 헤이스트 랩스',
        bizNo: '(발급 후 기재)',
        ceo: '김성규',
        address: '(법인 등기부상 본점 주소)',
        phone: '1644-8999'
      }
    });
  } catch (err: any) {
    console.error('[API error] Fetch agreement failed:', err);
    try {
      const { AGREEMENT_TITLE, AGREEMENT_SUBTITLE, AGREEMENT_LINES } = require('../../../serverDefaults');
      return res.json({
        success: true,
        title: AGREEMENT_TITLE,
        subtitle: AGREEMENT_SUBTITLE,
        lines: AGREEMENT_LINES,
        provider: {
          name: '주식회사 헤이스트 에이아이',
          bizNo: '(발급 후 기재)',
          ceo: '김성규',
          address: '(법인 등기부상 본점 주소)',
          phone: '1644-8999'
        }
      });
    } catch (_) {}
    res.status(500).json({
      success: false,
      error: err.message,
      message: '약정서 데이터를 가져오지 못했습니다.'
    });
  }
});

// [한글 주석] 약정서의 제목, 부제목, 본문 조항들을 업데이트하는 API입니다.
router.post('/api/hq/agreement', async (req, res) => {
  const { title, subtitle, lines, provider } = req.body;

  if (!title || !lines || !Array.isArray(lines)) {
    return res.status(400).json({
      success: false,
      message: '약정서 제목(title) 및 조항 배열(lines)은 필수값입니다.'
    });
  }

  try {
    const { getDbPool } = require('../../database');
    const dbPool = await getDbPool();
    const configVal = JSON.stringify({ 
      title, 
      subtitle: subtitle || '', 
      lines,
      provider: provider || {
        name: '주식회사 헤이스트 에이아이',
        bizNo: '(발급 후 기재)',
        ceo: '김성규',
        address: '(법인 등기부상 본점 주소)',
        phone: '1644-8999'
      }
    });

    if (dbPool.isFallback) {
      const { readBackupSettings, writeBackupSettings } = require('../../database');
      const settings = readBackupSettings();
      const idx = settings.findIndex((s: any) => s.setting_key === 'agreement_config');
      if (idx > -1) {
        settings[idx].setting_value = configVal;
      } else {
        settings.push({ setting_key: 'agreement_config', setting_value: configVal, updated_at: new Date().toISOString() });
      }
      writeBackupSettings(settings);
    } else {
      await dbPool.query(`
        INSERT INTO web_system_settings (setting_key, setting_value) 
        VALUES ('agreement_config', ?) 
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
      `, [configVal]);
    }

    res.json({
      success: true,
      message: '약정서 설정이 성공적으로 업데이트되었습니다.'
    });
  } catch (err: any) {
    console.error('[API error] Update agreement failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: '약정서 설정을 저장하는 도중 오류가 발생했습니다.'
    });
  }
});

export default router;
