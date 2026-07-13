import React, { useState, useEffect, useMemo } from 'react';
import { useImageUpload } from '../use_image_upload';

interface UseAdminMenuProps {
  adminCategories: any[];
  setAdminCategories: (cats: any[]) => void;
  adminMenuItems: any[];
  setAdminMenuItems: (items: any[]) => void;
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  isMenuAll?: boolean;
}

const MENU_ITEMS_PER_PAGE = 200;

export const useAdminMenu = ({
  adminCategories,
  setAdminCategories,
  adminMenuItems,
  setAdminMenuItems,
  showTemporaryToast,
  showTemporaryError,
  isMenuAll = false
}: UseAdminMenuProps) => {
  const { processAndUpload } = useImageUpload();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'ALL' | string>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [menuItemsPage, setMenuItemsPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Category Form Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormMode, setCategoryFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [categoryFormId, setCategoryFormId] = useState('');
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormDesc, setCategoryFormDesc] = useState('');
  const [categoryFormVisible, setCategoryFormVisible] = useState(true);

  // Menu Items Form Modals state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuFormMode, setMenuFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [menuFormId, setMenuFormId] = useState('');
  const [menuFormName, setMenuFormName] = useState('');
  const [menuFormNameKr, setMenuFormNameKr] = useState('');
  const [menuFormCategory, setMenuFormCategory] = useState('');
  const [menuFormImage, setMenuFormImage] = useState('');
  const [menuFormDesc, setMenuFormDesc] = useState('');
  const [menuFormAcidity, setMenuFormAcidity] = useState(1);
  const [menuFormSweetness, setMenuFormSweetness] = useState(3);
  const [menuFormBody, setMenuFormBody] = useState(2);
  const [menuFormBitterness, setMenuFormBitterness] = useState(1);
  const [menuFormVisible, setMenuFormVisible] = useState(true);
  const [menuFormIsSignature, setMenuFormIsSignature] = useState(false);
  const [menuFormVideoUrl, setMenuFormVideoUrl] = useState('');

  // Bulk Image Edit States
  const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);
  const [bulkImageValue, setBulkImageValue] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sortByName, setSortByName] = useState<'NONE' | 'ASC' | 'DESC'>('NONE');
  const [isLargeImages, setIsLargeImages] = useState(false);

  // Auto reset page when filtered menu lists change length
  useEffect(() => {
    setMenuItemsPage(1);
  }, [selectedCategoryFilter, adminSearchQuery]);

  const fetchAdminCategoriesLocally = async () => {
    try {
      const res = await fetch('/api/menu-categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          const categoryOrder = ['AMERICANO', 'COFFEE_LATTE', 'ADE_ETC', 'MILK_LATTE', 'TEA_BASE'];
          const sorted = [...data.categories].sort((a: any, b: any) => {
            const idxA = categoryOrder.indexOf(a.id);
            const idxB = categoryOrder.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
          setAdminCategories(sorted);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminMenuItemsLocally = async () => {
    try {
      const url = isMenuAll ? '/api/menu-items-all/raw' : '/api/menu-items';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminMenuItems(data.items);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminMenuItemsLocally();
  }, [isMenuAll]);

  const handleBulkImageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImageValue.trim()) {
      showTemporaryError('적용할 이미지 URL 또는 업로드 파일이 없습니다.');
      return;
    }
    setIsBulkLoading(true);
    try {
      const res = await fetch('/api/menu-items/bulk-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedMenuIds,
          image: bulkImageValue
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast(`${selectedMenuIds.length}개 메뉴 품목의 이미지를 성공적으로 일괄 수정했습니다.`);
          await fetchAdminMenuItemsLocally();
          setSelectedMenuIds([]);
          setIsBulkImageModalOpen(false);
          setBulkImageValue('');
        } else {
          showTemporaryError(data.message || '일괄 수정 실패');
        }
      } else {
        showTemporaryError('일괄 수정 네트워크 통신 실패');
      }
    } catch (err: any) {
      showTemporaryError(err.message);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormId || !categoryFormName) {
      showTemporaryError('카테고리 ID와 명칭은 필수값입니다.');
      return;
    }
    try {
      const res = await fetch('/api/menu-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryFormId.toUpperCase().replace(/\s+/g, '_'),
          name: categoryFormName,
          desc: categoryFormDesc,
          visible: categoryFormVisible ? 1 : 0
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast('메뉴 카테고리가 등록/수정 되었습니다.');
          await fetchAdminCategoriesLocally();
          setIsCategoryModalOpen(false);
        } else {
          showTemporaryError(data.message);
        }
      }
    } catch (err: any) {
      showTemporaryError(err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setConfirmModal({
      message: `'${id}' 카테고리를 정말로 삭제하시겠습니까? 관련 음료들의 소속이 변경될 수 있습니다.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/menu-categories/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showTemporaryToast('카테고리를 안전하게 삭제하였습니다.');
            await fetchAdminCategoriesLocally();
            if (selectedCategoryFilter === id) {
              setSelectedCategoryFilter('ALL');
            }
          }
        } catch (err: any) {
          showTemporaryError(err.message);
        }
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setValue: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const categoryPayloadId = (typeof menuFormId === 'string' && menuFormId) ? menuFormId : 'MENU_ITEM';
        const uploadedUrl = await processAndUpload(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.82,
          boardName: 'menu',
          categoryId: categoryPayloadId
        });
        setValue(uploadedUrl);
        showTemporaryToast(
          (uploadedUrl.startsWith('http') || uploadedUrl.startsWith('/'))
            ? '압축 최적화된 이미지가 서버 및 DB 백업에 보존되었습니다!'
            : '참고: 서버 응답 오류로 로컬 브라우저 데이터(Base64)로 대체 저장되었습니다.'
        );
      } catch (err: any) {
        if (err?.message === 'LIMIT_EXCEEDED') {
          showTemporaryError('오류: 구형 기기 및 브라우저 환경에서는 1MB 이하의 이미지만 등록 가능합니다.');
        } else {
          showTemporaryToast('참고: 오프라인 모드로 인해 브라우저 데이터(Base64)로 임시 대체 저장되었습니다.');
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormId || !menuFormNameKr) {
      showTemporaryError('메뉴 코드 ID와 한글 명칭은 필수값입니다.');
      return;
    }
    try {
      const url = isMenuAll ? '/api/menu-items-all' : '/api/menu-items';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: menuFormId.toUpperCase().replace(/\s+/g, '_'),
          name: menuFormName,
          nameKr: menuFormNameKr,
          category: menuFormCategory,
          image: menuFormImage,
          description: menuFormDesc,
          acidity: menuFormAcidity,
          sweetness: menuFormSweetness,
          body: menuFormBody,
          bitterness: menuFormBitterness,
          visible: menuFormVisible ? 1 : 0,
          isSignature: menuFormIsSignature ? 1 : 0,
          videoUrl: menuFormVideoUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast('음료 메뉴 정보 데이터가 데이터베이스에 등록/수정 되었습니다.');
          await fetchAdminMenuItemsLocally();
          setIsMenuModalOpen(false);
        } else {
          showTemporaryError(data.message);
        }
      }
    } catch (err: any) {
      showTemporaryError(err.message);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    setConfirmModal({
      message: `'${id}' 메뉴 항목을 영구 삭제하시겠습니까? 데이터베이스에서 소멸됩니다.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showTemporaryToast('메뉴 항목을 성공적으로 영구 삭제하였습니다.');
            await fetchAdminMenuItemsLocally();
          }
        } catch (err: any) {
          showTemporaryError(err.message);
        }
      }
    });
  };

  const handleToggleSignature = async (item: any) => {
    try {
      const isSig = item.isSignature === 1 || item.isSignature === true || (item as any).is_signature === 1 || (item as any).is_signature === true;
      const nextSigValue = isSig ? 0 : 1;
      const url = isMenuAll ? '/api/menu-items-all' : '/api/menu-items';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          nameKr: item.nameKr,
          category: item.category,
          image: item.image,
          description: item.description,
          acidity: item.acidity,
          sweetness: item.sweetness,
          body: item.body,
          bitterness: item.bitterness,
          visible: (item.visible === 1 || item.visible === true) ? 1 : 0,
          isSignature: nextSigValue
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showTemporaryToast(`'${item.nameKr}' 대표설정 상태가 변경되었습니다.`);
          await fetchAdminMenuItemsLocally();
        } else {
          showTemporaryError(data.message);
        }
      }
    } catch (err: any) {
      showTemporaryError(err.message);
    }
  };

  const filteredList = useMemo(() => {
    let list = adminMenuItems.filter(item => {
      const matchesCategory = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
      if (!matchesCategory) return false;

      if (!adminSearchQuery || adminSearchQuery.trim() === '') return true;
      const query = adminSearchQuery.toLowerCase().trim();
      return (
        (item.nameKr || '').toLowerCase().includes(query) ||
        (item.name || '').toLowerCase().includes(query)
      );
    });

    if (sortByName === 'ASC') {
      list = [...list].sort((a: any, b: any) => (a.nameKr || '').localeCompare(b.nameKr || ''));
    } else if (sortByName === 'DESC') {
      list = [...list].sort((a: any, b: any) => (b.nameKr || '').localeCompare(a.nameKr || ''));
    }

    return list;
  }, [adminMenuItems, selectedCategoryFilter, adminSearchQuery, sortByName]);

  const currentItemsToShow = useMemo(() => {
    return filteredList.slice((menuItemsPage - 1) * MENU_ITEMS_PER_PAGE, menuItemsPage * MENU_ITEMS_PER_PAGE);
  }, [filteredList, menuItemsPage]);

  const totalPages = Math.ceil(filteredList.length / MENU_ITEMS_PER_PAGE) || 1;

  return {
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
    
    filteredList,
    currentItemsToShow,
    totalPages,
    sortByName, setSortByName,
    isLargeImages, setIsLargeImages,
    
    handleBulkImageUpdate,
    handleSaveCategory,
    handleDeleteCategory,
    handleFileChange,
    handleSaveMenuItem,
    handleDeleteMenuItem,
    handleToggleSignature,
    fetchAdminMenuItemsLocally
  };
};
