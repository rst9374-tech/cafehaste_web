import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Volume2, VolumeX, RefreshCcw } from 'lucide-react';
import { HasteSymbol } from './home_comp_logo';

interface HasteIntroProps {
  onComplete: () => void;
}

// Cafe inspired emotional phases
type ActiveScene = 'INTRO_TEXT_1' | 'INTRO_TEXT_2' | 'BRAND_REVEAL';

export const HasteIntro: React.FC<HasteIntroProps> = ({ onComplete }) => {
  const [scene, setScene] = useState<ActiveScene>('INTRO_TEXT_1');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
  // Audio synthesis reference using Web Audio API for a beautiful, relaxing cafe jazz piano progression
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    } catch (e) {
      console.warn("Audio Context not supported in this browser", e);
    }
  };

  // Synthesize a beautiful, warm, organic lo-fi jazz piano chord
  const playJazzChord = (frequencies: number[], duration = 2.5) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // Create a shared master gain for the chord to avoid clipping
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 0.15); // gentle attack
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    masterGain.connect(ctx.destination);

    // Create a subtle low-pass filter to make the piano sound warm and mellow (lo-fi vibe)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);
    filter.Q.setValueAtTime(1.0, now);
    filter.connect(masterGain);

    // Play individual tone frequencies forming a Seventh Chord
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      // Use triangles for smooth retro keyboard texture
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      // Subtle micro pitch detuning for warmer, analog vibe
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
      
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.2);
      
      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start(now);
      osc.stop(now + duration);
    });
  };

  // Automated jazz loops generator
  const startAmbientJazz = () => {
    initAudio();
    setIsPlayingMusic(true);
    
    // Warm Jazz seventh chords progression (Cmaj7 -> Am7 -> Dm7 -> G7)
    const progressions = [
      [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj7 base + mid layer
      [110.00, 220.00, 261.63, 329.63, 392.00], // Am7 base
      [146.83, 293.66, 349.23, 440.00, 523.25], // Dm7 base
      [98.00, 196.00, 246.94, 293.66, 349.23]   // G7 base
    ];
    
    let index = 0;
    
    // Play initial chord
    playJazzChord(progressions[index], 3.8);
    index = (index + 1) % progressions.length;
    
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    synthIntervalRef.current = setInterval(() => {
      playJazzChord(progressions[index], 3.8);
      index = (index + 1) % progressions.length;
    }, 4000);
  };

  const stopAmbientJazz = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopAmbientJazz();
      setIsPlayingMusic(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      startAmbientJazz();
    }
  };

  // Autoplay or scene transitions over time
  useEffect(() => {
    const timer1 = setTimeout(() => setScene('INTRO_TEXT_2'), 3500);
    const timer2 = setTimeout(() => setScene('BRAND_REVEAL'), 7000);
    
    // Automatically trigger ambient jazz synthesizer for deep immersion, if possible on load
    const audioTrigger = setTimeout(() => {
      try {
        initAudio();
        startAmbientJazz();
      } catch (e) {
        console.log("Audio autoplay restricted, waiting for user click");
      }
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(audioTrigger);
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, []);

  const handleSkip = () => {
    stopAmbientJazz();
    onComplete();
  };

  return (
    <div id="haste-intro-root" className="fixed inset-0 z-[100] bg-stone-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Atmosphere Accent Lights */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-[#C5A059]/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-[#FFF]/3 blur-[140px]" />
      </div>

      {/* Top Header Controls: Elegant HUD */}
      <header className="relative z-10 w-full p-6 md:px-8 flex justify-between items-center bg-gradient-to-b from-stone-950/80 to-transparent">
        <div className="flex items-center gap-3">
          <HasteSymbol size={28} color="#C5A059" glow={false} />
          <span className="font-mono text-stone-300 text-xs tracking-[0.25em] uppercase font-bold">HASTE ESPRESSO INTRO</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Ambient Music Indicator */}
          {isPlayingMusic && (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-[1.5px] h-2 bg-[#C5A059] rounded-full animate-pulse" />
              <span className="w-[1.5px] h-3 bg-[#C5A059] rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
              <span className="w-[1.5px] h-1.5 bg-[#C5A059] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          )}

          <button
            onClick={toggleMute}
            className="p-2 px-3.5 rounded-full border border-white/5 bg-white/5 text-stone-400 hover:text-white font-mono text-[9px] tracking-widest uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isMuted ? <VolumeX size={10} /> : <Volume2 size={10} />}
            {isMuted ? "Synth Off" : "Ambient Synth"}
          </button>

          <button
            onClick={handleSkip}
            className="p-2 px-4 rounded-full bg-white/10 hover:bg-white text-stone-200 hover:text-stone-950 font-mono text-[9px] font-bold tracking-widest uppercase transition-all flex items-center gap-1 cursor-pointer"
          >
            Skip Intro
            <ArrowRight size={10} />
          </button>
        </div>
      </header>

      {/* Core Cinematic Screen Stage */}
      <main className="relative z-10 flex-grow w-full max-w-5xl mx-auto px-6 md:px-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {scene === 'INTRO_TEXT_1' && (
            <motion.div 
              key="intro-txt-1"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="max-w-2xl text-center flex flex-col items-center"
            >
              <span className="text-[10px] uppercase font-mono tracking-[0.5em] text-[#C5A059] mb-4">First Ritual</span>
              <h1 className="font-serif text-2xl md:text-4xl font-normal leading-relaxed text-stone-100 tracking-tight">
                당신이 깊은 숨을 고르는 찰나의 공간.
              </h1>
              <div className="w-12 h-px bg-stone-500/35 mt-6 mb-3" />
              <p className="text-stone-400 font-serif italic text-xs md:text-sm tracking-wide">
                Finding room to breathe inside a packed, demanding second.
              </p>
            </motion.div>
          )}

          {scene === 'INTRO_TEXT_2' && (
            <motion.div 
              key="intro-txt-2"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="max-w-2xl text-center flex flex-col items-center"
            >
              <span className="text-[10px] uppercase font-mono tracking-[0.5em] text-[#C5A059] mb-4">The Need</span>
              <h1 className="font-serif text-2xl md:text-4xl font-normal leading-relaxed text-stone-100 tracking-tight">
                가장 분주한 순간, 일상의 호흡을 정돈하기 위해.
              </h1>
              <div className="w-12 h-px bg-stone-500/35 mt-6 mb-3" />
              <p className="text-stone-400 font-serif italic text-xs md:text-sm tracking-wide">
                In the rush of things, standard stops aren't enough. We need real rest.
              </p>
            </motion.div>
          )}

          {scene === 'BRAND_REVEAL' && (
            <motion.div 
              key="brand-reveal-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="w-full max-w-md bg-stone-950/70 p-10 rounded-3xl border border-stone-800/40 backdrop-blur-2xl flex flex-col items-center shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative"
            >
              {/* Subtle visual radial golden glow behind brand symbol */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_75%)] pointer-events-none rounded-3xl" />
              
              {/* Rotating minimalist outer orbit */}
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6 relative"
              >
                <div className="w-24 h-24 rounded-full border border-dashed border-[#C5A059]/40 absolute inset-0 animate-spin" style={{ animationDuration: '40s' }} />
                <div className="w-24 h-24 rounded-full border border-stone-850 flex items-center justify-center bg-stone-900/40 shadow-inner">
                  <HasteSymbol size={64} color="#C5A059" glow={false} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1.2 }}
                className="text-center"
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#C5A059] mb-1.5 block">
                  A Quick Break, A Perfect Rest
                </span>
                <h1 className="font-serif text-2xl font-medium tracking-wide mb-3 text-stone-100 uppercase">
                  HASTE
                </h1>
                
                <p className="text-stone-400 font-serif text-xs leading-relaxed mb-8 max-w-xs mx-auto">
                  성공을 향한 가속, 헤이스트.<br/>
                  기술이 매장을 관리하고 점주에겐 자유를 선사하는 감성 스마트 플랫폼 가동 준비 완료.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                  <motion.button
                    id="intro-enter-website-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSkip}
                    className="px-8 py-3.5 rounded-full bg-[#C5A059] hover:bg-[#B8964C] text-stone-950 text-xs font-bold tracking-widest uppercase shadow-xl shadow-stone-950/50 flex items-center justify-center gap-2 cursor-pointer w-full"
                  >
                    브랜드 플랫폼 입장
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Cinematic Elegant Footer Overlay showing slow milestones */}
      <footer className="relative z-10 w-full p-6 md:px-8 border-t border-white/5 bg-gradient-to-t from-stone-950/90 to-transparent flex flex-col sm:flex-row justify-between items-center text-[9px] text-stone-500 font-mono tracking-[0.2em] gap-3">
        <span>© 2026 HASTE PLATFORMS. ALL RIGHTS RESERVED.</span>
        <div className="flex items-center gap-4">
          <span className={scene === 'INTRO_TEXT_1' ? 'text-[#C5A059] font-bold' : 'opacity-40'}>01. RITUAL</span>
          <span className="opacity-15">|</span>
          <span className={scene === 'INTRO_TEXT_2' ? 'text-[#C5A059] font-bold' : 'opacity-40'}>02. EMBRACE</span>
          <span className="opacity-15">|</span>
          <span className={scene === 'BRAND_REVEAL' ? 'text-[#C5A059] font-bold' : 'opacity-40'}>03. REVEAL</span>
        </div>
      </footer>

    </div>
  );
};
