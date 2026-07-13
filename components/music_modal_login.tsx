import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, User, AlertCircle } from 'lucide-react';

interface MusicLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicLoginModal: React.FC<MusicLoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // Direct validation for admin as requested (password: admin8113)
      if (username === 'admin' && password === 'admin8113') {
        localStorage.setItem('haste_admin_auth', 'true');
        localStorage.setItem('haste_music_mode', 'true');
        localStorage.setItem('haste_logged_user', JSON.stringify({
          id: -999,
          role: 'ADMIN',
          username: 'admin',
          store_name: '헤이스트',
          owner_name: '최고 권한자'
        }));
        
        window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'MUSIC_ADMIN' } }));
        onClose();
      } else {
        // Fallback or general server validation if needed
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('haste_admin_auth', 'true');
            localStorage.setItem('haste_music_mode', 'true');
            window.dispatchEvent(new CustomEvent('haste_navigate', { detail: { route: 'MUSIC_ADMIN' } }));
            onClose();
            return;
          }
        }
        setErrorMsg('인증 정보가 올바르지 않습니다. 헤이스트 마스터 계정만 로그인 가능합니다.');
      }
    } catch (err) {
      setErrorMsg('서버와 통신하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      {/* BackDrop click to close */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f0f12] border border-[#C5A059]/30 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl shadow-[#C5A059]/10 relative z-10"
      >
        {/* Modal Header */}
        <div className="border-b border-[#C5A059]/15 p-5 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-2">
            <Lock className="text-[#C5A059] w-4 h-4" />
            <span className="text-xs font-black text-white tracking-widest uppercase">MASTER ADMIN LOGIN</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-500 hover:text-white bg-stone-900 border border-stone-800 rounded-xl transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-amber-950/35 border border-amber-900/40 text-amber-400 rounded-xl flex items-center gap-2 text-[10px] font-bold">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-stone-400 text-[10px] font-bold tracking-wider uppercase block">ADMIN ID</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-stone-500 w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="관리자 아이디"
                className="w-full bg-black/60 border border-[#C5A059]/20 hover:border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder-stone-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-stone-400 text-[10px] font-bold tracking-wider uppercase block">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-stone-500 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 패스워드"
                className="w-full bg-black/60 border border-[#C5A059]/20 hover:border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder-stone-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C5A059] hover:bg-[#B8964C] text-stone-950 font-black py-3 rounded-xl text-xs shadow-lg shadow-[#C5A059]/15 transition-all active:scale-[0.98] cursor-pointer mt-2"
          >
            {isLoading ? '인증 시퀀스 확인 중...' : '마스터 권한 획득'}
          </button>

          <p className="text-[9px] text-stone-600 text-center pt-2 leading-relaxed font-mono">
            SECURE PORTAL &copy; CAFE HASTE BGM SYSTEM
          </p>
        </form>
      </motion.div>
    </div>
  );
};
