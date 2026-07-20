import React, { useState } from 'react';

export interface MemberEditModalProps {
  member: any;
  licenses?: any[];
  onClose: () => void;
  onSave: (updatedFields: any) => Promise<void>;
}

export const MemberEditModal: React.FC<MemberEditModalProps> = ({ member, licenses = [], onClose, onSave }) => {
  const [storeName, setStoreName] = useState(member.storeName || '');
  const [storeCode, setStoreCode] = useState(member.storeCode || '');
  const [ownerName, setOwnerName] = useState(member.ownerName || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [email, setEmail] = useState(member.email || '');
  const [address, setAddress] = useState(member.address || '');
  const [addressDetail, setAddressDetail] = useState('');
  const [businessNumber, setBusinessNumber] = useState(member.businessNumber || '');
  const [content, setContent] = useState(member.content || '');
  const [businessCertPath, setBusinessCertPath] = useState(member.businessCertPath || '');
  const [businessCertBase64, setBusinessCertBase64] = useState('');
  const [businessCertName, setBusinessCertName] = useState('');
  const [isFileCompressing, setIsFileCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [password, setPassword] = useState('');

  // Find matching license if licenses list is provided
  const findLicense = () => {
    if (!licenses || !member) return null;
    const sCode = member.storeCode ? member.storeCode.trim() : '';
    const fallbackId = `없음_${member.id}`;
    return licenses.find((l: any) => {
      const dbStoreId = l.storeId ? l.storeId.trim() : '';
      return (sCode && dbStoreId === sCode) || dbStoreId === fallbackId;
    });
  };

  const matchedLicense = findLicense();
  const [licenseStartDate, setLicenseStartDate] = useState(matchedLicense?.licenseStartDate || '');
  const [licenseEndDate, setLicenseEndDate] = useState(matchedLicense?.licenseEndDate || '');
  const [storeGrade, setStoreGrade] = useState(matchedLicense?.storeGrade || (member.storeType === 'HASTE_MEMBERSHIP' ? 'PREMIUM' : 'STANDARD'));
  const [storeType, setStoreType] = useState(member.storeType || 'MEMBERSHIP');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isAllowedExt = allowedExtensions.includes(fileExt);
      const isImageMime = file.type.startsWith('image/');

      if (!isImageMime || !isAllowedExt) {
        alert('사업자등록증은 이미지 파일(PNG, JPG, JPEG, WEBP, GIF)만 업로드 가능합니다.');
        e.target.value = '';
        return;
      }
      
      const maxSizeLimit = 20 * 1024 * 1024;
      if (file.size > maxSizeLimit) {
        alert(`해당 이미지 파일의 크기가 너무 큽니다 (${(file.size / (1024 * 1024)).toFixed(1)}MB). 20MB 이하의 이미지 전용 파일을 업로드해 주세요.`);
        e.target.value = '';
        return;
      }

      setIsFileCompressing(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBusinessCertBase64(reader.result as string);
          setBusinessCertName(file.name);
          setIsFileCompressing(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error(err);
        setIsFileCompressing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !ownerName || !phone) {
      alert('매장명, 점주명, 연락처는 필수 항목입니다.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        id: member.id, // Explicitly keep ID
        storeName,
        storeCode,
        ownerName,
        phone,
        email,
        address: addressDetail.trim() ? `${address} ${addressDetail.trim()}` : address,
        businessNumber,
        content,
        businessCertPath,
        businessCertBase64,
        businessCertName,
        licenseStartDate,
        licenseEndDate,
        storeGrade,
        store_type: storeType,
        password
      });
      onClose();
    } catch (err: any) {
      alert('오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-stone-955/80 backdrop-blur-xs member-edit-modal-wrapper">
      <div 
        onClick={onClose}
        className="fixed inset-0 cursor-pointer" 
      />
      <div className="relative dashboard-modal w-full max-w-xl z-50 flex flex-col max-h-[90vh] bg-[#F4EADB] border border-stone-300 shadow-2xl" style={{ backgroundColor: '#F4EADB' }}>
        {/* Header */}
        <div className="dashboard-header shrink-0 border-b border-stone-800" style={{ backgroundColor: '#1c1917' }}>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-black text-sm tracking-tight text-white font-sans">
              멤버십정보 수정 <span className="font-mono text-xs text-[#C5A059]">({member.id})</span>
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-left bg-[#F4EADB]" style={{ backgroundColor: '#F4EADB' }}>
          {/* Row 1: 매장 정보 */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider pb-1 border-b border-stone-300 font-sans">
              <span>매장 기본 정보</span>
            </h4>
            
            {/* 매장명 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                매장명 *
              </span>
              <input 
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                required
              />
            </div>

            {/* 매장 코드 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                매장 코드
              </span>
              <input 
                type="text" 
                value={storeCode}
                onChange={(e) => setStoreCode(e.target.value)}
                placeholder="예: 123456"
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans font-mono"
              />
            </div>

            {/* 설치 주소 & 상세 주소 (한 줄에 묶어 가로 배치) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans leading-tight">
                매장 주소 *
              </span>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="설치 주소 입력"
                  className="w-full sm:w-2/3 rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-805 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                  required
                />
                <input 
                  type="text" 
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="상세주소 입력 (예: 2층)"
                  className="w-full sm:w-1/3 rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-805 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                />
              </div>
            </div>
          </div>

          {/* Row 2: 점주 정보 */}
          <div className="space-y-4 pt-2">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider pb-1 border-b border-stone-300 font-sans">
              <span>점주 정보변경</span>
            </h4>

            {/* 점주 성함 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                점주 성함 *
              </span>
              <input 
                type="text" 
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                required
              />
            </div>

            {/* 사업자 번호 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                사업자 번호
              </span>
              <input 
                type="text" 
                value={businessNumber}
                onChange={(e) => setBusinessNumber(e.target.value)}
                placeholder="예: 1234567890"
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans font-mono"
              />
            </div>

            {/* 등록증 이미지 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans leading-tight">
                등록증 이미지
              </span>
              <div className="flex flex-col sm:flex-row gap-2 w-full items-center">
                <div className="relative w-full">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="admin-cert-upload-input"
                  />
                  <label 
                    htmlFor="admin-cert-upload-input"
                    className="w-full text-center text-xs font-bold bg-[#422B1E]/10 hover:bg-[#422B1E]/20 text-[#422B1E] py-2.5 px-5 rounded-full cursor-pointer transition-all shadow-sm leading-none flex items-center justify-center min-h-[38px] border border-[#422B1E]/30"
                  >
                    {isFileCompressing ? '처리 중...' : businessCertName ? `선택됨: ${businessCertName.substring(0, 20)}...` : '등록증 이미지 변경'}
                  </label>
                </div>
                {businessCertPath && !businessCertName && (
                  <div className="text-[11px] text-stone-600 font-bold shrink-0 whitespace-nowrap">
                    기존 등록증 존재 (<a href={businessCertPath} target="_blank" rel="noopener noreferrer" className="text-[#C5A059] hover:text-[#b08e4d] underline font-semibold">보기</a>)
                  </div>
                )}
              </div>
            </div>

            {/* 연락처 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans font-mono">
                연락처 *
              </span>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="예: 01088745211"
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans font-mono"
                required
              />
            </div>

            {/* 이메일 주소 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans font-mono">
                이메일 주소
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans font-mono"
              />
            </div>

            {/* 비밀번호 변경 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                비밀번호 변경
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="변경 시에만 입력"
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
              />
            </div>
          </div>

          {/* Row 2.5: 라이선스 인증 기간 설정 (1달, 3달, 1년 빠른 세팅) */}
          <div className="space-y-4 pt-2">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider pb-1 border-b border-stone-300 font-sans">
              <span>인증 라이선스 기간 관리</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                  인증 시작일
                </span>
                <input 
                  type="date" 
                  value={licenseStartDate}
                  onChange={(e) => setLicenseStartDate(e.target.value)}
                  className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-805 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
                <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                  인증 종료일
                </span>
                <input 
                  type="date" 
                  value={licenseEndDate}
                  onChange={(e) => setLicenseEndDate(e.target.value)}
                  className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-805 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
                />
              </div>
            </div>
            
            {/* 매장 유형 선택 추가 (솔루션 등급 위) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                매장 유형
              </span>
              <select
                value={storeType}
                onChange={(e) => setStoreType(e.target.value)}
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
              >
                <option value="HASTE_MEMBERSHIP">헤이스트멤버십</option>
                <option value="MEMBERSHIP">멤버십</option>
                <option value="EXECUTIVE">임원</option>
              </select>
            </div>

            {/* 솔루션 등급 선택 추가 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full">
              <span className="text-[10px] font-bold text-white bg-[#422B1E] py-2 px-4 rounded-full w-full sm:w-32 text-center shrink-0 select-none font-sans">
                솔루션 등급
              </span>
              <select
                value={storeGrade}
                onChange={(e) => setStoreGrade(e.target.value)}
                className="w-full rounded-full border border-stone-250 bg-white py-2 px-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
              >
                <option value="STANDARD">베이직</option>
                <option value="PREMIUM">프리미엄</option>
              </select>
            </div>

            {/* 1달, 3달, 1년 빠른 설정 버튼 */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
                  const startStr = kst.toISOString().split('T')[0];
                  
                  const end = new Date(kst.getTime());
                  end.setMonth(end.getMonth() + 1);
                  const endStr = end.toISOString().split('T')[0];
                  
                  setLicenseStartDate(startStr);
                  setLicenseEndDate(endStr);
                }}
                className="px-3 py-1.5 bg-[#422B1E] hover:bg-[#342217] text-[#C5A059] text-[10px] font-extrabold rounded-lg border-0 leading-none cursor-pointer transition-all active:scale-95 whitespace-nowrap font-mono shadow-sm"
              >
                1달 설정
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
                  const startStr = kst.toISOString().split('T')[0];
                  
                  const end = new Date(kst.getTime());
                  end.setMonth(end.getMonth() + 3);
                  const endStr = end.toISOString().split('T')[0];
                  
                  setLicenseStartDate(startStr);
                  setLicenseEndDate(endStr);
                }}
                className="px-3 py-1.5 bg-[#422B1E] hover:bg-[#342217] text-[#C5A059] text-[10px] font-extrabold rounded-lg border-0 leading-none cursor-pointer transition-all active:scale-95 whitespace-nowrap font-mono shadow-sm"
              >
                3달 설정
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
                  const startStr = kst.toISOString().split('T')[0];
                  
                  const end = new Date(kst.getTime());
                  end.setFullYear(end.getFullYear() + 1);
                  const endStr = end.toISOString().split('T')[0];
                  
                  setLicenseStartDate(startStr);
                  setLicenseEndDate(endStr);
                }}
                className="px-3 py-1.5 bg-[#422B1E] hover:bg-[#342217] text-[#C5A059] text-[10px] font-extrabold rounded-lg border-0 leading-none cursor-pointer transition-all active:scale-95 whitespace-nowrap font-mono shadow-sm"
              >
                1년 설정
              </button>
            </div>
          </div>

          {/* Row 3: 메모 */}
          <div className="space-y-4 pt-2">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider pb-1 border-b border-stone-300 font-sans">
              <span>비고 및 가입문의사항</span>
            </h4>
            <div className="flex flex-col gap-1.5 w-full">
              <textarea 
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-2xl border border-stone-250 bg-white p-3.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-sm font-sans"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-stone-300 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-[#C5A059] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isSaving ? '저장 처리 중...' : '정보 저장 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
