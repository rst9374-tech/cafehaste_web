import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, ShieldCheck, User, Lock, RefreshCw, AlertOctagon, Layout, Database, Film, MessageSquare, Music, Disc, ChevronDown, ChevronUp, LogOut
} from 'lucide-react';

import { HeroDraft } from './home_types';

// Import our beautifully refactored subtabs and state hook
import { useAdminState } from './admin/admin_hook_state';
import { AdminFilmsTab } from './admin/admin_comp_films';
import { AdminDraftsTab } from './admin/admin_comp_drafts';
import { AdminDesignTab } from './admin/admin_comp_design';
import { AdminMenuTab } from './admin/admin_comp_menu';
import { AdminMembersTab } from './admin/admin_comp_members';
import { AdminPagination } from './admin/admin_comp_pagination';
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

  // 3대 마스터 대메뉴 & 하부 서브 탭 로컬 상태 관리 (BOARDS/소통망 완전 소거)
  const [currentMainTab, setCurrentMainTab] = useState<'PAGES' | 'LEDGERS'>('PAGES');
  const [subTabPages, setSubTabPages] = useState<'FILMS' | 'DRAFTS' | 'INQUIRY' | 'MENU' | 'MENU_ALL'>('FILMS');
  const [subTabLedgers, setSubTabLedgers] = useState<'FRANCHISE_INQUIRY' | 'MEMBERSHIP_LICENSES' | 'VALIDATOR' | 'KIOSK_CONFIG' | 'API_TUNNEL'>('FRANCHISE_INQUIRY');

  useEffect(() => {
    if (isAdminAuth && currentMainTab === 'LEDGERS') {
      fetchCloudMembers();
      fetchCloudConsultations();
      fetchDbInfo();
    }
  }, [currentMainTab, isAdminAuth]);

  // 아코디언 메뉴 그룹 오픈 여부 (대시보드 스타일 복사)
  const [isPagesGroupOpen, setIsPagesGroupOpen] = useState<boolean>(true);
  const [isLedgersGroupOpen, setIsLedgersGroupOpen] = useState<boolean>(true);

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

  // 현재 선택된 서브 탭의 한글 대제목 및 설명 (헤더용)
  const getTabHeaderInfo = () => {
    if (currentMainTab === 'PAGES') {
      if (subTabPages === 'FILMS') return { title: '필름 영화관 관리', desc: '본사 사이트에 노출되는 영화 홍보 필름과 아카이브 비디오 리스트를 제어합니다.' };
      if (subTabPages === 'DRAFTS' || subTabPages === 'MENU') return { title: '메인 디자인 관리', desc: '홈페이지 최상단 영웅 섹션의 슬라이드 드래프트 정보와 텍스트를 관리합니다.' };
      if (subTabPages === 'INQUIRY') return { title: '인테리어 관리', desc: '창업 희망자가 참고할 수 있는 본사 공인 인테리어 도면 및 카탈로그 사양을 편집합니다.' };
      return { title: '음료 메뉴 관리', desc: '점포 주문용 키오스크 및 모바일 카트에 바인딩될 표준 음료 레시피와 단가를 총괄합니다.' };
    }
    if (currentMainTab === 'LEDGERS') {
      if (subTabLedgers === 'FRANCHISE_INQUIRY') return { title: '가맹점 관리대장', desc: '신규 창업 상담 신청서 접수 현황 및 처리 이력을 관제합니다.' };
      if (subTabLedgers === 'MEMBERSHIP_LICENSES') return { title: '멤버십 관리대장', desc: '전국 가맹 매장 경영주님의 상세 계정 정보 및 라이선스 기간을 연장/갱신합니다.' };
      if (subTabLedgers === 'VALIDATOR') return { title: '실시간 멤버십 검증기', desc: '로컬 키오스크와 머신의 비인가 요청 및 보안 토큰 변조 시도를 모니터링합니다.' };
      if (subTabLedgers === 'KIOSK_CONFIG') return { title: '키오스크 연동 설정', desc: '매장 카드 결제 단말기 연동 정보 및 간편 결제 SDK 옵션을 통제합니다.' };
      return { title: 'API 연동 관리대장', desc: '본사 백엔드 관제 터널과 각 지점 원격 소켓 간의 양방향 연동 원격 패킷을 기록합니다.' };
    }
    return { title: '가맹점 관리대장', desc: '전산망에 인가된 전국 카페헤이스트 매장 가맹점주님의 상세 회원 정보 및 RLS 권한을 관리합니다.' };
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

  const headerInfo = getTabHeaderInfo();

  return (
    <div className="w-full max-w-[1200px] mx-auto font-sans px-3 md:px-4">
      
      {/* 글로벌 스타일 강제 오버라이드 및 스크롤바 제어 */}
      <style>{`
        .admin-console-wrapper {
          background-color: #070609 !important;
          color: #d6d3d1 !important;
        }
        .admin-console-wrapper table,
        .admin-console-wrapper th,
        .admin-console-wrapper td,
        .admin-console-wrapper tr,
        .admin-console-wrapper div:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper form:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper section {
          border-color: #1c1917 !important;
        }
        .admin-console-wrapper input:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper select:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper textarea:not(.member-edit-modal-wrapper *) {
          border-color: #1c1917 !important;
          background-color: #0c0a09 !important;
          color: #e4e4e7 !important;
        }
        .admin-console-wrapper th {
          background-color: #18181b !important;
        }
        
        /* 글로벌 라이트 배경 강제 다크 반전 (영화/메인 디자인 카드 흰색 등 완전 척결) - 수정 팝업 영역 제외 */
        .admin-console-wrapper .bg-white:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-stone-50:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-stone-100:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-stone-50\/30:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-stone-100\/50:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#FAF9F6]:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#FFF3F3]:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#FDFBF7]:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#FAF5EE]:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#FFF8E1]:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#F9F9FB]:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#F5EFEB]:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .bg-[#EFF6FF]:not(.member-edit-modal-wrapper *) {
          background-color: #0c0a09 !important;
          border-color: #1c1917 !important;
        }
        
        /* 글로벌 라이트 경계선 강제 다크 반전 - 수정 팝업 영역 제외 */
        .admin-console-wrapper .border-stone-100:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .border-stone-200:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .border-stone-250:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .border-stone-300:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .border-stone-200\/60:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .border-stone-200\/80:not(.member-edit-modal-wrapper *) {
          border-color: #1c1917 !important;
        }
 
        /* 텍스트 가독성 강제 패치 - 수정 팝업 영역 제외 */
        .admin-console-wrapper .text-stone-750:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .text-stone-700:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .text-stone-800:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .text-stone-900:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .text-stone-50:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .text-stone-100:not(.member-edit-modal-wrapper *),
        .admin-console-wrapper .text-stone-500:not(.member-edit-modal-wrapper *) {
          color: #d6d3d1 !important;
        }
        .admin-console-wrapper .text-stone-400:not(.member-edit-modal-wrapper *) {
          color: #a8a29e !important;
        }
 
        .admin-console-wrapper .hover\\:bg-stone-200:hover:not(.member-edit-modal-wrapper *) {
          background-color: #27272a !important;
        }
        .admin-console-wrapper img {
          background-color: #0c0a09 !important;
          border-color: #1c1917 !important;
        }
      `}</style>
      
      <div className="w-full flex flex-col md:flex-row gap-6 admin-console-wrapper pt-1">
        
        {/* ① 좌측 사이드바 (LillyDashboard 스타일 100% 복제 - w-[185px] 균형 조율형) */}
        <aside className="w-[185px] shrink-0 flex flex-col justify-between h-[960px] min-h-[960px] max-h-[960px] bg-transparent border-none select-none overflow-y-hidden pt-1 px-2 pb-3 font-sans">
          <div className="flex flex-col gap-4">
            {/* 로고 헤더 */}
            <div className="flex items-center gap-3 px-2 py-3 border-b border-[#1F1F23]/60">
              <div className="flex size-8 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-[#27272A]/70 bg-neutral-950 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="size-5">
                  <path d="M 10 15 L 28 15 L 53 50 L 28 85 L 10 85 L 35 50 Z" fill="#C5A059" />
                  <path d="M 46 15 L 64 15 L 89 50 L 64 85 L 46 85 L 71 50 Z" fill="#C5A059" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold leading-none text-[#E4E4E7] select-none">
                  HASTE HQ
                </p>
              </div>
            </div>

            {/* 아코디언 메뉴 그룹 리스트 */}
            <div className="flex flex-col gap-1">
              
              {/* 1. 페이지 관리 그룹 */}
              <div className="flex flex-col gap-0.5">
                <button 
                  onClick={() => {
                    setIsPagesGroupOpen(!isPagesGroupOpen);
                    setCurrentMainTab('PAGES');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[12.2px] font-bold cursor-pointer transition-all active:scale-95 border border-transparent select-none ${currentMainTab === 'PAGES' ? 'text-[#C5A059] bg-stone-900/40 border-stone-850/80 font-black' : 'text-stone-400 hover:text-stone-250 hover:bg-stone-900/20'}`}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <Layout className={`size-4 shrink-0 ${currentMainTab === 'PAGES' ? 'text-[#C5A059]' : 'text-stone-500'}`} />
                    <span>페이지 관리</span>
                  </div>
                  {isPagesGroupOpen ? <ChevronUp className="size-3.5 text-stone-500" /> : <ChevronDown className="size-3.5 text-stone-500" />}
                </button>

                {isPagesGroupOpen && (
                  <div className="flex flex-col gap-0 pl-4 mt-0.5 transition-all">
                    {[
                      { id: 'FILMS', label: '필름 영화관' },
                      { id: 'DRAFTS', label: '메인 디자인' },
                      { id: 'INQUIRY', label: '인테리어 관리' },
                      { id: 'MENU_ALL', label: '음료 메뉴 관리' }
                    ].map((sub) => {
                      const isActive = currentMainTab === 'PAGES' && subTabPages === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setCurrentMainTab('PAGES');
                            setSubTabPages(sub.id as any);
                          }}
                          className={`w-full flex items-center gap-1.5 py-1 text-[11.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${isActive ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                        >
                          <span className={`text-[7px] leading-none shrink-0 ${isActive ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. 가맹 대장 그룹 */}
              <div className="flex flex-col gap-0.5 mt-1">
                <button 
                  onClick={() => {
                    setIsLedgersGroupOpen(!isLedgersGroupOpen);
                    setCurrentMainTab('LEDGERS');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[12.2px] font-bold cursor-pointer transition-all active:scale-95 border border-transparent select-none ${currentMainTab === 'LEDGERS' ? 'text-[#C5A059] bg-stone-900/40 border-stone-850/80 font-black' : 'text-stone-400 hover:text-stone-250 hover:bg-stone-900/20'}`}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`size-4 shrink-0 ${currentMainTab === 'LEDGERS' ? 'text-[#C5A059]' : 'text-stone-500'}`} />
                    <span>가맹 대장</span>
                  </div>
                  {isLedgersGroupOpen ? <ChevronUp className="size-3.5 text-stone-500" /> : <ChevronDown className="size-3.5 text-stone-500" />}
                </button>

                {isLedgersGroupOpen && (
                  <div className="flex flex-col gap-0 pl-4 mt-0.5 transition-all">
                    {[
                      { id: 'FRANCHISE_INQUIRY', label: '가맹점 관리대장' },
                      { id: 'MEMBERSHIP_LICENSES', label: '멤버십 관리대장' },
                      { id: 'VALIDATOR', label: '실시간 멤버십 검증기' },
                      { id: 'KIOSK_CONFIG', label: '키오스크 연동 설정' },
                      { id: 'API_TUNNEL', label: 'API 연동 관리대장' }
                    ].map((sub) => {
                      const isActive = currentMainTab === 'LEDGERS' && subTabLedgers === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setCurrentMainTab('LEDGERS');
                            setSubTabLedgers(sub.id as any);
                          }}
                          className={`w-full flex items-center gap-1.5 py-1 text-[11.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${isActive ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                        >
                          <span className={`text-[7px] leading-none shrink-0 ${isActive ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-[#1F1F23]/60 p-3 flex flex-col gap-2">
            {/* HASTE 브랜드 슬로건 */}
            <div className="px-2 pb-1 select-none text-left">
              <p className="text-[11px] font-black tracking-[0.12em] text-[#C5A059] uppercase leading-none">
                Smart Automation, Zero Outage
              </p>
              <p className="mt-2 text-[11.5px] font-medium text-[#71717A] leading-relaxed max-w-[165px] break-keep">
                경영의 간섭과 거품을 걷어낸 열린 플랫폼 안에서, 점주님은 공간의 안락함에 집중하고 고객님은 도심 속 편안한 휴식만을 경험하는 공간, HASTE.
              </p>
            </div>

            {/* 수동 동기화 v.Bulk 버튼 */}
            {currentMainTab === 'LEDGERS' && (
              <button
                type="button"
                onClick={async () => {
                  if (subTabLedgers === 'FRANCHISE_INQUIRY') {
                    await fetchCloudConsultations();
                  } else {
                    await fetchCloudMembers();
                  }
                  showTemporaryToast('실시간 클라우드 DB 데이터 갱신이 완료되었습니다.');
                }}
                disabled={isFetchingCloud || isFetchingConsultations}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-stone-900 bg-stone-950 hover:bg-stone-900 rounded-lg text-[11px] text-stone-300 font-bold hover:text-stone-100 cursor-pointer active:scale-95 transition-all select-none shadow-sm disabled:opacity-55"
              >
                <RefreshCw size={11} className={(isFetchingCloud || isFetchingConsultations) ? 'animate-spin text-stone-200' : 'text-stone-500'} />
                <span>수동 동기화 v.Bulk</span>
              </button>
            )}

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 py-1.5 text-[11px] font-bold text-[#EF4444] hover:text-red-400 transition-colors cursor-pointer border border-transparent hover:border-red-500/20 hover:bg-red-500/5 rounded-lg px-2 mt-1"
            >
              <LogOut size={13} />
              <span>시스템 로그아웃</span>
            </button>
          </div>
        </aside>

        {/* ② 중앙 분리선 (실제 본사 웹 디자인 아이덴티티) */}
        <div 
          className="hidden md:block shrink-0" 
          style={{ 
            width: '1px',
            minWidth: '1px',
            height: '960px', 
            minHeight: '960px', 
            maxHeight: '960px',
            background: 'linear-gradient(to bottom, rgba(197, 160, 89, 0.15) 0%, rgba(197, 160, 89, 0.75) 50%, rgba(197, 160, 89, 0.15) 100%)',
            marginLeft: '6px',
            marginRight: '6px'
          }}
        />

        {/* ③ 우측 메인 콘텐츠 패널 */}
        <main className="flex-1 flex flex-col h-[960px] min-h-[960px] max-h-[960px] overflow-y-auto pr-1">
          
          {/* 패널 타이틀 및 설명 헤더 */}
          <header className="flex justify-between items-center pb-2 border-b border-stone-900 mb-3 shrink-0">
            <div className="text-left">
              <h2 className="text-lg font-black text-stone-100 tracking-wider font-sans select-none">
                {headerInfo.title}
              </h2>
              <p className="text-[11px] text-[#71717A] mt-0.5 font-medium select-none">
                {headerInfo.desc}
              </p>
            </div>
            {/* 우측 퀵 헤더 인포 칩 */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold font-mono bg-stone-900 text-stone-300 border border-stone-900 px-2.5 py-1 rounded-md tracking-wider select-none">
                HASTE HQ ADMIN PORTAL v2.5.4
              </span>
            </div>
          </header>

          {/* Success/Error Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mb-4 p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs"
              >
                <span>⚠️ {errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mb-4 p-3 bg-stone-900 border border-[#C5A059]/20 text-[#C5A059] rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs"
              >
                <span>✓ {successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 실제 내부 서브 탭 뷰 렌더링 컨테이너 */}
          <div className="flex-1 w-full min-w-0 bg-[#070609]/95 text-stone-350 font-sans border border-stone-900 rounded-2xl p-4 shadow-2xl overflow-x-auto overflow-y-auto mb-4">
            
            {currentMainTab === 'PAGES' && (
              <>
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
                    adminMenuItems={adminMenuItems}
                    setAdminMenuItems={setAdminMenuItems}
                    showTemporaryToast={showTemporaryToast}
                    showTemporaryError={showTemporaryError}
                    renderPagination={renderPagination}
                    isMenuAll={true}
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
                activeCategory={subTabLedgers as any}
                setActiveCategory={setSubTabLedgers as any}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
};



