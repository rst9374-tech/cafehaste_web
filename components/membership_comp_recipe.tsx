import React, { useState } from 'react';
import { Coffee, RotateCcw, Save, Sliders, Cpu } from 'lucide-react';

interface RecipeValues {
  water: number;  // 물 (ml)
  ice: number;    // 얼음 (g)
  soda: number;   // 탄산 (ml)
  syrup: number;  // 시럽 (ml)
  milk: number;   // 우유 (ml)
  beans: number;  // 원두 (g)
}

interface MenuItem {
  id: string;
  name: string;
  values: RecipeValues;
  defaultValues: RecipeValues;
}

export const MembershipCompRecipe: React.FC = () => {
  // 로딩 상태 및 레시피 데이터 수신 여부
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 음료 목록 및 레시피 값
  const [recipes, setRecipes] = useState<MenuItem[]>([
    {
      id: 'r1',
      name: '아메리카노 (HOT)',
      values: { water: 220, ice: 0, soda: 0, syrup: 0, milk: 0, beans: 18 },
      defaultValues: { water: 220, ice: 0, soda: 0, syrup: 0, milk: 0, beans: 18 }
    },
    {
      id: 'r2',
      name: '아메리카노 (ICED)',
      values: { water: 150, ice: 120, soda: 0, syrup: 0, milk: 0, beans: 18 },
      defaultValues: { water: 150, ice: 120, soda: 0, syrup: 0, milk: 0, beans: 18 }
    },
    {
      id: 'r3',
      name: '카페라떼 (HOT)',
      values: { water: 30, ice: 0, soda: 0, syrup: 0, milk: 180, beans: 18 },
      defaultValues: { water: 30, ice: 0, soda: 0, syrup: 0, milk: 180, beans: 18 }
    },
    {
      id: 'r4',
      name: '카페라떼 (ICED)',
      values: { water: 20, ice: 120, soda: 0, syrup: 0, milk: 150, beans: 18 },
      defaultValues: { water: 20, ice: 120, soda: 0, syrup: 0, milk: 150, beans: 18 }
    },
    {
      id: 'r5',
      name: '자몽에이드 (ICED)',
      values: { water: 0, ice: 125, soda: 160, syrup: 40, milk: 0, beans: 0 },
      defaultValues: { water: 0, ice: 125, soda: 160, syrup: 40, milk: 0, beans: 0 }
    },
    {
      id: 'r6',
      name: '복숭아 아이스티 (ICED)',
      values: { water: 140, ice: 120, soda: 0, syrup: 35, milk: 0, beans: 0 },
      defaultValues: { water: 140, ice: 120, soda: 0, syrup: 35, milk: 0, beans: 0 }
    }
  ]);

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('r1');

  // 커피머신으로부터 레시피 수신 시뮬레이션
  const handleFetchRecipes = () => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
          setIsLoaded(true);
        }, 300);
      }
    }, 200);
  };

  // 특정 슬라이더/인풋 수치 변경 핸들러
  const handleValueChange = (field: keyof RecipeValues, value: number) => {
    setRecipes(prev => prev.map(item => {
      if (item.id === selectedRecipeId) {
        return {
          ...item,
          values: {
            ...item.values,
            [field]: value
          }
        };
      }
      return item;
    }));
  };

  // 기기로 레시피 전송 시뮬레이션
  const handleSaveRecipe = () => {
    const current = recipes.find(r => r.id === selectedRecipeId);
    if (!current) return;
    
    alert(`[원격 레시피 전송] ${current.name}의 설정값(원두: ${current.values.beans}g, 물: ${current.values.water}ml, 우유: ${current.values.milk}ml 등)을 커피머신 플래시 메모리에 최종 동기화 완료했습니다.`);
  };

  // 기본값으로 원복
  const handleResetToDefault = () => {
    const current = recipes.find(r => r.id === selectedRecipeId);
    if (!current) return;

    if (window.confirm(`${current.name} 레시피를 최초 공장 출하 기본값으로 원복하시겠습니까?`)) {
      setRecipes(prev => prev.map(item => {
        if (item.id === selectedRecipeId) {
          return {
            ...item,
            values: { ...item.defaultValues }
          };
        }
        return item;
      }));
    }
  };

  const currentRecipe = recipes.find(r => r.id === selectedRecipeId);

  return (
    <div className="w-full bg-[#070609]/95 border border-stone-900 rounded-2xl p-4 md:p-5 text-stone-300 font-sans shadow-lg text-left">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stone-900 pb-1.5 mb-3">
        <span className="text-[10.5px] font-sans font-bold text-[#C5A059] tracking-wider uppercase flex items-center gap-1.5">
          <Coffee className="w-3 h-3 text-[#C5A059]" />
          03 LOCAL COFFEE MACHINE RECIPE SPEC
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider font-sans">MACHINE READY</span>
        </div>
      </div>

      <p className="text-[11.5px] text-stone-400 font-light leading-relaxed mb-4">
        지점 커피머신 하드웨어 펌웨어 보드와 직접 연결하여, 추출 성분 배합량(물, 얼음, 탄산, 시럽, 우유, 원두)을 상세 조정합니다.
      </p>

      {/* 1. 커피머신으로부터 설정값 불러오기 동작 전 */}
      {!isLoaded && !isLoading && (
        <div className="py-8 flex flex-col items-center justify-center text-center bg-[#111015] border border-stone-900 rounded-xl p-6 gap-4">
          <div className="w-12 h-12 rounded-full bg-stone-900/60 flex items-center justify-center border border-[#C5A059]/25 text-[#C5A059]">
            <Cpu size={24} className="animate-pulse" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-[13px] font-bold text-stone-200">기기 레시피 동기화 필요</h4>
            <p className="text-[11px] text-stone-500 leading-normal">
              연동된 커피머신(김포운양역점 HST-BREW-M01)으로부터 현재 레시피 설정 칩 데이터를 로드해야 조정할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFetchRecipes}
            className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08e4d] text-black text-[11.5px] font-bold rounded-lg transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5 font-sans border border-[#C5A059]"
          >
            커피머신 설정값 불러오기
          </button>
        </div>
      )}

      {/* 2. 불러오는 중 로딩 상태 */}
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center text-center bg-[#111015] border border-stone-900 rounded-xl p-6 gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer golden circle spin */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#C5A059]/20 border-t-[#C5A059] animate-spin" />
            <span className="text-[11px] font-mono font-bold text-[#C5A059]">{loadingProgress}%</span>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-[13px] font-bold text-stone-200">기기 레시피 정보 로드 중</h4>
            <p className="text-[11px] text-stone-500 font-mono">
              GET /api/device/spec/recipes ...
            </p>
          </div>
        </div>
      )}

      {/* 3. 수신 완료 후: 음료 목록(좌) + 레시피 조정 패널(우) */}
      {isLoaded && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
          
          {/* 음료 목록 (좌측) */}
          <div className="md:col-span-4 bg-[#111015] border border-stone-900 rounded-xl p-3 flex flex-col gap-2 max-h-[460px] overflow-y-auto">
            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider select-none border-b border-stone-900 pb-1.5 mb-1.5">
              음료 목록 (수신완료)
            </div>
            
            <div className="flex flex-col gap-1.5">
              {recipes.map((item) => {
                const isSelected = item.id === selectedRecipeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRecipeId(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'bg-[#C5A059] text-black font-bold shadow-md'
                        : 'bg-stone-900/60 hover:bg-stone-900 text-stone-400 border border-stone-900'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>
                      원두 {item.values.beans}g
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 레시피 조정 패널 (우측) - 조절 바 트랙 배경색 시인성 극대화(bg-stone-800) */}
          <div className="md:col-span-8 bg-[#111015] border border-stone-900 rounded-xl p-4 flex flex-col justify-between min-h-[440px]">
            
            {currentRecipe && (
              <div className="flex flex-col gap-4">
                {/* 상단 튜닝 타겟 표시 */}
                <div className="flex justify-between items-center border-b border-stone-900 pb-2 mb-1.5">
                  <span className="text-[12px] font-bold text-stone-200 flex items-center gap-1.5">
                    <Sliders size={12} className="text-[#C5A059]" />
                    {currentRecipe.name} 레시피 조정
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[10px] text-stone-500 hover:text-stone-300 transition-all flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RotateCcw size={10} />
                    기본값 원복
                  </button>
                </div>

                {/* 성분 조절 그리드 (높이 간격 확대 및 숫자 수치 입력창 추가, bg-stone-800 선 가시성 복구) */}
                <div className="flex flex-col gap-3.5">
                  
                  {/* 1. 물 */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-stone-900/30">
                    <div className="flex justify-between items-center text-[11.5px]">
                      <span className="text-stone-400 font-bold">물 (Water)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="400"
                          value={currentRecipe.values.water}
                          onChange={(e) => handleValueChange('water', Math.max(0, Math.min(400, Number(e.target.value))))}
                          className="w-13 px-1.5 py-0.5 bg-stone-950 border border-stone-900 rounded-md text-[11px] text-center text-[#C5A059] font-mono focus:border-[#C5A059]/40 outline-hidden"
                        />
                        <span className="text-stone-500 font-sans text-[11px]">ml</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="400"
                        step="5"
                        value={currentRecipe.values.water}
                        onChange={(e) => handleValueChange('water', Number(e.target.value))}
                        className="flex-1 accent-[#C5A059] h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 2. 얼음 */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-stone-900/30">
                    <div className="flex justify-between items-center text-[11.5px]">
                      <span className="text-stone-400 font-bold">얼음 (Ice)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={currentRecipe.values.ice}
                          onChange={(e) => handleValueChange('ice', Math.max(0, Math.min(300, Number(e.target.value))))}
                          className="w-13 px-1.5 py-0.5 bg-stone-950 border border-stone-900 rounded-md text-[11px] text-center text-[#C5A059] font-mono focus:border-[#C5A059]/40 outline-hidden"
                        />
                        <span className="text-stone-500 font-sans text-[11px]">g</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="300"
                        step="5"
                        value={currentRecipe.values.ice}
                        onChange={(e) => handleValueChange('ice', Number(e.target.value))}
                        className="flex-1 accent-[#C5A059] h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 3. 탄산 */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-stone-900/30">
                    <div className="flex justify-between items-center text-[11.5px]">
                      <span className="text-stone-400 font-bold">탄산 (Soda)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="400"
                          value={currentRecipe.values.soda}
                          onChange={(e) => handleValueChange('soda', Math.max(0, Math.min(400, Number(e.target.value))))}
                          className="w-13 px-1.5 py-0.5 bg-stone-950 border border-stone-900 rounded-md text-[11px] text-center text-[#C5A059] font-mono focus:border-[#C5A059]/40 outline-hidden"
                        />
                        <span className="text-stone-500 font-sans text-[11px]">ml</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="400"
                        step="5"
                        value={currentRecipe.values.soda}
                        onChange={(e) => handleValueChange('soda', Number(e.target.value))}
                        className="flex-1 accent-[#C5A059] h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 4. 시럽 */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-stone-900/30">
                    <div className="flex justify-between items-center text-[11.5px]">
                      <span className="text-stone-400 font-bold">시럽 (Syrup)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentRecipe.values.syrup}
                          onChange={(e) => handleValueChange('syrup', Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-13 px-1.5 py-0.5 bg-stone-950 border border-stone-900 rounded-md text-[11px] text-center text-[#C5A059] font-mono focus:border-[#C5A059]/40 outline-hidden"
                        />
                        <span className="text-stone-500 font-sans text-[11px]">ml</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={currentRecipe.values.syrup}
                        onChange={(e) => handleValueChange('syrup', Number(e.target.value))}
                        className="flex-1 accent-[#C5A059] h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 5. 우유 */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-stone-900/30">
                    <div className="flex justify-between items-center text-[11.5px]">
                      <span className="text-stone-400 font-bold">우유 (Milk)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="400"
                          value={currentRecipe.values.milk}
                          onChange={(e) => handleValueChange('milk', Math.max(0, Math.min(400, Number(e.target.value))))}
                          className="w-13 px-1.5 py-0.5 bg-stone-950 border border-stone-900 rounded-md text-[11px] text-center text-[#C5A059] font-mono focus:border-[#C5A059]/40 outline-hidden"
                        />
                        <span className="text-stone-500 font-sans text-[11px]">ml</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="400"
                        step="5"
                        value={currentRecipe.values.milk}
                        onChange={(e) => handleValueChange('milk', Number(e.target.value))}
                        className="flex-1 accent-[#C5A059] h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 6. 원두 */}
                  <div className="flex flex-col gap-2 pb-1">
                    <div className="flex justify-between items-center text-[11.5px]">
                      <span className="text-stone-400 font-bold">원두 (Coffee Beans)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          step="0.5"
                          value={currentRecipe.values.beans}
                          onChange={(e) => handleValueChange('beans', Math.max(0, Math.min(30, Number(e.target.value))))}
                          className="w-13 px-1.5 py-0.5 bg-stone-950 border border-stone-900 rounded-md text-[11px] text-center text-[#C5A059] font-mono focus:border-[#C5A059]/40 outline-hidden"
                        />
                        <span className="text-stone-500 font-sans text-[11px]">g</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={currentRecipe.values.beans}
                        onChange={(e) => handleValueChange('beans', Number(e.target.value))}
                        className="flex-1 accent-[#C5A059] h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                </div>

                {/* 저장 전송 버튼 */}
                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  className="mt-3.5 w-full py-2.5 bg-[#C5A059] hover:bg-[#b08e4d] text-black text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md border border-[#C5A059]"
                >
                  <Save size={12} className="fill-current" />
                  설정값 커피머신으로 전송
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* 하단 버전 정보 */}
      <div className="text-[9.5px] text-stone-600 border-t border-stone-900 pt-2.5 mt-3.5 flex justify-between font-sans">
        <span>VERSION: v4.1.2-STABLE (김포운양역점 특화 펌웨어 스펙)</span>
        <span>SYS PORT: 8085</span>
      </div>
    </div>
  );
};
