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
  const [storeGrade, setStoreGrade] = useState(matchedLicense?.storeGrade || (member.storeType === '프리미엄' ? 'PREMIUM' : 'STANDARD'));
  const [storeType, setStoreType] = useState(member.storeType || '일반');

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
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div 
        onClick={onClose}
        className="fixed inset-0 cursor-pointer" 
      />
      <div className="relative bg-[#FAF4EB] border-2 border-stone-400 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#422B1E] text-[#C5A059] px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <h3 className="font-serif font-black text-sm tracking-tight text-white">
              멤버 정보 수정대장 <span className="font-mono text-xs text-[#C5A059]">({member.id})</span>
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-stone-300 hover:text-white transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
          {/* Row 1: 매장 정보 */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center gap-1.5">
              <span>🏢</span>
              <span>매장 기본 정보</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">매장명 *</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 font-sans">매장 코드</label>
                <input 
                  type="text" 
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  placeholder="예: 123456"
                  className="w-full text-xs font-mono font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">설치 주소 *</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">상세 주소 (오른쪽)</label>
                <input 
                  type="text" 
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="예: 2층 201호"
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                />
              </div>
            </div>
          </div>

          {/* Row 2: 점주 정보 */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center gap-1.5">
              <span>👤</span>
              <span>점주 정보변경</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">점주 성함 *</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">사업자등록번호</label>
                <input 
                  type="text" 
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  placeholder="예: 1234567890"
                  className="w-full text-xs font-mono font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">사업자등록증 첨부 및 수정</label>
                <div className="flex flex-col gap-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="admin-cert-upload-input"
                  />
                  <label 
                    htmlFor="admin-cert-upload-input"
                    className="w-full text-center text-[10px] font-bold bg-[#422B1E] hover:bg-[#5b3d2b] text-white py-2 px-3 rounded-lg cursor-pointer transition-all shadow-xs leading-none flex items-center justify-center min-h-[32px]"
                  >
                    {isFileCompressing ? '처리 중...' : businessCertName ? `선택됨: ${businessCertName.substring(0, 15)}` : '등록증 이미지 변경'}
                  </label>
                  {businessCertPath && !businessCertName && (
                    <div className="text-[9px] text-stone-500 truncate text-center">
                      기존 등록증 존재 (<a href={businessCertPath} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-semibold">보기</a>)
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">연락처 *</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 01088745211"
                  className="w-full text-xs font-mono font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">이메일 주소</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-mono font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">점주 비밀번호 변경</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="변경 시에만 입력"
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                />
              </div>
            </div>
          </div>

          {/* Row 2.5: 라이선스 인증 기간 설정 (1달, 3달, 1년 빠른 세팅) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center gap-1.5">
              <span>📅</span>
              <span>인증 라이선스 기간 관리</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">인증 시작일</label>
                <input 
                  type="date" 
                  value={licenseStartDate}
                  onChange={(e) => setLicenseStartDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-[#422B1E] focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 font-sans">인증 종료일</label>
                <input 
                  type="date" 
                  value={licenseEndDate}
                  onChange={(e) => setLicenseEndDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-[#422B1E] focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
                />
              </div>
            </div>
            
            {/* 매장 유형 선택 추가 (솔루션 등급 위) */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1">매장 유형</label>
              <select
                value={storeType}
                onChange={(e) => setStoreType(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
              >
                <option value="프리미엄">헤이스트멤버십</option>
                <option value="일반">멤버십</option>
                <option value="직영점">직영점</option>
                <option value="임원">임원</option>
              </select>
            </div>

            {/* 솔루션 등급 선택 추가 */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1">솔루션 등급</label>
              <select
                value={storeGrade}
                onChange={(e) => setStoreGrade(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E]"
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
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-extrabold rounded-lg border border-stone-305 leading-none cursor-pointer transition-all active:scale-95 whitespace-nowrap"
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
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-extrabold rounded-lg border border-stone-305 leading-none cursor-pointer transition-all active:scale-95 whitespace-nowrap"
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
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-extrabold rounded-lg border border-stone-305 leading-none cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                1년 설정
              </button>
            </div>
          </div>

          {/* Row 3: 메모 */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-extrabold text-[#422B1E] uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center gap-1.5">
              <span>💬</span>
              <span>비고 및 가입문의사항</span>
            </h4>
            <div>
              <textarea 
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] resize-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-stone-300 text-stone-500 rounded-xl font-bold text-xs hover:bg-stone-100 hover:text-stone-850 transition-colors cursor-pointer select-none"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl font-black text-xs transition-colors cursor-pointer shadow-sm select-none"
            >
              {isSaving ? '저장 처리 중...' : '정보 저장 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
