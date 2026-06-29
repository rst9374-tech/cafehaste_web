import { DRINK_SVG_ASSETS, getDrinkSvg, FALLBACK_DRINK_SVG } from './menu_comp_drinksvg';
import { COMPILED_MENU_ITEMS } from '../src/menuData';

// ================================================
// Menu Domain Types
// ================================================
export interface MenuItem {
  id: string;
  name: string;
  nameKr: string;
  category: string;
  image: string;
  description: string;
  acidity: number;
  sweetness: number;
  body: number;
  bitterness: number;
  price: number;
  isSignature?: boolean | number;
  videoUrl?: string;
  autoPlayVideo?: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  temperature: 'ICE' | 'HOT';
  shots: number;
  sweetness: 'LESS' | 'STANDARD' | 'EXTRA';
  milkType: 'REGULAR' | 'LOW_FAT' | 'OAT';
}

// ================================================
// Menu Data & Utilities
// ================================================
export const HASTE_ITEMS: MenuItem[] = COMPILED_MENU_ITEMS;

export const HASTE_FALLBACK_IMAGES: Record<string, string> = {
  AMERICANO: DRINK_SVG_ASSETS.AMERICANO,
  CAFE_LATTE: DRINK_SVG_ASSETS.CAFE_LATTE,
  VANILLA_LATTE: DRINK_SVG_ASSETS.VANILLA_LATTE,
  REAL_CHOCO: DRINK_SVG_ASSETS.REAL_CHOCO,
  PEACH_ICED_TEA: DRINK_SVG_ASSETS.PEACH_ICED_TEA,
  GREEN_GRAPE_ADE: DRINK_SVG_ASSETS.GREEN_GRAPE_ADE,
  GRAPEFRUIT_ADE: DRINK_SVG_ASSETS.GRAPEFRUIT_ADE,
  CAFE_MOCHA: DRINK_SVG_ASSETS.CAFE_LATTE,
  CARAMEL_MACCHIATO: DRINK_SVG_ASSETS.VANILLA_LATTE,
  DOLCE_LATTE: DRINK_SVG_ASSETS.VANILLA_LATTE,
  COLD_BREW_BLACK: DRINK_SVG_ASSETS.AMERICANO,
  COLD_BREW_LATTE: DRINK_SVG_ASSETS.CAFE_LATTE,
  GREEN_TEA_LATTE: DRINK_SVG_ASSETS.REAL_CHOCO,
  SWEET_POTATO_LATTE: DRINK_SVG_ASSETS.VANILLA_LATTE,
  TOFFEE_NUT_LATTE: DRINK_SVG_ASSETS.VANILLA_LATTE,
  HONEY_GRAPEFRUIT_TEA: DRINK_SVG_ASSETS.PEACH_ICED_TEA,
  SWEET_CITRON_TEA: DRINK_SVG_ASSETS.PEACH_ICED_TEA,
  CHAMOMILE_TEA: DRINK_SVG_ASSETS.PEACH_ICED_TEA,
  LEMON_ADE: DRINK_SVG_ASSETS.GREEN_GRAPE_ADE,
  PLAIN_YOGURT: DRINK_SVG_ASSETS.REAL_CHOCO,
  STRAWBERRY_SMOOTHIE: DRINK_SVG_ASSETS.GRAPEFRUIT_ADE,
  COOKIE_CREAM_FRAPPE: DRINK_SVG_ASSETS.REAL_CHOCO,
  JAVACHIP_FRAPPE: DRINK_SVG_ASSETS.REAL_CHOCO
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, itemId: string) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = FALLBACK_DRINK_SVG;
};

export const getDrinkExtractionTime = (category: string): number => {
  switch (category) {
    case 'AMERICANO': return 29;
    case 'COFFEE_LATTE': return 50;
    case 'MILK_LATTE': return 35;
    case 'ADE_ETC': return 15;
    case 'TEA_BASE': return 15;
    default: return 30;
  }
};

// Re-export getDrinkSvg for convenience
export { getDrinkSvg };
