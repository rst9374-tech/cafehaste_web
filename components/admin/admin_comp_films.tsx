import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, RotateCcw, AlertCircle, GripVertical, Edit, Eye, EyeOff, Play, ChevronUp, ChevronDown
} from 'lucide-react';
import { AdminSystemHub } from './admin_comp_systemhub';
import { 
  FilmItem, 
  AdminFilmsPlayer,
  getYoutubeId
} from './admin_comp_films_player';
import { AdminConfirmModal } from './admin_comp_shared';
import { AdminFilmsFormModal } from './admin_comp_films_form_modal';
import { AdminFilmsItem } from './admin_comp_films_item';

interface AdminFilmsTabProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  filmRandomShow?: boolean;
  setFilmRandomShow?: (v: boolean) => void;
}

export const AdminFilmsTab: React.FC<AdminFilmsTabProps> = ({
  showTemporaryToast,
  showTemporaryError,
  renderPagination,
  filmRandomShow = false,
  setFilmRandomShow = () => {}
}) => {
  const [films, setFilms] = useState<FilmItem[]>([]);
  const filmsRef = React.useRef(films);
  const [isLoading, setIsLoading] = useState(false);
  const [activePlayFilm, setActivePlayFilm] = useState<FilmItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Sync filmsRef with films state to bypass closure capturing in drag event handlers
  useEffect(() => {
    filmsRef.current = films;
  }, [films]);

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formId, setFormId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVisible, setFormVisible] = useState(true);
  const [formCategory, setFormCategory] = useState<string[]>(['THEATER']);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 200;

  const fetchFilms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/films?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFilms(data.films || []);
        } else {
          showTemporaryError(data.error || '필름 목록 로드 오류');
        }
      }
    } catch (err: any) {
      showTemporaryError('서버 연결 실패: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const handleReorderSave = async (newOrder: FilmItem[]) => {
    try {
      const reorderedIds = newOrder.map(f => f.id);
      const res = await fetch(`/api/films/reorder?t=${Date.now()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderedIds })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast('순서가 변경되어 저장되었습니다.');
          window.dispatchEvent(new Event('haste_films_updated'));
        } else {
          alert('순서 저장 실패 (서버 응답 오류): ' + (data.error || JSON.stringify(data)));
          showTemporaryError(data.error || '순서 변경 저장 실패');
        }
      } else {
        const errText = await res.text();
        alert('순서 저장 실패 (HTTP ' + res.status + '): ' + errText);
        showTemporaryError('순서 저장 실패 (HTTP ' + res.status + ')');
      }
    } catch (err: any) {
      alert('순서 저장 중 스크립트 오류: ' + err.message);
      showTemporaryError('순서 저장 중 오류: ' + err.message);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...films];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setFilms(updated);
    handleReorderSave(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === films.length - 1) return;
    const updated = [...films];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setFilms(updated);
    handleReorderSave(updated);
  };

  const handleOpenCreateModal = () => {
    setFormMode('CREATE');
    setFormId(null);
    setFormTitle('');
    setFormDesc('');
    setFormVideoUrl('');
    setFormVisible(true);
    setFormCategory(['THEATER']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (film: FilmItem) => {
    setFormMode('EDIT');
    setFormId(film.id);
    setFormTitle(film.title);
    setFormDesc(film.desc);
    setFormVideoUrl(film.videoUrl);
    setFormVisible(film.visible);
    let cats = film.category ? film.category.split(',') : ['THEATER'];
    cats = cats.map(c => c === 'BRAND' ? 'BRAND1' : c);
    cats = Array.from(new Set(cats));
    setFormCategory(cats);
    setIsModalOpen(true);
  };

  const handleCategoryChange = (cat: string, checked: boolean) => {
    if (checked) {
      setFormCategory(prev => Array.from(new Set([...prev, cat])));
    } else {
      setFormCategory(prev => prev.filter(c => c !== cat));
    }
  };

  const handleSaveFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showTemporaryError('제목을 입력해주세요.');
      return;
    }
    if (!formDesc.trim()) {
      showTemporaryError('내용을 입력해주세요.');
      return;
    }
    if (!formVideoUrl.trim()) {
      showTemporaryError('동영상 링크를 입력해주세요.');
      return;
    }

    const payload = {
      title: formTitle,
      desc: formDesc,
      videoUrl: formVideoUrl,
      visible: formVisible,
      category: formCategory.join(',')
    };

    try {
      const url = formMode === 'CREATE' ? '/api/films' : `/api/films/${formId}`;
      const method = formMode === 'CREATE' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast(formMode === 'CREATE' ? '새 동영상 필름이 성공적으로 추가되었습니다.' : '동영상 필름 정보가 수정되었습니다.');
          setIsModalOpen(false);
          fetchFilms();
          window.dispatchEvent(new Event('haste_films_updated'));
        } else {
          showTemporaryError(data.message || '필름 저장 오류');
        }
      }
    } catch (err: any) {
      showTemporaryError('저장 실패: ' + err.message);
    }
  };

  const handleToggleVisibility = async (film: FilmItem) => {
    try {
      const res = await fetch(`/api/films/${film.id}/toggle-visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !film.visible })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast(`"${film.title}" 노출 상태가 변경되었습니다.`);
          fetchFilms();
          window.dispatchEvent(new Event('haste_films_updated'));
        } else {
          showTemporaryError(data.message || '업데이트 실패');
        }
      }
    } catch (err: any) {
      showTemporaryError('전송 오류: ' + err.message);
    }
  };

  const handleDeleteFilm = async (id: number) => {
    setConfirmModal({
      message: '선택하신 동영상 필름 카드를 정말 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/films/${id}`, { method: 'DELETE' });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              showTemporaryToast('영화관 필름이 정상적으로 삭제되었습니다.');
              fetchFilms();
              window.dispatchEvent(new Event('haste_films_updated'));
            } else {
              showTemporaryError(data.message || '삭제 오류');
            }
          }
        } catch (err: any) {
          showTemporaryError('삭제 실패: ' + err.message);
        }
      }
    });
  };

  // Pagination helper
  const totalPages = Math.ceil(films.length / itemsPerPage);
  const currentFilms = films.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div id="admin-films-board-wrapper" className="space-y-4">
      {/* Top action header - cleaned and simplified */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent py-1 border-b border-stone-900 pb-3">
        {/* Left: bulk select and delete selected */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-300 select-none cursor-pointer bg-stone-900 border border-stone-900 px-3 py-1.5 rounded-xl">
            <input 
              type="checkbox"
              checked={currentFilms.length > 0 && currentFilms.every(f => selectedIds.includes(f.id))}
              onChange={(e) => {
                if (e.target.checked) {
                  const pageIds = currentFilms.map(f => f.id);
                  setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
                } else {
                  const pageIds = currentFilms.map(f => f.id);
                  setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                }
              }}
              className="w-3.5 h-3.5 accent-[#C5A059] rounded cursor-pointer"
            />
            <span>전체선택</span>
          </label>
          
          {selectedIds.length > 0 && (
            <button
              onClick={async () => {
                const targetIds = selectedIds;
                setConfirmModal({
                  message: `선택하신 ${targetIds.length}개의 필름 게시글을 완전히 영구 삭제하시겠습니까?`,
                  onConfirm: async () => {
                    setIsLoading(true);
                    try {
                      await Promise.all(
                        targetIds.map(id =>
                          fetch(`/api/films/${id}`, { method: 'DELETE' })
                        )
                      );
                      showTemporaryToast('선택한 필름 게시글이 성공적으로 영구 삭제 완료되었습니다.');
                      const remain = films.filter(f => !targetIds.includes(f.id));
                      setFilms(remain);
                      setSelectedIds([]);
                      window.dispatchEvent(new Event('haste_films_updated'));
                    } catch (err: any) {
                      showTemporaryError('일괄 삭제 중 오류가 발생했습니다: ' + err.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                });
              }}
              className="bg-rose-955/40 hover:bg-rose-900 border border-rose-900/60 text-rose-350 font-extrabold py-1.5 px-3 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Trash2 size={11} />
              <span>선택 일괄 삭제 ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
          {/* 필름 랜덤 노출 토글 스위치 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 rounded-xl shadow-sm text-[10px] sm:text-xs font-semibold text-stone-300 select-none mr-1">
            <span>필름 랜덤 노출</span>
            <button
              type="button"
              onClick={async () => {
                const nextVal = !filmRandomShow;
                try {
                  const res = await fetch('/api/films/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filmRandomShow: nextVal })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                      setFilmRandomShow(nextVal);
                      showTemporaryToast(nextVal ? '시네마 필름이 이제 랜덤으로 정렬되어 노출됩니다!' : '시네마 필름이 지정된 고정 순서대로 노출됩니다.');
                    }
                  }
                } catch (err: any) {
                  showTemporaryError('설정 저장 중 오류: ' + err.message);
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${filmRandomShow ? 'bg-white' : 'bg-[#3F3F46]'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${filmRandomShow ? 'translate-x-5' : 'translate-x-0'}`}
                style={{ backgroundColor: filmRandomShow ? '#18181b' : '#ffffff' }}
              />
            </button>
          </div>

          {/* [HASTE 임시 제어 우회 수정 지점] 필름 게시판 내 시스템 허브 렌더링 제거
          <AdminSystemHub 
            showTemporaryToast={showTemporaryToast}
            showTemporaryError={showTemporaryError}
            activeAdminTab="FILMS"
          />
          */}
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none bg-[#C5A059] hover:bg-[#B38F46] text-stone-950 font-black py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus size={13} className="stroke-[3]" />
            <span>필름 추가</span>
          </button>
        </div>
      </div>

      {films.length === 0 ? (
        <div className="text-center py-16 bg-stone-950 border border-dashed border-stone-900 rounded-2xl flex flex-col items-center justify-center text-stone-400 gap-3">
          <AlertCircle size={32} className="text-stone-500" />
          <p className="text-xs tracking-wider">등록된 시네마틱 동영상 카드가 아직 없습니다. ‘필름 추가’ 버튼을 눌러 등록해주세요.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 select-none">
          {films.map((film, filmIndex) => {
            const youtubeId = getYoutubeId(film.videoUrl);
            const displayPreviewUrl = youtubeId 
              ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
              : 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=400';

            return (
              <div
                key={film.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIdx(filmIndex);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => {
                  if (draggedIdx === null || draggedIdx === filmIndex) return;
                  const updated = [...films];
                  const draggedItem = updated[draggedIdx];
                  updated.splice(draggedIdx, 1);
                  updated.splice(filmIndex, 0, draggedItem);
                  setFilms(updated);
                  setDraggedIdx(filmIndex);
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  handleReorderSave(filmsRef.current);
                }}
                className={`group border rounded-2xl overflow-hidden transition-all duration-300 bg-stone-950 flex flex-col sm:flex-row items-stretch sm:items-center p-3.5 gap-4 cursor-grab active:cursor-grabbing ${
                  draggedIdx === filmIndex ? 'opacity-35 bg-stone-900 border-2 border-dashed border-[#C5A059]/30 scale-[0.995]' : ''
                } ${
                  film.visible 
                    ? 'border-stone-900 hover:border-stone-850 hover:shadow-md' 
                    : 'border-dashed border-stone-900 opacity-60 bg-stone-950/20'
                }`}
              >
                {/* Left drag handle and selection checkbox */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-stone-400 group-hover:text-stone-600 transition-colors cursor-row-resize py-2 px-1">
                    <GripVertical size={16} />
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(film.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                      setSelectedIds(prev => 
                        prev.includes(film.id) ? prev.filter(id => id !== film.id) : [...prev, film.id]
                      );
                    }}
                    className="w-3.5 h-3.5 accent-[#C5A059] rounded cursor-pointer"
                  />
                </div>

                {/* Thumbnail Preview Area */}
                <div 
                  className="relative w-full sm:w-40 aspect-video bg-stone-900 rounded-xl overflow-hidden cursor-pointer flex-shrink-0" 
                  onClick={() => setActivePlayFilm(film)}
                >
                  <img
                    src={displayPreviewUrl}
                    alt={film.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <div className="p-2.5 rounded-full bg-stone-900/90 text-[#C5A059] border border-[#C5A059]/20 transform group-hover:scale-110 shadow-xl transition-all">
                      <Play size={12} className="fill-[#C5A059] ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Title & Description & URL */}
                 <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-stone-400 text-[11px] font-sans font-normal bg-stone-900 px-1.5 py-0.5 rounded">
                      No.{filmIndex + 1}
                    </span>
                    <h3 className="text-stone-200 font-bold text-[13px] tracking-tight truncate max-w-xs sm:max-w-md">
                      {film.title}
                    </h3>
                  </div>
                  <p className="text-stone-450 font-sans font-normal text-[11px] leading-relaxed line-clamp-1">
                    {film.desc || '설명이 등록되어 있지 않습니다.'}
                  </p>
                  <div className="font-mono text-[9px] text-stone-400 truncate max-w-xs sm:max-w-md select-all">
                    {film.videoUrl}
                  </div>
                </div>

                {/* Right side: Status and Control buttons */}
                <div 
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3 justify-between sm:justify-end flex-shrink-0" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm ${
                      film.visible ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-rose-955/20 text-rose-400 border border-rose-900/30'
                    }`}>
                      {film.visible ? '노출중' : '숨김'}
                    </span>
                    {(film.category || 'THEATER').split(',').map((cat) => {
                      let label = '홍보관';
                      let badgeClass = 'bg-stone-900 text-stone-450 border border-stone-850';
                      if (cat === 'BRAND1') {
                        label = '브랜드1';
                        badgeClass = 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20';
                      } else if (cat === 'BRAND2') {
                        label = '브랜드2';
                        badgeClass = 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20';
                      } else if (cat === 'BRAND') {
                        const cats = (film.category || 'THEATER').split(',');
                        if (cats.includes('BRAND1') || cats.includes('BRAND2')) {
                          return null;
                        }
                        label = '브랜드';
                        badgeClass = 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20';
                      }
                      return (
                        <span key={cat} className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm ${badgeClass}`}>
                          {label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Operation Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMoveUp(filmIndex)}
                      disabled={filmIndex === 0}
                      className={`p-2 border border-stone-900 rounded-xl transition-colors ${
                        filmIndex === 0 
                          ? 'text-stone-600 bg-stone-900/20 cursor-not-allowed' 
                          : 'text-stone-400 hover:text-[#C5A059] hover:border-[#C5A059]/40 hover:bg-stone-900 cursor-pointer'
                      }`}
                      title="위로 이동"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(filmIndex)}
                      disabled={filmIndex === films.length - 1}
                      className={`p-2 border border-stone-900 rounded-xl transition-colors ${
                        filmIndex === films.length - 1 
                          ? 'text-stone-600 bg-stone-900/20 cursor-not-allowed' 
                          : 'text-stone-400 hover:text-[#C5A059] hover:border-[#C5A059]/40 hover:bg-stone-900 cursor-pointer'
                      }`}
                      title="아래로 이동"
                    >
                      <ChevronDown size={13} />
                    </button>
                     <button
                       onClick={() => handleToggleVisibility(film)}
                       className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                         film.visible 
                           ? 'border-emerald-950/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40' 
                           : 'border-stone-900 text-stone-500 hover:text-stone-450 hover:bg-stone-900/40'
                       }`}
                      title={film.visible ? "숨기기 (노출 토글)" : "노출시키기 (노출 토글)"}
                    >
                      {film.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(film)}
                      className="p-2 border border-stone-900 text-stone-500 hover:text-[#C5A059] hover:border-[#C5A059]/40 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                      title="수정하기"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteFilm(film.id)}
                      className="p-2 border border-stone-900 hover:border-rose-900 hover:bg-rose-950/20 text-stone-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                      title="기록 소거"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination wrapper if multiple grids exist */}
      {totalPages > 1 && (
        <div className="pt-4">
          {renderPagination(currentPage, totalPages, setCurrentPage)}
        </div>
      )}

      {/* Elegant write / edit modal card */}
      <AdminFilmsFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formMode={formMode}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formDesc={formDesc}
        setFormDesc={setFormDesc}
        formVideoUrl={formVideoUrl}
        setFormVideoUrl={setFormVideoUrl}
        formVisible={formVisible}
        setFormVisible={setFormVisible}
        formCategory={formCategory}
        handleCategoryChange={handleCategoryChange}
        handleSaveFilm={handleSaveFilm}
      />

      {/* Elegant Pop-up Video Player Overlay (필림누르면 그동양상이 재생되게 해줘) */}
      <AdminFilmsPlayer activePlayFilm={activePlayFilm} setActivePlayFilm={setActivePlayFilm} />

      {confirmModal && (
        <AdminConfirmModal
          message={confirmModal.message}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
        />
      )}
    </div>
  );
};
