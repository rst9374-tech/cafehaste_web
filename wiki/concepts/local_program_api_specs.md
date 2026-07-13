---
type: concept
date: 2026-06-11
status: active
---

# 로컬 프로그램 연동 API 규격서 (Local Program API Specifications)

이 문서는 커피머신 로컬 서버와 본사 중앙 서버 간의 인증, 세션 검증 및 실시간 전산 로그 동기화를 제어하기 위한 API 연동 규격서입니다.

---

## 📌 1. 기본 통신 정보
*   **Base URL**: `https://api.cafehaste.com`
*   **Content-Type**: `application/json`
*   **인증 방식**: HTTP Bearer Header 내 발급된 매장별 라이선스 토큰 삽입

---

## 📌 2. 핵심 API 엔드포인트 명세

### 1) 로컬 프로그램 가동 인증 요청 (Device Authentication)
커피머신 로컬서버 가동 및 최초 구동 시 본사 인증 풀에 활성 라이선스 상태를 체크합니다.

*   **URL**: `POST /api/verify-logs`
*   **Request Body**:
    ```json
    {
      "storeCode": "STORE-1001",
      "licenseKey": "hs_live_a3d24c89f",
      "ipAddress": "192.168.0.24"
    }
    ```
*   **Response (APPROVED: PASS)**:
    ```json
    {
      "success": true,
      "status": "APPROVED: PASS",
      "offlineGraceDays": 7,
      "message": "커피머신 로컬서버 정식 인증 완료"
    }
    ```
*   **Response (APPROVED: EXPIRED - 유예 가동)**:
    ```json
    {
      "success": true,
      "status": "APPROVED: EXPIRED",
      "allowOfflineGrace": true,
      "message": "라이선스 만료. 7일 임시 구동 유예 토큰 발급됨"
    }
    ```
*   **Response (APPROVED: SUSPENDED - 인증 거절/차단)**:
    ```json
    {
      "success": false,
      "status": "APPROVED: SUSPENDED",
      "allowOfflineGrace": false,
      "message": "본사 강제 정지 또는 미인증 접근 시도"
    }
    ```

---

### 2) 인메모리 로그 디스크 동기화 (Flush API)
커피머신의 트래픽 검증 로그 버퍼를 로컬 디스크 텍스트 파일로 기록 동기화합니다.

*   **URL**: `POST /admin/logs/flush`
*   **Headers**: Bearer Admin Token 필수
*   **Response**:
    ```json
    {
      "success": true,
      "flushedCount": 42,
      "savedPath": "logs/haste_api_log_2026-06-11.txt"
    }
    ```

---

## 📌 3. 오프라인 작동 예외 규정 (Offline Grace Period)
*   **네트워크 단절 대응**: 가맹점 내 인터넷 장애 발생 시, 로컬 프로그램은 인증 서버에 도달하지 못하더라도 로컬 캐시를 조회하여 **최대 7일간(Grace Period)** 추가 비용 없이 오프라인 단독 구동을 보장합니다.
*   **유예 초과 차단**: 7일의 오프라인 그레이스 기간이 지나면 `allowOfflineGrace` 판정이 `false`로 강제 리셋되며, 즉시 커피머신 로컬서버 연동 장비가 완전 잠금 모드로 전환됩니다.
