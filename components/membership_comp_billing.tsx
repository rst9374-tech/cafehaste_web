import React from 'react';
import { CreditCard, RefreshCw, CheckCircle2, Sparkles, Printer } from 'lucide-react';

interface MembershipCompBillingProps {
  user: any;
  uStoreCode: string;
  isSignupPaid: boolean;
  isMonthlyPaid: boolean;
  payMethod: 'TOSS' | 'CARD';
  setPayMethod: (method: 'TOSS' | 'CARD') => void;
  agreeTerms: boolean;
  setAgreeTerms: (val: boolean) => void;
  agreePrivacy: boolean;
  setAgreePrivacy: (val: boolean) => void;
  agreeBilling: boolean;
  setAgreeBilling: (val: boolean) => void;
  signupPaymentLoading: boolean;
  paymentLoading: boolean;
  setSelectedReceipt: (receipt: any) => void;
  setReceiptModalOpen: (open: boolean) => void;
  handleSimulateSignupPayment: () => void;
  handleSimulatePayment: () => void;
}

export const MembershipCompBilling: React.FC<MembershipCompBillingProps> = ({
  user,
  uStoreCode,
  isSignupPaid,
  isMonthlyPaid,
  payMethod,
  setPayMethod,
  agreeTerms,
  setAgreeTerms,
  agreePrivacy,
  setAgreePrivacy,
  agreeBilling,
  setAgreeBilling,
  signupPaymentLoading,
  paymentLoading,
  setSelectedReceipt,
  setReceiptModalOpen,
  handleSimulateSignupPayment,
  handleSimulatePayment
}) => {
  const isAllAgreedForSignup = agreeTerms && agreePrivacy;
  const isAllAgreedForMonthly = agreeTerms && agreePrivacy && agreeBilling;

  return (
    <div className="w-full bg-[#070609]/95 border border-stone-900 rounded-2xl p-4 md:p-5 text-stone-300 font-sans shadow-lg text-left flex flex-col gap-4">
      
      {/* Header (가입비완납 / 구독활성 배지 형태 원복 적용) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-900 pb-2">
        <span className="dashboard-card-subtitle flex items-center gap-1.5">
          <CreditCard className="w-3 h-3 text-[#C5A059]" />
          MEMBERSHIP BILLING & SUBSCRIPTION
        </span>
        <div className="flex gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 dashboard-badge-text px-1.5 py-0.2 rounded-xl border ${
            isSignupPaid 
              ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
              : 'text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse'
          }`}>
            {isSignupPaid ? '● 가입비 납부완료' : '● 가입비 미납'}
          </span>
          <span className={`inline-flex items-center gap-1 dashboard-badge-text px-1.5 py-0.2 rounded-xl border ${
            isMonthlyPaid 
              ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
              : 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse'
          }`}>
            {isMonthlyPaid ? '● 월 구독 활성' : '● 월 구독 대기'}
          </span>
        </div>
      </div>

      {/* 결제 타겟 및 수단 선택 / 약관동의 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left / Mid Panel: 결제 프로세스 카드 (모서리 둥글기 rounded-xl 일체 통일) */}
        <div className="md:col-span-8 bg-stone-950/70 border border-stone-900 p-4 rounded-xl flex flex-col gap-4 relative">
          
          {/* 1. 결제 대상 정보 노출 */}
          <div className="border-b border-stone-900 pb-3">
            <span className="dashboard-label">PAYMENT TARGET</span>
            <div className="flex justify-between items-center mt-1">
              <h4 className={`dashboard-card-title ${isMonthlyPaid ? 'text-[#C5A059]' : 'text-stone-200'}`}>
                {!isSignupPaid ? '헤이스트 솔루션 가입비 (최초 1회)' : isMonthlyPaid ? '헤이스트 멤버십' : '헤이스트 멤버십 정기 구독 (월정액)'}
              </h4>
              <span className={`dashboard-price-large ${isMonthlyPaid ? 'text-stone-300' : 'text-[#C5A059]'}`}>
                {!isSignupPaid ? '₩ 330,000' : '₩ 55,000 / 월'}
              </span>
            </div>
            <p className="dashboard-desc text-[#C5A059] mt-2">
              가입비 결제 승인 완료 후, 월 멤버십 구독 결제를 진행해 주세요.
            </p>
          </div>

          {/* 2. 결제 수단 선택 UI (둥글기 rounded-xl 통일 & 골드 광채 테두리 및 글로우 적용) */}
          <div>
            <span className="dashboard-label block mb-2">SELECT PAYMENT METHOD</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayMethod('TOSS')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer ${
                  payMethod === 'TOSS'
                    ? 'bg-stone-955 border-[#C5A059] shadow-[0_0_12px_rgba(197,160,89,0.15)] ring-1 ring-[#C5A059]/30'
                    : 'bg-stone-955/20 border-stone-900 hover:border-stone-850'
                }`}
              >
                <span className={`dashboard-badge-text px-1.5 py-0.5 rounded-xl border w-fit ${
                  payMethod === 'TOSS' ? 'bg-[#C5A059] text-stone-950 border-transparent' : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}>Toss Pay</span>
                <div className="mt-2.5">
                  <span className="dashboard-form-control text-stone-200 block">토스 간편결제</span>
                  <span className="dashboard-desc block mt-0.5">토스앱 즉시 승인 및 등록 계좌 이체</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPayMethod('CARD')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer ${
                  payMethod === 'CARD'
                    ? 'bg-stone-955 border-[#C5A059] shadow-[0_0_12px_rgba(197,160,89,0.15)] ring-1 ring-[#C5A059]/30'
                    : 'bg-stone-955/20 border-stone-900 hover:border-stone-850'
                }`}
              >
                <span className={`dashboard-badge-text px-1.5 py-0.5 rounded-xl border w-fit ${
                  payMethod === 'CARD' ? 'bg-[#C5A059] text-stone-950 border-transparent' : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}>CREDIT CARD</span>
                <div className="mt-2.5">
                  <span className="dashboard-form-control text-stone-200 block">신용/체크카드</span>
                  <span className="dashboard-desc block mt-0.5">개인/법인카드 키인 일반결제 및 자동이체</span>
                </div>
              </button>
            </div>
          </div>

          {/* 3. 필수 이용 약관 동의 UI (박스선 border-stone-900 / 둥글기 rounded-xl 완벽 통일) */}
          <div className="bg-stone-900/40 border border-stone-900 p-3 rounded-xl flex flex-col gap-2">
            <span className="dashboard-label block">AGREEMENTS & CONSENT</span>
            
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-stone-850 text-[#C5A059] focus:ring-[#C5A059] w-3.5 h-3.5 cursor-pointer bg-stone-955 accent-[#C5A059]"
              />
              <label htmlFor="agree-terms" className="dashboard-desc text-stone-450 cursor-pointer select-none">
                [필수] 멤버십 서비스 이용약관 동의
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agree-privacy"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="rounded border-stone-850 text-[#C5A059] focus:ring-[#C5A059] w-3.5 h-3.5 cursor-pointer bg-stone-955 accent-[#C5A059]"
              />
              <label htmlFor="agree-privacy" className="text-[12.5px] text-stone-400 cursor-pointer select-none">
                [필수] 개인정보 수집 및 결제 대행사 제공 동의
              </label>
            </div>

            {/* 월 구독 결제 진행 시에만 노출되는 정기 결제 약관 동의 */}
            {isSignupPaid && !isMonthlyPaid && (
              <div className="flex items-center gap-2 border-t border-stone-900/60 pt-1.5 mt-0.5">
                <input
                  type="checkbox"
                  id="agree-billing"
                  checked={agreeBilling}
                  onChange={(e) => setAgreeBilling(e.target.checked)}
                  className="rounded border-stone-850 text-[#C5A059] focus:ring-[#C5A059] w-3.5 h-3.5 cursor-pointer bg-stone-955 accent-[#C5A059]"
                />
                <label htmlFor="agree-billing" className="text-[12.5px] text-stone-400 cursor-pointer select-none">
                  [필수] 매월 ₩55,000 정기 자동결제 동의
                </label>
              </div>
            )}
          </div>

          {/* 4. 실제 결제 실행 버튼 */}
          <div className="mt-1">
            {/* A. 가입비 결제가 미처리인 경우 */}
            {!isSignupPaid && (
              signupPaymentLoading ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 bg-stone-900 text-stone-500 rounded-xl dashboard-btn-text flex items-center justify-center gap-1.5 border border-stone-950"
                >
                  <RefreshCw className="animate-spin w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Toss 결제 보안 창 로딩 중...</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isAllAgreedForSignup}
                  onClick={handleSimulateSignupPayment}
                  className={`w-full py-3.5 rounded-xl dashboard-btn-text transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(197,160,89,0.25)] ${
                    isAllAgreedForSignup
                      ? 'bg-[#C5A059] hover:bg-[#b08e4d] text-stone-950 cursor-pointer active:scale-98'
                      : 'bg-stone-900/70 border border-stone-900 text-stone-600 cursor-not-allowed'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>{payMethod === 'TOSS' ? 'Toss Pay로 최초 가입비 330,000원 결제' : '신용카드로 최초 가입비 330,000원 일시불 결제'}</span>
                </button>
              )
            )}

            {/* B. 가입비는 처리되었으나 월 구독 결제가 대기 중인 경우 */}
            {isSignupPaid && !isMonthlyPaid && (
              paymentLoading ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 bg-stone-900 text-stone-500 rounded-xl text-[14px] font-bold flex items-center justify-center gap-1.5 border border-stone-950"
                >
                  <RefreshCw className="animate-spin w-3.5 h-3.5 text-[#C5A059]" />
                  <span>정기 결제 승인 대기 중...</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isAllAgreedForMonthly}
                  onClick={handleSimulatePayment}
                  className={`w-full py-3.5 rounded-xl text-[14px] font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(197,160,89,0.25)] ${
                    isAllAgreedForMonthly
                      ? 'bg-[#C5A059] hover:bg-[#b08e4d] text-stone-950 cursor-pointer active:scale-98'
                      : 'bg-stone-900/70 border border-stone-900 text-stone-600 cursor-not-allowed'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>{payMethod === 'TOSS' ? 'Toss Pay로 월 구독료 55,000원 자동결제 등록' : '신용카드로 월 구독료 55,000원 정기결제 등록'}</span>
                </button>
              )
            )}

            {/* C. 모든 결제가 완료된 경우 (리치 골드 럭셔리 알림 패널, 둥글기 rounded-xl 통일) */}
            {isSignupPaid && isMonthlyPaid && (
              <div className="bg-[#C5A059]/5 border border-[#C5A059]/20 rounded-xl p-3 text-center flex flex-col items-center gap-1">
                <CheckCircle2 className="text-[#C5A059] w-5 h-5" />
                <span className="dashboard-card-title text-[#C5A059] block">축하합니다! 무인 멤버십 및 가입비 납부가 모두 완료되었습니다.</span>
                <span className="dashboard-badge-text text-stone-550 block">지점 단말기 자동 제어 및 토스 상품목록 연동 기능이 완전 활성화 상태입니다.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: 결제 수단별 가이드 및 안내 (우측 박스들 둥글기 rounded-xl 일체 통일) */}
        <div className="md:col-span-4 bg-stone-955/40 border border-stone-800 p-4 rounded-xl flex flex-col justify-between gap-4 dashboard-desc text-stone-450 font-sans">
          <div className="flex flex-col gap-2">
            <div className="bg-[#C5A059]/5 border border-[#C5A059]/10 p-2.5 rounded-xl flex items-start gap-2">
              <Sparkles size={14} className="text-[#C5A059] shrink-0 mt-0.5" />
              <p className="dashboard-desc text-stone-300 leading-normal">
                토스페이먼츠 간편결제 SDK가 연동되어 안전하고 빠른 결제 승인 프로세스를 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History (미니 결제 내역 테이블 - 테두리 및 구분선 border-stone-900 일괄 통일) */}
      <div className="flex flex-col gap-2 mt-2 font-sans">
        <span className="dashboard-label block">최근 결제 내역 (최근 3건)</span>
        <div className="overflow-x-auto text-[13px] text-stone-450 rounded-xl border border-stone-800">
          <table className="dashboard-table w-full border-collapse text-left bg-stone-950/20 overflow-hidden">
            <thead>
              <tr className="bg-stone-900/40 text-stone-500 border-b border-stone-800">
                <th className=" w-1/4">결제일시</th>
                <th className=" w-1/4">결제내용</th>
                <th className=" w-1/6">결제금액</th>
                <th className=" w-1/4">결제상태</th>
                <th className=" text-center">증빙</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 text-stone-350 font-sans">
              {isMonthlyPaid ? (
                <tr className="hover:bg-stone-900/20">
                  <td className=" text-stone-400">2026-07-11 09:56:02</td>
                  <td className=" font-bold text-stone-200">무인솔루션 월정액 멤버십 (구독)</td>
                  <td className=" font-sans font-bold text-stone-300">₩ 55,000</td>
                  <td className=" text-[#C5A059] font-bold">결제완료 ({payMethod === 'TOSS' ? 'TOSS_1192' : 'CARD_9921'})</td>
                  <td className=" text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReceipt({
                          date: '2026-07-11 09:56:02',
                          title: '무인솔루션 월정액 멤버십 (구독)',
                          amount: 55000,
                          tid: payMethod === 'TOSS' ? 'TOSS_1192' : 'CARD_9921',
                          method: payMethod === 'TOSS' ? '토스페이 간편결제' : '신용카드 일반결제'
                        });
                        setReceiptModalOpen(true);
                      }}
                      className="p-1 hover:bg-stone-900 text-stone-400 hover:text-[#C5A059] rounded transition-all cursor-pointer active:scale-95"
                      title="영수증 출력"
                    >
                      <Printer size={13} />
                    </button>
                  </td>
                </tr>
              ) : null}
              {isSignupPaid ? (
                <tr className="hover:bg-stone-900/20">
                  <td className=" text-stone-400">2026-07-11 09:55:51</td>
                  <td className=" font-bold text-stone-200">무인솔루션 최초 가입비 (1회)</td>
                  <td className=" font-sans font-bold text-stone-300">₩ 330,000</td>
                  <td className=" text-[#C5A059] font-bold">결제완료 (TOSS_INIT)</td>
                  <td className=" text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReceipt({
                          date: '2026-07-11 09:55:51',
                          title: '무인솔루션 최초 가입비 (1회)',
                          amount: 330000,
                          tid: 'TOSS_INIT',
                          method: '토스페이 일시불결제'
                        });
                        setReceiptModalOpen(true);
                      }}
                      className="p-1 hover:bg-stone-900 text-stone-400 hover:text-[#C5A059] rounded transition-all cursor-pointer active:scale-95"
                      title="영수증 출력"
                    >
                      <Printer size={13} />
                    </button>
                  </td>
                </tr>
              ) : null}
              <tr className="hover:bg-stone-900/20">
                <td className=" text-stone-500">2026-06-11 09:20:01</td>
                <td className=" text-stone-400">무인솔루션 월정액 멤버십 (구독)</td>
                <td className=" font-sans text-stone-400">₩ 55,000</td>
                <td className=" text-stone-500 font-medium">결제완료 (TOSS_1021)</td>
                <td className=" text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReceipt({
                        date: '2026-06-11 09:20:01',
                        title: '무인솔루션 월정액 멤버십 (구독)',
                        amount: 55000,
                        tid: 'TOSS_1021',
                        method: '토스페이 간편결제'
                      });
                      setReceiptModalOpen(true);
                    }}
                    className="p-1 hover:bg-stone-900 text-stone-400 hover:text-[#C5A059] rounded transition-all cursor-pointer active:scale-95"
                    title="영수증 출력"
                  >
                    <Printer size={13} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
