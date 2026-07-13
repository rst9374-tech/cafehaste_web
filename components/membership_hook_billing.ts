import { useState, useEffect } from 'react';
import { HasteMember, KakaoAlert } from './membership_types';

export const useHasteBilling = () => {
  // Members List Database State
  const [members, setMembers] = useState<HasteMember[]>([]);
  
  // KakaoTalk Active Alerts simulation tray State
  const [kakaoAlerts, setKakaoAlerts] = useState<KakaoAlert[]>([]);
  const [activeToast, setActiveToast] = useState<KakaoAlert | null>(null);

  // Switch between 'SIGNUP' layout and 'ADMIN' dashboard layout
  const [viewTab, setViewTab] = useState<'SIGNUP' | 'ADMIN'>('SIGNUP');

  // 1. Membership Form Fields State
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);

  // UI Flow Control States
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [lastRegisteredMember, setLastRegisteredMember] = useState<HasteMember | null>(null);
  
  // Filter for Admin Panel
  const [adminFilter, setAdminFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  // Initialize Database on mount & load
  useEffect(() => {
    const saved = localStorage.getItem('haste_membership_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((m: any) => m.id !== 'HST-M101' && m.id !== 'HST-M102' && m.id !== 'HST-M103' && m.id !== 'HST-M104');
        setMembers(filtered);
        localStorage.setItem('haste_membership_db', JSON.stringify(filtered));
      } catch (e) {
        setMembers([]);
        localStorage.setItem('haste_membership_db', JSON.stringify([]));
      }
    } else {
      setMembers([]);
      localStorage.setItem('haste_membership_db', JSON.stringify([]));
    }
  }, []);

  // Sync to database helper
  const syncDatabase = (updated: HasteMember[]) => {
    setMembers(updated);
    localStorage.setItem('haste_membership_db', JSON.stringify(updated));
    window.dispatchEvent(new Event('haste_membership_updated'));
  };

  // Trigger a magnificent KakaoTalk Styled Alert on Screen
  const sendKakaoTalkNotification = (type: 'BILLING_SUCCESS' | 'BILLING_FAIL_ADMIN' | 'SUSPEND_ALERT', title: string, body: string, targetUser: string) => {
    const newAlert: KakaoAlert = {
      id: `KK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      body,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      targetUser
    };
    
    setKakaoAlerts(prev => [newAlert, ...prev]);
    setActiveToast(newAlert);
    
    // Auto collapse banner after 6 seconds
    setTimeout(() => {
      setActiveToast(prev => prev?.id === newAlert.id ? null : prev);
    }, 6000);
  };

  // Registration Form Submission Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('개인정보 수집 및 자동결제 이용 동의가 필수 조건입니다.');
      return;
    }

    if (!storeName || !address || !ownerName || !phone || !email) {
      alert('매장 정보, 매장주소 및 연락처 정보를 모두 기입해 주십시오.');
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName,
          ownerName,
          phone,
          email,
          address,
        }),
      });

      const data = await response.json();
      
      let dbAssignedId = `HST-M${100 + members.length + 1}`;
      let usingCloud = false;

      if (response.ok && data.success) {
        dbAssignedId = `DB-HST-${data.data.id}`;
        usingCloud = true;
        console.log('[Cloud SQL sync] Successfully registered to live Cloud Database:', data.data);
      } else {
        console.warn('[Cloud SQL fallback] API responded with error, falling back to offline simulator storage:', data.message);
      }

      const newMember: HasteMember = {
        id: dbAssignedId,
        storeName,
        ownerName,
        phone,
        email,
        address,
        joinDate: new Date().toISOString().split('T')[0],
        joinDateTime: new Date().toISOString(),
        cardNo: '상담 후 안전 등록',
        cardCompany: '사후 등록 협의',
        joiningFeePaid: true,
        monthlyFeePaid: true,
        unpaidMonths: 0,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        registrationStatus: 'ACTIVE',
        approvalStatus: '요청'
      };

      const updated = [...members, newMember];
      syncDatabase(updated);
      setLastRegisteredMember(newMember);
      setRegisterSuccess(true);

      const ownerMessage = `[헤이스트 플랫폼 솔루션 멤버십 가입 신청 완료]
      
안녕하세요 ${ownerName} 사장님, 스마트 무인 파트너 헤이스트입니다. 
사장님의 주권 제어 솔루션 가입 신청서가 헤이스트 전산망에 안전하게 등록 및 접수되었습니다.

■ 매장 및 전산망 등록: ${usingCloud ? '☁️ 데이터베이스 라이브 실시간 등록 연동' : '⚙️ 로컬 오프라인 시뮬레이터 전산 대장'}
■ 매장명: ${storeName}
■ 가입비 수납 방식: 30만원 (최초 1회 - 가입 후 상담을 통해 수납 진행)
■ 동반 월 서버회비: 5만원 (매달 지정 계좌 자동 납부 또는 상담 시 카드 결제 연동)
■ 첫 결제수단: 상담 후 보안 결제 연동 예정
■ 가입 적용일: ${newMember.joinDate}

헤이스트 안내 전화를 통해 약정서 작성 및 프로그램 설치/세팅이 일대일 밀착 지원되며, 완료 단계 직후 상시 가동권이 즉시 활성화됩니다. 가입을 축하드립니다!`;

      sendKakaoTalkNotification('BILLING_SUCCESS', '헤이스트 솔루션 가입 신청 완료', ownerMessage, `${ownerName} 사장님 (${storeName})`);

      setStoreName('');
      setAddress('');
      setOwnerName('');
      setPhone('');
      setEmail('');
      setConsent(false);

    } catch (err: any) {
      console.error('[Cloud SQL connection error] Falling back to offline client mode:', err);
      const newMember: HasteMember = {
        id: `HST-M${100 + members.length + 1}`,
        storeName,
        ownerName,
        phone,
        email,
        address,
        joinDate: new Date().toISOString().split('T')[0],
        joinDateTime: new Date().toISOString(),
        cardNo: '상담 후 안전 등록',
        cardCompany: '사후 등록 협의',
        joiningFeePaid: true,
        monthlyFeePaid: true,
        unpaidMonths: 0,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        registrationStatus: 'ACTIVE',
        approvalStatus: '요청'
      };

      const updated = [...members, newMember];
      syncDatabase(updated);
      setLastRegisteredMember(newMember);
      setRegisterSuccess(true);

      const ownerMessage = `[헤이스트 플랫폼 가입 완료 (연동 백업)]
      
안녕하세요 ${ownerName} 사장님, 스마트 무인 파트너 헤이스트입니다. 
솔루션 가입 신청이 성공적으로 접수되었습니다. (네트워크 지연으로 인해 로컬 저장소에 우선 백업 적용)

■ 매장명: ${storeName}
■ 가입비 수납 방식: 30만원 (최초 1회)
■ 가입 적용일: ${newMember.joinDate}`;

      sendKakaoTalkNotification('BILLING_SUCCESS', '헤이스트 정기 가입 완료 (로커망)', ownerMessage, `${ownerName} 사장님 (${storeName})`);
    } finally {
      setIsRegistering(false);
    }
  };

  // Simulate Monthly Auto-Debit Cycle Trigger
  const triggerAutoBillingCycle = () => {
    let failCount = 0;
    let successCount = 0;

    const updated = members.map(member => {
      if (member.registrationStatus === 'SUSPENDED') return member;

      const billingSucceeded = Math.random() > 0.25;

      if (billingSucceeded) {
        successCount++;
        
        const successMessage = `[헤이스트 정기 서버 회비 결제 완료]
        
안녕하세요 ${member.ownerName} 사장님. 
헤이스트 자동 관리 솔루션 이용료가 성공적으로 자동 결제되었습니다.

■ 매장명: ${member.storeName}
■ 납부내역: 2026년 5월 대비 전산 가동료
■ 결제 금액: 5만원
■ 결제수단: ${member.cardCompany}
■ 자동 결제시각: ${new Date().toLocaleString('ko-KR')}

정상 결제 확인에 따라 점포 및 솔루션 패키지 커피머신 로컬서버 가동 시 필요한 라이선스가 30일 연계 연장되었습니다.`;

        sendKakaoTalkNotification('BILLING_SUCCESS', '헤이스트 정기회비 자동결제 성공', successMessage, `${member.ownerName} 사장님 (${member.storeName})`);
        
        return {
          ...member,
          monthlyFeePaid: true,
          unpaidMonths: 0,
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      } else {
        failCount++;
        const newUnpaidMonths = member.unpaidMonths + 1;
        const newStatus = newUnpaidMonths >= 2 ? 'SUSPENDED' : 'ACTIVE';
        
        const adminAlertMessage = `[회비 미납 비상 수신 - 본부 수신전산]
        
헤이스트 대표관리자님, 헤이스트 정수 전산 과금 회비 청구가 잔액 부족/도난 정지 등의 이유로 승인 거절되었습니다. 

■ 대상 가입점: ${member.storeName}
■ 점주 성함: ${member.ownerName} 사장님 (${member.phone})
■ 미납 금액: ${(newUnpaidMonths * 5)}만원
■ 등록 카드사: ${member.cardCompany}
■ 위반 대응단계: ${newStatus === 'SUSPENDED' ? '⚠️ 솔루션 가동 제한 단계 진입' : '⚠️ 1차 미납 안내 단계'}

해당 가입점에 비상 가입 계약해지 및 미납 변제 안내 독려 알림톡이 긴급 발급되었습니다.`;

        sendKakaoTalkNotification('BILLING_FAIL_ADMIN', '⚠️ [경고] 회비 미납 점포 카톡 경보 수신', adminAlertMessage, '나 (Haste 총괄 본부장)');
        
        const memberOverdueMessage = `[헤이스트 결제 실패 및 장기 체납 경보]
        
안녕하세요 ${member.ownerName} 점주님.
귀점의 헤이스트 스마트 솔루션 월 회비 정기 청구가 등록 카드의 승인 불가 오류로 인해 거부처리 되었습니다.

■ 미납 금액: 5만원
■ 조치 사항: 미정산이 지속될 경우 헤이스트 솔루션 가동이 일시 제한될 수 있습니다.

불이익을 방지하기 위해 신속히 하단의 관리자 전산에서 변경 등록 또는 정산을 수납 완료해주시기 바랍니다.`;

        sendKakaoTalkNotification('SUSPEND_ALERT', '⚠️ [체납 알림] 정기회비 승인 오류 알림', memberOverdueMessage, `${member.ownerName} 사장님`);

        return {
          ...member,
          monthlyFeePaid: false,
          unpaidMonths: newUnpaidMonths,
          registrationStatus: newStatus
        };
      }
    });

    syncDatabase(updated);
    alert(`정기 회기 오토배치 청구가 완료되었습니다.\n- 승인 성공: ${successCount}건\n- 승인 실패(체납 발생): ${failCount}건\n우측 모바일 카카오톡 수신 알림함을 즉시 가늠해 보세요!`);
  };

  const togglePaymentStatus = (id: string) => {
    const updated = members.map(m => {
      if (m.id === id) {
        const isPaid = !m.monthlyFeePaid;
        const unpaid = isPaid ? 0 : 1;
        const status = unpaid >= 2 ? 'SUSPENDED' : 'ACTIVE';
        
        if (!isPaid) {
          const alarmText = `[수동 미납 상태 전환 알림]
          
관리자 직권 심사로 [${m.storeName}] 매장의 결제 상태가 미납 상태로 수동 전환되었습니다.
- 미납금액: 5만원
- 카카오톡 경보가 실시간 통보되었습니다.`;
          sendKakaoTalkNotification('BILLING_FAIL_ADMIN', '⚠️ 직권 미납 전환 카톡 수신', alarmText, '나 (Haste 총괄 본부장)');
        } else {
          const successMsgText = `[전산 정산 처리 완료]
          
${m.ownerName} 사장님. 헤이스트 확인을 통해 미납된 회비 5만원의 이체가 완료되어 전산망이 정상 복구되었습니다.
- 대상점: ${m.storeName}
- 상태: ACTIVE 복구`;
          sendKakaoTalkNotification('BILLING_SUCCESS', '✓ 체납회비 직접 납부 정산 완료', successMsgText, '나 (Haste 총괄 본부장)');
        }

        return {
          ...m,
          monthlyFeePaid: isPaid,
          unpaidMonths: unpaid,
          registrationStatus: status as any
        };
      }
      return m;
    });
    syncDatabase(updated);
  };

  const deleteMember = (id: string) => {
    if (confirm('이 사장님의 가입 계정을 헤이스트 통합 연동망에서 영구 제명하시겠습니까?')) {
      const updated = members.filter(m => m.id !== id);
      syncDatabase(updated);
    }
  };

  const filteredMembers = members.filter(m => {
    if (adminFilter === 'ALL') return true;
    if (adminFilter === 'PAID') return m.monthlyFeePaid === true;
    if (adminFilter === 'UNPAID') return m.monthlyFeePaid === false;
    return true;
  });

  const totalCount = members.length;
  const paidCount = members.filter(m => m.monthlyFeePaid).length;
  const unpaidCount = members.filter(m => !m.monthlyFeePaid).length;

  return {
    members,
    kakaoAlerts,
    activeToast,
    setActiveToast,
    viewTab,
    setViewTab,
    storeName,
    setStoreName,
    address,
    setAddress,
    ownerName,
    setOwnerName,
    phone,
    setPhone,
    email,
    setEmail,
    consent,
    setConsent,
    isRegistering,
    registerSuccess,
    setRegisterSuccess,
    lastRegisteredMember,
    adminFilter,
    setAdminFilter,
    handleRegisterSubmit,
    triggerAutoBillingCycle,
    togglePaymentStatus,
    deleteMember,
    filteredMembers,
    totalCount,
    paidCount,
    unpaidCount,
  };
};
