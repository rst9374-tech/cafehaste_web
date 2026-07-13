import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, BookOpen, Award } from 'lucide-react';
import { HasteGuidebookModal } from './membership_modal_guidebook';
import { HasteBenefitModal } from './membership_modal_benefit';

interface HasteMembershipDiagramProps {
  onOpenGuidebook?: () => void;
}

export const HasteMembershipDiagram: React.FC<HasteMembershipDiagramProps> = ({ onOpenGuidebook }) => {
  const [localGuideOpen, setLocalGuideOpen] = useState(false);
  const [localBenefitOpen, setLocalBenefitOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleOpenGuide = () => {
    if (onOpenGuidebook) {
      onOpenGuidebook();
    } else {
      setLocalGuideOpen(true);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.8;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - cardWidth 
        : currentScroll + cardWidth;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="bg-[#FFFDF9] border border-[#C5A059]/40 rounded-3xl p-5 md:p-7 shadow-md transition-all">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-200 pb-5">
          <div>
            <span className="haste-category-label-en mb-1">
              HASTE membership model comparison
            </span>
            <h3 className="haste-section-title-2 leading-tight">
              멤버십 및 창업회원 유형별 절차 안내
            </h3>
            <p className="haste-body-text-1 mt-1">
              점주의 매장 상태와 독립성 수준에 가장 최적화된 헤이스트 운영 공식을 비교해 보세요.
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0 w-fit">
            <button
              type="button"
              onClick={() => setLocalBenefitOpen(true)}
              className="bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-750 font-bold py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-xl border border-stone-300 transition-all text-[10.5px] sm:text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <Award className="text-[#C5A059] w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" />
              <span>멤버십 혜택안내</span>
            </button>
            <button
              type="button"
              onClick={handleOpenGuide}
              className="bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-750 font-bold py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-xl border border-stone-300 transition-all text-[10.5px] sm:text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <BookOpen className="text-[#C5A059] w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" />
              <span>멤버십 가입안내</span>
            </button>
          </div>
        </div>

        {/* COMPARISON CARDS GRID - Clickable & Interactive with Horizontal Swipe on Mobile */}
        <div className="relative w-full">
          <div 
            ref={scrollRef}
            className="flex md:grid md:grid-cols-2 gap-5 relative font-sans overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none no-swipe px-0.5" 
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
          
          {/* MODEL 01: GENERAL MEMBERSHIP FLOW (SOLUTIONS ONLY) */}
          <div 
            onClick={() => window.dispatchEvent(new Event('haste_open_signup_modal'))}
            className="relative bg-[#C5A059] border border-[#C5A059]/40 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] hover:border-stone-900 hover:shadow-md transition-all duration-300 cursor-pointer text-stone-950 w-[78vw] md:w-full shrink-0 snap-center"
          >
            <div>
              {/* Header Badge */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="bg-stone-950 text-[#C5A059] text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide block">
                  01. 멤버십 회원
                </span>
                <span className="text-[10px] font-black text-stone-900 font-mono tracking-wider uppercase bg-white/30 px-2 py-0.5 rounded">
                  SOLUTION ONLY
                </span>
              </div>

              {/* Title & Short Desc */}
              <h4 className="haste-section-title-3 tracking-tight mb-1">헤이스트 소프트웨어 솔루션 단독 사용</h4>
              <p className="haste-body-text-2 text-stone-900 mb-4 font-normal">
                기존 특정 무인카페에서 사용되던 지정 키오스크와 커피머신 간의 데이터 연동 통신 프로그램, 기기 연동 제어 솔루션만 도입하는 실속 있는 가성비 모델입니다.
              </p>

              {/* Custom Benefits Checklist */}
              <div className="space-y-2 mb-4 bg-white/20 border border-white/10 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-955 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3 text-stone-955">
                    <span className="underline decoration-1">헤이스트 브랜드 상표 라이선스 지원</span> 간판 및 브랜딩 표시 권한 지원
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-955 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3 text-stone-955">원부재료는 의무 구매 조항 없이 유연하게 선택해 활용하실 수 있습니다.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-955 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3 text-stone-955">기존 무인 커피머신/키오스크 장비에 연동 세팅 지원</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-950 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3 text-stone-955">헤이스트 무인 레시피 탑재 및 점포 고유 독립 브랜딩 자율 운영</span>
                </div>
              </div>

              {/* Visual Process Flow Diagram */}
              <div className="bg-white/10 p-3 rounded-xl border border-white/5 mb-4">
                <span className="text-[11px] tracking-normal text-stone-900 font-bold block mb-2 text-center font-sans">멤버십 회원 절차 안내</span>
                
                <div className="grid grid-cols-5 items-center gap-0.5 md:gap-1">
                  <div className="bg-white/80 border border-white/40 rounded-lg p-[2px] md:p-1.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[6px] md:text-[8px] font-mono text-stone-500 uppercase">STEP 1</span>
                    <span className="text-[8px] md:text-xs font-bold text-stone-800 whitespace-nowrap">예비점주</span>
                  </div>
                  
                  <div className="flex items-center justify-center text-stone-950">
                    <ChevronRight className="w-2.5 h-2.5 md:w-4 h-4" />
                  </div>

                  <div className="bg-stone-950 border border-stone-950 rounded-lg p-[2px] md:p-1.5 flex flex-col items-center justify-center text-center shadow-xs">
                    <span className="text-[6px] md:text-[8px] font-mono text-[#C5A059] font-bold uppercase">STEP 2</span>
                    <span className="text-[8px] md:text-xs font-black text-[#C5A059] whitespace-nowrap">멤버십회원</span>
                  </div>

                  <div className="flex items-center justify-center text-stone-950">
                    <ChevronRight className="w-2.5 h-2.5 md:w-4 h-4" />
                  </div>

                  <div className="bg-white/80 border border-white/40 rounded-lg p-[2px] md:p-1.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[6px] md:text-[8px] font-mono text-stone-500 uppercase">STEP 3</span>
                    <span className="text-[8px] md:text-xs font-bold text-stone-800 whitespace-nowrap">운용</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment summary */}
            <div className="pt-2 border-t border-stone-950/20 flex flex-col gap-1.5 text-xs text-stone-950">
              <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-semibold">최초 1회 가입비용</span>
                <span className="font-extrabold text-sm">30만원 <span className="text-stone-900/80 text-[10px] font-normal">상표 라이선스 지원 포함</span></span>
              </div>
              <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0 pt-1.5 border-t border-dashed border-stone-955/20">
                <span className="font-semibold">월 솔루션 사용료</span>
                <span className="font-extrabold text-sm">5만원</span>
              </div>
            </div>
          </div>

          {/* MODEL 02: PACKAGE STARTUP MEMBERSHIP (FULL PROJECT SUPPLY) */}
          <div 
            onClick={() => window.dispatchEvent(new Event('haste_open_inquiry_modal'))}
            className="relative bg-[#FFFDF9] border border-stone-300 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] hover:border-stone-800 hover:shadow-md transition-all duration-300 shadow-xs ring-1 ring-stone-900/5 cursor-pointer w-[78vw] md:w-full shrink-0 snap-center"
          >
            <div>
              {/* Header Badge */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="bg-stone-950 text-[#C5A059] text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wide block">
                  02. 패키지 창업 회원
                </span>
                <span className="text-[10px] font-black text-[#C5A059] font-mono tracking-wider uppercase bg-[#C5A059]/10 px-2 py-0.5 rounded">
                  ALL-IN-ONE SYSTEM
                </span>
              </div>

              {/* Title & Short Desc */}
              <h4 className="haste-section-title-3 tracking-tight mb-1">패키지형 프리미엄 올인원 지원</h4>
              <p className="haste-body-text-2 text-stone-700 mb-4 font-normal">
                무인 창업 설계가 처음이시거나 독점 오프라인 공간을 즉시 구축하고 싶으신 전속 가입 고객을 위해 머신, 하드웨어 수급, 인테리어 평당 시공 및 가상 조감도까지 올스톱 지원합니다.
              </p>

              {/* Custom Benefits Checklist */}
              <div className="space-y-2 mb-4 bg-stone-100/50 border border-stone-200 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-900 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3">
                    <span className="text-[#C5A059] font-extrabold">동일 상표 라이선스 기본 지원</span> (로열티 및 감리비 면제)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-900 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3">인테리어 시공 마감 자율권 설계 보장 및 합리적인 공사 견적</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-900 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3">통합 최고급 무인 머신 및 스마트 안심 가동 설비 특별가 제공</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-stone-900 mt-0.5 shrink-0" />
                  <span className="haste-body-text-3">전문가 점포 상권 데이터 매트릭 분석 및 헤이스트 기술 밀착 관리</span>
                </div>
              </div>

              {/* Visual Process Flow Diagram */}
              <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 mb-4">
                <span className="text-[11px] tracking-normal text-amber-800 font-bold block mb-2 text-center font-sans">안전 일괄 창업 절차 안내</span>
                
                <div className="grid grid-cols-5 items-center gap-0.5 md:gap-1">
                  <div className="bg-white border border-stone-200 rounded-lg p-[2px] md:p-1.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[6px] md:text-[8px] font-mono text-stone-400 uppercase">STEP 1</span>
                    <span className="text-[8px] md:text-xs font-bold text-stone-800 whitespace-nowrap">예비점주</span>
                  </div>
                  
                  <div className="flex items-center justify-center text-stone-400">
                    <ChevronRight className="w-2.5 h-2.5 md:w-4 h-4" />
                  </div>

                  <div className="bg-stone-950 border border-stone-900 rounded-lg p-[2px] md:p-1.5 flex flex-col items-center justify-center text-center shadow-xs">
                    <span className="text-[6px] md:text-[8px] font-mono text-[#C5A059] font-bold uppercase">STEP 2</span>
                    <span className="text-[8px] md:text-xs font-black text-[#C5A059] whitespace-nowrap">창업 계약</span>
                  </div>

                  <div className="flex items-center justify-center text-stone-400">
                    <ChevronRight className="w-2.5 h-2.5 md:w-4 h-4" />
                  </div>

                  <div className="bg-white border border-stone-200 rounded-lg p-[2px] md:p-1.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[6px] md:text-[8px] font-mono text-stone-400 uppercase">STEP 3</span>
                    <span className="text-[8px] md:text-xs font-bold text-stone-800 whitespace-nowrap">기기 공급</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment summary */}
            <div className="pt-2 border-t border-stone-150 flex flex-col gap-1.5 text-xs">
              <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="text-stone-550 font-semibold">초기 공급 패키지 비용</span>
                <span className="font-extrabold text-[#C5A059] text-xs md:text-sm font-sans shrink-0 bg-stone-100 px-2.5 py-0.5 rounded">
                  맞춤 특가 혜택 즉시 세팅 적용
                </span>
              </div>
              <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0 pt-1.5 border-t border-dashed border-stone-200">
                <span className="text-stone-550 font-semibold">월 솔루션 사용료</span>
                <span className="font-extrabold text-stone-900 text-sm">5만원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only Arrow buttons */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleScroll('left'); }}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center md:hidden shadow-lg active:scale-95 transition-all cursor-pointer"
          title="이전 카드"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleScroll('right'); }}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/80 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center md:hidden shadow-lg active:scale-95 transition-all cursor-pointer"
          title="다음 카드"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      </div>

      <HasteGuidebookModal
        isOpen={localGuideOpen}
        onClose={() => setLocalGuideOpen(false)}
      />
      <HasteBenefitModal
        isOpen={localBenefitOpen}
        onClose={() => setLocalBenefitOpen(false)}
      />
    </>
  );
};
