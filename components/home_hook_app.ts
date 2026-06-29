import { useState, useEffect } from 'react';
import { PageRoute } from './home_hook_swipe';
import { HeroDraft } from '../types';
import { CartItem } from './menu_page_main';

export function useAppController(
  interiorTypes: any[],
  setInteriorTypes: (val: any[]) => void,
  heroDrafts: HeroDraft[],
  setHeroDrafts: (val: HeroDraft[]) => void,
  appFilms: any[]
) {
  // Navigation & Page State
  // Navigation & Page State
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(() => {
    const normPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (normPath === '/admin') {
      return 'ADMIN';
    }

    if (normPath === '/music/admin') {
      return 'MUSIC_ADMIN';
    }
    if (normPath === '/music') {
      return 'MUSIC';
    }
    if (normPath === '/control') {
      return 'CONTROL';
    }
    if (normPath === '/test') {
      return 'TEST_VALIDATOR';
    }
    if (normPath === '/film') {
      return 'FILM';
    }
    const pathMatch = window.location.pathname.match(/^\/board\/detail\/([a-z0-9]+)/i) || 
                      window.location.pathname.match(/^\/board\/([a-z0-9]+)/i) || 
                      window.location.pathname.match(/^\/posts\/([a-z0-9]+)/i);
    if (pathMatch) {
      const rawId = pathMatch[1];
      let decodedId = rawId;
      if (!/^\d+$/.test(rawId)) {
        try {
          const val = parseInt(rawId, 36);
          if (!isNaN(val)) {
            const original = (val - 12345) / 31;
            if (Number.isInteger(original) && original > 0) {
              decodedId = String(original);
            }
          }
        } catch (e) {
          console.warn('Failed to decode shared post ID:', e);
        }
      }
      sessionStorage.setItem('haste_shared_postId', decodedId);
      return 'BOARD';
    }
    return 'HOME';
  });

  const isStandaloneMusic = currentRoute === 'MUSIC' || currentRoute === 'MUSIC_ADMIN';

  const [isFilmDirectLoad, setIsFilmDirectLoad] = useState<boolean>(() => {
    return window.location.pathname.toLowerCase().replace(/\/$/, '') === '/film';
  });

  const [isIntroActive, setIsIntroActive] = useState<boolean>(false);
  const [selectedInteriorId, setSelectedInteriorId] = useState<string | null>(null);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileMembershipOpen, setMobileMembershipOpen] = useState<boolean>(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState<boolean>(false);
  const [isFranchiseHovered, setIsFranchiseHovered] = useState<boolean>(false);
  const [isBrandHovered, setIsBrandHovered] = useState<boolean>(false);
  const [isAdminHovered, setIsAdminHovered] = useState<boolean>(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'FILMS' | 'DRAFTS' | 'MEMBERS' | 'INQUIRY' | 'CONSULTATIONS' | 'MENU_ITEMS' | 'MENU_CATEGORIES' | 'LICENSES' | 'COMMUNITY' | 'PERMISSIONS' | 'HQ_STAMP'>('MEMBERS');
  const [isSignUpOpen, setIsSignUpOpen] = useState<boolean>(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [footerDocType, setFooterDocType] = useState<'TERMS' | 'PRIVACY' | 'EMAIL' | null>(null);
  const [activePlayFilm, setActivePlayFilm] = useState<any | null>(null);

  const [selectedDraftCategory, setSelectedDraftCategory] = useState<'ALL' | 'SUNLIT' | 'MINIMAL_TECH' | 'GOLDEN_EXTRACT'>('ALL');
  const [currentDraftIndex, setCurrentDraftIndex] = useState<number>(0);
  const [isAutoRotationActive, setIsAutoRotationActive] = useState<boolean>(true);
  const autoRotateInterval = 10000;

  // Shopping Cart & Ordering States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPickupBranch, setSelectedPickupBranch] = useState<string>('헤이스트 성수 랩 (HQ)');
  const [signatureItems, setSignatureItems] = useState<any[]>([]);

  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState<boolean>(false);
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string;
    branchName: string;
    timestamp: string;
    total: number;
    itemCount: number;
  } | null>(null);

  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [mockMobileFrame, setMockMobileFrame] = useState<boolean>(false);

  const getDraftCategory = (draftId: number) => {
    if ([1, 3, 5, 7, 11, 12, 13, 21, 22, 23].includes(draftId)) return 'SUNLIT';
    if ([4, 6, 8, 14, 15, 16, 24, 25, 26].includes(draftId)) return 'MINIMAL_TECH';
    if ([2, 9, 10, 17, 18, 19, 20, 27, 28, 29, 30].includes(draftId)) return 'GOLDEN_EXTRACT';
    return 'SUNLIT';
  };

  const filteredDrafts = heroDrafts
    .filter(draft => draft.visible !== false)
    .filter(draft => {
      if (selectedDraftCategory === 'ALL') return true;
      return getDraftCategory(draft.id) === selectedDraftCategory;
    });

  useEffect(() => {
    setCurrentDraftIndex(0);
  }, [selectedDraftCategory]);

  const handleUpdateDrafts = (updated: HeroDraft[]) => {
    setHeroDrafts(updated);
    localStorage.setItem('haste_hero_drafts', JSON.stringify(updated));
    if (currentDraftIndex >= updated.length) {
      setCurrentDraftIndex(0);
    }
  };

  useEffect(() => {
    const fetchFreshMenuItemsForSignature = async () => {
      try {
        const resMenuItems = await fetch('/api/menu-items');
        if (resMenuItems.ok) {
          const data = await resMenuItems.json();
          if (data.success && Array.isArray(data.items)) {
            const signatureList = data.items.filter((item: any) => item.isSignature === true || item.isSignature === 1);
            setSignatureItems(signatureList);
          }
        }
      } catch (e) {
        console.warn('[DB Fetch] Failed loading live menu items for signature:', e);
      }
    };
    fetchFreshMenuItemsForSignature();
  }, [currentRoute]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileBrandOpen(false);
      setMobileMembershipOpen(false);
    }
  }, [mobileMenuOpen]);

  const isCurrentlyMobile = isMobileDevice || mockMobileFrame;

  useEffect(() => {
    const cached = localStorage.getItem('haste_logged_user');
    if (cached) {
      try {
        setLoggedUser(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to parse loggedUser storage:", err);
      }
    }
  }, []);

  // Automatically sync user profile details when visiting My Page
  useEffect(() => {
    if (currentRoute === 'MYINFO' && loggedUser && loggedUser.storeCode && loggedUser.role !== 'ADMIN') {
      const uStoreCode = loggedUser.storeCode;
      fetch(`/api/user-profile/${uStoreCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            const userStr = JSON.stringify(data.user);
            const cachedStr = localStorage.getItem('haste_logged_user');
            if (userStr !== cachedStr) {
              setLoggedUser(data.user);
              localStorage.setItem('haste_logged_user', userStr);
              console.log('[Profile Sync] Successfully synced user profile with DB:', data.user.storeType);
            }
          }
        })
        .catch(err => console.error('[Profile Sync Failed]', err));
    }
  }, [currentRoute]);

  useEffect(() => {
    const handleOpenSignUp = () => setIsSignUpOpen(true);
    const handleOpenInquiry = () => setIsInquiryOpen(true);
    const handleNavigate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail && customEvt.detail.route) {
        navigateTo(customEvt.detail.route);
      }
    };
    window.addEventListener('haste_open_signup_modal', handleOpenSignUp);
    window.addEventListener('haste_open_inquiry_modal', handleOpenInquiry);
    window.addEventListener('haste_navigate', handleNavigate);
    return () => {
      window.removeEventListener('haste_open_signup_modal', handleOpenSignUp);
      window.removeEventListener('haste_open_inquiry_modal', handleOpenInquiry);
      window.removeEventListener('haste_navigate', handleNavigate);
    };
  }, []);

  useEffect(() => {
    const visited = sessionStorage.getItem('haste_intro_finished');
    if (visited === 'true') {
      setIsIntroActive(false);
    }
  }, []);

  useEffect(() => {
    if (!isAutoRotationActive || currentRoute !== 'HOME') return;
    const interval = setInterval(() => {
      setCurrentDraftIndex(prev => {
        const len = filteredDrafts.length || 1;
        return (prev + 1) % len;
      });
    }, autoRotateInterval);
    return () => clearInterval(interval);
  }, [isAutoRotationActive, currentRoute, filteredDrafts.length]);

  const handlePrevDraft = () => {
    setIsAutoRotationActive(false);
    setCurrentDraftIndex(prev => {
      const len = filteredDrafts.length || 1;
      return (prev - 1 + len) % len;
    });
  };

  const handleNextDraft = () => {
    setIsAutoRotationActive(false);
    setCurrentDraftIndex(prev => {
      const len = filteredDrafts.length || 1;
      return (prev + 1) % len;
    });
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('haste_intro_finished', 'true');
    setIsIntroActive(false);
    setCurrentRoute('HOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplayIntro = () => {
    const visibleFilms = appFilms.filter((f: any) => f.visible || f.visible === 1 || f.visible === '1');
    if (visibleFilms.length > 0) {
      setActivePlayFilm(visibleFilms[0]);
    } else {
      setActivePlayFilm({
        id: 1,
        title: 'HAIST 시그니처 에스프레소 추출',
        desc: '헤이스트 플래그십 스토어에서 선보이는 프리미엄 골드 원두의 황금빛 크레마 추출 세레모니 비디오입니다.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-40097-large.mp4',
        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-40097-large.mp4',
        visible: 1
      });
    }
  };

  const handlePlaceOrder = () => {
    const orderId = `HST-ORD-${Math.round(Math.random() * 89999 + 10000)}`;
    const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const hasDiscount = subtotal > 5000; 
    const discount = hasDiscount ? 1500 : 0;
    const total = Math.max(0, subtotal - discount);
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    setOrderInfo({
      orderId,
      branchName: selectedPickupBranch,
      timestamp,
      total,
      itemCount,
    });

    setCart([]);
    setIsOrderSuccessOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (route: PageRoute, keepMobileMenuOpen: boolean = false) => {
    if (route === 'FILM') {
      setIsFilmDirectLoad(false);
    }
    setCurrentRoute(route);
    if (!keepMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    if (typeof window !== 'undefined' && window.history.pushState) {
      if (route === 'TEST_VALIDATOR') {
        window.history.pushState({}, '', '/test');

      } else if (route === 'MUSIC_ADMIN') {
        window.history.pushState({}, '', '/music/admin');
      } else if (route === 'MUSIC') {
        window.history.pushState({}, '', '/music');
      } else if (route === 'CONTROL') {
        window.history.pushState({}, '', '/control');
      } else if (route === 'ADMIN') {
        window.history.pushState({}, '', '/admin');
      } else if (route === 'FILM') {
        window.history.pushState({}, '', '/film');
      } else if (route === 'BOARD') {
        const sharedId = sessionStorage.getItem('haste_shared_postId');
        if (sharedId) {
          window.history.pushState({}, '', `/board/detail/${sharedId}`);
        } else {
          window.history.pushState({}, '', '/');
        }
      } else {
        window.history.pushState({}, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSection = (sectionId: string) => {
    let targetRoute: PageRoute = 'FRANCHISE';
    if (sectionId.startsWith('brand-')) {
      targetRoute = 'BRAND';
    } else if (sectionId === 'franchise-calculator' || sectionId === 'haste-estimator-view' || sectionId === 'haste-inquiry-layout') {
      targetRoute = 'FRANCHISE';
    }
    
    if (currentRoute !== targetRoute) {
      setCurrentRoute(targetRoute);
      setMobileMenuOpen(false);
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    } else {
      setMobileMenuOpen(false);
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return {
    currentRoute,
    setCurrentRoute,
    isStandaloneMusic,
    isIntroActive,
    setIsIntroActive,
    selectedInteriorId,
    setSelectedInteriorId,
    selectedMenuItemId,
    setSelectedMenuItemId,
    loggedUser,
    setLoggedUser,
    isLoginOpen,
    setIsLoginOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    mobileMembershipOpen,
    setMobileMembershipOpen,
    mobileBrandOpen,
    setMobileBrandOpen,
    isFranchiseHovered,
    setIsFranchiseHovered,
    isBrandHovered,
    setIsBrandHovered,
    isAdminHovered,
    setIsAdminHovered,
    activeAdminTab,
    setActiveAdminTab,
    isSignUpOpen,
    setIsSignUpOpen,
    isInquiryOpen,
    setIsInquiryOpen,
    footerDocType,
    setFooterDocType,
    activePlayFilm,
    setActivePlayFilm,
    selectedDraftCategory,
    setSelectedDraftCategory,
    currentDraftIndex,
    setCurrentDraftIndex,
    isAutoRotationActive,
    setIsAutoRotationActive,
    cart,
    setCart,
    selectedPickupBranch,
    setSelectedPickupBranch,
    signatureItems,
    isOrderSuccessOpen,
    setIsOrderSuccessOpen,
    orderInfo,
    isMobileDevice,
    mockMobileFrame,
    setMockMobileFrame,
    isCurrentlyMobile,
    isFilmDirectLoad,
    filteredDrafts,
    handleUpdateDrafts,
    handlePrevDraft,
    handleNextDraft,
    handleIntroComplete,
    handleReplayIntro,
    handlePlaceOrder,
    navigateTo,
    navigateToSection
  };
}
