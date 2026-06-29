import React from 'react';
import { MessageSquare, RefreshCw, ChevronLeft, ChevronRight, Trash2, Pin } from 'lucide-react';
import { BoardCompListItem } from './board_comp_list_item';

export const KakaoIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "w-4 h-4", style }) => (
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

interface BoardCompListProps {
  posts: any[];
  totalPosts?: number;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  onSelectPost: (post: any) => void;
  selectedPostId?: number | null;
  selectedPost?: any | null;
  attachments?: any[];
  comments?: any[];
  newComment?: string;
  setNewComment?: (val: string) => void;
  loggedUser?: any;
  isAdmin?: boolean;
  onEditPost?: (post?: any) => void;
  onDeletePost?: (postId: number) => void;
  onDeletePosts?: (postIds: number[]) => void;
  onSetNoticePosts?: (postIds: number[]) => void;
  onAddComment?: (e: React.FormEvent) => void;
  onDeleteComment?: (commentId: number) => void;
  onDeleteAttachment?: (attachmentId: number) => void;
  onPlayVideo?: (videoUrl: string, title: string, desc: string) => void;
  isComp?: boolean;
  isEditing?: boolean;
  editingPostId?: number | null;
  writeCategory?: string;
  setWriteCategory?: (val: string) => void;
  writeTitle?: string;
  setWriteTitle?: (val: string) => void;
  writeContent?: string;
  setWriteContent?: (val: string) => void;
  writeIsSecret?: boolean;
  setWriteIsSecret?: (val: boolean) => void;
  deletedFileIds?: number[];
  setDeletedFileIds?: React.Dispatch<React.SetStateAction<number[]>>;
  attachedFiles?: Array<{ name: string; type: string; base64: string }>;
  setAttachedFiles?: React.Dispatch<React.SetStateAction<Array<{ name: string; type: string; base64: string }>>>;
  isWriting?: boolean;
  isDragOver?: boolean;
  setIsDragOver?: (val: boolean) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  handleFileDrop?: (e: React.DragEvent) => void;
  handleFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSavePost?: (e: React.FormEvent) => void;
  onCloseWrite?: () => void;
  writeSkinType?: number;
  setWriteSkinType?: (val: number) => void;
  writeIsNotice?: boolean;
  setWriteIsNotice?: (val: boolean) => void;
  onToggleLike?: (postId: number) => void;
  checkWritePermissionForCategory?: (catName: string) => boolean;
  onNavigateToPost?: (postId: number) => void;
}

export const BoardCompList: React.FC<BoardCompListProps> = ({
  posts,
  totalPosts = 0,
  isLoading,
  currentPage,
  totalPages,
  setCurrentPage,
  onSelectPost,
  selectedPostId = null,
  selectedPost = null,
  attachments = [],
  comments = [],
  newComment = '',
  setNewComment = () => {},
  loggedUser = null,
  isAdmin = false,
  onEditPost = () => {},
  onDeletePost = () => {},
  onDeletePosts = () => {},
  onSetNoticePosts = () => {},
  onAddComment = () => {},
  onDeleteComment = () => {},
  onDeleteAttachment = () => {},
  onPlayVideo = () => {},
  isComp = false,
  isEditing = false,
  editingPostId = null,
  writeCategory = 'Q&A',
  setWriteCategory = () => {},
  writeTitle = '',
  setWriteTitle = () => {},
  writeContent = '',
  setWriteContent = () => {},
  writeIsSecret = false,
  setWriteIsSecret = () => {},
  deletedFileIds = [],
  setDeletedFileIds = () => {},
  attachedFiles = [],
  setAttachedFiles = () => {},
  isWriting = false,
  isDragOver = false,
  setIsDragOver = () => {},
  fileInputRef = React.createRef(),
  handleFileDrop = () => {},
  handleFileSelect = () => {},
  handleSavePost = () => {},
  onCloseWrite = () => {},
  writeSkinType = 1,
  setWriteSkinType = () => {},
  writeIsNotice = false,
  setWriteIsNotice = () => {},
  onToggleLike = () => {},
  checkWritePermissionForCategory = () => true,
  onNavigateToPost
}) => {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [playingUrl, setPlayingUrl] = React.useState<string | null>(null);
  const audioInstanceRef = React.useRef<HTMLAudioElement | null>(null);

  const userGrade = loggedUser ? (loggedUser.store_type || loggedUser.storeType || '일반') : '일반';
  const showBulkSelect = isAdmin || (loggedUser && userGrade !== '일반');

  // Stop audio when component unmounts
  React.useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
        audioInstanceRef.current = null;
      }
    };
  }, []);

  const handleTogglePlay = (url: string) => {
    if (playingUrl === url) {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
      }
      setPlayingUrl(null);
    } else {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
      }
      const newAudio = new Audio(url);
      audioInstanceRef.current = newAudio;
      setPlayingUrl(url);
      newAudio.play().catch(err => {
        console.warn('Audio play failed:', err);
        setPlayingUrl(null);
      });
      newAudio.onended = () => {
        setPlayingUrl(null);
      };
    }
  };



  // Reset selection when page changes or posts change
  React.useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, posts]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-stone-450 text-xs font-semibold flex flex-col items-center gap-2 justify-center">
        <RefreshCw size={20} className="animate-spin text-[#C5A059]" />
        <span>Q&A 데이터 트랜잭션 수신 중...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 py-16 px-6 text-center text-stone-400 text-xs font-light shadow-xs flex flex-col items-center justify-center">
        <MessageSquare size={32} className="text-stone-300 mb-3" />
        <span>검색어와 부합하거나 등록된 Q&A 문의 데이터 건수가 존재하지 않습니다.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full -mt-2 md:-mt-3 gap-1.5">
      {/* Bulk actions header or Total count header for normal users */}
      {showBulkSelect ? (
        <div className="flex items-center justify-between bg-stone-50/70 border border-stone-200/60 rounded-2xl p-2 px-3 select-none mt-0">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={posts.length > 0 && selectedIds.length === posts.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(posts.map(p => p.id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="w-4 h-4 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
              id="selectAllPosts"
            />
            <label htmlFor="selectAllPosts" className="text-xs font-black text-stone-600 cursor-pointer">
              전체 선택 ({selectedIds.length}/{totalPosts || posts.length})
            </label>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSetNoticePosts) {
                    onSetNoticePosts(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-800 transition-colors cursor-pointer bg-amber-50 border border-amber-250 p-1.5 px-3 rounded-xl active:scale-95 transition-all shadow-xs"
              >
                <Pin size={12} className="rotate-45 text-[#C5A059]" />
                <span>공지 등록 ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePosts) {
                    onDeletePosts(selectedIds);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700 transition-colors cursor-pointer bg-rose-50/50 border border-rose-200 p-1.5 px-3 rounded-xl active:scale-95 transition-all shadow-xs"
              >
                <Trash2 size={12.5} />
                <span>선택 삭제 ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center bg-stone-50/40 border border-stone-200/50 rounded-2xl p-2.5 px-4 select-none mt-0 shadow-3xs">
          <span className="text-[11px] font-black text-stone-500 font-mono tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-450 animate-pulse" />
            <span>총 {totalPosts || posts.length}개의 게시글이 있습니다.</span>
          </span>
        </div>
      )}

      {/* List of posts with subtle divider lines */}
      <div className="flex flex-col divide-y divide-stone-300">
        {(() => {
          let displayPosts = [...posts];
          if (selectedPost && !displayPosts.some(p => p.id === selectedPost.id)) {
            displayPosts = [selectedPost, ...displayPosts];
          }
          return displayPosts.map((post, i) => {
            const originalIndex = posts.findIndex(p => p.id === post.id);
            const indexValue = originalIndex !== -1 ? originalIndex : i;
            return (
              <BoardCompListItem
                key={post.id}
                post={post}
                index={indexValue}
                currentPage={currentPage}
                selectedPostId={selectedPostId}
                selectedPost={selectedPost}
                attachments={attachments}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                loggedUser={loggedUser}
                isAdmin={isAdmin}
                onSelectPost={onSelectPost}
                onEditPost={onEditPost}
                onDeletePost={onDeletePost}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onDeleteAttachment={onDeleteAttachment}
                onPlayVideo={onPlayVideo}
                isComp={isComp}
                isEditing={isEditing}
                editingPostId={editingPostId}
                writeCategory={writeCategory}
                setWriteCategory={setWriteCategory}
                writeTitle={writeTitle}
                setWriteTitle={setWriteTitle}
                writeContent={writeContent}
                setWriteContent={setWriteContent}
                writeIsSecret={writeIsSecret}
                setWriteIsSecret={setWriteIsSecret}
                deletedFileIds={deletedFileIds}
                setDeletedFileIds={setDeletedFileIds}
                attachedFiles={attachedFiles}
                setAttachedFiles={setAttachedFiles}
                isWriting={isWriting}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
                fileInputRef={fileInputRef}
                handleFileDrop={handleFileDrop}
                handleFileSelect={handleFileSelect}
                handleSavePost={handleSavePost}
                onCloseWrite={onCloseWrite}
                writeSkinType={writeSkinType}
                setWriteSkinType={setWriteSkinType}
                writeIsNotice={writeIsNotice}
                setWriteIsNotice={setWriteIsNotice}
                onToggleLike={onToggleLike}
                checkWritePermissionForCategory={checkWritePermissionForCategory}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                playingUrl={playingUrl}
                handleTogglePlay={handleTogglePlay}
                showBulkSelect={showBulkSelect}
                onNavigateToPost={onNavigateToPost}
              />
            );
          });
        })()}
      </div>

      {/* Bulk actions footer (목록 하단 일괄 작업) */}
      {showBulkSelect && (
        <div className="flex items-center justify-between bg-stone-50/70 border border-stone-200/60 rounded-2xl p-2 px-3 select-none mt-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={posts.length > 0 && selectedIds.length === posts.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(posts.map(p => p.id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="w-4 h-4 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
              id="selectAllPostsBottom"
            />
            <label htmlFor="selectAllPostsBottom" className="text-xs font-black text-stone-600 cursor-pointer">
              전체 선택 ({selectedIds.length}/{totalPosts || posts.length})
            </label>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              {isAdmin && onSetNoticePosts && (
                <button
                  type="button"
                  onClick={() => {
                    onSetNoticePosts(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-800 transition-colors cursor-pointer bg-amber-50 border border-amber-250 p-1.5 px-3 rounded-xl active:scale-95 transition-all shadow-xs"
                >
                  <Pin size={12} className="rotate-45 text-[#C5A059]" />
                  <span>공지 등록 ({selectedIds.length})</span>
                </button>
              )}
              {onDeletePosts && (
                <button
                  type="button"
                  onClick={() => {
                    onDeletePosts(selectedIds);
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700 transition-colors cursor-pointer bg-rose-50/50 border border-rose-200 p-1.5 px-3 rounded-xl active:scale-95 transition-all shadow-xs"
                >
                  <Trash2 size={12.5} />
                  <span>선택 삭제 ({selectedIds.length})</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1.5 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-50 transition-all cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-bold text-stone-750 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-1.5 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-50 transition-all cursor-pointer disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
