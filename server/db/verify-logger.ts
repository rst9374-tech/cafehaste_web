import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// 라이선스 검증 현황 로깅을 위한 인메모리 로그 리스트 관리
export let verifyApiLogs: Array<{
  timestamp: string;
  storeId: string;
  ip: string;
  isApproved: boolean;
  message: string;
}> = [];

// 5분 단위 매장 연동 메모리 캐시 제어
export interface StoreVerifyCacheItem {
  timestamp: number;
  response: {
    isApproved: boolean;
    storeGrade?: string;
    expireDate?: string;
    storeName?: string;
    message?: string;
    reason?: string;
    allowOfflineGrace?: boolean;
    offlineLicenseToken?: string | null;
  };
}
export let storeVerifyCache: Record<string, StoreVerifyCacheItem> = {};

export function clearVerifyApiLogs() {
  verifyApiLogs = [];
}

// 대한민국 표준시(KST, UTC+9) 기준으로 정확하게 일정 정보 및 연도-월-일 포맷 시간을 계산해 반환합니다.
export function getKstTimeInfo(date: Date = new Date()) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(date.getTime() + kstOffsetMs);
  
  const yyyy = kstDate.getUTCFullYear();
  const mm = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kstDate.getUTCDate()).padStart(2, '0');
  const hh = String(kstDate.getUTCHours()).padStart(2, '0');
  const mi = String(kstDate.getUTCMinutes()).padStart(2, '0');
  const ss = String(kstDate.getUTCSeconds()).padStart(2, '0');
  
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const timeStr = `${hh}:${mi}:${ss}`;
  const dateTimeStr = `${dateStr} ${timeStr}`;
  const isoLikeStr = `${dateStr}T${timeStr}.000Z`;
  
  return { dateStr, timeStr, dateTimeStr, isoLikeStr };
}

// 노후 로그 파일 (90일 경과) 자동 청소 자동화 구현 함수
function cleanupOldLogs() {
  try {
    if (!fs.existsSync(LOGS_DIR)) return;
    const files = fs.readdirSync(LOGS_DIR);
    const nowTime = new Date().getTime();
    const maxAgeMs = 1 * 24 * 60 * 60 * 1000; // 1 day (하루)

    files.forEach(f => {
      if (f.startsWith('local_api_log_') && f.endsWith('.txt')) {
        const fileDateStr = f.replace('local_api_log_', '').replace('.txt', '');
        const fileTime = new Date(fileDateStr + 'T00:00:00').getTime();
        if (isNaN(fileTime)) return;
        
        if (nowTime - fileTime > maxAgeMs) {
          const filePath = path.join(LOGS_DIR, f);
          try {
            fs.unlinkSync(filePath);
            console.log(`[Log Auto-Purge] Deleted expired 90-day log file: ${f}`);
          } catch (err) {
            console.error(`Failed to delete expired log file: ${f}`, err);
          }
        }
      }
    });
  } catch (err) {
    console.error('[cleanupOldLogs Trigger Error]', err);
  }
}

// 1일간 특정 가맹점의 호출회수 메모리 캐시 (파일 풀-스캔 병목 제거용 고성능 맵)
let dailyCountCache: {
  dateStr: string;
  counts: Record<string, number>;
} = {
  dateStr: '',
  counts: {}
};

// 1일간 특정 점포가 호출한 누적 검증 횟수를 파일로부터 최초 1회만 레이지 수집 후 메모리 O(1) 제어로 고도화
function getStoreDailyCount(storeId: string, dateStr: string): number {
  if (dailyCountCache.dateStr !== dateStr) {
    dailyCountCache.dateStr = dateStr;
    dailyCountCache.counts = {};
  }

  const key = storeId || 'N/A';

  if (dailyCountCache.counts[key] !== undefined) {
    dailyCountCache.counts[key]++;
    return dailyCountCache.counts[key];
  }

  let initialCount = 0;
  try {
    const logFilePath = path.join(LOGS_DIR, `local_api_log_${dateStr}.txt`);
    if (fs.existsSync(logFilePath)) {
      const content = fs.readFileSync(logFilePath, 'utf8');
      const targetToken = ` [${key}] `;
      let pos = content.indexOf(targetToken);
      while (pos !== -1) {
        initialCount++;
        pos = content.indexOf(targetToken, pos + targetToken.length);
      }
    }
  } catch (err) {
    console.warn('[getStoreDailyCount initial file load failed]', err);
  }

  initialCount++;
  dailyCountCache.counts[key] = initialCount;
  return initialCount;
}

export function getLogStatusType(isApproved: boolean, message: string): 'PASS' | 'WARN' | 'RISK' | 'DUP' {
  const msg = (message || '').toUpperCase();
  if (msg.includes('동시성 중복') || msg.includes('캐시 히트') || msg.includes('DUP')) {
    return 'DUP';
  }
  if (isApproved) {
    return 'PASS';
  }
  if (
    msg.includes('PENDING') || 
    msg.includes('EXPIRED') || 
    msg.includes('SUSPENDED') || 
    msg.includes('만료') || 
    msg.includes('정지') || 
    msg.includes('대기') ||
    msg.includes('주의')
  ) {
    return 'WARN';
  }
  return 'RISK';
}

// 대기용 로그 메모리 버퍼링 구조 설계
interface PendingLogItem {
  storeId: string;
  ip: string;
  isApproved: boolean;
  statusType: string;
  message: string;
  createdAt: string;
}

export let pendingLogBuffer: Array<PendingLogItem> = [];
let isBulkWriting = false;

// 5분마다 램 버퍼에 있는 데이터를 Supabase DB에 벌크 인서트 수행하는 타이머 설정
async function startFiveMinLogFlushTimer() {
  setInterval(async () => {
    if (pendingLogBuffer.length === 0 || isBulkWriting) return;
    isBulkWriting = true;
    
    const logsToFlush = [...pendingLogBuffer];
    console.log(`[Log Flush] Attempting to flush ${logsToFlush.length} logs to Supabase DB...`);
    
    try {
      const { getDbPool } = await import('../database');
      const dbPool = await getDbPool();
      
      if (dbPool.isFallback) {
        // 로컬 fallback 상태인 경우 로컬 백업 파일에 즉시 누적 기록
        logsToFlush.forEach(log => {
          const { dateStr, dateTimeStr } = getKstTimeInfo(new Date(log.createdAt));
          let lineCount = 1;
          try {
            const logFilePath = path.join(LOGS_DIR, `local_api_log_${dateStr}.txt`);
            if (fs.existsSync(logFilePath)) {
              const content = fs.readFileSync(logFilePath, 'utf8');
              lineCount = content.split('\n').filter(Boolean).length + 1;
            }
          } catch (e) {}
          
          const logLine = `[#${lineCount}] [STATUS: ${log.statusType.toUpperCase()}] [${dateTimeStr}] [${log.storeId || 'N/A'}] [IP: ${log.ip}] [APPROVED: ${log.isApproved ? 'PASS' : 'FAIL'}] - ${log.message}\n`;
          const logFilePath = path.join(LOGS_DIR, `local_api_log_${dateStr}.txt`);
          fs.appendFileSync(logFilePath, logLine, 'utf8');
        });
        
        pendingLogBuffer = pendingLogBuffer.slice(logsToFlush.length);
        console.log(`[Log Flush Success] Flushed ${logsToFlush.length} logs to local fallback file.`);
      } else {
        // Supabase DB에 실시간 벌크 인서트 실행
        // values 파라미터 구성
        const insertPromises = logsToFlush.map(async (log) => {
          await dbPool.query(
            'INSERT INTO web_verify_logs (store_id, ip, is_approved, status_type, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [log.storeId || 'N/A', log.ip, log.isApproved, log.statusType.toUpperCase(), log.message, new Date(log.createdAt)]
          );
        });
        
        await Promise.all(insertPromises);
        
        pendingLogBuffer = pendingLogBuffer.slice(logsToFlush.length);
        console.log(`[Log Flush Success] Successfully batch-inserted ${logsToFlush.length} logs to Supabase.`);
      }
    } catch (err: any) {
      console.error('[Log Flush Error] Failed to write logs to DB, keeping in buffer:', err.message || err);
    } finally {
      isBulkWriting = false;
    }
  }, 5 * 60 * 1000); // 5분
}

// 스케줄러 즉시 실행 가동
startFiveMinLogFlushTimer();

// 임시 flush 함수 (메모리 강제 비우기용)
export async function flushPendingLogs() {
  if (pendingLogBuffer.length === 0) return { success: true, count: 0 };
  const count = pendingLogBuffer.length;
  const logsToFlush = [...pendingLogBuffer];
  
  try {
    const { getDbPool } = await import('../database');
    const dbPool = await getDbPool();
    
    if (dbPool.isFallback) {
      logsToFlush.forEach(log => {
        const { dateStr, dateTimeStr } = getKstTimeInfo(new Date(log.createdAt));
        let lineCount = 1;
        try {
          const logFilePath = path.join(LOGS_DIR, `local_api_log_${dateStr}.txt`);
          if (fs.existsSync(logFilePath)) {
            const content = fs.readFileSync(logFilePath, 'utf8');
            lineCount = content.split('\n').filter(Boolean).length + 1;
          }
        } catch (e) {}
        
        const logLine = `[#${lineCount}] [STATUS: ${log.statusType.toUpperCase()}] [${dateTimeStr}] [${log.storeId || 'N/A'}] [IP: ${log.ip}] [APPROVED: ${log.isApproved ? 'PASS' : 'FAIL'}] - ${log.message}\n`;
        const logFilePath = path.join(LOGS_DIR, `local_api_log_${dateStr}.txt`);
        fs.appendFileSync(logFilePath, logLine, 'utf8');
      });
    } else {
      const insertPromises = logsToFlush.map(async (log) => {
        await dbPool.query(
          'INSERT INTO web_verify_logs (store_id, ip, is_approved, status_type, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [log.storeId || 'N/A', log.ip, log.isApproved, log.statusType.toUpperCase(), log.message, new Date(log.createdAt)]
        );
      });
      await Promise.all(insertPromises);
    }
    pendingLogBuffer = pendingLogBuffer.slice(count);
    return { success: true, count };
  } catch (err: any) {
    console.error('[Manual Flush Error]', err);
    return { success: false, count: 0 };
  }
}

// 인증 로그 기록 도우미 함수 (즉시 디스크 기록 배제 -> 메모리 5분 버퍼링 적재 전환)
export function addVerifyLog(storeId: string, req: any, isApproved: boolean, message: string) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || 'unknown';
  const cleanIp = ip.replace('::ffff:', '');
  const now = new Date();
  const { dateStr } = getKstTimeInfo(now);

  const dailyCount = getStoreDailyCount(storeId, dateStr);
  const enrichedMessage = `${message} [일간 검증요청: ${dailyCount}회]`;
  const statusType = getLogStatusType(isApproved, enrichedMessage);

  const entry = {
    timestamp: now.toISOString(),
    storeId: storeId || 'N/A',
    ip: cleanIp,
    isApproved,
    message: enrichedMessage,
    statusType: statusType.toLowerCase()
  };
  
  // 1. 실시간 뷰 모니터링을 위해 인메모리 apiLogs에 즉시 unshift
  verifyApiLogs.unshift(entry);
  if (verifyApiLogs.length > 500) {
    verifyApiLogs = verifyApiLogs.slice(0, 500);
  }

  // 2. 5분 벌크 쓰기를 위해 pendingLogBuffer 적재
  pendingLogBuffer.push({
    storeId: storeId || 'N/A',
    ip: cleanIp,
    isApproved,
    statusType: statusType,
    message: enrichedMessage,
    createdAt: now.toISOString()
  });
}

// 자정 배치 백업 및 청소 프로세스 (00:00 KST 스케줄러)
async function runMidnightArchive() {
  console.log('[Midnight Archive] Starting daily log archiver & cleanup batch...');
  
  // 1. 혹시 메모리에 남아있는 로그 강제 적재
  await flushPendingLogs();
  
  const d = new Date();
  // 어제 날짜 계산 (KST 기준)
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstYesterday = new Date(d.getTime() + kstOffsetMs - (24 * 60 * 60 * 1000));
  const year = kstYesterday.getUTCFullYear();
  const month = String(kstYesterday.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kstYesterday.getUTCDate()).padStart(2, '0');
  const yesterdayStr = `${year}-${month}-${day}`;
  
  const startKst = `${yesterdayStr} 00:00:00+09:00`;
  const endKst = `${yesterdayStr} 23:59:59+09:00`;
  
  try {
    const { getDbPool, supabase } = await import('../database');
    const dbPool = await getDbPool();
    
    if (dbPool.isFallback) {
      console.log('[Midnight Archive] Skipping cloud storage backup in local fallback mode.');
      cleanupOldLogs();
      return;
    }
    
    // 2. DB에서 어제 발생한 전체 로그를 시간순 조회
    const [rows]: any = await dbPool.query(
      'SELECT store_id, ip, is_approved, status_type, message, created_at FROM web_verify_logs WHERE created_at >= ? AND created_at <= ? ORDER BY created_at ASC',
      [new Date(startKst), new Date(endKst)]
    );
    
    if (!rows || rows.length === 0) {
      console.log(`[Midnight Archive] No logs recorded for yesterday (${yesterdayStr}). Skipping storage upload.`);
    } else {
      // 3. 텍스트 라인 포맷 문자열로 변환
      let lineCount = 1;
      const logLines = rows.map((r: any) => {
        const kstDate = new Date(new Date(r.created_at).getTime() + kstOffsetMs);
        const yyyy = kstDate.getUTCFullYear();
        const mm = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(kstDate.getUTCDate()).padStart(2, '0');
        const hh = String(kstDate.getUTCHours()).padStart(2, '0');
        const mi = String(kstDate.getUTCMinutes()).padStart(2, '0');
        const ss = String(kstDate.getUTCSeconds()).padStart(2, '0');
        const dateTimeStr = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        
        const line = `[#${lineCount++}] [STATUS: ${r.status_type}] [${dateTimeStr}] [${r.store_id || 'N/A'}] [IP: ${r.ip}] [APPROVED: ${r.is_approved ? 'PASS' : 'FAIL'}] - ${r.message}\n`;
        return line;
      }).join('');
      
      const uploadPath = `logs/local_api_log_${yesterdayStr}.txt`;
      console.log(`[Midnight Archive] Uploading ${rows.length} logs to Supabase Storage: ${uploadPath}...`);
      
      // 4. Supabase Storage에 텍스트 업로드
      const buffer = Buffer.from(logLines, 'utf8');
      const { error: uploadError } = await supabase.storage
        .from('cafehaste-bucket')
        .upload(uploadPath, buffer, {
          contentType: 'text/plain; charset=utf-8',
          upsert: true
        });
        
      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }
      
      console.log(`[Midnight Archive Success] Upload complete: ${uploadPath}`);
      
      // 5. 백업 완료 시 DB의 어제 자 로그 데이터 안전하게 삭제 (Delete)
      const [delRes]: any = await dbPool.query(
        'DELETE FROM web_verify_logs WHERE created_at >= ? AND created_at <= ?',
        [new Date(startKst), new Date(endKst)]
      );
      console.log(`[Midnight Archive] Cleaned ${delRes.affectedRows || 'all'} rows of yesterday logs from DB.`);
    }
    
    // 6. 1일 경과 로그 파일 스토리지 및 로컬 디스크에서 소거
    cleanupOldLogs();
    
    // 7. Supabase Storage에서도 1일 경과 파일 삭제 실행
    try {
      const oneDayAgo = new Date(d.getTime() + kstOffsetMs - (1 * 24 * 60 * 60 * 1000));
      const delYear = oneDayAgo.getUTCFullYear();
      const delMonth = String(oneDayAgo.getUTCMonth() + 1).padStart(2, '0');
      const delDay = String(oneDayAgo.getUTCDate()).padStart(2, '0');
      const delDateStr = `${delYear}-${delMonth}-${delDay}`;
      const delPath = `logs/local_api_log_${delDateStr}.txt`;
      
      console.log(`[Midnight Archive] Purging 1-day-old storage log: ${delPath}`);
      await supabase.storage.from('cafehaste-bucket').remove([delPath]);
    } catch (e: any) {
      console.warn('[Midnight Archive Storage Purge Skip/Warn]', e.message);
    }
  } catch (err: any) {
    console.error('[Midnight Archive Critical Error]', err.message || err);
  }
}

// 가용 로그 일자 조회 함수 (구형 3개월 초과 로그 필터 제거 및 잔존 파일 목록만 반환)
export function getAvailableLogDays(): string[] {
  try {
    if (!fs.existsSync(LOGS_DIR)) return [];
    const files = fs.readdirSync(LOGS_DIR);
    const days = files
      .filter(f => f.startsWith('local_api_log_') && f.endsWith('.txt'))
      .map(f => f.replace('local_api_log_', '').replace('.txt', ''))
      .sort((a, b) => b.localeCompare(a));
    
    const { dateStr: todayKstStr } = getKstTimeInfo();
    if (days.length === 0 || !days.includes(todayKstStr)) {
      if (!days.includes(todayKstStr)) {
        days.unshift(todayKstStr);
      }
    }
    return days;
  } catch (err) {
    console.error('getAvailableLogDays error:', err);
    const { dateStr: todayKstStr } = getKstTimeInfo();
    return [todayKstStr];
  }
}

// 서버 기동 시 1회 즉시 비동기로 청소 수행 후, 매 자정(00:00)마다 주기적 실행 스케줄링
export function scheduleDailyLogCleanup() {
  setTimeout(() => {
    console.log('[Log Cleanup] Starting initial background logs cleanup...');
    cleanupOldLogs();
  }, 10000);

  const now = new Date();
  const nextChungso = new Date();
  nextChungso.setDate(now.getDate() + 1);
  nextChungso.setHours(0, 0, 0, 0);

  const msToMidnight = nextChungso.getTime() - now.getTime();

  setTimeout(async () => {
    console.log('[Log Cleanup] Running midnight logs cleanup...');
    await runMidnightArchive();
    
    setInterval(async () => {
      console.log('[Log Cleanup] Running daily logs cleanup...');
      cleanupOldLogs();
    }, 24 * 60 * 60 * 1000);
  }, msToMidnight);
}

// 최초 1회 스케줄 등록 자동 개시
scheduleDailyLogCleanup();
