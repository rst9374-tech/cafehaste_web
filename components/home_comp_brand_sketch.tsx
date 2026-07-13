import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { getEmbedUrl } from './home_page_main';
import brandLogoSketch from '../src/assets/images/brand_logo_sketch.jpg';
import brandIdentityRange from '../src/assets/images/brand_identity_range.jpg';

interface HomeBrandSketchProps {
  appFilms: any[];
  navigateTo: (route: any) => void;
}

export const HomeBrandSketch: React.FC<HomeBrandSketchProps> = ({
  appFilms = [],
  navigateTo
}) => {
  const [playLeft, setPlayLeft] = useState(false);
  const [playRight, setPlayRight] = useState(false);
  const leftIframeRef = useRef<HTMLIFrameElement>(null);
  const rightIframeRef = useRef<HTMLIFrameElement>(null);
  const leftTimeoutRef = useRef<any>(null);
  const rightTimeoutRef = useRef<any>(null);
  const leftPlayerRef = useRef<any>(null);
  const rightPlayerRef = useRef<any>(null);

  useEffect(() => {
    if (!window.hasOwnProperty('YT')) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const attachLeftPlayer = () => {
    if ((window as any).YT && (window as any).YT.Player && leftIframeRef.current) {
      leftPlayerRef.current = new (window as any).YT.Player(leftIframeRef.current, {
        events: {
          'onReady': (event: any) => {
            event.target.setVolume(30);
          },
          'onStateChange': (event: any) => {
            if (event.data === 0) { // 0: ENDED
              clearTimeout(leftTimeoutRef.current);
              leftTimeoutRef.current = setTimeout(() => {
                setPlayLeft(false);
              }, 3000);
            }
          }
        }
      });
    } else {
      setTimeout(attachLeftPlayer, 200);
    }
  };

  const attachRightPlayer = () => {
    if ((window as any).YT && (window as any).YT.Player && rightIframeRef.current) {
      rightPlayerRef.current = new (window as any).YT.Player(rightIframeRef.current, {
        events: {
          'onReady': (event: any) => {
            event.target.setVolume(30);
          },
          'onStateChange': (event: any) => {
            if (event.data === 0) { // 0: ENDED
              clearTimeout(rightTimeoutRef.current);
              rightTimeoutRef.current = setTimeout(() => {
                setPlayRight(false);
              }, 3000);
            }
          }
        }
      });
    } else {
      setTimeout(attachRightPlayer, 200);
    }
  };

  useEffect(() => {
    if (playLeft) {
      attachLeftPlayer();
    } else {
      if (leftPlayerRef.current && leftPlayerRef.current.destroy) {
        leftPlayerRef.current.destroy();
        leftPlayerRef.current = null;
      }
      clearTimeout(leftTimeoutRef.current);
    }
  }, [playLeft]);

  useEffect(() => {
    if (playRight) {
      attachRightPlayer();
    } else {
      if (rightPlayerRef.current && rightPlayerRef.current.destroy) {
        rightPlayerRef.current.destroy();
        rightPlayerRef.current = null;
      }
      clearTimeout(rightTimeoutRef.current);
    }
  }, [playRight]);

  const defaultBrandFilm = {
    id: -1,
    title: "헤이스트 브랜드 인트로",
    desc: "느린 도심 속 기분 좋은 가속을 지향하는 헤이스트의 공간과 에스프레소 예술의 깊이를 담은 브랜드 시네마 필름입니다.",
    videoUrl: "https://www.youtube.com/watch?v=Gl9rF028at4",
    video_url: "https://www.youtube.com/watch?v=Gl9rF028at4"
  };

  const leftBrandFilm = appFilms.find(
    (f) => (f.visible || f.visible === 1 || String(f.visible) === 'true') && 
           f.category && f.category.split(',').includes('BRAND1')
  ) || appFilms.find(
    (f) => (f.visible || f.visible === 1 || String(f.visible) === 'true') && 
           f.category && f.category.split(',').includes('BRAND')
  ) || defaultBrandFilm;

  const rightBrandFilm = appFilms.find(
    (f) => (f.visible || f.visible === 1 || String(f.visible) === 'true') && 
           f.category && f.category.split(',').includes('BRAND2')
  ) || appFilms.filter(
    (f) => (f.visible || f.visible === 1 || String(f.visible) === 'true') && 
           f.category && f.category.split(',').includes('BRAND')
  )[1] || defaultBrandFilm;

  const brandFilms = [leftBrandFilm, rightBrandFilm];

  return (
    <section className="container mx-auto px-4 md:px-6 mb-10 md:mb-16 max-w-6xl">
      {/* Header Title Matching UI Guidelines */}
      <div className="text-center mb-8 md:mb-12 max-w-3xl mx-auto">
        <span className="haste-category-label-en">
          THE CONCEPT IN DETAIL
        </span>
        <h2 className="haste-title-main">
          지친 일상에 거는 <span className="font-sans italic text-[#ffbd59] underline decoration-[#ffbd59] decoration-2 underline-offset-4 font-normal">가벼운 주문</span>
        </h2>
        <h3 className="haste-section-title-2 mt-3 !font-light">
          느린 도심 속, 기분 좋은 휴식의 백그라운드
        </h3>
        <p className="haste-body-text-1 mt-4 max-w-2xl mx-auto">
          헤이스트는 복잡한 도심 속에서 가볍게 만나는 온전한 휴식을 지향합니다.
          바쁜 일상 속에서도, 향긋한 커피 한 모금으로 복잡한 생각과 기분을 맑게 정돈해 보세요. 독자적인 솔루션을 바탕으로 점주님께 실질적인 도움이 되는 투명한 파트너십을 약속합니다.
        </p>
        <div className="flex justify-center mt-6">
          <button
            id="explore-brand-btn"
            onClick={() => navigateTo('BRAND')}
            className="px-6 py-3 bg-[#ffbd59] hover:bg-[#B8964C] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            브랜드스토리 보기 →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-white border border-stone-200 p-5 md:p-8 rounded-[32px] shadow-xs">
        {/* Left: Sketch Visual & Description */}
        <div className="flex flex-col">
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-stone-200/80 shadow-md relative group bg-black">
            {playLeft ? (
              <div className="relative w-full h-full">
                {brandFilms[0].videoUrl && (brandFilms[0].videoUrl.includes('youtube.com') || brandFilms[0].videoUrl.includes('youtu.be')) ? (
                  <iframe
                    ref={leftIframeRef}
                    src={getEmbedUrl(brandFilms[0].videoUrl)}
                    title={brandFilms[0].title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={brandFilms[0].videoUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                    controls
                    onLoadedMetadata={(e) => { e.currentTarget.volume = 0.3; }}
                    onEnded={() => {
                      clearTimeout(leftTimeoutRef.current);
                      leftTimeoutRef.current = setTimeout(() => {
                        setPlayLeft(false);
                      }, 3000);
                    }}
                  />
                )}
                <button
                  onClick={() => {
                    clearTimeout(leftTimeoutRef.current);
                    setPlayLeft(false);
                  }}
                  className="absolute top-3 right-3 bg-stone-900/80 hover:bg-stone-955 text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-md border border-stone-800 transition-all cursor-pointer z-20"
                >
                  스케치 보기 (X)
                </button>
              </div>
            ) : (
              <>
                <img
                  src={brandLogoSketch}
                  alt="Haste Concept Sketch"
                  className="w-full h-full object-contain bg-white transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-16 text-white text-left pr-4">
                  <p className="text-[9px] font-mono font-bold tracking-widest text-[#ffbd59] uppercase">SKETCH ARCHIVE</p>
                  <h4 className="text-xs md:text-sm font-sans font-bold mt-1">헤이스트 아이코닉 심볼 로고 드로잉 디자인 스케치</h4>
                </div>
                {/* Youtube Red Play Button */}
                {brandFilms[0]?.videoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPlayLeft(true);
                    }}
                    className="absolute bottom-4 right-4 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-2 px-3.5 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                    title="브랜드 영상 1 재생"
                  >
                    <Play size={10} className="fill-white text-white ml-[0.5px] shrink-0" />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="haste-body-text-2 mt-4 px-1 text-left">
            시그니처 골드(#ffbd59) 테마와 정교한 그리드를 바탕으로, 헤이스트만의 기품 있는 분위기를 담아낸 디자인 콘셉트 스케치입니다.
          </p>
        </div>
        {/* Right: Brand Identity Goods & Description */}
        <div className="flex flex-col">
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-stone-200/80 shadow-md relative group bg-black">
            {playRight ? (
              <div className="relative w-full h-full">
                {brandFilms[1]?.videoUrl && (brandFilms[1].videoUrl.includes('youtube.com') || brandFilms[1].videoUrl.includes('youtu.be')) ? (
                  <iframe
                    ref={rightIframeRef}
                    src={getEmbedUrl(brandFilms[1].videoUrl)}
                    title={brandFilms[1].title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={brandFilms[1]?.videoUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                    controls
                    onLoadedMetadata={(e) => { e.currentTarget.volume = 0.3; }}
                    onEnded={() => {
                      clearTimeout(rightTimeoutRef.current);
                      rightTimeoutRef.current = setTimeout(() => {
                        setPlayRight(false);
                      }, 3000);
                    }}
                  />
                )}
                <button
                  onClick={() => {
                    clearTimeout(rightTimeoutRef.current);
                    setPlayRight(false);
                  }}
                  className="absolute top-3 right-3 bg-stone-900/80 hover:bg-stone-955 text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-md border border-stone-800 transition-all cursor-pointer z-20"
                >
                  제품 라인업 보기 (X)
                </button>
              </div>
            ) : (
              <>
                <img
                  src={brandIdentityRange}
                  alt="Haste Brand Identity & Products"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-16 text-white text-left pr-4">
                  <p className="text-[9px] font-mono font-bold tracking-widest text-[#ffbd59] uppercase">IDENTITY RANGE</p>
                  <h4 className="text-xs md:text-sm font-sans font-bold mt-1">헤이스트 시그니처 패키징 및 브랜드 아이덴티티 라인업</h4>
                </div>
                {/* Youtube Red Play Button */}
                {brandFilms[1]?.videoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPlayRight(true);
                    }}
                    className="absolute bottom-4 right-4 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-2 px-3.5 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                    title="브랜드 영상 2 재생"
                  >
                    <Play size={10} className="fill-white text-white ml-[0.5px] shrink-0" />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="haste-body-text-2 mt-4 px-1 text-left">
            시그니처 골드와 내추럴 크래프트 톤으로 제작된 컵, 원두 패키지, 에코백 등 헤이스트의 다양한 브랜드 패키지 디자인입니다.
          </p>
        </div>
      </div>
    </section>
  );
};
