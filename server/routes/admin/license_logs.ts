import { Router } from 'express';
import { 
  getDbPool, 
  getAvailableLogDays,
  getKstTimeInfo,
  flushPendingLogs,
  storeVerifyCache
} from '../../database';
import path from 'path';
import fs from 'fs';

const router = Router();

// Logs mapping (Supports historical date-specific logs fetching up to 3 months with DB-Storage hybrid cache)
router.get('/api/licenses/verify-logs', async (req, res) => {
  try {
    const { date } = req.query;
    const { dateStr: todayStr } = getKstTimeInfo();
    
    // 날짜가 없으면 기본값으로 오늘 날짜(KST) 세팅
    const targetDate = (date && typeof date === 'string') 
      ? date.replace(/[^0-9\-]/g, '') 
      : todayStr;
      
    const logFilePath = path.join(process.cwd(), 'logs', `local_api_log_${targetDate}.txt`);
    const { pendingLogBuffer, getLogStatusType } = await import('../../db/verify-logger');
    const dbPool = await getDbPool();
    
    let fileLogs: any[] = [];
    
    if (targetDate === todayStr && !dbPool.isFallback) {
      // 1. [오늘자 조회 - 클라우드 환경]: Supabase DB + 5분 램 버퍼 실시간 병합
      try {
        const startKst = `${todayStr} 00:00:00+09:00`;
        const endKst = `${todayStr} 23:59:59+09:00`;
        const [rows]: any = await dbPool.query(
          'SELECT store_id, ip, is_approved, status_type, message, created_at FROM web_verify_logs WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC',
          [new Date(startKst), new Date(endKst)]
        );
        
        const dbLogs = (rows || []).map((r: any, idx: number) => ({
          lineIndex: rows.length - idx,
          statusType: r.status_type.toLowerCase(),
          timestamp: new Date(r.created_at).toISOString(),
          storeId: r.store_id === 'N/A' ? '' : r.store_id,
          ip: r.ip,
          isApproved: !!r.is_approved,
          message: r.message
        }));
        
        // 램 버퍼 병합
        const bufferLogs = pendingLogBuffer.map((log, idx) => ({
          lineIndex: dbLogs.length + pendingLogBuffer.length - idx,
          statusType: log.statusType.toLowerCase(),
          timestamp: log.createdAt,
          storeId: log.storeId === 'N/A' ? '' : log.storeId,
          ip: log.ip,
          isApproved: log.isApproved,
          message: log.message
        })).reverse();
        
        fileLogs = [...bufferLogs, ...dbLogs];
      } catch (dbErr: any) {
        console.error('[Verify Logs Fetch DB Error] falling back to memory log list:', dbErr.message);
      }
    } else {
      // 2. [과거 조회 or 로컬 개발]: 디스크 파일 또는 스토리지 다운로드
      // 과거 로그인데 로컬 파일이 없으면 Supabase Storage에서 가져와 복원 시도
      if (!fs.existsSync(logFilePath) && !dbPool.isFallback) {
        try {
          const { supabase } = await import('../../database');
          const storagePath = `logs/local_api_log_${targetDate}.txt`;
          console.log(`[Storage Recovery] File not found in local. Pulling from Storage: ${storagePath}...`);
          
          const { data, error } = await supabase.storage
            .from('cafehaste-bucket')
            .download(storagePath);
            
          if (!error && data) {
            const text = await data.text();
            fs.writeFileSync(logFilePath, text, 'utf8');
            console.log(`[Storage Recovery Success] Restored: ${logFilePath}`);
          }
        } catch (recoverErr: any) {
          console.warn('[Storage Recovery Warn] Skipping storage pull:', recoverErr.message);
        }
      }
      
      if (fs.existsSync(logFilePath)) {
        const fileContent = fs.readFileSync(logFilePath, 'utf8');
        const lines = fileContent.split('\n').filter(Boolean);
        fileLogs = lines.map(line => {
          const cleanLine = line.replace(/\r/g, '').trim();
          // Parse format: [#12] [STATUS: PASS] [2026-06-03 10:25:46] [storex1001] [IP: 127.0.0.1] [APPROVED: PASS] - message [일간 검증요청: X회]
          const regex = /^\[#(\d+)\]\s+\[STATUS:\s+([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[IP:\s+([^\]]+)\]\s+\[APPROVED:\s+([^\]]+)\]\s+-\s+(.*)$/;
          const match = cleanLine.match(regex);
          if (match) {
            const [_, lineNo, statusType, dateStr, storeId, ip, approvedStr, msg] = match;
            return {
              lineIndex: parseInt(lineNo, 10),
              statusType: statusType.toLowerCase(), // 'pass' | 'warn' | 'risk' | 'dup'
              timestamp: new Date(`${dateStr.replace(' ', 'T')}+09:00`).toISOString(),
              storeId: storeId === 'N/A' ? '' : storeId,
              ip: ip,
              isApproved: approvedStr === 'PASS',
              message: msg
            };
          }
          
          // Fallback legacy parse format without [#index] and [STATUS: type]
          const legacyRegex = /^\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[IP:\s+([^\]]+)\]\s+\[APPROVED:\s+([^\]]+)\]\s+-\s+(.*)$/;
          const legacyMatch = cleanLine.match(legacyRegex);
          if (legacyMatch) {
            const [_, dateStr, storeId, ip, approvedStr, msg] = legacyMatch;
            const isApproved = approvedStr === 'PASS';
            const statusType = getLogStatusType(isApproved, msg);
            return {
              lineIndex: 0,
              statusType: statusType.toLowerCase(),
              timestamp: new Date(`${dateStr.replace(' ', 'T')}+09:00`).toISOString(),
              storeId: storeId === 'N/A' ? '' : storeId,
              ip: ip,
              isApproved: isApproved,
              message: msg
            };
          }
  
          return {
            lineIndex: 0,
            statusType: 'risk',
            timestamp: getKstTimeInfo().dateTimeStr.replace(' ', 'T'),
            storeId: 'Unknown',
            ip: '',
            isApproved: false,
            message: cleanLine
          };
        }).reverse(); // 최신 로그 순서 정렬
      }
      
      // 오늘 로컬 개발 모드인 경우 메모리 5분 버퍼와 기존 로컬 파일 로그 병합
      if (targetDate === todayStr && dbPool.isFallback) {
        const bufferLogs = pendingLogBuffer.map((log, idx) => ({
          lineIndex: fileLogs.length + pendingLogBuffer.length - idx,
          statusType: log.statusType.toLowerCase(),
          timestamp: log.createdAt,
          storeId: log.storeId === 'N/A' ? '' : log.storeId,
          ip: log.ip,
          isApproved: log.isApproved,
          message: log.message
        })).reverse();
        fileLogs = [...bufferLogs, ...fileLogs];
      }
    }
    
    return res.json({ logs: fileLogs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 메모리 초기화 API (화면 실시간 캐시 및 5분 램 버퍼 즉시 초기화)
router.post('/api/licenses/verify-logs/clear', async (req, res) => {
  try {
    const { pendingLogBuffer, clearVerifyApiLogs } = await import('../../db/verify-logger');
    clearVerifyApiLogs();
    pendingLogBuffer.length = 0;
    
    // 5분 인증 캐시 소거
    Object.keys(storeVerifyCache).forEach(key => {
      delete storeVerifyCache[key];
    });

    res.json({ success: true, message: '인증 로그가 정상적으로 메모리 초기화되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DB 초기화 API (실제 Supabase DB 오늘 자 데이터 및 디스크 로그 파일 + 메모리 버퍼 소거)
router.post('/api/licenses/verify-logs/clear-db', async (req, res) => {
  try {
    const { dateStr } = getKstTimeInfo();
    const { pendingLogBuffer, clearVerifyApiLogs } = await import('../../db/verify-logger');
    const dbPool = await getDbPool();
    
    // 1. 화면용 실시간 캐시 및 5분 램 버퍼 즉시 초기화
    clearVerifyApiLogs();
    pendingLogBuffer.length = 0;
    
    // 5분 인증 캐시 소거
    Object.keys(storeVerifyCache).forEach(key => {
      delete storeVerifyCache[key];
    });
    
    // 2. DB 테이블 오늘 자 데이터 삭제
    if (!dbPool.isFallback) {
      const startKst = `${dateStr} 00:00:00+09:00`;
      const endKst = `${dateStr} 23:59:59+09:00`;
      await dbPool.query(
        'DELETE FROM web_verify_logs WHERE created_at >= ? AND created_at <= ?',
        [new Date(startKst), new Date(endKst)]
      );
    }
    
    // 오늘 자 디스크 로그 파일 공란으로 초기화
    const logFilePath = path.join(process.cwd(), 'logs', `local_api_log_${dateStr}.txt`);
    if (fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, '', 'utf8');
    }

    // 3. Supabase Storage에서도 오늘 자 파일 삭제
    if (!dbPool.isFallback) {
      try {
        const { supabase } = await import('../../database');
        const storagePath = `logs/local_api_log_${dateStr}.txt`;
        await supabase.storage.from('cafehaste-bucket').remove([storagePath]);
        console.log(`[Storage Clear] Deleted today's log file from bucket: ${storagePath}`);
      } catch (storageErr: any) {
        console.warn('[Storage Clear Error] Failed to delete file from bucket:', storageErr.message);
      }
    }
    
    res.json({ success: true, message: '오늘 자 DB 및 디스크 로그가 성공적으로 초기화되었습니다.' });
  } catch (err: any) {
    console.error('Failed to clear log database:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/v1/admin/logs/flush', async (req, res) => {
  try {
    const result = await flushPendingLogs();
    res.json({ 
      success: true, 
      message: `인메모리에 적재된 인증 트래픽 로그 ${result.count}건이 디스크에 성공적으로 반영되었습니다.`, 
      count: result.count 
    });
  } catch (err: any) {
    console.error('[Verify Log Flush error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1일 단위 가용 로그 리스트 조회 API
router.get('/api/licenses/verify-logs/days', (req, res) => {
  try {
    const days = getAvailableLogDays();
    res.json({ success: true, days });
  } catch (err: any) {
    res.status(505).json({ success: false, error: err.message });
  }
});

// 1일 단위 로그 txt 파일 다운로드 API
router.get('/api/licenses/verify-logs/download', async (req, res) => {
  try {
    const { date, status } = req.query;
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, message: '조회하고자 하는 날짜 파라미터(date)가 누락되었습니다.' });
    }
    
    // Path traversal 방어용 정밀 필터링
    const safeDate = date.replace(/[^0-9\-]/g, '');
    const logFilePath = path.join(process.cwd(), 'logs', `local_api_log_${safeDate}.txt`);
    const { pendingLogBuffer, getLogStatusType } = await import('../../db/verify-logger');
    const dbPool = await getDbPool();
    
    const statusFilter = (status && typeof status === 'string') ? status.toLowerCase() : 'all';
    const todayStr = getKstTimeInfo().dateStr;
    const kstOffsetMs = 9 * 60 * 60 * 1000;
    
    // 증상 분류 헬퍼 함수
    const getStatusType = (isApproved: boolean, message: string) => {
      const msg = (message || '').toUpperCase();
      if (msg.includes('[동시성 중복]') || msg.includes('[캐시 히트]')) {
        return 'dup';
      }
      if (isApproved) {
        return 'pass';
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
        return 'warn';
      }
      return 'risk';
    };

    let logLines: any[] = [];
    
    if (safeDate === todayStr && !dbPool.isFallback) {
      // 1. [오늘자 다운로드 - 클라우드]: DB + 5분 버퍼 실시간 가공 병합
      try {
        const startKst = `${todayStr} 00:00:00+09:00`;
        const endKst = `${todayStr} 23:59:59+09:00`;
        const [rows]: any = await dbPool.query(
          'SELECT store_id, ip, is_approved, status_type, message, created_at FROM web_verify_logs WHERE created_at >= ? AND created_at <= ? ORDER BY created_at ASC',
          [new Date(startKst), new Date(endKst)]
        );
        
        const dbLogs = (rows || []).map((r: any) => ({
          storeId: r.store_id,
          ip: r.ip,
          isApproved: !!r.is_approved,
          statusType: r.status_type.toLowerCase(),
          message: r.message,
          createdAt: new Date(r.created_at).toISOString()
        }));
        
        const bufferLogs = pendingLogBuffer.map(log => ({
          storeId: log.storeId,
          ip: log.ip,
          isApproved: log.isApproved,
          statusType: log.statusType.toLowerCase(),
          message: log.message,
          createdAt: log.createdAt
        }));
        
        const combined = [...dbLogs, ...bufferLogs]; // 시간 오름차순 결합
        
        let lineCount = 1;
        logLines = combined.map(log => {
          const kstDate = new Date(new Date(log.createdAt).getTime() + kstOffsetMs);
          const yyyy = kstDate.getUTCFullYear();
          const mm = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(kstDate.getUTCDate()).padStart(2, '0');
          const hh = String(kstDate.getUTCHours()).padStart(2, '0');
          const mi = String(kstDate.getUTCMinutes()).padStart(2, '0');
          const ss = String(kstDate.getUTCSeconds()).padStart(2, '0');
          const dateTimeStr = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
          
          const line = `[#${lineCount++}] [STATUS: ${log.statusType.toUpperCase()}] [${dateTimeStr}] [${log.storeId || 'N/A'}] [IP: ${log.ip}] [APPROVED: ${log.isApproved ? 'PASS' : 'FAIL'}] - ${log.message}`;
          return {
            line,
            status: log.statusType
          };
        });
      } catch (err: any) {
        console.error('[Download DB error]', err.message);
      }
    } else {
      // 2. [과거 다운로드 or 로컬 개발]: 디스크 또는 스토리지 복원
      if (!fs.existsSync(logFilePath) && !dbPool.isFallback) {
        try {
          const { supabase } = await import('../../database');
          const storagePath = `logs/local_api_log_${safeDate}.txt`;
          console.log(`[Storage Recovery - Download] File not found. Pulling from Storage: ${storagePath}...`);
          
          const { data, error } = await supabase.storage
            .from('cafehaste-bucket')
            .download(storagePath);
            
          if (!error && data) {
            const text = await data.text();
            fs.writeFileSync(logFilePath, text, 'utf8');
            console.log(`[Storage Recovery Success - Download] Restored: ${logFilePath}`);
          }
        } catch (recoverErr: any) {
          console.warn('[Storage Recovery Download Warn]', recoverErr.message);
        }
      }
      
      const fileExists = fs.existsSync(logFilePath);
      if (fileExists) {
        const fileContent = fs.readFileSync(logFilePath, 'utf8');
        const lines = fileContent.split('\n').filter(Boolean);
        logLines = lines.map(line => {
          const cleanLine = line.replace(/\r/g, '').trim();
          // 1) 신규 포맷 파싱 시도
          const newRegex = /^\[#(\d+)\]\s+\[STATUS:\s+([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[IP:\s+([^\]]+)\]\s+\[APPROVED:\s+([^\]]+)\]\s+-\s+(.*)$/;
          const newMatch = cleanLine.match(newRegex);
          if (newMatch) {
            const [_, lineNo, statusType, dateStr, storeId, ip, approvedStr, msg] = newMatch;
            return {
              line: cleanLine,
              status: statusType.toLowerCase()
            };
          }
  
          // 2) 레거시 포맷 파싱 시도
          const regex = /^\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[IP:\s+([^\]]+)\]\s+\[APPROVED:\s+([^\]]+)\]\s+-\s+(.*)$/;
          const match = cleanLine.match(regex);
          if (match) {
            const [_, dateStr, storeId, ip, approvedStr, msg] = match;
            const isApproved = approvedStr === 'PASS';
            return {
              line: cleanLine,
              status: getStatusType(isApproved, msg)
            };
          }
  
          // 3) 폴백
          return {
            line: cleanLine,
            status: getStatusType(false, cleanLine)
          };
        });
      }
      
      // 오늘 로컬 개발 모드인 경우 메모리 5분 버퍼와 기존 로컬 파일 로그 병합
      if (safeDate === todayStr && dbPool.isFallback) {
        const bufferLogs = pendingLogBuffer.map((log, idx) => {
          const { dateTimeStr } = getKstTimeInfo(new Date(log.createdAt));
          const lineIndex = logLines.length + 1 + idx;
          const line = `[#${lineIndex}] [STATUS: ${log.statusType.toUpperCase()}] [${dateTimeStr}] [${log.storeId || 'N/A'}] [IP: ${log.ip}] [APPROVED: ${log.isApproved ? 'PASS' : 'FAIL'}] - ${log.message}`;
          return {
            line,
            status: log.statusType.toLowerCase()
          };
        });
        logLines = [...logLines, ...bufferLogs];
      }
    }
    
    if (logLines.length === 0 && !fs.existsSync(logFilePath)) {
      return res.status(404).json({ success: false, message: '해당 일자에는 기록된 전산 로그가 존재하지 않습니다.' });
    }
    
    // statusFilter에 맞춰 필터링
    let filteredLines = logLines;
    if (statusFilter !== 'all') {
      filteredLines = logLines.filter(item => item.status === statusFilter);
    }
    
    const outputText = filteredLines.map(item => item.line).join('\n') + '\n';
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="local_api_log_${safeDate}_${statusFilter}.txt"`);
    return res.send(outputText || `[${safeDate}] 해당 증상 필터(${statusFilter})에 해당하는 로그가 없습니다.\n`);
    
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
