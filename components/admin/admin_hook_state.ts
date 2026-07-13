import { useState, useEffect, useMemo } from 'react';
import { HasteMember } from '../membership_types';
import { useAdminBilling, DEFAULT_MOCK_CLOUD_MEMBERS, DEFAULT_MOCK_CATEGORIES, DEFAULT_MOCK_MENU_ITEMS } from './admin_hook_billing';
import { useAdminConsultations } from './admin_hook_consultations';

interface UseAdminStateProps {
  interiorsList?: any[];
  onUpdateInteriors?: (interiors: any[]) => void;
}

export const useAdminState = ({ interiorsList, onUpdateInteriors }: UseAdminStateProps = {}) => {
  // Alert/Message states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auth states
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    const auth = localStorage.getItem('haste_admin_auth') === 'true';
    if (!auth) return false;

    const loginTimeStr = localStorage.getItem('haste_admin_login_time');
    if (!loginTimeStr) {
      localStorage.setItem('haste_admin_login_time', Date.now().toString());
      return true;
    }
    const loginTime = parseInt(loginTimeStr, 10);
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (Date.now() - loginTime > TWENTY_FOUR_HOURS) {
      localStorage.removeItem('haste_admin_auth');
      localStorage.removeItem('haste_admin_login_time');
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (isAdminAuth) {
      const checkExpiry = () => {
        const loginTimeStr = localStorage.getItem('haste_admin_login_time');
        if (loginTimeStr) {
          const loginTime = parseInt(loginTimeStr, 10);
          const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
          if (Date.now() - loginTime > TWENTY_FOUR_HOURS) {
            localStorage.removeItem('haste_admin_auth');
            localStorage.removeItem('haste_admin_login_time');
            setIsAdminAuth(false);
          }
        }
      };
      checkExpiry();
      const interval = setInterval(checkExpiry, 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAdminAuth]);

  const [enteredUsername, setEnteredUsername] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Interior Designs Config States
  const [interiors, setInteriors] = useState<any[]>(() => {
    if (interiorsList && interiorsList.length > 0) return interiorsList;
    const cached = localStorage.getItem('haste_interior_types');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    if (interiorsList && interiorsList.length > 0) setInteriors(interiorsList);
  }, [interiorsList]);

  // Franchise DB Management States
  const [members, setMembers] = useState<HasteMember[]>([]);
  const [adminFilter, setAdminFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  useEffect(() => {
    const saved = localStorage.getItem('haste_membership_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((m: any) => m.id !== 'HST-M101' && m.id !== 'HST-M102' && m.id !== 'HST-M103' && m.id !== 'HST-M104');
        setMembers(filtered);
        localStorage.setItem('haste_membership_db', JSON.stringify(filtered));
      } catch (e) {
        setMembers([]);
      }
    }
  }, []);

  // Menu Category & Item States
  const [adminCategories, setAdminCategories] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('haste_mock_categories');
      return saved ? JSON.parse(saved) : DEFAULT_MOCK_CATEGORIES;
    } catch {
      return DEFAULT_MOCK_CATEGORIES;
    }
  });

  const [adminMenuItems, setAdminMenuItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('haste_mock_menu_items');
      return saved ? JSON.parse(saved) : DEFAULT_MOCK_MENU_ITEMS;
    } catch {
      return DEFAULT_MOCK_MENU_ITEMS;
    }
  });

  const [adminMenuItemsAll, setAdminMenuItemsAll] = useState<any[]>([]);

  const [cloudMembers, setCloudMembers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('haste_mock_cloud_members');
      return saved ? JSON.parse(saved) : DEFAULT_MOCK_CLOUD_MEMBERS;
    } catch {
      return DEFAULT_MOCK_CLOUD_MEMBERS;
    }
  });

  const [isFetchingCloud, setIsFetchingCloud] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudDbInfo, setCloudDbInfo] = useState<any>(null);
  const [selectedDbTable, setSelectedDbTable] = useState<'LOCAL_SIM' | 'CLOUD_SQL'>('CLOUD_SQL');

  useEffect(() => {
    localStorage.setItem('haste_mock_cloud_members', JSON.stringify(cloudMembers));
  }, [cloudMembers]);

  useEffect(() => {
    localStorage.setItem('haste_mock_categories', JSON.stringify(adminCategories));
  }, [adminCategories]);

  useEffect(() => {
    localStorage.setItem('haste_mock_menu_items', JSON.stringify(adminMenuItems));
  }, [adminMenuItems]);

  const fetchCloudMembers = async () => {
    setIsFetchingCloud(true);
    setCloudError(null);
    try {
      const response = await fetch('/api/registered-members');
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) throw new Error('Offline Mode');
      const data = await response.json();
      if (data.success) {
        setCloudMembers(data.members || []);
      } else {
        setCloudError(data.message || '데이터베이스 조회 실패.');
      }
    } catch (err) {
      if (cloudMembers.length === 0) setCloudMembers(DEFAULT_MOCK_CLOUD_MEMBERS);
    } finally {
      setIsFetchingCloud(false);
    }
  };

  const fetchDbInfo = async () => {
    try {
      const response = await fetch('/api/db-status');
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setCloudDbInfo(data);
        return;
      }
    } catch (e) {}
    setCloudDbInfo({
      connected: true,
      host: 'Local Sandbox DB (Demo)',
      port: '5432',
      message: 'Running in robust client-side sandbox mode.'
    });
  };

  const fetchAdminCategories = async () => {
    try {
      const res = await fetch('/api/menu-categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          const categoryOrder = ['AMERICANO', 'COFFEE_LATTE', 'ADE_ETC', 'MILK_LATTE', 'TEA_BASE'];
          const sorted = [...data.categories].sort((a: any, b: any) => {
            const idxA = categoryOrder.indexOf(a.id);
            const idxB = categoryOrder.indexOf(b.id);
            return idxA - idxB;
          });
          setAdminCategories(sorted);
          return;
        }
      }
    } catch (e) {}
    if (adminCategories.length === 0) setAdminCategories(DEFAULT_MOCK_CATEGORIES);
  };

  const fetchAdminMenuItems = async () => {
    try {
      const res = await fetch('/api/menu-items');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminMenuItems(data.items);
          return;
        }
      }
    } catch (e) {}
    if (adminMenuItems.length === 0) setAdminMenuItems(DEFAULT_MOCK_MENU_ITEMS);
  };

  useEffect(() => {
    if (isAdminAuth) {
      fetchAdminCategories();
      fetchAdminMenuItems();
    }
    const handleRefresh = () => {
      if (isAdminAuth) {
        fetchAdminCategories();
        fetchAdminMenuItems();
      }
    };
    window.addEventListener('haste_data_refreshed', handleRefresh);
    window.addEventListener('haste_menu_updated', handleRefresh);
    return () => {
      window.removeEventListener('haste_data_refreshed', handleRefresh);
      window.removeEventListener('haste_menu_updated', handleRefresh);
    };
  }, [isAdminAuth]);

  const syncDatabase = (updated: HasteMember[]) => {
    setMembers(updated);
    localStorage.setItem('haste_membership_db', JSON.stringify(updated));
    window.dispatchEvent(new Event('haste_membership_updated'));
  };

  const showTemporaryToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showTemporaryError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // Delegate Local Members & Billing actions to useAdminBilling helper hook
  const billing = useAdminBilling(
    members,
    syncDatabase,
    cloudMembers,
    setCloudMembers,
    fetchCloudMembers,
    showTemporaryToast
  );

  // Delegate Franchise Consultations actions to useAdminConsultations helper hook
  const consultations = useAdminConsultations(showTemporaryToast, showTemporaryError);

  const computeMemberApprovalStatus = (m: any): '요청' | '진행중' | '승인' | '보류' | '패키지회원' => {
    const currentStatus = m.approvalStatus || '요청';
    if (currentStatus === '요청') {
      const dateToCompare = m.joinDateTime || m.joinDate;
      if (dateToCompare) {
        try {
          const joinTime = new Date(dateToCompare).getTime();
          const hoursDiff = (Date.now() - joinTime) / (1000 * 60 * 60);
          if (hoursDiff >= 24) return '진행중';
        } catch (e) {}
      }
    }
    return currentStatus;
  };

  const handleCloudDeleteMember = async (id: any, skipConfirm = false) => {
    if (skipConfirm || confirm('가입점 신청 정보를 클라우드 DB에서 영구 소멸시키겠습니까?')) {
      try {
        const deletedMember = cloudMembers.find(m => m.id === id);
        const response = await fetch(`/api/registered-members/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          setCloudMembers(prev => prev.filter(m => m.id !== id));
          if (deletedMember) {
            const updated = members.filter(m => {
              const matches = (m.phone === deletedMember.phone && m.ownerName === deletedMember.ownerName) ||
                (m.email === deletedMember.email && deletedMember.email !== 'no-email@haste.cafe' && deletedMember.email !== '');
              return !matches;
            });
            syncDatabase(updated);
          }
          showTemporaryToast('성공적으로 회원 데이터가 영구 삭제되었습니다.');
          await fetchCloudMembers();
        }
      } catch (err: any) {
        showTemporaryError(err.message);
      }
    }
  };

  const handleUpdateCloudApprovalStatus = async (id: number, newStatus: '요청' | '진행중' | '승인' | '보류' | '패키지회원') => {
    try {
      const response = await fetch(`/api/registered-members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setCloudMembers(prev => prev.map(m => m.id === id ? { ...m, approvalStatus: newStatus } : m));
        await fetchCloudMembers();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLocalApprovalStatus = (id: string, newStatus: '요청' | '진행중' | '승인' | '보류' | '패키지회원') => {
    const updated = members.map(m => m.id === id ? { ...m, approvalStatus: newStatus } : m);
    syncDatabase(updated);
  };

  const handleUpdateCloudStoreType = async (id: number, newStoreType: '직영점' | '임원' | '일반' | '창업' | '패키지회원') => {
    try {
      const response = await fetch(`/api/registered-members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_type: newStoreType })
      });
      const data = await response.json();
      if (data.success) {
        setCloudMembers(prev => prev.map(m => m.id === id ? { ...m, storeType: newStoreType } : m));
        await fetchCloudMembers();
        window.dispatchEvent(new Event('haste_membership_updated'));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLocalStoreType = (id: string, newStoreType: '직영점' | '임원' | '일반' | '창업' | '패키지회원') => {
    const updated = members.map(m => m.id === id ? { ...m, storeType: newStoreType } : m);
    syncDatabase(updated);
    window.dispatchEvent(new Event('haste_membership_updated'));
  };

  const handleUpdateLocalMemberFields = (id: string, fields: Partial<HasteMember>) => {
    const updated = members.map(m => m.id === id ? { ...m, ...fields } : m);
    syncDatabase(updated);
    window.dispatchEvent(new Event('haste_membership_updated'));
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (adminFilter === 'ALL') return true;
      if (adminFilter === 'PAID') return m.monthlyFeePaid === true;
      if (adminFilter === 'UNPAID') return m.monthlyFeePaid === false;
      return true;
    });
  }, [members, adminFilter]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredUsername || !enteredPassword) {
      setAuthError('아이디와 패스워드를 모두 입력해 주세요.');
      return;
    }
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: enteredUsername, password: enteredPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('haste_admin_auth', 'true');
        localStorage.setItem('haste_admin_login_time', Date.now().toString());
        setIsAdminAuth(true);
        setSuccessMsg('관리자 본부 인증 성공! 환영합니다.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setAuthError(data.message || '인증 정보가 올바르지 않습니다.');
      }
    } catch (err) {
      setAuthError('원격 데이터베이스 응답 지연이 발생했거나 연결할 수 없습니다.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    const isMusic = localStorage.getItem('haste_music_mode') === 'true';
    localStorage.removeItem('haste_admin_auth');
    localStorage.removeItem('haste_admin_login_time');
    localStorage.removeItem('haste_music_mode');
    setIsAdminAuth(false);
    setEnteredPassword('');
    setAuthError('');
    if (isMusic) {
      window.location.href = '/music';
    }
  };

  return {
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,
    isAdminAuth,
    setIsAdminAuth,
    enteredUsername,
    setEnteredUsername,
    enteredPassword,
    setEnteredPassword,
    authError,
    setAuthError,
    isAuthLoading,
    setIsAuthLoading,
    interiors,
    setInteriors,
    members,
    setMembers,
    adminFilter,
    setAdminFilter,
    kakaoAlerts: billing.kakaoAlerts,
    setKakaoAlerts: billing.setKakaoAlerts,
    adminCategories,
    setAdminCategories,
    adminMenuItems,
    setAdminMenuItems,
    adminMenuItemsAll,
    setAdminMenuItemsAll,
    cloudMembers,
    setCloudMembers,
    isFetchingCloud,
    cloudError,
    cloudDbInfo,
    selectedDbTable,
    setSelectedDbTable,
    cloudConsultations: consultations.cloudConsultations,
    isFetchingConsultations: consultations.isFetchingConsultations,
    consultationsError: consultations.consultationsError,
    fetchCloudMembers,
    fetchDbInfo,
    fetchCloudConsultations: consultations.fetchCloudConsultations,
    handleUpdateCloudConsultationStatus: consultations.handleUpdateCloudConsultationStatus,
    handleCloudDeleteConsultation: consultations.handleCloudDeleteConsultation,
    triggerAutoBillingCycle: billing.triggerAutoBillingCycle,
    togglePaymentStatus: billing.togglePaymentStatus,
    handleAddLocalMember: billing.handleAddLocalMember,
    deleteMember: billing.deleteMember,
    computeMemberApprovalStatus,
    handleCloudDeleteMember,
    handleUpdateCloudApprovalStatus,
    handleUpdateLocalApprovalStatus,
    handleUpdateCloudStoreType,
    handleUpdateLocalStoreType,
    handleUpdateLocalMemberFields,
    filteredMembers,
    showTemporaryToast,
    showTemporaryError,
    handleAdminLogin,
    handleLogout
  };
};
