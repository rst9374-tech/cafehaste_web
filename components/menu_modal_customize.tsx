import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, Play, Edit, Trash2, Check } from 'lucide-react';
import { MenuItem, getDrinkExtractionTime } from './menu_page_main';
import { getDrinkSvg, handleImageError } from './menu_page_main';
import { AdminConfirmModal } from './admin/admin_comp_shared';
import { useImageUpload } from './use_image_upload';
import { MenuCustomizeEdit } from './menu_comp_customize_edit';

const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface MenuCustomizeModalProps {
  detailItem: MenuItem | null;
  temp: 'ICE' | 'HOT';
  handleCloseDetail: () => void;
  onUpdateImage?: (newImageUrl: string) => void;
  onDeleteItem?: (deletedId: string) => void;
  onUpdateItem?: (updatedItem: MenuItem) => void;
}

export const MenuCustomizeModal: React.FC<MenuCustomizeModalProps> = ({
  detailItem,
  temp,
  handleCloseDetail,
  onUpdateImage,
  onDeleteItem,
  onUpdateItem
}) => {
  const { processAndUpload } = useImageUpload();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSignature, setIsSignature] = useState(false);
  const [inlinePlaying, setInlinePlaying] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editNameKr, setEditNameKr] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');

  const startEditing = () => {
    if (!detailItem) return;
    setEditNameKr(detailItem.nameKr);
    setEditName(detailItem.name);
    setEditDesc(detailItem.description);
    setEditImage(detailItem.image);
    setEditVideoUrl(detailItem.videoUrl || '');
    setIsEditing(true);
  };

  useEffect(() => {
    if (detailItem) {
      const isSig = detailItem.isSignature === 1 || detailItem.isSignature === true || (detailItem as any).is_signature === 1 || (detailItem as any).is_signature === true;
      setIsSignature(isSig);
      setInlinePlaying(!!(detailItem as any).autoPlayVideo);
      setIsEditing(false);
    }
  }, [detailItem]);

  const handleSignatureToggle = async (checked: boolean) => {
    if (!detailItem) return;
    try {
      setIsUploading(true);
      const isSigVal = checked ? 1 : 0;
      
      const res = await fetch(`/api/menu-items/${detailItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: detailItem.id,
          name: detailItem.name,
          nameKr: detailItem.nameKr,
          category: detailItem.category,
          image: detailItem.image,
          description: detailItem.description,
          acidity: detailItem.acidity,
          sweetness: detailItem.sweetness,
          body: detailItem.body,
          bitterness: detailItem.bitterness,
          visible: 1,
          isSignature: isSigVal,
          videoUrl: detailItem.videoUrl || '',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSignature(checked);
        if (onUpdateItem) {
          onUpdateItem({
            ...detailItem,
            isSignature: checked
          });
        }
      } else {
        alert('시그니처 설정 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('[Menu Signature Toggle Error]', err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailItem) return;
    try {
      setIsUploading(true);
      const res = await fetch(`/api/menu-items/${detailItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: detailItem.id,
          name: editName,
          nameKr: editNameKr,
          category: detailItem.category,
          image: editImage,
          description: editDesc,
          acidity: detailItem.acidity,
          sweetness: detailItem.sweetness,
          body: detailItem.body,
          bitterness: detailItem.bitterness,
          visible: 1,
          isSignature: isSignature ? 1 : 0,
          videoUrl: editVideoUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        if (onUpdateItem) {
          onUpdateItem({
            ...detailItem,
            name: editName,
            nameKr: editNameKr,
            image: editImage,
            description: editDesc,
            videoUrl: editVideoUrl,
          });
        }
      } else {
        alert('메뉴 수정 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('[Menu Edit Save Error]', err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !detailItem) return;

    try {
      setIsUploading(true);
      const url = await processAndUpload(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.85,
        boardName: 'menu',
        categoryId: detailItem.category
      });
      if (url) {
        setEditImage(url);
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!detailItem) return;
    try {
      const res = await fetch(`/api/menu-items/${detailItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && onDeleteItem) {
        onDeleteItem(detailItem.id);
      } else {
        alert('메뉴 삭제에 실패했습니다: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error('[Menu Delete Error]', err);
      alert('오류가 발생했습니다: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('haste_admin_auth') === 'true';
      let roleIsAdmin = false;
      try {
        const loggedUserStr = localStorage.getItem('haste_logged_user');
        if (loggedUserStr) {
          const user = JSON.parse(loggedUserStr);
          roleIsAdmin = user && user.role === 'ADMIN';
        }
      } catch (e) {}
      setIsAdmin(adminAuth || roleIsAdmin);
    }
  }, [detailItem]);



  return (
    <AnimatePresence>
      {detailItem && (() => {
        const videoUrl = (detailItem.videoUrl || '').trim();
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
              key="customizer-modal"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible relative"
            >
              {/* Close Button top-right */}
              <button
                id="close-customize-modal"
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-655 hover:text-stone-955 p-2 rounded-full cursor-pointer z-10 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Left Column product photography */}
              <div className="md:w-1/2 bg-stone-100 relative h-64 md:h-auto min-h-[390px] flex flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full h-full max-h-[390px] flex items-center justify-center p-2 relative">
                  {isSignature && (
                    <span className="absolute top-2 left-2 z-10 bg-[#C5A059]/10 backdrop-blur-xs text-[#C5A059] border border-[#C5A059]/30 px-3 py-1 rounded-full text-[10px] font-sans font-extrabold tracking-widest uppercase flex items-center gap-1 shadow-sm select-none">
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
                              title={`${detailItem.nameKr} - 상세 영상`}
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
                          src={getDrinkSvg(detailItem, temp)} 
                          alt={detailItem.nameKr} 
                          className="w-full h-full max-h-[365px] object-contain scale-[1.26] drop-shadow-md"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, detailItem.id)}
                        />
                      </div>
                    );
                  })()}
                
                {isAdmin && !isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="absolute bottom-3 right-3 bg-stone-900/90 hover:bg-stone-900 text-[#C5A059] p-2.5 px-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-lg border border-stone-800 flex items-center justify-center gap-1.5 text-xs font-bold select-none z-10"
                  >
                    <Edit size={13} className="text-[#C5A059]" />
                    <span>메뉴 수정</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column Customize forms */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between max-h-[70vh] md:max-h-[90vh] overflow-y-auto">
              {isEditing ? (
                <MenuCustomizeEdit
                  detailItem={detailItem}
                  editNameKr={editNameKr}
                  setEditNameKr={setEditNameKr}
                  editName={editName}
                  setEditName={setEditName}
                  editDesc={editDesc}
                  setEditDesc={setEditDesc}
                  editImage={editImage}
                  setEditImage={setEditImage}
                  editVideoUrl={editVideoUrl}
                  setEditVideoUrl={setEditVideoUrl}
                  handleSaveEdit={handleSaveEdit}
                  handleEditFileChange={handleEditFileChange}
                  isUploading={isUploading}
                  setIsEditing={setIsEditing}
                />
              ) : (
                <div className="flex flex-col justify-between h-full">
                  <div className="flex flex-col gap-6 pt-4">
                    {/* Headline */}
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest">{detailItem.category} LAB PROFILE</span>
                        {isAdmin && (
                          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-bold text-stone-700 bg-stone-100/70 hover:bg-stone-200/50 py-1 px-2.5 rounded-full border border-stone-200 transition-colors">
                            <input
                              type="checkbox"
                              checked={isSignature}
                              disabled={isUploading}
                              onChange={(e) => handleSignatureToggle(e.target.checked)}
                              className="accent-[#C5A059] w-3.5 h-3.5"
                            />
                            <span>시그니처 지정</span>
                          </label>
                        )}
                      </div>
                      <h2 className="font-serif text-2xl text-stone-900 font-bold mt-1 leading-tight">{detailItem.nameKr}</h2>
                      <p className="text-xs text-stone-500 font-light mt-0.5">{detailItem.name}</p>
                      <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light mt-4 py-3.5 px-4 bg-stone-50 border border-stone-200/50 rounded-xl">
                        {detailItem.description}
                      </p>
                    </div>

                    {/* Machine note */}
                    <div className="p-4 bg-[#C5A059]/5 border border-[#C5A059]/15 rounded-xl text-left">
                      <span className="text-[10px] font-sans font-extrabold text-[#C5A059] block mb-1">※ 평균 음료 추출시간 : {getDrinkExtractionTime(detailItem.category)}초</span>
                      <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                        본 시그니처 엠블럼 제품은 프리미엄 무인 에스프레소 머신을 통해 주문 즉시 단 {getDrinkExtractionTime(detailItem.category)}초 이내에 추출되어 향과 크레마 손상 없이 고속 제공됩니다.
                      </p>
                    </div>
                  </div>

                  {/* Close row */}
                  <div className="pt-6 border-t border-stone-150 mt-8 flex justify-end items-center gap-4 w-full">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        className="px-5 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98] rounded-xl flex items-center gap-1.5 mr-auto"
                      >
                        <Trash2 size={13} />
                        <span>메뉴 삭제</span>
                      </button>
                    )}
                    {hasVideo && !inlinePlaying && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setInlinePlaying(true);
                        }}
                        className="px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] rounded-xl border border-emerald-250"
                      >
                        <Play size={12} className="fill-emerald-600 shrink-0" />
                        <span>영상보기</span>
                      </button>
                    )}
                    <button
                      id="submit-customize-cart-btn"
                      onClick={handleCloseDetail}
                      className="px-5 py-3 bg-stone-900 hover:bg-stone-850 text-[#C5A059] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] rounded-xl border border-stone-850 shadow-sm"
                    >
                      <Check size={12} className="stroke-[3] shrink-0" />
                      <span>확인</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            </motion.div>
          </motion.div>
        );
      })()}
      {showConfirm && (
        <AdminConfirmModal
          message={`정말로 이 메뉴(${detailItem?.nameKr})를 삭제하시겠습니까?\n삭제된 메뉴는 복구할 수 없습니다.`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleDeleteItem}
        />
      )}
    </AnimatePresence>
  );
};
