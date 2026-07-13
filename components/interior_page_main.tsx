import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, ChevronLeft, ChevronRight, X, Play
} from 'lucide-react';

// Subcomponents
import { InteriorCompCalculator } from './interior_comp_calculator';
import { InteriorModalImage } from './interior_modal_image';
import { InteriorModalVideo, getYoutubeId } from './interior_modal_video';
import { 
  NoImagePlaceholder, 
  InteriorCompSwatches 
} from './interior_comp_swatches';
import { InteriorThumbnailSlider } from './interior_comp_thumbslider';
import { StyleItem } from './interior_types';
import { useHasteInteriorState } from './interior_hook_state';

function safeParseVideoLinks(videoLinks: any): string[] {
  if (Array.isArray(videoLinks)) return videoLinks.filter((v): v is string => typeof v === 'string');
  if (typeof videoLinks === 'string' && videoLinks.trim()) {
    try {
      const parsed = JSON.parse(videoLinks);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
    } catch {}
  }
  return [];
}

interface HasteInteriorProps {
  interiorTypes: StyleItem[];
  onNavigateToSignup: () => void;
  onNavigateToInquiry: () => void;
  selectedInteriorId: string | null;
  setSelectedInteriorId: (id: string | null) => void;
  appFilms?: any[];
  isMobile?: boolean;
  useMobileCompact?: boolean;
}

export const HasteInterior: React.FC<HasteInteriorProps> = ({ 
  interiorTypes, 
  onNavigateToSignup, 
  onNavigateToInquiry,
  selectedInteriorId,
  setSelectedInteriorId,
  appFilms = [],
  isMobile = false,
  useMobileCompact = false,
}) => {
  const isComp = isMobile || useMobileCompact;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const {
    activeCategory, setActiveCategory, isAdmin, prices, handleUpdatePrice,
    selectedPopImage, setSelectedPopImage, activeGalleryIdx, setActiveGalleryIdx,
    estimatedSize, setEstimatedSize, machineCondition, setMachineCondition,
    CATEGORIES, filteredStyles, activeStyle, mainImagesList, costEstimate
  } = useHasteInteriorState({
    interiorTypes,
    selectedInteriorId,
    setSelectedInteriorId
  });

  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = React.useState<string>('');
  const [inlinePlaying, setInlinePlaying] = React.useState(false);

  React.useEffect(() => {
    setInlinePlaying(false);
  }, [activeGalleryIdx, selectedInteriorId]);

  const stopGlobalBgm = () => {
    try {
      const channel = new BroadcastChannel('haste_bgm_sync');
      channel.postMessage({ action: 'PAUSE_BGM' });
      channel.close();
    } catch (e) {}
  };

  React.useEffect(() => {
    if (inlinePlaying || activeVideoUrl) {
      stopGlobalBgm();
    }
  }, [inlinePlaying, activeVideoUrl]);

  if (!activeStyle) {
    return (
      <div className="py-24 text-center text-stone-500 font-sans">
        <Compass className="mx-auto mb-4 animate-spin text-[#C5A059]" size={32} />
        <p>인테리어 디자인 테마 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div id="haste-interior-styling-view" className="pt-2 pb-4 md:pb-12 bg-[var(--haste-body-bg)] text-stone-800 scroll-smooth">
      <div className="container mx-auto max-w-7xl px-3.5 md:px-6">
        
        <section className="text-center mb-3 md:mb-6">
          <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-2">
            Haste Space Curations
          </span>
          <h1 className="font-sans font-normal leading-tight text-stone-900 tracking-tight text-[17px] md:text-5xl mb-2 md:mb-4 leading-snug md:leading-tight">
            <span className="font-sans italic text-[#C5A059] underline decoration-[#C5A059] decoration-2 underline-offset-4 font-normal">나만의 특별한</span> 무인 점포를 완성하다
          </h1>
          <p className="max-w-xl mx-auto mt-1.5 haste-body-text-1 mb-1.5 md:mb-0">
            점주님의 상권과 개인 취향에 알맞은 무인 카페 공간을 제안합니다. 실시간 가구 견적과 공간 구성을 분석하여 나만의 매장을 완성해 보세요.
          </p>
        </section>

        {/* Category filter tabs */}
        <div id="interior-category-banner" className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4 md:mb-8">
          <div className="flex flex-wrap bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1 select-none w-fit">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedInteriorId(null);
                }}
                className={activeCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm font-extrabold px-4 py-2 text-xs rounded-lg cursor-pointer transition-all'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40 px-4 py-2 text-xs rounded-lg cursor-pointer transition-all'
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="text-right hidden lg:block max-w-md">
            <p className="text-[11px] font-medium text-stone-800 tracking-wide font-sans leading-relaxed">
              {CATEGORIES.find(c => c.id === activeCategory)?.desc}
            </p>
          </div>
        </div>

        {/* Main Two-Column Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LEFT LISTS */}
          <div className="lg:col-span-4 flex flex-col gap-4 relative w-full">
            <h3 className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1.5 px-1 text-left">
              Matched Compositions ({filteredStyles.length})
            </h3>
            
            {/* Mobile slide navigation arrows */}
            {isComp && filteredStyles.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  className="absolute left-1 top-[45%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-900/80 border border-[#C5A059]/40 text-[#C5A059] hover:text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
                  title="이전 타입 보기"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  className="absolute right-1 top-[45%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-900/80 border border-[#C5A059]/40 text-[#C5A059] hover:text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
                  title="다음 타입 보기"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
            
            <div 
              ref={scrollRef}
              className={`flex ${
                isComp 
                  ? 'flex-row overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3.5 px-10 pb-4' 
                  : 'flex-col gap-6'
              }`}
              style={isComp ? { scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } : undefined}
            >
              {filteredStyles.map((style) => {
                const isActive = style.id === activeStyle.id;
                const styleGalleryList = Array.isArray(style.gallery) ? style.gallery.filter(Boolean) : [];
                
                const previewImages = styleGalleryList.length > 0 
                  ? styleGalleryList 
                  : [
                      style.mockImage || '',
                      style.mockImage || '',
                      style.mockImage || ''
                    ];

                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedInteriorId(style.id)}
                    className={`bg-white border cursor-pointer hover:shadow-md transition-all duration-300 relative group text-left flex flex-col justify-between ${
                      isActive ? 'border-[#C5A059] ring-2 ring-[#C5A059]/10 shadow-md' : 'border-stone-200/80 shadow-sm' 
                    } ${
                      isComp 
                        ? 'rounded-2xl p-3 w-[72vw] shrink-0 snap-center' 
                        : 'rounded-[32px] p-5'
                    }`}
                  >
                    <div>
                      <InteriorThumbnailSlider
                        styleId={style.id}
                        previewImages={previewImages}
                        hasVideo0={!!(safeParseVideoLinks(style.videoLinks)?.[0] || '').trim()}
                        hasVideo1={!!(safeParseVideoLinks(style.videoLinks)?.[1] || '').trim()}
                        hasVideo2={!!(safeParseVideoLinks(style.videoLinks)?.[2] || '').trim()}
                        isComp={isComp}
                        onSelectImage={(idx) => {
                          setSelectedInteriorId(style.id);
                          setActiveGalleryIdx(idx);
                        }}
                      />

                      {isActive && (
                        <div className="absolute top-3 left-3 bg-[#C5A059] px-2.5 py-0.5 rounded-full text-[8px] font-mono font-black uppercase text-stone-950 tracking-wider">
                          ACTIVE CONCEPT
                        </div>
                      )}
                    </div>

                    <div className="px-1 text-left">
                      <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1.5">
                        CONCEPT ARCHITECTURE
                      </span>
                      <h4 className="font-sans font-bold text-stone-900 leading-tight mb-2 text-xs md:text-base">
                        {style.title}
                      </h4>
                      <p className="text-stone-650 font-sans font-light italic mb-2 leading-snug text-[10px] md:text-xs">
                        {style.subtitle}
                      </p>
                      <p className="text-stone-650 font-sans leading-relaxed font-light text-[10px] md:text-xs line-clamp-1 md:line-clamp-2">
                        {style.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-200/80 px-1 font-mono pt-2.5 mt-2.5 text-[10px] md:pt-3.5 md:mt-4 md:text-[11px]">
                      <span className="text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">TYPE ID: {style.id}</span>
                      <span className={`font-black transition-colors uppercase flex items-center gap-1 ${isActive ? 'text-[#C5A059]' : 'text-stone-750 group-hover:text-stone-950'}`}>
                        <span>{isActive ? '상세 정보 보는 중' : '클릭해서 선택'}</span>
                        <ChevronRight size={12} className={isActive ? 'rotate-90' : ''} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {isComp && (
              <div className="text-center text-[10px] text-[#C5A059] font-medium tracking-tight animate-pulse block md:hidden select-none">
                ◀ 좌우 슬라이드로 인테리어 타입을 감상하세요 ▶
              </div>
            )}
          </div>

          {/* RIGHT VIEW DETAIL */}
          <div className="lg:col-span-8 scroll-mt-28">
            <div className="bg-white border border-stone-200/90 shadow-md text-left relative overflow-hidden rounded-[24px] md:rounded-[40px] p-4 md:p-10">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-stone-100/50 blur-3xl pointer-events-none" />
              
              <div className="border-b border-stone-150 pb-4 relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 md:mb-7">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-stone-900 text-[#C5A059] rounded-full font-mono text-[9px] font-bold tracking-widest uppercase">
                      DETAILS
                    </span>
                    <span className="text-[10px] font-mono tracking-[0.3em] text-[#C5A059] font-bold">
                      CONCEPT ID: {activeStyle.id}
                    </span>
                  </div>
                  <h2 className="font-sans text-xl font-bold text-stone-900 mb-2 leading-tight">
                    {activeStyle.title}
                  </h2>
                  <p className="text-stone-655 font-sans font-light text-xs italic">
                    {activeStyle.subtitle}
                  </p>
                </div>
              </div>

              {/* Photo Slider */}
              <div className="relative z-10 bg-stone-50 overflow-hidden border border-stone-200 h-44 md:h-96 rounded-2xl md:rounded-3xl mb-4 md:mb-8">
                <div className="w-full h-full relative">
                  {mainImagesList[activeGalleryIdx] && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const vLinks = safeParseVideoLinks(activeStyle.videoLinks);
                        const videoUrl = (vLinks?.[activeGalleryIdx] || '').trim();
                        setSelectedPopImage({
                          src: mainImagesList[activeGalleryIdx],
                          alt: `${activeStyle.title} Detail`,
                          styleTitle: activeStyle.title,
                          styleSubtitle: activeStyle.subtitle,
                          styleDesc: activeStyle.desc,
                          videoUrl: videoUrl
                        });
                      }}
                      className="absolute top-4 right-4 z-30 bg-stone-900/80 hover:bg-stone-900 text-[#C5A059] border border-stone-850 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all shadow-md select-none cursor-pointer"
                    >
                      상세 팝업 (Zoom)
                    </button>
                  )}
                  {mainImagesList[activeGalleryIdx] ? (
                    (() => {
                      const vLinks = safeParseVideoLinks(activeStyle.videoLinks);
                      const videoUrl = (vLinks?.[activeGalleryIdx] || '').trim();
                      const hasVideo = videoUrl.startsWith('http') || videoUrl.startsWith('/');

                      if (inlinePlaying && hasVideo) {
                        const youtubeId = getYoutubeId(videoUrl);
                        return (
                          <div className="w-full h-full bg-black relative z-10 animate-fade-in">
                            {youtubeId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                title={`${activeStyle.title} - 연출 영상`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={videoUrl}
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                              />
                            )}
                          </div>
                        );
                      }

                      return (
                        <div 
                          className="w-full h-full relative cursor-pointer group/slide"
                          onClick={() => {
                            if (hasVideo) {
                              setInlinePlaying(true);
                            } else {
                              setSelectedPopImage({
                                src: mainImagesList[activeGalleryIdx],
                                alt: `${activeStyle.title} Detail`,
                                styleTitle: activeStyle.title,
                                styleSubtitle: activeStyle.subtitle,
                                styleDesc: activeStyle.desc,
                                videoUrl: ''
                              });
                            }
                          }}
                        >
                          <img 
                            src={mainImagesList[activeGalleryIdx]} 
                            alt={`${activeStyle.title} Detail`} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {hasVideo && (
                            <div className="absolute inset-0 bg-transparent flex items-center justify-center group-hover/slide:bg-black/15 transition-colors">
                              <div className="w-16 h-16 rounded-full bg-stone-900/90 text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                <Play size={24} className="fill-[#C5A059] ml-1" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-5 pt-12 text-white pointer-events-none">
                            <p className="text-[10px] font-mono font-bold tracking-widest text-[#C5A059] mb-1">
                              ATMOSPHERIC PREVIEW
                            </p>
                            <p className="text-xs font-sans font-light">
                              매장 실물 분위기의 고해상도 연출 컷 (이미지 {activeGalleryIdx + 1}/{mainImagesList.length})
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <NoImagePlaceholder className="rounded-none h-full w-full" />
                  )}
                </div>
                
                {mainImagesList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveGalleryIdx((prev) => (prev > 0 ? prev - 1 : mainImagesList.length - 1));
                      }}
                      className="haste-slider-arrow haste-slider-arrow-left"
                      title="이전 이미지 (이동)"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveGalleryIdx((prev) => (prev < mainImagesList.length - 1 ? prev + 1 : 0));
                      }}
                      className="haste-slider-arrow haste-slider-arrow-right"
                      title="다음 이미지 (이동)"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}
              </div>

              <div className="mb-4 relative z-10 pl-0.5">
                <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-2">
                  CONCEPT DIRECTIVES
                </span>
                <p className={`text-stone-655 font-sans font-light leading-relaxed text-justify ${isComp ? 'text-[11px]' : 'text-xs md:text-[13px]'}`}>
                  {activeStyle.desc}
                </p>
              </div>

              {/* Swatch rendering */}
              <InteriorCompSwatches activeStyleId={activeStyle.id} />

              {/* Real-Time Spatial Estimate Simulator */}
              <InteriorCompCalculator
                estimatedSize={estimatedSize}
                setEstimatedSize={setEstimatedSize}
                machineCondition={machineCondition}
                setMachineCondition={setMachineCondition}
                costEstimate={costEstimate}
                onNavigateToInquiry={onNavigateToInquiry}
                isAdmin={isAdmin}
                prices={prices}
                onUpdatePrice={handleUpdatePrice}
              />

            </div>
          </div>

        </div>

      </div>

      <InteriorModalImage
        selectedPopImage={selectedPopImage}
        onClose={() => setSelectedPopImage(null)}
      />

      {/* Dynamic Video Player Modal Overlay */}
      <AnimatePresence>
        {activeVideoUrl && (
          <InteriorModalVideo
            videoUrl={activeVideoUrl}
            onClose={() => setActiveVideoUrl(null)}
            videoTitle={activeVideoTitle}
          />
        )}
      </AnimatePresence>

    </div>
  );
};