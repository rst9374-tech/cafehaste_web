import React from 'react';
import { HasteInterior } from '../interior_page_main';
import { StyleItem } from '../interior_types';

interface HasteInteriorMobileProps {
  interiorTypes: StyleItem[];
  onNavigateToSignup: () => void;
  onNavigateToInquiry: () => void;
  selectedInteriorId: string | null;
  setSelectedInteriorId: (id: string | null) => void;
}

export const HasteInteriorMobile: React.FC<HasteInteriorMobileProps> = ({
  interiorTypes,
  onNavigateToSignup,
  onNavigateToInquiry,
  selectedInteriorId,
  setSelectedInteriorId,
}) => {
  return (
    <HasteInterior
      interiorTypes={interiorTypes}
      onNavigateToSignup={onNavigateToSignup}
      onNavigateToInquiry={onNavigateToInquiry}
      selectedInteriorId={selectedInteriorId}
      setSelectedInteriorId={setSelectedInteriorId}
      isMobile={true}
    />
  );
};
