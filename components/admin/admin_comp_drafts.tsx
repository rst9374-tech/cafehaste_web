import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AdminSystemHub } from './admin_comp_systemhub';
import { HeroDraft } from '../home_types';
import { DraftsModal } from './admin_comp_drafts_modal';
import { AdminDraftsTable } from './admin_comp_drafts_table';
import { AdminDraftsPreview } from './admin_comp_drafts_preview';
import { useImageUpload } from '../use_image_upload';


interface AdminDraftsTabProps {
  heroDrafts: HeroDraft[];
  onUpdateDrafts: (drafts: HeroDraft[]) => void;
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  draftRandomShow?: boolean;
  setDraftRandomShow?: (v: boolean) => void;
}

const ITEMS_PER_PAGE = 100;

export const AdminDraftsTab: React.FC<AdminDraftsTabProps> = ({
  heroDrafts,
  onUpdateDrafts,
  showTemporaryToast,
  showTemporaryError,
  renderPagination,
  draftRandomShow = false,
  setDraftRandomShow = () => {}
}) => {
  const [draftPage, setDraftPage] = useState(1);
  const [selectedDraftIds, setSelectedDraftIds] = useState<number[]>([]);
  const [previewDraft, setPreviewDraft] = useState<HeroDraft | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Computed pagination
  const totalDraftPages = Math.ceil(heroDrafts.length / ITEMS_PER_PAGE) || 1;
  const currentDraftsToShow = useMemo(() => {
    const start = (draftPage - 1) * ITEMS_PER_PAGE;
    return heroDrafts.slice(start, start + ITEMS_PER_PAGE);
  }, [heroDrafts, draftPage]);
  
  const handlePrevPreview = () => {
    const activePreview = previewDraft || heroDrafts[0];
    if (!activePreview) return;
    const activeIndex = heroDrafts.findIndex(d => d.id === activePreview.id);
    if (activeIndex !== -1) {
      const prevIdx = activeIndex > 0 ? activeIndex - 1 : heroDrafts.length - 1;
      setPreviewDraft(heroDrafts[prevIdx]);
    }
  };

  const handleNextPreview = () => {
    const activePreview = previewDraft || heroDrafts[0];
    if (!activePreview) return;
    const activeIndex = heroDrafts.findIndex(d => d.id === activePreview.id);
    if (activeIndex !== -1) {
      const nextIdx = activeIndex < heroDrafts.length - 1 ? activeIndex + 1 : 0;
      setPreviewDraft(heroDrafts[nextIdx]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPreview();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewDraft, heroDrafts]);

  // Form States
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftFormMode, setDraftFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [draftFormId, setDraftFormId] = useState<number | null>(null);
  const [draftFormTag, setDraftFormTag] = useState('');
  const [draftFormSlogan, setDraftFormSlogan] = useState('');
  const [draftFormSubtext, setDraftFormSubtext] = useState('');
  const [draftFormBgImage, setDraftFormBgImage] = useState('');
  const [draftFormDesc, setDraftFormDesc] = useState('');
  const { isFileCompressing: isUploading, processAndUpload } = useImageUpload();

  useEffect(() => {
    setDraftPage(1);
  }, [heroDrafts.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setValue: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const categoryPayloadId = (typeof draftFormId === 'string' && draftFormId) ? draftFormId : 'HERO_DRAFT';
      try {
        const uploadUrl = await processAndUpload(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.90,
          boardName: 'draft',
          categoryId: categoryPayloadId
        });
        setValue(uploadUrl);
        showTemporaryToast('압축 이미지 업로드 완료!');
      } catch (err: any) {
        if (err.message === 'LIMIT_EXCEEDED') {
          showTemporaryToast('오류: 구형 환경에서는 1MB 이하 이미지만 가능합니다.');
        } else {
          showTemporaryToast('오프라인 모드로 로컬 데이터로 임시 대체 저장되었습니다.');
        }
      }
    }
  };

  const handleOpenCreateDraft = () => {
    setDraftFormMode('CREATE');
    setDraftFormId(null);
    setDraftFormTag(`Concept 0${heroDrafts.length + 1} / NEW DESIGN`);
    setDraftFormSlogan('');
    setDraftFormSubtext('MILKY SUNLIT MOMENT');
    setDraftFormBgImage('');
    setDraftFormDesc('헤이스트 스마트 라운지 공간 보드 실물 기획 디자인');
    setIsDraftModalOpen(true);
  };

  const handleOpenEditDraft = (draft: HeroDraft) => {
    setDraftFormMode('EDIT');
    setDraftFormId(draft.id);
    setDraftFormTag(draft.tag);
    setDraftFormSlogan(draft.slogan);
    setDraftFormSubtext(draft.subtext);
    setDraftFormBgImage(draft.bgImage || '');
    setDraftFormDesc(draft.description);
    setIsDraftModalOpen(true);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftFormTag || !draftFormSlogan) {
      showTemporaryError('태그와 슬로건은 필수입니다.');
      return;
    }

    const payload = {
      tag: draftFormTag,
      slogan: draftFormSlogan,
      subtext: draftFormSubtext,
      bgImage: draftFormBgImage,
      description: draftFormDesc
    };

    try {
      if (draftFormMode === 'EDIT' && draftFormId !== null) {
        const res = await fetch(`/api/hero-drafts/${draftFormId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const serverDraft = data.draft ? {
              id: data.draft.id,
              tag: data.draft.tag,
              slogan: data.draft.slogan,
              subtext: data.draft.subtext,
              bgImage: data.draft.bgImage || payload.bgImage,
              description: data.draft.description,
              visible: data.draft.visible !== false,
              defaultTag: data.draft.defaultTag || data.draft.tag,
              defaultSlogan: data.draft.defaultSlogan || data.draft.slogan,
              defaultSubtext: data.draft.defaultSubtext || data.draft.subtext,
              defaultBgImage: data.draft.defaultBgImage || data.draft.bgImage,
              defaultDescription: data.draft.defaultDescription || data.draft.description
            } : { ...heroDrafts.find(d => d.id === draftFormId)!, ...payload };

            const updated = heroDrafts.map(d => d.id === draftFormId ? serverDraft : d);
            onUpdateDrafts(updated);
            localStorage.setItem('haste_hero_drafts', JSON.stringify(updated));
            showTemporaryToast('디자인 정보가 성공적으로 수정되었습니다.');
            setIsDraftModalOpen(false);
          } else {
            showTemporaryError(data.message || '수정 실패');
          }
        }
      } else {
        const res = await fetch('/api/hero-drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.draft) {
            const serverDraft = {
              id: data.draft.id,
              tag: data.draft.tag,
              slogan: data.draft.slogan,
              subtext: data.draft.subtext,
              bgImage: data.draft.bgImage || payload.bgImage,
              description: data.draft.description,
              visible: data.draft.visible !== false,
              defaultTag: data.draft.defaultTag || data.draft.tag,
              defaultSlogan: data.draft.defaultSlogan || data.draft.slogan,
              defaultSubtext: data.draft.defaultSubtext || data.draft.subtext,
              defaultBgImage: data.draft.defaultBgImage || data.draft.bgImage,
              defaultDescription: data.draft.defaultDescription || data.draft.description
            };

            const updated = [...heroDrafts, serverDraft];
            onUpdateDrafts(updated);
            localStorage.setItem('haste_hero_drafts', JSON.stringify(updated));
            showTemporaryToast('새 디자인이 성공적으로 등록되었습니다.');
            setIsDraftModalOpen(false);
          } else {
            showTemporaryError(data.message || '등록 실패');
          }
        }
      }
    } catch (err: any) {
      showTemporaryError('데이터베이스 연동에 실패했습니다. ' + err.message);
    }
  };

  const handleDeleteDraft = (id: number) => {
    if (heroDrafts.length <= 1) {
      showTemporaryError('디자인은 최소 1개 이상 유지되어야 합니다.');
      return;
    }
    setConfirmModal({
      message: '이 메인 디자인 게시글을 데이터베이스로부터 완전히 영구 삭제하시겠습니까? 배너 슬라이더 회전 목록에서도 즉시 소멸됩니다.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/hero-drafts/${id}`, { method: 'DELETE' });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              const updatedList = heroDrafts.filter(d => d.id !== id);
              onUpdateDrafts(updatedList);
              localStorage.setItem('haste_hero_drafts', JSON.stringify(updatedList));
              showTemporaryToast('디자인이 삭제되었습니다.');
              if (previewDraft?.id === id) setPreviewDraft(null);
            } else {
              showTemporaryError(data.message || '삭제 에러');
            }
          }
        } catch (err) {
          showTemporaryError('삭제 도중 예외가 발생했습니다.');
        }
      }
    });
  };

  return (
    <div className="space-y-6 flex flex-col w-full">
      {/* ① 최상단 액션 바 (배너 랜덤 노출 + 새 디자인 추가 버튼) */}
      <div className="flex justify-between items-center border-b border-stone-900 pb-4 gap-3 w-full">
        <div className="text-xs text-stone-550 font-bold select-none">
          총 {heroDrafts.length}개의 메인 배너 디자인
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedDraftIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setConfirmModal({
                  message: `선택한 ${selectedDraftIds.length}개의 디자인 게시글을 일괄 삭제하시겠습니까?`,
                  onConfirm: async () => {
                    try {
                      await Promise.all(
                        selectedDraftIds.map(id =>
                          fetch(`/api/hero-drafts/${id}`, { method: 'DELETE' })
                        )
                      );
                      showTemporaryToast('선택한 디자인 게시글이 일괄 삭제되었습니다.');
                      const updated = heroDrafts.filter(d => !selectedDraftIds.includes(d.id));
                      onUpdateDrafts(updated);
                      localStorage.setItem('haste_hero_drafts', JSON.stringify(updated));
                      setSelectedDraftIds([]);
                    } catch (err: any) {
                      showTemporaryError('일괄 삭제 중 오류: ' + err.message);
                    }
                  }
                });
              }}
              className="py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900 border border-rose-900/60 text-rose-350 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
            >
              <Trash2 size={12} />
              <span>선택 일괄 삭제 ({selectedDraftIds.length})</span>
            </button>
          )}

          {/* 배너 랜덤 노출 토글 스위치 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 rounded-xl shadow-sm text-xs font-semibold text-stone-400 select-none">
            <span>배너 랜덤 노출</span>
            <button
              type="button"
              onClick={async () => {
                const nextVal = !draftRandomShow;
                try {
                  const res = await fetch('/api/hero-drafts/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ draftRandomShow: nextVal })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                      setDraftRandomShow(nextVal);
                      showTemporaryToast(nextVal ? '배너 이미지가 이제 랜덤으로 정렬되어 노출됩니다!' : '배너 이미지가 지정된 고정 순서대로 노출됩니다.');
                    }
                  }
                } catch (err: any) {
                  showTemporaryError('설정 저장 중 오류: ' + err.message);
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${draftRandomShow ? 'bg-white' : 'bg-[#3F3F46]'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${draftRandomShow ? 'translate-x-5' : 'translate-x-0'}`}
                style={{ backgroundColor: draftRandomShow ? '#18181b' : '#ffffff' }}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateDraft}
            className="py-1.5 px-3 bg-[#C5A059] hover:bg-[#B38F48] text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
          >
            <Plus size={12} />
            <span>새 디자인 추가</span>
          </button>
        </div>
      </div>

      {/* ② 상단 미리보기 영역 (미리보기 카드를 560px 너비로 키움) */}
      <div className="w-full flex justify-center pb-4 border-b border-stone-900">
        <div className="w-full max-w-[560px] shrink-0">
          <AdminDraftsPreview
            previewDraft={previewDraft}
            heroDrafts={heroDrafts}
            handlePrevPreview={handlePrevPreview}
            handleNextPreview={handleNextPreview}
            setPreviewDraft={setPreviewDraft}
          />
        </div>
      </div>

      {/* ③ 하단 디자인 목록 테이블 (폭 100% 사용) */}
      <div className="w-full flex flex-col gap-4">
        <AdminDraftsTable
          currentDraftsToShow={currentDraftsToShow}
          selectedDraftIds={selectedDraftIds}
          setSelectedDraftIds={setSelectedDraftIds}
          draggedIdx={draggedIdx}
          setDraggedIdx={setDraggedIdx}
          heroDrafts={heroDrafts}
          draftPage={draftPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          onUpdateDrafts={onUpdateDrafts}
          setPreviewDraft={setPreviewDraft}
          handleOpenEditDraft={handleOpenEditDraft}
          handleDeleteDraft={handleDeleteDraft}
        />
        {renderPagination(draftPage, totalDraftPages, setDraftPage)}
      </div>

      <DraftsModal
        isDraftModalOpen={isDraftModalOpen}
        setIsDraftModalOpen={setIsDraftModalOpen}
        draftFormMode={draftFormMode}
        draftFormTag={draftFormTag}
        setDraftFormTag={setDraftFormTag}
        draftFormSlogan={draftFormSlogan}
        setDraftFormSlogan={setDraftFormSlogan}
        draftFormSubtext={draftFormSubtext}
        setDraftFormSubtext={setDraftFormSubtext}
        draftFormBgImage={draftFormBgImage}
        setDraftFormBgImage={setDraftFormBgImage}
        draftFormDesc={draftFormDesc}
        setDraftFormDesc={setDraftFormDesc}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
        handleSaveDraft={handleSaveDraft}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />
    </div>
  );
};
