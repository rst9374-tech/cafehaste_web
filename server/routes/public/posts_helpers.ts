import path from 'path';
import fs from 'fs';
import { supabase, getDbPool } from '../../database';

export function getFormattedTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

export async function saveBase64File(
  base64Data: string, 
  originalName: string, 
  boardName: string = 'general', 
  categoryId: string = 'ATT_HST'
): Promise<{ storedName: string; filePath: string }> {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let fileBuffer: Buffer;
  let ext = path.extname(originalName) || '.png';
  let mimeType = 'image/png';
  let cleanBase64 = base64Data;
  
  if (matches && matches.length === 3) {
    mimeType = matches[1];
    cleanBase64 = matches[2];
    fileBuffer = Buffer.from(cleanBase64, 'base64');
  } else {
    fileBuffer = Buffer.from(base64Data, 'base64');
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
  }
  
  const sanitizedBoard = boardName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const sanitizedCategory = categoryId.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  
  const timestamp = getFormattedTimestamp();
  const uniqueId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const extWithoutDot = ext.replace('.', '').toLowerCase();
  
  // Format: [TopMenu]_[Category]_[Unique_ID]_[YYYYMMDD_HHMMSS].[extension]
  const storedName = `board_${sanitizedCategory}_${uniqueId}_${timestamp}.${extWithoutDot}`;
  const fullPathInBucket = `board/${sanitizedBoard}/${storedName}`;

  try {
    const dbPool = await getDbPool();
    if (dbPool.isFallback) {
      const localDirPath = path.join(process.cwd(), 'uploads', 'board', sanitizedBoard);
      const localFilePath = path.join(localDirPath, storedName);
      if (!fs.existsSync(localDirPath)) {
        fs.mkdirSync(localDirPath, { recursive: true });
      }
      fs.writeFileSync(localFilePath, fileBuffer);
      console.log(`[Local Simulator Upload] Saved attachment locally: uploads/${fullPathInBucket}`);
      return {
        storedName: fullPathInBucket,
        filePath: `/uploads/${fullPathInBucket}`
      };
    }
  } catch (err: any) {
    console.warn('[Attachment Upload] Failed local fallback detection, trying cloud storage:', err.message);
  }
  
  const { error } = await supabase.storage.from('cafehaste-bucket').upload(fullPathInBucket, fileBuffer, {
    contentType: mimeType,
    upsert: true
  });

  if (error) {
    throw new Error('Supabase Storage Error: ' + error.message);
  }

  const publicUrl = `https://fuzhdcsdfblwcgwfylsx.supabase.co/storage/v1/object/public/cafehaste-bucket/${fullPathInBucket}`;
  console.log(`[Attachment Upload] Successfully saved to Supabase Storage: ${fullPathInBucket}`);

  return {
    storedName: fullPathInBucket,
    filePath: publicUrl
  };
}

export function getSkinTypeByCategory(category: string): number {
  const cat = category || 'Q&A';
  if (cat === '공지사항' || cat === '헤이스트소식') return 1; // Classic Gold
  if (cat === 'Q&A' || cat === '문의사항') return 2; // Modern Forest
  if (cat === 'H/W AS업체') return 3; // Safety Shield
  if (cat === '공동구매') return 4; // Minimal Slate
  if (cat === '운용가이드' || cat === '노하우팁') return 5; // Technical Navy
  if (cat === '장비운영') return 6; // Matte Steel
  if (cat === '핵심정보') return 7; // Royal Velvet
  if (cat === '레시피') return 8; // Mellow Tangerine
  return 1; // 기본 Classic Gold
}
