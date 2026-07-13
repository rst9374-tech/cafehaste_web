import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface MembershipCompSignUpSuccessProps {
  registeredId: number | null;
  storeName: string;
  storeCode: string;
  ownerName: string;
  businessNumber: string;
  content: string;
  onClose: () => void;
  onReset: () => void;
}

export const MembershipCompSignUpSuccess: React.FC<MembershipCompSignUpSuccessProps> = ({
  registeredId,
  storeName,
  storeCode,
  ownerName,
  businessNumber,
  content,
  onClose,
  onReset,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-6 text-center flex flex-col items-center gap-4 animate-fade-in"
    >
      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-bounce mb-1">
        <CheckCircle size={28} />
      </div>

      <div>
        <h4 className="font-serif text-lg font-bold text-stone-900">가입 등록 성공!</h4>
        <p className="text-stone-500 text-[11px] font-light mt-1.5 leading-relaxed">
          사장님의 소중한 가입 정보가 헤이스트 전산망에 안전하게 등록 완료되었습니다.
        </p>
      </div>

      <div className="w-full bg-white/50 rounded-2xl border border-stone-300 p-4.5 text-left font-sans text-xs text-stone-700 flex flex-col gap-2.5">
        <div className="flex justify-between border-b border-dashed border-stone-200 pb-2">
          <span className="text-stone-400">매장 코드:</span>
          <span className="font-mono font-bold text-stone-900">#{registeredId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">등록 매장명:</span>
          <span className="font-bold text-[#422B1E]">{storeName || '헤이스트 매장'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">매장 코드:</span>
          <span className="font-mono font-bold text-stone-900 text-stone-950 bg-stone-100 px-1.5 py-0.5 rounded">{storeCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">점주 성함:</span>
          <span className="font-bold text-stone-900">{ownerName} 사장님</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">사업자번호:</span>
          <span className="font-mono font-bold text-stone-900">{businessNumber}</span>
        </div>
        {content && (
          <div className="flex flex-col gap-1 border-t border-dashed border-stone-200/60 pt-2 text-stone-600">
            <span className="text-stone-400 text-[10.5px]">문의사항:</span>
            <p className="bg-white/60 border border-amber-900/10 rounded-xl p-2.5 text-[11px] leading-relaxed max-h-24 overflow-y-auto">{content}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 mt-4 w-full">
        <button
          onClick={onReset}
          className="flex-1 py-3 border border-stone-300 hover:bg-stone-50 text-stone-600 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
        >
          추가 계정 가입
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
        >
          닫기
        </button>
      </div>
    </motion.div>
  );
};
