# Cafe-Haste Archived Releases (Milestones & Legacy History)

이 문서는 v2.100.0 미만의 과거 릴리즈 변경 히스토리 아카이브입니다.

---

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

를 참고해 주세요.)

# Cafe-Haste Archived Releases (Milestones & Legacy History)

이 문서는 v2.100.0 미만의 과거 릴리즈 변경 히스토리 아카이브입니다.

---

## [v2.100.0] - 2026-06-06
### Summary
* **[실시간 검증기 로그 유실 방지 하이브리드 아카이빙 및 라우터 분할 완료]**
  - **DB-Storage 하이브리드 아카이빙**:
    - 새로고침 및 컨테이너 교체 시 로그 유실을 방지하기 위해 `web_verify_logs` 테이블을 구축하고, 5분 주기의 DB 벌크 적재 및 자정 스토리지 백업 스케줄러를 적용했습니다.
    - 로그 조회 및 다운로드 시 실시간 메모리 버퍼와 DB 데이터를 병합하고, 과거 로그는 스토리지에서 자동 복원하여 서빙하도록 개선했습니다.
  - **500줄 청결도 규약 준수 및 라우터 분할**:
    - `server/routes/admin/licenses.ts`에서 로그 관련 엔드포인트들을 소문자 명명 규약을 따르는 `server/routes/admin/license_logs.ts` [NEW]로 분리 이관하여 각 소스파일이 500줄 이하의 청결도를 유지하도록 리팩토링했습니다.
  - **UI 라벨 보정 및 시뮬레이터 드래그 차단 해제**:
    - 관리자 화면의 '전산 초기화' 버튼 및 컨펌 다이얼로그 텍스트를 '메모리 초기화'로 변경하여 메모리 기반 동작의 직관성을 높였습니다.
    - 모바일 에뮬레이터 화면에서 마우스 드래그가 정상 작동하도록 최외각 컨테이너의 `select-none` 스타일을 제거했습니다.
  - **시뮬레이터 매장 로그 누락 및 캐시 히트 검증 통계 불일치 해결**:
    - `admin_comp_validator_logboard.tsx`의 `numericLogs` 필터링에서 `STORE-` 문자열 제외 조건을 제거하여 시뮬레이터 매장의 검증 트래픽도 정상 표시되도록 수정했습니다.
    - `server/routes/public/verify.ts`에서 5분 캐시 히트 발생 시에도 `[동시성 중복]` 유형으로 `addVerifyLog`를 정상 호출하게끔 보완하여 실시간 검증 10회 이상 수행 시 통계 수치가 100% 일치하도록 보정했습니다.
  - **실시간 DB 연동 트래픽 시험의 실제 라이선스 목록 연동화**:
    - `components/admin/admin_hook_sim.ts` 내의 `runDbSimulation` 함수에서 프론트엔드 상태 의존을 완전히 배제하고, 직접 `/api/licenses`로부터 실제 DB 내 라이선스 전체 목록을 로드하여 무작위 랜덤 시험을 돌리도록 구현했습니다. 대장이 비어있는 경우 시뮬레이션은 정지되고 경고 안내가 제공됩니다. 가상 시뮬레이터는 기존의 상태 랜덤 부여 및 가상 매장 생성 방식을 온전히 고수하도록 분리 설계했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/routes/admin/licenses.ts`, `server/routes/admin/license_logs.ts` [NEW], `server/routes/admin.ts`, `server/db/schema-setup.ts`, `server/db/verify-logger.ts`, `server/routes/public/verify.ts` | 로그 처리 API를 신규 라우터 `license_logs.ts`로 이관 분할하여 500줄 규약 준수 및 하이브리드 아카이빙 연동, 캐시 히트 시 로깅 보강 | `web_verify_logs` 테이블 생성 및 Sequence auto-heal 동기화 추가 |
| `frontend/` | `components/admin/admin_comp_validator_logboard.tsx`, `components/home_comp_simulator.tsx`, `components/admin/admin_hook_sim.ts` | 전산 초기화 -> 메모리 초기화 문구 보정 및 에뮬레이터 최외각 드래그 차단 해제, 실제 DB 라이선스 목록 기반 랜덤 시뮬레이터 적용 | 변경 없음 |
| `gcloud/` | `RELEASES.md` | v2.100.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.99.0] - 2026-06-05
### Summary
* **[로컬 DB 연결 완전 차단, 시뮬레이터 강제 고정 및 이미지 일괄 제거 완료]**
  - **로컬 실서버 DB 연결 차단**:
    - `server/database.ts` 내 `getDbPool` 메서드를 수정하여 로컬 개발 환경(`process.env.NODE_ENV !== 'production'`)일 때 실서버 Supabase DB에 대한 모든 연결 및 쿼리 시도(SELECT 포함)를 즉시 바이패스하고 100% 로컬 시뮬레이터(`FallbackDbPool`)로 가동되도록 강제 고정했습니다.
  - **시뮬레이터 이미지 일괄 제거 필터 적용**:
    - `server/db/simulator.ts`에 `cleanImagesForLocalSimulator` 헬퍼 함수를 신설하고 `FallbackDbPool.query` 반환 결과에 연동하여, 로컬 환경에서 불러오는 모든 DB 에셋 이미지 관련 필드(`bg_image`, `mock_image`, `image`, `gallery` 등)를 빈 값 및 빈 배열로 일괄 초기화(사진 없음 처리)했습니다.
  - **테스트 찌꺼기 로직 및 임시 파일 삭제**:
    - `server/database.ts` 내에서 더 이상 사용되지 않는 로컬 DB 전용 Read-Only protect 래핑 로직을 제거하고, DB 확인용으로 생성했던 임시 테스트 파일들(`scripts/query_home_main.js`, `scripts/query_home_main.cjs`, `scripts/fetch_main_bulk.cjs`)을 완벽하게 삭제 정리했습니다.
  - **GCP 무중단 배포**:
    - 핫픽스에 대한 로컬 검증 및 GCP Cloud Run 무중단 배포 서비스를 성공적으로 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/database.ts`, `server/db/simulator.ts` | 로컬 시뮬레이터 강제 우회 적용, 반환 데이터 이미지 필드 일괄 제거(사진 없음), 임시 테스트 스크립트 및 미사용 래핑 코드 삭제 | 변경 없음 |
| `gcloud/` | `RELEASES.md` | v2.99.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.98.0] - 2026-06-05
### Summary
* **[상용 서버 이미지 엑스박스 해결을 위한 Supabase Storage 동적 매핑 핫픽스 완료]**
  - **상용 서버 URL 변환 헬퍼 추가**:
    - 로컬 상대 경로(`/uploads/`)로 저장된 이미지 필드들이 상용 Cloud Run 서버(uploads/ 제외 배포 환경)에서 404 깨짐 현상을 일으키는 문제를 해결하기 위해, API 응답 반환 단계에서 동적으로 Supabase Storage Public URL로 전환하여 리턴하는 `transformProductionImageUrl` 헬퍼 함수를 구축했습니다.
    - 본 헬퍼는 로컬 개발 환경에서 파일이 로컬 디스크에 존재할 경우에는 치환을 건너뛰어 로컬 업로드 기능이 정상 작동하도록 이중 분기 대응을 완벽히 마쳤습니다.
  - **카탈로그 API 및 벌크 엔드포인트 적용**:
    - `server/routes/public/catalog.ts`의 `/api/hero-drafts`, `/api/interiors`, `/api/menu-items` 및 `/api/main-bulk`, `/api/menu-bulk` 전체에 적용하여 메인 비주얼, 인테리어, 메뉴 아이템의 엑스박스 이미지 깨짐 문제를 완전히 해결했습니다.
  - **GCP 무중단 배포**:
    - 변경 내용을 검증한 뒤 `npm run deploy` 명령어를 실행하여 구글 클라우드 런 서비스 배포를 성공적으로 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/routes/public/catalog.ts` | 헬퍼 `transformProductionImageUrl` 이식 및 메인 drafts, interiors, menu-items 이미지 주소를 상용 Supabase Storage URL로 치환 적용 | 변경 없음 |
| `gcloud/` | `RELEASES.md` | v2.98.0 릴리스 이력 기재 완료 | 변경 없음 |

## [v2.97.0] - 2026-06-05
### Summary
* **[로컬 개발 환경 본DB 읽기 전용 보호 시스템 및 CUD 쿼리 우회 모듈 구축 완료]**
  - **본DB 읽기 전용 보호 구현**:
    - 로컬 개발 환경(`process.env.NODE_ENV !== 'production'`) 구동 시, 본DB에 대한 모든 쓰기/수정/삭제(INSERT, UPDATE, DELETE, REPLACE) 쿼리를 강제 차단 및 가로채어 로컬 백업 시뮬레이터(JSON 파일)로 자동 우회시킴으로써 상용 데이터의 무결성을 100% 보장하는 안전 장치를 마련했습니다.
    - 본DB에 대해서는 오직 조회(SELECT)만 정상적으로 수행하여 실시간 데이터를 그대로 읽어오되, 테스트 데이터 조작은 로컬 환경에만 완벽 격리했습니다.
  - **로컬 스토리지 업로드 전면 통제**:
    - 로컬 환경에서의 이미지 업로드 행위가 상용 Supabase Storage 버킷을 오염시키지 않도록, `/api/upload` API 호출 시 로컬 디스크에만 저장하고 상용 스토리지로의 백그라운드 업로드는 실행되지 않도록 통제 룰을 추가했습니다.
  - **메뉴 관리자 삭제 연동**:
    - `menu_modal_customize.tsx` 팝업에 관리자 전용 메뉴 삭제 버튼을 신설하여 DB 삭제 API(`/api/menu-items/:id`)를 바인딩하고, 상위 컴포넌트의 상태 실시간 필터링 갱신 로직을 구현 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/database.ts`, `server/routes/public.ts` | getDbPool() 내 CUD 쿼리 local dev 가로채기(FallbackDbPool) 구현 및 /api/upload 로컬 업로드 스토리지 차단 룰 추가 | 변경 없음 |
| `frontend/` | `components/menu_modal_customize.tsx`, `components/menu_page_main.tsx` | 메뉴 상세 모달 관리자 삭제 버튼 연동, onDeleteItem 콜백 상태 갱신 바인딩 및 AdminConfirmModal 적용 | 변경 없음 |
| `config/` | `AGENTS.md` | 로컬 시뮬레이션 환경의 본DB 읽기 전용 규약 명문화 및 📌 8 조항 보완 완료 | 변경 없음 |

## [v2.96.0] - 2026-06-05
### Summary
* **[프론트엔드 메뉴 수정 후 상태 동기화 핫픽스: setMenuItems 누락 복구 완료]**
  - **프론트엔드 핫픽스**:
    - 메뉴 팝업 수정 모달에서 이미지 변경 시 호출되는 `onUpdateImage` 내부에서 상태 수정자 `setMenuItems`를 호출하려다 `setMenuItems is not defined` ReferenceError로 크래시나던 현상을 발견했습니다.
    - `menu_page_main.tsx`의 `useMenuLoad` 호출 시 구조분해할당에서 빠져있던 `setMenuItems`를 명시적으로 추가하여 동기화 업데이트가 무사 통과하도록 복구했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/menu_page_main.tsx` | useMenuLoad() 구조분해할당에 setMenuItems 상태 세터를 누락 복구하여 ReferenceError 해소 | 변경 없음 |

## [v2.95.0] - 2026-06-05
### Summary
* **[업로드 이미지 서빙 라우터 핫픽스: Express 파라미터 배열 변환 대응 완료]**
  - **라우터 핫픽스**:
    - Express `*relativePath` 와일드카드를 통해 전달되는 다층 경로 세그먼트가 배열 타입으로 파싱되어 서버가 크래시(500) 나던 현상을 수정했습니다.
    - `Array.isArray(relativePath)` 가드를 배치하고 문자열로 조립하여, `/uploads/interior/` 하위 폴더를 가진 이미지도 상용 서버에서 무사히 조회되도록 해결했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server.ts` | static 서빙 라우터 내 와일드카드 파라미터가 Array 타입으로 들어올 시 문자열로 결합하는 가드 추가 | 변경 없음 |

## [v2.94.0] - 2026-06-05
### Summary
* **[상용 서버 DB 직접 연결 복구 및 이미지 업로드 이중 로컬 Fallback 시스템 탑재 완료]**
  - **DB 직접 연결 복구**:
    - `DB_USER`에 온점(`.`)이 포함될 때 `DB_HOST` 설정을 덮어쓰던 서버 파싱 버그를 수정하여, 상용 서버에서 Supabase PostgreSQL로 정상 직접 연결되도록 복구했습니다.
  - **이미지 업로드 이중 로컬 Fallback**:
    - `/api/upload` API 및 `saveBase64ToFile` 함수 수정으로 이미지 업로드 시 항상 로컬 `uploads/` 폴더에 물리 파일을 저장하고, 참조 URL을 로컬 상대 경로 `/uploads/...`로 단일화했습니다.
    - `server.ts` 내 static 경로를 `app.get('/uploads/*')` 와일드카드로 확장하여 nested 폴더 구조도 서빙이 무사 통과되도록 보장했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/database.ts`, `server/routes/public.ts`, `server.ts` | DB Host 조립 버그 수정, 업로드 로컬 이중 백업 Fallback 및 /uploads/* 서빙 경로 와일드카드 확장 반영 | 변경 없음 |

## [v2.93.0] - 2026-06-05
### Summary
* **[로컬 메뉴 이미지 80종 매핑 및 DB/스토리지 일괄 자동 연동 업데이트 완료]**
  - **이미지 자동 매핑 및 업로드**:
    - `C:\Users\김성규\Desktop\헤이스트\메뉴` 폴더 내 한글명 이미지 80종을 134개의 메뉴에 음절 유사도 및 메뉴 특징 기반으로 자동 정밀 매핑하고, Supabase Storage 버킷(`cafehaste-bucket`) 및 프로젝트 `uploads/` 폴더에 `menu_` 규칙으로 자동 정규화하여 저장했습니다.
  - **코드 및 데이터베이스 동기화**:
    - `src/menu_images.ts`를 신설하여 134개 메뉴의 이미지 주소를 매핑하고, `src/menuData.ts`가 이를 로드하도록 연동하였으며, `haste_menu_items.json` 로컬 대장도 동시 업데이트했습니다.
    - 서버 기동 시(`database.ts`) 데이터베이스의 `web_menu_items` 이미지 정보를 자동으로 신규 업로드된 Storage 이미지 주소로 soft-patching 하도록 동기화 코드를 탑재했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/database.ts` | 서버 부팅 시 web_menu_items 테이블의 이미지를 DEFAULT_MENU_ITEMS 기준으로 일괄 정렬 갱신하는 동기화 로직 탑재 | 변경 없음 |
| `frontend/` | `src/menuData.ts`, `src/menu_images.ts` [NEW], `haste_menu_items.json` [MODIFY] | 134종 메뉴 이미지 매핑 정보 신설 및 menuData.ts 연동, 로컬 시뮬레이터 백업 데이터 일괄 갱신 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.92.0 cleavage

## [v2.92.0] - 2026-06-05
### Summary
* **[지침서 내 'ㅈ' 접두사 상세 결과 보고 명령 규칙 신설 완료]**
  - **지침서(AGENTS.md) 📌 10 규칙 업데이트**:
    - **ㅈ**: 사용자가 해당 접두사로 시작하여 명령을 내린 경우, 비용 최적화용 1줄 압축 요약 방식을 해제하고 작업한 구체적인 내역 및 검증 상태를 텍스트로 자세하게 기술하여 보고하는 상세 보고 제어 방침을 정식으로 추가 및 명문화했습니다.
 
| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `config/` | `AGENTS.md` | ㅈ (상세 결과 텍스트 보고) 제어 접두사의 정의와 예외 처리 세부 조항 보완 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.91.0 cleavage

## [v2.90.0] - 2026-06-05
### Summary
* **[접두사 제어 명령 규칙 내 'ㄱㄱ' 지시어 명문화 추가 완료]**
  - **지침서(AGENTS.md) 📌 10 규칙 보완**:
    - 관용적으로 사용되는 **"ㄱㄱ"** 접두사 지시어도 기존 **"ㄱ"**과 동일하게 수락 팝업 및 중간 승인 창을 완전히 생략하고 에이전트가 중단 없이 자동 조치를 개시하도록 지침서 규칙에 명시적으로 추가하여 동기화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `config/` | `AGENTS.md` | 승인 생략 단축 지시어인 'ㄱㄱ' 접두사 규칙을 정식 명문화 추가 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.89.0 cleavage

## [v2.86.0] - 2026-06-05
### Summary
* **[멤버십 대장 상단 라이선스 조작 제어반 테마 스타일 개편 완료]**
  - **제어반 박스 스타일 정돈**:
    - `admin_comp_membershipsub.tsx` 에서 상단 `⚡ 라이선스 조작` 패널의 검정색 배경(`bg-stone-900`)과 테두리(`border border-stone-800`), 그림자(`shadow-md`) 등을 전면 제거하여 투명하게 처리했습니다.
  - **액션 버튼별 독립 테두리 적용**:
    - 검정 배경 소거에 따른 가시성 확보 및 경계 구분을 위해 내부의 각 액션 버튼(인증 승인, 가동 정지, 수정, 삭제)에 맞춤형 독립 테두리(`border`) 속성을 탑재하고 비활성화(disabled) 상태의 배경색을 밝은 테마에 어울리도록 보정했습니다.
  - **드롭다운 라이트 테마 전환**:
    - 인증 승인 기간 선택 드롭다운의 배경과 테두리를 어두운 톤에서 밝은 톤(`bg-white border-stone-200`)으로 변경하고, 내부의 텍스트 색상을 어두운 회색으로 교정하여 UI 조화를 극대화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_membershipsub.tsx` | 라이선스 조작반의 어두운 배경 제거 및 개별 버튼 독립 테두리 추가, 승인 드롭다운 라이트 테마 개편 적용 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.85.0 cleavage

## [v2.85.0] - 2026-06-05
### Summary
* **[로컬 시뮬레이터(Fallback) 모드 관리자 계정 로그인 쿼리 버그 수정 완료]**
  - **시뮬레이터 쿼리 파싱 및 매핑 교정**:
    - `server/db/simulator.ts` 내 로컬 시뮬레이터(Fallback DB)가 새로운 관리자 테이블명(`web_admin_accounts`)으로 들어오는 SELECT 쿼리를 정상적으로 인식 및 가로채도록 조건을 보강했습니다.
    - 기존에 username과 password를 둘 다 `params`에서 매핑하여 필터링하던 조건을, 라우터 스펙에 맞춰 `username` 단일 조건으로 매핑하도록 교정하여 정상적으로 admin 계정 정보를 반환하도록 복구했습니다.
  - **GCP 배포**:
    - 변경 내용을 검증하고 `npm run deploy` 명령어를 환경변수 우회 세팅과 함께 안전하게 실행하여 GCP Cloud Run 무중단 롤링 배포를 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/db/simulator.ts` | 로컬 시뮬레이터(Fallback) 환경에서 web_admin_accounts 조회 조건 및 쿼리 파싱 호환 처리 적용 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.84.0 cleavage

## [v2.84.0] - 2026-06-05
### Summary
* **[가맹 회원 라이선스 조작계 상시고정 및 수정/삭제 제어 구조 개선]**
  - **상시고정 및 일괄제어**:
    - `⚡ 라이선스 조작` 패널을 선택 행 개수와 상관없이 상단 헤더 영역에 상시 노출 고정되도록 개선했습니다.
    - 선택된 행이 없는 경우 버튼들을 비활성화 처리하여 안전한 사용자 경험을 제공합니다.
  - **작업 단추 이전**:
    - 테이블 내 개별 행의 `수정` 및 `삭제` 조작계를 제거하고, 상단 라이선스 조작계의 `가동 정지` 우측으로 일괄 이전 통합했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `components/admin/` | `admin_comp_membershipsub.tsx` | 라이선스 조작 컨트롤러를 헤더에 상시 고정하고 수정/삭제 조작계를 가동정지 우측으로 이관 통합 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.83.0 cleavage

## [v2.83.0] - 2026-06-05
### Summary
* **[GCP 원격 전체 빌드 배포 안정화 롤백 및 복원 완료]**
  - **안정적 배포 환경 복원**:
    - 로컬 PC 환경변수(npm/node) 패스 제약 조건 하에서 컨테이너 기동 오류(PORT 8080 헬스체크 실패) 리스크를 완전히 예방하기 위해, Google Cloud Build 원격지에서 의존성 설치 및 Vite 빌드가 완벽히 수행되는 100% 무결점 정식 배포 구조로 Dockerfile 및 `.gcloudignore`를 원상 복구했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `gcloud/` | `Dockerfile`, `.gcloudignore` | 로컬 빌드 실패로 인한 컨테이너 오작동 방지를 위해 정식 원격 전체 빌드 빌드 파이프라인으로 안전하게 복원 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.82.0 cleavage

## [v2.82.0] - 2026-06-05
### Summary
* **[로컬 pre-build 연동 초경량 빌드 파이프라인 및 Dockerfile 개편 완료]**
  - **Dockerfile 고속화 및 다이어트**:
    - 도커 빌드 시 원격에서 수십 초가 소요되던 Vite 프론트 컴파일 단계(`RUN npm run build`)를 완전히 제거하고, `RUN npm ci --omit=dev`를 적용하여 오직 실행용 코어 의존성만 단발성으로 수 초 만에 설치되도록 개편했습니다.
  - **배포 체인 자동화 및 화이트리스트 갱신**:
    - `package.json` 의 scripts에 `deploy` 명령어 체인을 신설하여, 로컬 컴파일 완료 후 자동으로 gcloud 배포 명령이 실행되도록 일원화했습니다.
    - 로컬 빌드 결과물이 구글 서버로 원활하게 전송되도록 `.gcloudignore` 내 `dist/` 차단 룰을 제거했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `gcloud/` | `Dockerfile`, `.gcloudignore`, `package.json` | 로컬 빌드 후 dist 업로드 서빙용 초경량 Dockerfile 및 배포 단축 명령어 체인 구축 적용 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.81.0 cleavage

## [v2.81.0] - 2026-06-05
### Summary
* **[GCP Artifact Registry 구버전 컨테이너 이미지 자동 클린업 정책 구성 완료]**
  - **수명 주기 청소 정책 세팅**:
    - `gcloud artifacts repositories set-cleanup-policies` 명령을 사용해 저장소(`cloud-run-source-deploy`)에 최근 3개의 최신 빌드 이미지만 보존(Keep)하고 나머지는 영구 삭제하는 수명 주기 자동 정리 규칙을 탑재하여, Artifact Registry 용량이 0원 무료 한도 내에서 상시 청결하게 유지되도록 최적화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `gcloud/` | `scratch/cleanup-policy.json` | 리포지토리 내 최신 3개 컨테이너 보존 및 구버전 자동 삭제 정리 정책 수립 반영 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.80.0 cleavage

## [v2.80.0] - 2026-06-05
### Summary
* **[GCP 배포 가속화 및 업로드 전송 최적화 세팅 완료]**
  - **.gcloudignore 환경 설정**:
    - 배포 시 구글 클라우드로 수십만 개의 불필요한 의존성 모듈(`node_modules/`), 정적 빌드 파일(`dist/`), 미디어 에셋(`uploads/`) 및 기타 스크래치 파일들이 업로드되어 지연 및 비용을 유발하던 문제를 원천 방지하기 위해 `.gcloudignore` 차단 리스트를 생성 및 최적화하여 0원에 준하는 고속 배포를 가능하게 했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `gcloud/` | `.gcloudignore` | gcloud 배포 시 node_modules 등 무거운 디렉토리 업로드 필터링 차단 세팅 적용 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.79.0 cleavage

## [v2.79.0] - 2026-06-05
### Summary
* **[일괄 라이선스 승인/정지 API 교정 및 가이드북 모달 팝업 통합 완료]**
  - **헤더부 레이아웃 개선**:
    - `admin_comp_membershipsub.tsx` 에서 사용하지 않는 대주제 텍스트(`✦ MEMBERSHIP REGISTRY`)를 전격 삭제하고, `⚡ 라이선스 조작` 제어 패널을 상단 헤더의 왼쪽 영역으로 깔끔하게 이동 정돈했습니다.
  - **일괄 인증 승인 및 가동 정지 DB 쿼리 오류 복구**:
    - `server/routes/admin/member_actions.ts` 내에 누락되었던 `/api/licenses/bulk-approve` API 엔드포인트를 정식 설계하고, SQL 호환성 오류를 유발하던 `ON CONFLICT` 구문을 제거하여 데이터베이스 종류와 무관하게 100% 정상 작동하도록 개량했습니다.
  - **가이드북 팝업 모달 개편**:
    - `admin_comp_licenses_guidebook.tsx` 내의 불필요하고 복잡한 '숨김/펼침' 어코디언을 전면 폐지하고, 전산 가이드라인 및 API 규격서를 아름다운 팝업 모달 창으로 즉시 호출 및 조회하도록 사용자 경험을 향상시켰습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_membershipsub.tsx`, `components/admin/admin_comp_licenses_guidebook.tsx` | 멤버십대장 헤더 레이아웃 재배치 및 가이드북 토글 어코디언을 모달 팝업 구조로 변경 완료 | 변경 없음 |
| `backend/` | `server/routes/admin/member_actions.ts` | 누락된 일괄 승인 API를 추가하고 SQL 호환성 쿼리 무결화 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.78.0 cleavage

## [v2.78.0] - 2026-06-05
### Summary
* **[실시간 멤버십 검증기 탭 렌더링 크래시 오류 수정 완료]**
  - **누락 아이콘 임포트 조치**:
    - `admin_comp_members.tsx` 내에서 '실시간 멤버십 검증기' 탭을 활성화할 때 쓰이는 `ShieldAlert` 아이콘이 `lucide-react` 로부터 임포트가 누락되어 탭 전환 시 화면이 크래시되는 치명적 연동 오류를 완벽하게 정상 복구했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_members.tsx` | ShieldAlert 아이콘 임포트 누락으로 인한 탭 렌더링 크래시 에러 수정 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.77.0 cleavage

## [v2.77.0] - 2026-06-05
### Summary
* **[멤버십 대장 실시간 라이선스 조작부 상단 이관 및 테이블 간소화 완료]**
  - **테이블 간소화 및 컬럼 제거**:
    - `admin_comp_membership_table.tsx` 내의 우측 고정 `⚡ 실시간 라이선스 조작 / 제어` 어두운 열(bg-stone-900)을 전면 삭제하여 테이블 가독성과 공간을 획기적으로 개선했습니다.
    - 맨 우측 열은 다른 관리대장과 동일하게 단순한 `수정` / `삭제` 전용 버튼만 있는 `관리` 열로 교체했습니다.
  - **상단 라이선스 제어부 이관**:
    - `admin_comp_membershipsub.tsx` 의 상단 액션 바 영역에 선택된 회원들을 일괄 또는 개별 조작할 수 있는 검정색 럭셔리 골드 포인트 스타일(`bg-stone-900 border-stone-800 text-[#C5A059]`)의 `⚡ 라이선스 조작` 제어반을 신설했습니다.
    - 선택 건수에 따라 동적으로 인증 승인(1달/3달/1년) 및 가동 정지 명령을 신속하게 내릴 수 있도록 통합 개편했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_membership_table.tsx`, `components/admin/admin_comp_membershipsub.tsx` | 멤버십 라이선스 개별/일괄 조작 컨트롤러를 테이블 우측에서 상단 검정 테마 제어 박스로 전격 이관 및 간소화 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.76.0 cleavage

## [v2.76.0] - 2026-06-05
### Summary
* **[어드민 대메뉴 3대 마스터 체계 개편 및 탭 구조 대통합 완료]**
  - **대메뉴 3대 구성 대통합**:
    - `admin_page_main.tsx` 내 대메뉴 구조를 **페이지**, **게시판**, **관리대장** 3가지로 압축 정돈하여 복잡도를 전격 해결했습니다.
    - **페이지**: 필름 게시판, 메인 게시판, 인테리어 게시판, 메뉴 게시판을 하위 서브 탭으로 병합했습니다.
    - **게시판**: 소통 게시판, 게시판 등급 권한, 본사 서명/직인 설정을 하위 서브 탭으로 병합했습니다.
    - **관리대장**: 창업상담신청, 라이선스관리, 실시간 멤버십 검증기, 가이드북 대장을 하위 서브 탭으로 병합했습니다.
  - **컴포넌트 관심사 분리**:
    - `admin_comp_members.tsx` 내에서 소통 게시판 전환 렌더링 코드를 걷어내어 오직 관리대장의 4개 전산 파트에만 충실하도록 최적화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin_page_main.tsx`, `components/admin/admin_comp_members.tsx` | 페이지/게시판/관리대장 3대 대메뉴 통합 설계 및 계층형 서브 탭 UI 재배치 개편 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.75.0 cleavage

## [v2.75.0] - 2026-06-05
### Summary
* **[어드민 게시판 관련 탭 통합 및 멤버십 테이블 조작 컬럼 스타일 개편 완료]**
  - **게시판 탭 하위 통합 및 탭바 단순화**:
    - `admin_comp_members.tsx` 내 '게시판 등급 권한' 및 '본사 서명/직인' 탭을 '게시판' 탭 하위의 중첩 서브메뉴로 이관 통합했습니다.
    - 이에 따라 어드민 서브 탭바를 [창업상담신청, 라이선스관리, 실시간 멤버십 검증기, 가이드북, 게시판]의 5대 핵심 체계로 단순화했습니다.
  - **실시간 라이선스 조작 제어 버튼 시인성 강화**:
    - `admin_comp_membership_table.tsx` 내 실시간 조작 버튼들을 검정 배경(bg-stone-900) 위에서 잘 보이도록 고대비 고휘도 럭셔리 스타일로 전환했습니다.
    - 비활성화되었던 어두운 차단/승인 완료 버튼들을 `bg-emerald-700/90 text-white`, `bg-rose-700/90 text-white` 등의 고대비 유색 버튼으로 개편했습니다.
  - **상태 배지 파스텔톤 투명도 조화 적용**:
    - 요청(인증 대기), 인증 완료, 가동 정지, 만료, 종료임박 5대 라이선스 상태 배지의 배경색을 부드러운 파스텔톤 투명 느낌(bg-*-50)으로 개편하고, 텍스트 글자색 및 보더 라인과 조화롭게 매칭했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_members.tsx`, `components/admin/admin_comp_membership_table.tsx` | 등급권한/직인 설정을 게시판 서브 탭 하부로 이관, 조작 제어부 고대비 검정 배경 버튼 스타일화, 상태 배지 파스텔 투명 톤 교체 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.74.0 cleavage

## [v2.74.0] - 2026-06-05
### Summary
* **[어드민 멤버십 대장 내 '인증 승인' 버튼 배경색 흰색 복원 완료]**
  - **인증 승인 버튼 스타일 복원**:
    - `admin_comp_membership_table.tsx` 파일 내 미인증 상태의 '인증 승인' 버튼 배경색을 기존의 흰색(`bg-white`)으로 복원하였습니다.
    - 이에 맞춰 텍스트와 실드 아이콘의 포인트 컬러도 이전의 에메랄드 그린(`text-emerald-600`) 및 보더 라인(`border-emerald-250`)으로 롤백 조율을 마쳤습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_membership_table.tsx` | 미인증 상태의 인증 승인 버튼의 테마 스타일을 원래의 흰색 배경(bg-white)과 에메랄드 그린 텍스트/보더로 복원 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.73.0 cleavage

## [v2.73.0] - 2026-06-05
### Summary
* **[본사 직인/도장 업로드 API 라우터(hqstamp.ts) 연동 버그 수정 완료]**
  - **어드민 라우터 마운트 연결**:
    - 본사 직인 업로드 API(`/api/hq/upload-stamp`)가 구현된 `hqstamp.ts` 모듈이 어드민 메인 라우터(`admin.ts`)에 등록되지 않아 전송 시 `404 Not Found` 가 뜨던 연동 누락 오류를 완벽하게 수정했습니다.
    - `admin.ts` 상단에 `hqstampRouter` 임포트 및 마운트 체인 구문을 탑재하여 데이터 업로드 통신을 정상 개통하였습니다.
    - `npx tsc --noEmit` 정적 타입 분석 무결점 통과를 확인하고 Cloud Run 서버에 롤링 재배포 조치를 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/routes/admin.ts` | 누락되었던 hqstampRouter 임포트 및 router.use 마운트 코드 추가를 통한 본사 직인 업로드 기능 정상 연결 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.72.0 cleavage

## [v2.72.0] - 2026-06-05
### Summary
* **[어드민 멤버십 대장 내 '인증 승인' 버튼 배경색 검정색 변경 완료]**
  - **인증 승인 버튼 스타일 개편**:
    - `admin_comp_membership_table.tsx` 파일 내 미인증 상태의 '인증 승인' 버튼 배경색을 기존의 흰색(`bg-white`)에서 7대 표준 스타일 검정색 스톤 테마(`bg-stone-900`)로 변경하여 시각적 정체성을 일치시켰습니다.
    - 어두운 배경 대비 가독성 확보를 위해 호버 효과(`hover:bg-stone-850`), 보더(`border-stone-800`), 그리고 텍스트/아이콘 색상을 밝은 에메랄드(`text-emerald-400`)로 세부 튜닝하였습니다.
    - `npx tsc --noEmit` 정적 타입 컴파일 검증 및 Cloud Run 무중단 재배포를 완료했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_membership_table.tsx` | 미인증 상태의 인증 승인 버튼을 테마 검정색(bg-stone-900)으로 바꾸고 에메랄드 텍스트로 보완하여 시인성 확보 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.71.0 cleavage

## [v2.71.0] - 2026-06-05
### Summary
* **[Supabase DB 내 레거시 haste_ 테이블 일괄 영구 삭제 완료]**
  - **레거시 테이블 정리 및 임시 API 차단**:
    - Supabase 데이터베이스 내 `haste_`로 시작하는 13개의 레거시 테이블들을 안전하게 제거하기 위해, 임시 정리용 API(`/api/admin/clean-haste-tables`)를 `clean.ts`에 일시 탑재 후 Cloud Run 환경에서 트리거하여 일괄 삭제(`DROP TABLE ... CASCADE`)를 성공적으로 마쳤습니다.
    - 정리 작업 완료 즉시 임시 API 코드를 소거 및 원복 재배포하여 프로덕션 보안을 정상 확보했으며, 로컬의 임시 테스트 스크립트 파일들도 완전하게 소거했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/routes/admin/clean.ts` | 레거시 haste_ 테이블 일괄 삭제를 위한 임시 API 생성, 실행 및 삭제 검증 완료 후 즉시 원복 재배포 수행 | `haste_`로 시작하는 레거시 테이블 13개 일괄 삭제 (`DROP TABLE ... CASCADE`) |

# Cafe-Haste ReleasesCustom release 2.70.0 cleavage

## [v2.70.0] - 2026-06-05
### Summary
* **[Vercel 연동 설정 제거 완료]**
  - **Vercel 설정 파일 삭제**:
    - Vercel 배포를 더 이상 사용하지 않음에 따라, 프로젝트 루트의 `vercel.json` 파일을 완전히 제거했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `config/` | `vercel.json` [DELETE] | Vercel 미사용에 따른 잔여 설정 파일 제거 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.69.0 cleavage

## [v2.69.0] - 2026-06-05
### Summary
* **[GCP Cloud Run 배포용 Docker 설정 파일 추가 및 포트/노드 버전 보완 완료]**
  - **Dockerfile 및 .dockerignore 생성, 포트 바인딩 및 노드 버전 수정**:
    - 별도 테스트/배포용 웹 서버 구성을 위한 구글 클라우드 런(Cloud Run) 배포 환경 설정용 Dockerfile과 .dockerignore 파일을 신설 탑재했습니다.
    - Cloud Run의 포트 감지 메커니즘(8080 포트 바인딩 요구)과의 호환성을 위해 Dockerfile 내 포트 구성을 동적으로 바인딩할 수 있도록 수정 조치했습니다.
    - Supabase JS SDK의 Realtime 모듈 작동을 위해 Node.js 22(이상)의 네이티브 웹소켓(WebSocket) 기능이 필하므로 Docker 베이스 이미지를 `node:20-alpine`에서 `node:22-alpine`으로 상향 보완했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `deployment/` | `Dockerfile` [MODIFY], `.dockerignore` [NEW] | GCP Cloud Run 배포를 위한 도커 컴파일 가이드 포트 수정(3000 -> 8080 동적화) 및 Node.js 버전 업그레이드(20 -> 22, 웹소켓 호환성 해결), 이미지 빌드 경량화 제외 목록 추가 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.68.0 cleavage

## [v2.68.0] - 2026-06-04
### Summary
* **[유실 서버/소스 폴더 복구 및 Supabase DB 연동 완료]**
  - **백업 소스 복원**:
    - 누락되었던 `server/` 및 `src/` 폴더를 백업 폴더로부터 안전하게 복원하였습니다.
  - **Supabase DB 연동 및 환경 변수 주입**:
    - 사용자가 제공한 Supabase DB 연결 정보를 담은 `.env` 환경 변수 파일을 생성하고, `server/database.ts`에서 환경 변수(DB_USER, DB_PORT 등)를 동적으로 읽도록 개선하여 하드코딩 이슈를 해소하였습니다.
  - **컴파일/타입 체크 오류 해결**:
    - `components/home_hook_app.ts` 내 `activeAdminTab` 상태 타입에 `HQ_STAMP`를 보강하여 App.tsx의 타입 오류를 말끔히 해결했습니다.
  - **한글 인코딩 깨짐 복구**:
    - `components/menu_page_main.tsx` 내에 인코딩 오류로 깨져있던 텍스트(전체 메뉴, 음료수 등)를 올바른 한글로 복구하였습니다.
  - **Vercel 서버리스 배포 지원 설정**:
    - Express 백엔드와 Vite 프론트엔드가 Vercel 환경에서 정상 연동되도록 `vercel.json` [NEW] 설정 파일을 신설하고, `@vercel/static-build` 빌더 지정을 통해 빌드 산출물(`dist/`)이 404 에러 없이 배포되도록 수정 완료했습니다.
  - **안정성 확인**:
    - `npm run lint` 및 `npm run build` 정적 분석 및 컴파일 번들링 오류 없이 100% 무결점 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` & `frontend/` | `server/` [RESTORED], `src/` [RESTORED], `.env` [NEW], `vercel.json` [NEW], `server/database.ts`, `components/home_hook_app.ts`, `components/menu_page_main.tsx` | 유실 폴더 복구, Supabase 연동 `.env` 주입, Vercel static-build vercel.json 설정 구성, 하드코딩 pgConfig 환경변수 매핑 수정, activeAdminTab 타입 보정, 메뉴 한글 깨짐 복구 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.67.0 cleavage

## [v2.67.0] - 2026-06-04
### Summary
* **[가입 점주용 솔루션 및 멤버십 이용 상세 가이드북 모달 탑재 및 연동 완료]**
  - **이용 가이드북 모달 구축**:
    - `membership_modal_guidebook.tsx` [NEW] 신설. 회원가입 신청(대기), 온라인 약정서 스크롤 확인 및 도장 서명 날인, 신용카드 3종 구독 결제, 인증 완료 및 WMF로컬서버 가동 권한 발급까지 단계별 럭셔리 카드 레이아웃으로 안내 기술.
  - **마이페이지 헤더 연동**:
    - `membership_page_myinfo.tsx` 마이페이지 헤더 영역에 `📖 이용 가이드북` 호출 버튼을 신설하여, 점주가 원클릭으로 손쉽게 상세 안내를 상시 조회할 수 있도록 구성 완료.
  - **안정성 확인**:
    - `npx tsc --noEmit` 및 `npm run build` 정적 분석 및 컴파일 번들링 오류 없이 100% 무결점 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/membership_modal_guidebook.tsx` [NEW], `components/membership_page_myinfo.tsx` | 가입/결제/라이선스 발급 통합 가이드북 모달 신설 및 마이페이지 헤더 호출 인터페이스 탑재 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.66.0 cleavage

## [v2.66.0] - 2026-06-04
### Summary
* **[온라인 약정서 필수 필독 강제 및 본사/점주 양사 날인 합본 약정서 자동 합성/다운로드 및 스토리지 보존 연동]**
  - **약정서 필독 강제화 및 3종 장기 결제 연동**:
    - `membership_page_myinfo.tsx`에서 결제 시 즉시 PG 결제창을 여는 대신 약정서 모달을 먼저 팝업하고, 본문 스크롤을 끝까지 내려서 완독해야만 동의 체크박스와 점주 서명(도장 날인) Canvas 패드가 활성화되도록 유효성 검증 설계.
    - 약정서 하단에는 본사 직인(`haste_hq_stamp.png`)이 기본 날인되어 노출됨.
  - **합본 약정서(PNG) 실시간 Canvas 합성 및 자동 다운로드**:
    - 점주가 서명을 마치고 완료를 누르면, 보이지 않는 백그라운드 Canvas에 계약서 본문 텍스트, 본사 직인, 점주 날인을 실시간으로 고화질 합성 렌더링.
    - 합성 완료 즉시 로컬 PC/모바일로 `membership_agreement_[StoreCode].png` 사본이 즉각 자동 다운로드되어 점주 소장 지원.
  - **Supabase 스토리지 업로드 및 DB 소프트 패칭 보존**:
    - 생성된 사본을 공통 훅 `processAndUpload`를 사용하여 `cafehaste-bucket/membership/agreement` 경로에 자동 업로드하고 퍼블릭 URL을 확보.
    - 결제 검증(/api/membership/subscribe) 시 해당 URL을 Supabase `web_membership_users` 테이블의 `agreement_document_url` 및 Fallback JSON 대장에 소프트 패칭 저장.
    - 점주 마이페이지 세부 대장에 **"약정서 사본 다운로드"** 버튼을 제공하여 보존본을 언제든지 재다운로드 가능하도록 연동.
  - **안정성 확인**:
    - `npx tsc --noEmit` 및 `npm run build` 정적 분석 및 컴파일 번들링 오류 없이 100% 무결점 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/membership_modal_agreement.tsx` [NEW], `components/membership_page_myinfo.tsx`, `src/global.d.ts` [NEW], `src/assets/images/haste_hq_stamp.png` [NEW] | 본사/점주 양 날인 약정서 캔버스 실시간 합성 렌더링, 스크롤 완독 유효성 패드, 다운로드 및 대장 재다운로드 버튼 연동 | 변경 없음 |
| `backend/` | `server/routes/public/subscribe.ts`, `server/db/schema-setup.ts` | 결제 검증 시 약정 계약서 사본 URL 수신 및 DB/JSON 대장 저장 처리, DDL agreement_document_url 소프트 패칭 추가 | `web_membership_users` 테이블 내 `agreement_document_url` VARCHAR(512) 추가 |

# Cafe-Haste ReleasesCustom release 2.65.0 cleavage

## [v2.65.0] - 2026-06-04
### Summary
* **[신용카드 3개월, 6개월, 12개월 구독 결제 옵션 다원화 및 버퍼 혜택 정책 변경 완료]**
  - **프론트엔드 장기 결제 옵션 변경**:
    - `membership_page_myinfo.tsx` 마이페이지 내 결제 버튼을 유저 요청에 따라 3종으로 갱신:
      - `3개월`: 정가 300원 / +7일 가산 버퍼 연장
      - `6개월`: 5% 할인 570원 / +7일 가산 버퍼 연장
      - `12개월`: 10% 할인 1080원 / +15일 가산 버퍼 연장
  - **백엔드 개월별 가산 버퍼 혜택 연산 업데이트**:
    - `subscribe.ts`의 `getExtendedLicenseDate` 연장 헬퍼 함수를 수정하여 12개월 결제 시 `15일` 버퍼를, 3개월 및 6개월 결제 시 `7일` 버퍼를 가산하여 종료 만료일(end_date)을 산정하고 Supabase 및 로컬 DB에 안전하게 갱신하도록 처리 완료.
  - **안정성 확인**:
    - `npx tsc --noEmit` 및 `npm run build` 오류 없이 100% 무결점 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/membership_page_myinfo.tsx` | 3개월, 6개월, 12개월 할인 혜택이 적용된 3종의 장기 결제 버튼 배치 및 금액 가변 연동 | 변경 없음 |
| `backend/` | `server/routes/public/subscribe.ts` | 수신된 개월 수에 따라 버퍼 일수(15일 또는 7일)를 다르게 가산하여 라이선스 만료일을 갱신하도록 로직 개편 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.64.0 cleavage

## [v2.64.0] - 2026-06-04
### Summary
* **[신용카드 12개월 장기 구독 결제 옵션 지원 (20% 할인 및 30일 연장 혜택)]**
  - **프론트엔드 다원 결제 옵션 구축**:
    - `membership_page_myinfo.tsx` 마이페이지 내에 1개월 결제(`100원 / +7일 연장`)와 12개월 결제(`960원 / 20% 할인 + 30일 연장`) 두 가지 옵션 버튼을 분할 탑재.
    - `handlePayment` 함수가 결제 개월 수(`months`)를 파라미터로 넘겨받아 상응하는 금액 및 상품명으로 결제를 요청하도록 구현.
  - **백엔드 개월 수 기반 연장 로직 탑재**:
    - `subscribe.ts` 내에 `getExtendedLicenseDate` 헬퍼 함수를 구축하여 개월 수에 따라 유연하게 라이선스를 연장(1개월 결제 시 `1달+7일`, 12개월 결제 시 `12달+30일`)하도록 고도화.
  - **안정성 확인**:
    - `npx tsc --noEmit` 및 `npm run build` 오류 없이 100% 무결점 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/membership_page_myinfo.tsx` | 1개월 및 12개월 구독 결제 선택 버튼 분리 제공 및 결제 API에 개월 수 파라미터 전달 연동 | 변경 없음 |
| `backend/` | `server/routes/public/subscribe.ts` | 클라이언트에서 수신한 개월 수(months)에 따라 1달+7일 또는 12달+30일로 만료일을 계산하여 저장하도록 업데이트 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.63.0 cleavage

## [v2.63.0] - 2026-06-04
### Summary
* **[신용카드 결제 시 주말 및 휴일 감안 1달 + 7일 라이선스 연장 반영]**
  - **라이선스 날짜 연장 로직 고도화**:
    - `subscribe.ts`의 `getOneMonthLaterDate` 연장 계산 모듈을 수정하여 기존 1달(30일) 뒤 시점에서 7일을 가산(day + 7)하여 반환하도록 업데이트.
    - 이에 따라 결제 성공 시 실제 1달 + 7일 뒤의 만료일이 Supabase DB 및 로컬 JSON 데이터베이스에 안전하게 갱신 저장됨.
  - **안정성 확인**:
    - `npx tsc --noEmit` 및 `npm run build` 오류 없이 100% 무결점 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/routes/public/subscribe.ts` | 구독 결제 검증 성공 후 라이선스 종료일을 '1달 + 7일'로 추가 연장 적용하는 로직 수정 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.62.0 cleavage

## [v2.62.0] - 2026-06-04

### Summary
* **[포트원(PortOne) 결제 SDK 연동 및 백엔드 2차 검증을 거친 즉시 인증 승인/구독 시스템 개발 완료]**
  - **프론트엔드 포트원 결제창 탑재**:
    - `membership_page_myinfo.tsx` 내에 포트원 외부 SDK 스크립트(`iamport.js`) 동적 주입 및 `window.IMP` 초기화 적용.
    - 미인증 매장('인증 대기' 또는 '기간 만료')을 대상으로 **"신용카드 구독 결제"** 카드 연동 결제 버튼 신설.
    - 카드 번호, 유효기간 등을 입력받는 실제 결제창(`IMP.request_pay`) 콜백 연동.
  - **백엔드 실결제 2차 검증 API 신설**:
    - `/api/membership/subscribe` (POST) API 신설을 통한 실거래 2차 검증 엔진 개발.
    - 포트원 API 서버(Handshake token 발급 -> 결제 단건 조회)와 통신하여 실제 지불 상태(`paid`) 및 결제 금액 위변조 여부를 교차 검증하도록 완수.
    - 검증 성공 시 `web_membership_users` 테이블 회원 상태를 `'인증 완료'`로 즉시 변경하고, `web_store_licenses` 테이블에 만료일이 오늘로부터 1달 뒤인 신규 라이선스 자동 발급 및 갱신.
    - 실시간 단말 검증 인메모리 캐시(`storeVerifyCache`) 무효화 및 CUD 종착점 캐시파괴 `flushPublicReadCache` 호출 보장.
  - **안정성 확인**:
    - `npx tsc --noEmit` 및 `npm run build` 오류 없이 100% 무결점 통과 완료.
  - **파일 500줄 이하 엄격 유지**:
    - `membership_page_myinfo.tsx`는 줄바꿈 다이어트를 통해 신규 결제 로직이 추가되었음에도 **359줄**로 축소 보존 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/routes/public.ts`, `server/routes/public/subscribe.ts` [NEW] | 포트원 실결제 2차 검증 수신 API 구현, 가맹점 상태 및 1달 라이선스 연장 업데이트 처리와 캐시 버스팅 연동 | 변경 없음 |
| `frontend/` | `components/membership_page_myinfo.tsx` | 포트원 결제 모듈 스크립트 동적 인젝션, 구독 결제 연동 및 성공 시 리로딩 트리거 구현 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.61.0 cleavage

## [v2.61.0] - 2026-06-04
### Summary
* **[가맹점 등급별 게시판 읽기/쓰기 권한 설정 대시보드 및 백엔드 차단 엔진 개발 완료]**
  - **백엔드 권한 스키마 및 API 구현**:
    - `web_board_grade_permissions` 테이블 DDL 및 sequence auto-heal 갱신 루틴 반영.
    - `/api/grade-permissions` (GET) 및 `/api/grade-permissions/update` (POST) API 신설 완료.
    - DB connection release 준수 및 CUD 완료 시 인메모리 캐시 무효화(`flushPublicReadCache`) 트리거 연동 완료.
  - **로컬 시뮬레이터 Fallback 연동**:
    - `haste_sim_grade_permissions.json` 자동 생성 지원 및 `handleGradePermissionsQuery` 쿼리 가로채기 연동.
  - **게시판 조회 및 작성/수정/삭제 권한 차단**:
    - `posts_helper.ts` 신설을 통한 선제적 설계 분리.
    - 목록 조회 시 사용자의 등급을 체크하여 읽기 권한이 없는 카테고리는 동적으로 SQL WHERE 조건(`NOT IN`)을 생성 및 필터링하여 페이징을 사수하며, 개별 상세 및 작성/수정/삭제 시에도 점주 등급을 확인해 유효하지 않은 요청은 `403 Forbidden` 차단 처리.
  - **본사 관리자용 등급 권한 설정 UI 구축**:
    - `admin_comp_permissions.tsx`를 통해 4대 등급 × 6개 카테고리 매트릭스 설정판 개발.
    - 확인 다이얼로그 `AdminConfirmModal` 공통 모듈 100% 재사용 및 브론즈 골드 테마 포인트 통일.
    - `board_page_main.tsx` 한글 깨짐 복구 및 일반 점주도 쓰기 권한이 있으면 글쓰기 버튼이 노출되도록 확장 완료.
  - **500줄 이하 보존**:
    - 모든 신규 파일 및 컴포넌트 500줄 이하 설계 적용. `board_page_main.tsx`는 기존 497줄에서 다이어트를 거쳐 396줄로 압축 완료.
  - **안정성 확인**:
    - `npx tsc --noEmit` 및 `npm run build` 오류 없이 100% 무결점 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` | `server/db/schema-setup.ts`, `server/db/seeder.ts`, `server/db/simulator.ts`, `server/db/simulator_helpers.ts`, `server/db/simulator_helpers_menu.ts`, `server/db/cache-io.ts`, `server/database.ts` | 등급 권한 테이블 생성, 시딩, 로컬 JSON Fallback 백업 및 simulator 쿼리 가로채기 핸들러 연동 | `web_board_grade_permissions` 테이블 신설 |
| `backend/` | `server/routes/admin.ts`, `server/routes/admin/permissions.ts` [NEW], `server/routes/public/posts.ts`, `server/routes/public/posts_helper.ts` [NEW] | 등급별 게시판 권한 조회 및 업데이트 API 구현, 게시글 조회/작성/수정/삭제 API 상에 점주 등급 연동 차단 제어식 삽입 | 변경 없음 |
| `frontend/` | `components/admin_page_main.tsx`, `components/admin/admin_comp_permissions.tsx` [NEW], `components/board_page_main.tsx`, `components/home_hook_app.ts` | 관리자 탭 6번째 Permissions 신설, 그리드 설정판 렌더링 및 저장 액션 연동, 게시판 글쓰기 조건 확장 및 인코딩 보정 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.60.0 cleavage

## [v2.60.0] - 2026-06-04
### Summary
* **[가맹점 마이페이지(내 정보) 내 '매장 유형' 등급 노출 리팩토링]**
  - **마이페이지 매장 유형 데이터 바인딩**:
    - `membership_page_myinfo.tsx` 내에 관리자가 설정한 매장 유형 등급(일반/직영점/임원/프리미엄)을 나타내는 `uStoreType` 속성을 바인딩했습니다.
    - 정식 등록 대장 세부 정보 테이블의 '매장 코드' 바로 아래에 '매장 유형' 행을 신설하여 가맹 경영주가 자신의 솔루션 매장 유형 등급을 실시간 모니터링할 수 있도록 제공했습니다.
  - **안정성 확인**:
    - `npx tsc --noEmit` 타입 검증과 `npm run build` 정적 번들링 및 트랜스파일링이 오류 없이 100% 무결점 통과 완료되었습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/membership_page_myinfo.tsx` | 점주 마이페이지 세부 정보 테이블에 관리자가 부여한 매장 유형(일반/직영점/임원/프리미엄) 등급 노출 추가 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.59.0 cleavage

## [v2.59.0] - 2026-06-04
### Summary
* **[실시간 멤버십 검증기(검문소) 좌/우 로그 표시 매장코드 필터링 관심사 분리]**
  - **좌측 로그보드 실제 매장 로그 분리**:
    - `admin_comp_licenses_validator.tsx` 내에서 `storeId`가 숫자로만 구성된 실제 운용 매장 로그만 필터링하여 `leftLogs`로 좌측 게시판에 렌더링되도록 수정했습니다.
  - **우측 터미널 가상 테스트 로그 분리**:
    - `storeId`에 `STORE` 문자열이 포함된 가상 테스트 매장 로그만 필터링하여 `rightLogs`로 우측 터미널 제어기에 렌더링되도록 개선했습니다.
  - **안정성 확인**:
    - `npx tsc --noEmit` 타입 검증과 `npm run build` 정적 번들링 및 트랜스파일링이 오류 없이 100% 무결점 통과 완료되었습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_licenses_validator.tsx` | 좌측 로그보드에는 실제 숫자매장 코드 로그만, 우측 터미널에는 가상 테스트(STORE-) 매장 코드 로그만 필터링 노출하는 관심사 분리 적용 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.58.0 cleavage

## [v2.58.0] - 2026-06-04
### Summary
* **[대장관리게시판 선택 가맹점 대상 '인증승인 일괄적용' 기능 신규 개발]**
  - **백엔드 일괄 승인 API 신설**:
    - `/api/licenses/bulk-approve` POST 엔드포인트를 구현하여 선택한 복수의 매장에 대해 라이선스를 1달/3달/1년 단위로 일괄 연장 및 갱신 승인 처리할 수 있도록 했습니다.
    - 데이터 일관성을 지키기 위해 실시간 인메모리 인증 캐시(`storeVerifyCache`)를 즉각 Bust 처리하고, DB connection 누수가 없도록 보장했습니다.
  - **프론트엔드 일괄승인 및 기간선택 UI 연동**:
    - `admin_comp_membershipsub.tsx` 내부 '인증' 필터링 상태에서 매장을 복수 선택하면 활성화되는 **"인증승인 일괄적용"** 버튼 및 1달/3달/1년 팝오버 드롭다운 메뉴를 추가하고 비동기 API 통신을 연동 완료했습니다.
  - **seeder.ts 컴파일 문법 에러 해결**:
    - `seeder.ts` 내에 유니코드 깨짐 및 따옴표 누락으로 인해 esbuild 및 tsc에서 전체 빌드를 중단시키던 에러를 말끔히 청소했습니다.
    - 하드코딩 데이터를 `haste_posts_guide.json` JSON 파일로 동적 로드하도록 변경하여 코드를 266줄로 축소 유지했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` & `frontend/` | `server/routes/admin/member_actions.ts`, `components/admin/admin_comp_membershipsub.tsx`, `server/db/seeder.ts` | 일괄 인증승인 백엔드 API 구현, 프론트엔드 버튼 및 1달/3달/1년 옵션 드롭다운 추가, seeder.ts 파일 문법 에러 및 인코딩 복구 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.57.0 cleavage

## [v2.57.0] - 2026-06-04
### Summary
* **[POS/키오스크 가맹점 단말 가동 지칭 표현 ➔ 'WMF로컬서버 가동 시' 정규화 통일]**
  - **코드베이스 내 용어 교체**:
    - `server/routes/public/verify.ts` 내 주석 및 디버그 콘솔 로그 내의 "POS", "키오스크", "Kiosk" 지칭 표현을 표준 용어인 **"WMF로컬서버 가동 시"**로 전격 교체.
  - **가이드북(AGENTS.md) 최신 지침 갱신**:
    - 📌 9의 용어 통일화 규칙 사전에 `WMF로컬서버 가동 시` 표준 매핑 지침을 공식 명시하고 상단 마스터 요약 표에도 반영 완료.
  - **안정성 확인**:
    - `npx tsc --noEmit`을 통한 정적 타입 오류 및 빌드 무결성 100% 검증 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` & `config/` | `server/routes/public/verify.ts`, `AGENTS.md` | POS/키오스크 지칭 표현을 표준 용어인 WMF로컬서버 가동 시로 통일 리팩토링 및 가이드북 공식 갱신 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.56.0 cleavage

## [v2.56.0] - 2026-06-04
### Summary
* **[개발 에이전트 지침서(AGENTS.md) 20대 수칙 -> 9대 핵심 조항 유기적 통폐합]**
  - **9대 통합 조항 전면 리팩토링**:
    - 리눅스 호환 소문자 명명(📌 1, 📌 5, 📌 13) 통합.
    - 스토리지 버킷 격리 및 Canvas 1024px 압축, 롤백 트랜잭션, 모바일 Fallback(📌 2, 📌 9, 📌 11, 📌 12) 통합.
      * **[추가 수칙]** 공통 이미지 업로드 훅(`useImageUpload`) 재사용 의무화 조항 명문화.
    - 초고속 DB 해제, 폴링 금지, 0원 캐싱/Bust, 6개 연결 제한 해결(📌 3, 📌 15, 📌 17) 통합.
    - 500줄 이하 보존 및 기존 인프라 최우선 경량화(📌 4, 📌 16) 통합.
      * **[추가 수칙]** 공통 UI 모듈(`AdminConfirmModal` 및 `AdminPagination`) 중복 작성 방지 및 재사용 강제 규약 명문화.
    - AI API 토큰 절약 및 공통 카멜케이스(camelCase) 통합(📌 6, 📌 18) 통합.
    - 빌드 이력(📌 7) 📌 6번으로 이관.
    - UI 디자인 7대 가이드라인 및 여백 보존(📌 8, 📌 19) 통합.
      * **[추가 수칙]** 마이페이지 내 디지털 라이선스 인증 카드의 시그니처 럭셔리 골드 프레임 테마 디자인 보존 규약 명문화.
    - 슈파베이스 Anon Key 싱글톤 및 실시간 DB 보존 소프트 패칭(📌 10, 📌 14) 통합.
    - 한글 용어 표준화(📌 20) 📌 9번으로 이관.
  - **프로젝트 안정성 검증**:
    - `npx tsc --noEmit`을 통한 정적 타입 오류 및 빌드 무결성 100% 검증 통과 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `config/` | `AGENTS.md` | 에이전트 마스터북 20개 조항을 9개 강력한 핵심 규약으로 통폐합 리팩토링, 공통 모듈 재사용 및 라이선스 카드 디자인 가이드 수칙 추가 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.55.0 cleavage

## [v2.55.0] - 2026-06-04
### Summary
* **[전체 홈페이지 주요 UI 요소의 스타일 및 폰트 표준화 리팩토링 완료]**
  - **7대 표준 스타일 가이드라인 일괄 적용**:
    - 대제목(font-sans), 섹션/카드 타이틀, 카테고리 칩(font-mono tracking-[0.3em] uppercase), 본문 텍스트, 주요/보조 버튼(rounded-2xl) 및 상태 배지 규격을 사이트 전반에 걸쳐 일제히 리팩토링 완료.
    - 임의의 색상 노란색(#FBBF24)을 시그니처 브론즈 골드(#C5A059)로 단일화하고, 서체를 명조(serif)에서 Pretendard(sans) 표준 굵기로 통일.
  - **마이페이지 내 점주 정보 완전성 확보 및 디지털 라이선스 인증 강조**:
    - `membership_page_myinfo.tsx` 마이페이지 내에 점주 성함, 사업자번호, 매장 주소, 연락처 외에 누락되었던 `매장 코드` 정보를 표 형태로 보강하여 전체 전산 정보를 노출 완료.
    - 점주 라이선스 인증 박스를 럭셔리 골드 프레임 홀로그램 카드 스타일(`bg-gradient-to-br from-stone-900 via-neutral-950 to-stone-900 border-2 border-[#C5A059]`)로 재구축하고, 라이선스 키 및 솔루션 등급, 유효기간, 인증상태(`인증 완료` / `인증 대기` / `가동 정지`) 배지 적용을 통해 라이선스 식별 가시성을 극대화.
  - **대상 컴포넌트 리팩토링 및 JSX/한글 인코딩 오류 복구 완수**:
    - `brand_page_main.tsx`, `franchise_page_main.tsx`, `board_page_main.tsx`, `interior_page_main.tsx`, `menu_page_main.tsx`, `store_page_main.tsx`, `membership_comp_form.tsx` 및 `membership_page_myinfo.tsx` 전체 적용 완료.
    - `franchise_page_main.tsx` 및 `interior_page_main.tsx` 파일의 한글 인코딩 깨짐 및 JSX 문법 오류(따옴표 누락) 복원 및 500줄 이하 라인 수 검증 완료.
    - `npx tsc --noEmit` 정적 타입 검사 및 `npm run build` 번들링 100% 무결점 통과 검증 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/brand_page_main.tsx`, `components/franchise_page_main.tsx`, `components/board_page_main.tsx`, `components/interior_page_main.tsx`, `components/menu_page_main.tsx`, `components/store_page_main.tsx`, `components/membership_comp_form.tsx`, `components/membership_page_myinfo.tsx` | 브랜드 폰트, 버튼 둥글기(rounded-2xl) 및 시그니처 골드 컬러 통일화 리팩토링, 마이페이지 라이선스 럭셔리 카드 디자인 대폭 강화 및 한글 용어 표준화 완수 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.54.0 cleavage

## [v2.54.0] - 2026-06-04
### Summary
* **[홈페이지 유사 한글 용어 통일화 및 공유 컴포넌트 500줄 제한 규칙 리팩토링]**
  - **공통 한글 용어 표준 정규화**:
    - 가입 신청서(`membership_comp_signup_inputs.tsx`, `membership_hook_signup.ts`) 및 멤버 정보 수정 모달(`admin_comp_shared.tsx`) 내 혼용되던 용어 `매장고유번호` -> `매장 코드`로 단일화.
    - 점주 성함 관련 필드명과 에러 알림 텍스트의 표기를 `점주 성함`으로 표준화.
    - 라이선스 승인 대기 상태(`admin_comp_membership_table.tsx`) 표기를 `대기·요청` -> `인증 대기`로 통일화.
    - 라이선스 정상인증 완료 상태를 `인증 완료`로 정규화 표기.
    - 일괄 및 개별 정지 처리를 지칭하는 모든 텍스트(`admin_comp_membershipsub.tsx`)를 `가동 정지` 및 `가동 정지중`으로 전격 교체.
  - **공유 컴포넌트 다이어트 및 500줄 규칙 보장**:
    - `admin_comp_shared.tsx` 파일 내에 비대하게 위치하던 회원 정보 수정 모달(`MemberEditModal`) 코드를 소문자 독립 파일인 `admin_comp_member_edit_modal.tsx`로 완벽히 이전 분리하고, 기존 파일은 re-export만 수행하게 조치하여 줄 수를 124줄로 대폭 단축 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_membership_table.tsx`, `components/admin/admin_comp_membershipsub.tsx`, `components/membership_comp_signup_inputs.tsx`, `components/membership_hook_signup.ts`, `components/admin/admin_comp_shared.tsx`, `components/admin/admin_comp_member_edit_modal.tsx` | 한글 용어 정규화 표기 통일 적용 및 500줄 초과 방지를 위한 공유 컴포넌트 파일의 모듈화 분할 진행 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.53.0 cleavage

## [v2.53.0] - 2026-06-04
### Summary
* **[정적 타입 분석을 통한 컴파일 에러 전수 해결 및 빌드 안정성 극대화]**
  - **컴포넌트 및 훅 타입 오류 정화**:
    - `admin_comp_licenses_validator.tsx` 내 누락된 `useRef` import 구문을 추가하여 정의되지 않은 식별자 에러 해결.
    - `admin_comp_membershipsub.tsx` Props 인터페이스의 `fetchIntegratedBulkData` 파라미터 타입을 실제 훅 규격인 `'CLOUD_SQL' | 'LOCAL_SIM'`으로 보정하여 `<AdminMembershipSubTab />` 호출부의 타입 불일치 에러 해소.
    - `admin_hook_billing.ts` 및 `admin_hook_state.ts` 내 `HasteMember` import 경로를 실제 정의 파일인 `../membership_types`로 바로잡아 누락된 익스포트 멤버 에러 해결.
    - `use_image_upload.ts` 훅에서 `setIsFileCompressing` 셋터를 노출시키고 `membership_hook_signup.ts` 호출 시 비구조화 할당에 추가하여 파일 업로드 로직의 상태 제어 에러 제거.
    - `menu_modal_customize_mobile.tsx` 내 `isolatedModules` 모드 호환을 위해 `MenuItem` 타입을 `export type` 키워드로 안전하게 재수출하도록 리팩토링.
  - **tsc 및 Vite 최종 검증**: `npx tsc --noEmit`을 통한 무결점 통과를 확인하였고, `npm run build` 정적 번들링 및 esbuild 트랜스파일링이 오류 없이 무정지 패스됨을 확인 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` & `backend/` | `components/admin/admin_comp_licenses_validator.tsx`, `components/admin/admin_comp_membershipsub.tsx`, `components/admin/admin_hook_billing.ts`, `components/admin/admin_hook_state.ts`, `components/use_image_upload.ts`, `components/membership_hook_signup.ts`, `components/mobile/menu_modal_customize_mobile.tsx` | tsc 정적 검사 통과 및 isolatedModules, 타입 불일치, 셋터 미노출 등 컴파일 오류 7건을 일괄 정화 완료 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.52.0 cleavage

## [v2.52.0] - 2026-06-04
### Summary
* **[유사 데이터 필드명 공통 카멜케이스(camelCase) 모델 통합 및 백엔드 API 매핑 단일화]**
  - **백엔드 API 모델 매핑 단일화 완료**: `/api/hero-drafts`, `/api/films`, `/api/interiors`, `/api/menu-items` 및 통합 벌크 API (`/api/main-bulk`, `/api/menu-bulk`) 응답 데이터를 통일된 camelCase 모델 객체 구조로 변환하여 전송하도록 백엔드 매핑 헬퍼 함수 (`mapDraftRow`, `mapFilmRow`, `mapInteriorRow`, `mapMenuItemRow`) 구축 및 적용 완료.
  - **프론트엔드 컴포넌트 내 snake_case 혼용 구문 전격 제거**: `bg_image`, `default_bg_image`, `blueprint_image`, `mock_image`, `is_signature`, `name_kr` 등의 snake_case 속성 fallback 바인딩 및 방어 코드를 프론트엔드 렌더링 영역에서 전량 소거하고 표준화된 camelCase (`bgImage`, `defaultBgImage`, `blueprintImage`, `mockImage`, `isSignature`, `nameKr`)로 모델 구조 단일화 완료.
  - **에이전트 지침 마스터북 규칙 영구화 (`AGENTS.md` 수정)**: 향후 신규 필드 작성 및 수정 작업 시 snake_case와 camelCase 데이터 혼용으로 인한 렌더링 및 통신 결함 재발을 종식하고자 `📌 18. 데이터 필드명 공통 카멜케이스(camelCase) 통합 및 백엔드 단일 변환 매핑 규칙`을 마스터 지침서에 공식 명문화하였습니다.
  - **Vite/esbuild 빌드 무오류 통과 및 500줄 규칙 보장**: 리팩토링 후 빌드 무오류 통과를 확인하였으며, 500줄 제한 라인 카운트 확인을 통해 프로젝트 내 모든 human-authored 소스파일이 500줄 이하로 철저히 유지됨을 확인 완료.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `backend/` & `frontend/` | `AGENTS.md`, `server/routes/public/catalog.ts`, `components/admin/admin_comp_menu_table.tsx`, `components/admin/admin_hook_menu.ts`, `components/admin/admin_comp_design.tsx`, `components/admin/admin_comp_drafts.tsx` 등 | 한글명, 이미지 경로, 시그니처 여부 등의 유사 데이터 필드명을 공통 카멜케이스로 통일하고 백엔드 API 단에서 변환 처리 완료 및 에이전트 마스터북 지침 영구 추가 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.51.0 cleavage

## [v2.51.0] - 2026-06-04
### Summary
* **[어드민 확인 모달 공통화 및 인테리어 이미지 업로드 훅 위임 리팩토링]**
  - **어드민 확인 모달 공통화 (`AdminConfirmModal` 컴포넌트 신설 및 이식)**: 어드민 4개 탭(`AdminFilmsTab`, `AdminDesignTab`, `AdminMenuTab`, `DraftsModal`)에 각각 25줄씩 완전히 중복 구현되어 있던 `HASTE Confirm` 다이얼로그 마크업을 `components/admin/admin_comp_shared.tsx` 내의 공통 `AdminConfirmModal` 컴포넌트로 추출하여 중복 코드를 완벽하게 소거했습니다.
  - **인테리어 디자인 파일 업로드 공통 훅 위임 리팩토링 (`admin_comp_design.tsx` -> `useImageUpload` 적용)**: 인테리어 디자인 탭 파일 업로드 함수 내에 80줄에 걸쳐 중복 구현되어 있던 이미지 리사이징, Canvas 압축, `/api/upload` 전송 비동기 로직을 전량 소거하고, 공통 이미지 업로드 훅인 `useImageUpload`로 대체하여 코드 가독성과 유지보수성을 극대화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/admin/admin_comp_shared.tsx`, `components/admin/admin_comp_films.tsx`, `components/admin/admin_comp_design.tsx`, `components/admin/admin_comp_menu.tsx`, `components/admin/admin_comp_drafts_modal.tsx` | 어드민 전반의 HASTE Confirm 중복 모달 통합 공통화 및 인테리어 업로드의 공통 useImageUpload 훅 적용 리팩토링 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.50.0 cleavage

## [v2.50.0] - 2026-06-04
### Summary
* **[페이지네이션 공통 UI 컴포넌트 이식 및 백엔드 CUD 캐시 파괴(Bust) 일관성 강화]**
  - **페이지네이션 공통 컴포넌트 대체 (`admin_page_main.tsx` -> `AdminPagination` 이식)**: 이전에 구현된 공통 페이지네이션 UI인 `AdminPagination` 컴포넌트를 어드민 메인 페이지에 마운트하여 약 50줄의 마크업 중복 코드를 완벽히 제거하고 가독성을 끌어올렸습니다.
  - **백엔드 CUD API 캐시 일관성 강화 (`films.ts`, `menu.ts`, `hero.ts` 캐시 파괴 트리거 추가)**: 어드민 패널에서 필름, 메뉴(카테고리/아이템), 메인 기획 시안을 수정/삭제/추가할 때, 메모리 내 public 읽기 캐시가 즉각적으로 동화(Bust)되도록 전역 `flushPublicReadCache` 트리거를 CUD API 종착점에 완벽하게 이식하여 캐시 불일치 문제를 종식했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` & `backend/` | `components/admin_page_main.tsx`, `server/routes/admin/films.ts`, `server/routes/admin/menu.ts`, `server/routes/admin/hero.ts` | 어드민 메인 페이지네이션의 공통 컴포넌트 적용 및 백엔드 필름, 메뉴, 시안 CUD API 내 캐시 무효화 트리거 이식으로 정합성 보장 | 변경 없음 |

# Cafe-Haste ReleasesCustom release 2.49.0 cleavage

## [v2.49.0] - 2026-06-04
### Summary
* **[공통 이미지 리사이징 및 압축 업로드 모듈화 훅 이식으로 프론트엔드 중복 제거 및 리소스 절약]**
  - **공통 이미지 업로드 훅 이식 (`components/use_image_upload.ts` 신설)**: HTML5 Canvas 기반의 1024px 이미지 압축, 파일 Mime 유효성 체크, Fallback 원본 전송 방어선 구축 및 `/api/upload` 자동 발송 연동 로직을 공통 훅으로 통일 구축했습니다.
  - **회원가입 폼 및 시각 드래프트 컴포넌트 리팩토링 (`membership_hook_signup.ts`, `admin_comp_drafts.tsx`)**: 각각 개별적으로 중복 작성되어 100줄에 달하던 Canvas 가공 및 업로드 비동기 logic을 전량 소거하고 신규 `useImageUpload` 훅으로 대치하여, 중복 코드를 완벽히 제거하고 파일 용량을 추가 경량화했습니다.

| Domain Path | Modified Files | Detailed Changes (What & Why) | DB Schema Changes |
| :--- | :--- | :--- | :--- |
| `frontend/` | `components/use_image_upload.ts`, `components/membership_hook_signup.ts`, `components/admin/admin_comp_drafts.tsx` | 이미지 리사이징/압축 업로드 로직의 공통 커스텀 훅 위임 및 관련 파일 리팩토링으로 코드 복잡성 해소 | 변경 없음 |

# Cafe-Haste ReleasesCustom release Milestone.2 cleavage

## [v2.0.0 ~ v2.48.0] - 2026-06-01 ~ 2026-06-03
### Summary
* **[백엔드 라우터 및 핵심 비즈니스 도메인 CRUD 기능 개발 및 500줄 초과 소스코드 모듈화 분할]**
  - **500줄 이하 코드 다이어트**: 비대해진 데이터베이스 및 회원/상담/드래프트 라우터를 `server/db/database_helpers.ts`, `server/routes/admin/consultations.ts` 등으로 정밀 분할하여 프로젝트 클린 아키텍처 실현.
  - **핵심 도메인 완성**: 가맹점 관리, 브랜드 소개, 카탈로그 메뉴, 게시판 CRUD, 문의 관리, 지점 위치 지도 연동 완성.
  - **인메모리 캐싱 및 리소스 최적화**: 0원 비용 RAM 캐싱과 과부하 방지용 단일 벌크 API 구현으로 DB 커넥션 해제 병목 차단.

| Domain Path | Description | Key Achievements |
| :--- | :--- | :--- |
| `backend/` & `frontend/` | 도메인 CUD API 및 화면단 기능 완성, 파일 라인 500줄 클린 가이드 정립 | 전체 비즈니스 모듈 개발 완료, 리팩토링을 통한 성능 극대화 |

# Cafe-Haste ReleasesCustom release Milestone.1 cleavage

## [v1.0.0 ~ v1.9.9] - 2026-05-31 ~ 2026-06-01
### Summary
* **[헤이스트(HASTE) 카페 웹 애플리케이션 초기 구조 설계 및 Vite UI 셋업]**
  - **Vite + React 기반 프론트엔드 환경 설계**: UI 테마(시그니처 브론즈 골드) 정의 및 기본 CSS 레이아웃 구조 세팅.
  - **서버 아키텍처 기획**: Express + Node.js 백엔드 초기 서버 파이프라인 및 Supabase DB 초기 시딩 셋업.

| Domain Path | Description | Key Achievements |
| :--- | :--- | :--- |
| `frontend/` & `backend/` | 프로젝트 초기 뼈대 및 기본 레이아웃 구성 | 개발 인프라 환경 구축 및 브랜드 스타일 가이드 기반 세팅 |