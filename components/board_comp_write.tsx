import React from 'react';
import { 
  Trash2, Lock, Camera
} from 'lucide-react';
import { useImageUpload } from './use_image_upload';
import { preprocessContent } from './board_comp_detail_utils';
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
  handleSavePost: (e: React.FormEvent) => void;
  onCloseWrite: () => void;
  isComp?: boolean;
  writeSkinType?: number;
  setWriteSkinType?: (val: number) => void;
  writeIsNotice?: boolean;
  setWriteIsNotice?: (val: boolean) => void;
  isAdmin?: boolean;
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
  isAdmin = false
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const inlineImageRef = React.useRef<HTMLInputElement>(null);
  const { processAndUpload, isFileCompressing } = useImageUpload();

  const [dealStatus, setDealStatus] = React.useState('판매중');
  const [machineModel, setMachineModel] = React.useState('릴리');
  const [openYearMonth, setOpenYearMonth] = React.useState('');
  const [dealPrice, setDealPrice] = React.useState('');
  const [rentalType, setRentalType] = React.useState('렌탈기계');

  React.useEffect(() => {
    if (writeCategory === '직거래' && isEditing && selectedPost) {
      const contentStr = selectedPost.content || '';
      
      const statusMatch = contentStr.match(/- 거래 상태:\s*([^\n]+)/);
      if (statusMatch) setDealStatus(statusMatch[1].trim());

      const modelMatch = contentStr.match(/- 기기 기종:\s*([^\n]+)/);
      if (modelMatch) setMachineModel(modelMatch[1].trim());

      const openMatch = contentStr.match(/- 최초 오픈:\s*([^\n]+)/);
      if (openMatch) setOpenYearMonth(openMatch[1].trim());

      const priceMatch = contentStr.match(/- 판매 가격:\s*([^\n]+)/);
      if (priceMatch) {
        const cleanPrice = priceMatch[1].replace('만원', '').trim();
        setDealPrice(cleanPrice === '협의' ? '' : cleanPrice);
      }

      const rentalMatch = contentStr.match(/- 렌탈 유무:\s*([^\n]+)/);
      if (rentalMatch) setRentalType(rentalMatch[1].trim());

      const detailIndex = contentStr.indexOf('[상세 설명]');
      if (detailIndex !== -1) {
        const detailDesc = contentStr.substring(detailIndex + 8).trim();
        setWriteContent(detailDesc);
      }
    }
  }, [isEditing, selectedPost, writeCategory]);

  const onLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (writeCategory === '직거래') {
      let detailDesc = writeContent;
      const detailIndex = writeContent.indexOf('[상세 설명]');
      if (detailIndex !== -1) {
        detailDesc = writeContent.substring(detailIndex + 8).trim();
      }

      const formattedContent = `[직거래 정보]
- 거래 상태: ${dealStatus}
- 기기 기종: ${machineModel}
- 최초 오픈: ${openYearMonth || '미기재'}
- 판매 가격: ${dealPrice ? `${dealPrice} 만원` : '협의'}
- 렌탈 유무: ${rentalType}

[상세 설명]
${detailDesc}`;

      setWriteContent(formattedContent);
      
      setTimeout(() => {
        handleSavePost(e);
      }, 0);
    } else {
      handleSavePost(e);
    }
  };

  React.useEffect(() => {
    if (editorRef.current && writeContent !== undefined) {
      const currentHtml = editorRef.current.innerHTML;
      const targetHtml = markdownToHtml(writeContent);
      if (htmlToMarkdown(currentHtml) !== htmlToMarkdown(targetHtml)) {
        editorRef.current.innerHTML = targetHtml;
      }
    }
  }, [writeContent]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const markdown = htmlToMarkdown(editorRef.current.innerHTML);
      setWriteContent(markdown);
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
    const pastedText = e.clipboardData.getData('text/plain') || e.clipboardData.getData('text');
    if (!pastedText) return;
    e.preventDefault();
    const preprocessed = preprocessContent(pastedText);
    
    const htmlEscaped = preprocessed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r?\n|\r/g, '<br>');

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      
      const el = document.createElement('div');
      el.innerHTML = htmlEscaped;
      
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
    }
    handleEditorInput();
  };

  React.useEffect(() => {
    let mappedSkin = 1;
    if (writeCategory === '운용가이드' || writeCategory === '노하우팁') mappedSkin = 5;
    else if (writeCategory === 'Q&A' || writeCategory === '문의사항') mappedSkin = 2;
    else if (writeCategory === '공동구매' || writeCategory === '직거래') mappedSkin = 4;
    else if (writeCategory === 'H/W AS업체') mappedSkin = 3;
    else if (writeCategory === '장비운영' || writeCategory === '자료실') mappedSkin = 6;
    else if (writeCategory === '핵심정보') mappedSkin = 7;
    else if (writeCategory === '레시피') mappedSkin = 8;
    else mappedSkin = 1;

    if (setWriteSkinType) {
      setWriteSkinType(mappedSkin);
    }
  }, [writeCategory, setWriteSkinType]);

  const currentSkin = getSkinStyle(writeCategory);

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
                새 게시물 작성하기
              </h3>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onCloseWrite}
          className="p-1 px-3 text-stone-500 hover:text-stone-850 bg-stone-100 hover:bg-stone-205 rounded-full cursor-pointer text-[11px] font-bold transition-all"
        >
          작성창 닫기
        </button>
      </div>

      <div className="flex flex-col gap-2.5 md:gap-3">
        {/* Category selection grid */}
        <BoardCompWriteCategory
          writeCategory={writeCategory}
          setWriteCategory={setWriteCategory}
          isAdmin={isAdmin}
        />

        {/* Title */}
        <div>
          <label className="block text-stone-700 text-xs font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D37]" />
            <span>문의 제목 *</span>
          </label>
          <input
            type="text"
            value={writeTitle}
            onChange={(e) => setWriteTitle(e.target.value)}
            placeholder="예: 성수점 매장 오픈 일정 연동 및 지원 요청 건"
            className="w-full rounded-xl border border-stone-300 bg-white text-xs font-semibold text-[#1E1C26] outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all py-1.5 px-3 md:py-2 md:px-4"
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

        {/* Skin Style Selection (Auto-mapped) */}
        <div>
          <label className="block text-stone-700 text-xs font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentSkin.color }} />
            <span>자동 적용 본문 스킨 스타일</span>
          </label>
          <div className="flex items-center gap-2 bg-white/70 border border-stone-200/80 rounded-xl p-1.5 px-2.5 select-none w-fit">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentSkin.color }} />
            <span className="text-xs font-bold text-stone-700">{currentSkin.name}</span>
            <span className="text-[10px] text-stone-400 font-medium">({writeCategory} 카테고리 전용)</span>
          </div>
        </div>

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
            <label htmlFor="is_notice_chk" className="text-stone-700 text-xs font-bold cursor-pointer flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>공지사항으로 등록 (최상단 고정)</span>
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
          <label htmlFor="is_secret_chk" className="text-stone-700 text-xs font-bold cursor-pointer flex items-center gap-1.5 select-none">
            <Lock size={12.5} className="text-[#C5A059]" />
            <span>비밀글로 설정 (작성자 본인 및 헤이스트 마스터 점주만 조회 가능)</span>
          </label>
        </div>

        {/* Content Body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-stone-700 text-xs font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D37]" />
              <span>상세 문의 본문 *</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={inlineImageRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleInlineImageUpload}
              />
              <button
                type="button"
                onClick={triggerInlineImageSelect}
                disabled={isFileCompressing}
                className="flex items-center gap-1 text-[10.5px] font-bold text-stone-600 hover:text-[#C5A059] bg-white border border-stone-200 rounded-lg py-1 px-2.5 transition-all shadow-3xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Camera size={11} className={isFileCompressing ? 'animate-bounce' : ''} />
                <span>{isFileCompressing ? '사진 업로드 중...' : '본문 내 사진 삽입'}</span>
              </button>
            </div>
          </div>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onPaste={handleEditorPaste}
            data-placeholder="문의내용이나 매뉴얼 가이드라인을 상세히 작성해 주세요. 아래 서식을 사용하여 정돈된 매뉴얼 형태로 꾸밀 수 있습니다."
            className="w-full rounded-2xl border border-stone-300 bg-white text-xs font-medium text-[#1E1C26] outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all leading-normal py-2 px-3 md:py-3 md:px-4 min-h-[320px] max-h-[480px] overflow-y-auto select-text whitespace-pre-wrap"
          />
          <p className="text-[10px] text-stone-500 mt-1 select-none leading-relaxed bg-[#FAF9F6]/80 border border-stone-200/80 p-1.5 px-2.5 rounded-xl">
            💡 <strong>매뉴얼 양식 작성 안내:</strong> 문단 제목은 <code>## 대제목</code> 또는 <code>### 소제목</code>, 절차는 <code>STEP 1: 내용</code>, 강조는 <code>`키워드`</code>, 설명 상자는 <code>[TIP] 내용</code>, <code>[안내] 내용</code>, <code>[주의] 내용</code>으로 기재하면 게시글이 깔끔한 매뉴얼 디자인으로 자동 변환됩니다.
          </p>
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
          {isWriting ? '전송 보완 중...' : '전송 및 접수 통과 ➜'}
        </button>
      </div>
    </form>
  );
};
