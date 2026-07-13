export interface HasteMember {
  id: string;
  storeName: string;
  storeCode?: string;
  ownerName: string;
  phone: string;
  email: string;
  address?: string;
  joinDate: string;
  joinDateTime?: string;
  cardNo: string;
  cardCompany: string;
  joiningFeePaid: boolean;
  monthlyFeePaid: boolean; // Current month's fee paid status
  unpaidMonths: number;    // Number of unpaid months
  lastPaymentDate: string;
  registrationStatus: 'ACTIVE' | 'SUSPENDED' | string;
  approvalStatus?: '요청' | '진행중' | '승인' | '보류' | '패키지회원';
}

export interface KakaoAlert {
  id: string;
  type: 'BILLING_SUCCESS' | 'BILLING_FAIL_ADMIN' | 'SUSPEND_ALERT';
  title: string;
  body: string;
  time: string;
  targetUser: string;
}

export interface HasteBenefitItem {
  id: string;
  title: string;
  desc: string;
  iconName: string;
}

export const HASTE_BENEFIT_ITEMS: HasteBenefitItem[] = [
  {
    id: '01. ZERO ROYALTY',
    title: '브랜드 상표 라이선스 제공',
    desc: '헤이스트 브랜드 상표의 표시 권한을 기본 제공하며, 간판 및 소모품 등에 헤이스트 제재 없이 사용 가능합니다.',
    iconName: 'Settings',
  },
  {
    id: '02. INDEPENDENT BUSINESS',
    title: '독립적 매장 경영 보장',
    desc: '점주의 자율 운영을 최우선으로 보장하며 영업시간, 메뉴 구성, 가격 결정 등에 헤이스트가 관여하지 않습니다.',
    iconName: 'Shield',
  },
  {
    id: '03. LOGISTICS FREEDOM',
    title: '원부재료 물류 조달의 완전한 자율성',
    desc: '특정 재료 강매나 의무 공급 제약이 없으며, 외부 물류를 통한 자율 조달로 원가를 절감할 수 있습니다.',
    iconName: 'Truck',
  },
  {
    id: '04. AUTOMATIC RENEWAL',
    title: '편리한 월 정기구독 갱신 시스템',
    desc: '의무 장기 선납 없이 매월 55,000원의 저렴한 이용료 정기결제를 통해 간편하게 솔루션 가동 상태를 유지할 수 있습니다.',
    iconName: 'Calendar',
  },
  {
    id: '05. GROUP PURCHASE',
    title: '원부재료 공동구매 추가 할인 혜택',
    desc: '점주 연합 공동구매 망을 통해 필수 원부재료를 도매가 대비 추가 할인된 특가로 공급받을 수 있습니다.',
    iconName: 'BadgePercent',
  },
  {
    id: '06. MULTI-STORE BENEFIT',
    title: '추가 매장 멤버십 가입 시 가입비 50% 면제',
    desc: '2호점 이상의 추가 매장 개설 또는 솔루션 신규 도입 시, 가입비의 50%를 즉시 면제해 드립니다.',
    iconName: 'Store',
  },
  {
    id: '07. COMMUNITY & GUIDE ACCESS',
    title: '점주 소통 커뮤니티 및 매장 운용 가이드 지원',
    desc: '점주 실시간 소통망과 함께 무인 기기 설치 및 프로그램 운용 가이드 게시판 이용을 지원합니다.',
    iconName: 'BookOpen',
  },
  {
    id: '08. SOFTWARE UPGRADES',
    title: '소프트웨어 업데이트 및 기능 업그레이드 지원',
    desc: '안정적인 시스템 관리를 위한 정기 소프트웨어 업데이트를 기본 지원하며 특수 기능은 옵션 제공합니다.',
    iconName: 'Zap',
  },
  {
    id: '09. RECIPE & CONTRIBUTION BENEFIT',
    title: '점주 창의적 레시피 개발 및 기여 보상 제공',
    desc: '독창적인 레시피를 공유하여 브랜드 가치 향상에 기여 시 정기 구독료 할인 등 다양한 보상을 지급합니다.',
    iconName: 'Coffee',
  },
  {
    id: '10. HASTE PLAYLIST LICENSE',
    title: '헤이스트 플레이리스트 BGM 이용권 제공',
    desc: '저작권료 부담 없이 매장 무드에 맞는 Lo-Fi 및 Acoustic BGM을 무제한 재생하는 전용 스트리밍을 제공합니다.',
    iconName: 'Music',
  },
  {
    id: '11. BRAND PR & MARKETING',
    title: '헤이스트 브랜드 마케팅&우수매장 홍보',
    desc: '딥러닝 기술을 활용한 AI 에이전트들이 숏폼 비디오, 매장 홍보 문구, 이미지 등을 자동 제작하여 마케팅 효과를 극대화하고 홍보 비용을 대폭 절감하며, 우수 매장 선정 시 브랜드 공식 채널을 통한 특별 홍보 혜택을 추가로 제공합니다.',
    iconName: 'Megaphone',
  },
  {
    id: '12. BRAND ITEM LICENSE',
    title: '헤이스트 브랜드 아이템 무상 사용',
    desc: '헤이스트 로고가 적용된 컵홀더, 컵, 캐리어 등 매장 소모품 디자인 및 브랜드 아이템을 무상으로 사용하여 매장의 브랜딩 가치와 일체감을 높여줍니다.',
    iconName: 'Gift',
  },
  {
    id: '13. HASTE EXCLUSIVE APP',
    title: '헤이스트 전용 어플 출시 예정',
    desc: '헤이스트 멤버십 고유 특화 기능인 스마트 POS, 원격 매장 제어 및 고객 포인트 적립 기능까지 통합하여 편리하게 이용할 수 있는 전용 어플리케이션이 출시될 예정입니다.',
    iconName: 'Smartphone',
  }
];

