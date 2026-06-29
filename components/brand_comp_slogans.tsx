import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HasteSlogansProps {
  isComp: boolean;
}

export const HasteSlogans: React.FC<HasteSlogansProps> = ({ isComp }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const sloganItems = [
    { 
      tag: "✦ CLASSIC SLOGAN ✦", 
      phrase: "성공을 향한 가속, 헤이스트", 
      desc: "숨 가쁘게 흘러가는 도심의 여정 속에서, 당신의 빛나는 성취를 위해 조용히 따뜻한 힘을 채워주는 가장 든든하고 신뢰성 높은 휴식의 약속입니다.",
      number: "01"
    },
    { 
      tag: "✦ DAILY ESSENTIAL ✦", 
      phrase: "당신의 하루가 가벼워지는 속도.", 
      desc: "매일 바쁘게 반복되는 하루 속에서 마음의 짐을 잠시 내려두고, 따뜻한 한 잔에 기대어 다정하게 스스로를 채워주는 기분 좋은 쉼표입니다.",
      number: "02"
    },
    { 
      tag: "✦ HARMONY ✦", 
      phrase: "느린 도심 속, 기분 좋은 가속.", 
      desc: "나무의 부드러운 향이 스며든 따뜻한 아날로그 공간 속에서, 눈에 보이지 않지만 섬세하게 배려하는 스마트 무인 시스템이 조화롭게 스며든 평온한 안식입니다.",
      number: "03"
    },
    { 
      tag: "✦ PREMIUM BREAK ✦", 
      phrase: "A Quick Break, A Perfect Rest.", 
      desc: "나만을 위해 마련된 안락한 공간에서 정교하게 우려낸 커피 향을 음미하며, 바깥세상의 소음을 지우고 온전한 평온함에 깊숙이 안기는 시간입니다.",
      number: "04"
    }
  ];

  return (
    <section id="brand-slogan" className="max-w-5xl mx-auto bg-white border border-stone-300 rounded-[24px] shadow-md overflow-hidden scroll-mt-28 mb-4 p-4 md:mb-36 md:p-8 md:p-10">
      <div className="text-center mb-4 md:mb-8">
        <span className="haste-category-label-en tracking-[0.3em] !mx-auto w-fit">
          Elegant Verses
        </span>
        <h4 className="tracking-tight haste-section-title-1">감성 슬로건 라인업</h4>
        <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase mt-1">Refined messaging of Haste identity</p>
        <div className="w-10 h-px bg-[#C5A059]/50 mx-auto mt-3" />
      </div>

      <div className="relative w-full">
        {/* Mobile slide navigation arrows */}
        {isComp && (
          <>
            <button
              type="button"
              onClick={handleScrollLeft}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-900/80 border border-[#C5A059]/40 text-[#C5A059] hover:text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
              title="이전 슬로건 보기"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-900/80 border border-[#C5A059]/40 text-[#C5A059] hover:text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
              title="다음 슬로건 보기"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <div 
          ref={scrollRef}
          className={`flex ${
            isComp 
              ? 'flex-row overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 px-10 pb-4' 
              : 'flex-col md:grid md:grid-cols-2 gap-4 md:gap-8'
          } text-stone-800`}
        >
          {sloganItems.map((item, idx) => (
            <motion.div 
              key={idx} 
              whileHover={isComp ? {} : { y: -8 }}
              className="bg-white/90 backdrop-blur-[6px] border border-stone-200/60 hover:border-[#C5A059]/40 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden p-4 rounded-[16px] shadow-stone-100/30 w-[80vw] shrink-0 snap-center md:p-6 md:rounded-2xl md:shadow-stone-100/50 md:w-auto md:shrink md:snap-align-none"
            >
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-serif font-black text-[#C5A059] text-sm md:text-base select-none">{item.number}</span>
                  <span className="haste-category-label-en tracking-[0.3em] !mb-0">{item.tag}</span>
                </div>
                <p className="haste-section-title-2 leading-snug mb-3 tracking-tight">
                  "<span className="underline decoration-[#C5A059] decoration-2 underline-offset-4">{item.phrase}</span>"
                </p>
              </div>
              <p className="leading-relaxed pt-3 border-t border-stone-100/80 mt-3 haste-body-text-2">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="text-center mt-3 text-[11px] text-[#C5A059] select-none font-sans font-medium tracking-tight animate-pulse block md:hidden">
        ◀ 좌우 슬라이드로 감상하실 수 있습니다 ▶
      </div>
    </section>
  );
};
