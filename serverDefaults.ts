import { MENU_CATEGORIES, COMPILED_MENU_ITEMS } from './src/menuData';
import { DEFAULT_DRAFTS } from './serverDefaultsDrafts';

export { DEFAULT_DRAFTS };

export const DEFAULT_LICENSES = [
  {
    id: 1,
    storeName: '강남본점',
    storeId: 'store123456',
    licenseStartDate: '2026-01-01',
    licenseEndDate: '2026-12-31',
    isApproved: 1,
    storeGrade: 'PREMIUM',
    password: '1234'
  },
  {
    id: 2,
    storeName: '역삼지점',
    storeId: 'store123457',
    licenseStartDate: '2026-02-15',
    licenseEndDate: '2026-08-15',
    isApproved: 1,
    storeGrade: 'STANDARD',
    password: '1234'
  },
  {
    id: 3,
    storeName: '홍대입구역점',
    storeId: 'store123458',
    licenseStartDate: '2025-05-01',
    licenseEndDate: '2026-05-01',
    isApproved: 1,
    storeGrade: 'PREMIUM',
    password: '1234'
  },
  {
    id: 4,
    storeName: '부산서면점',
    storeId: 'store123459',
    licenseStartDate: '2026-03-01',
    licenseEndDate: '2027-03-01',
    isApproved: 0,
    storeGrade: 'PREMIUM',
    password: '1234'
  },
  {
    id: 5,
    storeName: '신규가맹점',
    storeId: 'store123460',
    licenseStartDate: '2026-06-01',
    licenseEndDate: '2027-06-01',
    isApproved: 2,
    storeGrade: 'PREMIUM',
    password: '1234'
  }
];

export const DEFAULT_CATEGORIES = MENU_CATEGORIES.map(c => ({
  id: c.id,
  name: c.name,
  desc: c.desc,
  visible: 1
}));

export const DEFAULT_MENU_ITEMS = COMPILED_MENU_ITEMS;

export const DEFAULT_FILMS = [
  {
    id: 1,
    title: 'HAIST 시그니처 에스프레소 추출',
    desc: '헤이스트 플래그십 스토어에서 선보이는 프리미엄 골드 원두의 황금빛 크레마 추출 세레모니 비디오입니다.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-40097-large.mp4',
    visible: 1
  },
  {
    id: 2,
    title: '바리스타의 핸드드립 가이드',
    desc: '93도의 정교한 정수 온도로 정성껏 드립핑하여 커피의 본질적인 아로마를 추출해내는 브루잉 코스입니다.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-expert-preparing-an-espresso-coffee-40114-large.mp4',
    visible: 1
  },
  {
    id: 3,
    title: '라떼 아트 세레모니 & 카푸치노 밀크 폼 스핀',
    desc: '미세 분사 스팀 노즐로 구현한 최상의 벨벳 밀크 폼과 황금 비율 하트 튤립 라떼 아트 과정입니다.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-barista-making-latte-art-in-a-coffee-cup-40112-large.mp4',
    visible: 1
  }
];

export const DEFAULT_INTERIORS = [
  {
    id: 1,
    type_id: 'TYPE1',
    title: '타입 01: 아틀리에 웜 스톤 (Warm Stone Atelier)',
    subtitle: '햇바랜 석회 모르타르와 크래프트 오크의 중후함',
    desc: '업로드해주신 메인 콘셉트 이미지의 감성을 디테일하게 복사한 프리미엄 수제 공간입니다. 러프하면서 세련된 질감의 아이보리 톤 석회 질석 미장 마감이 빛을 은은하게 반사하여 최적의 오크 카운터를 부각시킵니다.',
    tags: JSON.stringify(['아이보리 석회미장', '크래프트 내추럴오크', '화이트 세라믹 수납', '은은한 백라이트']),
    highlights: JSON.stringify([
      { title: '수제 샌드 모르타르 피니시', detail: '시간의 무게를 얹은 듯 차분하고 아늑한 질감의 아티장 석회 미장 마감' },
      { title: '내추럴 크래프트 피니시 오크', detail: '터치감이 아늑한 친환경 샌디드 오크 원목 바 테이블 카운터' }
    ]),
    gallery: '[]',
    video_links: JSON.stringify(['https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-40097-large.mp4', '', '']),
    mock_image: '',
    blueprint_image: ''
  },
  {
    id: 2,
    type_id: 'TYPE2',
    title: '타입 02: 미니멀 테라 인더스트리얼 (Minimal Terra Industrial)',
    subtitle: '금속 드럼과 정밀 레이아웃 유리 파티션의 콤팩트 가동성',
    desc: '정교하게 용접 가공된 스테인리스 장치 다이와 노출형 콘크리트 베이스에 골든 수지 조명을 매듭지어 모던 테크의 투명한 전문성을 여과치 없이 뽐냅니다.',
    tags: JSON.stringify(['노출 콘크리트', '샌디드 메탈 바', '초정밀 글라스 유닛', '브라운 패키징 셸프']),
    highlights: JSON.stringify([
      { title: '고밀도 노출 콘크리트', detail: '미니멀하고 세련되며 현대적인 인더스트리얼 거친 질감' },
      { title: '슬림 스테인리스 가공테이블', detail: '매끄럽고 견고하여 위생적 관리가 용이한 테크 바스테이션' }
    ]),
    gallery: '[]',
    video_links: JSON.stringify(['https://assets.mixkit.co/videos/preview/mixkit-coffee-expert-preparing-an-espresso-coffee-40114-large.mp4', '', '']),
    mock_image: '',
    blueprint_image: ''
  }
];

export const DEFAULT_GRADE_PERMISSIONS = [
  { gradeType: '일반', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '일반', categoryKey: '노하우팁', canRead: 0, canWrite: 0, canList: 1 },
  { gradeType: '일반', categoryKey: '장비운영', canRead: 0, canWrite: 0, canList: 1 },
  { gradeType: '일반', categoryKey: '자료실', canRead: 0, canWrite: 0, canList: 1 },
  { gradeType: '일반', categoryKey: '레시피', canRead: 0, canWrite: 0, canList: 1 },
  { gradeType: '일반', categoryKey: '핵심정보', canRead: 0, canWrite: 0, canList: 0 },
  { gradeType: '일반', categoryKey: '헤이스트멤버십전용', canRead: 0, canWrite: 0, canList: 0 },
  { gradeType: '일반', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '일반', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '일반', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 },

  { gradeType: '멤버십', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '멤버십', categoryKey: '노하우팁', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '멤버십', categoryKey: '장비운영', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '멤버십', categoryKey: '자료실', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '멤버십', categoryKey: '레시피', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '멤버십', categoryKey: '핵심정보', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '멤버십', categoryKey: '헤이스트멤버십전용', canRead: 0, canWrite: 0, canList: 0 },
  { gradeType: '멤버십', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '멤버십', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '멤버십', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 },

  { gradeType: '임원', categoryKey: '헤이스트소식', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: '노하우팁', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: '장비운영', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: '자료실', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: '레시피', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: '핵심정보', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: '헤이스트멤버십전용', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '임원', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 },

  { gradeType: '프리미엄', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0, canList: 1 },
  { gradeType: '프리미엄', categoryKey: '노하우팁', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: '장비운영', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: '자료실', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: '레시피', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: '핵심정보', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: '헤이스트멤버십전용', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
  { gradeType: '프리미엄', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 }
];

export const DEFAULT_CONSULTATIONS = [
  { id: 1, region_name: '서울 강남구 도곡동 인근', owner_name: '최민우', phone: '010-5555-6666', email: 'min@haste.cafe', capital: '5000', has_store: '없음', inquiry_path: '인터넷 검색', content: '가맹 창업 상담 희망합니다. 도곡동 역세권 입지 조건이 맞는지 검토받고 싶습니다.', created_at: new Date().toISOString(), approval_status: '요청' },
  { id: 2, region_name: '경기 성남시 분당구 인근', owner_name: '김지혜', phone: '010-7777-8888', email: 'jihye@haste.cafe', capital: '8000', has_store: '있음', inquiry_path: '지인 소개', content: '상가 분양을 받았는데 카페 헤이스트 브랜드의 경쟁력이 타사 대비 어떠한지 궁금해서 상담 요청합니다.', created_at: new Date().toISOString(), approval_status: '요청' }
];

export const DEFAULT_ADMINS = [
  { id: 1, username: 'admin', password: 'admin8113', created_at: new Date().toISOString() }
];

export const DEFAULT_SOUNDS = [
  {
    id: 1,
    title: 'HASTE 앰비언트 라운지 로파이 Vol.1',
    desc: '헤이스트 매장의 포근하고 감각적인 오후 분위기를 자아내는 프리미엄 라운지 로파이 비트입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    visible: 1,
    order_index: 0
  },
  {
    id: 2,
    title: '헤이스트 에스프레소 재즈 앤 블루스',
    desc: '차분하게 정돈된 공간 속 깊이감 있는 에스프레소 추출향과 함께 즐기는 재즈 오케스트라 선율입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    visible: 1,
    order_index: 1
  },
  {
    id: 3,
    title: '차분한 성수 랩 아쿠아틱 앰비언스',
    desc: '물소리와 잔잔한 건반 선율이 조화를 이루어 깊은 몰입과 웰니스를 돕는 어쿠스틱 사운드입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    visible: 1,
    order_index: 2
  },
  {
    id: 4,
    title: '비 오는 날의 헤이스트 발코니',
    desc: '빗소리 효과음과 감미로운 클래식 피아노가 블렌딩된 감성적인 어쿠스틱 피아노 트랙입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    visible: 1,
    order_index: 3
  },
  {
    id: 5,
    title: '아침을 깨우는 브라이트 어쿠스틱 기타',
    desc: '산뜻하고 밝은 어쿠스틱 기타의 내추럴 아르페지오가 아침 매장에 싱그러움을 더합니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    visible: 1,
    order_index: 4
  },
  {
    id: 6,
    title: 'Midnight HASTE 스무스 재즈',
    desc: '자정 무렵 아늑하게 켜진 조명 아래 감미롭게 깔리는 정통 스무스 색소폰 재즈 연주곡입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    visible: 1,
    order_index: 5
  },
  {
    id: 7,
    title: '따뜻한 벽난로와 모카 가토 라운지',
    desc: '장작 타는 소리와 따뜻한 로파이 아날로그 신디사이저 패드가 포개진 차분한 휴식 음악입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    visible: 1,
    order_index: 6
  },
  {
    id: 8,
    title: '북유럽 자작나무 숲의 피아노',
    desc: '자작나무 사이로 내리쬐는 햇살을 닮은 미니멀하고 서정적인 현대 피아노 독주곡입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    visible: 1,
    order_index: 7
  },
  {
    id: 9,
    title: '도심 속 슬로우 템포 클래식 바이올린',
    desc: '바쁜 도심의 속도를 늦춰줄 우아하고 차분한 클래식 바이올린 소품 독주곡입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    visible: 1,
    order_index: 8
  },
  {
    id: 10,
    title: '헤이스트 골든 아워 보사노바',
    desc: '기분 좋은 가을 저녁 노을과 잘 어울리는 은은한 드럼 브러쉬와 클래식 보사노바 멜로디입니다.',
    sound_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    visible: 1,
    order_index: 9
  }
];

export const AGREEMENT_TITLE = "스마트 솔루션 이용 및 상표 표시에 관한 약정서";
export const AGREEMENT_SUBTITLE = "※ 본 계약은 전자서명법에 따른 전자문서로 체결될 수 있으며, 서면 계약과 동일한 법적 효력을 가집니다.";

export const AGREEMENT_LINES = [
  "제 1 조 (목적 및 대상)",
  "본 계약은 \"갑\"이 개발·소유한 [스마트 매장 솔루션 및 로컬 서버 시스템]의 공급, 소프트웨어 라이선스 부여 및 이와 연동된 브랜드 상표의 단순 표시 권한 부여에 관한 양 당사자의 권리와 의무를 규정함을 목적으로 한다.",
  "대상 상표 및 표시 범위: 헤이스트(HASTE) 명칭 및 로고 마크 일체로 하며, \"을\"은 본 계약 목적 범위 내에서 키오스크 화면 UI, 외부 간판, 소모품 등에 한하여 기술적 호환 및 솔루션 이용 점포임을 나타내는 목적으로 상표권자의 간섭 없이 단순 표시할 수 " +
  "있다. \"갑\"은 이에 대해 별도의 상표 라이선스료(로열티)를 징수하지 아니한다.",
  "대상 솔루션 및 장비연동 범위: 기존 특정 무인카페에서 사용되던 지정 키오스크와 커피머신 간의 데이터 연동 통신 프로그램, 기기 연동 제어 펌웨어 일체를 뜻한다. 여기에는 메인 클라우드 서버 다운 및 긴급 장애 상태에서도 자체 로컬시스템 로직을 가동하여 오류 및 끊김 없이 중앙 서버 장애 복구 시까지 독립 운용을 유지하는 독립 로컬 서버 운용 프로그램이 포함된다.",
  "사용처: \"을\"이 독립적으로 운영하는 매장 1개소에 한한다.",
  "",
  "제 2 조 (상표 표시의 원칙 및 비용)",
  "\"갑\"은 본 계약 기간 동안 \"을\"에게 대상 상표의 표시 권한을 무상(0원)으로 부여한다. 단, 본 상표 표시는 \"을\"이 제3조에 따른 소프트웨어 이용료를 연체 없이 성실히 납부하여 소프트웨어 이용 계약이 정상 유지되는 상태를 전제로 한다.",
  "",
  "제 3 조 (소프트웨어 이용료 및 멤버십 혜택)",
  "\"을\"은 본 스마트 시스템의 핵심 원천 프로그램 라이선스 취득, 기존 지정 장비 간의 장비연동 데이터 초기 구축 및 로컬 서버 기반 프로그램 사용 환경 설정의 대가로 1회성 솔루션 가입비 300,000원(VAT 별도)을 \"갑\"에게 납부하여야 한다.",
  "\"을\"이 2호점 이상의 추가 매장을 개설하거나 솔루션을 신규 도입하는 경우, 패밀리 혜택을 적용하여 해당 추가 등록 매장의 개설 도입 가입비를 50% 전액 감면 면제한다.",
  "\"을\"은 매장 스마트 시스템 운용 및 전산 유지보수의 대가로 매월 50,000원(VAT 별도)을 지정된 일자에 \"갑\"이 지정한 신용카드 정기 결제 시스템(자동 결제)을 통해 납부한다. 본 비용은 매장의 매출액과 연동되지 않는 고정 기술 이용료이다.",
  "\"을\"이 월 이용료 정기구독 플랜을 유지하는 경우 매장 상태 및 결제 내역에 따라 추가적인 점주 혜택을 제공할 수 있다.",
  "본 비용은 가맹사업법상의 가맹비, 교육비 또는 로열티가 아니며, \"갑\"이 제공하는 기술 용역의 대가이다. 모든 프로그램의 저작권과 소유권은 \"갑\"에게 있으며, \"을\"은 사용권만 가진다.",
  "솔루션의 안정성 및 보안 최적화를 위한 정기 기능 패치는 무상으로 제공하며, 향후 고도화되는 특수 기능 및 상위 버전은 \"을\"의 선택에 따라 유상으로 분리 설계하여 가치 선택권을 제공한다.",
  "",
  "제 4 조 (독립적 경영 및 가맹사업 배제)",
  "본 계약은 가맹사업법상의 가맹계약이 아니며, \"을\"은 독립된 자영업자로서 본인의 책임 and 비용으로 매장을 운영한다. \"갑\"은 \"을\"의 매장 영업시간, 휴업일, 메뉴 구성, 판매가격 결정, 원부재료 소싱 및 사입 여부, 인력 채용 등 매장 경영 및 영업 활동 일체에 대하여 어떠한 통제, 간섭, 통일적 수시 감독도 하지 않으며 이를 보장한다. 또한 \"갑\"은 \"을\"에게 특정 인테리어 형태나 운영정책의 사용을 강제하지 아니한다.",
  "",
  "제 5 조 (지정 장비 고정 및 자율 수급 원칙)",
  "本 솔루션은 프로그램 및 로컬 시스템의 호환성과 안정성을 위해 기존에 지정된 특정 무인카페 키오스크 및 머신 모델에 한하여 장비연동 기술을 제공한다.",
  "\"갑\"은 관련 하드웨어 장비를 \"을\"에게 강매하지 아니하며, \"을\"은 해당 지정 모델의 장비를 기존 매장에서 그대로 활용하거나 시장에서 중고 또는 인터넷 최저가 등으로 자유롭게 직접 수급(자율 조달)하여야 한다.",
  "본 솔루션 및 관련 하드웨어 장비는 \"을\"이 직접 연결하는 자가 설치를 원칙으로 한다. \"갑\"은 \"을\"의 원활한 매장 구축을 위해 장비연동 설치 가이드와 기기 사용을 위한 기본 추출 세팅 예시 정보를 제공하며, 초기 세팅을 위한 비대면 원격 소통 채널을 통한 상담을 지원한다.",
  "본 솔루션은 메인 클라우드 서버 다운 및 긴급 장애 상태에서도 자체 로컬시스템 로직을 가동하여 오류 및 끊김 없이 중앙 서버 장애 복구 시까지 독립 운용을 유지한다. 단, 외부 매장 자체의 인터넷 회선 단선이나 하드웨어 기계 자체의 물리적 고장으로 인한 에러는 예외로 한다.",
  "",
  "제 6 조 (물류 자율성 및 점주 연합 혜택)",
  "\"갑\"은 본 계약에 따른 원부재료 및 물류 공급 의무를 지지 않으며, \"을\"은 외부 물류 업체를 통해 자유롭게 원부재료를 자율 조달하여 합리적인 원가 관리를 수행함을 원칙으로 한다.",
  "물류 사입 의무 제약은 전혀 없으나, \"을\"이 희망하는 경우 헤이스트 점주 연합 공동구매 망에 자율적으로 참여할 수 있다. 이 경우 커피 원두, 우유, 컵 등 필수 원부재료를 도매가 대비 추가 할인된 특가로 공급받아 매장 물류 비용을 압축할 수 있다.",
  "",
  "제 7 조 (커뮤니티 지원 및 점주 보상 제도)",
  "\"갑\"은 \"을\"의 원활한 점포 자가 관리를 조력하기 위해, 전국 베테랑 점주들과의 실시간 소통창구(단톡방) 참여 권한 및 스마트 무인 장비 설치·프로그램 운용 가이드 게시판의 정식 읽기 권한을 계약 기간 동안 무상으로 제공한다.",
  "\"을\"이 전체 점주들의 실질적인 이익 및 상생에 기여하는 시그니처 레시피를 개발하거나, 매장 운영에 유용한 정보를 커뮤니티에 적극적으로 공유하여 기여한 경우, \"갑\"은 자체 심사를 통해 운영진 차원의 특별 보상 혜택을 제공할 수 있다.",
  "",
  "제 8 조 (프로그램 오류 면책 및 하드웨어 A/S 책임 제한)",
  "\"갑\"의 고의 또는 중대한 과실이 없는 한, \"갑\"은 불가항력적 요인 또는 프로그램 일시 오류로 발생한 \"을\"의 영업 손실에 대하여 배상 책임을 지지 아니하며, 프로그램 결함 시 \"갑\"의 책임 범위는 당월 솔루션 이용료 한도로 제한한다.",
  "\"을\"이 직접 수급한 하드웨어 장비 자체의 기계적 결함, 고장, 노후화로 인한 에러는 \"을\"의 책임 하에 수리하여야 하며, \"갑\"은 하드웨어에 대한 A/S 책임을 지지 않는다.",
  "",
  "제 9 조 (계약 제한, 기간 및 명의 변경 등)",
  "\"을\"이 월 시스템 이용료를 2회 이상 연체하는 경우, \"갑\"은 사전 통보 후 소프트웨어 라이선스 이용 권한을 제한하거나 로컬 연동 프로그램 기능을 일시 중지할 수 있다. 계약 종료 시 상표 표시 권한은 즉시 소멸하며, \"을\"은 상표가 노출된 시설물을 7일 이내 철거하여야 한다.",
  "본 계약의 기간은 체결일로부터 1년으로 하며, 만료 1개월 전까지 별도의 해지 의사 표시가 없는 경우 1년씩 자동 연장된다. \"을\"이 매장의 운영권 또는 소유권을 타인에게 양도하는 경우 본 계약은 자동 종료된다.",
  "\"을\"은 자신의 계산과 책임으로 독립적인 사업을 운영하며, 본 계약은 특정 영업방식의 통일적 제공이나 지속적인 경영 통제를 목적으로 하지 않음을 재확인한다."
];
