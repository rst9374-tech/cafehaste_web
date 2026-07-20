---
name: haste-web-developer
description: "점주 대시보드(/control) 및 본사 어드민(/admin) 통합 개발, 로그인 리다이렉트 통제 및 23대 가이드 문서 버전 동기화 스킬"
---

# 대시보드 개발 및 정비 스킬 (haste-dashboard-developer)

본 지침은 가맹점주 대시보드 화면 및 관련 API의 개발과 유지보수를 지시하는 태스크 스킬입니다.

## 📌 1. 점주 로그인 리다이렉트 시 네비바 색상 꼬임 방지
* **동작 원리**: 로그인 완료 후 대시보드 진입 시 네비바 테마 스타일이 꼬이는 현상을 방지하기 위해, `onLoginSuccess` 콜백에서는 반드시 **`window.location.href = '/control'`** 을 사용하여 하드 리로드 리다이렉트 방식으로 대시보드 진입을 강제합니다.

## 📌 2. 게시글 수정(에디터)과 상세 보기의 WYSIWYG 원칙
* **스타일 격리**: 홈페이지 전반의 글로벌 CSS가 에디터 영역을 침범하지 않도록, 에디터 영역 스타일은 `board_comp_write.tsx` 내에 격리된 동적 스타일 샌드박스로만 설계 및 통제합니다.
* **개행 데이터 무결성**: DB 로드 시 날것의 개행 문자(`\n`, `\r`)를 사전에 제거하여 이중 개행을 막고 문단 마진에 의해서만 동일한 높이로 보존되게 합니다.

## 📌 3. 고정 에셋 스토리지 절대경로 매핑
* 대시보드 사이드바 등 메인 고정 에셋(로고 이미지 등)은 Supabase Storage 버킷(`cafehaste-bucket`) 내 절대 경로 주소로 다이렉트 링크하여 제공합니다.

---

# 어드민 개발 및 라이선스 정비 스킬 (haste-admin-developer)

본 지침은 본사 어드민 관리 도구, 회원 심사 시스템 및 검증 로그 분석 시스템 개발을 규율하는 태스크 스킬입니다.

## 📌 1. 라이선스 발급 및 연동 검증
* **라이선스 키 구조**: `hs_live_` 접두사를 포함하는 32자리 난수 텍스트 형태를 취합니다.
* **점주 마이페이지 노출**: 골드 프레임 홀로그램 카드 UI(`bg-gradient-to-br from-stone-900 border-[#C5A059]`) 내에 실시간 노출되어 인증 카드 형식을 띱니다.

## 📌 2. 실시간 검증기 로그 파싱 및 DB 세션 해제
* **초고속 DB 커넥션 해제**: SQL 쿼리 실행 완료 즉시 `connection.release()`를 기동하여 커넥션을 즉시 반환시킵니다.
* **로그 파싱 정규식**:
  ```javascript
  const logRegex = /^\[(\[^\]]+)\s+(\[^\]]+)\s+\[IP:\s+(\[^\]]+)\]\s+\[APPROVED:\s+(\[^\]]+)\]\s+-\s+(.*)$/;
  ```
  해당 정규식을 기동하여 어드민 로그보드에서 연동시각, 매장코드, IP정보, 승인판정, 상세메시지를 파싱하여 바인딩합니다.
## 📌 3. 웹 어드민 가이드북 및 스펙 버전 동기화 개소
플랫폼 배포 및 동기화 기동 시 본 스킬 범위 내의 아래 파일들이 업데이트됩니다:
1. **`src/cafehaste-web/public/Local_Program_API_Specs.md`**: 로컬 API 규격서 헤더 및 날짜 자동 갱신
2. **`src/cafehaste-web/components/admin/admin_page_test_validator.tsx`**: 실시간 검증기 내 다운로드 속성 링크 버전 보정
3. **`src/cafehaste-web/components/admin/admin_comp_licenses_guidebook.tsx`**: 어드민 카드 UI 내 가이드북 종류별 카드 타이틀 버전 수정
4. **`src/cafehaste-web/components/admin/admin_comp_licenses_guidebook_*.tsx`** 계열: 개별 가이드 모달 헤더 버전 수정 (member, api, license, validator, tips, kiosk, recipe 총 7개 모달)
5. **`src/cafehaste-web/package.json`**: 웹 프로젝트 패키지 버전 동기화
