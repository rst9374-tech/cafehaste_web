import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronDown, RefreshCw, Upload, Shield, CreditCard, LayoutDashboard, Printer, Cpu, Coffee, FileText, Sliders, Key, LogOut, BookOpen, Award
} from 'lucide-react';
import { PageRoute } from './home_hook_swipe';
import { HasteSymbol } from './home_comp_logo';
import { motion, AnimatePresence } from 'framer-motion';

// 분리된 서브 컴포넌트들 Import
import { MembershipCompLicense } from './membership_comp_license';
import { MembershipCompMyPosts } from './membership_comp_myposts';
import { MembershipCompToss } from './membership_comp_toss';
import { MembershipCompDevice } from './membership_comp_device';
import { MembershipCompRecipe } from './membership_comp_recipe';
import { MembershipCompBilling } from './membership_comp_billing';
import { BoardCompGuidePage } from './board_comp_guide_page';

// 멤버십 안내 및 비밀번호 / 요금제 모달들 Import
import { HasteGuidebookModal } from './membership_modal_guidebook';
import { HasteBenefitModal } from './membership_modal_benefit';
import { HastePasswordChangeModal } from './membership_modal_password';
import { HastePlansModal } from './membership_modal_plans';
import dashboardBg from '../src/assets/images/dashboard_bg.jpg';

interface HasteControlPageProps {
  user: any;
  license?: any;
  isExpired?: boolean;
  remainingDays?: number | null;
  navigateTo: (route: PageRoute) => void;
  onLogout: () => void;
}

export const HasteControlPage: React.FC<HasteControlPageProps> = ({
  user,
  license,
  isExpired,
  remainingDays,
  navigateTo,
  onLogout
}) => {
  // 컴포넌트 공통 상태 관리
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localPaymentState, setLocalPaymentState] = useState<string | null>(null);
  const [localSignupPaymentState, setLocalSignupPaymentState] = useState<string | null>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0);

  // 로컬 라이선스 자율 조회 상태 관리 (부모 프롭스 누락 시 완벽 폴백)
  const [dbLicense, setDbLicense] = useState<any>(license || null);
  const [dbIsExpired, setDbIsExpired] = useState<boolean>(isExpired || false);
  const [dbRemainingDays, setDbRemainingDays] = useState<number | null>(remainingDays !== undefined ? remainingDays : null);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeBilling, setAgreeBilling] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [signupPaymentLoading, setSignupPaymentLoading] = useState(false);

  const [payMethod, setPayMethod] = useState<'TOSS' | 'CARD'>('TOSS');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExcelUploaded, setIsExcelUploaded] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // 안내 및 설정 모달 상태
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

  const uStoreCode = user?.storeCode || user?.store_code || '';

  // 추천수(좋아요 수) 패치
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

  // 라이선스 자율 동기화 및 만료 연산기
  const fetchLicenseData = () => {
    if (!uStoreCode) return;
    
    // 어드민 통합 시뮬레이터 계정
    if (user.role === 'ADMIN' || uStoreCode === 'HASTE-HQS-ADMIN') {
      setDbLicense({
        storeGrade: 'PREMIUM',
        licenseStartDate: '2026-01-01',
        licenseEndDate: '2029-12-31',
        isApproved: 1
      });
      setDbIsExpired(false);
      setDbRemainingDays(999);
      return;
    }

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

  // 로컬 가입 및 정기결제 여부 캐싱 바인딩
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTotalLikes();
    fetchLicenseData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleExcelUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsExcelUploaded(true);
      }, 1500);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 font-sans text-center py-16">
        <div className="bg-[#111015] border border-stone-955 rounded-2xl p-8 max-w-md mx-auto shadow-md flex flex-col items-center gap-4 text-white">
          <div className="text-[#C5A059] font-serif text-lg font-bold">로그인이 필요합니다</div>
          <p className="text-stone-400 text-xs leading-relaxed">해당 정보 페이지는 승인된 헤이스트 멤버십 점주 전용 영역입니다.</p>
          <button onClick={() => navigateTo('HOME')} className="mt-2 w-full py-2.5 bg-[#422B1E] hover:bg-black text-[#C5A059] text-xs font-bold rounded-lg transition-all border border-[#C5A059]/10">홈으로 이동</button>
        </div>
      </div>
    );
  }

  const uStoreName = user.storeName || user.store_name || '헤이스트 카페 점포';
  const uOwnerName = user.ownerName || user.owner_name || '점주';
  const uBusinessNumber = user.business_number || user.businessNumber || 'N/A';
  const uPhone = user.phone || 'N/A';
  const uAddress = user.address || 'N/A';

  // 가입비 결제 여부 판단
  const isSignupPaid = (user.approval_status || user.approvalStatus) === '인증 완료' || localSignupPaymentState === 'paid';
  // 월정액 정기 구독 결제 여부 판단
  const isMonthlyPaid = (dbLicense && dbLicense.isApproved === 1 && !dbIsExpired) || localPaymentState === 'paid';

  // 사이드바 전용 활성 메뉴 상태
  const [activeSidebar, setActiveSidebar] = useState<string>('LICENSE');

  // 월정액 멤버십 결제 시뮬레이션
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

  // 최초 가입비 결제 시뮬레이션
  const handleSimulateSignupPayment = () => {
    if (!agreeTerms || !agreePrivacy) {
      alert('가입비 결제를 위해 약관에 동의하셔야 결제가 가능합니다.');
      return;
    }
    setSignupPaymentLoading(true);
    setTimeout(() => {
      localStorage.setItem(`haste_payment_signup_${uStoreCode}`, 'paid');
      setLocalSignupPaymentState('paid');
      setSignupPaymentLoading(false);
      alert(`${payMethod === 'TOSS' ? 'Toss Pay' : '신용카드 일반결제'}를 통한 가입비(330,000원) 일시불 결제가 완료되었습니다!`);
      fetchLicenseData();
    }, 1550);
  };

  // 영수증 출력 팝업 모달
  const renderReceiptModal = () => {
    if (!selectedReceipt) return null;
    const printReceipt = () => {
      window.print();
    };

    const supplyValue = Math.round(selectedReceipt.amount / 1.1);
    const vat = selectedReceipt.amount - supplyValue;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
        <div className="bg-white border border-stone-300 rounded-2xl max-w-sm w-full p-5 text-stone-900 shadow-2xl flex flex-col gap-4 font-sans animate-fade-in relative text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:8px_8px] -translate-y-0.5 opacity-80" />
          
          <div className="text-center border-b border-dashed border-stone-300 pb-3">
            <h3 className="font-sans font-black text-[18px] tracking-wide text-stone-955">HASTE MEMBERSHIP RECEIPT</h3>
            <span className="text-[10px] font-mono text-stone-500 tracking-wider">헤이스트 멤버십 구매 영수증</span>
          </div>

          <div className="text-[11px] text-stone-650 flex flex-col gap-1 border-b border-dashed border-stone-200 pb-3">
            <div className="flex justify-between"><span>가맹점명</span><span className="font-bold text-stone-900">헤이스트에이아이(HASTE AI)</span></div>
            <div className="flex justify-between"><span>대표자명</span><span className="text-stone-900">김성규</span></div>
            <div className="flex justify-between"><span>사업자번호</span><span className="text-stone-900">120-88-99081</span></div>
            <div className="flex justify-between"><span>점포명 (지점)</span><span className="font-bold text-stone-900">{uStoreName}</span></div>
          </div>

          <div className="text-[12px] flex flex-col gap-2 border-b border-dashed border-stone-300 pb-3">
            <div className="flex justify-between font-bold text-stone-955">
              <span>품명</span>
              <span>금액</span>
            </div>
            <div className="flex justify-between text-stone-800">
              <span>{selectedReceipt.title}</span>
              <span className="font-bold font-sans">₩ {selectedReceipt.amount.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              <div className="flex justify-between"><span>공급가액</span><span>₩ {supplyValue.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>부가가치세 (10%)</span><span>₩ {vat.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-stone-900 py-1">
            <span className="font-bold text-[14px]">합계 금액</span>
            <span className="font-sans font-black text-[20px] text-[#A67C37]">₩ {selectedReceipt.amount.toLocaleString()}</span>
          </div>

          <div className="text-[10px] text-stone-500 flex flex-col gap-1 bg-stone-50 p-2.5 rounded-lg border border-stone-200 font-sans">
            <div className="flex justify-between"><span>결제수단</span><span className="font-bold text-stone-700">{selectedReceipt.method}</span></div>
            <div className="flex justify-between"><span>승인번호</span><span className="font-mono text-stone-750">{selectedReceipt.tid}</span></div>
            <div className="flex justify-between"><span>결제일시</span><span className="text-stone-700">{selectedReceipt.date}</span></div>
          </div>

          <div className="text-center text-[10px] text-stone-400 leading-snug">
            본 영수증은 매입 증빙 및 회원 권리 확인 용도로 사용이 가능합니다.
          </div>

          <div className="flex gap-2 border-t border-stone-200 pt-3">
            <button
              type="button"
              onClick={printReceipt}
              className="flex-1 py-2 bg-stone-900 hover:bg-stone-955 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Printer size={13} />
              <span>영수증 인쇄하기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setReceiptModalOpen(false);
                setSelectedReceipt(null);
              }}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:scale-95"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSchemeSidebar = () => {
    // 1. 기본 메뉴 리스트
    const generalMenus = [
      { 
        id: 'LICENSE', 
        label: '지점 라이선스', 
        icon: Shield, 
        renderer: () => (
          <MembershipCompLicense 
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
            setActiveSidebar={setActiveSidebar}
            setPayMethod={setPayMethod}
            totalLikes={totalLikes}
            onPlansModalOpen={() => setIsPlansModalOpen(true)}
            onGuidebookOpen={() => setIsGuidebookOpen(true)}
            onBenefitOpen={() => setIsBenefitModalOpen(true)}
          />
        ) 
      },
      { 
        id: 'MYPOSTS', 
        label: '내가 쓴 게시글', 
        icon: FileText, 
        renderer: () => <MembershipCompMyPosts /> 
      },
      { 
        id: 'BILLING', 
        label: '결제 관리', 
        icon: CreditCard, 
        renderer: () => (
          <MembershipCompBilling 
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
            setSelectedReceipt={setSelectedReceipt}
            setReceiptModalOpen={setReceiptModalOpen}
            handleSimulateSignupPayment={handleSimulateSignupPayment}
            handleSimulatePayment={handleSimulatePayment}
          />
        ) 
      }
    ];

    // 2. 기기 제어 & 설정 리스트
    const controlMenus = [
      { 
        id: 'TOSS', 
        label: '토스 키오스크 세팅', 
        icon: Upload, 
        renderer: () => <MembershipCompToss /> 
      },
      { 
        id: 'DEVICE', 
        label: '기기 원격 제어', 
        icon: Sliders, 
        renderer: () => <MembershipCompDevice /> 
      },
      { 
        id: 'RECIPE', 
        label: '레시피 조정', 
        icon: Coffee, 
        renderer: () => <MembershipCompRecipe /> 
      }
    ];

    // 3. 기기 운영 가이드 - 문제해결 가이드 서브메뉴 리스트
    const guideSubmenus = [
      { 
        id: 'GUIDE_COFFEE', 
        label: '커피머신', 
        renderer: () => <BoardCompGuidePage isDashboard={true} defaultDevice="coffee" /> 
      },
      { 
        id: 'GUIDE_ICE', 
        label: '제빙기', 
        renderer: () => <BoardCompGuidePage isDashboard={true} defaultDevice="ice" /> 
      },
      { 
        id: 'GUIDE_CUP', 
        label: '컵디스펜서', 
        renderer: () => <BoardCompGuidePage isDashboard={true} defaultDevice="cup" /> 
      },
      { 
        id: 'GUIDE_PROGRAM', 
        label: '프로그램/릴리', 
        renderer: () => <BoardCompGuidePage isDashboard={true} defaultDevice="program" /> 
      }
    ];

    // 4. 계정 및 설정 리스트
    const accountMenus = [
      {
        id: 'PASSWORD',
        label: '비밀번호 변경',
        icon: Key,
        action: () => setIsPasswordModalOpen(true)
      },
      {
        id: 'LOGOUT',
        label: '로그아웃',
        icon: LogOut,
        action: onLogout
      }
    ];

    // 모든 렌더러와 액션을 조회하기 위한 통합 매핑
    const allMenus = [...generalMenus, ...controlMenus, ...guideSubmenus, ...accountMenus];

    const renderSidebarBtn = (menu: any) => {
      const isSelected = activeSidebar === menu.id;
      const isLogout = menu.id === 'LOGOUT';
      const isPassword = menu.id === 'PASSWORD';
      const Icon = menu.icon;

      const isHqAdmin = user?.role === 'ADMIN' || uStoreCode === 'HASTE-HQS-ADMIN';
      const isMonthlyPaid = localPaymentState === 'paid';
      const hasControlPermission = isHqAdmin || (isMonthlyPaid && !dbIsExpired);

      return (
        <button
          key={menu.id}
          onClick={() => {
            if ((menu.id === 'DEVICE' || menu.id === 'RECIPE') && !hasControlPermission) {
              alert('❌ 제어 권한 없음:\n라이선스가 만료되었거나 비활성 상태입니다. [결제 관리] 탭에서 구독 플랜을 활성화해 주세요.');
              return;
            }
            if (menu.action) {
              menu.action();
            } else {
              setActiveSidebar(menu.id);
            }
          }}
          className={`dashboard-sidebar-btn flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-2.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 font-sans ${
            isSelected 
              ? 'dashboard-sidebar-btn-active shadow-md' 
              : isLogout
                ? 'text-rose-500 hover:text-rose-455 hover:bg-rose-500/10 border border-transparent'
                : isPassword
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40 border border-transparent'
                  : 'dashboard-sidebar-btn-inactive'
          }`}
        >
          <Icon size={12} className="shrink-0" />
          <span>{menu.label}</span>
          
          {(menu.id === 'DEVICE' || menu.id === 'RECIPE') && (
            <span className={`ml-auto text-[10.5px] px-1.5 py-0.5 rounded-md font-bold font-sans tracking-tight shrink-0 select-none ${
              hasControlPermission
                ? isSelected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-400/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isSelected
                  ? 'bg-stone-955 text-[#C5A059] border border-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.3)]'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              {hasControlPermission ? '연동됨' : '준비중'}
            </span>
          )}
        </button>
      );
    };

    return (
      <div className="flex flex-col md:flex-row gap-4 md:gap-5.5 items-start">
        {/* 데스크톱 세로 사이드바 / 모바일 가로 스티키 바 */}
        <div className="dashboard-sidebar-container w-full md:w-48 shrink-0 flex md:flex-col gap-0.5 overflow-x-auto md:overflow-x-visible select-none shadow-md font-sans">
          {/* 대시보드 타이틀 및 디스크립션 (왼쪽 사이드바 최상단 배치) */}
          <div className="hidden md:flex flex-col gap-1 text-left px-2 mb-4 border-b border-[#C5A059]/10 pb-4">
            <span className="text-[8.5px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block">
              HASTE SENSORY RECONSTRUCTION
            </span>
            <h1 className="text-[16px] font-medium text-stone-200 flex items-center gap-1.5 mt-0.5">
              <LayoutDashboard size={14} className="text-[#C5A059] shrink-0 animate-pulse" />
              DASHBOARD
            </h1>
            <p className="text-stone-550 text-[11px] font-sans font-light leading-relaxed mt-1">
              라이선스 조회, 기기 원격 제어, 키오스크 세팅을 위한 통합 관제 대시보드입니다.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center mb-5 pb-5 border-b border-stone-900/60 w-full px-2">
            <img src="https://fuzhdcsdfblwcgwfylsx.supabase.co/storage/v1/object/public/cafehaste-bucket/logo/haste_log_2d.jpg" alt="Haste Logo 2D" className="w-36 h-36 object-contain rounded-full border border-[#C5A059]/15 shadow-md opacity-90 hover:opacity-100 transition-all hover:scale-105 duration-300" />
            <span className="text-[10.5px] text-stone-550 font-bold mt-2 font-sans tracking-wide">HASTE COMPANY</span>
          </div>

          {/* 1. 기본 메뉴 섹션 */}
          {generalMenus.map(menu => renderSidebarBtn(menu))}

          {/* 2. 기기 제어 & 설정 섹션 (결제관리 밑 점선 구분 - 골드 톤으로 가시성 강화) */}
          <div className="flex md:flex-col gap-1 w-full border-t border-dotted border-[#C5A059]/35 pt-2.5 my-1.5">
            {controlMenus.map(menu => renderSidebarBtn(menu))}
          </div>

          {/* 3. 기기 통합 운영메뉴얼 섹션 (레시피조정 밑 점선 구분 - 골드 톤으로 가시성 강화) */}
          <div className="w-full border-t border-dotted border-[#C5A059]/35 pt-2.5 my-1.5 flex flex-col gap-1.5">
            {/* 기기 통합 운영메뉴얼 아코디언 헤더 - 다른 메뉴와 100% 동일한 버튼 스타일 */}
            <button
              type="button"
              onClick={() => {
                if (!activeSidebar.startsWith('GUIDE_')) {
                  setActiveSidebar('GUIDE_COFFEE');
                }
              }}
              className={`dashboard-sidebar-btn flex items-center justify-start gap-2 px-2.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 font-sans border border-transparent w-full ${
                activeSidebar.startsWith('GUIDE_') 
                  ? 'text-[#C5A059] bg-stone-900/20' 
                  : 'dashboard-sidebar-btn-inactive'
              }`}
            >
              <BookOpen size={12} className="text-[#C5A059] shrink-0" />
              <span>기기운영가이드</span>
              <ChevronDown size={11} className="text-stone-500 ml-auto shrink-0" />
            </button>
            
            {/* 하위 서브메뉴 리스트 (세로선 제거 및 골드 도트 인덴트 스타일) */}
            <div className="flex md:flex-col gap-1 pl-7 overflow-x-auto md:overflow-x-visible">
              {guideSubmenus.map((sub) => {
                const isSelected = activeSidebar === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSidebar(sub.id)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-stone-900 text-[#C5A059] font-black border border-[#C5A059]/10'
                        : 'text-stone-450 hover:text-stone-200 hover:bg-stone-900/30'
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full shrink-0 transition-all ${
                      isSelected ? 'bg-[#C5A059] scale-125 shadow-[0_0_6px_rgba(197,160,89,0.8)]' : 'bg-stone-600'
                    }`} />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. 계정 및 설정 섹션 (헤더 텍스트 생략) */}
          <div className="flex md:flex-col gap-1 w-full border-t border-[#c5a059]/10 pt-2.5 mt-2">
            {accountMenus.map(menu => renderSidebarBtn(menu))}
          </div>
        </div>

        {/* 데스크톱 세로 경계선 (골드색 그라데이션) */}
        <div className="hidden md:block w-px self-stretch bg-gradient-to-b from-[#C5A059]/10 via-[#C5A059]/40 to-[#C5A059]/10 mx-1.5" />

        {/* 모바일 가로 경계선 (골드색 그라데이션) */}
        <div className="block md:hidden w-full h-px bg-gradient-to-r from-transparent via-[#C5A059]/30 to-transparent my-3" />

        {/* 메인 상세 내용 영역 */}
        <div className="flex-1 w-full bg-stone-955/30 border border-stone-900/30 rounded-2xl p-0.5 min-h-[300px] font-sans">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSidebar}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {(allMenus.find(m => m.id === activeSidebar) as any)?.renderer?.()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div 
      id="film-desktop-page" 
      className="w-full text-stone-300 font-sans bg-[#0c0b0e] relative py-2 px-3 md:py-3.5 md:px-6 min-h-screen"
      style={{
        backgroundImage: `url('${dashboardBg}')`,
        backgroundPosition: 'bottom center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'min(100%, 1024px) auto',
      }}
    >
      {/* Refresh Button (Absolute positioned to eliminate top spacing completely) */}
      <button 
        type="button" 
        onClick={handleRefresh} 
        className="absolute top-2 right-3 md:top-3.5 md:right-6 z-20 p-1 bg-[#121118]/80 border border-stone-900 rounded-md hover:bg-stone-900 transition-all text-[#C5A059] active:scale-95 cursor-pointer shadow-md flex items-center justify-center shrink-0 w-7 h-7"
      >
        <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
      </button>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* SIDEBAR NAVIGATION RENDER */}
        <div className="relative">
          {renderSchemeSidebar()}
        </div>

        {/* DYNAMIC RECEIPT MODAL POPUP */}
        <AnimatePresence>
          {receiptModalOpen && renderReceiptModal()}
        </AnimatePresence>

        {/* GUIDEBOOK & BENEFIT MODALS */}
        <HasteGuidebookModal isOpen={isGuidebookOpen} onClose={() => setIsGuidebookOpen(false)} />
        <HasteBenefitModal isOpen={isBenefitModalOpen} onClose={() => setIsBenefitModalOpen(false)} />

        {/* PASSWORD CHANGE MODAL */}
        <HastePasswordChangeModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} uStoreCode={uStoreCode} />

        {/* PLANS MODAL */}
        <HastePlansModal 
          isOpen={isPlansModalOpen} 
          onClose={() => setIsPlansModalOpen(false)} 
          onSelectPlan={(plan) => {
            setIsPlansModalOpen(false);
            setActiveSidebar('BILLING');
          }} 
        />

      </div>
    </div>
  );
};
