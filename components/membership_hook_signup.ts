import React, { useState, useEffect } from 'react';
import { useImageUpload } from './use_image_upload';


interface UseHasteSignUpProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export const useHasteSignUp = ({ isOpen, onSuccess }: UseHasteSignUpProps) => {
  // Form input states
  const [storeName, setStoreName] = useState('');
  const [storeCode, setStoreCode] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [businessNumber, setBusinessNumber] = useState('');
  const [businessCertFile, setBusinessCertFile] = useState<File | null>(null);
  const [businessCertBase64, setBusinessCertBase64] = useState<string>('');
  const [storeType, setStoreType] = useState<'일반' | '프리미엄'>('프리미엄');
  const { isFileCompressing, setIsFileCompressing, resizeAndCompressImage } = useImageUpload();

  // Status and submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registeredId, setRegisteredId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isAllowedExt = allowedExtensions.includes(fileExt);
      const isImageMime = file.type.startsWith('image/');

      if (!isImageMime || !isAllowedExt) {
        alert('사업자등록증은 이미지 파일(PNG, JPG, JPEG, WEBP, GIF)만 업로드 가능합니다.\nPDF, ZIP, HWP 등 비-이미지 형식은 지원하지 않습니다.');
        e.target.value = '';
        return;
      }
      
      const maxSizeLimit = 20 * 1024 * 1024;
      if (file.size > maxSizeLimit) {
        alert(`해당 사업자등록증 이미지 파일의 크기가 너무 큽니다 (${(file.size / (1024 * 1024)).toFixed(1)}MB).\n원활한 가입 신청 및 서버 전송을 위해 20MB 이하의 이미지 전용 파일을 업로드해 주세요.`);
        e.target.value = '';
        return;
      }

      setBusinessCertFile(file);

      try {
        const compressedBase64 = await resizeAndCompressImage(file, 1200, 1200, 0.82);
        setBusinessCertBase64(compressedBase64);
      } catch (err) {
        console.error('[Base64 Compressor Error] Client compression failed, falling back to original:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setBusinessCertBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const filtered = val.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');
    setStoreName(filtered);
  };

  const handleStoreCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setStoreCode(val);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleOwnerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const filtered = val.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');
    setOwnerName(filtered);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPhone(val);
  };

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setBusinessNumber(val);
  };

  const openAddressSearch = () => {
    const scriptId = 'daum-postcode-script';
    const runPostcode = () => {
      // @ts-ignore
      new window.daum.Postcode({
        oncomplete: (data: any) => {
          setAddress(data.address || data.roadAddress);
        }
      }).open();
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = runPostcode;
      script.onerror = () => alert('우편번호 서비스 스크립트 로드에 실패했습니다.');
      document.body.appendChild(script);
    } else {
      runPostcode();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsAdmin(localStorage.getItem('haste_admin_auth') === 'true');
      setSubmitSuccess(false);
      setSubmitError(null);
      setStoreName('');
      setStoreCode('');
      setAddress('');
      setAddressDetail('');
      setOwnerName('');
      setPhone('');
      setEmail('');
      setContent('');
      setAgreeTerms(false);
      setBusinessNumber('');
      setBusinessCertFile(null);
      setBusinessCertBase64('');
      setIsFileCompressing(false);
      setStoreType('프리미엄');
    }
  }, [isOpen]);

  const fillTestData = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const storeNames = ['역삼점', '상암점', '여의도점', '제주점', '광안리점', '원효로점'];
    const selectedStore = storeNames[Math.floor(Math.random() * storeNames.length)];
    
    const testNames = ['점주', '길동', '혁구', '민혁', '지원', '혜수', '재우'];
    const selectedNameSuffix = testNames[Math.floor(Math.random() * testNames.length)];
    const randomOwnerName = `테스트${selectedNameSuffix}`;
    
    setStoreName(`테스트헤이스트${selectedStore}`);
    setStoreCode(String(Math.floor(100000 + Math.random() * 900000)));
    setPassword('1234');
    setAddress(`서울시 마포구 독막로 ${Math.floor(10 + Math.random() * 200)}길`);
    setAddressDetail('2층 201호');
    setOwnerName(randomOwnerName);
    setPhone(`010` + Math.floor(10000000 + Math.random() * 90000000));
    setEmail(`test_${randomSuffix}@haste.cafe`);
    setBusinessNumber(String(Math.floor(1000000000 + Math.random() * 9000000000)));
    // Provide a 1x1 transparent GIF as a dummy business certificate for testing
    const dummyBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    setBusinessCertBase64(dummyBase64);
    setBusinessCertFile(new File([''], 'test_business_cert.gif', { type: 'image/gif' }));
    setContent(`헤이스트 솔루션 신규 매장 자동 가입 연동 테스트 내용입니다. (순번: ${randomSuffix})`);
    setAgreeTerms(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!agreeTerms) {
      newErrors.push('개인정보 정보제공 및 자율 계약 조건에 동의해 주세요.');
    }

    if (!storeName.trim()) {
      newErrors.push('매장명은 필수 입력 항목입니다.');
    } else {
      const koreanRegex = /^[가-힣\s]+$/;
      if (!koreanRegex.test(storeName)) {
        newErrors.push('매장명은 완전한 한글 음절로만 입력가능합니다. (자음/모음 분체, 숫자, 영문, 특수문자는 입력 불가능합니다.)');
      }
    }

    if (!storeCode.trim()) {
      newErrors.push('매장 코드는 필수 입력 항목입니다.');
    } else {
      const numberRegex = /^[0-9]+$/;
      if (!numberRegex.test(storeCode)) {
        newErrors.push('매장 코드는 숫자만 입력 가능합니다.');
      }
      if (storeCode.length !== 6) {
        newErrors.push('매장 코드는 정확히 6자리 숫자여야 합니다.');
      }
    }

    if (!password.trim()) {
      newErrors.push('비밀번호는 필수 입력 항목입니다.');
    } else if (password.length < 4) {
      newErrors.push('비밀번호는 최소 4자리 이상이어야 합니다.');
    }

    if (!address.trim()) {
      newErrors.push('매장주소는 필수 입력 항목입니다. 입력창을 클릭하여 정확하게 검색해주세요.');
    }

    if (!ownerName.trim()) {
      newErrors.push('점주 성함은 필수 입력 항목입니다.');
    } else {
      const koreanRegex = /^[가-힣\s]+$/;
      if (!koreanRegex.test(ownerName)) {
        newErrors.push('점주 성함은 완전한 한글 음절로만 입력가능합니다. (자음/모음 분체, 숫자, 영문, 특수문자는 입력 불가능합니다.)');
      }
    }

    if (!phone.trim()) {
      newErrors.push('연락처는 필수 입력 항목입니다.');
    } else {
      const numberRegex = /^[0-9]+$/;
      if (!numberRegex.test(phone)) {
        newErrors.push('연락처는 숫자만 입력 가능합니다.');
      }
      if (phone.length < 9 || phone.length > 11) {
        newErrors.push('연락처는 9~11자리 숫자여야 합니다.');
      }
    }

    if (!email.trim()) {
      newErrors.push('이메일은 필수 입력 항목입니다.');
    }

    if (!businessNumber.trim()) {
      newErrors.push('사업자등록번호는 필수 입력 항목입니다.');
    } else {
      const numberRegex = /^[0-9]+$/;
      if (!numberRegex.test(businessNumber)) {
        newErrors.push('사업자등록번호는 숫자만 입력 가능합니다.');
      }
      if (businessNumber.length !== 10) {
        newErrors.push('사업자등록번호는 10자리 숫자여야 합니다.');
      }
    }

    const isTestAccount = ownerName.trim().startsWith('테스트') || 
                          storeName.trim().startsWith('테스트') || 
                          ownerName.toLowerCase().includes('test') || 
                          storeName.toLowerCase().includes('test') ||
                          email.toLowerCase().includes('test') ||
                          address.toLowerCase().includes('test') ||
                          address.includes('테스트');

    if (!businessCertBase64) {
      newErrors.push('사업자등록증 첨부 파일은 필수 입력 항목입니다.');
    }

    if (!content.trim()) {
      newErrors.push('문의사항(요청사항)은 모든 항목 필수 방침에 따라 필수 입력 항목입니다.');
    }

    if (newErrors.length > 0) {
      setSubmitError(newErrors.join(' / '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/owner-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName,
          storeCode: isTestAccount ? `storex${storeCode}` : `store${storeCode}`,
          password,
          address: addressDetail.trim() ? `${address} ${addressDetail.trim()}` : address,
          ownerName,
          phone,
          email,
          businessNumber,
          businessCertBase64,
          content,
          storeType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || '가입신청 처리 중 데이터베이스 에러가 발생했습니다.');
      }

      setRegisteredId(data.data.id);
      setSubmitSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || '데이터베이스 연결에 장애가 발생했습니다. 잠시 후 다시 조치해주십시오.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return {
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
    setIsFileCompressing,
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
  };
};
