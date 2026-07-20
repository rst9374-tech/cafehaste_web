import React, { useState } from 'react';

interface BoardSetting {
  name: string;
  enabled: boolean;
  port: string;
  baudRate: number;
  parity: string;
  dataBits: number;
  stopBits: number;
  readTimeoutSec: number;
  writeTimeoutSec: number;
}

interface SerialportSetting {
  minIntervalSec: number;
  packetLengthCheck: boolean;
  crcCheck: boolean;
  ackReply: boolean;
  boards: BoardSetting[];
}

export function SettingsSerialport({
  data,
  onChange
}: {
  data: SerialportSetting;
  onChange: (patch: Partial<SerialportSetting>) => void;
}) {
  const [minIntervalSec, setMinIntervalSec] = useState(data.minIntervalSec || 0.1);
  const [packetLengthCheck, setPacketLengthCheck] = useState(!!data.packetLengthCheck);
  const [crcCheck, setCrcCheck] = useState(!!data.crcCheck);
  const [ackReply, setAckReply] = useState(!!data.ackReply);

  const [boards, setBoards] = useState<BoardSetting[]>(data.boards || []);
  const [activeBoardName, setActiveBoardName] = useState(boards[0]?.name || '');

  const updateBase = (key: keyof SerialportSetting, val: any) => {
    onChange({ [key]: val } as any);
  };

  const updateBoard = (boardName: string, key: keyof BoardSetting, val: any) => {
    const nextBoards = boards.map(b => b.name === boardName ? { ...b, [key]: val } : b);
    setBoards(nextBoards);
    onChange({ boards: nextBoards });
  };

  const activeBoard = boards.find(b => b.name === activeBoardName);

  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      {/* 기본 설정 카드 */}
      <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">시리얼 통신 기본 설정</h3>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">최소 전송 간격 (초)</label>
            <input
              type="number"
              value={minIntervalSec}
              step="0.1"
              min="0.1"
              max="5"
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinIntervalSec(val);
                updateBase('minIntervalSec', val);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">패킷 길이 체크 여부</label>
            <select
              value={packetLengthCheck ? 'enable' : 'disable'}
              onChange={(e) => {
                const val = e.target.value === 'enable';
                setPacketLengthCheck(val);
                updateBase('packetLengthCheck', val);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            >
              <option value="enable">사용함</option>
              <option value="disable">사용안함</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">CRC 체크 여부</label>
            <select
              value={crcCheck ? 'enable' : 'disable'}
              onChange={(e) => {
                const val = e.target.value === 'enable';
                setCrcCheck(val);
                updateBase('crcCheck', val);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            >
              <option value="enable">사용함</option>
              <option value="disable">사용안함</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">ACK 회신 여부</label>
            <select
              value={ackReply ? 'enable' : 'disable'}
              onChange={(e) => {
                const val = e.target.value === 'enable';
                setAckReply(val);
                updateBase('ackReply', val);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            >
              <option value="enable">사용함</option>
              <option value="disable">사용안함</option>
            </select>
          </div>
        </div>
      </div>

      {/* 보드 세부 설정 카드 */}
      <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">보드 세부 설정</h3>
        <p className="text-[10px] text-[#71717A] mb-3">각 제어 보드의 포트와 통신 값을 보드 단위로 조정합니다.</p>

        {/* 탭 바 */}
        <div className="flex gap-1.5 p-1 bg-[#141416] rounded-lg border border-[#27272A] mb-3">
          {boards.map(board => (
            <button
              key={board.name}
              onClick={() => setActiveBoardName(board.name)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                activeBoardName === board.name
                  ? 'bg-[#27272A] text-white'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {board.name}
            </button>
          ))}
        </div>

        {/* 선택된 탭 상세 에디터 */}
        {activeBoard && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">사용 여부</label>
              <select
                value={activeBoard.enabled ? 'enable' : 'disable'}
                onChange={(e) => updateBoard(activeBoard.name, 'enabled', e.target.value === 'enable')}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
              >
                <option value="enable">사용함</option>
                <option value="disable">사용안함</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">통신포트</label>
              <select
                value={activeBoard.port}
                onChange={(e) => updateBoard(activeBoard.name, 'port', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {['COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">보레이트 (Baud Rate)</label>
              <select
                value={String(activeBoard.baudRate)}
                onChange={(e) => updateBoard(activeBoard.name, 'baudRate', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {[9600, 19200, 38400, 57600, 115200, 230400].map(br => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">패리티 (Parity)</label>
              <select
                value={activeBoard.parity}
                onChange={(e) => updateBoard(activeBoard.name, 'parity', e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              >
                {['none', 'even', 'odd', 'mark', 'space'].map(py => (
                  <option key={py} value={py}>{py}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">데이터 비트</label>
              <input
                type="number"
                value={activeBoard.dataBits}
                onChange={(e) => updateBoard(activeBoard.name, 'dataBits', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A1A1AA]">스톱 비트</label>
              <input
                type="number"
                value={activeBoard.stopBits}
                onChange={(e) => updateBoard(activeBoard.name, 'stopBits', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
