import React, { useState, useEffect } from 'react';
import { Play, Pause, Flame, Compass, Coffee, Sun, CloudRain, Wind, Moon, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { HasteSymbol } from './home_comp_logo';
import { StandaloneSong } from './music_comp_player';

interface HomeContentProps {
  songs: StandaloneSong[];
  activeSong: StandaloneSong | null;
  onPlaySong: (song: StandaloneSong) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MusicPageHomeContent: React.FC<HomeContentProps> = ({ 
  songs, 
  activeSong, 
  onPlaySong,
  isPlaying,
  onTogglePlay
}) => {
  const [timeInfo, setTimeInfo] = useState({ label: '', description: '', icon: <Sun /> });
  const [weather] = useState(() => {
    const vibes = [
      { type: 'RAINY', label: '차분하게 비 내리는', icon: <CloudRain className="text-blue-400" /> },
      { type: 'SUNNY', label: '맑고 햇살 고운', icon: <Sun className="text-yellow-500" /> },
      { type: 'WINDY', label: '바람이 기분 좋은', icon: <Wind className="text-teal-400" /> }
    ];
    return vibes[Math.floor(Math.random() * vibes.length)];
  });

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 11) {
      setTimeInfo({
        label: '아침 오픈 타임',
        description: '상쾌한 보사노바와 어쿠스틱 선율로 공간을 기분 좋게 리프레시합니다.',
        icon: <Coffee className="text-amber-500 animate-bounce" />
      });
    } else if (hours >= 11 && hours < 14) {
      setTimeInfo({
        label: '점심 피크 타임',
        description: '활기차고 경쾌한 프렌치 인디 팝으로 가벼운 리듬감을 더해줍니다.',
        icon: <Flame className="text-red-500" />
      });
    } else if (hours >= 14 && hours < 17) {
      setTimeInfo({
        label: '나른한 오후 3시',
        description: '감미로운 Lo-Fi와 따뜻한 재즈 믹스로 차분한 오후의 휴식을 선사합니다.',
        icon: <Compass className="text-red-400 animate-spin" style={{ animationDuration: '10s' }} />
      });
    } else {
      setTimeInfo({
        label: '차분한 감성 마감',
        description: '아날로그 바이닐의 고풍스러운 잔향과 앰비언트 사운드로 감성을 자극합니다.',
        icon: <Moon className="text-indigo-400 animate-pulse" />
      });
    }
  }, []);

  const handleQuickPlay = (moodName: string) => {
    const matches = songs.filter(s => s.mood?.toLowerCase().includes(moodName.toLowerCase()));
    if (matches.length > 0) {
      onPlaySong(matches[Math.floor(Math.random() * matches.length)]);
    } else if (songs.length > 0) {
      onPlaySong(songs[0]);
    }
  };

  const topSongs = songs.slice(0, 5);
  const defaultMusicBg = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="flex flex-col pb-12">
      <section 
        className="w-full rounded-none p-6 md:p-10 relative overflow-hidden border-b border-red-950/20 shadow-[0_15px_45px_rgba(0,0,0,0.85)] flex flex-col min-h-[380px]"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(7,7,8,0.98) 0%, rgba(7,7,8,0.85) 100%), url('${defaultMusicBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full my-auto px-6">
          <div className="lg:col-span-5 flex justify-center items-center py-4 relative">
            <div className="p-4 bg-black/40 rounded-3xl border border-red-950/20 backdrop-blur-xs shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
              <motion.div 
                className="w-[192px] h-[192px] md:w-[270px] md:h-[270px] rounded-full bg-gradient-to-br from-neutral-900 via-stone-950 to-neutral-900 border-4 border-stone-800 shadow-[0_0_40px_rgba(0,0,0,0.95)] flex items-center justify-center relative overflow-hidden"
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={{ ease: "linear", duration: 10, repeat: Infinity }}
              >
                <div className="absolute inset-[6px] rounded-full border border-white/4 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[14px] rounded-full border border-stone-300/6 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[24px] rounded-full border border-white/5 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[36px] rounded-full border border-stone-400/6 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[48px] rounded-full border border-white/4 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[60px] rounded-full border border-stone-300/4 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[72px] rounded-full border border-white/6 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[84px] rounded-full border border-stone-400/4 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[96px] rounded-full border border-white/3 pointer-events-none blur-[0.5px]" />
                <div className="absolute inset-[108px] rounded-full border border-stone-300/3 pointer-events-none blur-[0.5px]" />
                
                <div className="absolute top-4 md:top-6 flex items-center gap-1 opacity-75 select-none pointer-events-none">
                  <HasteSymbol size={12} color="#C5A059" glow={false} />
                  <span className="font-sans font-[900] tracking-[0.08em] text-[8px] md:text-[9.5px] text-stone-400 uppercase">
                    HASTE MUSIC
                  </span>
                </div>
                
                <div className="w-[68px] h-[68px] md:w-[96px] md:h-[96px] rounded-full bg-red-650 flex items-center justify-center border-2 border-stone-900 shadow-inner z-10 overflow-hidden relative">
                  {activeSong?.coverUrl ? (
                    <img src={activeSong.coverUrl} alt={activeSong.title} className="w-full h-full object-cover opacity-85" />
                  ) : (
                    <div className="w-full h-full bg-[#1c1917] flex items-center justify-center">
                      <HasteSymbol size={32} color="#C5A059" glow={true} className="filter drop-shadow-[0_0_8px_rgba(197,160,89,0.6)]" />
                    </div>
                  )}
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-[#070708] border border-stone-900 z-20" />
                </div>
              </motion.div>
              
              <div 
                className="absolute right-[10px] top-[15px] w-[96px] h-[150px] md:w-[134px] md:h-[210px] origin-top-right transition-transform duration-750 ease-in-out pointer-events-none z-20"
                style={{
                  transform: isPlaying ? 'rotate(17deg)' : 'rotate(-15deg)',
                  backgroundImage: `radial-gradient(circle at 100% 0%, #78716c 8px, transparent 8px)`
                }}
              >
                <div className="w-1.5 h-full bg-stone-500 rounded-full ml-auto mr-1.5 border border-stone-600 shadow-sm" />
                <div className="w-3.5 h-5 bg-stone-700 rounded-sm ml-auto mr-0.5 shadow-md" style={{ transform: 'rotate(22deg)' }} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 text-left space-y-4 md:space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-red-500 font-mono text-[10px] font-black tracking-widest uppercase">
                {weather.icon}
                <span>{weather.label} {timeInfo.label} VIBE</span>
              </div>
              <h1 className="text-xl md:text-4xl font-sans font-light tracking-tight text-white leading-tight">
                지금 당신이 있는 공간을<br />
                <span className="font-serif italic text-red-550 font-normal">가장 편안한 카페</span> BGM으로 채워보세요.
              </h1>
              <p className="text-[11px] md:text-xs text-stone-400 font-light leading-relaxed max-w-xl">
                {timeInfo.description} 커피머신 로컬서버 가동 및 공간의 공기를 매끄럽게 물들이는 헤이스트 BGM과 함께 가치 있는 매장 분위기를 완성합니다.
              </p>
            </div>

            <div className="bg-stone-950/70 border border-red-950/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
              <div className="space-y-1 truncate max-w-[65%] text-left">
                <span className="text-[7.5px] font-mono font-bold text-red-500 tracking-wider block">CURRENTLY SELECTED</span>
                <h4 className="text-xs font-bold text-white truncate">{activeSong?.title || '재생할 곡을 선택해주세요'}</h4>
                <p className="text-[9.5px] text-stone-500 truncate">{activeSong?.artist || 'Cafe Haste BGM Collection'}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center bg-stone-900/60 rounded-xl border border-red-950/15 p-1.5 gap-2">
                  <div className="flex flex-col font-mono text-[6px] text-stone-400 leading-none tracking-widest uppercase text-left">
                    <span>TRACK NO</span>
                    <span className="text-red-500 font-bold mt-0.5">HST-BGM-00{activeSong?.id || 1}</span>
                  </div>
                  <div className="w-10 h-5 flex gap-[1.5px] items-center shrink-0 bg-stone-200 p-0.5 rounded opacity-80">
                    <div className="w-[1.5px] h-full bg-stone-900" />
                    <div className="w-[1px] h-full bg-stone-900" />
                    <div className="w-[2px] h-full bg-stone-900" />
                    <div className="w-[1px] h-full bg-stone-900" />
                    <div className="w-[1.5px] h-full bg-stone-900" />
                    <div className="w-[1px] h-full bg-stone-900" />
                  </div>
                </div>

                <button
                  onClick={onTogglePlay}
                  className="px-4.5 py-3 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-[0_5px_15px_rgba(239,68,68,0.35)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={12} className="fill-white" />
                      <span>믹스 일시정지</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-white" />
                      <span>믹스 오토 재생</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pt-2 pb-6 flex flex-col gap-8 md:gap-12 mt-2 md:mt-3">
        <section className="text-left space-y-4">
          <h3 className="haste-section-title-1 text-white !text-lg flex items-center gap-2">
            <Coffee size={18} className="text-red-500" />
            오늘 매장의 분위기는 어떤가요?
          </h3>
          <div className="bg-stone-950/45 border border-red-950/10 rounded-[28px] p-6 md:p-8 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center max-w-2xl mx-auto">
            <div className="md:col-span-5 flex justify-center">
              <div className="aspect-square w-full max-w-[170px] md:max-w-[190px] rounded-[22%] overflow-hidden relative shadow-[0_15px_35px_rgba(0,0,0,0.65)] border border-white/5 active:scale-98 transition-all duration-300">
                {activeSong?.coverUrl ? (
                  <img src={activeSong.coverUrl} alt={activeSong.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-stone-950 to-neutral-900 flex flex-col items-center justify-center gap-2">
                    <HasteSymbol size={36} color="#C5A059" glow={true} className="filter drop-shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
                    <span className="font-mono text-[7px] tracking-[0.2em] text-stone-500">HASTE VIBE</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-7 flex justify-center md:justify-start">
              <div className="grid grid-cols-2 gap-4 max-w-[200px] md:max-w-[220px] py-1.5">
                {[
                  { label: '비오는 날', mood: '비', icon: <CloudRain size={28} className="text-blue-300 drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" />, grad: 'from-slate-800 via-neutral-900 to-slate-950' },
                  { label: '차분한 오후', mood: '나른', icon: <Coffee size={28} className="text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]" />, grad: 'from-amber-900 via-neutral-950 to-amber-900' },
                  { label: '활기찬 정오', mood: '집중', icon: <Sun size={28} className="text-orange-400 drop-shadow-[0_2px_8px_rgba(249,115,22,0.3)]" />, grad: 'from-orange-800 via-neutral-950 to-red-950' },
                  { label: '감성 마감', mood: '로맨틱', icon: <Moon size={28} className="text-indigo-400 drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]" />, grad: 'from-indigo-950 via-neutral-950 to-purple-950' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPlay(item.mood)}
                    title={item.label}
                    className="aspect-square w-20 md:w-22 rounded-[22%] bg-gradient-to-br from-stone-900 to-neutral-950 border border-white/5 flex items-center justify-center relative shadow-[0_10px_20px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-90 active:brightness-90 hover:scale-105 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Music size={9} className="text-white fill-white/10" />
                    </div>
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="text-left space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="haste-section-title-1 text-white !text-lg flex items-center gap-2">
              <Flame size={18} className="text-red-500 animate-pulse" />
              실시간 매장 인기 BGM
            </h3>
            <span className="text-[9px] font-mono text-stone-500 tracking-wider">TOP 5 STREAMING</span>
          </div>

          <div className="bg-stone-950/80 border border-red-950/10 rounded-3xl p-3 md:p-6 shadow-xl flex flex-col gap-2">
            {topSongs.map((song, index) => {
              const isCurrent = activeSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isCurrent 
                      ? 'bg-red-650/10 border border-red-500/30 text-white' 
                      : 'bg-stone-900/20 hover:bg-stone-900/60 border border-transparent text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-4 truncate">
                    <span className={`font-mono font-bold text-xs w-5 text-center ${isCurrent ? 'text-red-500' : 'text-stone-400'}`}>
                      0{index + 1}
                    </span>
                    <div className="flex flex-col truncate">
                      <span className={`text-xs font-bold truncate ${isCurrent ? 'text-red-500' : 'text-stone-200'}`}>
                        {song.title}
                      </span>
                      <span className="text-[9.5px] text-stone-500 truncate mt-0.5">{song.artist || 'Cafe Haste BGM'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {song.mood && (
                      <span className="text-[8px] font-mono border border-stone-800 px-2 py-0.5 rounded text-stone-500">
                        {song.mood}
                      </span>
                    )}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
