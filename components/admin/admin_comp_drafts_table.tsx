import React from 'react';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { HeroDraft } from '../../types';

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
    <div className="overflow-x-auto max-h-[640px] overflow-y-auto pr-1 border border-stone-150/45 rounded-2xl scrollbar-thin scrollbar-thumb-stone-200">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold font-sans text-[10px] tracking-wider uppercase">
            <th className="py-3 px-3 text-center w-[120px] text-stone-500">
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
                  className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                />
                <span>선택 | 순서</span>
              </div>
            </th>
            <th className="py-3 px-3 text-center w-[64px] font-bold">노출</th>
            <th className="py-3 px-3 text-center w-16 font-bold">첨부</th>
            <th className="py-3 px-3 font-bold">분류 태그</th>
            <th className="py-3 px-3 font-bold">메인 Slogan</th>
            <th className="py-3 px-3 text-right pr-4 font-bold">조작 제어</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-150">
          {currentDraftsToShow.map((draft, relativeIdx) => {
            const originalIdx = (draftPage - 1) * ITEMS_PER_PAGE + relativeIdx;
            return (
              <tr 
                key={draft.id} 
                className={`hover:bg-stone-50/50 transition-all duration-150 ${draggedIdx === originalIdx ? 'opacity-35 bg-stone-100 border-2 border-dashed border-[#C5A059]/30 scale-[0.995]' : ''}`}
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
                      className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
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
                      className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                    />
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="w-12 h-9 rounded overflow-hidden border border-stone-200 mx-auto bg-stone-100 flex-shrink-0">
                    <img src={draft.bgImage} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className="text-[9px] font-mono tracking-widest text-[#C5A059] font-bold bg-[#C5A059]/10 px-2 py-0.5 rounded leading-none">
                    {draft.tag}
                  </span>
                </td>
                <td className="py-3.5 px-3 min-w-[240px]">
                  <div className="font-bold text-stone-900 leading-tight">{draft.slogan}</div>
                  <div className="text-[10px] text-stone-400 truncate max-w-[280px] font-mono font-light mt-0.5">{draft.subtext}</div>
                </td>
                <td className="py-3.5 px-3 text-right pr-4">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setPreviewDraft(draft)}
                      className="p-1 px-2 border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-300 rounded text-[10px] font-semibold bg-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>미리보기</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditDraft(draft)}
                      className="p-1 px-1.5 border border-stone-200 text-[#C5A059] hover:bg-[#C5A059]/5 hover:border-[#C5A059] rounded text-[10px] font-semibold bg-white transition-colors cursor-pointer"
                    >
                      <Edit size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="p-1 px-1.5 border border-stone-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded text-[10px] font-semibold bg-white transition-colors cursor-pointer"
                    >
                      <Trash2 size={11} />
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
