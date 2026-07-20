import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// .env 파일 읽기 및 파싱 (conf/.env 우선 조회)
let envPath = path.resolve(process.cwd(), '../../conf/.env');
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(process.cwd(), '.env');
}

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

// 배포 명령어 구성 (--quiet 비대화형 옵션 추가하여 프롬프트 무한대기 방지)
const deployCmd = `gcloud run deploy cafehaste-web-sdb --source . --region asia-northeast1 --allow-unauthenticated --project cafehaste-zero --set-env-vars "${envVarsStr}" --port 3000 --quiet`;

console.log('로컬 빌드(npm run build) 가동 중...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('빌드 성공! 구글 클라우드 런 배포 시작...');
  execSync(deployCmd, { stdio: 'inherit' });
  console.log('배포가 성공적으로 완료되었습니다.');

  // [HASTE 임시 제어 우회 수정 지점] - 배포 성공 후 릴리즈 노트 md 파일 자동 생성 및 갱신 훅 기동
  try {
    const rootDir = path.resolve(process.cwd(), '../..');
    const releaseDir = path.join(rootDir, 'docs', 'release');
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }

    // 1) 웹 버전 읽기
    const webPkgPath = path.join(process.cwd(), 'package.json');
    const webPkg = JSON.parse(fs.readFileSync(webPkgPath, 'utf-8'));
    const webVersion = webPkg.version || '2.6.3';

    // 2) 릴리 버전 읽기
    let lillyVersion = '1.0.1';
    const lillyPkgPath = path.join(rootDir, 'src', 'cafehaste-lilly', 'src', 'lilly-electron', 'package.json');
    if (fs.existsSync(lillyPkgPath)) {
      const lillyPkg = JSON.parse(fs.readFileSync(lillyPkgPath, 'utf-8'));
      lillyVersion = lillyPkg.version || '1.0.1';
    }

    // 3) 최근 5개 커밋 로그 가져와서 릴리즈 본문에 임베딩
    let gitLogs = 'No recent commits found';
    try {
      gitLogs = execSync('git log -n 5 --oneline', { encoding: 'utf-8' });
    } catch (e) {}

    // 4) web_[버전].md 자동 생성
    const webReleaseFile = path.join(releaseDir, `web_${webVersion}.md`);
    if (!fs.existsSync(webReleaseFile)) {
      const webContent = `# HASTE Web Platform Release: v${webVersion}

본 문서는 본사 웹 플랫폼(홈페이지 대시보드 및 관리자 API)의 v${webVersion} 자동 배포 릴리즈 노트입니다.

---

## 1. 릴리즈 개요
* **버전**: v${webVersion}
* **적용 날짜**: ${new Date().toISOString().split('T')[0]}
* **작성 주체**: HASTE Deploy Pipeline (Auto-generated)

---

## 2. 최근 개발 및 커밋 내역 (Git Logs)
\`\`\`text
${gitLogs.trim()}
\`\`\`
`;
      fs.writeFileSync(webReleaseFile, webContent, 'utf-8');
      console.log(`[Auto-Release] 🟢 웹 릴리즈 노트 자동 수립 완료: docs/release/web_${webVersion}.md`);
    }

    // 5) lilly_[버전].md 자동 생성
    const lillyReleaseFile = path.join(releaseDir, `lilly_${lillyVersion}.md`);
    if (!fs.existsSync(lillyReleaseFile)) {
      const lillyContent = `# HASTE Lilly Agent Release: v${lillyVersion}

본 문서는 매장 컵 배출 및 커피머신 제어용 릴리 프로그램(Lilly Electron)의 v${lillyVersion} 자동 배포 릴리즈 노트입니다.

---

## 1. 릴리즈 개요
* **버전**: v${lillyVersion}
* **적용 날짜**: ${new Date().toISOString().split('T')[0]}
* **작성 주체**: HASTE Deploy Pipeline (Auto-generated)

---

## 2. 최근 개발 및 커밋 내역 (Git Logs)
\`\`\`text
${gitLogs.trim()}
\`\`\`
`;
      fs.writeFileSync(lillyReleaseFile, lillyContent, 'utf-8');
      console.log(`[Auto-Release] 🟢 릴리 릴리즈 노트 자동 수립 완료: docs/release/lilly_${lillyVersion}.md`);
    }

    // 6) agent_releases.md 대장 자동 누적 업데이트
    const agentReleasesFile = path.join(releaseDir, 'agent_releases.md');
    if (fs.existsSync(agentReleasesFile)) {
      let content = fs.readFileSync(agentReleasesFile, 'utf-8');

      // 6-a) 헤더 버전 교체 (Platform Version Release Notes - v2.6.3 / v1.0.1)
      const headerRegex = /Platform Version Release Notes - v\d+\.\d+\.\d+ \/ v\d+\.\d+\.\d+/;
      content = content.replace(headerRegex, `Platform Version Release Notes - v${webVersion} / v${lillyVersion}`);
      
      const scopeRegex = /1축 본사 웹 플랫폼\(v\d+\.\d+\.\d+ 대역\)\*\*과 \*\*2축 매장 릴리 에이전트\(v\d+\.\d+\.\d+ 대역\)/;
      content = content.replace(scopeRegex, `1축 본사 웹 플랫폼(v${webVersion} 대역)**과 **2축 매장 릴리 에이전트(v${lillyVersion} 대역)`);

      // 6-b) 1축 최상단에 새 웹 버전 삽입 (이미 존재하지 않을 때만)
      const webTargetAnchor = `## 🌐 [1축] 본사 웹 플랫폼 릴리즈 이력 (Unified Web Platform SemVer)`;
      const webVersionHeader = `### 🚀 [v${webVersion}]`;
      if (!content.includes(webVersionHeader)) {
        const webInsertText = `
### 🚀 [v${webVersion}] - ${new Date().toISOString().split('T')[0]} (자동 배포 패치)
*   **최근 배포 자동화 커밋 이력**:
${gitLogs.trim().split('\n').map(line => `    - ${line}`).join('\n')}
`;
        content = content.replace(webTargetAnchor, `${webTargetAnchor}\n${webInsertText}`);
      }

      // 6-c) 2축 최상단에 새 릴리 버전 삽입 (이미 존재하지 않을 때만)
      const lillyTargetAnchor = `## ☕ [2축] 매장 릴리 에이전트 릴리즈 이력 (Independent Lilly SemVer)`;
      const lillyVersionHeader = `### 🚀 [v${lillyVersion}]`;
      if (!content.includes(lillyVersionHeader)) {
        const lillyInsertText = `
### 🚀 [v${lillyVersion}] - ${new Date().toISOString().split('T')[0]} (자동 배포 패치)
*   **최근 배포 자동화 커밋 이력**:
${gitLogs.trim().split('\n').map(line => `    - ${line}`).join('\n')}
`;
        content = content.replace(lillyTargetAnchor, `${lillyTargetAnchor}\n${lillyInsertText}`);
      }

      fs.writeFileSync(agentReleasesFile, content, 'utf-8');
      console.log(`[Auto-Release] 🟢 HASTE 통합 배포 대장(agent_releases.md) 자동 누적 갱신 성공!`);
    }

  } catch (releaseError: any) {
    console.warn('[Auto-Release Warning] 릴리즈 노트 자동 작성 중 경고가 발생했으나 배포를 중단하지는 않습니다:', releaseError.message);
  }
} catch (error) {
  console.error('배포 중 에러가 발생했습니다:', error);
  process.exit(1);
}
