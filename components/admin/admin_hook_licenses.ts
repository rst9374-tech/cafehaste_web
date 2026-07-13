import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminLicensesFilter } from './admin_hook_licenses_filter';
import { useAdminLicensesLogs, ApiLog as BaseApiLog } from './admin_hook_licenses_logs';

export interface ApiLog extends BaseApiLog {
  statusType?: string;
  lineIndex?: number;
}

export interface License {
  id: number;
  storeName: string;
  storeId: string;
  licenseStartDate: string;
  licenseEndDate: string;
  isApproved: number;
  storeGrade: string;
  password?: string;
}

interface UseAdminLicensesProps {
  cloudDbInfo: any;
  statusFilter?: 'ALL' | 'REQUESTED' | 'ACTIVE' | 'IMMINENT' | 'EXPIRED' | 'SUSPENDED';
}

const ITEMS_PER_PAGE = 100;

export const useAdminLicenses = ({ cloudDbInfo, statusFilter }: UseAdminLicensesProps) => {
  const [licenses, setLicenses] = useState<License[]>(() => {
    try {
      const saved = localStorage.getItem('haste_mock_licenses');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        storeName: '하스테 카페 강남본점',
        storeId: 'gangnam-01',
        licenseStartDate: '2026-01-01',
        licenseEndDate: '2026-12-31',
        isApproved: 1,
        storeGrade: 'PREMIUM'
      },
      {
        id: 2,
        storeName: '하스테 카페 홍대직영점',
        storeId: 'hongdae-02',
        licenseStartDate: '2026-03-01',
        licenseEndDate: '2027-02-28',
        isApproved: 1,
        storeGrade: 'STANDARDBASE'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('haste_mock_licenses', JSON.stringify(licenses));
  }, [licenses]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyTestLicenses, setShowOnlyTestLicenses] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sorting & Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLicenseIds, setSelectedLicenseIds] = useState<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [passwordConfirmModal, setPasswordConfirmModal] = useState<{
    message: string;
    onVerifiedConfirm: () => void;
    error?: string;
  } | null>(null);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);

  // Form values
  const [storeName, setStoreName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [licenseStartDate, setLicenseStartDate] = useState('');
  const [licenseEndDate, setLicenseEndDate] = useState('');
  const [isApproved, setIsApproved] = useState(1);
  const [storeGrade, setStoreGrade] = useState('PREMIUM');
  const [password, setPassword] = useState('');

  // Copy success indicator
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Guidebook fold/collapse states
  const [showGuidebook, setShowGuidebook] = useState<boolean>(() => {
    try {
      return localStorage.getItem('haste_licenses_show_guidebook') !== 'false';
    } catch {
      return true;
    }
  });

  const [showMemberGuide, setShowMemberGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem('haste_licenses_show_member_guide') !== 'false';
    } catch {
      return true;
    }
  });

  const [isKioskPopupOpen, setIsKioskPopupOpen] = useState(false);
  const [dbSize, setDbSize] = useState<number | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchDbSize = useCallback(async () => {
    try {
      const res = await fetch('/api/db-info');
      const data = await res.json();
      if (data.success) {
        setDbSize(data.sizeMb);
      }
    } catch (e) {
      console.error('Failed to fetch DB size:', e);
    }
  }, []);

  const fetchLicenses = useCallback(async () => {
    setIsLoading(true);
    try {
      fetchDbSize();
      const res = await fetch('/api/licenses');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success) {
            setLicenses(data.licenses || []);
            return;
          }
        }
      }
    } catch (e: any) {
      console.warn('[Licenses API Fallback]', e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDbSize]);

  useEffect(() => {
    fetchLicenses();
    fetchDbSize();
  }, [fetchLicenses, fetchDbSize]);

  const isTestLicense = useCallback((lic: any) => {
    if (!lic) return false;
    const sName = (lic.storeName || '').toLowerCase();
    const sId = (lic.storeId || '').toLowerCase();
    return (
      sName.includes('테스트') || sName.includes('test') ||
      sId.includes('test') || sId.includes('store') ||
      sName.includes('store')
    );
  }, []);

  const handleSetDuration = useCallback((months: number) => {
    let startStr = licenseStartDate;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (!startStr) {
      startStr = todayStr;
      setLicenseStartDate(startStr);
    } else if (startStr < todayStr) {
      startStr = todayStr;
      setLicenseStartDate(startStr);
    }
    
    const baseDate = new Date(startStr);
    if (isNaN(baseDate.getTime())) return;
    
    const end = new Date(baseDate.getTime());
    end.setMonth(end.getMonth() + months);
    
    setLicenseEndDate(end.toISOString().split('T')[0]);
  }, [licenseStartDate]);

  const handleToggleGuidebook = useCallback(() => {
    setShowGuidebook(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haste_licenses_show_guidebook', String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleToggleMemberGuide = useCallback(() => {
    setShowMemberGuide(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haste_licenses_show_member_guide', String(next));
      } catch {}
      return next;
    });
  }, []);

  const openAddModal = useCallback(() => {
    setEditingLicense(null);
    setStoreName('');
    setStoreId('');
    setPassword('');
    
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    
    setLicenseStartDate(today);
    setLicenseEndDate(nextYearStr);
    setIsApproved(1);
    setStoreGrade('PREMIUM');
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((license: License) => {
    setEditingLicense(license);
    setStoreName(license.storeName);
    setStoreId(license.storeId);
    setLicenseStartDate(license.licenseStartDate);
    setLicenseEndDate(license.licenseEndDate);
    setIsApproved(license.isApproved);
    setStoreGrade(license.storeGrade);
    setPassword(license.password || '');
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !storeId.trim() || !licenseStartDate || !licenseEndDate) {
      showToast('필수 입력값을 확인해주세요.', 'error');
      return;
    }

    const payload = {
      storeName,
      storeId: storeId.trim(),
      licenseStartDate,
      licenseEndDate,
      isApproved,
      storeGrade,
      password
    };

    let success = false;
    try {
      const url = editingLicense ? `/api/licenses/${editingLicense.id}` : '/api/licenses';
      const method = editingLicense ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          success = true;
          showToast(data.message || '완료되었습니다.');
        }
      }
    } catch (err) {}

    if (!success) {
      if (editingLicense) {
        setLicenses(prev => prev.map(l => l.id === editingLicense.id ? { ...l, ...payload } : l));
        showToast('라이선스가 성공적으로 갱신 수정되었습니다 (로컬 저장).');
      } else {
        const newId = licenses.length > 0 ? Math.max(...licenses.map(l => l.id)) + 1 : 1;
        setLicenses(prev => [...prev, { id: newId, ...payload }]);
        showToast('라이선스가 성공적으로 발급 등록되었습니다 (로컬 저장).');
      }
    }
    setIsModalOpen(false);
    fetchLicenses();
  }, [storeName, storeId, licenseStartDate, licenseEndDate, isApproved, storeGrade, password, editingLicense, licenses, fetchLicenses, showToast]);

  const handleDeleteParams = useCallback((id: number, name: string) => {
    const lic = licenses.find(l => l.id === id);
    const isNotExpired = lic ? (new Date(lic.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime()) : false;
    const isRealActive = lic ? (lic.isApproved === 1 && isNotExpired) : false;
    const isActive = lic ? (isRealActive && !isTestLicense(lic)) : false;

    const performDelete = async () => {
      let isSuccess = false;
      try {
        const res = await fetch(`/api/licenses/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) isSuccess = true;
        }
      } catch (err) {}

      if (isSuccess) {
        showToast('라이선스가 성공적으로 삭제되었습니다.');
      } else {
        setLicenses(prev => prev.filter(l => l.id !== id));
        showToast('라이선스가 성공적으로 소멸 정리되었습니다 (로컬 저장).');
      }
      fetchLicenses();
    };

    if (isActive) {
      setPasswordConfirmModal({
        message: `"${name}" 매장은 현재 정식 '라이선스 인증 활성' 상태입니다.\n실수 방지 및 소중한 고객사 보호를 위해 관리자 비밀번호 검증 승인이 필요합니다.`,
        onVerifiedConfirm: performDelete
      });
    } else {
      setConfirmModal({
        message: `"${name}" 매장의 라이선스를 영구 삭제하시겠습니까?\n해당 매장 키오스크는 즉시 인증이 정지됩니다.`,
        onConfirm: performDelete
      });
    }
  }, [licenses, isTestLicense, fetchLicenses, showToast]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, licenses.length, showOnlyTestLicenses, statusFilter]);

  // Delegate sorting, search, filtering, bulk extend to useAdminLicensesFilter hook
  const filter = useAdminLicensesFilter(
    licenses,
    setLicenses,
    selectedLicenseIds,
    setSelectedLicenseIds,
    statusFilter,
    showOnlyTestLicenses,
    searchQuery,
    isTestLicense,
    setConfirmModal,
    setIsLoading,
    showToast,
    fetchLicenses
  );

  // Integrate logging Subhook
  const logs = useAdminLicensesLogs(showToast, isKioskPopupOpen, fetchDbSize);

  const totalPages = Math.ceil(filter.sortedLicenses.length / ITEMS_PER_PAGE) || 1;
  const currentLicensesToShow = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filter.sortedLicenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filter.sortedLicenses, currentPage]);

  const totalCount = licenses.length;
  const activeCount = licenses.filter(l => {
    const isApprovedActive = Number(l.isApproved) === 1;
    const isNotExpired = new Date(l.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();
    return isApprovedActive && isNotExpired;
  }).length;
  const expiredCount = licenses.filter(l => {
    if (Number(l.isApproved) === 2) return false;
    const isNotExpired = new Date(l.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();
    return !isNotExpired;
  }).length;
  const suspendedCount = licenses.filter(l => Number(l.isApproved) === 0).length;

  return {
    licenses, setLicenses,
    isLoading,
    searchQuery, setSearchQuery,
    showOnlyTestLicenses, setShowOnlyTestLicenses,
    toast, setToast,
    currentPage, setCurrentPage,
    selectedLicenseIds, setSelectedLicenseIds,
    confirmModal, setConfirmModal,
    passwordConfirmModal, setPasswordConfirmModal,
    sortConfig: filter.sortConfig, setSortConfig: filter.setSortConfig,
    isModalOpen, setIsModalOpen,
    editingLicense, setEditingLicense,
    storeName, setStoreName,
    storeId, setStoreId,
    licenseStartDate, setLicenseStartDate,
    licenseEndDate, setLicenseEndDate,
    isApproved, setIsApproved,
    storeGrade, setStoreGrade,
    password, setPassword,
    copiedText, setCopiedText,
    testStoreId: logs.testStoreId, setTestStoreId: logs.setTestStoreId,
    testApiKey: logs.testApiKey, setTestApiKey: logs.setTestApiKey,
    testResult: logs.testResult, setTestResult: logs.setTestResult,
    isTesting: logs.isTesting, setIsTesting: logs.setIsTesting,
    showGuidebook, setShowGuidebook,
    showMemberGuide, setShowMemberGuide,
    apiLogs: logs.apiLogs, setApiLogs: logs.setApiLogs,
    isLoadingLogs: logs.isLoadingLogs, setIsLoadingLogs: logs.setIsLoadingLogs,
    isKioskPopupOpen, setIsKioskPopupOpen,
    dbSize, setDbSize,
    
    ITEMS_PER_PAGE,
    isTestLicense,
    handleSetDuration,
    handleBulkExtend: filter.handleBulkExtend,
    handleClearLogs: logs.handleClearLogs,
    handleClearDbLogs: logs.handleClearDbLogs,
    handleToggleGuidebook,
    handleToggleMemberGuide,
    showToast,
    fetchLicenses,
    fetchApiLogs: logs.fetchApiLogs,
    openAddModal,
    openEditModal,
    handleSubmit,
    handleDelete: handleDeleteParams,
    handleTestVerify: logs.handleTestVerify,
    getStoreLogStatus: logs.getStoreLogStatus,
    logAnalysis: logs.logAnalysis,
    filteredLicenses: filter.filteredLicenses,
    handleSort: filter.handleSort,
    getSortIcon: filter.getSortIcon,
    sortedLicenses: filter.sortedLicenses,
    totalPages,
    currentLicensesToShow,
    totalCount,
    activeCount,
    expiredCount,
    suspendedCount
  };
};
