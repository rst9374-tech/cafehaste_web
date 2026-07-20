import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, BookOpen, Search, Cpu, Play
} from 'lucide-react';

interface GuideItem {
  id: string;
  type: 'error' | 'care';
  code?: string;
  title: string;
  subtitle?: string;
  status: 'critical' | 'warning' | 'info';
  desc: string;
  steps: string[];
  videoFilenames?: string[];
  device: 'coffee' | 'ice' | 'cup' | 'program';
}

interface LillyDashboardGuidePageProps {
  isDashboard?: boolean;
  defaultDevice?: 'all' | 'coffee' | 'ice' | 'cup' | 'program';
}

export const LillyDashboardGuidePage: React.FC<LillyDashboardGuidePageProps> = ({ isDashboard = false, defaultDevice }) => {
  const [selectedDevice, setSelectedDevice] = useState<'all' | 'coffee' | 'ice' | 'cup' | 'program'>(defaultDevice || 'all');
  const [searchKwd, setSearchKwd] = useState('');

  useEffect(() => {
    if (defaultDevice) {
      setSelectedDevice(defaultDevice);
    }
  }, [defaultDevice]);

  // 통합 가이드 데이터셋
  const guideItems: GuideItem[] = [
    // 커피머신 (coffee)
    {
      id: 'coffee_err_53',
      type: 'error',
      code: '53',
      title: '세척 알림 (Cleaning Required)',
      status: 'warning',
      desc: '일일 정기 세척 주기가 되었음을 알립니다. 릴리 프로그램과 머신의 세척이 필요합니다.',
      steps: [
        '릴리 실행 프로그램을 먼저 정상 종료합니다.',
        'WMF 머신 시스템 세척 메뉴에 진입하여 시스템 세척을 가동합니다 (세척 알약 투입).',
        '시스템 세척 완료를 확인한 후, 릴리 실행 프로그램을 재시작합니다.'
      ],
      videoFilenames: ['system_cleaning.mp4'],
      device: 'coffee'
    },
    {
      id: 'coffee_err_54',
      type: 'error',
      code: '54',
      title: '강제 세척 알림',
      status: 'critical',
      desc: '정기 세척 시간을 초과하여 머신 기능이 차단되었습니다. 즉각적인 시스템 세척이 요구됩니다.',
      steps: [
        '릴리 실행프로그램 종료',
        'WMF 시스템 세척 진행',
        '릴리 실행프로그램 시작'
      ],
      videoFilenames: ['system_cleaning.mp4'],
      device: 'coffee'
    },
    {
      id: 'coffee_err_63_64',
      type: 'error',
      code: '63,64',
      title: '원두 없음 알림',
      status: 'warning',
      desc: '좌/우 원두 호퍼에 원두가 소진되어 커피 추출이 불가능한 상태입니다.',
      steps: [
        '원두리필'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_err_74',
      type: 'error',
      code: '74',
      title: '전면 패널 열림',
      status: 'critical',
      desc: 'WMF 머신 전면 도어 또는 가드가 완전히 잠기지 않았습니다.',
      steps: [
        'WMF 디스플레이 닫힘 확인'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_err_76',
      type: 'error',
      code: '76',
      title: '수압 차단콕 알림',
      status: 'critical',
      desc: '머신으로 들어오는 원수 공급 수압이 비정상적으로 약하거나 단수 상태입니다.',
      steps: [
        '알람 확인',
        '미해결시 WMF 재시작',
        '릴리 프로그램 (RUN & DID) 재실행',
        '동일증상 발생시 제조사 A/S'
      ],
      videoFilenames: ['power_onoff.mp4', 'lily_restart.mp4'],
      device: 'coffee'
    },
    {
      id: 'coffee_err_78',
      type: 'error',
      code: '78',
      title: '워터필터 교체 알림 (Filter Lifespan)',
      status: 'info',
      desc: '정수 필터의 정수 용량 수명이 다하여 필터 교체 주기가 되었음을 알립니다.',
      steps: [
        '필터 공급 밸브 알람을 확인하고 실제 정수 필터를 새것으로 교체합니다.',
        '필터 교체 완료 후 머신 설정 메뉴에 진입하여 필터 용량 카운터를 강제 클리어(리셋)합니다.'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_err_108',
      type: 'error',
      code: '108',
      title: '히팅 알림 (Heating Up)',
      status: 'info',
      desc: '머신 보일러 온도가 설정 값보다 낮아 온수 히팅을 진행 중입니다.',
      steps: [
        '초기 기동 또는 온수 대량 사용 후 일어나는 자연스러운 현상으로, 보통 10분 이내 자동 해제됩니다.',
        '10분 이상 히팅 알림이 지속되는 경우 머신 전원을 내렸다가 재부팅합니다.',
        '지속 미해결 시 보일러 히팅 엘리먼트 고장일 수 있으므로 A/S를 접수합니다.'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_err_329',
      type: 'error',
      code: '329',
      title: '최소 유량 알림 (Min Flow Rate)',
      status: 'critical',
      desc: '추출 시 유입되는 유량 속도가 너무 느려 펌프 부하 또는 추출 막힘이 염려되는 상태입니다.',
      steps: [
        '급수관 호스의 꼬임 상태나 밸브 개폐 상태를 점검합니다.',
        '원수 수압 자체가 충분히 들어오고 있는지 매장 급수 설비를 점검합니다.',
        '미해결 시 WMF 머신 재부팅 및 릴리 프로그램을 다시 기동합니다.'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_err_301',
      type: 'error',
      code: '301',
      title: '석회 제거 알림 (Descaling Required)',
      status: 'warning',
      desc: '머신 내부 보일러 및 배관에 석회(스케일)가 누적되어 제거가 필요합니다.',
      steps: [
        '디스플레이 경고 창을 확인합니다.',
        '매장 담당자 또는 기술 엔지니어가 현장 방문하여 스케일 제거 약품 처리를 한 뒤 설정을 리셋(강제 클리어)해야 합니다.'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_err_429',
      type: 'error',
      code: '429',
      title: '모터 이동 시간 초과 (Brewing Unit Timeout)',
      status: 'critical',
      desc: '커피를 추출하는 브루잉 유닛(추출기) 모터의 구동 시간이 초과되었습니다. 추출기 걸림 현상입니다.',
      steps: [
        'WMF 머신 전원을 종료합니다.',
        '우측 패널을 열어 브루잉 유닛(추출기)을 완전히 탈거합니다.',
        '흐르는 따뜻한 물로 커피 찌꺼기를 깨끗이 세척하고 피스톤이 부드럽게 움직이는지 조치합니다.',
        '유닛을 재조립하여 단단히 장착한 뒤, 머신 전원을 켜고 릴리 프로그램을 실행합니다.'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_err_684',
      type: 'error',
      code: '684',
      title: '모터 인코더 제어 비정 (Brewing Unit Failure)',
      status: 'critical',
      desc: '추출 모터의 인코더 펄스 수신 이상으로 추출기의 올바른 위치를 감지할 수 없습니다.',
      steps: [
        '알람을 확인한 뒤 WMF 머신을 재부팅합니다.',
        '브루잉 유닛이 꽉 장착되어 고정되었는지 재탈착하여 다시 맞춰 봅니다.',
        '지속 미해결 시 내부 모터 센서 또는 메인보드 고장일 수 있으므로 즉시 제조사 A/S를 접수합니다.'
      ],
      device: 'coffee'
    },
    {
      id: 'coffee_care_bin',
      type: 'care',
      title: '찌꺼기통 경고 대처 방법',
      subtitle: '커피 찌꺼기 비움 경고가 계속해서 뜨거나 안 없어지는 경우',
      status: 'warning',
      desc: 'WMF 머신은 찌꺼기통이 빠졌다가 일정 시간 이상 지나야 내부 찌꺼기 카운터가 리셋됩니다.',
      steps: [
        '머신 패널을 열고 찌꺼기통을 뺍니다.',
        '내부 찌꺼기를 완전히 비우고 젖은 행주로 깨끗이 닦아줍니다.',
        '★중요: 찌꺼기통을 뺀 상태로 최소 10초 이상 대기합니다. (감지 센서가 비워진 것을 인식할 시간 필요)',
        '10초 후 찌꺼기통을 다시 끝까지 밀어 넣고 패널을 닫습니다.',
        '디스플레이의 경고 메시지가 정상 해제되었는지 확인합니다.'
      ],
      videoFilenames: ['grounds_bin.mp4'],
      device: 'coffee'
    },
    {
      id: 'coffee_care_hose',
      type: 'care',
      title: '우유 호스 교체 방법',
      subtitle: '스마트카페 위생 유지를 위한 우유 호스 교체 가이드',
      status: 'info',
      desc: '우유 추출 라인의 위생과 일관된 우유 거품 품질을 위해 정기적으로 호스를 세척하고 교체해야 합니다.',
      steps: [
        '냉장고 문을 열어 우유 팩에서 기존 호스 어댑터를 탈거합니다.',
        '머신 스파우트와 연결된 호스 헤드를 뽑아 냅니다.',
        '새 우유 호스를 적정 길이로 재단하여 양쪽 커넥터 노즐에 꽉 끼워줍니다.',
        '장착 완료 후 우유 노즐 세척 사이클을 가동하여 밀크 라인을 안정화시킵니다.'
      ],
      videoFilenames: ['milk_hose.mp4'],
      device: 'coffee'
    },
    {
      id: 'coffee_care_combi',
      type: 'care',
      title: '콤비 스파우트 분해 세척 방법',
      subtitle: '커피 및 우유가 추출되는 콤비 헤드 완전 분해 가이드',
      status: 'info',
      desc: '우유 잔여물로 인한 악취 및 노즐 막힘을 방지하기 위해 매일 마감 시 수동 분해 세척을 강력히 권장합니다.',
      steps: [
        '추출구 부분의 콤비 스파우트 커버를 양쪽을 눌러 탈거합니다.',
        '내부의 우유 거품기(포머) 챔버를 아래로 잡아당겨 분리합니다.',
        '분리된 실리콘 노즐, 제트 파츠, 챔버 본체를 완전히 낱개로 분해합니다.',
        '따뜻한 물 1L에 WMF 전용 우유 액체세제를 희석하여 분해한 부품들을 30분간 담가둔 뒤 솔로 세척합니다.'
      ],
      videoFilenames: ['combi_cleaning.mp4'],
      device: 'coffee'
    },

    // 제빙기 (ice)
    {
      id: 'ice_err_e1',
      type: 'error',
      code: 'E1',
      title: '급수 불량 (Water Inlet Error)',
      status: 'critical',
      desc: '제빙기로 들어오는 물의 공급이 원활하지 않거나 압력이 약합니다.',
      steps: [
        '매장의 수도 단수 여부 및 원수 공급 밸브(차단콕)가 잘 열려있는지 점검합니다.',
        '제빙기 뒷면의 급수 필터가 찌꺼기로 인해 막히지 않았는지 청결 상태를 확인합니다.',
        '제빙기 전원을 종료하고 10초 후 재부팅하여 알람을 클리어합니다.',
        '★중요: 제빙기 내부에 설치된 감압 밸브의 세팅 압력이 너무 낮게 조절되어 물 공급이 차단되는지 체크합니다.'
      ],
      device: 'ice'
    },
    {
      id: 'ice_err_e2',
      type: 'error',
      code: 'E2',
      title: '배수 불량 (Drainage Error)',
      status: 'critical',
      desc: '제빙기 내 물탱크의 배수가 정상적으로 빠져나가지 못하고 역류하는 상태입니다.',
      steps: [
        '제빙기 아래쪽의 배수 호스가 꼬이거나 무거운 짐에 꺾여 눌려있지 않은지 점검합니다.',
        '매장의 하수관이 막혀 역류하는지 하수도 상태를 체크합니다.',
        '배수 호스의 설치 레벨(높이)이 제빙기 토출구보다 높게 치솟아 배수가 정체되는지 확인합니다.'
      ],
      device: 'ice'
    },
    {
      id: 'ice_err_e3',
      type: 'error',
      code: 'E3',
      title: '실내 온도 저하 경고 (Low Ambient Temp)',
      status: 'warning',
      desc: '제빙기 주변 온도가 너무 낮아(5℃ 이하) 빙결 작동에 지장을 초래하고 있습니다.',
      steps: [
        '겨울철 야간이나 환기 시설 오작동으로 인한 실내 저온이 원인입니다. 온풍기를 가동하여 주변 온도를 10℃ 이상으로 올려줍니다.',
        '실내 온도가 올라가 정상화되면 제빙기 전원 스위치를 온오프하여 리부팅합니다.'
      ],
      device: 'ice'
    },
    {
      id: 'ice_err_e4',
      type: 'error',
      code: 'E4',
      title: '제품 내부 과열 경고 (Internal Overheating)',
      status: 'critical',
      desc: '콤프레셔 또는 머신 내부 콘덴서 온도가 50℃ 이상으로 이상 상승했습니다.',
      steps: [
        '제빙기 후면 및 방열 환기창이 벽면에 너무 밀착(최소 10cm 이상 이격 권장)되어 있는지 점검합니다.',
        '제빙기 하단 방열판에 쌓인 먼지를 청소기로 흡입하여 방열 성능을 회복시킵니다.',
        '여름철 매장 냉방을 보강하여 기기 주변 열기 정체를 완화합니다.'
      ],
      device: 'ice'
    },
    {
      id: 'ice_err_e8',
      type: 'error',
      code: 'E8',
      title: '제빙 기능 불량 (Ice Production Failure)',
      status: 'critical',
      desc: '사이클은 돌아가나 냉각 불량 등으로 인해 제빙 감지 센서에 얼음이 정상 형성되지 않았습니다.',
      steps: [
        '냉매 누출 또는 압축기(콤프레셔) 오작동의 가능성이 큽니다.',
        '제빙기 전원을 끄고 5분 대기 후 다시 작동을 개시합니다.',
        '동일한 E8 경고가 연속 3회 이상 뜰 시 제조사 점검 및 본사 A/S 접수가 요구됩니다.'
      ],
      device: 'ice'
    },
    {
      id: 'ice_err_ef',
      type: 'error',
      code: 'EF',
      title: '팬 모터 이상 (Fan Motor Malfunction)',
      status: 'critical',
      desc: '콘덴서의 팬 모터가 정상 전력 및 RPM을 내지 못하고 정지했습니다.',
      steps: [
        '제빙기 하단 팬 모터 날개에 물리적인 이물질(케이블타이, 비닐 등)이 끼어있는지 가볍게 손으로 점검합니다.',
        '방치 시 콤프레셔 영구 파손이 올 수 있으므로, 즉시 기기 전원을 차단하고 엔지니어 부품 교체 방문을 신청해야 합니다.'
      ],
      device: 'ice'
    },

    // 컵 디스펜서 (cup)
    {
      id: 'cup_care_stuck',
      type: 'care',
      title: '컵이 나오지 않거나 걸렸을 때',
      subtitle: '종이컵/플라스틱컵 걸림(Jam) 현상 신속 조치법',
      status: 'warning',
      desc: '디스펜서 내부에서 컵이 찌그러지거나 2장이 동시에 끼어 배출구가 꽉 막힌 상태입니다.',
      steps: [
        '컵 디스펜서 전면 카트리지 가이드를 열어 걸린 컵 뭉치를 정밀하게 빼냅니다.',
        '조금이라도 찌그러지거나 습기로 인해 변형된 컵은 절대 재사용하지 말고 모두 폐기합니다.',
        '종이컵과 플라스틱컵의 입구 크기에 맞도록 실리콘 패드 및 가이드 나사를 정교하게 세팅합니다.',
        '새 컵 뭉치를 투입할 때는 컵끼리 붙어있지 않도록 끝을 가볍게 털어서 반듯하게 밀어 넣습니다.'
      ],
      device: 'cup'
    },
    {
      id: 'cup_care_sensor',
      type: 'care',
      title: '컵 디스펜서 센서 감지 점검 방법',
      subtitle: '컵이 채워져 있으나 프로그램에서 품절로 감지될 때',
      status: 'info',
      desc: '센서 표면에 종이컵 먼지 가루가 흡착되어 오작동하거나 센서 감도 축이 틀어진 경우입니다.',
      steps: [
        '디스펜서 측면 및 내측에 장착된 컵 감지 광센서 렌즈를 면봉이나 마른 천으로 부드럽게 닦아줍니다.',
        '기기 뒷면의 초음파 감도 조절 볼륨 나사를 가볍게 돌려 컵이 감지될 때 LED 동작등이 들어오는지 체크합니다.',
        '결제 프로그램 및 대시보드 기기 모니터링 화면에서 컵 보유 상태가 정상으로 갱신되는지 최종 확인합니다.'
      ],
      device: 'cup'
    },

    // 프로그램/DID (program)
    {
      id: 'program_care_lily',
      type: 'care',
      title: '릴리 프로그램 및 DID 사용 방법',
      subtitle: '무인 스마트카페 결제 및 모니터링 프로그램 관리',
      status: 'warning',
      desc: '릴리 프로그램(결제 및 메뉴 연동 솔루션) 오작동 또는 멈춤 발생 시 조치 요령입니다.',
      steps: [
        '프로그램 화면이 멈추거나 먹통인 경우, 키보드의 Alt + F4 단축키를 눌러 릴리 프로그램을 강제 종료합니다.',
        'PC 바탕화면 또는 작업표시줄의 [LILY RUN] 아이콘을 더블클릭하여 프로그램을 다시 기동합니다.',
        '결제 단말기(DID 및 카드 리더기)의 연결선 포트(USB 및 LAN)가 물리적으로 잘 결속되어 있는지 확인합니다.',
        '인터넷 연결 끊김 경고 발생 시 매장 공유기 및 허브 전원을 끈 후 10초 뒤 켜서 인터넷 환경을 복구합니다.'
      ],
      videoFilenames: ['lily_restart.mp4', 'lily_did.mp4'],
      device: 'program'
    }
  ];

  // 디바이스 및 검색 필터링된 가이드 아이템
  const filteredItems = guideItems
    .filter(item => selectedDevice === 'all' || item.device === selectedDevice)
    .filter(item => 
      item.code?.toLowerCase().includes(searchKwd.toLowerCase()) || 
      item.title.toLowerCase().includes(searchKwd.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchKwd.toLowerCase())
    );

  const getVideoLabel = (filename: string) => {
    if (filename.includes('system_cleaning')) return '시스템 세척 방법';
    if (filename.includes('grounds_bin')) return '찌꺼기통 비우기 가이드';
    if (filename.includes('milk_hose')) return '우유 호스 교체 방법';
    if (filename.includes('combi_cleaning')) return '콤비 스파우트 세척 방법';
    if (filename.includes('lily_restart')) return '릴리 프로그램 재시작 방법';
    if (filename.includes('lily_did')) return '릴리 DID 연동 세팅';
    if (filename.includes('power_onoff')) return 'WMF 재시작';
    return '동영상 가이드';
  };

  return (
    <div className="w-full bg-[#070609]/95 text-stone-300 font-sans shadow-lg relative overflow-hidden text-left border-0 rounded-2xl p-4 md:p-6 select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#C5A059_0.5px,transparent_0.5px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none" />
      
      {/* 상단 여백 및 검색 영역 */}

      {/* 내부 검색 필터 (고선명 골드테두리 및 그림자 강조 적용) */}
      <div className="mb-6 flex items-center gap-2.5 bg-[#111015] border border-[#C5A059]/60 rounded-xl p-2 px-4 max-w-md shadow-[0_0_15px_rgba(197,160,89,0.12)] focus-within:border-[#C5A059] focus-within:shadow-[0_0_20px_rgba(197,160,89,0.22)] transition-all relative z-10">
        <span className="text-[#C5A059] shrink-0 animate-pulse"><Search size={13} /></span>
        <input
          type="text"
          value={searchKwd}
          onChange={(e) => setSearchKwd(e.target.value)}
          placeholder="찾으시는 에러코드(예: 53, E1) 또는 증상을 입력하세요..."
          className="flex-1 bg-transparent text-xs font-bold text-stone-100 outline-none placeholder-stone-500 py-1.2 border-0"
        />
        {searchKwd && (
          <button
            type="button"
            onClick={() => setSearchKwd('')}
            className="text-stone-400 hover:text-stone-100 text-[10.5px] font-bold px-2 py-0.8 rounded hover:bg-stone-900 cursor-pointer transition-all"
          >
            초기화
          </button>
        )}
      </div>

      {/* 2. 세로 스크롤 매뉴얼 리스트 레이아웃 */}
      {filteredItems.length > 0 ? (
        <div className="flex flex-col gap-6 relative z-10 w-full">
          {filteredItems.map((item, idx) => {
            const itemHasVideo = item.videoFilenames && item.videoFilenames.length > 0;
            
            return (
              <React.Fragment key={item.id}>
                <div 
                  className="w-full bg-[#0b0a0f] border border-stone-900 rounded-3xl p-5 md:p-6 shadow-xl hover:border-stone-850 transition-all duration-300 relative overflow-hidden flex flex-col gap-4 text-left"
                >
                  {item.type === 'error' && item.status === 'critical' && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start w-full">
                    
                    {/* Left Column: 매뉴얼 텍스트 (비디오 유무에 따라 가로 폭 조절 - 가독성 향상을 위해 폭 확대) */}
                    <div className={`flex flex-col gap-3.5 text-left ${itemHasVideo ? "lg:col-span-8" : "lg:col-span-12"}`}>
                      
                      {/* 에러 및 일상케어 배지 명판 */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.type === 'error' ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${
                            item.status === 'critical' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/35 shadow-[0_0_8px_rgba(239,68,68,0.15)]' 
                              : item.status === 'warning'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/35 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/35 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                          }`}>
                            Error Code {item.code}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-stone-900 text-[#C5A059] border border-stone-800">
                            정기 일상 케어
                          </span>
                        )}
                        <span className="text-[9px] text-stone-550 font-mono tracking-widest">HST-GUIDE-{item.id.substring(item.id.length - 3).toUpperCase()}</span>
                      </div>

                      {/* 대제목 (에러 코드 매칭 타이포) */}
                      <div className="text-base md:text-lg font-bold tracking-tight leading-snug" style={{ color: '#e7e5e4', display: 'block', fontSize: '19px' }}>
                        {item.type === 'error' 
                          ? `Error Code ${item.code} : ${item.title}` 
                          : item.title
                        }
                      </div>
                      
                      {/* 매뉴얼 상세 개요 */}
                      <div className="text-[14px] md:text-sm font-medium leading-relaxed" style={{ color: '#a8a29e', display: 'block', fontSize: '15px' }}>
                        {item.desc}
                      </div>

                      {/* 조치 프로세스 목록 */}
                      <div className="flex flex-col gap-2.5 pt-1.5 w-full text-left">
                        <div className="text-[12px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                          <CheckSquare size={12} className="text-[#C5A059]" />
                          <span>현장 조치 프로세스 가이드</span>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                          {item.steps.map((step, idx) => {
                            const isImportant = step.startsWith('★');
                            return (
                              <div 
                                key={idx} 
                                className="flex items-start gap-2.5 p-2.5 rounded-xl text-xs md:text-sm font-bold leading-relaxed transition-all duration-200 text-left"
                                style={{
                                  backgroundColor: isImportant ? 'rgba(239, 68, 68, 0.1)' : 'rgba(28, 25, 23, 0.4)',
                                  color: isImportant ? '#fca5a5' : '#d6d3d1',
                                  border: '1px solid',
                                  borderColor: isImportant ? 'rgba(239, 68, 68, 0.2)' : 'rgba(28, 25, 23, 0.1)',
                                  fontSize: '14.5px'
                                }}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] shrink-0 font-black mt-0.5 ${
                                  isImportant 
                                    ? 'bg-red-955 text-red-400 shadow-[0_0_6px_rgba(239,68,68,0.2)] border border-red-900/60' 
                                    : 'bg-stone-900 text-stone-555 border border-stone-850'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Right Column: 동영상 플레이어 (가로 폭에 맞춰 세로로 배치) */}
                    {itemHasVideo && (
                      <div className="lg:col-span-4 flex flex-col gap-4 w-full">
                        {item.videoFilenames!.map((vid) => {
                          const videoLabel = getVideoLabel(vid);
                          return (
                            <div key={vid} className="flex flex-col gap-1.5 w-full">
                              <div className="relative w-full aspect-video bg-black overflow-hidden shadow-lg rounded-2xl border border-stone-900 group/screen">
                                <div className="absolute inset-0 border-[3px] border-stone-950 pointer-events-none z-10" />
                                <video
                                  src={`/videos/${vid}`}
                                  className="w-full h-full object-contain relative z-0"
                                  controls
                                  preload="metadata"
                                  playsInline
                                />
                              </div>
                              <span className="text-[13px] text-center font-bold text-stone-300 font-sans tracking-tight block">
                                {videoLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                </div>
                {/* Subtle gold gradient divider line */}
                {idx < filteredItems.length - 1 && (
                  <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#C5A059]/75 to-transparent my-6 relative z-10" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-stone-455 font-bold bg-[#111015] rounded-xl border border-stone-900 relative z-10">
          선택된 기기 분류 또는 검색 조건에 부합하는 매뉴얼 지침 가이드가 없습니다.
        </div>
      )}

      {/* 운영가이드 하단 안내 */}
      <div className="mt-8 pt-4 border-t border-stone-900 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[13px] font-bold text-stone-500 relative z-10">
        <div className="flex items-center gap-1.5">
          <Cpu size={11} />
          <span>본 가이드는 기기 펌웨어 및 릴리 버전 v2.4.0 규격을 기준으로 작성되었습니다.</span>
        </div>
        <div className="flex items-center gap-1">
          <span>긴급 장애 및 A/S 문의: 통합 헬프데스크 (1544-XXXX)</span>
        </div>
      </div>

    </div>
  );
};
