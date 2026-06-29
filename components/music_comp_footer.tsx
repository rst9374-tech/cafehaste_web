import React, { useState, Suspense } from 'react';
import { Mail } from 'lucide-react';
import { HasteSymbol, HasteWordmark } from './home_comp_logo';

const HasteTermsModal = React.lazy(() => import('./membership_modal_terms').then(m => ({ default: m.HasteTermsModal })));

export const MusicFooter: React.FC = () => {
  const [footerDocType, setFooterDocType] = useState<'TERMS' | 'PRIVACY' | 'EMAIL' | null>(null);

  return (
    <>
      {/* Super compact and wide brand footer */}
      <footer className="bg-[#15141D] text-stone-300 mt-6 border-t border-[#C5A059]/25 pt-6 pb-[96px] px-6 font-sans text-left">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-start gap-6">
          
          <div className="flex flex-col gap-2 max-w-sm">
            <div className="flex items-center gap-2">
              <HasteSymbol size={28} color="#C5A059" glow={true} className="filter drop-shadow-[0_0_6px_rgba(197,160,89,0.4)]" />
              <div className="flex items-center gap-1">
                <HasteWordmark light={true} />
                <span className="font-sans font-[200] tracking-[0.1em] italic text-[#C5A059] drop-shadow-[0_0_6px_rgba(197,160,89,0.4)] text-lg md:text-xl">
                  Playlist
                </span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed font-light">
              HASTE VIBE는 헤이스트 파트너 가맹 매장의 감성적인 공간 분위기를 완성하기 위해 기획된 특화 오디오 플랫폼입니다. 매장 내 스피커 및 커피머신 로컬서버 가동 분위기를 지원합니다.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-stone-400 text-[10.5px] tracking-wide leading-relaxed md:text-right md:items-end">
            <span>상호: 헤이스트 (HASTE Co., Ltd.) | 대표: 김성규 | 사업자: 658-61-00630</span>
            <span>소재지: 경기도 김포시 김포한강11로 | 대표번호: 1588-xxxx</span>
            <a 
              href="mailto:cafehaste@gmail.com" 
              className="inline-flex items-center gap-1 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Mail className="w-3 h-3 text-white mr-1" /> 
              이메일: cafehaste@gmail.com
            </a>
          </div>

        </div>

        <div className="container mx-auto max-w-6xl mt-6 pt-4 border-t border-stone-800/60 flex flex-col sm:flex-row justify-between items-center text-[9px] text-stone-400 font-mono tracking-wider gap-3">
          <span className="font-mono tracking-wider">© 2026 HASTE CO., LTD. ALL RIGHTS RESERVED.</span>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <a 
                href="https://pf.kakao.com" 
                target="_blank" 
                rel="noopener noreferrer"
                title="카카오톡 채널 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <rect width="24" height="24" rx="6" fill="#FEE500"/>
                  <path fill="#3C1E1E" d="M12 6c-3.87 0-7 2.43-7 5.43 0 1.95 1.3 3.66 3.27 4.54l-.83 3.03c-.05.17.14.32.3.22l3.58-2.38c.23.03.47.05.7.05 3.87 0 7-2.43 7-5.43S15.87 6 12 6z"/>
                </svg>
              </a>
              <a 
                href="https://cafe.naver.com" 
                target="_blank" 
                rel="noopener noreferrer"
                title="네이버 카페 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <rect width="24" height="24" rx="6" fill="#03C75A"/>
                  <path fill="white" d="M6 9h10v4c0 2.2-1.8 4-4 4H10c-2.2 0-4-1.8-4-4V9zm11 1.5c1.1 0 2 .9 2 2s-.9 2-2 2v-4z" />
                  <path fill="#FFE600" d="M13 5c-.5-.7-1.5-1-2.5-.5S9.3 6 9.5 7c.2.8.8 1.2 1.5 1.2h2c.8 0 1.5-.5 1.8-1.2.3-.8 0-1.6-.8-2z" />
                </svg>
              </a>
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                title="인스타그램 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <div className="w-4 h-4 flex items-center justify-center rounded-[5px] bg-[#E1306C] text-white">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845a1.44 1.44 0 100-2.881 1.44 1.44 0 000 2.881z"/>
                  </svg>
                </div>
              </a>
              <a 
                href="https://www.youtube.com/@cafehaste" 
                target="_blank" 
                rel="noopener noreferrer"
                title="유튜브 바로가기"
                className="filter grayscale contrast-75 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-300 cursor-pointer active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <rect width="24" height="24" rx="6" fill="#FF0000"/>
                  <path fill="white" d="M10 8.5v7l6-3.5z"/>
                </svg>
              </a>
            </div>
            <div className="flex items-center gap-2 text-[9px] whitespace-nowrap select-none font-sans font-medium text-stone-400">
              <span onClick={() => setFooterDocType('TERMS')} className="hover:text-red-400 active:scale-95 transition-all duration-250 cursor-pointer hover:underline">이용약관</span>
              <span className="text-stone-700 select-none">|</span>
              <span onClick={() => setFooterDocType('PRIVACY')} className="hover:text-red-400 active:scale-95 transition-all duration-250 cursor-pointer hover:underline">개인정보처리방침</span>
              <span className="text-stone-700 select-none">|</span>
              <span onClick={() => setFooterDocType('EMAIL')} className="hover:text-red-400 active:scale-95 transition-all duration-250 cursor-pointer hover:underline">이메일무단수집거부</span>
            </div>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <HasteTermsModal
          isOpen={footerDocType !== null}
          docType={footerDocType}
          onClose={() => setFooterDocType(null)}
        />
      </Suspense>
    </>
  );
};
