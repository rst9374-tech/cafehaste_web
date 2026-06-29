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
      { gradeType: '일반', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0 },
      { gradeType: '일반', categoryKey: '노하우팁', canRead: 0, canWrite: 0 },
      { gradeType: '일반', categoryKey: '레시피', canRead: 0, canWrite: 0 },
      { gradeType: '일반', categoryKey: '핵심정보', canRead: 0, canWrite: 0 },
      { gradeType: '일반', categoryKey: '장비운영', canRead: 0, canWrite: 0 },
      { gradeType: '일반', categoryKey: '직거래', canRead: 1, canWrite: 1 },
      { gradeType: '일반', categoryKey: 'Q&A', canRead: 1, canWrite: 1 },

      { gradeType: '직영점', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0 },
      { gradeType: '직영점', categoryKey: '노하우팁', canRead: 1, canWrite: 0 },
      { gradeType: '직영점', categoryKey: '레시피', canRead: 1, canWrite: 0 },
      { gradeType: '직영점', categoryKey: '핵심정보', canRead: 1, canWrite: 0 },
      { gradeType: '직영점', categoryKey: '장비운영', canRead: 1, canWrite: 0 },
      { gradeType: '직영점', categoryKey: '직거래', canRead: 1, canWrite: 1 },
      { gradeType: '직영점', categoryKey: 'Q&A', canRead: 1, canWrite: 1 },

      { gradeType: '임원', categoryKey: '헤이스트소식', canRead: 1, canWrite: 1 },
      { gradeType: '임원', categoryKey: '노하우팁', canRead: 1, canWrite: 1 },
      { gradeType: '임원', categoryKey: '레시피', canRead: 1, canWrite: 1 },
      { gradeType: '임원', categoryKey: '핵심정보', canRead: 1, canWrite: 1 },
      { gradeType: '임원', categoryKey: '장비운영', canRead: 1, canWrite: 1 },
      { gradeType: '임원', categoryKey: '직거래', canRead: 1, canWrite: 1 },
      { gradeType: '임원', categoryKey: 'Q&A', canRead: 1, canWrite: 1 },

      { gradeType: '프리미엄', categoryKey: '헤이스트소식', canRead: 1, canWrite: 0 },
      { gradeType: '프리미엄', categoryKey: '노하우팁', canRead: 1, canWrite: 1 },
      { gradeType: '프리미엄', categoryKey: '레시피', canRead: 1, canWrite: 1 },
      { gradeType: '프리미엄', categoryKey: '핵심정보', canRead: 1, canWrite: 1 },
      { gradeType: '프리미엄', categoryKey: '장비운영', canRead: 1, canWrite: 1 },
      { gradeType: '프리미엄', categoryKey: '직거래', canRead: 1, canWrite: 1 },
      { gradeType: '프리미엄', categoryKey: 'Q&A', canRead: 1, canWrite: 1 }
    ];

    for (const dp of defaultPermissions) {
      const compositeKey = `${dp.gradeType}_${dp.categoryKey}`;
      if (!existingKeys.has(compositeKey)) {
        await connection.query(
          'INSERT INTO web_grade_permissions (grade_type, category_key, can_read, can_write) VALUES (?, ?, ?, ?)',
          [dp.gradeType, dp.categoryKey, dp.canRead, dp.canWrite]
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
    const postsToSeed = [
      {
        id: 100,
        member_id: 1,
        title: "헤이스트(HASTE) 플랫폼 가맹 경영주 마스터 개발 지침 가이드북",
        content: "# [최종 마스터 본] 헤이스트(HASTE) AI 에이전트 개발 지침서\n\n지침 가이드 내용 생략 (가이드북 본문)",
        category: "노하우팁",
        is_secret: 0
      },
      {
        id: 101,
        member_id: 1,
        title: "실제 개설과 사용에 드는 비용은 정확히 어떻게 형성되나요?",
        content: "헤이스트는 상생하는 파트너십을 지향합니다. 최초 가입 시 발생하는 솔루션 이용료 30만 원(VAT 별도)과, 안정적인 전산 유지관리를 위한 월 5만 원(VAT 별도)의 기술 이용료 외에 불필요한 비용을 추가로 청구하지 않아 고정비 부담을 낮춥니다. 점주님의 매장 비용 절감과 안정적인 수익 구조를 위해 노력합니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 102,
        member_id: 1,
        title: "다점포 운영 시 추가 혜택이 적용되나요?",
        content: "네, 다점포를 운영하시는 점주님들을 지원하기 위해 2호점 이상의 추가 개설 시 솔루션 가입비의 50%를 혜택으로 제공해 드리고 있습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 103,
        member_id: 1,
        title: "프로그램 및 장비의 자율 설치와 초보 점주를 위한 실무 가이드가 있나요?",
        content: "네, 기기 설치와 시스템 안정화 단계가 안내된 조작 가이드 및 디지털 매뉴얼을 제공하며, 진행 중 문의사항은 실시간 소통 채널(카톡 채널) 창구를 통해 지원받으실 수 있습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 104,
        member_id: 1,
        title: "하드웨어 장비 고장 시 A/S는 어떻게 진행되나요?",
        content: "헤이스트는 전문 제조사들과 파트너십을 맺어 신속한 현장 밀착형 엔지니어 케어를 지원합니다. 아울러 점주 전용 커뮤니티 채널을 통해 실시간 조작 노하우와 간편 자가 진단 팁을 지속적으로 제공하여 매장 기기 관리에 대한 염려를 덜어드립니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 106,
        member_id: 1,
        title: "[공지] 헤이스트(HASTE) 공식 홈페이지 오픈 및 이용안내",
        content: "안녕하십니까, 헤이스트(HASTE) 운영팀입니다.\n\n점주님들의 원활하고 독립적인 점포 운영을 지원할 공식 홈페이지 및 점포 관리 시스템이 금일 정식 오픈되어 이용 안내를 드립니다. 현재 웹사이트를 통해 점주님들을 위한 멤버십 가입 신청을 정식으로 접수하고 있으니 많은 가입과 참여를 부탁드립니다.\n\n[상단 메뉴별 주요 기능 안내]\n- BRAND : 헤이스트의 브랜드 철학과 4대 운영 자율권 가치 소개\n- INTERIOR : 매장 콘셉트별 완공 인테리어 시안 조회 및 가상 창업 계산기\n- MEMBERSHIP : 점주 가입 신청, 라이선스 키 관리 및 커피머신 로컬서버 연동 결제\n- STORE : 전국 협력 매장의 위치 및 상세 정보 지도 조회\n- COMMUNITY : 운영팀 소식 및 점주 전용 실시간 Q&A 게시판 운영\n\n[홈페이지 제공 정보 및 주요 서비스]\n- 1:1 창업 및 제휴 문의 창구 운영\n- 공동구매 원자재 혜택 분석 및 카탈로그 조회\n- 커피머신 로컬서버 가동 및 전산 관리 시스템 시뮬레이터 (개발 중)\n\n[멤버십 가입 혜택 안내]\n- 정식 가입 완료 시 고유 솔루션 라이선스 발급 및 로컬 서버 연동 권한 부여\n- 장기 결제 시 이용약관에 따른 기간 연장 추가 지원 혜택 제공\n\n※ 상세한 멤버십 혜택 및 장기 할인 정책에 관한 안내는 별도 게시글을 통해 추가로 상세히 공지해 드릴 예정입니다.\n\n점주님들과 예비 창업자분들의 많은 활용을 바랍니다.\n감사합니다.",
        category: "헤이스트소식",
        is_secret: 0,
        is_notice: 1
      },
      {
        id: 107,
        member_id: 1,
        title: "[공지] 헤이스트(HASTE) 멤버십 가입 절차 및 단계별 혜택 상세 안내",
        content: "안녕하십니까, 헤이스트(HASTE) 운영팀입니다.\n\n헤이스트 매장 솔루션 및 로컬 서버 프로그램의 원활한 이용을 위한 멤버십 가입 절차와 정기 구독 플랜별 혜택을 안내해 드립니다.\n\n[멤버십 단계별 가입 절차]\n가입 신청서 작성부터 라이선스 키 발급까지의 상세한 4단계 과정은 아래 링크를 통해 가이드북 팝업창에서 바로 확인하실 수 있습니다.\n[가이드북 팝업 열기]\n\n[멤버십 플랜 및 기간 연장 혜택]\n구독 플랜(1, 6, 12개월)에 따른 할인율과 추가 가용 일수 등 상세 혜택 내역은 아래 링크를 통해 확인해 보십시오.\n[혜택안내 팝업 열기]\n\n협력 매장의 안정적이고 자율적인 운영을 위해 늘 함께하겠습니다.\n감사합니다.",
        category: "헤이스트소식",
        is_secret: 0,
        is_notice: 1
      },
      {
        id: 201,
        member_id: 1,
        title: "[공지] 베테랑 점주들의 매장 위생 및 청결 관리 정기 점검 팁",
        content: "매장 내 청결은 고객 신뢰의 기본입니다. 정기적으로 배포되는 가이드라인에 맞추어 매장 청결 상태를 관리해 주시길 바랍니다. 특히 쓰레기 즉시 수거함 비우기와 입구 유도문 세척은 매일 아침 Routine으로 실천해 주시면 감사하겠습니다.",
        category: "노하우팁",
        is_secret: 0,
        is_notice: 1
      },
      {
        id: 202,
        member_id: 1,
        title: "[공지] 커피머신 및 제빙기 동절기 동파 예방 필독 관리법",
        content: "동절기 기온 급하강 시 매장 내 장비의 동파 사고가 발생하지 않도록, 퇴근 전 매장 내부의 적정 난방 온도를 유지하고 온수기 및 제빙기의 급수관 단열 상태를 점검해 주십시오. 특히 수도관이 위치한 벽면 틈새 바람막이 작업을 권장합니다.",
        category: "장비운영",
        is_secret: 0,
        is_notice: 1
      },
      {
        id: 203,
        member_id: 1,
        title: "[공지] 시그니처 브론즈 골드 블렌딩 음료 추출 표준 레시피 가이드",
        content: "헤이스트만의 시그니처 커피 풍미를 일관되게 제공하기 위해 에스프레소 추출 표준 시간(23~28초) 및 원두 분쇄도 세팅값을 준수해 주십시오. 정해진 표준 용량 세팅은 고객 만족과 매장 단가 관리에 결정적인 역할을 합니다.",
        category: "레시피",
        is_secret: 0,
        is_notice: 1
      },
      {
        id: 204,
        member_id: 1,
        title: "[공지] 1:1 기술 지원 및 장비 작동 오류 발생 시 비상 연락 창구 안내",
        content: "키오스크 결제 오류 또는 커피머신 로컬서버 가동 지연 등 장비 에러 발생 시, 신속한 조치를 위해 문제 화면을 사진/영상으로 촬영하여 실시간 소통방 카톡 창구로 접수해 주십시오. 순차적으로 엔지니어 케어를 지원해 드립니다.",
        category: "Q&A",
        is_secret: 0,
        is_notice: 1
      },
      {
        id: 205,
        member_id: 1,
        title: "[공지] 점주 간 중고 기기 및 원자재 직거래 이용 규칙 및 준수 사항",
        content: "점주 자율 조싱 보장과 매장 비용 절감을 돕는 점주 전용 직거래 장터입니다. 거래 상태(진행중/완료)를 명확히 기재해 주시고, 기기의 하자 유무는 사전에 소통하여 건전한 공유 생태계를 유지해 주시길 바랍니다.",
        category: "직거래",
        is_secret: 0,
        is_notice: 1
      },
      {
        id: 111,
        member_id: 1,
        title: "매달 발생하는 로열티나 보이지 않는 추가 비용이 있나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n로열티나 추가 수수료 부담은 없습니다. 최초 솔루션 도입 비용 30만 원과 월 기술 관리료 5만 원으로 추가적인 로열티 부담 없이 헤이스트의 브랜드 가치와 주문 관리 시스템을 편리하게 이용하실 수 있습니다.\n\n이를 통해 매년 상당 수준의 운영 고정비를 아끼실 수 있습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 112,
        member_id: 1,
        title: "원두나 시럽 등 원부자재는 반드시 지정 경로로만 구매해야 하나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n그렇지 않습니다. 헤이스트는 사장님의 성공적인 매장 운영을 위해 엄선된 원부자재를 합리적인 조건으로 공급하는 공식 협력망을 운영하고 있으며, 필요에 따라 개별적으로 구매 경로를 선택하시는 것도 존중하는 열린 공급 구조를 지향합니다.\n\n직접 구매가 번거로우시거나 조달 비용을 줄이고 싶으시다면 점주 연합의 공동구매 네트워크를 통해 안정적인 가격으로 공급받으실 수 있습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 113,
        member_id: 1,
        title: "본사 서버에 일시적인 장애가 생기면 매장 주문 결제도 중단되나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n안심하셔도 좋습니다. 헤이스트는 로컬 PC 기반 독립 작동 시스템으로 구성되어 있어, 본사 메인 서버에 일시적인 통신 불안정이 발생하더라도 커피머신 로컬서버 가동 시 매장 내 기기들은 단독으로 정상 작동합니다.\n\n매장 내부의 인터넷 회선 자체에 끊김이 있거나 기기의 물리적인 손상이 발생한 경우는 해당되지 않습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 114,
        member_id: 1,
        title: "커피머신 등 매장 장비가 고장 나면 A/S는 어떻게 받나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n기기 점검 및 고장 발생 시에는 검증된 기기 제조사의 공식 서비스 센터망을 통해 신속하고 투명하게 직접 유상 관리를 받으실 수 있습니다.\n\n불필요한 중개 수수료나 처리 지연 과정 없이 제조사 엔지니어를 통해 직접 소통하며 정확한 수리와 예방 관리를 받으실 수 있도록 상세히 안내해 드립니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 115,
        member_id: 1,
        title: "매장의 운영 시간이나 메뉴 레시피는 점주가 직접 변경할 수 있나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n네, 가능합니다. 휴무일 및 영업시간 설정, 메뉴 구성 및 판가 결정, 그리고 음료 레시피 세팅까지 매장 상황과 상권의 선호도에 맞춰 직접 편리하게 제어하실 수 있습니다.\n\n강제적인 규칙 대신 점주 주도의 자율적인 운영을 지원하며, 사장님이 지향하시는 방향의 매장을 꾸리실 수 있도록 열어두고 있습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 116,
        member_id: 1,
        title: "커피머신과 키오스크 등 매장 장비는 반드시 본사에서 구매해야 하나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파자재 등 매장 장비는 반드시 본사에서 구매해야 하나요? 아닙니다. 시스템 연동의 안정성을 보장하기 위해 권장 및 검증된 파트너십 모델이 있으나 장비 강제 매입 등의 의무는 없습니다.\n\n권장 사양에 적합하다면 인터넷 최저가 조달이나 중고 장비를 구하여 설치하시는 것도 자유롭게 가능합니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 117,
        member_id: 1,
        title: "추후 사정에 의해 해지하게 될 경우 해지 위약금이 발생하나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n해지 위약금은 부과되지 않습니다. 헤이스트는 경직된 장기 계약 방식 대신 사장님 상황에 발맞출 수 있도록 유연한 구독제 서비스를 채택하고 있습니다.\n\n갑작스러운 중도 해지에 따른 고액의 위약금 걱정 없이 상황에 맞게 안심하고 서비스를 이용하실 수 있습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 118,
        member_id: 1,
        title: "복수의 매장을 동시 혹은 순차적으로 운영할 때 지원 혜택이 있나요?",
        content: "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n네, 지원 혜택이 있습니다. 사장님의 사업적 확장을 기쁜 마음으로 응원하고자, 2호점 이상의 신규 매장을 연계하여 출점하실 경우 최초 1회 발생하는 솔루션 도입비를 50% 할인 혜택으로 제공하여 개설 부담을 덜어드리고 있습니다.",
        category: "Q&A",
        is_secret: 0
      },
      {
        id: 121,
        member_id: 1,
        title: "무인 매장 내 이용 질서 확립 및 비주문 고객 예방 가이드",
        content: "[운영 고민]\n매장 내 음료를 주문하지 않고 장시간 좌석을 차지하거나, 외부 음식물을 반입하여 취식하는 경우 점주님들의 운영 부담이 커질 수 있습니다. 무인 매장의 특성을 악용해 기물을 무단으로 사용하거나 이용 질서를 어지럽히는 상황이 발생하기도 합니다.\n\n[해결 팁]\n1. 원격 음성 안내 방송 활용: 매장 내 설치된 CCTV 모니터링망과 음향 시스템(샵캐스트 등)을 연동하여 특이사항 발견 시 실시간으로 안내 방송을 송출합니다. \"이용 고객님들의 쾌적한 환경을 위해 1인 1음료 주문을 부탁드립니다.\", \"쾌적한 매장 관리를 위해 외부 음식물 반입은 삼가 주시기 바랍니다.\" 등의 멘트를 송출하여 정중하게 이용 협조를 구합니다.\n2. 매장 외부 시인성 확보: 유리창의 반투명 시트지 등을 조정하여 밖에서도 매장 내부가 잘 보이도록 개방감을 주면, 자연스러운 시선 유도로 비이용 고객의 출입을 예방하는 데 도움이 됩니다.\n3. 질서 유지를 위한 단호한 대응: 반복적으로 영업 환경을 저해하는 비이용객에게는 매장이 사유지임을 안내하고 정중히 퇴점을 요청합니다. 개선되지 않을 경우 관련 법적 절차(업무방해 등)에 따라 신속히 협조를 구합니다.",
        category: "노하우팁",
        is_secret: 0
      },
      {
        id: 122,
        member_id: 1,
        title: "매장 기기 작동 오류 발생 시 조치 요령 및 예방 가이드",
        content: "[운영 고민]\n커피머신이나 제빙기 등 핵심 장비의 작동이 멈추면 매출에 실질적인 영향을 받게 됩니다. 특히 키오스크 통신 지연이나 노즐 세척 상태 불량, 모터 일시 오류 등으로 대기 시간이 길어지거나 서비스가 중단되는 현상이 발생하면 수리 출장비와 부품 관리 비용 등으로 운영 원가가 가중될 수 있습니다.\n\n[해결 팁]\n1. 스마트 원격 제어 플러그 활용: 일시적인 시스템 멈춤 현상이 발생했을 때, 매장에 방문하지 않고도 모바일 스마트폰 앱을 활용해 원격으로 재부팅하여 즉각적인 오류 해결이 가능합니다.\n2. 주요 소모품 자가 교체 매뉴얼 활용: 자주 마모되거나 교체 주기가 짧은 소모품류는 공식 조달망 또는 검증된 일반 경로를 통해 규격품을 저렴하게 구입하여 점주가 직접 교체함으로써 유지보수 공임비용을 실질적으로 낮출 수 있습니다.\n3. 수압 안정화를 위한 가압펌프 검토: 수압이 불안정하여 물이 원활하게 공급되지 않으면 커피머신 급수 에러로 작동이 정지될 수 있습니다. 이 경우 적절한 규격의 수압 가압펌프를 설치하면 수압 관련 잔고장을 미연에 방지할 수 있습니다.\n4. 일일 정기 세척 Routine 수립: 머신 내부의 원두 찌꺼기 고착이나 유제품 노즐 막힘을 방지하기 위해 매일 1회 이상 자동 세척 및 유제품 라인 시스템 세척을 철저하게 수행하는 것이 불필요한 고장을 막는 확실한 방법입니다.",
        category: "노하우팁",
        is_secret: 0
      },
      {
        id: 123,
        member_id: 1,
        title: "원자재 수급 효율화 및 매장 고정비 절감 가이드",
        content: "[운영 고민]\n원두와 유제품 등 주요 원재료 가격이 변동되는 상황에서 판매 단가를 조절하기 쉽지 않은 무인 매장의 특성상, 인근 유인 저가 커피 전문점과의 경쟁 구도가 형성되면 매출 및 수익성에 실질적인 부담을 겪게 됩니다.\n\n[해결 팁]\n1. 유제품 보관 방식 다변화: 원가 관리 및 신선도 유지를 위해 멸균 유제품을 도입하는 방안이 있습니다. 맛의 밸런스를 채우기 위해 기본 신선 우유와 멸균 우유를 적정 비율(예: 3:1 등)로 혼합하여 사용하는 운영 노하우를 접목해 원재료 폐기 리스크와 도입 단가를 효율화합니다.\n2. 냉난방 및 전기 사용 효율화: 동절기에는 출입문 틈새 바람막이 작업을 수행하여 불필요한 열 손실을 방지합니다. 또한 스마트 온도조절기를 연동해 실외 기온 변화에 맞춰 냉난방기가 가동되도록 설정함으로써 매달 발생하는 전기 요금을 줄일 수 있습니다.\n3. 오늘의 메뉴 등 특화 이벤트 탭 구성: 원자재 회전율을 높이고 신규 고객층을 지속적으로 유입시키기 위해, 키오스크 화면에 '오늘의 메뉴' 코너를 신설하여 일시적인 특별 가격 정책을 도입하는 것도 좋은 매출 활성화 방안이 됩니다.",
        category: "노하우팁",
        is_secret: 0
      },
      {
        id: 124,
        member_id: 1,
        title: "매장 환경 위생 관리 및 해충 유입 차단 가이드",
        content: "[운영 고민]\n고객이 출입문을 연 상태로 방치하고 이동하여 냉난방 열기가 손실되거나 여름철 초파리, 모기 등 해충이 매장 내로 대량 유입되는 문제가 발생합니다. 또한 바닥에 무분별하게 버려진 인쇄 영수증 쓰레기도 매장을 지저분하게 만듭니다.\n\n[해결 팁]\n1. 자동 닫힘 힌지(Hinge) 설치: 출입문에 부드럽게 닫히는 자동 도어 클로저 또는 논스톱 자동 힌지를 구성합니다. 고객이 드나든 후 출입문이 자동으로 안전하게 닫히도록 하여 벌레의 실내 유입과 냉난방 에너지 낭비를 예방합니다.\n2. 이중 해충 방어 설비 연동: 입구 쪽에 에어커튼을 설치하거나, 밖에서 빛이 보이지 않는 사각지대에 포충기를 설치합니다. 또한 커피 찌꺼기를 소분하여 매장 곳곳에 배치하면 방향 효과와 함께 해충 유입 억제에도 도움이 됩니다.\n3. 영수증 즉시 수거함 배치: 키오스크 영수증 출력구 하단에 맞춤형 쓰레기 수거함을 밀착 고정합니다. 영수증이 나오는 즉시 자연스럽게 수거통으로 들어가도록 유도하면 매장 바닥 청소 빈도를 크게 단축할 수 있습니다.",
        category: "노하우팁",
        is_secret: 0
      },
      {
        id: 125,
        member_id: 1,
        title: "기계 작동 에러 시 신속한 상황 기록 및 대응 가이드",
        content: "[운영 고민]\n야간이나 공휴일 등 고객센터(관제망)의 즉각적인 응대가 지연될 수 있는 시간대에 기기 고장이나 결제 장애가 발생할 경우, 빠른 해결이 안 되어 장시간 매장 운영에 지장을 초래할 우려가 있습니다.\n\n[해결 팁]\n1. 증빙 자료(사진/동영상)의 선제적 확보: 결제나 기기 동작 시 에러 코드가 화면에 노출될 때 즉각 스마트폰 카메라로 해당 화면과 작동 현황을 사진이나 영상으로 촬영합니다. 상황이 발생한 시간대와 상세 내용을 기록하여 파트너십 채널로 전송해 두면 추후 신속한 사후 처리 시 결정적인 소명 자료가 됩니다.\n2. 필수 문제 해결 자가 대처법 숙지: 기술 지원이 지연되는 동안 매장 운영을 보호하기 위해, 자주 일어날 수 있는 미세 막힘 현상(원두 분쇄기 걸림이나 추출구 청소 등)에 대해서는 본사가 배포한 기본 자가 조치 영상 가이드를 숙지하여 점주가 직접 간편하게 조치를 취할 수 있도록 대비하는 것이 매출 손실 방지에 매우 유리합니다.\n\n무인 매장 운영은 점포 상주 인력이 없는 만큼, 철저한 청결 루틴 준수, 기본 장비 구동 방식의 이해 및 자가 관리, 효율적인 고정비 통제와 같은 부지런한 운영 자세가 브랜드 가치를 높이고 성공적인 매출을 달성하는 핵심 열쇠입니다.",
        category: "노하우팁",
        is_secret: 0
      },
      {
        id: 126,
        member_id: 1,
        title: "무인 매장 내 벌레 차단을 위한 에어커튼 효과와 실전 활용 가이드",
        content: "[운영 고민]\n여름철 무인 매장의 가장 큰 위생 고민 중 하나는 야간 시간대 조명을 보고 실내로 침입하는 날벌레들입니다. 포충기 가동만으로는 미세 날벌레의 무분별한 유입을 막기 어려워, 출입구 쪽에 에어커튼 설치를 고민하시는 점주님들이 많습니다.\n\n[해결 팁]\n1. 에어커튼의 주요 방충 효과\n• 뛰어난 벌레 진입 차단: 에어커튼 가동 시 출입문 위에서 아래로 흐르는 강한 바람막이가 형성되어 날벌레 유입이 실질적으로 감소합니다. 벌레 발생 빈도가 매우 높은 하천 인근 매장에서도 설치 후 유입량이 대폭 줄어드는 결과를 보였습니다.\n• 포충 기기와의 조화로운 운용: 입구 쪽의 에어커튼과 매장 내부의 LED 포충기를 병행하여 사용하면 유입되는 해충을 효율적으로 제어할 수 있어 위생 유지와 청소 관리가 한결 수월해집니다.\n\n2. 에어커튼 운용 시 유의할 한계점\n• 완벽한 차단의 한계: 강한 바람 장벽을 형성하지만 비행 능력이 강한 해충이 일부 뚫고 들어오는 경우가 있을 수 있습니다. 벌레 밀도가 극도로 높은 환경에서는 단독 사용만으로 완벽한 해결은 어려울 수 있습니다.\n• 설치 환경 및 배선 점검 필요: 대부분의 매장에서 효과를 보이지만, 매장 입구 전압 사양에 따라 자동문 구동 시 전산 제어에 영향이 가지 않도록 사전 배선 전기 설비 점검이 필요합니다.\n\n3. 효과를 극대화하기 위한 실전 노하우\n• 24시간 연속 가동 권장: 출입문이 열릴 때만 작동하도록 연동형으로 설정하면, 기계 구동 속도 지연으로 인해 문에 대기하던 날벌레가 기압 차로 휩쓸려 들어올 수 있습니다. 벌레가 문 주변에 달라붙지 못하도록 벌레 집중 유입 시기에는 24시간 상시 가동하는 것이 한층 유리합니다.\n• 당기는 출입문 방식 적용: 고객이 밀고 들어가는 형태보다 안쪽으로 당겨서 여는 구조로 출입문을 유도하면, 개폐 시 바람이 바깥쪽으로 향하게 되어 에어커튼 바람막이와 함께 이중 차단 효과를 유도할 수 있습니다.\n• 주기적인 필터 관리: 에어커튼 본체 상단의 필터망에 먼지가 쌓이면 풍량이 급격히 약해집니다. 1~2주 주기로 간편하게 망을 씻어내어 청결을 유지해 주는 것이 기기 성능 보존에 좋습니다.",
        category: "노하우팁",
        is_secret: 0
      }
    ];

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
