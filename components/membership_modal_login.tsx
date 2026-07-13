import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

interface HasteLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  onOpenSignUp: () => void;
}

export const HasteLoginModal: React.FC<HasteLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenSignUp
}) => {
  const [storeCode, setStoreCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('haste_remembered_id') || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('haste_remembered_id');
    }
    return false;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const checkCapsLock = (e: React.KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleOnlyNumberCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setStoreCode(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeCode || !password) {
      setErrorMsg('매장 코드와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ storeCode, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '인증에 실패하였습니다.');
      }

      setSuccessMsg(data.message || '로그인에 성공했습니다.');
      
      // 세션 스토리지 & 로컬 스토리지 반영
      localStorage.setItem('haste_logged_user', JSON.stringify(data.user));
      
      if (rememberMe) {
        localStorage.setItem('haste_remembered_id', storeCode);
      } else {
        localStorage.removeItem('haste_remembered_id');
      }
      
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
        // 초기화
        setPassword('');
        setSuccessMsg(null);
      }, 1000);

    } catch (err: any) {
      console.error('[Login Fail]', err);
      setErrorMsg(err.message || '로그인 매칭 과정에서 기각이 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          {/* BackDrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-[#F4EADB] text-stone-900 rounded-[28px] shadow-2xl max-w-sm w-full overflow-hidden font-sans z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="border-b border-stone-800/80 px-6 py-4.5 flex justify-between items-center bg-[#15141D] text-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                  <KeyRound size={13} />
                </div>
                <div>
                  <span className="haste-category-label-en mb-0.5">LOGIN GATE</span>
                  <h3 className="haste-section-title-3 !text-white leading-tight">멤버십 가입신청</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col gap-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[10px] text-[#422B1E] font-bold uppercase tracking-wider mb-1.5 label-sans">
                    매장 코드
                  </label>
                  <div className="relative p-0 m-0">
                    <input
                      type="text"
                      required
                      value={storeCode}
                      onChange={handleOnlyNumberCode}
                      placeholder="숫자만 입력 (예: 100412)"
                      className="w-full rounded-full border border-stone-300 bg-white py-2.5 px-5 text-xs font-semibold text-stone-800 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#422B1E] font-bold uppercase tracking-wider mb-1.5 label-sans">
                    점주전용 비밀번호
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={checkCapsLock}
                    onKeyUp={checkCapsLock}
                    onBlur={() => setIsCapsLockOn(false)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full rounded-full border border-stone-300 bg-white py-2.5 px-5 text-xs font-semibold text-stone-850 outline-none focus:border-[#422B1E] focus:ring-1 focus:ring-[#422B1E] transition-all shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between px-2 mt-0.5 mb-1.5">
                  <label className="flex items-center gap-2 text-[11px] text-stone-600 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-stone-300 text-[#422B1E] focus:ring-[#422B1E] cursor-pointer"
                    />
                    <span>매장 코드 기억하기</span>
                  </label>
                </div>

                {/* Caps Lock Banner */}
                {isCapsLockOn && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle size={13} className="text-amber-600 shrink-0" />
                    <span>Caps Lock이 켜져 있습니다. (비밀번호 대소문자 확인)</span>
                  </motion.div>
                )}

                {/* Error Banner */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-800 text-[11px] p-3 rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle size={13} className="text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-xl flex items-center gap-2"
                  >
                    <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 font-bold text-xs bg-[#422B1E] hover:bg-stone-800 active:scale-[0.98] text-[#C5A059] py-3 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 shadow-sm"
                >
                  {isSubmitting ? '로그인 처리 중...' : '멤버십 가입신청'}
                </button>
              </form>

              {/* Guide links */}
              <div className="mt-2 text-center flex flex-col gap-1 z-10">
                <p className="text-[10px] text-stone-500 font-medium">
                  아직 멤버십 계정이 개설되지 않으셨나요?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSignUp();
                  }}
                  className="text-xs text-[#422B1E] font-bold tracking-tight hover:underline cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <span>멤버십 가입신청 변경</span>
                  <span className="text-[#C5A059]">➜</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
