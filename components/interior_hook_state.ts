import React, { useState, useEffect, useMemo } from 'react';
import { StyleItem } from './interior_types';


interface UseHasteInteriorProps {
  interiorTypes: StyleItem[];
  selectedInteriorId: string | null;
  setSelectedInteriorId: (id: string | null) => void;
}

export const useHasteInteriorState = ({
  interiorTypes,
  selectedInteriorId,
  setSelectedInteriorId
}: UseHasteInteriorProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('haste_admin_auth') === 'true');
  const [prices, setPrices] = useState(() => {
    const cached = localStorage.getItem('haste_interior_prices');
    const def = { machineUsed: 1500, machineNew: 3500, interiorPyeong: 200, carpentryPyeong: 50, signage: 300, materials: 150, defaultMachineCondition: 'NEW' };
    if (cached) {
      try { return { ...def, ...JSON.parse(cached) }; } catch (e) { console.error(e); }
    }
    return def;
  });

  useEffect(() => {
    localStorage.setItem('haste_interior_prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    const checkAdmin = () => setIsAdmin(localStorage.getItem('haste_admin_auth') === 'true');
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  const handleUpdatePrice = (key: string, value: any) => {
    if (key === 'RESET') {
      setPrices({ machineUsed: 1500, machineNew: 3500, interiorPyeong: 200, carpentryPyeong: 50, signage: 300, materials: 150, defaultMachineCondition: 'NEW' });
      return;
    }
    setPrices(prev => ({ ...prev, [key]: value }));
  };
  
  const [selectedPopImage, setSelectedPopImage] = useState<{
    src: string;
    alt: string;
    styleTitle: string;
    styleSubtitle: string;
    styleDesc: string;
    videoUrl?: string;
  } | null>(null);

  const CATEGORIES = useMemo(() => {
    const base = [
      { id: 'ALL', label: '전체 콘셉트', desc: '헤이스트 시그니처 수제 매장 디자인 테마 아카이브' }
    ];
    
    const visibleStyles = interiorTypes.filter(s => s.visible !== false);
    visibleStyles.forEach(style => {
      const match = style.title ? style.title.match(/(타입\s*\d+)/i) : null;
      const label = match ? match[1].trim() : (style.title || '');
      
      base.push({
        id: style.id,
        label,
        desc: style.subtitle || style.desc
      });
    });
    
    return base;
  }, [interiorTypes]);
  
  const [previewMode, setPreviewMode] = useState<'GALLERY' | 'BLUEPRINT'>('GALLERY');
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);

  const [estimatedSize, setEstimatedSize] = useState<number>(10);
  const [machineCondition, setMachineCondition] = useState<'NEW' | 'USED' | 'OFF'>(
    () => (prices.defaultMachineCondition as 'NEW' | 'USED' | 'OFF') || 'NEW'
  );

  useEffect(() => {
    if (prices.defaultMachineCondition) {
      setMachineCondition(prices.defaultMachineCondition as 'NEW' | 'USED' | 'OFF');
    }
  }, [prices.defaultMachineCondition]);

  const filteredStyles = useMemo(() => {
    const visibleStyles = interiorTypes.filter(s => s.visible !== false);
    if (activeCategory === 'ALL') return visibleStyles;

    const targetStyle = visibleStyles.find(s => s.id === activeCategory);
    if (targetStyle) {
      return [targetStyle];
    }
    
    return visibleStyles;
  }, [interiorTypes, activeCategory]);

  const firstVisibleStyle = useMemo(() => {
    return interiorTypes.find(s => s.visible !== false) || null;
  }, [interiorTypes]);

  const activeStyle = useMemo(() => {
    if (selectedInteriorId) {
      const found = interiorTypes.find(s => s.id === selectedInteriorId && s.visible !== false);
      if (found) return found;
    }
    return filteredStyles[0] || firstVisibleStyle;
  }, [selectedInteriorId, filteredStyles, firstVisibleStyle, interiorTypes]);

  const mainImagesList = useMemo(() => {
    if (!activeStyle) return [];
    const list = Array.isArray(activeStyle.gallery) ? activeStyle.gallery.filter(Boolean) : [];
    if (list.length === 0) {
      list.push(activeStyle.mockImage || '');
    }
    return list;
  }, [activeStyle]);

  useEffect(() => {
    setActiveGalleryIdx(0);
    setPreviewMode('GALLERY');
  }, [activeStyle?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewMode !== 'GALLERY' || !mainImagesList || mainImagesList.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setActiveGalleryIdx((prev) => (prev > 0 ? prev - 1 : mainImagesList.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveGalleryIdx((prev) => (prev < mainImagesList.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewMode, mainImagesList]);

  const costEstimate = useMemo(() => {
    if (!activeStyle) {
      return { 
        hardware: 0, 
        interior: Math.round(estimatedSize * prices.interiorPyeong), 
        carpentry: Math.round(estimatedSize * prices.carpentryPyeong), 
        signage: prices.signage, 
        materials: prices.materials, 
        total: Math.round(estimatedSize * (prices.interiorPyeong + prices.carpentryPyeong)) + prices.signage + prices.materials 
      };
    }
    
    const hardware = machineCondition === 'OFF' ? 0 : (machineCondition === 'USED' ? prices.machineUsed : prices.machineNew); 
    
    let multiplier = 1.0;
    if (activeStyle.id === 'TYPE2') multiplier = 1.15;
    if (activeStyle.id === 'TYPE3') multiplier = 1.35;

    const interior = Math.round(estimatedSize * prices.interiorPyeong * multiplier);
    const carpentry = Math.round(estimatedSize * prices.carpentryPyeong * multiplier); 
    const signage = prices.signage; 
    const materials = prices.materials; 
    const total = hardware + interior + carpentry + signage + materials;

    return {
      hardware,
      interior,
      carpentry,
      signage,
      materials,
      total
    };
  }, [activeStyle, machineCondition, estimatedSize, prices]);

  return {
    activeCategory,
    setActiveCategory,
    isAdmin,
    prices,
    handleUpdatePrice,
    selectedPopImage,
    setSelectedPopImage,
    previewMode,
    setPreviewMode,
    activeGalleryIdx,
    setActiveGalleryIdx,
    estimatedSize,
    setEstimatedSize,
    machineCondition,
    setMachineCondition,
    CATEGORIES,
    filteredStyles,
    activeStyle,
    mainImagesList,
    costEstimate,
  };
};
