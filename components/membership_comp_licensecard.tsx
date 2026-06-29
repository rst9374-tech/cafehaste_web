import React from 'react';
import { Award, Clock, Calendar, FileText, User } from 'lucide-react';
import licenseBgImage from '../src/assets/images/haste_license_new.jpg';
import { HasteSymbol } from './home_comp_logo';

interface HasteLicenseCardProps {
  user: any;
  license: any;
  loading: boolean;
  isExpired: boolean;
  remainingDays: number | null;
  showPaymentButton: boolean;
  onPayment: (months: number) => void;
  isComp?: boolean;
}

export const HasteLicenseCard: React.FC<HasteLicenseCardProps> = ({
  user,
  license,
  loading,
  isExpired,
  remainingDays,
  showPaymentButton,
  onPayment,
  isComp = false,
}) => {
  const uStoreCode = user.store_code || user.storeCode || '';
  const uStoreName = user.storeName || user.store_name || '헤이스트 카페 점포';
  const uOwnerName = user.ownerName || user.owner_name || '점주';

  const getGradeInfo = () => {
    if (user?.role === 'ADMIN' || user?.username === 'admin') {
      return {
        icon: '\u{1F451}',
        themeClass: 'text-[#C5A059]',
        gradeText: '관리자'
      };
    }
    if (!license) {
      return {
        icon: '\u{1F512}',
        themeClass: 'text-stone-450',
        gradeText: '인증 대기 / WAITING'
      };
    }
    if (isExpired) {
      return {
        icon: '\u{26A0}',
        themeClass: 'text-stone-500',
        gradeText: '기간 만료 / EXPIRED'
      };
    }
    if (license.isApproved !== 1) {
      return {
        icon: '\u{26A0}',
        themeClass: 'text-rose-600',
        gradeText: '가동 정지 / SUSPENDED'
      };
    }
    if (license.storeGrade === 'PREMIUM') {
      return {
        icon: '\u{1F396}',
        themeClass: 'text-[#C5A059]',
        gradeText: '프리미엄 / PREMIUM'
      };
    }
    if (license.storeGrade === 'STANDARD') {
      return {
        icon: '\u{1F396}',
        themeClass: 'text-slate-500',
        gradeText: '베이직 / BASIC'
      };
    }
    return {
      icon: '\u{1F396}',
      themeClass: 'text-[#B87333]',
      gradeText: '베이직 / BASIC'
    };
  };

  const gradeInfo = getGradeInfo();
  const displayStoreName = (license && (license.storeName || license.store_name)) || uStoreName;

  const toShortDate = (d: string) => {
    if (!d) return 'N/A';
    const p = d.split('-');
    return p.length === 3 ? `${p[0].slice(-2)}-${parseInt(p[1], 10)}-${p[2]}` : d;
  };

  const startDateStr = license ? toShortDate(license.licenseStartDate) : 'N/A';
  const endDateStr = license ? toShortDate(license.licenseEndDate) : 'N/A';
  const displayDateStr = user?.role === 'ADMIN' || user?.username === 'admin' ? '영구 라이선스 / PERMANENT' : startDateStr + ' ~ ' + endDateStr;

  return (
    <div className={`bg-white border-2 border-[#C5A059] rounded-[20px] shadow-md flex flex-col text-left font-sans relative overflow-hidden select-none w-full h-full justify-start ${isComp ? 'p-3.5 gap-2.5' : 'p-5 md:p-6 gap-4'}`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(197, 160, 89, 0.08) 1.5px, transparent 1.5px), radial-gradient(circle at 0 0, rgba(197, 160, 89, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Background Hologram overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url(${licenseBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Passport Header */}
      <div className="border-b border-[#C5A059]/40 pb-2 flex justify-between items-center">
        <span className="haste-category-label-en !mb-0 !text-[10.5px] !text-[#C5A059]">헤이스트 / REPUBLIC OF HASTE</span>
      </div>

      {/* Center Top: Holder Photo */}
      <div className={`flex flex-col items-center w-full border-b border-[#C5A059]/30 relative z-10 ${isComp ? 'pb-1.5' : 'pb-3'}`}>
        <div className={`bg-stone-50 rounded-lg relative overflow-hidden shadow-inner flex flex-col items-center justify-center ${isComp ? 'w-[180px] h-[110px]' : 'w-[256px] h-[160px]'}`}>
          <img 
            src={licenseBgImage} 
            alt="Haste License" 
            className="w-full h-full object-cover z-10 opacity-90"
            referrerPolicy="no-referrer"
          />
        </div>
        {!isComp && <span className="haste-body-text-3 !text-stone-500 uppercase tracking-wider mt-2 block font-bold">LICENSE CARD</span>}
      </div>

      {/* Below Photo: Passport Fields (Vertical Stacking) */}
      <div className={`flex flex-col text-xs leading-tight relative z-10 ${isComp ? 'gap-y-1.5' : 'gap-y-3'}`}>
        <div>
          <span className="haste-body-text-3 !text-[#C5A059]/90 font-bold block">매장명 / STORE NAME</span>
          <span className="haste-body-text-1-5 font-bold truncate block max-w-[200px] flex items-center gap-1.5 !text-stone-900">
            <span>{displayStoreName}</span>
            {user?.role === 'ADMIN' || user?.username === 'admin' ? (
              <span className="text-[9.5px] text-[#C5A059] font-bold bg-[#C5A059]/10 px-1.5 py-0.5 rounded border border-[#C5A059]/30 select-none whitespace-nowrap">
                👑 헤이스트마스터
              </span>
            ) : null}
          </span>
        </div>
        <div>
          <span className="haste-body-text-3 !text-[#C5A059]/90 font-bold block">점주 성함 / OWNER</span>
          <span className="haste-body-text-1-5 font-bold block text-stone-900">{uOwnerName}</span>
        </div>
        <div>
          <span className="haste-body-text-3 !text-[#C5A059]/90 font-bold block">매장 코드 / STORE CODE</span>
          <span className="haste-body-text-1-5 font-bold block text-stone-900">
            {uStoreCode || 'N/A'}
          </span>
        </div>
      </div>

      {/* Validity period block */}
      <div className={`flex flex-col gap-1 border-t border-[#C5A059]/30 relative z-10 ${isComp ? 'pt-1.5' : 'pt-3'}`}>
        <span className="haste-body-text-3 !text-[#C5A059]/90 font-bold uppercase tracking-wider block">유효기간 / VALIDITY PERIOD</span>
        <div className="flex items-center justify-between">
          <span className="haste-body-text-1-5 font-bold text-stone-900">
            {displayDateStr}
          </span>
          {remainingDays !== null && (user?.role !== 'ADMIN' && user?.username !== 'admin') && (
            <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${isExpired ? 'bg-rose-950/50 text-rose-400 border border-rose-800' : 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40'}`}>
              {remainingDays >= 0 ? `D-${remainingDays}` : '기간 만료'}
            </span>
          )}
        </div>
      </div>

      {/* 안내사항 */}
      <div className={`bg-stone-50/90 border border-stone-200 rounded-xl flex flex-col gap-1 relative z-10 ${isComp ? 'p-2.5 mt-1 text-[10px]' : 'p-3 mt-auto'}`}>
        <span className="haste-body-text-3 !text-[#C5A059] font-bold block">유의사항 / NOTICE</span>
        <p className="haste-body-text-3 !text-stone-700 font-normal">
          {user?.role === 'ADMIN' || user?.username === 'admin'
            ? '헤이스트 최고관리자 권한이 부여되었습니다. 전체 시스템 제어 권한이 상시 가동 중입니다.'
            : !license
            ? '라이선스 승인 대기 중입니다. 구독 결제를 완료하시면 즉시 연동 인증이 활성화됩니다.'
            : isExpired
            ? '구독 만료로 시스템이 정지 상태입니다. 갱신 결제를 진행해 주시기 바랍니다.'
            : license.isApproved !== 1
            ? '해당 지점은 헤이스트 정책에 의해 가동이 정지되었습니다. 헤이스트에 문의하십시오.'
            : '정식 라이선스가 승인되었습니다. 커피머신 로컬서버 가동 및 레시피 전송 기능이 상시 활성화됩니다.'}
        </p>
      </div>
    </div>
  );
};
