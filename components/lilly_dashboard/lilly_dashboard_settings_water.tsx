import React, { useState } from 'react';

interface WaterItem {
  seq: number;
  name: string;
  protocol: string;
  board: string;
  ratio: number;
  // 얼음 전용
  errorCheckIntervalSec?: number;
  // 일반 물 전용
  inventoryManagement?: boolean;
  capacity?: number;
  flowSensor?: string;
  valveMotor?: string;
  valveOpenTimeSec?: number;
}

interface WaterSetting {
  hotWaterPreOpenSec: number;
  flowCheckIntervalSec: number;
  waters: WaterItem[];
}

export function SettingsWater({
  data,
  onChange
}: {
  data: WaterSetting;
  onChange: (patch: Partial<WaterSetting>) => void;
}) {
  const [hotWaterPreOpenSec, setHotWaterPreOpenSec] = useState<number>(data.hotWaterPreOpenSec || 0.5);
  const [flowCheckIntervalSec, setFlowCheckIntervalSec] = useState<number>(data.flowCheckIntervalSec || 1.5);
  const [waters, setWaters] = useState<WaterItem[]>(data.waters || []);
  const [activeSeq, setActiveSeq] = useState<number>(waters[0]?.seq || 1);

  const updateGlobalField = (key: keyof WaterSetting, val: any) => {
    if (key === 'hotWaterPreOpenSec') setHotWaterPreOpenSec(val);
    if (key === 'flowCheckIntervalSec') setFlowCheckIntervalSec(val);
    onChange({ [key]: val });
  };

  const updateWaterField = (seq: number, key: keyof WaterItem, val: any) => {
    const nextWaters = waters.map(w => w.seq === seq ? { ...w, [key]: val } : w);
    setWaters(nextWaters);
    onChange({ waters: nextWaters });
  };

  const activeWater = waters.find(w => w.seq === activeSeq);
  const partsList = [
    'NONE',
    'VALVE_MOTOR_1', 'VALVE_MOTOR_2', 'VALVE_MOTOR_3', 'VALVE_MOTOR_4',
    'FLOW_SENSOR_1', 'FLOW_SENSOR_2', 'FLOW_SENSOR_3', 'FLOW_SENSOR_4',
    'INLET_VALVE_1', 'INLET_VALVE_2', 'INLET_VALVE_3', 'INLET_VALVE_4',
    'WATER_SENSOR_1', 'WATER_SENSOR_2', 'WATER_SENSOR_3', 'WATER_SENSOR_4'
  ];
  const boardList = ['board1', 'board2', 'board3'];

  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5 flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">물 / 얼음 전역 설정</h3>
          <p className="text-[10px] text-[#71717A]">수원별 흐름 사전 제어 시간과 유량 진단 간격을 갱신합니다.</p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 border-b border-[#27272A]/40 pb-4 mb-2">
          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">온수 사전 개방 시간 (초)</label>
            <input
              type="number"
              value={hotWaterPreOpenSec}
              step="0.1"
              onChange={(e) => updateGlobalField('hotWaterPreOpenSec', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
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
        </div>

        {/* 탭 바 */}
        <div className="flex gap-1.5 p-1 bg-[#141416] rounded-lg border border-[#27272A] mb-1">
          {waters.map(w => (
            <button
              key={w.seq}
              onClick={() => setActiveSeq(w.seq)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer border-0 ${
                activeSeq === w.seq ? 'bg-[#27272A] text-white font-extrabold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>

        {/* 선택된 수원 상세 편집 */}
        {activeWater && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">수원 표시명</label>
              <input
                type="text"
                value={activeWater.name}
                readOnly
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#1c1c1f] px-3 py-2 text-xs text-stone-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">프로토콜명</label>
              <input
                type="text"
                value={activeWater.protocol}
                onChange={(e) => updateWaterField(activeWater.seq, 'protocol', e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">장착 보드 (Board)</label>
              <select
                value={activeWater.board}
                onChange={(e) => updateWaterField(activeWater.seq, 'board', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {boardList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">추출 비율 (Ratio)</label>
              <input
                type="number"
                value={activeWater.ratio}
                step="0.01"
                onChange={(e) => updateWaterField(activeWater.seq, 'ratio', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            {activeWater.name === '얼음' ? (
              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA]">에러 체크 간격 (초)</label>
                <input
                  type="number"
                  value={activeWater.errorCheckIntervalSec || 5}
                  onChange={(e) => updateWaterField(activeWater.seq, 'errorCheckIntervalSec', Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA]">최대 보유량 (ml/g)</label>
                  <input
                    type="number"
                    value={activeWater.capacity || 5000}
                    onChange={(e) => updateWaterField(activeWater.seq, 'capacity', Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA]">재고관리 사용 여부</label>
                  <select
                    value={activeWater.inventoryManagement ? 'enable' : 'disable'}
                    onChange={(e) => updateWaterField(activeWater.seq, 'inventoryManagement', e.target.value === 'enable')}
                    className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
                  >
                    <option value="enable">사용함</option>
                    <option value="disable">사용안함</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA]">밸브 모터 파츠</label>
                  <select
                    value={activeWater.valveMotor || 'NONE'}
                    onChange={(e) => updateWaterField(activeWater.seq, 'valveMotor', e.target.value)}
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
                    value={activeWater.valveOpenTimeSec || 5}
                    onChange={(e) => updateWaterField(activeWater.seq, 'valveOpenTimeSec', Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA]">유량 센서 파츠</label>
                  <select
                    value={activeWater.flowSensor || 'NONE'}
                    onChange={(e) => updateWaterField(activeWater.seq, 'flowSensor', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
                  >
                    {partsList.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
