import { useState, useEffect } from 'react';
import { DEFAULT_MOCK_CONSULTATIONS } from './admin_hook_billing';

export const useAdminConsultations = (
  showTemporaryToast: (msg: string) => void,
  showTemporaryError: (msg: string) => void
) => {
  const [cloudConsultations, setCloudConsultations] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('haste_mock_consultations');
      return saved ? JSON.parse(saved) : DEFAULT_MOCK_CONSULTATIONS;
    } catch {
      return DEFAULT_MOCK_CONSULTATIONS;
    }
  });

  const [isFetchingConsultations, setIsFetchingConsultations] = useState(false);
  const [consultationsError, setConsultationsError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('haste_mock_consultations', JSON.stringify(cloudConsultations));
  }, [cloudConsultations]);

  const fetchCloudConsultations = async () => {
    setIsFetchingConsultations(true);
    setConsultationsError(null);
    try {
      const response = await fetch('/api/consultations');
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) throw new Error('Offline Mode');
      const data = await response.json();
      if (data.success) {
        setCloudConsultations(data.consultations || []);
      } else {
        setConsultationsError(data.message || '상담 데이터 조회 실패.');
      }
    } catch (err) {
      if (cloudConsultations.length === 0) setCloudConsultations(DEFAULT_MOCK_CONSULTATIONS);
    } finally {
      setIsFetchingConsultations(false);
    }
  };

  const handleUpdateCloudConsultationStatus = async (id: number, newStatus: '상담신청' | '상담완료') => {
    try {
      const response = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setCloudConsultations(prev => prev.map(c => c.id === id ? { ...c, approvalStatus: newStatus } : c));
        await fetchCloudConsultations();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCloudDeleteConsultation = async (id: any, skipConfirm = false) => {
    if (skipConfirm || confirm('상담신청 데이터를 클라우드 DB에서 영구히 삭제처리하시겠습니까?')) {
      try {
        const deletedConsultation = cloudConsultations.find(c => c.id === id);
        const response = await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          setCloudConsultations(prev => prev.filter(c => c.id !== id));
          if (deletedConsultation) {
            const savedConsults = localStorage.getItem('haste_consultations_db');
            if (savedConsults) {
              const parsed = JSON.parse(savedConsults);
              const filtered = parsed.filter((c: any) => !(c.phone === deletedConsultation.phone && c.ownerName === deletedConsultation.ownerName));
              localStorage.setItem('haste_consultations_db', JSON.stringify(filtered));
            }
          }
          showTemporaryToast('상담 데이터가 영구 삭제되었습니다.');
          await fetchCloudConsultations();
        }
      } catch (err: any) {
        showTemporaryError(err.message);
      }
    }
  };

  return {
    cloudConsultations,
    setCloudConsultations,
    isFetchingConsultations,
    consultationsError,
    fetchCloudConsultations,
    handleUpdateCloudConsultationStatus,
    handleCloudDeleteConsultation
  };
};
