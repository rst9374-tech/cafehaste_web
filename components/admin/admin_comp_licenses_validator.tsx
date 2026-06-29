import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ApiLog } from './admin_hook_licenses';
import { AdminCompValidatorLogBoard } from './admin_comp_validator_logboard';
import { useAdminSimulator } from './admin_hook_sim';
import { AdminValidatorControl } from './admin_comp_validator_control';

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

  return (
    <div id="admin-licenses-validator-container" className="grid grid-cols-1 xl:grid-cols-12 gap-5 text-left"> {/* temp: select-none */}
      <div className="xl:col-span-7">
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
      />
    </div>
  );
};
