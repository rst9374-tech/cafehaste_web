import { useState } from 'react';
import { useImageUpload } from './use_image_upload';

export const useHastePayment = (user: any, fetchLicenseData: () => void) => {
  const [loading, setLoading] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [pendingMonths, setPendingMonths] = useState<number>(3);
  const { processAndUpload } = useImageUpload();

  const uStoreCode = user.store_code || user.storeCode || '';
  const uStoreName = user.storeName || user.store_name || '헤이스트 카페 점포';
  const uOwnerName = user.ownerName || user.owner_name || '점주';
  const uEmail = user.email || 'N/A';
  const uPhone = user.phone || 'N/A';
  const uAddress = user.address || 'N/A';

  const handlePayment = (months: number) => {
    setPendingMonths(months);
    setIsAgreementOpen(true);
  };

  const openPaymentProcess = (months: number, agreementUrl: string) => {
    const IMP = (window as any).IMP;
    if (!IMP) {
      alert('결제 모듈을 로딩 중입니다. 잠시 후 다시 클릭해 주세요.');
      return;
    }
    IMP.init('imp31650028');
    const merchantUid = `HST-SUB-${uStoreCode}-${Date.now()}`;
    
    let amount = 55000;
    if (Number(months) === 6) amount = 313500;
    else if (Number(months) === 12) amount = 594000;
    
    const label = Number(months) === 1 ? '월 정기' : `${months}개월 정기`;

    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: merchantUid,
      name: `${uStoreName} 솔루션 구독 결제 (${label})`,
      amount: amount,
      buyer_email: uEmail,
      buyer_name: uOwnerName,
      buyer_tel: uPhone,
      buyer_addr: uAddress
    }, async (rsp: any) => {
      if (rsp.success) {
        setLoading(true);
        try {
          const res = await fetch('/api/membership/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              impUid: rsp.imp_uid, 
              merchantUid: rsp.merchant_uid, 
              storeCode: uStoreCode, 
              amount,
              months,
              documentUrl: agreementUrl
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const bufferDays = Number(months) === 12 ? 15 : (Number(months) === 1 ? 0 : 7);
            const labelText = Number(months) === 1 ? '월 정기구독' : `${months}개월 정기구독`;
            const bufferText = bufferDays > 0 ? `(+${bufferDays}일 연장 버퍼)` : '';
            alert(`신용카드 ${labelText} 결제 및 ${months}개월${bufferText} 라이선스 승인이 완료되었습니다!\n합성 완료된 약정서 사본은 가입자 기기 다운로드 및 내 정보 페이지에 영구 저장됩니다.`);
            
            const cached = localStorage.getItem('haste_logged_user');
            if (cached) {
              const parsed = JSON.parse(cached);
              parsed.approval_status = '인증 완료';
              parsed.approvalStatus = '인증 완료';
              parsed.agreement_document_url = agreementUrl;
              parsed.agreementDocumentUrl = agreementUrl;
              localStorage.setItem('haste_logged_user', JSON.stringify(parsed));
              window.location.reload();
            } else {
              fetchLicenseData();
            }
          } else {
            alert(data.message || '결제 검증 중 오류가 발생했습니다.');
          }
        } catch (err: any) {
          alert('서버 검증 실패: ' + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        alert(`결제 승인에 실패하였습니다. 사유: ${rsp.error_msg}`);
      }
    });
  };

  const handleAgreementComplete = async (file: File) => {
    setIsAgreementOpen(false);
    setLoading(true);
    try {
      const uploadedUrl = await processAndUpload(file, {
        maxWidth: 1024,
        maxHeight: 1500,
        quality: 0.9,
        boardName: 'membership',
        categoryId: 'agreement',
        storeCode: uStoreCode
      });
      openPaymentProcess(pendingMonths, uploadedUrl);
    } catch (err: any) {
      alert('약정서 업로드 실패: ' + err.message);
      setLoading(false);
    }
  };

  const handleJoiningFeePayment = () => {
    const IMP = (window as any).IMP;
    if (!IMP) {
      alert('결제 모듈을 로딩 중입니다. 잠시 후 다시 클릭해 주세요.');
      return;
    }
    IMP.init('imp31650028');
    const merchantUid = `HST-JOIN-${uStoreCode}-${Date.now()}`;
    
    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: merchantUid,
      name: `${uStoreName} 가입비 결제`,
      amount: 330000,
      buyer_email: uEmail,
      buyer_name: uOwnerName,
      buyer_tel: uPhone,
      buyer_addr: uAddress
    }, (rsp: any) => {
      if (rsp.success) {
        localStorage.setItem(`haste_payment_signup_${uStoreCode}`, 'paid');
        alert('가입비 33만원(VAT포함) 결제가 완료되었습니다.');
        window.location.reload();
      } else {
        alert(`결제 실패: ${rsp.error_msg}`);
      }
    });
  };

  const handleMonthlySubPayment = (agreementDocumentUrl: string) => {
    const IMP = (window as any).IMP;
    if (!IMP) {
      alert('결제 모듈을 로딩 중입니다. 잠시 후 다시 클릭해 주세요.');
      return;
    }
    IMP.init('imp31650028');
    const merchantUid = `HST-MON-${uStoreCode}-${Date.now()}`;
    
    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: merchantUid,
      name: `${uStoreName} 월 구독 결제`,
      amount: 55000,
      buyer_email: uEmail,
      buyer_name: uOwnerName,
      buyer_tel: uPhone,
      buyer_addr: uAddress
    }, async (rsp: any) => {
      if (rsp.success) {
        setLoading(true);
        try {
          const res = await fetch('/api/membership/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              impUid: rsp.imp_uid, 
              merchantUid: rsp.merchant_uid, 
              storeCode: uStoreCode, 
              amount: 55000,
              months: 1,
              documentUrl: agreementDocumentUrl || ''
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            localStorage.setItem(`haste_payment_monthly_${uStoreCode}`, 'paid');
            alert('월 구독 결제 및 라이선스 갱신(5.5만원(VAT포함))이 완료되었습니다.');
            window.location.reload();
          } else {
            alert(data.message || '결제 검증 오류가 발생했습니다.');
          }
        } catch (err: any) {
          alert('서버 검증 실패: ' + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        alert(`결제 실패: ${rsp.error_msg}`);
      }
    });
  };

  return {
    loading,
    setLoading,
    isAgreementOpen,
    setIsAgreementOpen,
    isPlansModalOpen,
    setIsPlansModalOpen,
    pendingMonths,
    setPendingMonths,
    handlePayment,
    handleAgreementComplete,
    handleJoiningFeePayment,
    handleMonthlySubPayment,
  };
};
