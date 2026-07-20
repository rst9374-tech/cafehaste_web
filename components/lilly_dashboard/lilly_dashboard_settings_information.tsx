import React, { useState } from 'react';

interface InformationSetting {
  storeId: string;
  storeCode: string;
  lillyToken: string;
  lillyPort: number;
  didUrl: string;
}

export function SettingsInformation({
  data,
  onChange
}: {
  data: InformationSetting;
  onChange: (patch: Partial<InformationSetting>) => void;
}) {
  const [storeId, setStoreId] = useState(data.storeId || '');
  const [storeCode, setStoreCode] = useState(data.storeCode || '');
  const [lillyToken, setLillyToken] = useState(data.lillyToken || '');
  const [lillyPort, setLillyPort] = useState(data.lillyPort || 8080);
  const [didUrl, setDidUrl] = useState(data.didUrl || '');

  const updateField = (key: keyof InformationSetting, val: any) => {
    onChange({ [key]: val });
  };

  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      <div className="rounded-xl border border-[#27272A]/50 bg-[#0E0E10] p-4.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">기타 및 DID 설정</h3>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">매장 식별자 (Store ID)</label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => {
                setStoreId(e.target.value);
                updateField('storeId', e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">가맹점 매장 코드 (Store Code)</label>
            <input
              type="text"
              value={storeCode}
              disabled
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416]/50 px-3 py-2 text-xs text-[#71717A] outline-none font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">로컬 통신용 API 토큰 (lillyToken)</label>
            <input
              type="text"
              value={lillyToken}
              onChange={(e) => {
                setLillyToken(e.target.value);
                updateField('lillyToken', e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#A1A1AA]">로컬 Hono 바인딩 포트 (lillyPort)</label>
            <input
              type="number"
              value={lillyPort}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLillyPort(val);
                updateField('lillyPort', val);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-[#A1A1AA]">DID 영상 및 자산 절대경로 주소 (didUrl)</label>
            <input
              type="text"
              value={didUrl}
              onChange={(e) => {
                setDidUrl(e.target.value);
                updateField('didUrl', e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-[#27272A] bg-[#141416] px-3 py-2 text-xs text-[#FAFAFA] outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
