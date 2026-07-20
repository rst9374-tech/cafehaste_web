import React from 'react';
import { Key, Settings2, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: '라이선스 인증 및 로그인',
    menuLocation: '런타임 상태 (우측 상단)',
    icon: Key,
    actionTitle: '인증 승인 상태 확인',
    description: '본사로부터 발급받은 정식 매장 라이선스 키를 통해 인증이 활성화되어 있는지 점검합니다.',
    bullets: [
      "상단 '매장 라이선스 정보' 영역에 녹색 [인증됨] 배지가 점등되어 있는지 확인합니다.",
      '라이선스 만료 또는 락(Locked) 상태 시 원격 주문 처리 수신 엔진 구동이 자동으로 차단됩니다.',
    ],
  },
  {
    step: '02',
    title: '물리 장비 및 포트 설정',
    menuLocation: '설정 (Settings)',
    icon: Settings2,
    actionTitle: '하드웨어 7대 핵심 통제 항목 설정 가이드',
    description: '주문 수신 및 기기 추출을 완벽하게 동기화하기 위해 설정(Settings) 메뉴에서 아래의 7대 장비 세팅을 반드시 수반해야 합니다.',
    bullets: [
      '시리얼포트 설정: 연동 통신포트(COM), 보레이트(Baud Rate), 패리티(Parity) 비트, 데이터 전송 간격 및 수신 패킷 무결성 검증 세팅',
      '장비 파츠 설정: 유량 센서 보정, 제어 보드 채널 ID, 내부 동작 함수 바인딩 및 파트 번호(Part Number) 등 부품 정합성 조율',
      '커피 / 커피머신: 에스프레소 커피 추출 프로토콜, 스팀 우유 토출 프로토콜, 원두 잔량 감지 센서 및 머신 가동 설정',
      '컵 디스펜서: 컵 물리 배출 방식(솔레노이드/모터), 컵 유무 감지 광학 센서, 모터 회전 타임(ms) 등 세부 동작 조율',
      '시럽 펌프: 시럽 종류별 배출 방식, 프로토콜 규격, 1회 투입 용량(ml) 설정 및 품절 예방 재고 관리 연동',
      '물 & 디스펜서: 정수, 온수, 탄산수, 얼음(제빙기 릴레이) 추출 트리거 세팅 및 실시간 원부재료 재고 한도 관리',
      '기타 전산 설정: 본사 연동 API 세션 규격, 매장 영업 정보 동기화, 고객 안내용 알림톡 전송 및 DID 화면 출력 옵션 설정',
    ],
  },
  {
    step: '03',
    title: '의존성 연결 상태 검증',
    menuLocation: '상태 (Runtime Status)',
    icon: Activity,
    actionTitle: '3대 핵심 의존성 확인',
    description: '설정한 장비들이 전산상에서 오류 없이 유기적으로 매핑되어 기동 중인지 눈으로 확인합니다.',
    bullets: [
      '서버엔진(주문 처리 시스템), 시리얼포트, 커피머신 연결등이 모두 [연결됨] 녹색으로 들어오는지 봅니다.',
      '모든 장비가 활성화되면 메인 화면 우측 상단의 회색 [판매 중지] 배지가 [판매 가능] 녹색으로 자동 전환됩니다.',
    ],
  },
  {
    step: '04',
    title: '메뉴판 및 레시피 동기화',
    menuLocation: '메뉴 관리 (Menu Editor)',
    icon: RefreshCw,
    actionTitle: '본사 메뉴 불러오기 & 가동',
    description: '본사 클라우드 스토리지에 세팅된 매장 전용 음료 및 레시피 메타데이터를 매장 로컬 머신에 주입합니다.',
    bullets: [
      '메뉴 관리 페이지에서 [메뉴 불러오기] 버튼을 기동하여 본사 서버 레시피 및 단가를 동기화합니다.',
      '동기화가 끝나면 메인 화면의 [판매 중] 스위치를 활성화하여 키오스크 주문 수신을 시작합니다.',
    ],
  },
];

export function LillyDashboardGuide() {
  return (
    <div className="flex flex-col gap-0 min-h-0">

      {/* ─── 헤더 (릴리 Header 100% 동일) ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">기기 운영 가이드</h1>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">
              WMF 커피머신 오류 발생 시 파츠별 조치 매뉴얼과 세부 운영 가이드를 제공합니다.
            </p>
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      {/* ─── 콘텐츠: 4단계 타임라인 (릴리 GuidePage 100% 동일 구조) ─── */}
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-5 pb-10">
        {STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative rounded-xl border border-[#27272A]/60 bg-[#141414] p-5 shadow-sm transition-all hover:border-[#C5A059]/30 flex flex-col md:flex-row gap-5"
            >
              {/* 왼쪽 번호/스태퍼 뱃지 */}
              <div className="flex items-center md:items-start shrink-0">
                <div className="size-12 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] font-black text-xl tracking-tight select-none">
                  {item.step}
                </div>
              </div>

              {/* 본문 콘텐츠 */}
              <div className="flex-1 min-w-0">
                {/* 헤더 행 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A]/50 pb-2.5 mb-3">
                  <h4 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
                    {item.title}
                  </h4>
                  <span className="text-xs font-semibold text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 px-2 py-0.5 rounded-md self-start sm:self-auto">
                    위치: {item.menuLocation}
                  </span>
                </div>

                {/* 설명 */}
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">{item.description}</p>

                {/* 액션 타이틀 */}
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className="size-3.5 text-[#C5A059]" />
                  <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wide">{item.actionTitle}</span>
                </div>

                {/* 불릿 리스트 */}
                <ul className="flex flex-col gap-2">
                  {item.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-[#C5A059] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#A1A1AA] leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
