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
        <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 font-light text-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-[#C5A059]" />
          <span>데이터베이스로부터 실시간 창업문의 대장을 파싱하는 중...</span>
        </div>
      ) : cloudConsultations.length > 0 ? (
        <>
          <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-3 rounded-xl shadow-sm mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">전체 창업문의: {cloudConsultations.length}건</span>
              {showOnlyTestConsultations && (
                <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 animate-pulse font-extrabold font-sans">
                  테스트 계정 필터 적용 중 ({sortedCloudConsultations.length}건 노출)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowOnlyTestConsultations(!showOnlyTestConsultations)}
              className={`h-8 px-3 rounded-lg text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showOnlyTestConsultations
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm hover:bg-rose-100'
                  : 'bg-white border-stone-205 text-stone-650 hover:bg-stone-50'
              }`}
            >
              <AlertOctagon size={12} className={showOnlyTestConsultations ? "animate-pulse" : ""} />
              <span>테스트 문의만 필터링</span>
            </button>
          </div>
          <div className="flex flex-col bg-white border border-stone-200 rounded-2xl shadow-sm pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1300px] text-xs font-sans">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase font-sans text-[10px] tracking-wider">
                    <th className="py-4 px-4 text-center w-28 font-bold">
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
                          className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
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
                    <th className="py-4 px-4 text-center w-28 text-[#C5A059] font-extrabold uppercase tracking-wider">조작 및 이전</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {currentCloudConsultationsToShow.map((c: any, relativeIdx) => {
                    const cIdx = (consultationsCloudPage - 1) * ITEMS_PER_PAGE + relativeIdx + 1;
                    return (
                      <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 text-center font-bold whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedConsultationIds.includes(c.id)}
                              onChange={() => {
                                setSelectedConsultationIds(prev => 
                                  prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                );
                              }}
                              className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                            />
                            {isTestMember(c) ? (
                              <span className="text-rose-600 bg-rose-50 text-[10px] rounded-md px-1 py-0.5 border border-rose-200 font-extrabold animate-pulse whitespace-nowrap" title="테스트 전용 계정">
                                TEST
                              </span>
                            ) : (
                              <span>{cIdx}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-850 text-center text-[11px] font-bold">
                          {c.joinDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-700 font-bold border border-purple-200 rounded text-[11px] whitespace-nowrap">
                            {c.signupPath || '창업문의'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#422B1E] text-[11px]">
                          {c.ownerName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-800 text-[11px] font-bold select-all">
                          {c.phone}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-600 text-[11px] font-bold select-all">
                          {c.email || '기재 안 됨'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-900 bg-stone-100 border border-stone-200 px-2 py-1 rounded text-[11px]">
                            {c.regionName || '전국구'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-amber-800 font-bold text-[11px]">
                          {(parseInt(c.capital) || 0).toLocaleString()}만원
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${c.hasStore === '있음' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                            {c.hasStore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] font-bold text-[#A57C39]">
                          {c.inquiryPath || '기타'}
                        </td>
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="p-2 bg-[#FAF4EB]/50 border border-amber-900/10 rounded-lg text-stone-650 text-[11px] leading-relaxed break-all font-bold font-sans max-h-24 overflow-y-auto">
                            {c.content || '기재 안 됨'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleCompleteFranchiseCloud(c)}
                            className="px-2.5 py-1.5 rounded bg-[#C5A059] text-stone-950 font-black text-[10px] hover:bg-[#b08c47] hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-sm"
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
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 font-light text-xs flex flex-col justify-center items-center gap-2">
          <Database size={24} className="text-stone-300 mb-1" />
          <strong>클라우드 DB 창업문의 데이터가 비어 있습니다.</strong>
          <span className="text-[10px] text-stone-400">카페 메뉴 중 'Franchise' &rarr; '스타트업 창업 설명 상담' 메뉴에서 정보를 등록해 보세요!</span>
        </div>
      )}
    </div>
  );
};
