import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ApiLog } from './admin_hook_licenses';
import { AdminCompValidatorLogBoard } from './admin_comp_validator_logboard';
import { useAdminSimulator } from './admin_hook_sim';
import { AdminValidatorControl } from './admin_comp_validator_control';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface AdminLicensesValidatorProps {
  testStoreId: string;
  setTestStoreId: (storeId: string) => void;
  testApiKey: string;
  setTestApiKey: (key: string) => void;
  testResult: any;
  isTesting: boolean;
  apiLogs: ApiLog[];
  isLoadingLogs: boolean;
  setIsKioskPopupOpen: (b: boolean) => void;
  handleClearLogs: () => void;
  handleClearDbLogs: () => void;
  handleTestVerify: () => void;
  logAnalysis: {
    status: string;
    label: string;
    color: string;
    rate: number;
    deniedCount: number;
  };
  fetchApiLogs: () => void;
  fetchLicenses?: () => void;
  dbSize: number | null;
  licenses?: any[];
}

export const AdminLicensesValidator: React.FC<AdminLicensesValidatorProps> = ({
  testStoreId,
  setTestStoreId,
  testApiKey,
  setTestApiKey,
  testResult,
  isTesting,
  apiLogs,
  isLoadingLogs,
  setIsKioskPopupOpen,
  handleClearLogs,
  handleClearDbLogs,
  handleTestVerify,
  logAnalysis,
  fetchApiLogs,
  fetchLicenses,
  dbSize,
  licenses = []
}) => {
  const [logDays, setLogDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
  });
  const [localLogs, setLocalLogs] = useState<ApiLog[] | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState<boolean>(false);
  const [isSavingLogs, setIsSavingLogs] = useState<boolean>(false);
  const [flushStatus, setFlushStatus] = useState<string | null>(null);
  const [hasFlushed, setHasFlushed] = useState<boolean>(false);
  const isInitialLoad = useRef<boolean>(true);
  const useRefInitial = useRef<boolean>(true);
  const [isMonitorOpen, setIsMonitorOpen] = useState<boolean>(false);

  // Adopt simulator logic hook
  const sim = useAdminSimulator(testStoreId, licenses, fetchApiLogs);

  const handleFlushLogs = async () => {
    setIsSavingLogs(true);
    setFlushStatus('저장 중...');
    try {
      const res = await fetch('/api/v1/admin/logs/flush', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setFlushStatus(data.message || '저장 성공!');
        setHasFlushed(true);
        fetchLogDays();
      } else {
        setFlushStatus('저장 실패!');
      }
    } catch (err: any) {
      console.error(err);
      setFlushStatus('통신 실패!');
    } finally {
      setIsSavingLogs(false);
      setTimeout(() => setFlushStatus(null), 2500);
    }
  };

  const fetchLogDays = async () => {
    try {
      const res = await fetch('/api/licenses/verify-logs/days');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.days) {
          setLogDays(data.days);
          if (data.days.length > 0) {
            if (useRefInitial.current) {
              setSelectedDate(data.days[0]);
              useRefInitial.current = false;
            } else if (!selectedDate) {
              setSelectedDate(data.days[0]);
            }
          }
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    const loadSelectedDateLogs = async () => {
      if (!selectedDate) return;
      const d_load = new Date();
      const kst_load = new Date(d_load.getTime() + 9 * 60 * 60 * 1000);
      const todayStr = kst_load.toISOString().split('T')[0];
      
      if (selectedDate === todayStr) {
        setLocalLogs(null);
        return;
      }

      setIsLoadingLocal(true);
      try {
        const res = await fetch(`/api/licenses/verify-logs?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          if (data.logs) setLocalLogs(data.logs);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setIsLoadingLocal(false);
      }
    };
    loadSelectedDateLogs();
  }, [selectedDate]);

  useEffect(() => {
    fetchLogDays();
    const d_ref = new Date();
    const kst_ref = new Date(d_ref.getTime() + 9 * 60 * 60 * 1000);
    const todayStr = kst_ref.toISOString().split('T')[0];
    if (selectedDate === todayStr) setLocalLogs(null);
  }, [apiLogs]);

  const serverLogs = localLogs !== null ? localLogs : apiLogs;

  const leftLogs = useMemo(() => {
    const combined = [
      ...sim.simulatedLogs,
      ...serverLogs
    ];
    return combined.filter(log => {
      const storeId = (log.storeId || '').trim().toUpperCase();
      return storeId !== '' && log.isVirtual !== true && storeId.startsWith('STORE') && !storeId.startsWith('STOREX');
    });
  }, [sim.simulatedLogs, serverLogs]);

  const rightLogs = useMemo(() => {
    const combined = [
      ...sim.simulatedLogs,
      ...serverLogs
    ];
    return combined.filter(log => {
      const storeId = (log.storeId || '').trim().toUpperCase();
      return log.isVirtual === true || storeId.startsWith('STOREX') || !storeId.startsWith('STORE');
    });
  }, [sim.simulatedLogs, serverLogs]);

  const [terminalPage, setTerminalPage] = useState<number>(1);

  useEffect(() => {
    setTerminalPage(1);
  }, [sim.simulatedLogs.length]);

  const paginatedTerminalLogs = useMemo(() => {
    const startIndex = (terminalPage - 1) * 100;
    return rightLogs.slice(startIndex, startIndex + 100);
  }, [rightLogs, terminalPage]);

  const totalTerminalPages = Math.ceil(rightLogs.length / 100) || 1;
  const isCurrentlyLoading = isLoadingLogs || isLoadingLocal;

  // Filter and compute status for test accounts store123456 ~ store123460
  const testAccounts = useMemo(() => {
    const targets = ['store123456', 'store123457', 'store123458', 'store123459', 'store123460'];
    return targets.map(storeId => {
      const found = licenses.find(l => (l.storeId || '').toLowerCase() === storeId.toLowerCase());
      
      let storeName = '미지정 매장';
      let storeGrade = 'PREMIUM';
      let statusLabel = '미등록';
      let statusColor = 'text-stone-400 bg-stone-100 border-stone-200';
      let expireDate = '-';

      if (found) {
        storeName = found.storeName;
        storeGrade = found.storeGrade || 'PREMIUM';
        expireDate = found.licenseEndDate || '-';
        
        const isNotExpired = expireDate !== '-' ? (new Date(`${expireDate}T23:59:59`).getTime() >= Date.now()) : false;
        
        if (Number(found.isApproved) === 1 && isNotExpired) {
          statusLabel = '인증 완료';
          statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        } else if (Number(found.isApproved) === 1 && !isNotExpired) {
          statusLabel = '기간 만료';
          statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
        } else if (Number(found.isApproved) === 0) {
          statusLabel = '가동 정지중';
          statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
        } else if (Number(found.isApproved) === 2) {
          statusLabel = '인증 대기';
          statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
        }
      } else {
        // Fallback mockup values if DB fetch fails or has not loaded yet
        if (storeId === 'store123456') { storeName = '테스트강남본점'; statusLabel = '인증 완료'; statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'; expireDate = '2026-12-31'; }
        else if (storeId === 'store123457') { storeName = '테스트역삼지점'; storeGrade = 'STANDARD'; statusLabel = '인증 완료'; statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'; expireDate = '2026-08-15'; }
        else if (storeId === 'store123458') { storeName = '테스트홍대입구역점'; statusLabel = '기간 만료'; statusColor = 'text-amber-700 bg-amber-50 border-amber-200'; expireDate = '2026-05-01'; }
        else if (storeId === 'store123459') { storeName = '테스트부산서면점'; statusLabel = '가동 정지중'; statusColor = 'text-rose-700 bg-rose-50 border-rose-200'; expireDate = '2027-03-01'; }
        else if (storeId === 'store123460') { storeName = '테스트신규가맹점'; statusLabel = '인증 대기'; statusColor = 'text-blue-700 bg-blue-50 border-blue-200'; expireDate = '2027-06-01'; }
      }

      return {
        storeId,
        storeName,
        storeGrade,
        statusLabel,
        statusColor,
        expireDate
      };
    });
  }, [licenses]);

  return (
    <div className="space-y-4 w-full max-w-[1400px] mx-auto text-left">
      <div className="flex items-center justify-between border-b border-stone-900 pb-2 mb-2 select-none">
        <div className="flex items-center gap-1.5 font-bold text-xs bg-[#E33535] text-white p-1.5 px-3 rounded-lg border border-[#ff4e4e] animate-pulse">
          <ShieldAlert size={12} />
          <span>실시간 하이재킹 모니터 검문소</span>
        </div>
        
        {/* Toggle button to open/hide right monitor control panel */}
        <button
          type="button"
          onClick={() => setIsMonitorOpen(prev => !prev)}
          className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          {isMonitorOpen ? (
            <>
              <EyeOff size={13} className="text-[#C5A059]" />
              <span>검증 모니터 접기</span>
            </>
          ) : (
            <>
              <Eye size={13} className="text-[#C5A059]" />
              <span>검증 모니터 열기</span>
            </>
          )}
        </button>
      </div>

      <div
        id="admin-licenses-validator-container"
        className={`grid grid-cols-1 ${isMonitorOpen ? 'lg:grid-cols-10' : 'w-full'} gap-5 w-full`}
      >
        <div className={isMonitorOpen ? 'lg:col-span-7' : 'w-full'}>
          <AdminCompValidatorLogBoard
            displayLogs={leftLogs}
            isCurrentlyLoading={isCurrentlyLoading}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            handleFlushLogs={handleFlushLogs}
            flushStatus={flushStatus}
            isSavingLogs={isSavingLogs}
            hasFlushed={hasFlushed}
            logDays={logDays}
            licenses={licenses}
            onRefresh={() => {
              fetchApiLogs();
              if (fetchLicenses) fetchLicenses();
            }}
            handleClearLogs={() => {
              sim.handleClearSimulation();
              handleClearLogs();
            }}
            handleClearDbLogs={() => {
              sim.handleClearSimulation();
              handleClearDbLogs();
            }}
          />
        </div>

        {isMonitorOpen && (
          <div className="lg:col-span-3">
            <AdminValidatorControl
              testStoreId={testStoreId}
              setTestStoreId={setTestStoreId}
              testApiKey={testApiKey}
              setTestApiKey={setTestApiKey}
              handleTestVerify={handleTestVerify}
              isTesting={isTesting}
              isLoadingLogs={isLoadingLogs}
              dbSize={dbSize}
              logAnalysis={logAnalysis}
              setIsKioskPopupOpen={setIsKioskPopupOpen}
              handleClearLogs={() => {
                sim.handleClearSimulation();
                handleClearLogs();
              }}
              handleClearSimulation={sim.handleClearSimulation}
              isSimulating={sim.isSimulating}
              simSpeed={sim.simSpeed}
              setSimSpeed={sim.setSimSpeed}
              simProgress={sim.simProgress}
              runDbSimulation={sim.runDbSimulation}
              fetchApiLogs={fetchApiLogs}
              fetchLicenses={fetchLicenses}
              testResult={testResult}
              testAccounts={testAccounts}
            />
          </div>
        )}
      </div>
    </div>
  );
};
