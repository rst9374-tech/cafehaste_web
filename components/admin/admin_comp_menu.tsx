import React from 'react';
import { 
  Plus, Edit, Trash2, Search, X, Image as ImageIcon
} from 'lucide-react';
import { AdminSystemHub } from './admin_comp_systemhub';
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
}

const MENU_ITEMS_PER_PAGE = 200;

export const AdminMenuTab: React.FC<AdminMenuTabProps> = ({
  adminCategories,
  setAdminCategories,
  adminMenuItems,
  setAdminMenuItems,
  showTemporaryToast,
  showTemporaryError,
  renderPagination
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
    handleSaveCategory,
    handleDeleteCategory,
    handleFileChange,
    handleSaveMenuItem,
    handleDeleteMenuItem,
    handleToggleSignature
  } = useAdminMenu({
    adminCategories,
    setAdminCategories,
    adminMenuItems,
    setAdminMenuItems,
    showTemporaryToast,
    showTemporaryError
  });

  return (
    <div className="animate-fadeIn font-sans">
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 animate-fadeIn">
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`h-8 px-3 border transition-all cursor-pointer rounded-full text-xs font-bold flex items-center focus:outline-none ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-stone-900 border-[#1c1613] text-white shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-250 text-stone-700'
              }`}
            >
              <span>전체 ({adminMenuItems.length})</span>
            </button>

            {adminCategories.map((cat) => {
              const associatedCount = adminMenuItems.filter(item => item.category === cat.id).length;
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-1.5 border rounded-full transition-all h-8 pl-3 pr-1.5 text-xs font-bold ${
                    isSelected
                      ? 'bg-stone-900 border-[#1c1613] text-white shadow-sm'
                      : 'bg-stone-50/50 hover:bg-stone-100 border-stone-200/80 text-stone-700'
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
                          ? 'text-stone-300 hover:text-white hover:bg-stone-880' 
                          : 'text-stone-500 hover:text-stone-950 hover:bg-stone-200'
                      }`}
                      title="카테고리 수정"
                    >
                      <Edit size={10} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className={`p-0.5 rounded-full cursor-pointer transition-all ${
                        isSelected 
                          ? 'text-rose-300 hover:text-rose-100 hover:bg-stone-880' 
                          : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                      }`}
                      title="카테고리 삭제"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="relative ml-2 w-48 sm:w-56 flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3 w-3 text-stone-400" />
              </div>
              <input
                id="admin-menu-search-input"
                type="text"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                placeholder="음료명, 영문명, 맛 검색..."
                className="block w-full pl-8 pr-8 py-1.5 border border-stone-200 rounded-full bg-[var(--haste-body-bg)] text-[11px] font-semibold placeholder-stone-400 focus:outline-[#C5A059] transition-all shadow-xs text-stone-900"
              />
              {adminSearchQuery && (
                <button
                  type="button"
                  onClick={() => setAdminSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center cursor-pointer text-stone-400 hover:text-stone-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 ml-auto shrink-0 animate-fadeIn">
            <AdminSystemHub 
              showTemporaryToast={showTemporaryToast}
              showTemporaryError={showTemporaryError}
              activeAdminTab="MENU_CATEGORIES"
            />
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
              className="py-1.5 px-3 bg-[#C5A059] hover:bg-[#B38F48] text-stone-955 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
            >
              <Plus size={12} />
              <span>음료 추가하기</span>
            </button>
            <button
              onClick={() => {
                setCategoryFormMode('CREATE');
                setCategoryFormId('');
                setCategoryFormName('');
                setCategoryFormDesc('');
                setCategoryFormVisible(true);
                setIsCategoryModalOpen(true);
              }}
              className="py-1.5 px-3 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
            >
              <Plus size={12} />
              <span>카테고리 추가</span>
            </button>

            {selectedMenuIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkImageModalOpen(true)}
                  className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
                >
                  <ImageIcon size={11} />
                  <span>이미지 일괄 수정 ({selectedMenuIds.length})</span>
                </button>
                <button
                  onClick={() => {
                    setConfirmModal({
                      message: `선택한 ${selectedMenuIds.length}개의 음료 품목을 일괄 삭제하시겠습니까?`,
                      onConfirm: async () => {
                        try {
                          await Promise.all(
                            selectedMenuIds.map(id =>
                              fetch(`/api/menu-items/${id}`, { method: 'DELETE' })
                            )
                          );
                          showTemporaryToast('선택한 음료 목록들이 일괄 삭제되었습니다.');
                          setSelectedMenuIds([]);
                          window.dispatchEvent(new Event('haste_menu_items_updated'));
                        } catch (err: any) {
                          showTemporaryError('일괄 삭제 중 오류가 발생했습니다: ' + err.message);
                        }
                      }
                    });
                  }}
                  className="py-1.5 px-3 bg-rose-50 hover:bg-rose-105 border border-rose-250 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none"
                >
                  <Trash2 size={11} />
                  <span>선택 일괄 삭제 ({selectedMenuIds.length})</span>
                </button>
              </div>
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
        />
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
