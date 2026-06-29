import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface HastePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (months: number) => void;
}

export const HastePlansModal: React.FC<HastePlansModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const [selectedPlanMonths, setSelectedPlanMonths] = useState<number>(1); // Default select 1 month

  const plans = [
    {
      months: 1,
      title: '월 정기 구독 플랜',
      price: '55,000원',
      discount: '',
      desc: '매월 자동 결제되는 베이직 구독 플랜입니다. 별도의 가산 이용 일수는 지원되지 않습니다.',
      tag: '기본형',
      dotColor: 'bg-stone-400'
    },
    {
      months: 6,
      title: '6개월 정기구독 플랜',
      price: '313,500원',
      discount: '(16,500원 할인)',
      desc: '5% 할인 혜택이 즉시 적용된 실속형 플랜입니다. 정기구독 시 보너스로 +7일의 가산 이용 일수를 무상 제공합니다.',
      tag: '5% 할인 + 7일 보너스',
      dotColor: 'bg-[#C5A059]'
    },
    {
      months: 12,
      title: '12개월 정기구독 플랜',
      price: '594,000원',
      discount: '(66,000원 할인)',
      desc: '10% 최대 할인과 함께 장기 매장 경영에 최적화된 프리미엄 플랜입니다. +15일의 가산 이용 일수가 무상 지급됩니다.',
      tag: '10% 할인 + 15일 보너스',
      dotColor: 'bg-stone-900 border border-[#C5A059]/40'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative bg-[#FAF9F6] rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden font-sans z-50 flex flex-col"
          >
            <div className="bg-[#15141D] border-b border-stone-800 px-4 py-3 sm:px-6 sm:py-4.5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Info size={15} className="text-[#C5A059]" />
                <div>
                  <span className="haste-category-label-en mb-0.5">HASTE PLANS</span>
                  <h3 className="haste-section-title-3 !text-white leading-tight">헤이스트 정기구독 플랜 선택</h3>
                </div>
              </div>
              <button onClick={onClose} className="text-stone-400 hover:text-white cursor-pointer transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
              <p className="haste-body-text-2 !text-stone-550 mt-1 leading-relaxed">
                매장 가동을 위한 라이선스 구독 상품 정보입니다. 사용 환경에 맞는 적절한 상품을 선택해주십시오. 6개월 및 12개월 장기 구독 시 가산 할인율과 가산 이용 일수가 보너스로 지급됩니다.
              </p>

              <div className="flex flex-col gap-3">
                {plans.map((p, i) => {
                  const isSelected = p.months === selectedPlanMonths;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedPlanMonths(p.months)}
                      className={`text-left rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col gap-1.5 shadow-2xs group relative overflow-hidden active:scale-98 border-2 ${
                        isSelected 
                          ? 'bg-[#C5A059]/5 border-[#C5A059]' 
                          : 'bg-white hover:bg-stone-50 border-stone-200/80'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${p.dotColor}`} />
                          <span className={`haste-section-title-3 transition-colors ${
                            isSelected ? '!text-[#C5A059]' : '!text-stone-900'
                          }`}>
                            {p.title}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                          isSelected 
                            ? 'bg-[#C5A059] text-white' 
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {p.tag}
                        </span>
                      </div>
                      <div className={`font-mono text-base font-black flex items-baseline gap-2 transition-colors ${
                        isSelected ? 'text-[#C5A059]' : 'text-stone-950'
                      }`}>
                        <span>{p.price}</span>
                        {p.discount && (
                          <span className={`text-xs font-sans font-bold transition-colors ${
                            isSelected ? 'text-[#C5A059]/80' : 'text-stone-500'
                          }`}>{p.discount}</span>
                        )}
                      </div>
                      <p className={`haste-body-text-2 !font-light leading-relaxed transition-colors ${
                        isSelected ? '!text-stone-700' : '!text-stone-550'
                      }`}>{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer submit block matching HASTE spec */}
            <div className="p-4 bg-stone-50 border-t border-stone-150 flex justify-end gap-2 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-stone-500 hover:text-stone-850 text-xs font-bold transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onSelectPlan(selectedPlanMonths);
                  onClose();
                }}
                className="px-5 py-2 bg-stone-950 hover:bg-stone-850 text-white font-extrabold text-xs tracking-wide rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
              >
                선택 완료
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
