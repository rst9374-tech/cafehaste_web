// board_comp_write_utils.ts

export interface SkinStyleConfig {
  name: string;
  color: string;
  bgClass: string;
  borderColor: string;
  titleColor: string;
  badgeBg: string;
}

export const getSkinStyle = (category: string): SkinStyleConfig => {
  const cat = category || 'Q&A';
  if (cat === 'TEST') {
    return getSkinStyle('Q&A');
  }
  if (cat === 'H/W AS업체') {
    return {
      name: 'Safety Shield (안전 보고서)',
      color: '#C84B4B',
      bgClass: 'bg-[#FFF8F8]',
      borderColor: 'border-[#FADCD2]',
      titleColor: 'text-[#C84B4B]',
      badgeBg: 'bg-[#C84B4B]/10'
    };
  }
  if (cat === '레시피') {
    return {
      name: 'Mellow Tangerine (레시피 매뉴얼)',
      color: '#E28743',
      bgClass: 'bg-[#FDF9F6]',
      borderColor: 'border-[#F0DFD5]',
      titleColor: 'text-[#E28743]',
      badgeBg: 'bg-[#E28743]/10'
    };
  }
  if (cat === '핵심정보') {
    return {
      name: 'Royal Velvet (핵심 자산 보고서)',
      color: '#6D28D9',
      bgClass: 'bg-[#FAF8FF]',
      borderColor: 'border-[#E9E3FF]',
      titleColor: 'text-[#6D28D9]',
      badgeBg: 'bg-[#6D28D9]/10'
    };
  }
  if (cat === '장비운영' || cat === '자료실') {
    return {
      name: 'Matte Steel (장비 운영 가이드)',
      color: '#475569',
      bgClass: 'bg-[#F1F5F9]',
      borderColor: 'border-[#CBD5E1]',
      titleColor: 'text-[#475569]',
      badgeBg: 'bg-[#475569]/10'
    };
  }
  if (cat === '운용가이드' || cat === '노하우팁') {
    return {
      name: 'Technical Navy (기술 매뉴얼)',
      color: '#2F527E',
      bgClass: 'bg-[#F4F8FB]',
      borderColor: 'border-[#D0DFEB]',
      titleColor: 'text-[#2F527E]',
      badgeBg: 'bg-[#2F527E]/10'
    };
  }
  if (cat === 'Q&A' || cat === '문의사항') {
    return {
      name: 'Modern Forest (블로그 에세이)',
      color: '#4A6B53',
      bgClass: 'bg-[#F7F9F5]',
      borderColor: 'border-[#DCE4D7]',
      titleColor: 'text-[#4A6B53]',
      badgeBg: 'bg-[#4A6B53]/10'
    };
  }
  if (cat === '공동구매') {
    return {
      name: 'Minimal Slate (뉴스 칼럼)',
      color: '#5A6578',
      bgClass: 'bg-[#F6F7F9]',
      borderColor: 'border-[#DFE2E6]',
      titleColor: 'text-[#5A6578]',
      badgeBg: 'bg-[#5A6578]/10'
    };
  }
  return {
    name: 'Classic Gold (공식 보고서)',
    color: '#C5A059',
    bgClass: 'bg-[#FDFBF7]',
    borderColor: 'border-[#EADCC3]',
    titleColor: 'text-[#8C6D37]',
    badgeBg: 'bg-[#C5A059]/10'
  };
};

export const markdownToHtml = (md: string): string => {
  if (!md) return '';
  let html = md;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co';
    const src = url.startsWith('/uploads/') ? `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${url.substring(9)}` : url;
    return `<img src="${src}" data-raw-url="${url}" alt="${alt}" style="max-width:60%; height:auto; display:block; margin:8px auto; border-radius:8px; border:1px solid #e5e7eb;" />`;
  });
  html = html.replace(/\n/g, '<br>');
  return html;
};

export const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  let md = html;
  md = md.replace(/<img[^>]+data-raw-url="([^">]+)"[^>]*>/gi, (_, src) => {
    return `\n![이미지](${src})\n`;
  });
  md = md.replace(/<img[^>]+src="([^">]+)"[^>]*>/gi, (_, src) => {
    return `\n![이미지](${src})\n`;
  });
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/div>/gi, '\n').replace(/<div[^>]*>/gi, '');
  md = md.replace(/<\/p>/gi, '\n').replace(/<p[^>]*>/gi, '');
  md = md.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
};

export const insertImageAtCursor = (
  url: string,
  editor: HTMLDivElement | null,
  onInput: () => void
) => {
  if (!editor) return;
  editor.focus();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co';
  const src = url.startsWith('/uploads/') ? `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${url.substring(9)}` : url;
  const imgHtml = `<img src="${src}" data-raw-url="${url}" alt="이미지" style="max-width:60%; height:auto; display:block; margin:8px auto; border-radius:8px; border:1px solid #e5e7eb;" />&nbsp;`;

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      const el = document.createElement('div');
      el.innerHTML = imgHtml;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      editor.innerHTML += imgHtml;
    }
  } else {
    editor.innerHTML += imgHtml;
  }
  onInput();
};

