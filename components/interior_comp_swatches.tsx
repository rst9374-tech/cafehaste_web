import React from 'react';
import { Compass, Paintbrush } from 'lucide-react';
import { StyleItem } from './interior_types';


export const NoImagePlaceholder: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`flex flex-col items-center justify-center bg-stone-50 border border-stone-250/25 rounded-[20px] gap-2 text-stone-300 p-4 ${className} select-none`}>
    <Compass size={24} className="stroke-[1.25] text-stone-400" />
    <span className="text-[9px] font-bold tracking-wider font-mono text-stone-400">NO IMAGE</span>
  </div>
);

interface SwatchItem {
  name: string;
  hex: string;
  text: string;
}

interface InteriorCompSwatchesProps {
  activeStyleId: string;
}

export const InteriorCompSwatches: React.FC<InteriorCompSwatchesProps> = ({ activeStyleId }) => {
  const colorPalette: SwatchItem[] = React.useMemo(() => {
    if (activeStyleId === 'TYPE2') {
      return [
        { name: '노출 콘크리트 베이스', hex: '#8C8C8C', text: 'Rough Matte' },
        { name: '새틴 광택 메탈', hex: '#D1D5DB', text: 'Sanded Steel' },
        { name: '정밀 글라스 유닛', hex: '#E0F2FE', text: 'Cyan Glass' },
        { name: '골든 수지 어반', hex: '#C5A059', text: 'Melted Resin' },
      ];
    }
    return [
      { name: '아이보리 석회 모르타르', hex: '#FAF6F0', text: 'Limestone Plaster' },
      { name: '크래프트 세라믹 백', hex: '#E5DCD3', text: 'Studio Clay' },
      { name: '내추럴 솔리드 오크', hex: '#634731', text: 'Deep Forest Oak' },
      { name: '아늑한 온백색 LED', hex: '#FFDFB5', text: 'Warm Ambient' },
    ];
  }, [activeStyleId]);

  return (
    <div className="mb-2 relative z-10 bg-stone-50 border border-stone-200 rounded-3xl p-5">
      <h4 className="font-mono text-[10px] tracking-widest text-[#C5A059] font-bold uppercase mb-4 flex items-center gap-1.5">
        <Paintbrush size={11} />
        <span>MATERIAL & TEXTURE SWATCHES</span>
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {colorPalette.map((color, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-3 border border-stone-150 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl shrink-0 border border-stone-200/50 shadow-inner"
              style={{ backgroundColor: color.hex }}
            />
            <div className="min-w-0">
              <p className="text-[10px] font-sans font-bold text-stone-850 truncate leading-snug">
                {color.name}
              </p>
              <p className="text-[9px] font-mono text-stone-400 truncate leading-none mt-1">
                {color.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
