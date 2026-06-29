import React from 'react';

interface BoardCompWriteCategoryProps {
  writeCategory: string;
  setWriteCategory: (val: string) => void;
  isAdmin: boolean;
}

export const BoardCompWriteCategory: React.FC<BoardCompWriteCategoryProps> = ({
  writeCategory,
  setWriteCategory,
  isAdmin
}) => {
  return (
    <div>
      <label className="block text-stone-700 text-xs font-bold mb-1 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D37]" />
        <span>카테고리 선택 *</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2">
        {['헤이스트소식', '노하우팁', '장비운영', '자료실', '레시피', '핵심정보', 'Q&A', '직거래', 'TEST']
          .filter((cat) => cat !== '핵심정보' || isAdmin)
          .map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setWriteCategory(cat)}
              className={`text-xs font-black rounded-full border-2 transition-all cursor-pointer py-1.5 px-3 md:py-2 md:px-4.5 ${ writeCategory === cat ? 'bg-[#422B1E] text-[#C5A059] border-[#422B1E] shadow-sm' : 'bg-white text-stone-850 border-stone-300 hover:bg-stone-50' }`}
            >
              {cat === '헤이스트소식' ? '소식' : (cat === '운용가이드' || cat === '노하우팁') ? '노하우팁' : cat}
            </button>
          ))}
      </div>
    </div>
  );
};
