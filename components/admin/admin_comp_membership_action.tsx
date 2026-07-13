import React, { useState, useEffect } from 'react';
import { AlertOctagon, RefreshCw, Users } from 'lucide-react';
import { 
  bulkUpdateStoreType, 
  bulkUpdateStoreGrade, 
  bulkApproveLicenses, 
  bulkExpireLicenses, 
  bulkImminentLicenses, 
  bulkSuspendMembers 
} from './admin_comp_membership_action_handlers';
import { AdminCompMembershipTestCreator } from './admin_comp_membership_test_creator';

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
  const [isBulkUpdatingType, setIsBulkUpdatingType] = useState<boolean>(false);
  const [isBulkUpdatingGrade, setIsBulkUpdatingGrade] = useState<boolean>(false);

  useEffect(() => {
    setShowApproveDropdown(false);
    setBulkStoreType('');
    setBulkStoreGrade('');
  }, [selectedMembershipIds.length]);

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
    <div className={`flex flex-wrap justify-between items-center gap-2 bg-transparent ${isBottom ? 'pt-2.5 mt-2 border-t' : 'pb-2 mb-2 border-b'} border-dashed border-stone-200/60 select-none`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5 px-0 py-1 select-none">
          <span className="text-[10px] font-extrabold text-stone-800 px-1 tracking-wider whitespace-nowrap">
            ⚡ 라이선스 조작 {selectedMembershipIds.length > 0 ? `(${selectedMembershipIds.length}건)` : ''}
          </span>
          
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => {
                if (selectedMembershipIds.length > 0) {
                  setShowApproveDropdown(!showApproveDropdown);
                }
              }}
              disabled={isBulkApproving || selectedMembershipIds.length === 0}
              className="h-6 px-2.5 rounded-lg text-[10px] font-bold bg-[#C5A059] hover:bg-[#b08e4d] border border-[#b08e4d]/40 disabled:bg-stone-200/60 disabled:text-stone-500 disabled:border-stone-300 text-stone-950 transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
            >
              <span>인증 승인</span>
            </button>
            {showApproveDropdown && selectedMembershipIds.length > 0 && (
              <div className={`absolute right-0 ${isBottom ? 'bottom-full mb-1' : 'mt-1'} w-24 origin-${isBottom ? 'bottom-right' : 'top-right'} rounded-lg bg-white border border-stone-200 shadow-xl z-50 divide-y divide-stone-100 select-none`}>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => handleBulkApprove(1)}
                    className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-all block cursor-pointer"
                  >
                    1달 승인
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkApprove(3)}
                    className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-all block cursor-pointer"
                  >
                    3달 승인
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkApprove(12)}
                    className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-[#C5A059] hover:text-[#b08e4d] hover:bg-stone-50 transition-all block cursor-pointer"
                  >
                    1년 승인
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleBulkSuspend}
            disabled={isBulkSuspending || selectedMembershipIds.length === 0}
            className="h-6 px-2.5 rounded-lg text-[10px] font-bold bg-red-600 hover:bg-red-700 border border-red-700/30 disabled:bg-stone-200/60 disabled:text-stone-500 disabled:border-stone-300 text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span>가동 정지</span>
          </button>

          <button
            type="button"
            onClick={handleBulkExpire}
            disabled={isBulkApproving || selectedMembershipIds.length === 0}
            className="h-6 px-2.5 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 border border-amber-600/30 disabled:bg-stone-200/60 disabled:text-stone-500 disabled:border-stone-300 text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span>인증 만료</span>
          </button>

          <button
            type="button"
            onClick={handleBulkImminent}
            disabled={isBulkApproving || selectedMembershipIds.length === 0}
            className="h-6 px-2.5 rounded-lg text-[10px] font-bold bg-orange-600 hover:bg-orange-700 border border-orange-700/30 disabled:bg-stone-200/60 disabled:text-stone-500 disabled:border-stone-300 text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span>종료 임박</span>
          </button>

          <button
            type="button"
            onClick={handleEditSelected}
            disabled={selectedMembershipIds.length !== 1}
            className="h-6 px-2.5 rounded-lg text-[10px] font-bold bg-amber-600 hover:bg-amber-700 border border-amber-700/30 disabled:bg-stone-200/60 disabled:text-stone-500 disabled:border-stone-300 text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span>수정</span>
          </button>

          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={selectedMembershipIds.length === 0}
            className="h-6 px-2.5 rounded-lg text-[10px] font-bold bg-[#422B1E] hover:bg-[#5b3d2b] border border-[#422B1E]/30 disabled:bg-stone-200/60 disabled:text-stone-500 disabled:border-stone-300 text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span>삭제</span>
          </button>

          {/* 매장 유형 일괄 변경 */}
          <div className="flex items-center gap-1 border-l border-stone-200 pl-1.5 ml-0.5">
            <select
              value={bulkStoreType}
              onChange={(e) => setBulkStoreType(e.target.value)}
              disabled={selectedMembershipIds.length === 0 || isBulkUpdatingType}
              className="h-6 px-1.5 text-[9.5px] font-bold rounded border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer disabled:opacity-50 disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option value="">유형 일괄선택</option>
              <option value="MEMBERSHIP">멤버십</option>
              <option value="HASTE_MEMBERSHIP">헤이스트멤버십</option>
              <option value="EXECUTIVE">임원</option>
            </select>
            <button
              type="button"
              onClick={handleBulkUpdateStoreType}
              disabled={!bulkStoreType || selectedMembershipIds.length === 0 || isBulkUpdatingType}
              className="h-6 px-2 rounded-lg text-[9.5px] font-bold bg-[#C5A059] hover:bg-[#b08e4d] border border-[#b08e4d]/40 disabled:bg-stone-200/60 disabled:text-stone-500 text-stone-950 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span>{isBulkUpdatingType ? '변경중...' : '유형 변경'}</span>
            </button>
          </div>

          {/* 솔루션 등급 일괄 변경 */}
          <div className="flex items-center gap-1 border-l border-stone-200 pl-1.5 ml-0.5">
            <select
              value={bulkStoreGrade}
              onChange={(e) => setBulkStoreGrade(e.target.value as any)}
              disabled={selectedMembershipIds.length === 0 || isBulkUpdatingGrade}
              className="h-6 px-1.5 text-[9.5px] font-bold rounded border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer disabled:opacity-50 disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option value="">등급 일괄선택</option>
              <option value="STANDARD">베이직</option>
              <option value="PREMIUM">프리미엄</option>
            </select>
            <button
              type="button"
              onClick={handleBulkUpdateStoreGrade}
              disabled={!bulkStoreGrade || selectedMembershipIds.length === 0 || isBulkUpdatingGrade}
              className="h-6 px-2 rounded-lg text-[9.5px] font-bold bg-[#C5A059] hover:bg-[#b08e4d] border border-[#b08e4d]/40 disabled:bg-stone-200/60 disabled:text-stone-500 text-stone-950 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span>{isBulkUpdatingGrade ? '변경중...' : '등급 변경'}</span>
            </button>
          </div>
        </div>
        {!isBottom && showOnlyTestMembers && (
          <span className="text-[9px] text-rose-600 bg-rose-50 border border-rose-200/50 rounded px-1.5 py-0.5 animate-pulse font-bold font-sans">
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
          <AdminCompMembershipTestCreator
            isBulkCreating={isBulkCreating}
            setIsBulkCreating={setIsBulkCreating}
            fetchIntegratedBulkData={fetchIntegratedBulkData}
            fetchCloudMembers={fetchCloudMembers}
            setSelectedMembershipIds={setSelectedMembershipIds}
            showAlert={showAlert}
          />

          <button
            type="button"
            onClick={toggleTestMembersFilter}
            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              showOnlyTestMembers
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm hover:bg-rose-100'
                : 'bg-white border-stone-200 text-stone-550 hover:bg-stone-50 shadow-xs'
            }`}
          >
            <AlertOctagon size={11} className={showOnlyTestMembers ? "animate-pulse" : ""} />
            <span>테스트 대조 필터</span>
          </button>

          <button
            type="button"
            onClick={toggleSkipTestMembers}
            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              skipTestMembers
                ? 'bg-[#C5A059]/15 border-[#C5A059]/40 text-[#C5A059] shadow-sm hover:bg-[#C5A059]/25'
                : 'bg-white border-stone-200 text-stone-550 hover:bg-stone-50 shadow-xs'
            }`}
          >
            <AlertOctagon size={11} className={skipTestMembers ? "animate-pulse" : ""} />
            <span>테스트생략</span>
          </button>
        </div>
      )}
    </div>
  );
};
