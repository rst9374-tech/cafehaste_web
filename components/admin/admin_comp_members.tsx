import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, Terminal, HelpCircle, RefreshCw, BookOpen, Settings
} from 'lucide-react';
import { AdminMembershipSubTab } from './admin_comp_membershipsub';
import { AdminFranchiseSubTab } from './admin_comp_franchisesub';
import { AdminLicensesValidator } from './admin_comp_licenses_validator';
import { AdminPageTestValidator } from './admin_page_test_validator';
import { AdminLicensesGuidebook } from './admin_comp_licenses_guidebook';
import { MemberEditModal, AdminConfirmModal } from './admin_comp_shared';
import { useMemberLicenses } from './admin_hook_members_license';
import { useAdminLicenses } from './admin_hook_licenses';
import { AlertModal, CertLightbox } from './admin_comp_members_dialogs';

interface AdminMembersTabProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  cloudDbInfo: any;
  cloudMembers: any[];
  isFetchingCloud: boolean;
  fetchCloudMembers: () => Promise<void>;
  handleCloudDeleteMember: (id: any, skipConfirm?: boolean) => Promise<void>;
  deleteMember: (id: any, skipConfirm?: boolean) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  handleUpdateCloudStoreType: (id: any, storeType: any) => Promise<void>;
  cloudConsultations: any[];
  isFetchingConsultations: boolean;
  fetchCloudConsultations: () => Promise<void>;
  handleCloudDeleteConsultation: (id: any, skipConfirm?: boolean) => Promise<void>;
  cloudError?: string | null;
  handleUpdateCloudConsultationStatus: (id: any, status: any) => Promise<void>;
  loggedUser?: any;
}

export const AdminMembersTab: React.FC<AdminMembersTabProps> = ({
  showTemporaryToast,
  showTemporaryError,
  cloudDbInfo,
  cloudMembers,
  isFetchingCloud,
  fetchCloudMembers,
  handleCloudDeleteMember,
  deleteMember,
  renderPagination,
  handleUpdateCloudStoreType,
  cloudConsultations,
  isFetchingConsultations,
  fetchCloudConsultations,
  handleCloudDeleteConsultation,
  cloudError,
  handleUpdateCloudConsultationStatus,
  loggedUser
}) => {
  const [activeCategory, setActiveCategory] = useState<'FRANCHISE_INQUIRY' | 'MEMBERSHIP_LICENSES' | 'VALIDATOR' | 'KIOSK_CONFIG' | 'GUIDEBOOK'>('FRANCHISE_INQUIRY');
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  } | null>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const showAlert = (title: string, message: string) => {
    setAlertModal({ isOpen: true, title, message });
  };

  const {
    licenseStats,
    licenses,
    cloudMembers: bulkMembers,
    isFetchingSub,
    isProcessingToggle,
    fetchIntegratedBulkData,
    quickToggleLicense,
    handleCopyToLicenses,
    handleUpdateStoreGrade
  } = useMemberLicenses(showAlert, showConfirm, showTemporaryToast, showTemporaryError);

  const validatorProps = useAdminLicenses({ cloudDbInfo });

  const [selectedCertUrl, setSelectedCertUrl] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [selectedMembershipIds, setSelectedMembershipIds] = useState<any[]>([]);
  const [selectedConsultationIds, setSelectedConsultationIds] = useState<any[]>([]);

  useEffect(() => {
    fetchIntegratedBulkData('CLOUD_SQL');
  }, []);

  useEffect(() => {
    if (activeCategory === 'FRANCHISE_INQUIRY') {
      fetchCloudConsultations();
    }
  }, [activeCategory]);

  const handleEditMemberSubmit = async (updatedFields: any) => {
    setEditingMember(null);
    try {
      const res = await fetch(`/api/registered-members/${updatedFields.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        showTemporaryToast('가맹 회원 정보가 안전하게 저장되었습니다.');
        await fetchIntegratedBulkData('CLOUD_SQL');
      } else {
        showTemporaryError('수정 저장 중 에러가 발생했습니다.');
      }
    } catch (e: any) {
      showTemporaryError(e.message);
    }
  };

  const handleUpdateStoreTypeWithReload = async (id: any, type: any) => {
    try {
      await handleUpdateCloudStoreType(id, type);
      showTemporaryToast(`매장 유형이 '${type}'(으)로 실시간 개편 완료되었습니다.`);
      await fetchIntegratedBulkData('CLOUD_SQL');
    } catch (e: any) {
      showTemporaryError(e.message || '매장 유형 변경 실패');
    }
  };

  const riskCount = useMemo(() => {
    return (validatorProps.apiLogs || []).filter((log: any) => {
      const storeId = (log.storeId || '').trim();
      const isNumeric = storeId !== '' && /^\d+$/.test(storeId);
      if (!isNumeric) return false;
      
      if (log.isApproved) return false;
      const msg = (log.message || '').toUpperCase();
      if (
        msg.includes('PENDING') || 
        msg.includes('EXPIRED') || 
        msg.includes('SUSPENDED') || 
        msg.includes('만료') || 
        msg.includes('정지') || 
        msg.includes('대기') ||
        msg.includes('주의')
      ) {
        return false;
      }
      return true;
    }).length;
  }, [validatorProps.apiLogs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-stone-50 border border-stone-200 p-2.5 rounded-2xl shadow-sm gap-3 select-none">
        <div className="flex flex-wrap bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1">
          <button
            onClick={() => setActiveCategory('FRANCHISE_INQUIRY')}
            className={`px-3.5 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'FRANCHISE_INQUIRY'
                ? 'bg-stone-900 text-[#C5A059] shadow-sm font-extrabold'
                : 'text-stone-500 hover:text-stone-850 hover:bg-stone-200/40'
            }`}
          >
            <HelpCircle size={12} />
            <span>창업상담신청</span>
          </button>

          <button
            onClick={() => setActiveCategory('MEMBERSHIP_LICENSES')}
            className={`px-3.5 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'MEMBERSHIP_LICENSES'
                ? 'bg-stone-900 text-[#C5A059] shadow-sm font-extrabold'
                : 'text-stone-500 hover:text-stone-850 hover:bg-stone-200/40'
            }`}
          >
            <ShieldCheck size={12} />
            <span>라이선스관리</span>
          </button>

          <button
            onClick={() => setActiveCategory('VALIDATOR')}
            className={`px-3.5 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'VALIDATOR'
                ? 'bg-[#E33535]/15 border border-[#E33535]/30 text-[#E33535] shadow-xs font-extrabold'
                : 'text-stone-500 hover:text-rose-700 hover:bg-rose-50/10'
            }`}
          >
            <Terminal size={12} className={activeCategory === 'VALIDATOR' ? 'animate-pulse' : ''} />
            <span>실시간 멤버십 검증기</span>
            {riskCount > 0 && (
              <span className="ml-1 px-1 bg-[#E33535] text-white text-[9px] rounded-full font-mono animate-bounce self-center leading-none py-0.5">
                {riskCount}
              </span>
            )}
          </button>
 
          <button
            onClick={() => setActiveCategory('KIOSK_CONFIG')}
            className={`px-3.5 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'KIOSK_CONFIG'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-xs font-extrabold'
                : 'text-stone-500 hover:text-amber-500 hover:bg-amber-500/5'
            }`}
          >
            <Settings size={12} className={activeCategory === 'KIOSK_CONFIG' ? 'animate-pulse' : ''} />
            <span>키오스크 연동 설정</span>
          </button>

          <button
            onClick={() => setActiveCategory('GUIDEBOOK')}
            className={`px-3.5 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'GUIDEBOOK'
                ? 'bg-stone-900 text-[#C5A059] shadow-sm font-extrabold'
                : 'text-stone-500 hover:text-stone-850 hover:bg-stone-200/40'
            }`}
          >
            <BookOpen size={12} />
            <span>가이드북</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto font-sans">
          <button
            type="button"
            onClick={async () => {
              if (activeCategory === 'FRANCHISE_INQUIRY') {
                await fetchCloudConsultations();
              } else {
                await fetchIntegratedBulkData('CLOUD_SQL');
              }
              showTemporaryToast('실시간 클라우드 DB 데이터 갱신이 완료되었습니다.');
            }}
            disabled={isFetchingSub || isFetchingConsultations}
            className="h-8 px-3.5 border border-stone-200 hover:border-stone-350 bg-white hover:bg-stone-50 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all text-[11px] text-stone-600 font-bold hover:text-stone-850 cursor-pointer select-none shadow-sm"
          >
            <RefreshCw size={11} className={(isFetchingSub || isFetchingConsultations) ? 'animate-spin text-stone-850' : 'text-stone-400'} />
            <span>수동 동기화 v.Bulk</span>
          </button>
        </div>
      </div>

      <div id="admin-integrated-view-segment" className="animate-fadeIn">
        {activeCategory === 'MEMBERSHIP_LICENSES' && (
          <AdminMembershipSubTab
            cloudDbInfo={cloudDbInfo}
            cloudMembers={bulkMembers}
            isFetchingCloud={isFetchingSub}
            fetchCloudMembers={() => fetchIntegratedBulkData('CLOUD_SQL')}
            licenses={licenses}
            selectedMembershipIds={selectedMembershipIds}
            setSelectedMembershipIds={setSelectedMembershipIds}
            setEditingMember={setEditingMember}
            setSelectedCertUrl={setSelectedCertUrl}
            showConfirm={showConfirm}
            showAlert={showAlert}
            handleUpdateCloudStoreType={handleUpdateStoreTypeWithReload}
            handleCloudDeleteMember={async (id) => {
              await handleCloudDeleteMember(id, true);
              await fetchIntegratedBulkData('CLOUD_SQL');
            }}
            renderPagination={renderPagination}
            onQuickToggle={(memberId, act, months) => quickToggleLicense(memberId, act, 'CLOUD_SQL', months)}
            isProcessingToggle={isProcessingToggle}
            fetchIntegratedBulkData={fetchIntegratedBulkData}
            handleUpdateStoreGrade={handleUpdateStoreGrade}
          />
        )}

        {activeCategory === 'VALIDATOR' && (
          <div className="bg-white text-stone-850 p-1.5 rounded-3xl border-4 border-stone-200 shadow-2xl relative">
            <div className="absolute top-4 left-5 flex items-center gap-1.5 font-bold text-xs bg-[#E33535] text-white p-1 px-2.5 rounded-lg border border-[#ff4e4e] animate-pulse">
              <ShieldAlert size={12} />
              <span>실시간 하이재킹 모니터 검문소</span>
            </div>
            <div className="pt-10">
              <AdminLicensesValidator
                testStoreId={validatorProps.testStoreId}
                setTestStoreId={validatorProps.setTestStoreId}
                testApiKey={validatorProps.testApiKey}
                setTestApiKey={validatorProps.setTestApiKey}
                testResult={validatorProps.testResult}
                isTesting={validatorProps.isTesting}
                apiLogs={validatorProps.apiLogs}
                isLoadingLogs={validatorProps.isLoadingLogs}
                setIsKioskPopupOpen={validatorProps.setIsKioskPopupOpen}
                handleClearLogs={validatorProps.handleClearLogs}
                handleClearDbLogs={validatorProps.handleClearDbLogs}
                handleTestVerify={validatorProps.handleTestVerify}
                logAnalysis={validatorProps.logAnalysis}
                fetchApiLogs={validatorProps.fetchApiLogs}
                licenses={licenses}
                dbSize={validatorProps.dbSize}
              />
            </div>
          </div>
        )}

        {activeCategory === 'KIOSK_CONFIG' && (
          <div className="bg-white text-stone-850 p-2 rounded-3xl border border-stone-200 shadow-sm relative">
            <AdminPageTestValidator mode="KIOSK" />
          </div>
        )}

        {activeCategory === 'FRANCHISE_INQUIRY' && (
          <AdminFranchiseSubTab
            cloudDbInfo={cloudDbInfo}
            cloudConsultations={cloudConsultations}
            isFetchingConsultations={isFetchingConsultations}
            fetchCloudConsultations={fetchCloudConsultations}
            selectedConsultationIds={selectedConsultationIds}
            setSelectedConsultationIds={setSelectedConsultationIds}
            handleCompleteFranchiseCloud={async (c) => {
              try {
                const res = await fetch('/api/consultations/move-to-member', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ consultationId: c.id })
                });
                const data = await res.json();
                if (data.success) {
                  showTemporaryToast(`'${c.ownerName || '상담자'}' 점주의 회원 이동이 정상 완료되었으며, 상담 신청서에서 안전하게 이전되었습니다.`);
                  await fetchCloudConsultations();
                  await fetchIntegratedBulkData('CLOUD_SQL');
                } else {
                  showTemporaryError(data.message || '멤버십 가입점 이전 처리 중 예외 발생.');
                }
              } catch (e: any) {
                showTemporaryError(e.message || '멤버 이전 통신 실패');
              }
            }}
            renderPagination={renderPagination}
          />
        )}

        {activeCategory === 'GUIDEBOOK' && (
          <AdminLicensesGuidebook
            cloudDbInfo={cloudDbInfo}
            dbSize={validatorProps.dbSize}
          />
        )}
      </div>

      {editingMember && (
        <MemberEditModal
          member={editingMember}
          licenses={licenses}
          onClose={() => setEditingMember(null)}
          onSave={handleEditMemberSubmit}
        />
      )}

      {selectedCertUrl && (
        <CertLightbox selectedCertUrl={selectedCertUrl} onClose={() => setSelectedCertUrl(null)} />
      )}

      {confirmModal && (
        <AdminConfirmModal
          message={confirmModal.message}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
        />
      )}

      {alertModal && (
        <AlertModal
          alertModal={alertModal}
          onClose={() => setAlertModal(null)}
        />
      )}
    </div>
  );
};
