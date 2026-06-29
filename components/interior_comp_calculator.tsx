import React from 'react';
import { Calculator, ArrowRight, Info } from 'lucide-react';

interface InteriorCompCalculatorProps {
  estimatedSize: number;
  setEstimatedSize: (val: number) => void;
  machineCondition: 'NEW' | 'USED' | 'OFF';
  setMachineCondition: (val: 'NEW' | 'USED' | 'OFF') => void;
  costEstimate: {
    hardware: number;
    interior: number;
    carpentry: number;
    signage: number;
    materials: number;
    total: number;
  };
  onNavigateToInquiry: () => void;
  isAdmin?: boolean;
  prices?: {
    machineUsed: number;
    machineNew: number;
    interiorPyeong: number;
    carpentryPyeong: number;
    signage: number;
    materials: number;
    defaultMachineCondition?: string;
  };
  onUpdatePrice?: (key: string, value: any) => void;
}

const getPyeongFromSlider = (val: number): number => {
  const steps = [5, 10, 20, 40, 100];
  const lowerIndex = Math.floor(val);
  const upperIndex = Math.ceil(val);
  if (lowerIndex === upperIndex) return steps[lowerIndex];
  const ratio = val - lowerIndex;
  return Math.round(steps[lowerIndex] + ratio * (steps[upperIndex] - steps[lowerIndex]));
};

const getSliderFromPyeong = (pyeong: number): number => {
  const steps = [5, 10, 20, 40, 100];
  if (pyeong <= steps[0]) return 0;
  if (pyeong >= steps[steps.length - 1]) return steps.length - 1;
  
  for (let i = 0; i < steps.length - 1; i++) {
    const s1 = steps[i];
    const s2 = steps[i + 1];
    if (pyeong >= s1 && pyeong <= s2) {
      const ratio = (pyeong - s1) / (s2 - s1);
      return i + ratio;
    }
  }
  return 0;
};

export const InteriorCompCalculator: React.FC<InteriorCompCalculatorProps> = ({
  estimatedSize,
  setEstimatedSize,
  machineCondition,
  setMachineCondition,
  costEstimate,
  onNavigateToInquiry,
  isAdmin = false,
  prices = {
    machineUsed: 1500,
    machineNew: 3500,
    interiorPyeong: 200,
    carpentryPyeong: 50,
    signage: 300,
    materials: 150,
    defaultMachineCondition: 'NEW',
  },
  onUpdatePrice
}) => {
  return (
    <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#C5A059]/25 p-5 md:p-8 relative z-10 text-left shadow-inner font-sans mt-8">
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#C5A059]/15">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#C5A059]/10 text-[#C5A059] rounded-lg">
            <Calculator size={14} />
          </div>
          <div>
            <h4 className="font-serif text-[15px] font-bold text-stone-900 leading-tight">
              실시간 인테리어 견적 계산기
            </h4>
            <p className="text-[10px] text-stone-400 font-sans font-light mt-0.5">
              매장 평수에 따른 자동 목공 및 시공 견적 산정
            </p>
          </div>
        </div>
        <div className="bg-white border border-[#C5A059]/20 font-serif px-3 py-1.5 rounded-xl text-stone-950 font-bold text-sm">
          평수: <strong className="text-[#C5A059] font-mono font-black text-base">{estimatedSize}</strong>평
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="mb-6 bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 relative z-20 text-left font-sans select-none">
          <div className="flex items-center justify-between border-b border-amber-200/50 pb-2 mb-3">
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              인테리어 견적 단가 실시간 조정 (관리자)
            </span>
            <button 
              type="button" 
              onClick={() => {
                if (window.confirm("가격을 기본값으로 모두 초기화하시겠습니까?")) {
                  onUpdatePrice?.('RESET', 0);
                }
              }}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-850 hover:underline cursor-pointer"
            >
              기본값 복원
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[9.5px] text-stone-500 font-bold mb-1">머신 중고가 (만원)</label>
              <input 
                type="number"
                value={prices.machineUsed}
                onChange={(e) => onUpdatePrice?.('machineUsed', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[9.5px] text-stone-500 font-bold mb-1">머신 신품가 (만원)</label>
              <input 
                type="number"
                value={prices.machineNew}
                onChange={(e) => onUpdatePrice?.('machineNew', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[9.5px] text-stone-500 font-bold mb-1">실내 공사 평단가 (만원)</label>
              <input 
                type="number"
                value={prices.interiorPyeong}
                onChange={(e) => onUpdatePrice?.('interiorPyeong', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[9.5px] text-stone-500 font-bold mb-1">원목 가구 평단가 (만원)</label>
              <input 
                type="number"
                value={prices.carpentryPyeong}
                onChange={(e) => onUpdatePrice?.('carpentryPyeong', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[9.5px] text-stone-500 font-bold mb-1">외부 캐노피/간판 (만원)</label>
              <input 
                type="number"
                value={prices.signage}
                onChange={(e) => onUpdatePrice?.('signage', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[9.5px] text-stone-500 font-bold mb-1">초도원자재소모품 (만원)</label>
              <input 
                type="number"
                value={prices.materials}
                onChange={(e) => onUpdatePrice?.('materials', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[9.5px] text-stone-500 font-bold mb-1">기본 장비 옵션 (디폴트)</label>
              <select 
                value={prices.defaultMachineCondition || 'NEW'}
                onChange={(e) => onUpdatePrice?.('defaultMachineCondition', e.target.value)}
                className="w-full text-xs font-sans font-bold px-2.5 py-1.5 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                <option value="USED">중고</option>
                <option value="NEW">신품</option>
                <option value="OFF">렌탈 및 제외</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Slider bar */}
      <div className="mb-6 px-1">
        <div className="flex justify-between font-mono text-[9px] text-[#C5A059] font-bold mb-1.5 px-0.5">
          <span className="w-16 text-left">최소 5평</span>
          <span className="text-center">10평 (표준)</span>
          <span className="text-center">20평</span>
          <span className="text-center">40평</span>
          <span className="w-16 text-right">최대 100평</span>
        </div>
        
        <div className="relative pt-1 pb-4">
          <div className="absolute inset-x-0 top-3.5 flex justify-between px-0.5 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-[1.5px] h-3 bg-[#C5A059]/40" />
              </div>
            ))}
          </div>

          <input 
            type="range" 
            min="0" 
            max="4" 
            step="0.01" 
            value={getSliderFromPyeong(estimatedSize)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setEstimatedSize(getPyeongFromSlider(val));
            }}
            className="w-full accent-[#C5A059] cursor-pointer h-1.5 bg-stone-200 rounded-lg outline-none relative z-10"
          />
        </div>
      </div>

      {/* Machine choice selector */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/55 border border-[#C5A059]/15 p-3.5 rounded-2xl">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider block uppercase mb-0.5">
            MACHINE OPTION
          </span>
          <h5 className="font-sans text-xs font-semibold text-stone-850">
            자동화 커피머신(릴리) 상태 선택
          </h5>
        </div>
        <div className="flex bg-stone-200/65 p-0.5 rounded-xl text-[11px] font-bold border border-stone-300/40 shrink-0">
          <button
            type="button"
            onClick={() => setMachineCondition('USED')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none font-sans ${machineCondition === 'USED' ? 'bg-[#C5A059] text-stone-950 font-black shadow-sm' : 'text-stone-600 hover:text-stone-950'}`}
          >
            중고 ({prices.machineUsed.toLocaleString()}만)
          </button>
          <button
            type="button"
            onClick={() => setMachineCondition('NEW')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none font-sans ${machineCondition === 'NEW' ? 'bg-[#C5A059] text-stone-950 font-black shadow-sm' : 'text-stone-600 hover:text-stone-950'}`}
          >
            신품 ({prices.machineNew.toLocaleString()}만)
          </button>
          <button
            type="button"
            onClick={() => setMachineCondition('OFF')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none font-sans ${machineCondition === 'OFF' ? 'bg-[#C5A059] text-stone-950 font-black shadow-sm' : 'text-stone-600 hover:text-stone-950'}`}
          >
            렌탈 및 제외
          </button>
        </div>
      </div>

      {/* Calculation Table */}
      <div className="flex flex-col gap-2.5 font-sans text-xs border-b border-[#C5A059]/10 pb-5 mb-5 select-none font-light">
        <div className={`flex justify-between items-center ${machineCondition === 'OFF' ? 'text-stone-400 italic font-medium' : 'text-stone-600'}`}>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${machineCondition === 'OFF' ? 'bg-stone-200' : 'bg-stone-300'}`} />
            스마트 커피머신 (릴리 - {machineCondition === 'USED' ? '중고' : machineCondition === 'NEW' ? '신품' : '제외'})
          </span>
          <strong className="font-mono text-stone-800 font-bold shrink-0 ml-2">
            {machineCondition === 'OFF' ? '렌탈 및 제외 (0)' : machineCondition === 'USED' ? prices.machineUsed.toLocaleString() : prices.machineNew.toLocaleString()} 만원
          </strong>
        </div>
        <div className="flex justify-between items-center text-stone-600">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            실내 인테리어 공사 ({estimatedSize}평)
          </span>
          <strong className="font-mono text-stone-800 font-bold shrink-0 ml-2">
            {costEstimate.interior.toLocaleString()} 만원
          </strong>
        </div>
        <div className="flex justify-between items-center text-stone-600">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            원목 가구 및 스타일링 ({estimatedSize}평)
          </span>
          <strong className="font-mono text-stone-800 font-bold shrink-0 ml-2">
            {costEstimate.carpentry.toLocaleString()} 만원
          </strong>
        </div>
        <div className="flex justify-between items-center text-stone-600">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            외부 캐노피 및 전면 간판
          </span>
          <strong className="font-mono text-stone-800 font-bold shrink-0 ml-2">
            {costEstimate.signage.toLocaleString()} 만원
          </strong>
        </div>
        <div className="flex justify-between items-center text-stone-600">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            원부재료 초도 패키지
          </span>
          <strong className="font-mono text-stone-800 font-bold shrink-0 ml-2">
            {costEstimate.materials.toLocaleString()} 만원
          </strong>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider block uppercase mb-0.5">
            ESTIMATED TOTAL BUDGET
          </span>
          <p className="font-serif text-xl md:text-2xl font-bold text-stone-900 leading-none">
            예상 개설 비용 약 <strong className="text-[#C5A059] font-mono font-black text-2xl md:text-3xl ml-1">
              {costEstimate.total.toLocaleString()}
            </strong> 만원
          </p>
        </div>
        
        <button
          type="button"
          onClick={onNavigateToInquiry}
          className="haste-dark-btn flex items-center justify-center gap-1.5 shrink-0 mt-1 sm:mt-0 !py-2.5"
        >
          <span>창업문의</span>
          <ArrowRight size={12} />
        </button>
      </div>

  <div className="mt-6 flex items-start gap-2.5 text-stone-400 font-sans text-[11px] font-light leading-relaxed pl-1 border-t border-[#C5A059]/10 pt-4">
    <Info size={13} className="shrink-0 text-stone-300 pointer-events-none mt-0.5" />
    <p>
      산정된 비용은 수도 배관 공사 여부나 전기 증설 등 현장 상황에 따라 변동될 수 있습니다. 헤이스트는 별도의 지정 업체 계약 의무가 없으므로, 원하시는 디자인 및 개인 인테리어 업체를 통해 직접 시공하셔도 전산 유지보수를 동일하게 보장합니다.
    </p>
  </div>
    </div>
  );
};
