import React, { useState, useEffect, Suspense } from 'react';
import { 
  ShieldAlert, RefreshCw, LogOut, BookOpen, Key,
  Shield, CheckCircle2, Sparkles, HeartHandshake, Award,
  AlertCircle
} from 'lucide-react';
import { PageRoute } from './home_hook_swipe';
import { HasteAgreementModal } from './membership_modal_agreement';
import { HasteGuidebookModal } from './membership_modal_guidebook';
import { HasteControlPanel } from './membership_comp_controlpanel';
import { HasteLicenseCard } from './membership_comp_licensecard';
import { HastePasswordChangeModal } from './membership_modal_password';
import { HastePlansModal } from './membership_modal_plans';
import { useHastePayment } from './membership_hook_payment';
import { HasteMyInfoTab } from './membership_comp_info';
import { HASTE_BENEFIT_ITEMS } from './membership_types';
import { HasteBenefitModal } from './membership_modal_benefit';

const HasteBoard = React.lazy(() => import('./board_page_main').then(m => ({ default: m.HasteBoard })));

interface HasteMyInfoPageProps {
  user: any;
  onLogout: () => void;
  navigateTo: (route: PageRoute) => void;
  isMobile?: boolean;
}

export const HasteMyInfoPage: React.FC<HasteMyInfoPageProps> = ({ user, onLogout, navigateTo, isMobile = false }) => {
  const isComp = isMobile;
  if (!user) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 font-sans text-center py-20">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm flex flex-col items-center gap-4">
          <ShieldAlert size={48} className="text-amber-500 animate-pulse" />
          <h3 className="font-serif text-lg font-bold text-stone-800">로그인이 필요합니다</h3>
          <p className="text-stone-555 text-xs leading-relaxed">해당 정보 페이지는 승인된 헤이스트 멤버십 점주 전용 영역입니다. 멤버십 로그인을 완료해 주십시오.</p>
          <button onClick={() => navigateTo('HOME')} className="mt-2 w-full py-2.5 bg-[#422B1E] hover:bg-black text-white text-xs font-bold rounded-lg transition-all">홈으로 이동</button>
        </div>
      </div>
    );
  }

  const [license, setLicense] = useState<any>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'INFO' | 'BOARD' | 'CONTROL'>('INFO');
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  
  // Modals & Navigation States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);

  const uStoreCode = user.store_code || user.storeCode || '';

  const getRemainingDays = () => {
    if (!license || !license.licenseEndDate) return null;
    const end = new Date(license.licenseEndDate + 'T23:59:59').getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const remainingDays = getRemainingDays();

  const fetchTotalLikes = () => {
    if (!user || !user.id) return;
    fetch(`/api/members/${user.id}/total-likes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTotalLikes(data.totalLikes || 0);
        }
      })
      .catch((err) => console.error('Failed to fetch total likes:', err));
  };

  const fetchLicenseData = () => {
    if (!uStoreCode) return;
    fetch('/api/licenses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.licenses) {
          const found = data.licenses.find((l: any) => l.storeId === uStoreCode || (l.storeId && l.storeId.trim() === uStoreCode.trim()));
          setLicense(found || null);
        }
      })
      .catch((err) => console.error('Failed to fetch user license:', err))
      .finally(() => { setIsRefreshing(false); });
  };

  useEffect(() => {
    fetchLicenseData();
    fetchTotalLikes();
    // Dynamic PortOne script injection
    const scriptId = 'portone-sdk-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.iamport.kr/v1/iamport.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [uStoreCode]);

  // Hook all payment states and callbacks
  const {
    loading,
    isAgreementOpen,
    setIsAgreementOpen,
    isPlansModalOpen,
    setIsPlansModalOpen,
    handlePayment,
    handleAgreementComplete,
    handleJoiningFeePayment,
  } = useHastePayment(user, fetchLicenseData);

  const isExpired = license && new Date(license.licenseEndDate + 'T23:59:59').getTime() < new Date().getTime();
  const isApproved = license && license.isApproved === 1 && !isExpired;
  const showPaymentButton = user?.role !== 'ADMIN' && user?.username !== 'admin' && (!license || !isApproved);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={16} />;
      case 'Shield': return <Shield size={16} />;
      case 'HeartHandshake': return <HeartHandshake size={16} />;
      case 'CheckCircle2': return <CheckCircle2 size={16} />;
      case 'Award': return <Award size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans px-3 md:px-6">
      <div className="bg-white border border-stone-200 flex flex-col rounded-2xl md:rounded-[32px] p-3.5 md:p-8 gap-3.5 md:gap-6 shadow-sm md:shadow-md">
        
        {/* 1행 (최상단): 콤팩트 액션 툴바 */}
        <div className="w-full flex justify-end pb-2 border-b border-stone-100">
          <div className="flex flex-wrap bg-stone-50 p-0.5 rounded-lg gap-0.5 select-none font-sans justify-end w-fit">
            <button 
              type="button" 
              onClick={() => setIsGuidebookOpen(true)} 
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/30 text-[#C5A059] rounded-md transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen size={9} />
              <span>멤버십 가입안내</span>
            </button>
            <button 
              type="button" 
              onClick={() => setIsBenefitModalOpen(true)} 
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/30 text-[#C5A059] rounded-md transition-all active:scale-95 cursor-pointer"
            >
              <Award size={9} />
              <span>멤버십 혜택안내</span>
            </button>
            <button 
              type="button" 
              onClick={() => setIsPasswordModalOpen(true)} 
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/30 text-[#C5A059] rounded-md transition-all active:scale-95 cursor-pointer"
            >
              <Key size={9} />
              <span>비밀번호</span>
            </button>
            <button 
              onClick={onLogout} 
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-rose-50/50 hover:bg-rose-100/60 border border-rose-200/80 text-rose-600 rounded-md transition-all active:scale-95 cursor-pointer"
            >
              <LogOut size={9} />
              <span>로그아웃</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setIsRefreshing(true); fetchLicenseData(); fetchTotalLikes(); }} 
              className="flex items-center justify-center text-[#C5A059] hover:bg-[#C5A059]/20 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-md transition-all cursor-pointer active:scale-95 w-6 h-6"
            >
              <RefreshCw size={9} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* 2행: 활성 탭 타이틀 (왼쪽) & 카테고리 탭 메뉴 (오른쪽 끝) */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-150 pb-2 md:pb-4 mb-1 md:mb-2">
          {/* 왼쪽: 활성 탭 타이틀 */}
          <div className="flex items-start gap-2.5 flex-1">
            {(() => {
              switch (activeInfoTab) {
                case 'INFO':
                  return (
                    <div className="font-sans">
                      <span className="haste-category-label-en tracking-[0.3em] !mb-1">STORE INFORMATION</span>
                      <h4 className="haste-section-title-2 leading-none mb-1.5">매장정보</h4>
                      <p className="haste-body-text-2 !text-stone-400 leading-relaxed">시스템 데이터베이스에 등록된 정식 점포 정보입니다.</p>
                    </div>
                  );
                case 'BOARD':
                  return (
                    <div className="font-sans">
                      <span className="haste-category-label-en tracking-[0.3em] !mb-1">COMMUNITY BOARD</span>
                      <h4 className="haste-section-title-2 leading-none mb-1.5">점주 전용 소통 게시판</h4>
                      <p className="haste-body-text-2 !text-stone-400 leading-relaxed">헤이스트와의 소통 및 공지사항, 영업 노하우를 공유하는 게시판입니다.</p>
                    </div>
                  );
                case 'CONTROL':
                  return (
                    <div className="font-sans">
                      <span className="haste-category-label-en tracking-[0.3em] !mb-1">SYSTEM CONTROL PANEL</span>
                      <h4 className="haste-section-title-2 leading-none mb-1.5 flex items-center gap-2">
                        <span>원격 시스템 매장 제어</span>
                        <span className="text-[9.5px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 select-none">미구현</span>
                      </h4>
                      <p className="haste-body-text-2 !text-stone-400 leading-relaxed">커피머신 로컬서버 가동 및 POS/키오스크 상태를 원격으로 제어합니다.</p>
                    </div>
                  );

                default:
                  return null;
              }
            })()}
          </div>

          {/* 오른쪽: 카테고리 탭 메뉴 */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1 select-none w-full md:w-auto justify-center font-sans shrink-0">
            {(['INFO', 'BOARD', 'CONTROL'] as const).map((tab) => {
              const labelMap = {
                INFO: '매장 정보',
                BOARD: '게시판',
                CONTROL: '매장원격제어',
              };
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveInfoTab(tab)}
                  className={`haste-sub-tab-btn ${ activeInfoTab === tab ? 'active' : '' }`}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3행(하단): 좌/우 컬럼 영역 */}
        {activeInfoTab === 'INFO' ? (
          <div className="rounded-2xl md:rounded-3xl bg-stone-200 relative overflow-hidden p-2 md:p-7 shadow-md md:shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-2.5 md:gap-3.5">
              {/* ① 라이선스 카드 */}
              <div className="lg:col-span-4 flex flex-col gap-5 h-full">
                <HasteLicenseCard
                  user={user}
                  license={license}
                  loading={loading}
                  isExpired={isExpired}
                  remainingDays={remainingDays}
                  showPaymentButton={showPaymentButton}
                  onPayment={handlePayment}
                  isComp={isComp}
                />
              </div>

              {/* ② 매장 정보 상세 */}
              <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                <HasteMyInfoTab
                  user={user}
                  license={license}
                  isExpired={isExpired}
                  onJoiningFeePayment={handleJoiningFeePayment}
                  onPlansModalOpen={() => setIsPlansModalOpen(true)}
                  isComp={isComp}
                  totalLikes={totalLikes}
                />
              </div>
            </div>
          </div>
        ) : (
          /* 매장 정보 이외의 탭은 왼쪽 라이선스를 없애고 w-full로 확장 */
          <div className="w-full flex flex-col gap-4">
            {/* BOARD Tab Content */}
            {activeInfoTab === 'BOARD' && (
              <div className="w-full min-h-[400px]">
                <Suspense fallback={
                  <div className="py-20 text-center text-stone-500 flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin text-[#C5A059]" size={24} />
                    <span>게시판 불러오는 중...</span>
                  </div>
                }>
                  <HasteBoard
                    loggedUser={user}
                    onOpenLogin={() => {}}
                    onOpenSignUp={() => {}}
                    isNested={true}
                    isMobile={isComp}
                  />
                </Suspense>
              </div>
            )}
            {/* CONTROL Tab Content */}
            {activeInfoTab === 'CONTROL' && (
              <div className="w-full min-h-[400px] flex flex-col gap-4">
                <HasteControlPanel user={user} />
              </div>
            )}
          </div>
        )}
      </div>

      <HasteAgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        storeCode={uStoreCode}
        storeName={user.storeName || user.store_name || ''}
        ownerName={user.ownerName || user.owner_name || ''}
        phone={user.phone || ''}
        address={user.address || ''}
        onAgreementComplete={handleAgreementComplete}
      />

      <HasteGuidebookModal
        isOpen={isGuidebookOpen}
        onClose={() => setIsGuidebookOpen(false)}
      />

      <HastePasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        uStoreCode={uStoreCode}
      />

      <HastePlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        onSelectPlan={handlePayment}
      />

      <HasteBenefitModal
        isOpen={isBenefitModalOpen}
        onClose={() => setIsBenefitModalOpen(false)}
      />
    </div>
  );
};
