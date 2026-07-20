import React from 'react';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { HeroDraft } from '../home_types';

interface AdminDraftsTableProps {
  currentDraftsToShow: HeroDraft[];
  selectedDraftIds: number[];
  setSelectedDraftIds: React.Dispatch<React.SetStateAction<number[]>>;
  draggedIdx: number | null;
  setDraggedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  heroDrafts: HeroDraft[];
  draftPage: number;
  ITEMS_PER_PAGE: number;
  onUpdateDrafts: (drafts: HeroDraft[]) => void;
  setPreviewDraft: (draft: HeroDraft) => void;
  handleOpenEditDraft: (draft: HeroDraft) => void;
  handleDeleteDraft: (id: number) => void;
}

export const AdminDraftsTable: React.FC<AdminDraftsTableProps> = ({
  currentDraftsToShow,
  selectedDraftIds,
  setSelectedDraftIds,
  draggedIdx,
  setDraggedIdx,
  heroDrafts,
  draftPage,
  ITEMS_PER_PAGE,
  onUpdateDrafts,
  setPreviewDraft,
  handleOpenEditDraft,
  handleDeleteDraft
}) => {
  return (
    <div className="overflow-x-auto max-h-[640px] overflow-y-auto pr-1 rounded-2xl scrollbar-thin">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-stone-950 text-stone-400 font-bold font-sans text-[12px] tracking-wider uppercase">
            <th className="py-3 px-3 text-center w-[120px] text-stone-400">
              <div className="flex items-center justify-center gap-1.5">
                <input 
                  type="checkbox"
                  checked={currentDraftsToShow.length > 0 && currentDraftsToShow.every(d => selectedDraftIds.includes(d.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const pageIds = currentDraftsToShow.map(d => d.id);
                      setSelectedDraftIds(prev => Array.from(new Set([...prev, ...pageIds])));
                    } else {
                      const pageIds = currentDraftsToShow.map(d => d.id);
                      setSelectedDraftIds(prev => prev.filter(id => !pageIds.includes(id)));
                    }
                  }}
                  className="w-3.5 h-3.5 rounded bg-stone-950 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                />
                <span>선택 | 순서</span>
              </div>
            </th>
            <th className="py-3 px-3 text-center w-[64px] font-bold">노출</th>
            <th className="py-3 px-3 text-center w-16 font-bold">첨부</th>
            <th className="py-3 px-3 font-bold">메인 Slogan</th>
            <th className="py-3 px-3 text-right pr-4 font-bold">조작 제어</th>
          </tr>
        </thead>
        <tbody>
          {currentDraftsToShow.map((draft, relativeIdx) => {
            const originalIdx = (draftPage - 1) * ITEMS_PER_PAGE + relativeIdx;
            return (
              <tr 
                key={draft.id} 
                className={`hover:bg-stone-850/50 transition-all duration-150 ${draggedIdx === originalIdx ? 'opacity-35 bg-stone-955 border-2 border-dashed border-[#C5A059]/30 scale-[0.995]' : ''}`}
                draggable
                onDragStart={(e) => {
                  setDraggedIdx(originalIdx);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => {
                  if (draggedIdx === null || draggedIdx === originalIdx) return;
                  const updated = [...heroDrafts];
                  const draggedItem = updated[draggedIdx];
                  updated.splice(draggedIdx, 1);
                  updated.splice(originalIdx, 0, draggedItem);
                  onUpdateDrafts(updated);
                  setDraggedIdx(originalIdx);
                }}
                onDragEnd={async () => {
                  setDraggedIdx(null);
                  const ids = heroDrafts.map(d => d.id);
                  localStorage.setItem('haste_hero_drafts', JSON.stringify(heroDrafts));
                  try {
                    await fetch('/api/hero-drafts/reorder', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ids })
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <td className="py-3.5 px-3 text-center font-mono font-bold text-stone-500 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <input 
                      type="checkbox"
                      checked={selectedDraftIds.includes(draft.id)}
                      onChange={() => {
                        setSelectedDraftIds(prev => 
                          prev.includes(draft.id) ? prev.filter(id => id !== draft.id) : [...prev, draft.id]
                        );
                      }}
                      className="w-3.5 h-3.5 rounded border-0 bg-stone-950 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                    />
                    <span>{originalIdx + 1}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing">
                    <GripVertical size={13} className="text-stone-300 hover:text-stone-400 transition-colors" />
                    <input 
                      type="checkbox"
                      checked={draft.visible !== false}
                      onChange={async (e) => {
                        const nextVisible = e.target.checked;
                        const updatedDrafts = heroDrafts.map(d => d.id === draft.id ? { ...d, visible: nextVisible } : d);
                        onUpdateDrafts(updatedDrafts);
                        localStorage.setItem('haste_hero_drafts', JSON.stringify(updatedDrafts));
                        try {
                          await fetch(`/api/hero-drafts/${draft.id}/toggle-visibility`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ visible: nextVisible })
                          });
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded border-0 bg-stone-955 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                    />
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="w-12 h-9 rounded overflow-hidden mx-auto bg-stone-950 flex-shrink-0">
                    <img src={draft.bgImage} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </td>
                <td className="py-3.5 px-3 min-w-[240px]">
                  <div className="font-bold text-stone-200 text-[13px] leading-tight">{draft.slogan}</div>
                  <div className="text-[11px] text-stone-450 truncate max-w-[280px] font-sans font-normal mt-0.5">{draft.subtext}</div>
                </td>
                <td className="py-3.5 px-3 text-right pr-4">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDraft(draft)}
                      className="p-1 px-2 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 rounded text-[11px] font-semibold bg-stone-900 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>미리보기</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditDraft(draft)}
                      className="admin-btn-action-edit"
                      title="수정"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="admin-btn-action-delete"
                      title="삭제"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
