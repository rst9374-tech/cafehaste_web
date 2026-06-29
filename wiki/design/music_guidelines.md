---
type: design
date: 2026-06-11
status: active
---

# 헤이스트(Haste) 브랜드 AI 음원 제작 지침서

- **음악 제작 필수 요건**:
  - *제작자 요청 최우선*: 제작자가 특정 메시지(가사 내용)나 곡의 분위기(무드/장르)를 지정할 경우, 아래 기본 가이드보다 해당 요청을 무조건 1순위로 적용합니다.
  - *헤이스트 BGM 전용 규칙*: 제작자가 "헤이스트 BGM 만들어줘"라고 요청할 때만 아래 조건이 필수로 적용됩니다.
    1. 제목 규칙: 곡 제목에 반드시 `Haste_`가 포함되어야 합니다. (예: `Haste_Velvet Pulse`)
    2. 필수 키워드: 가사 내용 중에 브랜드명인 `Haste`가 최소 1회 이상 반드시 포함되어야 합니다.
    3. 메시지 반영: 헤이스트의 4가지 메인 슬로건(1. 성공을 향한 가속, 헤이스트 / 2. 당신의 하루가 가벼워지는 속도 / 3. 느린 도심 속, 기분 좋은 가속 / 4. A Quick Break, A Perfect Rest) 중 하나의 감성을 가사에 녹여냅니다.
  - *일반 곡 제작*: 일반 곡 요청 시에는 제목에 `Haste_`를 붙이지 않으며 가사에 `Haste` 키워드를 억지로 넣지 않고 자유롭게 제작합니다.
  - *곡 길이 및 스펙*: 모든 곡은 최소 2분 30초 ~ 최대 3분 30초 분량, 20대 여성의 맑고 부드러운 영어(English) 보컬로 제작합니다.
- **답변 출력 필수 형식 (홈페이지/DB 동기화용)**:
  - AI를 통한 음원 생성 완료 시, 텍스트 답변에는 반드시 다음 7가지 항목을 형식에 맞춰 포함하여 안내해야 합니다.
    1. 곡 제목 및 재생 시간 (Title & Duration): 곡의 무드에 어울리는 영문 제목 및 재생 시간 (헤이스트 BGM인 경우 `Haste_Title (02:45)` 형식 준수)
    2. 반영된 메시지 (Message/Slogan): 가사 작성에 모티브가 된 슬로건 및 핵심 테마 명시
    3. 장르 및 분위기 (Genre & Mood): 곡의 음악적 장르와 전반적인 곡의 분위기 명시
    4. 추천 청취 상황 (Recommended Moment): 비 오는 날, 늦은 오후, 아침 출근길 등 곡과 가장 잘 어울리는 날씨/상황 추천 (DB 태그 매핑용)
    5. 곡 설명 (Description): 곡 설명 끝에 헤이스트 공통 홍보문구인 **"헤이스트 가맹점 전용 아날로그 BGM 서비스로, 방문하는 손님들과 점주님 모두에게 깊이 있고 편안한 무드의 하루를 선사합니다."**를 자연스럽게 결합하여 출력합니다.
    6. 커버 이미지 콘셉트 (Cover Art Concept): 곡의 가사 내용과 제목에 직관적으로 매칭되며, 골드/블랙 테마에 어울리는 앨범 커버 이미지 디자인 묘사
    7. 유튜브 및 메타 태그 (YouTube Tags): 유튜브 업로드 및 홈페이지 오픈그래프(OG) 메타 노출을 위한 맞춤형 해시태그 제공 (예: `#hasteplaylist #커피머신로컬서버 #매장용BGM #감성로파이` 등)
- **AI 음악 생성용 추천 프롬프트 템플릿**:
  Suno/Udio 등 AI 음원 생성 모델 입력 시, 헤이스트 감성에 맞는 고급스러운 사운드 질감을 얻기 위해 아래 프롬프트 구조를 기본으로 조합하여 사용합니다.
  - *기본 보컬 & 톤 프롬프트*: `crystal clear female 20s vocals, soft pure delivery, close mic, warm English diction, intimate, elegant`
  - *스타일 & 무드 프롬프트*:
    1. **Lo-Fi Chill (나른한 오후)**: `lo-fi beats, warm rhodes keys, soft vinyl crackles, mellow acoustic guitar, cozy lounge vibe, 76 bpm`
    2. **Bossa Acoustic (상쾌한 아침)**: `acoustic nylon guitar, gentle shaker, light percussion, breezy lounge bossa nova, warm morning sun, 80 bpm`
    3. **Indie Dream Pop (감성 마감)**: `dreamy analog synth pads, warm bass, mellow dynamic drums, soft indie pop, late night café vibe, 72 bpm`
  - *공통 제외 키워드 (Negative Prompt)*: `loud brass, heavy distortion, autotune, rap, aggressive beats, electronic dance music, sharp treble, screaming`