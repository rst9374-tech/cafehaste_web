import {
  readBackupDrafts,
  readBackupMenuItems,
  readBackupCategories,
  readBackupInteriors
} from './cache-io';

/**
 * Local development utility to overlay locally edited simulated CUD state
 * on top of production DB SELECT query results.
 */
export function overrideQueryResultWithLocalBackup(sql: string, rows: any[]): any[] {
  if (!Array.isArray(rows)) return rows;
  const upperSql = sql.toUpperCase();

  // 0. web_home_main
  if (upperSql.includes('WEB_HOME_MAIN')) {
    try {
      const localDrafts = readBackupDrafts();
      const localMap = new Map(localDrafts.map((item: any) => [item.id, item]));
      const result: any[] = [];
      const visitedIds = new Set();
      for (const row of rows) {
        const local: any = localMap.get(row.id);
        visitedIds.add(row.id);
        if (local) {
          result.push({
            ...row,
            tag: local.tag !== undefined ? local.tag : row.tag,
            slogan: local.slogan !== undefined ? local.slogan : row.slogan,
            subtext: local.subtext !== undefined ? local.subtext : row.subtext,
            bg_image: local.bg_image !== undefined ? local.bg_image : (local.bgImage !== undefined ? local.bgImage : row.bg_image),
            bgImage: local.bg_image !== undefined ? local.bg_image : (local.bgImage !== undefined ? local.bgImage : row.bgImage),
            description: local.description !== undefined ? local.description : row.description,
            order_index: local.order_index !== undefined ? local.order_index : row.order_index,
          });
        } else {
          result.push(row);
        }
      }
      for (const local of localDrafts) {
        if (!visitedIds.has(local.id)) {
          result.push({
            id: local.id,
            tag: local.tag || '',
            slogan: local.slogan || '',
            subtext: local.subtext || '',
            bg_image: local.bg_image || local.bgImage || '',
            bgImage: local.bg_image || local.bgImage || '',
            description: local.description || '',
            order_index: local.order_index || local.id,
            orderIndex: local.order_index || local.id
          });
        }
      }
      return result;
    } catch (e) {
      console.warn('[Override Warn] Failed to override web_home_main:', e);
    }
  }
  
  if (rows.length === 0) return rows;
  
  // 1. web_menu_items
  if (upperSql.includes('WEB_MENU_ITEMS')) {
    try {
      const localItems = readBackupMenuItems();
      const localMap = new Map(localItems.map((item: any) => [item.id, item]));
      const result: any[] = [];
      for (const row of rows) {
        const local = localMap.get(row.id);
        if (local) {
          result.push({
            ...row,
            name_kr: local.nameKr !== undefined ? local.nameKr : (local.name_kr !== undefined ? local.name_kr : row.name_kr),
            nameKr: local.nameKr !== undefined ? local.nameKr : (local.name_kr !== undefined ? local.name_kr : row.nameKr),
            image: local.image !== undefined ? local.image : row.image,
            description: local.description !== undefined ? local.description : row.description,
            acidity: local.acidity !== undefined ? local.acidity : row.acidity,
            sweetness: local.sweetness !== undefined ? local.sweetness : row.sweetness,
            body: local.body !== undefined ? local.body : row.body,
            bitterness: local.bitterness !== undefined ? local.bitterness : row.bitterness,
            visible: local.visible !== undefined ? (local.visible ? 1 : 0) : row.visible,
            is_signature: local.isSignature !== undefined ? (local.isSignature ? 1 : 0) : (local.is_signature !== undefined ? (local.is_signature ? 1 : 0) : row.is_signature),
            isSignature: local.isSignature !== undefined ? (local.isSignature ? 1 : 0) : (local.is_signature !== undefined ? (local.is_signature ? 1 : 0) : row.isSignature),
          });
        }
      }
      return result;
    } catch (e) {
      console.warn('[Override Warn] Failed to override web_menu_items:', e);
    }
  }

  // 2. web_menu_categories
  if (upperSql.includes('WEB_MENU_CATEGORIES')) {
    try {
      const localCats = readBackupCategories();
      const localMap = new Map(localCats.map((cat: any) => [cat.id, cat]));
      const result: any[] = [];
      for (const row of rows) {
        const local = localMap.get(row.id);
        if (local) {
          result.push({
            ...row,
            name: local.name !== undefined ? local.name : row.name,
            desc: local.desc !== undefined ? local.desc : row.desc,
            visible: local.visible !== undefined ? (local.visible ? 1 : 0) : row.visible,
          });
        }
      }
      return result;
    } catch (e) {
      console.warn('[Override Warn] Failed to override web_menu_categories:', e);
    }
  }

  // 3. web_interior_layouts
  if (upperSql.includes('WEB_INTERIOR_LAYOUTS')) {
    try {
      const localInteriors = readBackupInteriors();
      const localMap = new Map(localInteriors.map((item: any) => [item.type_id || item.typeId, item]));
      const result: any[] = [];
      for (const row of rows) {
        const local: any = localMap.get(row.type_id || row.typeId);
        if (local) {
          result.push({
            ...row,
            title: local.title !== undefined ? local.title : row.title,
            subtitle: local.subtitle !== undefined ? local.subtitle : row.subtitle,
            desc: local.desc !== undefined ? local.desc : row.desc,
            tags: local.tags !== undefined ? local.tags : row.tags,
            highlights: local.highlights !== undefined ? local.highlights : row.highlights,
            gallery: local.gallery !== undefined ? local.gallery : row.gallery,
            mock_image: local.mock_image !== undefined ? local.mock_image : (local.mockImage !== undefined ? local.mockImage : row.mock_image),
            blueprint_image: local.blueprint_image !== undefined ? local.blueprint_image : (local.blueprintImage !== undefined ? local.blueprintImage : row.blueprint_image),
            visible: local.visible !== undefined ? (local.visible ? 1 : 0) : row.visible,
          });
        } else {
          result.push(row);
        }
      }
      return result;
    } catch (e) {
      console.warn('[Override Warn] Failed to override web_interior_layouts:', e);
    }
  }

  return rows;
}
