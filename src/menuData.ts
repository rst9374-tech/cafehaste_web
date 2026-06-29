export interface MenuItemRaw {
  id: string;
  category: string;
  nameKr: string;
  nameEng: string;
}

import { ITEM_IMAGES } from './menu_images';

export const MENU_CATEGORIES = [
  { id: 'AMERICANO', name: '아메리카노', desc: '스마트 바리스타 시스템이 전하는 엄선된 아메리카노 패밀리' },
  { id: 'COFFEE_LATTE', name: '커피라떼', desc: '고소한 우유와 에스프레소 샷의 부드러운 만남' },
  { id: 'ADE_ETC', name: '에이드 / 기타음료', desc: '청량하고 상큼한 프리미엄 에이드와 시원하고 간편한 병음료' },
  { id: 'MILK_LATTE', name: '생우유라떼', desc: '신선한 생우유와 달콤한 시럽으로 기운을 돋우는 논커피 라떼' },
  { id: 'TEA_BASE', name: '티베이스', desc: '향긋한 허브티와 전통 홈메이드 과일 수제차' }
];

const RAW_MENU_ITEMS: MenuItemRaw[] = [
  // 1. 아메리카노
  { id: 'AME_HOT_LIGHT', category: 'AMERICANO', nameKr: 'HOT 아메리카노(연하게)', nameEng: 'HOT Americano (Light)' },
  { id: 'AME_ICED_LIGHT', category: 'AMERICANO', nameKr: 'ICED 아메리카노(연하게)', nameEng: 'ICED Americano (Light)' },
  { id: 'AME_HOT', category: 'AMERICANO', nameKr: 'HOT 아메리카노', nameEng: 'HOT Americano' },
  { id: 'AME_ICED', category: 'AMERICANO', nameKr: 'ICED 아메리카노', nameEng: 'ICED Americano' },
  { id: 'AME_HOT_DOPPIO', category: 'AMERICANO', nameKr: 'HOT 에스프레소도피오', nameEng: 'HOT Espresso Doppio' },
  { id: 'AME_ICED_SHOTCHU', category: 'AMERICANO', nameKr: 'ICED 아샷츄', nameEng: 'ICED Peach Black Tea with Espresso Shot' },
  { id: 'AME_HOT_ADD_SHOT', category: 'AMERICANO', nameKr: 'HOT 아메리카노(샷추가)', nameEng: 'HOT Americano with Espresso Shot' },
  { id: 'AME_ICED_ADD_SHOT', category: 'AMERICANO', nameKr: 'ICED 아메리카노(샷추가)', nameEng: 'ICED Americano with Espresso Shot' },
  { id: 'AME_HOT_HAZEL', category: 'AMERICANO', nameKr: 'HOT 아메리카노(헤이즐넛)', nameEng: 'HOT Americano (Hazelnut)' },
  { id: 'AME_ICED_HAZEL', category: 'AMERICANO', nameKr: 'ICED 아메리카노(헤이즐넛)', nameEng: 'ICED Americano (Hazelnut)' },
  { id: 'AME_HOT_SUGAR', category: 'AMERICANO', nameKr: 'HOT 아메리카노(설탕)', nameEng: 'HOT Americano with Sugar' },
  { id: 'AME_ICED_SUGAR', category: 'AMERICANO', nameKr: 'ICED 아메리카노(설탕)', nameEng: 'ICED Americano with Sugar' },
  { id: 'AME_HOT_HAZEL_SHOT', category: 'AMERICANO', nameKr: 'HOT 아메리카노(헤이즐넛+샷추가)', nameEng: 'HOT Americano (Hazelnut + Espresso Shot)' },
  { id: 'AME_ICED_HAZEL_SHOT', category: 'AMERICANO', nameKr: 'ICED 아메리카노(헤이즐넛+샷추가)', nameEng: 'ICED Americano (Hazelnut + Espresso Shot)' },
  { id: 'AME_HOT_SUGAR_SHOT', category: 'AMERICANO', nameKr: 'HOT 아메리카노(설탕+샷추가)', nameEng: 'HOT Americano (Sugar + Espresso Shot)' },
  { id: 'AME_ICED_SUGAR_SHOT', category: 'AMERICANO', nameKr: 'ICED 아메리카노(설탕+샷추가)', nameEng: 'ICED Americano (Sugar + Espresso Shot)' },

  // 2. 커피라떼
  { id: 'LAT_HOT_LIGHT', category: 'COFFEE_LATTE', nameKr: 'HOT 카페라떼(연하게)', nameEng: 'HOT Cafe Latte (Light)' },
  { id: 'LAT_ICED_LIGHT', category: 'COFFEE_LATTE', nameKr: 'ICED 카페라떼(연하게)', nameEng: 'ICED Cafe Latte (Light)' },
  { id: 'LAT_HOT', category: 'COFFEE_LATTE', nameKr: 'HOT 카페라떼', nameEng: 'HOT Cafe Latte' },
  { id: 'LAT_ICED', category: 'COFFEE_LATTE', nameKr: 'ICED 카페라떼', nameEng: 'ICED Cafe Latte' },
  { id: 'LAT_HOT_ADD_SHOT', category: 'COFFEE_LATTE', nameKr: 'HOT 카페라떼(샷추가)', nameEng: 'HOT Cafe Latte with Espresso Shot' },
  { id: 'LAT_ICED_ADD_SHOT', category: 'COFFEE_LATTE', nameKr: 'ICED 카페라떼(샷추가)', nameEng: 'ICED Cafe Latte with Espresso Shot' },
  { id: 'LAT_HOT_VANILLA', category: 'COFFEE_LATTE', nameKr: 'HOT 바닐라라떼', nameEng: 'HOT Vanilla Latte' },
  { id: 'LAT_ICED_VANILLA', category: 'COFFEE_LATTE', nameKr: 'ICED 바닐라라떼', nameEng: 'ICED Vanilla Latte' },
  { id: 'LAT_HOT_CARAMEL', category: 'COFFEE_LATTE', nameKr: 'HOT 카라멜마끼야또', nameEng: 'HOT Caramel Macchiato' },
  { id: 'LAT_ICED_CARAMEL', category: 'COFFEE_LATTE', nameKr: 'ICED 카라멜마끼야또', nameEng: 'ICED Caramel Macchiato' },
  { id: 'LAT_HOT_HAZEL', category: 'COFFEE_LATTE', nameKr: 'HOT 헤이즐넛라떼', nameEng: 'HOT Hazelnut Latte' },
  { id: 'LAT_ICED_HAZEL', category: 'COFFEE_LATTE', nameKr: 'ICED 헤이즐넛라떼', nameEng: 'ICED Hazelnut Latte' },
  { id: 'LAT_HOT_MOCHA', category: 'COFFEE_LATTE', nameKr: 'HOT 카페모카', nameEng: 'HOT Cafe Mocha' },
  { id: 'LAT_ICED_MOCHA', category: 'COFFEE_LATTE', nameKr: 'ICED 카페모카', nameEng: 'ICED Cafe Mocha' },
  { id: 'LAT_HOT_PPASHOT', category: 'COFFEE_LATTE', nameKr: 'HOT 빠샷츄', nameEng: 'HOT Banana Latte with Espresso Shot' },
  { id: 'LAT_ICED_PPASHOT', category: 'COFFEE_LATTE', nameKr: 'ICED 빠샷츄', nameEng: 'ICED Banana Latte with Espresso Shot' },
  { id: 'LAT_HOT_GSHOT', category: 'COFFEE_LATTE', nameKr: 'HOT 그샷츄', nameEng: 'HOT Green Tea Latte with Espresso Shot' },
  { id: 'LAT_ICED_GSHOT', category: 'COFFEE_LATTE', nameKr: 'ICED 그샷츄', nameEng: 'ICED Green Tea Latte with Espresso Shot' },
  { id: 'LAT_HOT_SUGAR', category: 'COFFEE_LATTE', nameKr: 'HOT 카페라떼(설탕)', nameEng: 'HOT Cafe Latte with Sugar' },
  { id: 'LAT_ICED_SUGAR', category: 'COFFEE_LATTE', nameKr: 'ICED 카페라떼(설탕)', nameEng: 'ICED Cafe Latte with Sugar' },
  { id: 'LAT_HOT_MINT', category: 'COFFEE_LATTE', nameKr: 'HOT 민트샷라떼', nameEng: 'HOT Mint Shot Latte' },
  { id: 'LAT_ICED_MINT', category: 'COFFEE_LATTE', nameKr: 'ICED 민트샷라떼', nameEng: 'ICED Mint Shot Latte' },
  { id: 'LAT_HOT_CHESTNUT', category: 'COFFEE_LATTE', nameKr: 'HOT 공주밤프레소', nameEng: 'HOT Gongju Chestnut Espresso' },
  { id: 'LAT_ICED_CHESTNUT', category: 'COFFEE_LATTE', nameKr: 'ICED 공주밤프레소', nameEng: 'ICED Gongju Chestnut Espresso' },
  { id: 'LAT_HOT_GOGUMA', category: 'COFFEE_LATTE', nameKr: 'HOT 군고구마샷라떼', nameEng: 'HOT Sweet Potato Shot Latte' },
  { id: 'LAT_ICED_GOGUMA', category: 'COFFEE_LATTE', nameKr: 'ICED 군고구마샷라떼', nameEng: 'ICED Sweet Potato Shot Latte' },

  // 3. 생우유라떼
  { id: 'MILK_HOT_CHOCO', category: 'MILK_LATTE', nameKr: 'HOT 초코라떼', nameEng: 'HOT Chocolate Latte' },
  { id: 'MILK_ICED_CHOCO', category: 'MILK_LATTE', nameKr: 'ICED 초코라떼', nameEng: 'ICED Chocolate Latte' },
  { id: 'MILK_ICED_STRAWBERRY', category: 'MILK_LATTE', nameKr: 'ICED 딸기라떼', nameEng: 'ICED Strawberry Latte' },
  { id: 'MILK_ICED_STRAWBERRY_CHOCO', category: 'MILK_LATTE', nameKr: 'ICED 딸기초코라떼', nameEng: 'ICED Strawberry Chocolate Latte' },
  { id: 'MILK_HOT_BROWN_SUGAR', category: 'MILK_LATTE', nameKr: 'HOT 흑당라떼', nameEng: 'HOT Brown Sugar Milk Latte' },
  { id: 'MILK_ICED_BROWN_SUGAR', category: 'MILK_LATTE', nameKr: 'ICED 흑당라떼', nameEng: 'ICED Brown Sugar Milk Latte' },
  { id: 'MILK_ICED_PLUM_PEACH', category: 'MILK_LATTE', nameKr: 'ICED 플럼피치라떼', nameEng: 'ICED Plum Peach Latte' },
  { id: 'MILK_ICED_STRAWBERRY_BANANA', category: 'MILK_LATTE', nameKr: 'ICED 딸기바나나라떼', nameEng: 'ICED Strawberry Banana Latte' },
  { id: 'MILK_HOT_CHOCO_BANANA', category: 'MILK_LATTE', nameKr: 'HOT 초코바나나라떼', nameEng: 'HOT Chocolate Banana Latte' },
  { id: 'MILK_ICED_CHOCO_BANANA', category: 'MILK_LATTE', nameKr: 'ICED 초코바나나라떼', nameEng: 'ICED Chocolate Banana Latte' },
  { id: 'MILK_HOT_ORANGE_VANILLA', category: 'MILK_LATTE', nameKr: 'HOT 오렌지바닐라라떼', nameEng: 'HOT Orange Vanilla Latte' },
  { id: 'MILK_ICED_ORANGE_CARAMEL', category: 'MILK_LATTE', nameKr: 'ICED 오렌지카라멜라떼', nameEng: 'ICED Orange Caramel Latte' },
  { id: 'MILK_HOT_EARL_GREY_CHOCO', category: 'MILK_LATTE', nameKr: 'HOT 얼그레이초코라떼', nameEng: 'HOT Earl Grey Chocolate Latte' },
  { id: 'MILK_ICED_EARL_GREY_CHOCO', category: 'MILK_LATTE', nameKr: 'ICED 얼그레이초코라떼', nameEng: 'ICED Earl Grey Chocolate Latte' },
  { id: 'MILK_HOT_MINT', category: 'MILK_LATTE', nameKr: 'HOT 민트라떼', nameEng: 'HOT Royal Mint Latte' },
  { id: 'MILK_ICED_MINT', category: 'MILK_LATTE', nameKr: 'ICED 민트라떼', nameEng: 'ICED Royal Mint Latte' },
  { id: 'MILK_HOT_MINT_CHOCO', category: 'MILK_LATTE', nameKr: 'HOT 민트초코라떼', nameEng: 'HOT Classic Mint Chocolate Latte' },
  { id: 'MILK_ICED_MINT_CHOCO', category: 'MILK_LATTE', nameKr: 'ICED 민트초코라떼', nameEng: 'ICED Classic Mint Chocolate Latte' },
  { id: 'MILK_HOT_BANANA', category: 'MILK_LATTE', nameKr: 'HOT 바나나라떼', nameEng: 'HOT Rich Banana Latte' },
  { id: 'MILK_ICED_BANANA', category: 'MILK_LATTE', nameKr: 'ICED 바나나라떼', nameEng: 'ICED Rich Banana Latte' },
  { id: 'MILK_HOT_VANILLA_CARAMEL', category: 'MILK_LATTE', nameKr: 'HOT 바닐라카라멜', nameEng: 'HOT Vanilla Caramel Milk' },
  { id: 'MILK_ICED_VANILLA_CARAMEL', category: 'MILK_LATTE', nameKr: 'ICED 바닐라카라멜', nameEng: 'ICED Vanilla Caramel Milk' },
  { id: 'MILK_HOT_CHESTNUT', category: 'MILK_LATTE', nameKr: 'HOT 공주밤라떼', nameEng: 'HOT Gongju Chestnut Latte' },
  { id: 'MILK_ICED_CHESTNUT', category: 'MILK_LATTE', nameKr: 'ICED 공주밤라떼', nameEng: 'ICED Gongju Chestnut Latte' },
  { id: 'MILK_HOT_CHESTNUT_CHOCO', category: 'MILK_LATTE', nameKr: 'HOT 공주밤초코', nameEng: 'HOT Gongju Chestnut Chocolate Latte' },
  { id: 'MILK_ICED_CHESTNUT_CHOCO', category: 'MILK_LATTE', nameKr: 'ICED 공주밤초코', nameEng: 'ICED Gongju Chestnut Chocolate Latte' },
  { id: 'MILK_HOT_GOGUMA', category: 'MILK_LATTE', nameKr: 'HOT 군고구마라떼', nameEng: 'HOT Sweet Potato Latte' },
  { id: 'MILK_ICED_GOGUMA', category: 'MILK_LATTE', nameKr: 'ICED 군고구마라떼', nameEng: 'ICED Sweet Potato Latte' },
  { id: 'MILK_HOT_GOGUMA_CHOCO', category: 'MILK_LATTE', nameKr: 'HOT 군고구마초코라떼', nameEng: 'HOT Sweet Potato Chocolate Latte' },
  { id: 'MILK_ICED_GOGUMA_CHOCO', category: 'MILK_LATTE', nameKr: 'ICED 군고구마초코라떼', nameEng: 'ICED Sweet Potato Chocolate Latte' },
  { id: 'MILK_HOT_GREEN_TEA', category: 'MILK_LATTE', nameKr: 'HOT 녹차라떼', nameEng: 'HOT Green Tea Latte' },
  { id: 'MILK_ICED_GREEN_TEA', category: 'MILK_LATTE', nameKr: 'ICED 녹차라떼', nameEng: 'ICED Green Tea Latte' },
  { id: 'MILK_HOT_GREEN_TEA_CHOCO', category: 'MILK_LATTE', nameKr: 'HOT 녹차초코라떼', nameEng: 'HOT Matcha Chocolate Duo Latte' },
  { id: 'MILK_ICED_GREEN_TEA_CHOCO', category: 'MILK_LATTE', nameKr: 'ICED 녹차초코라떼', nameEng: 'ICED Matcha Chocolate Duo Latte' },
  { id: 'MILK_HOT_GONGJU_WATGUMA', category: 'MILK_LATTE', nameKr: 'HOT 공주왔구마', nameEng: 'HOT Gongju Watguma Chestnuts Sweet Potato' },

  // 4. 에이드 / 기타음료
  { id: 'ADE_ICED_GREEN_GRAPE', category: 'ADE_ETC', nameKr: 'ICED 청포도에이드', nameEng: 'ICED Green Grape Ade' },
  { id: 'ADE_ICED_LEMON', category: 'ADE_ETC', nameKr: 'ICED 레몬에이드', nameEng: 'ICED Lemon Ade' },
  { id: 'ADE_ICED_GRAPEFRUIT', category: 'ADE_ETC', nameKr: 'ICED 자몽에이드', nameEng: 'ICED Grapefruit Ade' },
  { id: 'ADE_ICED_PEACH', category: 'ADE_ETC', nameKr: 'ICED 복숭아에이드', nameEng: 'ICED Peach Ade' },
  { id: 'ADE_ICED_HONEY_BLACK_GRAPEFRUIT', category: 'ADE_ETC', nameKr: 'ICED 허니블랙자몽에이드', nameEng: 'ICED Honey Black Grapefruit Ade' },
  { id: 'ADE_ICED_HONEY_BLACK_LEMON', category: 'ADE_ETC', nameKr: 'ICED 허니블랙레몬에이드', nameEng: 'ICED Honey Black Lemon Ade' },
  { id: 'ADE_ICED_ORANGE', category: 'ADE_ETC', nameKr: 'ICED 오렌지에이드', nameEng: 'ICED Orange Ade' },
  { id: 'ADE_ICED_ORANGE_PEACH', category: 'ADE_ETC', nameKr: 'ICED 오렌지피치에이드', nameEng: 'ICED Orange Peach Ade' },
  { id: 'ADE_ICED_PLUM', category: 'ADE_ETC', nameKr: 'ICED 자두에이드', nameEng: 'ICED Plum Ade' },
  { id: 'ADE_ICED_PLUM_PEACH', category: 'ADE_ETC', nameKr: 'ICED 플럼피치에이드', nameEng: 'ICED Plum Peach Ade' },
  { id: 'ADE_ICED_LEMON_STRAWBERRY', category: 'ADE_ETC', nameKr: 'ICED 레몬딸기에이드', nameEng: 'ICED Lemon Strawberry Ade' },
  { id: 'ADE_ICED_STRAWBERRY_GRAPEFRUIT', category: 'ADE_ETC', nameKr: 'ICED 딸기자몽에이드', nameEng: 'ICED Strawberry Grapefruit Ade' },
  { id: 'ADE_ICED_STRAWBERRY', category: 'ADE_ETC', nameKr: 'ICED 딸기에이드', nameEng: 'ICED Strawberry Ade' },
  { id: 'ADE_ICED_BANANA', category: 'ADE_ETC', nameKr: 'ICED 바나나에이드', nameEng: 'ICED Banana Ade' },
  { id: 'ADE_ICED_VANADA_DRINK', category: 'ADE_ETC', nameKr: 'ICED 커반드링크', nameEng: 'ICED Coffee Vanada Smart Drink' },
  { id: 'ADE_ICED_BANANA_DRINK', category: 'ADE_ETC', nameKr: 'ICED 바나나드링크', nameEng: 'ICED Banana Sweet Drink' },
  { id: 'ADE_ICED_EVENING_GLOW', category: 'ADE_ETC', nameKr: 'ICED 이브닝글로우', nameEng: 'ICED Evening Glow Herb Sparkler' },
  { id: 'ADE_ICED_GREEN_FIELD', category: 'ADE_ETC', nameKr: 'ICED 그린필드', nameEng: 'ICED Green Field Lime Sparkler' },
  { id: 'ETC_ICE_MILK', category: 'ADE_ETC', nameKr: 'ICE우유', nameEng: 'ICED Pure Fresh Milk' },
  { id: 'ETC_HOT_MILK', category: 'ADE_ETC', nameKr: 'HOT우유', nameEng: 'HOT Pure Steam Milk' },

  // 5. 티베이스
  { id: 'TEA_HOT_PREMIUM', category: 'TEA_BASE', nameKr: 'HOT 프리미엄티', nameEng: 'HOT Premium Wellness Tea' },
  { id: 'TEA_ICED_PREMIUM', category: 'TEA_BASE', nameKr: 'ICED 프리미엄티', nameEng: 'ICED Premium Wellness Tea' },
  { id: 'TEA_HOT_PEACH', category: 'TEA_BASE', nameKr: 'HOT 복숭아티', nameEng: 'HOT Royal Peach Black Tea' },
  { id: 'TEA_ICED_PEACH', category: 'TEA_BASE', nameKr: 'ICED 복숭아티', nameEng: 'ICED Royal Peach Black Tea' },
  { id: 'TEA_HOT_MILK', category: 'TEA_BASE', nameKr: 'HOT 밀크티', nameEng: 'HOT Classic Royal Milk Tea' },
  { id: 'TEA_ICED_MILK', category: 'TEA_BASE', nameKr: 'ICED 밀크티', nameEng: 'ICED Classic Royal Milk Tea' },
  { id: 'TEA_ICED_STRAWBERRY', category: 'TEA_BASE', nameKr: 'ICED 딸기티', nameEng: 'ICED Sweet Strawberry Red Tea' },
  { id: 'TEA_ICED_STRAWBERRY_MILK', category: 'TEA_BASE', nameKr: 'ICED 딸기밀크티', nameEng: 'ICED Strawberry Royal Milk Tea' },
  { id: 'TEA_HOT_STRAWBERRY_LEMON_EARL', category: 'TEA_BASE', nameKr: 'HOT 딸기레몬 얼그레이티', nameEng: 'HOT Strawberry Lemon Earl Grey Tea' },
  { id: 'TEA_ICED_STRAWBERRY_LEMON_EARL', category: 'TEA_BASE', nameKr: 'ICED 딸기레몬 얼그레이티', nameEng: 'ICED Strawberry Lemon Earl Grey Tea' },
  { id: 'TEA_HOT_BROWN_SUGAR_MILK', category: 'TEA_BASE', nameKr: 'HOT 흑당밀크티', nameEng: 'HOT Brown Sugar Royal Milk Tea' },
  { id: 'TEA_ICED_BROWN_SUGAR_MILK', category: 'TEA_BASE', nameKr: 'ICED 흑당밀크티', nameEng: 'ICED Brown Sugar Royal Milk Tea' },
  { id: 'TEA_HOT_HONEY_GRAPEFRUIT_BLACK', category: 'TEA_BASE', nameKr: 'HOT 허니자몽블랙티', nameEng: 'HOT Honey Grapefruit Black Tea' },
  { id: 'TEA_ICED_HONEY_GRAPEFRUIT_BLACK', category: 'TEA_BASE', nameKr: 'ICED 허니자몽블랙티', nameEng: 'ICED Honey Grapefruit Black Tea' },
  { id: 'TEA_HOT_HONEY_GRAPEFRUIT_LEMON', category: 'TEA_BASE', nameKr: 'HOT 허니자몽레몬티', nameEng: 'HOT Honey Grapefruit Lemon Herbal Tea' },
  { id: 'TEA_ICED_HONEY_GRAPEFRUIT_LEMON', category: 'TEA_BASE', nameKr: 'ICED 허니자몽레몬티', nameEng: 'ICED Honey Grapefruit Lemon Herbal Tea' },
  { id: 'TEA_HOT_EARL_GREY', category: 'TEA_BASE', nameKr: 'HOT 얼그레이티', nameEng: 'HOT Fine Earl Grey Black Tea' },
  { id: 'TEA_ICED_EARL_GREY', category: 'TEA_BASE', nameKr: 'ICED 얼그레이티', nameEng: 'ICED Fine Earl Grey Black Tea' },
  { id: 'TEA_ICED_LEMON_EARL', category: 'TEA_BASE', nameKr: 'ICED 레몬 얼그레이티', nameEng: 'ICED Zesty Lemon Earl Grey Tea' },
  { id: 'TEA_HOT_LEMON', category: 'TEA_BASE', nameKr: 'HOT 레몬차', nameEng: 'HOT Sweet Lemon Citron Tea' },
  { id: 'TEA_ICED_LEMON', category: 'TEA_BASE', nameKr: 'ICED 레몬차', nameEng: 'ICED Sweet Lemon Citron Tea' },
  { id: 'TEA_HOT_GRAPEFRUIT', category: 'TEA_BASE', nameKr: 'HOT 자몽티', nameEng: 'HOT Red Grapefruit Honey Tea' },
  { id: 'TEA_ICED_GRAPEFRUIT', category: 'TEA_BASE', nameKr: 'ICED 자몽티', nameEng: 'ICED Red Grapefruit Honey Tea' },
  { id: 'TEA_HOT_PEACH_MINT', category: 'TEA_BASE', nameKr: 'HOT 피치 민트차', nameEng: 'HOT Sweet Peach Mint Fusion Tea' },
  { id: 'TEA_ICED_PEACH_MINT', category: 'TEA_BASE', nameKr: 'ICED 피치 민트차', nameEng: 'ICED Sweet Peach Mint Fusion Tea' },
  { id: 'TEA_HOT_ORANGE_MINT', category: 'TEA_BASE', nameKr: 'HOT 오렌지민트차', nameEng: 'HOT Zesty Orange Mint Herbal Tea' },
  { id: 'TEA_ICED_ORANGE_MINT', category: 'TEA_BASE', nameKr: 'ICED 오렌지민트차', nameEng: 'ICED Zesty Orange Mint Herbal Tea' }
];

export const getPresetImageAndFlavor = (id: string, nameKr: string) => {
  let image = '';
  let acidity = 0;
  let sweetness = 1;
  let body = 1;
  let bitterness = 1;

  // Real distinctive Supabase storage mapped images - strictly showing only the 14 user-specified items
  const itemImages: Record<string, string> = ITEM_IMAGES;

  if (itemImages[id]) {
    image = itemImages[id];
  }

  if (nameKr.includes('아메리카노') || nameKr.includes('도피오') || nameKr.includes('아샷츄')) {
    acidity = 2;
    sweetness = nameKr.includes('설탕') || nameKr.includes('헤이즐넛') || nameKr.includes('아샷츄') ? 3 : 1;
    body = 3;
    bitterness = nameKr.includes('샷추가') ? 4 : 3;
  } else if (nameKr.includes('라떼') || nameKr.includes('마끼야또') || nameKr.includes('모카') || nameKr.includes('프레소') || nameKr.includes('빠샷츄') || nameKr.includes('그샷츄') || nameKr.includes('왔구마') || nameKr.includes('공주밤초코') || nameKr.includes('군고구마초코')) {
    acidity = nameKr.includes('초코') || nameKr.includes('밀크') || nameKr.includes('구마') || nameKr.includes('밤') ? 0 : 1;
    sweetness = nameKr.includes('초코') || nameKr.includes('바닐라') || nameKr.includes('카라멜') || nameKr.includes('설탕') || nameKr.includes('왔구마') ? 4 : 2;
    body = 4;
    bitterness = nameKr.includes('샷추가') || nameKr.includes('프레소') ? 4 : 2;
  } else if (nameKr.includes('에이드') || nameKr.includes('드링크') || nameKr.includes('글로우') || nameKr.includes('그린필드') || nameKr.includes('분다버그') || nameKr.includes('스파클링') || nameKr.includes('젤리') || nameKr.includes('음료') || nameKr.includes('주스')) {
    acidity = 4;
    sweetness = nameKr.includes('물') || nameKr.includes('생수') ? 0 : 4;
    body = 1;
    bitterness = 1;
  } else if (nameKr.includes('티') || nameKr.includes('차')) {
    acidity = nameKr.includes('레몬') || nameKr.includes('자몽') || nameKr.includes('오렌지') ? 3 : 1;
    sweetness = nameKr.includes('티') && !nameKr.includes('얼그레이티') ? 4 : 1;
    body = nameKr.includes('밀크티') ? 3 : 1;
    bitterness = 1;
  } else if (nameKr.includes('생수') || nameKr.includes('물')) {
    acidity = 0;
    sweetness = 0;
    body = 1;
    bitterness = 1;
  } else if (nameKr.includes('우유')) {
    acidity = 0;
    sweetness = 2;
    body = 3;
    bitterness = 1;
  }

  return { image, acidity, sweetness, body, bitterness };
};

export const getDescription = (nameKr: string) => {
  if (nameKr.includes('아메리카노') && !nameKr.includes('연하게') && !nameKr.includes('샷추가') && !nameKr.includes('헤이즐넛') && !nameKr.includes('설탕')) {
    return '엄선된 고품질 원두를 정밀하게 추출하여 깊고 풍부한 에스프레소 본연의 맛과 향을 선사하는 클래식 아메리카노.';
  }
  if (nameKr.includes('카페라떼') && !nameKr.includes('연하게') && !nameKr.includes('설탕')) {
    return '진한 에스프레소 샷에 신선하고 부드러운 스팀밀크가 어우러져 고소하고 담백한 풍미를 전하는 정통 카페라떼.';
  }
  if (nameKr.includes('카라멜마끼야또') || nameKr.includes('바닐라카라멜') || nameKr.includes('오렌지카라멜')) {
    return '달콤한 카라멜 소스와 부드러운 우유, 진한 에스프레소가 조화를 이루어 깊고 풍부한 달콤함을 선사하는 시그니처 음료.';
  }
  if (nameKr.includes('이브닝글로우') || nameKr.includes('그린필드') || nameKr.includes('드링크')) {
    return '상큼한 과일 베이스와 향긋한 티/허브 에센스가 만나 청량하고 이색적인 리프레시를 선사하는 스마트 에이드 음료.';
  }
  if (nameKr.includes('연하게')) {
    return '부드러운 목넘김과 온화한 아로마를 가벼운 농도로 편안하게 즐길 수 있는 음료.';
  }
  if (nameKr.includes('샷추가')) {
    return '더 깊고 진한 커피 고유의 바디감과 짜릿한 활력을 채워주는 진한 에스프레소 음료.';
  }
  if (nameKr.includes('헤이즐넛')) {
    return '달콤하고 향긋한 프리미엄 헤이즐넛 원액이 입안 가득 그윽하게 머무는 시그니처 블렌드.';
  }
  if (nameKr.includes('설탕')) {
    return '클래식하고 원초적인 달콤한 설탕 시럽이 부드러운 아로마를 더욱 돋우는 음료.';
  }
  if (nameKr.includes('에스프레소도피오')) {
    return '정밀 고압 추출로 크레마가 살아있으며 깊고 풍부한 커피의 정수를 선사하는 정통 더블 샷.';
  }
  if (nameKr.includes('아샷츄')) {
    return '향긋하고 달콤한 복숭아 아이스티와 쌉싸름한 에스프레소 원샷의 중독적이고 이색적인 만남.';
  }
  if (nameKr.includes('초코')) {
    return '진하고 고급스러운 초콜릿 브라운 카카오 파우더와 보드라운 생우유 스팀의 로맨틱한 동행.';
  }
  if (nameKr.includes('딸기')) {
    if (nameKr.includes('라떼')) {
      return '달콤하고 진한 딸기 시럽 베이스와 부드러운 우유가 조화롭게 어우러져 누구나 기분 좋게 즐기는 라떼.';
    }
    if (nameKr.includes('에이드')) {
      return '새콤달콤한 딸기 시럽과 청량한 탄산수가 만나 입안 가득 시원하고 상큼한 리프레시를 선사하는 에이드.';
    }
    return '달콤한 딸기 시럽 베이스에 은은한 차 향이 감돌아 부드럽고 향긋한 여유를 선사하는 블렌딩 티.';
  }
  if (nameKr.includes('밤')) {
    return '포근한 국산 공주 밤의 달콤 고소하고 크리미한 풍미가 지친 일상에 풍성한 영양과 든든한 쉼을 드립니다.';
  }
  if (nameKr.includes('고구마')) {
    return '달콤하게 잘 익은 꿀고구마 페이스트와 따스한 밀크 베이스가 선사하는 웰빙 힐링 드링크.';
  }
  if (nameKr.includes('녹차')) {
    return '제주 유기농 녹차의 싱그럽고 쌉쌀한 초록빛 아우라를 밀크폼과 조화있게 감싸 안은 라떼.';
  }
  if (nameKr.includes('민트')) {
    return '특유의 짜릿하고 상쾌한 민트 시럽의 시원한 리프레시함 and 부드러운 우유가 어우러진 시그니처 민트.';
  }
  if (nameKr.includes('바나나')) {
    if (nameKr.includes('에이드')) {
      return '달콤한 바나나 향 시럽 베이스와 톡 쏘는 탄산수가 어우러져 청량하고 이색적인 매력을 선사하는 탄산 에이드.';
    }
    return '달콤하고 향긋한 바나나 시럽과 부드러운 우유가 조화롭게 만나 든든하고 기분 좋은 달콤함을 전하는 라떼.';
  }
  if (nameKr.includes('에이드')) {
    return '상큼하고 진한 과일 시럽 베이스에 청량한 탄산수를 더해 갈증을 시원하게 해소해주는 청량 에이드.';
  }
  if (nameKr.includes('드링크')) {
    return '짜릿함 가득 수분을 바로 보충해주며 피곤한 목소리를 부드럽게 정돈해주는 캐주얼 액티브 드링크.';
  }
  if (nameKr.includes('밀크티') || nameKr.includes('홍차')) {
    return '프리미엄 세작 홍차의 오랜 침출 기술로 깊이를 더하고 실키한 밀크를 블렌딩한 로열 밀크티.';
  }
  if (nameKr.includes('티') || nameKr.includes('차')) {
    if (nameKr.includes('블랙티') || nameKr.includes('홍차') || nameKr.includes('얼그레이')) {
      if (nameKr.includes('자몽') || nameKr.includes('레몬') || nameKr.includes('딸기')) {
        return '달콤한 과일 시럽 베이스에 은은하고 묵직한 홍차 잎의 풍미를 더해 품격 있게 즐기는 블렌딩 티.';
      }
      return '그윽한 홍차 잎을 깔끔하게 우려내어 향긋하고 차분한 몰입을 선사하는 정통 클래식 티.';
    }
    if (nameKr.includes('자몽') || nameKr.includes('레몬') || nameKr.includes('유자') || nameKr.includes('복숭아')) {
      return '새콤달콤한 과일 시럽 베이스의 진한 풍미를 아늑하게 녹여내어 지친 하루에 따스함을 더해주는 차.';
    }
    return '자연의 싱그러운 풍미를 담은 향긋한 허브 잎차와 달콤한 시럽 베이스가 조화롭게 스며든 힐링 블렌딩 티.';
  }
  if (nameKr.includes('분다버그')) {
    return '오스트레일리아 전통 발효 공법으로 풍부한 탄산 천연 진저와 자몽을 즐기는 프리미엄 소다병.';
  }
  if (nameKr.includes('생수')) {
    return '강원 소백산 청정 암반수로 미네랄과 상쾌한 수분 밸런스를 가볍게 공급하는 순수 보틀 생수.';
  }
  if (nameKr.includes('물')) {
    return '깨끗하게 여과되어 언제든지 편안하게 마시기 좋은 최고 품질의 기본 음용수.';
  }
  if (nameKr.includes('우유')) {
    return '1A등급 신선하고 순수한 원유의 고소한 풍미가 속을 따뜻하고 든든하게 채워줍니다.';
  }
  return '카페 헤이스트만의 프리미엄 스마트 레시피가 만나 깊고 부드러운 풍미를 선물하는 대표 음료.';
};

const getDrinkPrice = (id: string, category: string, nameKr: string): number => {
  if (category === 'AMERICANO') {
    if (nameKr.includes('샷추가') || nameKr.includes('헤이즐넛') || nameKr.includes('설탕')) return 2000;
    return 1500;
  }
  if (category === 'COFFEE_LATTE') {
    if (nameKr.includes('바닐라') || nameKr.includes('카라멜') || nameKr.includes('모카') || nameKr.includes('초코') || nameKr.includes('민트')) return 3500;
    return 3000;
  }
  if (category === 'MILK_LATTE') {
    return 3500;
  }
  if (category === 'ADE_ETC') {
    return 3800;
  }
  if (category === 'TEA_BASE') {
    return 3000;
  }
  return 2500;
};

// Map raw menu items to database and frontend matching specifications
export const COMPILED_MENU_ITEMS: any[] = RAW_MENU_ITEMS.map(raw => {
  const flavor = getPresetImageAndFlavor(raw.id, raw.nameKr);
  const desc = getDescription(raw.nameKr);
  const isSig = ['AME_HOT_LIGHT', 'AME_ICED_LIGHT', 'AME_HOT', 'AME_ICED'].includes(raw.id);

  return {
    id: raw.id,
    name: raw.nameEng,
    name_kr: raw.nameKr, // For backend DB seeds
    nameKr: raw.nameKr,  // For React hydration fallback compatibility
    category: raw.category,
    image: flavor.image,
    description: desc,
    acidity: flavor.acidity,
    sweetness: flavor.sweetness,
    body: flavor.body,
    bitterness: flavor.bitterness,
    price: getDrinkPrice(raw.id, raw.category, raw.nameKr),
    visible: 1,
    isSignature: isSig,
    is_signature: isSig ? 1 : 0
  };
});
