import React from 'react';
import { Landmark, ArrowRight, HelpCircle, CheckCircle2, TrendingUp, Compass, Calculator, Send, Zap, Award, Sparkles, ShieldAlert, BadgePercent, MessageSquare, BookOpen, Users, Shield, HeartHandshake, Music, ChevronLeft, ChevronRight, Settings, Truck, Calendar, Store, Coffee, Megaphone, Gift, Smartphone } from 'lucide-react';
import { HasteMembershipForm } from './membership_comp_form';

export const HasteFranchise: React.FC<{ isMobile?: boolean; useMobileCompact?: boolean }> = ({ isMobile, useMobileCompact }) => {
  const isComp = isMobile || useMobileCompact;

  const scrollRef1 = React.useRef<HTMLDivElement | null>(null);
  const scrollRef2 = React.useRef<HTMLDivElement | null>(null);

  const handleScroll1Left = () => {
    if (scrollRef1.current) {
      scrollRef1.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };
  const handleScroll1Right = () => {
    if (scrollRef1.current) {
      scrollRef1.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleScroll2Left = () => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };
  const handleScroll2Right = () => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // TO-BE 개편안: 중복 텍스트를 배제하고 실질적인 부가 특전으로 재구성한 13대 혜택 데이터
  const TO_BE_BENEFIT_ITEMS = [
    {
      id: '01. SOLUTION MAINTENANCE',
      title: '월 5만원 솔루션구독(월정액)',
      desc: '안정적인 시스템 유지보수 및 소프트웨어 정기 업데이트를 포함한 HASTE 스마트 무인 솔루션을 합리적인 월 구독 형태로 제공합니다.',
      iconName: 'Settings',
    },
    {
      id: '02. NO GAMLIP INTERFERENCE',
      title: '헤이스트 규제 및 간섭 완전 차단 권리',
      desc: '프랜차이즈 특유의 불시 현장 암행 위생점검, 브랜드 통일성 미달 제재 등 점주를 압박하는 규격 갑질을 계약서상 차단합니다.',
      iconName: 'Shield',
    },
    {
      id: '03. LOGISTICS SHARING',
      title: '헤이스트 도매 직거래 물류망 무상 연계',
      desc: '의무 사입 제약은 일절 없으나, 점주가 원할 시 헤이스트가 대량 매입 단가로 매핑해 둔 우수 물류처와 다이렉트 거래를 지원합니다.',
      iconName: 'Truck',
    },
    {
      id: '04. AUTOMATIC RENEWAL',
      title: '편리한 월 정기구독 갱신 시스템',
      desc: '의무 장기 선납 없이 매월 55,000원의 저렴한 이용료 정기결제를 통해 간편하게 솔루션 가동 상태를 유지할 수 있습니다.',
      iconName: 'Calendar',
    },
    {
      id: '05. GROUP PURCHASE',
      title: '원부재료 공동구매 추가 할인 혜택',
      desc: '점주 연합 공동구매 망을 통해 필수 원부재료를 도매가 대비 추가 할인된 특가로 공급받을 수 있습니다.',
      iconName: 'BadgePercent',
    },
    {
      id: '06. MULTI-STORE BENEFIT',
      title: '추가 매장 멤버십 가입 시 가입비 50% 면제',
      desc: '2호점 이상의 추가 매장 개설 또는 솔루션 신규 도입 시, 가입비 of 50%를 즉시 면제해 드립니다.',
      iconName: 'Store',
    },
    {
      id: '07. COMMUNITY & GUIDE ACCESS',
      title: '점주 전용 실시간 커뮤니티 & FAQ 가이드북',
      desc: '점주 실시간 소통망과 함께 FAQ 아코디언 질의응답집, 프로그램/장비 운용 가이드북 다운로드 권한을 무상 제공합니다.',
      iconName: 'BookOpen',
    },
    {
      id: '08. SOFTWARE UPGRADES',
      title: '소프트웨어 업데이트 및 기능 업그레이드 지원',
      desc: '안정적인 시스템 관리를 위한 정기 소프트웨어 업데이트를 기본 지원하며 특수 기능은 옵션 제공합니다.',
      iconName: 'Zap',
    },
    {
      id: '09. RECIPE INCENTIVE REWARD',
      title: '레시피 기여 점주 대상 구독료 감면 리워드',
      desc: '점포 고유의 창의적인 시그니처 레시피를 점주 연합망에 공유 시, 헤이스트 평가를 거쳐 다음 달 솔루션 정기 구독료를 감면해 드립니다.',
      iconName: 'Coffee',
    },
    {
      id: '10. HASTE PLAYLIST LICENSE',
      title: '헤이스트 플레이리스트 BGM 이용권 제공',
      desc: '저작권료 부담 없이 매장 무드에 맞는 Lo-Fi 및 Acoustic BGM을 무제한 재생하는 전용 스트리밍을 제공합니다.',
      iconName: 'Music',
    },
    {
      id: '11. BRAND PR & MARKETING',
      title: '헤이스트 브랜드 마케팅&우수매장 홍보',
      desc: '딥러닝 기술을 활용한 AI 에이전트들이 숏폼 비디오, 매장 홍보 문구, 이미지 등을 자동 제작하여 마케팅 효과를 극대화하고 홍보 비용을 대폭 절감하며, 우수 매장 선정 시 브랜드 공식 채널을 통한 특별 홍보 혜택을 추가로 제공합니다.',
      iconName: 'Megaphone',
    },
    {
      id: '12. BRAND ITEM LICENSE',
      title: '헤이스트 브랜드 아이템 무상 사용',
      desc: '헤이스트 로고가 적용된 컵홀더, 컵, 캐리어 등 매장 소모품 디자인 및 브랜드 아이템을 무상으로 사용하여 매장의 브랜딩 가치와 일체감을 높여줍니다.',
      iconName: 'Gift',
    },
    {
      id: '13. HASTE EXCLUSIVE APP',
      title: '헤이스트 전용 어플 출시 예정',
      desc: '헤이스트 멤버십 고유 특화 기능인 스마트 POS, 원격 매장 제어 및 고객 포인트 적립 기능까지 통합하여 편리하게 이용할 수 있는 전용 어플리케이션이 출시될 예정입니다.',
      iconName: 'Smartphone',
    }
  ];

  return (
    <div id="franchise-consult-view" className={`bg-[#FAF8F5] text-stone-800 select-none ${isComp ? 'py-4 pt-4' : 'py-12'}`}>
      
      {/* Intro Header */}
      <section id="franchise-overview" className={`container mx-auto px-4 md:px-6 text-center max-w-4xl scroll-mt-32 ${isComp ? 'mb-6 pt-1' : 'mb-16 pt-4'}`}>
        <h1 className={`font-sans font-normal leading-tight text-stone-900 tracking-tight ${isComp ? 'text-xl mb-4' : 'text-3xl md:text-5xl mb-4'}`}>
          기술이 관리하고, 사장은 자유를 누리는<br/>
          <span className="text-[#C5A059] italic font-sans">수익형 무인 솔루션, HASTE</span>
        </h1>
        <p className={`text-stone-655 font-sans font-light max-w-2xl mx-auto leading-relaxed ${isComp ? 'text-xs' : 'text-sm md:text-base'}`}>
          "Smart Control, Infinite Freedom"<br/>
          점주님 중심의 안정적인 매장 운영을 보장하는 4대 핵심 사항과<br/>
          수익 극대화를 위한 13대 멤버십 핵심 혜택을 제공합니다.
        </p>
      </section>

      {/* 수치 비교 중심의 개편된 비교표 (자율권 바로 아래 배치) */}
      <section className={`container mx-auto px-6 max-w-5xl bg-[#FFFDF9] border border-stone-300 shadow-md relative overflow-hidden ${
        isComp ? 'mb-8 p-5 rounded-[28px]' : 'mb-24 p-8 md:p-12 rounded-[40px]'
      }`}>
        <div className={`text-center flex flex-col items-center ${isComp ? 'mb-6' : 'mb-12'}`}>
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-3"> Financial Value </span>
          <h2 className={`font-sans font-bold text-stone-900 text-xl md:text-2xl`}>프랜차이즈 VS 헤이스트 솔루션 비교</h2>
          <p className="text-stone-650 font-sans font-light text-[10px] sm:text-xs mt-1">텍스트 중복을 걷어내고, 점주가 부담하는 실제 지출 항목만을 숫자로 직접 비교해 보세요.</p>
          <div className="w-10 h-0.5 bg-[#C5A059]/30 mx-auto mt-3" />
        </div>

        {isComp ? (
          <div className="grid grid-cols-2 gap-2 font-sans px-0.5">
            {[
              { title: "가입비", legacy: "가맹비, 교육비 500만원", Haste: "30만 원 최초1회 (솔루션구축비용)" },
              { title: "월 구독료", legacy: "매출 3% 또는 월 33만 원", Haste: "월 5만 원 솔루션구독 (※ 연 360만원 절감)" },
              { title: "점포 인테리어", legacy: "평당 200만 원+ 강제", Haste: "자율 시공 (최저가 혜택)" },
              { title: "해지 위약금", legacy: "수천만 원 위약금", Haste: "약정 및 위약금 없음" }
            ].map((comp, i) => (
              <div key={i} className="p-2 bg-white rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between min-h-[120px]">
                <span className="text-[10px] font-extrabold text-[#C5A059] leading-tight mb-1">{comp.title}</span>
                <div className="flex flex-col gap-1 text-[8px] leading-snug">
                  <div className="p-1.5 bg-stone-50 rounded-md border border-stone-100 text-stone-500 text-left font-sans font-light">
                    <span className="block text-[7px] font-bold text-stone-400 mb-0.5">일반 프랜차이즈</span>
                    {comp.legacy}
                  </div>
                  <div className="p-1.5 bg-[#FAF8F2] rounded-md border border-[#C5A059]/15 text-stone-900 font-medium text-left font-sans font-light">
                    <span className="block text-[7px] font-bold text-[#C5A059] mb-0.5">HASTE 솔루션</span>
                    {comp.Haste}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-stone-200 shadow-md font-sans">
            <table className="w-full text-left border-collapse bg-white font-sans">
              <thead>
                <tr className="bg-stone-50 text-stone-900 font-sans text-sm md:text-base">
                  <th className="p-5 font-bold text-stone-850 border border-stone-200">구분</th>
                  <th className="p-5 font-medium text-stone-650 border border-stone-200">일반 커피 프랜차이즈</th>
                  <th className="p-5 font-extrabold text-stone-900 bg-[#FFFDF9] border border-stone-200 text-left">
                    <span className="text-[#C5A059]">HASTE</span> 스마트 무인 솔루션
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm md:text-[15px] font-sans font-light text-stone-650">
                <tr>
                  <td className="p-5 font-bold bg-stone-50/40 border border-stone-200 text-stone-850">가입비</td>
                  <td className="p-5 text-stone-600 bg-stone-50/10 border border-stone-200">가맹비, 교육비 500만원</td>
                  <td className="p-5 text-stone-900 font-normal bg-[#FFFDF9] border border-stone-200">
                    <strong className="text-[#C5A059] font-bold font-sans underline decoration-[#C5A059] decoration-2 underline-offset-4">30만 원</strong> 최초1회 (솔루션구축비용)
                  </td>
                </tr>
                <tr>
                  <td className="p-5 font-bold bg-stone-50/40 border border-stone-200 text-stone-850">월 구독료</td>
                  <td className="p-5 text-stone-600 bg-stone-50/10 border border-stone-200">매출 3% 또는 월 33만 원</td>
                  <td className="p-5 text-stone-900 font-normal bg-[#FFFDF9] border border-stone-200">
                    <strong className="text-stone-900 font-bold font-sans underline decoration-[#C5A059] decoration-2 underline-offset-4">월 5만 원 솔루션구독(월정액)</strong><br/><span className="text-[#C5A059] text-xs font-medium">※ 연 360만원 절감</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 font-bold bg-stone-50/40 border border-stone-200 text-stone-850">점포 인테리어</td>
                  <td className="p-5 text-stone-600 bg-stone-50/10 border border-stone-200">평당 200만 원+ 강제</td>
                  <td className="p-5 text-stone-900 font-normal bg-[#FFFDF9] border border-stone-200">
                    <strong className="text-[#C5A059] font-bold font-sans underline decoration-[#C5A059] decoration-2 underline-offset-4">자율 시공 (최저가 혜택)</strong>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 font-bold bg-stone-50/40 border border-stone-200 text-stone-850">해지 위약금</td>
                  <td className="p-5 text-stone-600 bg-stone-50/10 border border-stone-200">수천만 원 위약금</td>
                  <td className="p-5 text-stone-900 font-normal bg-[#FFFDF9] border border-stone-200">
                    <strong className="text-[#C5A059] font-bold font-sans underline decoration-[#C5A059] decoration-2 underline-offset-4">약정 및 위약금 없음</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================================================= */}
      {/* [카테고리 1] 4대 운영 자율권 (기본 독립 권리) */}
      {/* ========================================================================================= */}
      
      <div className={`max-w-5xl mx-auto flex items-center gap-4 pointer-events-none select-none ${isComp ? 'my-6' : 'my-10'}`}>
        <div className="h-px flex-grow border-t border-stone-300" />
        <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-950 border border-stone-850 rounded-full font-mono text-[9px] tracking-[0.25em] uppercase text-[#C5A059] font-bold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>01 CORE AUTONOMY & RIGHTS</span>
        </div>
        <div className="h-px flex-grow border-t border-stone-300" />
      </div>

      <section id="franchise-autonomy" className={`container mx-auto px-4 md:px-6 max-w-5xl scroll-mt-24 bg-[#FFF9F2] rounded-[40px] border-2 border-[#C5A059]/30 shadow-md relative overflow-hidden ${
        isComp ? 'mb-6 p-4 pb-6' : 'mb-12 p-8 md:p-14'
      }`}>
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none" />

        <div className={`text-center relative z-10 ${isComp ? 'mb-6' : 'mb-12'}`}>
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-3"> Core Rights </span>
          <h2 className={`font-sans font-bold text-stone-900 text-xl md:text-2xl`}>헤이스트 멤버십 점주 4대 핵심 사항</h2>
          <p className="text-stone-650 font-sans font-light text-[10px] sm:text-xs mt-1">원부자재 소싱, 레시피 세팅, 매장 운영 지원 및 브랜드 상표 사용을 지원하는 상생 체계</p>
          <div className="w-10 h-0.5 bg-[#C5A059]/40 mx-auto mt-3" />
        </div>

        <div className={`text-stone-800 ${
          isComp 
            ? 'flex flex-row overflow-x-auto pb-4 snap-x snap-mandatory gap-4 scrollbar-none' 
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
        } relative z-10 font-sans`}>
          
          <div className={`bg-[#C5A059]/10 rounded-3xl border border-[#C5A059]/25 shadow-sm flex flex-col justify-between hover:bg-[#C5A059]/15 transition-all duration-300 ${isComp ? 'p-5 w-[76vw] shrink-0 snap-center' : 'p-8 hover:scale-[1.02] hover:shadow-md'}`}>
            <div>
              <div className={`rounded-xl bg-[#C5A059] text-white flex items-center justify-center font-sans font-bold shadow-sm ${isComp ? 'w-8 h-8 text-sm mb-4' : 'w-12 h-12 text-xl mb-6'}`}>01</div>
              <h3 className={`font-sans font-bold text-stone-900 ${isComp ? 'text-sm mb-2' : 'text-lg mb-3'}`}>원부자재 소싱 자율</h3>
              <p className={`text-stone-655 font-sans font-light leading-relaxed ${isComp ? 'text-[11px]' : 'text-sm'}`}>
                원부재료는 의무 구매 조항 없이 유연하게 선택해 활용하실 수 있습니다.
              </p>
            </div>
            <div className="text-[10px] text-[#C5A059] font-bold font-mono mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <span>FREE SOURCING</span>
            </div>
          </div>

          <div className={`bg-[#C5A059]/10 rounded-3xl border border-[#C5A059]/25 shadow-sm flex flex-col justify-between hover:bg-[#C5A059]/15 transition-all duration-300 ${isComp ? 'p-5 w-[76vw] shrink-0 snap-center' : 'p-8 hover:scale-[1.02] hover:shadow-md'}`}>
            <div>
              <div className={`rounded-xl bg-[#C5A059] text-white flex items-center justify-center font-sans font-bold shadow-sm ${isComp ? 'w-8 h-8 text-sm mb-4' : 'w-12 h-12 text-xl mb-6'}`}>02</div>
              <h3 className={`font-sans font-bold text-stone-900 ${isComp ? 'text-sm mb-2' : 'text-lg mb-3'}`}>독립적 레시피 세팅</h3>
              <p className={`text-stone-655 font-sans font-light leading-relaxed ${isComp ? 'text-[11px]' : 'text-sm'}`}>
                헤이스트 무인 레시피 탑재 및 점포 고유 독립 브랜딩 자율 운영
              </p>
            </div>
            <div className="text-[10px] text-[#C5A059] font-bold font-mono mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <span>UNLIMITED CUSTOMIZATION</span>
            </div>
          </div>

          <div className={`bg-[#C5A059]/10 rounded-3xl border border-[#C5A059]/25 shadow-sm flex flex-col justify-between hover:bg-[#C5A059]/15 transition-all duration-300 ${isComp ? 'p-5 w-[76vw] shrink-0 snap-center' : 'p-8 hover:scale-[1.02] hover:shadow-md'}`}>
            <div>
              <div className={`rounded-xl bg-[#C5A059] text-white flex items-center justify-center font-sans font-bold shadow-sm ${isComp ? 'w-8 h-8 text-sm mb-4' : 'w-12 h-12 text-xl mb-6'}`}>03</div>
              <h3 className={`font-sans font-bold text-stone-900 ${isComp ? 'text-sm mb-2' : 'text-lg mb-3'}`}>매장 운영 자율</h3>
              <p className={`text-stone-655 font-sans font-light leading-relaxed ${isComp ? 'text-[11px]' : 'text-sm'}`}>
                기존 무인 커피머신/키오스크 장비에 연동 세팅 지원
              </p>
            </div>
            <div className="text-[10px] text-[#C5A059] font-bold font-mono mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <span>100% AUTO CONTROL</span>
            </div>
          </div>

          <div className={`bg-[#C5A059]/10 rounded-3xl border border-[#C5A059]/25 shadow-sm flex flex-col justify-between hover:bg-[#C5A059]/15 transition-all duration-300 ${isComp ? 'p-5 w-[76vw] shrink-0 snap-center' : 'p-8 hover:scale-[1.02] hover:shadow-md'}`}>
            <div>
              <div className={`rounded-xl bg-[#C5A059] text-white flex items-center justify-center font-sans font-bold shadow-sm ${isComp ? 'w-8 h-8 text-sm mb-4' : 'w-12 h-12 text-xl mb-6'}`}>04</div>
              <h3 className={`font-sans font-bold text-stone-900 ${isComp ? 'text-sm mb-2' : 'text-lg mb-3'}`}>상표 라이선스 권한</h3>
              <p className={`text-stone-655 font-sans font-light leading-relaxed ${isComp ? 'text-[11px]' : 'text-sm'}`}>
                헤이스트 브랜드 상표 라이선스 지원 간판 및 브랜딩 표시 권한 지원
              </p>
            </div>
            <div className="text-[10px] text-[#C5A059] font-bold font-mono mt-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <span>100% FREE LICENSE</span>
            </div>
          </div>
        </div>
        
        {isComp && (
          <div className="text-center mt-3 text-[10px] text-[#C5A059] font-sans font-medium select-none tracking-tight animate-pulse">
            ◀ 손가락으로 좌우 드래그하여 자율권을 확인해보세요 ▶
          </div>
        )}
      </section>

      {/* ========================================================================================= */}
      {/* [카테고리 2] 13대 멤버십 혜택 (부가 특전 및 케어 서비스) */}
      {/* ========================================================================================= */}

      <div className="max-w-5xl mx-auto my-10 flex items-center gap-4 pointer-events-none select-none">
        <div className="h-px flex-grow border-t border-stone-300" />
        <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-900 border border-stone-850 rounded-full font-mono text-[9px] tracking-[0.25em] uppercase text-[#C5A059] font-bold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>02 MEMBERSHIP VALUE & BENEFITS</span>
        </div>
        <div className="h-px flex-grow border-t border-stone-300" />
      </div>

      {/* HASTE MEMBERSHIP BENEFITS SECTION */}
      <section id="franchise-benefits" className="container mx-auto px-4 md:px-6 max-w-5xl scroll-mt-24 mb-10 md:mb-24">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-2"> EXCLUSIVE BENEFITS </span>
          <h2 className="font-sans font-bold text-stone-900 text-xl md:text-2xl mb-2">헤이스트 멤버십 점주 13대 핵심 혜택</h2>
          <p className="text-stone-650 font-sans font-light text-[10px] sm:text-xs mt-1">4대 핵심 사항 외에, 멤버십 가입 시 제공되는 실질적인 운영 및 기술 지원 혜택입니다.</p>
          <div className="w-8 h-px bg-stone-300 mx-auto mt-2" />
        </div>

        <div className="relative w-full">
          {/* Mobile slide navigation arrows */}
          {isComp && (
            <>
              <button
                type="button"
                onClick={handleScroll2Left}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-900/80 border border-[#C5A059]/40 text-[#C5A059] hover:text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
                title="이전 보기"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleScroll2Right}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-900/80 border border-[#C5A059]/40 text-[#C5A059] hover:text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
                title="다음 보기"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          <div 
            ref={scrollRef2}
            className={`flex ${
              isComp 
                ? 'flex-row overflow-x-auto pb-2.5 snap-x snap-mandatory gap-3 scrollbar-none px-10' 
                : 'flex-col md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6'
            } font-sans`}
          >
            {TO_BE_BENEFIT_ITEMS.map((benefit) => {
              const renderBenefitIcon = (iconName: string) => {
                const iconClass = "w-5 h-5 text-[#C5A059]";
                switch (iconName) {
                  case 'Settings': return <Settings className={iconClass} />;
                  case 'Shield': return <Shield className={iconClass} />;
                  case 'Truck': return <Truck className={iconClass} />;
                  case 'Calendar': return <Calendar className={iconClass} />;
                  case 'BadgePercent': return <BadgePercent className={iconClass} />;
                  case 'Store': return <Store className={iconClass} />;
                  case 'BookOpen': return <BookOpen className={iconClass} />;
                  case 'Zap': return <Zap className={iconClass} />;
                  case 'Coffee': return <Coffee className={iconClass} />;
                  case 'Music': return <Music className={iconClass} />;
                  case 'Megaphone': return <Megaphone className={iconClass} />;
                  case 'Gift': return <Gift className={iconClass} />;
                  case 'Smartphone': return <Smartphone className={iconClass} />;
                  default: return <Sparkles className={iconClass} />;
                }
              };

              return (
                <div 
                  key={benefit.id} 
                  className={`rounded-2xl border p-5 md:p-6 flex flex-col justify-between shadow-xs transition-all duration-300 hover:scale-[1.01] hover:shadow-md w-[74vw] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none ${
                    ((parseInt(benefit.id.split('.')[0], 10) >= 9 && parseInt(benefit.id.split('.')[0], 10) !== 10) || parseInt(benefit.id.split('.')[0], 10) === 5)
                      ? 'bg-[#F4EADB] border-[#C5A059]/60 hover:border-[#C5A059]' 
                      : 'bg-white border-transparent'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                          {renderBenefitIcon(benefit.iconName as any)}
                        </div>
                        <div className="flex items-center gap-1">
                          {((parseInt(benefit.id.split('.')[0], 10) < 9 && parseInt(benefit.id.split('.')[0], 10) !== 5) || parseInt(benefit.id.split('.')[0], 10) === 10) && (
                            <span className="haste-badge-membership">멤버십</span>
                          )}
                          <span className="haste-badge-haste-membership">헤이스트 멤버십</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-[#C5A059]/80 tracking-wider bg-[#C5A059]/5 px-2.5 py-0.5 rounded-full border border-[#C5A059]/15 uppercase shrink-0">
                        {benefit.id.split('.')[0]}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm md:text-base mb-2 font-sans">{benefit.title}</h3>
                    <p className="text-stone-550 text-[11px] md:text-xs leading-relaxed font-sans">{benefit.desc}</p>
                    {benefit.id.includes('10.') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'MUSIC' } }));
                        }}
                        title="헤이스트 뮤직 스트리밍 바로가기"
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/25 text-[#C5A059] text-[10.5px] font-bold rounded-lg border border-[#C5A059]/30 transition-all duration-300 active:scale-95 cursor-pointer shadow-2xs group"
                      >
                        <Music size={12} className="group-hover:scale-110 transition-transform" />
                        <span>플레이리스트 바로가기</span>
                        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 멤버십 종류별 브랜드 사용/미사용 비교 안내 */}
        <div className="mt-6 p-4 bg-[#FAF9F6] border border-stone-200 rounded-2xl text-[11px] sm:text-xs text-stone-600 leading-relaxed flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <strong className="text-stone-800">멤버십 구분 안내:</strong>
            <span>브랜드 상표 사용 여부에 따라 권리와 혜택 범위가 구분됩니다.</span>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="haste-badge-membership text-[10px]">멤버십</span>
              <span className="text-stone-500 font-medium">헤이스트 브랜드 미사용 점포</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="haste-badge-haste-membership text-[10px]">헤이스트 멤버십</span>
              <span className="text-stone-700 font-bold">헤이스트 무상 브랜드 사용 점포</span>
            </div>
          </div>
        </div>

        {isComp && (
          <div className="text-center mt-3 text-[10px] text-[#C5A059] font-sans font-medium select-none tracking-tight animate-pulse block md:hidden">
            ◀ 손가락으로 좌우 드래그하여 혜택을 확인해보세요 ▶
          </div>
        )}
      </section>

      {/* 가입 신청 폼 (다이어그램 등이 삭제되어 오직 비용과 신청 버튼만 콤팩트하게 제공) */}
      <section id="franchise-membership" className="scroll-mt-28">
        <HasteMembershipForm isComp={true} /> {/* isComp={true}를 전달해 다이어그램 강제 제외 */}
      </section>

    </div>
  );
};