import React from 'react';
import { X, RefreshCw, Laptop, FileText, Code } from 'lucide-react';

interface RecipeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeGuideModal: React.FC<RecipeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto select-none">
      <div className="bg-white border border-stone-200 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-6 max-h-[95vh] animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#FAF9F6] border-b border-stone-150 py-4.5 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-stone-900">
            <RefreshCw className="text-[#C5A059]" size={22} />
            <h3 className="font-bold text-base tracking-tight font-serif">레시피 통합 변환 규격서 (v4.1.0)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-750 transition-all rounded-lg cursor-pointer"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs md:text-sm text-stone-650 max-h-[600px] text-left">
          
          <div className="text-center pb-2 border-b border-stone-100">
            <span className="text-xs font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">RECIPE CONVERTER & SPEC</span>
            <h4 className="text-stone-900 font-bold text-lg font-serif">Toss POS & 커피머신 레시피 통합 변환 규격서</h4>
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">토스 키오스크/POS와 커피머신 로컬 제어 프로그램 간의 레시피 연동 및 변환 프로그램 사용 방법 가이드입니다.</p>
          </div>

          <div className="flex flex-col gap-6 font-sans text-stone-700">
            
            {/* 1. Overview */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Laptop size={14} className="text-[#C5A059]" /> 1. 연동 코드 규격 (8자리 고정 길이)</h5>
              <p className="text-stone-550 mb-3 text-xs leading-relaxed">
                모든 상품 코드의 고유성 확보 및 100% 알고리즘 기반 자동 치환을 위해 **8자리 고정 길이** 표준 코드를 사용합니다.
              </p>
              <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl text-stone-600 space-y-3 leading-relaxed text-xs">
                <div>
                  <strong className="text-stone-900 block mb-1">☕ 1.1. 음료 품목 (Beverages)</strong>
                  <div className="font-mono bg-white px-2.5 py-1.5 rounded border mb-1.5 text-stone-850">
                    코드 구조 = [Size (1자)] + [Base (1자)] + [Category (1자)] + [Recipe ID (5자)]
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-500">
                    <li><strong>Size</strong> : <code className="font-mono">M</code>(미니벤티), <code className="font-mono">G</code>(그란데), <code className="font-mono">V</code>(벤티)</li>
                    <li><strong>Base</strong> : <code className="font-mono">S</code>(스탠다드 원두), <code className="font-mono">P</code>(프리미엄 원두), <code className="font-mono">D</code>(디카페인), <code className="font-mono">M</code>(논커피 우유), <code className="font-mono">T</code>(물/티), <code className="font-mono">A</code>(탄산)</li>
                    <li><strong>Category</strong> : <code className="font-mono">0</code>(매장 주문용), <code className="font-mono">7</code>(배달 주문용)</li>
                    <li>예시: <code className="font-mono text-emerald-600 font-bold">GS000101</code> (HOT 그란데 아메리카노 매장용)</li>
                  </ul>
                </div>
                
                <div className="border-t border-stone-200 pt-2.5">
                  <strong className="text-stone-900 block mb-1">🍰 1.2. 디저트 및 상품 품목 (Desserts & Goods)</strong>
                  <p className="text-stone-500 mb-1">첫 글자만 `X`로 치환하고 나머지 7자리 숫자를 그대로 유지합니다.</p>
                  <ul className="list-disc pl-4 text-stone-500">
                    <li>예시: <code className="font-mono">E9000004</code> (마카롱) ➔ <code className="font-mono text-stone-700 bg-white px-1 py-0.2 rounded border">X9000004</code></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Program usage */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><FileText size={14} className="text-[#C5A059]" /> 2. 레시피 변환 프로그램 (<code className="font-mono text-[11px] text-[#C5A059] font-bold">recipe_converter.exe</code>) 사용법</h5>
              <p className="text-stone-550 mb-3 text-xs leading-relaxed">
                김포운양역점 등 개별 매장의 원본 레시피 엑셀 파일을 로드하여 신규 v4 연동코드로 일괄 변환 및 기준 매장 레시피 정보와 대조 검증을 수행합니다.
              </p>
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2 text-xs leading-relaxed text-stone-600">
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li><strong>프로그램 실행</strong> : <code className="bg-white px-1.5 py-0.5 rounded font-mono border">recipe_converter.exe</code> 파일을 실행합니다.</li>
                  <li><strong>파일 선택</strong> :
                    <ul className="list-disc pl-5 space-y-1 text-stone-500 mt-1">
                      <li><strong>기준 파일</strong>: 운정파크드림점 기준 레시피 정보 엑셀 파일 로드</li>
                      <li><strong>변환 대상 파일</strong>: 변환하고자 하는 신규 지점의 레시피 엑셀 파일 로드</li>
                      <li><strong>표준 코드 매핑 파일</strong>: <code className="font-mono">Integrated_Recipe_Standard_Map_v4_1.xlsx</code>를 자동 또는 수동 지정</li>
                    </ul>
                  </li>
                  <li><strong>변환 실행</strong> : <strong>[레시피 변환 시작]</strong> 버튼을 누릅니다.</li>
                  <li><strong>결과 확인</strong> : 변환 완료 시 **[결과 폴더 열기]**를 눌러 생성된 표준 연동 엑셀 파일을 획득합니다.</li>
                </ol>
              </div>
            </div>

            {/* 3. History */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Code size={14} className="text-[#C5A059]" /> 3. 레시피 변환기 최신 업데이트 이력</h5>
              <div className="space-y-2">
                <div className="bg-stone-50 p-3.5 border border-stone-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-stone-900 font-bold">v4.1.0 (최신)</span>
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">RELEASED</span>
                  </div>
                  <ul className="list-disc pl-4 text-xs text-stone-500 mt-1.5 space-y-1">
                    <li>에이드(Ade) 계열 상품의 표준 Base 코드를 `A`로 확정 적용하여 기존의 `C` 코드 오분류 수정 완료</li>
                    <li>표준 엑셀 매핑 템플릿 파일명을 영문명(<code className="font-mono text-[10.5px]">Integrated_Recipe_Standard_Map_v4_1.xlsx</code>)으로 변경하여 배포 인코딩 예방</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-150 p-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold rounded-xl text-sm transition-all active:scale-97 cursor-pointer"
          >
            규격서 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
