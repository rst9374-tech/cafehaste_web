import React, { useState, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';
import { MusicNavbar } from './music_comp_navbar';
import { MusicFooter } from './music_comp_footer';
import { MusicPlayer, StandaloneSong } from './music_comp_player';
import { MusicPageHomeContent } from './music_comp_homecontent';
import './music.css';

// Lazy load other tab pages to keep build clean and modular under 500 lines constraint
const DiscoverTab = React.lazy(() => import('./music_page_discover').then(m => ({ default: m.MusicDiscoverPage })));
const ChartTab = React.lazy(() => import('./music_page_chart').then(m => ({ default: m.MusicChartPage })));
const CommunityTab = React.lazy(() => import('./music_page_community').then(m => ({ default: m.MusicCommunityPage })));
const MusicRoomTab = React.lazy(() => import('./music_page_room').then(m => ({ default: m.MusicRoomPage })));

export const MusicStandaloneApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'DISCOVER' | 'CHART' | 'MUSIC_ROOM' | 'COMMUNITY'>('MUSIC_ROOM');
  const [songs, setSongs] = useState<StandaloneSong[]>([]);
  const [activeSong, setActiveSong] = useState<StandaloneSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch song archive from DB
  const loadSongs = async () => {
    try {
      const res = await fetch('/api/music/songs');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.songs)) {
          setSongs(data.songs);
          if (data.songs.length > 0 && !activeSong) {
            // Random start song
            const rand = data.songs[Math.floor(Math.random() * data.songs.length)];
            setActiveSong(rand);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load standalone music archive:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const currentSoundUrl = activeSong?.soundUrl || '';
  const youtubeId = getYoutubeId(currentSoundUrl);

  // Handle direct audio files
  useEffect(() => {
    if (!youtubeId && currentSoundUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(currentSoundUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Playback blocked:', err);
          setIsPlaying(false);
        });
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeSong, youtubeId, currentSoundUrl]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    const iframe = document.getElementById('haste-music-iframe') as HTMLIFrameElement;
    if (iframe && youtubeId) {
      // Send volume target to youtube embed postMessage if needed, or fallback
    }
  }, [volume, youtubeId]);

  const handleTogglePlay = () => {
    if (youtubeId) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleNext = () => {
    if (songs.length <= 1 || !activeSong) return;
    const idx = songs.findIndex(s => s.id === activeSong.id);
    const nextIdx = idx === songs.length - 1 ? 0 : idx + 1;
    setActiveSong(songs[nextIdx]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (songs.length <= 1 || !activeSong) return;
    const idx = songs.findIndex(s => s.id === activeSong.id);
    const prevIdx = idx === 0 ? songs.length - 1 : idx - 1;
    setActiveSong(songs[prevIdx]);
    setIsPlaying(true);
  };

  const handlePlaySongDirect = (song: StandaloneSong) => {
    setActiveSong(song);
    setIsPlaying(true);
  };

  const handleBackToHome = () => {
    setActiveTab('MUSIC_ROOM');
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-stone-500 bg-[#070708] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-900 border-t-red-600 animate-spin" />
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-stone-600">HASTE AUDIO RECONSTRUCTION...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-stone-300 pb-0 font-sans antialiased music-theme-body">
      <MusicNavbar activeTab={activeTab} setActiveTab={setActiveTab} onBackToHome={handleBackToHome} />

      <main className="w-full">
        <React.Suspense fallback={
          <div className="w-full min-h-[400px] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-stone-900 border-t-red-500 animate-spin" />
          </div>
        }>
          {activeTab === 'HOME' && (
            <MusicPageHomeContent 
              songs={songs} 
              activeSong={activeSong} 
              onPlaySong={handlePlaySongDirect} 
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />
          )}
          {activeTab === 'DISCOVER' && (
            <div className="w-full">
              <DiscoverTab songs={songs} activeSong={activeSong} onPlaySong={handlePlaySongDirect} />
            </div>
          )}
          {activeTab === 'CHART' && (
            <div className="w-full">
              <ChartTab songs={songs} activeSong={activeSong} onPlaySong={handlePlaySongDirect} />
            </div>
          )}
          {activeTab === 'MUSIC_ROOM' && (
            <div className="w-full">
              <MusicRoomTab 
                songs={songs}
                activeSong={activeSong}
                onPlaySong={handlePlaySongDirect}
              />
            </div>
          )}
          {activeTab === 'COMMUNITY' && (
            <div className="w-full">
              <CommunityTab />
            </div>
          )}
        </React.Suspense>
      </main>

      <MusicFooter />

      {/* Hidden Youtube Audio Player */}
      <iframe
        id="haste-music-iframe"
        src={activeSong && isPlaying && youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}` : 'about:blank'}
        className="w-0 h-0 absolute pointer-events-none opacity-0 border-0"
        allow="autoplay; encrypted-media"
      />

      <MusicPlayer
        currentSong={activeSong}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        volume={volume}
        onVolumeChange={setVolume}
      />
    </div>
  );
};


