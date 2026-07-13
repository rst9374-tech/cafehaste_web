import React from 'react';

interface HomeSimulatorProps {
  mockMobileFrame: boolean;
  setMockMobileFrame: (val: boolean) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  children: React.ReactNode;
  isFilm?: boolean;
}

export const HomeSimulator: React.FC<HomeSimulatorProps> = ({
  mockMobileFrame,
  setMockMobileFrame,
  handleTouchStart,
  handleTouchEnd,
  children,
  isFilm = false
}) => {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isFilm ? 'bg-[#0A0A0C]' : 'bg-[var(--haste-body-bg)]'} relative selection:bg-[#C5A059] selection:text-stone-950`}>
      {mockMobileFrame ? (
        /* ==================== EMULATOR/SIMULATOR MODE ==================== */
        <div className="fixed inset-0 bg-[#0C0A09]/95 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-4 overflow-y-auto">
          
          {/* Emulator Controls Header */}
          <div className="mb-5 text-center max-w-md w-full flex flex-col items-center gap-1 z-[160] font-sans">
            <div className="flex items-center gap-2.5 mt-2.5 bg-stone-900 border border-stone-800 p-1 rounded-full shadow-lg">
              <span className="text-[10px] text-[#C5A059] px-3 font-medium">스마트폰 뷰 활성</span>
              <div className="h-4 w-px bg-stone-800" />
              <button
                type="button"
                onClick={() => setMockMobileFrame(false)}
                className="px-3.5 py-1 bg-red-650 hover:bg-red-700 text-[9.5px] font-bold text-white rounded-full transition-all cursor-pointer shadow"
              >
                닫기 ✕
              </button>
            </div>
          </div>

          {/* Smartphone Chassis wrapper */}
          <div className={`w-[468px] h-[938px] ${isFilm ? 'bg-[#0A0A0C]' : 'bg-[var(--haste-body-bg)]'} rounded-[62px] border-[14px] border-stone-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col z-[150] pt-10 shrink-0`}>
            {/* Dynamic Island Decor */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-[100] flex items-center justify-between px-3 select-none pointer-events-none">
              <span className="text-[9.5px] text-[#C5A059] font-extrabold font-mono">13:20</span>
              <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
              <span className="text-[7.5px] text-stone-550 font-extrabold font-mono pointer-events-none">LTE</span>
            </div>

            {/* Simulated Body Content (Renders the actual App layout inside the Phone chassis) */}
            <div 
              id="chassis-scroll-container"
              className={`w-full h-full overflow-y-auto overflow-x-hidden relative ${isFilm ? 'bg-[#0A0A0C]' : 'bg-[var(--haste-body-bg)]'} scrollbar-thin select-text`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {children}
            </div>
          </div>
        </div>
      ) : (
        /* ==================== NORMAL FULL SCREEN MODE ==================== */
        <div 
          className="w-full min-h-screen relative flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {children}
        </div>
      )}
    </div>
  );
};
