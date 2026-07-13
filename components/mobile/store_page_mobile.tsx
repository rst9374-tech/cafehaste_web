import React from 'react';
import { HasteStore } from '../store_page_main';

interface HasteStoreMobileProps {
  onQuickOrder?: (branchName: string) => void;
}

export const HasteStoreMobile: React.FC<HasteStoreMobileProps> = ({ onQuickOrder }) => {
  return (
    <HasteStore
      isMobile={true}
      onQuickOrder={onQuickOrder}
    />
  );
};
