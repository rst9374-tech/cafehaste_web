import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// .env 파일 읽기 및 파싱
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env 파일이 존재하지 않습니다. 배포를 중단합니다.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // 따옴표 제거
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

// 필수 환경변수 확인
const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_CONNECTION_LIMIT', 'SUPABASE_URL', 'SUPABASE_KEY', 'HASTE_SECRET_LIVE_KEY'];
for (const key of required) {
  if (!envVars[key]) {
    console.error(`.env에 필수 값인 ${key}가 누락되었습니다.`);
    process.exit(1);
  }
}

// deploy 스크립트 실행 환경변수 문자열 조합
const envVarsStr = `DB_HOST=${envVars.DB_HOST},DB_PORT=${envVars.DB_PORT},DB_USER=${envVars.DB_USER},DB_PASSWORD=${envVars.DB_PASSWORD},DB_NAME=${envVars.DB_NAME},DB_CONNECTION_LIMIT=${envVars.DB_CONNECTION_LIMIT},SUPABASE_URL=${envVars.SUPABASE_URL},SUPABASE_KEY=${envVars.SUPABASE_KEY},HASTE_SECRET_LIVE_KEY=${envVars.HASTE_SECRET_LIVE_KEY},NODE_ENV=production`;

// 배포 명령어 구성
const deployCmd = `gcloud run deploy cafehaste-web-sdb --source . --region asia-northeast1 --allow-unauthenticated --project cafehaste-zero --set-env-vars "${envVarsStr}"`;

console.log('로컬 빌드(npm run build) 가동 중...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('빌드 성공! 구글 클라우드 런 배포 시작...');
  execSync(deployCmd, { stdio: 'inherit' });
  console.log('배포가 성공적으로 완료되었습니다. 이어서 Git 히스토리 자동 최적화 및 강제 푸시를 시작합니다...');
  execSync('npm run git:flatten', { stdio: 'inherit' });
} catch (error) {
  console.error('배포 및 최적화 중 에러가 발생했습니다:', error);
  process.exit(1);
}
