import fs from 'fs';
import path from 'path';
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  envContent.split(/\r?\n/).forEach((line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  console.warn('[Env Warning] .env file load failed, skipping local assignment.');
}

import express from 'express';
import cors from 'cors';
import adminRouter from './server/routes/admin.ts';
import publicRouter from './server/routes/public';
import { rateLimiterMiddleware } from './server/middleware/rate_limiter';
import {
  getDbPool,
  convertExistingBase64ToFiles,
  readBackupCategories,
  writeBackupCategories,
  writeBackupMenuItems
} from './server/database';
import * as serverDefaults from './serverDefaults';

const { DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS } = serverDefaults;

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());

// DDoS Shield & Rate Limiting Middleware
app.use(rateLimiterMiddleware);

// Set maximum payload capacity limit for handling design photo submissions
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure upload repositories are initialised on server disk
const EXTERNAL_DIR = path.join(process.cwd(), 'external_uploads');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(EXTERNAL_DIR)) {
  fs.mkdirSync(EXTERNAL_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Consolidate existing files to external_uploads to prevent broken images
try {
  const files = fs.readdirSync(UPLOADS_DIR);
  for (const file of files) {
    if (file.startsWith('.')) continue;
    const srcPath = path.join(UPLOADS_DIR, file);
    const destPath = path.join(EXTERNAL_DIR, file);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} catch (e) {
  console.warn('[Startup Sync Warning] Failed to consolidate upload folders:', e);
}

// Serve uploaded static image resources directly from disk to keep DB fast and light
app.use('/uploads', (req, res, next) => {
  try {
    req.url = decodeURIComponent(req.url);
  } catch (e) {}
  next();
});
app.use('/uploads/menu', express.static(path.join(process.cwd(), 'cafehaste_menu_images_korean')));
app.use('/uploads', express.static(EXTERNAL_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

function isMenuImage(filename: string): boolean {
  const upper = filename.toUpperCase();
  return filename.startsWith('menu_') || 
         upper.startsWith('DRINK_') || 
         upper.startsWith('AME_') || 
         upper.startsWith('COFFEE_LATTE_') || 
         upper.startsWith('MILK_') || 
         upper.startsWith('TEA_') || 
         upper.startsWith('ADE_') ||
         upper.startsWith('LAT_') ||
         upper.startsWith('TEA_BASE_') ||
         /^[A-Z][A-Z0-9]\d{6}/i.test(filename);
}

function getCategoryFolderForImage(filename: string): string | null {
  if (filename.startsWith('menu_americano_')) return 'menu/americano';
  if (filename.startsWith('menu_coffee_latte_')) return 'menu/coffee_latte';
  if (filename.startsWith('menu_milk_latte_')) return 'menu/milk_latte';
  if (filename.startsWith('menu_tea_base_')) return 'menu/tea_base';
  if (filename.startsWith('menu_ade_etc_')) return 'menu/ade_etc';
  return null;
}

function getSupabaseRedirectUrl(relativePath: string): string | null {
  const filename = relativePath;
  const supabaseUrl = (process.env.SUPABASE_URL || 'https://fuzuzhdcsdfblwcgwfylsx.supabase.co').trim().replace('fuzuzhdcsdfblwcgwfylsx', 'fuzhdcsdfblwcgwfylsx');

  if (filename.startsWith('HERO_DRAFT_')) {
    return `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/draft/${filename}`;
  }
  
  const isMenu = isMenuImage(filename);
                 
  if (isMenu) {
    const subFolder = getCategoryFolderForImage(filename) || 'menu';
    return `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${subFolder}/${filename}`;
  }
  
  if (filename.startsWith('board_')) {
    const boardMatch = filename.match(/^board_(notice|guide|qna|coop|as|general)_/);
    const boardName = boardMatch ? boardMatch[1] : 'general';
    return `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/board/${boardName}/${filename}`;
  }

  if (filename.includes('/')) {
    return `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${filename}`;
  }

  return null;
}

// Intercept missing files to gracefully redirect/serve them from Supabase Storage or fallback placeholder
app.get('/uploads/*relativePath', (req, res) => {
  let relativePath: any = req.params.relativePath;
  if (Array.isArray(relativePath)) {
    relativePath = relativePath.join('/');
  }
  if (!relativePath || typeof relativePath !== 'string') {
    return res.status(400).json({ success: false, message: '유효하지 않은 파일 경로입니다.' });
  }

  // Auto-correct missing subdirectory hierarchy for salvaged images (e.g. menu_americano_... -> menu/americano/menu_americano_...)
  if (!relativePath.includes('/') && relativePath.startsWith('menu_')) {
    if (relativePath.startsWith('menu_americano_')) {
      relativePath = `menu/americano/${relativePath}`;
    } else if (relativePath.startsWith('menu_coffee_latte_')) {
      relativePath = `menu/coffee_latte/${relativePath}`;
    } else if (relativePath.startsWith('menu_milk_latte_')) {
      relativePath = `menu/milk_latte/${relativePath}`;
    } else if (relativePath.startsWith('menu_tea_base_')) {
      relativePath = `menu/tea_base/${relativePath}`;
    } else if (relativePath.startsWith('menu_ade_etc_')) {
      relativePath = `menu/ade_etc/${relativePath}`;
    }
  }

  const extPath = path.join(EXTERNAL_DIR, relativePath);
  const localImgPath = path.join(UPLOADS_DIR, relativePath);
  const publicPath = path.join(process.cwd(), 'public', 'uploads', relativePath);
  const distPath = path.join(process.cwd(), 'dist', 'client', 'uploads', relativePath);

  if (fs.existsSync(extPath)) {
    return res.sendFile(extPath);
  }
  if (fs.existsSync(localImgPath)) {
    return res.sendFile(localImgPath);
  }
  if (fs.existsSync(publicPath)) {
    return res.sendFile(publicPath);
  }
  if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }

  // 1. Fetch from Supabase and stream to client if it matches a known file structure pattern
  let redirectUrl = getSupabaseRedirectUrl(relativePath);
  if (!redirectUrl && relativePath.includes('/')) {
    const supabaseUrl = (process.env.SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co').trim();
    redirectUrl = `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${relativePath}`;
  }
  
  const serveFallback = () => {
    const fallbackPaths = [
      path.join(process.cwd(), 'dist', 'no-image.png'),
      path.join(process.cwd(), 'public', 'no-image.png'),
      path.join(process.cwd(), 'src/assets/images/no-image.png')
    ];
    for (const fPath of fallbackPaths) {
      if (fs.existsSync(fPath)) {
        return res.sendFile(fPath);
      }
    }
    // Last resort fallback redirect
    const supabaseUrl = (process.env.SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co').trim();
    return res.redirect(`${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${relativePath}`);
  };

  // Do not load/proxy menu images from Supabase Storage in local development
  if (process.env.NODE_ENV !== 'production') {
    const filename = relativePath.includes('/') ? relativePath.split('/').pop()! : relativePath;
    const isMenu = isMenuImage(filename);
    if (isMenu) {
      return serveFallback();
    }
  }

  if (redirectUrl) {
    fetch(redirectUrl)
      .then(async (storageRes) => {
        if (storageRes.ok) {
          const contentType = storageRes.headers.get('content-type') || 'image/jpeg';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          const arrayBuffer = await storageRes.arrayBuffer();
          return res.send(Buffer.from(arrayBuffer));
        } else {
          return serveFallback();
        }
      })
      .catch((err) => {
        console.error(`[Proxy Error] Failed to fetch storage image for ${relativePath}:`, err);
        return serveFallback();
      });
  } else {
    return serveFallback();
  }
});

// Intercept state mutation request types (POST, PUT, DELETE) to automatically invalidate reads caches
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
  }
  next();
});

// Integrate clean modular routes
app.use(publicRouter);
app.use(adminRouter);

// Service Boot Engine
async function startServer() {
  // On startup, align local backup JSON files to contain the upgraded Coffee Vanada Smart Menu if outdated
  try {
    const backupCats = readBackupCategories();
    const hasOld = backupCats.some((c: any) => c.id === 'COFFEE') || backupCats.length !== 5;
    if (hasOld) {
      console.log('[Upgrade] Local JSON files are outdated. Aligning with Coffee Vanada Smart Menu...');
      writeBackupCategories(DEFAULT_CATEGORIES);
      writeBackupMenuItems(DEFAULT_MENU_ITEMS);
    }
  } catch (e) {
    console.warn('[Upgrade Warn] Failed to align local JSON backups:', e);
  }

  // Handle SPA and assets routing
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Serve index.html with NO CACHE at the very top of static assets to bypass express.static caching
    app.get('/', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
    app.get('/index.html', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });

    app.use(express.static(distPath));

    // HTML / SEO Interceptor with dynamic Open Graph integration (PRODUCTION ONLY)
    app.get('*all', async (req, res) => {
      // Prevent browser caching of index.html so clients always retrieve the latest Vite JS bundle hash
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || /\.[a-zA-Z0-9]+$/.test(req.path)) {
        return res.status(404).end();
      }
      let ogTitle = '카페헤이스트 공식 플랫폼';
      let ogDesc = 'AI 기반의 프리미엄 카페 헤이스트 관리 기지';
      const ogImage = 'https://fuzhdcsdfblwcgwfylsx.supabase.co/storage/v1/object/public/cafehaste-bucket/draft/HERO_DRAFT_20260605_171820.jpg';
      const ogUrl = `https://cafehaste.com${req.originalUrl}`;

      // Extract deep-link Post ID
      let postId: string | null = null;
      const match = req.path.match(/^\/board\/detail\/(\d+)/) || req.path.match(/^\/board\/(\d+)/) || req.path.match(/^\/posts\/(\d+)/);
      if (match) {
        postId = match[1];
      } else if (req.query.postId) {
        postId = String(req.query.postId);
      } else if (req.query.id) {
        postId = String(req.query.id);
      }

      if (postId) {
        try {
          const { withDbConnection } = await import('./server/db/common-handler');
          const post = await withDbConnection(async (conn) => {
            const [rows]: any = await conn.query('SELECT title, content FROM web_board_posts WHERE id = ? LIMIT 1', [postId]);
            return rows && rows.length > 0 ? rows[0] : null;
          });

          if (post) {
            ogTitle = `${post.title} | 카페헤이스트 공식 플랫폼`;
            
            // Clean up markdown & HTML for description meta value
            const cleanContent = post.content
              .replace(/<[^>]*>/g, '') // Strip HTML tags
              .replace(/!\[.*?\]\(.*?\)/g, '') // Strip markdown images
              .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Strip markdown links
              .replace(/\s+/g, ' ')
              .trim();

            ogDesc = cleanContent.substring(0, 150) || ogDesc;
            if (cleanContent.length > 150) {
              ogDesc += '...';
            }
          }
        } catch (e) {
          console.warn('[SEO Engine] Failed loading post for dynamic OG headers:', e);
        }
      }

      const templatePath = path.join(distPath, 'index.html');
      if (fs.existsSync(templatePath)) {
        try {
          let html = fs.readFileSync(templatePath, 'utf-8');

          // Render dynamic OGP structure
          const ogMetaHtml = `
  <!-- Dynamic Open Graph Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${ogUrl}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:image" content="${ogImage}">
`;

          // Inject inside HTML head
          html = html.replace('<head>', `<head>${ogMetaHtml}`);
          return res.type('html').send(html);
        } catch (err) {
          console.error('[SEO Engine] Error rendering dynamic OG headers template:', err);
        }
      }

      res.sendFile(templatePath);
    });
  }

  // Bind server port instantly to support Cloud Run startup health check metrics
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`🚀 Cafe Haste Server running at http://localhost:${PORT}`);
    console.log(`===============================================`);

    // Run DB pool pre-instantiation and migrations silently in safety thread background
    (async () => {
      try {
        console.log('[Startup Async] Initializing Database Pool in background...');
        const dbPool = await getDbPool();
        await convertExistingBase64ToFiles(dbPool);
        console.log('[Startup Async] Cloud SQL Pool & active base64 migration completed.');
      } catch (err: any) {
        console.error('[Startup Migration Warn] Database initialization threat/check deferred:', err.message);
      }
    })();
  });
}

startServer();
export default app;
