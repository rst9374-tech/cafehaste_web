import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, HelpCircle, Layers, Coffee, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import standardProducts from '../admin/standard_products.json';

interface GroupedProduct {
  tossName: string;
  tossCode: string;
  category: string;
  basePrice: number;
  dbImage: string;
  dbId: string;
}

export const LillyDashboardToss: React.FC = () => {
  const [selectedCup, setSelectedCup] = useState<string>('G');
  const [secondaryBean, setSecondaryBean] = useState<string>('D'); // 'D' = 디카페인, 'P' = 프리미엄
  const [includeDessert, setIncludeDessert] = useState<string>('N'); // 'N' = 미노출, 'Y' = 노출

  // Option price configurations editable by the user
  const [shotPrice, setShotPrice] = useState<number>(500);
  const [sugarPrice, setSugarPrice] = useState<number>(500);
  const [secondaryBeanPrice, setSecondaryBeanPrice] = useState<number>(1000);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [defaultTemp, setDefaultTemp] = useState<'HOT' | 'ICE'>(() => {
    return (localStorage.getItem('toss_default_temp') as any) || 'ICE';
  });

  // Load custom option prices from localStorage on mount
  useEffect(() => {
    const savedShot = localStorage.getItem('toss_opt_price_shot');
    const savedSugar = localStorage.getItem('toss_opt_price_sugar');
    const savedBean = localStorage.getItem('toss_opt_price_bean');
    if (savedShot) setShotPrice(Number(savedShot));
    if (savedSugar) setSugarPrice(Number(savedSugar));
    if (savedBean) setSecondaryBeanPrice(Number(savedBean));

    fetch('/api/menu-items')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.items)) {
          setMenuItems(data.items);
        }
      })
      .catch(err => {
        console.error('Failed to load menu items for Toss mapping:', err);
      });
  }, []);

  const handleShotPriceChange = (val: number) => {
    setShotPrice(val);
    localStorage.setItem('toss_opt_price_shot', String(val));
  };

  const handleSugarPriceChange = (val: number) => {
    setSugarPrice(val);
    localStorage.setItem('toss_opt_price_sugar', String(val));
  };

  const handleSecondaryBeanPriceChange = (val: number) => {
    setSecondaryBeanPrice(val);
    localStorage.setItem('toss_opt_price_bean', String(val));
  };

  const getCleanName = (name: string): string => {
    let clean = name
      .replace(/^(HOT|ICED|아이스|핫)[\s_]+/i, '') // Remove temperature prefixes
      .replace(/\(설탕\)|\(헤이즐넛\)|\(샷추가\)|\(설탕\)\(샷추가\)|\(헤이즐넛\)\(샷추가\)/gi, '') // Remove option suffixes
      .replace(/_MV|_G|_V|_M/gi, '') // Remove size identifiers
      .replace(/_/g, ' ')
      .trim();

    // 1. Group Double Ahshotchu under Ahshotchu (but keep Ahshotchu separate from Peach Tea/Ade)
    if (clean.includes('더블아샷추') || clean.includes('아샷추')) {
      return '아샷추';
    }

    // 2. Map Fruit combinations to their Ade variant as the primary base product name
    if (clean.includes('레몬차') || clean.includes('레몬에이드')) return '레몬에이드';
    if (clean.includes('자몽차') || clean.includes('자몽에이드')) return '자몽에이드';
    if (clean.includes('자두차') || clean.includes('자두에이드')) return '자두에이드';
    if (clean.includes('오미자차') || clean.includes('오미자에이드')) return '오미자에이드';
    if (clean.includes('복숭아티') || clean.includes('복숭아에이드')) return '복숭아에이드';
    if (clean.includes('허니레몬블랙티') || clean.includes('허니레몬블랙에이드')) return '허니레몬블랙에이드';
    if (clean.includes('허니자몽블랙티') || clean.includes('허니자몽블랙에이드')) return '허니자몽블랙에이드';

    // 3. Map HOT/ICE milk to a single product name '우유'
    if (clean.includes('우유')) return '우유';

    return clean;
  };

  const getCoreName = (name: string): string => {
    let clean = (name || '')
      .replace(/[\s_\-\(\)\[\]\+]/g, '')
      .toLowerCase();
    
    // Normalize '차' to '티' to match Tea base items (e.g. 자몽차 -> 자몽티)
    clean = clean.replace(/차/g, '티');
    
    const tags = ['iced', 'hot', 'grande', 'venti', 'mini', 'g', 'v', 'mv', '아이스', '핫'];
    let changed = true;
    while (changed) {
      changed = false;
      for (const tag of tags) {
        if (clean.startsWith(tag)) {
          clean = clean.substring(tag.length);
          changed = true;
        }
        if (clean.endsWith(tag)) {
          clean = clean.substring(0, clean.length - tag.length);
          changed = true;
        }
      }
    }
    return clean;
  };

  const getProcessedProducts = (): GroupedProduct[] => {
    // 1. Group the active database menu items (synced from Google Sheet) by clean name after applying diet filters
    const groups: { [key: string]: any[] } = {};
    menuItems.forEach((item: any) => {
      const cat = (item.category || '').toUpperCase();
      const isDessertOrGoods = cat.includes('DESSERT') || cat.includes('BAKERY') || cat.includes('GOODS') || cat.includes('FOOD') || (item.name_kr || '').includes('디저트');
      if (isDessertOrGoods) return;

      const isSetProduct = cat.includes('SET') || (item.name_kr || '').includes('세트') || (item.name || '').toUpperCase().includes('SET');
      if (isSetProduct) return;

      // EXCLUSIONS FOR MENU DIET / SIMPLIFICATION
      const nameUpper = (item.name_kr || '').toUpperCase();
      
      // 1. Exclude '연하게' or '설탕/헤이즐넛 믹스' coffee items (handled as options)
      if (nameUpper.includes('연하게') || nameUpper.includes('설탕') || nameUpper.includes('헤이즐넛+')) return;

      // 2. Exclude '샷추가' mixed drinks EXCEPT '아샷추' (handled as espresso shot options under their bases)
      const isShotMix = nameUpper.includes('그샷추') || nameUpper.includes('빠샷추') || nameUpper.includes('말차샷라떼') || nameUpper.includes('민트샷라떼') || nameUpper.includes('군고구마샷라떼');
      if (isShotMix) return;

      // 3. Exclude hybrid fruit mixes (handled as extra fruit options under base Ade/Tea)
      const isFruitMix = nameUpper.includes('레몬딸기') || nameUpper.includes('피치딸기') || nameUpper.includes('바나나레몬') || nameUpper.includes('바나나자몽') || nameUpper.includes('오렌지피치') || nameUpper.includes('플럼피치') || nameUpper.includes('딸기자몽');
      if (isFruitMix) return;

      // 4. Exclude seasonal jelly-ball or bubble drinks
      const isJellyBall = nameUpper.includes('커반볼') || nameUpper.includes('블랙볼') || nameUpper.includes('플럼볼') || nameUpper.includes('그린볼') || nameUpper.includes('피치레몬볼') || nameUpper.includes('커반드링크') || nameUpper.includes('바나나드링크') || nameUpper.includes('냉수') || nameUpper.includes('온수');
      if (isJellyBall) return;

      // 5. Exclude milk base merges (hazelnut mixes, choux mixes, sweet potato mixes, chocolate mixes)
      const isHazelnutMix = nameUpper.includes('바나나헤이즐넛') || nameUpper.includes('초콜릿헤이즐넛') || nameUpper.includes('카라멜헤이즐넛') || nameUpper.includes('그린티헤이즐넛');
      if (isHazelnutMix) return;

      const isChouxMix = nameUpper.includes('얼그레이슈크림') || nameUpper.includes('딸기슈크림');
      if (isChouxMix) return;

      const isSweetPotatoMix = nameUpper.includes('군고구마초코') || nameUpper.includes('군고구마그린티') || nameUpper.includes('군고구마카라멜') || nameUpper.includes('군고구마말차');
      if (isSweetPotatoMix) return;

      const isChocoMix = nameUpper.includes('초코바나나') || nameUpper.includes('녹차초코') || nameUpper.includes('말차초코') || nameUpper.includes('얼그레이초코') || nameUpper.includes('딸기초코') || nameUpper.includes('민트초코') || nameUpper.includes('공주초코밤');
      if (isChocoMix) return;

      const isChestnutMix = nameUpper.includes('공주밤그레이') || nameUpper.includes('공주밤이') || nameUpper.includes('공주밤초코');
      if (isChestnutMix) return;

      const isVanillaMix = nameUpper.includes('오렌지바닐라') || nameUpper.includes('플럼바닐라') || nameUpper.includes('바닐라카라멜') || nameUpper.includes('바나나카라멜') || nameUpper.includes('오렌지카라멜');
      if (isVanillaMix) return;

      const cleanName = getCleanName(item.name_kr || item.name || '');
      if (!groups[cleanName]) {
        groups[cleanName] = [];
      }
      groups[cleanName].push(item);
    });

    // 2. Convert groups into single Toss products, looking up the size-specific code from standard_products.json
    const result: GroupedProduct[] = [];
    
    Object.entries(groups).forEach(([cleanName, items]) => {
      // Find the corresponding item in standard_products.json that matches the selected cup size
      const sizeMatchedProducts = standardProducts.filter((p: any) => {
        const code = p.v4Code || '';
        if (code.length === 0) return false;
        
        const cupChar = code[0].toUpperCase();
        if (cupChar !== selectedCup) return false;

        // Exclude Decaf/Premium base products from being the representative product
        if (code.length >= 2) {
          const beanChar = code[1].toUpperCase();
          if (beanChar === 'D' || beanChar === 'P') return false;
        }

        const pClean = getCleanName(p.name);
        return pClean === cleanName;
      });

      let tossCode = '';
      let basePrice = 3000;
      let categoryLabel = '에이드';

      if (sizeMatchedProducts.length > 0) {
        // Pick the cleanest one (prefer standard 'S', matching defaultTemp, and no option suffix)
        let baseItem = sizeMatchedProducts.find((p: any) => {
          const nameUpper = p.name.toUpperCase();
          const codeUpper = p.v4Code.toUpperCase();
          const matchesTemp = defaultTemp === 'HOT' ? nameUpper.includes('HOT') : (nameUpper.includes('ICE') || nameUpper.includes('아이스'));
          const isStandardBean = codeUpper.length >= 2 ? codeUpper[1] === 'S' : true;
          const hasNoOptions = !p.name.includes('(');
          return matchesTemp && isStandardBean && hasNoOptions;
        });

        if (!baseItem) {
          baseItem = sizeMatchedProducts.find((p: any) => {
            const nameUpper = p.name.toUpperCase();
            const matchesTemp = defaultTemp === 'HOT' ? nameUpper.includes('HOT') : (nameUpper.includes('ICE') || nameUpper.includes('아이스'));
            return matchesTemp && !p.name.includes('(');
          });
        }

        if (!baseItem) {
          baseItem = sizeMatchedProducts.find((p: any) => !p.name.includes('('));
        }

        if (!baseItem) {
          baseItem = sizeMatchedProducts[0];
        }

        tossCode = baseItem.v4Code;
        basePrice = baseItem.price;
        
        // Category mapper
        const getCategoryLabel = (cat: string): string => {
          const c = (cat || '').toUpperCase();
          if (c === '에스프레소' || c === 'ESPRESSO') return '에스프레소';
          if (c === '에스프레소베이스' || c === 'ESPRESSO_BASE') return '에스프레소베이스';
          if (c === '밀크베이스' || c === 'MILK_BASE') return '밀크베이스';
          if (c === '티베이스' || c === 'TEA_BASE') return '티베이스';
          if (c === '에이드' || c === 'ADE') return '에이드';
          return '에이드';
        };
        categoryLabel = getCategoryLabel(baseItem.category);
      } else {
        // Fallback for custom items not in standard catalog
        const baseItem = items[0];
        tossCode = baseItem.id;
        // If the ID starts with 'G' (like GM000123) but they selected 'M', rewrite first char
        if (tossCode && (tossCode[0] === 'G' || tossCode[0] === 'M' || tossCode[0] === 'V') && tossCode.length === 8) {
          tossCode = selectedCup + tossCode.substring(1);
        }
        
        // Try to find price in standardProducts anyway, or default
        const matched = standardProducts.find((p: any) => p.name === baseItem.name_kr || getCleanName(p.name) === cleanName);
        basePrice = matched ? matched.price : 3000;

        const getCategoryLabel = (cat: string): string => {
          const c = (cat || '').toUpperCase();
          if (c === 'AMERICANO') return '에스프레소';
          if (c === 'COFFEE_LATTE') return '에스프레소베이스';
          if (c === 'MILK_LATTE') return '밀크베이스';
          if (c === 'TEA_BASE') return '티베이스';
          if (c === 'ADE_ETC') return '에이드';
          return '기타';
        };
        categoryLabel = getCategoryLabel(baseItem.category);
      }

      // Pick DB image representative based on defaultTemp
      let firstDbItem = items.find(item => {
        const nameUpper = (item.name_kr || item.name || '').toUpperCase();
        return defaultTemp === 'HOT' ? nameUpper.includes('HOT') : (nameUpper.includes('ICE') || nameUpper.includes('아이스'));
      });
      if (!firstDbItem) firstDbItem = items[0];

      result.push({
        tossName: cleanName,
        tossCode: tossCode,
        category: categoryLabel,
        basePrice,
        dbImage: firstDbItem.image || '',
        dbId: firstDbItem.id
      });
    });

    return result;
  };

  const handleDownloadExcel = () => {
    const productsToExport = getProcessedProducts();

    // Create Toss Kiosk Product Excel sheet data
    const excelData = [
      // Toss POS template guide row 1
      {
        '상품이름': '*필수',
        '상품코드': '선택',
        '카테고리': '*필수',
        '가격타입\n(고정 가격 or 시가)': '선택',
        '기본가격 (원)': '*필수',
        '세금': '선택',
        '바코드': '선택',
        '제조사': '선택',
        '재고': '선택',
        '키오스크 노출': '선택',
        '키오스크 상품이름': '선택',
        '키오스크 상품설명': '선택',
        '키오스크 상품이름 🇺🇸': '선택',
        '키오스크 상품설명 🇺🇸': '선택',
        '키오스크 상품이름 🇨🇳': '선택',
        '키오스크 상품설명 🇨🇳': '선택',
        '키오스크 상품이름 🇯🇵': '선택',
        '키오스크 상품설명 🇯🇵': '선택'
      },
      // Toss POS template guide row 2
      {
        '상품이름': '[신규 상품 등록]\n이미 포스에 등록된 상품과 동일한 이름으로 등록할 수 없어요.\n\n* 255자 내로 입력해주세요.',
        '상품코드': '영문, 숫자 최대 50자까지 입력 가능해요.',
        '카테고리': '입력한 카테고리가 생성돼요. \n\n* 20자 내로 입력해주세요.',
        '가격타입\n(고정 가격 or 시가)': "입력 안하면 '고정 가격'으로 등록돼요.",
        '기본가격 (원)': '1~9자리 숫자만 입력 가능해요.',
        '세금': "입력 안하면 '과세'로 등록돼요.",
        '바코드': '바코드를 등록할 수 있어요.',
        '제조사': '* 20자 내로 입력해주세요.',
        '재고': '1-6 자리 숫자만 입력 가능해요.',
        '키오스크 노출': "입력 안하면 '미노출'로 등록돼요.",
        '키오스크 상품이름': '입력 안하면 상품이름과 동일한 값으로 등록돼요.',
        '키오스크 상품설명': '* 800자 내로 입력해주세요.',
        '키오스크 상품이름 🇺🇸': '입력 안하면 영어 선택 시 국문 노출',
        '키오스크 상품설명 🇺🇸': '입력 안하면 영어 선택 시 국문 노출',
        '키오스크 상품이름 🇨🇳': '입력 안하면 중국어 선택 시 국문 노출',
        '키오스크 상품설명 🇨🇳': '입력 안하면 중국어 선택 시 국문 노출',
        '키오스크 상품이름 🇯🇵': '입력 안하면 일본어 선택 시 국문 노출',
        '키오스크 상품설명 🇯🇵': '입력 안하면 일본어 선택 시 국문 노출'
      }
    ];

    productsToExport.forEach(p => {
      excelData.push({
        '상품이름': p.tossName,
        '상품코드': p.tossCode,
        '카테고리': p.category,
        '가격타입\n(고정 가격 or 시가)': '고정 가격',
        '기본가격 (원)': String(p.basePrice),
        '세금': '과세',
        '바코드': '',
        '제조사': '',
        '재고': '',
        '키오스크 노출': '노출',
        '키오스크 상품이름': p.tossName,
        '키오스크 상품설명': '',
        '키오스크 상품이름 🇺🇸': '',
        '키오스크 상품설명 🇺🇸': '',
        '키오스크 상품이름 🇨🇳': '',
        '키오스크 상품설명 🇨🇳': '',
        '키오스크 상품이름 🇯🇵': '',
        '키오스크 상품설명 🇯🇵': ''
      } as any);
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '상품목록');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const cupLabel = selectedCup === 'G' ? '그란데' : selectedCup === 'M' ? '미니벤티' : '벤티';
    const beanLabel = secondaryBean === 'D' ? '디카페인' : '프리미엄';
    a.download = `토스상품등록_${cupLabel}_${beanLabel}_일괄양식.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMappingGuide = () => {
    const guideData = [
      { A: '대표 상품 (Kiosk)', B: '선택 옵션 (Option)', C: '기계 레시피 코드', D: '실제 제조 음료', E: '설명/카테고리' },
      { A: '아메리카노', B: '기본 (HOT)', C: `${selectedCup}S000126`, D: 'HOT 아메리카노', E: '에스프레소' },
      { A: '아메리카노', B: '아이스 (ICE)', C: `${selectedCup}S000127`, D: 'ICED 아메리카노', E: '에스프레소' },
      { A: '아메리카노', B: '샷 조절: 연하게', C: `${selectedCup}S000242`, D: '아메리카노 (연하게)', E: '에스프레소' },
      { A: '아메리카노', B: '에스프레소 샷 추가', C: `${selectedCup}S000146`, D: '아메리카노 (샷추가)', E: '에스프레소' },
      { A: '아메리카노', B: '헤이즐넛 시럽 추가', C: `${selectedCup}S000249`, D: '아메리카노 (헤이즐넛)', E: '에스프레소' },
      { A: '카페라떼', B: '기본 (HOT)', C: `${selectedCup}S000150`, D: 'HOT 카페라떼', E: '에스프레소베이스' },
      { A: '카페라떼', B: '아이스 (ICE)', C: `${selectedCup}S000151`, D: 'ICED 카페라떼', E: '에스프레소베이스' },
      { A: '카페라떼', B: '샷 조절: 연하게', C: `${selectedCup}S000254`, D: '카페라떼 (연하게)', E: '에스프레소베이스' },
      { A: '카페라떼', B: '에스프레소 샷 추가', C: `${selectedCup}S000255`, D: '카페라떼 (샷추가)', E: '에스프레소베이스' },
      { A: '아샷추', B: '기본 (ICE)', C: `${selectedCup}T000233`, D: 'ICED 아샷추 (아이스티 + 1샷)', E: '에스프레소베이스 (아샷추)' },
      { A: '아샷추', B: '에스프레소 샷 추가 (+500원)', C: `${selectedCup}T000567`, D: 'ICED 더블아샷추 (아이스티 + 2샷)', E: '에스프레소베이스 (더블아샷추)' },
      { A: '레몬에이드', B: '기본: 탄산수 (에이드 변경) (+0원)', C: `${selectedCup}A000216`, D: 'ICED 레몬에이드', E: '에이드' },
      { A: '레몬에이드', B: '옵션: 시원한 물 (아이스티 변경) (+0원)', C: `${selectedCup}T000202`, D: 'ICED 레몬차', E: '에이드' },
      { A: '레몬에이드', B: '옵션: 따뜻한 물 (따뜻한 차 변경) (+0원)', C: `${selectedCup}T000201`, D: 'HOT 레몬차', E: '에이드' },
      { A: '자몽에이드', B: '기본: 탄산수 (에이드 변경) (+0원)', C: `${selectedCup}A000218`, D: 'ICED 자몽에이드', E: '에이드' },
      { A: '자몽에이드', B: '옵션: 시원한 물 (아이스티 변경) (+0원)', C: `${selectedCup}T000204`, D: 'ICED 자몽차', E: '에이드' },
      { A: '자몽에이드', B: '옵션: 따뜻한 물 (따뜻한 차 변경) (+0원)', C: `${selectedCup}T000203`, D: 'HOT 자몽차', E: '에이드' },
      { A: '자두에이드', B: '기본: 탄산수 (에이드 변경) (+0원)', C: `${selectedCup}A000220`, D: 'ICED 자두에이드', E: '에이드' },
      { A: '자두에이드', B: '옵션: 시원한 물 (아이스티 변경) (+0원)', C: `${selectedCup}T000206`, D: 'ICED 자두차', E: '에이드' },
      { A: '자두에이드', B: '옵션: 따뜻한 물 (따뜻한 차 변경) (+0원)', C: `${selectedCup}T000205`, D: 'HOT 자두차', E: '에이드' },
      { A: '복숭아에이드', B: '기본: 탄산수 (에이드 변경) (+0원)', C: `${selectedCup}A000222`, D: 'ICED 복숭아에이드', E: '에이드' },
      { A: '복숭아에이드', B: '옵션: 시원한 물 (아이스티 변경) (+0원)', C: `${selectedCup}T000207`, D: 'ICED 복숭아티', E: '에이드' },
      { A: '오미자에이드', B: '기본: 탄산수 (에이드 변경) (+0원)', C: `${selectedCup}A000236`, D: 'ICED 오미자에이드', E: '에이드' },
      { A: '오미자에이드', B: '옵션: 시원한 물 (아이스티 변경) (+0원)', C: `${selectedCup}T000244`, D: 'ICED 오미자차', E: '에이드' },
      { A: '오미자에이드', B: '옵션: 따뜻한 물 (따뜻한 차 변경) (+0원)', C: `${selectedCup}T000243`, D: 'HOT 오미자차', E: '에이드' },
      { A: '허니레몬블랙에이드', B: '기본: 탄산수 (에이드 변경) (+0원)', C: `${selectedCup}A000301`, D: 'ICED 허니레몬블랙에이드', E: '에이드' },
      { A: '허니레몬블랙에이드', B: '옵션: 시원한 물 (아이스티 변경) (+0원)', C: `${selectedCup}T000302`, D: 'ICED 허니레몬블랙티', E: '에이드' },
      { A: '허니자몽블랙에이드', B: '기본: 탄산수 (에이드 변경) (+0원)', C: `${selectedCup}A000303`, D: 'ICED 허니자몽블랙에이드', E: '에이드' },
      { A: '허니자몽블랙에이드', B: '옵션: 시원한 물 (아이스티 변경) (+0원)', C: `${selectedCup}T000304`, D: 'ICED 허니자몽블랙티', E: '에이드' },
      { A: '초코라떼', B: '기본 (HOT)', C: `${selectedCup}M000166`, D: 'HOT 초코라떼', E: '밀크베이스' },
      { A: '초코라떼', B: '아이스 (ICE)', C: `${selectedCup}M000167`, D: 'ICED 초코라떼', E: '밀크베이스' },
      { A: '초코라떼', B: '헤이즐넛 시럽 추가', C: `${selectedCup}M000215`, D: '초콜릿 헤이즐넛 라떼', E: '밀크베이스' },
      { A: '초코라떼', B: '딸기 믹싱 추가 (교차)', C: `${selectedCup}M000179`, D: '딸기 초코 라떼', E: '밀크베이스' },
      { A: '초코라떼', B: '바나나 믹싱 추가 (교차)', C: `${selectedCup}M000173`, D: '초코 바나나 라떼', E: '밀크베이스' },
      { A: '딸기라떼', B: '아이스 (ICE)', C: `${selectedCup}M000170`, D: 'ICED 딸기라떼', E: '밀크베이스' },
      { A: '딸기라떼', B: '초코 믹싱 추가 (교차)', C: `${selectedCup}M000179`, D: '딸기 초코 라떼', E: '밀크베이스' },
      { A: '바나나라떼', B: '아이스 (ICE)', C: `${selectedCup}M000171`, D: 'ICED 바나나라떼', E: '밀크베이스' },
      { A: '바나나라떼', B: '초코 믹싱 추가 (교차)', C: `${selectedCup}M000173`, D: '초코 바나나 라떼', E: '밀크베이스' },
      { A: '바나나라떼', B: '에스프레소 샷 추가', C: `${selectedCup}S000297`, D: 'ICED 빠샷추', E: '밀크베이스 (빠샷추)' },
      { A: '녹차라떼', B: '기본 (HOT)', C: `${selectedCup}M000180`, D: 'HOT 녹차라떼', E: '밀크베이스' },
      { A: '녹차라떼', B: '아이스 (ICE)', C: `${selectedCup}M000181`, D: 'ICED 녹차라떼', E: '밀크베이스' },
      { A: '녹차라떼', B: '에스프레소 샷 추가', C: `${selectedCup}S000240`, D: 'ICED 그샷추', E: '밀크베이스 (그샷추)' },
      { A: '군고구마라떼', B: '기본 (HOT)', C: `${selectedCup}M000580`, D: 'HOT 군고구마라떼', E: '군고구마 시리즈' },
      { A: '군고구마라떼', B: '아이스 (ICE)', C: `${selectedCup}M000581`, D: 'ICED 군고구마라떼', E: '군고구마 시리즈' },
      { A: '군고구마라떼', B: '초코 믹싱 추가', C: `${selectedCup}M000582`, D: '군고구마 초코라떼', E: '군고구마 시리즈' },
      { A: '군고구마라떼', B: '그린티 믹싱 추가', C: `${selectedCup}M000583`, D: '군고구마 그린티라떼', E: '군고구마 시리즈' },
      { A: '군고구마라떼', B: '카라멜 믹싱 추가', C: `${selectedCup}M000584`, D: '군고구마 카라멜라떼', E: '군고구마 시리즈' },
      { A: '군고구마라떼', B: '에스프레소 샷 추가', C: `${selectedCup}S000585`, D: '군고구마 샷라떼', E: '군고구마 시리즈' }
    ];

    // Append only the independent bean option change mapping rows. Other options (shot, syrup) are configured globally.
    const beanName = secondaryBean === 'D' ? '디카페인' : '프리미엄';
    guideData.push(
      { A: '아메리카노', B: `원두 옵션: ${beanName} 변경 (기본)`, C: `${selectedCup}${secondaryBean}000127`, D: `ICED ${beanName} 아메리카노`, E: `원두변경 옵션 (연하게, 샷추가, 시럽 등 세부 옵션은 기존 표준 코드의 'S'를 '${secondaryBean}'로 치환하여 동일 적용)` },
      { A: '카페라떼', B: `원두 옵션: ${beanName} 변경 (기본)`, C: `${selectedCup}${secondaryBean}000151`, D: `ICED ${beanName} 카페라떼`, E: `원두변경 옵션 (연하게, 샷추가, 시럽 등 세부 옵션은 기존 표준 코드의 'S'를 '${secondaryBean}'로 치환하여 동일 적용)` }
    );

    const worksheet = XLSX.utils.json_to_sheet(guideData, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '옵션매핑가이드');

    worksheet['!cols'] = [
      { wch: 22 },
      { wch: 38 },
      { wch: 20 },
      { wch: 35 },
      { wch: 28 }
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const guideUrl = URL.createObjectURL(excelBlob);
    
    const a = document.createElement('a');
    a.href = guideUrl;
    const cupLabel = selectedCup === 'M' ? '미니벤티' : selectedCup === 'G' ? '그란데' : '벤티';
    a.download = `토스옵션조합기준표_${cupLabel}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(guideUrl);
  };

  const handleDownloadZip = async () => {
    const productsToExport = getProcessedProducts();
    const itemsWithImages = productsToExport.filter(p => {
      if (!p.dbImage || p.dbImage.trim() === '') return false;
      const dbItem = menuItems.find(item => item.id === p.dbId);
      if (dbItem) {
        const nameUpper = (dbItem.name_kr || dbItem.name || '').toUpperCase();
        const isHotItem = nameUpper.includes('HOT');
        const isIceItem = nameUpper.includes('ICE') || nameUpper.includes('아이스');
        if (defaultTemp === 'ICE' && isHotItem && !isIceItem) return false;
        if (defaultTemp === 'HOT' && isIceItem && !isHotItem) return false;
      }
      return true;
    });

    if (itemsWithImages.length === 0) {
      alert('매핑 및 다운로드할 이미지가 없습니다.');
      return;
    }

    try {
      setIsDownloading(true);
      const zip = new JSZip();
      let downloadCount = 0;

      for (const map of itemsWithImages) {
        try {
          const res = await fetch(map.dbImage);
          if (!res.ok) continue;

          const blob = await res.blob();
          const extMatch = map.dbImage.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
          const ext = extMatch ? extMatch[1] : 'png';
          
          // Use safe Toss Product Name for filename instead of Code for intuitive visual matching
          const safeName = map.tossName.replace(/[\/\\:\*\?\"<>\|]/g, '_');
          const destFilename = `${safeName}.${ext}`;
          
          // Save directly to the ZIP root (flat structure for easy copy-pasting to USB)
          zip.file(destFilename, blob);
          downloadCount++;
        } catch (err) {
          console.warn(`Failed to download image for ${map.tossName}:`, err);
        }
      }

      if (downloadCount === 0) {
        alert('다운로드할 이미지가 없습니다.');
        setIsDownloading(false);
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const cupLabel = selectedCup === 'G' ? '그란데' : selectedCup === 'M' ? '미니벤티' : '벤티';
      const beanLabel = secondaryBean === 'D' ? '디카페인' : '프리미엄';
      a.download = `토스이미지_${cupLabel}_${beanLabel}_일괄폴더.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`총 ${downloadCount}개의 대표 음료 이미지를 한글 상품명 파일명으로 정제하여 ZIP 압축다운로드 완료했습니다!`);
    } catch (err: any) {
      console.error(err);
      alert(`압축파일 생성 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const processedList = getProcessedProducts();

  return (
    <div className="flex flex-col gap-0 min-h-0 w-full text-left">
      {/* ─── 헤더 (릴리 Header 100% 동일) ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">토스 키오스크 세팅</h1>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">
              토스플레이스 무인 키오스크 API와 릴리 통제 엔진 간의 로컬 연동 상태를 관제합니다.
            </p>
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      <div className="flex w-full flex-col gap-4 px-6 pb-6">
        <div className="w-full bg-[#070609]/95 border border-stone-900 rounded-2xl p-4 md:p-5 text-stone-300 font-sans shadow-lg relative overflow-hidden text-left">
          <div className="absolute inset-0 bg-[radial-gradient(#C5A059_0.5px,transparent_0.5px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none" />
          
          <div className="flex justify-end items-center border-b border-stone-900 pb-3 relative z-10">
            <div className="dashboard-badge-text text-[#C5A059] font-sans bg-[#C5A059]/10 px-2 py-0.5 rounded-xl border border-[#C5A059]/20 shadow-sm font-semibold">DOWNDRAFT READY</div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-3.5 items-start relative z-10">
        {/* Left Settings Panel */}
        <div className="md:col-span-6 flex flex-col gap-3 bg-stone-955/40 p-4 rounded-xl border border-stone-900/60">
          
          <div className="space-y-3 mt-1.5">
            {/* Cup Size */}
            <div>
              <label className="mb-1 text-[13px] font-bold text-white block">1. 컵 사이즈 선택</label>
              <select
                value={selectedCup}
                onChange={(e) => setSelectedCup(e.target.value)}
                className="dashboard-form-control w-full px-3 py-2 border border-stone-800 rounded-lg bg-stone-900 text-stone-200 focus:outline-none cursor-pointer focus:border-[#C5A059] transition-all"
              >
                <option value="G">그란데 (G)</option>
                <option value="M">미니벤티 (M)</option>
                <option value="V">벤티 (V)</option>
              </select>
            </div>

            {/* Coffee Beans */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="dashboard-form-label mb-1">2. 사용 원두 1 (기본)</label>
                <select
                  disabled
                  className="dashboard-form-control w-full px-3 py-2 border border-stone-900 rounded-lg bg-stone-950 text-stone-500 cursor-not-allowed"
                >
                  <option value="S">일반 원두 (S)</option>
                </select>
              </div>

              <div>
                <label className="dashboard-form-label mb-1">3. 사용 원두 2 (부원두)</label>
                <select
                  value={secondaryBean}
                  onChange={(e) => setSecondaryBean(e.target.value)}
                  className="dashboard-form-control w-full px-3 py-2 border border-stone-800 rounded-lg bg-stone-900 text-stone-200 focus:outline-none cursor-pointer focus:border-[#C5A059] transition-all"
                >
                  <option value="D">디카페인 원두 (D)</option>
                  <option value="P">프리미엄 원두 (P)</option>
                </select>
              </div>
            </div>

            {/* Dessert Option */}
            <div>
              <label className="dashboard-form-label mb-1">4. 디저트/상품 포함 여부 (기능 대기)</label>
              <select
                value={includeDessert}
                onChange={(e) => includeDessert}
                className="dashboard-form-control w-full px-3 py-2 border border-stone-800 rounded-lg bg-stone-900 text-stone-200 focus:outline-none cursor-pointer focus:border-[#C5A059] transition-all"
              >
                <option value="N">미노출 (나중에 연동)</option>
                <option value="Y">노출 (준비 중)</option>
              </select>
            </div>

            {/* 기본 온도 설정 */}
            <div>
              <label className="dashboard-form-label mb-1">5. 기본 온도 설정 (HOT/ICE 필터)</label>
              <select
                value={defaultTemp}
                onChange={(e) => {
                  const val = e.target.value as 'HOT' | 'ICE';
                  setDefaultTemp(val);
                  localStorage.setItem('toss_default_temp', val);
                }}
                className="dashboard-form-control w-full px-3 py-2 border border-stone-800 rounded-lg bg-stone-900 text-stone-200 focus:outline-none cursor-pointer focus:border-[#C5A059] transition-all"
              >
                <option value="ICE">아이스 (ICE) 대표 메뉴만 다운로드</option>
                <option value="HOT">따뜻하게 (HOT) 대표 메뉴만 다운로드</option>
              </select>
            </div>

            {/* Option Price Inputs */}
            <div className="border-t border-stone-900/80 pt-3.5 mt-1">
              <span className="dashboard-panel-title flex items-center gap-1.5 mb-2.5">
                <DollarSign className="w-3.5 h-3.5 text-[#C5A059]" />
                옵션 가격 설정 (원)
              </span>
              
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="dashboard-form-label mb-1">샷 추가 가격</label>
                  <input
                    type="number"
                    value={shotPrice}
                    step={100}
                    onChange={(e) => handleShotPriceChange(Number(e.target.value))}
                    className="dashboard-form-control w-full font-mono font-bold px-2 py-1.5 border border-stone-800 rounded-lg bg-stone-900 text-stone-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                
                <div>
                  <label className="dashboard-form-label mb-1">설탕 추가 가격</label>
                  <input
                    type="number"
                    value={sugarPrice}
                    step={100}
                    onChange={(e) => handleSugarPriceChange(Number(e.target.value))}
                    className="dashboard-form-control w-full font-mono font-bold px-2 py-1.5 border border-stone-800 rounded-lg bg-stone-900 text-stone-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="dashboard-form-label mb-1">부원두 추가 가격</label>
                  <input
                    type="number"
                    value={secondaryBeanPrice}
                    step={100}
                    onChange={(e) => handleSecondaryBeanPriceChange(Number(e.target.value))}
                    className="dashboard-form-control w-full font-mono font-bold px-2 py-1.5 border border-stone-800 rounded-lg bg-stone-900 text-stone-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Downloader Panel */}
        <div className="md:col-span-6 bg-stone-900/60 border border-stone-900 p-4 rounded-xl flex flex-col justify-between items-center text-center min-h-[265px] font-sans">
          <div className="w-full space-y-3">
            <span className="dashboard-badge-text text-stone-600 uppercase tracking-widest block font-sans">GENERATED STATUS</span>
            <div className="py-2.5 w-full bg-stone-950/40 border border-stone-900/40 rounded-xl">
              <CheckCircle className="text-emerald-500 mx-auto w-5 h-5 mb-1" />
              <span className="dashboard-card-title text-stone-200 block">맞춤형 메뉴 압축 완료</span>
              <span className="dashboard-badge-text text-[#C5A059] block mt-0.5 font-sans">
                총 {processedList.length}개 대표 상품 자동 생성됨
              </span>
            </div>

            {/* 연동 데이터 실시간 검증 로그 */}
            <div className="bg-stone-955/60 border border-stone-800 p-3 rounded-xl dashboard-desc text-stone-400 font-sans space-y-1.5 text-left">
              <div className="font-bold text-[#C5A059] border-b border-stone-800 pb-1 mb-1 flex justify-between items-center">
                <span>📊 연동 데이터 검증 요약</span>
                <span className="dashboard-badge-text bg-stone-800 text-stone-400 px-1 py-0.2 rounded font-mono font-normal">REALTIME</span>
              </div>
              <div className="flex justify-between">
                <span>일괄등록 엑셀 상품 수 (행 개수):</span>
                <span className="font-bold text-stone-200 font-mono">{processedList.length}개</span>
              </div>
              <div className="flex justify-between">
                <span>다운로드 대상 이미지 수 (ZIP 내 파일):</span>
                <span className="font-bold text-stone-200 font-mono">
                  {processedList.filter(p => {
                    if (!p.dbImage || p.dbImage.trim() === '') return false;
                    const dbItem = menuItems.find(item => item.id === p.dbId);
                    if (dbItem) {
                      const nameUpper = (dbItem.name_kr || dbItem.name || '').toUpperCase();
                      const isHotItem = nameUpper.includes('HOT');
                      const isIceItem = nameUpper.includes('ICE') || nameUpper.includes('아이스');
                      if (defaultTemp === 'ICE' && isHotItem && !isIceItem) return false;
                      if (defaultTemp === 'HOT' && isIceItem && !isHotItem) return false;
                    }
                    return true;
                  }).length}개
                </span>
              </div>
              <div className="dashboard-badge-text text-stone-500 leading-normal pt-1 border-t border-stone-900/50">
                * {defaultTemp === 'HOT' ? 'HOT(따뜻하게) 대표 메뉴 필터' : 'ICE(아이스) 대표 메뉴 필터'}가 적용되어 {defaultTemp === 'HOT' ? '따뜻한 음료 이미지' : '아이스 음료 이미지'} 위주로 ZIP 파일이 패키징됩니다. (아이스 전용 음료는 아이스로 포함)
              </div>
            </div>
          </div>

          <div className="w-full space-y-2 mt-auto">
            {/* Download Excel */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="w-full py-2 px-3 bg-[#070609] hover:bg-stone-900 text-stone-200 hover:text-white border border-stone-800 rounded-xl dashboard-btn-text flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <Download size={11.5} />
              <span>토스 상품 일괄등록 엑셀 다운로드</span>
            </button>

            {/* Download Excel Mapping Guide */}
            <button
              type="button"
              onClick={handleDownloadMappingGuide}
              className="w-full py-2 px-3 bg-[#070609] hover:bg-stone-900 text-stone-200 hover:text-white border border-stone-800 rounded-xl dashboard-btn-text flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <Layers size={11.5} className="text-[#C5A059]" />
              <span>옵션 조합 매핑 가이드 다운로드 (Excel)</span>
            </button>

            {/* Download ZIP */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadZip}
              className="w-full py-2.5 px-3 bg-[#C5A059] hover:bg-[#b08e4d] text-black rounded-xl dashboard-btn-text flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <Coffee size={12} />
              <span>{isDownloading ? '이미지 빌드 중...' : '토스 상품 이미지 ZIP 다운로드'}</span>
            </button>
          </div>
        </div>
      </div>


    </div>
    </div>
    </div>
  );
};
