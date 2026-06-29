import React from 'react';
import { Paperclip, ImageIcon, FileText, Trash2 } from 'lucide-react';

interface BoardCompWriteAttachmentsProps {
  attachedFiles: Array<{ name: string; type: string; base64: string }>;
  setAttachedFiles: React.Dispatch<React.SetStateAction<Array<{ name: string; type: string; base64: string }>>>;
  isFileCompressing: boolean;
  isDragOver: boolean;
  setIsDragOver: (val: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onLocalFileDrop: (e: React.DragEvent) => void;
  onLocalFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BoardCompWriteAttachments: React.FC<BoardCompWriteAttachmentsProps> = ({
  attachedFiles,
  setAttachedFiles,
  isFileCompressing,
  isDragOver,
  setIsDragOver,
  fileInputRef,
  onLocalFileDrop,
  onLocalFileSelect
}) => {
  return (
    <div>
      <label className="block text-stone-700 text-xs font-bold mb-1">
        현장 이미지 및 참고자료 첨부파일 (다중 파일 지원)
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!isFileCompressing) setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onLocalFileDrop}
        onClick={() => { if (!isFileCompressing) fileInputRef.current?.click(); }}
        className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${ isDragOver ? 'border-[#8C6D37] bg-[#8C6D37]/5' : 'border-stone-300 hover:border-stone-400 bg-white' } ${isFileCompressing ? 'opacity-60 cursor-wait' : ''}`}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={onLocalFileSelect}
          className="hidden"
          disabled={isFileCompressing}
        />
        <Paperclip size={14} className={`text-stone-400 mx-auto mb-1 ${isFileCompressing ? 'animate-bounce' : ''}`} />
        <p className="text-[11px] font-bold text-stone-700">
          {isFileCompressing ? '이미지 압축 및 본문 삽입 업로드 중...' : '이곳에 첨부파일을 드래그하여 올려놓거나 클릭해 주세요.'}
        </p>
        <p className="text-[9.5px] text-stone-400 mt-0.5 font-light font-sans">
          이미지 첨부 시 본문 내 커서 위치에 바로 미리보기가 삽입되며, 일반 문서 첨부도 지원합니다.
        </p>
      </div>

      {/* Uploaded items listing preview */}
      {attachedFiles.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {attachedFiles.map((file, idx) => (
            <div key={idx} className="bg-white rounded-lg py-1.5 px-3 border border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-700">
              <div className="flex items-center gap-2 truncate">
                {file.type.startsWith('image/') ? (
                  <ImageIcon size={13} className="text-emerald-600 shrink-0" />
                ) : (
                  <FileText size={13} className="text-stone-550 shrink-0" />
                )}
                <span className="truncate max-w-[200px] md:max-w-md">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAttachedFiles(prev => prev.filter((_, idx2) => idx2 !== idx));
                }}
                className="text-stone-440 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <Trash2 size={13.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
