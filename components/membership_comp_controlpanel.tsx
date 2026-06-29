import React, { useState } from 'react';

// ================================================
// HasteControlPanel — 재사용 가능한 핵심 컴포넌트
// (membership_page_myinfo 에서 직접 정적 임포트 허용)
// ================================================
interface HasteControlPanelProps {
  user: any;
}

export const HasteControlPanel: React.FC<HasteControlPanelProps> = ({ user }) => {
  const [activeInfoTab, setActiveInfoTab] = useState<'RECIPE' | 'SERVER' | 'CONTROL'>('RECIPE');
  const uStoreCode = user.store_code || user.storeCode || '';
  const uStoreName = user.storeName || user.store_name || '헤이스트 카페 점포';

  return (
    <div className="flex flex-col gap-5">

      {/* Tab Selection */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="flex border-b border-stone-150 bg-stone-50/30 text-xs md:text-sm">
          <button
            type="button"
            onClick={() => setActiveInfoTab('RECIPE')}
            className={`flex-1 py-3 text-center font-bold border-r border-stone-150 transition-all cursor-pointer ${ activeInfoTab === 'RECIPE' ? 'bg-white text-stone-900 border-b-2 border-b-[#C5A059]' : 'text-stone-500 hover:bg-stone-50' }`}
          >
            레시피
          </button>
          <button
            type="button"
            onClick={() => setActiveInfoTab('SERVER')}
            className={`flex-1 py-3 text-center font-bold border-r border-stone-150 transition-all cursor-pointer ${ activeInfoTab === 'SERVER' ? 'bg-white text-stone-900 border-b-2 border-b-[#C5A059]' : 'text-stone-500 hover:bg-stone-50' }`}
          >
            매장서버정보
          </button>
          <button
            type="button"
            onClick={() => setActiveInfoTab('CONTROL')}
            className={`flex-1 py-3 text-center font-bold transition-all cursor-pointer ${ activeInfoTab === 'CONTROL' ? 'bg-white text-stone-900 border-b-2 border-b-[#C5A059]' : 'text-stone-500 hover:bg-stone-50' }`}
          >
            매장서버제어
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 min-h-[250px] bg-white text-xs md:text-sm text-stone-650 flex flex-col justify-between">
          {activeInfoTab === 'RECIPE' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-stone-100">
                  <strong className="text-stone-850 font-bold text-sm md:text-base">매장 운영 레시피 목록 (총 134종)</strong>
                  <div className="text-[10px] text-stone-400 font-mono">적용: v1.0.4 | 최종: v1.0.4</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-100 font-bold">
                        <th className="pb-2 w-1/4">메뉴코드</th>
                        <th className="pb-2 w-1/4">메뉴이름</th>
                        <th className="pb-2">물(ml)/얼음(g)/시럽 믹싱 설정</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 font-sans text-stone-750">
                      <tr className="hover:bg-stone-50/30"><td className="py-2.5">M-001</td><td className="py-2.5 font-sans font-bold text-stone-900">아메리카노</td><td className="py-2.5">물 180ml / 얼음 150g / 시럽 0ml <span className="text-[9px] text-stone-400 bg-stone-100 px-1 py-0.5 rounded font-sans">(표준)</span></td></tr>
                      <tr className="hover:bg-stone-50/30"><td className="py-2.5">M-002</td><td className="py-2.5 font-sans font-bold text-stone-900">카페라떼</td><td className="py-2.5">물 50ml / 얼음 150g / 시럽 10ml <span className="text-[9px] text-stone-400 bg-stone-100 px-1 py-0.5 rounded font-sans">(표준)</span></td></tr>
                      <tr className="hover:bg-stone-50/30"><td className="py-2.5">M-003</td><td className="py-2.5 font-sans font-bold text-stone-900">바닐라라떼</td><td className="py-2.5">물 40ml / 얼음 130g / 시럽 35ml <span className="text-[9px] text-[#C5A059] bg-[#C5A059]/10 px-1 py-0.5 rounded font-sans font-bold">(커스텀)</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-[#FAF9F6] border border-[#E0D7C8]/40 p-3 rounded-lg text-xs leading-relaxed text-stone-550 mt-2">
                💡 <strong>레시피 가이드</strong>: 헤이스트 표준 레시피를 기반으로 점주님의 매장 환경에 맞춰 조합 비율을 자율적으로 재정의하여 로컬 서버에 동기화할 수 있습니다.
              </div>
            </div>
          )}

          {activeInfoTab === 'SERVER' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-stone-100">
                  <strong className="text-stone-850 font-bold text-sm md:text-base">매장 로컬 서버 소프트웨어 정보</strong>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-sans">● 정상 가동중</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 flex flex-col gap-1">
                    <span className="text-stone-400 text-[10px] font-bold">운용 중인 서버 버전</span>
                    <strong className="text-stone-850 font-mono text-sm">v1.0.4-RELEASE</strong>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 flex flex-col gap-1">
                    <span className="text-stone-400 text-[10px] font-bold">현재 최상위 버전</span>
                    <strong className="text-[#C5A059] font-mono text-sm">v1.0.4 (최신 상태)</strong>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-stone-450 border-t border-stone-100 pt-3 flex justify-between font-mono">
                <span>최종 연결 수신: {new Date().toLocaleDateString()}</span>
                <span>자바 로컬 포트: 8085</span>
              </div>
            </div>
          )}

          {activeInfoTab === 'CONTROL' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-stone-100">
                  <strong className="text-stone-850 font-bold text-sm md:text-base">매장 기기 원격 하드웨어 제어</strong>
                  <span className="text-[10px] text-stone-400 font-bold">※ 원격 자바 서버 연동용</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (컵 배출 명령)')}
                    className="py-3 px-4 bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-770 font-bold rounded-2xl border border-stone-300 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                  >
                    컵 강제 배출
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (레시피 동기화)')}
                    className="py-3 px-4 bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-770 font-bold rounded-2xl border border-stone-300 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                  >
                    레시피 원격 동기화
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (음료 품절/잠금)')}
                    className="py-3 px-4 bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-770 font-bold rounded-2xl border border-stone-300 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                  >
                    키오스크 음료 잠금
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (결제 취소)')}
                    className="py-3 px-4 bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-770 font-bold rounded-2xl border border-stone-300 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                  >
                    원격 결제 즉시 취소
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 text-center leading-normal mb-1">
                ⚠️ 본 기능은 매장 내 로컬 자바 서버의 포트포워딩 및 외부 DDNS 접근 인가 후 활성화됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
