import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, RefreshCw, AlertOctagon } from 'lucide-react';

interface AdminLoginProps {
  enteredUsername: string;
  setEnteredUsername: (val: string) => void;
  enteredPassword: string;
  setEnteredPassword: (val: string) => void;
  authError: string | null;
  isAuthLoading: boolean;
  handleAdminLogin: (e: React.FormEvent) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  enteredUsername,
  setEnteredUsername,
  enteredPassword,
  setEnteredPassword,
  authError,
  isAuthLoading,
  handleAdminLogin
}) => {
  return (
    <div className="container mx-auto max-w-lg px-6 py-16 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-stone-200"
      >
        {/* Header & Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9c7b41] to-[#C5A059] flex items-center justify-center text-white mb-4 shadow-[0_4px_20px_rgba(197,160,89,0.25)]">
            <ShieldCheck size={32} />
          </div>
          
          <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em] font-mono mb-1">
            HASTE ADMIN CONSOLE
          </span>
          <h2 className="font-serif text-2xl text-white font-normal tracking-tight">
            통합 전산관리인 인증
          </h2>
          <p className="text-xs text-stone-400 mt-2 max-w-sm leading-relaxed">
            본 페이지는 관리자 전용 영역입니다. 데이터베이스에 저장된 승인된 계정 정보로 로그인해 주십시오.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 font-mono">
              관리자 아이디 (USERNAME)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={enteredUsername}
                onChange={(e) => setEnteredUsername(e.target.value)}
                placeholder=""
                className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-850 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/40 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 font-mono">
              비밀번호 (SECURE PASSWORD)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-850 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/40 transition-all font-mono"
              />
            </div>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl flex items-start gap-2.5 text-xs text-red-350"
            >
              <AlertOctagon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">인증 실패</span>
                {authError}
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#b38f4d] to-[#C5A059] hover:from-[#C5A059] hover:to-[#dfbb77] text-stone-950 text-xs font-extrabold rounded-xl tracking-[0.15em] uppercase transition-all shadow-lg shadow-[#C5A059]/10 hover:shadow-[#C5A059]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAuthLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                실시간 DB 대조중...
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                보안 인증인가 갱신
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
