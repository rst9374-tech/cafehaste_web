import React from 'react';

interface BoardCompWriteDirectDealProps {
  dealStatus: string;
  setDealStatus: (val: string) => void;
  machineModel: string;
  setMachineModel: (val: string) => void;
  rentalType: string;
  setRentalType: (val: string) => void;
  openYearMonth: string;
  setOpenYearMonth: (val: string) => void;
  dealPrice: string;
  setDealPrice: (val: string) => void;
  writeCategory: string;
}

export const BoardCompWriteDirectDeal: React.FC<BoardCompWriteDirectDealProps> = ({
  dealStatus,
  setDealStatus,
  machineModel,
  setMachineModel,
  rentalType,
  setRentalType,
  openYearMonth,
  setOpenYearMonth,
  dealPrice,
  setDealPrice,
  writeCategory
}) => {
  if (writeCategory !== '직거래') return null;

  return (
    <div className="bg-stone-50/90 border border-stone-255/90 rounded-2xl p-4 md:p-5 flex flex-col gap-4 my-1">
      <span className="text-[10px] font-mono tracking-widest text-[#8C6D37] font-bold">
        DIRECT DEAL TRANSACTION INFO
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* 거래 상태 */}
        <div>
          <label className="block text-stone-900 text-[11.5px] font-black mb-1.5">거래 상태 *</label>
          <div className="flex bg-stone-100/50 border border-stone-200/80 rounded-xl p-0.5 w-full shadow-3xs">
            {['판매중', '거래진행중', '완료'].map((status) => {
              const isActive = dealStatus === status;
              let activeClass = '';
              if (status === '판매중') {
                activeClass = 'bg-[#C5A059] text-stone-950 shadow-3xs font-extrabold';
              } else if (status === '거래진행중') {
                activeClass = 'bg-[#2F527E] text-white shadow-3xs font-extrabold';
              } else {
                activeClass = 'bg-stone-500 text-white shadow-3xs font-extrabold';
              }
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setDealStatus(status)}
                  className={`flex-1 text-center py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    isActive ? activeClass : 'text-stone-550 hover:text-stone-900 hover:bg-stone-200/40 font-semibold'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* 기종 선택 */}
        <div>
          <label className="block text-stone-900 text-[11.5px] font-black mb-1.5">기종 선택 *</label>
          <div className="flex bg-stone-100/50 border border-stone-200/80 rounded-xl p-0.5 w-full shadow-3xs">
            {['릴리', '미니'].map((model) => {
              const isActive = machineModel === model;
              let activeClass = model === '릴리' 
                ? 'bg-[#C5A059] text-stone-950 shadow-3xs font-extrabold' 
                : 'bg-stone-850 text-white shadow-3xs font-extrabold';
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => setMachineModel(model)}
                  className={`flex-1 text-center py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    isActive ? activeClass : 'text-stone-550 hover:text-stone-900 hover:bg-stone-200/40 font-semibold'
                  }`}
                >
                  {model}
                </button>
              );
            })}
          </div>
        </div>

        {/* 렌탈 유무 */}
        <div>
          <label className="block text-stone-900 text-[11.5px] font-black mb-1.5">렌탈 유무 *</label>
          <div className="flex bg-stone-100/50 border border-stone-200/80 rounded-xl p-0.5 w-full shadow-3xs">
            {['렌탈기계', '자가기계'].map((type) => {
              const isActive = rentalType === type;
              let activeClass = type === '렌탈기계' 
                ? 'bg-emerald-700 text-white shadow-3xs font-extrabold' 
                : 'bg-[#8C6D37] text-white shadow-3xs font-extrabold';
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRentalType(type)}
                  className={`flex-1 text-center py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    isActive ? activeClass : 'text-stone-550 hover:text-stone-900 hover:bg-stone-200/40 font-semibold'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* 최초 오픈 년월 */}
        <div>
          <label className="block text-stone-900 text-[11.5px] font-black mb-1.5">최초 오픈년월 *</label>
          <input
            type="text"
            required={writeCategory === '직거래'}
            value={openYearMonth}
            onChange={(e) => setOpenYearMonth(e.target.value)}
            placeholder="예: 2024년 05월"
            className="w-full rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] py-2 px-3.5 shadow-3xs"
          />
        </div>

        {/* 판매 가격 */}
        <div>
          <label className="block text-stone-900 text-[11.5px] font-black mb-1.5">판매 가격 (만원) *</label>
          <input
            type="text"
            required={writeCategory === '직거래'}
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="예: 350 (숫자만 입력)"
            className="w-full rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] py-2 px-3.5 shadow-3xs"
          />
        </div>
      </div>
    </div>
  );
};
