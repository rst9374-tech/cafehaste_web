import React from 'react';
import { Lock, PlayCircle, Paperclip, Trash2, Play, Pause, BellRing } from 'lucide-react';
import { KakaoIcon } from './board_comp_list';
import { BoardCompWrite } from './board_comp_write';
import { BoardCompDetail } from './board_comp_detail';

interface BoardCompListItemProps {
  activeKwd?: string;
  post: any;
  index: number;
  currentPage: number;
  selectedPostId: number | null;
  selectedPost: any | null;
  attachments: any[];
  comments: any[];
  newComment: string;
  setNewComment: (val: string) => void;
  loggedUser: any;
  isAdmin: boolean;
  onSelectPost: (post: any) => void;
  onEditPost: (post?: any) => void;
  onDeletePost: (postId: number) => void;
  onAddComment: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: number) => void;
  onDeleteAttachment?: (attachmentId: number) => void;
  onPlayVideo: (videoUrl: string, title: string, desc: string) => void;
  isComp: boolean;
  isEditing: boolean;
  editingPostId: number | null;
  writeCategory: string;
  setWriteCategory: (val: string) => void;
  writeTitle: string;
  setWriteTitle: (val: string) => void;
  writeContent: string;
  setWriteContent: (val: string) => void;
  writeIsSecret: boolean;
  setWriteIsSecret: (val: boolean) => void;
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
  writeSkinType: number;
  setWriteSkinType: (val: number) => void;
  writeIsNotice: boolean;
  setWriteIsNotice: (val: boolean) => void;
  onToggleLike: (postId: number) => void;
  checkWritePermissionForCategory: (catName: string) => boolean;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  playingUrl: string | null;
  handleTogglePlay: (url: string) => void;
  showBulkSelect: boolean;
  onNavigateToPost?: (postId: number) => void;
}

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const renderHighlightedText = (text: string, searchWord: string) => {
  if (!searchWord || !searchWord.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${escapeRegExp(searchWord)})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-[#8C6D37] rounded-sm px-0.5 font-black">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export const BoardCompListItem: React.FC<BoardCompListItemProps> = ({
  activeKwd = '',
  post,
  index,
  currentPage,
  selectedPostId,
  selectedPost,
  attachments,
  comments,
  newComment,
  setNewComment,
  loggedUser,
  isAdmin,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onAddComment,
  onDeleteComment,
  onDeleteAttachment,
  onPlayVideo,
  isComp,
  isEditing,
  editingPostId,
  writeCategory,
  setWriteCategory,
  writeTitle,
  setWriteTitle,
  writeContent,
  setWriteContent,
  writeIsSecret,
  setWriteIsSecret,
  deletedFileIds,
  setDeletedFileIds,
  attachedFiles,
  setAttachedFiles,
  isWriting,
  isDragOver,
  setIsDragOver,
  fileInputRef,
  handleFileDrop,
  handleFileSelect,
  handleSavePost,
  onCloseWrite,
  writeSkinType,
  setWriteSkinType,
  writeIsNotice,
  setWriteIsNotice,
  onToggleLike,
  checkWritePermissionForCategory,
  selectedIds,
  setSelectedIds,
  playingUrl,
  handleTogglePlay,
  showBulkSelect,
  onNavigateToPost
}) => {
  const number = (currentPage - 1) * 12 + index + 1;
  const hasComment = post.comment_count && post.comment_count > 0;
  const isNewPost = (dateStr: string) => {
    if (!dateStr) return false;
    const postTime = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return (now - postTime) / (1000 * 60 * 60) <= 24;
  };
  const isSecret = post.is_secret === 1 || post.is_secret === true;
  const isNotice = post.is_notice === 1 || post.is_notice === true || post.is_notice === '1' || post.is_notice === 'true' || post.category === '공지사항' || (post.title && post.title.includes('[공지]'));

  const catColors: { [key: string]: string } = {
    '공지사항': 'bg-[#FFF3F3] text-[#D32F2F] border-[#FFCDD2]',
    '헤이스트소식': 'bg-[#FDFBF7] text-[#8C6D37] border-[#E8DFCE]',
    '공동구매': 'bg-[#FAF5EE] text-[#5D4037] border-[#E2D5C3]',
    '직거래': 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]',
    'H/W AS업체': 'bg-[#F9F9FB] text-stone-700 border-stone-250',
    'Q&A': 'bg-[#F5EFEB] text-[#4E342E] border-[#D7CCC8]',
    '노하우팁': 'bg-[#FAF5EE] text-[#8C6D37] border-[#E2D5C3]',
    '레시피': 'bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]',
    '핵심정보': 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
    '장비운영': 'bg-[#F9F9FB] text-stone-700 border-stone-250',
    'TEST': 'bg-[#F0FDFA] text-emerald-700 border-[#CCFBF1]'
  };
  const catClass = catColors[post.category] || catColors['Q&A'];

  const isSelected = selectedPostId === post.id;
  const hasAccess = !isSecret || (loggedUser && (loggedUser.id === post.member_id || isAdmin));

  const extractVideoUrl = (content: string): string | null => {
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

  const parseDirectDealStatus = (content: string): string | null => {
    if (!content) return null;
    const match = content.match(/- 거래 상태:\s*([^\n]+)/);
    return match ? match[1].trim() : null;
  };

  const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const yy = String(d.getFullYear()).slice(-2);
    const m = d.getMonth() + 1;
    const r = d.getDate();
    return `${yy}.${m}.${r}`;
  };

  const videoUrl = hasAccess ? extractVideoUrl(post.content) : null;

  return (
    <div className="flex flex-col border-b border-stone-200/50 last:border-0">
      {/* Summary Row */}
      <div
        onClick={() => onSelectPost(post)}
        className={`transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1.5 sm:px-2.5 cursor-pointer select-none py-1.5 md:py-2.5 ${
          isSelected 
            ? '!bg-[#C5A059]/10 border-l-2 border-[#C5A059] pl-1.5 sm:pl-2 hover:!bg-[#C5A059]/15' 
            : isNotice 
              ? '!bg-stone-100 hover:!bg-stone-200' 
              : 'hover:bg-stone-200'
        }`}
      >
        {/* Left Side: Checkbox + Index + Category + Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
          {showBulkSelect && (
            <input
              type="checkbox"
              checked={selectedIds.includes(post.id)}
              onChange={(e) => {
                e.stopPropagation();
                if (e.target.checked) {
                  setSelectedIds(prev => [...prev, post.id]);
                } else {
                  setSelectedIds(prev => prev.filter(id => id !== post.id));
                }
              }}
              className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer shrink-0 ml-0.5 sm:ml-1"
            />
          )}
          <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 font-bold shrink-0 w-4 sm:w-6 text-center">{number}</span>
          <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 rounded-full border font-bold uppercase shrink-0 ${catClass}`}>
            {post.category === '헤이스트소식' ? '소식' : (post.category === '운용가이드' || post.category === '노하우팁') ? '노하우팁' : (post.category || 'Q&A')}
          </span>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isSecret && <Lock size={12.5} className="text-[#C5A059] shrink-0" />}
            {post.category === '직거래' && (() => {
              const dealStatus = parseDirectDealStatus(post.content);
              if (!dealStatus) return null;
              return (
                <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border tracking-wide shrink-0 ${
                  dealStatus === '완료' 
                    ? 'bg-stone-100 text-stone-500 border-stone-200 font-normal'
                    : dealStatus === '거래진행중'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-[#C5A059]/10 text-[#8C6D37] border-[#C5A059]/30'
                }`}>
                  {dealStatus}
                </span>
              );
            })()}
            {(() => {
              return (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {(post.member_id >= 90000 || post.memberId >= 90000) && <KakaoIcon className="shrink-0" style={{ width: '14px', height: '14px' }} />}
                  {isNotice && <BellRing size={13} className="text-[#C5A059] shrink-0 fill-[#C5A059]/10" />}
                  <strong className={`hover:text-[#C5A059] transition-colors truncate block text-[13px] md:text-[15px] flex-1 min-w-0 ${
                    isNotice ? 'font-black text-black' : 'font-bold text-stone-850'
                  }`}>
                    {isNewPost(post.created_at) && (
                      <span className="inline-flex items-center justify-center px-1 py-0.5 bg-rose-500/10 text-[8px] font-black text-rose-600 border border-rose-250 rounded-sm shrink-0 select-none mr-1 align-middle">
                        NEW
                      </span>
                    )}
                    <span className="align-middle">{renderHighlightedText(post.title, activeKwd)}</span>
                  </strong>
                </div>
              );
            })()}
            {post.attachment_count > 0 && post.first_attachment_path && (() => {
              const isAudio = post.first_attachment_name?.match(/\.(mp3|wav|ogg|m4a)$/i);
              if (isAudio) {
                const isPlaying = playingUrl === post.first_attachment_path;
                return (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(post.first_attachment_path);
                    }}
                    className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ml-1 ${
                      isPlaying
                        ? 'bg-[#C5A059]/20 border-[#C5A059]/40 text-[#C5A059]'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-500 hover:text-[#C5A059]'
                    }`}
                    title={isPlaying ? '음악 일시정지' : `음악 바로 재생: ${post.first_attachment_name}`}
                  >
                    {isPlaying ? (
                      <Pause size={13.5} className="fill-[#C5A059]/10 animate-pulse" />
                    ) : (
                      <Play size={13.5} className="fill-stone-400/10 text-stone-500" />
                    )}
                  </button>
                );
              }
              return (
                <a
                  href={post.first_attachment_path}
                  download={post.first_attachment_name || 'attachment'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-stone-400 hover:text-[#C5A059] transition-colors shrink-0 flex items-center justify-center ml-0.5 active:scale-95"
                  title={`첨부파일 바로 다운로드: ${post.first_attachment_name || ''}`}
                >
                  <Paperclip size={13} />
                </a>
              );
            })()}
            {videoUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayVideo(videoUrl, post.title, post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) : '');
                }}
                className="p-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/30 text-[#C5A059] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ml-1"
                title="동영상 재생"
              >
                <PlayCircle size={14} className="fill-[#C5A059]/10" />
              </button>
            )}
            {hasComment && (
              <span className="bg-[#1E1C26] text-[#C5A059] py-0.5 px-1.5 rounded-full text-[8px] sm:text-[8.5px] font-bold shrink-0 font-sans">
                답변완료
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Author/Store info + Date */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] sm:text-[10.5px] text-stone-555 shrink-0 font-sans border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200/30 sm:border-none">
          <div className="flex items-center gap-1">
            {(post.member_id >= 90000 || post.memberId >= 90000) && <KakaoIcon className="shrink-0" style={{ width: '11px', height: '11px' }} />}
            <span className="font-semibold text-stone-700 truncate max-w-[80px] sm:max-w-[100px] text-right">
              {(!post.store_name || post.store_name.includes('헤이스트') || post.store_name === '헤이스트 마스터' || post.owner_name === '관리자' || post.role === 'ADMIN')
                ? '관리자'
                : post.store_name}
            </span>
          </div>
          <span className="font-mono text-stone-400 w-[52px] text-center shrink-0">
            {formatShortDate(post.created_at)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleLike) onToggleLike(post.id);
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all active:scale-95 cursor-pointer shrink-0 ${
              post.liked 
                ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold' 
                : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-[#C5A059] hover:border-[#C5A059]/30'
            }`}
            title={post.liked ? '하트 취소' : '하트 추가'}
          >
            <span className="text-[10px] sm:text-[11px] leading-none">
              {post.liked ? '❤️' : '🤍'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono font-black leading-none select-none">
              {post.like_count || 0}
            </span>
          </button>
          <span className="font-mono bg-stone-100/80 px-1 py-0.5 rounded text-stone-555 text-[8.5px] sm:text-[9.2px] shrink-0">
            조회 {post.view_count || 0}
          </span>
          {(isAdmin || (loggedUser && (
            (loggedUser.id == post.member_id || 
             (loggedUser.storeCode && loggedUser.storeCode === post.store_code) || 
             (loggedUser.store_code && loggedUser.store_code === post.store_code))
            && checkWritePermissionForCategory(post.category)
          ))) && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  onSelectPost(post);
                  if (onEditPost) onEditPost(post);
                }}
                className="p-1 px-2 text-[10px] font-bold bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-855 rounded-md transition-colors cursor-pointer"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePost) onDeletePost(post.id);
                }}
                className="p-1 px-2 text-[10px] font-bold bg-rose-55 hover:bg-rose-100 border border-rose-250 text-rose-600 rounded-md transition-colors cursor-pointer"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accordion Detail Panel */}
      {isSelected && selectedPost && (
        <div className="bg-[#FAF9F6]/30 border-t border-stone-200/60 p-3 md:p-6" onClick={(e) => e.stopPropagation()}>
          {isEditing && editingPostId === post.id ? (
            <BoardCompWrite
              isEditing={isEditing}
              selectedPost={selectedPost}
              writeCategory={writeCategory}
              setWriteCategory={setWriteCategory}
              writeTitle={writeTitle}
              setWriteTitle={setWriteTitle}
              writeContent={writeContent}
              setWriteContent={setWriteContent}
              writeIsSecret={writeIsSecret}
              setWriteIsSecret={setWriteIsSecret}
              writeIsNotice={writeIsNotice}
              setWriteIsNotice={setWriteIsNotice}
              attachments={attachments}
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
              isComp={isComp}
              writeSkinType={writeSkinType}
              setWriteSkinType={setWriteSkinType}
              isAdmin={isAdmin}
            />
          ) : (
            <BoardCompDetail
              activeKwd={activeKwd}
              selectedPost={selectedPost}
              attachments={attachments}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              loggedUser={loggedUser}
              isAdmin={isAdmin}
              onBackToList={() => onSelectPost(post)}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onDeleteAttachment={onDeleteAttachment}
              isComp={isComp}
              onPlayVideo={onPlayVideo}
              onToggleLike={onToggleLike}
              checkWritePermissionForCategory={checkWritePermissionForCategory}
              onNavigateToPost={onNavigateToPost}
            />
          )}
        </div>
      )}
    </div>
  );
};
