import React, { useState } from 'react';

interface PartOption {
  board: string;
  fnc: string;
  partNo: number;
}

type PartsSetting = Record<string, PartOption>;

const PARTS_EN_KO_MAP: Record<string, string> = {
  'cupDetectSensor1': '아이스컵 감지 센서 (1)',
  'cupDetectSensor2': '핫컵 감지 센서 (2)',
  'cupDropMotor1': '아이스컵 낙하 모터 (1)',
  'cupDropMotor2': '핫컵 낙하 모터 (2)',
  'cupDropDetectSensor1': '아이스컵 낙하 감지 센서 (1)',
  'cupDropDetectSensor2': '핫컵 낙하 감지 센서 (2)',
  'espresso1': '에스프레소 추출기 (1)',
  'grinder1': '원두 그라인더 (1)',
  'solValve1': '솔레노이드 밸브 (1)',
  'pump1': '급수 펌프 (1)',
  'waterSensor1': '유량 센서 (1)',
  'inletValve1': '입수 밸브 (1)'
};

export function SettingsParts({
  data,
  onChange
}: {
  data: PartsSetting;
  onChange: (patch: PartsSetting) => void;
}) {
  const [partsData, setPartsData] = useState<PartsSetting>(data || {});

  const updatePart = (partKey: string, field: keyof PartOption, val: any) => {
    const nextPart = { ...(partsData[partKey] || { board: 'board1', fnc: 'None', partNo: 1 }), [field]: val };
    const nextData = { ...partsData, [partKey]: nextPart };
    setPartsData(nextData);
    onChange(nextData);
  };

  const boardOptions = ['board1', 'board2'];
  const functionOptions = ['None', '3', '4', '5', '6'];

  return (
    <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] overflow-hidden text-left font-sans">
      <div className="px-4.5 py-3 border-b border-[#27272A]/40 bg-[#141416]/50">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">장비 파츠 세부 매핑</h3>
        <p className="text-[10px] text-[#71717A] mt-0.5">각 기계 장치(모터, 센서, 밸브)의 보드 펑션 매핑 테이블입니다.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-[#E4E4E7]">
          <thead className="bg-[#141416] border-b border-[#27272A]/50 select-none">
            <tr>
              <th className="px-4 py-2.5 font-semibold text-[#71717A] text-left w-1/4">이름</th>
              <th className="px-4 py-2.5 font-semibold text-[#71717A] text-left w-1/4">보드</th>
              <th className="px-4 py-2.5 font-semibold text-[#71717A] text-left w-1/4">펑션</th>
              <th className="px-4 py-2.5 font-semibold text-[#71717A] text-left w-1/4">번호</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]/20">
            {Object.entries(PARTS_EN_KO_MAP).map(([key, label]) => {
              const part = partsData[key] || { board: 'board1', fnc: 'None', partNo: 0 };
              return (
                <tr key={key} className="hover:bg-[#1A1A1C]/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{label}</td>
                  
                  {/* 보드 선택 */}
                  <td className="px-4 py-3">
                    <select
                      value={part.board}
                      onChange={(e) => updatePart(key, 'board', e.target.value)}
                      className="rounded border border-[#27272A] bg-[#141416] px-2.5 py-1 text-xs text-white outline-none w-full font-mono"
                    >
                      {boardOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* 펑션 선택 */}
                  <td className="px-4 py-3">
                    <select
                      value={part.fnc}
                      onChange={(e) => updatePart(key, 'fnc', e.target.value)}
                      className="rounded border border-[#27272A] bg-[#141416] px-2.5 py-1 text-xs text-white outline-none w-full font-mono"
                    >
                      {functionOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* 파트번호 번호 */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={part.partNo}
                      onChange={(e) => updatePart(key, 'partNo', Number(e.target.value))}
                      className="rounded border border-[#27272A] bg-[#141416] px-2.5 py-1 text-xs text-white outline-none w-full font-mono text-right"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
