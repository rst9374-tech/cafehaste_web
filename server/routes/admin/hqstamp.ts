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

export default router;
