import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Feather } from 'lucide-react';
import logoSvg1 from '../src/assets/images/1.svg';
import logoSvg2 from '../src/assets/images/2.svg';
import logoSvg3 from '../src/assets/images/3.svg';
import logoSvg4 from '../src/assets/images/4.svg';

export const HasteColor: React.FC = () => {
  const [selectedLogoIdx, setSelectedLogoIdx] = useState(0);

  const logos = [
    { src: logoSvg1, name: 'haste_logo_horizontal_black.svg', label: '가로형 블랙' },
    { src: logoSvg3, name: 'haste_logo_horizontal_white.svg', label: '가로형 화이트' },
    { src: logoSvg2, name: 'haste_logo_vertical_black.svg', label: '세로형 블랙' },
    { src: logoSvg4, name: 'haste_logo_vertical_white.svg', label: '세로형 화이트' }
  ];

  const handleDownload = async (svgUrl: string, filename: string) => {
    try {
      const response = await fetch(svgUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const link = document.createElement('a');
      link.href = svgUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section id="brand-color" className="max-w-5xl mx-auto scroll-mt-28 bg-white border border-stone-300 rounded-[24px] shadow-md relative overflow-hidden flex flex-col md:flex-row gap-6 items-center mb-4 p-4 md:mb-36 md:p-14">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#ffbd59]/5 blur-[80px] pointer-events-none" />
      
      <div className="md:w-7/12 relative z-10">
        <span className="haste-category-label-en tracking-[0.3em]">
          <Feather size={10} className="inline mr-1" /> Color Identity
        </span>
        <h3 className="font-sans mb-4 text-stone-900 leading-tight haste-section-title-1 md:mb-6">
          성숙하며 신뢰성 높은<br/>
          <span className="text-[#ffbd59] font-sans italic font-normal underline decoration-[#ffbd59] decoration-2 underline-offset-4">골드 & 매트 블랙</span> 컬러 테마
        </h3>
        
        <p className="leading-relaxed font-light max-w-lg haste-body-text-2 mb-6 md:mb-8">
          도심의 가볍고 충동적인 유행 컬러와는 다른 방향을 지향합니다. 깊이 우러난 오크 원목 가구의 따스한 질감과 신선한 원두 표면에 은은하게 피어오르는 골드(#ffbd59)를 중심으로, 세월이 흘러도 변치 않는 고급스러운 톤을 구축했습니다.
        </p>

        <div className="flex flex-col gap-3 font-mono">
          <div className="flex items-center gap-4 bg-[#FAF9F6] p-3 rounded-xl border border-[#ffbd59]/15 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-[#ffbd59]" />
            <div>
              <h5 className="haste-body-text-2 font-bold text-stone-900 uppercase tracking-widest !font-mono">Haste Gold (#ffbd59)</h5>
              <p className="haste-body-text-4 mt-0.5">깊은 조형미와 세밀한 감각을 더해주는 헤이스트 아이코닉 에센스</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-[#FAF9F6] p-3 rounded-xl border border-stone-200/50 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-[#000000] shrink-0" />
            <div>
              <h5 className="haste-body-text-2 font-bold text-stone-900 uppercase tracking-widest !font-mono">Espresso Obsidian (#000000)</h5>
              <p className="haste-body-text-4 mt-0.5">공간의 차분함과 고급 가죽, 클래식 가구의 안락함을 자연스럽게 표현하는 매트 블랙</p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-auto flex justify-center items-center relative z-10 w-full shrink-0">
        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-[24px] bg-white border border-[#ffbd59]/20 shadow-xl flex flex-col justify-center items-center gap-3 relative group w-full py-8 md:w-[480px] md:py-8"
        >
          {/* Visual borders inside */}
          <div className="absolute inset-2 rounded-[18px] border border-stone-100" />
          <div className="absolute top-3 right-4 text-[8px] font-mono tracking-[0.2em] text-[#ffbd59]/60 font-bold select-none">HASTE EDITION</div>
          
          {/* 2x2 Grid for 4 Logos - Click to Select */}
          <div className="grid grid-cols-2 gap-3 w-full px-5 relative z-10 mt-8">
            <button 
              type="button"
              onClick={() => setSelectedLogoIdx(0)}
              className={`aspect-[16/7] bg-stone-50 rounded-xl overflow-hidden flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm relative group/item border-2 ${selectedLogoIdx === 0 ? 'border-[#ffbd59]' : 'border-transparent'}`}
            >
              <img src={logoSvg1} alt="Horizontal Black" className="w-full h-full object-contain p-0.5 scale-[1.12] group-hover/item:scale-[1.17] transition-transform duration-300" />
            </button>

            <button 
              type="button"
              onClick={() => setSelectedLogoIdx(1)}
              className={`aspect-[16/7] bg-stone-950 rounded-xl overflow-hidden flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm relative group/item border-2 ${selectedLogoIdx === 1 ? 'border-[#ffbd59]' : 'border-transparent'}`}
            >
              <img src={logoSvg3} alt="Horizontal White" className="w-full h-full object-contain p-0.5 scale-[1.12] group-hover/item:scale-[1.17] transition-transform duration-300" />
            </button>

            <button 
              type="button"
              onClick={() => setSelectedLogoIdx(2)}
              className={`aspect-square bg-stone-50 rounded-xl overflow-hidden flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm relative group/item border-2 ${selectedLogoIdx === 2 ? 'border-[#ffbd59]' : 'border-transparent'}`}
            >
              <img src={logoSvg2} alt="Vertical Black" className="w-full h-full object-contain p-0.5 scale-[1.12] group-hover/item:scale-[1.17] transition-transform duration-300" />
            </button>

            <button 
              type="button"
              onClick={() => setSelectedLogoIdx(3)}
              className={`aspect-square bg-stone-950 rounded-xl overflow-hidden flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm relative group/item border-2 ${selectedLogoIdx === 3 ? 'border-[#ffbd59]' : 'border-transparent'}`}
            >
              <img src={logoSvg4} alt="Vertical White" className="w-full h-full object-contain p-0.5 scale-[1.12] group-hover/item:scale-[1.17] transition-transform duration-300" />
            </button>
          </div>

          <div className="w-full px-5 flex flex-col items-center mt-4 text-center z-10">
            <p className="text-[10px] text-[#ffbd59] font-mono tracking-widest uppercase font-bold leading-none">EST. 2026 // HASTE BRAND LOGO SUITE</p>
            <p className="text-[12px] text-stone-900 font-sans font-bold tracking-tight mt-2 leading-tight">
              가로형 / 세로형, 라이트 / 다크 총 4가지 공식 로고 세트
            </p>
            <p className="text-[10px] text-stone-550 font-sans tracking-tight mt-1.5 font-medium leading-tight">
              (원하는 로고 타일을 클릭한 후, 아래 다운로드 버튼을 눌러주세요)
            </p>
          </div>

          <div className="w-full px-5 mt-3 mb-2 z-10 flex justify-center">
            <button
              type="button"
              onClick={() => handleDownload(logos[selectedLogoIdx].src, logos[selectedLogoIdx].name)}
              className="w-full py-3 px-6 rounded-xl bg-stone-900 border border-stone-850 hover:bg-stone-800 text-white font-sans font-medium text-xs tracking-wide shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-[0.98] cursor-pointer"
            >
              <ArrowDown size={14} className="text-[#ffbd59] group-hover/btn:translate-y-0.5 transition-transform duration-300" />
              <span>선택한 로고 다운로드 ({logos[selectedLogoIdx].label})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
