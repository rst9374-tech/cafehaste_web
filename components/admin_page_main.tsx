import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, ShieldCheck, User, Lock, RefreshCw, AlertOctagon, Layout, Database, Film, MessageSquare, Music, Disc
} from 'lucide-react';

import { HeroDraft } from '../types';

// Import our beautifully refactored subtabs and state hook
import { useAdminState } from './admin/admin_hook_state';
import { AdminFilmsTab } from './admin/admin_comp_films';
import { AdminDraftsTab } from './admin/admin_comp_drafts';
import { AdminDesignTab } from './admin/admin_comp_design';
import { AdminMenuTab } from './admin/admin_comp_menu';
import { AdminMembersTab } from './admin/admin_comp_members';
import { HasteBoard } from './board_page_main';
import { AdminSystemHub } from './admin/admin_comp_systemhub';
import { AdminPagination } from './admin/admin_comp_pagination';
import { AdminPermissionsTab } from './admin/admin_comp_permissions';
import { AdminHqStampTab } from './admin/admin_comp_hqstamp';
import { AdminLogin } from './admin/admin_comp_login';

interface HasteAdminProps {
  heroDrafts: HeroDraft[];
  onUpdateDrafts: (drafts: HeroDraft[]) => void;
  activeAdminTab?: string;
  setActiveAdminTab?: (tab: string) => void;
  interiorsList?: any[];
  onUpdateInteriors?: (interiors: any[]) => void;
  loggedUser?: any;
  draftRandomShow?: boolean;
  setDraftRandomShow?: (v: boolean) => void;
  filmRandomShow?: boolean;
  setFilmRandomShow?: (v: boolean) => void;
  
  // Mobile Simulator addition
  mockMobileFrame?: boolean;
  setMockMobileFrame?: (val: boolean) => void;
  useMobileCompact?: boolean;
  setUseMobileCompact?: (val: boolean) => void;
  setShowQRModal?: (val: boolean) => void;
}

export const HasteAdmin: React.FC<HasteAdminProps> = ({ 
  heroDrafts, 
  onUpdateDrafts,
  activeAdminTab = 'FILMS',
  setActiveAdminTab = () => {},
  interiorsList,
  onUpdateInteriors,
  loggedUser,
  draftRandomShow = false,
  setDraftRandomShow = () => {},
  filmRandomShow = false,
  setFilmRandomShow = () => {},
  
  mockMobileFrame = false,
  setMockMobileFrame = () => {},
  useMobileCompact = true,
  setUseMobileCompact = () => {},
  setShowQRModal = () => {}
}) => {
  const {
    successMsg,
    errorMsg,
    isAdminAuth,
    enteredUsername,
    setEnteredUsername,
    enteredPassword,
    setEnteredPassword,
    authError,
    isAuthLoading,
    interiors,
    setInteriors,
    adminFilter,
    setAdminFilter,
    adminCategories,
    setAdminCategories,
    adminMenuItems,
    setAdminMenuItems,
    adminMenuItemsAll,
    setAdminMenuItemsAll,
    cloudMembers,
    isFetchingCloud,
    cloudError,
    cloudDbInfo,
    selectedDbTable,
    setSelectedDbTable,
    cloudConsultations,
    isFetchingConsultations,
    fetchCloudMembers,
    fetchDbInfo,
    fetchCloudConsultations,
    handleUpdateCloudConsultationStatus,
    handleCloudDeleteConsultation,
    triggerAutoBillingCycle,
    togglePaymentStatus,
    handleAddLocalMember,
    deleteMember,
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
    handleLogout,
  } = useAdminState({ interiorsList, onUpdateInteriors });

  // 3대 마스터 대메뉴 & 하부 서브 탭 로컬 상태 관리
  const [currentMainTab, setCurrentMainTab] = useState<'PAGES' | 'BOARDS' | 'LEDGERS'>('PAGES');
  const [subTabPages, setSubTabPages] = useState<'FILMS' | 'DRAFTS' | 'INQUIRY' | 'MENU' | 'MENU_ALL'>('FILMS');
  const [subTabBoards, setSubTabBoards] = useState<'BOARD' | 'PERMISSIONS' | 'HQ_STAMP'>('BOARD');

  useEffect(() => {
    if (isAdminAuth && currentMainTab === 'LEDGERS') {
      fetchCloudMembers();
      fetchCloudConsultations();
      fetchDbInfo();
    }
  }, [currentMainTab, isAdminAuth]);

  // Shared Pagination renderer
  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => {
    return (
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    );
  };

  if (!isAdminAuth) {
    return (
      <AdminLogin
        enteredUsername={enteredUsername}
        setEnteredUsername={setEnteredUsername}
        enteredPassword={enteredPassword}
        setEnteredPassword={setEnteredPassword}
        authError={authError}
        isAuthLoading={isAuthLoading}
        handleAdminLogin={handleAdminLogin}
      />
    );
  }

  return (
    <div className="w-full max-w-none px-4 sm:px-8 pt-4 pb-8 font-sans text-stone-800">
      
      {/* 3대 통합 마스터 대메뉴 바 */}
      <div className="flex flex-wrap border-b border-stone-200 mb-4 bg-stone-50/50 rounded-xl p-1 gap-1 select-none">
        <button
          onClick={() => setCurrentMainTab('PAGES')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${ currentMainTab === 'PAGES' ? 'bg-[#C5A059] text-stone-950 font-extrabold shadow-sm' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60' }`}
        >
          <Layout size={13} />
          <span>페이지</span>
        </button>
        <button
          onClick={() => setCurrentMainTab('BOARDS')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${ currentMainTab === 'BOARDS' ? 'bg-[#C5A059] text-stone-950 font-extrabold shadow-sm' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60' }`}
        >
          <MessageSquare size={13} />
          <span>게시판</span>
        </button>
        <button
          onClick={() => setCurrentMainTab('LEDGERS')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${ currentMainTab === 'LEDGERS' ? 'bg-[#C5A059] text-stone-950 font-extrabold shadow-sm' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60' }`}
        >
          <ShieldCheck size={13} />
          <span>관리대장</span>
        </button>

        <button
          onClick={handleLogout}
          className="ml-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-500 transition-all font-mono whitespace-nowrap cursor-pointer select-none"
        >
          <ShieldCheck size={13} />
          <span>ADMIN LOGOUT</span>
        </button>
      </div>

      {/* Success/Error Notifications inside Board */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm font-sans"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">⚠️ Error:</span>
              <span>{errorMsg}</span>
            </div>
            <span className="text-[10px] uppercase font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded">Error</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm font-sans"
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓ Saved:</span>
              <span>{successMsg}</span>
            </div>
            <span className="text-[10px] uppercase font-mono bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded">Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC TAB SWITCHING REDIRECTS */}
      {currentMainTab === 'PAGES' && (
        <>
          {/* PAGES 서브 탭바 */}
          <div className="flex flex-wrap bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1 mb-4 select-none w-fit">
            <button
              onClick={() => setSubTabPages('FILMS')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${ subTabPages === 'FILMS' ? 'bg-stone-900 text-white shadow-sm font-extrabold' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40' }`}
            >
              <Film size={12} />
              <span>필름 게시판</span>
            </button>
            <button
              onClick={() => setSubTabPages('DRAFTS')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${ subTabPages === 'DRAFTS' ? 'bg-stone-900 text-white shadow-sm font-extrabold' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40' }`}
            >
              <Layout size={12} />
              <span>메인 게시판</span>
            </button>
            <button
              onClick={() => setSubTabPages('INQUIRY')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${ subTabPages === 'INQUIRY' ? 'bg-stone-900 text-white shadow-sm font-extrabold' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40' }`}
            >
              <Settings size={12} />
              <span>인테리어 게시판</span>
            </button>
            <button
              onClick={() => setSubTabPages('MENU_ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${ subTabPages === 'MENU_ALL' ? 'bg-stone-900 text-white shadow-sm font-extrabold' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40' }`}
            >
              <Database size={12} />
              <span>메뉴 게시판</span>
            </button>
          </div>

          {subTabPages === 'FILMS' && (
            <AdminFilmsTab 
              showTemporaryToast={showTemporaryToast}
              showTemporaryError={showTemporaryError}
              renderPagination={renderPagination}
              filmRandomShow={filmRandomShow}
              setFilmRandomShow={setFilmRandomShow}
            />
          )}
          {subTabPages === 'DRAFTS' && (
            <AdminDraftsTab 
              heroDrafts={heroDrafts}
              onUpdateDrafts={onUpdateDrafts}
              showTemporaryToast={showTemporaryToast}
              showTemporaryError={showTemporaryError}
              renderPagination={renderPagination}
              draftRandomShow={draftRandomShow}
              setDraftRandomShow={setDraftRandomShow}
            />
          )}
          {subTabPages === 'INQUIRY' && (
            <AdminDesignTab 
              interiors={interiors}
              setInteriors={(newInts) => {
                setInteriors(newInts);
                localStorage.setItem('haste_interior_types', JSON.stringify(newInts));
                window.dispatchEvent(new Event('haste_interior_updated'));
                if (onUpdateInteriors) {
                  onUpdateInteriors(newInts);
                }
              }}
              showTemporaryToast={showTemporaryToast}
              showTemporaryError={showTemporaryError}
              renderPagination={renderPagination}
            />
          )}
          {subTabPages === 'MENU_ALL' && (
            <AdminMenuTab 
              adminCategories={adminCategories}
              setAdminCategories={setAdminCategories}
              adminMenuItems={adminMenuItemsAll}
              setAdminMenuItems={setAdminMenuItemsAll}
              showTemporaryToast={showTemporaryToast}
              showTemporaryError={showTemporaryError}
              renderPagination={renderPagination}
              isMenuAll={true}
            />
          )}
        </>
      )}

      {currentMainTab === 'BOARDS' && (
        <>
          {/* BOARDS 서브 탭바 */}
          <div className="flex flex-wrap bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1 mb-4 select-none w-fit">
            {[
              { id: 'BOARD', label: '소통 게시판', icon: MessageSquare },
              { id: 'PERMISSIONS', label: '게시판 등급 권한', icon: Lock },
              { id: 'HQ_STAMP', label: '헤이스트 서명/직인', icon: ShieldCheck }
            ].map((tab) => {
              const isActive = subTabBoards === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubTabBoards(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-stone-900 text-white shadow-sm font-extrabold' 
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {subTabBoards === 'BOARD' && (
            <HasteBoard 
              loggedUser={loggedUser || { role: 'ADMIN', username: 'admin', store_name: '헤이스트' }}
              onOpenLogin={() => {}}
              onOpenSignUp={() => {}}
              isNested={true}
            />
          )}
          {subTabBoards === 'PERMISSIONS' && (
            <AdminPermissionsTab 
              showTemporaryToast={showTemporaryToast}
              showTemporaryError={showTemporaryError}
            />
          )}
          {subTabBoards === 'HQ_STAMP' && (
            <AdminHqStampTab 
              showTemporaryToast={showTemporaryToast}
              showTemporaryError={showTemporaryError}
            />
          )}
        </>
      )}

      {currentMainTab === 'LEDGERS' && (
        <AdminMembersTab 
          showTemporaryToast={showTemporaryToast}
          showTemporaryError={showTemporaryError}
          cloudDbInfo={cloudDbInfo}
          cloudMembers={cloudMembers}
          cloudError={cloudError}
          isFetchingCloud={isFetchingCloud}
          fetchCloudMembers={fetchCloudMembers}
          handleCloudDeleteMember={handleCloudDeleteMember}
          deleteMember={deleteMember}
          renderPagination={renderPagination}
          handleUpdateCloudStoreType={handleUpdateCloudStoreType}
          cloudConsultations={cloudConsultations}
          isFetchingConsultations={isFetchingConsultations}
          fetchCloudConsultations={fetchCloudConsultations}
          handleUpdateCloudConsultationStatus={handleUpdateCloudConsultationStatus}
          handleCloudDeleteConsultation={handleCloudDeleteConsultation}
          loggedUser={loggedUser}
        />
      )}
    </div>
  );
};
