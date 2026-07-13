import { useState } from 'react';
import { HasteMember } from '../membership_types';

export const DEFAULT_MOCK_CLOUD_MEMBERS = [
  {
    id: 1,
    storeName: '하스테 카페 강남본점',
    ownerName: '홍길동',
    phone: '010-1234-5678',
    email: 'hong@haste.cafe',
    joinDate: '2026-05-20',
    approvalStatus: '승인',
    storeType: 'PREMIUM',
    isApproved: 1,
  },
  {
    id: 2,
    storeName: '하스테 카페 홍대직영점',
    ownerName: '김철수',
    phone: '010-9876-5432',
    email: 'kim@haste.cafe',
    joinDate: '2026-05-25',
    approvalStatus: '요청',
    storeType: 'STANDARDBASE',
    isApproved: 0,
  }
];

export const DEFAULT_MOCK_CONSULTATIONS = [
  {
    id: 1,
    name: '이영희',
    phone: '010-5555-5555',
    region: '서울 마포구',
    experience: '경험 있음',
    budget: '5천만원 ~ 1억원',
    join_time: '2026-05-28T14:30:00.000Z',
    approval_status: '상담신청'
  },
  {
    id: 2,
    name: '박민수',
    phone: '010-6666-6666',
    region: '경기 수원시',
    experience: '경험 없음',
    budget: '1억원 이상',
    join_time: '2026-05-29T10:15:00.000Z',
    approval_status: '상담완료'
  }
];

export const DEFAULT_MOCK_CATEGORIES = [
  { id: 'AMERICANO', name: '아메리카노', category_code: 'AMERICANO' },
  { id: 'COFFEE_LATTE', name: '커피 라떼', category_code: 'COFFEE_LATTE' },
  { id: 'ADE_ETC', name: '에이드/주스', category_code: 'ADE_ETC' },
  { id: 'MILK_LATTE', name: '라떼/음료', category_code: 'MILK_LATTE' },
  { id: 'TEA_BASE', name: '티/기타', category_code: 'TEA_BASE' }
];

export const DEFAULT_MOCK_MENU_ITEMS = [
  { id: 1, category_id: 'AMERICANO', name: '핫 아메리카노', price_standard: 2000, price_premium: 1500, is_recommended: 1 },
  { id: 2, category_id: 'AMERICANO', name: '아이스 아메리카노', price_standard: 2000, price_premium: 1500, is_recommended: 1 },
  { id: 3, category_id: 'COFFEE_LATTE', name: '카페 라떼', price_standard: 3000, price_premium: 2500, is_recommended: 0 },
  { id: 4, category_id: 'ADE_ETC', name: '레몬 에이드', price_standard: 3500, price_premium: 3000, is_recommended: 0 }
];

export function useAdminBilling(
  members: HasteMember[],
  syncDatabase: (updated: HasteMember[]) => void,
  cloudMembers: any[],
  setCloudMembers: React.Dispatch<React.SetStateAction<any[]>>,
  fetchCloudMembers: () => Promise<void>,
  showTemporaryToast: (msg: string) => void
) {
  const [kakaoAlerts, setKakaoAlerts] = useState<any[]>([]);

  const sendKakaoTalkNotification = (type: string, title: string, body: string, targetUser: string) => {
    const newAlert = {
      id: `KK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      body,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      targetUser
    };
    setKakaoAlerts(prev => [newAlert, ...prev]);
  };

  const triggerAutoBillingCycle = () => {
    let failCount = 0;
    let successCount = 0;

    const updated = members.map(member => {
      if (member.registrationStatus === 'SUSPENDED') return member;
      const billingSucceeded = Math.random() > 0.25;

      if (billingSucceeded) {
        successCount++;
        const successMessage = `[헤이스트 정기 서버 회비 결제 완료]\n\n안녕하세요 ${member.ownerName} 사장님. \n헤이스트 원격 자동 관리 전산 서비스 회비가 성공적으로 자동 결제되었습니다.\n\n■ 매장명: ${member.storeName}\n■ 납부내역: 2026년 5월 대비 전산 가동료\n■ 결제 금액: 5만원\n■ 결제수단: ${member.cardCompany}\n■ 자동 결제시각: ${new Date().toLocaleString('ko-KR')}\n\n정상 결제 확인에 따라 전산 라이선스가 30일 연계 연장되었습니다.`;
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
        const adminAlertMessage = `[회비 미납 비상 수신 - 헤이스트 수신전산]\n\n헤이스트 대표관리자님, 헤이스트 정수 전산 과금 회비 청구가 잔액 부족/도난 정지 등의 이유로 승인 거절되었습니다. \n\n■ 대상 가입점: ${member.storeName}\n■ 점주 성함: ${member.ownerName} 사장님 (${member.phone})\n■ 미납 금액: ${(newUnpaidMonths * 5)}만원\n■ 등록 카드사: ${member.cardCompany}\n■ 위반 대응단계: ${newStatus === 'SUSPENDED' ? '⚠️ 솔루션 가동 제한 단계 진입' : '⚠️ 1차 미납 안내 단계'}\n\n해당 가입점에 미납 변제 안내 알림톡이 발급되었습니다.`;
        sendKakaoTalkNotification('BILLING_FAIL_ADMIN', '⚠️ [경고] 회비 미납 점포 카톡 경보 수신', adminAlertMessage, '나 (Haste 총괄 본부장)');
        
        const memberOverdueMessage = `[헤이스트 결제 실패 및 장기 체납 경보]\n\n안녕하세요 ${member.ownerName} 점주님.\n귀점의 헤이스트 스마트 솔루션 월 회비 정기 청구가 등록 카드의 승인 불가 오류로 인해 거부처리 되었습니다.\n\n■ 미납 금액: 5만원\n■ 조치 사항: 미정산이 지속될 경우 헤이스트 솔루션 가동이 일시 제한될 수 있습니다.\n\n하단의 관리자 전산에서 변경 등록 또는 정산을 완료해주시기 바랍니다.`;
        sendKakaoTalkNotification('SUSPEND_ALERT', '⚠️ [체납 알림] 정기회비 승인 오류 알림', memberOverdueMessage, `${member.ownerName} 사장님`);
        return {
          ...member,
          monthlyFeePaid: false,
          unpaidMonths: newUnpaidMonths,
          registrationStatus: newStatus as any
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
          const alarmText = `[수동 미납 상태 전환 알림]\n\n관리자 직권 심사로 [${m.storeName}] 매장의 결제 상태가 미납 상태로 수동 전환되었습니다.\n- 미납금액: 5만원\n- 알림 경보가 실시간 통보되었습니다.`;
          sendKakaoTalkNotification('BILLING_FAIL_ADMIN', '⚠️ 직권 미납 전환 카톡 수신', alarmText, '나 (Haste 총괄 본부장)');
        } else {
          const successMsgText = `[전산 정산 처리 완료]\n\n${m.ownerName} 사장님. 헤이스트 확인을 통해 미납된 회비 5만원의 이체가 완료되어 전산망이 정상 복구되었습니다.\n- 대상점: ${m.storeName}\n- 상태: ACTIVE 복구`;
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

  const handleAddLocalMember = (newMember: HasteMember) => {
    const updated = [...members, newMember];
    syncDatabase(updated);
  };

  const deleteMember = async (id: any, skipConfirm = false) => {
    if (skipConfirm || confirm('선택된 로컬 시뮬레이터 가입대장을 삭제 및 데이터베이스에서 초기화 정돈하시겠습니까?')) {
      const targetLocalMember = members.find(m => m.id === id);
      const updated = members.filter(m => m.id !== id);
      syncDatabase(updated);

      if (targetLocalMember) {
        const matchedCloudMember = cloudMembers.find(m => 
          m.id === id || 
          (m.phone === targetLocalMember.phone && m.ownerName === targetLocalMember.ownerName) || 
          (m.email === targetLocalMember.email && targetLocalMember.email !== 'no-email@haste.cafe' && targetLocalMember.email !== '')
        );
        if (matchedCloudMember) {
          try {
            await fetch(`/api/registered-members/${matchedCloudMember.id}`, {
              method: 'DELETE'
            });
            setCloudMembers(prev => prev.filter(m => m.id !== matchedCloudMember.id));
          } catch (e) {
            console.error(e);
          }
        }
      }
      showTemporaryToast('성공적으로 로컬 시뮬레이션 회원 데이터가 영구 삭제되었습니다.');
      await fetchCloudMembers();
    }
  };

  return {
    kakaoAlerts,
    setKakaoAlerts,
    triggerAutoBillingCycle,
    togglePaymentStatus,
    handleAddLocalMember,
    deleteMember
  };
}
