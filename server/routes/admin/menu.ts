import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { 
  saveBase64ToFile, 
  writeBackupCategories, 
  writeBackupMenuItems 
} from '../../database';
import { withDbConnection, getLocalCheckpoints, saveLocalCheckpoint, deleteLocalCheckpoint } from '../../db/common-handler';
import { supabase } from '../../database';
import * as serverDefaults from '../../serverDefaults';

import { 
  saveBase64ToSpecificFile, 
  getSupabaseRedirectUrlLocal, 
  cleanDisplayName 
} from '../../utils/image-uploader';

const { DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS } = serverDefaults;

const router = Router();

// [HASTE 임시 제어 우회 수정 지점] 메뉴 데이터 변경 시 HASTE 로컬 제어 코어로의 실시간 양방향 동기화 격발
async function triggerMenuSyncToDevice(storeCode: string): Promise<void> {
  const targetStore = storeCode || 'store075575';
  try {
    let menus: any[] = [];
    let primaryToken = 'MTUyNjI0MDE2NTg2ODIxMjQ0NQ.GAfCVA.p5QmUbvqKZGMhZT4GSdsAX89OQBNIhAe9TIDEs';
    let secondaryToken = 'MTUyNjI4MjUwMzIzNzEzMjk2Mg.GBgDVB.q6RnVcvqKZGMhZT4GSdsAX89OQBNIhAe9TIDEs';

    await withDbConnection(async (conn) => {
      // 1. 전체 메뉴 목록 로드
      const [items]: any = await conn.query('SELECT * FROM web_menu_items ORDER BY order_index ASC, id ASC');
      // 2. 릴리 단말 데이터 대칭 포맷팅 (Field Name Symmetry 준수)
      menus = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        nameKr: item.name_kr,
        category: item.category,
        imageUrl: item.image_url,
        description: item.description,
        acidity: item.acidity,
        sweetness: item.sweetness,
        body: item.body,
        bitterness: item.bitterness,
        visible: item.visible === true || Number(item.visible) === 1,
        isSignature: item.is_signature === true || Number(item.is_signature) === 1,
        videoUrl: item.video_url,
        price: item.price || 0,
        steps: item.steps ? (typeof item.steps === 'string' ? JSON.parse(item.steps) : item.steps) : {}
      }));

      // 3. 디스코드 토큰 로드 (DB에서 공용으로 읽어옴)
      try {
        const [settingsRows]: any = await conn.query("SELECT setting_value FROM web_system_settings WHERE setting_key = 'discord_bot_token_primary' LIMIT 1");
        if (settingsRows && settingsRows.length > 0 && settingsRows[0].setting_value) {
          primaryToken = settingsRows[0].setting_value;
        }
      } catch (e) {}

      try {
        const [settingsRows]: any = await conn.query("SELECT setting_value FROM web_system_settings WHERE setting_key = 'discord_bot_token_secondary' LIMIT 1");
        if (settingsRows && settingsRows.length > 0 && settingsRows[0].setting_value) {
          secondaryToken = settingsRows[0].setting_value;
        }
      } catch (e) {}
    });

    if (menus.length === 0) return;

    const isLocalTestEnv = process.env.NODE_ENV !== 'production';
    const activeApiKey = targetStore === 'HASTE-HQS-ADMIN' ? 'store075575' : targetStore;

    if (isLocalTestEnv) {
      // [Case A] 로컬 개발 환경: 로컬 제어 코어(127.0.0.1:8080)로 즉시 100% 직송 (로컬 직접 직송 룰 준수)
      fetch('http://127.0.0.1:8080/v3/menu/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({ storeCode: targetStore, menus })
      }).catch((err: any) => {
        console.warn('[HASTE Sync Trigger Request Warn]', err.message);
      });
    } else {
      // [Case B] 실서버 운영 환경: 루프백 fetch 대신 직접 디스코드 1 ➔ 2차 자동 Failover 릴레이 채널 전송 대행 (본사 직접 노킹 금지 룰 준수!)
      (async () => {
        try {
          const originUrl = process.env.PUBLIC_ORIGIN_URL || 'https://cafehaste-web-3940176840.a.run.app';
          
          const sendToDiscord = async (token: string): Promise<boolean> => {
            try {
              const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                headers: { 'Authorization': `Bot ${token}` }
              });
              if (!guildsResponse.ok) return false;
              const guilds: any = await guildsResponse.json();
              if (guilds.length === 0) return false;
              const targetGuildId = guilds[0].id;

              const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${targetGuildId}/channels`, {
                headers: { 'Authorization': `Bot ${token}` }
              });
              const channels: any = await channelsResponse.json();
              const textChannel = channels.find((c: any) => c.type === 0);
              if (!textChannel) return false;

              // 독자 보안 시그니처 및 타임스탬프 계산
              const timestamp = String(Date.now());
              const salt = process.env.HASTE_SECRET_SALT || "HASTE_SECURE_TUNNEL_SALT_2026";
              const rawMsg = `${targetStore}:true:${timestamp}:${salt}`;
              const signature = crypto.createHash("sha256").update(rawMsg).digest("hex");

              const packetContent = JSON.stringify({
                route: '/v3/menu/sync',
                targetStore,
                originUrl,
                body: { storeCode: targetStore, menus },
                headers: {
                  "X-Haste-Tunnel-Signature": signature,
                  "X-Haste-Timestamp": timestamp
                }
              });

              const postResponse = await fetch(`https://discord.com/api/v10/channels/${textChannel.id}/messages`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bot ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: packetContent })
              });

              return postResponse.ok;
            } catch (err) {
              return false;
            }
          };

          let success = await sendToDiscord(primaryToken);
          if (!success) {
            console.warn(`⚠️ [Discord Menu Sync Primary Failed] Attempting failover to Secondary Channel...`);
            success = await sendToDiscord(secondaryToken);
          }

          if (success) {
            console.log(`[HASTE Sync Trigger] Successfully dispatched menu sync through Discord tunnel to store: ${targetStore}`);
          } else {
            console.warn(`❌ [HASTE Sync Trigger Failed] Failed to send menu sync through all Discord channels for store: ${targetStore}`);
          }
        } catch (err: any) {
          console.error('[Discord Sync Trigger Exec Error]', err.message);
        }
      })();
    }

    console.log(`[HASTE Sync Trigger] Dispatched menu sync sequence to store: ${targetStore}`);
  } catch (err: any) {
    console.error('❌ [HASTE Sync Trigger Error] Menu Sync failed:', err.message);
  }
}

// 6. Menu Categories Operations
router.post('/api/menu-categories', async (req, res) => {
  const { id, name, desc, visible } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, message: '카테고리 ID와 카테고리명은 필수 입력 사항입니다.' });
  }
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    
    await withDbConnection(async (conn) => {
      if (conn.isFallback) {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, desc, visible) VALUES (?, ?, ?, ?)',
          [id, name, desc || '', visibleVal]
        );
      } else {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, `desc`, visible) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), `desc` = VALUES(`desc`), visible = VALUES(visible)',
          [id, name, desc || '', visibleVal]
        );
      }
    });
    
    res.json({
      success: true,
      message: '카테고리 정보가 성공적으로 등록 되었습니다.',
      category: { id, name, desc: desc || '', visible: visibleVal }
    });
  } catch (err: any) {
    console.error('[API error] Upsert menu-category failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/menu-categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, desc, visible } = req.body;
  try {
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_menu_categories SET name = ?, `desc` = ?, visible = ? WHERE id = ?',
        [name, desc || '', visibleVal, id]
      );
    });
    res.json({
      success: true,
      message: '카테고리가 수정되었습니다.',
      category: { id, name, desc, visible: visibleVal }
    });
  } catch (err: any) {
    console.error('[API error] Update menu-category failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/menu-categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_categories WHERE id = ?', [id]);
    });
    res.json({ success: true, message: '카테고리가 삭제되었습니다.', deletedId: id });
  } catch (err: any) {
    console.error('[API error] Delete menu-category failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu-categories/reset', async (req, res) => {
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_categories');
      for (const cat of DEFAULT_CATEGORIES) {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, `desc`, visible) VALUES (?, ?, ?, 1)',
          [cat.id, cat.name, cat.desc]
        );
      }
    });
    res.json({ success: true, message: '카테고리 목록이 기본값으로 초기화되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reset menu-categories failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// Get Option Mappings from Database
router.get('/api/menu-items/option-mappings', async (req, res) => {
  try {
    let rows: any[] = [];
    await withDbConnection(async (conn) => {
      const [mappingRows] = await conn.query('SELECT id, base_name as baseName, option_name as optionName, recipe_code as recipeCode, actual_name as actualName FROM web_option_mappings ORDER BY id ASC');
      rows = mappingRows as any[];
    });
    res.json({ success: true, mappings: rows });
  } catch (err: any) {
    console.error('[API error] Get Option Mappings failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Google Sheet Option Mappings Sync
router.post('/api/menu-items/sync-option-mappings', async (req, res) => {
  const { optionMappings } = req.body;
  if (!Array.isArray(optionMappings)) {
    return res.status(400).json({ success: false, message: 'optionMappings가 배열이 아닙니다.' });
  }

  try {
    let syncedCount = 0;
    await withDbConnection(async (conn) => {
      // Clear all existing mappings to do a clean overwrite
      await conn.query('DELETE FROM web_option_mappings');
      
      for (const m of optionMappings) {
        const { baseName, optionName, recipeCode, actualName } = m;
        if (!baseName || !optionName || !recipeCode) continue;
        
        await conn.query(
          'INSERT INTO web_option_mappings (base_name, option_name, recipe_code, actual_name) VALUES (?, ?, ?, ?)',
          [baseName.trim(), optionName.trim(), recipeCode.trim(), (actualName || '').trim()]
        );
        syncedCount++;
      }
    });

    res.json({
      success: true,
      message: `옵션 매핑 동기화 완료! (총 ${syncedCount}건 등록)`,
      syncedCount
    });
  } catch (err: any) {
    console.error('[API error] Option Mappings Sync failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Menu Items Operations
router.post('/api/menu-items', async (req, res) => {
  const { id, name, nameKr, category, image, description, acidity, sweetness, body, bitterness, visible, isSignature, videoUrl } = req.body;
  if (!nameKr) {
    return res.status(400).json({ success: false, message: '한글 메뉴명은 필수 입력 사항입니다.' });
  }
  try {
    const { productCode, product_code } = req.body;
    const codeVal = productCode || product_code;
    const cleanImage = saveBase64ToSpecificFile(image || '', nameKr, codeVal, category);
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    const isSignatureVal = (isSignature === true || isSignature === 1);
    const acidityVal = parseInt(acidity || 0);
    const sweetnessVal = parseInt(sweetness || 0);
    const bodyVal = parseInt(body || 0);
    const bitternessVal = parseInt(bitterness || 0);
    const videoUrlVal = videoUrl || '';

    let finalId = id || '';
    let exists = false;

    await withDbConnection(async (conn) => {
      if (finalId) {
        const [checkRows]: any = await conn.query('SELECT COUNT(*) as count FROM web_menu_items WHERE id = ?', [finalId]);
        exists = Number(checkRows[0]?.count ?? checkRows[0]?.COUNT ?? 0) > 0;
      }

      if (exists) {
        // 존재하면 UPDATE 실행
        await conn.query(
          'UPDATE web_menu_items SET name = ?, name_kr = ?, category = ?, image_url = ?, description = ?, acidity = ?, sweetness = ?, body = ?, bitterness = ?, visible = ?, is_signature = ?, video_url = ? WHERE id = ?',
          [name || '', nameKr, category || 'AMERICANO', cleanImage, description || '', acidityVal, sweetnessVal, bodyVal, bitternessVal, visibleVal, isSignatureVal, videoUrlVal, finalId]
        );
      } else {
        // 존재하지 않으면 새 정수 ID 연산 및 INSERT 실행
        if (!finalId) {
          let categoryMin = 1000;
          if (category === 'AMERICANO') categoryMin = 1000;
          else if (category === 'COFFEE_LATTE') categoryMin = 2000;
          else if (category === 'MILK_LATTE') categoryMin = 3000;
          else if (category === 'ADE_ETC' || category === 'ADE') categoryMin = 4000;
          else if (category === 'TEA_BASE') categoryMin = 5000;

          const [maxRows]: any = await conn.query(
            "SELECT MAX(CAST(id AS INTEGER)) as maxId FROM web_menu_items WHERE id ~ '^[0-9]+$' AND CAST(id AS INTEGER) >= ? AND CAST(id AS INTEGER) < ?",
            [categoryMin + 1, categoryMin + 1000]
          );
          const maxVal = (maxRows && maxRows[0] && maxRows[0].maxId) ? maxRows[0].maxId : categoryMin;
          finalId = String(maxVal + 1);
        }

        await conn.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image_url, description, acidity, sweetness, body, bitterness, visible, is_signature, video_url, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [finalId, name || '', nameKr, category || 'AMERICANO', cleanImage, description || '', acidityVal, sweetnessVal, bodyVal, bitternessVal, visibleVal, isSignatureVal, videoUrlVal, 0]
        );
      }
    });

    // [HASTE 임시 제어 우회 수정 지점] HASTE 로컬 제어 코어로 양방향 실시간 동기화 격발
    triggerMenuSyncToDevice(req.body.storeCode);

    res.json({
      success: true,
      message: '메뉴 항목이 등록/수정되었습니다.',
      item: { id: finalId, name, nameKr, category, image: cleanImage, description, acidity: acidityVal, sweetness: sweetnessVal, body: bodyVal, bitterness: bitternessVal, visible: visibleVal, isSignature: isSignatureVal, videoUrl: videoUrlVal }
    });
  } catch (err: any) {
    console.error('[API error] Upsert menu-item failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nameKr, category, image, description, acidity, sweetness, body, bitterness, visible, isSignature, videoUrl, productCode, product_code } = req.body;
  try {
    const codeVal = productCode || product_code;
    const cleanImage = saveBase64ToSpecificFile(image || '', nameKr, codeVal, category);
    const visibleVal = (visible === undefined || visible === true || visible === 1);
    const isSignatureVal = (isSignature === true || isSignature === 1);
    const acidityVal = parseInt(acidity || 0);
    const sweetnessVal = parseInt(sweetness || 0);
    const bodyVal = parseInt(body || 0);
    const bitternessVal = parseInt(bitterness || 0);

    await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_menu_items SET name = ?, name_kr = ?, category = ?, image_url = ?, description = ?, acidity = ?, sweetness = ?, body = ?, bitterness = ?, visible = ?, is_signature = ?, video_url = ? WHERE id = ?',
        [name || '', nameKr, category, cleanImage, description || '', acidityVal, sweetnessVal, bodyVal, bitternessVal, visibleVal, isSignatureVal, videoUrl || '', id]
      );
    });

    // [HASTE 임시 제어 우회 수정 지점] HASTE 로컬 제어 코어로 양방향 실시간 동기화 격발
    triggerMenuSyncToDevice(req.body.storeCode);

    res.json({
      success: true,
      message: '메뉴 항목이 수정되었습니다.',
      item: { id, name, nameKr, category, image: cleanImage, description, acidity: acidityVal, sweetness: sweetnessVal, body: bodyVal, bitterness: bitternessVal, visible: visibleVal, isSignature: isSignatureVal, videoUrl: videoUrl || '' }
    });
  } catch (err: any) {
    console.error('[API error] Update menu-item failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_items WHERE id = ?', [id]);
    });
    
    // [HASTE 임시 제어 우회 수정 지점] HASTE 로컬 제어 코어로 양방향 실시간 동기화 격발
    triggerMenuSyncToDevice(req.body.storeCode || req.query.storeCode);

    res.json({ success: true, message: '메뉴가 삭제되었습니다.', deletedId: id });
  } catch (err: any) {
    console.error('[API error] Delete menu-item failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reorder Menu Items
router.post('/api/menu-items/reorder', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: '올바른 메뉴 ID 배열이 전달되지 않았습니다.' });
  }
  try {
    await withDbConnection(async (conn) => {
      for (let i = 0; i < ids.length; i++) {
        await conn.query(
          'UPDATE web_menu_items SET order_index = ? WHERE id = ?',
          [i + 1, ids[i]]
        );
      }
      
      const [items]: any = await conn.query('SELECT * FROM web_menu_items ORDER BY order_index ASC, id ASC');
      const mappedItems = items.map((r: any) => ({
        id: r.id,
        name: r.name,
        nameKr: r.name_kr !== undefined ? r.name_kr : r.nameKr,
        category: r.category,
        image: r.image || '',
        description: r.description || '',
        acidity: r.acidity || 0,
        sweetness: r.sweetness || 0,
        body: r.body || 0,
        bitterness: r.bitterness || 0,
        visible: r.visible !== 0,
        isSignature: r.is_signature !== undefined ? (r.is_signature !== 0 && r.is_signature !== false) : (r.isSignature !== undefined && r.isSignature !== false)
      }));
      writeBackupMenuItems(mappedItems);
    });

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
    
    // [HASTE 임시 제어 우회 수정 지점] HASTE 로컬 제어 코어로 양방향 실시간 동기화 격발
    triggerMenuSyncToDevice(req.body.storeCode);

    res.json({ success: true, message: '메뉴 순서가 성공적으로 정렬되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reorder menu-items failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Edit Images
router.post('/api/menu-items/bulk-image', async (req, res) => {
  const { ids, image } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || image === undefined) {
    return res.status(400).json({ success: false, message: '올바른 메뉴 ID 배열과 이미지 정보가 전달되지 않았습니다.' });
  }
  try {
    const cleanImage = saveBase64ToFile(image || '', 'menu_item');
    await withDbConnection(async (conn) => {
      const placeholders = ids.map(() => '?').join(',');
      await conn.query(
        `UPDATE web_menu_items SET image = ? WHERE id IN (${placeholders})`,
        [cleanImage, ...ids]
      );
    });
    res.json({
      success: true,
      message: `선택한 ${ids.length}개 메뉴 품목의 이미지가 성공적으로 일괄 수정되었습니다.`,
      image: cleanImage
    });
  } catch (err: any) {
    console.error('[API error] Bulk update menu-item images failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Edit Signatures
router.post('/api/menu-items/bulk-signature', async (req, res) => {
  const { ids, isSignature } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || isSignature === undefined) {
    return res.status(400).json({ success: false, message: '올바른 메뉴 ID 배열과 시그니처 값이 전달되지 않았습니다.' });
  }
  try {
    const isSignatureVal = (isSignature === true || isSignature === 1);
    await withDbConnection(async (conn) => {
      const placeholders = ids.map(() => '?').join(',');
      await conn.query(
        `UPDATE web_menu_items SET is_signature = ? WHERE id IN (${placeholders})`,
        [isSignatureVal, ...ids]
      );
      
      // Update local backups
      const [items]: any = await conn.query('SELECT * FROM web_menu_items ORDER BY order_index ASC, id ASC');
      const mappedItems = items.map((r: any) => ({
        id: r.id,
        name: r.name,
        nameKr: r.name_kr !== undefined ? r.name_kr : r.nameKr,
        category: r.category,
        image: r.image || '',
        description: r.description || '',
        acidity: r.acidity || 0,
        sweetness: r.sweetness || 0,
        body: r.body || 0,
        bitterness: r.bitterness || 0,
        visible: r.visible !== 0,
        isSignature: r.is_signature !== undefined ? (r.is_signature !== 0 && r.is_signature !== false) : (r.isSignature !== undefined && r.isSignature !== false)
      }));
      writeBackupMenuItems(mappedItems);
    });

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    res.json({
      success: true,
      message: `선택한 ${ids.length}개 메뉴 품목의 시그니처 설정을 성공적으로 일괄 변경했습니다.`
    });
  } catch (err: any) {
    console.error('[API error] Bulk update menu-item signatures failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu-items/reset', async (req, res) => {
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_items');
      for (const item of DEFAULT_MENU_ITEMS) {
        const isSig = (item.isSignature || item.is_signature || ['AME_HOT_LIGHT', 'AME_ICED_LIGHT', 'AME_HOT', 'AME_ICED'].includes(item.id)) ? 1 : 0;
        await conn.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
          [
            item.id,
            item.name || item.nameEng || '',
            item.name_kr || item.nameKr || '',
            item.category,
            item.image || '',
            item.description || '',
            item.acidity || 0,
            item.sweetness || 0,
            item.body || 0,
            item.bitterness || 0,
            isSig
          ]
        );
      }
    });
    
    // [HASTE 임시 제어 우회 수정 지점] HASTE 로컬 제어 코어로 양방향 실시간 동기화 격발
    triggerMenuSyncToDevice(req.body.storeCode);

    res.json({ success: true, message: '메뉴 목록이 기본값으로 초기화되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reset menu-items failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Menu checkpoints
router.get('/api/menu/checkpoints', async (req, res) => {
  try {
    const list = getLocalCheckpoints('haste_menu_checkpoints.json');
    res.json({ success: true, checkpoints: list });
  } catch (err: any) {
    console.error('[API error] Get menu checkpoints failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu/save-checkpoint', async (req, res) => {
  try {
    const { cats, items } = await withDbConnection(async (conn) => {
      const [cats]: any = await conn.query('SELECT * FROM web_menu_categories ORDER BY id ASC');
      const [items]: any = await conn.query('SELECT * FROM web_menu_items ORDER BY category ASC, id ASC');
      return { cats, items };
    });

    const list = await saveLocalCheckpoint(
      'haste_menu_checkpoints.json',
      'cp_menu',
      { categoriesCount: cats.length, itemsCount: items.length },
      { categories: cats, items: items }
    );

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '현재 활성화된 메뉴판 구성(카테고리&음료)이 백업되었습니다! (최대 3개 유지)' 
    });
  } catch (err: any) {
    console.error('[API error] Save menu checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu/restore-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const MENU_CHECKPOINTS_FILE = path.join(process.cwd(), 'haste_menu_checkpoints.json');
    if (!fs.existsSync(MENU_CHECKPOINTS_FILE)) {
      return res.status(404).json({ success: false, error: '메뉴 백업 파일이 존재하지 않습니다.' });
    }
    const list = getLocalCheckpoints('haste_menu_checkpoints.json');
    const cp = list.find((item: any) => item.id === checkpointId);
    if (!cp) {
      return res.status(404).json({ success: false, error: '선택하신 백업 시점을 찾을 수 없습니다.' });
    }

    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_menu_categories');
      for (const cat of cp.categories) {
        await conn.query(
          'INSERT INTO web_menu_categories (id, name, `desc`, visible) VALUES (?, ?, ?, ?)',
          [cat.id, cat.name, cat.desc || '', cat.visible]
        );
      }

      await conn.query('DELETE FROM web_menu_items');
      for (const item of cp.items) {
        await conn.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            item.id, item.name || '', item.name_kr || item.nameKr || '', item.category || 'AMERICANO', 
            item.image || '', item.description || '', item.acidity || 0, item.sweetness || 0, 
            item.body || 0, item.bitterness || 0, item.visible !== undefined && item.visible !== false ? 1 : 0, 
            item.is_signature !== undefined ? (item.is_signature ? 1 : 0) : (item.isSignature ? 1 : 0)
          ]
        );
      }
    });
    
    const mappedCats = cp.categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      desc: c.desc || '',
      visible: c.visible !== 0
    }));

    const mappedItems = cp.items.map((r: any) => ({
      id: r.id,
      name: r.name,
      nameKr: r.name_kr || r.nameKr,
      category: r.category,
      image: r.image || '',
      description: r.description || '',
      acidity: r.acidity || 0,
      sweetness: r.sweetness || 0,
      body: r.body || 0,
      bitterness: r.bitterness || 0,
      visible: r.visible !== 0,
      isSignature: r.is_signature !== undefined ? (r.is_signature !== 0 && r.is_signature !== false) : (r.isSignature !== undefined && r.isSignature !== false)
    }));

    writeBackupCategories(mappedCats);
    writeBackupMenuItems(mappedItems);
    
    // [HASTE 임시 제어 우회 수정 지점] HASTE 로컬 제어 코어로 양방향 실시간 동기화 격발
    triggerMenuSyncToDevice(req.body.storeCode);

    res.json({ 
      success: true, 
      message: '선택한 백업 시점의 메뉴/카테고리 구성으로 복구가 완료되었습니다.',
      categories: mappedCats,
      items: mappedItems
    });
  } catch (err: any) {
    console.error('[API error] Restore menu checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/menu/delete-checkpoint', async (req, res) => {
  const { checkpointId } = req.body || {};
  if (!checkpointId) {
    return res.status(400).json({ success: false, error: 'checkpointId가 지정되지 않았습니다.' });
  }
  try {
    const list = await deleteLocalCheckpoint('haste_menu_checkpoints.json', checkpointId);

    res.json({ 
      success: true, 
      checkpoints: list, 
      message: '선택하신 복원용 메뉴 체크포인트가 성공적으로 파기되었습니다.' 
    });
  } catch (err: any) {
    console.error('[API error] Delete menu checkpoint failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
