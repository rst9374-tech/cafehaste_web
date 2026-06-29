import React from 'react';

interface HomeCompAudioProps {
  currentGlobalSound: any;
  globalIsPlaying: boolean;
}

export function HomeCompAudio({ currentGlobalSound, globalIsPlaying }: HomeCompAudioProps) {
  const getYoutubeIdForApp = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const ytId = currentGlobalSound ? getYoutubeIdForApp(currentGlobalSound.soundUrl || currentGlobalSound.sound_url || '') : null;

  React.useEffect(() => {
    if (globalIsPlaying && ytId) {
      const handleFirstClick = () => {
        const iframe = document.getElementById('haste-bg-iframe') as HTMLIFrameElement;
        if (iframe) {
          const expectedSrc = `https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}`;
          if (iframe.src !== expectedSrc) {
            iframe.src = expectedSrc;
          }
        }
        document.removeEventListener('click', handleFirstClick);
        document.removeEventListener('touchstart', handleFirstClick);
      };
      document.addEventListener('click', handleFirstClick);
      document.addEventListener('touchstart', handleFirstClick);
      return () => {
        document.removeEventListener('click', handleFirstClick);
        document.removeEventListener('touchstart', handleFirstClick);
      };
    }
  }, [globalIsPlaying, ytId]);

  return (
    <iframe
      id="haste-bg-iframe"
      src={currentGlobalSound && globalIsPlaying && ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}` : 'about:blank'}
      className="w-0 h-0 absolute pointer-events-none opacity-0 border-0"
      allow="autoplay; encrypted-media"
    />
  );
}
export default HomeCompAudio;
