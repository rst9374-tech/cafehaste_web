# Cafe-Haste ReleasesCustom release 2.105.0 cleavage

## [v2.3.0] - 2026-06-26
### Summary
* **[버전 업데이트] recipe 카테고리가 v4.1.0으로 업데이트되었습니다.**
* **[버전 업데이트] license 카테고리가 v1.2.0으로 업데이트되었습니다.**
* **[버전 업데이트] recipe 카테고리가 v4.1.0으로 업데이트되었습니다.**
* **[버전 업데이트] license 카테고리가 v1.2.0으로 업데이트되었습니다.**

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `gcloud/` | `version.json` | CLI 명령어를 통해 recipe 버전을 v4.1.0으로 자동 갱신 및 관련 가이드 문서/코드 동기화 | 없음 |
| `gcloud/` | `version.json` | CLI 명령어를 통해 license 버전을 v1.2.0으로 자동 갱신 및 관련 가이드 문서/코드 동기화 | 없음 |
| `gcloud/` | `version.json` | CLI 명령어를 통해 recipe 버전을 v4.1.0으로 자동 갱신 및 관련 가이드 문서/코드 동기화 | 없음 |
| `gcloud/` | `version.json` | CLI 명령어를 통해 license 버전을 v1.2.0으로 자동 갱신 및 관련 가이드 문서/코드 동기화 | 없음 |

## [v2.109.0] - 2026-06-16
### Summary
* **[신규 Q&A 혜택 비교 게시글 추가]**
  - **헤이스트 멤버십과 일반 멤버십 차이 안내**:
    - ID 209번으로 "헤이스트 멤버십과 일반 멤버십은 어떤 차이가 있나요?" 글을 추가하였습니다.
    - 13대 멤버십 핵심 혜택을 명시하고, 공동구매를 통한 비용 절감 유리함과 음악 서비스 통합 최상위 권한 부여 등을 정중한 어조로 설명하였습니다.
    - `local_posts_qna.json` 및 `seeder.ts` 에 반영 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `local_posts_qna.json`, `server/db/seeder.ts` | 헤이스트 멤버십과 일반 멤버십의 13대 혜택 및 공동구매 우대 내용을 담은 Q&A 게시물 ID 209 추가 및 DB 시딩 목록 동기화 | 없음 |

## [v2.108.0] - 2026-06-16
### Summary
* **[댓글 수정/삭제 기능 추가 및 권한 검증 강화]**
  - **댓글 수정 기능 추가**:
    - 프론트엔드(`board_comp_detail.tsx`) 및 백엔드(`posts.ts`)에 댓글 수정 API(`PUT /api/comments/:id`) 및 UI를 새로 추가하였습니다.
    - 댓글 목록에서 작성자 본인이거나 관리자인 경우 수정 버튼(연필 아이콘)이 노출되며, 클릭 시 인라인으로 내용을 수정 및 완료할 수 있습니다.
  - **댓글 삭제 보안 강화**:
    - 백엔드 `DELETE /api/comments/:id` API에 `memberId` 쿼리스트링 전달 및 권한(작성자 또는 관리자) 검증 로직을 보완하여 비인가 삭제를 원천 차단했습니다.
  - **시뮬레이터 연동**:
    - 로컬 환경 시뮬레이터 핸들러(`board-handler.ts`)에 `UPDATE HASTE_COMMENTS` 처리 구문을 추가하여 로컬에서도 완벽하게 수정 동작이 작동하도록 동기화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/board_page_main.tsx`, `components/board_comp_list.tsx`, `components/board_comp_detail.tsx` | 댓글 수정/삭제 이벤트 핸들링 추가, props 파이프라인 전달, 인라인 수정 폼 UI 및 작성자/관리자 전용 수정 버튼 배치 | 없음 |
| `backend/` | `server/routes/public/posts.ts`, `server/db/simulator-handlers/board-handler.ts` | PUT /api/comments/:id 수정 API 구현 및 DELETE 권한 검증 보완, 로컬 시뮬레이터 UPDATE HASTE_COMMENTS 쿼리 모킹 처리 | 없음 |

## [v2.107.0] - 2026-06-16
### Summary
* **[신규 Q&A 4종 및 가이드 4종 ID 충돌 우회 적용 및 게시글 등록]**
  - **게시글 ID 200번대 마이그레이션**:
    - 기존 DB에 기설정된 ID(111~115)와의 Primary Key 충돌로 인하여 신규 포스트 인서트가 차단되던 이슈를 해결했습니다.
    - 여름철 해충 가이드 4종(ID 201~204) 및 신규 Q&A 4종(ID 205~208)의 ID 대역을 200번대로 격리 마이그레이션하여 충돌을 영구 차단했습니다.
    - 로컬 백업 파일들(`local_posts_guide.json`, `local_posts_qna.json`) 및 DB 시더(`seeder.ts`)를 해당 ID로 일괄 동기화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `local_posts_guide.json`, `local_posts_qna.json`, `server/db/seeder.ts` | 게시글 ID 충돌 방지를 위해 200번대(201~208) 대역으로 격리 업데이트 및 DB 시딩 목록 반영 | 변경 없음 (Board Posts 데이터 시드 추가) |
| `gcloud/` | `RELEASES.md` | v2.107.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.106.0] - 2026-06-15
### Summary
* **[여름철 초파리 및 날벌레 유입 차단/퇴치 실무 가이드 등록]**
  - **운영가이드 게시판 노하우 신규 포스팅**:
    - 여름철 초파리와 날벌레 유입 차단을 위해 점주님들이 직접 터득한 4가지 핵심 관리 가이드(1. 출입문/조명 통제, 2. 기피 향/트랩 배치, 3. 배수구/서비스바 청결, 4. 기타 위생 꿀팁)를 운용가이드 게시판에 각각 개별 글로 등록 완료했습니다.
    - 로컬 백업 파일(`local_posts_guide.json`) 및 DB 시더(`seeder.ts`)에 해당 가이드를 추가하여 시스템 기동 시 자동으로 DB와 동기화되도록 연동했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `local_posts_guide.json`, `server/db/seeder.ts` | 여름철 해충 차단 가이드 4종 데이터 추가 및 DB 시딩 동적 동기화 루프 적용 | 변경 없음 (Board Posts 데이터 시드 추가) |
| `gcloud/` | `RELEASES.md` | v2.106.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.105.0] - 2026-06-13
### Summary
* **[마이페이지/매장안내 UI 리브랜딩 스타일 고도화 및 게시판 작성자 개인정보 익명화]**
  - **마이페이지(내 정보) 라이선스 및 구독 상태 시각화 최적화**:
    - 솔루션 등급을 배지(Badge) 스타일로 개편하고, 중복 노출되던 "인증 완료" 상태 배지를 제거했습니다.
    - 월 정기 구독 활성화 표시인 "구독 중 ACTIVE" 배지의 컬러 테마를 시인성 높은 에메랄드 그린(`approved-green`)으로 교체 적용했습니다.
    - 가입비 30만 원 결제 완료 시 마이페이지 가입비 결제 유도 행이 자동으로 숨김 처리되도록 보완했습니다.
  - **점주 소통 게시판 작성자 성함 익명화**:
    - 게시판 목록, 상세 본문 및 댓글/답변 영역에서 점주 실명을 제외하고 오직 '매장명' 또는 '관리자'로만 노출되도록 익명화 조치하여 개인정보 보호 수준을 강화했습니다.
  - **전국 회원 매장안내 페이지 명칭 표준화**:
    - 전국 회원 매장 리스트 카드에서 프리미엄 매장의 라벨이 기존 솔루션 등급명인 '프리미엄' 대신 공식 매장 유형인 '헤이스트 멤버십'으로 나타나도록 매핑 로직을 표준화했습니다.
  - **메인 페이지 브랜드 비전 로드맵 추가 및 가로폭 커스텀**:
    - 메인페이지 멤버십 절차 안내 구역 바로 위에 지능형 기술 로드맵(Brand Vision) 섹션을 삽입했습니다.
    - 브랜드 스토리 탭의 비전 영역 큰 박스 및 구분선 가로폭 규격을 기존 `max-w-5xl`에서 `max-w-6xl`로 일제히 넓혀 시각적 밸런스를 개선했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/membership_comp_info.tsx`, `components/membership_comp_licensecard.tsx`, `components/store_page_main.tsx`, `components/brand_page_main.tsx`, `components/home_page_main.tsx`, `components/home_comp_showcase.tsx`, `components/board_comp_list.tsx`, `components/board_comp_detail.tsx`, `index.css`, `components/store_types.ts` | 마이페이지 등급 배지화, 구독 ACTIVE 초록색 변경, 전국 매장 목록 프리미엄 -> 헤이스트 멤버십 라벨 변경, 메인페이지 비전 섹션 추가, 음료 쇼케이스 타이틀 TOP10 변경, 브랜드 스토리 비전 박스 max-w-6xl 확장 | 변경 없음 |
| `backend/` | `server/routes/public/auth.ts`, `components/home_hook_app.ts` | 점주 정보 변경 실시간 반영을 위한 사용자 프로필 세션 갱신 API (`/api/user-profile/:storeCode`) 구현 및 마이페이지 진입 시 동적 로드 트리거 연동 | 변경 없음 |
| `gcloud/` | `RELEASES.md` | v2.105.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.104.0] - 2026-06-09
### Summary
* **[검증기 고유번호 스펙 변경 및 Supabase DB 마이그레이션 예외 적용 완료]**
  - **DB 및 로컬 백업 마이그레이션 완수**:
    - `scratch/migration_store_id.ts` 스크립트를 통해 원격 Supabase PostgreSQL `web_store_licenses` 및 `web_membership_users` 테이블 내 `HST-DB-` 및 `HST-DBX-` 고유번호 데이터를 각각 `store` 및 `storex` 규격으로 마이그레이션 완료했습니다.
    - 로컬 백업 파일 `local_licenses.json`도 동일하게 갱신했습니다.
  - **소스코드 고유번호 정규식 및 로직 일괄 보정**:
    - 14개 소스코드 내 고유번호 스펙(HST-DBX- -> storex, HST-DB- -> store) 정규식 검증, 기본값, 테스트 뱃지 분류 조건 및 로그 필터링 로직을 일괄 치환 및 보정 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `serverDefaults.ts`, `server/routes/public/auth.ts`, `server/routes/public/verify.ts`, `server/routes/admin/license_logs.ts`, `scratch/migration_store_id.ts` | 스토어 코드 검증 정규식 교체, 테스트 스토어 ID 기본값 storex1001 적용, 시드 데이터 store1001 형식으로 변경 및 DB 마이그레이션 실행 완료 | `web_store_licenses` 및 `web_membership_users` 테이블 store_id, store_code 데이터 마이그레이션 |
| `frontend/` | `components/membership_hook_signup.ts`, `components/store_page_main.tsx`, `components/admin/admin_comp_licenses_guidebook.tsx`, `components/admin/admin_comp_licenses_guidebook_license.tsx`, `components/admin/admin_comp_licenses_guidebook_validator.tsx`, `components/admin/admin_comp_licenses_validator.tsx`, `components/admin/admin_comp_validator_control.tsx`, `components/admin/admin_comp_validator_logboard.tsx`, `components/admin/admin_hook_licenses_logs.ts`, `components/admin/admin_hook_sim.ts` | 점주 가입 스토어 코드 접두사 맵핑 수정, 실매장 및 시뮬레이터 로그 뱃지 분류 및 필터링 logic을 store/storex 형식으로 교정, 가이드북/테스터 설명서 업데이트 | 변경 없음 |
| `gcloud/` | `RELEASES.md` | v2.104.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.103.0] - 2026-06-07
### Summary
* **[메뉴 게시판 동영상 링크 연동 및 상세 화면 인라인 재생 기능 추가]**
  - **DB 및 시뮬레이터 스키마 갱신**:
    - `web_menu_items` 테이블에 `video_url TEXT NULL` 컬럼을 생성하고, 로컬 시뮬레이터 핸들러(`menu-handler.ts`)에서 INSERT/UPDATE 시 동영상 URL 매핑을 지원하도록 보완했습니다.
  - **어드민 관리 도구 및 필드 확장**:
    - 음료 메뉴 수정/등록 모달에 동영상 URL 입력 필드를 연동하여 DB에 저장 및 보전되도록 변경했습니다.
  - **상세 팝업 내 인라인 플레이어 도입**:
    - 데스크톱 모달(`menu_modal_customize.tsx`) 및 모바일 모달(`menu_modal_customize_mobile.tsx`)의 음료 상세 보기에서 동영상 URL이 존재할 경우 사진 중앙에 플레이 버튼을 표시하고, 클릭 시 유튜브 iframe 및 HTML5 비디오 플레이어를 통해 인라인 재생되도록 구현을 마쳤습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/db/schema-setup.ts`, `server/db/simulator-handlers/menu-handler.ts`, `server/routes/admin/menu.ts`, `server/routes/public/catalog.ts` | web_menu_items 테이블 video_url 컬럼 생성 및 데이터 매핑, 어드민 API 필드 연동 | `web_menu_items` 테이블 내 `video_url TEXT NULL` 추가 |
| `frontend/` | `components/menu_page_main.tsx`, `components/admin/admin_comp_menu.tsx`, `components/admin/admin_comp_menu_table.tsx`, `components/admin/admin_comp_menu_modal.tsx`, `components/menu_modal_customize.tsx`, `components/mobile/menu_modal_customize_mobile.tsx` | 음료 메뉴 및 모달 구조 내 videoUrl 필드 수용, 상세 팝업창 내 인라인 동영상 플레이 및 재생 전환 버튼 연동 | 변경 없음 |
| `gcloud/` | `RELEASES.md` | v2.103.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.102.0] - 2026-06-07
### Summary
* **[점주소통게시판 헤이스트소식/Q&A 게시글 노출 수정 및 seeder 동기화]**
  - **DB 자동 시딩 및 보정**:
    - `web_membership_users` 테이블에 본사 마스터 계정(ID: 1)이 없을 경우 `INNER JOIN` 제약으로 인해 게시글이 전체 누락되던 현상을 해결하기 위해, seeder에 본사 마스터 계정 자동 시딩 코드를 추가했습니다.
    - `web_board_posts` 테이블이 비어있을 경우 Q&A 4개 및 헤이스트소식 1개 게시글(ID: 100~105)이 프로덕션 DB 기동 시 자동으로 인서트되도록 `seeder.ts`를 보강했습니다.
  - **카테고리 매핑 및 승인 상태 조건 완화**:
    - `posts.ts`에서 게시글 작성 시 유저의 가입 인가 승인 상태 검사를 기존 `'승인'`에서 표준 상태명인 `'인증 완료'`도 지원하도록 조건을 보완했습니다.
    - 시뮬레이터 및 `board_io.ts`에서 `'공지사항'` 카테고리를 신규 명칭인 `'헤이스트소식'`으로 완벽하게 연동 및 마이그레이션 처리되도록 동기화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/db/seeder.ts`, `server/routes/public/posts.ts`, `server/db/board_io.ts`, `server/db/simulator-handlers/board-handler.ts` | 본사 마스터 계정 및 6대 게시글 자동 시딩 코드 추가, 인증완료 등급 조건 추가, 헤이스트소식 카테고리 매핑 동기화 | 변경 없음 |
| `gcloud/` | `RELEASES.md` | v2.102.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.101.0] - 2026-06-06
### Summary
* **[게시판 등급별 접근 권한 API 구현 및 404 JSON 에러 해결]**
  - **API 엔드포인트 구현**:
    - `/api/grade-permissions` (GET) 및 `/api/grade-permissions/update` (POST)를 처리하는 전용 라우터 `server/routes/public/permissions.ts` [NEW]를 신설하고, `public.ts` 메인 라우터에 마운트하여 404 HTML 반환으로 인한 JSON 파싱 에러를 해결했습니다.
  - **DB 테이블 및 시드 추가**:
    - `web_grade_permissions` 테이블을 스키마(`schema-setup.ts`)에 정의하고, 최초 DB 기동 시 기본 등급(일반, 직영점, 임원, 프리미엄)에 대한 기본 권한 조합을 soft-patching하도록 `seeder.ts`를 보완했습니다.
  - **시뮬레이터 격리 준수**:
    - 로컬 환경에서 해당 테이블 쿼리가 발생할 때 로컬 백업 JSON 파일(`local_permissions.json`)을 이용하여 CUD가 이루어지도록 `simulator.ts` 및 `board-handler.ts` 시뮬레이션 인터셉터를 적용했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/routes/public/permissions.ts` [NEW], `server/routes/public.ts`, `server/db/schema-setup.ts`, `server/db/seeder.ts`, `server/db/simulator.ts`, `server/db/simulator-handlers/board-handler.ts`, `server/db/board_io.ts`, `server/database.ts` | 등급별 권한 관리 API 신설, DB 스키마/시드 주입 및 로컬 시뮬레이터 파일 격리 I/O 연동 | `web_grade_permissions` 테이블 생성 및 Sequence auto-heal 동기화 추가 |
| `gcloud/` | `RELEASES.md` | v2.101.0 릴리스 이력 기재 완료 | 변경 없음 |


---

* (이전 릴리즈 내역은 [RELEASES_ARCHIVE.md](file:///c:\Users\김성규\Desktop\HASTE-Company\cafehaste-web\RELEASES_ARCHIVE.md)를 참고해 주세요.)
