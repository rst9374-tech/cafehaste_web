import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// CONFIGURATION
const RATE_WINDOW_MS = 1000; // 1 second
const MAX_REQUESTS_PER_WINDOW = 200; // 200 requests per second threshold
const BAN_DURATION_MS = 5 * 60 * 1000; // 5 minutes penalty lockout

// BOT DETECTION / WHITELIST (Naver, Google, Kakao, Instagram, YouTube, TikTok etc)
function isPreApprovedSearchBot(ua: string): boolean {
  const normalized = ua.toLowerCase();
  return (
    normalized.includes('googlebot') ||
    normalized.includes('google-co-op') ||
    normalized.includes('google-read-aloud') ||
    normalized.includes('google favicon') ||
    normalized.includes('naverbot') ||
    normalized.includes('yeti') ||
    normalized.includes('kakaotalk') ||
    normalized.includes('facebookexternalhit') ||
    normalized.includes('instagram') ||
    normalized.includes('twitterbot') ||
    normalized.includes('linkedinbot') ||
    normalized.includes('tiktok') ||
    normalized.includes('bytecrawler') ||
    normalized.includes('youtube') ||
    normalized.includes('slackbot') ||
    normalized.includes('discordbot')
  );
}

export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';

  // 1. Bypass rate limiter entirely in development mode, or if requesting from loopback/private subnet
  const isLocalHostOrPrivateIP = 
    ip === '127.0.0.1' || 
    ip === '::1' || 
    ip === 'localhost' || 
    ip.startsWith('10.') || 
    ip.startsWith('192.168.') || 
    ip.startsWith('172.16.') || 
    ip.startsWith('172.17.') || 
    ip.startsWith('172.18.') || 
    ip.startsWith('172.19.') || 
    ip.startsWith('172.20.') || 
    ip.startsWith('172.21.') || 
    ip.startsWith('172.22.') || 
    ip.startsWith('172.23.') || 
    ip.startsWith('172.24.') || 
    ip.startsWith('172.25.') || 
    ip.startsWith('172.26.') || 
    ip.startsWith('172.27.') || 
    ip.startsWith('172.28.') || 
    ip.startsWith('172.29.') || 
    ip.startsWith('172.30.') || 
    ip.startsWith('172.31.');

  if (process.env.NODE_ENV !== 'production' || isLocalHostOrPrivateIP) {
    return next();
  }

  // 1.5 Bypass whitelist bots to ensure high-speed search indexing and page previewing
  if (isPreApprovedSearchBot(userAgent)) {
    return next();
  }

  const now = Date.now();
  let record = rateLimitStore.get(ip);

  // 2. Check blacklist lockout state
  if (record && record.blockedUntil > now) {
    res.setHeader('Retry-After', Math.ceil((record.blockedUntil - now) / 1000));
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: '비정상적인 유입 감지로 인한 단기 접속 제한 상태입니다. 잠시 후 다시 시도해주십시오. (DDoS Protection Active)',
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000)
    });
    return;
  }

  // 3. Evaluate / Roll request count
  if (!record || now - record.windowStart > RATE_WINDOW_MS) {
    // New window or new IP record
    rateLimitStore.set(ip, {
      count: 1,
      windowStart: now,
      blockedUntil: 0
    });
  } else {
    record.count += 1;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      record.blockedUntil = now + BAN_DURATION_MS;
      console.warn(`[DDoS Shield Active] 🚨 IP [${ip}] blocked for ${BAN_DURATION_MS / 1000}s due to speed threshold violation (ReqCount: ${record.count}/${MAX_REQUESTS_PER_WINDOW}). User-Agent: ${userAgent}`);
      
      res.setHeader('Retry-After', BAN_DURATION_MS / 1000);
      res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: '클라우드 과부하 예방을 위한 자동 방화벽 차단 모듈이 작동했습니다. 5분간 외부 요청이 임시 차단됩니다. (Rate Limit Exceeded)',
        retryAfterSeconds: BAN_DURATION_MS / 1000
      });
      return;
    }
  }

  next();
}
