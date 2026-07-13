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

const renderTableHTML = (tableLines: string[]): string => {
  const rows = tableLines.map(line => {
    const content = line.replace(/^\|/, '').replace(/\|$/, '');
    return content.split('|').map(cell => cell.trim());
  });

  const filteredRows = rows.filter(row => {
    const isDivider = row.every(cell => cell.match(/^:?-+:?$/));
    return !isDivider;
  });

  if (filteredRows.length === 0) return '';

  const headers = filteredRows[0];
  const bodyRows = filteredRows.slice(1);

  let html = `<div class="overflow-x-auto my-4.5 rounded-xl border border-stone-200/80 shadow-3xs bg-white select-text w-full">`;
  html += `<table class="w-full text-left border-collapse font-sans text-xs md:text-sm" style="min-width: 400px; border: 1px solid #E5E5E5;">`;
  
  // Headers
  html += `<thead><tr class="bg-stone-50 border-b border-stone-200 font-bold text-stone-700 select-none">`;
  headers.forEach((header, idx) => {
    const formattedHeader = header
      .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
      .replace(/&amp;lt;br\s*\/?&amp;gt;/gi, '<br>');
    html += `<th class="p-3 px-4 font-bold tracking-tight" style="border-right: ${idx < headers.length - 1 ? '1px solid #E5E5E5' : 'none'}; border-bottom: 2px solid #E5E5E5;">${formattedHeader}</th>`;
  });
  html += `</tr></thead>`;
  
  // Body
  html += `<tbody class="divide-y divide-stone-150 text-stone-600">`;
  bodyRows.forEach(row => {
    html += `<tr class="hover:bg-stone-50/50 transition-colors">`;
    row.forEach((cell, cellIdx) => {
      const formattedCell = cell
        .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
        .replace(/&amp;lt;br\s*\/?&amp;gt;/gi, '<br>');
      html += `<td class="p-2.5 px-4 leading-relaxed" style="border-right: ${cellIdx < row.length - 1 ? '1px solid #F0F0F0' : 'none'}; border-bottom: 1px solid #E5E5E5;">${formattedCell}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  
  return html;
};

export const markdownToHtml = (md: string): string => {
  if (!md) return '';
  
  
  // 허용할 HTML 태그 목록
  const allowedTags = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'del', 
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'ul', 'li', 'ol', 'span', 'div'
  ];
  
  // HTML 태그들을 임시로 안전한 토큰으로 치환
  const savedTags: string[] = [];
  const tagRegExp = new RegExp(`&lt;\\/?(?:${allowedTags.join('|')})\\b[^&gt;]*&gt;|<\\/?(?:${allowedTags.join('|')})\\b[^>]*>`, 'gi');
  
  let html = md.replace(tagRegExp, (match) => {
    savedTags.push(match);
    return `__HTML_TAG_TOKEN_${savedTags.length - 1}__`;
  });

  // 1. 기본 HTML 이스케이프
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // 2. 볼드 서식 파싱 (마크다운 ** 및 과거 DB <b>)
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/&lt;(b|strong)[^&gt;]*&gt;([\s\S]*?)&lt;\/\1&gt;/gi, '<strong>$2</strong>');
  
  // 3. 밑줄 서식 파싱 (<u>)
  html = html.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, '<u>$1</u>');
  html = html.replace(/&lt;del&gt;([\s\S]*?)&lt;\/del&gt;/gi, '<del>$1</del>');

  // 3-1. 글꼴 및 글자크기 복원 (style span)
  html = html.replace(/&lt;span style=&quot;([^&]+)&quot;&gt;([\s\S]*?)&lt;\/span&gt;/gi, (_, style, text) => {
    const cleanedStyle = style.replace(/&amp;quot;/g, "'").replace(/&quot;/g, "'");
    return `<span style="${cleanedStyle}">${text}</span>`;
  });
  html = html.replace(/&lt;div style=&quot;([^&]+)&quot;&gt;([\s\S]*?)&lt;\/div&gt;/gi, (_, style, text) => {
    const cleanedStyle = style.replace(/&amp;quot;/g, "'").replace(/&quot;/g, "'");
    return `<span style="${cleanedStyle}">${text}</span>`;
  });
  
  // 4. 기울임 서식 파싱 (* 및 <i>/<em>)
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/&lt;(i|em)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, '<em>$2</em>');
  
  // 5. 취소선 서식 파싱 (~~ 및 <del>/<s>)
  html = html.replace(/~~([\s\S]*?)~~/g, '<del>$1</del>');
  html = html.replace(/&lt;(del|strike|s)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, '<del>$2</del>');
  
  // 6. 제목 서식 파싱 (## 대제목, ### 소제목)
  html = html.replace(/^(?:###)\s+(.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^(?:##)\s+(.*?)$/gm, '<h2>$1</h2>');
  
  // 7. 이미지 파싱
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co';
    const src = url.startsWith('/uploads/') ? `${supabaseUrl}/storage/v1/object/public/cafehaste-bucket/${url.substring(9)}` : url;
    return `<img src="${src}" data-raw-url="${url}" alt="${alt}" style="max-width:60%; height:auto; display:block; margin:8px auto; border-radius:8px; border:1px solid #e5e7eb;" />`;
  });

  // 8. 하이퍼링크 파싱: [텍스트](주소) -> a 태그
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#C5A059] underline font-bold hover:underline transition-colors">${text}</a>`;
  });

  // Table 파싱 처리
  const lines = html.split('\n');
  let inTable = false;
  let tableLines: string[] = [];
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '---' || line === '***') {
      if (inTable) {
        processedLines.push(renderTableHTML(tableLines));
        inTable = false;
        tableLines = [];
      }
      processedLines.push('<hr style="border-top: 1px solid #e5e7eb; margin: 16px 0;" />');
    } else if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      if (inTable) {
        processedLines.push(renderTableHTML(tableLines));
        inTable = false;
        tableLines = [];
      }
      processedLines.push(lines[i]);
    }
  }
  if (inTable) {
    processedLines.push(renderTableHTML(tableLines));
  }

  html = processedLines.join('\n');
  html = html.replace(/\n/g, '<br>');

  // 제목 태그(h1~h6) 주변의 불필요한 중복 개행(<br>) 제거하여 1줄 간격으로 정리
  html = html.replace(/<\/h([1-6])>\s*(?:<br\s*\/?>)+/gi, '</h$1>');
  html = html.replace(/(?:<br\s*\/?>)+\s*<h([1-6])>/gi, '<h$1>');

  // 임시 토큰을 진짜 HTML 태그로 복원
  for (let i = 0; i < savedTags.length; i++) {
    let tag = savedTags[i];
    tag = tag.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    html = html.replace(`__HTML_TAG_TOKEN_${i}__`, tag);
  }

  return html;
};

export const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  let md = html;
  
  // 1. 이미지 파싱
  md = md.replace(/<img[^>]+data-raw-url="([^">]+)"[^>]*>/gi, (_, src) => {
    return `\n![이미지](${src})\n`;
  });
  md = md.replace(/<img[^>]+src="([^">]+)"[^>]*>/gi, (_, src) => {
    return `\n![이미지](${src})\n`;
  });
  
  // 2. 링크 파싱
  md = md.replace(/<a[^>]+href="([^">]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // 3. 제목 파싱 (H2, H3)
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  
  // 4. 서식 파싱 (Bold, Italic, Underline, Strikethrough)
  md = md.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(i|em)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  md = md.replace(/<u>([\s\S]*?)<\/u>/gi, '<u>$1</u>');
  md = md.replace(/<(del|strike|s)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~');
  
  // 5. 일반 태그 및 줄바꿈 처리
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/div>/gi, '\n').replace(/<div[^>]*>/gi, '');
  md = md.replace(/<\/p>/gi, '\n').replace(/<p[^>]*>/gi, '');
  
  // 6. 이스케이프 복구
  md = md.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');
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

