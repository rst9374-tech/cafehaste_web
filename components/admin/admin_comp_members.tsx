import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, Terminal, HelpCircle, RefreshCw, Settings
} from 'lucide-react';
import { AdminMembershipSubTab } from './admin_comp_membershipsub';
import { AdminFranchiseSubTab } from './admin_comp_franchisesub';
import { AdminLicensesValidator } from './admin_comp_licenses_validator';
import { AdminPageTestValidator } from './admin_page_test_validator';
import { MemberEditModal, AdminConfirmModal } from './admin_comp_shared';
import { useMemberLicenses } from './admin_hook_members_license';
import { useAdminLicenses } from './admin_hook_licenses';
import { AlertModal, CertLightbox } from './admin_comp_members_dialogs';
import { AdminSystemHub } from './admin_comp_systemhub';

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

  // External Routing support
  activeCategory?: 'FRANCHISE_INQUIRY' | 'MEMBERSHIP_LICENSES' | 'VALIDATOR' | 'KIOSK_CONFIG' | 'API_TUNNEL';
  setActiveCategory?: (cat: 'FRANCHISE_INQUIRY' | 'MEMBERSHIP_LICENSES' | 'VALIDATOR' | 'KIOSK_CONFIG' | 'API_TUNNEL') => void;
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
  loggedUser,
  activeCategory,
  setActiveCategory
}) => {
  const [localCategory, setLocalCategory] = useState<'FRANCHISE_INQUIRY' | 'MEMBERSHIP_LICENSES' | 'VALIDATOR' | 'KIOSK_CONFIG' | 'API_TUNNEL'>('FRANCHISE_INQUIRY');
  const currentCategory = activeCategory || localCategory;
  const handleSetCategory = setActiveCategory || setLocalCategory;
  
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
    if (currentCategory === 'FRANCHISE_INQUIRY') {
      fetchCloudConsultations();
    }
  }, [currentCategory]);

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
    <div className="space-y-2.5">
      <div id="admin-integrated-view-segment" className="animate-fadeIn">
        {currentCategory === 'API_TUNNEL' && (
          <AdminSystemHub 
            showTemporaryToast={showTemporaryToast}
            showTemporaryError={showTemporaryError}
          />
        )}

        {currentCategory === 'MEMBERSHIP_LICENSES' && (
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

        {currentCategory === 'VALIDATOR' && (
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
        )}

        {currentCategory === 'KIOSK_CONFIG' && (
          <div className="bg-[#070609]/95 border border-stone-900 rounded-2xl p-4">
            <AdminPageTestValidator mode="KIOSK" />
          </div>
        )}

        {currentCategory === 'FRANCHISE_INQUIRY' && (
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
