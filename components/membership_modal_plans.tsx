import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface HastePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (months: number) => void;
}

export const HastePlansModal: React.FC<HastePlansModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const plans = [
    {
      months: 1,
      title: '월 정기 구독 플랜',
      price: '55,000원',
      discount: '',
      desc: '매월 자동 결제되는 베이직 구독 플랜입니다. 1년 단위 자동 갱신 계약 약정을 따릅니다.',
      tag: '기본형',
      dotColor: 'bg-[#C5A059]'
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
                  <h3 className="haste-section-title-3 !text-white leading-tight">헤이스트 정기구독 플랜 확인</h3>
                </div>
              </div>
              <button onClick={onClose} className="text-stone-400 hover:text-white cursor-pointer transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[65vh]">
              <p className="haste-body-text-2 !text-stone-555 mt-1 leading-relaxed">
                매장 솔루션 기기 가동을 위한 정기구독 상품 정보입니다. 헤이스트 이용료는 부가세(VAT) 포함 금액이며, 매월 정기결제가 실행됩니다.
              </p>

              <div className="flex flex-col gap-3">
                {plans.map((p, i) => {
                  return (
                    <div
                      key={i}
                      className="text-left rounded-2xl p-5 border-2 bg-[#C5A059]/5 border-[#C5A059] flex flex-col gap-2 shadow-2xs relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${p.dotColor}`} />
                          <span className="haste-section-title-3 !text-[#C5A059] font-bold">
                            {p.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C5A059] text-white">
                          {p.tag}
                        </span>
                      </div>
                      <div className="font-mono text-lg font-black flex items-baseline gap-2 text-stone-950">
                        <span>{p.price}</span>
                        <span className="text-xs font-sans text-stone-550 font-medium">/ 월 (VAT 포함)</span>
                      </div>
                      <p className="haste-body-text-2 !font-light leading-relaxed !text-stone-700">
                        {p.desc}
                      </p>
                    </div>
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
                  onSelectPlan(1); // Force 1 month
                  onClose();
                }}
                className="px-5 py-2 bg-stone-950 hover:bg-stone-850 text-white font-extrabold text-xs tracking-wide rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
              >
                구독 결제 진행
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
