import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-stone-900 bg-[#070609]/90 px-4 py-3.5 sm:px-6 mt-4 rounded-2xl border shadow-xl">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-xl border border-stone-900 bg-stone-950 px-4 py-2 text-xs font-medium text-stone-300 hover:bg-stone-900 hover:text-stone-100 disabled:opacity-40"
        >
          이전
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-xl border border-stone-900 bg-stone-950 px-4 py-2 text-xs font-medium text-stone-300 hover:bg-stone-900 hover:text-stone-100 disabled:opacity-40"
        >
          다음
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-stone-450 font-sans">
            총 <span className="font-bold text-[#C5A059]">{totalPages}</span> 페이지 중 <span className="font-bold text-stone-200">{currentPage}</span>번째 페이지
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl border border-stone-900 bg-stone-950 p-2 text-stone-400 hover:bg-stone-900 hover:text-stone-200 focus:z-20 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold font-sans cursor-pointer transition-all duration-150 ${isCurrent ? 'bg-[#C5A059] text-stone-950 shadow-md font-black' : 'border border-stone-900 bg-stone-950 text-stone-400 hover:bg-stone-900 hover:text-stone-200'}`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-xl border border-stone-900 bg-stone-950 p-2 text-stone-400 hover:bg-stone-900 hover:text-stone-200 focus:z-20 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
