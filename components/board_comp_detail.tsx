import React, { useState } from 'react';
import { 
  Lock, Calendar, Paperclip, ImageIcon, FileText, Download, Trash2, Edit, ArrowLeft, Copy, Check, PlayCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { HasteGuidebookModal } from './membership_modal_guidebook';
import { HasteBenefitModal } from './membership_modal_benefit';
import { BoardDetailComments } from './board_comp_detail_comments';
import type { ThemeConfig } from './board_comp_detail_utils';
import { preprocessContent, parseDirectDealInfo, cleanDirectDealContent, detectTheme, transformImageUrl, extractVideoUrlFromContent } from './board_comp_detail_utils';
import { KakaoIcon, NoImagePlaceholder, CodeBlock, renderLine, renderTableBlock } from './board_comp_detail_renderer';

interface BoardCompDetailProps {
  selectedPost: any;
  attachments: any[];
  comments: any[];
  newComment: string;
  setNewComment: (val: string) => void;
  loggedUser: any;
  isAdmin: boolean;
  onBackToList: () => void;
  onEditPost: (post?: any) => void;
  onDeletePost: (postId: number) => void;
  onAddComment: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: number) => void;
  onDeleteAttachment?: (attachmentId: number) => void;
  isComp?: boolean;
  onPlayVideo?: (videoUrl: string, title: string, desc: string) => void;
  onToggleLike?: (postId: number) => void;
  checkWritePermissionForCategory?: (catName: string) => boolean;
  onNavigateToPost?: (postId: number) => void;
}

export const BoardCompDetail: React.FC<BoardCompDetailProps> = ({
  selectedPost,
  attachments,
  comments,
  newComment,
  setNewComment,
  loggedUser,
  isAdmin,
  onBackToList,
  onEditPost,
  onDeletePost,
  onAddComment,
  onDeleteComment,
  onDeleteAttachment,
  isComp = false,
  onPlayVideo,
  onToggleLike = () => {},
  checkWritePermissionForCategory = () => true,
  onNavigateToPost
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBenefitOpen, setIsBenefitOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const obfuscated = (selectedPost.id * 31 + 12345).toString(36);
    const shareUrl = `${window.location.origin}/posts/${obfuscated}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3.5 md:gap-6">
      <div className="bg-white border border-stone-200/80 text-left flex flex-col p-3.5 md:p-8 rounded-2xl md:rounded-[24px] gap-3.5 md:gap-6 shadow-sm">
        
        {/* Thread Back and Delete Option if owner */}
        <div className="flex justify-between items-center border-b border-stone-150 pb-2.5 md:pb-4">
          <button
            type="button"
            onClick={onBackToList}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 font-bold bg-stone-50 border border-stone-200/80 rounded-full hover:bg-stone-100/50 transition-all cursor-pointer py-1.5 px-3.5 md:py-2 md:px-4"
          >
            <ArrowLeft size={13} />
            <span>목록으로 돌아가기</span>
          </button>
 
          {(isAdmin || (loggedUser && (
            (loggedUser.id == selectedPost.member_id || 
             (loggedUser.storeCode && loggedUser.storeCode === selectedPost.store_code) || 
             (loggedUser.store_code && loggedUser.store_code === selectedPost.store_code))
            && checkWritePermissionForCategory(selectedPost.category)
          ))) && (
            <div className="flex items-center border border-stone-200 bg-stone-50 rounded-full shadow-xs shrink-0 p-0.5 md:p-1">
              <button
                type="button"
                onClick={() => onEditPost(selectedPost)}
                className="p-1.5 px-3 text-stone-555 hover:text-stone-850 hover:bg-white rounded-full transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                title="질문 수정"
              >
                <Edit size={12.5} />
                <span>수정</span>
              </button>
              <div className="w-px h-4.5 bg-stone-205" />
              <button
                type="button"
                onClick={() => onDeletePost(selectedPost.id)}
                className="p-1.5 px-3 text-stone-450 hover:text-red-500 hover:bg-white rounded-full transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                title="질문 영구 삭제"
              >
                <Trash2 size={12.5} />
                <span>삭제</span>
              </button>
            </div>
          )}
        </div>

        {/* Post Typography Content header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedPost.is_secret === 1 && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 border border-amber-250 text-amber-800 py-0.5 px-2 rounded-full uppercase">
                <Lock size={10} /> 비밀글
              </span>
            )}
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${ selectedPost.category === '공지사항' ? 'bg-red-50 text-[#D32F2F] border-[#FFCDD2]' : selectedPost.category === '헤이스트소식' ? 'bg-blue-50 text-blue-800 border-blue-100' : selectedPost.category === '공동구매' ? 'bg-amber-55/15 text-[#B68428] border-amber-150' : selectedPost.category === 'H/W AS업체' ? 'bg-purple-50 text-purple-800 border-purple-100' : 'bg-stone-100 text-stone-700 border-stone-200' }`}>
              {selectedPost.category === '헤이스트소식' ? '소식' : (selectedPost.category === '운용가이드' || selectedPost.category === '노하우팁') ? '노하우팁' : (selectedPost.category || 'Q&A')}
            </span>
            <span className="text-[11px] font-bold bg-[#1E1C26]/95 text-[#C5A059] py-0.5 px-2 rounded-full font-mono">
              No {selectedPost.id}
            </span>
            <span className="text-xs text-stone-500 font-light font-mono flex items-center gap-1">
              <Calendar size={11} /> {new Date(selectedPost.created_at).toLocaleString()}
            </span>
          </div>

          {(() => {
            const videoUrl = extractVideoUrlFromContent(selectedPost.content);
            return (
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="haste-section-title-2 tracking-tight leading-snug flex items-center gap-1.5">
                  {(selectedPost.member_id >= 90000 || selectedPost.memberId >= 90000) && <KakaoIcon className="shrink-0" style={{ width: '18px', height: '18px' }} />}
                  <span>{selectedPost.title}</span>
                </h2>
                {videoUrl && onPlayVideo && (
                  <button
                    type="button"
                    onClick={() => onPlayVideo(videoUrl, selectedPost.title, selectedPost.content ? selectedPost.content.replace(/<[^>]*>/g, '').substring(0, 100) : '')}
                    className="p-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/30 text-[#C5A059] rounded-full transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                    title="시네마틱 동영상 플레이어 팝업 연동"
                  >
                    <PlayCircle size={18} className="fill-[#C5A059]/15" />
                  </button>
                )}
              </div>
            );
          })()}

          <div className="flex items-center gap-2 text-stone-550 border-t border-b border-stone-100 py-2.5 font-medium">
            {(selectedPost.member_id >= 90000 || selectedPost.memberId >= 90000) ? (
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <KakaoIcon className="w-full h-full" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center font-bold text-[#1E1C26] text-[10.5px]">
                {(!selectedPost.store_name || selectedPost.store_name.includes('헤이스트') || selectedPost.store_name === '헤이스트 마스터' || selectedPost.owner_name === '관리자' || selectedPost.role === 'ADMIN') ? '관' : selectedPost.store_name?.slice(0, 1) || '점'}
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs">
                {(!selectedPost.store_name || selectedPost.store_name.includes('헤이스트') || selectedPost.store_name === '헤이스트 마스터' || selectedPost.owner_name === '관리자' || selectedPost.role === 'ADMIN')
                  ? '관리자'
                  : selectedPost.store_name}
              </span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="text-xs text-stone-450 font-mono mr-1">조회수: {selectedPost.view_count || 1}</span>
            <span className="text-stone-300">|</span>
            <button
              type="button"
              onClick={() => {
                if (onToggleLike) onToggleLike(selectedPost.id);
              }}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all active:scale-95 cursor-pointer text-xs ${
                selectedPost.liked 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold' 
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-[#C5A059] hover:border-[#C5A059]/30'
              }`}
              title={selectedPost.liked ? '하트 취소' : '하트 추가'}
            >
              <span className="leading-none text-[11px]">
                {selectedPost.liked ? '❤️' : '🤍'}
              </span>
              <span className="leading-none select-none font-bold text-[10px] sm:text-[11px]">
                하트 {selectedPost.like_count || 0}
              </span>
            </button>
            <span className="text-stone-300">|</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all active:scale-95 cursor-pointer text-xs ${
                copiedLink 
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-700 font-bold' 
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-[#C5A059] hover:border-[#C5A059]/30'
              }`}
              title="글 링크 주소 복사"
            >
              {copiedLink ? (
                <>
                  <Check size={11} className="text-emerald-500" />
                  <span className="leading-none select-none font-bold text-[10px] sm:text-[11px]">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy size={11} className="text-stone-400" />
                  <span className="leading-none select-none font-bold text-[10px] sm:text-[11px]">링크 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body typography */}
        {(() => {
          const rawContent = selectedPost.content || '';
          const isDirectDeal = selectedPost.category === '직거래';
          const dealInfo = isDirectDeal ? parseDirectDealInfo(rawContent) : null;
          const cleanedContent = isDirectDeal ? cleanDirectDealContent(rawContent) : rawContent;
          const theme = detectTheme(selectedPost.category || 'Q&A', rawContent, selectedPost.skin_type || selectedPost.skinType);
          const content = preprocessContent(cleanedContent);
          const parts = content.split(/(\[가이드북 팝업 열기\]|\[혜택안내 팝업 열기\])/g);
          
          return (
            <div className={`transition-all duration-300 relative overflow-hidden flex flex-col gap-3 min-h-[450px] ${theme.customFrameClass || theme.bgClass}`}>
              {/* 스킨별 특색 있는 상단/측면 데코레이터 */}
              {theme.layoutType === 'report' && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C5A059]" />
              )}
              {theme.layoutType === 'blog' && (
                <div className="flex items-center gap-1.5 mb-2 border-b border-[#E8ECE5] pb-2 text-[11px] text-[#4A6B53] font-semibold tracking-wider font-mono">
                  <span>✦ HASTE BRAND DIARY</span>
                </div>
              )}
              {theme.layoutType === 'safety' && (
                <div className="flex items-center gap-2 p-2 px-3.5 bg-red-500/10 rounded-lg border border-red-200/50 mb-2.5 select-none">
                  <AlertCircle size={14} className="text-red-600 animate-pulse" />
                  <span className="text-[11px] font-black text-red-700 font-mono tracking-wider">CRITICAL SAFETY INSTRUCTION</span>
                </div>
              )}
              {theme.layoutType === 'news' && (
                <div className="flex flex-col border-b-2 border-stone-850 pb-2.5 mb-3.5 select-none">
                  <span className="text-[12px] font-black tracking-widest text-stone-900 uppercase font-mono">THE HASTE TIMES</span>
                  <div className="flex justify-between items-center text-[9px] text-stone-400 font-mono border-t border-stone-200 mt-1 pt-1.5">
                    <span>ISSUE NO. {selectedPost.id}</span>
                    <span>SEOUL, KOREA</span>
                  </div>
                </div>
              )}
              {theme.layoutType === 'technical' && (
                <div className="flex justify-between items-center bg-[#E5EBF2] border border-[#CBD7E2] rounded-t-xl px-4 py-2 -mx-4 md:-mx-8 -mt-5 md:-mt-8 mb-4.5 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black text-[#2F527E] font-mono">technical-guide-v2.sh</span>
                </div>
              )}

              {/* Theme Badge in Top Right */}
              <div className="absolute top-3 right-3 select-none">
                <span 
                  className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border bg-white"
                  style={{ color: theme.pointColor, borderColor: theme.pointColor + '30' }}
                >
                  <Sparkles size={10} style={{ color: theme.pointColor }} />
                  <span>스킨: {theme.name}</span>
                </span>
              </div>

              {/* 직거래 상세 정보 카드 */}
              {dealInfo && (
                <div className="bg-stone-50/90 border border-stone-300 rounded-2xl p-4 md:p-5 my-2 flex flex-col gap-3.5 shadow-3xs max-w-2xl font-sans">
                  <div className="flex items-center justify-between border-b border-stone-250 pb-2.5">
                    <span className="text-[10.5px] font-mono tracking-widest text-[#8C6D37] font-black">
                      DIRECT DEAL TRANSACTION INFO
                    </span>
                    <span className={`text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-lg border shadow-3xs tracking-wide ${
                      dealInfo.status === '완료' 
                        ? 'bg-stone-100 text-stone-500 border-stone-200 font-normal'
                        : dealInfo.status === '거래진행중'
                          ? 'bg-[#E5EBF2] text-[#2F527E] border-[#CBD7E2]'
                          : 'bg-[#C5A059]/10 text-[#8C6D37] border-[#C5A059]/30'
                    }`}>
                      {dealInfo.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-stone-750">
                    <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-stone-200 shadow-3xs">
                      <span className="text-[10.5px] text-stone-500 font-extrabold uppercase tracking-wider">기기 기종</span>
                      <strong className="text-stone-900 font-black text-[13px]">{dealInfo.model}</strong>
                    </div>
                    <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-stone-200 shadow-3xs">
                      <span className="text-[10.5px] text-stone-500 font-extrabold uppercase tracking-wider">최초 오픈</span>
                      <strong className="text-stone-900 font-black text-[13px]">{dealInfo.openYearMonth}</strong>
                    </div>
                    <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-stone-200 shadow-3xs">
                      <span className="text-[10.5px] text-stone-500 font-extrabold uppercase tracking-wider">렌탈 유무</span>
                      <strong className="text-stone-900 font-black text-[13px]">{dealInfo.rentalType}</strong>
                    </div>
                    <div className="flex flex-col gap-1.5 bg-[#C5A059]/10 p-3 rounded-xl border border-[#C5A059]/35 shadow-3xs">
                      <span className="text-[10.5px] text-[#8C6D37] font-black uppercase tracking-wider">판매 가격</span>
                      <strong className="text-[#8C6D37] font-black text-sm sm:text-[14px]">{dealInfo.price}</strong>
                    </div>
                  </div>
                </div>
              )}

              <pre 
                className="haste-body-text-1 py-2 flex flex-col gap-0.5 bg-transparent border-none"
                style={{ whiteSpace: 'pre-wrap', fontFamily: theme.fontFamily, fontSize: isComp ? `${parseFloat(theme.fontSize) - 1}px` : theme.fontSize, lineHeight: theme.lineHeight, color: '#333333' }}
              >
                {parts.map((part, index) => {
                  if (part === '[가이드북 팝업 열기]') {
                    return (
                      <div key={index} className="my-1.5">
                        <button
                          type="button"
                          onClick={() => setIsGuideOpen(true)}
                          className="inline-block mx-1 px-3 py-1 bg-stone-900 text-[#C5A059] text-[10.5px] font-bold rounded-lg hover:bg-stone-850 cursor-pointer active:scale-95 transition-all shadow-xs"
                        >
                          가이드북 팝업 열기 ➜
                        </button>
                      </div>
                    );
                  }
                  if (part === '[혜택안내 팝업 열기]') {
                    return (
                      <div key={index} className="my-1.5">
                        <button
                          type="button"
                          onClick={() => setIsBenefitOpen(true)}
                          className="inline-block mx-1 px-3 py-1 bg-stone-900 text-[#C5A059] text-[10.5px] font-bold rounded-lg hover:bg-stone-850 cursor-pointer active:scale-95 transition-all shadow-xs"
                        >
                          혜택안내 팝업 열기 ➜
                        </button>
                      </div>
                    );
                  }
                  
                  const blockParts = part.split(/```/g);
                  return blockParts.map((block, blockIdx) => {
                    if (blockIdx % 2 === 1) {
                      // Code block
                      const rawCode = block;
                      const firstNewlineIndex = rawCode.indexOf('\n');
                      let lang = '';
                      let codeContent = rawCode;
                      if (firstNewlineIndex !== -1) {
                        lang = rawCode.substring(0, firstNewlineIndex).trim();
                        codeContent = rawCode.substring(firstNewlineIndex + 1);
                      }
                      if (codeContent.endsWith('\n')) {
                        codeContent = codeContent.slice(0, -1);
                      }
                      return (
                        <CodeBlock 
                          key={`${index}-${blockIdx}`} 
                          code={codeContent} 
                          lang={lang} 
                        />
                      );
                    } else {
                      // Normal text, split into lines and parse markdown tables
                      const lines = block.split('\n');
                      const renderedBlocks: React.ReactNode[] = [];
                      let currentTableLines: string[] = [];
                      
                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const trimmed = line.trim();
                        const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1;
                        
                        if (isTableLine) {
                          currentTableLines.push(trimmed);
                        } else {
                          if (currentTableLines.length > 0) {
                            renderedBlocks.push(renderTableBlock(currentTableLines, `${index}-${blockIdx}-table-${i}`, theme, onNavigateToPost));
                            currentTableLines = [];
                          }
                          renderedBlocks.push(renderLine(line, `${index}-${blockIdx}-${i}`, theme, onNavigateToPost));
                        }
                      }
                      
                      if (currentTableLines.length > 0) {
                        renderedBlocks.push(renderTableBlock(currentTableLines, `${index}-${blockIdx}-table-end`, theme, onNavigateToPost));
                      }
                      
                      return (
                        <React.Fragment key={`${index}-${blockIdx}`}>
                          {renderedBlocks}
                        </React.Fragment>
                      );
                    }
                  });
                })}
              </pre>
            </div>
          );
        })()}

        {/* Attachments listing */}
        {attachments.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs text-stone-550 font-extrabold flex items-center gap-1">
              <Paperclip size={13} />
              <span>첨부파일 ({attachments.length})</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((att) => {
                const isImg = att.original_name ? att.original_name.match(/\.(png|jpg|jpeg|gif|webp)$/i) : null;
                const isAudio = att.original_name ? att.original_name.match(/\.(mp3|wav|ogg|m4a)$/i) : null;
                return (
                  <div key={att.id} className="border border-stone-150 rounded-xl p-3 bg-stone-50 flex flex-col gap-2.5 overflow-hidden shadow-2xs">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-2 truncate flex-1">
                        {isImg ? (
                          <ImageIcon size={14} className="text-[#8C6D37] shrink-0" />
                        ) : isAudio ? (
                          <PlayCircle size={14} className="text-[#C5A059] shrink-0" />
                        ) : (
                          <FileText size={14} className="text-stone-400 shrink-0" />
                        )}
                        <div className="truncated leading-tight flex-1 block">
                          <p className="text-xs font-bold text-stone-700 truncate">{att.original_name}</p>
                          <span className="text-[10px] text-stone-400 font-light font-mono">{(att.file_size / 1024).toFixed(1)} kb</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={att.file_path}
                          download={att.original_name}
                          referrerPolicy="no-referrer"
                          target="_blank"
                          className="p-1.5 bg-white border border-stone-200 hover:border-stone-400 rounded-lg hover:bg-stone-100/50 transition-all text-stone-600 active:scale-95"
                          title="다운로드"
                        >
                          <Download size={13} />
                        </a>
                        {isAdmin && onDeleteAttachment && (
                          <button
                            type="button"
                            onClick={() => onDeleteAttachment(att.id)}
                            className="p-1.5 bg-white border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                            title="첨부파일 즉시 삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    {isAudio && (
                      <div className="w-full mt-0.5 bg-white/70 p-1 rounded-xl border border-stone-200/50">
                        <audio
                          controls
                          className="w-full h-7 outline-none"
                          src={att.file_path}
                          controlsList="nodownload"
                        />
                      </div>
                    )}
                    {isImg && (
                      <div className="w-full mt-1.5 overflow-hidden rounded-xl border border-stone-200/60 bg-white/50 flex justify-center">
                        <img
                          src={transformImageUrl(att.file_path)}
                          alt={att.original_name || '첨부 이미지'}
                          className="max-w-full h-auto object-contain max-h-[300px]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <NoImagePlaceholder />
        )}
      </div>

      {/* COMMENTS / ANSWERS AREA */}
      <BoardDetailComments
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        loggedUser={loggedUser}
        isAdmin={isAdmin}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />
      <HasteGuidebookModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <HasteBenefitModal isOpen={isBenefitOpen} onClose={() => setIsBenefitOpen(false)} />
    </div>
  );
};
