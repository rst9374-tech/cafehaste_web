import React, { useState, useEffect } from 'react';
import { AlertOctagon, RefreshCw, Users, Edit, Trash2 } from 'lucide-react';
import { 
  bulkUpdateStoreType, 
  bulkUpdateStoreGrade, 
  bulkApproveLicenses, 
  bulkExpireLicenses, 
  bulkImminentLicenses, 
  bulkSuspendMembers 
} from './admin_comp_membership_action_handlers';


interface AdminMembershipActionProps {
  selectedMembershipIds: any[];
  setSelectedMembershipIds: React.Dispatch<React.SetStateAction<any[]>>;
  cloudMembers: any[];
  licenses: any[];
  setEditingMember: (m: any) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  showAlert: (title: string, message: string) => void;
  handleCloudDeleteMember: (id: any, skipConfirm?: boolean) => Promise<void>;
  fetchIntegratedBulkData?: (mode: 'CLOUD_SQL' | 'LOCAL_SIM') => Promise<void>;
  fetchCloudMembers: () => Promise<void>;
  isBottom: boolean;
  showOnlyTestMembers: boolean;
  setShowOnlyTestMembers: React.Dispatch<React.SetStateAction<boolean>>;
  skipTestMembers: boolean;
  setSkipTestMembers: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateStoreType?: (id: any, storeType: any) => Promise<void> | void;
  handleUpdateStoreGrade?: (memberId: string, storeGrade: 'STANDARD' | 'PREMIUM', selectedDbTable: 'CLOUD_SQL' | 'LOCAL_SIM') => Promise<void> | void;
}

export const AdminMembershipAction: React.FC<AdminMembershipActionProps> = ({
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
  isBottom,
  showOnlyTestMembers,
  setShowOnlyTestMembers,
  skipTestMembers,
  setSkipTestMembers,
  handleUpdateStoreType,
  handleUpdateStoreGrade
}) => {
  const [showApproveDropdown, setShowApproveDropdown] = useState<boolean>(false);
  const [isBulkApproving, setIsBulkApproving] = useState<boolean>(false);
  const [isBulkSuspending, setIsBulkSuspending] = useState<boolean>(false);

  const [bulkStoreType, setBulkStoreType] = useState<string>('');
  const [bulkStoreGrade, setBulkStoreGrade] = useState<'STANDARD' | 'PREMIUM' | ''>('');
  const [bulkStoreStatus, setBulkStoreStatus] = useState<string>('');
  const [isBulkUpdatingType, setIsBulkUpdatingType] = useState<boolean>(false);
  const [isBulkUpdatingGrade, setIsBulkUpdatingGrade] = useState<boolean>(false);
  const [isBulkUpdatingCombined, setIsBulkUpdatingCombined] = useState<boolean>(false);

  useEffect(() => {
    setShowApproveDropdown(false);
    setBulkStoreType('');
    setBulkStoreGrade('');
    setBulkStoreStatus('');
  }, [selectedMembershipIds.length]);

  const handleBulkUpdateCombined = () => {
    if (selectedMembershipIds.length === 0) return;
    if (!bulkStoreType && !bulkStoreGrade && !bulkStoreStatus) return;

    const parts: string[] = [];
    if (bulkStoreType) {
      const typeLabel = bulkStoreType === 'MEMBERSHIP' ? '멤버십' : bulkStoreType === 'HASTE_MEMBERSHIP' ? '헤이스트멤버십' : bulkStoreType === 'EXECUTIVE' ? '임원' : bulkStoreType;
      parts.push(`매장 유형 ➔ '${typeLabel}'`);
    }
    if (bulkStoreGrade) {
      const gradeLabel = bulkStoreGrade === 'PREMIUM' ? '프리미엄' : '베이직';
      parts.push(`등급 ➔ '${gradeLabel}'`);
    }
    if (bulkStoreStatus) {
      const statusLabel = 
        bulkStoreStatus === 'APPROVE_1' ? '인증 승인 (1달)' :
        bulkStoreStatus === 'APPROVE_3' ? '인증 승인 (3달)' :
        bulkStoreStatus === 'APPROVE_12' ? '인증 승인 (1년)' :
        bulkStoreStatus === 'SUSPEND' ? '가동 정지' :
        bulkStoreStatus === 'EXPIRE' ? '인증 만료' :
        bulkStoreStatus === 'IMMINENT' ? '종료 임박' : bulkStoreStatus;
      parts.push(`상태 ➔ '${statusLabel}'`);
    }

    showConfirm(
      '가맹점 일괄 정보 변경',
      `선택한 ${selectedMembershipIds.length}개 매장의 [${parts.join(', ')}] 변경을 진행하시겠습니까?`,
      async () => {
        setIsBulkUpdatingCombined(true);
        try {
          const promises: Promise<any>[] = [];
          if (bulkStoreType) {
            promises.push(bulkUpdateStoreType(selectedMembershipIds, bulkStoreType));
          }
          if (bulkStoreGrade) {
            promises.push(bulkUpdateStoreGrade(selectedMembershipIds, bulkStoreGrade));
          }
          if (bulkStoreStatus) {
            if (bulkStoreStatus === 'APPROVE_1') {
              promises.push(bulkApproveLicenses(selectedMembershipIds, 1));
            } else if (bulkStoreStatus === 'APPROVE_3') {
              promises.push(bulkApproveLicenses(selectedMembershipIds, 3));
            } else if (bulkStoreStatus === 'APPROVE_12') {
              promises.push(bulkApproveLicenses(selectedMembershipIds, 12));
            } else if (bulkStoreStatus === 'SUSPEND') {
              promises.push(bulkSuspendMembers(selectedMembershipIds, true));
            } else if (bulkStoreStatus === 'EXPIRE') {
              promises.push(bulkExpireLicenses(selectedMembershipIds));
            } else if (bulkStoreStatus === 'IMMINENT') {
              promises.push(bulkImminentLicenses(selectedMembershipIds));
            }
          }

          const results = await Promise.all(promises);
          const allSuccess = results.every(res => res.success);
          
          if (allSuccess) {
            showAlert('변경 완료', '선택한 가맹점의 유형/등급/상태 변경이 정상적으로 일괄 적용되었습니다.');
            setSelectedMembershipIds([]);
            setBulkStoreType('');
            setBulkStoreGrade('');
            setBulkStoreStatus('');
            if (fetchIntegratedBulkData) {
              await fetchIntegratedBulkData('CLOUD_SQL');
            } else {
              await fetchCloudMembers();
            }
          } else {
            const failMsg = results.map(res => res.message || '오류').join(', ');
            showAlert('변경 실패', '일부 변경 중 실패가 발생했습니다: ' + failMsg);
          }
        } catch (err: any) {
          showAlert('통신 에러', '일괄 변경 처리에 실패했습니다: ' + err.message);
        } finally {
          setIsBulkUpdatingCombined(false);
        }
      }
    );
  };

  const handleBulkUpdateStoreType = () => {
    if (selectedMembershipIds.length === 0 || !bulkStoreType) return;
    const storeTypeName = bulkStoreType === 'MEMBERSHIP' ? '멤버십' : bulkStoreType === 'HASTE_MEMBERSHIP' ? '헤이스트멤버십' : bulkStoreType === 'EXECUTIVE' ? '임원' : bulkStoreType;
    showConfirm(
      '매장 유형 일괄 변경',
      `선택한 ${selectedMembershipIds.length}개 매장의 매장 유형을 '${storeTypeName}'(으)로 일괄 변경하시겠습니까?`,
      async () => {
        setIsBulkUpdatingType(true);
        try {
          const data = await bulkUpdateStoreType(selectedMembershipIds, bulkStoreType);
          if (data.success) {
            showAlert('변경 완료', data.message || '매장 유형 일괄 변경이 완료되었습니다.');
            setSelectedMembershipIds([]);
            setBulkStoreType('');
            if (fetchIntegratedBulkData) {
              await fetchIntegratedBulkData('CLOUD_SQL');
            } else {
              await fetchCloudMembers();
            }
          } else {
            showAlert('변경 실패', data.message || '매장 유형 일괄 변경 처리 중 에러가 발생했습니다.');
          }
        } catch (err: any) {
          showAlert('통신 에러', '일괄 변경 처리에 실패했습니다: ' + err.message);
        } finally {
          setIsBulkUpdatingType(false);
        }
      }
    );
  };

  const handleBulkUpdateStoreGrade = () => {
    if (selectedMembershipIds.length === 0 || !bulkStoreGrade) return;
    const storeGradeName = bulkStoreGrade === 'PREMIUM' ? '프리미엄' : '베이직';
    showConfirm(
      '솔루션 등급 일괄 변경',
      `선택한 ${selectedMembershipIds.length}개 매장의 솔루션 등급을 '${storeGradeName}'(으)로 일괄 변경하시겠습니까?`,
      async () => {
        setIsBulkUpdatingGrade(true);
        try {
          const data = await bulkUpdateStoreGrade(selectedMembershipIds, bulkStoreGrade);
          if (data.success) {
            showAlert('변경 완료', data.message || '솔루션 등급 일괄 변경이 완료되었습니다.');
            setSelectedMembershipIds([]);
            setBulkStoreGrade('');
            if (fetchIntegratedBulkData) {
              await fetchIntegratedBulkData('CLOUD_SQL');
            } else {
              await fetchCloudMembers();
            }
          } else {
            showAlert('변경 실패', data.message || '솔루션 등급 일괄 변경 처리 중 에러가 발생했습니다.');
          }
        } catch (err: any) {
          showAlert('통신 에러', '일괄 변경 처리에 실패했습니다: ' + err.message);
        } finally {
          setIsBulkUpdatingGrade(false);
        }
      }
    );
  };

  const handleEditSelected = () => {
    if (selectedMembershipIds.length !== 1) return;
    const targetId = selectedMembershipIds[0];
    const member = cloudMembers.find(m => m.id === targetId);
    if (member) {
      setEditingMember(member);
    }
  };

  const handleBulkDelete = () => {
    if (selectedMembershipIds.length === 0) return;
    showConfirm(
      '일괄 삭제 확인',
      `선택한 ${selectedMembershipIds.length}개 가맹점을 정말로 삭제하시겠습니까?`,
      async () => {
        try {
          for (const id of selectedMembershipIds) {
            await handleCloudDeleteMember(id);
          }
          setSelectedMembershipIds([]);
          showAlert('삭제 완료', '선택한 가맹점이 모두 삭제되었습니다.');
        } catch (e: any) {
          showAlert('삭제 실패', '일부 가맹점 삭제 중 에러가 발생했습니다: ' + e.message);
        }
      }
    );
  };

  const handleBulkApprove = async (months: number) => {
    if (selectedMembershipIds.length === 0) return;
    setShowApproveDropdown(false);
    
    showConfirm(
      '일괄 인증승인 경고',
      `선택한 ${selectedMembershipIds.length}개 점포의 라이선스를 일괄 '${months}달 인증 승인' 처리하시겠습니까?`,
      async () => {
        setIsBulkApproving(true);
        try {
          const data = await bulkApproveLicenses(selectedMembershipIds, months);
          if (data.success) {
            showAlert('일괄 인증승인 완료', data.message || '인증승인이 완료되었습니다.');
            setSelectedMembershipIds([]);
            if (fetchIntegratedBulkData) {
              await fetchIntegratedBulkData('CLOUD_SQL');
            } else {
              await fetchCloudMembers();
            }
          } else {
            showAlert('일괄 인증승인 실패', data.message || '인증승인 처리 중 지연 또는 에러가 발생했습니다.');
          }
        } catch (err: any) {
          showAlert('통신 에러', '일괄 처리에 실패했습니다: ' + err.message);
        } finally {
          setIsBulkApproving(false);
        }
      }
    );
  };

  const handleBulkExpire = async () => {
    if (selectedMembershipIds.length === 0) return;
    
    showConfirm(
      '일괄 인증만료 강제 경고',
      `선택한 ${selectedMembershipIds.length}개 점포의 라이선스를 일괄 '인증 만료(어제 만료)' 처리하시겠습니까?`,
      async () => {
        setIsBulkApproving(true);
        try {
          const data = await bulkExpireLicenses(selectedMembershipIds);
          if (data.success) {
            showAlert('일괄 인증만료 완료', '선택한 매장의 라이선스를 인증만료 상태로 변경했습니다.');
            setSelectedMembershipIds([]);
            if (fetchIntegratedBulkData) {
              await fetchIntegratedBulkData('CLOUD_SQL');
            } else {
              await fetchCloudMembers();
            }
          } else {
            showAlert('일괄 인증만료 실패', data.message || '인증만료 처리 중 에러가 발생했습니다.');
          }
        } catch (err: any) {
          showAlert('통신 에러', '일괄 처리에 실패했습니다: ' + err.message);
        } finally {
          setIsBulkApproving(false);
        }
      }
    );
  };

  const handleBulkImminent = async () => {
    if (selectedMembershipIds.length === 0) return;
    
    showConfirm(
      '일괄 종료임박 강제 경고',
      `선택한 ${selectedMembershipIds.length}개 점포의 라이선스를 일괄 '종료 임박(7일 후 만료)' 처리하시겠습니까?`,
      async () => {
        setIsBulkApproving(true);
        try {
          const data = await bulkImminentLicenses(selectedMembershipIds);
          if (data.success) {
            showAlert('일괄 종료임박 완료', '선택한 매장의 라이선스를 종료임박 상태로 변경했습니다.');
            setSelectedMembershipIds([]);
            if (fetchIntegratedBulkData) {
              await fetchIntegratedBulkData('CLOUD_SQL');
            } else {
              await fetchCloudMembers();
            }
          } else {
            showAlert('일괄 종료임박 실패', data.message || '종료임박 처리 중 에러가 발생했습니다.');
          }
        } catch (err: any) {
          showAlert('통신 에러', '일괄 처리에 실패했습니다: ' + err.message);
        } finally {
          setIsBulkApproving(false);
        }
      }
    );
  };

  const [isBulkCreating, setIsBulkCreating] = useState<boolean>(false);

  // handleBulkTestCreate extracted to AdminCompMembershipTestCreator

  const handleBulkSuspend = async () => {
    if (selectedMembershipIds.length === 0) return;
    
    showConfirm(
      '일괄 가동 정지 경고',
      `선택한 ${selectedMembershipIds.length}개 점포의 라이선스를 일괄 '가동 정지(비인가)' 처리하시겠습니까?`,
      async () => {
        setIsBulkSuspending(true);
        try {
          const data = await bulkSuspendMembers(selectedMembershipIds, true);
          if (data.success) {
            showAlert('일괄 가동 정지 완료', data.message || '가동 정지가 완료되었습니다.');
            setSelectedMembershipIds([]);
            if (fetchIntegratedBulkData) {
              await fetchIntegratedBulkData('CLOUD_SQL');
            } else {
              await fetchCloudMembers();
            }
          } else {
            showAlert('일괄 가동 정지 실패', data.message || '가동 정지 처리 중 지연 또는 에러가 발생했습니다.');
          }
        } catch (err: any) {
          showAlert('통신 에러', '일괄 처리에 실패했습니다: ' + err.message);
        } finally {
          setIsBulkSuspending(false);
        }
      }
    );
  };

  const toggleTestMembersFilter = () => {
    const nextVal = !showOnlyTestMembers;
    setShowOnlyTestMembers(nextVal);
    if (nextVal) setSkipTestMembers(false);
  };

  const toggleSkipTestMembers = () => {
    const nextVal = !skipTestMembers;
    setSkipTestMembers(nextVal);
    if (nextVal) setShowOnlyTestMembers(false);
  };

  return (
    <div className={`flex flex-wrap justify-between items-center gap-2 bg-transparent ${isBottom ? 'pt-2.5 mt-2 border-t' : 'pb-2 mb-2 border-b'} border-dashed border-stone-855 select-none`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5 px-0 py-1 select-none">
          <span className="text-[10px] font-extrabold text-stone-300 px-1 tracking-wider whitespace-nowrap">
            ⚡ 라이선스 조작 {selectedMembershipIds.length > 0 ? `(${selectedMembershipIds.length}건)` : ''}
          </span>
          
          <button
            type="button"
            onClick={handleEditSelected}
            disabled={selectedMembershipIds.length !== 1}
            className="admin-btn-action-edit !h-6 !text-[10px] !px-2.5 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Edit size={10} />
            <span>수정</span>
          </button>

          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={selectedMembershipIds.length === 0}
            className="admin-btn-action-delete !h-6 !text-[10px] !px-2.5 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 size={10} />
            <span>삭제</span>
          </button>

          {/* 매장 유형 & 등급 & 상태 일괄 변경 병합 탭 */}
          <div className="flex items-center gap-1.5 border-l border-stone-800 pl-2 ml-0.5">
            <select
              value={bulkStoreType}
              onChange={(e) => setBulkStoreType(e.target.value)}
              disabled={selectedMembershipIds.length === 0 || isBulkUpdatingCombined}
              className="dashboard-select !h-6 !py-0 text-[9.5px] font-bold"
            >
              <option value="">유형 일괄선택</option>
              <option value="MEMBERSHIP">멤버십</option>
              <option value="HASTE_MEMBERSHIP">헤이스트멤버십</option>
              <option value="EXECUTIVE">임원</option>
            </select>

            <span className="text-stone-500 text-[10px] font-bold select-none">⇅</span>

            <select
              value={bulkStoreGrade}
              onChange={(e) => setBulkStoreGrade(e.target.value as any)}
              disabled={selectedMembershipIds.length === 0 || isBulkUpdatingCombined}
              className="dashboard-select !h-6 !py-0 text-[9.5px] font-bold"
            >
              <option value="">등급 일괄선택</option>
              <option value="STANDARD">베이직</option>
              <option value="PREMIUM">프리미엄</option>
            </select>

            <span className="text-stone-500 text-[10px] font-bold select-none">⇅</span>

            <select
              value={bulkStoreStatus}
              onChange={(e) => setBulkStoreStatus(e.target.value)}
              disabled={selectedMembershipIds.length === 0 || isBulkUpdatingCombined}
              className="dashboard-select !h-6 !py-0 text-[9.5px] font-bold"
            >
              <option value="">상태 일괄선택</option>
              <option value="APPROVE_1">인증 승인 (1달)</option>
              <option value="APPROVE_3">인증 승인 (3달)</option>
              <option value="APPROVE_12">인증 승인 (1년)</option>
              <option value="SUSPEND">가동 정지</option>
              <option value="EXPIRE">인증 만료</option>
              <option value="IMMINENT">종료 임박</option>
            </select>

            <button
              type="button"
              onClick={handleBulkUpdateCombined}
              disabled={(!bulkStoreType && !bulkStoreGrade && !bulkStoreStatus) || selectedMembershipIds.length === 0 || isBulkUpdatingCombined}
              className="dashboard-btn-gold-compact"
            >
              <span>{isBulkUpdatingCombined ? '변경중...' : '유형/등급/상태 변경'}</span>
            </button>
          </div>
        </div>
        {!isBottom && showOnlyTestMembers && (
          <span className="text-[9px] text-rose-400 bg-rose-955/20 border border-rose-900/30 rounded px-1.5 py-0.5 animate-pulse font-bold font-sans">
            테스트 전용 필터 적용
          </span>
        )}
        {!isBottom && skipTestMembers && (
          <span className="text-[9px] text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/30 rounded px-1.5 py-0.5 animate-pulse font-bold font-sans">
            테스트생략 필터 적용 (테스트 매장 숨김)
          </span>
        )}
      </div>
      {!isBottom && (
        <div className="flex items-center gap-2">


          <button
            type="button"
            onClick={toggleTestMembersFilter}
            className={showOnlyTestMembers ? 'dashboard-btn-rose-filter' : 'dashboard-btn-dark-filter'}
          >
            <AlertOctagon size={11} className={showOnlyTestMembers ? "animate-pulse" : ""} />
            <span>테스트 대조 필터</span>
          </button>

          <button
            type="button"
            onClick={toggleSkipTestMembers}
            className={skipTestMembers ? 'dashboard-btn-gold-filter' : 'dashboard-btn-dark-filter'}
          >
            <AlertOctagon size={11} className={skipTestMembers ? "animate-pulse" : ""} />
            <span>테스트생략</span>
          </button>
        </div>
      )}
    </div>
  );
};
