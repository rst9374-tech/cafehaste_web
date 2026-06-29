import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Check, ChevronRight, Award, BookOpen
} from 'lucide-react';
import { HasteMembershipDiagram } from './membership_comp_diagram';
import { MembershipFeePolicy, MembershipValueMetrics } from './membership_comp_metrics';
import { useHasteBilling } from './membership_hook_billing';
import { HasteGuidebookModal } from './membership_modal_guidebook';
import { HasteBenefitModal } from './membership_modal_benefit';
// @ts-ignore
import hasteLicenseImg from '../src/assets/images/haste_license_new.jpg';

interface HasteMembershipFormProps {
  isComp?: boolean;
}

export const HasteMembershipForm: React.FC<HasteMembershipFormProps> = ({ isComp = false }) => {
  const {
    activeToast,
    setActiveToast,
    ownerName,
    registerSuccess,
    setRegisterSuccess,
    lastRegisteredMember,
  } = useHasteBilling();

  // 2. Billing Card Fields State (UI mockup interaction)
  const [cardNo, setCardNo] = useState('');
  const [cardVal, setCardVal] = useState(''); // MM/YY
  const [cardCvv, setCardCvv] = useState('');
  const [cardPwd, setCardPwd] = useState(''); // First 2 digits
  const [cardCompany, setCardCompany] = useState('신한카드');
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);
  const [isBenefitOpen, setIsBenefitOpen] = useState(false);

  return (
    <div id="haste-membership-core" className="max-w-5xl mx-auto my-12 px-4 scroll-mt-28">
      
      {/* Toast Notification for KakaoTalk Popups (Looks like native KakaoTalk floating notification) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 z-[99] max-w-sm w-full bg-[#FFEC00] text-[#3C1E1E] p-4 rounded-2xl shadow-2xl border border-yellow-400 font-sans tracking-tight"
          >
            <div className="flex items-start gap-3">
              {/* Kakao icon mockup */}
              <div className="w-8 h-8 rounded-xl bg-[#3C1E1E] text-[#FFEC00] flex items-center justify-center font-bold text-xs flex-shrink-0">
                TALK
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1 flex-wrap">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#3C1E1E]/60">알림톡 • 헤이스트 스마트본부</span>
                  <span className="text-[9px] font-mono opacity-60">{activeToast.time}</span>
                </div>
                <h5 className="font-bold text-xs truncate text-[#1C1C1C]">{activeToast.title}</h5>
                <p className="text-[10.5px] leading-relaxed mt-1 text-stone-850 whitespace-pre-line line-clamp-3">
                  {activeToast.body}
                </p>
                <div className="mt-2.5 flex justify-between items-center border-t border-[#3C1E1E]/10 pt-2">
                  <span className="text-[8px] font-black tracking-wide bg-[#3C1E1E]/10 px-1.5 py-0.5 rounded uppercase">
                    수신자: {activeToast.targetUser}
                  </span>
                  <button 
                    onClick={() => setActiveToast(null)}
                    className="text-[9px] font-extrabold text-[#3C1E1E] hover:underline"
                  >
                    확인 및 닫기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Membership vs Startup Member Comparison Diagram (Placed above for clear model choice first) */}
      {!isComp && (
        <div className="mb-10">
          <HasteMembershipDiagram onOpenGuidebook={() => setIsGuidebookOpen(true)} />
        </div>
      )}

      {/* Main Container visual styling with a cozy background shadow */}
      <div className="bg-[#F4EADB] rounded-[36px] shadow-xl overflow-hidden">
        
        {/* Modern Header */}
        <div className="bg-stone-900 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-stone-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C5A059] to-[#C5A059] flex items-center justify-center text-stone-950">
              <CreditCard size={18} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[7px] sm:text-[9px] font-mono font-bold text-[#C5A059] tracking-widest block uppercase">HASTE VERIFICATION & BILLING SYSTEM</span>
              <h2 className="haste-title-main !text-white !mb-0 !text-sm sm:!text-lg tracking-tight">헤이스트 솔루션 멤버십 가입센터</h2>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setIsBenefitOpen(true)}
              className="bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-750 font-bold py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-xl border border-stone-300 transition-all text-[10.5px] sm:text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <Award className="text-[#C5A059] w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" />
              <span>멤버십 혜택안내</span>
            </button>
            <button
              type="button"
              onClick={() => setIsGuidebookOpen(true)}
              className="bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-750 font-bold py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-xl border border-stone-300 transition-all text-[10.5px] sm:text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <BookOpen className="text-[#C5A059] w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" />
              <span>멤버십 가입안내</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 md:p-8 bg-[#F4EADB]">
          {!registerSuccess ? (
            <div className="flex flex-col gap-10">

              {/* Grid 12 Column Outer Area */}
              <div className="p-3.5 sm:p-5 md:p-7 rounded-3xl bg-stone-200 shadow-xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                  
                  {/* Left Column: Upgraded Gold-Framed Luxury Master Authority License Panel */}
                  <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="pl-1">
                      <span className="text-[9px] font-mono font-bold text-[#C5A059] tracking-widest uppercase block mb-0.5">Digital Certificate</span>
                      <h4 className="font-serif text-sm font-bold text-stone-900">점포 고유 라이선스</h4>
                    </div>
                    <div className="bg-[#FAF9F6] p-5 md:p-6 rounded-2xl border border-stone-250 shadow-md h-fit">
                    <div className="flex flex-col items-start gap-1 mb-4 pb-2 border-b border-stone-200/60">
                      <h4 className="font-sans text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap">
                        <Award size={14} className="text-[#C5A059] animate-pulse" />
                        디지털 마스터십 라이선스
                      </h4>
                      <span className="text-[9px] font-mono text-stone-500 font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200 w-fit">
                        SECURE CERTIFIED
                      </span>
                    </div>
                    
                    {/* Luxury Velvet Obsidian Holographic Authority Image */}
                    <div className="relative w-full aspect-[1.33/1] rounded-xl overflow-hidden shadow-2xl select-none group">
                      <img 
                        src={hasteLicenseImg} 
                        alt="Gold System License Authority Certificate" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Card photo text overlays removed */}
                    </div>
                  </div>
                </div>

                {/* Right Column: Form Details */}
                <div className="lg:col-span-8 flex flex-col gap-3 h-full justify-between">
                  <div className="pl-1 flex flex-wrap items-end gap-2.5">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-[#C5A059] tracking-widest uppercase block mb-0.5">Fee Framework & Policy</span>
                      <h4 className="font-serif text-sm font-bold text-stone-900 leading-tight">헤이스트 솔루션 이용료</h4>
                    </div>
                    <div className="flex items-center gap-1 pb-0.5">
                      <span className="haste-badge-membership">멤버십</span>
                      <span className="haste-badge-haste-membership">헤이스트 멤버십</span>
                    </div>
                  </div>
                  <MembershipFeePolicy />
   
                    <div className="flex flex-col gap-4 bg-[#FCFCFA] p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-[#C5A059] tracking-widest uppercase block">SIMPLIFIED REGISTRATION DESK</span>
                      </div>
   
                      {/* Highly premium luxury styled CTA Button */}
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new Event('haste_open_signup_modal'));
                        }}
                        className="group relative w-full py-3.5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-sans font-bold text-base rounded-xl shadow-[0_10px_20px_rgba(28,25,23,0.15)] hover:shadow-[0_15px_30px_rgba(28,25,23,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 border border-stone-850 overflow-hidden"
                      >
                        {/* Interactive golden shimmer bar */}
                        <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full transition-transform duration-1000 group-hover:translate-x-[400%]" />
                        
                        <div className="flex items-center gap-2 text-[#C5A059] transition-colors z-10">
                          <span className="text-sm md:text-base tracking-wider font-bold">헤이스트 솔루션 멤버십 가입신청</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <MembershipValueMetrics />

            </div>
          ) : (
            // On Successful Signup Page view
            <motion.div 
              id="membership-joined-success-view"
               initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto py-12 px-6 text-center flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600">
                <Check size={36} />
              </div>

              <div>
                <h3 className="font-sans text-2xl font-bold text-stone-900">헤이스트 솔루션 멤버십 가입이 완료되었습니다!</h3>
                <p className="text-stone-500 text-xs font-light mt-2 leading-relaxed">
                  사장님의 소중한 점포 정보 및 정기 월 회비 카드 자동이체 연동 가입이 완료되었습니다. 가입비 30만 원(VAT 별도)의 최초 솔루션 결제가 완료되었습니다.
                </p>
              </div>

              <div className="w-full bg-[#FAF9F6] rounded-2xl border border-stone-200 p-6 text-left font-mono text-xs text-stone-700 flex flex-col gap-3">
                <div className="flex justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-400">매장 코드:</span>
                  <span className="font-bold text-stone-900">{lastRegisteredMember?.id}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-400">등록 매장명:</span>
                  <span className="font-bold text-[#C5A059]">{lastRegisteredMember?.storeName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-400">점주 성함:</span>
                  <span className="font-bold text-stone-900">{lastRegisteredMember?.ownerName} 사장님</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-400">결제 카드사:</span>
                  <span className="font-bold text-stone-800">{lastRegisteredMember?.cardCompany} ({lastRegisteredMember?.cardNo})</span>
                </div>
                <div className="flex justify-between text-stone-800 font-bold">
                  <span className="text-[#C5A059]">가입비 결제 금액:</span>
                  <span>30만원<span className="text-[10px] text-stone-500 font-normal ml-0.5">(VAT별도)</span></span>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-250 text-left w-full text-[11px] text-amber-900 font-sans flex items-start gap-2.5">
                <span className="bg-[#FFEC00] text-[#3C1E1E] p-1 rounded-md text-[8px] font-black tracking-tighter uppercase flex-shrink-0 font-mono">TALK</span>
                <p className="leading-relaxed font-semibold">
                  [카카오 알림 분산 보고됨] 가입 성공 증빙 및 신용카드 매출전표가 방금 사장님 연락처 (<span className="underline">{lastRegisteredMember?.phone}</span>)의 카카오톡으로 발송되었습니다.
                </p>
              </div>

              <div className="flex gap-3 mt-4 justify-center">
                <button
                  type="button"
                  onClick={() => { setRegisterSuccess(false); }}
                  className="bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-700 font-medium py-3 px-6 rounded-2xl border border-stone-300 transition-all text-xs md:text-sm cursor-pointer mx-auto"
                >
                  추가 파트너 가입하기
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <HasteGuidebookModal
        isOpen={isGuidebookOpen}
        onClose={() => setIsGuidebookOpen(false)}
      />
      <HasteBenefitModal
        isOpen={isBenefitOpen}
        onClose={() => setIsBenefitOpen(false)}
      />
    </div>
  );
};
