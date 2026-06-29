import { handleMemberSim } from './simulator-handlers/member-handler';
import { handleLicenseSim } from './simulator-handlers/license-handler';
import { handleMenuSim } from './simulator-handlers/menu-handler';
import { handleBoardSim } from './simulator-handlers/board-handler';
import { handleContentSim } from './simulator-handlers/content-handler';

export class FallbackDbPool {
  isFallback = true;
  async getConnection() {
    return {
      query: async (sql: string) => {
        console.log('[Fallback DB] Schema check / no-op query:', sql);
        return [[]];
      },
      release: () => {}
    };
  }

  async query(sql: string, params?: any[]) {
    return this._query(sql, params);
  }

  async _query(sql: string, params: any[] = []) {
    let normalizedSql = sql.replace(/web_membership_users/gi, 'HASTE_MEMBERS')
                           .replace(/web_kakao_members/gi, 'HASTE_KAKAO_MEMBERS')
                           .replace(/web_membership_consultations/gi, 'HASTE_CONSULTATIONS')
                           .replace(/web_admin_accounts/gi, 'HASTE_ADMINS')
                           .replace(/web_home_main/gi, 'HASTE_HERO_DRAFTS')
                           .replace(/web_interior_layouts/gi, 'HASTE_INTERIORS')
                           .replace(/web_store_licenses/gi, 'HASTE_LICENSES')
                           .replace(/web_menu_categories/gi, 'HASTE_MENU_CATEGORIES')
                           .replace(/web_menu_items/gi, 'HASTE_MENU_ITEMS')
                           .replace(/web_brand_films/gi, 'HASTE_FILMS')
                           .replace(/web_brand_sounds/gi, 'HASTE_SOUNDS')
                           .replace(/web_board_posts/gi, 'HASTE_POSTS')
                           .replace(/web_board_attachments/gi, 'HASTE_ATTACHMENTS')
                           .replace(/web_board_comments/gi, 'HASTE_COMMENTS')
                           .replace(/web_grade_permissions/gi, 'HASTE_GRADE_PERMISSIONS');
    const formattedSql = normalizedSql.trim().toUpperCase();
    console.log(`[Fallback DB Query] ${sql} (mapped to: ${normalizedSql}) | Params:`, params);

    if (formattedSql.startsWith('SELECT 1')) {
      return [[{ test: 1 }]];
    }

    // Pipeline through simulated table handlers
    const handlers = [
      handleMemberSim,
      handleLicenseSim,
      handleMenuSim,
      handleBoardSim,
      handleContentSim
    ];

    for (const handler of handlers) {
      const res = handler(formattedSql, params);
      if (res.handled) {
        return res.result;
      }
    }

    return [[]];
  }
}

function cleanImagesForLocalSimulator(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => cleanImagesForLocalSimulator(item));
  }
  if (data && typeof data === 'object') {
    const cleaned = { ...data };
    const imageFields = [
      'bg_image', 'bgImage', 'default_bg_image', 'defaultBgImage',
      'mock_image', 'mockImage', 'blueprint_image', 'blueprintImage',
      'image', 'gallery'
    ];
    for (const field of imageFields) {
      if (field in cleaned) {
        if (field === 'gallery') {
          if (typeof cleaned[field] === 'string' && cleaned[field].startsWith('data:image')) {
            cleaned[field] = '[]';
          } else if (Array.isArray(cleaned[field])) {
            cleaned[field] = cleaned[field].map((img: any) => 
              (typeof img === 'string' && img.startsWith('data:image')) ? '' : img
            );
          }
        } else {
          if (typeof cleaned[field] === 'string' && cleaned[field].startsWith('data:image')) {
            cleaned[field] = '';
          }
        }
      }
    }
    return cleaned;
  }
  return data;
}
