import path from 'path';
import fs from 'fs';
import * as serverDefaults from '../../serverDefaults';

const DEFAULT_LICENSES = serverDefaults.DEFAULT_LICENSES;
const DEFAULT_CATEGORIES = serverDefaults.DEFAULT_CATEGORIES;
const DEFAULT_MENU_ITEMS = serverDefaults.DEFAULT_MENU_ITEMS;
const DEFAULT_FILMS = serverDefaults.DEFAULT_FILMS;
const DEFAULT_DRAFTS = serverDefaults.DEFAULT_DRAFTS;
const DEFAULT_INTERIORS = serverDefaults.DEFAULT_INTERIORS;
const DEFAULT_SOUNDS = (serverDefaults as any).DEFAULT_SOUNDS || [];

/**
 * Perform safe automatic schema-level migration (RENAME existing tables from haste_ to web_)
 */
export async function runTableRenames(connection: any, database: string) {
  const renamePairs = [
    { old: 'haste_admins', new: 'web_admin_accounts' },
    { old: 'haste_attachments', new: 'web_board_attachments' },
    { old: 'haste_comments', new: 'web_board_comments' },
    { old: 'haste_consultations', new: 'web_membership_consultations' },
    { old: 'haste_films', new: 'web_brand_films' },
    { old: 'haste_hero_drafts', new: 'web_home_main' },
    { old: 'haste_interiors', new: 'web_interior_layouts' },
    { old: 'haste_licenses', new: 'web_store_licenses' },
    { old: 'haste_members', new: 'web_membership_users' },
    { old: 'haste_menu_categories', new: 'web_menu_categories' },
    { old: 'haste_menu_items', new: 'web_menu_items' },
    { old: 'haste_posts', new: 'web_board_posts' }
  ];

  for (const pair of renamePairs) {
    try {
      // Check if old table exists in database metadata
      let hasOld = false;
      try {
        const [oldExists]: any = await connection.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = ?
        `, [pair.old]);
        hasOld = (oldExists[0]?.count > 0 || oldExists[0]?.COUNT > 0);
      } catch (_) {
        // Fallback for different dialects if direct inquiry fails
        hasOld = true;
      }

      let hasNew = false;
      try {
        const [newExists]: any = await connection.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = ?
        `, [pair.new]);
        hasNew = (newExists[0]?.count > 0 || newExists[0]?.COUNT > 0);
      } catch (_) {}

      if (hasOld && !hasNew) {
        console.log(`[DB Migration] Found legacy table "${pair.old}". Renaming to "${pair.new}"...`);
        await connection.query(`ALTER TABLE ${pair.old} RENAME TO ${pair.new}`);
        console.log(`[DB Migration Success] Renamed legacy table "${pair.old}" to "${pair.new}".`);
      }
    } catch (migErr: any) {
      // If table doesn't exist, ignore and proceed safely
      console.warn(`[DB Migration Notice] Skipping rename for ${pair.old}:`, migErr.message);
    }
  }
}

/**
 * Seed initial datasets into web_ tables if they are fresh or empty
 */
export async function seedInitialData(connection: any) {
  // Intercept and bypass all board posts insert calls to prevent local static seeding
  const originalQuery = connection.query;
  connection.query = async function (sql: string, params?: any[]) {
    if (typeof sql === 'string' && sql.toUpperCase().includes('INSERT INTO WEB_BOARD_POSTS')) {
      return [[]];
    }
    return originalQuery.apply(this, arguments);
  };

  // 1. Seed licenses
  try {
    const [licenseCountRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_store_licenses');
    if (Number(licenseCountRows[0]?.count ?? licenseCountRows[0]?.COUNT ?? 0) === 0) {
      for (const cp of DEFAULT_LICENSES) {
        await connection.query(
          'INSERT INTO web_store_licenses (store_name, store_id, license_start_date, license_end_date, is_approved, store_grade) VALUES (?, ?, ?, ?, ?, ?)',
          [cp.storeName, cp.storeId, cp.licenseStartDate, cp.licenseEndDate, !!cp.isApproved, cp.storeGrade]
        );
      }
      console.log('[DB Seeding] Seeded initial licenses.');
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Licenses:', e.message);
  }

  // 2. Admin Seeding
  try {
    const [adminRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_admin_accounts');
    if (Number(adminRows[0]?.count ?? adminRows[0]?.COUNT ?? 0) === 0) {
      await connection.query('INSERT INTO web_admin_accounts (username, password) VALUES (?, ?)', ['admin', 'admin8113']);
      console.log('[DB Seeding] Default administrator account seeded.');
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Admin accounts:', e.message);
  }

  // 3. Draft Seeding (Home Main) - Seed or soft-patch drafts using local_hero_drafts.json text (keeping images intact)
  try {
    const [countRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_home_main');
    const count = Number(countRows[0]?.count ?? countRows[0]?.COUNT ?? 0);
    
    const localDraftsFile = path.join(process.cwd(), 'local_hero_drafts.json');
    let localDrafts: any[] = [];
    if (fs.existsSync(localDraftsFile)) {
      try {
        localDrafts = JSON.parse(fs.readFileSync(localDraftsFile, 'utf-8'));
      } catch (err) {
        console.warn('[DB Seeding Warn] Failed to parse local_hero_drafts.json:', err);
      }
    }

    const draftsToUse = localDrafts.length > 0 ? localDrafts : DEFAULT_DRAFTS.slice(0, 10);

    if (count === 0) {
      console.log('[DB Seeding] web_home_main is empty. Seeding drafts from local_hero_drafts.json...');
      for (const draft of draftsToUse) {
        await connection.query(
          'INSERT INTO web_home_main (id, tag, slogan, subtext, bg_image, description, default_tag, default_slogan, default_subtext, default_bg_image, default_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [draft.id, draft.tag, draft.slogan, draft.subtext, draft.bg_image, draft.description, draft.tag, draft.slogan, draft.subtext, draft.bg_image, draft.description]
        );
      }
      console.log(`[DB Seeding Success] Seeded ${draftsToUse.length} drafts to web_home_main.`);
    } else {
      console.log('[DB Seeding] web_home_main already has data. Performing soft-patching for texts (keeping images intact)...');
      for (const draft of draftsToUse) {
        // bg_image is omitted to strictly preserve existing images
        await connection.query(
          'UPDATE web_home_main SET tag = ?, slogan = ?, subtext = ?, description = ? WHERE id = ?',
          [draft.tag, draft.slogan, draft.subtext, draft.description, draft.id]
        );
      }
      console.log('[DB Seeding Success] Soft-patched text contents (including description) for home main drafts.');
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Home Main drafts:', e.message);
  }

  // 4. Interiors Layouts
  try {
    const [interiorRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_interior_layouts');
    if (Number(interiorRows[0]?.count ?? interiorRows[0]?.COUNT ?? 0) === 0) {
      for (const item of DEFAULT_INTERIORS) {
        await connection.query(
          'INSERT INTO web_interior_layouts (id, type_id, title, subtitle, `desc`, tags, highlights, gallery, video_links, mock_image, blueprint_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.type_id, item.title, item.subtitle, item.desc, item.tags, item.highlights, item.gallery, item.video_links, item.mock_image, item.blueprint_image]
        );
      }
      console.log('[DB Seeding] Seeded interior layouts.');
    } else {
      try {
        await connection.query("UPDATE web_interior_layouts SET type_id = 'TYPE1' WHERE (type_id IS NULL OR type_id = '') AND id = 1");
        await connection.query("UPDATE web_interior_layouts SET type_id = CONCAT('TYPE', id) WHERE (type_id IS NULL OR type_id = '')");
        for (const item of DEFAULT_INTERIORS) {
          await connection.query(
            "UPDATE web_interior_layouts SET video_links = ? WHERE type_id = ? AND (video_links IS NULL OR video_links = '' OR video_links = '[]')",
            [item.video_links, item.type_id]
          );
        }
      } catch (e: any) {
        console.warn('[DB Healing Warn] Interior type_id repair or video links soft patch failed:', e.message);
      }
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Interior layouts:', e.message);
  }

  // 5. Brand Films
  try {
    const [filmRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_brand_films');
    if (Number(filmRows[0]?.count ?? filmRows[0]?.COUNT ?? 0) === 0) {
      for (const film of DEFAULT_FILMS) {
        await connection.query(
          'INSERT INTO web_brand_films (title, `desc`, video_url, visible) VALUES (?, ?, ?, true)',
          [film.title, film.desc, film.video_url]
        );
      }
      console.log('[DB Seeding] Seeded brand films.');
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Brand films:', e.message);
  }

  // 6. Menu Categories and Items
  try {
    const [catRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_menu_categories');
    const [itemRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_menu_items');
    
    const catCount = Number(catRows[0]?.count ?? catRows[0]?.COUNT ?? 0);
    const itemCount = Number(itemRows[0]?.count ?? itemRows[0]?.COUNT ?? 0);

    // RULE: DB is the absolute source of truth.
    // We only perform the initial seed if the database has absolutely NO records (clean startup).
    if (catCount === 0 && itemCount === 0) {
      console.log('[DB Seeding] Menu tables are completely empty. Running initial seeding from code definitions...');
      
      for (const cat of DEFAULT_CATEGORIES) {
        await connection.query(
          'INSERT INTO web_menu_categories (id, name, `desc`, visible) VALUES (?, ?, ?, true)',
          [cat.id, cat.name, cat.desc]
        );
      }
      for (const item of DEFAULT_MENU_ITEMS) {
        const isSig = !!(item.isSignature || item.is_signature || ['AME_HOT_LIGHT', 'AME_ICED_LIGHT', 'AME_HOT', 'AME_ICED'].includes(item.id));
        await connection.query(
          'INSERT INTO web_menu_items (id, name, name_kr, category, image, description, acidity, sweetness, body, bitterness, visible, is_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?)',
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
      console.log('[DB Seeding Success] Initial Menu categories and items seeded smoothly.');
    } else {
      // DB has data! Respect the DB completely. We must NEVER wipe, delete or bulk-overwrite DB content.
      // To apply the user's updated natural description, name and name_kr, we perform soft-patching on text columns.
      try {
        const localMenuItemsFile = path.join(process.cwd(), 'local_menu_items.json');
        let localMenuItems: any[] = [];
        if (fs.existsSync(localMenuItemsFile)) {
          try {
            localMenuItems = JSON.parse(fs.readFileSync(localMenuItemsFile, 'utf-8'));
          } catch (err) {
            console.warn('[DB Seeding Warn] Failed to parse local_menu_items.json:', err);
          }
        }

        const itemsToUpdate = localMenuItems.length > 0 ? localMenuItems : DEFAULT_MENU_ITEMS;
        console.log(`[DB Seeding] Soft-patching menu items text content (keeping images intact)...`);
        for (const item of itemsToUpdate) {
          const itemDesc = item.description || '';
          const itemNameKr = item.name_kr || item.nameKr || '';
          const itemName = item.name || item.nameEng || '';
          
          await connection.query(
            "UPDATE web_menu_items SET name = ?, name_kr = ?, description = ? WHERE id = ?",
            [itemName, itemNameKr, itemDesc, item.id]
          );
        }
        console.log(`[DB Seeding Success] Soft-patched ${itemsToUpdate.length} menu items.`);
      } catch (healErr: any) {
        console.warn('[DB Healing Alert] Safe soft-patching of menu items failed:', healErr.message);
      }
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Menu system:', e.message);
  }

  // 7. Grade Permissions Seeding & Post Category Transition
  try {
    // 7.1 Migrate existing post categories: 운용가이드 -> 노하우팁
    await connection.query("UPDATE web_board_posts SET category = '노하우팁' WHERE category = '운용가이드'");
    
    // 7.2 Clean up old permission settings for 운용가이드
    await connection.query("DELETE FROM web_grade_permissions WHERE category_key = '운용가이드'");

    const [existingPerms]: any = await connection.query('SELECT grade_type, category_key FROM web_grade_permissions');
    const existingKeys = new Set(existingPerms.map((p: any) => `${p.grade_type || p.gradeType}_${p.category_key || p.categoryKey}`));

    const defaultPermissions = [
      { gradeType: '일반', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '일반', categoryKey: '노하우팁', canRead: 0, canWrite: 0, canList: 1 },
      { gradeType: '일반', categoryKey: '장비운영', canRead: 0, canWrite: 0, canList: 1 },
      { gradeType: '일반', categoryKey: '자료실', canRead: 0, canWrite: 0, canList: 1 },
      { gradeType: '일반', categoryKey: '레시피', canRead: 0, canWrite: 0, canList: 1 },
      { gradeType: '일반', categoryKey: '핵심정보', canRead: 0, canWrite: 0, canList: 0 },
      { gradeType: '일반', categoryKey: '헤이스트멤버십전용', canRead: 0, canWrite: 0, canList: 0 },
      { gradeType: '일반', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '일반', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '일반', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 },

      { gradeType: '멤버십', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '멤버십', categoryKey: '노하우팁', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '멤버십', categoryKey: '장비운영', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '멤버십', categoryKey: '자료실', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '멤버십', categoryKey: '레시피', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '멤버십', categoryKey: '핵심정보', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '멤버십', categoryKey: '헤이스트멤버십전용', canRead: 0, canWrite: 0, canList: 0 },
      { gradeType: '멤버십', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '멤버십', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '멤버십', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 },

      { gradeType: '임원', categoryKey: '헤이스트소식', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: '노하우팁', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: '장비운영', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: '자료실', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: '레시피', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: '핵심정보', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: '헤이스트멤버십전용', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '임원', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 },

      { gradeType: '프리미엄', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0, canList: 1 },
      { gradeType: '프리미엄', categoryKey: '노하우팁', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: '장비운영', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: '자료실', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: '레시피', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: '핵심정보', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: '헤이스트멤버십전용', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: 'Q&A', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: '직거래', canRead: 1, canWrite: 1, canList: 1 },
      { gradeType: '프리미엄', categoryKey: 'TEST', canRead: 1, canWrite: 1, canList: 1 }
    ];

    for (const dp of defaultPermissions) {
      const compositeKey = `${dp.gradeType}_${dp.categoryKey}`;
      if (!existingKeys.has(compositeKey)) {
        await connection.query(
          'INSERT INTO web_grade_permissions (grade_type, category_key, can_read, can_write, can_list) VALUES (?, ?, ?, ?, ?)',
          [dp.gradeType, dp.categoryKey, dp.canRead, dp.canWrite, dp.canList]
        );
      }
    }
    console.log('[DB Seeding] Synced/Updated grade permissions and migrated 운용가이드 to 노하우팁.');
  } catch (e: any) {
    console.error('[DB Seeding Error] Grade permissions:', e.message);
  }

  // 7.5 Seed default 본사 마스터 user if not exists
  try {
    const [userRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_membership_users WHERE id = 1');
    if (Number(userRows[0]?.count ?? userRows[0]?.COUNT ?? 0) === 0) {
      await connection.query(
        "INSERT INTO web_membership_users (id, store_name, store_code, owner_name, phone, email, approval_status, store_type, signup_path, role) VALUES (1, '헤이스트 본사', 'HQ-0001', '본사 마스터', '02-1234-5678', 'admin@haste.cafe', '인증 완료', '임원', '본사지정', 'ADMIN')"
      );
      console.log('[DB Seeding] Seeded default 본사 마스터 user.');
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] system user:', e.message);
  }

  // 7.7 Brand Sounds Seeding
  try {
    const [soundRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_brand_sounds');
    if (Number(soundRows[0]?.count ?? soundRows[0]?.COUNT ?? 0) === 0) {
      for (const sound of DEFAULT_SOUNDS) {
        await connection.query(
          'INSERT INTO web_brand_sounds (title, `desc`, sound_url, visible, order_index) VALUES (?, ?, ?, true, ?)',
          [sound.title, sound.desc, sound.sound_url, sound.order_index]
        );
      }
      console.log('[DB Seeding] Seeded brand sounds.');
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Brand sounds:', e.message);
  }

  // 8. Board Posts Seeding
  try {
    const postsToSeed: any[] = [];

    // load real content of id 100 if guide exists to keep it complete
    try {
      const guideFile = path.join(process.cwd(), 'local_posts_guide.json');
      if (fs.existsSync(guideFile)) {
        const content = JSON.parse(fs.readFileSync(guideFile, 'utf-8'));
        const item100 = content.find((item: any) => item.id === 100);
        if (item100 && item100.content) {
          postsToSeed[0].content = item100.content;
          postsToSeed[0].title = item100.title;
        }
      }
    } catch (err) {
      console.warn('[DB Seeding Warn] Failed to read full content of guide for post seeding:', err);
    }

    const [postCountRows]: any = await connection.query('SELECT COUNT(*) as count FROM web_board_posts');
    const postCount = Number(postCountRows[0]?.count ?? postCountRows[0]?.COUNT ?? 0);
    if (postCount === 0) {
      for (const p of postsToSeed) {
        await connection.query(
          'INSERT INTO web_board_posts (id, member_id, title, content, category, is_secret, is_notice) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.id, p.member_id, p.title, p.content, p.category, p.is_secret ? 1 : 0, p.is_notice ? 1 : 0]
        );
        console.log(`[DB Seeding] Seeded board post: ${p.title}`);
      }
    } else {
      console.log('[DB Seeding] web_board_posts already has data. Skipping post seeding.');
    }
  } catch (e: any) {
    console.error('[DB Seeding Error] Board posts:', e.message);
  }
}
