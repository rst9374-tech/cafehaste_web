import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle, AlertCircle, RefreshCw, KeyRound
} from 'lucide-react';
import { useHasteInquiry } from './membership_hook_inquiry';
import { HasteTermsModal } from './membership_modal_terms';

interface HasteInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HasteInquiryModal: React.FC<HasteInquiryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    regionName,
    ownerName,
    phone,
    email,
    setEmail,
    capital,
    hasStore,
    setHasStore,
    inquiryPath,
    setInquiryPath,
    content,
    setContent,
    agreeTerms,
    setAgreeTerms,
    isSubmitting,
    submitError,
    submitSuccess,
    setSubmitSuccess,
    registeredId,
    isAdmin,
    fillTestData,
    handleOwnerNameChange,
    handlePhoneChange,
    handleCapitalChange,
    openRegionSearch,
    handleSubmit,
    setRegionName,
    setOwnerName,
    setPhone,
    setCapital,
  } = useHasteInquiry({ isOpen, onSuccess });

  const [isTermsOpen, setIsTermsOpen] = React.useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-1.5 sm:p-4">
          {/* Soft elegant backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm"
          />

          {/* Modal Window Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-[#F4EADB] rounded-[30px] shadow-2xl max-w-lg w-full overflow-hidden font-sans z-50 flex flex-col justify-between max-h-[96vh] sm:max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-[#15141D] border-b border-stone-800 px-4 py-3 sm:px-6 sm:py-4.5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                  <KeyRound size={14} />
                </div>
                <div>
                  <span className="haste-category-label-en mb-0.5">HASTE RESERVATION</span>
                  <h3 className="haste-section-title-3 !text-white leading-tight">헤이스트 창업문의</h3>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-2.5 sm:p-6 md:p-8 flex-1">
              {!submitSuccess ? (
                <form onSubmit={handleSubmit} className="bg-[#F4EADB]/90 rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-6 border-2 border-stone-300/90 flex flex-col gap-3 sm:gap-4.5">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[#422B1E] text-xl font-bold font-serif tracking-tight">창업문의</span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={fillTestData}
                          className="text-[11px] font-extrabold text-[#422B1E] hover:underline transition-all cursor-pointer"
                        >
                          <span>테스트 입력</span>
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 font-medium">예약자 정보</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-3 sm:gap-y-4">
                    {/* 1. 점주 성함 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        점주 성함 *
                      </span>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={handleOwnerNameChange}
                        placeholder="예: 홍길동"
                        className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                      />
                    </div>

                    {/* 2. 연락처 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        연락처 *
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="숫자 입력 (-제외)"
                        className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                      />
                    </div>

                    {/* 3. 이메일 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        이메일 *
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="예: partner@haste.cafe"
                        className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                      />
                    </div>

                    {/* 4. 창업희망지역 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        창업희망지역 *
                      </span>
                      <input
                        type="text"
                        readOnly
                        value={regionName}
                        onClick={openRegionSearch}
                        placeholder="터치하여 주소 검색"
                        className="w-full rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100/80 py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all cursor-pointer shadow-sm font-sans"
                      />
                    </div>

                    {/* 5. 창업 자본금 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        창업 자본금 *
                      </span>
                      <input
                        type="text"
                        value={capital}
                        onChange={handleCapitalChange}
                        placeholder="단위: 만원 (예: 5000)"
                        className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                      />
                    </div>

                    {/* 6. 점포유무 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        점포유무 *
                      </span>
                      <div className="grid grid-cols-2 rounded-full border border-stone-200 bg-white p-0.5 w-full overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => setHasStore('없음')}
                          className={`py-1.5 sm:py-2 text-xs font-bold text-center rounded-full transition-all cursor-pointer ${ hasStore === '없음' ? 'bg-[#422B1E] text-white shadow-sm' : 'bg-white text-stone-500 hover:text-stone-800' }`}
                        >
                          없음
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasStore('있음')}
                          className={`py-1.5 sm:py-2 text-xs font-bold text-center rounded-full transition-all cursor-pointer ${ hasStore === '있음' ? 'bg-[#422B1E] text-white shadow-sm' : 'bg-white text-stone-500 hover:text-stone-800' }`}
                        >
                          있음
                        </button>
                      </div>
                    </div>

                    {/* 7. 문의경로 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        문의경로 *
                      </span>
                      <div className="relative w-full">
                        <select
                          required
                          value={inquiryPath}
                          onChange={(e) => setInquiryPath(e.target.value)}
                          className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 pr-8 sm:py-2.5 sm:px-5 sm:pr-10 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all cursor-pointer shadow-sm appearance-none font-sans"
                        >
                          <option value="">경로 선택 *</option>
                          <option value="인터넷 검색">포털 검색</option>
                          <option value="지인 소개">지인 추천</option>
                          <option value="SNS / 블로그">SNS/블로그</option>
                          <option value="오프라인 매장 방문">매장 방문</option>
                          <option value="기타">기타</option>
                        </select>
                        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-stone-500 text-[10px]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* 8. 문의내용 */}
                    <div className="flex flex-col gap-1.5 w-full col-span-2 sm:col-span-1">
                      <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
                        문의내용 *
                      </span>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="창업 희망 내용, 요청하고 싶으신 점을 남겨주시면 신속히 연락 드리겠습니다. (필수)"
                        rows={2}
                        className="w-full rounded-[16px] border border-stone-200 bg-white py-2 px-4 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all resize-none shadow-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* Footer submit block matching design */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-0.5 border-t border-amber-900/10 pt-2">
                    <div className="flex items-center gap-2 select-none text-xs font-bold text-stone-600">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 accent-[#422B1E] border-stone-300 rounded cursor-pointer"
                        id="inquiry-agree-chk"
                      />
                      <label htmlFor="inquiry-agree-chk" className="cursor-pointer">
                        개인정보 수집 및 이용 동의
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen(true)}
                        className="text-[10.5px] text-[#C5A059] hover:underline font-bold ml-1.5 cursor-pointer"
                      >
                        [약관보기]
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-[#422B1E] hover:bg-stone-850 disabled:opacity-50 text-white font-extrabold text-xs tracking-wide rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="animate-spin text-white" size={13} />
                          접수 중...
                        </>
                      ) : (
                        <span>작성완료</span>
                      )}
                    </button>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex gap-2 items-start">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold mb-0.5">창업문의 등록 실패</h4>
                        <p className="font-light leading-relaxed whitespace-pre-line">{String(submitError)}</p>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center flex flex-col items-center gap-4 animate-fade-in"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-bounce mb-1">
                    <CheckCircle size={28} />
                  </div>
   
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900">창업문의 등록 완료!</h4>
                    <p className="text-stone-500 text-[11px] font-light mt-1.5 leading-relaxed">
                      신청하신 소중한 창업문의 정보가 시스템 데이터베이스에 정상적으로 실시간 등록되었습니다.
                    </p>
                  </div>
   
                  <div className="w-full bg-[#FCFCFA]/90 rounded-2xl border border-stone-200/90 p-4.5 text-left font-sans text-xs text-stone-700 flex flex-col gap-2.5">
                    <div className="flex justify-between border-b border-dashed border-stone-200 pb-2">
                      <span className="text-stone-400">발급 접수번호:</span>
                      <span className="font-mono font-bold text-stone-900">#CNS-{registeredId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">점주 성함:</span>
                      <span className="font-bold text-stone-900">{ownerName} 님</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">출점 희망지역:</span>
                      <span className="font-bold text-[#422B1E]">{regionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">창업 자본금:</span>
                      <span className="font-bold text-stone-905">{capital} 만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">점포 보유 유무:</span>
                      <span className="font-bold text-stone-905">{hasStore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">가장 가깝게 인입된 경로:</span>
                      <span className="font-bold text-stone-905">{inquiryPath || "전체 경로"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-4 w-full">
                    <button
                      onClick={() => {
                        setRegionName('');
                        setOwnerName('');
                        setPhone('');
                        setEmail('');
                        setCapital('');
                        setHasStore('없음');
                        setInquiryPath('');
                        setContent('');
                        setAgreeTerms(false);
                        setSubmitSuccess(false);
                      }}
                      className="flex-1 py-3 border border-stone-300 hover:bg-stone-50 text-stone-600 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      추가 예약 신청
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      닫기
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <HasteTermsModal 
        isOpen={isTermsOpen} 
        docType="PRIVACY" 
        onClose={() => setIsTermsOpen(false)} 
      />
    </AnimatePresence>
  );
};
