# Agent Work Log

이 파일은 에이전트 작업 로그입니다.

중요한 저장, ingest, query, lint 작업이 끝날 때 한 줄씩 추가합니다.

형식:

```text
YYYY-MM-DD HH:mm | command | summary | linked files
```

## Log

2026-06-11 08:25 | save | HASTE Company 업무용 AI 위키 템플릿 환경 설정 및 인덱스 통합 완료 | [[index.md]], [[wiki_index.md]], [[CLAUDE.md]], `AGENTS.md(이관 삭제)`
2026-06-11 08:30 | save | 카파시 템플릿 규격에 맞게 15개 기존 문서를 AI-Sessions/wiki로 이동, YAML frontmatter 추가 및 인덱스 숏링크 업데이트 완료 | [[index.md]], [[wiki_index.md]], 15개 위키 문서들
2026-06-11 18:27 | save | '평생' 단어 전면 제거 및 파트너십 섹션 요약/단축, 단일 버튼 전환 구현 완료 | [[brain_rules.md]], `home_comp_partnership.tsx`, `franchise_page_main.tsx`, `membership_comp_diagram.tsx`
2026-06-17 02:32 | save | 에이전트 스크립트 경로 버그 교정, 위키 Linter 코드블록/백틱 오작동 개선, 규약서 금지어 백틱 처리 완료 및 Auto-Indexing 자동화 구축 | `validate_wiki.ts`, [[wiki_index.md]], `RELEASES.md`
2026-06-17 10:46 | save | Supabase Storage 고아 파일 가비지 컬렉터 스크립트 및 관리자 API 추가, /최적화 에이전트 룰 연동 및 릴리즈 버전(1.2.0) 업데이트 완료 | `clean_orphaned_attachments.ts`, `clean.ts`, `package.json`, `developer_rules.md`, `RELEASES.md`, [[log.md]]
2026-06-17 13:10 | save | 카테고리당 최대 100개 상한 CTE 쿼리 튜닝, 임시 글 필터링 및 카테고리 정렬 적용, 누적 94개 꿀팁 이관, 3종 중복 병합, 내부 R&R 및 공개용 조직도 분리 완료 | `posts.ts`, [[AGENT_ORGANIZATION.md]], [[PUBLIC_ORGANIZATION.md]], `local_posts_guide.json`, `local_posts_qna.json`
2026-06-17 21:25 | save | AI 토큰 최적화를 위한 .cursorignore 필터링 추가, 대용량 로그 삭제, 조직도 다이어트(벨라/레오 통합) 및 위키 감사 완료 | [[AGENT_ORGANIZATION.md]], [[log.md]], `.cursorignore`
2026-06-19 08:16 | save | 대용량 AI 세션 파일 백업(8.2MB) 및 RELEASES.md(91KB) 인덱싱 제외 (.cursorignore 고도화) 완료 | [[log.md]], `.cursorignore`
2026-06-19 08:20 | save | 미사용 과거 AI 대화 백업 폴더(8.2MB) 물리적 영구 삭제 및 위키 무결성 감사 완료 | [[log.md]]
2026-06-19 08:24 | save | 신규 위키 가이드북 2종(에이전트 협업 및 제어, DB 소프트패칭) 개설 및 인덱스 숏링크 동기화 완료 | [[wiki_index.md]], [[index.md]], [[ai_agent_collaboration_guide.md]], [[backup_softpatch_guide.md]]
2026-06-19 08:25 | save | 대용량 RELEASES.md(91KB)를 최근 본(137줄)과 과거 백업(RELEASES_ARCHIVE.md, 791줄)으로 분할 아카이빙 완료 | [[log.md]], `RELEASES.md`, `RELEASES_ARCHIVE.md`
2026-06-19 08:28 | save | 백업 가동용 릴리즈 자동 아카이빙 스크립트(archive_releases.ts) 및 npm script 단축어 신설 완료 | [[log.md]], `package.json`, `archive_releases.ts`
2026-06-19 08:41 | save | 대용량 히스토리 파일(antigravity_spec.md, 1.13MB) 영구 삭제 및 위키 인덱스 링크 정리 완료 | [[wiki_index.md]], [[log.md]]
2026-06-19 08:44 | save | 미사용 임시 스크립트 및 꿀팁 데이터(scratch/) 자율 정리 및 자동 최적화 룰 반영 완료 | [[log.md]], `AGENTS.md`, `developer_rules.md`
2026-06-19 08:46 | save | /최적화 (find-deadcode 검사, 500줄 파일 점검, 고아 첨부파일 청소, 에이전트 릴리즈 1.3.0 업데이트) 완료 | [[log.md]], `RELEASES.md` (agent)
2026-06-19 08:48 | save | cafehaste-etc 인덱싱 차단 및 cafehaste-agent/scratch/ 임시 파일 30여 개 영구 삭제 완료 | [[log.md]], `.cursorignore`
2026-06-19 09:15 | save | 미사용 임시 꿀팁 텍스트 파일(temp_tip_post.txt) 삭제 및 토큰 낭비 요인 조사 완료 | [[log.md]]
2026-06-19 09:27 | save | uploads/ 및 external_uploads/ 대용량 mock 이미지 자산 정리(97.2MB 절약) 및 누락 파일 자동 대체 로직 반영 완료 | [[log.md]], `server.ts`
2026-06-19 09:36 | save | git 히스토리 강제 초기화(Flattening) 완료 (.git 폴더 620MB -> 5.05MB 압축 완료) | [[log.md]]
2026-06-19 09:42 | save | 카톡 주입용 스크립트 4종을 scripts/kakao-injector/ 하위 폴더로 이동 및 정리 완료 | [[log.md]]
2026-06-19 09:47 | save | Supabase 리다이렉션 도메인 수정 및 /api/members/:id/total-likes 404/JSON 파싱 에러 교정 완료 | [[log.md]], `server.ts`, `server/routes/public/auth.ts`
2026-06-19 09:49 | save | 로컬 및 클라우드 검증 로그 자동 소거 주기 조정 (90일 -> 1일) 완료 | [[log.md]], `server/db/verify-logger.ts`
2026-06-19 09:56 | save | 전체 워크스페이스 내 구버전 Supabase 도메인 전수 교정 완료 | [[log.md]], `scripts/kakao-injector/upload_existing_images.ts`
2026-06-19 09:59 | save | 구글 클라우드 런 실서버 배포(cafehaste-web-sdb) 성공 및 도메인 교정 적용 완료 | [[log.md]], `scripts/deploy_runner.ts`
2026-06-19 10:01 | save | /uploads/ 누락 시 fallback 경로에 dist/no-image.png 추가하여 net::ERR_INVALID_REDIRECT 해결 완료 | [[log.md]], `server.ts`
2026-06-19 10:07 | save | /uploads/ 누락 시 Supabase 카테고리 매핑 리다이렉션 복구하여 원본 메뉴 이미지 로드 완료 | [[log.md]], `server.ts`
2026-06-19 10:13 | save | SUPABASE_URL 및 SUPABASE_KEY 값에 포함된 개행문자(%0A) 제거를 위한 trim 처리 반영 완료 | [[log.md]], `server.ts`, `server/database.ts`, `server/routes/public/catalog.ts`, `server/routes/public/posts.ts`
2026-06-19 10:23 | save | 깃 커밋 히스토리 재초기화(Flattening) 완료 (단일 커밋으로 압축 및 강제 푸시 완료) | [[log.md]]
2026-06-19 10:24 | save | 깃 히스토리 자동 초기화 스크립트(flatten_git.ts) 추가 및 배포 스크립트(deploy_runner.ts) 자동 연동 완료 | [[log.md]], `package.json`, `scripts/flatten_git.ts`, `scripts/deploy_runner.ts`
2026-06-19 10:25 | save | AI 토큰 낭비 방지를 위해 .cursorignore 파일에 OS 임시파일, 에디터 백업, IDE 설정, 테스트 커버리지, DB 파일 추가 설정 완료 | [[log.md]], [[.cursorignore]]
2026-07-12 03:25 | save | 토스 키오스크 옵션 아키텍처 개편 및 관리자 레시피 매핑 그리드 UI, 기본 온도 필터, 실시간 검증창 추가 완료 | [[log.md]], `membership_comp_toss.tsx`, `admin_page_test_validator.tsx`, `menu.ts`
