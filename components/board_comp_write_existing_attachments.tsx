import React from 'react';
import { Paperclip, Trash2 } from 'lucide-react';

interface BoardCompWriteExistingAttachmentsProps {
  isEditing: boolean;
  attachments: any[];
  deletedFileIds: number[];
  setDeletedFileIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const BoardCompWriteExistingAttachments: React.FC<BoardCompWriteExistingAttachmentsProps> = ({
  isEditing,
  attachments,
  deletedFileIds,
  setDeletedFileIds
}) => {
  if (!isEditing || attachments.length === 0) return null;

  return (
    <div>
      <label className="block text-stone-550 text-xs font-bold mb-1.5 flex items-center gap-1">
        <Paperclip size={13} />
        <span>기존 등록된 첨부파일 목록 ({attachments.length})</span>
      </label>
      <div className="flex flex-col gap-1.5 max-w-xl">
        {attachments.map((att) => {
          const isDeleted = deletedFileIds.includes(att.id);
          return (
            <div
              key={att.id}
              className={`flex items-center justify-between p-2 px-3 rounded-xl border text-[11px] font-mono transition-all ${ isDeleted ? 'bg-red-50/20 border-red-200/40 text-stone-400 line-through decoration-red-500' : 'bg-white border-stone-200 text-stone-750' }`}
            >
              <span className="truncate max-w-[200px] sm:max-w-xs">{att.original_name}</span>
              <button
                type="button"
                onClick={() => {
                  if (isDeleted) {
                    setDeletedFileIds(prev => prev.filter(id => id !== att.id));
                  } else {
                    setDeletedFileIds(prev => [...prev, att.id]);
                  }
                }}
                className={`transition-colors p-1 rounded-full hover:bg-stone-100 cursor-pointer ${ isDeleted ? 'text-emerald-600 hover:text-emerald-700 font-sans font-bold text-[10px] px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-200/50' : 'text-stone-400 hover:text-red-500' }`}
                title={isDeleted ? '삭제 취소 (보존)' : '첨부파일 삭제'}
              >
                {isDeleted ? (
                  <span>보존하기</span>
                ) : (
                  <Trash2 size={13.5} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
