import React, { useState, useEffect } from 'react';
import { 
  Activity, PackageIcon, Coffee, Settings, Terminal, FlaskConical, BookOpen, LogOut, 
  Globe, Youtube, Music, Instagram, Key, CheckCircle2, Shield, FileText, CreditCard, Upload,
  ChevronDown, ChevronUp, User
} from 'lucide-react';
import { LillyDashboardStatus } from './lilly_dashboard_status';
import { LillyDashboardStock } from './lilly_dashboard_stock';
import { LillyDashboardMenu } from './lilly_dashboard_menu';
import { LillyDashboardSettings } from './lilly_dashboard_settings';
import { LillyDashboardLogs } from './lilly_dashboard_logs';
import { LillyDashboardDevice } from './lilly_dashboard_device';

import { LillyDashboardGuide } from './lilly_dashboard_guide';
import { LillyDashboardGuidePage } from './lilly_dashboard_guide_page';

// 구 대시보드 컴포넌트 Import
import { LillyDashboardLicense } from './lilly_dashboard_license';
import { LillyDashboardMyPosts } from './lilly_dashboard_myposts';
import { LillyDashboardBilling } from './lilly_dashboard_billing';
import { LillyDashboardToss } from './lilly_dashboard_toss';

// 구 대시보드 모달 Import
import { HastePasswordChangeModal } from '../membership_modal_password';

interface LillyDashboardMainProps {
  user: any;
  navigateTo: (route: string) => void;
  onLogout: () => void;
}

export function HasteLillyDashboard({ user, navigateTo, onLogout }: LillyDashboardMainProps) {
  const [activeTab, setActiveTab] = useState<string>('STATUS');
  const [isMyInfoOpen, setIsMyInfoOpen] = useState<boolean>(true);
  const [isMachineControlOpen, setIsMachineControlOpen] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(true);

  // 구 대시보드 상태 관리 이식
  const [localPaymentState, setLocalPaymentState] = useState<string | null>(null);
  const [localSignupPaymentState, setLocalSignupPaymentState] = useState<string | null>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [dbLicense, setDbLicense] = useState<any>(null);
  const [dbIsExpired, setDbIsExpired] = useState<boolean>(true);
  const [dbRemainingDays, setDbRemainingDays] = useState<number | null>(null);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeBilling, setAgreeBilling] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [signupPaymentLoading, setSignupPaymentLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<'TOSS' | 'CARD'>('TOSS');

  // 안내 및 설정 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const uStoreCode = user?.storeCode || user?.store_code || 'store075575';
  const uStoreName = user?.storeName || user?.store_name || '헤이스트 카페 점포';
  const uOwnerName = user?.ownerName || user?.owner_name || '점주';
  const uBusinessNumber = user?.business_number || user?.businessNumber || 'N/A';
  const uPhone = user?.phone || 'N/A';
  const uAddress = user?.address || 'N/A';

  // 가입비 결제 여부 판단
  const isSignupPaid = (user?.approval_status || user?.approvalStatus) === '인증 완료' || localSignupPaymentState === 'paid';
  // 월정액 정기 구독 결제 여부 판단
  const isMonthlyPaid = (dbLicense && dbLicense.isApproved === 1 && !dbIsExpired) || localPaymentState === 'paid';

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
        if (data.success && Array.isArray(data.licenses)) {
          const matched = data.licenses.find(
            (l: any) => (l.storeId || '').trim().toLowerCase() === uStoreCode.trim().toLowerCase()
          );
          if (matched) {
            setDbLicense(matched);
            const end = new Date(matched.licenseEndDate);
            const now = new Date();
            end.setHours(0,0,0,0);
            now.setHours(0,0,0,0);
            
            const diffTime = end.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            setDbRemainingDays(diffDays >= 0 ? diffDays : 0);
            setDbIsExpired(diffDays < 0 || matched.isApproved !== 1);
          } else {
            setDbLicense(null);
            setDbRemainingDays(null);
            setDbIsExpired(true);
          }
        }
      })
      .catch((err) => console.error('[Dashboard License Sync Fail]', err));
  };

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#0c0b0e';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  useEffect(() => {
    if (uStoreCode) {
      const storedMonthly = localStorage.getItem(`haste_payment_monthly_${uStoreCode}`);
      const storedSignup = localStorage.getItem(`haste_payment_signup_${uStoreCode}`);
      if (storedMonthly) setLocalPaymentState(storedMonthly);
      if (storedSignup) setLocalSignupPaymentState(storedSignup);
      fetchTotalLikes();
      fetchLicenseData();
    }
  }, [uStoreCode]);

  const handleSimulateSignupPayment = () => {
    setSignupPaymentLoading(true);
    setTimeout(() => {
      localStorage.setItem(`haste_payment_signup_${uStoreCode}`, 'paid');
      setLocalSignupPaymentState('paid');
      setSignupPaymentLoading(false);
      alert('최초 1회 가입비(1,100,000원) 결제가 완료되었습니다. 정기 구독 라이선스를 신청해 주십시오.');
      fetchLicenseData();
    }, 1500);
  };

  const handleSimulatePayment = () => {
    if (!isSignupPaid) {
      alert('최초 1회 가입비를 먼저 납부하셔야 구독 정기결제를 신청할 수 있습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy || !agreeBilling) {
      alert('모든 필수 결제 약관에 동의하셔야 결제가 가능합니다.');
      return;
    }
    setPaymentLoading(true);
    setTimeout(() => {
      localStorage.setItem(`haste_payment_monthly_${uStoreCode}`, 'paid');
      setLocalPaymentState('paid');
      setPaymentLoading(false);
      alert(`${payMethod === 'TOSS' ? 'Toss Pay' : '신용카드 일반결제'}를 통한 정기 구독료(55,000원) 결제가 최종 승인 완료되었습니다!`);
      fetchLicenseData();
    }, 1500);
  };

  const renderActiveContent = () => {
    // 892px 본문 콘텐츠 정렬에 맞추어 스타일 락 및 background/border 규격을 신보드 테마와 동화시킴
    const wrapperClass = "w-[892px] min-w-[892px] max-w-[892px] h-[960px] max-h-[960px] bg-[#070609]/95 text-stone-300 font-sans border border-stone-900 rounded-2xl overflow-y-hidden flex flex-col text-left shrink-0";

    switch (activeTab) {
      // 1. 구 대시보드 컴포넌트 렌더러
      case 'LICENSE':
        return (
          <div className={wrapperClass}>
            <LillyDashboardLicense 
              user={user}
              license={dbLicense}
              isSignupPaid={isSignupPaid}
              isMonthlyPaid={isMonthlyPaid}
              isExpired={dbIsExpired}
              remainingDays={dbRemainingDays}
              uStoreName={uStoreName}
              uStoreCode={uStoreCode}
              uPhone={uPhone}
              uOwnerName={uOwnerName}
              uBusinessNumber={uBusinessNumber}
              uAddress={uAddress}
              setActiveSidebar={(tab) => setActiveTab(tab)}
              setPayMethod={setPayMethod}
              totalLikes={totalLikes}
              onPlansModalOpen={() => setIsPasswordModalOpen(true)}
            />
          </div>
        );
      case 'MYPOSTS':
        return (
          <div className={wrapperClass}>
            <LillyDashboardMyPosts user={user} />
          </div>
        );
      case 'BILLING':
        return (
          <div className={wrapperClass}>
            <LillyDashboardBilling 
              user={user}
              uStoreCode={uStoreCode}
              isSignupPaid={isSignupPaid}
              isMonthlyPaid={isMonthlyPaid}
              payMethod={payMethod}
              setPayMethod={setPayMethod}
              agreeTerms={agreeTerms}
              setAgreeTerms={setAgreeTerms}
              agreePrivacy={agreePrivacy}
              setAgreePrivacy={setAgreePrivacy}
              agreeBilling={agreeBilling}
              setAgreeBilling={setAgreeBilling}
              signupPaymentLoading={signupPaymentLoading}
              paymentLoading={paymentLoading}
              setSelectedReceipt={() => {}}
              setReceiptModalOpen={() => {}}
              handleSimulateSignupPayment={handleSimulateSignupPayment}
              handleSimulatePayment={handleSimulatePayment}
            />
          </div>
        );
      case 'TOSS':
        return (
          <div className={wrapperClass}>
            <LillyDashboardToss />
          </div>
        );

      // 2. 릴리 대시보드 컴포넌트 렌더러
      case 'STATUS':   
        return (
          <div className={wrapperClass}>
            <LillyDashboardStatus 
              user={user} 
              navigateTo={navigateTo} 
              license={dbLicense}
              isExpired={dbIsExpired}
              isMonthlyPaid={isMonthlyPaid}
            />
          </div>
        );
      case 'STOCK':    
        return (
          <div className={wrapperClass}>
            <LillyDashboardStock storeCode={uStoreCode} />
          </div>
        );
      case 'MENU':     
        return (
          <div className={wrapperClass}>
            <LillyDashboardMenu />
          </div>
        );
      case 'SETTINGS': 
        return (
          <div className={wrapperClass}>
            <LillyDashboardSettings storeCode={uStoreCode} />
          </div>
        );
      case 'LOGS':     
        return (
          <div className={wrapperClass}>
            <LillyDashboardLogs storeCode={uStoreCode} />
          </div>
        );
      case 'TEST':     
        return (
          <div className={wrapperClass}>
            <LillyDashboardDevice storeCode={uStoreCode} />
          </div>
        );


      // 3. 가이드 렌더러
      case 'GUIDE':    
        return <LillyDashboardGuide />;
      case 'GUIDE_COFFEE':
        return (
          <div className={wrapperClass}>
            <LillyDashboardGuidePage isDashboard={true} defaultDevice="coffee" />
          </div>
        );
      case 'GUIDE_ICE':
        return (
          <div className={wrapperClass}>
            <LillyDashboardGuidePage isDashboard={true} defaultDevice="ice" />
          </div>
        );
      case 'GUIDE_CUP':
        return (
          <div className={wrapperClass}>
            <LillyDashboardGuidePage isDashboard={true} defaultDevice="cup" />
          </div>
        );
      case 'GUIDE_PROGRAM':
        return (
          <div className={wrapperClass}>
            <LillyDashboardGuidePage isDashboard={true} defaultDevice="program" />
          </div>
        );

      default:         
        return (
          <div className={wrapperClass}>
            <LillyDashboardStatus user={user} navigateTo={navigateTo} />
          </div>
        );
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  // 활성 탭 판단 헬퍼
  const getNavClass = (id: string) => {
    const current = activeTab === id;
    const base = 'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-bold cursor-pointer transition-all active:scale-95 border border-transparent select-none';

    if (current) {
      // 신대시보드 active 스타일: 화이트/실버 배경에 골드 텍스트로 프리미엄 감성 강조
      return `${base} text-[#C5A059] bg-stone-900/40 border-stone-850/80 font-black`;
    }
    // 기본 스타일: 칙칙하지 않은 세련된 석재 톤 매핑
    return `${base} text-stone-400 hover:text-stone-250 hover:bg-stone-900/20`;
  };

  return (
    <div 
      className="w-full max-w-[1200px] flex flex-col md:flex-row gap-3 items-start mx-auto text-[#E4E4E7] font-sans antialiased min-h-[960px] py-6 select-none bg-[#0c0b0e] haste-dashboard-wrapper pt-1"
    >
      
      {/* 글로벌 스타일 강제 오버라이드 및 스크롤바 제어 */}
      <style>{`
        .haste-dashboard-wrapper table,
        .haste-dashboard-wrapper th,
        .haste-dashboard-wrapper td,
        .haste-dashboard-wrapper tr,
        .haste-dashboard-wrapper div,
        .haste-dashboard-wrapper form,
        .haste-dashboard-wrapper section {
          border-color: #1c1917 !important;
        }
        .haste-dashboard-wrapper input,
        .haste-dashboard-wrapper select,
        .haste-dashboard-wrapper textarea {
          border-color: #1c1917 !important;
          background-color: #0c0a09 !important;
          color: #e4e4e7 !important;
        }
        .haste-dashboard-wrapper th {
          background-color: #18181b !important;
        }
        
        /* 글로벌 라이트 배경 강제 다크 반전 */
        .haste-dashboard-wrapper .bg-white,
        .haste-dashboard-wrapper .bg-stone-50,
        .haste-dashboard-wrapper .bg-stone-100,
        .haste-dashboard-wrapper .bg-stone-50\/30,
        .haste-dashboard-wrapper .bg-stone-100\/50,
        .haste-dashboard-wrapper .bg-[#FAF9F6],
        .haste-dashboard-wrapper .bg-[#FFF3F3],
        .haste-dashboard-wrapper .bg-[#FDFBF7],
        .haste-dashboard-wrapper .bg-[#FAF5EE],
        .haste-dashboard-wrapper .bg-[#FFF8E1],
        .haste-dashboard-wrapper .bg-[#F9F9FB],
        .haste-dashboard-wrapper .bg-[#F5EFEB],
        .haste-dashboard-wrapper .bg-[#EFF6FF] {
          background-color: #0c0a09 !important;
          border-color: #1c1917 !important;
        }
        
        /* 글로벌 라이트 경계선 강제 다크 반전 (대시보드 내 zinc/stone/27272A 경계선 모두 #1c1917로 통합) */
        .haste-dashboard-wrapper .border-stone-100,
        .haste-dashboard-wrapper .border-stone-200,
        .haste-dashboard-wrapper .border-stone-250,
        .haste-dashboard-wrapper .border-stone-300,
        .haste-dashboard-wrapper .border-stone-200\/60,
        .haste-dashboard-wrapper .border-stone-200\/80,
        .haste-dashboard-wrapper .border-\[\#27272A\],
        .haste-dashboard-wrapper .border-\[\#27272A\]\/70,
        .haste-dashboard-wrapper .border-\[\#27272A\]\/40,
        .haste-dashboard-wrapper .border-\[\#27272A\]\/80,
        .haste-dashboard-wrapper .border-\[\#1F1F23\]\/60,
        .haste-dashboard-wrapper .divide-\[\#27272A\]\/30 > * + * {
          border-color: #1c1917 !important;
        }

        /* 텍스트 가독성 패치 */
        .haste-dashboard-wrapper .text-stone-750,
        .haste-dashboard-wrapper .text-stone-700,
        .haste-dashboard-wrapper .text-stone-800,
        .haste-dashboard-wrapper .text-stone-900,
        .haste-dashboard-wrapper .text-stone-500 {
          color: #d6d3d1 !important;
        }
        .haste-dashboard-wrapper .text-stone-400 {
          color: #a8a29e !important;
        }

        .haste-dashboard-wrapper .hover\\:bg-stone-200:hover {
          background-color: #27272a !important;
        }
        .haste-dashboard-wrapper img {
          background-color: #0c0a09 !important;
          border-color: #1c1917 !important;
        }
      `}</style>

      {/* ━━━━━━━━━━━━━ SIDEBAR (어드민 스타일 100% 복제 - w-[185px] 균형 조율형) ━━━━━━━━━━━━━ */}
      <aside 
        className="w-[210px] shrink-0 flex flex-col justify-between h-[960px] min-h-[960px] max-h-[960px] bg-transparent border-none select-none overflow-y-hidden pt-1 px-2 pb-3 font-sans"
      >

        {/* Sidebar Header — 로고 헤더 */}
        <div className="border-b border-[#1F1F23]/60 p-4">
          <button
            onClick={() => setActiveTab('STATUS')}
            className="flex items-center gap-3 px-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all w-full"
            title="런타임 상태 메인으로 이동"
          >
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-[#27272A]/70 bg-neutral-950 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="size-5">
                <path d="M 10 15 L 28 15 L 53 50 L 28 85 L 10 85 L 35 50 Z" fill="#C5A059" />
                <path d="M 46 15 L 64 15 L 89 50 L 64 85 L 46 85 L 71 50 Z" fill="#C5A059" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold leading-none text-[#E4E4E7]">
                HASTE AI
              </p>
            </div>
          </button>
        </div>

        {/* Sidebar Content — Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 gap-1 flex flex-col">
            {/* 내정보 아코디언 드롭다운 */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => {
                  setIsMyInfoOpen(!isMyInfoOpen);
                  setActiveTab('LICENSE');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[13px] font-bold cursor-pointer transition-all active:scale-95 border border-transparent select-none ${['LICENSE', 'MYPOSTS', 'BILLING', 'TOSS'].includes(activeTab) ? 'text-[#C5A059] bg-stone-900/40 border-stone-850/80 font-black' : 'text-stone-400 hover:text-stone-250 hover:bg-stone-900/20'}`}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <User className={`size-4 shrink-0 ${['LICENSE', 'MYPOSTS', 'BILLING', 'TOSS'].includes(activeTab) ? 'text-[#C5A059]' : 'text-stone-500'}`} />
                  <span>내정보</span>
                </div>
                {isMyInfoOpen ? <ChevronUp className="size-3.5 text-stone-500" /> : <ChevronDown className="size-3.5 text-stone-500" />}
              </button>

              {/* 서브메뉴 리스트 (들여쓰기 및 원형 블릿 매핑) */}
              {isMyInfoOpen && (
                <div className="flex flex-col gap-0 pl-6 mt-0.5 transition-all">
                  <button
                    onClick={() => setActiveTab('LICENSE')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'LICENSE' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'LICENSE' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>매장 라이선스</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('MYPOSTS')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'MYPOSTS' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'MYPOSTS' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>내가 쓴 게시글</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('BILLING')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'BILLING' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'BILLING' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>결제 관리</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('TOSS')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'TOSS' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'TOSS' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>토스 키오스크 설정</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-[#27272A]/50 my-2 mx-1" />

            {/* 원격제어 아코디언 드롭다운 */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => {
                  setIsMachineControlOpen(!isMachineControlOpen);
                  setActiveTab('STATUS');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[13px] font-bold cursor-pointer transition-all active:scale-95 border border-transparent select-none ${['STATUS', 'STOCK', 'MENU', 'SETTINGS', 'LOGS', 'TEST'].includes(activeTab) ? 'text-[#C5A059] bg-stone-900/40 border-stone-850/80 font-black' : 'text-stone-400 hover:text-stone-250 hover:bg-stone-900/20'}`}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Activity className={`size-4 shrink-0 ${['STATUS', 'STOCK', 'MENU', 'SETTINGS', 'LOGS', 'TEST'].includes(activeTab) ? 'text-[#C5A059]' : 'text-stone-500'}`} />
                  <span>원격제어</span>
                </div>
                {isMachineControlOpen ? <ChevronUp className="size-3.5 text-stone-500" /> : <ChevronDown className="size-3.5 text-stone-500" />}
              </button>

              {/* 서브메뉴 리스트 (들여쓰기 및 원형 블릿 매핑) */}
              {isMachineControlOpen && (
                <div className="flex flex-col gap-0 pl-6 mt-0.5 transition-all">
                  <button
                    onClick={() => setActiveTab('STATUS')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'STATUS' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'STATUS' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>상태</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('STOCK')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'STOCK' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'STOCK' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>재고 관리</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('MENU')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'MENU' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'MENU' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>메뉴 관리</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'SETTINGS' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'SETTINGS' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>설정</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('LOGS')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'LOGS' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'LOGS' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>로그</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('TEST')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'TEST' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'TEST' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>테스트</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-[#27272A]/50 my-2 mx-1" />

            {/* 기기운영가이드 아코디언 드롭다운 */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => {
                  setIsGuideOpen(!isGuideOpen);
                  setActiveTab('GUIDE');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[13px] font-bold cursor-pointer transition-all active:scale-95 border border-transparent select-none ${(activeTab === 'GUIDE' || activeTab.startsWith('GUIDE_')) ? 'text-[#C5A059] bg-stone-900/40 border-stone-850/80 font-black' : 'text-stone-400 hover:text-stone-250 hover:bg-stone-900/20'}`}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className={`size-4 shrink-0 ${(activeTab === 'GUIDE' || activeTab.startsWith('GUIDE_')) ? 'text-[#C5A059]' : 'text-stone-500'}`} />
                  <span>기기운영가이드</span>
                </div>
                {isGuideOpen ? <ChevronUp className="size-3.5 text-stone-500" /> : <ChevronDown className="size-3.5 text-stone-500" />}
              </button>

              {/* 서브메뉴 리스트 (들여쓰기 및 원형 블릿 매핑) */}
              {isGuideOpen && (
                <div className="flex flex-col gap-0 pl-6 mt-0.5 transition-all">
                  <button
                    onClick={() => setActiveTab('GUIDE_COFFEE')}
                    className={`w-full flex items-center gap-2.5 py-0.5 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'GUIDE_COFFEE' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'GUIDE_COFFEE' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>커피머신</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('GUIDE_ICE')}
                    className={`w-full flex items-center gap-2.5 py-1 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'GUIDE_ICE' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'GUIDE_ICE' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>제빙기</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('GUIDE_CUP')}
                    className={`w-full flex items-center gap-2.5 py-1 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'GUIDE_CUP' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'GUIDE_CUP' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>컵디스펜서</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('GUIDE_PROGRAM')}
                    className={`w-full flex items-center gap-2.5 py-1 text-[12.5px] font-bold cursor-pointer transition-all select-none border-none text-left bg-transparent ${activeTab === 'GUIDE_PROGRAM' ? 'text-[#C5A059] font-black' : 'text-stone-400 hover:text-stone-250'}`}
                  >
                    <span className={`text-[7px] leading-none shrink-0 ${activeTab === 'GUIDE_PROGRAM' ? 'text-[#C5A059]' : 'text-stone-600'}`}>●</span>
                    <span>프로그램/릴리</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* Sidebar Footer */}
        <div className="border-t border-[#1F1F23]/60 p-3 flex flex-col gap-2">
          {/* 소셜 바로가기 */}
          <div className="flex items-center gap-4 px-2 pb-2">
            <button
              onClick={() => openExternalLink('https://cafehaste.com')}
              className="text-[#C5A059]/70 hover:text-[#C5A059] hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
              title="공식 홈페이지 바로가기"
            >
              <Globe size={16} />
            </button>
            <button
              onClick={() => openExternalLink('https://www.youtube.com/@cafehaste')}
              className="text-[#C5A059]/70 hover:text-[#C5A059] hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
              title="공식 유튜브 바로가기"
            >
              <Youtube size={16} />
            </button>
            <button
              onClick={() => openExternalLink('https://www.instagram.com/cafehaste/')}
              className="text-[#C5A059]/70 hover:text-[#C5A059] hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
              title="공식 인스타그램 바로가기"
            >
              <Instagram size={16} />
            </button>
            <button
              onClick={() => openExternalLink('https://cafehaste.com/music')}
              className="text-[#C5A059]/70 hover:text-[#C5A059] hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
              title="헤이스트 음악감상실 바로가기"
            >
              <Music size={16} />
            </button>
          </div>

          {/* HASTE 브랜드 슬로건 */}
          <div className="px-2 pb-1 select-none">
            <p className="text-[11px] font-black tracking-[0.12em] text-[#C5A059] uppercase leading-none">
              Smart Automation, Zero Outage
            </p>
            <p className="mt-2 text-[11.5px] font-medium text-[#71717A] leading-relaxed max-w-[200px] break-keep">
              경영의 간섭과 거품을 걷어낸 열린 플랫폼 안에서, 점주님은 공간의 안락함에 집중하고 고객님은 도심 속 편안한 휴식만을 경험하는 공간, HASTE.
            </p>
          </div>

          {/* Readiness Badge */}
          <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5">
            <span className="flex items-center gap-1.5 text-xs text-[#71717A]">
              <CheckCircle2 size={14} className="text-[#71717A]" />
              Redline
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
              연결 중
            </span>
          </div>
          {/* 비밀번호 변경 버튼 (로그아웃 바로 위로 이동) */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center gap-2 py-1.5 text-[11px] font-bold text-stone-400 hover:text-stone-250 hover:bg-stone-900/20 transition-all cursor-pointer rounded-lg px-2"
            type="button"
          >
            <Key size={13} className="text-stone-500" />
            <span>비밀번호 변경</span>
          </button>

          {/* 로그아웃 버튼 */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 py-1.5 text-[11px] font-bold text-[#EF4444] hover:text-red-400 transition-colors cursor-pointer border border-transparent hover:border-red-500/20 hover:bg-red-500/5 rounded-lg px-2 mt-1"
          >
            <LogOut size={13} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 데스크톱 세로 경계선 (골드색 그라데이션) */}
      <div 
        className="hidden md:block" 
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

      {/* ━━━━━━━━━━━━━ MAIN CONTENT (어드민 메인 스타일 100% 복제 - 유연한 flex-1 스크롤 제어) ━━━━━━━━━━━━━ */}
      <main 
        className="flex-grow flex-1 flex flex-col h-[960px] min-h-[960px] max-h-[960px] overflow-y-auto bg-transparent rounded-2xl p-0 pr-1"
      >
        <div className="flex-grow min-h-0">
          {renderActiveContent()}
        </div>
      </main>

      {/* ━━━━━━━━━━━━━ MODAL PORTALS (구 대시보드 모달 제거) ━━━━━━━━━━━━━ */}
      <HastePasswordChangeModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        uStoreCode={uStoreCode} 
      />

    </div>
  );
}
