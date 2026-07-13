import { getDbPool, supabase } from '../database';

// Target folders in the cafehaste-bucket to scan for orphaned media
const SCAN_FOLDERS = [
  'board/tips',
  'board/as',
  'board/notice',
  'board/qna',
  'board/coop'
];

interface ScannedFile {
  name: string;
  folder: string;
  fullPath: string;
  size: number;
}

export async function runGarbageCollector(dryRun = false) {
  console.log(`[Storage GC] Starting garbage collection. Mode: ${dryRun ? 'DRY-RUN (Simulated)' : 'PRODUCTION (Active)'}`);
  
  const dbPool = await getDbPool();
  
  // 1. Gather all active attachment stored_names from DB
  const [attachments]: any = await dbPool.query('SELECT stored_name FROM web_board_attachments');
  const dbActiveFiles = new Set<string>();
  
  attachments.forEach((att: any) => {
    if (att.stored_name) {
      dbActiveFiles.add(att.stored_name.trim());
    }
  });
  console.log(`[Storage GC] Found ${dbActiveFiles.size} active attachment records in DB.`);

  // 2. Gather all posts content to check for embedded file URLs
  const [posts]: any = await dbPool.query('SELECT content FROM web_board_posts');
  const postContents = posts
    .map((p: any) => p.content)
    .filter((c: any) => typeof c === 'string' && c.length > 0);
  console.log(`[Storage GC] Scanned ${postContents.length} board posts for embedded URLs.`);

  // Helper to check if a file name is embedded in any post content
  const isEmbeddedInPosts = (fileName: string): boolean => {
    return postContents.some((content: string) => content.includes(fileName));
  };

  // 3. Scan the target storage folders in Supabase Storage
  const filesInStorage: ScannedFile[] = [];
  
  for (const folder of SCAN_FOLDERS) {
    try {
      console.log(`[Storage GC] Listing files in bucket: cafehaste-bucket, folder: ${folder}`);
      const { data, error } = await supabase.storage.from('cafehaste-bucket').list(folder, {
        limit: 1000 // reasonable limit per directory
      });
      
      if (error) {
        console.error(`[Storage GC] Error listing bucket files in ${folder}:`, error.message);
        continue;
      }
      
      if (data && data.length > 0) {
        data.forEach((item) => {
          // Skip directories/placeholders
          if (item.metadata && Object.keys(item.metadata).length > 0) {
            filesInStorage.push({
              name: item.name,
              folder: folder,
              fullPath: `${folder}/${item.name}`,
              size: item.metadata.size || 0
            });
          }
        });
      }
    } catch (err: any) {
      console.error(`[Storage GC] Exception scanning folder ${folder}:`, err.message);
    }
  }

  console.log(`[Storage GC] Found ${filesInStorage.length} physical files in Storage scanned folders.`);

  // 4. Identify orphaned files
  const orphanedFiles: ScannedFile[] = [];
  const activeFilesDetected: ScannedFile[] = [];

  filesInStorage.forEach((file) => {
    // If the file is explicitly registered in attachments OR its name is referenced in post content
    const isRegistered = dbActiveFiles.has(file.name) || dbActiveFiles.has(file.fullPath);
    const isReferenced = isEmbeddedInPosts(file.name);

    if (isRegistered || isReferenced) {
      activeFilesDetected.push(file);
    } else {
      orphanedFiles.push(file);
    }
  });

  console.log(`[Storage GC] Scan analysis complete:`);
  console.log(`  - Active/Referenced Files: ${activeFilesDetected.length}`);
  console.log(`  - Orphaned (Unreferenced) Files: ${orphanedFiles.length}`);

  let reclaimedBytes = 0;
  const deletedPaths: string[] = [];

  if (orphanedFiles.length === 0) {
    console.log('[Storage GC] No orphaned files detected. Storage is clean!');
    return {
      success: true,
      message: '보관소에 고아 파일이 존재하지 않아 정리가 생략되었습니다.',
      deletedFiles: [],
      reclaimedBytes: 0
    };
  }

  // 5. Delete orphaned files if not dry-run
  if (!dryRun) {
    // Supabase remove takes an array of full paths inside the bucket
    const pathsToRemove = orphanedFiles.map((file) => file.fullPath);
    
    // Chunk deletions to prevent API payload limits if there are many files
    const chunkSize = 50;
    for (let i = 0; i < pathsToRemove.length; i += chunkSize) {
      const chunk = pathsToRemove.slice(i, i + chunkSize);
      try {
        const { error } = await supabase.storage.from('cafehaste-bucket').remove(chunk);
        if (error) {
          console.error(`[Storage GC] Failed to delete chunk from storage:`, error.message);
        } else {
          chunk.forEach((p) => deletedPaths.push(p));
        }
      } catch (err: any) {
        console.error(`[Storage GC] Error executing storage remove chunk:`, err.message);
      }
    }

    orphanedFiles.forEach((file) => {
      if (deletedPaths.includes(file.fullPath)) {
        reclaimedBytes += file.size;
      }
    });
  } else {
    // In dry-run, we just simulate reclaiming the bytes and list paths
    orphanedFiles.forEach((file) => {
      reclaimedBytes += file.size;
      deletedPaths.push(file.fullPath);
    });
  }

  const resultMsg = dryRun
    ? `[Storage GC] [DRY-RUN] Detected ${deletedPaths.length} orphaned files to delete (${Math.round(reclaimedBytes / 1024)} KB).`
    : `[Storage GC] Successfully purged ${deletedPaths.length} orphaned files from Supabase Storage (${Math.round(reclaimedBytes / 1024)} KB reclaimed).`;

  console.log(resultMsg);
  if (deletedPaths.length > 0) {
    console.log('[Storage GC] Affected paths:', deletedPaths);
  }

  return {
    success: true,
    message: resultMsg,
    deletedFiles: deletedPaths,
    reclaimedBytes: reclaimedBytes
  };
}

// If executed directly from command line
if (process.argv[1] && (process.argv[1].endsWith('clean_orphaned_attachments.ts') || process.argv[1].endsWith('clean_orphaned_attachments.js'))) {
  const isDryRun = process.argv.includes('--dry-run');
  runGarbageCollector(isDryRun)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Storage GC CLI Error]', err);
      process.exit(1);
    });
}