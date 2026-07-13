import React from 'react';
import { Shield, FileText, AlertTriangle, Award, Heart } from 'lucide-react';
import { HasteSymbol } from './home_comp_logo';

interface MembershipCompLicenseProps {
  user: any;
  license: any;
  isSignupPaid: boolean;
  isMonthlyPaid: boolean;
  isExpired: boolean;
  remainingDays: number | null;
  uStoreName: string;
  uStoreCode: string;
  uPhone: string;
  uOwnerName: string;
  uBusinessNumber: string;
  uAddress: string;
  isCompact?: boolean;
  setActiveSidebar: (tab: any) => void;
  setPayMethod: (method: any) => void;
  totalLikes: number;
  onPlansModalOpen?: () => void;
  onGuidebookOpen?: () => void;
  onBenefitOpen?: () => void;
}

export const MembershipCompLicense: React.FC<MembershipCompLicenseProps> = ({
  user,
  license,
  isSignupPaid,
  isMonthlyPaid,
  isExpired,
  remainingDays,
  uStoreName,
  uStoreCode,
  uPhone,
  uOwnerName,
  uBusinessNumber,
  uAddress,
  isCompact = false,
  setActiveSidebar,
  setPayMethod,
  totalLikes,
  onPlansModalOpen
}) => {
  const isHastePremium = (license?.storeGrade === 'PREMIUM' || user?.role === 'ADMIN');

  return (
    <section className="dashboard-card">
      <div className="absolute inset-0 bg-[radial-gradient(#C5A059_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      
      {/* Header (좌측 박스를 제거하고 글자 옆 단독 플랫 대형 아이콘 구조로 통일) */}
      <div className="dashboard-card-header">
        {isHastePremium ? (
          <div className="flex items-center gap-3.5">
            <HasteSymbol size={32} glow={true} className="text-[#C5A059] shrink-0" />
            <div>
              <h3 className="text-[#C5A059] dashboard-card-title drop-shadow-[0_0_12px_rgba(197,160,89,0.25)]">
                헤이스트 멤버십 라이선스
              </h3>
              <span className="dashboard-card-subtitle mt-0.5">
                HASTE OFFICIAL MEMBERSHIP LICENSE
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            <Shield size={32} className="text-stone-400 shrink-0" />
            <div>
              <h3 className="text-stone-300 dashboard-card-title">
                멤버십 라이선스
              </h3>
              <span className="dashboard-card-subtitle text-stone-550 mt-0.5">
                STANDARD MEMBERSHIP LICENSE
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Contents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center relative z-10">
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-[13px] font-sans font-light">
          <div className="dashboard-grid-item">
            <span className="dashboard-label">점포명</span>
            <span className="dashboard-value-bold">{uStoreName}</span>
          </div>
          <div className="dashboard-grid-item">
            <span className="dashboard-label">지점 코드</span>
            <span className="dashboard-value-bold">{uStoreCode || 'N/A'}</span>
          </div>
          <div className="dashboard-grid-item">
            <span className="dashboard-label">구독 잔여일수</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="dashboard-value-gold">
                {remainingDays !== null ? `${remainingDays}일 남음` : '대기 상태'}
              </span>
              {/* 요금제 안내 숏컷 */}
              {onPlansModalOpen && (
                <button
                  type="button"
                  onClick={onPlansModalOpen}
                  className="px-1.5 py-0.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/30 dashboard-badge-text rounded transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  요금제 안내
                </button>
              )}
              {/* 숏컷 결제 유도 버튼 */}
              {!isMonthlyPaid && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSidebar('BILLING');
                    setPayMethod('TOSS');
                  }}
                  className="px-1.5 py-0.5 bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-stone-955 border border-[#C5A059]/30 dashboard-badge-text rounded transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  구독 결제 ➡️
                </button>
              )}
            </div>
          </div>
          <div className="dashboard-grid-item">
            <span className="dashboard-label">대표 점주</span>
            <span className="dashboard-value">{uOwnerName}</span>
          </div>
          <div className="dashboard-grid-item">
            <span className="dashboard-label">사업자 번호</span>
            <span className="dashboard-value">{uBusinessNumber}</span>
          </div>
          <div className="dashboard-grid-item">
            <span className="dashboard-label">라이선스 상태</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold">
                {license ? (
                  isExpired ? (
                    <span className="text-rose-500">기간 만료</span>
                  ) : license.isApproved !== 1 ? (
                    <span className="text-amber-500">일시 정지</span>
                  ) : (
                    <span className="dashboard-value-green">활성 ({license.storeGrade})</span>
                  )
                ) : (
                  <span className="text-stone-500">미발급</span>
                )}
              </span>
              {/* 가입비 숏컷 결제 유도 버튼 */}
              {!isSignupPaid && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSidebar('BILLING');
                    setPayMethod('TOSS');
                  }}
                  className="px-1.5 py-0.5 bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-stone-955 border border-[#C5A059]/30 dashboard-badge-text rounded transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  가입비 결제 ➡️
                </button>
              )}
            </div>
          </div>
          
          <div className="dashboard-grid-item">
            <span className="dashboard-label">연락처</span>
            <span className="dashboard-value">{uPhone}</span>
          </div>
          <div className="dashboard-grid-item">
            <span className="dashboard-label">이메일</span>
            <span className="dashboard-value truncate block">{user.email || 'N/A'}</span>
          </div>
          <div className="dashboard-grid-item">
            <span className="dashboard-label">가입 일자</span>
            <span className="dashboard-value">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          {/* 누적 추천수 */}
          <div className="dashboard-grid-item">
            <span className="dashboard-label">누적 추천수</span>
            <span className="dashboard-value-gold font-sans font-bold flex items-center gap-1">
              <Heart size={12} className="text-rose-500 fill-rose-500/20 shrink-0" />
              {totalLikes.toLocaleString()}개
            </span>
          </div>

          {!isCompact && (
            <>
              <div className="dashboard-grid-item sm:col-span-2">
                <span className="dashboard-label">지점 주소</span>
                <span className="dashboard-value truncate block">{uAddress}</span>
              </div>
              <div className="flex flex-col gap-1 pt-2.5 sm:col-span-3 border-t border-stone-900/30 mt-1">
                <span className="dashboard-label">첨부 서류</span>
                <a 
                  href="/uploads/상생협약_약정서_사본.pdf" 
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-stone-955 border border-[#C5A059]/30 dashboard-badge-text rounded-lg transition-all w-fit cursor-pointer active:scale-95 shadow-sm font-sans"
                >
                  <FileText size={12} className="shrink-0" />
                  <span>상생협약 약정서 사본 다운로드</span>
                </a>
              </div>
            </>
          )}
        </div>

        {/* Subscription Stamp (트리플 스탬프 시스템 적용) */}
        <div className="md:col-span-3 bg-stone-955/40 border border-stone-900 rounded-xl p-2.5 flex flex-col justify-center items-center gap-3 shrink-0">
          
          {/* 가입비 납부완료 상태 스탬프 */}
          <div className="flex flex-col items-center gap-1">
            <div className={`border flex flex-col items-center justify-center text-center font-sans w-24 h-13 p-1 text-[9px] rounded-xl ${
              isSignupPaid ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/5 rotate-3 shadow-md' : 'border-rose-500/20 text-rose-500/40 animate-pulse'
            }`}>
              <span className="text-[8px] tracking-wider font-semibold">REGISTRATION</span>
              <span className="font-sans font-black my-0.5 text-[13.5px] tracking-wide">{isSignupPaid ? '가입완료' : '가입미납'}</span>
              <span className="text-[7.5px] tracking-widest uppercase">SIGNUP STATE</span>
            </div>
            <span className="text-[10px] text-stone-500 font-bold">최초 가입인증</span>
          </div>

          {/* 월 구독 상태 스탬프 */}
          <div className="flex flex-col items-center gap-1 border-t border-stone-900/40 pt-2.5 w-full">
            <div className={`border flex flex-col items-center justify-center text-center font-sans w-24 h-13 p-1 text-[9px] rounded-xl ${
              isMonthlyPaid ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/5 -rotate-3 shadow-md' : 'border-stone-850 text-stone-600'
            }`}>
              <span className="text-[8px] tracking-wider font-semibold">MEMBERSHIP</span>
              <span className="font-sans font-black my-0.5 text-[13.5px] tracking-wide">{isMonthlyPaid ? '구독중' : '대기'}</span>
              <span className="text-[7.5px] tracking-widest uppercase">SUBSCRIPTION</span>
            </div>
            <span className="text-[10px] text-stone-500 font-bold">월정액 멤버십</span>
          </div>

          {/* 하트 Stamp (가입완료 도장과 선 두께가 1px로 정확히 일치하는 SVG 하트 실선 스탬프) */}
          <div className="flex flex-col items-center gap-1 border-t border-stone-900/40 pt-2.5 w-full">
            <div className="relative flex flex-col items-center justify-center text-center font-sans w-24 h-24 select-none rotate-6 shrink-0 active:scale-95 transition-transform duration-300">
              {/* background solid thin heart SVG (strokeWidth=0.25로 역산하여 CSS border 1px과 매칭) */}
              <svg 
                viewBox="0 0 24 24" 
                className="absolute inset-0 w-full h-full text-[#C5A059] fill-[#C5A059]/5 filter drop-shadow-md"
              >
                <path 
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                  fillOpacity="0.04"
                  stroke="currentColor"
                  strokeWidth="0.25"
                />
              </svg>
              
              {/* Inner Contents overlay (EA -> 개 변경 적용) */}
              <div className="relative z-10 flex flex-col items-center justify-center p-2 mt-[-2px]">
                <span className="text-[7.5px] tracking-widest text-rose-500 font-black">❤️ HEARTS</span>
                <span className="font-sans font-black my-0.2 text-[14.5px] text-[#C5A059] drop-shadow-md">
                  {totalLikes} 개
                </span>
                <span className="text-[6.5px] tracking-wider text-[#C5A059]/80 font-bold">
                  {totalLikes > 0 ? 'ACTIVE' : 'NONE'}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 font-bold">누적 추천수</span>
          </div>

        </div>
      </div>
    </section>
  );
};
