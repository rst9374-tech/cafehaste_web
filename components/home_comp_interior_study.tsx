import React from 'react';
import { Plus, Play } from 'lucide-react';
import { NoImagePlaceholder } from './interior_comp_swatches';

interface HomeInteriorStudyProps {
  interiorTypes: any[];
  setSelectedInteriorId: (id: string | null) => void;
  setSelectedPopImage: React.Dispatch<React.SetStateAction<any>>;
  navigateTo: (route: any) => void;
}

export const HomeInteriorStudy: React.FC<HomeInteriorStudyProps> = ({
  interiorTypes,
  setSelectedInteriorId,
  setSelectedPopImage,
  navigateTo
}) => {
  const renderedStyles = interiorTypes
    .filter(style => style.visible !== false)
    .map((style) => {
      const galleryList = Array.isArray(style.gallery) ? style.gallery.filter(Boolean) : [];
      const mockImg = style.mockImage || style.mock_image || '';
      const blueprintImg = style.blueprintImage || style.blueprint_image || '';
      const images = galleryList.length >= 3 
        ? galleryList.slice(0, 3) 
        : galleryList.length > 0 
          ? [
              galleryList[0],
              galleryList[1] || mockImg,
              galleryList[2] || galleryList[0] || mockImg
            ]
          : [
              mockImg,
              blueprintImg,
              mockImg
            ];

      while (images.length < 3) {
        images.push('');
      }

      let parsedTags: string[] = [];
      if (style.tags) {
        if (Array.isArray(style.tags)) {
          parsedTags = style.tags;
        } else if (typeof style.tags === 'string') {
          try {
            parsedTags = JSON.parse(style.tags);
          } catch (e) {
            parsedTags = style.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
          }
        }
      }

      const handleCardClick = () => {
        setSelectedInteriorId(style.id);
        if (images[0]) {
          setSelectedPopImage({
            src: images[0],
            alt: `${style.title} - 가상 공간 메인 콘셉트`,
            styleTitle: style.title,
            styleSubtitle: style.subtitle,
            styleDesc: style.desc,
            videoUrl: (style.videoLinks && style.videoLinks[0]) || ''
          });
        }
      };

      const handleImageClick = (idx: number, e: React.MouseEvent) => {
        if (!images[idx]) return;
        e.stopPropagation();
        setSelectedInteriorId(style.id);
        setSelectedPopImage({
          src: images[idx],
          alt: idx === 0 
            ? `${style.title} - 메인 디자인 콘셉트` 
            : `${style.title} - 세부 연출 뷰 ${idx === 1 ? 'A' : 'B'}`,
          styleTitle: style.title,
          styleSubtitle: style.subtitle,
          styleDesc: style.desc,
          videoUrl: (style.videoLinks && style.videoLinks[idx]) || ''
        });
      };

      const handleVideoPlayClick = (idx: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedInteriorId(style.id);
        setSelectedPopImage({
          src: images[idx],
          alt: idx === 0 
            ? `${style.title} - 메인 디자인 콘셉트` 
            : `${style.title} - 세부 연출 뷰 ${idx === 1 ? 'A' : 'B'}`,
          styleTitle: style.title,
          styleSubtitle: style.subtitle,
          styleDesc: style.desc,
          videoUrl: (style.videoLinks && style.videoLinks[idx]) || style.videoUrl || style.video_url || '',
          autoPlayVideo: true
        });
      };

      return (
        <div 
          key={style.id}
          onClick={handleCardClick}
          className="bg-white rounded-3xl border border-stone-200/70 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg hover:border-[#C5A059]/40 transition-all cursor-pointer text-left"
        >
          <div>
            <div className="grid grid-cols-3 gap-1.5 h-64 md:h-72 rounded-2xl overflow-hidden relative mb-5 bg-stone-50">
              <div 
                className="col-span-2 h-full overflow-hidden relative group/img cursor-zoom-in border-r border-stone-100"
                onClick={(e) => handleImageClick(0, e)}
              >
                {images[0] ? (
                  <>
                    <img 
                      src={images[0]} 
                      alt={`${style.title} - Main`}
                      className="w-full h-full object-cover group-hover/img:scale-[1.03] transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    {/* Youtube Red Play Button */}
                    {((style.videoLinks && style.videoLinks[0]) || style.videoUrl || style.video_url) && (
                      <button
                        type="button"
                        onClick={(e) => handleVideoPlayClick(0, e)}
                        className="absolute bottom-2.5 right-2.5 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-1.5 px-2.5 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                        title="공간 비디오 재생"
                      >
                        <Play size={9} className="fill-white text-white ml-[0.5px] shrink-0" />
                      </button>
                    )}
                  </>
                ) : (
                  <NoImagePlaceholder />
                )}
              </div>

              <div className="col-span-1 flex flex-col gap-1.5 h-full">
                <div 
                  className="flex-1 h-0 overflow-hidden relative group/img cursor-zoom-in"
                  onClick={(e) => handleImageClick(1, e)}
                >
                  {images[1] ? (
                    <>
                      <img 
                        src={images[1]} 
                        alt={`${style.title} - Sub 1`}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-505"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      {/* Youtube Red Play Button */}
                      {((style.videoLinks && style.videoLinks[1]) || style.videoUrl || style.video_url) && (
                        <button
                          type="button"
                          onClick={(e) => handleVideoPlayClick(1, e)}
                          className="absolute bottom-2 right-2 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-1 px-2 rounded-md flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                          title="세부 비디오 재생"
                        >
                          <Play size={8} className="fill-white text-white ml-[0.5px] shrink-0" />
                        </button>
                      )}
                    </>
                  ) : (
                    <NoImagePlaceholder />
                  )}
                </div>
                <div 
                  className="flex-1 h-0 overflow-hidden relative group/img cursor-zoom-in"
                  onClick={(e) => handleImageClick(2, e)}
                >
                  {images[2] ? (
                    <>
                      <img 
                        src={images[2]} 
                        alt={`${style.title} - Sub 2`}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-505"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      {/* Youtube Red Play Button */}
                      {((style.videoLinks && style.videoLinks[2]) || style.videoUrl || style.video_url) && (
                        <button
                          type="button"
                          onClick={(e) => handleVideoPlayClick(2, e)}
                          className="absolute bottom-2 right-2 z-10 bg-[#FF0000] hover:bg-[#E60000] text-white p-1 px-2 rounded-md flex items-center justify-center shadow-lg transition-all active:scale-90 border border-red-500 cursor-pointer"
                          title="세부 비디오 재생"
                        >
                          <Play size={8} className="fill-white text-white ml-[0.5px] shrink-0" />
                        </button>
                      )}
                    </>
                  ) : (
                    <NoImagePlaceholder />
                  )}
                </div>
              </div>
            </div>

            <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">
              Type Active
            </div>
          </div>

          <span className="haste-category-label-en mb-1">
            {style.id === 'TYPE1' ? 'CONCEPT STUDY A' : 'CONCEPT STUDY B'}
          </span>
          <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight mb-2">
            {style.title}
          </h3>
          <p className="text-stone-400 font-sans text-xs italic mb-3.5 leading-snug">
            {style.subtitle}
          </p>
          <p className="haste-body-text-2 mb-6">
            {style.desc}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {parsedTags.map((tg: string, idx: number) => (
              <span key={idx} className="text-[10px] tracking-wide font-medium text-stone-600 bg-stone-100/80 px-2.5 py-1 rounded-lg">
                #{tg}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <span className="text-[11px] font-mono text-stone-400 font-bold">DESIGN READY</span>
            {images[0] && (
              <button
                onClick={(e) => handleImageClick(0, e)}
                className="text-xs text-[#C5A059] font-bold hover:underline transition-all cursor-pointer font-sans"
              >
                상세 콘셉트 팝업 시안 크게 보기 →
              </button>
            )}
          </div>
        </div>
      );
    });

  return (
    <section id="home-interior-styles" className="container mx-auto px-4 md:px-6 mb-16 md:mb-32 max-w-7xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-4 border-b border-stone-200 pb-4 md:pb-6 mb-8 md:mb-16">
        <div>
          <span className="haste-category-label-en mb-1">DESIGN PHILOSOPHY</span>
          <h2 className="haste-section-title-1 uppercase tracking-wide">HASTE INTERIOR STUDY</h2>
        </div>
        <button
          onClick={() => navigateTo('INTERIOR')}
          className="group flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-[#C5A059] transition-colors uppercase cursor-pointer mb-1 md:mb-0"
        >
          실시간 공간 분석 및 자동 견적 시스템 실행
          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderedStyles}
      </div>
    </section>
  );
};
