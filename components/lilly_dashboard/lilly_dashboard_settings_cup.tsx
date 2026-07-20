import React, { useState } from 'react';

interface CupItem {
  seq: number;
  name: string;
  type: 'ICE' | 'HOT' | 'NONE';
  maxStock: number;
  stockManagement: boolean;
  priority: number;
  preRotateMotorSec: number;
  maxRotateMotorSec: number;
  dropCheckIntervalSec: number;
  postDropExtraRotateSec: number;
  cupDetectSensor: string;
  cupDropMotor: string;
  cupDropDetectSensor: string;
}

interface CupSetting {
  ejectionMethod: '자동' | '수동';
  cupMountSensor: string;
  cupMountCheckIntervalSec: number;
  cupMountTimeoutSec: number;
  cupUnmountTimeoutSec: number;
  cups: CupItem[];
}

export function SettingsCup({
  data,
  onChange
}: {
  data: CupSetting;
  onChange: (patch: Partial<CupSetting>) => void;
}) {
  const [ejectionMethod, setEjectionMethod] = useState<string>(data.ejectionMethod || '자동');
  const [cupMountSensor, setCupMountSensor] = useState<string>(data.cupMountSensor || 'NONE');
  const [cupMountCheckIntervalSec, setCupMountCheckIntervalSec] = useState<number>(data.cupMountCheckIntervalSec || 0.5);
  const [cupMountTimeoutSec, setCupMountTimeoutSec] = useState<number>(data.cupMountTimeoutSec || 15);
  const [cupUnmountTimeoutSec, setCupUnmountTimeoutSec] = useState<number>(data.cupUnmountTimeoutSec || 10);
  const [cups, setCups] = useState<CupItem[]>(data.cups || []);
  const [activeSeq, setActiveSeq] = useState<number>(cups[0]?.seq || 1);

  const updateGlobalField = (key: keyof CupSetting, val: any) => {
    if (key === 'ejectionMethod') setEjectionMethod(val);
    if (key === 'cupMountSensor') setCupMountSensor(val);
    if (key === 'cupMountCheckIntervalSec') setCupMountCheckIntervalSec(val);
    if (key === 'cupMountTimeoutSec') setCupMountTimeoutSec(val);
    if (key === 'cupUnmountTimeoutSec') setCupUnmountTimeoutSec(val);
    onChange({ [key]: val });
  };

  const updateCupField = (seq: number, key: keyof CupItem, val: any) => {
    const nextCups = cups.map(c => c.seq === seq ? { ...c, [key]: val } : c);
    setCups(nextCups);
    onChange({ cups: nextCups });
  };

  const activeCup = cups.find(c => c.seq === activeSeq);
  const partsList = [
    'NONE',
    'CUP_DETECT_SENSOR_1', 'CUP_DETECT_SENSOR_2', 'CUP_DETECT_SENSOR_3', 'CUP_DETECT_SENSOR_4',
    'CUP_DROP_MOTOR_1', 'CUP_DROP_MOTOR_2', 'CUP_DROP_MOTOR_3', 'CUP_DROP_MOTOR_4',
    'CUP_DROP_DETECT_SENSOR_1', 'CUP_DROP_DETECT_SENSOR_2', 'CUP_DROP_DETECT_SENSOR_3', 'CUP_DROP_DETECT_SENSOR_4'
  ];

  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5 flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">컵 전역 설정</h3>
          <p className="text-[10px] text-[#71717A]">디스펜서 센서 대기 및 컵 안착 사이클 시간을 제어합니다.</p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 border-b border-[#27272A]/40 pb-4 mb-2">
          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">컵 배출 방식</label>
            <select
              value={ejectionMethod}
              onChange={(e) => updateGlobalField('ejectionMethod', e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            >
              <option value="자동">자동 배출</option>
              <option value="수동">수동 배출</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">컵 장착 감지 센서</label>
            <select
              value={cupMountSensor}
              onChange={(e) => updateGlobalField('cupMountSensor', e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            >
              {partsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">컵장착 감지 간격 (초)</label>
            <input
              type="number"
              value={cupMountCheckIntervalSec}
              step="0.1"
              onChange={(e) => updateGlobalField('cupMountCheckIntervalSec', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">컵넣기 타임아웃 (초)</label>
            <input
              type="number"
              value={cupMountTimeoutSec}
              onChange={(e) => updateGlobalField('cupMountTimeoutSec', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">컵빼기 타임아웃 (초)</label>
            <input
              type="number"
              value={cupUnmountTimeoutSec}
              onChange={(e) => updateGlobalField('cupUnmountTimeoutSec', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>
        </div>

        {/* 탭 바 */}
        <div className="flex gap-1.5 p-1 bg-[#141416] rounded-lg border border-[#27272A] mb-1">
          {cups.map(cup => (
            <button
              key={cup.seq}
              onClick={() => setActiveSeq(cup.seq)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer border-0 ${
                activeSeq === cup.seq ? 'bg-[#27272A] text-white font-extrabold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {cup.name}
            </button>
          ))}
        </div>

        {/* 선택된 컵 상세 편집 */}
        {activeCup && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">컵 타입</label>
              <select
                value={activeCup.type}
                onChange={(e) => updateCupField(activeCup.seq, 'type', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                <option value="ICE">ICE</option>
                <option value="HOT">HOT</option>
                <option value="NONE">NONE</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">최대 보유량 (개)</label>
              <input
                type="number"
                value={activeCup.maxStock}
                onChange={(e) => updateCupField(activeCup.seq, 'maxStock', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">우선순위</label>
              <input
                type="number"
                value={activeCup.priority}
                onChange={(e) => updateCupField(activeCup.seq, 'priority', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">재고관리 사용 여부</label>
              <select
                value={activeCup.stockManagement ? 'enable' : 'disable'}
                onChange={(e) => updateCupField(activeCup.seq, 'stockManagement', e.target.value === 'enable')}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
              >
                <option value="enable">사용함</option>
                <option value="disable">사용안함</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">드랍모터 미리 회전 시간 (초)</label>
              <input
                type="number"
                value={activeCup.preRotateMotorSec}
                step="0.1"
                onChange={(e) => updateCupField(activeCup.seq, 'preRotateMotorSec', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">드랍모터 최대 회전 시간 (초)</label>
              <input
                type="number"
                value={activeCup.maxRotateMotorSec}
                step="0.1"
                onChange={(e) => updateCupField(activeCup.seq, 'maxRotateMotorSec', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">드랍체크간격 (초)</label>
              <input
                type="number"
                value={activeCup.dropCheckIntervalSec}
                step="0.1"
                onChange={(e) => updateCupField(activeCup.seq, 'dropCheckIntervalSec', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">드랍 후 추가 회전 시간 (초)</label>
              <input
                type="number"
                value={activeCup.postDropExtraRotateSec}
                step="0.1"
                onChange={(e) => updateCupField(activeCup.seq, 'postDropExtraRotateSec', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">컵 감지 센서 파츠</label>
              <select
                value={activeCup.cupDetectSensor}
                onChange={(e) => updateCupField(activeCup.seq, 'cupDetectSensor', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {partsList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">컵 드랍 모터 파츠</label>
              <select
                value={activeCup.cupDropMotor}
                onChange={(e) => updateCupField(activeCup.seq, 'cupDropMotor', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {partsList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">컵 드랍 감지 센서 파츠</label>
              <select
                value={activeCup.cupDropDetectSensor}
                onChange={(e) => updateCupField(activeCup.seq, 'cupDropDetectSensor', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {partsList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
