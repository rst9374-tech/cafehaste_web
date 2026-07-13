import React, { useState, useMemo, useEffect } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { isTestMember, SortConfig } from './admin_comp_shared';
import { AdminMembershipTable } from './admin_comp_membership_table';
import { AdminMembershipAction } from './admin_comp_membership_action';

interface AdminMembershipSubTabProps {
  cloudDbInfo: any;
  cloudMembers: any[];
  isFetchingCloud: boolean;
  fetchCloudMembers: () => Promise<void>;
  
  licenses: any[];
  
  selectedMembershipIds: any[];
  setSelectedMembershipIds: React.Dispatch<React.SetStateAction<any[]>>;
  setEditingMember: (m: any) => void;
  setSelectedCertUrl: (url: string | null) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  showAlert: (title: string, message: string) => void;
  
  handleUpdateCloudStoreType: (id: any, storeType: any) => Promise<void>;
  handleCloudDeleteMember: (id: any, skipConfirm?: boolean) => Promise<void>;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  onQuickToggle: (memberId: string, action: 'APPROVE' | 'SUSPEND', months?: number) => Promise<void>;
  isProcessingToggle: string | null;
  fetchIntegratedBulkData?: (mode: 'CLOUD_SQL' | 'LOCAL_SIM') => Promise<void>;
  handleUpdateStoreGrade?: (memberId: string, storeGrade: 'STANDARD' | 'PREMIUM', selectedDbTable: 'CLOUD_SQL' | 'LOCAL_SIM') => Promise<void> | void;
}

const ITEMS_PER_PAGE = 100;

export const AdminMembershipSubTab: React.FC<AdminMembershipSubTabProps> = ({
  cloudDbInfo,
  cloudMembers,
  isFetchingCloud,
  fetchCloudMembers,
  
  licenses,
  
  selectedMembershipIds,
  setSelectedMembershipIds,
  setEditingMember,
  setSelectedCertUrl,
  showConfirm,
  showAlert,
  
  handleUpdateCloudStoreType,
  handleCloudDeleteMember,
  renderPagination,
  onQuickToggle,
  isProcessingToggle,
  fetchIntegratedBulkData,
  handleUpdateStoreGrade
}) => {
  const [showOnlyTestMembers, setShowOnlyTestMembers] = useState<boolean>(false);
  const [skipTestMembers, setSkipTestMembers] = useState<boolean>(false);
  const [membershipStatusFilter, setMembershipStatusFilter] = useState<'ALL' | 'REQUESTED' | 'ACTIVE' | 'IMMINENT' | 'EXPIRED' | 'SUSPENDED'>('ALL');
  const [membersCloudPage, setMembersCloudPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'joinDate', direction: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getMemberLicenseStatus = (m: any) => {
    if (!m) return null;
    const storeCode = m.storeCode ? m.storeCode.trim() : '';
    const fallbackId = `없음_${m.id}`;
    const license = licenses.find((l: any) => {
      const dbStoreId = l.storeId ? l.storeId.trim() : '';
      if (storeCode && dbStoreId === storeCode) return true;
      if (dbStoreId === fallbackId) return true;
      return false;
    });

    if (!license) return 'REQUESTED';

    const isApprovedActive = Number(license.isApproved) === 1;
    const isNotExpired = new Date(license.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();

    if (Number(license.isApproved) === 2) {
      return 'REQUESTED';
    }
    if (!isApprovedActive) {
      return 'SUSPENDED';
    }
    if (!isNotExpired) {
      return 'EXPIRED';
    }

    const timeDiff = new Date(license.licenseEndDate + 'T23:59:59').getTime() - new Date().getTime();
    const isImminent = timeDiff > 0 && timeDiff < 30 * 24 * 60 * 60 * 1000;

    if (isImminent) {
      return 'IMMINENT';
    }

    return 'ACTIVE';
  };

  const getSortedMembers = (baseList: any[]) => {
    let list = baseList;
    if (membershipStatusFilter !== 'ALL') {
      list = list.filter(m => getMemberLicenseStatus(m) === membershipStatusFilter);
    }
    if (showOnlyTestMembers) {
      list = list.filter(m => isTestMember(m));
    }
    if (skipTestMembers) {
      list = list.filter(m => !isTestMember(m));
    }
    if (!sortConfig) return list;
    const sorted = [...list];
    sorted.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      
      if (typeof valA === 'string') valA = valA.trim();
      if (typeof valB === 'string') valB = valB.trim();
      
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const membershipStats = useMemo(() => {
    const activeList = cloudMembers;
    let total = activeList.length;
    let requested = 0;
    let active = 0;
    let imminent = 0;
    let expired = 0;
    let suspended = 0;

    activeList.forEach(m => {
       const status = getMemberLicenseStatus(m);
       if (status === 'REQUESTED') requested++;
       else if (status === 'ACTIVE') active++;
       else if (status === 'IMMINENT') imminent++;
       else if (status === 'EXPIRED') expired++;
       else if (status === 'SUSPENDED') suspended++;
     });

    return { total, requested, active, imminent, expired, suspended };
  }, [cloudMembers, licenses]);

  const sortedCloudMembers = useMemo(() => getSortedMembers(cloudMembers), [cloudMembers, sortConfig, showOnlyTestMembers, skipTestMembers, membershipStatusFilter, licenses]);

  useEffect(() => {
    setMembersCloudPage(1);
  }, [cloudMembers.length, showOnlyTestMembers, skipTestMembers, membershipStatusFilter]);

  const totalCloudMembersPages = Math.ceil(sortedCloudMembers.length / ITEMS_PER_PAGE) || 1;
  const currentCloudMembersToShow = useMemo(() => {
    const startIndex = (membersCloudPage - 1) * ITEMS_PER_PAGE;
    return sortedCloudMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedCloudMembers, membersCloudPage]);

  const actionProps = {
    selectedMembershipIds,
    setSelectedMembershipIds,
    cloudMembers,
    licenses,
    setEditingMember,
    showConfirm,
    showAlert,
    handleCloudDeleteMember,
    fetchIntegratedBulkData,
    fetchCloudMembers,
    showOnlyTestMembers,
    setShowOnlyTestMembers,
    skipTestMembers,
    setSkipTestMembers,
    handleUpdateStoreType: handleUpdateCloudStoreType,
    handleUpdateStoreGrade
  };

  return (
    <div className="space-y-4">
      {/* 6단 대형 카드 대시보드 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-1 animate-fadeIn bg-stone-50 border border-stone-200 p-3.5 rounded-2xl shadow-sm select-none">
        {/* 전체 */}
        <button
          onClick={() => setMembershipStatusFilter('ALL')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all outline-none ${
            membershipStatusFilter === 'ALL'
              ? 'bg-stone-100 border-2 border-stone-900 font-bold scale-[1.02]'
              : 'bg-white border border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-3xl font-black text-stone-900 font-sans tracking-tight leading-none">
            {membershipStats.total}
          </span>
          <span className={`text-[12px] font-extrabold mt-2 ${
            membershipStatusFilter === 'ALL' ? 'text-stone-900 font-black' : 'text-stone-500'
          }`}>전체</span>
        </button>

        {/* 요청 */}
        <button
          onClick={() => setMembershipStatusFilter('REQUESTED')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all outline-none ${
            membershipStatusFilter === 'REQUESTED'
              ? 'bg-sky-50 border-2 border-sky-600 font-bold scale-[1.02]'
              : 'bg-white border border-sky-100 hover:border-sky-300'
          }`}
        >
          <span className="text-3xl font-black text-sky-600 font-sans tracking-tight leading-none">
            {membershipStats.requested}
          </span>
          <span className={`text-[12px] font-extrabold mt-2 ${
            membershipStatusFilter === 'REQUESTED' ? 'text-sky-755 font-black' : 'text-stone-500'
          }`}>인증 대기</span>
        </button>

        {/* 인증 */}
        <button
          onClick={() => setMembershipStatusFilter('ACTIVE')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all outline-none ${
            membershipStatusFilter === 'ACTIVE'
              ? 'bg-emerald-50 border-2 border-emerald-600 font-bold scale-[1.02]'
              : 'bg-white border border-emerald-100 hover:border-emerald-305'
          }`}
        >
          <span className="text-3xl font-black text-emerald-600 font-sans tracking-tight leading-none">
            {membershipStats.active}
          </span>
          <span className={`text-[12px] font-extrabold mt-2 ${
            membershipStatusFilter === 'ACTIVE' ? 'text-emerald-755 font-black' : 'text-stone-500'
          }`}>인증 완료</span>
        </button>

        {/* 종료임박 */}
        <button
          onClick={() => setMembershipStatusFilter('IMMINENT')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all outline-none ${
            membershipStatusFilter === 'IMMINENT'
              ? 'bg-amber-50 border-2 border-amber-600 font-bold scale-[1.02]'
              : 'bg-white border border-amber-100 hover:border-amber-305'
          }`}
        >
          <span className="text-3xl font-black text-amber-500 font-sans tracking-tight leading-none animate-pulse">
            {membershipStats.imminent}
          </span>
          <span className={`text-[12px] font-extrabold mt-2 animate-pulse ${
            membershipStatusFilter === 'IMMINENT' ? 'text-amber-700 font-black' : 'text-stone-500'
          }`}>종료임박</span>
        </button>

        {/* 만료 */}
        <button
          onClick={() => setMembershipStatusFilter('EXPIRED')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all outline-none ${
            membershipStatusFilter === 'EXPIRED'
              ? 'bg-amber-50/20 border-2 border-[#C5A059] font-bold scale-[1.02]'
              : 'bg-white border border-[#EBE1D0] hover:border-[#dbb56e]'
          }`}
        >
          <span className="text-3xl font-black text-[#C5A059] font-sans tracking-tight leading-none">
            {membershipStats.expired}
          </span>
          <span className={`text-[12px] font-extrabold mt-2 ${
            membershipStatusFilter === 'EXPIRED' ? 'text-[#b08e4d] font-black' : 'text-stone-500'
          }`}>만료</span>
        </button>

        {/* 정지 */}
        <button
          onClick={() => setMembershipStatusFilter('SUSPENDED')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all outline-none ${
            membershipStatusFilter === 'SUSPENDED'
              ? 'bg-red-50 border-2 border-red-650 font-bold scale-[1.02]'
              : 'bg-white border border-red-150 hover:border-red-300'
          }`}
        >
          <span className="text-3xl font-black text-red-650 font-sans tracking-tight leading-none">
            {membershipStats.suspended}
          </span>
          <span className={`text-[12px] font-extrabold mt-2 ${
            membershipStatusFilter === 'SUSPENDED' ? 'text-red-750 font-black' : 'text-stone-500'
          }`}>가동 정지</span>
        </button>
      </div>

      {/* CLOUD LIVE DISPLAY */}
      <div className="flex flex-col gap-4 font-sans">
        {isFetchingCloud ? (
          <div className="flex items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl shadow-sm">
            <RefreshCw className="animate-spin text-[#C5A059]" size={16} />
            <span className="text-stone-550 text-xs font-medium ml-2 font-sans">데이터를 불러오는 중입니다...</span>
          </div>
        ) : cloudMembers.length > 0 ? (
          <>
            <AdminMembershipAction {...actionProps} isBottom={false} />
            
            <AdminMembershipTable
              members={currentCloudMembersToShow}
              isLocal={false}
              currentPage={membersCloudPage}
              totalPages={totalCloudMembersPages}
              onPageChange={setMembersCloudPage}
              licenses={licenses}
              selectedMembershipIds={selectedMembershipIds}
              setSelectedMembershipIds={setSelectedMembershipIds}
              setEditingMember={setEditingMember}
              setSelectedCertUrl={setSelectedCertUrl}
              showConfirm={showConfirm}
              handleDeleteMember={(id) => handleCloudDeleteMember(id, true)}
              handleUpdateStoreType={handleUpdateCloudStoreType}
              sortConfig={sortConfig}
              onSort={handleSort}
              renderPagination={renderPagination}
              onQuickToggle={onQuickToggle}
              isProcessingToggle={isProcessingToggle}
              handleUpdateStoreGrade={handleUpdateStoreGrade}
            />

            <AdminMembershipAction {...actionProps} isBottom={true} />
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 font-light text-xs flex flex-col justify-center items-center gap-2">
            <Database size={24} className="text-stone-300 mb-1" />
            <strong>가입 데이터가 비어 있습니다.</strong>
            <span className="text-[10px] text-stone-400">최상단 '멤버십 가입신청' 메뉴 버튼을 사용하여 database에 첫 행(Row)을 기록해 보세요!</span>
          </div>
        )}
      </div>
    </div>
  );
};
