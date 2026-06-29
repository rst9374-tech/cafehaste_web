---
type: design
date: 2026-06-11
status: active
---

# HASTE Studio Wiki (스튜디오 플랫폼 지식 명세)

이 문서는 HASTE Studio의 구글 오팔 스타일 노드 에디터 캔버스 및 줌 컨트롤, 에이전트 CLI 명령어 제어 명세를 보관하는 Wiki 공간입니다. HASTE Studio 프로젝트는 HASTE Web Platform (`cafehaste-web`)과 통합되어 단일 서비스로 운영됩니다.

## 📌 스튜디오 캔버스 및 코드 아키텍처
1. **단일 통합 라우트 및 배포**:
   - 기존 독립 `cafehaste-studio` 서비스 및 `studio.cafehaste.com` 도메인은 폐기되었습니다.
   - 스튜디오는 메인 웹 서비스(`/studio` 경로)로 통합 서빙되며, 백엔드 API 또한 `cafehaste-web` 서버에 완전 병합되었습니다.
   - 주요 진입점 컴포넌트는 `cafehaste-web/components/studio_page_main.tsx` 입니다.
2. **Google Opal 스타일 캔버스**:
   - 다크 차콜 `#121214` 배경에 radial 도트 격자 무늬 배경 적용.
   - 우측 패널은 딥 틸 `#0D5257` 배경으로 전면 랩핑 후 프리뷰 펜타곤 심볼, Got it 툴팁, 민트색 Start 캡슐 버튼 탑재.
3. **줌 컨트롤 및 줌 비율 좌표 보정**:
   - 확대/축소(Zoom In/Out), 화면 맞춤, 스케일 리셋이 수직 알약 툴바로 배치됩니다.
   - 드래그 동작 시 마우스 좌표 계산에 `zoomScale`을 반영하여 줌 스케일링 상태에서도 위치가 밀리지 않도록 좌표를 자동 보정합니다.
4. **500줄 이하 청결도(Clean Architecture)**:
   - 모든 human-authored 소스 파일은 예외 없이 **500줄 이하**로 유지합니다.
   - 스튜디오 코드가 비대해질 경우 `brand_comp_studiocanvas.tsx` 및 `brand_comp_studiodetails.tsx` 처럼 도메인 단위 컴포넌트로 분할 설계하여 깨끗함을 유지합니다.
