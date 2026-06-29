// Cafe-Haste Simplified Drink Image & Minimalist Placeholder Manager.
// All complex programmatic vector cup drawings have been removed to prioritize real uploaded images.

const escapeUnicodeBase64 = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return "";
  }
};

export interface DrinkAttributes {
  id: string;
  nameKr: string;
  category: string;
  image?: string;
  is_signature?: number | boolean;
  isSignature?: number | boolean;
}

// Minimal helper to determine if a drink is hot or iced based on its name
export function getDrinkProfile(item: DrinkAttributes) {
  const name = (item.nameKr || '').toUpperCase();
  const isHot = name.includes('HOT') || name.includes('온수');
  return { isHot, theme: 'neutral' };
}

// Clean minimalist line-art outline SVG to use as a fallback placeholder when no real photo is uploaded
const MINIMAL_CUP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#F5F5F4" />
  <g transform="translate(10, 10)" stroke="#A8A29E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- Minimalist warm outline cup -->
    <path d="M35 38h30v30c0 8.28-6.72 15-15 15s-15-6.72-15-15V38z" />
    <path d="M65 44h5a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6h-5" />
    <!-- Subtle aroma curves -->
    <path d="M43 22c1-2.5 3-2.5 4 0s3 2.5 4 0" stroke-width="1.5" opacity="0.6" />
    <path d="M51 22c1-2.5 3-2.5 4 0s3 2.5 4 0" stroke-width="1.5" opacity="0.6" />
  </g>
</svg>
`;

// Export raw base64 data-url to use inside <img onError={...} /> in React UI for self-healing
export const FALLBACK_DRINK_SVG = `data:image/svg+xml;base64,${escapeUnicodeBase64(MINIMAL_CUP_SVG)}`;

export function getDrinkSvg(item: DrinkAttributes, overrideTemp?: 'ICE' | 'HOT'): string {
  // 1. If an uploaded image (real photo) exists, return it immediately
  if (item && item.image && typeof item.image === 'string' && item.image.trim() !== '') {
    const trimmed = item.image.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }

  // 2. Fallback to clean minimalist outline SVG placeholder
  return FALLBACK_DRINK_SVG;
}

// Minimal mapping for backward-compatibility
export const DRINK_SVG_ASSETS: Record<string, string> = {
  AMERICANO: getDrinkSvg({ id: "AMERICANO", nameKr: "아메리카노", category: "AMERICANO" }),
  CAFE_LATTE: getDrinkSvg({ id: "CAFE_LATTE", nameKr: "카페라떼", category: "COFFEE_LATTE" }),
  VANILLA_LATTE: getDrinkSvg({ id: "VANILLA_LATTE", nameKr: "바닐라라떼", category: "COFFEE_LATTE" }),
  REAL_CHOCO: getDrinkSvg({ id: "REAL_CHOCO", nameKr: "초코라떼", category: "MILK_LATTE" }),
  PEACH_ICED_TEA: getDrinkSvg({ id: "PEACH_ICED_TEA", nameKr: "복숭아티", category: "TEA_BASE" }),
  GREEN_GRAPE_ADE: getDrinkSvg({ id: "GREEN_GRAPE_ADE", nameKr: "청포도에이드", category: "ADE_ETC" }),
  GRAPEFRUIT_ADE: getDrinkSvg({ id: "GRAPEFRUIT_ADE", nameKr: "자몽에이드", category: "ADE_ETC" })
};
