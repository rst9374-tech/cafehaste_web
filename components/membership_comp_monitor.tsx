import React, { useState, useEffect, useRef } from 'react';
import { Cpu } from 'lucide-react';

export const MembershipCompMonitor: React.FC<{ storeCode: string }> = ({ storeCode }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ISSUE' | 'ERROR' | 'WARN'>('ALL');
  
  // 이메일 알림 설정 상태 변수 (마스터 지침 완벽 구현!)
  const [alertEmail, setAlertEmail] = useState('owner@cafehaste.com');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const lastNotifiedLogRef = useRef<string>('');

  // 1. 최초 로딩 시 로컬 스토리지에서 이메일 주소 로드 및 백엔드 싱크
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('haste_alert_email') || 'owner@cafehaste.com';
      setAlertEmail(savedEmail);
      
      fetch('/api/remote/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: storeCode, email: savedEmail })
      }).catch(err => console.error('Initial email sync error:', err));
    }
  }, [storeCode]);

  // 2. 2초 주기 실시간 백엔드 로그 수집 및 브라우저 알람 트리거
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/remote/logs?storeCode=${storeCode}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.logs)) {
            // 원본 로그 보관
            setLogs(data.logs.slice(-50).reverse());

            // 신규 오류/경고 유입 시 브라우저 알람(Notification) & Alert 팝업 전파
            if (data.logs.length > 0) {
              const latestLog = data.logs[data.logs.length - 1];
              
              if (latestLog !== lastNotifiedLogRef.current) {
                lastNotifiedLogRef.current = latestLog;
                
                if (latestLog.includes('🚨') || latestLog.includes('⚠️') || latestLog.includes('오류') || latestLog.includes('경고') || latestLog.includes('장애')) {
                  // A. HTML5 브라우저 웹 푸시 알림
                  if (typeof window !== 'undefined' && 'Notification' in window) {
                    if (Notification.permission === 'granted') {
                      new Notification('🚨 HASTE 매장 긴급 장애/경보', {
                        body: latestLog.replace(/^[\[][^\]]+[\]]\s*/, ''),
                        icon: '/favicon.ico'
                      });
                    } else if (Notification.permission !== 'denied') {
                      Notification.requestPermission();
                    }
                  }
                  
                  // B. 대시보드 화면상 팝업 경보
                  setTimeout(() => {
                    alert(`🚨 [HASTE 장비 경보]\n\n지점 커피머신/장비에 오류가 감지되었습니다.\n\n경보 내용:\n${latestLog}`);
                  }, 400);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Telemetry fetch error:', err);
      }
    };
    
    fetchLogs();
    const logTimer = setInterval(fetchLogs, 2000);

    return () => {
      clearInterval(logTimer);
    };
  }, [storeCode]);

  // 3. 이메일 수신처 저장 핸들러
  const handleSaveEmail = async () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('haste_alert_email', alertEmail);
      await fetch('/api/remote/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: storeCode, email: alertEmail })
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (e) {
      console.error(e);
      setSaveStatus('idle');
    }
  };

  // 4. 액티브 필터 상태에 따른 실시간 로그 필터링 처리
  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ISSUE') return log.includes('ℹ️') || log.includes('이슈');
    if (activeFilter === 'ERROR') return log.includes('🚨') || log.includes('오류') || log.includes('장애');
    if (activeFilter === 'WARN') return log.includes('⚠️') || log.includes('경고');
    return true;
  });

  return (
    <div className="w-full bg-[#070609]/95 border border-stone-900 rounded-2xl p-4 md:p-5 text-stone-300 font-sans shadow-lg text-left flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stone-900 pb-2 mb-1">
        <span className="text-[10.5px] font-sans font-bold text-[#C5A059] tracking-wider uppercase flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-[#C5A059]" />
          02-1 HARDWARE REALTIME DIAGNOSTICS & TELEMETRY
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
            LIVE MONITORING
          </span>
        </div>
      </div>

      {/* 긴급 알림 수신 메일 설정 패널 (마스터 지침 완벽 구현!) */}
      <div className="bg-[#111015] border border-stone-900 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] mt-0.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-stone-200">🚨 장비 장애 수신 이메일 설정</span>
          <span className="text-[10px] text-stone-500 font-light">지점 기기 오류 및 경고 발생 시 아래 지정된 메일 주소로 긴급 경보 메일이 발송됩니다.</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="new-email"
            className="bg-[#222026] hover:bg-[#2c2933] focus:bg-[#222026] border border-stone-800 focus:border-[#C5A059] focus:outline-none rounded px-3 py-1.5 w-60 text-stone-200 font-sans transition-colors placeholder:text-stone-600"
          />
          <button
            type="button"
            onClick={handleSaveEmail}
            disabled={saveStatus === 'saving'}
            className="px-3.5 py-1.5 bg-[#C5A059] text-stone-950 font-bold rounded hover:bg-[#b08e4d] transition-all active:scale-95 cursor-pointer select-none"
          >
            {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'saved' ? '저장 완료!' : '설정'}
          </button>
        </div>
      </div>

      {/* 실시간 텔레메트리 로그 필터 및 목록 단독 배치 */}
      <div className="bg-[#111015] border border-stone-900 rounded-xl p-4.5 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-stone-900/60 pb-2 mb-1">
          <span className="text-[12px] font-bold text-stone-200">지점 기기 관제 로그 피드</span>
          
          {/* 필터 4버튼 (마스터 지침 완벽 구현!) */}
          <div className="flex gap-1">
            {(['ALL', 'ISSUE', 'ERROR', 'WARN'] as const).map((filter) => {
              const labelMap = { ALL: '전체', ISSUE: '이슈', ERROR: '오류', WARN: '경고' };
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-0.8 text-[9.5px] font-bold rounded transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C5A059] text-stone-955 shadow-[0_0_8px_rgba(197,160,89,0.2)] border border-transparent'
                      : 'bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-600 hover:border-stone-400'
                  }`}
                >
                  {labelMap[filter]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 넉넉하고 넓어진 실시간 대화면 로그 뷰어 */}
        <div className="border border-stone-950 rounded-lg overflow-hidden bg-[#0d0c10] p-3.5 min-h-[420px] max-h-[550px] overflow-y-auto flex flex-col gap-1.5 font-sans text-[12.5px] leading-snug">
          {filteredLogs.length === 0 ? (
            <span className="text-stone-500 italic select-none text-[11.5px] py-12 text-center">필터에 해당하는 수집 로그 이력이 없습니다.</span>
          ) : (
            filteredLogs.map((log, idx) => {
              const isError = log.includes('🚨') || log.includes('오류') || log.includes('장애');
              const isWarn = log.includes('⚠️') || log.includes('경고');
              return (
                <div 
                  key={idx} 
                  className={`border-b border-stone-900/30 pb-1.5 last:border-0 flex items-start gap-2 break-all ${
                    isError 
                      ? 'text-rose-400 font-bold' 
                      : isWarn
                        ? 'text-amber-400 font-bold'
                        : 'text-stone-250 font-medium'
                  }`}
                >
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>{log}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
