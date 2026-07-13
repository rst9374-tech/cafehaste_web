import React from 'react';
import { Award } from 'lucide-react';

interface MembershipMetricsProps {
  ownerName: string;
}

export const MembershipFeePolicy: React.FC = () => {
  return (
    <div className="bg-[#FFFDF9] border border-[#C5A059]/30 rounded-2xl p-3 sm:p-4 shadow-sm">
      
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-stone-200">
          <span className="text-[9px] sm:text-[10px] text-stone-400 block font-bold">도입 가입비 (최초 1회)</span>
          <span className="text-base sm:text-xl font-bold font-serif text-stone-900 block mt-0.5 sm:mt-1 whitespace-nowrap">30만원</span>
          <span className="text-[8px] sm:text-[9px] text-[#C5A059] font-mono mt-0.5 block">커스텀 데이터 구축</span>
        </div>
        <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-stone-200">
          <span className="text-[9px] sm:text-[10px] text-stone-400 block font-bold">솔루션구독 (월정액)</span>
          <span className="text-base sm:text-xl font-bold font-serif text-[#C5A059] block mt-0.5 sm:mt-1 whitespace-nowrap">5만원</span>
          <span className="text-[8.5px] sm:text-[11px] text-stone-600 block mt-0.5 sm:mt-1.5 font-sans font-bold whitespace-nowrap">※ 연 360만원 절감</span>
        </div>
      </div>

      {/* Haste Masterplan Insights */}
      <div className="mt-2.5 sm:mt-4 pt-2.5 sm:pt-4 border-t border-stone-100 grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-[11px] leading-relaxed text-stone-600 font-sans">
        <div className="bg-stone-50 p-2 sm:p-3 rounded-lg border border-stone-200 text-left flex flex-col justify-between min-h-[90px] sm:min-h-fit">
          <span className="text-[9px] sm:text-[10px] text-stone-550 block font-bold">다점포 확장 특혜</span>
          <span className="text-sm sm:text-xl font-bold font-serif text-stone-900 block mt-0.5 sm:mt-1">50% 할인</span>
          <span className="text-[8px] sm:text-[9px] text-[#C5A059] font-mono mt-0.5 block font-bold">2호점 가입비 반값</span>
        </div>
        <div className="bg-[#FFFBF5] p-2 sm:p-3 rounded-lg border border-amber-200 text-left flex flex-col justify-between min-h-[90px] sm:min-h-fit">
          <span className="text-[9px] sm:text-[10px] text-stone-500 block font-bold">상표 라이선스 지원</span>
          <span className="text-sm sm:text-xl font-bold font-serif text-amber-700 block mt-0.5 sm:mt-1">기본 제공</span>
          <span className="text-[8px] sm:text-[9px] text-[#C5A059] font-mono mt-0.5 block font-bold">멤버십 유지 조건</span>
        </div>
      </div>
    </div>
  );
};

export const MembershipValueMetrics: React.FC = () => {
  return (
    <div id="haste-smart-value-metrics" className="border-t border-stone-200 pt-9 mt-4">
      <div className="flex flex-col gap-1 mb-6">
        <span className="text-[9.5px] font-mono font-black text-[#C5A059] tracking-widest block uppercase">core business value propositions</span>
        <h4 className="font-serif text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
          <Award size={18} className="text-[#C5A059]" />
          헤이스트 스마트 가치 핵심 지표
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className="bg-[#FFFDF9]/60 border border-stone-200 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/40 transition-all duration-300 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#C5A059]">
            <span className="text-[10px] font-mono font-black border border-[#C5A059]/25 px-1.5 py-0.5 rounded bg-[#C5A059]/5">METRIC 01</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-sans font-extrabold text-stone-850 text-sm">2026 자영업 위기 돌파</span>
          <p className="text-stone-600 text-xs leading-relaxed font-light font-sans">
            인건비 부담이 커지는 경영 환경 속에서도, 1인 고효율 비대면 공간 제어 시스템으로 안정적인 매장 운영과 실질적인 원가 절감을 도와드립니다.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFDF9]/60 border border-stone-200 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/40 transition-all duration-300 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#C5A059]">
            <span className="text-[10px] font-mono font-black border border-[#C5A059]/25 px-1.5 py-0.5 rounded bg-[#C5A059]/5">METRIC 02</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-sans font-extrabold text-stone-850 text-sm">로컬 PC 기반 독자 전산구동</span>
          <p className="text-stone-600 text-xs leading-relaxed font-light font-sans">
            헤이스트 메인 서버 장애 상태에서도 자체 로컬 시스템 로직을 가동하여, 헤이스트 서버가 복구될 때까지 오류 없이 독립 운용을 유지합니다. 매장 내 인터넷 회선 또는 기기 물리 고장의 경우는 해당되지 않습니다.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FFFDF9]/60 border border-stone-200 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/40 transition-all duration-300 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#C5A059]">
            <span className="text-[10px] font-mono font-black border border-[#C5A059]/25 px-1.5 py-0.5 rounded bg-[#C5A059]/5">METRIC 03</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-sans font-extrabold text-stone-850 text-sm">협력 공급망 및 구매력 연맹</span>
          <p className="text-stone-600 text-[11px] leading-relaxed font-light font-sans">
            헤이스트 협력업체 직거래 최저 납품 단가를 통해 원부자재를 보다 경제적으로 공급받으실 수 있으며, 점주 연합 공동구매 네트워크로 매장 운영 비용 절감을 지원합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
