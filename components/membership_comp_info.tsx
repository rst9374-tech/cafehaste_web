import React from 'react';
import { Key, Award, User, FileText, Phone, Mail, MapPin, Calendar, Sliders, Clock, Download } from 'lucide-react';

interface HasteMyInfoTabProps {
  user: any;
  license: any;
  isExpired: boolean;
  onJoiningFeePayment: () => void;
  onPlansModalOpen: () => void;
  isComp?: boolean;
  totalLikes?: number;
}

export const HasteMyInfoTab: React.FC<HasteMyInfoTabProps> = ({
  user,
  license,
  isExpired,
  onJoiningFeePayment,
  onPlansModalOpen,
  isComp = false,
  totalLikes = 0,
}) => {
  const uStoreCode = user.store_code || user.storeCode || '';
  const uStoreType = user.storeType || user.store_type || '일반';
  const uOwnerName = user.ownerName || user.owner_name || '점주';
  const uBusinessNumber = user.business_number || user.businessNumber || 'N/A';
  const uPhone = user.phone || 'N/A';
  const uEmail = user.email || 'N/A';
  const uAddress = user.address || 'N/A';
  const uCreatedAt = user.created_at || user.createdAt || '';
  const uContent = user.content || '';

  const getGradeInfo = () => {
    if (user?.role === 'ADMIN' || user?.username === 'admin') {
      return {
        gradeText: '관리자',
        badge: null
      };
    }
    if (!license) {
      return {
        gradeText: '미발급 / UNISSUED',
        badge: (
          <span className="haste-status-badge waiting">
            인증 대기
          </span>
        )
      };
    }
    if (isExpired) {
      const gText = license.storeGrade === 'PREMIUM' ? '프리미엄 / PREMIUM' : '베이직 / BASIC';
      return {
        gradeText: gText,
        badge: (
          <span className="haste-status-badge expired">
            기간 만료
          </span>
        )
      };
    }
    if (license.isApproved !== 1) {
      const gText = license.storeGrade === 'PREMIUM' ? '프리미엄 / PREMIUM' : '베이직 / BASIC';
      return {
        gradeText: gText,
        badge: (
          <span className="haste-status-badge suspended">
            가동 정지
          </span>
        )
      };
    }
    const gText = license.storeGrade === 'PREMIUM' ? '프리미엄 / PREMIUM' : '베이직 / BASIC';
    return {
      gradeText: gText,
      badge: null
    };
  };

  const gradeInfo = getGradeInfo();
  const isSignupPaid = (user.approval_status || user.approvalStatus) === '인증 완료' || localStorage.getItem(`haste_payment_signup_${uStoreCode}`) === 'paid';
  const isMonthlyPaid = (license && license.isApproved === 1 && !isExpired) || localStorage.getItem(`haste_payment_monthly_${uStoreCode}`) === 'paid';

  return (
    <div className="bg-[#FAF6EE] border border-dashed border-stone-200 rounded-[20px] shadow-md flex flex-col relative overflow-hidden font-sans text-left w-full h-full justify-between p-3.5 md:p-6 gap-3.5 md:gap-5 md:min-h-[400px]"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #f4ebd6 1.5px, transparent 1.5px), radial-gradient(circle at 0 0, #f4ebd6 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Passport watermark stamp */}
      <div className="absolute -bottom-4 -right-4 opacity-10 -rotate-12 select-none pointer-events-none z-0">
        <div className="border-4 border-[#C5A059] rounded-full p-2 text-center text-[#C5A059] font-mono font-bold w-32 h-32 flex flex-col justify-center items-center">
          <span className="text-sm tracking-widest">HASTE HQ</span>
          <span className="text-[11.5px] my-0.5">APPROVED</span>
          <span className="text-[9.5px]">OFFICIAL SEAL</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-[#C5A059]/40 pb-2.5 flex justify-between items-center select-none z-10">
        <span className="haste-category-label-en !mb-0 !text-[10.5px]">헤이스트 / REPUBLIC OF HASTE</span>
        <span className="haste-category-label-en !mb-0 !text-[10.5px]">HASTE LICENSE | NO. {uStoreCode || '075575'}</span>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 z-10 border-b border-[#C5A059]/20 gap-y-2.5 md:gap-y-4 gap-x-4 md:gap-x-6 pb-2.5 md:pb-4 text-[11px] md:text-xs">
        {/* 매장 코드 */}
        <div className="flex flex-col gap-0.5">
          <span className="haste-body-text-3 !text-stone-400 block">매장 코드 / STORE CODE</span>
          <span className="haste-body-text-1-5 flex items-center gap-1.5 !text-stone-900 font-bold">
            {uStoreCode || 'N/A'}
            {license && license.isApproved !== 1 && !isExpired && license.storeGrade !== 'PREMIUM' && (
              <span className="haste-status-badge suspended ml-1.5 whitespace-nowrap">
                가동 정지
              </span>
            )}
          </span>
        </div>

        {/* 매장 유형 */}
        <div className="flex flex-col gap-0.5">
          <span className="haste-body-text-3 !text-stone-400 block">매장 유형 / STORE TYPE</span>
          <span className="haste-body-text-1-5 flex items-center">
            {user?.role === 'ADMIN' || user?.username === 'admin' ? (
              <span className="haste-badge-membership !text-[12.5px] !px-3 !py-1 !rounded-md">헤이스트</span>
            ) : (uStoreType === 'HASTE_MEMBERSHIP' || uStoreType === '프리미엄') ? (
              <span className="haste-badge-haste-membership !text-[12.5px] !px-3 !py-1 !rounded-md">헤이스트 멤버십</span>
            ) : (
              <span className="haste-badge-membership !text-[12.5px] !px-3 !py-1 !rounded-md">
                {uStoreType === 'EXECUTIVE' ? '임원' : '멤버십'}
              </span>
            )}
          </span>
        </div>

        {/* 솔루션 등급 */}
        <div className="flex flex-col gap-0.5">
          <span className="haste-body-text-3 !text-stone-400 block">솔루션 등급 / SOLUTION CLASS</span>
          <span className="haste-body-text-1-5 flex items-center gap-2">
            {user?.role === 'ADMIN' || user?.username === 'admin' ? (
              <span className="haste-badge-membership !text-[12.5px] !px-3 !py-1 !rounded-md">관리자</span>
            ) : (license?.storeGrade === 'PREMIUM') ? (
              <span className="haste-badge-haste-membership !text-[12.5px] !px-3 !py-1 !rounded-md">프리미엄</span>
            ) : (
              <span className="haste-badge-membership !text-[12.5px] !px-3 !py-1 !rounded-md">
                {license ? '베이직' : '미발급'}
              </span>
            )}
            {gradeInfo.badge}
          </span>
        </div>

        {/* 점주 성함 */}
        <div className="flex flex-col gap-0.5">
          <span className="haste-body-text-3 !text-stone-400 block">점주 성함 / OWNER NAME</span>
          <span className="haste-body-text-1-5">{uOwnerName}</span>
        </div>

        {/* 사업자번호 */}
        <div className="flex flex-col gap-0.5">
          <span className="haste-body-text-3 !text-stone-400 block">사업자등록번호 / BUSINESS REG. NO.</span>
          <span className="haste-body-text-1-5">{uBusinessNumber}</span>
        </div>

        {/* 연락처 */}
        <div className="flex flex-col gap-0.5">
          <span className="haste-body-text-3 !text-stone-400 block">지점 연락처 / CONTACT TELEPHONE</span>
          <span className="haste-body-text-1-5">{uPhone}</span>
        </div>

        {/* 이메일 주소 */}
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <span className="haste-body-text-3 !text-stone-400 block">이메일 주소 / E-MAIL ADDRESS</span>
          <span className="haste-body-text-1-5 truncate">{uEmail}</span>
        </div>

        {/* 매장 주소 */}
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <span className="haste-body-text-3 !text-stone-400 block">매장 주소 / STORE ADDRESS</span>
          <span className="haste-body-text-1-5">{uAddress}</span>
        </div>

        {/* 최초 등록일자 */}
        {uCreatedAt && (
          <div className="flex flex-col gap-0.5 sm:col-span-2">
            <span className="haste-body-text-3 !text-stone-400 block">최초 등록일자 / DATE OF INITIAL REG.</span>
            <span className="haste-body-text-1-5">
              {new Date(uCreatedAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Visas & Stamps section */}
      <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2.5 md:gap-4 z-10 items-center sm:items-start border-b border-[#C5A059]/20 py-1 md:py-2 pb-2.5 md:pb-4">
        <div className="flex flex-col items-center sm:items-start w-full">
          <span className="haste-body-text-3 !text-stone-400 block mb-2">인증 날인 / OFFICIAL VISA STAMPS</span>
          <p className="text-stone-500 text-[10px] text-center sm:text-left leading-relaxed">
            점포 라이선스의 개설 가입 및 매월 자동 정기 구독의 유효성을 헤이스트 관리국 도장으로 증명합니다.
          </p>
        </div>

        <div className="flex flex-row justify-center items-center gap-4 sm:col-span-3 w-full sm:contents">
          {/* 가입비 Stamp */}
          <div className="relative flex items-center justify-center">
            {isSignupPaid ? (
              <div className="rounded-full border-2 border-dashed border-[#C5A059] flex flex-col items-center justify-center text-center text-[#C5A059] font-mono font-bold rotate-6 bg-[#C5A059]/5 shadow-xs shrink-0 w-16 h-16 md:w-24 md:h-24 p-1 md:p-2 text-[8px] md:text-[10px]">
                <span className="text-[6px] md:text-[8.5px] tracking-widest">HASTE HQ</span>
                <span className="my-0.5 border-t border-b border-[#C5A059] font-extrabold text-[7.5px] md:text-[10.5px] py-0 md:py-0.5 px-0.5 sm:px-1">FEE PAID</span>
                <span className="text-[5.5px] md:text-[7.5px] tracking-wider">REGISTRATION</span>
              </div>
            ) : (
              <div className="rounded-full border-2 border-dashed border-rose-600/40 flex flex-col items-center justify-center text-center text-rose-600/50 font-mono font-bold -rotate-6 bg-rose-50/10 shrink-0 w-16 h-16 md:w-24 md:h-24 p-1 md:p-2 text-[8px] md:text-[10px]">
                <span className="text-[6px] md:text-[8.5px]">HASTE HQ</span>
                <span className="my-0.5 border-t border-b border-rose-600/30 font-bold text-[7.5px] md:text-[10.5px] py-0 md:py-0.5 px-0.5 sm:px-1">UNPAID</span>
                <span className="text-[5.5px] md:text-[7.5px]">JOINING FEE</span>
              </div>
            )}
          </div>

          {/* 구독 Stamp */}
          <div className="relative flex items-center justify-center">
            {isMonthlyPaid ? (
              <div className="border-2 border-double border-emerald-600 flex flex-col items-center justify-center text-center text-emerald-600 font-bold -rotate-6 bg-emerald-50/10 shadow-xs shrink-0 w-16 h-12 md:w-24 md:h-20 p-1 md:p-2 text-[8px] md:text-[10px]">
                <span className="text-[6px] md:text-[8.5px] font-mono tracking-wider">MEMBERSHIP</span>
                <span className="font-sans font-black my-0.5 tracking-wide text-[10px] md:text-sm">구독중</span>
                <span className="text-[5.5px] md:text-[7.5px] font-mono tracking-wide">AUTHENTICATED</span>
              </div>
            ) : (
              <div className="border-2 border-double border-rose-600/40 flex flex-col items-center justify-center text-center text-rose-600/50 font-bold rotate-12 bg-rose-50/10 shrink-0 w-16 h-12 md:w-24 md:h-20 p-1 md:p-2 text-[8px] md:text-[10px]">
                <span className="text-[6px] md:text-[8.5px] font-mono">MEMBERSHIP</span>
                <span className="my-0.5 font-bold tracking-wide text-[8px] md:text-[10.5px]">인증 대기</span>
                <span className="text-[5.5px] md:text-[7.5px] font-mono">INACTIVE SOLUTION</span>
              </div>
            )}
          </div>

          {/* 하트 Stamp */}
          <div className="relative flex items-center justify-center">
            <div className="rounded-full border-2 border-dashed border-[#C5A059] flex flex-col items-center justify-center text-center text-[#C5A059] font-mono font-bold rotate-12 bg-[#C5A059]/5 shadow-xs shrink-0 w-16 h-16 md:w-24 md:h-24 p-1 md:p-2 text-[8px] md:text-[10px]">
              <span className="text-[6.5px] md:text-[9px] tracking-widest text-rose-500 font-black">❤️ HEARTS</span>
              <span className="my-0.5 border-t border-b border-[#C5A059] font-extrabold text-[8.5px] md:text-[12.5px] py-0 md:py-0.5 px-0.5 sm:px-1">
                {totalLikes} EA
              </span>
              <span className="text-[5.5px] md:text-[7.5px] tracking-wider">
                {totalLikes > 0 ? 'BENEFIT ACTIVE' : 'NO HEARTS'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment and subscription buttons - Gold point highlighted background */}
      <div className="flex flex-col z-10 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-2xl gap-2.5 md:gap-3.5 p-3 md:p-4">
        {/* 가입비결제 */}
        {!isSignupPaid && (
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center justify-between text-xs border-b border-[#C5A059]/20 pb-2 md:pb-3">
            <div className="flex flex-col text-left">
              <span className="haste-body-text-2-3 flex items-center gap-1.5 flex-wrap">
                <span>가입비 결제</span>
                <span className="text-stone-400">/</span>
                <span className="haste-category-label-en !mb-0 !mt-0 !inline-block">JOINING REGISTRATION FEE</span>
              </span>
              <span className="haste-section-title-3 mt-0.5">30만원(VAT 별도)</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <button
                  type="button"
                  onClick={onJoiningFeePayment}
                  className="haste-dark-mini-btn !text-[9.5px] sm:!text-[10.5px] !px-1.5 !py-0.5 sm:!px-2 sm:!py-1"
                >
                  결제하기
                </button>
                <span className="haste-status-badge suspended">결제 대기</span>
              </div>
            </div>
          </div>
        )}

        {/* 월구독결제 */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center justify-between text-xs border-b border-[#C5A059]/20 pb-2 md:pb-3">
          <div className="flex flex-col text-left">
            <span className="haste-body-text-2-3 flex items-center gap-1.5 flex-wrap">
              <span>월구독 결제</span>
              <span className="text-stone-400">/</span>
              <span className="haste-category-label-en !mb-0 !mt-0 !inline-block">MONTHLY SYSTEM SUBSCRIPTION</span>
            </span>
            <span className="haste-section-title-3 mt-0.5">5만원/월(VAT 별도)</span>
          </div>
          <div>
            {isMonthlyPaid ? (
              <span className="haste-status-badge approved-green">구독 중 ACTIVE</span>
            ) : (
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <button
                  type="button"
                  onClick={onPlansModalOpen}
                  className="haste-dark-mini-btn !text-[9.5px] sm:!text-[10.5px] !px-1.5 !py-0.5 sm:!px-2 sm:!py-1"
                >
                  결제하기
                </button>
                <span className="haste-status-badge suspended">결제 대기</span>
              </div>
            )}
          </div>
        </div>

        {/* 약정서 사본 */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center justify-between text-xs pb-1">
          <div className="flex flex-col text-left">
            <span className="haste-body-text-2-3 flex items-center gap-1.5 flex-wrap">
              <span>약정서 사본</span>
              <span className="text-stone-400">/</span>
              <span className="haste-category-label-en !mb-0 !mt-0 !inline-block">SYSTEM AGREEMENT DEED</span>
            </span>
            <span className="haste-section-title-3 mt-0.5">상생협약 약정서 사본</span>
          </div>
          <div className="mt-1 sm:mt-0">
            {(() => {
              const docUrl = user.agreement_document_url || license?.agreementDocumentUrl || user.agreementDocumentUrl || '';
              return (
                <a
                  href={docUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="haste-dark-mini-btn !text-[9.5px] sm:!text-[10.5px] !px-1.5 !py-0.5 sm:!px-2 sm:!py-1 flex items-center gap-1.5"
                  download={`membership_agreement_${uStoreCode}.pdf`}
                >
                  <Download size={10} />
                  <span>다운로드</span>
                </a>
              );
            })()}
          </div>
        </div>
      </div>

      {uContent && (
        <div className="flex flex-col gap-1.5 mt-2 z-10 text-left">
          <span className="haste-body-text-3 !text-stone-400 block pl-1">💬 헤이스트 건의 및 전달사항 / REMARKS</span>
          <div className="bg-[#FAF9F6] border border-[#E0D7C8]/40 rounded-xl text-xs leading-relaxed text-stone-650 italic p-2 md:p-3">
            "{uContent}"
          </div>
        </div>
      )}
    </div>
  );
};
