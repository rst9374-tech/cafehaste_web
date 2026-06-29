import fs from 'fs';
import path from 'path';

const webDir = process.cwd();
const releasesPath = path.join(webDir, 'RELEASES.md');
const archivePath = path.join(webDir, 'RELEASES_ARCHIVE.md');
const keepCount = 10; // 항상 활성 파일에 유지할 버전의 개수

function archiveReleases() {
  if (!fs.existsSync(releasesPath)) {
    console.error(`[오류] RELEASES.md 파일이 존재하지 않습니다: ${releasesPath}`);
    return;
  }

  const content = fs.readFileSync(releasesPath, 'utf8');
  const lines = content.split('\n');

  // 버전 헤더("## [v...")의 인덱스들을 찾습니다.
  const headerIndices: number[] = [];
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('## [v')) {
      headerIndices.push(idx);
    }
  });

  console.log(`[분석] 현재 RELEASES.md 내 등록된 버전 개수: ${headerIndices.length}개`);

  if (headerIndices.length <= keepCount) {
    console.log(`[알림] 버전 개수가 ${keepCount}개 이하이므로 아카이빙을 진행하지 않습니다.`);
    return;
  }

  // 보존할 최근 10개 버전의 경계선 라인을 구합니다.
  // 10번째 버전의 시작 인덱스 직전까지는 보존하고, 그 이후 라인은 아카이브 대상입니다.
  const splitIdx = headerIndices[keepCount];
  const activeLines = lines.slice(0, splitIdx);
  const toArchiveLines = lines.slice(splitIdx);

  // 아카이브 대상 내용 정제
  let archiveContentToAppend = toArchiveLines.join('\n').trim();
  // 아카이브 본문 하단의 기존 숏링크가 있다면 제거
  archiveContentToAppend = archiveContentToAppend.replace(/\* \(이전 릴리즈 내역은.*?\)/g, '').trim();

  // 기존 RELEASES_ARCHIVE.md 내용 가져오기
  let existingArchiveContent = '';
  const archiveHeader = `# Cafe-Haste Archived Releases (Milestones & Legacy History)\n\n이 문서는 v2.100.0 미만의 과거 릴리즈 변경 히스토리 아카이브입니다.\n\n---\n\n`;

  if (fs.existsSync(archivePath)) {
    const rawArchive = fs.readFileSync(archivePath, 'utf8');
    // 헤더 부분을 떼어내고 본문만 추출합니다.
    existingArchiveContent = rawArchive.replace(archiveHeader, '').trim();
  }

  // 아카이브 파일 갱신 (새로운 아카이브 대상 데이터를 기존 아카이브 상단에 결합)
  const finalizedArchive = `${archiveHeader}${archiveContentToAppend}\n\n${existingArchiveContent}`.trim();
  fs.writeFileSync(archivePath, finalizedArchive, 'utf8');
  console.log(`[성공] RELEASES_ARCHIVE.md에 과거 ${headerIndices.length - keepCount}개 버전 이력 추가 완료.`);

  // 활성 RELEASES.md 갱신
  const finalizedActive = activeLines.join('\n').trim() + `\n\n---\n\n* (이전 릴리즈 내역은 [RELEASES_ARCHIVE.md](file:///${archivePath.replace(/\\/g, '/')})를 참고해 주세요.)\n`;
  fs.writeFileSync(releasesPath, finalizedActive, 'utf8');
  console.log(`[성공] RELEASES.md를 최근 ${keepCount}개 버전으로 경량화 갱신 완료.`);
}

archiveReleases();
