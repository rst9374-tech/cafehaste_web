import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Send, FileCode, Search, ChevronLeft, ChevronRight, X, Upload } from 'lucide-react';

interface StoreVersionPost {
  id: number;
  title: string;
  content: string;
  file_url: string;
  author: string;
  created_at: string;
}

interface AdminStoreVersionTabProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
}

export const AdminStoreVersionTab: React.FC<AdminStoreVersionTabProps> = ({
  showTemporaryToast,
  showTemporaryError
}) => {
  const [versions, setVersions] = useState<StoreVersionPost[]>([]);
  const [searchKwd, setSearchKwd] = useState('');
  const [activeKwd, setActiveKwd] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'title' | 'content'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deployingId, setDeployingId] = useState<number | null>(null);

  // Detail & Write states
  const [selectedPost, setSelectedPost] = useState<StoreVersionPost | null>(null);
  const [isDeployOnly, setIsDeployOnly] = useState(false); // [HASTE 임시 제어 우회 수정 지점] - 지정배포 간소화 모드 구분 플래그
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeFileUrl, setWriteFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
 
  // [HASTE 임시 제어 우회 수정 지점] - 글로벌 예약 스케줄 토글 및 매장 연동 상태 변수
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [deployTargetPostId, setDeployTargetPostId] = useState<number | null>(null);
  const [specificStoreCode, setSpecificStoreCode] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
    // 예약 날짜 기본값으로 오늘, 시간으로 현재 시간 + 1시간 지정
    const now = new Date();
    const localDate = now.toISOString().split('T')[0];
    const hours = String(now.getHours() + 1).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setScheduledDate(localDate);
    setScheduledTime(`${hours}:${minutes}`);
  }, [currentPage, activeKwd]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/store-versions?page=${currentPage}&limit=10&keyword=${encodeURIComponent(activeKwd)}&searchType=${searchType}`);
      const data = await res.json();
      if (data.success) {
        setVersions(data.posts || []);
        setTotalPages(data.totalPages || 1);
        setTotalPosts(data.totalPosts || 0);
      } else {
        showTemporaryError(data.message || '버전 대장 조회를 실패했습니다.');
      }
    } catch (err: any) {
      console.error(err);
      showTemporaryError('버전 데이터를 가져오는 중 통신 에러가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data,
            filename: file.name,
            boardName: 'releases',
            categoryId: 'LILLY_EL'
          })
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          // Resolve full Supabase URL if returned path is relative `/uploads/...`
          const fileUrl = uploadData.url.startsWith('/') 
            ? `${window.location.origin}${uploadData.url}` 
            : uploadData.url;
          setWriteFileUrl(fileUrl);
          showTemporaryToast('릴리즈 파일이 성공적으로 스토리지에 업로드되었습니다.');
        } else {
          showTemporaryError(uploadData.message || '파일 업로드 실패');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      showTemporaryError('파일 업로드 중 에러가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeTitle || !writeFileUrl) {
      showTemporaryError('버전 명칭과 파일 다운로드 주소는 필수 입력 사항입니다.');
      return;
    }

    try {
      const res = await fetch('/api/store-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: writeTitle,
          content: writeContent,
          file_url: writeFileUrl,
          author: 'admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        showTemporaryToast('새 배포 버전이 게시판에 정상 등록되었습니다.');
        setIsWriteModalOpen(false);
        setWriteTitle('');
        setWriteContent('');
        setWriteFileUrl('');
        fetchVersions();
      } else {
        showTemporaryError(data.message || '버전 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      showTemporaryError('버전 정보 저장 중 통신 에러가 발생했습니다.');
    }
  };

  const handleDeleteVersion = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('이 배포 버전을 대장에서 영구 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/store-versions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showTemporaryToast('배포 버전 삭제 완료.');
        if (selectedPost?.id === id) setSelectedPost(null);
        fetchVersions();
      } else {
        showTemporaryError(data.message || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      showTemporaryError('버전 삭제 중 오류 발생.');
    }
  };

  // [HASTE 임시 제어 우회 수정 지점] - 즉시 전송 또는 예약 배포 일괄 처리 함수
  const triggerDeploy = async (postId: number, storeTarget: string) => {
    if (!postId) return;
    const target = versions.find(v => v.id === postId);
    if (!target) return;

    setDeployingId(postId);
    try {
      if (!isScheduleMode) {
        // (1) 즉시 배포 송출 (NOW)
        const res = await fetch('/api/store-versions/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId: postId, targetStore: storeTarget })
        });
        const data = await res.json();
        if (data.success) {
          const storeLabel = storeTarget === 'ALL' ? '전체매장' : storeTarget;
          setSuccessNotification(`✅ ${target.title} 버전 원격 즉시 배포 명령이 매장 [${storeLabel}]으로 성공적으로 송출되었습니다.`);
          setTimeout(() => setSuccessNotification(null), 5000);
        } else {
          showTemporaryError(data.message || '즉시 배포 송출에 실패했습니다.');
        }
      } else {
        // (2) 예약 배포 등록 (SCHEDULED)
        if (!scheduledDate || !scheduledTime) {
          showTemporaryError('예약 일시를 정확히 입력하십시오.');
          return;
        }
        const scheduledAtStr = `${scheduledDate} ${scheduledTime}:00`;
        const res = await fetch('/api/store-versions/deploy/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId: postId, targetStore: storeTarget, scheduledAt: scheduledAtStr })
        });
        const data = await res.json();
        if (data.success) {
          showTemporaryToast(`📅 ${target.title} 버전 예약 배포가 정상 등록되었습니다! (${scheduledAtStr})`);
        } else {
          showTemporaryError(data.message || '예약 배포 등록에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error(err);
      showTemporaryError('배포 처리 중 통신 에러가 발생했습니다.');
    } finally {
      setDeployingId(null);
    }
  };

  return (
    <div className="w-full bg-[#070609]/95 border border-stone-900 rounded-2xl p-2 sm:p-3 text-stone-300 shadow-xs">
      
      {/* [HASTE 임시 제어 우회 수정 지점] - 배포 성공 시 상단 초록색 알림 배너 노출 */}
      {successNotification && (
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-xl flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {successNotification}
          </div>
          <button 
            type="button"
            onClick={() => setSuccessNotification(null)} 
            className="text-emerald-500 hover:text-emerald-300 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tab Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pb-2 border-b border-stone-900 mb-3">

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* [HASTE 임시 제어 우회 수정 지점] - 글로벌 예약전송 스위치 */}
          <div className="flex items-center gap-2.5 bg-stone-900 p-2 rounded-xl border border-stone-800 shadow-3xs">
            <span className="text-[11px] font-bold text-stone-400">예약전송</span>
            <button
              type="button"
              onClick={() => setIsScheduleMode(!isScheduleMode)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isScheduleMode ? 'bg-[#C5A059]' : 'bg-stone-800'}`}
            >
              <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isScheduleMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className={`text-[10px] font-extrabold ${isScheduleMode ? 'text-[#C5A059]' : 'text-stone-500'}`}>
              {isScheduleMode ? 'ON' : 'OFF'}
            </span>

            {isScheduleMode && (
              <div className="flex items-center gap-1.5 ml-1 animate-fade-in">
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-[10px] font-bold text-stone-200 outline-none focus:border-[#C5A059]"
                />
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-[10px] font-bold text-stone-200 outline-none focus:border-[#C5A059]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                fetchVersions();
              }}
              className="p-2 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 hover:text-stone-200 transition-all text-stone-400 active:scale-95 cursor-pointer flex items-center justify-center shadow-3xs"
              title="새로고침"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="bg-[#C5A059] hover:bg-[#B38F48] text-stone-950 font-bold py-2 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 text-xs shadow-xs"
            >
              <Plus size={14} />
              <span>신규 버전 등록</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Split list and detail if detail is open, else full list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Versions List Table */}
        <div className={`col-span-1 ${selectedPost ? (isDeployOnly ? 'lg:col-span-9' : 'lg:col-span-6') : 'lg:col-span-12'} space-y-4`}>
          
          {/* Search bar */}
          <div className="flex items-center gap-1.5 max-w-sm bg-stone-950 border border-stone-800 rounded-xl p-0.5 px-2.5 shadow-3xs w-full">
            <Search className="text-stone-500 shrink-0" size={14} />
            <input
              type="text"
              value={searchKwd}
              onChange={(e) => setSearchKwd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveKwd(searchKwd);
                  setCurrentPage(1);
                }
              }}
              placeholder="버전명 검색..."
              className="flex-1 bg-transparent text-xs font-bold text-stone-200 outline-none placeholder-stone-500 py-1.5 min-w-0"
            />
            {searchKwd && (
              <button
                type="button"
                onClick={() => {
                  setSearchKwd('');
                  setActiveKwd('');
                  setCurrentPage(1);
                }}
                className="text-stone-400 hover:text-stone-300 text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-stone-900 cursor-pointer transition-colors"
              >
                초기화
              </button>
            )}
          </div>

          <div className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden shadow-2xs">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-stone-455 gap-2">
                <RefreshCw size={24} className="animate-spin text-[#C5A059]" />
                <span className="text-xs font-medium">버전 목록을 가져오는 중...</span>
              </div>
            ) : versions.length === 0 ? (
              <div className="py-20 text-center text-xs text-stone-455 font-medium">
                등록된 배포 버전이 존재하지 않습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse table-fixed">
                  <thead>
                    <tr className="bg-stone-900 border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">ID</th>
                      <th className="py-3 px-4 w-[240px]">배포 버전</th>
                      <th className="py-3 px-4 hidden sm:table-cell w-[150px]">파일 정보</th>
                      <th className="py-3 px-4 hidden md:table-cell w-[110px]">등록일</th>
                      <th className="py-3 px-4 text-center w-[180px]">원격 조작</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {versions.map((post) => (
                      <tr
                        key={post.id}
                        onClick={() => {
                          setSelectedPost(post);
                          setIsDeployOnly(false); // [HASTE 임시 제어 우회 수정 지점] - 상세보기 시 간소화 모드 해제
                        }}
                        className={`hover:bg-stone-850/50 cursor-pointer transition-colors ${selectedPost?.id === post.id ? 'bg-stone-850' : ''}`}
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-stone-500">{post.id}</td>
                        <td className="py-3.5 px-4 font-bold text-stone-200 truncate">
                          <span className="hover:underline block truncate" title={post.title}>{post.title}</span>
                          <span className="text-[10px] text-stone-500 font-normal block mt-0.5 truncate max-w-[220px]" title={post.content}>
                            {post.content || '등록된 패치노트 내용이 없습니다.'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 hidden sm:table-cell max-w-[150px] truncate font-mono text-[10px] text-stone-455">
                          {post.file_url.split('/').pop()}
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell text-stone-455">
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => triggerDeploy(post.id, 'ALL')}
                              disabled={deployingId !== null}
                              className="bg-[#C5A059] hover:bg-[#B8964C] text-stone-955 font-bold px-2 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-3xs disabled:opacity-50 whitespace-nowrap"
                            >
                              <Send size={10} />
                              <span>{deployingId === post.id ? '배포중' : '전체배포'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                setSelectedPost(post);
                                setIsDeployOnly(true); // [HASTE 임시 제어 우회 수정 지점] - 지정배포 간소화 모드 활성화
                                setDeployTargetPostId(post.id);
                                setSpecificStoreCode('');
                                setTimeout(() => {
                                  const inputEl = document.getElementById('store-code-input-field');
                                  inputEl?.focus();
                                  inputEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                              }}
                              className="bg-stone-950 hover:bg-stone-850 text-[#C5A059] border border-stone-800 font-bold px-2 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-3xs whitespace-nowrap"
                            >
                              <span>지정배포</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteVersion(post.id, e)}
                              className="p-1.5 bg-stone-950 hover:bg-stone-850 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer border border-stone-800"
                              title="삭제"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border border-stone-800 rounded-lg hover:bg-stone-850 bg-stone-950 text-stone-400 transition-all disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-stone-400">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 border border-stone-800 rounded-lg hover:bg-stone-850 bg-stone-955 text-stone-400 transition-all disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>

        {/* Selected Post Detail View */}
        {selectedPost && (
          <div className={`col-span-1 ${isDeployOnly ? 'lg:col-span-3' : 'lg:col-span-6'} bg-white border border-stone-200/80 rounded-xl p-5 shadow-2xs space-y-4 relative`}>
            <button
              type="button"
              onClick={() => {
                setSelectedPost(null);
                setIsDeployOnly(false); // [HASTE 임시 제어 우회 수정 지점] - 패널 닫을 때 상태 리셋
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block mb-1">
                {isDeployOnly ? '지정 매장 원격 배포' : 'RELEASE INFO'}
              </span>
              <h3 className="text-base font-bold text-stone-900">{selectedPost.title}</h3>
              {!isDeployOnly && (
                <div className="text-[10px] text-stone-400 font-semibold mt-1">
                  등록일: {new Date(selectedPost.created_at).toLocaleString('ko-KR')} | 작성: {selectedPost.author}
                </div>
              )}
            </div>

            {!isDeployOnly && (
              <div className="border-t border-b border-stone-100 py-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block mb-1">패치노트 상세 (Release Notes)</span>
                  <div 
                    className="text-xs text-stone-700 leading-relaxed bg-stone-50/50 p-3 rounded-lg border border-stone-100/50 whitespace-pre-wrap font-sans"
                    style={{ minHeight: '100px' }}
                  >
                    {selectedPost.content || '등록된 상세 패치 내용이 없습니다.'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 block mb-1">다운로드 파일 경로 (Asset URL)</span>
                  <div className="bg-stone-50 text-[10px] font-mono text-stone-500 p-2.5 rounded-lg border border-stone-200/40 select-all truncate">
                    {selectedPost.file_url}
                  </div>
                </div>
              </div>
            )}

            {/* [HASTE 임시 제어 우회 수정 지점] - 지정 매장 배포 폼 이식 (내매장 자동입력 지원) */}
            <div className={isDeployOnly ? "space-y-2.5" : "border-t border-stone-100 pt-4 space-y-2.5"}>
              <div className="flex items-center justify-between">
                {!isDeployOnly ? (
                  <span className="text-[10px] font-bold text-[#C5A059] block uppercase tracking-wider">지정 매장 원격 배포</span>
                ) : (
                  <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">지정 배포 대상</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSpecificStoreCode('HASTE-HQS-ADMIN');
                    showTemporaryToast('본사 테스트 매장코드(HASTE-HQS-ADMIN)가 입력되었습니다.');
                  }}
                  className="text-[9px] bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-600 px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer hover:border-[#C5A059] hover:text-[#C5A059] active:scale-95"
                >
                  내매장 입력
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="store-code-input-field"
                  placeholder="매장코드를 입력하세요 (예: HASTE-HQS-ADMIN)"
                  value={specificStoreCode}
                  onChange={(e) => setSpecificStoreCode(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!specificStoreCode.trim()) {
                      showTemporaryError('배포할 매장코드를 입력하세요.');
                      return;
                    }
                    triggerDeploy(selectedPost.id, specificStoreCode.trim());
                  }}
                  disabled={deployingId !== null}
                  className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] border border-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-[0.98] disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>{isScheduleMode ? '예약' : '전송'}</span>
                </button>
              </div>
            </div>

            {!isDeployOnly && (
              <div className="flex justify-end pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={(e) => handleDeleteVersion(selectedPost.id, e)}
                  className="border border-stone-300 text-stone-500 hover:text-red-600 hover:border-stone-400 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer hover:bg-stone-50"
                  title="대장에서 삭제"
                >
                  <Trash2 size={12} className="inline mr-1" />
                  <span>대장 삭제</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Write New Version Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 bg-stone-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900">신규 배포 버전 등록</h3>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveVersion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 tracking-wider uppercase block">버전 정보 (제목)</label>
                <input
                  type="text"
                  required
                  placeholder="예: v5.0.8"
                  value={writeTitle}
                  onChange={(e) => setWriteTitle(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 tracking-wider uppercase block">배포 패치노트 (설명)</label>
                <textarea
                  placeholder="패치 내용 및 수정을 기록하세요..."
                  value={writeContent}
                  onChange={(e) => setWriteContent(e.target.value)}
                  rows={4}
                  className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 tracking-wider uppercase block">다운로드 파일 경로 (직접 입력 또는 업로드)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://.../lilly.exe 또는 /uploads/..."
                    value={writeFileUrl}
                    onChange={(e) => setWriteFileUrl(e.target.value)}
                    className="flex-1 bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors font-mono"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="update-file-uploader"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="update-file-uploader"
                      className={`h-full px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl flex items-center justify-center border border-stone-200 transition-all cursor-pointer text-xs font-bold active:scale-95 shrink-0 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Upload size={14} className={isUploading ? 'animate-bounce' : ''} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="flex-1 border border-stone-300 text-stone-600 hover:text-stone-900 py-2.5 rounded-xl font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-[#C5A059] hover:bg-[#B38F46] text-stone-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  저장 및 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
};
