import React from 'react';
import { Play, Trash2, Edit, Eye, EyeOff, GripVertical } from 'lucide-react';
import { FilmItem, getYoutubeId } from './admin_comp_films_player';

interface AdminFilmsItemProps {
  film: FilmItem;
  index: number;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  setActivePlayFilm: React.Dispatch<React.SetStateAction<FilmItem | null>>;
  handleToggleVisibility: (film: FilmItem) => void;
  handleOpenEditModal: (film: FilmItem) => void;
  handleDeleteFilm: (id: number) => void;
  draggedIdx: number | null;
  setDraggedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  films: FilmItem[];
  setFilms: React.Dispatch<React.SetStateAction<FilmItem[]>>;
  handleReorderSave: (newOrder: FilmItem[]) => void;
}

export const AdminFilmsItem: React.FC<AdminFilmsItemProps> = ({
  film,
  index,
  selectedIds,
  setSelectedIds,
  setActivePlayFilm,
  handleToggleVisibility,
  handleOpenEditModal,
  handleDeleteFilm,
  draggedIdx,
  setDraggedIdx,
  films,
  setFilms,
  handleReorderSave
}) => {
  const youtubeId = getYoutubeId(film.videoUrl);
  const displayPreviewUrl = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=400';

  return (
    <div
      draggable
      onDragStart={(e) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => {
        if (draggedIdx === null || draggedIdx === index) return;
        const updated = [...films];
        const draggedItem = updated[draggedIdx];
        updated.splice(draggedIdx, 1);
        updated.splice(index, 0, draggedItem);
        setFilms(updated);
        setDraggedIdx(index);
      }}
      onDragEnd={() => {
        setDraggedIdx(null);
        handleReorderSave(films);
      }}
      className={`group border rounded-2xl overflow-hidden transition-all duration-300 bg-white flex flex-col sm:flex-row items-stretch sm:items-center p-3.5 gap-4 cursor-grab active:cursor-grabbing ${
        draggedIdx === index ? 'opacity-35 bg-stone-100 border-2 border-dashed border-[#C5A059]/30 scale-[0.995]' : ''
      } ${
        film.visible 
          ? 'border-stone-200 hover:border-stone-300 hover:shadow-md' 
          : 'border-dashed border-stone-250 opacity-60 bg-stone-50/30'
      }`}
    >
      {/* Left drag handle and selection checkbox */}
      <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="text-stone-400 group-hover:text-stone-600 transition-colors cursor-row-resize py-2 px-1">
          <GripVertical size={16} />
        </div>
        <input 
          type="checkbox"
          checked={selectedIds.includes(film.id)}
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
          <span className="text-stone-400 text-[10px] font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded">
            No.{index + 1}
          </span>
          <h3 className="text-stone-900 font-bold text-sm tracking-tight truncate max-w-xs sm:max-w-md">
            {film.title}
          </h3>
        </div>
        <p className="text-stone-655 font-sans font-light text-[11px] leading-relaxed line-clamp-1">
          {film.desc}
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
            film.visible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {film.visible ? '노출중' : '숨김'}
          </span>
          {(film.category || 'THEATER').split(',').map((cat) => {
            let label = '홍보관';
            let badgeClass = 'bg-stone-100 text-stone-700 border border-stone-200';
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
            onClick={() => handleToggleVisibility(film)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              film.visible 
                ? 'border-emerald-100 text-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/50' 
                : 'border-stone-200 text-stone-400 hover:text-stone-600 hover:bg-stone-50'
            }`}
            title={film.visible ? "숨기기 (노출 토글)" : "노출시키기 (노출 토글)"}
          >
            {film.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            onClick={() => handleOpenEditModal(film)}
            className="admin-btn-action-edit"
            title="수정하기"
          >
            <Edit size={13} />
          </button>
          <button
            onClick={() => handleDeleteFilm(film.id)}
            className="admin-btn-action-delete"
            title="기록 소거"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
