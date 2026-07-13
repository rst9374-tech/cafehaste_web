import fs from 'fs';
import path from 'path';
import { readJsonFile, writeJsonFile } from './cache-io';

export const BACKUP_POSTS_GUIDE_FILE = path.join(process.cwd(), 'local_posts_guide.json');
export const BACKUP_POSTS_COOP_FILE = path.join(process.cwd(), 'local_posts_coop.json');
export const BACKUP_POSTS_AS_FILE = path.join(process.cwd(), 'local_posts_as.json');
export const BACKUP_POSTS_QNA_FILE = path.join(process.cwd(), 'local_posts_qna.json');
export const BACKUP_POSTS_NOTICE_FILE = path.join(process.cwd(), 'local_posts_notice.json');
export const BACKUP_ATTACHMENTS_FILE = path.join(process.cwd(), 'local_attachments.json');
export const BACKUP_COMMENTS_FILE = path.join(process.cwd(), 'local_comments.json');
export const BACKUP_GRADE_PERMISSIONS_FILE = path.join(process.cwd(), 'local_permissions.json');

export const boardCache: {
  posts: any[] | null;
  attachments: any[] | null;
  comments: any[] | null;
  permissions: any[] | null;
} = {
  posts: null,
  attachments: null,
  comments: null,
  permissions: null
};

export function invalidateBoardCache() {
  console.log('[Board Cache] Invalidating in-memory cache to sync with Database updates.');
  boardCache.posts = null;
  boardCache.attachments = null;
  boardCache.comments = null;
}

export function readBackupPermissions(): any[] {
  if (process.env.NODE_ENV === 'production' && boardCache.permissions !== null) return boardCache.permissions;
  boardCache.permissions = readJsonFile<any[]>(BACKUP_GRADE_PERMISSIONS_FILE, []);
  return boardCache.permissions;
}

export function writeBackupPermissions(permissions: any[]) {
  boardCache.permissions = permissions;
  writeJsonFile(BACKUP_GRADE_PERMISSIONS_FILE, permissions);
}

export function readBackupPosts(): any[] {
  // Trigger hot reload cache invalidation to load newly injected posts
  if (process.env.NODE_ENV === 'production' && boardCache.posts !== null) return boardCache.posts;

  const guidePosts = readJsonFile<any[]>(BACKUP_POSTS_GUIDE_FILE, []);
  const coopPosts = readJsonFile<any[]>(BACKUP_POSTS_COOP_FILE, []);
  const asPosts = readJsonFile<any[]>(BACKUP_POSTS_AS_FILE, []);
  const qnaPosts = readJsonFile<any[]>(BACKUP_POSTS_QNA_FILE, []);
  const noticePosts = readJsonFile<any[]>(BACKUP_POSTS_NOTICE_FILE, []);

  // Handle migration from legacy unified file if it exists
  const legacyFile = path.join(process.cwd(), 'local_posts.json');
  if (fs.existsSync(legacyFile)) {
    try {
      const legacyPosts = readJsonFile<any[]>(legacyFile, []);
      if (legacyPosts && legacyPosts.length > 0) {
        console.log(`[Database Migration] Migrating ${legacyPosts.length} legacy posts to separated category DBs.`);
        const allIds = new Set([...guidePosts, ...coopPosts, ...asPosts, ...qnaPosts, ...noticePosts].map(p => p.id));
        
        legacyPosts.forEach(lp => {
          if (!allIds.has(lp.id)) {
            const cat = lp.category || 'Q&A';
            if (cat === '운용가이드' || cat === '노하우팁' || cat === '레시피' || cat === '핵심정보' || cat === '장비운영') {
              lp.category = cat === '운용가이드' ? '노하우팁' : cat;
              guidePosts.push(lp);
            }
            else if (cat === '공동구매' || cat === '직거래') coopPosts.push(lp);
            else if (cat === 'H/W AS업체') asPosts.push(lp);
            else if (cat === '공지사항' || cat === '헤이스트소식') noticePosts.push(lp);
            else qnaPosts.push(lp);
          }
        });

        // Write partitions
        writeJsonFile(BACKUP_POSTS_GUIDE_FILE, guidePosts);
        writeJsonFile(BACKUP_POSTS_COOP_FILE, coopPosts);
        writeJsonFile(BACKUP_POSTS_AS_FILE, asPosts);
        writeJsonFile(BACKUP_POSTS_QNA_FILE, qnaPosts);
        writeJsonFile(BACKUP_POSTS_NOTICE_FILE, noticePosts);

        // Safely tag/rename legacy file to avoid repeating migration
        try {
          fs.renameSync(legacyFile, path.join(process.cwd(), 'local_posts.json.migrated'));
        } catch (renameErr) {
          console.error('[Migration Error] Rename legacy file failed', renameErr);
        }
      }
    } catch (migErr) {
      console.error('[Migration Error] Failed legacy migration', migErr);
    }
  }

  const merged = [...guidePosts, ...coopPosts, ...asPosts, ...qnaPosts, ...noticePosts];
  boardCache.posts = merged;
  return boardCache.posts;
}

export function writeBackupPosts(posts: any[]) {
  // Clear cache to enforce fresh reload from newly written file partitions
  boardCache.posts = null;

  // Distribute by category
  const guidePosts = posts.filter(p => ['노하우팁', '레시피', '핵심정보', '장비운영', '운용가이드'].includes(p.category));
  const coopPosts = posts.filter(p => p.category === '공동구매' || p.category === '직거래');
  const asPosts = posts.filter(p => p.category === 'H/W AS업체');
  const noticePosts = posts.filter(p => p.category === '헤이스트소식');
  const qnaPosts = posts.filter(p => 
    !['노하우팁', '레시피', '핵심정보', '장비운영', '운용가이드', '공동구매', '직거래', 'H/W AS업체', '헤이스트소식'].includes(p.category)
  );

  // Write to separate files
  writeJsonFile(BACKUP_POSTS_GUIDE_FILE, guidePosts);
  writeJsonFile(BACKUP_POSTS_COOP_FILE, coopPosts);
  writeJsonFile(BACKUP_POSTS_AS_FILE, asPosts);
  writeJsonFile(BACKUP_POSTS_QNA_FILE, qnaPosts);
  writeJsonFile(BACKUP_POSTS_NOTICE_FILE, noticePosts);
}

export function readBackupAttachments(): any[] {
  if (process.env.NODE_ENV === 'production' && boardCache.attachments !== null) return boardCache.attachments;
  boardCache.attachments = readJsonFile<any[]>(BACKUP_ATTACHMENTS_FILE, []);
  return boardCache.attachments;
}

export function writeBackupAttachments(attachments: any[]) {
  boardCache.attachments = attachments;
  writeJsonFile(BACKUP_ATTACHMENTS_FILE, attachments);
}

export function readBackupComments(): any[] {
  if (process.env.NODE_ENV === 'production' && boardCache.comments !== null) return boardCache.comments;
  boardCache.comments = readJsonFile<any[]>(BACKUP_COMMENTS_FILE, []);
  return boardCache.comments;
}

export function writeBackupComments(comments: any[]) {
  boardCache.comments = comments;
  writeJsonFile(BACKUP_COMMENTS_FILE, comments);
}

