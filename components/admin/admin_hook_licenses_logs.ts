import { useState, useCallback, useMemo, useEffect } from 'react';

export interface ApiLog {
  timestamp: string;
  storeId: string;
  ip: string;
  isApproved: boolean;
  message: string;
  statusType?: string;
  lineIndex?: number;
  isVirtual?: boolean;
  createdAt?: string;
}

export const useAdminLicensesLogs = (
  showToast: (msg: string, type?: 'success' | 'error') => void,
  isKioskPopupOpen: boolean,
  fetchDbSize: () => Promise<void>
) => {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [testStoreId, setTestStoreId] = useState('storex123456');
  const [testApiKey, setTestApiKey] = useState('HASTE_SECRET_LIVE_9363');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchApiLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/licenses/verify-logs');
      if (res.ok) {
        const data = await res.json();
        setApiLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch verify logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchApiLogs();
  }, [fetchApiLogs]);

  useEffect(() => {
    if (isKioskPopupOpen) {
      fetchDbSize();
    }
  }, [isKioskPopupOpen, fetchDbSize]);

  const handleClearLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/licenses/verify-logs/clear', { method: 'POST' });
      if (res.ok) {
        setApiLogs([]);
        showToast('실시간 검증 로그 목록을 초기화했습니다.');
      }
    } catch (e: any) {
      showToast('로그 초기화 실패: ' + e.message, 'error');
    }
  }, [showToast]);

  const handleClearDbLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/licenses/verify-logs/clear-db', { method: 'POST' });
      if (res.ok) {
        setApiLogs([]);
        showToast('실제 DB 및 디스크 로그를 성공적으로 삭제했습니다.');
      }
    } catch (e: any) {
      showToast('DB 로그 초기화 실패: ' + e.message, 'error');
    }
  }, [showToast]);

  const handleTestVerify = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/store/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-haste-api-key': testApiKey.trim(),
          'x-haste-timestamp': String(Date.now())
        },
        body: JSON.stringify({ storeId: testStoreId.trim() })
      });
      const data = await res.json();
      setTestResult(data);
      await fetchApiLogs();
    } catch (err: any) {
      setTestResult({ isApproved: false, message: '연동 에러: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  }, [testStoreId, testApiKey, fetchApiLogs]);

  // Log Diagnostics Map
  const storeLogStatusMap = useMemo(() => {
    const map: Record<string, {
      status: 'green' | 'yellow' | 'red';
      label: string;
      color: string;
      dotColor: string;
      deniedCount: number;
      total: number;
      rate: number;
    }> = {};

    if (apiLogs.length === 0) return map;
    const storeLogsGroup: Record<string, ApiLog[]> = {};
    apiLogs.forEach(log => {
      if (!log.storeId) return;
      if (!storeLogsGroup[log.storeId]) storeLogsGroup[log.storeId] = [];
      storeLogsGroup[log.storeId].push(log);
    });

    Object.keys(storeLogsGroup).forEach(storeId => {
      const logs = storeLogsGroup[storeId];
      const total = logs.length;
      const deniedCount = logs.filter(l => !l.isApproved).length;
      const rate = total > 0 ? Math.round((deniedCount / total) * 100) : 0;

      if (deniedCount === 0) {
        map[storeId] = {
          status: 'green', label: '안정',
          color: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
          dotColor: 'bg-emerald-500', deniedCount, total, rate
        };
      } else if (deniedCount >= 4 || rate > 30) {
        map[storeId] = {
          status: 'red', label: '위험',
          color: 'text-rose-700 bg-rose-50 border border-rose-200/60 font-semibold shadow-sm',
          dotColor: 'bg-rose-500 animate-bounce', deniedCount, total, rate
        };
      } else {
        map[storeId] = {
          status: 'yellow', label: '주의',
          color: 'text-amber-700 bg-amber-50 border border-amber-200/60',
          dotColor: 'bg-amber-500', deniedCount, total, rate
        };
      }
    });

    return map;
  }, [apiLogs]);

  const getStoreLogStatus = useCallback((storeId: string) => {
    return storeLogStatusMap[storeId] || {
      status: 'green', label: '안정',
      color: 'text-emerald-700 bg-emerald-50/50 border border-emerald-100/50',
      dotColor: 'bg-emerald-400', deniedCount: 0, total: 0, rate: 0
    };
  }, [storeLogStatusMap]);

  const logAnalysis = useMemo(() => {
    if (apiLogs.length === 0) {
      return { status: 'neutral', label: '대기 중', color: 'text-stone-400 border-stone-800 bg-stone-900', rate: 0, deniedCount: 0 };
    }
    const total = apiLogs.length;
    const deniedCount = apiLogs.filter(l => !l.isApproved).length;
    const rate = Math.round((deniedCount / total) * 100);

    if (deniedCount === 0) {
      return { status: 'green', label: '정상 작동 (안정)', color: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/40 text-[10px]', rate, deniedCount };
    } else if (deniedCount >= 4 || rate > 30) {
      return { status: 'red', label: '장애 의심 (위험)', color: 'text-rose-400 border-rose-900/50 bg-rose-950/40 text-[10px]', rate, deniedCount };
    } else {
      return { status: 'yellow', label: '이상 신호 (주의)', color: 'text-amber-400 border-amber-900/50 bg-amber-950/40 text-[10px]', rate, deniedCount };
    }
  }, [apiLogs]);

  return {
    apiLogs,
    setApiLogs,
    isLoadingLogs,
    setIsLoadingLogs,
    testStoreId,
    setTestStoreId,
    testApiKey,
    setTestApiKey,
    testResult,
    setTestResult,
    isTesting,
    setIsTesting,
    fetchApiLogs,
    handleClearLogs,
    handleClearDbLogs,
    handleTestVerify,
    getStoreLogStatus,
    logAnalysis
  };
};
