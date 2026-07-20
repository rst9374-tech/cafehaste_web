---
type: design
date: 2026-06-11
status: active
---

# HASTE Web Platform Wiki (웹 플랫폼 지식 및 인프라 명세)

이 문서는 카페 헤이스트 메인 웹 플랫폼의 Supabase 인프라, DB 제어, 스토리지 파일 압축 규약 등을 정의하는 Wiki 공간입니다.

## 📌 주요 인프라 및 DB 명세
1. **Supabase 스토리지 단일 버킷 격리**:
   - 모든 미디어 파일은 `cafehaste-bucket` 단일 버킷에 업로드합니다.
   - 새 게시판 생성 시 게시판명 하위 폴더를 동적으로 만들어 호스팅 격리합니다.
2. **이미지 Canvas 리사이징**:
   - 이미지는 브라우저단 Canvas API로 최대 가로세로 1024px 크기의 JPEG(~100-200KB)로 선제 리사이징 및 압축 후 업로드합니다.
   - 이미지 업로드 처리가 필요한 경우 반드시 공통 훅인 `useImageUpload`를 호출해야 합니다.
3. **트랜잭션 및 롤백**:
   - DB 메타데이터 저장 실패 시 스토리지 파일 영구 롤백 삭제(`delete`)를 동기적으로 수행합니다.
4. **초고속 DB 커넥션 해제**:
   - SQL 쿼리 실행 완료 즉시 `connection.release()`를 기동하여 커넥션을 해제합니다. Long-running API 호출 전에는 반드시 커넥션이 반환된 상태여야 합니다.
5. **통합 벌크 API**:
   - 브라우저 연결 병목(최대 6개) 해결을 위해 `main-bulk` 및 `menu-bulk` 단일 번들링 API를 사용합니다.

## 🚀 Cloud Run 배포 규약 (Deployment Convention)
1. **Cloud Run 소스 빌드 배포**:
   - 로컬 Docker 환경에 의존하지 않고, GCP Cloud Build를 통해 소스 코드를 안전하게 업로드 및 원격 빌드하여 배포합니다.
   - 명령어 실행:
     ```bash
     gcloud run deploy cafehaste-web-sdb --source . --project cafehaste-zero --region asia-northeast1
     ```
