import React, { useState } from 'react';

interface CoffeeMachineSetting {
  name: string;
  ip: string;
  port: number;
  model: string;
  rebootAttemptCount: number;
  button: {
    coffee: Record<string, number>;
    coldMilk: Record<string, number>;
    hotMilk: Record<string, number>;
  };
}

interface BeanSetting {
  seq: string;
  name: string;
  openParts: string;
  closeParts: string;
  openCloseIntervalSec: number;
  closeOpenIntervalSec: number;
  capacity: number;
  stockManagement: boolean;
  protocol: string;
}

interface CoffeeSetting {
  coffeeProtocol: string;
  milkProtocol: string;
  beanBlower: string;
  miniRoaster: string;
  beanTransfer: string;
  beanSensor: string;
  foamerRinsingIntervalSec: number;
  warmRinsingIntervalSec: number;
  mixerRinsingIntervalSec: number;
  coffeeCapacity: number;
  milkCapacity: number;
  coffeeStockManagement: boolean;
  milkStockManagement: boolean;
  errorCheckIntervalSec: number;
  temperatureCheckIntervalSec: number;
  waitTimeWhenAbnormalSec: number;
  machines: CoffeeMachineSetting[];
  beans: BeanSetting[];
}

export function SettingsCoffee({
  data,
  onChange
}: {
  data: CoffeeSetting;
  onChange: (patch: Partial<CoffeeSetting>) => void;
}) {
  const [coffeeProtocol, setCoffeeProtocol] = useState(data.coffeeProtocol || 'COFFEE');
  const [milkProtocol, setMilkProtocol] = useState(data.milkProtocol || 'MILK');
  const [coffeeCapacity, setCoffeeCapacity] = useState(data.coffeeCapacity || 7000);
  const [milkCapacity, setMilkCapacity] = useState(data.milkCapacity || 12000);
  
  const [machines, setMachines] = useState<CoffeeMachineSetting[]>(data.machines || []);
  const [beans, setBeans] = useState<BeanSetting[]>(data.beans || []);
  const [activeMachineIndex, setActiveMachineIndex] = useState(0);

  const updateBase = (key: keyof CoffeeSetting, val: any) => {
    onChange({ [key]: val });
  };

  const updateMachineButton = (mIdx: number, type: 'coffee' | 'coldMilk' | 'hotMilk', btnKey: string, nextBtnVal: number) => {
    const nextMachines = machines.map((m, idx) => {
      if (idx !== mIdx) return m;
      const nextBtnMap = { ...m.button[type], [btnKey]: nextBtnVal };
      return { ...m, button: { ...m.button, [type]: nextBtnMap } };
    });
    setMachines(nextMachines);
    onChange({ machines: nextMachines });
  };

  const activeMachine = machines[activeMachineIndex];

  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      {/* 기본 장비 프로토콜 설정 */}
      <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">커피/밀크 기본 설정</h3>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">커피 추출 프로토콜</label>
            <input
              type="text"
              value={coffeeProtocol}
              onChange={(e) => {
                setCoffeeProtocol(e.target.value);
                updateBase('coffeeProtocol', e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">우유 추출 프로토콜</label>
            <input
              type="text"
              value={milkProtocol}
              onChange={(e) => {
                setMilkProtocol(e.target.value);
                updateBase('milkProtocol', e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">원두 최대 적재량 (g)</label>
            <input
              type="number"
              value={coffeeCapacity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCoffeeCapacity(val);
                updateBase('coffeeCapacity', val);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">우유 최대 적재량 (ml)</label>
            <input
              type="number"
              value={milkCapacity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMilkCapacity(val);
                updateBase('milkCapacity', val);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            />
          </div>
        </div>
      </div>

      {/* 커피머신 버튼 맵핑 */}
      {activeMachine && (
        <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">커피머신 버튼 맵핑 ({activeMachine.name})</h3>
          <p className="text-[10px] text-[#71717A] mb-3">WMF 기기에서 추출할 때 들이댈 내부 추출 신호 번호 설정 테이블입니다.</p>

          <div className="grid gap-4.5 md:grid-cols-3">
            {/* 커피 버튼 */}
            <div className="rounded-lg border border-[#27272A]/60 bg-[#141416] p-3">
              <h4 className="text-[10.5px] font-bold text-white mb-2 border-b border-[#27272A] pb-1">에스프레소 추출 신호 번호</h4>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {Object.entries(activeMachine.button.coffee).map(([amt, btnNo]) => (
                  <div key={amt} className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#A1A1AA]">{amt}g</span>
                    <input
                      type="number"
                      value={btnNo}
                      onChange={(e) => updateMachineButton(activeMachineIndex, 'coffee', amt, Number(e.target.value))}
                      className="w-16 rounded border border-[#27272A] bg-[#0E0E10] px-2 py-1 text-xs text-white text-right outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 온우유 버튼 */}
            <div className="rounded-lg border border-[#27272A]/60 bg-[#141416] p-3">
              <h4 className="text-[10.5px] font-bold text-white mb-2 border-b border-[#27272A] pb-1">온우유 추출 신호 번호</h4>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {Object.entries(activeMachine.button.hotMilk).map(([amt, btnNo]) => (
                  <div key={amt} className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#A1A1AA]">{amt}ml</span>
                    <input
                      type="number"
                      value={btnNo}
                      onChange={(e) => updateMachineButton(activeMachineIndex, 'hotMilk', amt, Number(e.target.value))}
                      className="w-16 rounded border border-[#27272A] bg-[#0E0E10] px-2 py-1 text-xs text-white text-right outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 냉우유 버튼 */}
            <div className="rounded-lg border border-[#27272A]/60 bg-[#141416] p-3">
              <h4 className="text-[10.5px] font-bold text-white mb-2 border-b border-[#27272A] pb-1">냉우유 추출 신호 번호</h4>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {Object.entries(activeMachine.button.coldMilk).map(([amt, btnNo]) => (
                  <div key={amt} className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#A1A1AA]">{amt}ml</span>
                    <input
                      type="number"
                      value={btnNo}
                      onChange={(e) => updateMachineButton(activeMachineIndex, 'coldMilk', amt, Number(e.target.value))}
                      className="w-16 rounded border border-[#27272A] bg-[#0E0E10] px-2 py-1 text-xs text-white text-right outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
