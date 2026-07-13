import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';
import { AdminDesignTable } from './admin_comp_design_table';
import { AdminDesignSimulator } from './admin_comp_design_simulator';
import { AdminDesignModal } from './admin_comp_design_modal';
import { AdminConfirmModal } from './admin_comp_shared';
import { useImageUpload } from '../use_image_upload';

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

interface AdminDesignTabProps {
  interiors: any[];
  setInteriors: (interiors: any[]) => void;
  onUpdateInteriors?: (interiors: any[]) => void;
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
}

const ITEMS_PER_PAGE = 5;

export const AdminDesignTab: React.FC<AdminDesignTabProps> = ({
  interiors,
  setInteriors,
  onUpdateInteriors,
  showTemporaryToast,
  showTemporaryError,
  renderPagination
}) => {
  const { processAndUpload } = useImageUpload();
  const [interiorPage, setInteriorPage] = useState(1);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([]);
  const [previewInterior, setPreviewInterior] = useState<any | null>(null);
  const [interiorImageIndex, setInteriorImageIndex] = useState(0);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Interior Board Modal / Form States
  const [isInteriorModalOpen, setIsInteriorModalOpen] = useState(false);
  const [interiorFormMode, setInteriorFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [interiorFormId, setInteriorFormId] = useState('');
  const [interiorFormTitle, setInteriorFormTitle] = useState('');
  const [interiorFormSubtitle, setInteriorFormSubtitle] = useState('');
  const [interiorFormDesc, setInteriorFormDesc] = useState('');
  const [interiorFormTags, setInteriorFormTags] = useState('');
  const [interiorFormGallery, setInteriorFormGallery] = useState<string[]>(['', '', '']);
  const [interiorFormVideoLinks, setInteriorFormVideoLinks] = useState<string[]>(['', '', '']);
  const [interiorFormBlueprint, setInteriorFormBlueprint] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Reset image index when active preview changes
  useEffect(() => {
    setInteriorImageIndex(0);
  }, [previewInterior]);

  // Auto-reset page when list lengths change to prevent out-of-bounds pages
  useEffect(() => {
    setInteriorPage(1);
  }, [interiors.length]);

  const refreshInteriorsLocally = async () => {
    try {
      const res = await fetch('/api/interiors');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.interiors)) {
          setInteriors(data.interiors);
          localStorage.setItem('haste_interior_types', JSON.stringify(data.interiors));
          window.dispatchEvent(new Event('haste_interior_updated'));
          if (onUpdateInteriors) {
            onUpdateInteriors(data.interiors);
          }
        }
      }
    } catch (err) {
      console.error('[Admin] Failed to fetch live interiors:', err);
    }
  };

  const handleOpenCreateInterior = () => {
    setInteriorFormMode('CREATE');
    setInteriorFormId(`TYPE${interiors.length + 1}`);
    setInteriorFormTitle(`타입 0${interiors.length + 1}: 새로운 수제 콘셉트 테마`);
    setInteriorFormSubtitle('네추럴 오크 마감 및 우드 데칼 피팅 공간');
    setInteriorFormDesc('정교하게 용접 가공된 인테리어 모듈 and 은은한 황금 조명의 미장 마감입니다.');
    setInteriorFormTags('아이보리 미장, 노출 콘크리트');
    setInteriorFormGallery(['', '', '']);
    setInteriorFormVideoLinks(['', '', '']);
    setInteriorFormBlueprint('');
    setIsInteriorModalOpen(true);
  };

  const handleOpenEditInterior = (item: any) => {
    setInteriorFormMode('EDIT');
    setInteriorFormId(item.type_id || item.typeId || item.id);
    setInteriorFormTitle(item.title);
    setInteriorFormSubtitle(item.subtitle);
    setInteriorFormDesc(item.desc);
    setInteriorFormTags(Array.isArray(item.tags) ? item.tags.join(', ') : '');
    setInteriorFormGallery([
      item.gallery?.[0] || '',
      item.gallery?.[1] || '',
      item.gallery?.[2] || ''
    ]);
    const parsedVl = safeParseVideoLinks(item.videoLinks || item.video_links);
    setInteriorFormVideoLinks([
      parsedVl[0] || '',
      parsedVl[1] || '',
      parsedVl[2] || ''
    ]);
    setInteriorFormBlueprint(item.blueprintImage || '');
    setIsInteriorModalOpen(true);
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadedUrl = await processAndUpload(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.82,
          boardName: 'interior',
          categoryId: interiorFormId || 'layout'
        });

        setInteriorFormGallery((prev) => {
          const copied = [...prev];
          copied[index] = uploadedUrl;
          return copied;
        });
        showTemporaryToast(
          (uploadedUrl.startsWith('http') || uploadedUrl.startsWith('/'))
            ? '이미지가 성공적으로 저장되었습니다!'
            : '로컬 브라우즈 저장 대체.'
        );
      } catch (err: any) {
        if (err?.message === 'LIMIT_EXCEEDED') {
          showTemporaryError('오류: 1MB를 초과하는 파일은 등록할 수 없습니다.');
        } else {
          showTemporaryError('오프라인 임시 저장 완료');
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveInterior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interiorFormId || !interiorFormTitle) {
      showTemporaryError('스타일 코드 ID와 스타일 명칭은 필수값입니다.');
      return;
    }

    const tagsArray = interiorFormTags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      id: interiorFormId,
      title: interiorFormTitle,
      subtitle: interiorFormSubtitle,
      desc: interiorFormDesc,
      tags: tagsArray,
      highlights: [
        { title: '수제 샌드 피니시', detail: '시간의 무게를 얹은 듯 차분하고 아늑한 질감마감' },
        { title: '아일랜드 오크 하드 카운터', detail: '소모품 레이블링 테이블 맞춤 원목 바' }
      ],
      gallery: interiorFormGallery.filter(Boolean),
      videoLinks: interiorFormVideoLinks,
      mockImage: interiorFormGallery[0] || '',
      blueprintImage: interiorFormBlueprint || ''
    };

    try {
      let res;
      if (interiorFormMode === 'EDIT') {
        res = await fetch(`/api/interiors/${interiorFormId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/interiors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const serverInterior = data.interior ? {
            id: data.interior.id,
            title: data.interior.title,
            subtitle: data.interior.subtitle,
            desc: data.interior.desc,
            tags: typeof data.interior.tags === 'string' ? JSON.parse(data.interior.tags) : (Array.isArray(data.interior.tags) ? data.interior.tags : []),
            highlights: typeof data.interior.highlights === 'string' ? JSON.parse(data.interior.highlights) : (Array.isArray(data.interior.highlights) ? data.interior.highlights : []),
            gallery: typeof data.interior.gallery === 'string' ? JSON.parse(data.interior.gallery) : (Array.isArray(data.interior.gallery) ? data.interior.gallery : []),
            videoLinks: typeof data.interior.videoLinks === 'string' ? JSON.parse(data.interior.videoLinks) : (Array.isArray(data.interior.videoLinks) ? data.interior.videoLinks : []),
            mockImage: data.interior.mockImage || payload.mockImage,
            blueprintImage: data.interior.blueprintImage || payload.blueprintImage,
            visible: data.interior.visible !== false,
            defaultTitle: data.interior.defaultTitle || data.interior.title,
            defaultSubtitle: data.interior.defaultSubtitle || data.interior.subtitle,
            defaultDesc: data.interior.defaultDesc || data.interior.desc,
            defaultTags: data.interior.defaultTags || data.interior.tags,
            defaultHighlights: data.interior.defaultHighlights || data.interior.highlights,
            defaultGallery: data.interior.defaultGallery || data.interior.gallery,
            defaultVideoLinks: data.interior.defaultVideoLinks || data.interior.videoLinks,
            defaultMockImage: data.interior.defaultMockImage || data.interior.mockImage,
            defaultBlueprintImage: data.interior.defaultBlueprintImage || data.interior.blueprintImage
          } : { ...payload, visible: true };

          let updatedInteriors;
          if (interiorFormMode === 'EDIT') {
            updatedInteriors = interiors.map(it => it.id === interiorFormId ? { ...it, ...serverInterior } : it);
          } else {
            updatedInteriors = [...interiors, serverInterior];
          }

          setInteriors(updatedInteriors);
          localStorage.setItem('haste_interior_types', JSON.stringify(updatedInteriors));
          window.dispatchEvent(new Event('haste_interior_updated'));

          if (previewInterior?.id === interiorFormId) {
            setPreviewInterior(serverInterior);
          }

          await refreshInteriorsLocally();
          showTemporaryToast(interiorFormMode === 'EDIT' ? '디자인 및 인테리어 설정 게시글이 수동 수정 반영되었습니다!' : '새 디자인 및 인테리어 게시글의 등록이 완료되었습니다!');
          setIsInteriorModalOpen(false);
        } else {
          showTemporaryError(data.message || '디자인 동기화 실패');
        }
      } else {
        showTemporaryError('서버 전산 응답이 실패했습니다.');
      }
    } catch (err: any) {
      showTemporaryError('데이터베이스 연동 전산 실패: ' + err.message);
    }
  };

  const handleDeleteInterior = (typeId: string) => {
    const target = interiors.find(i => i.id === typeId);
    const title = target ? target.title : typeId;
    setConfirmModal({
      message: `선택하신 "${title}" 게시글을 완전히 영구 삭제하시겠습니까? 지점 목록 연동에서도 제외됩니다.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/interiors/${typeId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              await refreshInteriorsLocally();
              showTemporaryToast('디자인 및 인테리어 게재글의 영구 삭제가 완료되었습니다.');
              if (previewInterior?.id === typeId) {
                setPreviewInterior(null);
              }
            } else {
              showTemporaryError(data.message || '디자인 삭제 처리 에러');
            }
          }
        } catch (err: any) {
          showTemporaryError('삭제 연동 프로세스에 예외가 발생했습니다: ' + err.message);
        }
      }
    });
  };

  const totalInteriorPages = Math.ceil(interiors.length / ITEMS_PER_PAGE);
  const currentInteriorsToShow = useMemo(() => {
    const startIndex = (interiorPage - 1) * ITEMS_PER_PAGE;
    return interiors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [interiors, interiorPage]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AdminDesignTable
          interiors={interiors}
          setInteriors={setInteriors}
          onUpdateInteriors={onUpdateInteriors}
          currentInteriorsToShow={currentInteriorsToShow}
          selectedDesignIds={selectedDesignIds}
          setSelectedDesignIds={setSelectedDesignIds}
          draggedIdx={draggedIdx}
          setDraggedIdx={setDraggedIdx}
          setPreviewInterior={setPreviewInterior}
          handleOpenEditInterior={handleOpenEditInterior}
          handleDeleteInterior={handleDeleteInterior}
          interiorPage={interiorPage}
          setInteriorPage={setInteriorPage}
          totalInteriorPages={totalInteriorPages}
          renderPagination={renderPagination}
          showTemporaryToast={showTemporaryToast}
          showTemporaryError={showTemporaryError}
          setConfirmModal={setConfirmModal}
          handleOpenCreateInterior={handleOpenCreateInterior}
        />

        <AdminDesignSimulator
          previewInterior={previewInterior}
          interiors={interiors}
          interiorImageIndex={interiorImageIndex}
          setInteriorImageIndex={setInteriorImageIndex}
          setPreviewInterior={setPreviewInterior}
        />
      </div>

      <AdminDesignModal
        isInteriorModalOpen={isInteriorModalOpen}
        setIsInteriorModalOpen={setIsInteriorModalOpen}
        interiorFormMode={interiorFormMode}
        interiorFormId={interiorFormId}
        setInteriorFormId={setInteriorFormId}
        interiorFormTitle={interiorFormTitle}
        setInteriorFormTitle={setInteriorFormTitle}
        interiorFormSubtitle={interiorFormSubtitle}
        setInteriorFormSubtitle={setInteriorFormSubtitle}
        interiorFormDesc={interiorFormDesc}
        setInteriorFormDesc={setInteriorFormDesc}
        interiorFormTags={interiorFormTags}
        setInteriorFormTags={setInteriorFormTags}
        interiorFormGallery={interiorFormGallery}
        interiorFormVideoLinks={interiorFormVideoLinks}
        setInteriorFormVideoLinks={setInteriorFormVideoLinks}
        isUploading={isUploading}
        handleSaveInterior={handleSaveInterior}
        handleGalleryFileChange={handleGalleryFileChange}
      />



      {confirmModal && (
        <AdminConfirmModal
          message={confirmModal.message}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
        />
      )}
    </div>
  );
};
