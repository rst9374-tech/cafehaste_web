import React, { useState } from 'react';
import { Key, X } from 'lucide-react';

interface HastePasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  uStoreCode: string;
}

export const HastePasswordChangeModal: React.FC<HastePasswordChangeModalProps> = ({ isOpen, onClose, uStoreCode }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const checkCapsLock = (e: React.KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setChangeError('모든 비밀번호 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangeError('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/membership/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeCode: uStoreCode,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangeSuccess(data.message || '비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          onClose();
          setChangeSuccess('');
        }, 1500);
      } else {
        setChangeError(data.message || '비밀번호 변경 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setChangeError('서버 통신 실패: ' + err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs font-sans">
      <div onClick={onClose} className="fixed inset-0 cursor-pointer" />
      <div className="relative bg-[#F4EADB] rounded-[30px] shadow-2xl w-full max-w-md overflow-hidden z-50 flex flex-col text-left animate-scaleUp">
        
        {/* Header */}
        <div className="bg-[#15141D] border-b border-stone-800 px-6 py-4.5 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Key className="text-[#C5A059]" size={14} />
            </div>
            <div>
              <span className="haste-category-label-en mb-0.5">HASTE MEMBERSHIP</span>
              <h3 className="haste-section-title-3 !text-white leading-tight">비밀번호 변경</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors cursor-pointer"><X size={18} /></button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col gap-4">
          <form onSubmit={handleChangePasswordSubmit} className="bg-[#F4EADB]/90 rounded-[24px] p-6 border-2 border-stone-300/90 flex flex-col gap-4">
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="haste-body-text-2 !text-[#422B1E] block mb-1.5">현재 비밀번호 *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  onBlur={() => setIsCapsLockOn(false)}
                  placeholder="현재 비밀번호 입력"
                  className="w-full rounded-full border border-stone-300 bg-white py-2.5 px-5 text-xs font-semibold text-stone-850 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="haste-body-text-2 !text-[#422B1E] block mb-1.5">새 비밀번호 *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  onBlur={() => setIsCapsLockOn(false)}
                  placeholder="새 비밀번호 입력"
                  className="w-full rounded-full border border-stone-300 bg-white py-2.5 px-5 text-xs font-semibold text-stone-850 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="haste-body-text-2 !text-[#422B1E] block mb-1.5">새 비밀번호 확인 *</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  onBlur={() => setIsCapsLockOn(false)}
                  placeholder="새 비밀번호 확인"
                  className="w-full rounded-full border border-stone-300 bg-white py-2.5 px-5 text-xs font-semibold text-stone-850 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-xs"
                />
              </div>
            </div>

            {isCapsLockOn && (
              <p className="text-amber-700 text-[10px] font-semibold pl-1">⚠️ Caps Lock이 켜져 있습니다. (비밀번호 대소문자 확인)</p>
            )}
            {changeError && (
              <p className="text-rose-600 text-[10px] font-semibold pl-1">⚠️ {changeError}</p>
            )}
            {changeSuccess && (
              <p className="text-emerald-700 text-[10px] font-semibold pl-1">✓ {changeSuccess}</p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-300/50 mt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isChangingPassword}
                className="px-6 py-2.5 bg-[#FAF9F6] hover:bg-[#F2F0E8] text-stone-700 font-medium rounded-full border border-stone-300 transition-all text-xs cursor-pointer select-none active:scale-95 shadow-xs"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-8 py-3 bg-[#422B1E] hover:bg-stone-850 disabled:opacity-50 text-white font-extrabold text-xs tracking-wide rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>변경 중...</span>
                  </>
                ) : (
                  <span>변경 완료</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
