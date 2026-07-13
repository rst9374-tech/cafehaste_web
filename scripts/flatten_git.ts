import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function runCmd(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e: any) {
    console.error(`[Error] Command failed: ${cmd}`);
    process.exit(1);
  }
}

function cleanupOldConversations() {
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\김성규';
  const brainDir = path.join(userProfile, '.gemini', 'antigravity', 'brain');
  const backupDir = path.join(userProfile, '.gemini', 'antigravity', 'brain_backup');
  
  if (!fs.existsSync(brainDir)) {
    console.log('[Brain Cleanup] Brain directory does not exist. Skipping.');
    return;
  }

  console.log('[Brain Cleanup] Scanning for old AI conversation logs (older than 24h)...');
  try {
    const folders = fs.readdirSync(brainDir);
    const now = Date.now();
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
    let archiveCount = 0;

    for (const folder of folders) {
      if (folder === 'tempmediaStorage') continue;
      const folderPath = path.join(brainDir, folder);
      const stat = fs.statSync(folderPath);
      
      if (stat.isDirectory()) {
        // transcript.jsonl 파일의 최종 수정 시간(mtime) 우선 적용
        const logFile = path.join(folderPath, '.system_generated', 'logs', 'transcript.jsonl');
        let mtimeMs = stat.mtimeMs;
        if (fs.existsSync(logFile)) {
          mtimeMs = fs.statSync(logFile).mtimeMs;
        }

        const ageMs = now - mtimeMs;
        if (ageMs > maxAgeMs) {
          try {
            // 대화의 최종 수정일(mtime) 기준으로 날짜별 백업 폴더 경로 결정 (예: 2026-06-17)
            const dateObj = new Date(mtimeMs);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            const dateBackupDir = path.join(backupDir, dateStr);
            if (!fs.existsSync(dateBackupDir)) {
              fs.mkdirSync(dateBackupDir, { recursive: true });
            }
            
            const zipPath = path.join(dateBackupDir, `${folder}.zip`);
            console.log(`[Brain Cleanup] Archiving folder ${folder} to brain_backup/${dateStr}...`);
            
            // PowerShell Compress-Archive로 압축
            execSync(`powershell -Command "Compress-Archive -Path '${folderPath}' -DestinationPath '${zipPath}' -Force"`, { stdio: 'ignore' });
            
            // 압축 파일이 정상 생성되었는지 확인 후 원래 폴더 제거
            if (fs.existsSync(zipPath)) {
              fs.rmSync(folderPath, { recursive: true, force: true });
              archiveCount++;
            } else {
              console.warn(`[Brain Cleanup Warn] Archive file was not created for ${folder}. Skipping deletion.`);
            }
          } catch (delErr: any) {
            console.warn(`[Brain Cleanup Warn] Failed to archive/delete folder ${folder}:`, delErr.message);
          }
        }
      }
    }
    console.log(`[Brain Cleanup Success] Cleaned up and archived ${archiveCount} expired conversation sessions.`);
    
    // 대화 폴더 삭제 후 WIKI_CONVERSATIONS.md 파일 동기화 재생성
    const sortScript = path.join(process.cwd(), 'scratch', 'sort_conversations.cjs');
    if (fs.existsSync(sortScript)) {
      console.log('[Brain Cleanup] Synchronizing WIKI_CONVERSATIONS.md...');
      try {
        execSync(`node "${sortScript}"`, { stdio: 'inherit' });
      } catch (sortErr: any) {
        console.warn('[Brain Cleanup Warn] Failed to run sort_conversations.cjs:', sortErr.message);
      }
    }
  } catch (err: any) {
    console.warn('[Brain Cleanup Warning] Failed to complete old sessions cleanup:', err.message);
  }
}

console.log('==================================================');
console.log('🚀 [Git Auto-Flatten] Starting Git History Optimization...');
console.log('==================================================');

try {
  // 0. Clean up old brain conversation sessions (older than 24 hours)
  cleanupOldConversations();

  // 1. Ensure working directory is clean or stage everything
  const status = runCmd('git status --porcelain');
  if (status) {
    console.log('[Info] Staging uncommitted changes before flattening...');
    runCmd('git add -A');
  }

  // 2. Switch to main if not already on it
  const currentBranch = runCmd('git rev-parse --abbrev-ref HEAD');
  if (currentBranch !== 'main') {
    console.log(`[Info] Currently on branch "${currentBranch}". Switching to main...`);
    runCmd('git checkout main');
  }

  // 3. Create a temporary orphan branch
  console.log('[Step 1/4] Creating clean orphan branch...');
  runCmd('git checkout --orphan temp_flatten_branch');

  // 4. Stage and commit all files
  console.log('[Step 2/4] Staging and committing current files...');
  runCmd('git add -A');
  runCmd('git commit -m "feat: initial commit (optimized and flattened)"');

  // 5. Delete and replace local main branch
  console.log('[Step 3/4] Overwriting main branch locally...');
  runCmd('git branch -D main');
  runCmd('git branch -m main');

  // 6. Force push to GitHub remote repository
  console.log('[Step 4/4] Force pushing clean history to GitHub origin/main...');
  try {
    execSync('git push origin main --force', { stdio: 'inherit' });
  } catch (pushErr: any) {
    console.error('[Error] Force push failed. Please verify your origin remote URL configuration.');
    process.exit(1);
  }

  console.log('==================================================');
  console.log('✨ [Success] Git history has been successfully flattened to a single commit!');
  console.log('==================================================');
} catch (err: any) {
  console.error('[Fatal Error] Failed to auto-flatten Git history:', err.message);
  process.exit(1);
}
