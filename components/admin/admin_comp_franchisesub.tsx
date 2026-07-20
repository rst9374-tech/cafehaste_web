import React, { useState, useMemo, useEffect } from 'react';
import { Database, RefreshCw, AlertOctagon } from 'lucide-react';
import { SortHeader, isTestMember, SortConfig } from './admin_comp_shared';

interface AdminFranchiseSubTabProps {
  cloudDbInfo: any;
  cloudConsultations: any[];
  isFetchingConsultations: boolean;
  fetchCloudConsultations: () => Promise<void>;
  
  selectedConsultationIds: any[];
  setSelectedConsultationIds: React.Dispatch<React.SetStateAction<any[]>>;
  
  handleCompleteFranchiseCloud: (c: any) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
}

const ITEMS_PER_PAGE = 100;

export const AdminFranchiseSubTab: React.FC<AdminFranchiseSubTabProps> = ({
  cloudDbInfo,
  cloudConsultations,
  isFetchingConsultations,
  fetchCloudConsultations,
  
  selectedConsultationIds,
  setSelectedConsultationIds,
  
  handleCompleteFranchiseCloud,
  renderPagination
}) => {
  const [showOnlyTestConsultations, setShowOnlyTestConsultations] = useState<boolean>(false);
  const [consultationsCloudPage, setConsultationsCloudPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'joinDate', direction: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedCloudConsultations = useMemo(() => {
    let list = cloudConsultations;
    if (showOnlyTestConsultations) {
      list = list.filter(c => isTestMember(c));
    }
    if (!sortConfig) return list;
    const sorted = [...list];
    sorted.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      
      if (sortConfig.key === 'capital') {
        const numA = parseInt(valA) || 0;
        const numB = parseInt(valB) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      if (typeof valA === 'string') valA = valA.trim();
      if (typeof valB === 'string') valB = valB.trim();
      
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [cloudConsultations, sortConfig, showOnlyTestConsultations]);

  useEffect(() => {
    setConsultationsCloudPage(1);
  }, [cloudConsultations.length, showOnlyTestConsultations]);

  // Cloud SQL consultations pagination
  const totalCloudConsultationsPages = Math.ceil(sortedCloudConsultations.length / ITEMS_PER_PAGE) || 1;
  const currentCloudConsultationsToShow = useMemo(() => {
    const startIndex = (consultationsCloudPage - 1) * ITEMS_PER_PAGE;
    return sortedCloudConsultations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedCloudConsultations, consultationsCloudPage]);

  return (
    // CLOUD SQL CONSULTATIONS (창업문의) DISPLAY
    <div className="flex flex-col gap-4 font-sans">
      {/* Status strip - Removed as per request */}

      {isFetchingConsultations ? (
        <div className="py-20 text-center bg-stone-900 rounded-2xl border border-stone-850 text-stone-400 font-light text-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-[#C5A059]" />
          <span>데이터베이스로부터 실시간 창업문의 대장을 파싱하는 중...</span>
        </div>
      ) : cloudConsultations.length > 0 ? (
        <>
          <div className="flex items-center justify-between bg-stone-950 border border-stone-900 p-4.5 rounded-3xl shadow-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-200">전체 창업문의 대장: {cloudConsultations.length}건</span>
              {showOnlyTestConsultations && (
                <span className="text-[10px] text-rose-400 bg-rose-955/20 border border-rose-900/30 rounded-lg px-2 py-0.5 animate-pulse font-black font-sans">
                  테스트 필터 적용 중 ({sortedCloudConsultations.length}건)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowOnlyTestConsultations(!showOnlyTestConsultations)}
              className={showOnlyTestConsultations ? 'dashboard-btn-rose-filter !h-8.5 !text-xs !px-3.5' : 'dashboard-btn-dark-filter !h-8.5 !text-xs !px-3.5'}
            >
              <AlertOctagon size={13} className={showOnlyTestConsultations ? "animate-pulse" : ""} />
              <span>테스트 문의 필터</span>
            </button>
          </div>
          <div className="flex flex-col bg-stone-950 border border-stone-900 rounded-3xl shadow-2xl pb-4 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[1300px] text-xs font-sans table-auto dashboard-table">
                <thead>
                  <tr className="bg-stone-900/50 border-b border-stone-900 text-stone-400 font-extrabold uppercase font-sans text-[10px] tracking-wider select-none">
                    <th className="py-4 px-4.5 text-center w-28 font-bold border-r border-stone-900">
                      <div className="flex items-center justify-center gap-1.5 font-bold">
                        <input 
                          type="checkbox"
                          checked={currentCloudConsultationsToShow.length > 0 && currentCloudConsultationsToShow.every((c: any) => selectedConsultationIds.includes(c.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const pageIds = currentCloudConsultationsToShow.map((c: any) => c.id);
                              setSelectedConsultationIds(prev => Array.from(new Set([...prev, ...pageIds])));
                            } else {
                              const pageIds = currentCloudConsultationsToShow.map((c: any) => c.id);
                              setSelectedConsultationIds(prev => prev.filter(id => !pageIds.includes(id)));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-stone-800 bg-stone-950 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                        />
                        <span>선택 | 순서</span>
                      </div>
                    </th>
                    <SortHeader label="신청일" sortKey="joinDate" widthClass="w-32 text-center" sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label="가입경로" sortKey="signupPath" widthClass="w-28 text-center" sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label="성함" sortKey="ownerName" widthClass="w-24" sortConfig={sortConfig} onSort={handleSort} align="left" />
                    <SortHeader label="연락처" sortKey="phone" widthClass="w-36" sortConfig={sortConfig} onSort={handleSort} align="left" />
                    <SortHeader label="이메일" sortKey="email" widthClass="w-48" sortConfig={sortConfig} onSort={handleSort} align="left" />
                    <SortHeader label="창업희망지역" sortKey="regionName" widthClass="w-40" sortConfig={sortConfig} onSort={handleSort} align="left" />
                    <SortHeader label="창업 자본금" sortKey="capital" widthClass="w-32 text-center" sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label="점포유무" sortKey="hasStore" widthClass="w-24 text-center" sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label="문의경로" sortKey="inquiryPath" widthClass="w-28" sortConfig={sortConfig} onSort={handleSort} align="left" />
                    <SortHeader label="문의내용" sortKey="content" widthClass="w-64" sortConfig={sortConfig} onSort={handleSort} align="left" />
                    <th className="py-4 px-4 text-center w-28 text-[#C5A059] font-black uppercase tracking-wider">조작</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-900 bg-stone-950/20">
                  {currentCloudConsultationsToShow.map((c: any, relativeIdx) => {
                    const cIdx = (consultationsCloudPage - 1) * ITEMS_PER_PAGE + relativeIdx + 1;
                    return (
                      <tr key={c.id} className="border-b border-stone-900 last:border-0 hover:bg-stone-900/40 transition-colors duration-150">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 text-center font-bold whitespace-nowrap border-r border-stone-900">
                          <div className="flex items-center justify-center gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedConsultationIds.includes(c.id)}
                              onChange={() => {
                                setSelectedConsultationIds(prev => 
                                  prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                );
                              }}
                              className="w-3.5 h-3.5 rounded border-stone-850 bg-stone-950 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                            />
                            {isTestMember(c) ? (
                              <span className="text-rose-455 bg-rose-955/20 text-[9.5px] rounded border border-rose-900/40 px-1 py-0.5 font-black animate-pulse whitespace-nowrap" title="테스트 전용 계정">
                                TEST
                              </span>
                            ) : (
                              <span>{cIdx}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4.5 font-mono text-stone-400 text-center text-[11px] font-bold">
                          {c.joinDate}
                        </td>
                        <td className="py-3.5 px-4.5 text-center">
                          <span className="inline-block px-2 py-0.5 bg-purple-955/20 text-purple-400 font-bold border border-purple-900/30 rounded-lg text-[11px] whitespace-nowrap">
                            {c.signupPath || '창업문의'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4.5 font-bold text-stone-200 text-[11.5px] whitespace-nowrap">
                          {c.ownerName}
                        </td>
                        <td className="py-3.5 px-4.5 font-mono text-stone-300 text-[11px] font-bold select-all whitespace-nowrap">
                          {c.phone}
                        </td>
                        <td className="py-3.5 px-4.5 font-mono text-stone-450 text-[11px] font-semibold select-all whitespace-nowrap">
                          {c.email || '기재 안 됨'}
                        </td>
                        <td className="py-3.5 px-4.5 whitespace-nowrap">
                          <span className="font-bold text-stone-300 bg-stone-900 border border-stone-850 px-2 py-1 rounded-xl text-[11px]">
                            {c.regionName || '전국구'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4.5 text-amber-500 font-bold text-[11px] whitespace-nowrap text-center">
                          {(parseInt(c.capital) || 0).toLocaleString()}만원
                        </td>
                        <td className="py-3.5 px-4.5 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${c.hasStore === '있음' ? 'bg-amber-955/20 text-amber-400 border border-amber-900/30' : 'bg-stone-900 text-stone-500 border border-stone-850'}`}>
                            {c.hasStore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4.5 text-[11px] font-bold text-[#C5A059] whitespace-nowrap">
                          {c.inquiryPath || '기타'}
                        </td>
                        <td className="py-3.5 px-4.5 max-w-sm whitespace-nowrap">
                          <div className="p-2 bg-stone-900 border border-stone-850 rounded-xl text-stone-300 text-[11px] leading-relaxed break-all font-semibold font-sans max-h-20 overflow-y-auto">
                            {c.content || '기재 안 됨'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleCompleteFranchiseCloud(c)}
                            className="dashboard-btn-gold-compact !h-auto !py-1.5 !px-3 text-[10.5px] whitespace-nowrap"
                            title="창업 완료 및 정식멤버 등록"
                          >
                            멤버십이동
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination(consultationsCloudPage, totalCloudConsultationsPages, setConsultationsCloudPage)}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-stone-950 rounded-3xl border border-dashed border-stone-900 text-stone-400 font-light text-xs flex flex-col justify-center items-center gap-3">
          <Database size={28} className="text-stone-700 mb-1" />
          <strong className="text-stone-300 text-sm">클라우드 DB 창업문의 데이터가 비어 있습니다.</strong>
          <span className="text-[10.5px] text-stone-550 max-w-sm leading-relaxed break-keep">카페 홈페이지의 'Franchise' &rarr; '스타트업 창업 설명 상담' 메뉴에서 경영주 문의를 접수해 주세요.</span>
        </div>
      )}
    </div>
  );
};
