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
    <div className="lg:col-span-8 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-end items-center border-b border-stone-150 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap">
          {selectedDesignIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setConfirmModal({
                  message: `선택한 ${selectedDesignIds.length}개의 가맹점 인테리어를 일괄 삭제하시겠습니까?`,
                  onConfirm: async () => {
                    try {
                      await Promise.all(
                        selectedDesignIds.map(id =>
                          fetch(`/api/interiors/${id}`, { method: 'DELETE' })
                        )
                      );
                      showTemporaryToast('선택한 인테리어 디자인이 일괄 삭제되었습니다.');
                      const updated = interiors.filter(it => !selectedDesignIds.includes(it.type_id || it.typeId || it.id));
                      setInteriors(updated);
                      localStorage.setItem('haste_interior_types', JSON.stringify(updated));
                      window.dispatchEvent(new Event('haste_interior_updated'));
                      if (onUpdateInteriors) {
                        onUpdateInteriors(updated);
                      }
                      setSelectedDesignIds([]);
                    } catch (err: any) {
                      showTemporaryError('일괄 삭제 중 오류가 발생했습니다: ' + err.message);
                    }
                  }
                });
              }}
              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
            >
              <Trash2 size={12} />
              <span>선택 일괄 삭제 ({selectedDesignIds.length})</span>
            </button>
          )}

          <AdminSystemHub 
            showTemporaryToast={showTemporaryToast}
            showTemporaryError={showTemporaryError}
            activeAdminTab="INQUIRY"
          />

          <button
            type="button"
            onClick={handleOpenCreateInterior}
            className="py-1.5 px-3 bg-[#C5A059] hover:bg-[#B38F48] text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
          >
            <Plus size={12} />
            <span>새 디자인 추가</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold font-sans text-[10px] tracking-wider uppercase">
              <th className="py-3 px-3 text-center w-[140px] text-stone-500">
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
                    className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                  />
                  <span>선택 | 순서</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center w-16 font-bold">노출</th>
              <th className="py-3 px-3 text-center w-[110px] font-bold">디자인 코드</th>
              <th className="py-3 px-3 text-center w-16 font-bold">완공이미지</th>
              <th className="py-3 px-3 font-bold">인테리어 스타일 명칭 (Title)</th>
              <th className="py-3 px-3 font-bold">공간해설 컨셉 (Description)</th>
              <th className="py-3 px-3 font-bold">태그 분류</th>
              <th className="py-3 px-3 text-right pr-4 font-bold">조작 제어</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150">
            {currentInteriorsToShow.map((item, relativeIdx) => {
              const originalIdx = (interiorPage - 1) * 5 + relativeIdx;
              return (
                <tr 
                  key={item.id} 
                  className={`hover:bg-stone-50/50 transition-all duration-150 ${draggedIdx === originalIdx ? 'opacity-35 bg-stone-100 border-2 border-dashed border-[#C5A059]/30 scale-[0.995]' : ''}`}
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
                        className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-black text-stone-800 break-all select-all">
                    {item.type_id || item.typeId || item.id}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex gap-0.5 justify-center">
                      {item.gallery && item.gallery.slice(0, 3).map((img: string, gIdx: number) => (
                        <div key={gIdx} className="w-6 h-6 rounded overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                          {img ? (
                            <img src={img} alt="store gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-stone-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-stone-900 text-xs">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-stone-400 font-light mt-0.5">
                      {item.subtitle}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-[250px]">
                    <div className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-[120px] whitespace-normal">
                    <div className="flex flex-wrap gap-1">
                      {item.tags && item.tags.map((t: string, tIdx: number) => (
                        <span key={tIdx} className="text-[9px] font-sans text-stone-500 bg-stone-150 px-1.5 py-0.5 rounded leading-none inline-block">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right pr-4">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewInterior(item)}
                        className="p-1 px-2 border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-300 rounded text-[10px] font-semibold bg-white transition-colors cursor-pointer flex items-center gap-1"
                        title="시뮬레이터 로드"
                      >
                        <Eye size={11} />
                        <span>미리보기</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditInterior(item)}
                        className="p-1 px-1.5 border border-stone-200 text-[#C5A059] hover:bg-[#C5A059]/5 hover:border-[#C5A059] rounded text-[10px] font-semibold bg-white transition-colors cursor-pointer"
                        title="수정하기"
                      >
                        <Edit size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInterior(item.type_id || item.typeId || item.id)}
                        className="p-1 px-1.5 border border-stone-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded text-[10px] font-semibold bg-white transition-colors cursor-pointer"
                        title="삭제하기"
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

      {renderPagination(interiorPage, totalInteriorPages, setInteriorPage)}
    </div>
  );
};
