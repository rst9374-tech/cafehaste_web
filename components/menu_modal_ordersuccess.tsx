import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Coffee, X } from 'lucide-react';

interface HasteOrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderInfo: {
    orderId: string;
    branchName: string;
    timestamp: string;
    total: number;
    itemCount: number;
  } | null;
}

export const HasteOrderSuccessModal: React.FC<HasteOrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderInfo,
}) => {
  if (!isOpen || !orderInfo) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl text-stone-900"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-850 transition-colors text-xs font-bold font-mono cursor-pointer"
        >
          ✕
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mt-2 mb-6 pb-5 border-b border-stone-100">
          <div className="w-14 h-14 rounded-full border border-[#C5A059]/30 flex items-center justify-center bg-amber-50 mb-3 text-[#C5A059]">
            <Coffee size={24} />
          </div>
          <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-3 py-1 rounded-full">
            PICKUP ORDER CONFIRMED
          </span>
          <h2 className="font-serif text-xl font-bold text-stone-900 mt-2.5">
            주문이 완료되었습니다!
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-light leading-relaxed">
            오더하신 각성 음료가 안전하게 등록되었습니다.
          </p>
        </div>

        {/* Ticket Details */}
        <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 flex flex-col gap-3 font-mono text-[11px] text-stone-800 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-stone-400 font-sans">픽업 매장</span>
            <span className="font-bold text-stone-900 font-sans">{orderInfo.branchName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-stone-400">주문 번호</span>
            <span className="font-extrabold text-[#D97706]">{orderInfo.orderId}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-stone-400">등록 시각</span>
            <span>{orderInfo.timestamp}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 font-sans">총 결제금액</span>
            <span className="text-sm font-bold text-stone-950">{orderInfo.total.toLocaleString()}₩</span>
          </div>
        </div>

        {/* Bottom instructions */}
        <div className="text-center text-[10.5px] text-stone-500 font-light leading-relaxed mb-6 px-2">
          선택하신 <span className="font-semibold text-stone-900 font-sans">{orderInfo.branchName}</span> 카운터에서 비대면 로봇 기기 혹은 바리스타가 음료 제조를 준비하고 있으며, 완료 시 휴대폰 번호 또는 주문번호 <span className="font-bold text-amber-700 font-mono">{orderInfo.orderId}</span>번으로 호출해 드립니다.
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] text-xs font-bold uppercase rounded-xl tracking-wider text-center cursor-pointer transition-colors"
        >
          확인하고 메뉴 계속 둘러보기
        </button>
      </motion.div>
    </div>
  );
};
