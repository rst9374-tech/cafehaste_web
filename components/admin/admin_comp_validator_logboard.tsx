import React, { useState, useMemo } from 'react';
import { 
  Search, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Calendar, Download, Save, RefreshCw 
} from 'lucide-react';
import { ApiLog } from './admin_hook_licenses';
import { AdminPagination } from './admin_comp_pagination';

interface AdminCompValidatorLogBoardProps {
  displayLogs: ApiLog[];
  isCurrentlyLoading: boolean;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  handleFlushLogs: () => Promise<void> | void;
  flushStatus: string | null;
  isSavingLogs: boolean;
  hasFlushed: boolean;
  onRefresh: () => void;
  handleClearLogs: () => void;
  handleClearDbLogs: () => void;
  logDays?: string[];
  licenses?: any[];
}

export const AdminCompValidatorLogBoard: React.FC<AdminCompValidatorLogBoardProps> = ({
  displayLogs,
  isCurrentlyLoading,
  selectedDate,
  setSelectedDate,
  handleFlushLogs,
  flushStatus,
  isSavingLogs,
  hasFlushed,
  onRefresh,
  handleClearLogs,
  handleClearDbLogs,
  logDays = [],
  licenses = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pass' | 'warn' | 'risk' | 'dup'>('all');
  const itemsPerPage = 100;

  const getStoreNameOfLog = (storeId: string) => {
    const lic = licenses.find(
      (l) =>
        (l.storeId || '').toLowerCase() === (storeId || '').toLowerCase() ||
        (l.storeCode || '').toLowerCase() === (storeId || '').toLowerCase()
    );
    return lic ? lic.storeName : '';
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
  }, []);
  const isDownloadable = useMemo(() => {
    return logDays.includes(selectedDate) || hasFlushed;
  }, [selectedDate, logDays, hasFlushed]);

  // 실제 매장 및 시뮬레이터 검증 로그 추출 (매장 코드가 존재하는 로그 표시)
  const numericLogs = useMemo(() => {
    return displayLogs.filter(log => {
      const storeId = (log.storeId || '').trim();
      return storeId !== '';
    });
  }, [displayLogs]);

  // 증상 판정 헬퍼 함수
  const getStatusTypeOfLog = (log: ApiLog) => {
    if (log.statusType) return log.statusType as 'pass' | 'warn' | 'risk' | 'dup';
    const msg = (log.message || '').toUpperCase();
    if (msg.includes('동시성 중복') || msg.includes('캐시 히트') || msg.includes('DUP')) return 'dup';
    if (log.isApproved) return 'pass';
    const isWarn = ['PENDING', 'EXPIRED', 'SUSPENDED', '만료', '정지', '대기', '주의'].some(w => msg.includes(w));
    return isWarn ? 'warn' : 'risk';
  };

  // 1. 통계 집계: 정상, 주의, 위험, 중복 정밀 분류
  const stats = useMemo(() => {
    let pass = 0, warn = 0, risk = 0, dup = 0;
    numericLogs.forEach(log => {
      const s = getStatusTypeOfLog(log);
      if (s === 'dup') dup++;
      else if (s === 'pass') pass++;
      else if (s === 'warn') warn++;
      else risk++;
    });
    return { pass, warn, risk, dup };
  }, [numericLogs]);

  // 2. 검색 필터링 및 차단위험(risk) 최상단 고정 정렬 + 증상 필터링
  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    let base = numericLogs;
    if (term) {
      base = numericLogs.filter(log => 
        (log.storeId || '').toLowerCase().includes(term) ||
        (log.ip || '').toLowerCase().includes(term) ||
        (log.message || '').toLowerCase().includes(term)
      );
    }
    if (selectedStatus !== 'all') {
      base = base.filter(log => getStatusTypeOfLog(log) === selectedStatus);
    }
    const isRiskLog = (log: ApiLog) => getStatusTypeOfLog(log) === 'risk';
    return [...base].sort((a, b) => {
      const aRisk = isRiskLog(a) ? 1 : 0;
      const bRisk = isRiskLog(b) ? 1 : 0;
      return aRisk !== bRisk ? bRisk - aRisk : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [numericLogs, searchTerm, selectedStatus]);

  // 3. 페이징 처리
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;

  // 검색어나 증상 필터가 변경될 때 페이징을 자동으로 1페이지 복원
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  return (
    <div className="flex flex-col bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4"> {/* temp: select-none */}
      {/* 1. 패널 상단 타이틀 부 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div className="flex flex-col gap-1.5 text-left">
          <p className="text-[9px] text-stone-450 font-sans leading-none">
             ※ 본 전산 대장은 <span className="font-bold text-stone-700">24시간 누적 로그</span> 시스템이며, 매일 <span className="font-bold text-rose-600">00:00 KST 최적화 초기화</span> 됩니다.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isCurrentlyLoading}
            className="w-7 h-7 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 disabled:opacity-50"
            title="최신 로그 갱신"
          >
            <RefreshCw size={11} className={isCurrentlyLoading ? 'animate-spin text-stone-800' : 'text-stone-400'} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('오늘 자 실제 DB 및 디스크에 기록된 로그 전산 테이블을 정말 완전히 초기화(삭제)하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
                handleClearDbLogs();
              }
            }}
            disabled={isCurrentlyLoading}
            className="px-2.5 h-7 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 disabled:opacity-50 text-[10px] font-bold"
            title="오늘 자 실제 DB 및 디스크 로그 삭제 초기화"
          >
            로그 초기화
          </button>
        </div>
      </div>

      {/* 2. 대형 통계판 (카드가 곧 탭 역할을 하도록 일체화) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          {
            type: 'all' as const,
            title: '전체 호출 (ALL TOTAL)',
            count: numericLogs.length,
            icon: (size: number) => <Search size={size} />,
            activeClass: 'bg-stone-900 border-stone-850 text-[#C5A059] ring-2 ring-stone-900/10',
            activeText: 'text-[#C5A059]',
            activeCountText: 'text-white',
            bgIconColor: 'text-stone-800/40',
            normalBg: 'bg-stone-50/50 border-stone-200/60 hover:bg-stone-100/50 text-stone-500'
          },
          {
            type: 'pass' as const,
            title: '인증 정상 (APPROVED)',
            count: stats.pass,
            icon: (size: number) => <CheckCircle2 size={size} />,
            activeClass: 'bg-emerald-50/80 border-emerald-500/60 text-emerald-800 ring-2 ring-emerald-200/50',
            activeText: 'text-emerald-700',
            activeCountText: 'text-emerald-900',
            bgIconColor: 'text-emerald-100/50',
            normalBg: 'bg-white border-stone-200 hover:bg-stone-50 text-stone-500'
          },
          {
            type: 'warn' as const,
            title: '이상 신호 (WARNING)',
            count: stats.warn,
            icon: (size: number) => <AlertTriangle size={size} />,
            activeClass: 'bg-amber-50/80 border-amber-500/60 text-amber-800 ring-2 ring-amber-200/50',
            activeText: 'text-amber-700',
            activeCountText: 'text-amber-955',
            bgIconColor: 'text-amber-100/50',
            normalBg: 'bg-white border-stone-200 hover:bg-stone-50 text-stone-500'
          },
          {
            type: 'risk' as const,
            title: '차단/위험 (FAIL)',
            count: stats.risk,
            icon: (size: number) => <XCircle size={size} />,
            activeClass: 'bg-rose-50/80 border-rose-500/60 text-rose-800 ring-2 ring-rose-200/50',
            activeText: 'text-rose-700',
            activeCountText: 'text-rose-900 font-extrabold',
            bgIconColor: 'text-rose-100/50',
            normalBg: 'bg-white border-stone-200 hover:bg-stone-50 text-stone-500'
          },
          {
            type: 'dup' as const,
            title: '중복 방어 (DUP. GUARDED)',
            count: stats.dup,
            icon: (size: number) => <RefreshCw size={size} />,
            activeClass: 'bg-blue-50/80 border-blue-500/60 text-blue-800 ring-2 ring-blue-200/50',
            activeText: 'text-blue-700',
            activeCountText: 'text-blue-900',
            bgIconColor: 'text-blue-100/50',
            normalBg: 'bg-white border-stone-200 hover:bg-stone-50 text-stone-500'
          }
        ].map((card) => {
          const isSelected = selectedStatus === card.type;
          return (
            <button
              key={card.type}
              type="button"
              onClick={() => setSelectedStatus(card.type)}
              className={`rounded-2xl p-3 flex flex-col justify-between text-left relative overflow-hidden group shadow-xs transition-all active:scale-[0.98] border cursor-pointer ${
                isSelected ? card.activeClass : card.normalBg
              }`}
            >
              <div className="flex justify-between items-center z-10 w-full">
                <span className={`text-[10px] font-bold ${isSelected ? card.activeText : 'text-stone-600'} font-sans`}>
                  {card.title}
                </span>
                <span className={isSelected ? card.activeText : 'text-stone-400'}>
                  {card.icon(13)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5 z-10">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${isSelected ? card.activeCountText : 'text-stone-800'}`}>
                  {card.count}
                </span>
                <span className={`text-[10px] font-bold font-sans ${isSelected ? card.activeText : 'text-stone-500'}`}>
                  건
                </span>
              </div>
              {card.type === 'risk' && stats.risk > 0 && !isSelected && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              )}
              <div className={`absolute -right-3 -bottom-3 ${isSelected ? card.bgIconColor : 'text-stone-200/20'} group-hover:scale-110 transition-transform duration-300 pointer-events-none select-none`}>
                {card.icon(64)}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. 중간 조작계: 검색 바 + 달력 일자 선택 및 flush 제어 */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
        {/* 검색 인풋 */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search size={12} />
          </span>
          <input
            type="text"
            placeholder="매장 ID, 아이피, 또는 메시지 내용 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-[11px] h-8 pl-8 pr-3 border border-stone-200 hover:border-stone-300 focus:border-[#C5A059] rounded-xl outline-none placeholder-stone-400 font-sans"
          />
        </div>

        {/* 일자 지정 및 백업 다운로드 컨트롤 */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <input
            type="date"
            value={selectedDate || todayStr}
            max={todayStr}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
              }
            }}
            className="border border-stone-200 rounded-lg px-2 text-[10px] font-mono font-bold text-stone-700 outline-none h-8 bg-stone-50 cursor-pointer"
            title="원하는 일자 선택"
          />
          <a
            href={`/api/licenses/verify-logs/download?date=${selectedDate || todayStr}&status=${selectedStatus}`}
            download
            className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] border border-stone-800 px-3 h-8 text-[10px] font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap shadow-xs text-center"
            title="해당 일자 전산 로그 다운로드 (.txt)"
          >
            <Download size={10} />
            <span>로그 다운로드</span>
          </a>
        </div>
      </div>

      {/* 4. 로그 게시판 Table (멤버십 테이블과 동일 스타일) */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[640px] text-[11px] table-fixed">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-extrabold uppercase font-sans text-[9px] tracking-wider">
                <th className="py-2.5 px-3 text-center w-[8%]">No.</th>
                <th className="py-2.5 px-3 text-center w-[14%]">시간</th>
                <th className="py-2.5 px-3 text-left w-[17%]">매장명</th>
                <th className="py-2.5 px-3 text-left w-[17%]">매장 식별ID</th>
                <th className="py-2.5 px-3 text-left w-[13%]">접속 IP</th>
                <th className="py-2.5 px-3 text-center w-[11%]">검증판정</th>
                <th className="py-2.5 px-3 text-left w-[20%]">전산 메시지</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400 italic">
                    조회된 검문 패킷 전산 로그가 비어 있습니다.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
                  const matchedStoreName = getStoreNameOfLog(log.storeId || '');

                  // 시간 문자열 변환
                  const timeStr = log.timestamp 
                    ? new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                    : log.createdAt 
                      ? new Date(log.createdAt).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                      : '-';

                  // 판정 유형 계산
                  const statusType = getStatusTypeOfLog(log);

                  return (
                    <tr 
                      key={idx} 
                      className="border-b border-stone-100 hover:bg-stone-50/80 transition-colors duration-150 last:border-0"
                    >
                      {/* 0. 줄번호 */}
                      <td className="py-2.5 px-3 text-center font-mono text-stone-550 tracking-tight font-bold select-all">
                        {log.lineIndex ? `#${log.lineIndex}` : '-'}
                      </td>

                      {/* 1. 시간 */}
                      <td className="py-2.5 px-3 text-center font-mono text-stone-400 tracking-tight font-semibold">
                        {timeStr}
                      </td>

                      {/* 2. 매장명 */}
                      <td className="py-2.5 px-3 font-semibold text-stone-850 truncate font-sans">
                        <span>
                          {matchedStoreName || <span className="text-stone-400 font-normal">미계약 테스트기</span>}
                        </span>
                      </td>

                      {/* 3. 매장 코드 */}
                      <td className="py-2.5 px-3 font-semibold text-[#8B6E32] select-all truncate">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-[10px] text-stone-700">
                          {log.storeId || 'NONE'}
                        </span>
                      </td>

                      {/* 4. 접속 IP */}
                      <td className="py-2.5 px-3 text-stone-500 font-mono tracking-tight text-[10px]">
                        {log.ip || '127.0.0.1'}
                      </td>

                      {/* 5. 상태 뱃지 (정상/주의/위험/중복) */}
                      <td className="py-2.5 px-3 text-center">
                        {statusType === 'pass' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-black leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            정상 PASS
                          </span>
                        )}
                        {statusType === 'warn' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-black leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            주의 WARN
                          </span>
                        )}
                        {statusType === 'risk' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-black leading-none animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            위험 FAIL
                          </span>
                        )}
                        {statusType === 'dup' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-black leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            중복 DUP
                          </span>
                        )}
                      </td>

                      {/* 6. 전산 메시지 */}
                      <td 
                        className="py-2.5 px-3 text-stone-600 font-medium font-sans truncate" 
                        title={log.message}
                      >
                        {log.message}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 로그 페이징 */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
