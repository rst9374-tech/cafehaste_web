import React from 'react';
import { SortHeader, isTestMember, SortConfig } from './admin_comp_shared';
import { ShieldCheck, ShieldAlert, Phone, Mail, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface MembershipMember {
  id: any;
  joinDate?: string;
  signupPath?: string;
  storeCode?: string;
  storeName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  businessNumber?: string;
  businessCertPath?: string;
  content?: string;
  storeType?: '일반' | '멤버십' | '임원' | '프리미엄' | string;
}

interface AdminMembershipTableProps {
  members: MembershipMember[];
  isLocal: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  licenses: any[];
  selectedMembershipIds: any[];
  setSelectedMembershipIds: React.Dispatch<React.SetStateAction<any[]>>;
  setEditingMember: (m: any) => void;
  setSelectedCertUrl: (url: string | null) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  handleDeleteMember: (id: any) => Promise<void> | void;
  handleUpdateStoreType: (id: any, storeType: any) => Promise<void> | void;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  onQuickToggle: (memberId: string, action: 'APPROVE' | 'SUSPEND', months?: number) => Promise<void>;
  isProcessingToggle: string | null; // 로딩 제어를 위한 ID 트래킹
  handleUpdateStoreGrade?: (memberId: string, storeGrade: 'STANDARD' | 'PREMIUM', selectedDbTable: 'CLOUD_SQL' | 'LOCAL_SIM') => Promise<void> | void;
}

export const AdminMembershipTable: React.FC<AdminMembershipTableProps> = ({
  members,
  isLocal,
  currentPage,
  totalPages,
  onPageChange,
  licenses,
  selectedMembershipIds,
  setSelectedMembershipIds,
  setEditingMember,
  setSelectedCertUrl,
  showConfirm,
  handleDeleteMember,
  handleUpdateStoreType,
  sortConfig,
  onSort,
  renderPagination,
  onQuickToggle,
  isProcessingToggle,
  handleUpdateStoreGrade
}) => {
  const ITEMS_PER_PAGE = 100;

  const getLicenseInfo = (m: any) => {
    if (!m) return null;
    const storeCode = m.storeCode ? m.storeCode.trim() : '';
    const fallbackId = `없음_${m.id}`;
    return licenses.find((l: any) => {
      const dbStoreId = l.storeId ? l.storeId.trim() : '';
      return (storeCode && dbStoreId === storeCode) || dbStoreId === fallbackId;
    });
  };

  const getLicenseStatusBadge = (license: any) => {
    if (!license) {
      return (
        <span className="haste-status-badge waiting whitespace-nowrap">
          인증 대기
        </span>
      );
    }
    
    if (Number(license.isApproved) === 2) {
      return (
        <span className="haste-status-badge waiting whitespace-nowrap animate-pulse">
          인증 대기
        </span>
      );
    }
    
    const isApprovedActive = Number(license.isApproved) === 1;
    const isNotExpired = new Date(license.licenseEndDate + 'T23:59:59').getTime() >= new Date().getTime();
    
    if (!isApprovedActive) {
      return (
        <span className="haste-status-badge suspended whitespace-nowrap">
          가동 정지
        </span>
      );
    }
    
    if (!isNotExpired) {
      return (
        <span className="haste-status-badge expired whitespace-nowrap">
          기간 만료
        </span>
      );
    }
    
    const timeDiff = new Date(license.licenseEndDate + 'T23:59:59').getTime() - new Date().getTime();
    const isImminent = timeDiff > 0 && timeDiff < 30 * 24 * 60 * 60 * 1000;

    if (isImminent) {
      return (
        <span className="haste-status-badge expired whitespace-nowrap animate-pulse">
          종료 임박
        </span>
      );
    }

    return (
      <span className="haste-status-badge approved whitespace-nowrap">
        인증 완료
      </span>
    );
  };

  return (
    <div id="admin-integrated-table-wrapper" className="flex flex-col bg-stone-955 border border-stone-800 rounded-3xl shadow-2xl pb-4 overflow-hidden">
      <div className="overflow-x-auto p-0 scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[1100px] text-xs table-auto">
          <thead>
            <tr className="bg-stone-900/50 border-b border-stone-750 text-stone-400 font-extrabold uppercase font-sans text-[10px] tracking-wider select-none">
              {/* 1. 선택 */}
              <th className="py-4 px-4.5 text-center w-[75px] font-bold border-r border-stone-750">
                <div className="flex items-center justify-center gap-1.5 font-bold">
                  <input 
                    type="checkbox"
                    checked={members.length > 0 && members.every((m: any) => selectedMembershipIds.includes(m.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pageIds = members.map((m: any) => m.id);
                        setSelectedMembershipIds(prev => Array.from(new Set([...prev, ...pageIds])));
                      } else {
                        const pageIds = members.map((m: any) => m.id);
                        setSelectedMembershipIds(prev => prev.filter(id => !pageIds.includes(id)));
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-stone-850 bg-stone-950 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                  />
                  <span>선택</span>
                </div>
              </th>
              
              {/* 2. 라이선스 기간 */}
              <SortHeader label="라이선스 기간" sortKey="joinDate" widthClass="w-[200px]" sortConfig={sortConfig} onSort={onSort} />
              
              {/* 3. 상태 / 매장 유형 / 등급 통합 컬럼 (헤더 제목: 등급) */}
              <th className="py-4 px-3 text-center w-[130px] font-extrabold text-[10px] leading-tight border-r border-stone-750">
                <span>등급</span>
              </th>
              
              {/* 4. 매장 정보 */}
              <SortHeader label="매장 정보" sortKey="storeName" widthClass="w-[180px]" sortConfig={sortConfig} onSort={onSort} align="left" />
              
              {/* 5. 점주 정보 */}
              <SortHeader label="점주 정보" sortKey="ownerName" widthClass="w-[180px]" sortConfig={sortConfig} onSort={onSort} align="left" />
              
              {/* 6. 사업자 정보 */}
              <SortHeader label="사업자 정보" sortKey="businessNumber" widthClass="w-[180px]" sortConfig={sortConfig} onSort={onSort} align="left" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-750 bg-stone-955/20">
            {members.map((m: any, relativeIdx: number) => {
              const mIdx = (currentPage - 1) * ITEMS_PER_PAGE + relativeIdx + 1;
              const isTest = isTestMember(m);
              const license = getLicenseInfo(m);
              const isApprovedActive = license ? Number(license.isApproved) === 1 : false;
              const isSuspended = license ? Number(license.isApproved) === 0 : false;
              
              return (
                <tr key={m.id} className={`hover:bg-stone-800/20 transition-colors border-b border-stone-750 ${isLocal ? 'bg-amber-900/5' : ''}`}>
                  {/* 1. 선택 / 순서 */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 text-center font-bold border-r border-stone-750">
                    <div className="flex items-center justify-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedMembershipIds.includes(m.id)}
                        onChange={() => {
                          setSelectedMembershipIds(prev => 
                            prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className="w-3.5 h-3.5 rounded border-stone-700 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                      />
                      {isTest ? (
                        <span className="text-rose-400 bg-rose-950/50 text-[9.5px] rounded border border-rose-800 px-1 py-0.5 font-black animate-pulse">
                          TEST
                        </span>
                      ) : (
                        <span className="text-stone-500">{mIdx}</span>
                      )}
                    </div>
                  </td>

                  {/* 2. 신청/라이선스 기간 */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col text-left gap-1 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-stone-800 text-stone-400 border border-stone-700 rounded px-1 font-bold">가입신청</span>
                        <span className="text-stone-200 font-mono text-[11px] font-bold">{m.joinDate || '없음'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-amber-900/30 text-amber-400 border border-amber-800/50 rounded px-1 font-bold">인증기간</span>
                        <span className="text-stone-400 font-mono text-[10.5px] font-semibold break-all">
                          {license ? `${license.licenseStartDate} ~ ${license.licenseEndDate}` : '미등록 상태'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. 상태 / 매장 유형 / 등급 통합 셀 */}
                  <td className="py-3.5 px-2 text-center border-r border-stone-900 w-[130px]">
                    <div className="flex flex-col items-center gap-1.5">
                      {/* 상태 */}
                      <div className="h-6 flex items-center justify-center">
                        {getLicenseStatusBadge(license)}
                      </div>
                      
                      {/* 매장 유형 */}
                      <div className="w-full max-w-[120px]">
                        {!isLocal && handleUpdateStoreType ? (
                          <select
                            value={m.storeType || 'MEMBERSHIP'}
                            onChange={(e) => handleUpdateStoreType(m.id, e.target.value)}
                            className="dashboard-select !h-5 !py-0 text-[9.5px] font-bold w-full select-none"
                          >
                            <option value="HASTE_MEMBERSHIP">헤이스트멤버십</option>
                            <option value="MEMBERSHIP">멤버십</option>
                            <option value="EXECUTIVE">임원</option>
                          </select>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 bg-stone-900 text-stone-400 font-extrabold border border-stone-800 rounded text-[9.5px] whitespace-nowrap">
                            {m.storeType === 'HASTE_MEMBERSHIP' ? '헤이스트멤버십' : m.storeType === 'MEMBERSHIP' ? '멤버십' : m.storeType === 'EXECUTIVE' ? '임원' : (m.storeType || '멤버십')}
                          </span>
                        )}
                      </div>

                      {/* 등급 */}
                      <div className="w-full max-w-[120px]">
                        {license && handleUpdateStoreGrade ? (
                          <select
                            value={license.storeGrade === 'PREMIUM' ? 'PREMIUM' : 'STANDARD'}
                            onChange={(e) => handleUpdateStoreGrade(m.id, e.target.value as 'STANDARD' | 'PREMIUM', isLocal ? 'LOCAL_SIM' : 'CLOUD_SQL')}
                            className="dashboard-select !h-5 !py-0 text-[9.5px] font-bold w-full select-none"
                          >
                            <option value="STANDARD">베이직</option>
                            <option value="PREMIUM">프리미엄</option>
                          </select>
                        ) : license ? (
                          <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-bold select-none whitespace-nowrap ${
                            license.storeGrade === 'PREMIUM'
                              ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30 font-extrabold'
                              : 'bg-stone-900 text-stone-400 border-stone-850 font-semibold'
                          }`}>
                            {license.storeGrade === 'PREMIUM' ? '프리미엄' : '베이직'}
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-stone-600 font-medium">미등록</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 4. 매장 정보 (매장명 + 코드 합병) */}
                  <td className="py-3.5 px-3 break-all">
                    <div className="flex flex-col gap-1.5">
                      <div className="font-extrabold text-[12.5px] text-stone-100 leading-tight">
                        {(!m.storeName || m.storeName === '없음') ? (
                          <span className="text-red-400 font-black">정보 없음</span>
                        ) : (
                          m.storeName
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[9.5px] font-mono font-bold bg-stone-800 border border-stone-700 text-stone-400 px-1 rounded-md">
                          CODE: {m.storeCode || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 6. 점주 정보 (점주 성함/전화/이메일 결합) */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1">
                      <div className="text-[12px] font-black text-stone-100">{m.ownerName || '이름없음'}</div>
                      <div className="flex items-center gap-1 text-stone-400 font-mono text-[10.5px]">
                        <Phone size={10} className="text-stone-500 shrink-0" />
                        <span>{m.phone || '연락처없음'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-500 font-mono text-[10px] break-all">
                        <Mail size={10} className="text-stone-600 shrink-0" />
                        <span>{m.email || 'Email없음'}</span>
                      </div>
                    </div>
                  </td>

                  {/* 7. 사업자 정보 (사업자번호 + 등록증 확인) */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="font-mono text-[11px] font-bold tracking-tight text-stone-200">
                        {(m.businessNumber && m.businessNumber !== '기재 안 됨' && m.businessNumber !== '없음') ? (
                          m.businessNumber
                        ) : (
                          <span className="text-stone-600 font-medium">번호 기재없음</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        {/* 등록증 확인 */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] bg-stone-800 border border-stone-700 text-stone-400 px-1 rounded">등록증상태:</span>
                          {(() => {
                            const path = m.businessCertPath || '';
                            const isValidPath = path.trim() !== '' && 
                                                path !== '없음' && 
                                                path !== 'none' && 
                                                path !== '기재 안 됨' && 
                                                !path.includes('') && 
                                                (path.startsWith('http') || path.startsWith('/uploads'));
                            if (isValidPath) {
                              return (
                                <button 
                                  type="button"
                                  onClick={() => setSelectedCertUrl(path)}
                                  className="px-2 py-0.5 bg-stone-700 hover:bg-stone-600 text-stone-200 text-[10px] font-extrabold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-0.5 leading-tight"
                                >
                                  <FileText size={9} />
                                  <span>확인</span>
                                </button>
                              );
                            }
                            return <span className="text-red-400 font-extrabold text-[10px] bg-red-950/40 border border-red-800/50 rounded px-1">미첨부</span>;
                          })()}
                        </div>
                        
                        {/* 약정서 확인 */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9.5px] bg-stone-800 border border-stone-700 text-stone-400 px-1 rounded">약정서상태:</span>
                          {m.agreementDocumentUrl ? (
                            <a 
                              href={m.agreementDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 bg-[#C5A059] hover:bg-[#b08e4d] text-black text-[10px] font-extrabold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-0.5 leading-tight"
                            >
                              <FileText size={9} />
                              <span>확인</span>
                            </a>
                          ) : (
                            <span className="text-stone-600 font-extrabold text-[10px] bg-stone-800 border border-stone-700 rounded px-1">미체결</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 8. 제거 완료 */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {renderPagination(currentPage, totalPages, onPageChange)}
    </div>
  );
};
