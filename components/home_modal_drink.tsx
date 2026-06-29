import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Play } from 'lucide-react';
import { getDrinkSvg, FALLBACK_DRINK_SVG } from './menu_comp_drinksvg';
import { getDrinkExtractionTime } from './menu_page_main';

const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface HasteHomeDrinkModalProps {
  localDetailItem: any | null;
  setLocalDetailItem: (item: any | null) => void;
}

export const HasteHomeDrinkModal: React.FC<HasteHomeDrinkModalProps> = ({
  localDetailItem,
  setLocalDetailItem,
}) => {
  const [inlinePlaying, setInlinePlaying] = useState(false);

  useEffect(() => {
    if (localDetailItem) {
      setInlinePlaying(!!localDetailItem.autoPlayVideo);
    }
  }, [localDetailItem]);

  return (
    <AnimatePresence>
      {localDetailItem && (() => {
        const videoUrl = (localDetailItem.videoUrl || '').trim();
        const hasVideo = videoUrl.startsWith('http') || videoUrl.startsWith('/');

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
          >
            <motion.div
              id="menu-customize-dialog"
              key="customizer-modal-home"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible relative"
            >
              {/* Close Button top-right */}
              <button
                id="close-customize-modal-home"
                onClick={() => setLocalDetailItem(null)}
                className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950 p-2 rounded-full cursor-pointer z-10 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Left Column product photography / video stream */}
              <div className="md:w-1/2 bg-stone-100 relative h-64 md:h-auto min-h-[390px] flex flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full h-full max-h-[390px] flex items-center justify-center p-2 relative">
                  {(localDetailItem.isSignature === 1 || localDetailItem.isSignature === true || localDetailItem.is_signature === 1 || localDetailItem.is_signature === true) && (
                    <span className="absolute top-2 left-2 z-10 bg-[#C5A059]/10 backdrop-blur-xs text-[#C5A059] border border-[#C5A059]/30 px-3 py-1 rounded-full text-[10px] font-sans font-extrabold tracking-widest uppercase flex items-center gap-1 shadow-md select-none">
                      <Sparkles size={10} className="fill-[#C5A059]" />
                      SIGNATURE
                    </span>
                  )}
                  {(() => {
                    if (inlinePlaying && hasVideo) {
                      const youtubeId = getYoutubeId(videoUrl);
                      return (
                        <div className="w-full h-full bg-black relative z-10 rounded-2xl overflow-hidden shadow-md min-h-[300px]">
                          {youtubeId ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&mute=0`}
                              title={`${localDetailItem.nameKr} - 상세 영상`}
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
                        className={`w-full h-full flex items-center justify-center relative ${hasVideo ? 'cursor-pointer group/menu-slide' : ''}`}
                        onClick={() => {
                          if (hasVideo) {
                            setInlinePlaying(true);
                          }
                        }}
                      >
                        <img 
                          src={getDrinkSvg(localDetailItem)} 
                          alt={localDetailItem.nameKr} 
                          className="w-full h-full max-h-[365px] object-contain scale-[1.26] drop-shadow-md"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_DRINK_SVG;
                          }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

            {/* Right Column Profile and Spec briefing */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between max-h-[70vh] md:max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col gap-6 pt-4 text-left">
                
                {/* Headline */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest">{localDetailItem.category} LAB PROFILE</span>
                  <h2 className="font-serif text-2xl text-stone-900 font-bold mt-1 leading-tight">{localDetailItem.nameKr}</h2>
                  <p className="text-xs text-stone-500 font-light mt-0.5">{localDetailItem.name}</p>
                  <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light mt-4 py-3.5 px-4 bg-stone-50 border border-stone-200/50 rounded-xl">
                    {localDetailItem.description}
                  </p>
                </div>

                {/* Machine note */}
                <div className="p-4 bg-[#C5A059]/5 border border-[#C5A059]/15 rounded-xl">
                  <span className="text-[10px] font-sans font-extrabold text-[#C5A059] block mb-1">※ 평균 음료 추출시간 : {getDrinkExtractionTime(localDetailItem.category)}초</span>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                    본 시그니처 엠블럼 제품은 프리미엄 무인 에스프레소 머신을 통해 주문 즉시 단 {getDrinkExtractionTime(localDetailItem.category)}초 이내에 추출되어 향과 크레마 손상 없이 고속 제공됩니다.
                  </p>
                </div>

              </div>

              {/* Close row */}
              <div className="pt-6 border-t border-stone-150 mt-8 flex justify-end items-center gap-4">
                {hasVideo && !inlinePlaying && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setInlinePlaying(true);
                    }}
                    className="px-6 py-3 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-600 hover:text-emerald-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all active:scale-95 rounded-xl border border-emerald-200"
                  >
                    <Play size={12} className="fill-emerald-600" />
                    <span>영상보기</span>
                  </button>
                )}
                <button
                  id="submit-customize-cart-btn-home"
                  onClick={() => setLocalDetailItem(null)}
                  className="px-6 py-3 bg-[#C5A059] hover:bg-[#B8964C] text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors rounded-xl font-sans"
                >
                  확인 (CLOSE)
                </button>
              </div>

            </div>

            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};
