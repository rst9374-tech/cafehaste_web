# Cafe Haste Webpage

## 데이터베이스 설정 (Environment Variables)

이 프로젝트는 데이터베이스 접속을 위해 환경 변수를 사용합니다. 보안을 위해 Database 인증 정보를 소스 코드에 직접 기입하지 마십시오.

새로운 환경(GitHub, 로컬, 혹은 다른 서버)에서 배포할 때, 루트 디렉토리에 `.env` 파일을 생성하고 아래 내용을 입력해 주세요.

```env
DB_HOST=your-supabase-host-address
DB_PORT=5432
DB_USER=postgres.your-project-id
DB_PASSWORD=your-db-password
DB_NAME=postgres
DB_CONNECTION_LIMIT=10
# DEMO_MODE=true (테스트 모드 활성화 시 관리자 인증 우회 가능)
# GEMINI_API_KEY=your-gemini-api-key
```

### 환경 변수 매핑 가이드 (Cloud Run)
Google Cloud Run 배포 시, **서비스 설정 -> 환경 변수** 탭에 위와 동일한 키(예: `DB_HOST`)와 값으로 등록하시면 서버가 자동으로 연결합니다.

### CI/CD 자동 배포 (GitHub Actions)
- GitHub `main` 브랜치에 코드가 푸시되면 자동으로 Google Cloud Run에 배포됩니다.
- 환경 변수 및 배포 권한은 GitHub Repository Secrets를 활용해 안전하게 관리됩니다.

