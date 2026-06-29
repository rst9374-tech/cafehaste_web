import { Router } from 'express';
import { saveBase64ToFile } from '../../database';
import { withDbConnection, safeParseJson } from '../../db/common-handler';
import checkpointRouter from './interiors-checkpoints';

const router = Router();

function tryParseJson(jsonStr: string, fieldName: string, interiorId: any) {
  return safeParseJson(jsonStr, []);
}

// 5. Interiors Operations
router.post('/api/interiors/reorder', async (req, res) => {
  const { typeIds } = req.body || {};
  if (!Array.isArray(typeIds)) {
    return res.status(400).json({ success: false, message: '배열 타입의 typeIds가 필요합니다.' });
  }
  try {
    await withDbConnection(async (conn) => {
      for (let i = 0; i < typeIds.length; i++) {
        await conn.query('UPDATE web_interior_layouts SET order_index = ? WHERE type_id = ?', [i, typeIds[i]]);
      }
    });
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
    res.json({ success: true, message: '인테리어 노출 순서가 성공적으로 동기화 저장되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Reorder interiors failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors', async (req, res) => {
  const { id: typeId, title, subtitle, desc, tags, highlights, gallery, videoLinks, mockImage, blueprintImage, visible } = req.body;
  if (!typeId || !title) {
    return res.status(400).json({ success: false, message: '타입 코드 ID 및 명칭은 필수값입니다.' });
  }
  try {
    const cleanMock = saveBase64ToFile(mockImage || '', 'interior_mock');
    const cleanBlueprint = saveBase64ToFile(blueprintImage || '', 'interior_blueprint');
    const cleanGalleryList = Array.isArray(gallery)
      ? gallery.map((item: any) => saveBase64ToFile(item, 'interior_gallery'))
      : [];

    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);
    const highlightsStr = Array.isArray(highlights) ? JSON.stringify(highlights) : JSON.stringify([]);
    const galleryStr = JSON.stringify(cleanGalleryList);
    const videoLinksStr = Array.isArray(videoLinks) ? JSON.stringify(videoLinks) : JSON.stringify(['', '', '']);
    const visibleVal = (visible === undefined || visible === true || visible === 1 || String(visible) === 'true');
    
    await withDbConnection(async (conn) => {
      const [result]: any = await conn.query(
        'INSERT INTO web_interior_layouts (type_id, title, subtitle, `desc`, tags, highlights, gallery, video_links, mock_image, blueprint_image, visible, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE title = VALUES(title), subtitle = VALUES(subtitle), `desc` = VALUES(`desc`), tags = VALUES(tags), highlights = VALUES(highlights), gallery = VALUES(gallery), video_links = VALUES(video_links), mock_image = VALUES(mock_image), blueprint_image = VALUES(blueprint_image), visible = VALUES(visible)',
        [typeId, title, subtitle || '', desc || '', tagsStr, highlightsStr, galleryStr, videoLinksStr, cleanMock, cleanBlueprint, visibleVal]
      );
      if (result.insertId) {
        await conn.query('UPDATE web_interior_layouts SET order_index = id WHERE id = ?', [result.insertId]);
      }
    });
    
    res.json({
      success: true,
      message: '인테리어 디자인 및 도면 정보가 DB에 영구 등록되었습니다.',
      interior: { id: typeId, title, subtitle, desc, tags, highlights, gallery: cleanGalleryList, videoLinks: Array.isArray(videoLinks) ? videoLinks : ['', '', ''], mockImage: cleanMock, blueprintImage: cleanBlueprint, visible: visibleVal }
    });
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
  } catch (err: any) {
    console.error('[API error] Upsert interior failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/interiors/:type_id', async (req, res) => {
  const typeId = req.params.type_id;
  const { title, subtitle, desc, tags, highlights, gallery, videoLinks, mockImage, blueprintImage, visible } = req.body;
  try {
    const cleanMock = saveBase64ToFile(mockImage || '', 'interior_mock');
    const cleanBlueprint = saveBase64ToFile(blueprintImage || '', 'interior_blueprint');
    const cleanGalleryList = Array.isArray(gallery)
      ? gallery.map((item: any) => saveBase64ToFile(item, 'interior_gallery'))
      : [];

    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);
    const highlightsStr = Array.isArray(highlights) ? JSON.stringify(highlights) : JSON.stringify([]);
    const galleryStr = JSON.stringify(cleanGalleryList);
    const videoLinksStr = Array.isArray(videoLinks) ? JSON.stringify(videoLinks) : JSON.stringify(['', '', '']);
    const visibleVal = (visible === undefined || visible === true || visible === 1 || String(visible) === 'true');
    
    await withDbConnection(async (conn) => {
      await conn.query(
        'UPDATE web_interior_layouts SET title = ?, subtitle = ?, `desc` = ?, tags = ?, highlights = ?, gallery = ?, video_links = ?, mock_image = ?, blueprint_image = ?, visible = ? WHERE type_id = ?',
        [title, subtitle || '', desc || '', tagsStr, highlightsStr, galleryStr, videoLinksStr, cleanMock, cleanBlueprint, visibleVal, typeId]
      );
    });
    
    res.json({
      success: true,
      message: '인테리어 디자인 및 도면 정보가 업데이트되었습니다.',
      interior: { id: typeId, title, subtitle, desc, tags, highlights, gallery: cleanGalleryList, videoLinks: Array.isArray(videoLinks) ? videoLinks : ['', '', ''], mockImage: cleanMock, blueprintImage: cleanBlueprint, visible: visibleVal }
    });
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
  } catch (err: any) {
    console.error('[API error] Update interior failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/interiors/:type_id/toggle-visibility', async (req, res) => {
  const typeId = req.params.type_id;
  const { visible } = req.body;
  try {
    const visibleVal = !!visible;
    await withDbConnection(async (conn) => {
      await conn.query('UPDATE web_interior_layouts SET visible = ? WHERE type_id = ?', [visibleVal, typeId]);
    });
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
    res.json({ success: true, message: '인테리어 노출 상태가 변경되었습니다.' });
  } catch (err: any) {
    console.error('[API error] Toggle interior visibility failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/interiors/:type_id', async (req, res) => {
  const typeId = req.params.type_id;
  try {
    await withDbConnection(async (conn) => {
      await conn.query('DELETE FROM web_interior_layouts WHERE type_id = ?', [typeId]);
    });
    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
    res.json({ success: true, message: '해당 인테리어 타입 정보가 삭제되었습니다.', deletedId: typeId });
  } catch (err: any) {
    console.error('[API error] Delete interior failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors/:type_id/save-default', async (req, res) => {
  const typeId = req.params.type_id;
  try {
    const r = await withDbConnection(async (conn) => {
      await conn.query(
        `UPDATE web_interior_layouts 
         SET default_title = title, 
             default_subtitle = subtitle, 
             default_desc = \`desc\`, 
             default_tags = tags, 
             default_highlights = highlights,
             default_gallery = gallery,
             default_video_links = video_links,
             default_mock_image = mock_image,
             default_blueprint_image = blueprint_image
          WHERE type_id = ?`,
        [typeId]
      );

      const [rows]: any = await conn.query('SELECT * FROM web_interior_layouts WHERE type_id = ?', [typeId]);
      return rows[0];
    });

    if (!r) {
      return res.status(404).json({ success: false, message: '인테리어 스타일을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      message: '이 디자인 게시글의 현재 정보가 개별 복원용 디폴트값으로 성공적으로 백업되었습니다.',
      interior: {
        id: r.type_id,
        dbId: r.id,
        title: r.title,
        subtitle: r.subtitle,
        desc: r.desc,
        tags: tryParseJson(r.tags, 'tags', r.id),
        highlights: tryParseJson(r.highlights, 'highlights', r.id),
        gallery: tryParseJson(r.gallery, 'gallery', r.id),
        videoLinks: tryParseJson(r.video_links, 'videoLinks', r.id),
        mockImage: r.mock_image,
        blueprintImage: r.blueprint_image,
        visible: !!r.visible,
        defaultTitle: r.default_title || r.title,
        defaultSubtitle: r.default_subtitle || r.subtitle,
        defaultDesc: r.default_desc || r.desc,
        defaultTags: r.default_tags ? tryParseJson(r.default_tags, 'defaultTags', r.id) : tryParseJson(r.tags, 'tags', r.id),
        defaultHighlights: r.default_highlights ? tryParseJson(r.default_highlights, 'defaultHighlights', r.id) : tryParseJson(r.highlights, 'highlights', r.id),
        defaultGallery: r.default_gallery ? tryParseJson(r.default_gallery, 'defaultGallery', r.id) : tryParseJson(r.gallery, 'gallery', r.id),
        defaultVideoLinks: r.default_video_links ? tryParseJson(r.default_video_links, 'defaultVideoLinks', r.id) : tryParseJson(r.video_links, 'videoLinks', r.id),
        defaultMockImage: r.default_mock_image || r.mock_image,
        defaultBlueprintImage: r.default_blueprint_image || r.blueprint_image,
      }
    });
  } catch (err: any) {
    console.error('[API error] Save interior level default failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/interiors/:type_id/restore-default', async (req, res) => {
  const typeId = req.params.type_id;
  try {
    const r = await withDbConnection(async (conn) => {
      const [rows]: any = await conn.query('SELECT * FROM web_interior_layouts WHERE type_id = ?', [typeId]);
      if (rows.length === 0) return null;
      const r = rows[0];

      const targetTitle = r.default_title || r.title;
      const targetSubtitle = r.default_subtitle || r.subtitle;
      const targetDesc = r.default_desc || r.desc;
      const targetTags = r.default_tags || r.tags;
      const targetHighlights = r.default_highlights || r.highlights;
      const targetGallery = r.default_gallery || r.gallery;
      const targetVideoLinks = r.default_video_links || r.video_links;
      const targetMockImage = r.default_mock_image || r.mock_image;
      const targetBlueprintImage = r.default_blueprint_image || r.blueprint_image;

      await conn.query(
        `UPDATE web_interior_layouts 
         SET title = ?, 
             subtitle = ?, 
             \`desc\` = ?, 
             tags = ?, 
             highlights = ?,
             gallery = ?,
             video_links = ?,
             mock_image = ?,
             blueprint_image = ?
          WHERE type_id = ?`,
        [targetTitle, targetSubtitle, targetDesc, targetTags, targetHighlights, targetGallery, targetVideoLinks, targetMockImage, targetBlueprintImage, typeId]
      );
      return { ...r, title: targetTitle, subtitle: targetSubtitle, desc: targetDesc, tags: targetTags, highlights: targetHighlights, gallery: targetGallery, video_links: targetVideoLinks, mock_image: targetMockImage, blueprint_image: targetBlueprintImage };
    });

    if (!r) {
      return res.status(404).json({ success: false, message: '인테리어 스타일을 찾을 수 없습니다.' });
    }

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }

    res.json({
      success: true,
      message: '이 디자인 게시글이 미리 설정해둔 개별 디폴트값 상태로 성공적으로 원상복구되었습니다.',
      interior: {
        id: typeId,
        dbId: r.id,
        title: r.title,
        subtitle: r.subtitle,
        desc: r.desc,
        tags: tryParseJson(r.tags, 'targetTags', r.id),
        highlights: tryParseJson(r.highlights, 'targetHighlights', r.id),
        gallery: tryParseJson(r.gallery, 'targetGallery', r.id),
        videoLinks: tryParseJson(r.video_links, 'targetVideoLinks', r.id),
        mockImage: r.mock_image,
        blueprintImage: r.blueprint_image,
        visible: !!r.visible,
        defaultTitle: r.default_title || r.title,
        defaultSubtitle: r.default_subtitle || r.subtitle,
        defaultDesc: r.default_desc || r.desc,
        defaultTags: r.default_tags ? tryParseJson(r.default_tags, 'defaultTags', r.id) : tryParseJson(r.tags, 'targetTags', r.id),
        defaultHighlights: r.default_highlights ? tryParseJson(r.default_highlights, 'defaultHighlights', r.id) : tryParseJson(r.highlights, 'targetHighlights', r.id),
        defaultGallery: r.default_gallery ? tryParseJson(r.default_gallery, 'defaultGallery', r.id) : tryParseJson(r.gallery, 'targetGallery', r.id),
        defaultVideoLinks: r.default_video_links ? tryParseJson(r.default_video_links, 'defaultVideoLinks', r.id) : tryParseJson(r.video_links, 'targetVideoLinks', r.id),
        defaultMockImage: r.default_mock_image || r.mock_image,
        defaultBlueprintImage: r.default_blueprint_image || r.blueprint_image,
      }
    });
  } catch (err: any) {
    console.error('[API error] Restore interior level default failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount the modularized checkpoints, reset, sync sub-router
router.use(checkpointRouter);

export default router;
