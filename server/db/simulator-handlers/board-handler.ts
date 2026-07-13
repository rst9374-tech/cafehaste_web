import { readBackupDb } from '../cache-io';
import {
  readBackupPosts,
  writeBackupPosts,
  readBackupAttachments,
  writeBackupAttachments,
  readBackupComments,
  writeBackupComments,
  readBackupPermissions,
  writeBackupPermissions
} from '../board_io';
import fs from 'fs';
import path from 'path';

export function handleBoardSim(formattedSql: string, params: any[] = []): { handled: boolean; result?: any } {
  // 1. Posts Simulator
  if (formattedSql.includes('FROM HASTE_POSTS') || formattedSql.includes('HASTE_POSTS')) {
    const posts = readBackupPosts();
    const categoriesList = ['공지사항', '헤이스트소식', '운용가이드', '노하우팁', '장비운영', '자료실', '레시피', '핵심정보', '헤이스트멤버십전용', 'Q&A', '직거래', 'TEST', '공동구매', 'H/W AS업체'];
    const catParam = params?.find((p: any) => categoriesList.includes(p));

    if (formattedSql.startsWith('SELECT COUNT(*)')) {
      // In local development simulator, return all posts length to display test posts on all boards
      return { handled: true, result: [[{ count: posts.length }]] };
    }
    if (formattedSql.startsWith('SELECT *') || formattedSql.startsWith('SELECT P.*')) {
      const members = readBackupDb();
      
      // Load local kakao members as well
      let kakaoMembers: any[] = [];
      try {
        const kakaoPath = path.join(process.cwd(), 'local_kakao_members.json');
        if (fs.existsSync(kakaoPath)) {
          kakaoMembers = JSON.parse(fs.readFileSync(kakaoPath, 'utf8'));
        }
      } catch (e) {
        console.warn('[Simulator Warn] Failed to read HASTE_KAKAO_MEMBERS:', e);
      }

      let joined = posts.map((p: any) => {
        let m = members.find((item: any) => item.id === p.member_id);
        if (!m && p.member_id >= 90000) {
          m = kakaoMembers.find((item: any) => item.id === p.member_id);
        }
        return {
          ...p,
          category: p.category || 'Q&A',
          store_name: m ? m.store_name : '알수없음',
          owner_name: m ? m.owner_name : '알수없음',
          store_code: m ? m.store_code : '알수없음'
        };
      });
      
      if (catParam) {
        // Map all simulator posts to the requested category locally so they render on the page
        joined = joined.map((p: any) => ({ ...p, category: catParam }));
      }

      if (formattedSql.includes('WHERE P.ID =') || formattedSql.includes('WHERE ID =')) {
        const idVal = params ? params[0] : null;
        const matched = joined.filter((p: any) => p.id === parseInt(idVal));
        return { handled: true, result: [matched] };
      }
      const sorted = joined.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { handled: true, result: [sorted] };
    }
    if (formattedSql.startsWith('INSERT INTO')) {
      const [member_id, title, content, is_secret, category] = params;
      const insertId = posts.length > 0 ? Math.max(...posts.map((p: any) => p.id)) + 1 : 1;
      const newPost = {
        id: insertId,
        member_id: parseInt(member_id),
        title: title || '',
        content: content || '',
        category: category || 'Q&A',
        is_secret: is_secret === 1 || is_secret === true ? 1 : 0,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      posts.push(newPost);
      writeBackupPosts(posts);
      return { handled: true, result: [{ insertId }] };
    }
    if (formattedSql.startsWith('UPDATE HASTE_POSTS SET VIEW_COUNT')) {
      const [id] = params;
      const updated = posts.map((p: any) => 
        p.id === parseInt(id) ? { ...p, view_count: (p.view_count || 0) + 1 } : p
      );
      writeBackupPosts(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE')) {
      const hasCategory = params && params.length === 5;
      const title = params ? params[0] : '';
      const content = params ? params[1] : '';
      const is_secret = params ? params[2] : 0;
      const category = hasCategory ? params[3] : undefined;
      const id = hasCategory ? params[4] : (params ? params[3] : 0);

      const updated = posts.map((p: any) => {
        if (p.id === parseInt(id)) {
          return {
            ...p,
            title: title || p.title,
            content: content || p.content,
            category: category !== undefined ? category : (p.category || 'Q&A'),
            is_secret: is_secret !== undefined ? (is_secret === 1 ? 1 : 0) : p.is_secret,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });
      writeBackupPosts(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('DELETE')) {
      const [id] = params;
      const filtered = posts.filter((p: any) => p.id !== parseInt(id));
      writeBackupPosts(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 2. Attachments Simulator
  if (formattedSql.includes('FROM HASTE_ATTACHMENTS') || formattedSql.includes('HASTE_ATTACHMENTS')) {
    const attachments = readBackupAttachments();
    if (formattedSql.startsWith('SELECT *')) {
      const [postId] = params;
      const matched = attachments.filter((a: any) => a.post_id === parseInt(postId));
      return { handled: true, result: [matched] };
    }
    if (formattedSql.startsWith('INSERT INTO')) {
      const [post_id, original_name, stored_name, file_path, file_size] = params;
      const insertId = attachments.length > 0 ? Math.max(...attachments.map((a: any) => a.id || 0)) + 1 : 1;
      const newAttachment = {
        id: insertId,
        post_id: parseInt(post_id),
        original_name: original_name || '',
        stored_name: stored_name || '',
        file_path: file_path || '',
        file_size: parseInt(file_size || 0),
        created_at: new Date().toISOString()
      };
      attachments.push(newAttachment);
      writeBackupAttachments(attachments);
      return { handled: true, result: [{ insertId }] };
    }
    if (formattedSql.startsWith('DELETE')) {
      const [id] = params;
      const filtered = attachments.filter((a: any) => a.id !== parseInt(id));
      writeBackupAttachments(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 3. Comments Simulator
  if (formattedSql.includes('FROM HASTE_COMMENTS') || formattedSql.includes('HASTE_COMMENTS')) {
    const comments = readBackupComments();
    if (formattedSql.startsWith('SELECT *')) {
      const [postId] = params;
      const members = readBackupDb();
      
      let kakaoMembers: any[] = [];
      try {
        const kakaoPath = path.join(process.cwd(), 'local_kakao_members.json');
        if (fs.existsSync(kakaoPath)) {
          kakaoMembers = JSON.parse(fs.readFileSync(kakaoPath, 'utf8'));
        }
      } catch (e) {
        console.warn('[Simulator Warn] Failed to read HASTE_KAKAO_MEMBERS:', e);
      }

      const joined = comments.filter((c: any) => c.post_id === parseInt(postId)).map((c: any) => {
        let m = members.find((item: any) => item.id === c.member_id);
        if (!m && c.member_id >= 90000) {
          m = kakaoMembers.find((item: any) => item.id === c.member_id);
        }
        return {
          ...c,
          store_name: m ? m.store_name : '알수없음',
          owner_name: m ? m.owner_name : '알수없음'
        };
      });
      return { handled: true, result: [joined] };
    }
    if (formattedSql.startsWith('INSERT INTO')) {
      const [post_id, member_id, content] = params;
      const insertId = comments.length > 0 ? Math.max(...comments.map((c: any) => c.id || 0)) + 1 : 1;
      const newComment = {
        id: insertId,
        post_id: parseInt(post_id),
        member_id: parseInt(member_id),
        content: content || '',
        created_at: new Date().toISOString()
      };
      comments.push(newComment);
      writeBackupComments(comments);
      return { handled: true, result: [{ insertId }] };
    }
    if (formattedSql.startsWith('DELETE')) {
      const [id] = params;
      const filtered = comments.filter((c: any) => c.id !== parseInt(id));
      writeBackupComments(filtered);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
    if (formattedSql.startsWith('UPDATE')) {
      const [content, id] = params;
      const updated = comments.map((c: any) => 
        c.id === parseInt(id) ? { ...c, content: content || '' } : c
      );
      writeBackupComments(updated);
      return { handled: true, result: [{ affectedRows: 1 }] };
    }
  }

  // 4. Grade Permissions Simulator
  if (formattedSql.includes('FROM HASTE_GRADE_PERMISSIONS') || formattedSql.includes('HASTE_GRADE_PERMISSIONS')) {
    const perms = readBackupPermissions();
    
    // Seed locally if empty
    if (perms.length === 0) {
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
      let insertId = 1;
      for (const dp of defaultPermissions) {
        perms.push({
          id: insertId++,
          grade_type: dp.gradeType,
          category_key: dp.categoryKey,
          can_read: dp.canRead,
          can_write: dp.canWrite,
          can_list: dp.canList,
          created_at: new Date().toISOString()
        });
      }
      writeBackupPermissions(perms);
    }

    if (formattedSql.startsWith('SELECT COUNT(*)')) {
      return { handled: true, result: [[{ count: perms.length }]] };
    }
    
    if (formattedSql.startsWith('SELECT')) {
      let filteredPerms = [...perms];
      
      if (formattedSql.includes('WHERE')) {
        const hasGradeType = formattedSql.includes('grade_type');
        const hasCategoryKey = formattedSql.includes('category_key');
        const hasCanListZero = formattedSql.includes('can_list = 0');
        
        if (hasGradeType && params.length > 0) {
          const gType = params[0];
          filteredPerms = filteredPerms.filter((p: any) => p.grade_type === gType || p.gradeType === gType);
          
          if (hasCategoryKey && params.length > 1) {
            const cKey = params[1];
            filteredPerms = filteredPerms.filter((p: any) => p.category_key === cKey || p.categoryKey === cKey);
          }
        }
        
        if (hasCanListZero) {
          filteredPerms = filteredPerms.filter((p: any) => p.can_list === 0 || p.canList === 0);
        }
      }
      
      const mappedRows = filteredPerms.map((p: any) => ({
        id: p.id,
        grade_type: p.grade_type || p.gradeType,
        category_key: p.category_key || p.categoryKey,
        can_read: p.can_read !== undefined ? p.can_read : (p.canRead !== undefined ? p.canRead : 1),
        can_write: p.can_write !== undefined ? p.can_write : (p.canWrite !== undefined ? p.canWrite : 1),
        can_list: p.can_list !== undefined ? p.can_list : (p.canList !== undefined ? p.canList : 1),
        created_at: p.created_at || new Date().toISOString()
      }));
      
      return { handled: true, result: [mappedRows] };
    }
    
    if (formattedSql.startsWith('INSERT INTO')) {
      const [grade_type, category_key, can_read, can_write, can_list] = params;
      const insertId = perms.length > 0 ? Math.max(...perms.map((p: any) => p.id || 0)) + 1 : 1;
      const newPerm = {
        id: insertId,
        grade_type: grade_type || '',
        category_key: category_key || '',
        can_read: can_read !== undefined ? parseInt(can_read) : 1,
        can_write: can_write !== undefined ? parseInt(can_write) : 1,
        can_list: can_list !== undefined ? parseInt(can_list) : 1,
        created_at: new Date().toISOString()
      };
      perms.push(newPerm);
      writeBackupPermissions(perms);
      return { handled: true, result: [{ insertId }] };
    }
    
    if (formattedSql.startsWith('DELETE')) {
      writeBackupPermissions([]);
      return { handled: true, result: [{ affectedRows: perms.length }] };
    }
  }

  return { handled: false };
}
