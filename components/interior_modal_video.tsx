import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface InteriorModalVideoProps {
  videoUrl: string | null;
  onClose: () => void;
  videoTitle: string;
}

export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const InteriorModalVideo: React.FC<InteriorModalVideoProps> = ({
  videoUrl,
  onClose,
  videoTitle
}) => {
  if (!videoUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-stone-950 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onClose}
            className="p-2.5 bg-black/60 hover:bg-black/90 border border-stone-800 rounded-full text-stone-300 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player */}
        <div className="w-full aspect-video bg-black">
          {(() => {
            const youtubeId = getYoutubeId(videoUrl);
            if (youtubeId) {
              return (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&mute=0`}
                  title={videoTitle}
                  className="w-full h-full border-0 animate-fade-in"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              );
            } else {
              return (
                <video
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              );
            }
          })()}
        </div>

        {/* Info Footer */}
        <div className="p-5 bg-stone-950 border-t border-stone-900 text-left">
          <span className="text-[10px] font-mono text-[#C5A059] block uppercase tracking-wider mb-1">Concept Video Curations</span>
          <h4 className="text-white font-bold text-sm">{videoTitle}</h4>
        </div>
      </motion.div>
    </div>
  );
};
