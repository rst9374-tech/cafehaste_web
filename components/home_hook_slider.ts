import React, { useRef } from 'react';

export const useHomeSlider = () => {
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const drinkSliderRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY };
    isDraggingRef.current = false;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartRef.current.x === 0 && dragStartRef.current.y === 0) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const diffX = Math.abs(clientX - dragStartRef.current.x);
    const diffY = Math.abs(clientY - dragStartRef.current.y);
    if (diffX > 8 || diffY > 8) {
      isDraggingRef.current = true;
    }
  };

  const handleDragEnd = () => {
    dragStartRef.current = { x: 0, y: 0 };
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (drinkSliderRef.current) {
      const scrollAmount = window.innerWidth * 0.72;
      drinkSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return {
    drinkSliderRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    scrollSlider,
  };
};
