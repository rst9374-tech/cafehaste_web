import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search, Sparkles } from 'lucide-react';
import { AdminSystemHub } from './admin/admin_comp_systemhub';
import { BoardCompList, KakaoIcon } from './board_comp_list';
import { BoardCompWrite } from './board_comp_write';
import { AdminConfirmModal } from './admin/admin_comp_shared';
import { useBoardState } from './board_hook_main';

interface HasteBoardProps {
  loggedUser: any;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  isNested?: boolean;
  setActivePlayFilm?: (film: any) => void;
  isMobile?: boolean;
}

export const HasteBoard: React.FC<HasteBoardProps> = ({ loggedUser, onOpenLogin, onOpenSignUp, isNested = false, setActivePlayFilm, isMobile = false }) => {
  const isComp = isMobile;
  const board = useBoardState({ loggedUser, setActivePlayFilm });

  return (
    <div className={isNested ? "w-full font-sans" : "w-full max-w-6xl mx-auto px-4 md:px-6 font-sans"}>
      <div className={isNested ? "flex flex-col gap-1.5 md:gap-2.5 -mt-1 md:-mt-3.5" : "bg-white border border-stone-200 shadow-sm flex flex-col p-1.5 sm:p-2.5 md:p-4 rounded-xl md:rounded-2xl gap-1.5 md:gap-3"}>
        <div className="flex flex-col gap-1.5 sm:gap-2 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div className="bg-[#FAF9F6] border border-stone-200/80 p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none no-swipe flex-1 max-w-full">
              {['전체', '헤이스트소식', '운용가이드', '노하우팁', '장비운영', '자료실', '레시피', '핵심정보', 'Q&A', '직거래', 'TEST']
                .filter((cat) => cat !== '핵심정보' || board.isAdmin)
                .map((cat) => {
                  const isActive = board.selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        board.setSelectedCategory(cat);
                        board.setCurrentPage(1);
                        board.setSelectedPost(null);
                        board.setIsEditing(false);
                        board.setEditingPostId(null);
                        if (board.isInlineWriteOpen) {
                          board.setWriteCategory(cat === '전체' ? 'Q&A' : cat);
                        }
                      }}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black transition-all tracking-wider cursor-pointer whitespace-nowrap flex items-center justify-center shrink-0 border-2 ${ isActive ? 'bg-stone-900 text-[#C5A059] border-stone-900 shadow-md' : 'bg-white text-stone-850 hover:text-stone-950 border-stone-300 hover:bg-stone-50' }`}
                    >
                      <span>{cat === '헤이스트소식' ? '소식' : (cat === '운용가이드' || cat === '노하우팁') ? '노하우팁' : cat}</span>
                    </button>
                  );
                })}
            </div>

            <div className="flex items-center gap-2 shrink-0 justify-end">
              {board.isAdmin && (
                <AdminSystemHub 
                  showTemporaryToast={(msg) => alert(msg)}
                  showTemporaryError={(msg) => alert(`Error: ${msg}`)}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  board.setIsRefreshing(true);
                  board.fetchPosts();
                }}
                className="p-2.5 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all text-stone-650 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                title="새로고침"
              >
                <RefreshCw size={14} className={board.isRefreshing ? 'animate-spin' : ''} />
              </button>

              {board.showWriteButton && (
                <button
                  type="button"
                  onClick={() => {
                    if (board.isInlineWriteOpen && !board.isEditing) {
                      board.setIsInlineWriteOpen(false);
                    } else {
                      board.setWriteTitle('');
                      board.setWriteContent('');
                      board.setWriteIsSecret(false);
                      board.setWriteIsNotice(false);
                      board.setWriteSkinType(1);
                      board.setAttachedFiles([]);
                      board.setWriteCategory(board.selectedCategory === '전체' ? 'Q&A' : board.selectedCategory);
                      board.setIsEditing(false);
                      board.setIsInlineWriteOpen(true);
                    }
                  }}
                  className={`font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center justify-center cursor-pointer border shrink-0 active:scale-95 text-xs ${ board.isInlineWriteOpen && !board.isEditing ? 'bg-stone-800 hover:bg-stone-850 text-white border-stone-800 shadow-inner' : 'bg-stone-900 hover:bg-stone-850 text-[#C5A059] border-stone-855 shadow-xs' }`}
                >
                  <span>{board.isInlineWriteOpen && !board.isEditing ? '작성창 닫기' : '글쓰기'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 검색 바 & 게시판 성격 설명 카드 영역 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-3">
            {/* 검색 바 영역 */}
            <div className="flex items-center gap-1 sm:gap-1.5 max-w-[300px] bg-white border border-stone-400 rounded-xl p-0.5 px-1.5 shadow-3xs w-full sm:w-[300px] shrink-0">
              <span className="text-stone-400 pl-0.5">
                <Search size={12.5} />
              </span>
              <input
                type="text"
                value={board.searchKwd}
                onChange={(e) => board.setSearchKwd(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    board.setActiveKwd(board.searchKwd);
                    board.setCurrentPage(1);
                  }
                }}
                placeholder="게시물 제목, 본문 키워드 검색..."
                className="flex-1 bg-transparent text-[11px] sm:text-xs font-bold text-stone-855 outline-none placeholder-stone-400 py-0"
              />
              {board.searchKwd && (
                <button
                  type="button"
                  onClick={() => {
                    board.setSearchKwd('');
                    board.setActiveKwd('');
                    board.setCurrentPage(1);
                  }}
                  className="text-stone-400 hover:text-stone-700 text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded hover:bg-stone-200 cursor-pointer transition-colors"
                >
                  초기화
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  board.setActiveKwd(board.searchKwd);
                  board.setCurrentPage(1);
                }}
                className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] text-[9.5px] sm:text-[10.5px] font-black rounded-lg px-2 py-0.5 cursor-pointer active:scale-95 transition-all shadow-3xs border border-stone-900"
              >
                검색
              </button>
            </div>

            {/* AI 기반 게시판 성격 설명 카드 */}
            <div className="flex flex-col gap-1 bg-emerald-50/50 border border-emerald-250/50 rounded-xl p-1.5 px-2.5 md:p-2 md:px-3 max-w-2xl text-left shadow-3xs select-none">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1.5 shrink-0 w-9 justify-end mt-0.5">
                  <RefreshCw size={12} className="text-emerald-600 animate-spin shrink-0" />
                  <KakaoIcon className="w-4 h-4 shrink-0" />
                </div>
                <p className="text-[10.5px] sm:text-[11.5px] leading-relaxed text-emerald-800 font-bold font-sans flex-1">
                  카톡 아이콘이 붙은 게시글은 소통방의 베테랑 점주 노하우를 AI가 분석하여 자동 등록한 글입니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex items-center justify-end shrink-0 w-9 mt-0.5">
                  <span className="shrink-0 text-xs leading-none">❤️</span>
                </div>
                <p className="text-[10.5px] sm:text-[11.5px] leading-relaxed text-emerald-700 font-bold font-sans flex-1">
                  받은 하트 수는 우수 점주 보상 지급 시 반영됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {board.isInlineWriteOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden no-swipe"
            >
              <BoardCompWrite
                isEditing={board.isEditing}
                selectedPost={board.selectedPost}
                writeCategory={board.writeCategory}
                setWriteCategory={board.setWriteCategory}
                writeTitle={board.writeTitle}
                setWriteTitle={board.setWriteTitle}
                writeContent={board.writeContent}
                setWriteContent={board.setWriteContent}
                writeIsSecret={board.writeIsSecret}
                setWriteIsSecret={board.setWriteIsSecret}
                writeIsNotice={board.writeIsNotice}
                setWriteIsNotice={board.setWriteIsNotice}
                writeSkinType={board.writeSkinType}
                setWriteSkinType={board.setWriteSkinType}
                attachments={board.attachments}
                deletedFileIds={board.deletedFileIds}
                setDeletedFileIds={board.setDeletedFileIds}
                attachedFiles={board.attachedFiles}
                setAttachedFiles={board.setAttachedFiles}
                isWriting={board.isWriting}
                isDragOver={board.isDragOver}
                setIsDragOver={board.setIsDragOver}
                fileInputRef={board.fileInputRef}
                handleFileDrop={board.handleFileDrop}
                handleFileSelect={board.handleFileSelect}
                handleSavePost={board.handleSavePost}
                isComp={isComp}
                isAdmin={board.isAdmin}
                onCloseWrite={() => {
                  board.setWriteTitle('');
                  board.setWriteContent('');
                  board.setWriteIsSecret(false);
                  board.setWriteIsNotice(false);
                  board.setWriteSkinType(1);
                  board.setAttachedFiles([]);
                  board.setDeletedFileIds([]);
                  board.setIsEditing(false);
                  board.setEditingPostId(null);
                  board.setIsInlineWriteOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <BoardCompList
          posts={board.posts}
          totalPosts={board.totalPosts}
          isLoading={board.isLoading}
          currentPage={board.currentPage}
          totalPages={board.totalPages}
          setCurrentPage={board.setCurrentPage}
          onPlayVideo={(videoUrl, title, desc) => setActivePlayFilm && setActivePlayFilm({ id: 9999, title, desc, videoUrl })}
          onSelectPost={(post) => {
            if (board.selectedPost && board.selectedPost.id === post.id) {
              board.setSelectedPost(null);
              board.setIsEditing(false);
              board.setEditingPostId(null);
            } else {
              board.handleSelectPost(post);
            }
          }}
          selectedPostId={board.selectedPost?.id}
          selectedPost={board.selectedPost}
          onNavigateToPost={(postId) => board.handleSelectPost({ id: postId })}
          attachments={board.attachments}
          comments={board.comments}
          newComment={board.newComment}
          setNewComment={board.setNewComment}
          loggedUser={loggedUser}
          isAdmin={board.isAdmin}
          onDeleteAttachment={board.handleDeleteAttachment}
          isComp={isComp}
          isEditing={board.isEditing}
          editingPostId={board.editingPostId}
          writeCategory={board.writeCategory}
          setWriteCategory={board.setWriteCategory}
          writeTitle={board.writeTitle}
          setWriteTitle={board.setWriteTitle}
          writeContent={board.writeContent}
          setWriteContent={board.setWriteContent}
          writeIsSecret={board.writeIsSecret}
          setWriteIsSecret={board.setWriteIsSecret}
          writeIsNotice={board.writeIsNotice}
          setWriteIsNotice={board.setWriteIsNotice}
          writeSkinType={board.writeSkinType}
          setWriteSkinType={board.setWriteSkinType}
          deletedFileIds={board.deletedFileIds}
          setDeletedFileIds={board.setDeletedFileIds}
          attachedFiles={board.attachedFiles}
          setAttachedFiles={board.setAttachedFiles}
          isWriting={board.isWriting}
          isDragOver={board.isDragOver}
          setIsDragOver={board.setIsDragOver}
          fileInputRef={board.fileInputRef}
          handleFileDrop={board.handleFileDrop}
          handleFileSelect={board.handleFileSelect}
          handleSavePost={board.handleSavePost}
          onCloseWrite={() => {
            board.setWriteTitle('');
            board.setWriteContent('');
            board.setWriteIsSecret(false);
            board.setWriteIsNotice(false);
            board.setWriteSkinType(1);
            board.setAttachedFiles([]);
            board.setDeletedFileIds([]);
            board.setIsEditing(false);
            board.setEditingPostId(null);
            board.setIsInlineWriteOpen(false);
          }}
          onEditPost={(postToEdit) => {
            const target = postToEdit || board.selectedPost;
            if (!target) return;
            board.setEditingPostId(target.id);
            board.setWriteTitle(target.title);
            board.setWriteContent(target.content);
            board.setWriteIsSecret(target.is_secret === 1 || target.is_secret === true);
            board.setWriteIsNotice(target.is_notice === 1 || target.is_notice === true);
            board.setWriteCategory(target.category || 'Q&A');
            board.setWriteSkinType(target.skin_type || target.skinType || 1);
            board.setAttachedFiles([]);
            board.setDeletedFileIds([]);
            board.setIsEditing(true);
            board.setIsInlineWriteOpen(false);
          }}
          onDeletePost={board.handleDeletePost}
          onDeletePosts={board.handleDeletePosts}
          onSetNoticePosts={board.handleSetNoticePosts}
          onAddComment={board.handleAddComment}
          onDeleteComment={board.handleDeleteComment}
          onToggleLike={board.handleToggleLike}
          checkWritePermissionForCategory={board.checkWritePermissionForCategory}
        />

        {/* 목록 하단 검색바 및 글쓰기 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-150 pt-2 mt-1">
          {/* 검색 바 영역 */}
          <div className="flex items-center gap-1 sm:gap-1.5 max-w-[300px] bg-white border border-stone-400 rounded-xl p-0.5 px-1.5 shadow-3xs w-full sm:w-[300px] shrink-0">
            <span className="text-stone-400 pl-0.5">
              <Search size={12.5} />
            </span>
            <input
              type="text"
              value={board.searchKwd}
              onChange={(e) => board.setSearchKwd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  board.setActiveKwd(board.searchKwd);
                  board.setCurrentPage(1);
                }
              }}
              placeholder="게시물 제목, 본문 키워드 검색..."
              className="flex-1 bg-transparent text-[11px] sm:text-xs font-bold text-stone-855 outline-none placeholder-stone-400 py-0"
            />
            {board.searchKwd && (
              <button
                type="button"
                onClick={() => {
                  board.setSearchKwd('');
                  board.setActiveKwd('');
                  board.setCurrentPage(1);
                }}
                className="text-stone-400 hover:text-stone-700 text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded hover:bg-stone-200 cursor-pointer transition-colors"
              >
                초기화
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                board.setActiveKwd(board.searchKwd);
                board.setCurrentPage(1);
              }}
              className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] text-[9.5px] sm:text-[10.5px] font-black rounded-lg px-2 py-0.5 cursor-pointer active:scale-95 transition-all shadow-3xs border border-stone-900"
            >
              검색
            </button>
          </div>

          {/* 글쓰기 버튼 */}
          {board.showWriteButton && (
            <button
              type="button"
              onClick={() => {
                if (board.isInlineWriteOpen && !board.isEditing) {
                  board.setIsInlineWriteOpen(false);
                } else {
                  board.setWriteTitle('');
                  board.setWriteContent('');
                  board.setWriteIsSecret(false);
                  board.setWriteIsNotice(false);
                  board.setWriteSkinType(1);
                  board.setAttachedFiles([]);
                  board.setWriteCategory(board.selectedCategory === '전체' ? 'Q&A' : board.selectedCategory);
                  board.setIsEditing(false);
                  board.setIsInlineWriteOpen(true);
                  // 스크롤 상단 이동 또는 작성창 포커싱
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`font-bold py-1 px-3 rounded-xl transition-all flex items-center justify-center cursor-pointer border shrink-0 active:scale-95 text-xs ${ board.isInlineWriteOpen && !board.isEditing ? 'bg-stone-800 hover:bg-stone-855 text-white border-stone-800 shadow-inner' : 'bg-stone-900 hover:bg-stone-850 text-[#C5A059] border-stone-855 shadow-xs' }`}
            >
              <span>{board.isInlineWriteOpen && !board.isEditing ? '작성창 닫기' : '글쓰기'}</span>
            </button>
          )}
        </div>
      </div>
      {board.confirmModal && typeof document !== 'undefined' && createPortal(
        <AdminConfirmModal
          message={board.confirmModal.message}
          onCancel={() => board.setConfirmModal(null)}
          onConfirm={() => {
            board.confirmModal.onConfirm();
            board.setConfirmModal(null);
          }}
        />,
        document.body
      )}
    </div>
  );
};
