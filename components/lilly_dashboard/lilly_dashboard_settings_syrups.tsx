import React, { useState } from 'react';

interface SyrupItem {
  seq: number;
  name: string;
  protocol: string;
  capacity: number;
  inventoryManagement: boolean;
  ratio: number;
  below: number;
  belowRatio: number;
  valveMotor: string;
  valveOpenTimeSec: number;
  flowSensor: string;
  reverseMotor: string;
  reverseMotorRunTimeSec: number;
}

interface SyrupSetting {
  discharge: 'ONE_BY_ONE' | 'TWO_AT_ONCE' | 'ALL_AT_ONE';
  flowCheckIntervalSec: number;
  dischargeColdMilkAsSyrup: boolean;
  syrups: SyrupItem[];
}

export function SettingsSyrups({
  data,
  onChange
}: {
  data: SyrupSetting;
  onChange: (patch: Partial<SyrupSetting>) => void;
}) {
  const [discharge, setDischarge] = useState<string>(data.discharge || 'ONE_BY_ONE');
  const [flowCheckIntervalSec, setFlowCheckIntervalSec] = useState<number>(data.flowCheckIntervalSec || 2);
  const [dischargeColdMilkAsSyrup, setDischargeColdMilkAsSyrup] = useState<boolean>(!!data.dischargeColdMilkAsSyrup);
  const [syrups, setSyrups] = useState<SyrupItem[]>(data.syrups || []);
  const [activeSeq, setActiveSeq] = useState<number>(syrups[0]?.seq || 1);

  const updateGlobalField = (key: keyof SyrupSetting, val: any) => {
    if (key === 'discharge') setDischarge(val);
    if (key === 'flowCheckIntervalSec') setFlowCheckIntervalSec(val);
    if (key === 'dischargeColdMilkAsSyrup') setDischargeColdMilkAsSyrup(val);
    onChange({ [key]: val });
  };

  const updateSyrupField = (seq: number, key: keyof SyrupItem, val: any) => {
    const nextSyrups = syrups.map(s => s.seq === seq ? { ...s, [key]: val } : s);
    setSyrups(nextSyrups);
    onChange({ syrups: nextSyrups });
  };

  const activeSyrup = syrups.find(s => s.seq === activeSeq);
  const partsList = [
    'NONE',
    'VALVE_MOTOR_1', 'VALVE_MOTOR_2', 'VALVE_MOTOR_3', 'VALVE_MOTOR_4', 
    'VALVE_MOTOR_5', 'VALVE_MOTOR_6', 'VALVE_MOTOR_7', 'VALVE_MOTOR_8',
    'FLOW_SENSOR_1', 'FLOW_SENSOR_2', 'FLOW_SENSOR_3', 'FLOW_SENSOR_4',
    'FLOW_SENSOR_5', 'FLOW_SENSOR_6', 'FLOW_SENSOR_7', 'FLOW_SENSOR_8'
  ];

  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5 flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">시럽 전역 설정</h3>
          <p className="text-[10px] text-[#71717A]">시럽 배출 메커니즘과 유량 임계 사이클을 일괄 제어합니다.</p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-3 border-b border-[#27272A]/40 pb-4 mb-2">
          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">시럽 배출 방식</label>
            <select
              value={discharge}
              onChange={(e) => updateGlobalField('discharge', e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            >
              <option value="ONE_BY_ONE">하나씩 배출</option>
              <option value="TWO_AT_ONCE">두개씩 동시 배출</option>
              <option value="ALL_AT_ONE">모두 동시에 배출</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">유량체크간격 (초)</label>
            <input
              type="number"
              value={flowCheckIntervalSec}
              step="0.1"
              onChange={(e) => updateGlobalField('flowCheckIntervalSec', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">찬우유 시럽으로 배출 여부</label>
            <select
              value={dischargeColdMilkAsSyrup ? 'enable' : 'disable'}
              onChange={(e) => updateGlobalField('dischargeColdMilkAsSyrup', e.target.value === 'enable')}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            >
              <option value="enable">사용함</option>
              <option value="disable">사용안함</option>
            </select>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="flex gap-1.5 p-1 bg-[#141416] rounded-lg border border-[#27272A] mb-1">
          {syrups.map(s => (
            <button
              key={s.seq}
              onClick={() => setActiveSeq(s.seq)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer border-0 ${
                activeSeq === s.seq ? 'bg-[#27272A] text-white font-extrabold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {s.name || `시럽 ${s.seq}`}
            </button>
          ))}
        </div>

        {/* 선택된 시럽 상세 편집 */}
        {activeSyrup && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">시럽 표시명</label>
              <input
                type="text"
                value={activeSyrup.name}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'name', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">프로토콜명</label>
              <input
                type="text"
                value={activeSyrup.protocol}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'protocol', e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">최대 용량 (ml/g)</label>
              <input
                type="number"
                value={activeSyrup.capacity}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'capacity', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">재고관리 사용 여부</label>
              <select
                value={activeSyrup.inventoryManagement ? 'enable' : 'disable'}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'inventoryManagement', e.target.value === 'enable')}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
              >
                <option value="enable">사용함</option>
                <option value="disable">사용안함</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">추출 비율 (Ratio)</label>
              <input
                type="number"
                value={activeSyrup.ratio}
                step="0.01"
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'ratio', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">최소 추출량 (below)</label>
              <input
                type="number"
                value={activeSyrup.below}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'below', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">최소 추출 비율 (belowRatio)</label>
              <input
                type="number"
                value={activeSyrup.belowRatio}
                step="0.01"
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'belowRatio', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">밸브 모터 파츠</label>
              <select
                value={activeSyrup.valveMotor}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'valveMotor', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {partsList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">밸브 열 시간 (초)</label>
              <input
                type="number"
                value={activeSyrup.valveOpenTimeSec}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'valveOpenTimeSec', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">유량 센서 파츠</label>
              <select
                value={activeSyrup.flowSensor}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'flowSensor', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {partsList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">역방향 모터 파츠</label>
              <select
                value={activeSyrup.reverseMotor}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'reverseMotor', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {partsList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">역방향 모터 가동시간 (초)</label>
              <input
                type="number"
                value={activeSyrup.reverseMotorRunTimeSec}
                onChange={(e) => updateSyrupField(activeSyrup.seq, 'reverseMotorRunTimeSec', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
