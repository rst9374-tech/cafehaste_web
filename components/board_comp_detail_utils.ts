// board_comp_detail_utils.ts
// 순수 유틸 함수 및 ThemeConfig 타입 분리

export interface ThemeConfig {
  name: string;
  bgClass: string;
  textColor: string;
  pointColor: string;
  borderColor: string;
  barColor: string;
  tipBg: string;
  tipBorder: string;
  tipText: string;
  badgeBg: string;
  badgeText: string;
  bulletColor: string;
  fontSize: string;
  lineHeight: string;
  fontFamily: string;
  layoutType: string;
  customFrameClass?: string;
}

export const extractVideoUrlFromContent = (content: string): string | null => {
  if (!content) return null;
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = content.match(ytRegex);
  if (ytMatch) {
    return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  }
  const mp4Regex = /(https?:\/\/[^\s\n\r]+\.mp4)/i;
  const mp4Match = content.match(mp4Regex);
  if (mp4Match) {
    return mp4Match[1];
  }
  return null;
};

export const preprocessContent = (text: string): string => {
  if (!text) return '';
  let processed = text;

  const headers = [
    '장애\\s*상황:',
    '원인:',
    '해결\\s*방법:',
    '상세\\s*내용:',
    '(?:장조\\s+|장차\\s+)?조치\\s*방법:',
    '조치\\s*방법\\s*및\\s*순서:',
    '조치\\s*순서:',
    'TIP:',
    '팁:',
    '주의:',
    '경고:',
    '참고:'
  ].join('|');
  
  const headersRegex = new RegExp(`([^\\n])(${headers})`, 'gi');
  processed = processed.replace(headersRegex, '$1\n$2');

  const headersPost = [
    '장애\\s*상황:',
    '원인:',
    '해결\\s*방법:',
    '상세\\s*내용:',
    '(?:장조\\s+|장차\\s+)?조치\\s*방법:',
    '조치\\s*방법\\s*및\\s*순서:',
    '조치\\s*순서:'
  ].join('|');
  const headersPostRegex = new RegExp(`(${headersPost})\\s*([^\\n\\s])`, 'gi');
  processed = processed.replace(headersPostRegex, '$1\n$2');

  processed = processed.replace(/\.\s+(이|그|다음|먼저|후|마지막으로|이후)\s/g, '.\n$1 ');

  return processed;
};

export const parseDirectDealInfo = (content: string) => {
  if (!content) return null;
  const dealInfoMatch = content.match(/\[직거래 정보\]\s*\n([\s\S]*?)(?=\[상세 설명\]|$)/);
  if (!dealInfoMatch) return null;

  const infoText = dealInfoMatch[1];
  const statusMatch = infoText.match(/- 거래 상태:\s*([^\n]+)/);
  const modelMatch = infoText.match(/- 기기 기종:\s*([^\n]+)/);
  const openMatch = infoText.match(/- 최초 오픈:\s*([^\n]+)/);
  const priceMatch = infoText.match(/- 판매 가격:\s*([^\n]+)/);
  const rentalMatch = infoText.match(/- 렌탈 유무:\s*([^\n]+)/);

  return {
    status: statusMatch ? statusMatch[1].trim() : '판매중',
    model: modelMatch ? modelMatch[1].trim() : '릴리',
    openYearMonth: openMatch ? openMatch[1].trim() : '미기재',
    price: priceMatch ? priceMatch[1].trim() : '협의',
    rentalType: rentalMatch ? rentalMatch[1].trim() : '렌탈기계'
  };
};

export const cleanDirectDealContent = (content: string) => {
  if (!content) return '';
  const detailIndex = content.indexOf('[상세 설명]');
  if (detailIndex !== -1) {
    return content.substring(detailIndex + 8).trim();
  }
  return content.replace(/\[직거래 정보\]\s*\n[\s\S]*?(?=\n\n|$)/, '').trim();
};

export const transformImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${url.substring(9)}`;
  }
  return url;
};

export const detectTheme = (category: string, content: string, skinType?: number): ThemeConfig => {
  const cat = category || 'Q&A';
  
  if (cat === 'H/W AS업체') {
    return {
      name: 'Safety Shield (안전 보고서)',
      bgClass: 'bg-[#FFF8F8] border-[#FADCD2]',
      textColor: 'text-stone-800',
      pointColor: '#C84B4B',
      borderColor: 'border-[#FADCD2]',
      barColor: 'bg-[#C84B4B]',
      tipBg: 'bg-[#FFF3F3]',
      tipBorder: 'border-l-[#C84B4B]',
      tipText: 'text-red-950',
      badgeBg: 'bg-[#C84B4B]/10',
      badgeText: 'text-[#C84B4B]',
      bulletColor: 'text-[#C84B4B]',
      fontSize: '16px',
      lineHeight: '1.75',
      fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
      layoutType: 'safety',
      customFrameClass: 'border-2 border-red-200/80 rounded-xl p-5 md:p-8 shadow-xs bg-[#FFF9F9]'
    };
  }

  if (cat === '레시피') {
    return {
      name: 'Mellow Tangerine (레시피 매뉴얼)',
      bgClass: 'bg-[#FDF9F6] border-[#F0DFD5]',
      textColor: 'text-stone-800',
      pointColor: '#E28743',
      borderColor: 'border-[#F0DFD5]',
      barColor: 'bg-[#E28743]',
      tipBg: 'bg-[#FAF0E6]',
      tipBorder: 'border-l-[#E28743]',
      tipText: 'text-amber-950',
      badgeBg: 'bg-[#E28743]/10',
      badgeText: 'text-[#E28743]',
      bulletColor: 'text-[#E28743]',
      fontSize: '16px',
      lineHeight: '1.75',
      fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
      layoutType: 'blog',
      customFrameClass: 'border border-[#EBD2C5] rounded-[22px] p-6 shadow-md bg-[#FDF9F7]'
    };
  }

  if (cat === '핵심정보') {
    return {
      name: 'Royal Velvet (핵심 자산 보고서)',
      bgClass: 'bg-[#FAF8FF] border-[#E9E3FF]',
      textColor: 'text-stone-800',
      pointColor: '#6D28D9',
      borderColor: 'border-[#E9E3FF]',
      barColor: 'bg-[#6D28D9]',
      tipBg: 'bg-[#F4F0FF]',
      tipBorder: 'border-l-[#6D28D9]',
      tipText: 'text-purple-950',
      badgeBg: 'bg-[#6D28D9]/10',
      badgeText: 'text-[#6D28D9]',
      bulletColor: 'text-[#6D28D9]',
      fontSize: '16px',
      lineHeight: '1.75',
      fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
      layoutType: 'report',
      customFrameClass: 'border-2 border-[#E1D8FF] rounded-[24px] p-6 shadow-lg bg-[#FAF9FF]'
    };
  }

  if (cat === '장비운영') {
    return {
      name: 'Matte Steel (장비 운영 가이드)',
      bgClass: 'bg-[#F1F5F9] border-[#CBD5E1]',
      textColor: 'text-stone-800',
      pointColor: '#475569',
      borderColor: 'border-[#CBD5E1]',
      barColor: 'bg-[#475569]',
      tipBg: 'bg-[#E2E8F0]',
      tipBorder: 'border-l-[#475569]',
      tipText: 'text-slate-900',
      badgeBg: 'bg-[#475569]/10',
      badgeText: 'text-[#475569]',
      bulletColor: 'text-[#475569]',
      fontSize: '16px',
      lineHeight: '1.75',
      fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
      layoutType: 'technical',
      customFrameClass: 'border border-slate-300 rounded-2xl p-5 md:p-8 shadow-sm bg-[#F8FAFC]'
    };
  }
  
  if (cat === '운용가이드' || cat === '노하우팁' || cat === 'TEST') {
    return {
      name: 'Technical Navy (기술 매뉴얼)',
      bgClass: 'bg-[#F4F8FB] border-[#D0DFEB]',
      textColor: 'text-stone-800',
      pointColor: '#2F527E',
      borderColor: 'border-[#D0DFEB]',
      barColor: 'bg-[#2F527E]',
      tipBg: 'bg-[#EBF3FA]',
      tipBorder: 'border-l-[#2F527E]',
      tipText: 'text-blue-950',
      badgeBg: 'bg-[#2F527E]/10',
      badgeText: 'text-[#2F527E]',
      bulletColor: 'text-[#2F527E]',
      fontSize: '16px',
      lineHeight: '1.75',
      fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
      layoutType: 'technical',
      customFrameClass: 'border border-slate-250 rounded-2xl p-5 md:p-8 shadow-sm bg-[#F5F8FA]'
    };
  }
  
  if (cat === 'Q&A' || cat === '문의사항') {
    return {
      name: 'Modern Forest (블로그 에세이)',
      bgClass: 'bg-[#F7F9F5] border-[#DCE4D7]',
      textColor: 'text-stone-800',
      pointColor: '#4A6B53',
      borderColor: 'border-[#DCE4D7]',
      barColor: 'bg-[#4A6B53]',
      tipBg: 'bg-[#F0F4ED]',
      tipBorder: 'border-l-[#4A6B53]',
      tipText: 'text-emerald-950',
      badgeBg: 'bg-[#4A6B53]/10',
      badgeText: 'text-[#4A6B53]',
      bulletColor: 'text-[#4A6B53]',
      fontSize: '16px',
      lineHeight: '1.75',
      fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
      layoutType: 'blog',
      customFrameClass: 'border border-[#D0DEC9] rounded-[24px] p-6 md:p-9 shadow-md bg-[#F7FAF6]'
    };
  }
  
  if (cat === '공동구매' || cat === '직거래') {
    return {
      name: 'Minimal Slate (뉴스 칼럼)',
      bgClass: 'bg-[#F6F7F9] border-[#DFE2E6]',
      textColor: 'text-stone-800',
      pointColor: '#5A6578',
      borderColor: 'border-[#DFE2E6]',
      barColor: 'bg-[#5A6578]',
      tipBg: 'bg-[#EDEFF2]',
      tipBorder: 'border-l-[#5A6578]',
      tipText: 'text-slate-900',
      badgeBg: 'bg-[#5A6578]/10',
      badgeText: 'text-[#5A6578]',
      bulletColor: 'text-[#5A6578]',
      fontSize: '16px',
      lineHeight: '1.75',
      fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
      layoutType: 'news',
      customFrameClass: 'border-t-4 border-b-4 border-stone-800 rounded-none p-5 md:p-9 bg-white shadow-xs'
    };
  }
  
  // Default: Classic Gold
  return {
    name: 'Classic Gold (공식 보고서)',
    bgClass: 'bg-[#FDFBF7] border-[#EADCC3]',
    textColor: 'text-stone-800',
    pointColor: '#C5A059',
    borderColor: 'border-[#EADCC3]',
    barColor: 'bg-stone-950',
    tipBg: 'bg-[#FAF6F0]',
    tipBorder: 'border-l-[#C5A059]',
    tipText: 'text-amber-950',
    badgeBg: 'bg-[#C5A059]/10',
    badgeText: 'text-[#C5A059]',
    bulletColor: 'text-[#C5A059]',
    fontSize: '16px',
    lineHeight: '1.75',
    fontFamily: '"Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif',
    layoutType: 'report',
    customFrameClass: 'border-2 border-double border-[#C5A059] p-6 md:p-10 shadow-lg bg-[#FDFBF9]'
  };
};
