import React from 'react';

export function useHomeSecurity(currentRoute: string) {
  React.useEffect(() => {
    if (import.meta.env.PROD) {
      const isEditable = (target: any): boolean => {
        if (!target) return false;
        const el = target.nodeType === 3 ? target.parentElement : target;
        if (!el) return false;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return true;
        if (typeof el.closest === 'function' && el.closest('[contenteditable="true"]')) return true;
        return false;
      };

      const handleContextMenu = (e: MouseEvent) => {
        if (currentRoute === 'TEST_VALIDATOR') return;
        if (isEditable(e.target)) return;
        e.preventDefault();
      };
      const handleSelectStart = (e: Event) => {
        if (currentRoute === 'TEST_VALIDATOR') return;
        if (isEditable(e.target)) return;
        e.preventDefault();
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('selectstart', handleSelectStart);

      if (currentRoute === 'TEST_VALIDATOR') {
        document.body.style.userSelect = 'text';
        document.body.style.webkitUserSelect = 'text';
      } else {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
      }

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('selectstart', handleSelectStart);
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
      };
    } else {
      document.body.classList.add('dev-mode');
      document.body.style.userSelect = 'text';
      document.body.style.webkitUserSelect = 'text';
    }
  }, [currentRoute]);
}
