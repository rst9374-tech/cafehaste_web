import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { getDbPool } from '../../database';

const router = Router();

// 1. Resolve storeName to a memberId in web_kakao_members
router.post('/api/admin/kakao-user-resolve', async (req, res) => {
  const { storeName } = req.body;
  if (!storeName) {
    return res.status(400).json({ success: false, message: '지점명(storeName)이 필요합니다.' });
  }

  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query('SELECT id FROM web_kakao_members WHERE store_name = ?', [storeName]);
    if (rows && rows.length > 0) {
      return res.json({ success: true, memberId: rows[0].id });
    }

    // Generate next unique id starting from 90280
    const [maxRows]: any = await dbPool.query('SELECT MAX(id) as maxId FROM web_kakao_members');
    let nextId = 90280;
    if (maxRows && maxRows[0] && maxRows[0].maxId) {
      nextId = Math.max(nextId, maxRows[0].maxId + 1);
    }

    const storeCode = `KKT-${nextId}`;
    const ownerName = '베테랑 점주';
    const email = `kakao_${nextId}@haste.cafe`;
    const phone = '010-0000-0000';
    const approvalStatus = '인증 완료';
    const storeType = '일반';

    await dbPool.query(
      `INSERT INTO web_kakao_members (id, store_name, owner_name, store_code, approval_status, store_type, phone, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextId, storeName, ownerName, storeCode, approvalStatus, storeType, phone, email]
    );

    // Sync with local simulator local_kakao_members.json
    const localKakaoFile = path.join(process.cwd(), 'local_kakao_members.json');
    if (fs.existsSync(localKakaoFile)) {
      try {
        const kakaoUsers = JSON.parse(fs.readFileSync(localKakaoFile, 'utf8'));
        if (Array.isArray(kakaoUsers)) {
          kakaoUsers.push({
            id: nextId,
            storeName,
            store_name: storeName,
            storeCode,
            store_code: storeCode,
            ownerName,
            owner_name: ownerName,
            phone,
            email,
            approvalStatus,
            approval_status: approvalStatus,
            storeType,
            store_type: storeType,
            createdAt: new Date().toISOString()
          });
          fs.writeFileSync(localKakaoFile, JSON.stringify(kakaoUsers, null, 2), 'utf8');
        }
      } catch (e) {
        console.warn('[Local Sync Error] Failed to sync local_kakao_members.json:', e);
      }
    }

    console.log(`[Kakao User Resolved & Created] ${storeName} -> ID: ${nextId}`);
    return res.json({ success: true, memberId: nextId });
  } catch (err: any) {
    console.error('[Kakao User Resolve Error]', err);
    return res.status(500).json({ success: false, message: '카톡 멤버 정보 확인 오류: ' + err.message });
  }
});

// 2. Finalize injected post image URL and correct publish dates (Supports multi-images)
router.post('/api/admin/post-finalize-image', async (req, res) => {
  const { postId, hashFile, hashFiles, dateStr, cleanBody } = req.body;
  if (!postId || !dateStr) {
    return res.status(400).json({ success: false, message: '필수 매개변수(postId, dateStr)가 누락되었습니다.' });
  }

  const filesToProcess: string[] = hashFiles && Array.isArray(hashFiles) 
    ? hashFiles 
    : (hashFile ? [hashFile] : []);

  try {
    const dbPool = await getDbPool();
    let finalContent = cleanBody;

    // Process all matched files and append images to the post content markdown
    for (const file of filesToProcess) {
      const [attachments]: any = await dbPool.query(
        'SELECT file_path FROM web_board_attachments WHERE post_id = ? AND original_name = ?',
        [postId, file]
      );
      if (attachments && attachments.length > 0) {
        const finalUrl = attachments[0].file_path;
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
          finalContent = finalContent + `\n\n![이미지](${finalUrl})`;
        }
      }
    }

    // Find similar post in the same category to link
    let finalizedContent = finalContent;
    try {
      const [postMeta]: any = await dbPool.query('SELECT category, title FROM web_board_posts WHERE id = ?', [postId]);
      if (postMeta && postMeta.length > 0) {
        const category = postMeta[0].category;
        const title = postMeta[0].title;
        const cleanTitle = title.replace(/\[.*?\]\s*/g, '').trim();
        const keywords = cleanTitle.split(' ').filter((w: string) => w.length >= 2);
        let queryStr = 'SELECT id, title FROM web_board_posts WHERE category = ? AND id <> ?';
        const queryParams: any[] = [category, postId];
        
        if (keywords.length > 0) {
          queryStr += ' AND (';
          queryStr += keywords.map((k: string) => {
            queryParams.push(`%${k}%`);
            return 'title LIKE ?';
          }).join(' OR ');
          queryStr += ')';
        }
        queryStr += ' ORDER BY id DESC LIMIT 1';
        
        const [similarRows]: any = await dbPool.query(queryStr, queryParams);
        if (similarRows && similarRows.length > 0) {
          const simPostId = similarRows[0].id;
          const simTitle = similarRows[0].title;
          finalizedContent += `\n\n---\n[비슷한 글: ${simTitle}](/board/${simPostId})`;
        }
      }
    } catch (simErr: any) {
      console.warn('[Similar Post Fetch Warning] Failed to fetch similar post link:', simErr.message);
    }

    const timestamp = dateStr + ' 00:00:00';
    await dbPool.query('UPDATE web_board_posts SET content = ?, created_at = ?, updated_at = ? WHERE id = ?', [
      finalizedContent,
      timestamp,
      timestamp,
      postId
    ]);

    // Also update local simulator JSON files
    const localPostsFile = path.join(process.cwd(), 'local_posts_guide.json');
    if (fs.existsSync(localPostsFile)) {
      try {
        const posts = JSON.parse(fs.readFileSync(localPostsFile, 'utf8'));
        if (Array.isArray(posts)) {
          const [postRows]: any = await dbPool.query('SELECT member_id, title, category FROM web_board_posts WHERE id = ?', [postId]);
          if (postRows && postRows.length > 0) {
            const authorId = postRows[0].member_id;
            const title = postRows[0].title;
            const category = postRows[0].category;
            const alreadyLocal = posts.find(p => p.id === postId);
            if (!alreadyLocal) {
              posts.push({
                id: postId,
                member_id: authorId,
                title: title,
                content: finalizedContent,
                category: category || '노하우팁',
                is_secret: 0,
                skin_type: 5,
                is_notice: 0,
                view_count: 0,
                created_at: new Date(timestamp).toISOString(),
                updated_at: new Date(timestamp).toISOString()
              });
            } else {
              alreadyLocal.content = finalizedContent;
              alreadyLocal.created_at = new Date(timestamp).toISOString();
              alreadyLocal.updated_at = new Date(timestamp).toISOString();
            }
            fs.writeFileSync(localPostsFile, JSON.stringify(posts, null, 2), 'utf8');
          }
        }
      } catch (jsonErr: any) {
        console.error('[Local Sync Error] local_posts_guide.json update failed:', jsonErr.message);
      }
    }

    // Sync all attachments to local_attachments.json
    for (const file of filesToProcess) {
      const [attDetails]: any = await dbPool.query(
        'SELECT id, file_path, file_size, stored_name FROM web_board_attachments WHERE post_id = ? AND original_name = ?',
        [postId, file]
      );
      if (attDetails && attDetails.length > 0) {
        const attId = attDetails[0].id;
        const filePath = attDetails[0].file_path;
        const fileSize = attDetails[0].file_size;
        const sName = attDetails[0].stored_name;
        
        const localAttsFile = path.join(process.cwd(), 'local_attachments.json');
        if (fs.existsSync(localAttsFile)) {
          try {
            const atts = JSON.parse(fs.readFileSync(localAttsFile, 'utf8'));
            if (Array.isArray(atts)) {
              const alreadyLocalAtt = atts.find(a => a.id === attId);
              if (!alreadyLocalAtt) {
                atts.push({
                  id: attId,
                  post_id: postId,
                  original_name: file,
                  stored_name: sName,
                  file_path: filePath,
                  file_size: fileSize,
                  created_at: new Date().toISOString()
                });
                fs.writeFileSync(localAttsFile, JSON.stringify(atts, null, 2), 'utf8');
              }
            }
          } catch (e) {
            console.error('[Local Sync Error] local_attachments.json update failed:', e);
          }
        }
      }
    }

    console.log(`[Post Finalized] Updated content and dates for Post ${postId}`);
    return res.json({ success: true, message: '포스트 최종 본문 가공 및 날짜 보정 완료' });
  } catch (err: any) {
    console.error('[Post Finalize Error]', err);
    return res.status(500).json({ success: false, message: '포스트 후처리 중 결함 발생: ' + err.message });
  }
});

// 3. Fetch already used image hashes to prevent duplicates
router.get('/api/admin/kakao-used-hashes', async (req, res) => {
  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query('SELECT DISTINCT original_name FROM web_board_attachments');
    const hashRegex = /^[a-f0-9]{64}\.(jpg|png|webp|jpeg)$/i;
    const hashes = rows
      .map((r: any) => r.original_name || r.ORIGINAL_NAME)
      .filter((name: string) => name && hashRegex.test(name));
    return res.json({ success: true, hashes });
  } catch (err: any) {
    console.error('[Used Hashes Fetch Error]', err);
    return res.status(500).json({ success: false, message: '기등록 해시 조회 오류: ' + err.message });
  }
});

// 4. Fetch dynamic scan rules (skills)
router.get('/api/admin/kakao-injector-rules', async (req, res) => {
  const localFile = path.join(process.cwd(), 'local_injector_rules.json');
  
  // Seeding default local rules if it doesn't exist to prevent empty skills on local environment
  if (!fs.existsSync(localFile)) {
    const defaultRules = [
      { id: 1, keyword: '세척', titleTemplate: '커피머신 정기 세척 노하우', isActive: true },
      { id: 2, keyword: '청소', titleTemplate: '매장 마감 청소 및 위생 가이드', isActive: true },
      { id: 3, keyword: '에러', titleTemplate: '머신 에러 코드 조치 방법', isActive: true },
      { id: 4, keyword: '호스', titleTemplate: '급배수 호스 꼬임 방지 팁', isActive: true },
      { id: 5, keyword: '필터', titleTemplate: '정수 필터 교환 자가 조치', isActive: true },
      { id: 6, keyword: '냄새', titleTemplate: '배수구 악취 방지 팁', isActive: true },
      { id: 7, keyword: '교체', titleTemplate: '마모 소모품 자가 교체 노하우', isActive: true },
      { id: 8, keyword: '에이드', titleTemplate: '아이스 음료 탄산 주입 팁', isActive: true },
      { id: 9, keyword: '초코', titleTemplate: '초코 파우더 뭉침 해결 방안', isActive: true },
      { id: 10, keyword: '칼리브레이션', titleTemplate: '에스프레소 추출 칼리브레이션 세팅 가이드', isActive: true },
      { id: 11, keyword: '분쇄도', titleTemplate: '그라인더 원두 분쇄도 조절법 및 팁', isActive: true },
      { id: 12, keyword: '원두', titleTemplate: '원두 보관법 및 선도 유지 노하우', isActive: true },
      { id: 13, keyword: '커피', titleTemplate: '스페셜티 커피 추출 비율 및 세팅 팁', isActive: true },
      { id: 14, keyword: '카페', titleTemplate: '개인 카페 매장 운영 효율화 가이드', isActive: true },
      { id: 15, keyword: '손님', titleTemplate: '카페 단골 손님 확보 및 고객 응대 매뉴얼', isActive: true }
    ];
    try {
      fs.writeFileSync(localFile, JSON.stringify(defaultRules, null, 2), 'utf8');
      console.log('[Local Seeding] Seeded default rules to local_injector_rules.json');
    } catch (writeErr: any) {
      console.warn('[Local Seeding Warning] Failed to seed default rules:', writeErr.message);
    }
  }

  if (fs.existsSync(localFile)) {
    try {
      const rules = JSON.parse(fs.readFileSync(localFile, 'utf8'));
      return res.json({ success: true, rules });
    } catch (e) {}
  }

  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query('SELECT * FROM web_kakao_injector_rules WHERE is_active = 1 ORDER BY id ASC');
    const rules = rows.map((r: any) => {
      const id = r.id ?? r.ID;
      const keyword = r.keyword ?? r.KEYWORD;
      const titleTemplate = r.title_template ?? r.TITLE_TEMPLATE ?? r.titleTemplate;
      const isActiveVal = r.is_active ?? r.IS_ACTIVE;
      const isActive = isActiveVal === 1 || isActiveVal === true || isActiveVal === 'true';
      return { id, keyword, titleTemplate, isActive };
    });
    return res.json({ success: true, rules });
  } catch (err: any) {
    console.error('[Fetch Rules Error]', err);
    return res.status(500).json({ success: false, message: '규칙 조회 오류: ' + err.message });
  }
});

// 5. Create or Update scan rule (skill)
router.post('/api/admin/kakao-injector-rules', async (req, res) => {
  const { id, keyword, titleTemplate } = req.body;
  if (!keyword || !titleTemplate) {
    return res.status(400).json({ success: false, message: '키워드와 제목 템플릿은 필수입니다.' });
  }

  try {
    const dbPool = await getDbPool();
    let ruleId = id;

    if (id) {
      await dbPool.query(
        'UPDATE web_kakao_injector_rules SET keyword = ?, title_template = ? WHERE id = ?',
        [keyword, titleTemplate, id]
      );
    } else {
      const [checkRows]: any = await dbPool.query('SELECT id FROM web_kakao_injector_rules WHERE keyword = ?', [keyword]);
      if (checkRows && checkRows.length > 0) {
        ruleId = checkRows[0].id;
        await dbPool.query(
          'UPDATE web_kakao_injector_rules SET title_template = ?, is_active = 1 WHERE id = ?',
          [titleTemplate, ruleId]
        );
      } else {
        const [insertRes]: any = await dbPool.query(
          'INSERT INTO web_kakao_injector_rules (keyword, title_template, is_active) VALUES (?, ?, 1)',
          [keyword, titleTemplate]
        );
        ruleId = insertRes.insertId;
      }
    }

    // Sync with local JSON file
    const localFile = path.join(process.cwd(), 'local_injector_rules.json');
    let rules: any[] = [];
    if (fs.existsSync(localFile)) {
      try {
        rules = JSON.parse(fs.readFileSync(localFile, 'utf8'));
      } catch (e) {}
    }
    const existingIdx = rules.findIndex(r => r.id === ruleId || r.keyword === keyword);
    const newRule = { id: ruleId, keyword, titleTemplate, isActive: true };
    if (existingIdx !== -1) {
      rules[existingIdx] = newRule;
    } else {
      rules.push(newRule);
    }
    fs.writeFileSync(localFile, JSON.stringify(rules, null, 2), 'utf8');

    return res.json({ success: true, message: '규칙이 정상 저장되었습니다.', ruleId });
  } catch (err: any) {
    console.error('[Save Rule Error]', err);
    return res.status(500).json({ success: false, message: '규칙 저장 오류: ' + err.message });
  }
});

// 6. Delete scan rule (soft delete or hard delete)
router.delete('/api/admin/kakao-injector-rules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dbPool = await getDbPool();
    await dbPool.query('DELETE FROM web_kakao_injector_rules WHERE id = ?', [id]);

    // Sync local JSON
    const localFile = path.join(process.cwd(), 'local_injector_rules.json');
    if (fs.existsSync(localFile)) {
      try {
        let rules = JSON.parse(fs.readFileSync(localFile, 'utf8'));
        if (Array.isArray(rules)) {
          rules = rules.filter(r => String(r.id) !== String(id));
          fs.writeFileSync(localFile, JSON.stringify(rules, null, 2), 'utf8');
        }
      } catch (e) {}
    }

    return res.json({ success: true, message: '규칙이 삭제되었습니다.' });
  } catch (err: any) {
    console.error('[Delete Rule Error]', err);
    return res.status(500).json({ success: false, message: '규칙 삭제 오류: ' + err.message });
  }
});

export default router;
