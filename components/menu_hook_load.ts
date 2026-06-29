import { useState, useEffect } from 'react';
import { MenuItem, HASTE_ITEMS } from './menu_page_main';
import { MENU_CATEGORIES } from '../src/menuData';
import { getDrinkSvg } from './menu_comp_drinksvg';

export function useMenuLoad() {
  const [categories, setCategories] = useState<{ id: string; name: string; desc?: string }[]>(MENU_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setIsLoading(true);
        
        // 1. Try unified bulk loading first
        try {
          const resBulk = await fetch('/api/menu-bulk');
          if (resBulk.ok) {
            const bulkData = await resBulk.json();
            if (bulkData && bulkData.success && Array.isArray(bulkData.categories) && Array.isArray(bulkData.items)) {
              const categoryOrder = ['AMERICANO', 'COFFEE_LATTE', 'ADE_ETC', 'MILK_LATTE', 'TEA_BASE'];
              const sorted = [...bulkData.categories].sort((a: any, b: any) => {
                const idxA = categoryOrder.indexOf(a.id);
                const idxB = categoryOrder.indexOf(b.id);
                if (idxA === -1 && idxB === -1) return 0;
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
              });
              setCategories(sorted);

              const mappedItems = bulkData.items.map((i: any) => {
                let price = 2500;
                if (i.category === 'AMERICANO') {
                  price = (i.nameKr || '').includes('샷추가') || (i.nameKr || '').includes('헤이즐넛') || (i.nameKr || '').includes('설탕') ? 2000 : 1500;
                } else if (i.category === 'COFFEE_LATTE') {
                  price = (i.nameKr || '').includes('바닐라') || (i.nameKr || '').includes('카라멜') || (i.nameKr || '').includes('모카') || (i.nameKr || '').includes('초코') || (i.nameKr || '').includes('민트') ? 3500 : 3000;
                } else if (i.category === 'MILK_LATTE') {
                  price = 3500;
                } else if (i.category === 'ADE_ETC') {
                  price = 3800;
                } else if (i.category === 'TEA_BASE') {
                  price = 3000;
                }
                return {
                  id: i.id,
                  name: i.name || '',
                  nameKr: i.nameKr,
                  category: i.category,
                  image: getDrinkSvg({ id: i.id, nameKr: i.nameKr, category: i.category, image: i.image }),
                  description: i.description || '',
                  acidity: i.acidity,
                  sweetness: i.sweetness,
                  body: i.body,
                  bitterness: i.bitterness,
                  price,
                  isSignature: i.isSignature !== undefined ? (i.isSignature === 1 || i.isSignature === true) : (i.is_signature === 1 || i.is_signature === true),
                  videoUrl: i.videoUrl || i.video_url || ''
                };
              });
              setMenuItems(mappedItems);
              setIsLoading(false);
              return;
            }
          }
        } catch (bulkErr) {
          console.warn('[Menu Init] Menu bulk loading failed, falling back:', bulkErr);
        }

        const resCat = await fetch('/api/menu-categories');
        const resItem = await fetch('/api/menu-items');
        if (resCat.ok && resItem.ok) {
          const catData = await resCat.json();
          const itemData = await resItem.json();
          if (catData.success && Array.isArray(catData.categories) && catData.categories.length > 0) {
            const categoryOrder = ['AMERICANO', 'COFFEE_LATTE', 'ADE_ETC', 'MILK_LATTE', 'TEA_BASE'];
            const sorted = [...catData.categories].sort((a: any, b: any) => {
              const idxA = categoryOrder.indexOf(a.id);
              const idxB = categoryOrder.indexOf(b.id);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            });
            setCategories(sorted);
          }
          if (itemData.success && Array.isArray(itemData.items) && itemData.items.length > 0) {
            const mappedItems = itemData.items.map((i: any) => {
              let price = 2500;
              if (i.category === 'AMERICANO') {
                price = (i.nameKr || '').includes('샷추가') || (i.nameKr || '').includes('헤이즐넛') || (i.nameKr || '').includes('설탕') ? 2000 : 1500;
              } else if (i.category === 'COFFEE_LATTE') {
                price = (i.nameKr || '').includes('바닐라') || (i.nameKr || '').includes('카라멜') || (i.nameKr || '').includes('모카') || (i.nameKr || '').includes('초코') || (i.nameKr || '').includes('민트') ? 3500 : 3000;
              } else if (i.category === 'MILK_LATTE') {
                price = 3500;
              } else if (i.category === 'ADE_ETC') {
                price = 3800;
              } else if (i.category === 'TEA_BASE') {
                price = 3000;
              }
              return {
                id: i.id,
                name: i.name || '',
                nameKr: i.nameKr,
                category: i.category,
                image: getDrinkSvg({ id: i.id, nameKr: i.nameKr, category: i.category, image: i.image }),
                description: i.description || '',
                acidity: i.acidity,
                sweetness: i.sweetness,
                body: i.body,
                bitterness: i.bitterness,
                price,
                isSignature: i.isSignature !== undefined ? (i.isSignature === 1 || i.isSignature === true) : (i.is_signature === 1 || i.is_signature === true),
                videoUrl: i.videoUrl || i.video_url || ''
              };
            });
            setMenuItems(mappedItems);
          }
        }
      } catch (e) {
        console.warn('Failed loading live categories and menus, using defaults:', e);
        setMenuItems(HASTE_ITEMS);
      } finally {
        setIsLoading(false);
      }
    };
    loadMenus();
  }, []);

  return { categories, setCategories, menuItems, setMenuItems, isLoading };
}
