import {
  readBackupCategories,
  writeBackupCategories,
  readBackupMenuItems,
  writeBackupMenuItems
} from '../cache-io';

export function handleMenuSim(formattedSql: string, params: any[] = []): { handled: boolean; result?: any } {
  // 1. Menu Categories
  if (formattedSql.includes('FROM HASTE_MENU_CATEGORIES') || formattedSql.includes('HASTE_MENU_CATEGORIES')) {
    if (formattedSql.startsWith('SELECT COUNT(*)')) {
      const categories = readBackupCategories();
      return { handled: true, result: [[{ count: categories.length }]] };
    }
    if (formattedSql.startsWith('SELECT *')) {
      return { handled: true, result: [readBackupCategories()] };
    }
    if (formattedSql.startsWith('INSERT INTO') && formattedSql.includes('HASTE_MENU_CATEGORIES')) {
      const categories = readBackupCategories();
      const [id, name, desc] = params;
      const newCat = { id, name, desc, visible: 1 };
      categories.push(newCat);
      writeBackupCategories(categories);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE FROM HASTE_MENU_CATEGORIES')) {
      writeBackupCategories([]);
      return { handled: true, result: [{ affectedRows: 5 }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_MENU_CATEGORIES SET VISIBLE')) {
      const categories = readBackupCategories();
      const [visible, id] = params;
      const updated = categories.map((cat: any) => 
        cat.id === id ? { ...cat, visible: visible === 1 ? 1 : 0 } : cat
      );
      writeBackupCategories(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE') && formattedSql.includes('HASTE_MENU_CATEGORIES')) {
      const categories = readBackupCategories();
      const [name, desc, id] = params;
      const updated = categories.map((cat: any) => 
        cat.id === id ? { ...cat, name: name || cat.name, desc: desc || cat.desc } : cat
      );
      writeBackupCategories(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 2. Menu Items
  if (formattedSql.includes('FROM HASTE_MENU_ITEMS') || formattedSql.includes('HASTE_MENU_ITEMS')) {
    if (formattedSql.startsWith('SELECT *')) {
      return { handled: true, result: [readBackupMenuItems()] };
    }
    if (formattedSql.startsWith('INSERT INTO') && formattedSql.includes('HASTE_MENU_ITEMS')) {
      const items = readBackupMenuItems();
      const [id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness] = params;
      
      let visible = 1;
      let is_signature = 0;
      let video_url = '';
      if (params.length === 12) {
        visible = params[10] === 1 || params[10] === true ? 1 : 0;
        is_signature = params[11] === 1 || params[11] === true ? 1 : 0;
      } else if (params.length === 13) {
        visible = params[10] === 1 || params[10] === true ? 1 : 0;
        is_signature = params[11] === 1 || params[11] === true ? 1 : 0;
        video_url = params[12] || '';
      } else {
        is_signature = params[10] === 1 || params[10] === true ? 1 : 0;
      }

      const existingIdx = items.findIndex((item: any) => item.id === id);
      const newItem = {
        id,
        name: name || '',
        name_kr: name_kr || '',
        nameKr: name_kr || '',
        category: category || 'AMERICANO',
        image: image || '',
        description: description || '',
        acidity: parseInt(acidity || 0),
        sweetness: parseInt(sweetness || 0),
        body: parseInt(body || 0),
        bitterness: parseInt(bitterness || 0),
        price: 1500,
        visible: visible,
        isSignature: is_signature === 1 ? 1 : 0,
        is_signature: is_signature === 1 ? 1 : 0,
        videoUrl: video_url,
        video_url: video_url
      };
      
      if (existingIdx > -1) {
        items[existingIdx] = { ...items[existingIdx], ...newItem };
      } else {
        items.push(newItem);
      }
      
      writeBackupMenuItems(items);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE FROM HASTE_MENU_ITEMS')) {
      writeBackupMenuItems([]);
      return { handled: true, result: [{ affectedRows: 100 }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_MENU_ITEMS SET VISIBLE')) {
      const items = readBackupMenuItems();
      const [visible, id] = params;
      const updated = items.map((item: any) => 
        item.id === id ? { ...item, visible: visible === 1 ? 1 : 0 } : item
      );
      writeBackupMenuItems(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_MENU_ITEMS SET IS_SIGNATURE')) {
      const items = readBackupMenuItems();
      const [is_sig, id] = params;
      const updated = items.map((item: any) => 
        item.id === id ? { ...item, isSignature: is_sig === 1 ? 1 : 0, is_signature: is_sig === 1 ? 1 : 0 } : item
      );
      writeBackupMenuItems(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE') && formattedSql.includes('HASTE_MENU_ITEMS')) {
      const items = readBackupMenuItems();
      let name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature, video_url, id;
      if (params.length === 13) {
        [name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature, video_url, id] = params;
      } else {
        [name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature, id] = params;
      }
      const updated = items.map((item: any) => {
        if (item.id === id) {
          return {
            ...item,
            name: name || item.name,
            name_kr: name_kr || item.name_kr,
            nameKr: name_kr || item.nameKr,
            category: category || item.category,
            image: image || item.image,
            description: description || item.description,
            acidity: acidity !== undefined ? parseInt(acidity) : item.acidity,
            sweetness: sweetness !== undefined ? parseInt(sweetness) : item.sweetness,
            body: body !== undefined ? parseInt(body) : item.body,
            bitterness: bitterness !== undefined ? parseInt(bitterness) : item.bitterness,
            visible: visible !== undefined ? (visible === 1 || visible === true ? 1 : 0) : item.visible,
            isSignature: is_signature !== undefined ? (is_signature === 1 || is_signature === true ? 1 : 0) : item.isSignature,
            is_signature: is_signature !== undefined ? (is_signature === 1 || is_signature === true ? 1 : 0) : item.is_signature,
            videoUrl: video_url !== undefined ? video_url : item.videoUrl,
            video_url: video_url !== undefined ? video_url : item.video_url
          };
        }
        return item;
      });
      writeBackupMenuItems(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE FROM')) {
      if (!formattedSql.includes('WHERE')) {
        writeBackupMenuItems([]);
        return { handled: true, result: [{ affectedRows: 100 }] };
      }
      const items = readBackupMenuItems();
      const [id] = params;
      const filtered = items.filter((item: any) => item.id !== id);
      writeBackupMenuItems(filtered);
      return { handled: true, result: [{ affectedRows: 100 }] };
    }
  }

  return { handled: false };
}
