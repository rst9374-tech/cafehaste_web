import React from 'react';
import { 
  Trash2, Lock, Camera, Bold, Italic, Underline, Strikethrough, Link, Image, Table
} from 'lucide-react';
import { useImageUpload } from './use_image_upload';
import { preprocessContent, detectTheme } from './board_comp_detail_utils';
import { getSkinStyle, markdownToHtml, htmlToMarkdown, insertImageAtCursor } from './board_comp_write_utils';
import { BoardCompWriteDirectDeal } from './board_comp_write_direct_deal';
import { BoardCompWriteAttachments } from './board_comp_write_attachments';
import { BoardCompWriteCategory } from './board_comp_write_category';
import { BoardCompWriteExistingAttachments } from './board_comp_write_existing_attachments';

interface BoardCompWriteProps {
  isEditing: boolean;
  selectedPost: any;
  writeCategory: string;
  setWriteCategory: (val: string) => void;
  writeTitle: string;
  setWriteTitle: (val: string) => void;
  writeContent: string;
  setWriteContent: (val: string) => void;
  writeIsSecret: boolean;
  setWriteIsSecret: (val: boolean) => void;
  attachments: any[];
  deletedFileIds: number[];
  setDeletedFileIds: React.Dispatch<React.SetStateAction<number[]>>;
  attachedFiles: Array<{ name: string; type: string; base64: string }>;
  setAttachedFiles: React.Dispatch<React.SetStateAction<Array<{ name: string; type: string; base64: string }>>>;
  isWriting: boolean;
  isDragOver: boolean;
  setIsDragOver: (val: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSavePost: (e: React.FormEvent, overrideContent?: string) => void;
  onCloseWrite: () => void;
  isComp?: boolean;
  writeSkinType?: number;
  setWriteSkinType?: (val: number) => void;
  writeIsNotice?: boolean;
  setWriteIsNotice?: (val: boolean) => void;
  isAdmin?: boolean;
  checkWritePermissionForCategory?: (cat: string) => boolean;
}

export const BoardCompWrite: React.FC<BoardCompWriteProps> = ({
  isEditing,
  selectedPost,
  writeCategory,
  setWriteCategory,
  writeTitle,
  setWriteTitle,
  writeContent,
  setWriteContent,
  writeIsSecret,
  setWriteIsSecret,
  attachments,
  deletedFileIds,
  setDeletedFileIds,
  attachedFiles,
  setAttachedFiles,
  isWriting,
  isDragOver,
  setIsDragOver,
  fileInputRef,
  handleSavePost,
  onCloseWrite,
  isComp = false,
  writeSkinType = 1,
  setWriteSkinType,
  writeIsNotice = false,
  setWriteIsNotice = () => {},
  isAdmin = false,
  checkWritePermissionForCategory
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const inlineImageRef = React.useRef<HTMLInputElement>(null);
  const { processAndUpload, isFileCompressing } = useImageUpload();
  const [isHtmlMode, setIsHtmlMode] = React.useState(false);

  React.useEffect(() => {
    if (isEditing && selectedPost && (selectedPost.skin_type === 9 || selectedPost.skinType === 9)) {
      setIsHtmlMode(true);
    } else {
      setIsHtmlMode(false);
    }
  }, [isEditing, selectedPost]);

  // 초경량 실행취소(Undo/Redo) 히스토리 상태
  const undoStackRef = React.useRef<string[]>([]);
  const redoStackRef = React.useRef<string[]>([]);
  const lastSavedContentRef = React.useRef<string>('');
  const typingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const pushToUndoStack = (html: string) => {
    if (html !== lastSavedContentRef.current) {
      if (undoStackRef.current.length >= 50) {
        undoStackRef.current.shift();
      }
      undoStackRef.current.push(lastSavedContentRef.current);
      lastSavedContentRef.current = html;
      redoStackRef.current = [];
    }
  };

  const moveCursorToEnd = (el: HTMLElement) => {
    el.focus();
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (undoStackRef.current.length > 0) {
        const previousHtml = undoStackRef.current.pop()!;
        redoStackRef.current.push(editorRef.current?.innerHTML || '');
        if (editorRef.current) {
          editorRef.current.innerHTML = previousHtml;
          lastSavedContentRef.current = previousHtml;
          setWriteContent(previousHtml);
          moveCursorToEnd(editorRef.current);
        }
      }
    }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      if (redoStackRef.current.length > 0) {
        const nextHtml = redoStackRef.current.pop()!;
        undoStackRef.current.push(editorRef.current?.innerHTML || '');
        if (editorRef.current) {
          editorRef.current.innerHTML = nextHtml;
          lastSavedContentRef.current = nextHtml;
          setWriteContent(nextHtml);
          moveCursorToEnd(editorRef.current);
        }
      }
    }
    else if (e.key === ' ' || e.key === 'Enter') {
      if (editorRef.current) {
        pushToUndoStack(editorRef.current.innerHTML);
      }
    }
  };

  const applyFormat = (command: string, value: string = '') => {
    if (editorRef.current) pushToUndoStack(editorRef.current.innerHTML);
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const applyFontSize = (size: string) => {
    if (editorRef.current) pushToUndoStack(editorRef.current.innerHTML);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (range.toString().length === 0) {
        const textNode = document.createTextNode('글자크기');
        range.insertNode(textNode);
        sel.selectAllChildren(textNode);
      }
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      handleEditorInput();
    }
  };

  const applyFontName = (font: string) => {
    if (editorRef.current) pushToUndoStack(editorRef.current.innerHTML);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (range.toString().length === 0) {
        const textNode = document.createTextNode('글꼴적용');
        range.insertNode(textNode);
        sel.selectAllChildren(textNode);
      }
      const span = document.createElement('span');
      span.style.fontFamily = font;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      handleEditorInput();
    }
  };

  const handleLinkInsert = () => {
    const url = prompt('연결할 URL 링크 주소를 입력해 주세요 (예: https://example.com):');
    if (url) {
      const sel = window.getSelection();
      if (sel && sel.toString().length === 0) {
        document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
      } else {
        document.execCommand('createLink', false, url);
      }
      handleEditorInput();
    }
  };

  const handleTableInsert = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #E5E5E5; margin: 10px 0; font-size: 13.5px;">
        <thead>
          <tr style="background-color: #F9FAFB; border-bottom: 2px solid #E5E5E5;">
            <th style="padding: 8px; border: 1px solid #E5E5E5; font-weight: bold;">제목1</th>
            <th style="padding: 8px; border: 1px solid #E5E5E5; font-weight: bold;">제목2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #E5E5E5;">내용1</td>
            <td style="padding: 8px; border: 1px solid #E5E5E5;">내용2</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #E5E5E5;">내용3</td>
            <td style="padding: 8px; border: 1px solid #E5E5E5;">내용4</td>
          </tr>
        </tbody>
      </table>&nbsp;
    `;
    
    if (editorRef.current) pushToUndoStack(editorRef.current.innerHTML);
    
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = tableHtml;
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
      } else if (editorRef.current) {
        editorRef.current.innerHTML += tableHtml;
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML += tableHtml;
    }
    handleEditorInput();
  };

  const [dealStatus, setDealStatus] = React.useState('판매중');
  const [machineModel, setMachineModel] = React.useState('릴리');
  const [openYearMonth, setOpenYearMonth] = React.useState('');
  const [dealPrice, setDealPrice] = React.useState('');
  const [rentalType, setRentalType] = React.useState('렌탈기계');

  React.useEffect(() => {
    if (writeCategory === '직거래' && isEditing && selectedPost) {
      const contentStr = selectedPost.content || '';
      
      const statusMatch = contentStr.match(/(?:- 거래 상태:|• <strong>거래 상태:<\/strong>)\s*([^<\n]+)/i);
      if (statusMatch) setDealStatus(statusMatch[1].trim());

      const modelMatch = contentStr.match(/(?:- 기기 기종:|• <strong>기기 기종:<\/strong>)\s*([^<\n]+)/i);
      if (modelMatch) setMachineModel(modelMatch[1].trim());

      const openMatch = contentStr.match(/(?:- 최초 오픈:|• <strong>최초 오픈:<\/strong>)\s*([^<\n]+)/i);
      if (openMatch) setOpenYearMonth(openMatch[1].trim());

      const priceMatch = contentStr.match(/(?:- 판매 가격:|• <strong>판매 가격:<\/strong>)\s*([^<\n]+)/i);
      if (priceMatch) {
        const cleanPrice = priceMatch[1].replace('만원', '').trim();
        setDealPrice(cleanPrice === '협의' ? '' : cleanPrice);
      }

      const rentalMatch = contentStr.match(/(?:- 렌탈 유무:|• <strong>렌탈 유무:<\/strong>)\s*([^<\n]+)/i);
      if (rentalMatch) setRentalType(rentalMatch[1].trim());

      const detailIndex = contentStr.indexOf('<div class="direct-deal-desc">');
      if (detailIndex !== -1) {
        const detailDesc = contentStr.substring(detailIndex + 30).replace(/<\/div>\s*$/i, '').trim();
        setWriteContent(detailDesc);
      } else {
        const legacyIndex = contentStr.indexOf('[상세 설명]');
        if (legacyIndex !== -1) {
          setWriteContent(contentStr.substring(legacyIndex + 8).trim());
        } else {
          setWriteContent(contentStr);
        }
      }
    }
  }, [isEditing, selectedPost, writeCategory]);

  const onLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalContent = writeContent;
    if (editorRef.current) {
      finalContent = htmlToMarkdown(editorRef.current.innerHTML);
    }

    if (writeCategory === '직거래') {
      let detailDesc = finalContent;
      const detailIndex = finalContent.indexOf('<div class="direct-deal-desc">');
      if (detailIndex !== -1) {
        detailDesc = finalContent.substring(detailIndex + 30).replace(/<\/div>\s*$/i, '').trim();
      } else {
        const legacyIndex = finalContent.indexOf('[상세 설명]');
        if (legacyIndex !== -1) {
          detailDesc = finalContent.substring(legacyIndex + 8).trim();
        }
      }

      const formattedContent = `<div class="direct-deal-info" style="background-color: #fcfbf9; border: 1px solid #e7dfd5; padding: 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px; line-height: 1.6; color: #44;">
  <strong style="font-size: 15px; color: #111; display: block; margin-bottom: 10px;">[직거래 정보]</strong>
  <div style="margin-bottom: 4px;">• <strong>거래 상태:</strong> ${dealStatus}</div>
  <div style="margin-bottom: 4px;">• <strong>기기 기종:</strong> ${machineModel}</div>
  <div style="margin-bottom: 4px;">• <strong>최초 오픈:</strong> ${openYearMonth || '미기재'}</div>
  <div style="margin-bottom: 4px;">• <strong>판매 가격:</strong> ${dealPrice ? `${dealPrice} 만원` : '협의'}</div>
  <div>• <strong>렌탈 유무:</strong> ${rentalType}</div>
</div>
<div class="direct-deal-desc">
  ${detailDesc}
</div>`;

      setWriteContent(formattedContent);
      handleSavePost(e, formattedContent);
    } else if (isHtmlMode) {
      handleSavePost(e, writeContent);
    } else {
      setWriteContent(finalContent);
      handleSavePost(e, finalContent);
    }
  };

  React.useEffect(() => {
    if (isEditing && selectedPost) {
      const targetHtml = selectedPost.content || '';
      if (isHtmlMode) {
        setWriteContent(targetHtml);
      } else if (editorRef.current) {
        const parsedHtml = markdownToHtml(targetHtml);
        
        const cleanHtml = parsedHtml.replace(/\r?\n|\r/g, '');
        editorRef.current.innerHTML = cleanHtml;
        setWriteContent(targetHtml);
        lastSavedContentRef.current = cleanHtml;
      }
    }
  }, [isEditing, selectedPost, isHtmlMode]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      setWriteContent(currentHtml);
      
      // 타이핑이 1초 동안 멈추면 실행취소(Undo) 스택에 상태 추가
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = setTimeout(() => {
        pushToUndoStack(currentHtml);
      }, 1000);
    }
  };

  const triggerInlineImageSelect = () => {
    if (inlineImageRef.current) {
      inlineImageRef.current.click();
    }
  };

  const onInsertImage = (url: string) => {
    insertImageAtCursor(url, editorRef.current, handleEditorInput);
  };

  const processSingleFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      try {
        const uploadedUrl = await processAndUpload(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.85,
          boardName: 'board',
          categoryId: writeCategory || 'general'
        });

        if (uploadedUrl) {
          onInsertImage(uploadedUrl);
          setAttachedFiles(prev => [
            ...prev,
            { name: file.name, type: file.type, base64: '', url: uploadedUrl, size: file.size }
          ]);
        }
      } catch (err: any) {
        console.error('[File Drag/Select Upload Error]', err);
        alert('이미지 업로드에 실패했습니다: ' + err.message);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFiles(prev => [
          ...prev,
          { name: file.name, type: file.type, base64: reader.result as string }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onLocalFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isFileCompressing) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => processSingleFile(file));
    }
  };

  const onLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFileCompressing) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => processSingleFile(file));
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await processAndUpload(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.85,
        boardName: 'board',
        categoryId: writeCategory || 'general'
      });

      if (uploadedUrl) {
        onInsertImage(uploadedUrl);
        setAttachedFiles(prev => [
          ...prev,
          { name: file.name, type: file.type, base64: '', url: uploadedUrl, size: file.size }
        ]);
      }
    } catch (err: any) {
      console.error('[Inline Image Upload Error]', err);
      alert('이미지 업로드에 실패했습니다: ' + err.message);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // 1. 이미지 파일 붙여넣기 지원 (스크린샷 등)
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processSingleFile(file);
            return;
          }
        }
      }
    }

    // 2. HTML (텍스트 + 이미지 혼합) 붙여넣기 처리 (Word, 웹 페이지 복사물 등)
    const pastedHtml = e.clipboardData.getData('text/html');
    if (pastedHtml) {
      e.preventDefault();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(pastedHtml, 'text/html');
      
      const sanitizeNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.nodeValue
            ? node.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            : '';
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return '';
        }
        
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        
        let childrenHtml = '';
        for (let i = 0; i < el.childNodes.length; i++) {
          childrenHtml += sanitizeNode(el.childNodes[i]);
        }
        
        // Word 등에서 복사한 인라인 스타일(font-weight, text-decoration 등) 파싱
        const styleAttr = el.getAttribute('style') || '';
        let isBold = false;
        let isItalic = false;
        let isUnderline = false;
        let isStrike = false;
        let keepStyle = '';
        
        if (styleAttr) {
          const declarations = styleAttr.split(';');
          declarations.forEach(decl => {
            const colonIndex = decl.indexOf(':');
            if (colonIndex !== -1) {
              const key = decl.substring(0, colonIndex).trim().toLowerCase();
              const val = decl.substring(colonIndex + 1).trim().toLowerCase();
              
              if (key === 'font-weight' && (val === 'bold' || parseInt(val, 10) >= 700)) {
                isBold = true;
              } else if (key === 'font-style' && val === 'italic') {
                isItalic = true;
              } else if (key === 'text-decoration' || key === 'text-decoration-line') {
                if (val.includes('underline')) isUnderline = true;
                if (val.includes('line-through')) isStrike = true;
              } else if (key === 'font-family') {
                keepStyle += `font-family: ${val};`;
              } else if (key === 'font-size') {
                keepStyle += `font-size: ${val};`;
              } else if (key === 'color') {
                keepStyle += `color: ${val};`;
              } else if (key === 'line-height') {
                keepStyle += `line-height: ${val};`;
              }
            }
          });
        }
        
        // 인라인 스타일에 따라 결과 HTML 감싸기 (중복 감싸기 방지)
        let resultHtml = childrenHtml;
        if (keepStyle) {
          resultHtml = `<span style="${keepStyle}">${resultHtml}</span>`;
        }
        if (isBold && !['strong', 'b'].includes(tagName)) {
          resultHtml = `<strong>${resultHtml}</strong>`;
        }
        if (isItalic && !['em', 'i'].includes(tagName)) {
          resultHtml = `<em>${resultHtml}</em>`;
        }
        if (isUnderline && tagName !== 'u') {
          resultHtml = `<u>${resultHtml}</u>`;
        }
        if (isStrike && !['del', 's', 'strike'].includes(tagName)) {
          resultHtml = `<del>${resultHtml}</del>`;
        }
        
        if (['strong', 'b'].includes(tagName)) {
          return `<strong>${resultHtml}</strong>`;
        }
        if (['em', 'i'].includes(tagName)) {
          return `<em>${resultHtml}</em>`;
        }
        if (tagName === 'u') {
          return `<u>${resultHtml}</u>`;
        }
        if (['del', 's', 'strike'].includes(tagName)) {
          return `<del>${resultHtml}</del>`;
        }
        if (tagName === 'br') {
          return '<br>';
        }
        if (['p', 'div'].includes(tagName)) {
          if (!resultHtml.trim()) return '';
          return `<p>${resultHtml}</p>`;
        }
        if (tagName === 'img') {
          const src = el.getAttribute('src') || '';
          const alt = el.getAttribute('alt') || '이미지';
          if (src) {
            return `<img src="${src}" data-raw-url="${src}" alt="${alt}" style="max-width:60%; height:auto; display:block; margin:8px auto; border-radius:8px; border:1px solid #e5e7eb;" />`;
          }
          return '';
        }
        if (tagName === 'a') {
          const href = el.getAttribute('href') || '';
          if (href) {
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${resultHtml}</a>`;
          }
          return resultHtml;
        }
        if (['table', 'thead', 'tbody', 'tr', 'th', 'td'].includes(tagName)) {
          return `<${tagName}>${resultHtml}</${tagName}>`;
        }
        return resultHtml;
      };
      
      let cleanHtml = '';
      for (let i = 0; i < doc.body.childNodes.length; i++) {
        cleanHtml += sanitizeNode(doc.body.childNodes[i]);
      }
      
      // 다중 개행(<br> 연속 3개 이상) 정리
      cleanHtml = cleanHtml.replace(/(<br\s*\/?>\s*){2,}<br\s*\/?>/gi, '<br><br>');
      // 다중 빈 문단(<p></p> 연속) 정리
      cleanHtml = cleanHtml.replace(/(<p>\s*<\/p>\s*){2,}/gi, '<p><br></p>');

      document.execCommand('insertHTML', false, cleanHtml);
      handleEditorInput();
      return;
    }

    // 3. 일반 텍스트 붙여넣기 처리
    const pastedText = e.clipboardData.getData('text/plain') || e.clipboardData.getData('text');
    if (!pastedText) return;
    e.preventDefault();
    const preprocessed = preprocessContent(pastedText);
    const normalizedText = preprocessed.replace(/(\r?\n\s*){2,}\r?\n/g, '\n\n');
    
    const htmlEscaped = normalizedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r?\n|\r/g, '<br>');

    document.execCommand('insertHTML', false, htmlEscaped);
    handleEditorInput();
  };

  React.useEffect(() => {
    let mappedSkin = 1;
    if (isHtmlMode) {
      mappedSkin = 9;
    } else if (writeCategory === '운용가이드' || writeCategory === '노하우팁') {
      mappedSkin = 5;
    } else if (writeCategory === 'Q&A' || writeCategory === '문의사항') {
      mappedSkin = 2;
    } else if (writeCategory === '공동구매' || writeCategory === '직거래') {
      mappedSkin = 4;
    } else if (writeCategory === 'H/W AS업체') {
      mappedSkin = 3;
    } else if (writeCategory === '장비운영' || writeCategory === '자료실') {
      mappedSkin = 6;
    } else if (writeCategory === '핵심정보') {
      mappedSkin = 7;
    } else if (writeCategory === '레시피') {
      mappedSkin = 8;
    } else {
      mappedSkin = 1;
    }

    if (setWriteSkinType) {
      setWriteSkinType(mappedSkin);
    }
  }, [writeCategory, setWriteSkinType, isHtmlMode]);

  const currentSkin = getSkinStyle(writeCategory);
  const theme = detectTheme(writeCategory, '', writeSkinType);

  return (
    <form
      onSubmit={onLocalSubmit}
      className={`${currentSkin.bgClass} ${currentSkin.borderColor} text-left mb-2 font-sans p-3 border rounded-2xl gap-2.5 shadow-sm md:border-2 md:rounded-[24px] md:p-5 md:shadow-md md:flex md:flex-col md:gap-4 transition-all duration-300`}
    >
      <div className="flex items-center justify-between border-stone-200 pb-1.5 border-b md:pb-2.5">
        <div>
          {isEditing ? (
            <>
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold transition-colors duration-300" style={{ color: currentSkin.color }}>
                REVISION CONSOLE
              </span>
              <h3 className="text-base font-black font-serif text-[#422B1E] mt-0.5">
                게시글 상세 정보 수정하기
              </h3>
            </>
          ) : (
            <>
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold transition-colors duration-300" style={{ color: currentSkin.color }}>
                NEW THREAD CONSOLE
              </span>
              <h3 className="text-base font-black font-serif text-[#422B1E] mt-0.5">
                새 게시물 글쓰기
              </h3>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onCloseWrite}
          className="p-1 px-3 text-stone-500 hover:text-stone-850 bg-stone-100 hover:bg-stone-205 rounded-full cursor-pointer text-[11px] font-bold transition-all"
        >
          닫기
        </button>
      </div>

      <div className="flex flex-col gap-2.5 md:gap-3">
        {/* Category selection grid */}
        <BoardCompWriteCategory
          writeCategory={writeCategory}
          setWriteCategory={setWriteCategory}
          isAdmin={isAdmin}
          checkWritePermissionForCategory={checkWritePermissionForCategory}
        />

        {/* Title */}
        <div>
          <label className="block text-stone-700 text-sm font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D37]" />
            <span>제목 *</span>
          </label>
          <input
            type="text"
            value={writeTitle}
            onChange={(e) => setWriteTitle(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white text-sm font-semibold text-[#1E1C26] outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all py-1.5 px-3 md:py-2 md:px-4"
          />
        </div>

        {/* Direct Deal Fields */}
        <BoardCompWriteDirectDeal
          dealStatus={dealStatus}
          setDealStatus={setDealStatus}
          machineModel={machineModel}
          setMachineModel={setMachineModel}
          rentalType={rentalType}
          setRentalType={setRentalType}
          openYearMonth={openYearMonth}
          setOpenYearMonth={setOpenYearMonth}
          dealPrice={dealPrice}
          setDealPrice={setDealPrice}
          writeCategory={writeCategory}
        />

        {/* Notice & Secret Options (1줄로 표시) */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-1 mb-1">
          {/* Notice Option */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_notice_chk"
                checked={writeIsNotice}
                onChange={(e) => setWriteIsNotice && setWriteIsNotice(e.target.checked)}
                className="rounded text-[#C5A059] border-stone-300 outline-none focus:ring-[#422B1E] cursor-pointer"
              />
              <label htmlFor="is_notice_chk" className="text-stone-700 text-sm font-bold cursor-pointer flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>공지사항으로 등록</span>
              </label>
            </div>
          )}

          {/* Secret Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_secret_chk"
              checked={writeIsSecret}
              onChange={(e) => setWriteIsSecret(e.target.checked)}
              className="rounded text-amber-500 border-stone-300 outline-none focus:ring-[#422B1E] cursor-pointer"
            />
            <label htmlFor="is_secret_chk" className="text-stone-700 text-sm font-bold cursor-pointer flex items-center gap-1.5 select-none">
              <Lock size={12.5} className="text-[#C5A059]" />
              <span>비밀글로 설정</span>
            </label>
          </div>

          {/* HTML 직접 작성 Option */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_html_mode_chk"
                checked={isHtmlMode}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsHtmlMode(checked);
                  if (checked) {
                    if (editorRef.current) {
                      setWriteContent(editorRef.current.innerHTML);
                    }
                  } else {
                    setTimeout(() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = writeContent;
                      }
                    }, 0);
                  }
                }}
                className="rounded text-blue-500 border-stone-300 outline-none focus:ring-[#422B1E] cursor-pointer"
              />
              <label htmlFor="is_html_mode_chk" className="text-stone-700 text-sm font-bold cursor-pointer flex items-center gap-1.5 select-none font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>HTML 소스코드 직접 작성</span>
              </label>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-stone-700 text-sm font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D37]" />
                <span>상세내용 *</span>
              </label>
              <input
                type="file"
                ref={inlineImageRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleInlineImageUpload}
              />
            </div>

            {isHtmlMode ? (
              <textarea
                value={writeContent}
                onChange={(e) => setWriteContent(e.target.value)}
                placeholder="HTML 태그(예: <table>, <div style='...'>, <h3> 등)를 포함한 순수 HTML 소스코드를 날것 그대로 자유롭게 입력해 주세요."
                className="w-full min-h-[360px] rounded-2xl border border-stone-300 p-4 font-mono text-xs text-stone-900 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all bg-[#FAF9F6] resize-y"
              />
            ) : (
              <>
                {/* Editor Toolbar (네이버 카페 스타일의 서식 툴바) */}
                <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF9F6] border border-stone-300 rounded-t-2xl p-2 border-b-0 select-none">
                  {/* 글꼴 선택 드롭다운 */}
                  <select
                    onChange={(e) => applyFontName(e.target.value)}
                    defaultValue=""
                    className="text-[11px] font-bold text-stone-700 bg-white border border-stone-300 rounded px-1.5 py-0.5 outline-none cursor-pointer focus:border-[#422B1E]"
                    title="글꼴 변경"
                  >
                    <option value="" disabled hidden>기본서체</option>
                    <option value="Pretendard, system-ui, sans-serif">기본서체</option>
                    <option value="Nanum Gothic, sans-serif">나눔고딕</option>
                    <option value="Dotum, sans-serif">돋움</option>
                    <option value="Batang, serif">바탕</option>
                  </select>

                  {/* 글자 크기 선택 드롭다운 */}
                  <select
                    onChange={(e) => applyFontSize(e.target.value)}
                    defaultValue=""
                    className="text-[11px] font-bold text-stone-700 bg-white border border-stone-300 rounded px-1.5 py-0.5 outline-none cursor-pointer focus:border-[#422B1E]"
                    title="글자 크기 변경"
                  >
                    <option value="" disabled hidden>15.5</option>
                    <option value="13px">13 (작게)</option>
                    <option value="15.5px">15.5 (보통)</option>
                    <option value="19px">19 (제목2)</option>
                    <option value="24px">24 (제목1)</option>
                    <option value="32px">32 (크게)</option>
                  </select>

                  <div className="w-[1px] h-4 bg-stone-300 mx-1" />

                  {/* 글씨 문맥 유형 단축키 */}
                  <button
                    type="button"
                    onClick={() => applyFormat('formatBlock', '<p>')}
                    className="p-1 px-1.5 text-[10px] font-bold text-stone-655 hover:bg-stone-200/60 rounded cursor-pointer"
                    title="본문 기본 형식 (<p>)"
                  >
                    본문
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('formatBlock', '<h2>')}
                    className="p-1 px-1.5 text-[10px] font-bold text-stone-700 hover:bg-stone-200/60 rounded cursor-pointer"
                    title="대제목 (큰 글씨 크기 <h2>)"
                  >
                    대제목
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('formatBlock', '<h3>')}
                    className="p-1 px-1.5 text-[10px] font-bold text-stone-700 hover:bg-stone-200/60 rounded cursor-pointer"
                    title="소제목 (중간 글씨 크기 <h3>)"
                  >
                    소제목
                  </button>

                  <div className="w-[1px] h-4 bg-stone-300 mx-1" />

                  {/* 글자 서식 */}
                  <button
                    type="button"
                    onClick={() => applyFormat('bold')}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded cursor-pointer"
                    title="굵게 (Ctrl+B)"
                  >
                    <Bold size={13.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('italic')}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded cursor-pointer"
                    title="기울임 (Ctrl+I)"
                  >
                    <Italic size={13.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('underline')}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded cursor-pointer"
                    title="밑줄 (Ctrl+U)"
                  >
                    <Underline size={13.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('strikeThrough')}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded cursor-pointer"
                    title="취소선"
                  >
                    <Strikethrough size={13.5} />
                  </button>

                  <div className="w-[1px] h-4 bg-stone-300 mx-1" />

                  {/* 미디어 / 링크 */}
                  <button
                    type="button"
                    onClick={handleLinkInsert}
                    className="p-1.5 text-stone-600 hover:text-[#C5A059] hover:bg-stone-200/60 rounded cursor-pointer flex items-center gap-1"
                    title="링크 걸기"
                  >
                    <Link size={13.5} />
                  </button>
                  <button
                    type="button"
                    onClick={handleTableInsert}
                    className="p-1.5 text-stone-600 hover:text-[#C5A059] hover:bg-stone-200/60 rounded cursor-pointer flex items-center gap-1"
                    title="표 삽입"
                  >
                    <Table size={13.5} />
                  </button>
                  <button
                    type="button"
                    onClick={triggerInlineImageSelect}
                    disabled={isFileCompressing}
                    className="p-1.5 text-stone-600 hover:text-[#C5A059] hover:bg-stone-200/60 rounded cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    title="본문 내 사진 첨부"
                  >
                    <Image size={13.5} className={isFileCompressing ? 'animate-bounce' : ''} />
                    <span className="text-[10px] font-bold text-stone-600">{isFileCompressing ? '업로드 중...' : '사진 첨부'}</span>
                  </button>
                </div>

                {/* 에디터 내부 자식 요소들(p, h1~h6)의 여백과 폰트 크기를 상세조회 화면과 완벽하게 일치시키는 샌드박스 스타일 */}
                <style dangerouslySetInnerHTML={{ __html: `
                  .haste-wysiwyg-editor > p,
                  .haste-wysiwyg-editor > div {
                    margin-top: 0px !important;
                    margin-bottom: 0px !important;
                    line-height: ${theme.lineHeight} !important;
                  }
                  .haste-wysiwyg-editor h1,
                  .haste-wysiwyg-editor h2,
                  .haste-wysiwyg-editor h3,
                  .haste-wysiwyg-editor h4,
                  .haste-wysiwyg-editor h5,
                  .haste-wysiwyg-editor h6 {
                    margin-top: 1.25rem !important;
                    margin-bottom: 0.85rem !important;
                    font-weight: 700 !important;
                    line-height: 1.35 !important;
                    display: block !important;
                  }
                `}} />

                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  onPaste={handleEditorPaste}
                  onKeyDown={handleEditorKeyDown}
                  style={{
                    fontFamily: theme.fontFamily,
                    fontSize: isComp ? `${parseFloat(theme.fontSize) - 1}px` : theme.fontSize,
                    lineHeight: theme.lineHeight,
                    color: '#333333',
                    width: '100%'
                  }}
                  className="haste-wysiwyg-editor w-full rounded-b-2xl border border-stone-300 bg-white font-medium text-[#1E1C26] outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all py-3 px-4 min-h-[320px] max-h-[480px] overflow-y-auto select-text whitespace-normal border-t-0"
                />
              </>
            )}
          </div>
        </div>

        {/* Existing Attachments to toggle deletion */}
        <BoardCompWriteExistingAttachments
          isEditing={isEditing}
          attachments={attachments}
          deletedFileIds={deletedFileIds}
          setDeletedFileIds={setDeletedFileIds}
        />

        {/* Drag & Drop File Upload Area */}
        <BoardCompWriteAttachments
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          isFileCompressing={isFileCompressing}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          fileInputRef={fileInputRef}
          onLocalFileDrop={onLocalFileDrop}
          onLocalFileSelect={onLocalFileSelect}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end border-t border-[#E3D3AE] pt-2.5 mt-0.5 md:pt-4 md:mt-1">
        <button
          type="button"
          onClick={onCloseWrite}
          className="text-stone-605 bg-stone-105 hover:bg-stone-200 font-bold text-xs rounded-full transition-all cursor-pointer py-1.5 px-3.5 md:py-2 md:px-5"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isWriting}
          className="bg-stone-950 hover:bg-stone-850 text-[#C5A059] font-bold text-xs rounded-full transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 py-2 px-5 md:py-2.5 md:px-7"
        >
          {isWriting ? '전송 보완 중...' : '글쓰기'}
        </button>
      </div>
    </form>
  );
};
