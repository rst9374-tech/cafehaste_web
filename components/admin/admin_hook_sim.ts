import { useState, useRef, useEffect } from 'react';
import { ApiLog } from './admin_hook_licenses';

export function useAdminSimulator(
  testStoreId: string,
  licenses: any[],
  fetchApiLogs: () => void
) {
  const [simulatedLogs, setSimulatedLogs] = useState<ApiLog[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simProgress, setSimProgress] = useState<{ 
    current: number; 
    total: number; 
    expectedApproved: number;
    expectedDenied: number;
    approvedSuccess: number;
    deniedSuccess: number;
    type: 'db';
  }>({ 
    current: 0, 
    total: 0, 
    expectedApproved: 0, 
    expectedDenied: 0, 
    approvedSuccess: 0, 
    deniedSuccess: 0, 
    type: 'db' 
  });
  const simTimeoutIds = useRef<any[]>([]);

  useEffect(() => {
    return () => {
      simTimeoutIds.current.forEach(clearTimeout);
    };
  }, []);

  const runDbSimulation = async (totalCount: number) => {
    setIsSimulating(true);
    setSimulatedLogs([]);
    simTimeoutIds.current.forEach(clearTimeout);
    simTimeoutIds.current = [];

    let dbPool: any[] = [];
    try {
      const res = await fetch('/api/licenses');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.licenses) {
          dbPool = data.licenses.filter((item: any) => {
            if (!item.storeId) return false;
            const storeIdUpper = item.storeId.toUpperCase();
            return storeIdUpper.startsWith('STORE') && !storeIdUpper.startsWith('STOREX');
          });
        }
      }
    } catch (err) {
      console.error('[Simulator fetch licenses error]', err);
    }

    if (dbPool.length === 0) {
      alert('라이선스 대장에 등록된 테스트 매장(고유번호가 store로 시작하는 매장)이 없어 실제 DB 연동 트래픽 시험을 가동할 수 없습니다. 먼저 고유번호가 store로 시작하는 라이선스를 등록해 주세요.');
      setIsSimulating(false);
      return;
    }

    const targetLicenseItems: any[] = [];
    let expectedApprovedCount = 0;
    let expectedDeniedCount = 0;

    const d_sim = new Date();
    const kst_sim = new Date(d_sim.getTime() + 9 * 60 * 60 * 1000);
    const todayStr = kst_sim.toISOString().split('T')[0];

    for (let i = 0; i < totalCount; i++) {
      const targetLicense = dbPool[Math.floor(Math.random() * dbPool.length)];
      const storeId = targetLicense.storeId;
      const isApprovedActive = (Number(targetLicense.isApproved) === 1 || targetLicense.isApproved === true);
      const isNotExpired = targetLicense.licenseEndDate ? targetLicense.licenseEndDate >= todayStr : true;
      const isDbApproved = isApprovedActive && isNotExpired;

      targetLicenseItems.push({ storeId, isDbApproved });
      if (isDbApproved) {
        expectedApprovedCount++;
      } else {
        expectedDeniedCount++;
      }
    }

    setSimProgress({ 
      current: 0, 
      total: totalCount, 
      expectedApproved: expectedApprovedCount, 
      expectedDenied: expectedDeniedCount,
      approvedSuccess: 0, 
      deniedSuccess: 0, 
      type: 'db' 
    });

    for (let i = 0; i < totalCount; i++) {
      const timeoutId = setTimeout(async () => {
        const targetObj = targetLicenseItems[i];
        const storeId = targetObj.storeId;
        const isDbApproved = targetObj.isDbApproved;

        try {
          const res = await fetch('/api/v1/store/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-haste-api-key': 'HASTE_SECRET_LIVE_9363',
              'x-haste-timestamp': String(Date.now())
            },
            body: JSON.stringify({ storeId })
          });
          
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const isApproved = !!data.isApproved;
          const message = data.isApproved 
            ? '실시간 가맹 등록자 가맹 패킷 인증 성공 (APPROVED)' 
            : `가상 라이선스 차단 처리됨 (${data.reason || 'SUSPENDED/EXPIRED'})`;

          const simulatedLog: ApiLog = {
            timestamp: new Date().toISOString(),
            storeId,
            ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            isApproved,
            message: `[DB 실시간 렌덤검증] ${message}`,
            isVirtual: false
          };

          setSimulatedLogs(prev => [simulatedLog, ...prev]);
          setSimProgress(progress => {
            const nextCurrent = progress.current + 1;
            const nextApprovedSuccess = progress.approvedSuccess + (isDbApproved && isApproved ? 1 : 0);
            const nextDeniedSuccess = progress.deniedSuccess + (!isDbApproved && !isApproved ? 1 : 0);
            const isFinished = nextCurrent >= totalCount;
            if (isFinished) {
              setIsSimulating(false);
              setTimeout(() => { fetchApiLogs(); }, 400); // 시뮬 종료 후 서버 최신 로그 리로드
            }
            return {
              ...progress,
              current: nextCurrent,
              approvedSuccess: nextApprovedSuccess,
              deniedSuccess: nextDeniedSuccess
            };
          });
        } catch (err: any) {
          const simulatedLog: ApiLog = {
            timestamp: new Date().toISOString(),
            storeId,
            ip: '127.0.0.1',
            isApproved: false,
            message: `[DB 실시간 연동 에러] ${err.message || '인프라 타임아웃'}`
          };

          setSimulatedLogs(prev => [simulatedLog, ...prev]);
          setSimProgress(progress => {
            const nextCurrent = progress.current + 1;
            const nextApprovedSuccess = progress.approvedSuccess;
            const nextDeniedSuccess = progress.deniedSuccess + (!isDbApproved ? 1 : 0);
            const isFinished = nextCurrent >= totalCount;
            if (isFinished) {
              setIsSimulating(false);
            }
            return {
              ...progress,
              current: nextCurrent,
              approvedSuccess: nextApprovedSuccess,
              deniedSuccess: nextDeniedSuccess
            };
          });
        }
      }, i * (100 / simSpeed));

      simTimeoutIds.current.push(timeoutId);
    }
  };

  const handleClearSimulation = () => {
    setSimulatedLogs([]);
    simTimeoutIds.current.forEach(clearTimeout);
    simTimeoutIds.current = [];
    setIsSimulating(false);
  };

  return {
    simulatedLogs,
    isSimulating,
    simSpeed,
    setSimSpeed,
    simProgress,
    runDbSimulation,
    handleClearSimulation
  };
}
