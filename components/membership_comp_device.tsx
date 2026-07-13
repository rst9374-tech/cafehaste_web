import React, { useState } from 'react';
import { 
  Sliders, Coffee, Play, Undo2, Terminal, CupSoda
} from 'lucide-react';

interface MockOrder {
  id: string;
  items: string;
  amount: number;
  date: string;
  status: 'PAID' | 'REFUNDED';
}

interface MockMenu {
  id: string;
  name: string;
  price: number;
  category: 'COFFEE' | 'BEVERAGE';
  type: 'HOT' | 'ICED';
}

export const MembershipCompDevice: React.FC = () => {
  // 모의 메뉴 데이터 (카테고리 항목 분리)
  const menuList: MockMenu[] = [
    { id: 'm1', name: '아메리카노 (HOT)', price: 3000, category: 'COFFEE', type: 'HOT' },
    { id: 'm2', name: '아메리카노 (ICED)', price: 3000, category: 'COFFEE', type: 'ICED' },
    { id: 'm3', name: '카페라떼 (HOT)', price: 3500, category: 'COFFEE', type: 'HOT' },
    { id: 'm4', name: '카페라떼 (ICED)', price: 3500, category: 'COFFEE', type: 'ICED' },
    { id: 'm5', name: '바닐라라떼 (ICED)', price: 3800, category: 'COFFEE', type: 'ICED' },
    { id: 'm6', name: '복숭아 아이스티 (ICED)', price: 3200, category: 'BEVERAGE', type: 'ICED' },
    { id: 'm7', name: '자몽에이드 (ICED)', price: 4000, category: 'BEVERAGE', type: 'ICED' }
  ];

  // 카테고리 정의
  const categories = [
    { id: 'COFFEE', name: '커피 (Coffee)' },
    { id: 'BEVERAGE', name: '음료/에이드 (Beverage)' }
  ];

  // 모의 결제 내역 데이터
  const [orders, setOrders] = useState<MockOrder[]>([
    { id: 'HST-26071101', items: '아메리카노 (HOT) 1잔', amount: 3000, date: '12:15:30', status: 'PAID' },
    { id: 'HST-26071102', items: '카페라떼 (ICED) 1잔, 복숭아 아이스티 (ICED) 1잔', amount: 6700, date: '12:20:12', status: 'PAID' },
    { id: 'HST-26071103', items: '자몽에이드 (ICED) 1잔', amount: 4000, date: '12:28:45', status: 'PAID' },
    { id: 'HST-26071104', items: '바닐라라떼 (ICED) 1잔', amount: 3800, date: '12:31:02', status: 'PAID' }
  ]);

  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<'COFFEE' | 'BEVERAGE'>('COFFEE');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('m1');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewingProgress, setBrewingProgress] = useState(0);
  const [brewingName, setBrewingName] = useState('');
  const [logs, setLogs] = useState<string[]>([
    'cafehaste-agent 온라인 연동 상태 확인 완료.'
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  // 카테고리 변경 시 해당 카테고리의 첫번째 음료로 연동 자동 전환
  const handleCategoryChange = (cat: 'COFFEE' | 'BEVERAGE') => {
    setSelectedCategory(cat);
    const filtered = menuList.filter(m => m.category === cat);
    if (filtered.length > 0) {
      setSelectedMenuId(filtered[0].id);
    }
  };

  // 1. 컵 추출
  const handleDispenseCup = (type: 'HOT' | 'ICED') => {
    addLog(`[컵추출] 원격 기기 ${type} 컵 강제 배출 명령 전송`);
    alert(`[원격 제어] 지점으로 ${type} 컵 강제 배출 명령을 보냈습니다.`);
    addLog(`[컵추출] ${type} 컵 배출 성공 (센서 감지 완료)`);
  };

  // 2. 음료 추출
  const handleBrewDrink = () => {
    const target = menuList.find(m => m.id === selectedMenuId);
    if (!target) return;
    if (isBrewing) {
      alert('현재 기기가 음료를 제조 중입니다.');
      return;
    }

    setBrewingName(target.name);
    setIsBrewing(true);
    setBrewingProgress(0);
    addLog(`[음료추출] ${target.name} 음료 제조 명령 전송`);

    // 0.25초마다 프로그레스바 증가 시뮬레이션
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setBrewingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsBrewing(false);
          addLog(`[음료추출] ${target.name} 제조 및 추출 완료`);
          alert(`[원격 제어] ${target.name} 음료가 성공적으로 추출되었습니다.`);
        }, 300);
      }
    }, 250);
  };

  // 3. 음료 환불
  const handleRefundOrder = () => {
    if (!selectedOrderId) {
      alert('환불 처리할 결제 내역을 선택해 주세요.');
      return;
    }

    const targetOrder = orders.find(o => o.id === selectedOrderId);
    if (!targetOrder) return;
    if (targetOrder.status === 'REFUNDED') {
      alert('이미 환불 처리 완료된 거래 내역입니다.');
      return;
    }

    const confirmRefund = window.confirm(`주문번호 ${targetOrder.id} (${targetOrder.amount.toLocaleString()}원) 건을 강제 환불 처리하시겠습니까?`);
    if (!confirmRefund) return;

    addLog(`[음료환불] 주문번호 ${targetOrder.id} 결제 승인 취소 요청`);
    
    // 상태 업데이트
    setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: 'REFUNDED' } : o));
    addLog(`[음료환불] 주문번호 ${targetOrder.id} 취소 및 환불 완료`);
    alert(`[원격 제어] 주문번호 ${targetOrder.id} 건에 대한 환불(승인 취소) 처리가 완료되었습니다.`);
  };

  return (
    <div className="w-full bg-[#070609]/95 border border-stone-900 rounded-2xl p-4 md:p-5 text-stone-300 font-sans shadow-lg text-left">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stone-900 pb-1.5 mb-3">
        <span className="text-[10.5px] font-sans font-bold text-[#C5A059] tracking-wider uppercase flex items-center gap-1.5">
          <Sliders className="w-3 h-3 text-[#C5A059]" />
          02 REMOTE HARDWARE CONTROL
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider font-sans">AGENT ONLINE</span>
        </div>
      </div>

      <p className="text-[11.5px] text-stone-400 font-light leading-relaxed mb-4">
        지점의 음료 자판 기기 원격 명령 패널입니다. 기기 물리 동작 제어 및 키오스크 주문 환불을 관제합니다.
      </p>

      {/* 3단 대기능 레이아웃 */}
      <div className="flex flex-col gap-4.5">
        
        {/* 1. 컵 추출 */}
        <div className="bg-[#111015] border border-stone-900 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <CupSoda size={14} className="text-[#C5A059]" />
            <h4 className="text-[12.5px] font-bold text-stone-200">1. 컵 추출</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDispenseCup('HOT')}
              className="py-2.5 bg-rose-955/20 hover:bg-rose-955/40 text-rose-455 border border-rose-900/50 hover:border-rose-700/60 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              HOT 컵 추출
            </button>
            <button
              type="button"
              onClick={() => handleDispenseCup('ICED')}
              className="py-2.5 bg-sky-955/20 hover:bg-sky-955/40 text-sky-455 border border-sky-900/50 hover:border-sky-700/60 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              ICED 컵 추출
            </button>
          </div>
        </div>

        {/* 2. 음료 추출 */}
        <div className="bg-[#111015] border border-stone-900 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 mb-0.5">
            <Coffee size={14} className="text-[#C5A059]" />
            <h4 className="text-[12.5px] font-bold text-stone-200">2. 음료 추출</h4>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* 카테고리 드롭다운 */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-stone-950 border border-stone-900 rounded-lg text-[12px] font-sans text-stone-300 outline-hidden focus:border-[#C5A059]/40 cursor-pointer text-stone-300"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-stone-950 text-stone-300">
                  {cat.name}
                </option>
              ))}
            </select>

            {/* 음료 드롭다운 */}
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="flex-1 px-3 py-2 bg-stone-950 border border-stone-900 rounded-lg text-[12px] font-sans text-stone-300 outline-hidden focus:border-[#C5A059]/40 cursor-pointer text-stone-300"
            >
              {menuList
                .filter(m => m.category === selectedCategory)
                .map((menu) => (
                  <option key={menu.id} value={menu.id} className="bg-stone-950 text-stone-300">
                    {menu.name} - {menu.price.toLocaleString()}원
                  </option>
                ))}
            </select>
            
            <button
              type="button"
              onClick={handleBrewDrink}
              disabled={isBrewing}
              className={`px-4 py-2 text-[11.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm shrink-0 ${
                isBrewing 
                  ? 'bg-stone-900 text-stone-600 border border-stone-850 cursor-not-allowed'
                  : 'bg-[#C5A059] hover:bg-[#b08e4d] text-stone-950 border border-[#C5A059]'
              }`}
            >
              <Play size={11} className="fill-current" />
              음료 추출
            </button>
          </div>

          {/* 제조 프로그레스 바 */}
          {isBrewing && (
            <div className="bg-stone-955 border border-stone-900 p-2 rounded-lg flex flex-col gap-1.5 animate-fade-in">
              <div className="flex justify-between text-[10.5px] font-sans">
                <span className="text-stone-400 font-bold">{brewingName} 추출 중...</span>
                <span className="text-[#C5A059] font-bold">{brewingProgress}%</span>
              </div>
              <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#C5A059] h-full rounded-full transition-all duration-200 ease-out shadow-[0_0_8px_#C5A059]"
                  style={{ width: `${brewingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. 음료 환불 */}
        <div className="bg-[#111015] border border-stone-900 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex justify-between items-center mb-0.5">
            <div className="flex items-center gap-2">
              <Undo2 size={14} className="text-[#C5A059]" />
              <h4 className="text-[12.5px] font-bold text-stone-200">3. 음료 환불</h4>
            </div>
            <button
              type="button"
              onClick={handleRefundOrder}
              disabled={!selectedOrderId}
              className={`px-3 py-1 text-[10.5px] font-bold rounded transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                selectedOrderId
                  ? 'bg-rose-955 text-rose-455 border border-rose-900/50'
                  : 'bg-stone-955 text-stone-600 border border-stone-900 cursor-not-allowed'
              }`}
            >
              <Undo2 size={10} />
              환불하기
            </button>
          </div>

          {/* 결제 내역 리스트 */}
          <div className="border border-stone-900 rounded-lg overflow-hidden max-h-36 overflow-y-auto bg-stone-955/50">
            <table className="w-full text-left text-[11px] font-sans border-collapse">
              <thead>
                <tr className="bg-stone-900 text-stone-500 font-bold border-b border-stone-900 select-none">
                  <th className="p-2 w-7"></th>
                  <th className="p-2">주문번호</th>
                  <th className="p-2">메뉴 및 수량</th>
                  <th className="p-2 text-right">금액</th>
                  <th className="p-2 text-center">상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr 
                    key={order.id}
                    onClick={() => order.status === 'PAID' && setSelectedOrderId(order.id)}
                    className={`border-b border-stone-900/50 transition-colors cursor-pointer ${
                      order.status === 'REFUNDED' 
                        ? 'text-stone-600 bg-stone-955/10 cursor-not-allowed' 
                        : selectedOrderId === order.id
                          ? 'bg-[#C5A059]/10 text-white font-bold'
                          : 'hover:bg-stone-900/40 text-stone-400'
                    }`}
                  >
                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="radio" 
                        name="refund-item"
                        checked={selectedOrderId === order.id}
                        disabled={order.status === 'REFUNDED'}
                        onChange={() => setSelectedOrderId(order.id)}
                        className="cursor-pointer accent-[#C5A059] disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="p-2 font-mono">{order.id}</td>
                    <td className="p-2 truncate max-w-xs">{order.items}</td>
                    <td className="p-2 text-right font-bold">{order.amount.toLocaleString()}원</td>
                    <td className="p-2 text-center">
                      {order.status === 'PAID' ? (
                        <span className="px-1.5 py-0.2 bg-emerald-950/30 text-emerald-450 border border-emerald-900/50 text-[9px] rounded font-bold">결제완료</span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-stone-900 text-stone-600 text-[9px] rounded font-bold">환불완료</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 실시간 콘솔 로그 (글씨 크기 축소 적용) */}
      <div className="mt-4 bg-stone-955 border border-stone-900 rounded-xl p-2.5 flex flex-col gap-1 font-mono">
        <div className="flex items-center gap-1 text-[8.5px] text-stone-500 font-bold uppercase tracking-wider select-none border-b border-stone-900 pb-1.5 mb-1.5">
          <Terminal size={9.5} className="text-[#C5A059]" />
          <span>Remote Activity Logs (실시간 수신로그)</span>
        </div>
        <div className="flex flex-col gap-1 text-[8.5px] text-[#C5A059] leading-relaxed max-h-24 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="truncate">
              {log.includes('완료') || log.includes('성공') ? (
                <span className="text-emerald-500">{log}</span>
              ) : log.includes('취소') || log.includes('환불') ? (
                <span className="text-rose-455">{log}</span>
              ) : (
                <span>{log}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <span className="text-[10px] text-stone-500 leading-snug block border-t border-stone-900 pt-2.5 mt-3.5 font-sans">
        ⚠️ 실제 환불 처리는 키오스크 연동 토스페이먼츠(Toss Payments) 정산 관리국과 실시간 파이프라인으로 동기화됩니다.
      </span>
    </div>
  );
};
