---
name: haste-documenter
description: "개발 계획서(exec-plans), 작업 검증 보고서(walkthroughs) 및 릴리즈 매니페스트 버전 제어 스킬"
---

# 문서 및 기록 관리 스킬 (haste-documenter)

본 지침은 에이전트가 개발 프로세스를 아카이빙하고 레포지토리 기록물(releases, walkthroughs, exec-plans)을 관리하기 위한 태스크 스킬입니다.

## 📌 1. 개발 프로세스 아카이빙
* **작성 순서**:
  1. 개발 착수 시 `docs/exec-plans/active/`에 세부 계획서 작성 및 마스터님의 승인 획득.
  2. 개발 완료 및 로컬 컴파일 성공 후, `docs/walkthroughs/`에 작업 검증 완료 보고서 작성 및 캡처 이미지 매핑.
  3. 완료된 계획서는 `docs/exec-plans/completed/`로 이관하여 보존.

## 📌 2. 단일 통합 버전 관리 (Lilly 식 단일 버전 통제)
* 신규 릴리즈 시 최상위 `PLATFORM_VERSION` 파일의 버전을 갱신하고, `scripts/sync_version.js`를 구동하여 아래 **23개 버전 동기화 개소(파일/위치)** 내의 UI 텍스트 및 메타데이터 버전 정보를 일괄 자동 동기화합니다:

### ⚙️ 버전 동기화 대상 5대 리스트 (5 Sync Targets)
1. **`PLATFORM_VERSION`**: 마스터 버전 정보 소스 (예: `2.5.0`)
2. **`hat.md/contracts/kiosk_toss_integration_guide.md`**: 연동 가이드북 헤더 버전 수정
3. **`src/cafehaste-kiosk/src/App.tsx`**: 키오스크 UI 상단 로고 배지 버전 (`vX.X.X (SDK Hook)`) 수정
4. **`src/cafehaste-kiosk/package.json`**: 키오스크 프로젝트 패키지 버전 수정
5. **`src/cafehaste-web/package.json`**: 웹 프로젝트 패키지 버전 수정

## 📌 3. 런타임 연동 호환성 검증 규칙 (Version Compatibility Matrix Check)
신규 릴리즈 문서를 컴파일하거나 버전을 배포하기 전에, 에이전트는 반드시 `hat.md/operations/web_version_compatibility_matrix.md`에 선언된 **시스템 런타임 호환성 규격**을 교차 체크하여 검증해야 합니다:

* **웹 & 키오스크 버전 일치**: `cafehaste-web`과 `cafehaste-kiosk`는 상시 동일한 `PLATFORM_VERSION` (예: `2.5.0`)으로 매칭되어 빌드 및 구동되어야 합니다.
* **커피머신 제어 모듈(Lilly) 호환성**: 외부 커피머신 연동 패키지(`src/cafehaste-lilly`)는 플랫폼 버전 `2.5.0` 기준 **`5.0.7`** 버전과 통신이 상호 호환되는 관계입니다. (Lilly는 영구 동결 상태이므로 임의로 버전을 올리거나 수정하지 않습니다)
* **운영 배포 제한**: 배포 시 `PLATFORM_VERSION` 내에 `-dev` 접미사(예: `2.5.0-dev`)가 존재하는 경우, 실서버 클라우드 Run 프로덕션 배포는 금지되며 오직 `main` 브랜치 병합용 최종 정식 버전 번호만 빌드 적재될 수 있습니다.

