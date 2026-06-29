export interface HeroDraft {
  id: number;
  tag: string;
  slogan: string;
  subtext: string;
  bgImage: string;
  description: string;
  visible?: boolean;
  defaultTag?: string;
  defaultSlogan?: string;
  defaultSubtext?: string;
  defaultBgImage?: string;
  defaultDescription?: string;
}

export const MEMBERSHIP_SUB_MENUS = [
  { id: 'franchise-overview', name: '개요', nameEn: 'OVERVIEW' },
  { id: 'franchise-autonomy', name: '4대 자율권', nameEn: 'AUTONOMY' },
  { id: 'franchise-benefits', name: '멤버십 혜택', nameEn: 'BENEFITS' },
  { id: 'franchise-membership', name: '가입 및 연동', nameEn: 'SUBSCRIBE' },
];

export const BRAND_SUB_MENUS = [
  { id: 'brand-philosophy', name: '철학' },
  { id: 'brand-color', name: '컬러/심볼' },
  { id: 'brand-slogan', name: '슬로건' },
  { id: 'brand-essence', name: '공간' },
  { id: 'brand-signboards', name: '간판' },
  { id: 'brand-vision', name: '비전' },
];

export const HASTE_HERO_DRAFTS: HeroDraft[] = [
  {
    id: 1,
    tag: "Concept 01 / The Grand Identity",
    slogan: "시간이 흘러도 변치 않는 깊이, 헤이스트 시그니처 프리미엄 아카이브",
    subtext: "1장: 헤이스트 시그니처 미니멀 디자인 월",
    bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    description: "A premium corporate brand identity wall inside a luxury coffee franchise headquarters. A massive sleek dark navy blue accent wall featuring a glowing matte gold double arrow symbol \">>\" and the brand name \"HAIST\" in an elegant minimalist typeface. Sophisticated interior design, architectural corporate aesthetic, dramatic upscale lighting, professional photography, 8k resolution."
  },
  {
    id: 2,
    tag: "Concept 02 / The Smart Bar",
    slogan: "기술과 조화로운 미학의 대조, 최첨단 자동화 익스클루시브 스마트 바",
    subtext: "2장: 세라믹 대리석과 매트골드의 간결함이 주는 정밀한 에스프레소 추출구",
    bgImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    description: "Interior design photography of a high-end, spacious premium cafe franchise named \"HAIST\". A sleek automated espresso brewing bar with clean marble countertops and subtle gold accents. Elegant seating areas with mid-century modern furniture, warm cozy ambient lighting, sunbeams streaming through large floor-to-ceiling glass windows, luxury lifestyle aesthetic, ultra-realistic."
  },
  {
    id: 3,
    tag: "Concept 03 / The Owner's Freedom",
    slogan: "지능형 매장이 일하는 동안 점주님은 삶의 품격과 여유로운 자유를 누립니다",
    subtext: "3장: 완전 자동화 시스템 카페가 현실로 만드는 여유롭고 편안한 쉼",
    bgImage: "https://images.unsplash.com/photo-1484981138541-3d074aa97716?auto=format&fit=crop&q=80&w=1200",
    description: "A sophisticated and confident café franchise owner relaxing comfortably at a beautiful lounge table in a sunlit corner of the café. They are smiling, enjoying a premium latte, while the automated smart systems smoothly run the store in the background. Peaceful, successful entrepreneur mood, cinematic soft focus, photorealistic."
  },
  {
    id: 4,
    tag: "Concept 04 / The Landmark Exterior",
    slogan: "지나치는 시선마저 사로잡는 도심 속 등대, 플래그십 파사드 외경",
    subtext: "4장: 랜드마크 스토어로 도약하는 멀티 플렉스 대형 매장 전경",
    bgImage: "https://images.unsplash.com/photo-1525610558991-2bede1a236e2?auto=format&fit=crop&q=80&w=1200",
    description: "Exterior architectural photography of a multi-story flagship premium cafe named \"HAIST\" on a trendy metropolitan street corner at dusk. Elegant warm lighting glows from the interior through grand glass facades. A bold, minimalist black and gold sign board displays \"HAIST\" with the fast-forward symbol \">> \". Sophisticated, inviting, upscale commercial building, 4k."
  },
  {
    id: 5,
    tag: "Concept 05 / Franchise Menu Expansion",
    slogan: "아침을 정성스럽게 깨우는 유기농 아티잔 브레드와 텀블러 컬렉션",
    subtext: "5장: 크루아상, 천연 발효종 크래프트 디저트와 프리미엄 MD 라인업",
    bgImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200",
    description: "A beautifully curated display of a premium cafe franchise menu. Delicate artisan pastries, gourmet desserts, and custom-designed merchandise like sleek ceramic tumblers and packaged coffee bean bags with the elegant geometric \"HAIST\" logo. Editorial food photography style, bright and clean aesthetic, perfect composition, soft shadows."
  },
  {
    id: 6,
    tag: "Concept 06 / The Urban Hotspot",
    slogan: "일과 쉼에 미감을 한 스푼 얹는 공간, 도심 속 감각적인 문화 발상지",
    subtext: "6장: 트렌드를 이끄는 밀레니얼 3040 세대를 사로잡는 허브",
    bgImage: "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?auto=format&fit=crop&q=80&w=1200",
    description: "Trendy, stylish urban professionals in their 30s enjoying their time in a modern, scandinavian-style upscale café named \"HAIST\". Some are working on laptops, others laughing together. Elegant paper cups with the double-arrow logo are on tables. Cozy yet energetic urban social hub atmosphere, emotional cinematic lighting, rich colors."
  },
  {
    id: 7,
    tag: "Concept 07 / The Choice of Premium",
    slogan: "세계적 인프라로 엄선하는 최고 등급 스페셜티 단일 원산지 생두",
    subtext: "7장: 절대 품질의 아라비카 소싱과 신선함이 보증하는 원두 셀렉션",
    bgImage: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
    description: "Luxury macro photography of freshly roasted, glossy premium coffee beans cascading from a sleek, branded canvas sack with \"HAIST Special Selection\" printed on it. Deep golden hour light highlighting the rich texture of the beans, revealing an absolute focus on high-end specialty coffee quality. Commercial advertising style."
  },
  {
    id: 8,
    tag: "Concept 08 / The Perfect Extraction",
    slogan: "황금빛 에스프레소 크레마에 깃든 초정밀 추출의 과학",
    subtext: "8장: 어느 가맹점에서나 일관된 추출 압력과 매끄러운 바디감 보장",
    bgImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1200",
    description: "A cinematic close-up shot of rich, golden-brown espresso crema beautifully flowing into a sophisticated designer porcelain cup. The sleek, matte-black automated extraction nozzle works with micro-precision. Steam rises gently, artistic lighting, premium beverage commercial aesthetic, high contrast, mesmerizing detail."
  },
  {
    id: 9,
    tag: "Concept 09 / The Global Network",
    slogan: "상생과 혁신을 품고 끝없이 연결되는 메트로폴리탄 하이엔드 카페",
    subtext: "9장: 전국을 넘어 대륙을 연결하는 체계적인 가맹 스케일 비전",
    bgImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200",
    description: "A high-tech stylized global map visual shown on a corporate boardroom screen, with glowing golden nodes connecting major cities, representing the rapid expansion of the \"HAIST\" premium café ecosystem. Sleek, professional, inspiring vision of a leading future-oriented coffee franchise network, corporate aesthetic."
  },
  {
    id: 10,
    tag: "Concept 10 / A Quick Break, A Perfect Rest",
    slogan: "급변하는 세상 속 한 모금 잔잔히 내려앉는 당신만의 평온한 안식",
    subtext: "10장: 아늑한 햇살, 따뜻한 자기잔 그리고 온전한 몰입을 위한 시간",
    bgImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200",
    description: "An emotional, poetic visual capturing \"A Quick Break, A Perfect Rest\" inside a HAIST café. A soft focus on a warm cup of coffee on a wooden table, with beautiful silhouettes of autumn leaves casting shadows on the floor through a window. Moody, artistic, deep emotional resonance, peaceful sanctuary in a busy city, masterpiece."
  },
  {
    id: 11,
    tag: "Concept 11 / The Green Sanctuary",
    slogan: "푸른 식물의 숨결로 가득한 도심 속 그리너리 스페셜 힐링 아트리움",
    subtext: "11장: 자연과 대화하며 호흡하는 이국적인 실내 정원 카페",
    bgImage: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&q=80&w=1200",
    description: "A lush, sunlit indoor greenhouse-style premium coffee franchise named 'HAIST'. Overhanging trailing plants, custom terracotta planter walls, and comfortable seating with high-end modern furniture. Customers relaxation with a warm cup of coffee, shafts of morning light breaking through glass ceilings, organic high-end lifestyle aesthetic."
  },
  {
    id: 12,
    tag: "Concept 12 / The Golden Horizon",
    slogan: "오렌지빛 노을빛 아래 감미롭게 빛나는 따스하고 모던한 라운지",
    subtext: "12장: 따사로운 황금빛 조명이 흐르고 감성이 배어나는 휴식 부스",
    bgImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
    description: "Interior of a premium luxury cafe lounge of 'HAIST' during sunset. Warm amber lighting fixtures glow softly, casting dramatic long shadows on natural plaster walls. Large window pane displaying street view, cozy and emotional sanctuary. Premium Scandinavian design, editorial design, realistic."
  },
  {
    id: 13,
    tag: "Concept 13 / The Art of Brewing",
    slogan: "바쁜 발걸음을 멈추고 몰입을 자아내는 시그니처 수제 드립 하우스 바",
    subtext: "13장: 타협이 허락되지 않는 커피 열정과 바리스타의 정성 어린 손길",
    bgImage: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1200",
    description: "An artistic high-end manual brewing station inside 'HAIST' premium cafe. A professional barista carefully pouring hot water from a brass kettle into a designer glass dumper. Sunlight streaming in, highlight coffee steam, absolute quality focus, macro lens commercial photography."
  },
  {
    id: 14,
    tag: "Concept 14 / The Premium Roastery",
    slogan: "수온과 압력의 과학을 넘어 매장 가치를 꽃피우는 정교한 로스팅 랩",
    subtext: "14장: 황금비율 최상급 에스프레소를 구현하기 위한 과학적 원두 디자인",
    bgImage: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=1200",
    description: "A majestic, state-of-the-art brass-and-copper coffee roaster on display behind a clean double-glass wall inside a luxury 'HAIST' franchise cafe. Glossy specialty coffee beans visible, sleek corporate brand aesthetics, elegant modern factory look, masterpiece lighting."
  },
  {
    id: 15,
    tag: "Concept 15 / The Midnight Beacon",
    slogan: "어려운 도심의 깊은 자정에도 환하게 빛나는 24시간 스마트 스테이션",
    subtext: "15장: 골목길을 든든하게 비추며 따스한 감성으로 영감을 여는 오아시스",
    bgImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
    description: "A warm and inviting exterior of a late-night luxury cafe 'HAIST' with massive continuous glass windows. The building is glowing like a golden beacon on a quiet metropolitan street. Double arrow symbol subtly reflecting on clean wet asphalt, atmospheric mood, cinematic photography with beautiful contrast."
  },
  {
    id: 16,
    tag: "Concept 16 / The Cozy Gathering",
    slogan: "이야기와 아이디어가 넘치는 도심 속 한층 깊이 있는 소셜 어반 허브",
    subtext: "16장: 트렌디한 밀레니얼들이 함께 모여 연대를 꿈꾸는 롱 테이블",
    bgImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
    description: "A stylish, warm modern community table inside a 'HAIST' premium espresso bar. Urban professionals and friends chatting cheerfully, laughing together, with elegant corporate paper cups carrying the gold chevron logo. Vibrant, positive social atmosphere, premium lifestyle branding shoot."
  },
  {
    id: 17,
    tag: "Concept 17 / The Silent Healing",
    slogan: "정밀하게 설계된 방음과 잔잔한 선율의 하이엔드 사운드 웰니스 룸",
    subtext: "17장: 복잡한 현대 사회 소음에서 일시 정지할 수 있는 나만의 안식처",
    bgImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200",
    description: "A quiet, sound-insulated private lounge booth corner inside 'HAIST' cafe. Sleek wooden sound diffusers on the wall, indirect warm light strip, an individual sitting comfortably on an exquisite designer lounge armchair, closing eyes to enjoy music. Beautiful, serene and meditative atmosphere."
  },
  {
    id: 18,
    tag: "Concept 18 / The Sustainable Future",
    slogan: "올리브 잎사귀와 테라코타 카운터의 가치를 지향하는 에코 프랜차이즈",
    subtext: "18장: 공간 소비와 스마트 테크놀로지가 결합된 자연 친화 슬로건 매치",
    bgImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
    description: "An architectural eco-friendly coffee store counter of 'HAIST' made of recycled terracotta, local clay tiling, and beautiful built-in plants. Gentle natural breeze and warm daylight flowing through wooden louvers, sustainable and futuristic design philosophy, award-winning photography."
  },
  {
    id: 19,
    tag: "Concept 19 / The Velvet Masterpiece",
    slogan: "머금는 즉시 입안을 매끄럽게 어루만지는 실크 벨벳 라떼 폼의 마법",
    subtext: "19장: 가맹 전 점포에서 극밀 실크 밀크 아트를 일관되게 제공하는 기술력",
    bgImage: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1200",
    description: "Macro shot of a gorgeous, silky flat white with perfect latte art inside a high-end custom-branded ceramics cup with a gold 'HAIST' logo. Placed on an organic texture solid wood plate, morning sunbeams shining on the milk foam, exquisite details, commercial food styling shot."
  },
  {
    id: 20,
    tag: "Concept 20 / The Next Horizon",
    slogan: "단순 무인을 넘어 프리미엄 커피 시장을 선도하는 브랜드",
    subtext: "20장: 끊임없는 여정과 기동성을 입증하는 웅장한 시그니처 뷰",
    bgImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    description: "A wide majestic shot of an modern multi-story 'HAIST' flagship store interior with floating architectural stairs, bustling with elegant people. Clean glass structures, grand navy blue pillars, golden brand accents, representation of a dominant premium coffee empire. Futuristic yet warm cozy vibe, UHD."
  },
  {
    id: 21,
    tag: "Concept 21 / The Roasting Masterpiece",
    slogan: "불과 시간과 바람이 빚어내는 궁극의 아로마, 프로페셔널 드럼 로스팅",
    subtext: "21장: 초정밀 열원 제어로 최적의 팝점을 이끌어내는 마스터 로스터",
    bgImage: "https://images.unsplash.com/photo-1510972527901-4414eb20111f?auto=format&fit=crop&q=80&w=1200",
    description: "A professional coffee roaster machine with glistening brown coffee beans roasting inside the drum. Warm fiery glow and micro-precision controls representing the craftsmanship of premium coffee roasting."
  },
  {
    id: 22,
    tag: "Concept 22 / The Specialty Sourcing",
    slogan: "한 농가의 정성 어린 땀방울이 자아낸 싱글 오리진 마이크로랏 생두",
    subtext: "22장: 산지의 고도와 기후가 입힌 고유의 과일향과 산뜻한 풍미",
    bgImage: "https://images.unsplash.com/photo-1511525251210-009710f029b9?auto=format&fit=crop&q=80&w=1200",
    description: "Raw green specialty coffee beans in organic jute bags directly imported from high-altitude farm estates, showcasing unmatched freshness and premium origin."
  },
  {
    id: 23,
    tag: "Concept 23 / The Artisan Hand Drip",
    slogan: "바리스타의 곧은 호흡 끝에 피어나는 커피 본연의 맑고 우아한 향",
    subtext: "23장: 매끄러운 푸어오버 기법으로 원두의 화사함을 살린 브루잉",
    bgImage: "https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=1200",
    description: "An elegant close-up of a barista hand-pouring hot water from a copper kettle into a glass coffee dripper. Rich blooming bubbles on the coffee bed, warm steamy focus."
  },
  {
    id: 24,
    tag: "Concept 24 / The Rich Crema Espresso",
    slogan: "아홉 바(Bar)의 타협 없는 압력이 추출한 짙은 갈색 크레마의 묵직한 바디",
    subtext: "24장: 벨벳 같은 질감 아래 숨겨진 초콜릿과 다크 캐러멜의 깊은 단맛",
    bgImage: "https://images.unsplash.com/photo-1510591509382-74947dd7f212?auto=format&fit=crop&q=80&w=1200",
    description: "Thick, dark golden crema coating the surface of a fresh hot double shot espresso being extracted into a minimalist premium ceramic cup."
  },
  {
    id: 25,
    tag: "Concept 25 / The Roastery Laboratory",
    slogan: "생두의 잠재력을 최고조로 이끌어내기 위한 커피 분석과 커핑 랩",
    subtext: "25장: 수분율과 로스율을 넘어 미각의 황금 비율을 찾아가는 장인의 실험실",
    bgImage: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1200",
    description: "Professional coffee cupping and tasting session in a beautiful minimalistic roasting lab. Glass jars with ground coffee, cupping spoons, and sensory flavor wheels in the background."
  },
  {
    id: 26,
    tag: "Concept 26 / The Cozy Neighborhood Spot",
    slogan: "골목길 모퉁이, 은은한 커피 향으로 온 동네를 따뜻하게 물들이는 공간",
    subtext: "26장: 햇살이 머무는 창가 자리에서 누리는 소박하고 평화로운 동네 커피숍",
    bgImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    description: "A cozy local neighborhood boutique coffee shop with warm wooden furniture, sun rays streaming beautifully through glass windows, welcoming interior."
  },
  {
    id: 27,
    tag: "Concept 27 / Pre-infusion Steam",
    slogan: "뜨거운 물빛 아래 원두를 고르게 적셔 더 깊은 향을 품는 뜸들이는 시간",
    subtext: "27장: 풍성하게 부풀어 오르는 커피 빵 속 가득히 고인 가녀린 가스 배출",
    bgImage: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1200",
    description: "Close up of high-quality coffee grounds blooming beautifully during pre-infusion, with light steam rising and soft bokeh backlight."
  },
  {
    id: 28,
    tag: "Concept 28 / The Roaster's Craft",
    slogan: "가마의 뜨거운 열기를 온몸으로 견디며 원두의 골든 포인트에 도달하다",
    subtext: "28장: 차가운 공기로 급히 식혀 신선함을 밀봉하는 열정의 가치",
    bgImage: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1200",
    description: "A master roaster checking the color of freshly roasted coffee beans from a roasting machine sampler spoon, displaying deep concentration and expert skill."
  },
  {
    id: 29,
    tag: "Concept 29 / The Art of Latte Art",
    slogan: "우유 고유의 신선함과 스팀이 직조해 낸 한 잔의 벨벳 디자인",
    subtext: "29장: 정밀하게 원을 그리며 따르는 크리미 밀크 폼과 황금빛 매치",
    bgImage: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1200",
    description: "A high-end flat white latte art with perfect milk foam design, displayed on a wooden table inside a cozy modern cafe. Delicate steam rising, soft lighting."
  },
  {
    id: 30,
    tag: "Concept 30 / Freshly Roasted Beans Pack",
    slogan: "오늘 볶아 갓 전해진 그 신선함 그대로, 프리미엄 원두 아로마 밀봉 백",
    subtext: "30장: 이산화탄소는 배출하고 아로마는 가두는 지능형 가스 패드 특수 팩",
    bgImage: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1200",
    description: "Sleek, minimalist matte black and gold coffee bean packages with the gold emblem logo lined beautifully on a raw oak wooden shelf inside a specialty roastery."
  }
];

export const DEFAULT_INTERIOR_TYPES = [
  {
    id: 'TYPE1',
    title: '타입 01: 아틀리에 웜 스톤 (Warm Stone Atelier)',
    subtitle: '따스하게 물든 석회 모르타르와 크래프트 오크의 중후함',
    desc: '업로드해주신 메인 콘셉트 이미지의 감성을 고스란히 반영한 프리미엄 수제 공간입니다. 러프하면서 세련된 질감의 아이보리 톤 석회 질석 미장 마감이 빛을 은은하게 반사하여 최적의 오크 카운터를 부각시킵니다.',
    tags: ['아이보리 석회미장', '크래프트 내추럴오크', '화이트 세라믹 수납', '은은한 백라이트'],
    gallery: [
      'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200'
    ],
    videoLinks: ['https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-40097-large.mp4', '', ''],
    mockImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200',
    blueprintImage: 'https://images.unsplash.com/photo-1506422748879-887454f9dbf4?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'TYPE2',
    title: '타입 02: 미니멀 테라 인더스트리얼 (Minimal Terra Industrial)',
    subtitle: '금속 드럼과 정밀 레이아웃 유리 파티션의 콤팩트 가동성',
    desc: '정교하게 용접 가공된 스테인리스 장치 다이와 노출형 콘크리트 베이스에 골든 수지 조명을 더해 모던 테크의 투명한 전문성을 여과 없이 보여줍니다.',
    tags: ['노출 콘크리트', '샌디드 메탈 바', '초정밀 글라스 유닛', '브라운 패키징 셸프'],
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1200'
    ],
    videoLinks: ['https://assets.mixkit.co/videos/preview/mixkit-coffee-expert-preparing-an-espresso-coffee-40114-large.mp4', '', ''],
    mockImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200',
    blueprintImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200'
  }
];
