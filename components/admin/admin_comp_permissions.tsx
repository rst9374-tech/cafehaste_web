import React, { useState, useEffect } from 'react';
import { Shield, Save, RefreshCw } from 'lucide-react';
import { AdminConfirmModal } from './admin_comp_shared';

interface PermissionItem {
  id?: number;
  gradeType: string;
  categoryKey: string;
  canRead: number;
  canWrite: number;
  canList: number;
}

interface AdminPermissionsTabProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
}

export const AdminPermissionsTab: React.FC<AdminPermissionsTabProps> = ({
  showTemporaryToast,
  showTemporaryError
}) => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [activeGrade, setActiveGrade] = useState<string>('일반');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const grades = ['일반', '멤버십', '임원', '프리미엄'];
  const categories = ['헤이스트소식', '노하우팁', '장비운영', '자료실', '레시피', '핵심정보', '헤이스트멤버십전용', 'Q&A', '직거래', 'TEST'];

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/grade-permissions');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPermissions(data.permissions || []);
        } else {
          showTemporaryError(data.error || '권한 로드 실패');
        }
      } else {
        showTemporaryError('서버 통신 실패');
      }
    } catch (e: any) {
      showTemporaryError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleToggle = (grade: string, category: string, field: 'canRead' | 'canWrite' | 'canList') => {
    setPermissions(prev => {
      const idx = prev.findIndex(p => p.gradeType === grade && p.categoryKey === category);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          [field]: updated[idx][field] === 1 ? 0 : 1
        };
        return updated;
      } else {
        const defaultPerm = {
          gradeType: grade,
          categoryKey: category,
          canRead: 0,
          canWrite: 0,
          canList: 1
        };
        defaultPerm[field] = defaultPerm[field] === 1 ? 0 : 1;
        return [...prev, defaultPerm];
      }
    });
  };

  const getPermission = (grade: string, category: string): PermissionItem => {
    return permissions.find(p => p.gradeType === grade && p.categoryKey === category) || {
      gradeType: grade,
      categoryKey: category,
      canRead: 0,
      canWrite: 0,
      canList: 1
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    setShowConfirm(false);
    try {
      const res = await fetch('/api/grade-permissions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast('등급별 권한 설정이 성공적으로 저장되었습니다.');
          fetchPermissions();
        } else {
          showTemporaryError(data.message || '저장 중 오류 발생');
        }
      } else {
        showTemporaryError('저장 실패');
      }
    } catch (e: any) {
      showTemporaryError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full font-sans animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-900 pb-4 mb-5 gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">
            HASTE PERMISSION ENGINE
          </span>
          <h2 className="font-sans font-normal leading-tight text-stone-100 tracking-tight text-xl md:text-2xl">
            등급별 게시판 권한 설정
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchPermissions}
            disabled={isLoading}
            className="p-2 bg-stone-900 hover:bg-stone-850 border border-stone-900 rounded-xl transition-all text-stone-400 active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isSaving || isLoading}
            className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2 px-4 rounded-xl border border-stone-900 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save size={13} />
            <span>설정 저장하기</span>
          </button>
        </div>
      </div>

      {/* 4개의 등급 설정 탭 (1줄 배치, 흰색 테두리 배제) */}
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-3 border-b border-stone-900 mb-4 select-none">
        {grades.map(grade => {
          const isActive = activeGrade === grade;
          return (
            <button
              key={grade}
              onClick={() => setActiveGrade(grade)}
              className={`h-8 px-4 border transition-all cursor-pointer rounded-full text-xs font-bold flex items-center focus:outline-none whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-stone-900 border-[#C5A059]/40 text-[#C5A059] shadow-sm'
                  : 'bg-stone-950 hover:bg-stone-900 border-stone-900 text-stone-400'
              }`}
            >
              <span>{grade === '일반' ? '일반 회원' : grade === '멤버십' ? '멤버십 회원' : grade === '프리미엄' ? '프리미엄 멤버십' : grade === '임원' ? '임원 등급 매장' : grade}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-stone-500 text-xs font-semibold flex flex-col items-center gap-2 justify-center">
          <RefreshCw size={20} className="animate-spin text-[#C5A059]" />
          <span>권한 설정표 로딩중...</span>
        </div>
      ) : (
        <div className="bg-stone-950 border border-stone-900 rounded-2xl p-4 shadow-sm overflow-hidden select-none">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-900 bg-stone-900/30 text-stone-350 font-extrabold uppercase tracking-wider text-[10px] text-center">
                  <th className="py-3 px-4 text-left w-64 border-r border-stone-900">
                    게시판 카테고리
                  </th>
                  <th className="py-3 px-3 border-r border-stone-900 text-center font-extrabold w-28">목록 (List)</th>
                  <th className="py-3 px-3 border-r border-stone-900 text-center font-extrabold w-28">읽기 (Read)</th>
                  <th className="py-3 px-3 text-center font-extrabold w-28">쓰기 (Write)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900 font-semibold text-xs text-stone-300">
                {categories.map(cat => {
                  const perm = getPermission(activeGrade, cat);
                  return (
                    <tr key={cat} className="hover:bg-stone-900/10 transition-colors">
                      <td className="py-4 px-4 font-bold text-stone-200 border-r border-stone-900 text-[12px]">
                        {cat === '헤이스트소식' ? '소식' : cat === '노하우팁' ? '노하우팁' : cat}
                      </td>
                      
                      {/* 목록 권한 (List) */}
                      <td className="py-3 px-3 text-center border-r border-stone-900">
                        <label className="inline-flex items-center justify-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={perm.canList === 1}
                            onChange={() => handleToggle(activeGrade, cat, 'canList')}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-900 border border-stone-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-stone-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-600 peer-checked:after:bg-[#C5A059] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#C5A059]/10 peer-checked:border-[#C5A059]/30 relative transition-colors duration-250"></div>
                        </label>
                      </td>
                      
                      {/* 읽기 권한 (Read) */}
                      <td className="py-3 px-3 text-center border-r border-stone-900">
                        <label className="inline-flex items-center justify-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={perm.canRead === 1}
                            onChange={() => handleToggle(activeGrade, cat, 'canRead')}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-900 border border-stone-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-stone-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-600 peer-checked:after:bg-[#C5A059] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#C5A059]/10 peer-checked:border-[#C5A059]/30 relative transition-colors duration-250"></div>
                        </label>
                      </td>
                      
                      {/* 쓰기 권한 (Write) */}
                      <td className="py-3 px-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={perm.canWrite === 1}
                            onChange={() => handleToggle(activeGrade, cat, 'canWrite')}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-900 border border-stone-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-stone-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-600 peer-checked:after:bg-[#C5A059] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#C5A059]/10 peer-checked:border-[#C5A059]/30 relative transition-colors duration-250"></div>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfirm && (
        <AdminConfirmModal
          message={`설정하신 등급별 게시판 권한을 전산 서버 및 로컬 캐시에 저장하시겠습니까?\n저장 즉시 전체 가맹점의 접근 권한 제어가 갱신됩니다.`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleSave}
        />
      )}
    </div>
  );
};
