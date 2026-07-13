import React from 'react';
import { HasteHome } from '../home_page_main';

interface HasteHomeMobileProps {
  filteredDrafts: any[];
  currentDraftIndex: number;
  setCurrentDraftIndex: React.Dispatch<React.SetStateAction<number>>;
  isAutoRotationActive: boolean;
  setIsAutoRotationActive: React.Dispatch<React.SetStateAction<boolean>>;
  signatureItems: any[];
  interiorTypes: any[];
  setSelectedInteriorId: (id: string | null) => void;
  navigateTo: (route: any) => void;
  navigateToSection: (sectionId: string) => void;
  handlePrevDraft: () => void;
  handleNextDraft: () => void;
  setSelectedPickupBranch: React.Dispatch<React.SetStateAction<string>>;
  appFilms?: any[];
  setActivePlayFilm?: (film: any) => void;
  draftRandomShow?: boolean;
  filmRandomShow?: boolean;
}

export const HasteHomeMobile: React.FC<HasteHomeMobileProps> = ({
  filteredDrafts,
  currentDraftIndex,
  setCurrentDraftIndex,
  isAutoRotationActive,
  setIsAutoRotationActive,
  signatureItems,
  interiorTypes,
  setSelectedInteriorId,
  navigateTo,
  navigateToSection,
  handlePrevDraft,
  handleNextDraft,
  appFilms = [],
  draftRandomShow = false,
  filmRandomShow = false,
}) => {
  return (
    <HasteHome
      filteredDrafts={filteredDrafts}
      currentDraftIndex={currentDraftIndex}
      setCurrentDraftIndex={setCurrentDraftIndex}
      isAutoRotationActive={isAutoRotationActive}
      setIsAutoRotationActive={setIsAutoRotationActive}
      signatureItems={signatureItems}
      interiorTypes={interiorTypes}
      setSelectedInteriorId={setSelectedInteriorId}
      navigateTo={navigateTo}
      navigateToSection={navigateToSection}
      handlePrevDraft={handlePrevDraft}
      handleNextDraft={handleNextDraft}
      appFilms={appFilms}
      draftRandomShow={draftRandomShow}
      filmRandomShow={filmRandomShow}
    />
  );
};
