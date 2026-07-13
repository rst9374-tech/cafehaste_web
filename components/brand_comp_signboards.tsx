import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import signboardExample1 from '../src/assets/images/signboard_example_1.jpg';
import signboardExample2 from '../src/assets/images/signboard_example_2.jpg';
import signboardExample3 from '../src/assets/images/signboard_example_3.jpg';

export const HasteSignboards: React.FC = () => {
  const [selectedSignboard, setSelectedSignboard] = useState<{ img: string; title: string; desc: string } | null>(null);
  const signboardScrollRef = useRef<HTMLDivElement>(null);

  const scrollSignboard = (direction: 'left' | 'right') => {
    if (signboardScrollRef.current) {
      const cardWidth = signboardScrollRef.current.offsetWidth * 0.8;
      const currentScroll = signboardScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - cardWidth 
        : currentScroll + cardWidth;
      
      signboardScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const signboardSamples = [
    { img: signboardExample1, title: "기본 정면 파사드 간판", desc: "낮과 밤에 모두 뛰어난 시인성을 자랑하는 브론즈 골드 백라이트 채널 사인" },
    { img: signboardExample2, title: "측면 입체 아웃라인 사인", desc: "코너 상권 입지를 극대화하는 깊이감 있는 3D 채널 시그니처 조명" },
    { img: signboardExample3, title: "클래식 브릭 조화형 파사드", desc: "조명과 천연 벽돌 질감이 우아하게 어우러지는 아늑한 분위기의 조명형 간판" }
  ];

  return (
    <>
      <section id="brand-signboards" className="max-w-5xl mx-auto scroll-mt-28 bg-[#FFFDF9] border border-stone-300 rounded-[24px] shadow-md relative overflow-hidden mb-4 p-5 md:mb-12 md:p-14">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-2"> HASTE SIGNBOARD </span>
          <h2 className="font-sans font-bold text-stone-900 text-sm md:text-2xl mb-2">헤이스트 외부 간판 예시</h2>
          <p className="text-stone-655 font-sans font-light text-[10px] sm:text-xs mt-1">도심 속에서 헤이스트만의 정체성을 드러내는 고급스럽고 모던한 파사드 및 간판 샘플입니다.</p>
          <div className="w-8 h-px bg-stone-300 mx-auto mt-2" />
        </div>

        <div className="relative w-full">
          <div 
            ref={signboardScrollRef}
            className="flex md:grid md:grid-cols-3 gap-6 relative font-sans overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none no-swipe px-0.5"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {signboardSamples.map((sample, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300 hover:scale-[1.02] w-[78vw] md:w-full shrink-0 snap-center"
              >
                <div 
                  onClick={() => setSelectedSignboard(sample)}
                  className="aspect-[16/9] w-full overflow-hidden bg-stone-100 border-b border-stone-150 cursor-pointer relative group"
                >
                  <img 
                    src={sample.img} 
                    alt={sample.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold bg-black/60 px-2.5 py-1.5 rounded-full border border-white/20 shadow-sm font-sans">자세히 보기</span>
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <h4 className="font-bold text-stone-900 text-[13px] md:text-sm mb-1.5 font-sans">{sample.title}</h4>
                  <p className="text-stone-550 text-[11px] leading-relaxed font-sans">{sample.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile-only Arrow buttons */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollSignboard('left'); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center md:hidden shadow-lg active:scale-95 transition-all cursor-pointer"
            title="이전 간판"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollSignboard('right'); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center md:hidden shadow-lg active:scale-95 transition-all cursor-pointer"
            title="다음 간판"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Signboard Image Lightbox Popup Modal */}
      {selectedSignboard && (
        <div 
          onClick={() => setSelectedSignboard(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="absolute top-4 right-4 z-55">
            <button 
              onClick={() => setSelectedSignboard(null)}
              className="p-2.5 rounded-full bg-stone-900/80 border border-stone-700 text-white hover:text-[#C5A059] transition-all duration-300 cursor-pointer shadow-md active:scale-95 flex items-center justify-center"
              title="닫기"
            >
              <svg xmlns="http://www.w3.org/2050/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-4xl max-h-[85vh] flex flex-col gap-3 relative cursor-default"
          >
            <div className="overflow-hidden rounded-2xl md:rounded-[24px] border border-stone-800 shadow-2xl bg-stone-950 flex items-center justify-center">
              <img 
                src={selectedSignboard.img} 
                alt={selectedSignboard.title} 
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            
            <div className="text-center md:text-left text-white px-2 mt-1">
              <h4 className="text-[#C5A059] font-bold text-[15px] font-sans">{selectedSignboard.title}</h4>
              <p className="text-stone-300 text-xs leading-relaxed mt-1 font-sans font-light">{selectedSignboard.desc}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
