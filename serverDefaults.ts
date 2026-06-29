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
  { gradeType: '일반', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0 },
  { gradeType: '일반', categoryKey: '노하우팁', canRead: 0, canWrite: 0 },
  { gradeType: '일반', categoryKey: '레시피', canRead: 0, canWrite: 0 },
  { gradeType: '일반', categoryKey: '핵심정보', canRead: 0, canWrite: 0 },
  { gradeType: '일반', categoryKey: '장비운영', canRead: 0, canWrite: 0 },
  { gradeType: '일반', categoryKey: 'Q&A', canRead: 1, canWrite: 1 },

  { gradeType: '직영점', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0 },
  { gradeType: '직영점', categoryKey: '노하우팁', canRead: 1, canWrite: 0 },
  { gradeType: '직영점', categoryKey: '레시피', canRead: 1, canWrite: 0 },
  { gradeType: '직영점', categoryKey: '핵심정보', canRead: 1, canWrite: 0 },
  { gradeType: '직영점', categoryKey: '장비운영', canRead: 1, canWrite: 0 },
  { gradeType: '직영점', categoryKey: 'Q&A', canRead: 1, canWrite: 1 },

  { gradeType: '임원', categoryKey: '헤이스트소식', canRead: 1, canWrite: 1 },
  { gradeType: '임원', categoryKey: '노하우팁', canRead: 1, canWrite: 1 },
  { gradeType: '임원', categoryKey: '레시피', canRead: 1, canWrite: 1 },
  { gradeType: '임원', categoryKey: '핵심정보', canRead: 1, canWrite: 1 },
  { gradeType: '임원', categoryKey: '장비운영', canRead: 1, canWrite: 1 },
  { gradeType: '임원', categoryKey: 'Q&A', canRead: 1, canWrite: 1 },

  { gradeType: '프리미엄', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0 },
  { gradeType: '프리미엄', categoryKey: '노하우팁', canRead: 1, canWrite: 1 },
  { gradeType: '프리미엄', categoryKey: '레시피', canRead: 1, canWrite: 1 },
  { gradeType: '프리미엄', categoryKey: '핵심정보', canRead: 1, canWrite: 1 },
  { gradeType: '프리미엄', categoryKey: '장비운영', canRead: 1, canWrite: 1 },
  { gradeType: '프리미엄', categoryKey: 'Q&A', canRead: 1, canWrite: 1 }
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
