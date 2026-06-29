import { useState, useEffect } from 'react';

export const useMemberLicenses = (
  showAlert: (title: string, message: string) => void,
  showConfirm: (title: string, message: string, onConfirm: () => void) => void,
  showTemporaryToast?: (msg: string) => void,
  showTemporaryError?: (msg: string) => void
) => {
  const [licenseStats, setLicenseStats] = useState({
    total: 0,
    requested: 0,
    active: 0,
    imminent: 0,
    expired: 0,
    suspended: 0
  });
  
  const [licenses, setLicenses] = useState<any[]>([]);
  const [cloudMembers, setCloudMembers] = useState<any[]>([]);
  const [isFetchingSub, setIsFetchingSub] = useState<boolean>(false);
  const [isProcessingToggle, setIsProcessingToggle] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState<boolean>(false);

  // 1회성 JOIN 통합 마스터 Bulk API 엔드포인트 연동
  const fetchIntegratedBulkData = async (selectedDbTable: 'CLOUD_SQL' | 'LOCAL_SIM') => {
    setIsFetchingSub(true);
    try {
      if (selectedDbTable === 'CLOUD_SQL') {
        const res = await fetch('/api/admin-master-bulk');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const lics = data.licenses || [];
            const mems = data.members || [];
            setLicenses(lics);
            setCloudMembers(mems);
            calculateStats(lics);
          }
        }
      } else {
        // 로컬 가상 시뮬레이터 백업본 연동
        const localLicsSaved = localStorage.getItem('haste_sim_licenses');
        const lics = localLicsSaved ? JSON.parse(localLicsSaved) : [];
        setLicenses(lics);
        calculateStats(lics);
      }
    } catch (e) {
      console.error('Error fetching master bulk data:', e);
    } finally {
      setIsFetchingSub(false);
    }
  };

  const calculateStats = (lics: any[]) => {
    const total = lics.length;
    let requested = 0;
    let active = 0;
    let imminent = 0;
    let expired = 0;
    let suspended = 0;

    lics.forEach((l: any) => {
      if (Number(l.isApproved) === 2) {
        requested++;
        return;
      }
      
      const isApprovedActive = Number(l.isApproved) === 1;
      const isNotExpired = new Date(l.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();
      
      if (!isApprovedActive) {
        suspended++;
        return;
      }
      
      if (!isNotExpired) {
        expired++;
        return;
      }

      const timeDiff = new Date(l.licenseEndDate + 'T23:59:59').getTime() - new Date().getTime();
      const isImminent = timeDiff > 0 && timeDiff < 30 * 24 * 60 * 60 * 1000;

      if (isImminent) {
        imminent++;
      } else {
        active++;
      }
    });

    setLicenseStats({ total, requested, active, imminent, expired, suspended });
  };

  // 실시간 라이선스 조작 제어 / 가동 및 정지 토글 수술
  const quickToggleLicense = async (memberId: string, action: 'APPROVE' | 'SUSPEND', selectedDbTable: 'CLOUD_SQL' | 'LOCAL_SIM', months?: number) => {
    if (selectedDbTable !== 'CLOUD_SQL') {
      showAlert('알림', '로컬 시뮬레이터에서는 수정 폼을 이용해 라이선스를 조작할 수 있습니다.');
      return;
    }

    setIsProcessingToggle(memberId);
    try {
      const res = await fetch('/api/licenses/quick-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId, action, months }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (showTemporaryToast) {
          showTemporaryToast(`실시간 ${action === 'APPROVE' ? (months ? `${months}달 인증 승인` : '인증 승인') : '가동 정지'} 설정 및 인메모리 포스 캐시파괴(Bust)를 즉각 완료했습니다.`);
        } else {
          showAlert('조작 성공', `실시간 조작 및 인메모리 검문소 인증캐시 버스트가 완료되었습니다.`);
        }
        // 즉시 마스터 벌크 동기화로 화면 미동전환 리프레시
        await fetchIntegratedBulkData('CLOUD_SQL');
      } else {
        if (showTemporaryError) {
          showTemporaryError(data.message || '라이선스 실시간 조작에 실패했습니다.');
        } else {
          showAlert('실패', data.message || '라이선스 조작 실패');
        }
      }
    } catch (err: any) {
      console.error(err);
      showAlert('통신 가드 오류', err.message || '서버와의 통신이 원활하지 않습니다.');
    } finally {
      setIsProcessingToggle(null);
    }
  };

  const isLicenseActive = (storeCode: string) => {
    if (!storeCode) return false;
    const license = licenses.find(
      (l: any) => l.storeId === storeCode || (l.storeId && l.storeId.trim() === storeCode.trim())
    );
    if (!license) return false;
    
    const isApprovedActive = Number(license.isApproved) === 1;
    const isNotExpired = new Date(license.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();
    
    return isApprovedActive && isNotExpired;
  };

  const isLicenseRegistered = (member: any) => {
    if (!member) return false;
    const storeCode = member.storeCode ? member.storeCode.trim() : '';
    const fallbackId = `없음_${member.id}`;
    return licenses.some((l: any) => {
      const dbStoreId = l.storeId ? l.storeId.trim() : '';
      if (storeCode && dbStoreId === storeCode) return true;
      if (dbStoreId === fallbackId) return true;
      return false;
    });
  };

  const handleCopyToLicenses = (member: any) => {
    if (isCopying) return;
    const rawStoreId = member.storeCode || '';
    const finalStoreId = rawStoreId ? rawStoreId.trim() : `없음_${member.id}`;
    const finalStoreName = member.storeName ? member.storeName.trim() : '없음';

    if (isLicenseRegistered(member)) {
      showAlert('이미 등록됨', '이 회원은 이미 라이선스 관리대장에 등록되어 있습니다.');
      return;
    }

    showConfirm(
      '라이선스 대장 복제 등록',
      `[${finalStoreName}] 매장 정보를 통합 마스터 라이선스 관리대장에 '요청' 상태로 복사 생성하시겠습니까?`,
      async () => {
        setIsCopying(true);
        try {
          const payload = {
            storeName: finalStoreName,
            storeId: finalStoreId,
            licenseStartDate: new Date().toISOString().substring(0, 10),
            licenseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().substring(0, 10),
            isApproved: 2, // '요청' 상태 대기코드
            storeGrade: member.storeType === '프리미엄' ? 'PREMIUM' : 'STANDARD'
          };

          const res = await fetch('/api/licenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (res.ok && data.success) {
            showAlert('생성 성공', `'${finalStoreName}' 라이선스가 대장에 복제 생성되었습니다.`);
            await fetchIntegratedBulkData('CLOUD_SQL');
          } else {
            showAlert('이동 실패', data.message || '복사하지 못했습니다.');
          }
        } catch (err: any) {
          showAlert('소통 오류', '에러: ' + err.message);
        } finally {
          setIsCopying(false);
        }
      }
    );
  };

  const handleUpdateStoreGrade = async (memberId: string, storeGrade: 'STANDARD' | 'PREMIUM', selectedDbTable: 'CLOUD_SQL' | 'LOCAL_SIM') => {
    const numericId = memberId.replace('DB-HST-', '');
    if (selectedDbTable === 'CLOUD_SQL') {
      try {
        const res = await fetch(`/api/registered-members/${numericId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storeGrade })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (showTemporaryToast) showTemporaryToast('솔루션 등급이 성공적으로 업데이트되었습니다.');
          await fetchIntegratedBulkData('CLOUD_SQL');
        } else {
          if (showTemporaryError) showTemporaryError(data.message || '등급 수정 실패');
        }
      } catch (err: any) {
        if (showTemporaryError) showTemporaryError(err.message);
      }
    } else {
      // Local sim update
      const localLicsSaved = localStorage.getItem('haste_sim_licenses');
      const lics = localLicsSaved ? JSON.parse(localLicsSaved) : [];
      const idx = lics.findIndex((l: any) => l.storeId === memberId || l.id === Number(memberId));
      if (idx !== -1) {
        lics[idx].storeGrade = storeGrade;
        localStorage.setItem('haste_sim_licenses', JSON.stringify(lics));
        calculateStats(lics);
        if (showTemporaryToast) showTemporaryToast('로컬 시뮬레이터 솔루션 등급이 수정되었습니다.');
      }
    }
  };

  return {
    licenseStats,
    licenses,
    cloudMembers,
    isFetchingSub,
    isProcessingToggle,
    isCopying,
    fetchIntegratedBulkData,
    quickToggleLicense,
    isLicenseActive,
    isLicenseRegistered,
    handleCopyToLicenses,
    handleUpdateStoreGrade
  };
};
