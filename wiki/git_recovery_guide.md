# 에이전트 Git 이력 복구 및 형상 관리 가이드

본 문서는 에이전트가 소스코드를 특정 시점으로 복구하거나 롤백할 때 발생할 수 있는 소스 유실 및 꼬임 현상을 방지하기 위한 핵심 규약입니다.

## 1. 꼬임 현상 원인 분석
- **문제 상황**: 특정 컴포넌트(예: `brand_page_main.tsx`)를 과거 상태로 되돌리기 위해 단순 복구 명령을 내릴 때, 관련이 없거나 오늘 낮에 수정했던 랩퍼 파일(예: `brand_page_mobile.tsx`)까지 최초 Git 커밋(HEAD, 6월 4일자) 버전으로 동반 롤백되는 문제 발생.
- **원인**: 에이전트가 복구 파일 대상을 명확히 한정하지 않고 와일드카드나 전체 복구를 수행하여, 오늘 변경된 다른 파일들의 uncommitted 최신 로직이 날아가고 구버전으로 덮어써짐.

## 2. 재발 방지 대책 및 운영 가이드

### 규칙 A. 복구 작업 전 '임시 세이브' 필수 실행
- `git checkout` 또는 `git reset` 등 소스코드를 파괴하거나 되돌리는 명령을 실행하기 직전에는, 현재의 uncommitted 로컬 작업본 전체를 안전한 백업 브랜치에 임시 저장(커밋)하여 최신 소스 유실 가능성을 100% 차단합니다.
  ```powershell
  # 복구 전 백업용 임시 커밋 생성 예시
  git checkout -b temp-safe-backup
  git add .
  git commit -m "temp backup before recovery"
  git checkout main
  ```

### 규칙 B. 복구 대상 경로의 엄격한 한정 (격리 복구)
- 파일이나 디렉토리 일부만 복구할 때는 명령어에 대상 경로를 정확히 지정하여, 다른 파일들에 영향이 가지 않도록 격리 복구해야 합니다.
  ```powershell
  # 올바른 예: 특정 파일만 특정 커밋 버전에서 복구
  git checkout <commit_hash> -- components/brand_page_main.tsx
  ```
- 전체 checkout (`git checkout .` 또는 `git checkout -- .`)은 uncommitted 최신 작업이 전부 증발하므로 절대 임의로 사용해서는 안 됩니다.

### 규칙 C. 복구 후 교차 검증 (Cross-Check)
- 복구 완료 후 반드시 `git status` 및 `git diff`를 수행하여, 의도한 파일 외에 다른 파일들이 이전 상태로 원치 않게 덮어써지지 않았는지 확인하고 컴파일(`npx tsc --noEmit`) 무결성을 확인합니다.
