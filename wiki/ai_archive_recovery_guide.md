# AI 대화 기록 복원 가이드 (AI Archive Recovery Guide)

이 문서는 24시간 초과로 인해 자동으로 백업 및 압축된 과거 AI 대화 기록(Gemini Brain Log)을 필요할 때 에이전트가 탐색하고 꺼내 쓸 수 있도록 돕는 매뉴얼입니다.

---

## 📂 1. 대화 백업 폴더 구조 (Archive Directory)

비활성화된 대화 세션은 원래의 브레인 폴더(`brain/`)에서 완전히 소거된 뒤, 아래의 백업 폴더에 날짜별로 구분되어 압축 파일(`.zip`) 형태로 보존됩니다.
*   **백업 기본 경로**: `C:\Users\김성규\.gemini\antigravity\brain_backup`
*   **날짜별 경로**: `C:\Users\김성규\.gemini\antigravity\brain_backup\YYYY-MM-DD\`
*   **파일명 형식**: `[대화-GUID].zip` (예: `eb4270cb-cefb-4a08-8e4b-2e00f335242e.zip`)

---

## 🔍 2. 복원 대상 탐색 방법 (How to Find Archives)

특정 시점의 대화 기록이나 과거 코딩 맥락을 꺼내와야 하는 경우, 에이전트는 아래의 순서로 탐색을 수행합니다.

1.  **백업 디렉토리 목록 조회**:
    에이전트는 `C:\Users\김성규\.gemini\antigravity\brain_backup` 폴더를 리스팅하여 백업된 날짜 목록을 확인합니다.
2.  **특정 날짜 세션 리스팅**:
    확인하고자 하는 날짜 폴더로 진입하여 백업된 `.zip` 파일 목록을 탐색합니다.
3.  **대화 내용 미리 확인**:
    각 `.zip` 파일의 이름은 대화 세션의 고유 ID(GUID)입니다. 필요한 경우 PowerShell이나 Node.js 스크립트를 사용하여 ZIP 파일 내부의 `.system_generated/logs/transcript.jsonl` 파일 내 첫 질문(대화 주제)을 파싱하여 타겟 대화를 매칭할 수 있습니다.

---

## 🛠️ 3. 대화 세션 복원 방법 (How to Restore Archives)

에이전트는 PowerShell 명령어를 사용해 특정 아카이브 압축을 해제하여 원래의 활성 브레인 폴더(`brain/`)로 복원할 수 있습니다.

### PowerShell 복원 명령어 예시
```powershell
# 예시: 2026-06-17 일자 대화(GUID: eb4270cb-cefb-4a08-8e4b-2e00f335242e)를 복원하는 경우
Expand-Archive -Path "C:\Users\김성규\.gemini\antigravity\brain_backup\2026-06-17\eb4270cb-cefb-4a08-8e4b-2e00f335242e.zip" -DestinationPath "C:\Users\김성규\.gemini\antigravity\brain\eb4270cb-cefb-4a08-8e4b-2e00f335242e" -Force
```

### 복원 후 가동 작업
1.  복원이 완료되면 원래의 활성 `brain/` 폴더 하위에 해당 GUID 폴더가 생성됩니다.
2.  이후 바탕화면의 `sync_wiki.bat` 또는 `node scratch/sort_conversations.cjs`를 실행하면, 복원된 대화 기록이 자동으로 [WIKI_CONVERSATIONS.md](file:///c:/Users/김성규/Desktop/HASTE-Company/cafehaste-web/WIKI_CONVERSATIONS.md) 위키 색인 목록에 복구 및 갱신됩니다.
3.  에이전트는 복구된 경로의 `transcript.jsonl`을 다시 읽어 과거 대화 내용과 변경 맥락을 완벽히 흡수할 수 있습니다.
