import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw } from 'lucide-react';

export function LogApi({ storeCode }: { storeCode: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/remote/logs?storeCode=${storeCode}&name=api`);
      const data = await response.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [storeCode]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="rounded-xl border border-[#27272A]/60 bg-[#141414] shadow-sm p-4.5 text-left font-sans flex flex-col gap-3">
      <div className="flex justify-between items-center text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Terminal className="size-3 text-[#C5A059]" />
          API COMMUNICATIONAL LOGS (API 로그)
        </span>
        <button
          onClick={fetchLogs}
          className="p-1 rounded-md bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="size-3" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-[360px] flex items-center justify-center text-xs text-[#71717A] font-mono">LOADING API LOGS...</div>
      ) : (
        <div className="w-full h-[360px] bg-[#0A0A0C] border border-[#27272A]/60 rounded-xl p-4 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] leading-relaxed flex flex-col gap-1">
          {logs.length === 0 ? (
            <div className="text-[#71717A] text-center py-10">로그가 비어 있습니다.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap">
                <span className="text-[#52525B] select-none mr-2">[{idx + 1}]</span>
                {log}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
