import React, { useState } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { PageRoute } from './home_hook_swipe';

// Re-export HasteControlPanel from split file for backward compatibility
export { HasteControlPanel } from './membership_comp_controlpanel';
import { HasteControlPanel } from './membership_comp_controlpanel';

interface HasteControlPageProps {
  user: any;
  navigateTo: (route: PageRoute) => void;
}

export const HasteControlPage: React.FC<HasteControlPageProps> = ({ user, navigateTo }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!user) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 font-sans text-center py-20">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm flex flex-col items-center gap-4">
          <div className="text-stone-500 font-serif text-lg font-bold">로그인이 필요합니다</div>
          <p className="text-stone-500 text-xs leading-relaxed">해당 정보 페이지는 승인된 헤이스트 멤버십 점주 전용 영역입니다.</p>
          <button onClick={() => navigateTo('HOME')} className="mt-2 w-full py-2.5 bg-stone-900 hover:bg-black text-[#C5A059] text-xs font-bold rounded-lg transition-all">홈으로 이동</button>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); }, 1000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 font-sans">
      <div className="bg-white border border-stone-200 rounded-[32px] p-5 md:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-150 pb-5">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigateTo('MYINFO')} 
              className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-500 hover:text-stone-850 transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] block uppercase leading-none">HASTE SYSTEM CONTROL</span>
              <h2 className="text-xl font-bold tracking-tight mt-1.5 text-stone-900">매장 정보 통합 제어반 (원격 연동)</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => navigateTo('MYINFO')} 
              className="font-bold text-xs py-2.5 px-4 bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-750 border border-stone-300 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
            >
              <ChevronLeft size={13} className="text-[#C5A059]" />
              <span>내 정보</span>
            </button>
            <button 
              type="button" 
              onClick={handleRefresh} 
              className="p-2.5 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-all text-stone-550 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center shrink-0"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        <HasteControlPanel user={user} />
      </div>
    </div>
  );
};
