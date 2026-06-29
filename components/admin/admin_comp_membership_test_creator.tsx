import React from 'react';
import { RefreshCw, Users } from 'lucide-react';

interface AdminCompMembershipTestCreatorProps {
  isBulkCreating: boolean;
  setIsBulkCreating: (val: boolean) => void;
  fetchIntegratedBulkData: any;
  fetchCloudMembers: any;
  setSelectedMembershipIds: (val: any[]) => void;
  showAlert: (title: string, msg: string) => void;
}

export const AdminCompMembershipTestCreator: React.FC<AdminCompMembershipTestCreatorProps> = ({
  isBulkCreating,
  setIsBulkCreating,
  fetchIntegratedBulkData,
  fetchCloudMembers,
  setSelectedMembershipIds,
  showAlert
}) => {
  const handleBulkTestCreate = async (count: number) => {
    if (!window.confirm(`인증 여부가 무작위로 배분된 ${count}개의 테스트 계정을 일괄 자동 생성하시겠습니까?\n생성 후 즉시 대장에서 조회할 수 있습니다.`)) return;
    setIsBulkCreating(true);
    try {
      const res = await fetch('/api/owner-registrations/bulk-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || '테스트 계정 일괄 생성에 실패했습니다.');
      }
      showAlert('일괄 생성 완료', data.message || `${count}개의 테스트 계정이 정상 주입되었습니다!`);
      setSelectedMembershipIds([]);
      if (fetchIntegratedBulkData) {
        await fetchIntegratedBulkData('CLOUD_SQL');
      } else {
        await fetchCloudMembers();
      }
    } catch (err: any) {
      console.error(err);
      showAlert('생성 실패', err.message || '서버 통신 실패');
    } finally {
      setIsBulkCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-1 border-l border-stone-200 pl-1.5 ml-0.5">
      <span className="text-[9px] font-bold text-stone-500 px-1 select-none">TEST생성:</span>
      <button
        type="button"
        onClick={() => handleBulkTestCreate(50)}
        disabled={isBulkCreating}
        className="h-6 px-2 bg-white hover:bg-rose-50/80 border border-rose-300 disabled:bg-stone-55 disabled:border-stone-200 disabled:text-stone-400 text-rose-600 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm select-none"
      >
        {isBulkCreating ? <RefreshCw size={9} className="animate-spin text-rose-500" /> : <Users size={9} />}
        <span>50개</span>
      </button>
      <button
        type="button"
        onClick={() => handleBulkTestCreate(100)}
        disabled={isBulkCreating}
        className="h-6 px-2 bg-white hover:bg-rose-50/80 border border-rose-300 disabled:bg-stone-55 disabled:border-stone-200 disabled:text-stone-400 text-rose-600 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm select-none"
      >
        {isBulkCreating ? <RefreshCw size={9} className="animate-spin text-rose-500" /> : <Users size={9} />}
        <span>100개</span>
      </button>
      <button
        type="button"
        onClick={() => handleBulkTestCreate(500)}
        disabled={isBulkCreating}
        className="h-6 px-2 bg-white hover:bg-rose-50/80 border border-rose-300 disabled:bg-stone-55 disabled:border-stone-200 disabled:text-stone-400 text-rose-600 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm select-none"
      >
        {isBulkCreating ? <RefreshCw size={9} className="animate-spin text-rose-500" /> : <Users size={9} />}
        <span>500개</span>
      </button>
    </div>
  );
};
