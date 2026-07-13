import React from 'react';
import { MessageSquare, Trash2, Send } from 'lucide-react';

interface BoardDetailCommentsProps {
  comments: any[];
  newComment: string;
  setNewComment: (val: string) => void;
  loggedUser: any;
  isAdmin: boolean;
  onAddComment: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: number) => void;
}

export const BoardDetailComments: React.FC<BoardDetailCommentsProps> = ({
  comments,
  newComment,
  setNewComment,
  loggedUser,
  isAdmin,
  onAddComment,
  onDeleteComment,
}) => {
  return (
    <div className="bg-white border border-stone-200/80 text-left flex flex-col p-3.5 md:p-8 rounded-2xl md:rounded-[24px] gap-3.5 md:gap-5 shadow-sm">
      <span className="text-sm font-black font-serif text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-1.5">
        <MessageSquare size={15} className="text-[#C5A059]" />
        <span>실시간 헤이스트 지원 답변 현황 ({comments.length})</span>
      </span>

      {comments.length === 0 ? (
        <div className="text-center py-6 text-stone-450 text-xs font-light">
          아직 헤이스트에 접수된 공식 서면 답변이 기재되지 않았습니다. 신속히 배정하여 검토 후 승인처리 됩니다.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 md:gap-4">
          {comments.map((comment) => {
            const isManager = comment.store_code === 'admin' || comment.store_code === 'HQ-0001' || comment.role === 'ADMIN' || comment.store_name?.includes('헤이스트') || comment.owner_name === '관리자' || comment.member_id === 1;
            return (
              <div 
                key={comment.id}
                className={`border flex flex-col relative p-3 md:p-4.5 rounded-xl md:rounded-[18px] gap-1.5 md:gap-2 ${ isManager ? 'bg-[#1E1C26]/5 border-[#C5A059]/40 ml-4 sm:ml-8' : 'bg-stone-50/50 border-stone-100' }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9.5px] ${ isManager ? 'bg-[#C5A059] text-stone-950' : 'bg-stone-300 text-stone-800' }`}>
                      {isManager ? 'M' : comment.store_name?.slice(0, 1) || '점'}
                    </div>
                    <div>
                      <span className="text-[11.5px] font-black text-stone-800">
                        {isManager ? '관리자' : comment.store_name}
                      </span>
                      <span className="text-[9.5px] text-stone-400 font-light font-mono block leading-none mt-0.5">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {loggedUser && (
                    loggedUser.id == comment.member_id || 
                    (loggedUser.storeCode && loggedUser.storeCode === comment.store_code) || 
                    (loggedUser.store_code && loggedUser.store_code === comment.store_code) || 
                    loggedUser.role === 'ADMIN'
                  ) && (
                    <button
                      type="button"
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <p className="text-xs font-medium text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {isAdmin ? (
        <form onSubmit={onAddComment} className="mt-4 flex gap-2">
          <input
            type="text"
            required
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="관리자로 답변을 등록해 보세요."
            className="flex-1 rounded-full border border-stone-250 bg-stone-50 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:bg-white transition-all shadow-inner font-sans py-1.5 px-3.5 md:py-2.5 md:px-5"
          />
          <button
            type="submit"
            className="bg-stone-950 hover:bg-stone-850 text-[#C5A059] rounded-full transition-all cursor-pointer flex items-center justify-center p-2 px-3.5 md:p-2.5 md:px-4.5"
          >
            <Send size={13.5} />
          </button>
        </form>
      ) : (
        <div className="mt-4 bg-stone-100 border border-stone-200/60 rounded-xl text-center text-stone-555 text-[11px] font-sans p-2.5 md:p-3.5">
          💡 게시글리스트 조회와 열람은 모든 점주대표가 가능하며, 답변/문의 등록 요건은 헤이스트 관리자 승인 전용 권한입니다.
        </div>
      )}
    </div>
  );
};
