import { Router } from 'express';
import path from 'path';
import { supabase, isCloudSqlConnected } from '../database';
import fs from 'fs';

import authRouter from './public/auth';
import catalogRouter from './public/catalog';
import postsRouter from './public/posts';
import verifyRouter from './public/verify';
import permissionsRouter from './public/permissions';
import musicRouter from './public/music';
import commentsRouter from './public/comments';
import rssRouter from './public/rss';

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

// POS/Admin Image & File upload directly to Supabase Storage with category/board isolation and ID-linked immutable naming
router.post('/api/upload', async (req, res) => {
  const { base64Data, filename, boardName, categoryId } = req.body;
  
  if (!base64Data) {
    return res.status(400).json({ 
      success: false, 
      message: '전송받은 이미지 파일 데이터가 유효하지 않습니다.' 
    });
  }

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let extension = 'jpg';
    let buffer;
    let mimeType = 'image/jpeg';

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      
      if (mimeType.includes('png')) {
        extension = 'png';
      } else if (mimeType.includes('webp')) {
        extension = 'webp';
      } else if (mimeType.includes('gif')) {
        extension = 'gif';
      } else if (mimeType.includes('svg')) {
        extension = 'svg';
      }
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    // Determine board folder and Category Unique ID
    const folder = (boardName || 'general').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const catUniqueId = (categoryId || 'CAT_GEN_' + Math.random().toString(36).substring(2, 6).toUpperCase()).toUpperCase().replace(/[^A-Z0-9]/g, '_');
    
    const timestamp = getFormattedTimestamp();
    const ext = extension.toLowerCase();
    
    // Naming pattern: [board_name]/[Category_Unique_ID]_[YYYYMMDD_HHMMSS].[extension]
    const virtualPathInBucket = `${folder}/${catUniqueId}_${timestamp}.${ext}`;

    // 1. Always save to local storage (uploads/) as a reliable fallback
    const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
    const localTargetDir = path.join(UPLOADS_DIR, folder);
    const localTargetFilePath = path.join(UPLOADS_DIR, virtualPathInBucket);
    
    if (!fs.existsSync(localTargetDir)) {
      fs.mkdirSync(localTargetDir, { recursive: true });
    }
    fs.writeFileSync(localTargetFilePath, buffer);
    console.log(`[Local Storage] /api/upload saved locally: ${virtualPathInBucket}`);

    // 2. Background upload directly to Supabase Storage (cafehaste-bucket) if in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const { error } = await supabase.storage.from('cafehaste-bucket').upload(virtualPathInBucket, buffer, {
          contentType: mimeType,
          upsert: true
        });

        if (error) {
          console.error('[Supabase Storage Warning] Background upload failed, using local fallback:', error.message);
        } else {
          console.log(`[Supabase Storage] Dynamic category upload complete: ${virtualPathInBucket}`);
        }
      } catch (storageErr: any) {
        console.error('[Supabase Storage Warning] Background upload crashed, using local fallback:', storageErr.message);
      }
    }

    // Always return local relative URL path to support local/remote dual-lookup
    res.json({
      success: true,
      url: `/uploads/${virtualPathInBucket}`,
      message: '성공적으로 이미지 파일 저장이 완료되었습니다!'
    });
  } catch (err: any) {
    console.error('[Upload handler error] Failed to process uploaded image:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: '업로드한 이미지를 가공하고 저장하는 서버 연동 중 오류가 발생했습니다.'
    });
  }
});

// Invidious API scraper variables and helper for robust metadata retrieval without datacenter IP blocking
let lastWorkingInvidiousInstance = 'inv.thepixora.com'; // Pre-seed with a known working one

async function fetchInvidiousDescription(ytId: string): Promise<string> {
  // 1. Try last working instance first
  if (lastWorkingInvidiousInstance) {
    try {
      const response = await fetch(`https://${lastWorkingInvidiousInstance}/api/v1/videos/${ytId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const json: any = await response.json();
        if (json && json.description) {
          return json.description;
        }
      }
    } catch (err) {
      console.warn(`[YouTube Scraper] Pre-seeded instance ${lastWorkingInvidiousInstance} failed, searching list...`);
    }
  }

  // 2. Fetch list of active instances and try them in sequence
  try {
    const listRes = await fetch('https://api.invidious.io/instances.json', {
      signal: AbortSignal.timeout(4000)
    });
    if (listRes.ok) {
      const instancesData = await listRes.json();
      if (Array.isArray(instancesData)) {
        const activeDomains = instancesData
          .filter(item => {
            const details = item[1] || {};
            return details.type === 'https' && details.monitor && details.monitor.down === false;
          })
          .map(item => item[0]);

        for (const domain of activeDomains.slice(0, 5)) {
          if (domain === lastWorkingInvidiousInstance) continue;
          try {
            const response = await fetch(`https://${domain}/api/v1/videos/${ytId}`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              },
              signal: AbortSignal.timeout(3000)
            });
            if (response.ok) {
              const json: any = await response.json();
              if (json && json.description) {
                lastWorkingInvidiousInstance = domain;
                console.log(`[YouTube Scraper] Found new working Invidious instance: ${domain}`);
                return json.description;
              }
            }
          } catch (e) {
            // ignore and try next
          }
        }
      }
    }
  } catch (listErr: any) {
    console.warn('[YouTube Scraper] Failed to fetch Invidious instances:', listErr.message);
  }

  return '';
}

// YouTube Metadata Scraper API
router.get('/api/youtube-meta', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, message: 'URL이 필요합니다.' });
  }

  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const ytId = match && match[2].length === 11 ? match[2] : null;
    if (!ytId) {
      return res.status(400).json({ success: false, message: '유효한 유튜브 ID를 찾을 수 없습니다.' });
    }

    // 1. Try Invidious instances first (bypasses YouTube datacenter block)
    let description = await fetchInvidiousDescription(ytId);

    // 2. Fallback to direct watch page scraping if Invidious fails
    if (!description) {
      console.log(`[YouTube Scraper] Invidious failed. Falling back to direct scrape for video: ${ytId}`);
      try {
        const response = await fetch(`https://www.youtube.com/watch?v=${ytId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cookie': 'CONSENT=YES+cb; SOCS=CAESEwgDEgk0ODE3NTEzNTQaAnRyIAEaBgiA_cugBg'
          },
          signal: AbortSignal.timeout(4000)
        });

        if (response.ok) {
          const html = await response.text();
          
          // Try to extract description from ytInitialPlayerResponse JSON
          const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/);
          if (playerResponseMatch) {
            try {
              const json = JSON.parse(playerResponseMatch[1]);
              if (json.videoDetails && json.videoDetails.shortDescription) {
                description = json.videoDetails.shortDescription;
              }
            } catch (jsonErr) {}
          }

          // Fallback to description meta tag
          if (!description) {
            const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
              || html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
            if (descMatch && descMatch[1]) {
              description = descMatch[1];
            }
          }
        }
      } catch (directErr: any) {
        console.warn('[YouTube Scraper] Direct scrape fallback failed:', directErr.message);
      }
    }

    // 3. Clean up HTML entities
    if (description) {
      description = description
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ');
    }

    // 4. Filter out YouTube default generic page descriptions
    const genericYtDesc = "YouTube에서 마음에 드는 동영상과 음악을 감상하고, 직접 만든 콘텐츠를 업로드하여 친구, 가족뿐 아니라 전 세계 사람들과 콘텐츠를 공유할 수 있습니다.";
    const genericYtDescEn = "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.";
    if (
      description.trim() === genericYtDesc || 
      description.trim() === genericYtDescEn ||
      description.includes("Enjoy the videos and music you love")
    ) {
      description = '';
    }

    return res.json({ success: true, description });
  } catch (err: any) {
    console.error('[YouTube Meta Scraper Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Mounted Sub-Routers
router.use(authRouter);
router.use(catalogRouter);
router.use(postsRouter);
router.use(verifyRouter);
router.use(permissionsRouter);
router.use(musicRouter);
router.use(commentsRouter);
router.use(rssRouter);

export default router;
