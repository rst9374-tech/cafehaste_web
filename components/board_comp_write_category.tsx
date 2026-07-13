import React from 'react';

interface BoardCompWriteCategoryProps {
  writeCategory: string;
  setWriteCategory: (val: string) => void;
  isAdmin: boolean;
  checkWritePermissionForCategory?: (cat: string) => boolean;
}

export const BoardCompWriteCategory: React.FC<BoardCompWriteCategoryProps> = ({
  writeCategory,
  setWriteCategory,
  isAdmin,
  checkWritePermissionForCategory
}) => {
  return (
    <div>
      <label className="block text-stone-700 text-sm font-bold mb-1 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D37]" />
        <span>카테고리 선택 *</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2">
              {['헤이스트소식', '노하우팁', '자료실', '핵심정보', '헤이스트멤버십전용', 'Q&A', '직거래']
                .filter((cat) => checkWritePermissionForCategory ? checkWritePermissionForCategory(cat) : (cat !== '핵심정보' || isAdmin))
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setWriteCategory(cat)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black transition-all tracking-wider cursor-pointer whitespace-nowrap flex items-center justify-center shrink-0 border-2 ${ writeCategory === cat ? 'bg-stone-900 text-[#C5A059] border-stone-900 shadow-md' : 'bg-white text-stone-855 hover:text-stone-950 border-stone-300 hover:bg-stone-50' }`}
                  >
                    {cat === '헤이스트소식' ? '소식' : cat === '노하우팁' ? '노하우팁' : cat}
                  </button>
                ))}
      </div>
    </div>
  );
};
