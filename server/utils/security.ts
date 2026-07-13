/**
 * 보안 검문소 유틸리티 (HTML Sanitizer)
 * 
 * 글쓰기, 댓글 작성, 외부 카톡 대화록 주입 시
 * 악성 스크립트(XSS) 주입 시도를 데이터베이스 저장 전에 완벽히 차단하고 소독합니다.
 */

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  let clean = html;

  // 1. <script> 태그 및 내부 스크립트 내용 원천 박멸
  clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // 2. HTML 태그 내의 위험한 인라인 이벤트 핸들러 (onload, onerror, onclick, onmouseover 등) 일괄 박멸
  // 예: <img src="x" onerror="alert(1)"> -> <img src="x">
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(["'])(?:.*?)\1/gi, '');
  clean = clean.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');

  // 3. 위험한 javascript: 프로토콜 링크 무력화
  // 예: <a href="javascript:alert(1)"> -> <a href="#">
  clean = clean.replace(/href\s*=\s*(["'])javascript:(?:.*?)\1/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*(["'])javascript:(?:.*?)\1/gi, 'src="#"');

  // 4. 외부 페이지 임베딩 및 폼 가로채기 차단 (iframe, object, embed, form, meta, link)
  clean = clean.replace(/<(iframe|object|embed|form|meta|link)[^>]*>[\s\S]*?<\/\1>/gi, '');
  clean = clean.replace(/<(iframe|object|embed|form|meta|link)[^>]*>/gi, '');

  return clean;
}
