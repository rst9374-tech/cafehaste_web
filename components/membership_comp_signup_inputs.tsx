import React from 'react';
import { RefreshCw } from 'lucide-react';

interface MembershipCompSignUpInputsProps {
  isAdmin: boolean;
  storeName: string;
  handleStoreNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  storeCode: string;
  handleStoreCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password?: string;
  handlePasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  address: string;
  addressDetail: string;
  handleAddressDetailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openAddressSearch: () => void;
  ownerName: string;
  handleOwnerNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  phone: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
  setEmail: (val: string) => void;
  businessNumber: string;
  handleBusinessNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFileCompressing: boolean;
  businessCertFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  content: string;
  setContent: (val: string) => void;
  fillTestData: () => void;
  storeType: '일반' | '프리미엄';
  setStoreType: (val: '일반' | '프리미엄') => void;
}

export const MembershipCompSignUpInputs: React.FC<MembershipCompSignUpInputsProps> = ({
  isAdmin,
  storeName,
  handleStoreNameChange,
  storeCode,
  handleStoreCodeChange,
  password,
  handlePasswordChange,
  address,
  addressDetail,
  handleAddressDetailChange,
  openAddressSearch,
  ownerName,
  handleOwnerNameChange,
  phone,
  handlePhoneChange,
  email,
  setEmail,
  businessNumber,
  handleBusinessNumberChange,
  isFileCompressing,
  businessCertFile,
  handleFileChange,
  content,
  setContent,
  fillTestData,
  storeType,
  setStoreType,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[#422B1E] text-xl font-bold font-serif tracking-tight">멤버십 회원가입</span>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 sm:mt-0">
              <button
                type="button"
                onClick={fillTestData}
                className="text-[10px] sm:text-[11px] font-extrabold text-[#422B1E] hover:underline transition-all cursor-pointer"
                title="일반 테스트 매장 자동 데이터 입력"
              >
                <span>테스트 입력</span>
              </button>
            </div>
          )}
        </div>
        <span className="text-xs text-stone-500 font-medium self-start md:self-auto uppercase tracking-wider font-mono">OWNER INFO</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-3 sm:gap-y-4">
        {/* 1. 매장 코드* */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
          <span className="haste-body-text-2 !font-bold !text-[#C5A059] bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            매장 코드 *
          </span>
          <input
            type="text"
            required
            maxLength={6}
            value={storeCode}
            onChange={handleStoreCodeChange}
            placeholder="기존 매장코드 숫자 6자리 입력 (예: 123456)"
            className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
          />
        </div>

        {/* 2. 비밀번호 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
          <span className="haste-body-text-2 !font-bold !text-[#C5A059] bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            비밀번호 *
          </span>
          <input
            type="password"
            required
            value={password || ''}
            onChange={handlePasswordChange}
            placeholder="로그인용 비밀번호 설정"
            className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
          />
        </div>

        {/* 2.5 멤버십 유형 */}
        <div className="flex flex-col gap-1.5 w-full col-span-2 sm:col-span-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
            <span className="haste-body-text-2 !font-bold !text-[#C5A059] bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
              멤버십 유형 *
            </span>
            <div className="flex flex-row items-center gap-5 w-full font-sans select-none pl-1.5 flex-wrap sm:flex-nowrap">
              <div 
                className="flex items-center gap-2 cursor-pointer transition-all active:scale-97"
                onClick={() => setStoreType('프리미엄')}
              >
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                  storeType === '프리미엄' 
                    ? 'bg-stone-900 border-stone-900 text-[#C5A059]' 
                    : 'bg-white border-stone-300 text-transparent'
                }`}>
                  <svg className="w-2.5 h-2.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={`text-xs ${storeType === '프리미엄' ? 'text-stone-900 font-extrabold' : 'text-stone-500 font-medium'}`}>
                  헤이스트 멤버십
                </span>
              </div>
              <div 
                className="flex items-center gap-2 cursor-pointer transition-all active:scale-97"
                onClick={() => setStoreType('일반')}
              >
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                  storeType === '일반' 
                    ? 'bg-stone-900 border-stone-900 text-[#C5A059]' 
                    : 'bg-white border-stone-300 text-transparent'
                }`}>
                  <svg className="w-2.5 h-2.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={`text-xs ${storeType === '일반' ? 'text-stone-900 font-extrabold' : 'text-stone-500 font-medium'}`}>
                  멤버십
                </span>
              </div>
            </div>
          </div>
          {/* 설명글 */}
          <div className="sm:pl-[122px] text-[10px] sm:text-[10.5px] text-stone-500 font-medium leading-relaxed font-sans mt-1 space-y-1.5 text-left select-none">
            <div className="flex items-start gap-1.5">
              <span className="text-[#C5A059] shrink-0 mt-0.5">•</span>
              <span className="haste-badge-haste-membership shrink-0">헤이스트 멤버십</span>
              <span className="flex-1">헤이스트 브랜딩 및 상표 라이선스(소모품 등)를 무상으로 사용하며, 간판(상표)을 설치하여 운영하는 형태입니다.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-[#C5A059] shrink-0 mt-0.5">•</span>
              <span className="haste-badge-membership shrink-0">멤버십</span>
              <span className="flex-1">헤이스트 브랜드를 사용하지 않고, 매장 고유의 자체 브랜드로 독자 운영하는 형태입니다.</span>
            </div>
          </div>
        </div>

        {/* 3. 매장명 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
          <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            매장명 *
          </span>
          <input
            type="text"
            required
            value={storeName}
            onChange={handleStoreNameChange}
            placeholder="예: 은평점 (한글만)"
            className="w-full rounded-full border border-stone-200 bg-white py-1.5 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
          />
        </div>

        {/* 4. 점주 성함 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
          <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            점주 성함 *
          </span>
          <input
            type="text"
            required
            value={ownerName}
            onChange={handleOwnerNameChange}
            placeholder="예: 강동훈 (한글)"
            className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
          />
        </div>

        {/* 5. 매장주소 & 상세주소 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full col-span-2 sm:col-span-1">
          <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            매장주소<br/>상세주소 *
          </span>
          <div className="flex flex-row gap-2 w-full">
            <input
              type="text"
              required
              readOnly
              value={address}
              onClick={openAddressSearch}
              placeholder="터치하여 주소 검색"
              className="w-1/2 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100/80 py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all cursor-pointer shadow-sm font-sans"
            />
            <input
              type="text"
              value={addressDetail}
              onChange={handleAddressDetailChange}
              placeholder="상세주소 입력 (예: 2층)"
              className="w-1/2 rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
            />
          </div>
        </div>

        {/* 6. 연락처 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
          <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            연락처 *
          </span>
          <input
            type="tel"
            required
            value={phone}
            onChange={handlePhoneChange}
            placeholder="숫자 입력 (-제외)"
            className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
          />
        </div>

        {/* 7. 이메일 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
          <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            이메일 *
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="예: partner@haste.cafe"
            className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
          />
        </div>

        {/* 8. 사업자번호 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
          <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            사업자번호 *
          </span>
          <input
            type="text"
            required
            value={businessNumber}
            onChange={handleBusinessNumberChange}
            placeholder="숫자 10자리"
            className="w-full rounded-full border border-stone-200 bg-white py-2 px-3 sm:py-2.5 sm:px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
          />
        </div>

        {/* 9. 등록증첨부 */}
        <div className="flex flex-col gap-1 w-full text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
            <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
              등록증첨부 *
            </span>
            <div className="w-full flex items-center gap-1.5">
              <label className="shrink-0 bg-[#C5A059] hover:bg-[#b08e4d] text-white text-[11px] font-bold px-3 py-2 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 text-center">
                파일 선택
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <div className="flex-1 rounded-full border border-stone-200 bg-white py-2 px-3 text-xs text-stone-500 font-semibold truncate shadow-sm">
                {isFileCompressing ? (
                  <span className="text-[#C5A059] font-bold flex items-center gap-1 animate-pulse">
                    <RefreshCw size={10} className="animate-spin" />
                    압축 중...
                  </span>
                ) : businessCertFile ? (
                  businessCertFile.name
                ) : (
                  "이미지 필수 *"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 10. 문의사항 */}
        <div className="flex flex-col gap-1.5 w-full col-span-2 sm:col-span-1">
          <span className="haste-body-text-2 !font-bold !text-white bg-[#422B1E] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full w-full sm:w-28 text-center shrink-0 select-none font-sans">
            문의사항 *
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="가입 신청 추가 건의 및 요청사항을 편하게 남겨주십시오. (필수)"
            rows={2}
            className="w-full rounded-[16px] border border-stone-200 bg-white py-2 px-4 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all resize-none shadow-sm font-sans"
          />
        </div>
      </div>
    </>
  );
};
