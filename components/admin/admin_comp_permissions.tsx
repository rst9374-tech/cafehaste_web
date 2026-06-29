import React, { useState, useEffect } from 'react';
import { Shield, Save, RefreshCw } from 'lucide-react';
import { AdminConfirmModal } from './admin_comp_shared';

interface PermissionItem {
  id?: number;
  gradeType: string;
  categoryKey: string;
  canRead: number;
  canWrite: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const grades = ['일반', '직영점', '임원', '프리미엄'];
  const categories = ['헤이스트소식', '노하우팁', '레시피', '핵심정보', '장비운영', '직거래', 'Q&A'];

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

  const handleToggle = (grade: string, category: string, field: 'canRead' | 'canWrite') => {
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
        return [...prev, {
          gradeType: grade,
          categoryKey: category,
          canRead: field === 'canRead' ? 1 : 0,
          canWrite: field === 'canWrite' ? 1 : 0
        }];
      }
    });
  };

  const getPermission = (grade: string, category: string): PermissionItem => {
    return permissions.find(p => p.gradeType === grade && p.categoryKey === category) || {
      gradeType: grade,
      categoryKey: category,
      canRead: 0,
      canWrite: 0
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
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">
            HASTE PERMISSION ENGINE
          </span>
          <h2 className="font-sans font-normal leading-tight text-stone-900 tracking-tight text-2xl md:text-3xl">
            등급별 게시판 권한 설정
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchPermissions}
            disabled={isLoading}
            className="p-2.5 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all text-stone-650 active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isSaving || isLoading}
            className="bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-3.5 px-5 rounded-2xl border border-stone-800 transition-all text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save size={14} />
            <span>설정 저장하기</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-stone-450 text-xs font-semibold flex flex-col items-center gap-2 justify-center">
          <RefreshCw size={24} className="animate-spin text-[#C5A059]" />
          <span>권한 설정표 로딩중...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {grades.map(grade => {
            return (
              <div key={grade} className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center">
                      <Shield size={16} />
                    </div>
                    <span className="font-sans font-bold text-stone-900 text-base md:text-lg">
                      {grade === '일반' ? '멤버십' : grade === '프리미엄' ? '헤이스트멤버십' : grade} 등급 매장
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans tracking-wide bg-stone-900 text-[#C5A059] border border-stone-850">
                    ROLE_GRADE
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-150 text-stone-500 font-bold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-3">카테고리</th>
                        <th className="py-2.5 px-3 text-center w-24">읽기 (Read)</th>
                        <th className="py-2.5 px-3 text-center w-24">쓰기 (Write)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {categories.map(cat => {
                        const perm = getPermission(grade, cat);
                        return (
                          <tr key={cat} className="hover:bg-stone-50/50">
                            <td className="py-3.5 px-3 font-semibold text-stone-750 text-xs">{cat === '헤이스트소식' ? '소식' : cat === '노하우팁' ? '노하우팁' : cat}</td>
                            <td className="py-3.5 px-3 text-center">
                              <label className="inline-flex items-center justify-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={perm.canRead === 1}
                                  onChange={() => handleToggle(grade, cat, 'canRead')}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-white after:border-stone-300 after:border after:rounded-full after:height-4 after:width-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C5A059] relative transition-colors duration-200"></div>
                              </label>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <label className="inline-flex items-center justify-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={perm.canWrite === 1}
                                  onChange={() => handleToggle(grade, cat, 'canWrite')}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-white after:border-stone-300 after:border after:rounded-full after:height-4 after:width-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C5A059] relative transition-colors duration-200"></div>
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
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
