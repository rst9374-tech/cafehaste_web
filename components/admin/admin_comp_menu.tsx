import React from 'react';
import JSZip from 'jszip';
import { 
  Plus, Edit, Trash2, Search, X, Image as ImageIcon, RefreshCw, Download
} from 'lucide-react';
import { AdminMenuTable } from './admin_comp_menu_table';
import { AdminCategoryModal } from './admin_comp_category_modal';
import { AdminMenuModal } from './admin_comp_menu_modal';
import { AdminMenuBulkImageModal } from './admin_comp_menu_bulk_image_modal';
import { useAdminMenu } from './admin_hook_menu';
import { AdminConfirmModal } from './admin_comp_shared';

interface AdminMenuTabProps {
  adminCategories: any[];
  setAdminCategories: (cats: any[]) => void;
  adminMenuItems: any[];
  setAdminMenuItems: (items: any[]) => void;
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  renderPagination: (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => React.ReactNode;
  isMenuAll?: boolean;
}

const MENU_ITEMS_PER_PAGE = 200;

export const AdminMenuTab: React.FC<AdminMenuTabProps> = ({
  adminCategories,
  setAdminCategories,
  adminMenuItems,
  setAdminMenuItems,
  showTemporaryToast,
  showTemporaryError,
  renderPagination,
  isMenuAll = false
}) => {
  const {
    selectedCategoryFilter, setSelectedCategoryFilter,
    adminSearchQuery, setAdminSearchQuery,
    selectedMenuIds, setSelectedMenuIds,
    menuItemsPage, setMenuItemsPage,
    confirmModal, setConfirmModal,
    
    isCategoryModalOpen, setIsCategoryModalOpen,
    categoryFormMode, setCategoryFormMode,
    categoryFormId, setCategoryFormId,
    categoryFormName, setCategoryFormName,
    categoryFormDesc, setCategoryFormDesc,
    categoryFormVisible, setCategoryFormVisible,
    
    isMenuModalOpen, setIsMenuModalOpen,
    menuFormMode, setMenuFormMode,
    menuFormId, setMenuFormId,
    menuFormName, setMenuFormName,
    menuFormNameKr, setMenuFormNameKr,
    menuFormCategory, setMenuFormCategory,
    menuFormImage, setMenuFormImage,
    menuFormDesc, setMenuFormDesc,
    menuFormAcidity, setMenuFormAcidity,
    menuFormSweetness, setMenuFormSweetness,
    menuFormBody, setMenuFormBody,
    menuFormBitterness, setMenuFormBitterness,
    menuFormVisible, setMenuFormVisible,
    menuFormIsSignature, setMenuFormIsSignature,
    menuFormVideoUrl, setMenuFormVideoUrl,

    isBulkImageModalOpen, setIsBulkImageModalOpen,
    bulkImageValue, setBulkImageValue,
    isBulkLoading,
    isUploading,
    
    currentItemsToShow,
    totalPages,
    
    handleBulkImageUpdate,
    handleBulkSignatureUpdate,
    handleSaveCategory,
    handleDeleteCategory,
    handleFileChange,
    handleSaveMenuItem,
    handleDeleteMenuItem,
    handleToggleSignature,
    fetchAdminMenuItemsLocally,
    sortByName, setSortByName,
    isLargeImages, setIsLargeImages
  } = useAdminMenu({
    adminCategories,
    setAdminCategories,
    adminMenuItems,
    setAdminMenuItems,
    showTemporaryToast,
    showTemporaryError
  });

  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      showTemporaryToast('전체 메뉴 이미지 다운로드 파일(ZIP)을 생성 중입니다...');

      const zip = new JSZip();
      
      // Fetch all items from database (adminMenuItems contains all current items)
      const itemsWithImages = adminMenuItems.filter(item => item.image && typeof item.image === 'string' && item.image.trim() !== '');

      if (itemsWithImages.length === 0) {
        showTemporaryError('다운로드할 이미지가 등록된 음료가 없습니다.');
        setIsDownloadingZip(false);
        return;
      }

      let successCount = 0;

      for (const item of itemsWithImages) {
        try {
          const res = await fetch(item.image);
          if (!res.ok) continue;
          
          const blob = await res.blob();
          const categoryFolder = (item.category || 'others').toLowerCase();
          const filename = `${item.id}.png`;

          zip.folder(categoryFolder).file(filename, blob);
          successCount++;
        } catch (err) {
          console.warn(`Failed to fetch image for ${item.id}: `, err);
        }
      }

      if (successCount === 0) {
        showTemporaryError('이미지 파일 다운로드에 실패했습니다. (서버 연결 혹은 CORS 확인)');
        setIsDownloadingZip(false);
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cafehaste_menu_images_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showTemporaryToast(`총 ${successCount}개의 메뉴 이미지를 폴더별로 압축하여 다운로드했습니다!`);
    } catch (error: any) {
      console.error(error);
      showTemporaryError(`ZIP 생성 중 오류 발생: ${error.message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // 수정 버튼 클릭(EDIT 모달 오픈) 시 배경을 완벽한 검정(#000000)으로 전환
  React.useEffect(() => {
    if (isMenuModalOpen && menuFormMode === 'EDIT') {
      const originalBodyBg = document.body.style.backgroundColor;
      const originalBodyTransition = document.body.style.transition;
      
      // 1. Body 배경을 검정으로 변경
      document.body.style.transition = 'background-color 0.3s ease-in-out';
      document.body.style.backgroundColor = '#000000';

      // 2. 어드민 콘솔 래퍼 요소들을 찾아서 배경을 검정으로 변경
      const consoleWrappers = document.querySelectorAll('.admin-console-wrapper, #admin-view-wrapper, .admin-page-container');
      const originalWrappersBg = Array.from(consoleWrappers).map(el => (el as HTMLElement).style.backgroundColor);
      
      consoleWrappers.forEach(el => {
        (el as HTMLElement).style.setProperty('background-color', '#000000', 'important');
      });

      return () => {
        // 복구
        document.body.style.backgroundColor = originalBodyBg;
        document.body.style.transition = originalBodyTransition;
        consoleWrappers.forEach((el, idx) => {
          (el as HTMLElement).style.removeProperty('background-color');
          if (originalWrappersBg[idx]) {
            (el as HTMLElement).style.backgroundColor = originalWrappersBg[idx];
          }
        });
      };
    }
  }, [isMenuModalOpen, menuFormMode]);

  return (
    <div className="animate-fadeIn font-sans">
      <div className="bg-stone-950 border border-stone-900 rounded-2xl p-4 shadow-sm space-y-3.5">
        {/* 첫 번째 줄: 카테고리 가로 스크롤 탭 */}
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-3 border-b border-stone-900 animate-fadeIn select-none">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`h-8 px-3 border transition-all cursor-pointer rounded-full text-xs font-bold flex items-center focus:outline-none ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-stone-900 border-[#C5A059]/40 text-white shadow-sm'
                : 'bg-stone-950 hover:bg-stone-900 border-stone-900 text-stone-400'
            }`}
          >
            <span>전체 ({adminMenuItems.length})</span>
          </button>

          {adminCategories.map((cat) => {
            const associatedCount = adminMenuItems.filter(item => (item.category || '').trim().toUpperCase() === (cat.id || '').trim().toUpperCase()).length;
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <div
                key={cat.id}
                className={`flex items-center gap-1.5 border rounded-full transition-all h-8 pl-3 pr-1.5 text-xs font-bold ${
                  isSelected
                    ? 'bg-stone-900 border-[#C5A059]/40 text-white shadow-sm'
                    : 'bg-stone-950 hover:bg-stone-900 border-stone-900 text-stone-400'
                }`}
              >
                <button
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className="focus:outline-none text-left cursor-pointer flex items-center h-full text-inherit"
                  title={cat.desc || cat.name}
                >
                  <span>{cat.name} ({associatedCount})</span>
                </button>

                <div className="flex gap-0.5 items-center shrink-0 border-l border-current/15 pl-1.5">
                  <button
                    onClick={() => {
                      setCategoryFormMode('EDIT');
                      setCategoryFormId(cat.id);
                      setCategoryFormName(cat.name);
                      setCategoryFormDesc(cat.desc || '');
                      setCategoryFormVisible(cat.visible === 1 || cat.visible === true);
                      setIsCategoryModalOpen(true);
                    }}
                    className={`p-0.5 rounded-full cursor-pointer transition-all ${
                      isSelected 
                        ? 'text-stone-300 hover:text-white hover:bg-stone-800' 
                        : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'
                    }`}
                    title="카테고리 수정"
                  >
                    <Edit size={10} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className={`p-0.5 rounded-full cursor-pointer transition-all ${
                      isSelected 
                        ? 'text-rose-300 hover:text-rose-100 hover:bg-stone-800' 
                        : 'text-rose-500 hover:text-rose-300 hover:bg-rose-950/30'
                    }`}
                    title="카테고리 삭제"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 두 번째 줄: 검색어 입력창 (맨 왼쪽) & 제어 버튼 그룹 (맨 오른쪽) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 animate-fadeIn">
          
          {/* 검색어 입력창 (왼쪽 배치) */}
          <div className="relative w-32 sm:w-36 flex-shrink-0 mr-0.5">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3 w-3 text-stone-550" />
            </div>
            <input
              id="admin-menu-search-input"
              type="text"
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              placeholder="맛/메뉴 검색..."
              className="block w-full pl-7 pr-7 py-1.5 border border-stone-900 rounded-full bg-stone-950 text-[10px] font-semibold placeholder-stone-500 focus:outline-[#C5A059] transition-all shadow-xs text-stone-200"
            />
            {adminSearchQuery && (
              <button
                type="button"
                onClick={() => setAdminSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer text-stone-400 hover:text-stone-600"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* 제어 버튼 그룹 (오른쪽 정렬 배치) */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {isMenuAll && (
              <button
                type="button"
                onClick={() => setIsLargeImages(prev => !prev)}
                className="dashboard-btn-dark py-1 px-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1 shrink-0"
                title="음료 이미지 미리보기 크게"
              >
                <ImageIcon size={10} />
                <span>{isLargeImages ? '기본' : '크게'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="dashboard-btn-dark py-1 px-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1 shrink-0"
              title="전체 음료 이미지 다운로드"
            >
              <Download size={10} className={isDownloadingZip ? "animate-pulse" : ""} />
              <span>{isDownloadingZip ? '압축 중...' : 'ZIP 다운'}</span>
            </button>

            {selectedMenuIds.length > 0 && (
              <div className="flex items-center gap-1 bg-stone-900/40 p-0.5 rounded-xl border border-stone-850">
                <button
                  type="button"
                  onClick={() => setIsBulkImageModalOpen(true)}
                  className="dashboard-btn-dark py-1 px-2 rounded-lg text-[10px] flex items-center gap-1 shrink-0"
                >
                  <ImageIcon size={10} />
                  <span>이미지</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSignatureUpdate(true)}
                  className="dashboard-btn-dark py-1 px-2 rounded-lg text-[10px] flex items-center gap-1 shrink-0"
                >
                  <span>시그니처</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSignatureUpdate(false)}
                  className="dashboard-btn-dark py-1 px-2 rounded-lg text-[10px] flex items-center gap-1 shrink-0 border border-stone-800"
                >
                  <span>해제</span>
                </button>
              </div>
            )}

            {/* 카테고리 추가 버튼 (삭제의 바로 왼쪽에 렌더링되도록 배치) */}
            <button
              onClick={() => {
                setCategoryFormMode('CREATE');
                setCategoryFormId('');
                setCategoryFormName('');
                setCategoryFormDesc('');
                setCategoryFormVisible(true);
                setIsCategoryModalOpen(true);
              }}
              className="dashboard-btn-dark py-1 px-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1 shrink-0"
              title="새로운 카테고리 추가"
            >
              <Plus size={10} />
              <span>카테고리 추가</span>
            </button>

            {/* 선택 일괄 삭제 버튼 */}
            {selectedMenuIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    message: `선택하신 ${selectedMenuIds.length}개의 음료 품목을 데이터베이스에서 영구 삭제하시겠습니까?`,
                    onConfirm: async () => {
                      try {
                        for (const id of selectedMenuIds) {
                          await handleDeleteMenuItem(String(id));
                        }
                        showTemporaryToast('선택한 음료 목록들이 일괄 삭제되었습니다.');
                        setSelectedMenuIds([]);
                        window.dispatchEvent(new Event('haste_menu_items_updated'));
                      } catch (err: any) {
                        showTemporaryError('일괄 삭제 중 오류가 발생했습니다: ' + err.message);
                      }
                    }
                  });
                }}
                className="py-1 px-2.5 rounded-lg text-[10px] bg-rose-950/20 border border-rose-900/30 text-rose-450 hover:bg-rose-950/45 hover:text-rose-350 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Trash2 size={10} />
                <span>삭제 ({selectedMenuIds.length})</span>
              </button>
            )}
          </div>
        </div>

        <AdminMenuTable
          currentItemsToShow={currentItemsToShow}
          adminCategories={adminCategories}
          selectedMenuIds={selectedMenuIds}
          setSelectedMenuIds={setSelectedMenuIds}
          menuItemsPage={menuItemsPage}
          MENU_ITEMS_PER_PAGE={MENU_ITEMS_PER_PAGE}
          totalPages={totalPages}
          setMenuItemsPage={setMenuItemsPage}
          handleToggleSignature={handleToggleSignature}
          handleDeleteMenuItem={handleDeleteMenuItem}
          setMenuFormMode={setMenuFormMode}
          setMenuFormId={setMenuFormId}
          setMenuFormName={setMenuFormName}
          setMenuFormNameKr={setMenuFormNameKr}
          setMenuFormCategory={setMenuFormCategory}
          setMenuFormImage={setMenuFormImage}
          setMenuFormDesc={setMenuFormDesc}
          setMenuFormAcidity={setMenuFormAcidity}
          setMenuFormSweetness={setMenuFormSweetness}
          setMenuFormBody={setMenuFormBody}
          setMenuFormBitterness={setMenuFormBitterness}
          setMenuFormVisible={setMenuFormVisible}
          setMenuFormIsSignature={setMenuFormIsSignature}
          setMenuFormVideoUrl={setMenuFormVideoUrl}
          setIsMenuModalOpen={setIsMenuModalOpen}
          renderPagination={renderPagination}
          isLargeImages={isLargeImages}
          sortByName={sortByName}
          setSortByName={setSortByName}
        />

        {/* 음료 추가 버튼 오른쪽 아래 배치 */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              setMenuFormMode('CREATE');
              setMenuFormId('DRINK_' + Date.now().toString().slice(-6));
              setMenuFormName('');
              setMenuFormNameKr('');
              setMenuFormCategory(selectedCategoryFilter === 'ALL' ? (adminCategories[0]?.id || 'AMERICANO') : selectedCategoryFilter);
              setMenuFormImage('');
              setMenuFormDesc('');
              setMenuFormAcidity(1);
              setMenuFormSweetness(3);
              setMenuFormBody(2);
              setMenuFormBitterness(1);
              setMenuFormVisible(true);
              setMenuFormIsSignature(false);
              setMenuFormVideoUrl('');
              setIsMenuModalOpen(true);
            }}
            className="dashboard-btn-gold-compact py-2.5 px-5 !rounded-xl"
          >
            <Plus size={14} />
            <span>음료 추가하기</span>
          </button>
        </div>
      </div>

      <AdminCategoryModal
        isCategoryModalOpen={isCategoryModalOpen}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        categoryFormMode={categoryFormMode}
        categoryFormId={categoryFormId}
        setCategoryFormId={setCategoryFormId}
        categoryFormName={categoryFormName}
        setCategoryFormName={setCategoryFormName}
        categoryFormDesc={categoryFormDesc}
        setCategoryFormDesc={setCategoryFormDesc}
        categoryFormVisible={categoryFormVisible}
        setCategoryFormVisible={setCategoryFormVisible}
        handleSaveCategory={handleSaveCategory}
      />

      <AdminMenuModal
        isMenuModalOpen={isMenuModalOpen}
        setIsMenuModalOpen={setIsMenuModalOpen}
        menuFormMode={menuFormMode}
        menuFormId={menuFormId}
        setMenuFormId={setMenuFormId}
        menuFormName={menuFormName}
        setMenuFormName={setMenuFormName}
        menuFormNameKr={menuFormNameKr}
        setMenuFormNameKr={setMenuFormNameKr}
        menuFormCategory={menuFormCategory}
        setMenuFormCategory={setMenuFormCategory}
        adminCategories={adminCategories}
        menuFormImage={menuFormImage}
        setMenuFormImage={setMenuFormImage}
        menuFormDesc={menuFormDesc}
        setMenuFormDesc={setMenuFormDesc}
        menuFormVisible={menuFormVisible}
        setMenuFormVisible={setMenuFormVisible}
        menuFormIsSignature={menuFormIsSignature}
        setMenuFormIsSignature={setMenuFormIsSignature}
        menuFormVideoUrl={menuFormVideoUrl}
        setMenuFormVideoUrl={setMenuFormVideoUrl}
        handleSaveMenuItem={handleSaveMenuItem}
        handleFileChange={handleFileChange}
        isUploading={isUploading}
      />

      <AdminMenuBulkImageModal
        isBulkImageModalOpen={isBulkImageModalOpen}
        setIsBulkImageModalOpen={setIsBulkImageModalOpen}
        selectedMenuIds={selectedMenuIds}
        bulkImageValue={bulkImageValue}
        setBulkImageValue={setBulkImageValue}
        handleBulkImageUpdate={handleBulkImageUpdate}
        handleFileChange={handleFileChange}
        isUploading={isUploading}
        isBulkLoading={isBulkLoading}
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
