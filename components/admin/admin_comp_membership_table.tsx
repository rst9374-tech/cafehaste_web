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
  storeType?: '일반' | '직영점' | '임원' | '프리미엄' | string;
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
    <div id="admin-integrated-table-wrapper" className="flex flex-col bg-white border border-stone-200 rounded-2xl shadow-sm pb-4">
      <div className="overflow-x-auto p-0 scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[1150px] text-xs table-fixed">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase font-sans text-[10px] tracking-wider select-none">
              {/* 1. 선택 / 순서 */}
              <th className="py-4 px-4 text-center w-[7%] min-w-[90px] font-bold border-r border-stone-150">
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
                    className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                  />
                  <span>선택 | 순서</span>
                </div>
              </th>
              
              {/* 2. 신청/라이선스 기간 */}
              <SortHeader label="신청/라이선스 기간" sortKey="joinDate" widthClass="w-[15%] min-w-[180px]" sortConfig={sortConfig} onSort={onSort} />
              
              {/* 3. 멤버 상태 */}
              <th className="py-4 px-3 text-center w-[9%] min-w-[110px] font-extrabold">멤버 상태</th>
              
              {/* 4. 매장 정보 */}
              <SortHeader label="매장 정보 (명+코드)" sortKey="storeName" widthClass="w-[14%] min-w-[150px]" sortConfig={sortConfig} onSort={onSort} align="left" />
              
              {/* 5. 매장 유형 */}
              <SortHeader label="매장 유형" sortKey="storeType" widthClass="w-[10%] min-w-[110px]" sortConfig={sortConfig} onSort={onSort} />
              
              {/* 5.5 솔루션 등급 */}
              <th className="py-4 px-3 text-center w-[10%] min-w-[120px] font-extrabold">솔루션 등급</th>
              
              {/* 6. 점주 정보 */}
              <SortHeader label="점주 정보 (점주 성함/전화/이메일)" sortKey="ownerName" widthClass="w-[16%] min-w-[190px]" sortConfig={sortConfig} onSort={onSort} align="left" />
              
              {/* 7. 사업자 정보 */}
              <SortHeader label="사업자 정보 (등록번호+확인)" sortKey="businessNumber" widthClass="w-[23%] min-w-[170px]" sortConfig={sortConfig} onSort={onSort} align="left" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150">
            {members.map((m: any, relativeIdx: number) => {
              const mIdx = (currentPage - 1) * ITEMS_PER_PAGE + relativeIdx + 1;
              const isTest = isTestMember(m);
              const license = getLicenseInfo(m);
              const isApprovedActive = license ? Number(license.isApproved) === 1 : false;
              const isSuspended = license ? Number(license.isApproved) === 0 : false;
              
              return (
                <tr key={m.id} className={`hover:bg-stone-50/55 transition-colors ${isLocal ? 'bg-[#FAF4EB]/10' : ''}`}>
                  {/* 1. 선택 / 순서 */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 text-center font-bold border-r border-stone-100">
                    <div className="flex items-center justify-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedMembershipIds.includes(m.id)}
                        onChange={() => {
                          setSelectedMembershipIds(prev => 
                            prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className="w-3.5 h-3.5 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                      />
                      {isTest ? (
                        <span className="text-rose-600 bg-rose-50 text-[9.5px] rounded border border-rose-200 px-1 py-0.5 font-black animate-pulse">
                          TEST
                        </span>
                      ) : (
                        <span>{mIdx}</span>
                      )}
                    </div>
                  </td>

                  {/* 2. 신청/라이선스 기간 */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col text-left gap-1 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-stone-100 text-stone-500 border border-stone-200 rounded px-1 font-bold">가입신청</span>
                        <span className="text-stone-800 font-mono text-[11px] font-bold">{m.joinDate || '없음'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1 font-bold">인증기간</span>
                        <span className="text-stone-500 font-mono text-[10.5px] font-semibold break-all">
                          {license ? `${license.licenseStartDate} ~ ${license.licenseEndDate}` : '미등록 상태'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. 맴버 상태 */}
                  <td className="py-3.5 px-2 text-center">
                    {getLicenseStatusBadge(license)}
                  </td>

                  {/* 4. 매장 정보 (매장명 + 코드 합병) */}
                  <td className="py-3.5 px-3 break-all">
                    <div className="flex flex-col gap-1.5">
                      <div className="font-extrabold text-[12.5px] text-stone-900 leading-tight">
                        {(!m.storeName || m.storeName === '없음') ? (
                          <span className="text-red-500 font-black">정보 없음</span>
                        ) : (
                          m.storeName
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[9.5px] font-mono font-bold bg-stone-100 border border-stone-200 text-stone-500 px-1 rounded-md">
                          CODE: {m.storeCode || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 5. 매장 유형 셀렉트박스 통합 */}
                  <td className="py-3.5 px-3 text-center">
                    {!isLocal && handleUpdateStoreType ? (
                      <select
                        value={m.storeType || '일반'}
                        onChange={(e) => handleUpdateStoreType(m.id, e.target.value)}
                        className="text-[10.5px] font-bold px-1.5 py-1 rounded border border-stone-300 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer w-full select-none"
                      >
                        <option value="프리미엄">헤이스트멤버십</option>
                        <option value="일반">멤버십</option>
                        <option value="직영점">직영점</option>
                        <option value="임원">임원</option>
                      </select>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-stone-100 text-stone-600 font-extrabold border border-stone-250 rounded text-[10.5px]">
                        {m.storeType === '일반' ? '멤버십' : m.storeType === '프리미엄' ? '헤이스트멤버십' : (m.storeType || '멤버십')}
                      </span>
                    )}
                  </td>

                  {/* 5.5 솔루션 등급 셀렉트박스 */}
                  <td className="py-3.5 px-3 text-center">
                    {license && handleUpdateStoreGrade ? (
                      <select
                        value={license.storeGrade === 'PREMIUM' ? 'PREMIUM' : 'STANDARD'}
                        onChange={(e) => handleUpdateStoreGrade(m.id, e.target.value as 'STANDARD' | 'PREMIUM', isLocal ? 'LOCAL_SIM' : 'CLOUD_SQL')}
                        className="text-[10.5px] font-bold px-1.5 py-1 rounded border border-stone-300 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer w-full select-none"
                      >
                        <option value="STANDARD">베이직</option>
                        <option value="PREMIUM">프리미엄</option>
                      </select>
                    ) : license ? (
                      <span className={`inline-block px-2 py-0.5 rounded border text-[9.5px] font-bold select-none whitespace-nowrap ${
                        license.storeGrade === 'PREMIUM'
                          ? 'bg-[#C5A059]/10 text-[#9c7a3c] border-[#C5A059]/25 font-extrabold'
                          : 'bg-stone-50 text-stone-600 border-stone-200 font-semibold'
                      }`}>
                        {license.storeGrade === 'PREMIUM' ? '프리미엄' : '베이직'}
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-stone-400 font-medium">미등록</span>
                    )}
                  </td>

                  {/* 6. 점주 정보 (점주 성함/전화/이메일 결합) */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 text-stone-700">
                      <div className="text-[12px] font-black text-stone-900">{m.ownerName || '이름없음'}</div>
                      <div className="flex items-center gap-1 text-stone-500 font-mono text-[10.5px]">
                        <Phone size={10} className="text-stone-400 shrink-0" />
                        <span>{m.phone || '연락처없음'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 font-mono text-[10px] break-all">
                        <Mail size={10} className="text-stone-300 shrink-0" />
                        <span>{m.email || 'Email없음'}</span>
                      </div>
                    </div>
                  </td>

                  {/* 7. 사업자 정보 (사업자번호 + 등록증 확인) */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1.5 text-stone-750">
                      <div className="font-mono text-[11px] font-bold tracking-tight">
                        {(m.businessNumber && m.businessNumber !== '기재 안 됨' && m.businessNumber !== '없음') ? (
                          m.businessNumber
                        ) : (
                          <span className="text-stone-400 font-medium">번호 기재없음</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] bg-stone-100 border border-stone-200 text-stone-405 px-1 rounded">등록증상태:</span>
                        {(m.businessCertPath && m.businessCertPath !== '없음' && m.businessCertPath !== '기재 안 됨') ? (
                          <button 
                            type="button"
                            onClick={() => setSelectedCertUrl(m.businessCertPath || null)}
                            className="px-2 py-0.5 bg-[#422B1E] hover:bg-[#5b3d2b] text-white text-[10px] font-extrabold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-0.5 leading-tight"
                          >
                            <FileText size={9} />
                            <span>확인</span>
                          </button>
                        ) : (
                          <span className="text-red-580 font-extrabold text-[10px] bg-red-50 border border-red-150 rounded px-1">미첨부</span>
                        )}
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
