import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, AlertCircle, RefreshCw, User
} from 'lucide-react';
import { MembershipCompSignUpSuccess } from './membership_comp_signup_success';
import { MembershipCompSignUpInputs } from './membership_comp_signup_inputs';
import { useHasteSignUp } from './membership_hook_signup';
import { HasteTermsModal } from './membership_modal_terms';

interface HasteSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HasteSignUpModal: React.FC<HasteSignUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    storeName,
    setStoreName,
    storeCode,
    setStoreCode,
    password,
    setPassword,
    address,
    setAddress,
    addressDetail,
    setAddressDetail,
    ownerName,
    setOwnerName,
    phone,
    setPhone,
    email,
    setEmail,
    content,
    setContent,
    agreeTerms,
    setAgreeTerms,
    businessNumber,
    setBusinessNumber,
    businessCertFile,
    setBusinessCertFile,
    businessCertBase64,
    setBusinessCertBase64,
    isFileCompressing,
    isSubmitting,
    submitError,
    setSubmitError,
    submitSuccess,
    setSubmitSuccess,
    registeredId,
    isAdmin,
    handleFileChange,
    handleStoreNameChange,
    handleStoreCodeChange,
    handlePasswordChange,
    handleOwnerNameChange,
    handlePhoneChange,
    handleBusinessNumberChange,
    openAddressSearch,
    fillTestData,
    handleSubmit,
    storeType,
    setStoreType,
  } = useHasteSignUp({ isOpen, onSuccess });

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
            transition={{ duration: 0.25 }}
            className="relative bg-[#F4EADB] rounded-[30px] shadow-2xl max-w-2xl w-full overflow-hidden font-sans z-50 flex flex-col justify-between max-h-[96vh] sm:max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-[#15141D] border-b border-stone-800 px-4 py-3 sm:px-6 sm:py-4.5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                  <User size={14} />
                </div>
                <div>
                  <span className="haste-category-label-en mb-0.5">HASTE MEMBERSHIP</span>
                  <h3 className="haste-section-title-3 !text-white leading-tight">헤이스트 멤버십 가입신청</h3>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={onClose}
                className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                title="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-2.5 sm:p-6 md:p-8 flex-1">
              {!submitSuccess ? (
                <form onSubmit={handleSubmit} className="bg-[#F4EADB]/90 rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-6 border-2 border-stone-300/90 flex flex-col gap-3 sm:gap-4.5">
                  <MembershipCompSignUpInputs
                    isAdmin={isAdmin}
                    storeName={storeName}
                    handleStoreNameChange={handleStoreNameChange}
                    storeCode={storeCode}
                    handleStoreCodeChange={handleStoreCodeChange}
                    password={password}
                    handlePasswordChange={handlePasswordChange}
                    address={address}
                    addressDetail={addressDetail}
                    handleAddressDetailChange={(e) => setAddressDetail(e.target.value)}
                    openAddressSearch={openAddressSearch}
                    ownerName={ownerName}
                    handleOwnerNameChange={handleOwnerNameChange}
                    phone={phone}
                    handlePhoneChange={handlePhoneChange}
                    email={email}
                    setEmail={setEmail}
                    businessNumber={businessNumber}
                    handleBusinessNumberChange={handleBusinessNumberChange}
                    isFileCompressing={isFileCompressing}
                    businessCertFile={businessCertFile}
                    handleFileChange={handleFileChange}
                    content={content}
                    setContent={setContent}
                    fillTestData={fillTestData}
                    storeType={storeType}
                    setStoreType={setStoreType}
                  />

                  {/* Footer submit block matching design */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-0.5 border-t border-amber-900/10 pt-2">
                    <div className="flex items-center gap-2 select-none text-xs font-bold text-stone-600">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 accent-stone-950 border-stone-300 rounded cursor-pointer"
                        id="signup-agree-chk"
                      />
                      <label htmlFor="signup-agree-chk" className="cursor-pointer">
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
                    
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || isFileCompressing}
                        className="w-full sm:w-auto px-3.5 py-1.5 bg-stone-950 hover:bg-stone-850 disabled:opacity-50 text-white font-extrabold text-xs tracking-wide rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="animate-spin text-white" size={13} />
                            생성 중...
                          </>
                        ) : isFileCompressing ? (
                          <>
                            <RefreshCw className="animate-spin text-white" size={13} />
                            이미지 압축 중...
                          </>
                        ) : (
                          <span>작성완료</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex gap-2 items-start">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold mb-0.5">회원가입 실패</h4>
                        <p className="font-light leading-relaxed">{submitError}</p>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <MembershipCompSignUpSuccess
                  registeredId={registeredId}
                  storeName={storeName}
                  storeCode={storeCode}
                  ownerName={ownerName}
                  businessNumber={businessNumber}
                  content={content}
                  onClose={onClose}
                  onReset={() => {
                    setStoreName('');
                    setStoreCode('');
                    setPassword('');
                    setAddress('');
                    setOwnerName('');
                    setPhone('');
                    setEmail('');
                    setContent('');
                    setBusinessNumber('');
                    setBusinessCertFile(null);
                    setBusinessCertBase64('');
                    setAgreeTerms(false);
                    setSubmitSuccess(false);
                  }}
                />
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
