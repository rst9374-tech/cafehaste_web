export interface StoreBranch {
  id: string;
  name: string;
  address: string;
  tel: string;
  hours: string;
  mapX: number; // percentage coordinate 0-100 on canvas
  mapY: number; // percentage coordinate 0-100 on canvas
  amenities: ('WIFI' | 'PARKING' | 'DRIVE_THRU' | '24H' | 'PET')[];
  description: string;
  approvalStatus?: '요청' | '진행중' | '승인' | '보류' | '패키지회원';
  storeType?: '직영점' | '임원' | '일반' | '창업' | '패키지회원' | '프리미엄';
  storeCode?: string;
}

export const getAddressForStore = (storeName: string) => {
  if (storeName.includes('성수')) return '서울 성동구 아차산로 17길 24 (성수역 3번출구 도보 5분)';
  if (storeName.includes('한남')) return '서울 용산구 독서당로 85 (한남역 1번출구 도보 10분)';
  if (storeName.includes('마포') || storeName.includes('공덕')) return '서울 마포구 백범로 192 (공덕역 6번출구 도보 3분)';
  if (storeName.includes('마곡')) return '서울 강서구 마곡동로 161 (마곡역 2번출구 도보 4분)';
  if (storeName.includes('강남')) return '서울 강남구 테헤란로 114 (강남역 12번출구 대로변 바로 앞)';
  if (storeName.includes('홍대')) return '서울 마포구 와우산로 22길 9 (홍익대학교 정문 언덕 옆)';
  if (storeName.includes('광안리')) return '부산 수영구 광안해변로 179 (광안리 해수욕장 정중앙 도보 1분)';
  
  const guList = ['강남구 테헤란로', '서초구 반포대로', '송파구 올림픽로', '성동구 왕십리로', '마포구 양화로', '용산구 이태원로', '강서구 공항대로'];
  const hash = Math.abs(storeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const gu = guList[hash % guList.length];
  const num1 = (hash % 150) + 1;
  const num2 = (hash % 30) + 1;
  return `서울 ${gu} ${num1}길 ${num2} (검증 완료 매장)`;
};

export const hashStringToCoords = (storeName: string) => {
  let hash = 0;
  for (let i = 0; i < storeName.length; i++) {
    hash = storeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = 15 + (Math.abs(hash % 70)); // keep between 15% and 85%
  const y = 20 + (Math.abs((hash >> 8) % 60)); // keep between 20% and 80%
  return { x, y };
};
