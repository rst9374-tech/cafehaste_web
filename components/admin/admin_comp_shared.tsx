import React, { useState } from 'react';
import { AlertOctagon } from 'lucide-react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const isTestMember = (member: any): boolean => {
  if (!member) return false;
  const name = (member.ownerName || '').toLowerCase();
  const storeName = (member.storeName || '').toLowerCase();
  
  return (
    name.includes('테스트') || name.includes('test') || name.includes('tester') ||
    storeName.includes('테스트') || storeName.includes('test')
  );
};

export const getSortIcon = (sortConfig: SortConfig | null, key: string) => {
  if (!sortConfig || sortConfig.key !== key) {
    return <span className="text-stone-300 ml-1 select-none">⇅</span>;
  }
  return sortConfig.direction === 'asc' 
    ? <span className="text-[#C5A059] font-black ml-1 select-none">▲</span> 
    : <span className="text-[#C5A059] font-black ml-1 select-none">▼</span>;
};

interface SortHeaderProps {
  label: string;
  sortKey: string;
  widthClass: string;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  align?: 'center' | 'left';
}

export const SortHeader: React.FC<SortHeaderProps> = ({
  label,
  sortKey,
  widthClass,
  sortConfig,
  onSort,
  align = 'center'
}) => {
  const isLeft = align === 'left';
  return (
    <th 
      onClick={() => onSort(sortKey)} 
      className={`py-3 px-4 ${widthClass} hover:bg-stone-200 transition-colors cursor-pointer select-none text-stone-500 font-bold uppercase font-sans text-[10px] tracking-wider ${
        isLeft ? 'text-left' : 'text-center'
      }`}
    >
      <div className={`flex items-center gap-1 ${isLeft ? 'justify-start' : 'justify-center'}`}>
        <span>{label}</span>
        {getSortIcon(sortConfig, sortKey)}
      </div>
    </th>
  );
};

// -------------------------------------------------------------
// Standalone Stateful Member Edit Form Modal Component (Re-exported)
// -------------------------------------------------------------
export type { MemberEditModalProps } from './admin_comp_member_edit_modal';
export { MemberEditModal } from './admin_comp_member_edit_modal';

// -------------------------------------------------------------
// Shared Admin Confirm Modal (HASTE Confirm)
// -------------------------------------------------------------
interface AdminConfirmModalProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  message,
  onCancel,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <h3 className="text-sm font-extrabold text-[#9C7B41] tracking-wide mb-2">동작 확인 (HASTE Confirm)</h3>
        <p className="text-xs text-stone-600 mb-6 leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 hover:bg-stone-100 text-stone-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
