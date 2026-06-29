import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface SelectedPopImage {
  src: string;
  alt: string;
  styleTitle: string;
  styleSubtitle: string;
  styleDesc: string;
  videoUrl?: string;
}

interface InteriorModalImageProps {
  selectedPopImage: SelectedPopImage | null;
  onClose: () => void;
}

export const InteriorModalImage: React.FC<InteriorModalImageProps> = ({
  selectedPopImage,
  onClose
}) => {
  const [inlinePlaying, setInlinePlaying] = React.useState(false);

  const stopGlobalBgm = () => {
    try {
      const channel = new BroadcastChannel('haste_bgm_sync');
      channel.postMessage({ action: 'PAUSE_BGM' });
      channel.close();
    } catch (e) {}
  };

  React.useEffect(() => {
    setInlinePlaying(false);
  }, [selectedPopImage]);

  React.useEffect(() => {
    if (inlinePlaying) {
      stopGlobalBgm();
    }
  }, [inlinePlaying]);

  return (
    <AnimatePresence>
      {selectedPopImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-3xl overflow-y-auto max-h-[92vh] md:max-h-[90vh] md:overflow-hidden shadow-2xl w-full max-w-4xl flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 bg-stone-900/70 hover:bg-stone-955 text-white p-2 md:p-2.5 rounded-full cursor-pointer z-20 transition-all shadow-md focus:outline-none"
              title="닫기"
            >
              <X size={15} />
            </button>

            {/* Left side high-res image container */}
            <div className="md:w-3/5 bg-stone-955 flex items-center justify-center relative min-h-[180px] sm:min-h-[240px] md:min-h-[480px]">
              {(() => {
                const videoUrl = (selectedPopImage.videoUrl || '').trim();
                const hasVideo = videoUrl.startsWith('http') || videoUrl.startsWith('/');

                if (inlinePlaying && hasVideo) {
                  const youtubeId = getYoutubeId(videoUrl);
                  return (
                    <div className="w-full h-full bg-black relative z-10 rounded-2xl md:rounded-r-none overflow-hidden min-h-[300px] flex items-center justify-center">
                      {youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                          title={`${selectedPopImage.styleTitle} - 상세 영상`}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto aspect-video border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover absolute inset-0"
                          controls
                          autoPlay
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInlinePlaying(false);
                        }}
                        className="absolute bottom-3 right-3 z-20 px-3 py-1 bg-stone-900/90 text-white rounded-lg text-[10px] font-bold border border-stone-850 hover:bg-stone-850 transition-all cursor-pointer"
                      >
                        다시 사진 보기
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    className={`w-full h-full flex items-center justify-center relative ${hasVideo ? 'cursor-pointer' : ''}`}
                    onClick={(e) => {
                      if (hasVideo) {
                        e.stopPropagation();
                        setInlinePlaying(true);
                      }
                    }}
                  >
                    <img
                      src={selectedPopImage.src}
                      alt={selectedPopImage.alt}
                      className="w-full h-full max-h-[220px] sm:max-h-[300px] md:max-h-[580px] object-contain"
                      referrerPolicy="no-referrer"
                    />
                    {hasVideo && (
                      <div className="absolute inset-0 bg-transparent flex items-center justify-center hover:bg-black/10 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-stone-900/90 text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                          <Play size={24} className="fill-[#C5A059] ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Right side descriptive details */}
            <div className="md:w-2/5 p-4 md:p-8 flex flex-col justify-between bg-stone-50 overflow-y-auto font-sans">
              <div className="space-y-3.5 md:space-y-5 text-left pt-1 md:pt-2">
                <div>
                  <span className="px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] rounded-md font-mono text-[8px] md:text-[9px] font-bold tracking-widest uppercase">
                    SPATIAL DETAIL PREVIEW
                  </span>
                  <h3 className="font-serif text-base md:text-xl font-bold text-stone-900 mt-2 leading-tight">
                    {selectedPopImage.styleTitle}
                  </h3>
                  <p className="text-stone-505 font-sans text-xs italic mt-0.5">
                    {selectedPopImage.styleSubtitle}
                  </p>
                </div>

                <div className="border-t border-stone-200 pt-3 md:pt-4 text-left">
                  <p className="text-[9px] md:text-[10px] font-mono tracking-wider text-stone-400 font-bold uppercase mb-1.5">
                    CONCEPT DESIGN DIRECTIVE
                  </p>
                  <p className="text-stone-700 text-xs font-light leading-relaxed whitespace-pre-line">
                    {selectedPopImage.styleDesc}
                  </p>
                </div>
              </div>

              <div className="pt-4 md:pt-6 border-t border-stone-200 mt-4 md:mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full md:w-auto text-center px-6 py-2 md:py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-xl cursor-pointer font-sans"
                >
                  확인 (CLOSE)
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
