import { Router } from 'express';
import { getDbPool } from '../../database';

const router = Router();

// Search Crawler Promo RSS Feed API 
router.get('/rss', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');

  let posts: any[] = [];
  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query(
      'SELECT id, title, content, category, created_at FROM web_board_posts WHERE is_secret = 0 ORDER BY created_at DESC LIMIT 30'
    );
    posts = rows || [];
  } catch (err) {
    console.warn('[RSS Engine] DB query failed:', err);
  }

  const escapeXml = (unsafe: string) => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const domain = 'https://cafehaste.com';
  const nowStr = new Date().toUTCString();

  let rssItems = '';
  if (posts.length > 0) {
    posts.forEach((post) => {
      const pTitle = escapeXml(post.title);
      const pLink = `${domain}/board/detail/${post.id}`;
      const pDate = new Date(post.created_at).toUTCString();
      const pCategory = escapeXml(post.category || 'Q&A');
      
      const cleanDesc = post.content
        .replace(/<[^>]*>/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .trim();

      rssItems += `    <item>
      <title>${pTitle}</title>
      <link>${pLink}</link>
      <category>${pCategory}</category>
      <description><![CDATA[${cleanDesc.substring(0, 500)}${cleanDesc.length > 500 ? '...' : ''}]]></description>
      <pubDate>${pDate}</pubDate>
      <guid isPermaLink="true">${pLink}</guid>
    </item>\n`;
    });
  } else {
    rssItems = `    <item>
      <title>카페헤이스트 공식 플랫폼에 오신 것을 환영합니다</title>
      <link>${domain}</link>
      <category>Notice</category>
      <description><![CDATA[가비아 및 AI 최적화 기반의 초단기 프리미엄 프랜차이즈 카페헤이스트의 메인넷에 접속해보세요.]]></description>
      <pubDate>${nowStr}</pubDate>
      <guid isPermaLink="false">default_welcome</guid>
    </item>\n`;
  }

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>카페헤이스트 공식 플랫폼</title>
    <link>${domain}</link>
    <description>가비아 및 AI 기반의 프리미엄 카페 헤이스트 관리 기지 RSS 피드</description>
    <language>ko-KR</language>
    <pubDate>${nowStr}</pubDate>
    <lastBuildDate>${nowStr}</lastBuildDate>
    <atom:link href="${domain}/rss" rel="self" type="application/rss+xml" />
\n${rssItems}  </channel>
</rss>`;

  return res.send(rssFeed.trim());
});

export default router;
