import React, { useState, useEffect } from 'react';

interface UseHasteInquiryProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export const useHasteInquiry = ({ isOpen, onSuccess }: UseHasteInquiryProps) => {
  // Form input states
  const [regionName, setRegionName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [capital, setCapital] = useState('');
  const [hasStore, setHasStore] = useState<'없음' | '있음'>('없음');
  const [inquiryPath, setInquiryPath] = useState('');
  const [content, setContent] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status and submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<React.ReactNode | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registeredId, setRegisteredId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fillTestData = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const testNames = ['현우', '다은', '상철', '영희', '지민', '태훈', '예찬'];
    const selectedNameSuffix = testNames[Math.floor(Math.random() * testNames.length)];
    const randomOwnerName = `테스트${selectedNameSuffix}`;
    
    const regions = ['서울시 종로구 삼청로 15', '경기도 성남시 분당구 판교역로 235', '부산시 해운대구 우동 102', '대구시 중구 삼덕동 12'];
    const selectedRegion = regions[Math.floor(Math.random() * regions.length)];
    const inquiryPaths = ['인터넷 검색', '지인 소개', 'SNS / 블로그', '오프라인 매장 방문', '기타'];
    const randomPath = inquiryPaths[Math.floor(Math.random() * inquiryPaths.length)];
    
    setOwnerName(randomOwnerName);
    setPhone(`010` + Math.floor(10000000 + Math.random() * 90000000));
    setEmail(`partner_${randomSuffix}@haste.cafe`);
    setRegionName(selectedRegion);
    setCapital(String(Math.floor(3000 + Math.random() * 15000)));
    setHasStore(Math.random() > 0.5 ? '있음' : '없음');
    setInquiryPath(randomPath);
    setContent(`헤이스트 무인 카페 솔루션 및 카페 가동 도입과 개설 단가에 대한 테스트 문의사항 내용입니다.`);
    setAgreeTerms(true);
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

  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCapital(val);
  };

  const openRegionSearch = () => {
    const scriptId = 'daum-postcode-script';
    const runPostcode = () => {
      // @ts-ignore
      new window.daum.Postcode({
        oncomplete: (data: any) => {
          setRegionName(data.address || data.roadAddress);
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
      setRegionName('');
      setOwnerName('');
      setPhone('');
      setEmail('');
      setCapital('');
      setHasStore('없음');
      setInquiryPath('');
      setContent('');
      setAgreeTerms(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!agreeTerms) {
      newErrors.push('개인정보 수집 및 이용 동의에 체크해 주세요.');
    }

    if (!ownerName.trim()) {
      newErrors.push('점주 성함은 필수 입력 항목입니다.');
    } else {
      const koreanRegex = /^[가-힣\s]+$/;
      if (!koreanRegex.test(ownerName)) {
        newErrors.push('점주 성함은 완전한 한글 음절로만 입력해주십시오. (자음/모음 분체, 숫자, 영문, 특수문자는 주입할 수 없습니다.)');
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

    if (!regionName.trim()) {
      newErrors.push('창업희망지역은 필수 입력 항목입니다. 입력란을 클릭하여 직접 주소를 선택 또는 검색해주세요.');
    }

    if (!capital.trim()) {
      newErrors.push('창업 자본금은 필수 입력 항목입니다.');
    } else {
      const numberRegex = /^[0-9]+$/;
      if (!numberRegex.test(capital)) {
        newErrors.push('창업 자본금은 숫자만 입력 가능합니다.');
      }
    }

    if (!inquiryPath) {
      newErrors.push('문의경로는 필수 선택 항목입니다.');
    }

    if (!content.trim()) {
      newErrors.push('문의내용은 필수 입력 항목입니다.');
    }

    if (newErrors.length > 0) {
      setSubmitError(newErrors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regionName,
          ownerName,
          phone,
          email,
          capital,
          hasStore,
          inquiryPath,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || '상담 문의 등록 중 데이터베이스 처리에 실패했습니다.');
      }

      setRegisteredId(data?.data?.id || String(Date.now()));
      setSubmitSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || '데이터베이스(Cloud DB) 연결 상태 혹은 인증 정보를 다시 점검하여 주십시오.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    regionName,
    setRegionName,
    ownerName,
    setOwnerName,
    phone,
    setPhone,
    email,
    setEmail,
    capital,
    setCapital,
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
  };
};
