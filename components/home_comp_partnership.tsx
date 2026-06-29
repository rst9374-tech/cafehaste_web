import React from 'react';

interface HomePartnershipProps {
  navigateTo: (route: any) => void;
  navigateToSection: (sectionId: string) => void;
}

export const HomePartnership: React.FC<HomePartnershipProps> = ({
  navigateTo,
  navigateToSection
}) => {
  return (
    <section className="container mx-auto px-4 md:px-6 mb-12 md:mb-24 max-w-6xl">
      <div className="bg-[#FAF6F0] border border-[#C5A059]/20 p-5 md:p-14 rounded-[32px] shadow-sm relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.05)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-2xl mx-auto mb-10">
          <span className="haste-category-label-en mb-2">Core Value & Margin</span>
          <h2 className="haste-section-title-1">지속 가능한 동행, 압도적인 수익 구조</h2>
          <p className="haste-body-text-1 mt-3">
            기존 브랜드의 불필요한 비용 부담을 덜어내고, 점주님 중심의 매장 운영을 보장합니다. 로열티 부담을 덜고 투명한 파트너십을 경험해 보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10 text-left">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-150/80 shadow-sm">
            <h3 className="haste-section-title-2 mb-3 flex items-center gap-2">
              <span className="text-[#C5A059] font-mono">01.</span>
              <span>4대 핵심 사항</span>
            </h3>
            <p className="haste-body-text-2">
              원부재료 유연한 활용, 독립 레시피 설정, 감리 제재 없는 매장 주도형 운영을 지원합니다.
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-150/80 shadow-sm">
            <h3 className="haste-section-title-2 mb-3 flex items-center gap-2">
              <span className="text-[#C5A059] font-mono">02.</span>
              <span>13대 멤버십 핵심 혜택</span>
            </h3>
            <p className="haste-body-text-2">
              월 5만 원의 합리적인 솔루션 구독 서비스와 점포의 독립적인 성장을 돕는 부가 특전들을 제공합니다.
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center font-sans">
          <button
            onClick={() => navigateTo('FRANCHISE')}
            className="px-10 py-3.5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
          >
            자세히 보기 →
          </button>
        </div>
      </div>
    </section>
  );
};
