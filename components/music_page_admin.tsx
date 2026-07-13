import React, { useState } from 'react';
import { Music, Lock } from 'lucide-react';
import { useAdminState } from './admin/admin_hook_state';
import { HasteBoard } from './board_page_main';
import { AdminMusicSongTab } from './admin/admin_comp_music_song';
import { AdminMusicCoverTab } from './admin/admin_comp_music_cover';
import { AdminPermissionsTab } from './admin/admin_comp_permissions';
import { AdminHqStampTab } from './admin/admin_comp_hqstamp';
import { AdminPagination } from './admin/admin_comp_pagination';
import './music.css';

export const MusicAdminPage: React.FC = () => {
  const {
    successMsg,
    errorMsg,
    isAdminAuth,
    enteredUsername,
    setEnteredUsername,
    enteredPassword,
    setEnteredPassword,
    authError,
    isAuthLoading,
    showTemporaryToast,
    showTemporaryError,
    handleAdminLogin,
  } = useAdminState();

  const [activeTab, setActiveTab] = useState<'BOARD' | 'MUSIC_SONG' | 'MUSIC_COVER' | 'PERMISSIONS' | 'HQ_STAMP'>('BOARD');

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => {
    return (
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    );
  };

  if (!isAdminAuth) {
    return (
      <div className="music-theme-body min-h-[70vh] flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-sm bg-[#0f0f12] border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059] flex items-center justify-center text-stone-950 mb-4 shadow-[0_4px_20px_rgba(197,160,89,0.25)]">
              <Lock size={28} />
            </div>
            <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em] font-mono mb-1">
              HASTE VIBE ADMIN
            </span>
            <h2 className="font-serif text-2xl text-white font-normal tracking-tight">
              음악 전산관리인 인증
            </h2>
            <p className="text-[11px] text-stone-400 mt-2 max-w-xs leading-relaxed">
              BGM 시스템 관리자 영역입니다. 헤이스트 마스터 계정으로 로그인해주세요.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-amber-950/35 border border-amber-900/40 text-amber-400 rounded-xl flex items-center gap-2 text-[10px] font-bold">
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-stone-400 text-[10px] font-bold tracking-wider uppercase block">ADMIN ID</label>
              <input
                type="text"
                value={enteredUsername}
                onChange={(e) => setEnteredUsername(e.target.value)}
                placeholder="관리자 아이디"
                className="w-full bg-black/60 border border-[#C5A059]/20 hover:border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl px-4 py-2.5 text-white text-xs placeholder-stone-600 focus:outline-none transition-colors font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-400 text-[10px] font-bold tracking-wider uppercase block">PASSWORD</label>
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="관리자 패스워드"
                className="w-full bg-black/60 border border-[#C5A059]/20 hover:border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl px-4 py-2.5 text-white text-xs placeholder-stone-600 focus:outline-none transition-colors font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-[#C5A059] hover:bg-[#B8964C] text-stone-950 font-black py-3 rounded-xl text-xs shadow-lg shadow-[#C5A059]/15 transition-all active:scale-[0.98] cursor-pointer mt-2"
            >
              {isAuthLoading ? '인증 확인 중...' : '보안 권한 인증'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="music-theme-body min-h-[80vh] pb-12 text-white">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-amber-950/35 border border-amber-900/40 text-amber-400 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm font-sans">
            <div className="flex items-center gap-2">
              <span className="text-[#C5A059] font-bold">⚠️ Error:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/35 border border-emerald-900/40 text-emerald-400 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm font-sans">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓ Saved:</span>
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {/* Board Style Category Chips */}
        <div className="bg-stone-900/40 border border-[#C5A059]/15 p-2 rounded-xl flex items-center gap-2.5 overflow-x-auto scrollbar-none no-swipe w-fit mb-6">
          {[
            { id: 'BOARD', label: '소통 게시판' },
            { id: 'MUSIC_SONG', label: '음악 게시판' },
            { id: 'MUSIC_COVER', label: '플레이커버 게시판' },
            { id: 'PERMISSIONS', label: '게시판 등급 권한' },
            { id: 'HQ_STAMP', label: '헤이스트 서명/직인' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center shrink-0 border ${
                  isActive 
                    ? 'bg-[#C5A059] text-stone-950 border-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.35)] font-black' 
                    : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 border-[#C5A059]/10 hover:bg-stone-900/60 font-light'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="w-full">
          {activeTab === 'BOARD' && (
            <div className="bg-[#0f0f12] border border-[#C5A059]/10 rounded-3xl p-6 shadow-xl text-stone-300">
              <HasteBoard 
                loggedUser={{ role: 'ADMIN', username: 'admin', store_name: '헤이스트' }}
                onOpenLogin={() => {}}
                onOpenSignUp={() => {}}
                isNested={true}
              />
            </div>
          )}
          {activeTab === 'MUSIC_SONG' && (
            <div className="bg-[#0f0f12] border border-[#C5A059]/10 rounded-3xl p-6 shadow-xl text-stone-300">
              <AdminMusicSongTab 
                showTemporaryToast={showTemporaryToast}
                showTemporaryError={showTemporaryError}
                renderPagination={renderPagination}
              />
            </div>
          )}
          {activeTab === 'MUSIC_COVER' && (
            <div className="bg-[#0f0f12] border border-[#C5A059]/10 rounded-3xl p-6 shadow-xl text-stone-300">
              <AdminMusicCoverTab 
                showTemporaryToast={showTemporaryToast}
                showTemporaryError={showTemporaryError}
                renderPagination={renderPagination}
              />
            </div>
          )}
          {activeTab === 'PERMISSIONS' && (
            <div className="bg-[#0f0f12] border border-[#C5A059]/10 rounded-3xl p-6 shadow-xl text-stone-300">
              <AdminPermissionsTab 
                showTemporaryToast={showTemporaryToast}
                showTemporaryError={showTemporaryError}
              />
            </div>
          )}
          {activeTab === 'HQ_STAMP' && (
            <div className="bg-[#0f0f12] border border-[#C5A059]/10 rounded-3xl p-6 shadow-xl text-stone-300">
              <AdminHqStampTab 
                showTemporaryToast={showTemporaryToast}
                showTemporaryError={showTemporaryError}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
