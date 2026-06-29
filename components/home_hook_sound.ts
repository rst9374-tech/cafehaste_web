import React, { useState, useEffect, useRef } from 'react';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function useHomeSound() {
  const [globalSounds, setGlobalSounds] = useState<any[]>([]);
  const [globalSoundIdx, setGlobalSoundIdx] = useState(() => {
    const cachedIdx = localStorage.getItem('haste_bgm_idx');
    return cachedIdx ? parseInt(cachedIdx, 10) : 0;
  });
  const [globalIsPlaying, setGlobalIsPlaying] = useState(() => {
    const cached = localStorage.getItem('haste_bgm_playing');
    return cached === null ? false : cached === 'true';
  });
  const globalAudioRef = useRef<HTMLAudioElement | null>(null);

  const fetchGlobalSounds = async () => {
    try {
      const res = await fetch('/api/sounds');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const visibleSounds = (data.sounds || []).filter((s: any) => s.visible);
          setGlobalSounds(visibleSounds);
        }
      }
    } catch (e) {
      console.error('Failed to fetch sounds:', e);
    }
  };

  // BroadcastChannel for cross-tab BGM mutex play control
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const channel = new BroadcastChannel('haste_bgm_sync');
    
    const getTabId = () => {
      let id = sessionStorage.getItem('haste_tab_uniq_id');
      if (!id) {
        id = Math.random().toString(36).substring(2, 11);
        sessionStorage.setItem('haste_tab_uniq_id', id);
      }
      return id;
    };

    const handleMessage = (e: MessageEvent) => {
      const data = e.data || {};
      if (data.action === 'PAUSE_BGM') {
        if (globalAudioRef.current) {
          globalAudioRef.current.pause();
        }
        setGlobalIsPlaying(false);
        localStorage.setItem('haste_bgm_playing', 'false');
      } else if (data.action === 'PLAY_BGM' && data.tabId !== getTabId()) {
        if (globalAudioRef.current) {
          globalAudioRef.current.pause();
        }
        setGlobalIsPlaying(false);
      }
    };
    
    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  // Send play message to other tabs when active
  useEffect(() => {
    if (globalIsPlaying && typeof window !== 'undefined' && globalSounds.length > 0) {
      const getTabId = () => {
        let id = sessionStorage.getItem('haste_tab_uniq_id');
        if (!id) {
          id = Math.random().toString(36).substring(2, 11);
          sessionStorage.setItem('haste_tab_uniq_id', id);
        }
        return id;
      };
      
      const channel = new BroadcastChannel('haste_bgm_sync');
      channel.postMessage({ action: 'PLAY_BGM', tabId: getTabId() });
      channel.close();
    }
  }, [globalIsPlaying, globalSoundIdx, globalSounds.length]);

  useEffect(() => {
    fetchGlobalSounds();
    const handleUpdate = () => fetchGlobalSounds();
    window.addEventListener('haste_sounds_updated', handleUpdate);
    return () => {
      window.removeEventListener('haste_sounds_updated', handleUpdate);
      if (globalAudioRef.current) {
        globalAudioRef.current.pause();
      }
    };
  }, []);

  const currentGlobalSound = globalSounds[globalSoundIdx] || null;

  // Auto-play on mount / sounds load if user had it ON previously
  useEffect(() => {
    if (globalSounds.length > 0 && globalIsPlaying) {
      const targetSound = globalSounds[globalSoundIdx] || globalSounds[0];
      if (targetSound) {
        const soundUrl = targetSound.soundUrl || targetSound.sound_url || '';
        const ytId = getYoutubeId(soundUrl);
        
        if (ytId) {
          // YouTube link: pause HTML5 Audio player if running
          if (globalAudioRef.current) {
            globalAudioRef.current.pause();
          }
          return;
        }

        if (!globalAudioRef.current) {
          globalAudioRef.current = new Audio(soundUrl);
          globalAudioRef.current.loop = true;
          
          const playBgm = () => {
            if (!globalAudioRef.current) return;
            globalAudioRef.current.play().catch(err => {
              console.warn('Autoplay blocked. Registering interaction handler to restore BGM:', err.message);
              const resumeOnInteraction = () => {
                if (globalAudioRef.current && localStorage.getItem('haste_bgm_playing') === 'true') {
                  const sUrl = globalAudioRef.current.src;
                  if (!getYoutubeId(sUrl)) {
                    globalAudioRef.current.play().then(() => {
                      setGlobalIsPlaying(true);
                      document.removeEventListener('click', resumeOnInteraction);
                    }).catch(() => {});
                  }
                }
              };
              document.addEventListener('click', resumeOnInteraction);
            });
          };
          playBgm();
        }
      }
    }
  }, [globalSounds, globalIsPlaying, globalSoundIdx]);

  const toggleGlobalPlay = () => {
    if (!currentGlobalSound) return;
    const soundUrl = currentGlobalSound.soundUrl || currentGlobalSound.sound_url || '';
    const ytId = getYoutubeId(soundUrl);

    if (globalIsPlaying) {
      if (globalAudioRef.current) globalAudioRef.current.pause();
      setGlobalIsPlaying(false);
      localStorage.setItem('haste_bgm_playing', 'false');
    } else {
      if (ytId) {
        // YouTube: Stop HTML5 Audio and toggle state BGM active for App iframe rendering
        if (globalAudioRef.current) globalAudioRef.current.pause();
        setGlobalIsPlaying(true);
        localStorage.setItem('haste_bgm_playing', 'true');
        localStorage.setItem('haste_bgm_idx', String(globalSoundIdx));
      } else {
        if (!globalAudioRef.current || globalAudioRef.current.src !== soundUrl) {
          globalAudioRef.current = new Audio(soundUrl);
          globalAudioRef.current.loop = true;
        }
        globalAudioRef.current.play().then(() => {
          setGlobalIsPlaying(true);
          localStorage.setItem('haste_bgm_playing', 'true');
          localStorage.setItem('haste_bgm_idx', String(globalSoundIdx));
        }).catch(err => {
          console.error('Global audio playback failed:', err);
        });
      }
    }
  };

  const playNextGlobalSound = () => {
    if (globalSounds.length <= 1) return;
    const nextIdx = (globalSoundIdx + 1) % globalSounds.length;
    setGlobalSoundIdx(nextIdx);
    setGlobalIsPlaying(false);
    localStorage.setItem('haste_bgm_idx', String(nextIdx));
    if (globalAudioRef.current) {
      globalAudioRef.current.pause();
    }
    
    const nextSound = globalSounds[nextIdx];
    const soundUrl = nextSound.soundUrl || nextSound.sound_url || '';
    const ytId = getYoutubeId(soundUrl);

    if (ytId) {
      // YouTube: Just set state, App.tsx handles background playback
      setGlobalIsPlaying(true);
      localStorage.setItem('haste_bgm_playing', 'true');
    } else {
      globalAudioRef.current = new Audio(soundUrl);
      globalAudioRef.current.loop = true;
      globalAudioRef.current.play().then(() => {
        setGlobalIsPlaying(true);
        localStorage.setItem('haste_bgm_playing', 'true');
      }).catch(err => {
        console.error('Global audio playback failed:', err);
      });
    }
  };

  return {
    globalSounds,
    currentGlobalSound,
    globalIsPlaying,
    toggleGlobalPlay,
    playNextGlobalSound
  };
}
