# 로컬 프로그램 연동 API 규격서 (v1.2.0)

이 문서는 커피머신 로컬 제어 프로그램이 카페헤이스트 중앙 서버와 통신하여 매장의 라이선스 활성화 상태를 검증하고, 오프라인 임시 가동 권한(Offline Grace Period)을 안전하게 획득하기 위한 API 연동 규격서입니다.

---

## 📌 1. 기본 통신 정보
*   **Base URL**: `https://cafehaste.com`
*   **API Endpoint**: `POST /api/v1/store/verify`
*   **Content-Type**: `application/json`

---

## 📌 2. Request 헤더 규격 (보안 인증 레이어)
보안 위조 및 리플레이 공격 방지를 위해 헤더에 마스터 시크릿 키와 타임스탬프 주입이 필수적입니다.

*   **`X-Haste-API-Key`** : 필수 | String
    * 발급 마스터 시크릿 키: `HASTE_SECRET_LIVE_9363`
*   **`X-Haste-Timestamp`** : 필수 | Long / String
    * 송신 시점의 유닉스 타임스탬프 (밀리초 단위).
    * ⚠️ **[필수 구현]**: 로컬 서버 시각과 타임스탬프 차이가 **5분(300초)**을 초과하면 리플레이 공격으로 간주하여 `401 Unauthorized`로 차단해야 합니다.

---

## 📌 3. 데이터 규격 (JSON Payload)

### 1) Request Body
```json
{
  "storeId": "store123456"
}
```
* **`storeId`**: 매장의 고유 라이선스 식별 코드 (예: `store123456` ~ `store123460` 테스트 계정 지원)

### 2) Response Body

#### ■ [정상 라이선스 승인] isApproved: true
```json
{
  "isApproved": true,
  "storeGrade": "PREMIUM",
  "storeName": "강남본점",
  "expireDate": "2026-12-31",
  "offlineLicenseToken": "Haste_SecureToken_Gangnam_Premium_Live"
}
```
* **`storeGrade`**: 매장 라이선스 등급 (`PREMIUM` / `STANDARD`)
* **`expireDate`**: 라이선스 만료일 (YYYY-MM-DD)
* **`offlineLicenseToken`**: 로컬에서 암호화 대조할 검증 서명 토큰

#### ■ [기간 만료 - 임시 유예 가동 허용] reason: EXPIRED
```json
{
  "isApproved": false,
  "reason": "EXPIRED",
  "allowOfflineGrace": true,
  "offlineLicenseToken": "Haste_Expired_GraceToken_Sample_9363"
}
```
* **`allowOfflineGrace`**: `true` 반환 시, 만료 후 최대 7일간 임시 오프라인 구동이 허용됩니다.

#### ■ [가동 정지 / 승인 대기] isApproved: false
```json
{
  "isApproved": false,
  "reason": "SUSPENDED", // 또는 "PENDING_APPROVAL"
  "allowOfflineGrace": false,
  "offlineLicenseToken": null
}
```

#### ■ [보안키 인증 실패] reason: INVALID_KEY
```json
{
  "isApproved": false,
  "reason": "INVALID_KEY",
  "allowOfflineGrace": false,
  "offlineLicenseToken": null
}
```

---

## 📌 4. 오프라인 작동 예외 규정 (Offline Grace Period)
*   **네트워크 단절 대응**: 인터넷 장애 발생 시, 로컬 제어 프로그램은 매장 영업 마비를 방지하기 위해 라이선스 만료 후 혹은 통신 단절 시에도 **최대 7일간(Grace Period)** 오프라인 구동을 보장해야 합니다.
*   **유예 기간 만료**: 7일의 오프라인 유예 기간이 초과되면 `allowOfflineGrace`가 `false`로 인식되어 즉시 연동 장비가 완전 잠금(Lock) 모드로 전환되어야 합니다.
