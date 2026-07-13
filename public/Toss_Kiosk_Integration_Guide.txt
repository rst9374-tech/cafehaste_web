# 토스플레이스 키오스크 플러그인 통합 연동 가이드북 (v2.4.0)

본 문서는 매장용 로컬 프로그램(PC방 관리 프로그램, 락커 제어 시스템 등)과 **토스 키오스크(Toss Front + 결제 단말기)** 간의 실시간 결제 완료 정보 연동을 위한 통합 API 규격서입니다.

---

## 1. 개요 및 연동 원칙 (Overview)

* **실시간 주문 정보 연동**: 고객이 토스 키오스크에서 결제를 완료하면, 백그라운드 구동 플러그인이 결제 완료(`paid`) 이벤트를 수신하여 로컬 프로그램의 API 엔드포인트로 결제 정보를 즉시 전송합니다.
* **보안 통신(HTTPS) 강제**: 토스 POS의 보안 규정상 로컬 프로그램과의 통신은 **무조건 HTTPS(SSL/TLS)**로 이루어져야 하며, 자체 서명(Self-signed) 인증서는 단말기 내부에서 차단됩니다.
* **루프백 도메인 우회**: 토스 개발자 센터의 ACL(허용 주소) 제약을 우회하기 위해, 공인 도메인 **`local.cafehaste.com`**을 로컬 루프백 IP인 **`127.0.0.1`**로 DNS 매핑하여 사용합니다.
  * ※ 주소 작동을 위해 헤이스트에서 제공하는 **`local.cafehaste.com`용 SSL 인증서 파일 (`cert.pem`, `key.pem` 또는 `cert.pfx`)**을 로컬 서버에 등록해야 합니다.

---

## 2. 표준 상품 코드 규격 (v4.1.0 8자리 고정 길이)

모든 상품 코드의 고유성 확보 및 100% 알고리즘 기반 자동 치환을 위해 **8자리 고정 길이** 표준 코드를 사용합니다. 토스 키오스크에서 복잡하게 주문 조합을 하더라도 플러그인이 자동으로 매핑 및 분석하여 아래 형태의 코드로 변환 전송합니다.

### ☕ 2.1. 음료 품목 (Beverages)
음료 품목은 사이즈, 베이스, 기존 대분류 구분값, 고유 레시피 일련번호를 조합합니다.

$$\text{코드 구조} = \text{[Size (1자)]} + \text{[Base (1자)]} + \text{[Category Digit (1자)]} + \text{[Recipe ID (5자)]}$$

1. **Size (1번째 자리)**:
   * **`M`**: 미니벤티 (상품명 끝에 `_MV`가 붙음)
   * **`G`**: 그란데 (상품명 끝에 `_G`가 붙거나 기본형 사이즈)
   * **`V`**: 벤티 (상품명 끝에 `_V`가 붙음)
2. **Base (2번째 자리)**:
   * **`S`**: 스탠다드 원두 커피 (아메리카노, 에스프레소, 카페라떼, 바닐라라떼, 돌체라떼 등 원두 추출 음료)
   * **`P`**: 프리미엄 원두 커피 (프리미엄 원두 추출 음료)
   * **`D`**: 디카페인 원두 커피 (디카페인 원두 추출 음료)
   * **`M`**: 논커피 우유 음료 (초코라떼, 녹차라떼, 고구마라떼, 흑당라떼, 바나나카라멜라떼, 슈크림라떼 등 우유 베이스)
   * **`T`**: 물/티 음료 (Tea - 페퍼민트, 캐모마일, 복숭아아이스티, 유자차 등 물 베이스 비탄산 음료)
   * **`A`**: 탄산 음료 (Ade - 에이드, 스파클링 등 탄산수 베이스 음료)
3. **Category Digit (3번째 자리)**:
   * 기존 8자리 POS 코드의 2번째 숫자를 그대로 가져와 카테고리 간 ID 중복 및 매장/배달 구분을 정의합니다.
     * **`0`**: 매장 주문용 코드 (예: `E0...` 계열)
     * **`7`**: 배달 주문용 코드 (예: `E7...` 계열 - 배달의민족, 쿠팡이츠 등 배달 채널 단가 보전용)
     * 예: `E0000150` ➔ `0` / `E7000150` ➔ `7`
4. **Recipe ID (4~8번째 자리)**:
   * 기존 POS 코드의 마지막 5자리 일련번호를 그대로 유지합니다.

### 🍰 2.2. 디저트 및 상품 품목 (Desserts & Goods)
기계와 연동되지 않는 상품(마카롱, 쿠키, 샌드위치, 봉투 등)은 정산 데이터 호환을 위해 첫 글자만 `X`로 치환하고 나머지 7자리 숫자를 그대로 유지합니다.

$$\text{코드 구조} = \text{X} + \text{[기존 POS 번호 뒤쪽 7자리]}$$

* 예시: `E9000004` (마카롱) ➔ **`X9000004`**

---

## 3. 연동 아키텍처 및 엔드포인트 (Architecture & Endpoint)

```text
[토스 POS 단말기]
       │
       │ (HTTPS Request)
       ▼
https://local.cafehaste.com:8080/api/order
       │
       │ [DNS A-Record가 127.0.0.1로 매핑되어 있음]
       ▼
[매장 로컬 PC (Port 8080)]
  (Haste사에서 제공한 SSL 인증서가 탑재된 로컬 API 서버 수신 대기)
```

* **수신 엔드포인트**: `POST` | `https://local.cafehaste.com:[PORT]/api/order` (기본 포트: `8080`)

---

## 4. Request 헤더 (보안 인증 레이어)

* **`X-Haste-API-Key`** : 필수 | String
  * 👉 발급받은 마스터 시크릿 키: **`HASTE_SECRET_LIVE_9363`**
* **`X-Haste-Timestamp`** : 필수 | Long / String
  * 👉 요청이 송신된 시점의 유닉스 타임스탬프 (밀리초 단위).
  * ⚠️ **[필수 구현]**: 로컬 수신 프로그램은 현재 PC 시스템 시간과 `X-Haste-Timestamp`의 차이가 **5분(300초)**을 초과할 경우 차단(`401 Unauthorized`)해야 합니다.
* **`Authorization`** : 선택 | String
  * 👉 `Bearer HASTE_SECRET_LIVE_9363` (HTTP 표준 규격 지원용)

---

## 5. 데이터 규격 (JSON Payload)

v2.4.0에서 전송 페이로드가 극도로 간소화되었습니다. 불필요한 이벤트 구분, 승인 키, 결제 금액, 시간 정보는 모두 제외하고 꼭 필요한 최소 정보만 전송합니다.

### ■ 5.1 Request Body (요청 송신 규격)
```json
{
  "orderId": "TOSS-ORD-202606240001",
  "token": "HASTE_SECRET_LIVE_9363",
  "items": [
    {
      "productNo": "GS000101",
      "name": "HOT_아메리카노_G",
      "quantity": 1
    },
    {
      "productNo": "VS000412",
      "name": "ICED_카페라떼_V",
      "quantity": 2
    }
  ]
}
```

* **`orderId`**: 토스플레이스 키오스크/POS가 생성하는 고유 주문 번호 (매장 주문 발생 시마다 유니크하게 발급되어 중복 주문 수신을 방지할 수 있습니다.)
* **`token`**: 연동 보안 검증 토큰 (헤더의 `X-Haste-API-Key` 검증과 병행하여 확인 필수)
* **`items`**: 주문 상품 리스트 (음료 품목만 포함)
  * **`productNo`**: **v4.1.0 표준 상품 코드 (예: `GS000101`, `VS000412`)**
  * **`name`**: 상품/음료명 (예: `HOT_아메리카노_G`)
  * **`quantity`**: 주문 수량 (개수)
* **디저트/사이드 자동 제외**: 로컬 프로그램은 음료 정보만 처리하므로, 디저트/베이커리/푸드/MD/사이드 등 음료가 아닌 품목은 **플러그인이 수신 즉시 자동으로 필터링하여 전송 데이터에서 원천 제외**합니다. (예: 음료 2잔과 케이크 1개를 같이 주문할 경우, 로컬 서버에는 음료 2잔 정보만 전송됨)

### ■ 5.2 Response Body (수신 성공 응답)
요청을 정상적으로 처리했다면, HTTP 상태 코드 `200 OK`와 함께 아래 응답을 반환해 주시면 됩니다.
```json
{
  "success": true,
  "message": "Order processed successfully"
}
```

---

## 6. 로컬 프로그램 개발 환경별 SSL(HTTPS) 적용 가이드

Haste사로부터 인증서(`cert.pem` / `key.pem` / `cert.pfx`)를 다운로드받은 후 각 개발 프레임워크에 맞게 적용하는 방법 예시입니다.

### ■ A. Java Spring Boot (application.yml 설정)
다운로드받은 `cert.pfx` 파일을 `src/main/resources/` 하위에 배치합니다.
```yaml
server:
  port: 8080
  ssl:
    key-store: classpath:cert.pfx
    key-store-type: PKCS12
    key-store-password: HASTE_CERT_PASSWORD # 제공되는 비밀번호 입력
```

### ■ B. Node.js (Express 예시)
`cert.pem`과 `key.pem` 파일을 로컬 폴더에 두고 https 모듈을 사용해 구동합니다.
```javascript
const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/order', (req, res) => {
    // 1. 헤더 보안 체크
    const apiKey = req.headers['x-haste-api-key'];
    if (apiKey !== 'HASTE_SECRET_LIVE_9363') {
        return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }
    // 2. 비즈니스 로직 처리
    console.log("주문 정보 수신:", req.body);
    res.json({ success: true, message: 'Order processed' });
});

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(8080, () => {
    console.log('HTTPS Server running on port 8080');
});
```

---

## 7. 매장 설치 시 체크리스트
1. **방화벽 설정**: 로컬 PC의 인바운드 방화벽 규칙에서 설정한 수신 포트(예: 8080)가 열려있어야 단말기로부터 패킷 수신이 가능합니다.
2. **네트워크 결합**: 토스 단말기(키오스크)와 로컬 PC가 매장 내 동일한 공유기(서브넷 IP 대역) 아래 연결되어 있어야 통신이 원활히 작동합니다.
