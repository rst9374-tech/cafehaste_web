import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, Edit, Eye, EyeOff, Film, AlertCircle, GripVertical, X
} from 'lucide-react';
import { AdminConfirmModal } from './admin_comp_shared';
import { adminFetch } from './admin_utils_api';

interface ProjectorCover {
  id: number;
  title: string;
  desc?: string;
  videoUrl: string;
  weather?: string;
  visible: boolean;
  orderIndex: number;
}

interface AdminMusicCoverTabProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
}

const WEATHER_PRESETS = ["맑음", "비", "눈", "나른", "집중", "로맨틱", "노을"];

export const AdminMusicCoverTab: React.FC<AdminMusicCoverTabProps> = ({
  showTemporaryToast,
  showTemporaryError,
  renderPagination
}) => {
  const [covers, setCovers] = useState<ProjectorCover[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formId, setFormId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formWeather, setFormWeather] = useState('');
  const [formVisible, setFormVisible] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchCovers = async () => {
    setIsLoading(true);
    const res = await adminFetch('/api/music/covers', { showTemporaryError });
    if (res.success && res.data) {
      setCovers(res.data.covers || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCovers();
  }, []);

  const handleReorder = async (newOrder: ProjectorCover[]) => {
    setCovers(newOrder);
    const reorderedIds = newOrder.map(c => c.id);
    const res = await adminFetch('/api/music/covers/reorder', {
      method: 'PUT',
      body: JSON.stringify({ reorderedIds }),
      showTemporaryToast,
      showTemporaryError,
      successMessage: '플레이커버 순서가 저장되었습니다.'
    });
    if (res.success) {
      window.dispatchEvent(new Event('haste_bgm_covers_updated'));
    }
  };

  const handleOpenCreateModal = () => {
    setFormMode('CREATE');
    setFormId(null);
    setFormTitle('');
    setFormDesc('');
    setFormVideoUrl('');
    setFormWeather('');
    setFormVisible(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cover: ProjectorCover) => {
    setFormMode('EDIT');
    setFormId(cover.id);
    setFormTitle(cover.title || '');
    setFormDesc(cover.desc || '');
    setFormVideoUrl(cover.videoUrl || '');
    setFormWeather(cover.weather || '');
    setFormVisible(!!cover.visible);
    setIsModalOpen(true);
  };

  const handleSaveCover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return showTemporaryError('커버 제목을 입력해주세요.');
    if (!formVideoUrl.trim()) return showTemporaryError('비디오 주소를 입력해주세요.');

    const payload = {
      title: formTitle,
      desc: formDesc,
      videoUrl: formVideoUrl,
      weather: formWeather,
      visible: formVisible
    };

    const url = formMode === 'CREATE' ? '/api/music/covers' : `/api/music/covers/${formId}`;
    const method = formMode === 'CREATE' ? 'POST' : 'PUT';

    const res = await adminFetch(url, {
      method,
      body: JSON.stringify(payload),
      showTemporaryToast,
      showTemporaryError,
      successMessage: formMode === 'CREATE' ? '새 플레이커버가 등록되었습니다.' : '플레이커버가 수정되었습니다.'
    });

    if (res.success) {
      setIsModalOpen(false);
      fetchCovers();
      window.dispatchEvent(new Event('haste_bgm_covers_updated'));
    }
  };

  const handleToggleVisibility = async (cover: ProjectorCover) => {
    const res = await adminFetch(`/api/music/covers/${cover.id}/toggle-visibility`, {
      method: 'PUT',
      body: JSON.stringify({ visible: !cover.visible }),
      showTemporaryToast,
      showTemporaryError,
      successMessage: `"${cover.title}" 가시성 상태가 변경되었습니다.`
    });
    if (res.success) {
      fetchCovers();
      window.dispatchEvent(new Event('haste_bgm_covers_updated'));
    }
  };

  const handleDeleteCover = async (id: number) => {
    setConfirmModal({
      message: '해당 플레이커버 배경 카드를 정말 삭제하시겠습니까?',
      onConfirm: async () => {
        const res = await adminFetch(`/api/music/covers/${id}`, {
          method: 'DELETE',
          showTemporaryToast,
          showTemporaryError,
          successMessage: '플레이커버가 삭제되었습니다.'
        });
        if (res.success) {
          fetchCovers();
          window.dispatchEvent(new Event('haste_bgm_covers_updated'));
        }
      }
    });
  };

  const totalPages = Math.ceil(covers.length / itemsPerPage);
  const currentCovers = covers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div id="admin-covers-board-wrapper" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent py-1 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 select-none cursor-pointer bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl">
            <input 
              type="checkbox"
              checked={currentCovers.length > 0 && currentCovers.every(f => selectedIds.includes(f.id))}
              onChange={(e) => {
                if (e.target.checked) {
                  const pageIds = currentCovers.map(f => f.id);
                  setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
                } else {
                  const pageIds = currentCovers.map(f => f.id);
                  setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                }
              }}
              className="w-3.5 h-3.5 accent-[#C5A059] rounded cursor-pointer"
            />
            <span>전체선택</span>
          </label>
          
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                setConfirmModal({
                  message: `선택한 ${selectedIds.length}개의 플레이커버를 일괄 삭제하시겠습니까?`,
                  onConfirm: async () => {
                    setIsLoading(true);
                    try {
                      await Promise.all(
                        selectedIds.map(id =>
                          fetch(`/api/music/covers/${id}`, { method: 'DELETE' })
                        )
                      );
                      showTemporaryToast('선택한 플레이커버가 일괄 삭제되었습니다.');
                      setSelectedIds([]);
                      fetchCovers();
                      window.dispatchEvent(new Event('haste_bgm_covers_updated'));
                    } catch (err: any) {
                      showTemporaryError('일괄 삭제 중 오류: ' + err.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                });
              }}
              className="admin-btn-action admin-btn-action-danger"
            >
              <Trash2 size={11} className="mr-1" />
              <span>선택 일괄 삭제 ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none bg-[#C5A059] hover:bg-[#B38F46] text-stone-950 font-black py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus size={13} className="stroke-[3]" />
            <span>플레이커버 추가</span>
          </button>
        </div>
      </div>

      {covers.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-500 gap-3">
          <AlertCircle size={32} className="text-stone-400" />
          <p className="text-xs tracking-wider">등록된 플레이커버 배경 비디오가 없습니다. ‘플레이커버 추가’ 버튼을 눌러 등록해주세요.</p>
        </div>
      ) : (
        <Reorder.Group 
          values={covers} 
          onReorder={handleReorder} 
          axis="y" 
          className="flex flex-col gap-3 select-none"
        >
          {covers.map((cover) => (
            <Reorder.Item
              value={cover}
              key={cover.id}
              id={String(cover.id)}
              className={`group border rounded-2xl overflow-hidden transition-all duration-300 bg-white flex flex-col sm:flex-row items-stretch sm:items-center p-3.5 gap-4 cursor-grab active:cursor-grabbing ${
                cover.visible 
                  ? 'border-stone-200 hover:border-stone-300 hover:shadow-md' 
                  : 'border-dashed border-stone-250 opacity-60 bg-stone-50/30'
              }`}
            >
              <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <div className="text-stone-400 group-hover:text-stone-600 transition-colors cursor-row-resize py-2 px-1">
                  <GripVertical size={16} />
                </div>
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(cover.id)}
                  onChange={() => {
                    setSelectedIds(prev => 
                      prev.includes(cover.id) ? prev.filter(id => id !== cover.id) : [...prev, cover.id]
                    );
                  }}
                  className="w-3.5 h-3.5 accent-[#C5A059] rounded cursor-pointer"
                />
              </div>

              <div className="w-12 h-12 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center text-[#C5A059] shrink-0">
                <Film size={18} />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#C5A059] text-[9px] font-mono font-bold bg-[#C5A059]/10 px-1.5 py-0.5 rounded">
                    SCREEN
                  </span>
                  <h3 className="text-stone-900 font-bold text-sm tracking-tight truncate max-w-xs sm:max-w-md">
                    {cover.title}
                  </h3>
                </div>
                <p className="text-stone-650 font-sans font-light text-[11px] leading-relaxed line-clamp-1">
                  {cover.desc}
                </p>
                <div className="font-mono text-[9px] text-stone-400 truncate max-w-xs sm:max-w-md select-all">
                  {cover.videoUrl}
                </div>
              </div>

              <div 
                className="flex flex-wrap sm:flex-nowrap items-center gap-3 justify-between sm:justify-end flex-shrink-0" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm ${
                    cover.visible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                    {cover.visible ? '노출중' : '숨김'}
                  </span>
                  {cover.weather && (
                    <span className="text-[#C5A059] text-[9px] font-mono bg-[#C5A059]/10 border border-[#C5A059]/20 px-1.5 py-0.5 rounded">
                      #{cover.weather}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleVisibility(cover)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      cover.visible 
                        ? 'border-emerald-100 text-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/50' 
                        : 'border-stone-200 text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {cover.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(cover)}
                    className="p-2 border border-stone-200 text-stone-500 hover:text-[#C5A059] hover:border-[#C5A059]/40 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteCover(cover.id)}
                    className="p-2 border border-stone-200 hover:border-rose-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {totalPages > 1 && (
        <div className="pt-4">
          {renderPagination(currentPage, totalPages, setCurrentPage)}
        </div>
      )}

      {/* Standardized Modal Form for Cover */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="admin-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="admin-modal-content"
            >
              <div className="border-b border-stone-150 pb-4 flex justify-between items-center bg-transparent">
                <span className="text-sm font-black text-stone-850 tracking-wider">
                  {formMode === 'CREATE' ? '새 플레이커버(배경) 등록' : '플레이커버 배경 편집'}
                </span>
                <button onClick={() => setIsModalOpen(false)} className="p-1 px-2 text-stone-400 hover:text-stone-700 bg-stone-100 border border-stone-200 rounded-xl cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveCover} className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold block">배경 제목 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="비 내리는 유리창"
                    className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold block">비디오 주소 (Video URL) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://assets.mixkit.co/videos/preview/..."
                    className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-450 focus:outline-none transition-colors font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold block">상황/날씨 태그</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {WEATHER_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormWeather(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          formWeather === preset
                            ? 'bg-stone-900 border-stone-900 text-white'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formWeather}
                    onChange={(e) => setFormWeather(e.target.value)}
                    placeholder="직접 입력하거나 위의 날씨를 선택하세요"
                    className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold block">배경 설명</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="아늑하고 서정적인 4K 루프 비디오입니다."
                    rows={2}
                    className="w-full bg-stone-50/50 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] focus:bg-white rounded-xl px-4 py-2.5 text-stone-900 text-xs placeholder-stone-400 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 select-none">
                  <input
                    id="cover-visible-checkbox"
                    type="checkbox"
                    checked={formVisible}
                    onChange={(e) => setFormVisible(e.target.checked)}
                    className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                  />
                  <label htmlFor="cover-visible-checkbox" className="text-stone-700 text-xs font-medium cursor-pointer">
                    플레이어 배경화면에 노출 상태 유지
                  </label>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 border border-stone-300 text-stone-600 hover:text-stone-900 py-2.5 rounded-xl font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    작업 취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#C5A059] hover:bg-[#B38F46] text-stone-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                  >
                    커버 저장
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
