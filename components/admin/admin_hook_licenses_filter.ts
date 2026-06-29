import { useState, useMemo, useCallback } from 'react';
import { License } from './admin_hook_licenses';

export function useAdminLicensesFilter(
  licenses: License[],
  setLicenses: React.Dispatch<React.SetStateAction<License[]>>,
  selectedLicenseIds: number[],
  setSelectedLicenseIds: React.Dispatch<React.SetStateAction<number[]>>,
  statusFilter: 'ALL' | 'REQUESTED' | 'ACTIVE' | 'IMMINENT' | 'EXPIRED' | 'SUSPENDED' | undefined,
  showOnlyTestLicenses: boolean,
  searchQuery: string,
  isTestLicense: (lic: any) => boolean,
  setConfirmModal: (val: any) => void,
  setIsLoading: (val: boolean) => void,
  showToast: (message: string, type?: 'success' | 'error') => void,
  fetchLicenses: () => Promise<void>
) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'desc' });

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const getSortIcon = useCallback((key: string) => {
    if (!sortConfig || sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  }, [sortConfig]);

  const handleBulkExtend = useCallback((months: number) => {
    if (selectedLicenseIds.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updateTargets: { license: License; newStartDate: string; newEndDate: string }[] = [];

    for (const id of selectedLicenseIds) {
      const lic = licenses.find(l => l.id === id);
      if (!lic) continue;

      const baseDate = new Date(todayStr);
      const end = new Date(baseDate.getTime());
      end.setMonth(end.getMonth() + months);
      const proposedEndDateStr = end.toISOString().split('T')[0];

      updateTargets.push({
        license: lic,
        newStartDate: todayStr,
        newEndDate: proposedEndDateStr
      });
    }

    setConfirmModal({
      message: `선택한 ${selectedLicenseIds.length}개 매장의 라이선스 종료일을 오늘(${todayStr}) 기준으로 일괄 [${months}달] 후로 변경하시겠습니까?\n(기존 종료일과 상관없이 오늘 날짜 기준으로 종료일이 업데이트됩니다.)`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          for (const target of updateTargets) {
            const { license, newStartDate, newEndDate } = target;
            const payload = {
              storeName: license.storeName,
              storeId: license.storeId,
              licenseStartDate: newStartDate,
              licenseEndDate: newEndDate,
              isApproved: 1,
              storeGrade: license.storeGrade || 'PREMIUM'
            };

            let success = false;
            try {
              const res = await fetch(`/api/licenses/${license.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              if (res.ok) {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const data = await res.json();
                  if (data.success) success = true;
                }
              }
            } catch (err) {}

            if (!success) {
              setLicenses(prev => prev.map(l => l.id === license.id ? { ...l, ...payload } : l));
            }
          }
          showToast(`선택한 매장들의 라이선스 기간을 성공적으로 [${months}달]로 설정하였습니다!`, 'success');
          setSelectedLicenseIds([]);
          fetchLicenses();
        } catch (err: any) {
          showToast('일괄 라이선스 연장 작업 중 에러 발생: ' + err.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  }, [licenses, selectedLicenseIds, fetchLicenses, showToast, setConfirmModal, setIsLoading, setSelectedLicenseIds, setLicenses]);

  const filteredLicenses = useMemo(() => {
    let list = licenses;
    if (statusFilter && statusFilter !== 'ALL') {
      const now = new Date().getTime();
      list = list.filter(l => {
        const isNotExpired = new Date(l.licenseEndDate + 'T23:59:59').getTime() >= now;
        const timeDiff = new Date(l.licenseEndDate + 'T23:59:59').getTime() - now;
        const isImminent = timeDiff > 0 && timeDiff < 30 * 24 * 60 * 60 * 1000;

        if (statusFilter === 'REQUESTED') return Number(l.isApproved) === 2;
        if (statusFilter === 'ACTIVE') return Number(l.isApproved) === 1 && isNotExpired && !isImminent;
        if (statusFilter === 'IMMINENT') return Number(l.isApproved) === 1 && isNotExpired && isImminent;
        if (statusFilter === 'EXPIRED') return Number(l.isApproved) !== 2 && !isNotExpired;
        if (statusFilter === 'SUSPENDED') return Number(l.isApproved) === 0 && isNotExpired;
        return true;
      });
    }
    if (showOnlyTestLicenses) {
      list = list.filter(lic => isTestLicense(lic));
    }
    const query = searchQuery.toLowerCase();
    if (!query) return list;
    return list.filter(lic => (
      lic.storeName.toLowerCase().includes(query) ||
      lic.storeId.toLowerCase().includes(query) ||
      lic.storeGrade.toLowerCase().includes(query)
    ));
  }, [licenses, searchQuery, showOnlyTestLicenses, isTestLicense, statusFilter]);

  const sortedLicenses = useMemo(() => {
    let sorted = [...filteredLicenses];
    if (!sortConfig) return sorted;
    sorted.sort((a, b) => {
      let valA: any = a[sortConfig.key as keyof License];
      let valB: any = b[sortConfig.key as keyof License];
      
      if (sortConfig.key === 'isApproved') {
        const isNotExpiredA = new Date(a.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();
        const statusA = (a.isApproved === 1 && isNotExpiredA) ? '인증' : !isNotExpiredA ? '만료' : '정지';
        const isNotExpiredB = new Date(b.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();
        const statusB = (b.isApproved === 1 && isNotExpiredB) ? '인증' : !isNotExpiredB ? '만료' : '정지';
        valA = statusA;
        valB = statusB;
      }
      
      if (typeof valA === 'string') valA = valA.trim();
      if (typeof valB === 'string') valB = valB.trim();
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredLicenses, sortConfig]);

  return {
    sortConfig,
    setSortConfig,
    handleSort,
    getSortIcon,
    handleBulkExtend,
    filteredLicenses,
    sortedLicenses
  };
}
