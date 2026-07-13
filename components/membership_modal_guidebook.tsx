import React from 'react';
import { Shield, BookOpen, Clock, CreditCard, CheckCircle2, ChevronRight, X, Info } from 'lucide-react';

interface HasteGuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HasteGuidebookModal: React.FC<HasteGuidebookModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-[#F4EADB] w-full max-w-2xl rounded-[30px] overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#15141D] border-b border-stone-800 py-4.5 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <BookOpen size={14} />
            </div>
            <div>
              <span className="haste-category-label-en mb-0.5">HASTE GUIDEBOOK</span>
              <h3 className="haste-section-title-3 !text-white leading-tight">멤버십 가입안내</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white transition-all rounded-lg cursor-pointer"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs text-stone-600 max-h-[750px]">
          
          <div className="text-center pb-2">
            <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">HQ USER GUIDEBOOK</span>
            <h4 className="text-stone-900 font-bold text-base">멤버십 가입 및 라이선스 활성화 안내</h4>
            <p className="text-stone-500 text-[10.5px] mt-1.5 leading-relaxed">스마트 매장 솔루션 및 로컬 서버 프로그램의 원활한 이용을 위한 단계별 지침서입니다.</p>
          </div>

          {/* Step Blocks */}
          <div className="flex flex-col gap-4">
            
            {/* Step 1 */}
            <div className="bg-[#FAF9F6]/60 border border-stone-150 rounded-2xl p-4 flex gap-3.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-[#C5A059] flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider block uppercase mb-1">STEP 01. SIGN UP & WAIT</span>
                <strong className="text-stone-800 font-bold text-[11.5px] block mb-1">멤버십 회원 가입 신청</strong>
                <p className="text-stone-600 leading-relaxed">점주 성함, 고유 매장 코드, 연락처, 사업자번호 등을 빠짐없이 입력하여 가입을 신청합니다. 신청 직후에는 헤이스트 심사 대기 상태인 <span className="font-bold text-amber-600">"인증 대기"</span> 상태가 유지됩니다.</p>
                <div className="mt-2.5 p-3 bg-stone-900/5 rounded-xl border border-[#C5A059]/10 text-[10px] leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                    <strong className="text-stone-800">멤버십 구분 안내:</strong>
                    <span className="text-stone-655 font-light">브랜드 상표 사용 여부에 따라 권리와 혜택 범위가 구분됩니다.</span>
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <div className="flex items-start gap-1.5 text-left">
                      <span className="text-[#C5A059] shrink-0 mt-0.5">•</span>
                      <span className="haste-badge-haste-membership text-[9px] px-1.5 py-0.5 rounded shrink-0">헤이스트 멤버십</span>
                      <span className="text-stone-800 font-medium flex-1">헤이스트 브랜딩 및 상표 라이선스(소모품 등)를 무상으로 사용하며, 간판(상표)을 설치하여 운영하는 형태입니다.</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-left">
                      <span className="text-[#C5A059] shrink-0 mt-0.5">•</span>
                      <span className="haste-badge-membership text-[9px] px-1.5 py-0.5 rounded shrink-0">멤버십</span>
                      <span className="text-stone-600 font-light flex-1">헤이스트 브랜드를 사용하지 않고, 매장 고유의 자체 브랜드로 독자 운영하는 형태입니다.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF9F6]/60 border border-stone-150 rounded-2xl p-4 flex gap-3.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-[#C5A059] flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider block uppercase mb-1">STEP 02. ONLINE AGREEMENT</span>
                <strong className="text-stone-800 font-bold text-[11.5px] block mb-1">약정 확인 및 서명 날인 (도장)</strong>
                <p className="text-stone-600 leading-relaxed">구독 결제 버튼 클릭 시 화면에 약정 모달이 팝업됩니다. 점주는 본문 약관을 끝까지 스크롤하여 필독한 후, 헤이스트 직인이 사전 날인된 영역 옆에 **본인의 서명(도장)**을 드로잉합니다.</p>
                <div className="mt-2 text-[10px] text-[#C5A059] bg-stone-900/5 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border border-[#C5A059]/10">
                  <Info size={11} className="shrink-0" />
                  <span>서명 완료 시 합성 완료된 양 날인 약정서가 점주 기기로 즉시 자동 다운로드됩니다.</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF9F6]/60 border border-stone-150 rounded-2xl p-4 flex gap-3.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-[#C5A059] flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider block uppercase mb-1">STEP 03. SECURE PAYMENT</span>
                <strong className="text-stone-800 font-bold text-[11.5px] block mb-1">신용카드 정기 구독 결제</strong>
                <p className="text-stone-600 leading-relaxed">서명이 정상 처리되면 포트원 카드 결제창이 팝업됩니다. 결제를 완수하면 백엔드 단에서 실제 지불 내역과 결제 금액 무결성을 2차 대조하는 안전 검증 과정을 수행합니다.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FAF9F6]/60 border border-stone-150 rounded-2xl p-4 flex gap-3.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-[#C5A059] flex items-center justify-center font-bold text-sm shrink-0">4</div>
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider block uppercase mb-1">STEP 04. ACTIVE LICENSE</span>
                <strong className="text-stone-800 font-bold text-[11.5px] block mb-1">인증 완료 및 로컬 서버 연동 개방</strong>
                <p className="text-stone-600 leading-relaxed">검증 완료 즉시 매장 상태가 <span className="font-bold text-[#C5A059]">"인증 완료"</span>로 전환되며 고유 솔루션 라이선스 키가 연장 발급됩니다. 이에 따라 매장 내 **커피머신 로컬서버 가동 시** 필요한 모든 스마트 연동 시스템 권한이 즉시 개방됩니다.</p>
              </div>
            </div>

          </div>

          {/* Regular Payment Info */}
          <div className="border border-stone-200 rounded-2xl p-4 flex flex-col gap-2.5 bg-stone-50">
            <span className="text-[#C5A059] font-black tracking-wide block uppercase text-[10.5px]">💡 정기 결제 및 보관 정책</span>
            <ul className="list-disc list-inside text-stone-600 space-y-1.5 pl-1">
              <li>**월 이용료**: 55,000원 (정가, VAT 포함) / 매월 정기 결제</li>
              <li className="text-stone-800 font-bold">※ 결제 완료 시 합성 보관된 약정서 사본은 마이페이지 등록 대장 하단에서 언제든지 다시 내려받으실 수 있습니다.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#FAF6EE] border-t border-stone-300/85 p-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="haste-primary-btn !py-2 !px-4.5 !text-xs w-full sm:w-auto cursor-pointer"
          >
            가입 안내 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
