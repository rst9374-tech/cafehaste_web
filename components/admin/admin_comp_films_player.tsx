import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film } from 'lucide-react';

export interface FilmItem {
  id: number;
  title: string;
  desc: string;
  videoUrl: string;
  visible: boolean;
  category?: 'BRAND' | 'THEATER';
}

// Extract Youtube ID for embedding
export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface AdminFilmsPlayerProps {
  activePlayFilm: FilmItem | null;
  setActivePlayFilm: (film: FilmItem | null) => void;
}

export const AdminFilmsPlayer: React.FC<AdminFilmsPlayerProps> = ({
  activePlayFilm,
  setActivePlayFilm
}) => {
  return (
    <AnimatePresence>
      {activePlayFilm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            className="relative w-full max-w-4xl bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Top Banner Actions */}
            <div className="absolute top-4 right-4 z-55 flex items-center gap-2">
              <button
                onClick={() => setActivePlayFilm(null)}
                className="p-2.5 bg-black/70 hover:bg-black/90 border border-stone-800 rounded-full text-stone-300 hover:text-white transition-all shadow-md hover:scale-105 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dynamic Video Render Logic */}
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              {(() => {
                const youtubeId = getYoutubeId(activePlayFilm.videoUrl);
                if (youtubeId) {
                  return (
                    <iframe
                      id={`yt-player-${activePlayFilm.id}`}
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                      title={activePlayFilm.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                } else {
                  return (
                    <video
                      id={`native-player-${activePlayFilm.id}`}
                      src={activePlayFilm.videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                  );
                }
              })()}
            </div>

            {/* Movie info metadata drawer */}
            <div className="p-6 bg-stone-950 border-t border-stone-900 space-y-2">
              <div className="flex items-center gap-2">
                <Film size={14} className="text-[#C5A059]" />
                <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase font-black">HASTE CINEMATIC SCREEN</span>
              </div>
              <h3 className="text-stone-100 font-extrabold text-base tracking-tight">{activePlayFilm.title}</h3>
              <p className="text-stone-400 text-xs leading-relaxed max-w-3xl">{activePlayFilm.desc}</p>
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-[10px] font-mono text-stone-600 truncate max-w-md select-all">
                  Source: {activePlayFilm.videoUrl}
                </div>
                <button
                  onClick={() => setActivePlayFilm(null)}
                  className="text-stone-400 hover:text-stone-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>닫기</span>
                  <X size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
