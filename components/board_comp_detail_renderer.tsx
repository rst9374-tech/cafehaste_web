import React, { useState } from 'react';
import { 
  FileText, Check, Copy, Sparkles, AlertCircle, Info, PlayCircle, ImageIcon, Download
} from 'lucide-react';
import type { ThemeConfig } from './board_comp_detail_utils';
import { transformImageUrl } from './board_comp_detail_utils';

export const KakaoIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "w-5 h-5", style }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${className} flex-shrink-0`}
    style={style}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#FEE500" />
    <path
      d="M12 5C8.134 5 5 7.466 5 10.5C5 12.441 6.294 14.152 8.3 15.15C8.18 15.65 7.82 17.15 7.75 17.48C7.67 17.85 7.9 17.84 8.08 17.72C8.22 17.63 10.3 16.2 11.23 15.56C11.48 15.59 11.74 15.6 12 15.6C15.866 15.6 19 13.134 19 10.1C19 7.066 15.866 5 12 5Z"
      fill="#3C1E1E"
    />
  </svg>
);

export const NoImagePlaceholder: React.FC<{ className?: string }> = ({ className = 'w-full' }) => (
  <div className={`flex flex-col sm:flex-row items-center justify-center bg-stone-50 border border-stone-200/60 rounded-2xl gap-3 text-stone-400 p-5 mt-4 ${className} select-none`}>
    <FileText size={18} className="stroke-[1.25] text-stone-350 shrink-0" />
    <span className="text-xs font-bold leading-normal text-stone-500 font-sans">
      첨부파일 및 실물 이미지가 등록되지 않은 게시물입니다.
    </span>
  </div>
);

export const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-stone-250 bg-stone-900 text-stone-100 overflow-hidden shadow-xs font-mono text-[12px] flex flex-col">
      <div className="flex justify-between items-center bg-stone-950/70 px-4 py-2 text-stone-400 text-[10.5px] border-b border-stone-850 font-sans select-none">
        <span className="font-bold uppercase tracking-wider text-stone-400">{lang || 'code'}</span>
        <button 
          type="button" 
          onClick={handleCopy}
          className="hover:text-stone-200 transition-colors font-bold px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-750 cursor-pointer flex items-center gap-1 text-stone-400"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans">복사됨!</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span className="font-sans">복사</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed select-text text-left">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const parseInlineStyles = (text: string, onNavigateToPost?: (postId: number) => void): React.ReactNode[] => {
  const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
  const linkParts = text.split(linkRegex);
  const result: React.ReactNode[] = [];
  
  linkParts.forEach((part, i) => {
    if (i % 2 === 1) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const linkText = match[1];
        const linkUrl = match[2];
        const boardMatch = linkUrl.match(/\/board\/(\d+)/) || linkUrl.match(/^board\/(\d+)/);
        
        if (boardMatch && onNavigateToPost) {
          const postId = parseInt(boardMatch[1], 10);
          result.push(
            <a
              key={`link-${i}`}
              href={linkUrl}
              onClick={(e) => {
                e.preventDefault();
                onNavigateToPost(postId);
              }}
              className="text-[#C5A059] hover:underline font-bold cursor-pointer"
            >
              {linkText}
            </a>
          );
        } else {
          result.push(
            <a
              key={`link-${i}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C5A059] hover:underline font-bold"
            >
              {linkText}
            </a>
          );
        }
      }
    } else {
      const inlineCodeRegex = /`([^`]+)`/g;
      const codeParts = part.split(inlineCodeRegex);
      
      codeParts.forEach((codePart, j) => {
        if (j % 2 === 1) {
          result.push(
            <code key={`code-${i}-${j}`} className="font-mono text-rose-600 bg-stone-100 border border-stone-200/80 px-1.5 py-0.5 rounded text-[11.5px] mx-0.5 font-bold shadow-3xs">
              {codePart}
            </code>
          );
        } else {
          const boldParts = codePart.split(/\*\*([^*]+)\*\*/g);
          boldParts.forEach((subPart, k) => {
            if (k % 2 === 1) {
              result.push(
                <strong key={`bold-${i}-${j}-${k}`} className="font-extrabold text-stone-900 font-sans mx-0.5">
                  {subPart}
                </strong>
              );
            } else {
              result.push(subPart);
            }
          });
        }
      });
    }
  });
  
  return result;
};

export const renderLine = (line: string, keyVal: string, theme: ThemeConfig, onNavigateToPost?: (postId: number) => void) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return <div key={keyVal} className="h-3.5" />;
  }

  // Markdown Image: ![alt text](url)
  const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (imgMatch) {
    const altText = imgMatch[1];
    const imgUrl = imgMatch[2];
    return (
      <div key={keyVal} className="my-4.5 rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-50/50 max-w-xl mx-auto shadow-2xs w-full select-none">
        <img 
          src={transformImageUrl(imgUrl)} 
          alt={altText || '첨부 이미지'} 
          className="w-full h-auto object-cover max-h-[480px]"
          referrerPolicy="no-referrer"
        />
        {altText && (
          <p className="text-[11px] text-stone-400 font-light text-center py-2 border-t border-stone-100 bg-white font-sans">
            {altText}
          </p>
        )}
      </div>
    );
  }

  // Divider
  if (trimmed === '---' || trimmed === '***') {
    return <hr key={keyVal} className="border-t border-stone-200/85 my-4" />;
  }

  // Example/Subheading matches like "예시1.", "예시 2."
  const exampleMatch = trimmed.match(/^(예시\s*\d+\.?:?\s*)(.*)/);
  if (exampleMatch) {
    const examplePrefix = exampleMatch[1];
    const restText = exampleMatch[2];
    return (
      <div key={keyVal} className="mt-4.5 mb-2 text-left font-sans leading-relaxed">
        <strong className="!font-bold !text-stone-900" style={{ fontSize: `calc(${theme.fontSize} + 0.5px)` }}>
          {examplePrefix}
        </strong>
        {restText && (
          <span className="text-stone-655" style={{ fontSize: theme.fontSize }}>
            {parseInlineStyles(restText, onNavigateToPost)}
          </span>
        )}
      </div>
    );
  }

  // Callout Box (Alerts)
  const calloutMatch = trimmed.match(/^\[(TIP|팁|참고|주의|경고|WARNING|CAUTION|안내|INFO|알림)\]\s*(.*)/i);
  if (calloutMatch) {
    const type = calloutMatch[1].toUpperCase();
    const content = calloutMatch[2];
    
    let bgClass = `${theme.tipBg} border ${theme.borderColor}`;
    let icon = <Info size={15} className="text-stone-500 shrink-0 mt-0.5" />;
    
    if (['TIP', '팁', '참고'].includes(type)) {
      bgClass = `${theme.tipBg} border ${theme.borderColor}`;
      icon = <Sparkles size={15} style={{ color: theme.pointColor }} className="shrink-0 mt-0.5" />;
    } else if (['주의', '경고', 'WARNING', 'CAUTION'].includes(type)) {
      bgClass = 'bg-rose-50/60 border border-rose-250';
      icon = <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />;
    } else {
      icon = <Info size={15} className="text-stone-500 shrink-0 mt-0.5" />;
    }

    return (
      <div 
        key={keyVal} 
        className={`p-4 rounded-xl flex gap-3 my-3.5 text-stone-650 leading-relaxed shadow-3xs ${bgClass}`}
        style={{ fontSize: `calc(${theme.fontSize} - 1.5px)`, fontFamily: theme.fontFamily }}
      >
        {icon}
        <div className="flex-1">{parseInlineStyles(content, onNavigateToPost)}</div>
      </div>
    );
  }

  // Step Header
  const stepMatch = trimmed.match(/^(STEP\s*\d+|\[STEP\s*\d+\])(?::|\s)(.*)/i);
  if (stepMatch) {
    const stepLabel = stepMatch[1].toUpperCase().replace('[', '').replace(']', '');
    const stepTitle = stepMatch[2];
    return (
      <div key={keyVal} className="flex items-center gap-2 mt-5 mb-3 flex-wrap">
        <span 
          className="inline-flex items-center justify-center text-[10.5px] font-black tracking-wider px-2.5 py-0.5 rounded-md font-mono uppercase shrink-0 shadow-2xs"
          style={{ backgroundColor: theme.pointColor, color: '#ffffff' }}
        >
          {stepLabel}
        </span>
        <strong className="text-stone-900 font-extrabold font-sans" style={{ fontSize: `calc(${theme.fontSize} + 1.5px)` }}>
          {parseInlineStyles(stepTitle, onNavigateToPost)}
        </strong>
      </div>
    );
  }

  // Blockquote
  if (trimmed.startsWith('>')) {
    const quoteContent = trimmed.replace(/^>\s*/, '');
    return (
      <blockquote 
        key={keyVal} 
        className="border border-stone-200 bg-stone-50/50 px-4 py-2.5 my-3 rounded-xl text-stone-655 font-sans leading-relaxed text-left" 
        style={{ fontSize: `calc(${theme.fontSize} - 0.5px)` }}
      >
        {parseInlineStyles(quoteContent, onNavigateToPost)}
      </blockquote>
    );
  }

  // Headers
  if (trimmed.startsWith('### ')) {
    return (
      <h4 key={keyVal} className="font-bold text-stone-900 mt-5 mb-2.5 flex items-center gap-1.5 font-sans" style={{ fontSize: `calc(${theme.fontSize} + 1.5px)` }}>
        <span>▶ {parseInlineStyles(trimmed.substring(4), onNavigateToPost)}</span>
      </h4>
    );
  }
  if (trimmed.startsWith('## ')) {
    return (
      <h3 key={keyVal} className="font-extrabold text-stone-900 mt-6 mb-3 flex items-center gap-2 border-b border-stone-100 pb-1.5 font-sans" style={{ fontSize: `calc(${theme.fontSize} + 3.5px)` }}>
        <span>◆ {parseInlineStyles(trimmed.substring(3), onNavigateToPost)}</span>
      </h3>
    );
  }
  if (trimmed.startsWith('# ')) {
    return (
      <h2 key={keyVal} className="font-black text-stone-955 mt-7.5 mb-4 flex items-center gap-2 border-b-2 border-stone-200 pb-2 font-sans" style={{ fontSize: `calc(${theme.fontSize} + 6px)` }}>
        <span>■ {parseInlineStyles(trimmed.substring(2), onNavigateToPost)}</span>
      </h2>
    );
  }

  // Bullet List (matches: -, *, o, •, ◦)
  const bulletMatch = trimmed.match(/^([-*•◦o])\s+(.*)/);
  if (bulletMatch) {
    const content = bulletMatch[2];
    const leadingSpaces = line.length - line.trimStart().length;
    const indentLevel = Math.floor(leadingSpaces / 2);
    const bulletSymbol = indentLevel % 2 === 0 ? '•' : '◦';
    const isSub = content.endsWith(':') || content.length < 20;
    return (
      <div 
        key={keyVal} 
        className={`flex items-start gap-2 mt-2 mb-2 font-sans ${isSub ? '!font-bold !text-stone-900' : 'text-stone-655 leading-relaxed'}`}
        style={{ paddingLeft: `${12 + indentLevel * 16}px`, fontSize: theme.fontSize }}
      >
        <span className="mt-0.5 shrink-0 text-[15px] leading-none select-none" style={{ color: theme.pointColor }}>{bulletSymbol}</span>
        <span className="flex-1 text-left">{parseInlineStyles(content, onNavigateToPost)}</span>
      </div>
    );
  }

  // Numbered List (matches 1. or 1 )
  const numMatch = trimmed.match(/^(\d+)(?:\.|\s)\s*(.*)/);
  if (numMatch) {
    const num = numMatch[1];
    const rest = numMatch[2];
    const leadingSpaces = line.length - line.trimStart().length;
    const indentLevel = Math.floor(leadingSpaces / 2);
    const isSub = rest.length < 32;
    return (
      <div 
        key={keyVal} 
        className={`flex items-start gap-2 mt-2 mb-2 font-sans ${isSub ? '!font-bold !text-stone-900' : 'text-stone-655 leading-relaxed'}`}
        style={{ paddingLeft: `${12 + indentLevel * 16}px`, fontSize: theme.fontSize }}
      >
        <span className="font-mono font-bold text-xs mt-0.5 shrink-0 select-none" style={{ color: theme.pointColor }}>{num}.</span>
        <span className="flex-1 text-left">{parseInlineStyles(rest, onNavigateToPost)}</span>
      </div>
    );
  }

  // Original subheading check
  const isSubheading = /^\[[^\]]+\]$/.test(trimmed);
  if (isSubheading) {
    return (
      <span key={keyVal} className="!font-bold !text-stone-900 block mt-4 mb-2 font-sans" style={{ fontSize: `calc(${theme.fontSize} + 0.5px)` }}>
        {parseInlineStyles(line, onNavigateToPost)}
      </span>
    );
  }

  // Standard Line
  const ytMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  const mp4Match = trimmed.match(/(https?:\/\/[^\s\n\r]+\.mp4)/i);
  
  let videoEmbedNode: React.ReactNode = null;
  
  if (ytMatch) {
    const videoId = ytMatch[1];
    videoEmbedNode = (
      <div className="my-4.5 rounded-2xl overflow-hidden aspect-video border border-stone-200/80 bg-black max-w-xl mx-auto shadow-xs w-full select-none">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  } else if (mp4Match) {
    const mp4Url = mp4Match[1];
    videoEmbedNode = (
      <div className="my-4.5 rounded-2xl overflow-hidden bg-black border border-stone-200/80 max-w-xl mx-auto shadow-xs w-full select-none">
        <video
          src={mp4Url}
          controls
          className="w-full h-auto max-h-[360px]"
        />
      </div>
    );
  }

  return (
    <div key={keyVal} className="flex flex-col gap-1 w-full">
      <div 
        className="text-stone-655 leading-relaxed font-sans mb-1 select-text text-left break-all" 
        style={{ fontSize: theme.fontSize, fontFamily: theme.fontFamily }}
      >
        {parseInlineStyles(line, onNavigateToPost)}
      </div>
      {videoEmbedNode}
    </div>
  );
};

export const renderTableBlock = (tableLines: string[], keyVal: string, theme: ThemeConfig, onNavigateToPost?: (postId: number) => void) => {
  const rows = tableLines.map(line => {
    const content = line.replace(/^\|/, '').replace(/\|$/, '');
    return content.split('|').map(cell => cell.trim());
  });
  
  const filteredRows = rows.filter(row => {
    const isDivider = row.every(cell => cell.match(/^:?-+:?$/));
    return !isDivider;
  });
  
  if (filteredRows.length === 0) return null;
  
  const headers = filteredRows[0];
  const bodyRows = filteredRows.slice(1);
  
  return (
    <div key={keyVal} className="overflow-x-auto my-4.5 rounded-xl border border-stone-200/80 shadow-3xs bg-white select-text w-full">
      <table className="w-full text-left border-collapse font-sans text-xs md:text-sm" style={{ minWidth: '400px' }}>
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200 font-bold text-stone-700 select-none">
            {headers.map((header, idx) => (
              <th key={`th-${idx}`} className="p-3 px-4 font-bold tracking-tight" style={{ borderRight: idx < headers.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                {parseInlineStyles(header, onNavigateToPost)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-150 text-stone-600">
          {bodyRows.map((row, rowIdx) => (
            <tr key={`tr-${rowIdx}`} className="hover:bg-stone-50/50 transition-colors">
              {row.map((cell, cellIdx) => (
                <td key={`td-${cellIdx}`} className="p-2.5 px-4 leading-relaxed" style={{ borderRight: cellIdx < row.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                  {parseInlineStyles(cell, onNavigateToPost)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
