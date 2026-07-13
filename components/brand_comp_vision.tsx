import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import visionPlaylist from '../src/assets/images/vision_playlist.jpg';
import visionNetwork from '../src/assets/images/vision_network.png';
import brandIdentityRange from '../src/assets/images/brand_identity_range.jpg';
import visionMarketing from '../src/assets/images/vision_marketing.png';

interface HasteVisionProps {
  isComp?: boolean;
}

export const HasteVision: React.FC<HasteVisionProps> = ({ isComp }) => {
  const visionScrollRef = useRef<HTMLDivElement>(null);

  const scrollVision = (direction: 'left' | 'right') => {
    if (visionScrollRef.current) {
      const cardWidth = visionScrollRef.current.offsetWidth * 0.8;
      const currentScroll = visionScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - cardWidth 
        : currentScroll + cardWidth;
      
      visionScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="brand-vision" className="max-w-6xl mx-auto scroll-mt-28 bg-white border border-stone-300 rounded-[24px] shadow-md overflow-hidden relative mb-4 p-4 md:mb-36 md:p-14">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#ffbd59]/5 blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 mb-8 md:mb-14 text-center md:text-left">
        <span className="haste-category-label-en tracking-[0.3em]">
          <Sparkles size={12} className="inline mr-1" /> Brand Vision
        </span>
        <h2 className="font-sans text-stone-900 font-bold leading-tight text-xl md:text-5xl mt-2">
          미래를 선도하는 HASTE의<br/>
          <span className="text-[#ffbd59] font-sans italic underline decoration-[#ffbd59] decoration-2 underline-offset-4 font-normal">지능형 기술 로드맵</span>
        </h2>
        <p className="text-stone-550 font-sans font-light text-xs md:text-sm mt-3 leading-relaxed max-w-xl">
          스마트하고 AI를 딥러닝 기반으로 헤이스트의 발전은 무궁무진합니다. 끊임없는 마케팅 홍보와 시장조사 자동화를 통해 점주님들과 긴밀하게 소통하며 지속 가능한 상생 발전을 이룩합니다.
        </p>
        <div className="w-16 h-[2px] bg-[#ffbd59] mt-4 mx-auto md:mx-0" />
      </div>

      <div className="relative w-full">
        <div 
          ref={visionScrollRef}
          className="flex lg:grid lg:grid-cols-4 gap-6 relative font-sans overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-none no-swipe px-0.5"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {/* Card 1: vision_playlist.jpg */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#ffbd59]/40 hover:shadow-md transition-all duration-300 w-[78vw] lg:w-full shrink-0 snap-center"
          >
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-stone-950 relative border-b border-stone-100">
                <img src={visionPlaylist} alt="초연결 감성 BGM 테크" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute top-2 right-2 text-[8px] font-mono tracking-wider bg-stone-950/70 border border-[#ffbd59]/30 text-[#ffbd59] px-2 py-0.5 rounded">MUSIC PLATFORM</div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-stone-900 text-sm md:text-base mb-2 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
                  초연결 감성 BGM 테크
                </h4>
                <p className="text-stone-550 text-[11px] md:text-xs leading-relaxed font-sans font-light mb-4">
                  매장의 소리 분위기를 실시간 분석하여 시간대와 손님 연령대에 최적화된 배경음악을 자동으로 큐레이션해 재생합니다. 선곡의 번거로움을 해결하고 공간의 고급스러운 감성을 한층 끌어올립니다.
                </p>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'MUSIC' } }))}
                  className="w-full mt-1 py-2 px-4 rounded-xl bg-stone-900 border border-stone-850 hover:bg-[#ffbd59] hover:text-stone-900 hover:border-[#ffbd59] text-[#ffbd59] font-sans font-semibold text-xs tracking-wider shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.97] cursor-pointer"
                >
                  <Music size={12} className="text-[#ffbd59] group-hover:text-stone-900 transition-colors duration-300" />
                  <span>음악감상실 바로가기</span>
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 text-[10px] text-[#ffbd59] font-bold font-mono flex items-center gap-1">
              <span>● INTEGRATED SOUND SYSTEM</span>
            </div>
          </motion.div>

          {/* Card 2: vision_network.png */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#ffbd59]/40 hover:shadow-md transition-all duration-300 w-[78vw] lg:w-full shrink-0 snap-center"
          >
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-stone-950 relative border-b border-stone-100">
                <img src={visionNetwork} alt="지능형 운영 & 트렌드 조사 소통망" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute top-2 right-2 text-[8px] font-mono tracking-wider bg-stone-950/70 border border-[#ffbd59]/30 text-[#ffbd59] px-2 py-0.5 rounded">KNOWLEDGE GRAPH</div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-stone-900 text-sm md:text-base mb-2 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
                  지능형 운영 & 트렌드 조사 소통망
                </h4>
                <p className="text-stone-550 text-[11px] md:text-xs leading-relaxed font-sans font-light">
                  기기 매뉴얼, 매장 운영 가이드, FAQ 등 점포 운영에 필요한 자료를 지식 그래프로 제공하며, 실시간 주변 상권 변화 분석과 트렌드 조사 기능까지 함께 지원합니다. 점주님들과의 실시간 소통망을 통해 헤이스트와 매장이 신뢰를 바탕으로 상생 발전하는 창구가 됩니다.
                </p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 text-[10px] text-[#ffbd59] font-bold font-mono flex items-center gap-1">
              <span>● AI KNOWLEDGE NETWORK</span>
            </div>
          </motion.div>

          {/* Card 3: 비용 절감형 지능형 마케팅 */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#ffbd59]/40 hover:shadow-md transition-all duration-300 w-[78vw] lg:w-full shrink-0 snap-center"
          >
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-stone-950 relative border-b border-stone-100">
                <img src={visionMarketing} alt="비용 절감형 지능형 마케팅" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute top-2 right-2 text-[8px] font-mono tracking-wider bg-stone-950/70 border border-[#ffbd59]/30 text-[#ffbd59] px-2 py-0.5 rounded">COST-EFFICIENT AI</div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-stone-900 text-sm md:text-base mb-2 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
                  비용 절감형 지능형 마케팅
                </h4>
                <p className="text-stone-550 text-[11px] md:text-xs leading-relaxed font-sans font-light mb-4">
                  높은 대행비와 비용 부담을 주는 기존 광고 대신, 유튜브와 인스타그램 맞춤형 홍보영상을 딥러닝 AI로 분석·기획하여 마케팅 비용을 대폭 절감합니다. 가장 적은 예산으로도 대중의 시선을 사로잡는 트렌디한 숏폼 및 SNS 영상 홍보를 가능하게 합니다.
                </p>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'FILM' } }))}
                  className="w-full mt-2.5 py-2 px-4 rounded-xl bg-stone-900 border border-stone-850 hover:bg-[#ffbd59] hover:text-stone-900 hover:border-[#ffbd59] text-[#ffbd59] font-sans font-semibold text-xs tracking-wider shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.97] cursor-pointer"
                >
                  <Film size={12} className="text-[#ffbd59] group-hover:text-stone-900 transition-colors duration-300" />
                  <span>홍보관 바로가기</span>
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 text-[10px] text-[#ffbd59] font-bold font-mono flex items-center gap-1">
              <span>● AI COST-SAVING MARKETING</span>
            </div>
          </motion.div>

          {/* Card 4: brand_identity_range.jpg */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#ffbd59]/40 hover:shadow-md transition-all duration-300 w-[78vw] lg:w-full shrink-0 snap-center"
          >
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-stone-950 relative border-b border-stone-100">
                <img src={brandIdentityRange} alt="자율 레시피 공유 & 브랜드 강화" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-stone-950/40 backdrop-blur-[1px]">
                  <span className="font-serif text-5xl md:text-6xl font-bold text-[#ffbd59] drop-shadow-[0_0_15px_rgba(255,189,89,0.6)] select-none">?</span>
                </div>
                <div className="absolute top-2 right-2 text-[8px] font-mono tracking-wider bg-stone-950/70 border border-[#ffbd59]/30 text-[#ffbd59] px-2 py-0.5 rounded">CO-CREATIVE BRAND</div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-stone-900 text-sm md:text-base mb-2 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd59]" />
                  자율 레시피 공유 & 브랜드 강화
                </h4>
                <p className="text-stone-550 text-[11px] md:text-xs leading-relaxed font-sans font-light">
                  각 점포만의 독창적인 신메뉴 레시피를 자율적으로 공유하고 연구하는 상생형 참여 네트워크입니다. 우수한 시그니처 메뉴 레시피가 지속 연결되어 HASTE 전체의 공동 브랜드 가치를 높여줍니다.
                </p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 text-[10px] text-[#ffbd59] font-bold font-mono flex items-center gap-1">
              <span>● CO-CREATIVE BRANDING SYSTEM</span>
            </div>
          </motion.div>
        </div>

        {/* Mobile-only Arrow buttons */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); scrollVision('left'); }}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#ffbd59] border border-[#ffbd59]/30 flex items-center justify-center lg:hidden shadow-lg active:scale-95 transition-all cursor-pointer"
          title="이전 비전"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); scrollVision('right'); }}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#ffbd59] border border-[#ffbd59]/30 flex items-center justify-center lg:hidden shadow-lg active:scale-95 transition-all cursor-pointer"
          title="다음 비전"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};
