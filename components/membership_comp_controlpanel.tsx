import React, { useState } from 'react';
import { Upload, Download, CheckCircle, HelpCircle } from 'lucide-react';

// ================================================
// HasteControlPanel — 재사용 가능한 핵심 컴포넌트
// (membership_page_myinfo 에서 직접 정적 임포트 허용)
// ================================================
interface HasteControlPanelProps {
  user: any;
}

export const HasteControlPanel: React.FC<HasteControlPanelProps> = ({ user }) => {
  const [activeInfoTab, setActiveInfoTab] = useState<'RECIPE' | 'SERVER' | 'CONTROL' | 'KIOSK'>('RECIPE');
  const [isExcelUploaded, setIsExcelUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const uStoreCode = user.store_code || user.storeCode || '';
  const uStoreName = user.storeName || user.store_name || '헤이스트 카페 점포';

  const handleExcelUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsExcelUploaded(true);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-stone-250">

      {/* Tab Selection */}
      <div className="bg-[#111015] border border-stone-850 rounded-2xl overflow-hidden shadow-md flex flex-col">
        <div className="flex border-b border-stone-850 bg-stone-900/30 text-xs md:text-sm">
          <button
            type="button"
            onClick={() => setActiveInfoTab('RECIPE')}
            className={`flex-1 py-3.5 text-center font-bold border-r border-stone-850 transition-all cursor-pointer ${ activeInfoTab === 'RECIPE' ? 'bg-[#18171E] text-[#C5A059] border-b-2 border-b-[#C5A059]' : 'text-stone-400 hover:bg-[#16151A] hover:text-stone-200' }`}
          >
            레시피
          </button>
          <button
            type="button"
            onClick={() => setActiveInfoTab('SERVER')}
            className={`flex-1 py-3.5 text-center font-bold border-r border-stone-850 transition-all cursor-pointer ${ activeInfoTab === 'SERVER' ? 'bg-[#18171E] text-[#C5A059] border-b-2 border-b-[#C5A059]' : 'text-stone-400 hover:bg-[#16151A] hover:text-stone-200' }`}
          >
            매장서버정보
          </button>
          <button
            type="button"
            onClick={() => setActiveInfoTab('CONTROL')}
            className={`flex-1 py-3.5 text-center font-bold border-r border-stone-850 transition-all cursor-pointer ${ activeInfoTab === 'CONTROL' ? 'bg-[#18171E] text-[#C5A059] border-b-2 border-b-[#C5A059]' : 'text-stone-400 hover:bg-[#16151A] hover:text-stone-200' }`}
          >
            매장서버제어
          </button>
          <button
            type="button"
            onClick={() => setActiveInfoTab('KIOSK')}
            className={`flex-1 py-3.5 text-center font-bold transition-all cursor-pointer ${ activeInfoTab === 'KIOSK' ? 'bg-[#18171E] text-[#C5A059] border-b-2 border-b-[#C5A059]' : 'text-stone-400 hover:bg-[#16151A] hover:text-stone-200' }`}
          >
            키오스크연동
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 min-h-[280px] bg-[#18171E] text-xs md:text-sm text-stone-300 flex flex-col justify-between">
          
          {/* 1. RECIPE TAB */}
          {activeInfoTab === 'RECIPE' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-stone-800">
                  <strong className="text-stone-100 font-bold text-sm md:text-base">매장 운영 레시피 목록 (총 134종)</strong>
                  <div className="text-[10px] text-stone-500 font-mono">적용: v1.0.4 | 최종: v1.0.4</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="text-stone-500 border-b border-stone-800 font-bold">
                        <th className="pb-2 w-1/4">메뉴코드</th>
                        <th className="pb-2 w-1/4">메뉴이름</th>
                        <th className="pb-2">물(ml)/얼음(g)/시럽 믹싱 설정</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850 font-sans text-stone-300">
                      <tr className="hover:bg-stone-900/30"><td className="py-2.5">M-001</td><td className="py-2.5 font-sans font-bold text-stone-100">아메리카노</td><td className="py-2.5">물 180ml / 얼음 150g / 시럽 0ml <span className="text-[9px] text-stone-400 bg-stone-900 px-1 py-0.5 rounded font-sans">(표준)</span></td></tr>
                      <tr className="hover:bg-stone-900/30"><td className="py-2.5">M-002</td><td className="py-2.5 font-sans font-bold text-stone-100">카페라떼</td><td className="py-2.5">물 50ml / 얼음 150g / 시럽 10ml <span className="text-[9px] text-stone-400 bg-stone-900 px-1 py-0.5 rounded font-sans">(표준)</span></td></tr>
                      <tr className="hover:bg-stone-900/30"><td className="py-2.5">M-003</td><td className="py-2.5 font-sans font-bold text-stone-100">바닐라라떼</td><td className="py-2.5">물 40ml / 얼음 130g / 시럽 35ml <span className="text-[9px] text-[#C5A059] bg-[#C5A059]/10 px-1 py-0.5 rounded font-sans font-bold">(커스텀)</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-[#1F1D24] border border-stone-800 p-3 rounded-lg text-xs leading-relaxed text-stone-400 mt-2">
                💡 <strong>레시피 가이드</strong>: 헤이스트 표준 레시피를 기반으로 점주님의 매장 환경에 맞춰 조합 비율을 자율적으로 재정의하여 로컬 서버에 동기화할 수 있습니다.
              </div>
            </div>
          )}

          {/* 2. SERVER TAB */}
          {activeInfoTab === 'SERVER' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-stone-800">
                  <strong className="text-stone-100 font-bold text-sm md:text-base">매장 로컬 서버 소프트웨어 정보</strong>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-sans border border-emerald-500/20">● 정상 가동중</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 flex flex-col gap-1">
                    <span className="text-stone-500 text-[10px] font-bold">운용 중인 서버 버전</span>
                    <strong className="text-stone-200 font-mono text-sm">v1.0.4-RELEASE</strong>
                  </div>
                  <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 flex flex-col gap-1">
                    <span className="text-stone-500 text-[10px] font-bold">현재 최상위 버전</span>
                    <strong className="text-[#C5A059] font-mono text-sm">v1.0.4 (최신 상태)</strong>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-stone-500 border-t border-stone-850 pt-3 flex justify-between font-mono">
                <span>최종 연결 수신: {new Date().toLocaleDateString()}</span>
                <span>자바 로컬 포트: 8080</span>
              </div>
            </div>
          )}

          {/* 3. CONTROL TAB */}
          {activeInfoTab === 'CONTROL' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-stone-800">
                  <strong className="text-stone-100 font-bold text-sm md:text-base">매장 기기 원격 하드웨어 제어</strong>
                  <span className="text-[10px] text-stone-500 font-bold">※ 원격 자바 서버 연동용</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (컵 배출 명령)')}
                    className="py-3 px-4 bg-stone-900/80 hover:bg-stone-800 text-[#C5A059] hover:text-white font-bold rounded-2xl border border-stone-800 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    컵 강제 배출
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (레시피 동기화)')}
                    className="py-3 px-4 bg-stone-900/80 hover:bg-stone-800 text-[#C5A059] hover:text-white font-bold rounded-2xl border border-stone-800 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    레시피 원격 동기화
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (음료 품절/잠금)')}
                    className="py-3 px-4 bg-stone-900/80 hover:bg-stone-800 text-[#C5A059] hover:text-white font-bold rounded-2xl border border-stone-800 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    키오스크 음료 잠금
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('원격 자바 로컬서버 연동 모듈 준비 중입니다. (결제 취소)')}
                    className="py-3 px-4 bg-stone-900/80 hover:bg-stone-800 text-[#C5A059] hover:text-white font-bold rounded-2xl border border-stone-800 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    원격 결제 즉시 취소
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-stone-500 text-center leading-normal mb-1">
                ⚠️ 본 기능은 매장 내 로컬 자바 서버의 포트포워딩 및 외부 DDNS 접근 인가 후 활성화됩니다.
              </p>
            </div>
          )}

          {/* 4. KIOSK TAB (TOSS SYNC) */}
          {activeInfoTab === 'KIOSK' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
              <div>
                <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-stone-800">
                  <strong className="text-stone-100 font-bold text-sm md:text-base">토스 키오스크 이미지 일괄 동기화</strong>
                  <div className="text-[10px] text-[#C5A059] font-bold font-mono">TOSS PLACE SYNC</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-2.5 items-stretch">
                  
                  {/* Uploader Left */}
                  <div className="md:col-span-7 flex flex-col gap-3">
                    <div className="text-xs text-stone-400 leading-relaxed space-y-1 bg-stone-900/30 p-3.5 rounded-xl border border-stone-850">
                      <span className="font-bold text-[#C5A059] block mb-1">💡 연동 안내</span>
                      <p>1. 토스 포스 웹 어드민에서 다운로드받은 <strong className="text-white">상품목록.xlsx</strong> 파일을 아래에 업로드합니다.</p>
                      <p>2. 홈페이지의 표준 이미지들과 상품코드를 자동으로 매핑하여 ZIP 압축파일을 빌드해 드립니다.</p>
                      <p>3. 다운로드받은 ZIP 파일을 다시 토스 어드민의 이미지 일괄 업로드 창에 등록하시면 끝납니다.</p>
                    </div>

                    {/* Drag & Drop area */}
                    <label className="border-2 border-dashed border-[#C5A059]/30 hover:border-[#C5A059]/60 bg-stone-900/40 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group">
                      <input 
                        type="file" 
                        accept=".xlsx" 
                        onChange={handleExcelUploadSimulate} 
                        className="hidden" 
                      />
                      <Upload className="text-stone-400 group-hover:text-[#C5A059] transition-colors" size={24} />
                      <span className="text-xs font-bold text-stone-200">
                        {uploadedFileName || '토스 상품목록.xlsx 파일 선택'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        클릭하여 파일을 선택하거나 이곳에 드래그해 놓으세요
                      </span>
                    </label>
                  </div>

                  {/* Downloader Right */}
                  <div className="md:col-span-5 bg-stone-900/50 border border-stone-850 p-4 rounded-2xl flex flex-col justify-between items-center text-center">
                    <div className="space-y-1.5 my-auto">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">STATUS</span>
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="w-5 h-5 rounded-full border border-stone-700 border-t-[#C5A059] animate-spin" />
                          <span className="text-xs text-stone-400 font-bold">엑셀 구조 분석 중...</span>
                        </div>
                      ) : isExcelUploaded ? (
                        <div className="space-y-1 py-1">
                          <CheckCircle className="text-emerald-500 mx-auto" size={28} />
                          <span className="text-xs text-stone-200 font-bold block">코드 분석 완료!</span>
                          <span className="text-[10.5px] text-stone-450 block">134개 메뉴 이미지 매핑 성공</span>
                        </div>
                      ) : (
                        <div className="py-2">
                          <HelpCircle className="text-stone-600 mx-auto" size={28} />
                          <span className="text-xs text-stone-450 font-medium block mt-1">파일 업로드 대기 중</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!isExcelUploaded}
                      onClick={() => alert('toss_kiosk_images.zip 다운로드를 시작합니다.')}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isExcelUploaded 
                          ? 'bg-[#C5A059] hover:bg-[#b08e4d] text-stone-950 font-extrabold cursor-pointer' 
                          : 'bg-stone-800 text-stone-500 border border-stone-850 cursor-not-allowed'
                      }`}
                    >
                      <Download size={13} />
                      <span>이미지 압축파일 다운로드</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
