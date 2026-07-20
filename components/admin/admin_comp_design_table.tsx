import React from 'react';
import { Plus, Trash2, Edit, Eye, GripVertical } from 'lucide-react';
import { AdminSystemHub } from './admin_comp_systemhub';

interface AdminDesignTableProps {
  interiors: any[];
  setInteriors: (items: any[]) => void;
  onUpdateInteriors?: (items: any[]) => void;
  currentInteriorsToShow: any[];
  selectedDesignIds: string[];
  setSelectedDesignIds: React.Dispatch<React.SetStateAction<string[]>>;
  draggedIdx: number | null;
  setDraggedIdx: (idx: number | null) => void;
  setPreviewInterior: (item: any) => void;
  handleOpenEditInterior: (item: any) => void;
  handleDeleteInterior: (typeId: string) => void;
  interiorPage: number;
  setInteriorPage: (p: number) => void;
  totalInteriorPages: number;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  setConfirmModal: (modal: { message: string; onConfirm: () => void } | null) => void;
  handleOpenCreateInterior: () => void;
}

export const AdminDesignTable: React.FC<AdminDesignTableProps> = ({
  interiors,
  setInteriors,
  onUpdateInteriors,
  currentInteriorsToShow,
  selectedDesignIds,
  setSelectedDesignIds,
  draggedIdx,
  setDraggedIdx,
  setPreviewInterior,
  handleOpenEditInterior,
  handleDeleteInterior,
  interiorPage,
  setInteriorPage,
  totalInteriorPages,
  renderPagination,
  showTemporaryToast,
  showTemporaryError,
  setConfirmModal,
  handleOpenCreateInterior
}) => {
  return (
    <div className="w-full bg-[#070609]/95 border border-stone-900 rounded-3xl p-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs table-fixed">
          <thead>
            <tr className="bg-stone-900 border-b border-stone-800 text-stone-400 font-bold font-sans text-[12px] tracking-wider uppercase">
              <th className="py-3 px-3 text-center w-[100px] text-stone-500">
                <div className="flex items-center justify-center gap-1.5">
                  <input 
                    type="checkbox"
                    checked={currentInteriorsToShow.length > 0 && currentInteriorsToShow.every(item => selectedDesignIds.includes(item.type_id || item.typeId || item.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pageIds = currentInteriorsToShow.map(item => item.type_id || item.typeId || item.id);
                        setSelectedDesignIds(prev => Array.from(new Set([...prev, ...pageIds])));
                      } else {
                        const pageIds = currentInteriorsToShow.map(item => item.type_id || item.typeId || item.id);
                        setSelectedDesignIds(prev => prev.filter(id => !pageIds.includes(id)));
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-stone-800 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer bg-stone-950"
                  />
                  <span>선택 | 순서</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center w-[60px] font-bold">노출</th>
              <th className="py-3 px-3 text-center w-[90px] font-bold">디자인 코드</th>
              <th className="py-3 px-3 text-center w-[80px] font-bold">완공이미지</th>
              <th className="py-3 px-3 w-[200px] font-bold">인테리어 스타일 명칭 (Title)</th>
              <th className="py-3 px-3 text-right pr-4 w-[140px] font-bold">조작 제어</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-850">
            {currentInteriorsToShow.map((item, relativeIdx) => {
              const originalIdx = (interiorPage - 1) * 5 + relativeIdx;
              return (
                <tr 
                  key={item.id} 
                  className={`hover:bg-stone-850/50 transition-all duration-150 ${draggedIdx === originalIdx ? 'opacity-35 bg-stone-955 border-2 border-dashed border-[#C5A059]/30 scale-[0.995]' : ''}`}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIdx(originalIdx);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragEnter={() => {
                    if (draggedIdx === null || draggedIdx === originalIdx) return;
                    const updated = [...interiors];
                    const draggedItem = updated[draggedIdx];
                    updated.splice(draggedIdx, 1);
                    updated.splice(originalIdx, 0, draggedItem);
                    setInteriors(updated);
                    localStorage.setItem('haste_interior_types', JSON.stringify(updated));
                    window.dispatchEvent(new Event('haste_interior_updated'));
                    if (onUpdateInteriors) {
                      onUpdateInteriors(updated);
                    }
                    setDraggedIdx(originalIdx);
                  }}
                  onDragEnd={async () => {
                    setDraggedIdx(null);
                    const typeIds = interiors.map(it => it.type_id || it.typeId || it.id);
                    try {
                      await fetch('/api/interiors/reorder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ typeIds })
                      });
                    } catch (err) {
                      console.error('Failed to sync reordered interiors to DB:', err);
                    }
                  }}
                >
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-stone-500 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedDesignIds.includes(item.type_id || item.typeId || item.id)}
                        onChange={() => {
                          const targetId = item.type_id || item.typeId || item.id;
                          setSelectedDesignIds(prev => 
                            prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
                          );
                        }}
                        className="w-3.5 h-3.5 rounded border-stone-800 bg-stone-950 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                      />
                      <span>{originalIdx + 1}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing">
                      <GripVertical size={13} className="text-stone-300 hover:text-stone-400 transition-colors" />
                      <input 
                        type="checkbox"
                        checked={item.visible !== false}
                        onChange={async (e) => {
                          const nextVisible = e.target.checked;
                          const targetId = item.type_id || item.typeId || item.id;
                          const updatedInteriors = interiors.map(it => (it.type_id || it.typeId || it.id) === targetId ? { ...it, visible: nextVisible } : it);
                          setInteriors(updatedInteriors);
                          localStorage.setItem('haste_interior_types', JSON.stringify(updatedInteriors));
                          window.dispatchEvent(new Event('haste_interior_updated'));
                          if (onUpdateInteriors) {
                            onUpdateInteriors(updatedInteriors);
                          }
                          try {
                            await fetch(`/api/interiors/${targetId}/toggle-visibility`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ visible: nextVisible })
                            });
                          } catch (err) {
                            console.error('Failed to toggle interior visibility in DB:', err);
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-stone-800 bg-stone-950 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-stone-400 break-all select-all">
                    {item.type_id || item.typeId || item.id}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex gap-0.5 justify-center">
                      {item.gallery && item.gallery.slice(0, 3).map((img: string, gIdx: number) => (
                        <div key={gIdx} className="w-6 h-6 rounded overflow-hidden border border-stone-850 bg-stone-900 flex-shrink-0">
                          {img ? (
                            <img src={img} alt="store gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-stone-950" />
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 w-[200px] truncate">
                    <div className="font-bold text-stone-200 text-[13px] truncate" title={item.title}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-stone-450 font-normal mt-0.5 truncate" title={item.subtitle}>
                      {item.subtitle}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right pr-4 w-[140px]">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewInterior(item)}
                        className="p-1 px-2 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 rounded text-[11px] font-semibold bg-stone-900 transition-colors cursor-pointer flex items-center gap-1"
                        title="시뮬레이터 로드"
                      >
                        <Eye size={11} />
                        <span>미리보기</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditInterior(item)}
                        className="admin-btn-action-edit"
                        title="수정하기"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInterior(item.type_id || item.typeId || item.id)}
                        className="admin-btn-action-delete"
                        title="삭제하기"
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

      {renderPagination(interiorPage, totalInteriorPages, setInteriorPage)}
    </div>
  );
};
