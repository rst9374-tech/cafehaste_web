#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import argparse
import subprocess
import datetime


# YouTube API 패키지 지연 임포트 및 예외 처리
def import_youtube_libs():
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        return build, MediaFileUpload, InstalledAppFlow, Request, Credentials
    except ImportError:
        print("[ERROR] YouTube API 라이브러리가 설치되어 있지 않습니다.", file=sys.stderr)
        print("설치 명령: pip install google-api-python-client google-auth-oauthlib google-auth-httplib2", file=sys.stderr)
        sys.exit(1)

# 헤이스트 브랜드 BGM 생성 가이드 규칙 정의
SLOGANS = [
    "성공을 향한 가속, 헤이스트",
    "당신의 하루가 가벼워지는 속도",
    "느린 도심 속, 기분 좋은 가속",
    "A Quick Break, A Perfect Rest"
]

DEFAULT_VOCAL = "crystal clear female 20s vocals, soft pure delivery, close mic, warm English diction, intimate, elegant"

GENRE_MOOD_PROMPTS = {
    "Lo-Fi": "lo-fi beats, warm rhodes keys, soft vinyl crackles, mellow acoustic guitar, cozy lounge vibe, 76 bpm",
    "보사노바": "acoustic nylon guitar, gentle shaker, light percussion, breezy lounge bossa nova, warm morning sun, 80 bpm",
    "인디팝": "dreamy analog synth pads, warm bass, mellow dynamic drums, soft indie pop, late night café vibe, 72 bpm",
    "재즈": "mellow jazz piano, upright bass, soft brush drums, smoky night club atmosphere, 65 bpm",
    "어쿠스틱": "acoustic folk guitar, warm wooden piano, cozy fireplace ambient, soft fingerpicking, 70 bpm"
}

def cmd_generate_prompt(args):
    """AI 음원 생성용 최적화 프롬프트 및 안내 생성"""
    genre = args.genre
    mood = args.mood
    title = args.title
    description = args.description

    # 제목에 Haste_ 접두사 강제 규칙 적용
    processed_title = title if title.startswith("Haste_") else f"Haste_{title}"

    # 추천 스타일 프롬프트 매핑
    style_prompt = GENRE_MOOD_PROMPTS.get(genre, GENRE_MOOD_PROMPTS["인디팝"])
    
    # 권장 로컬 파일 저장 경로 빌드
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_title = title.lower().replace(' ', '_')
    vocal_rec_path = os.path.join("outputs", "music", genre, f"{clean_title}_{timestamp}.mp3")
    
    print("=== 🎵 AI 음원 생성 요청 가이드 ===")
    print(f"1. 추천 곡 제목 (Title): {processed_title}")
    print(f"2. 음악 스타일 프롬프트 (Style Prompt):")
    print(f"   => {DEFAULT_VOCAL}, {style_prompt}")
    print(f"3. 필수 제외 키워드 (Negative Prompt):")
    print("   => loud brass, heavy distortion, autotune, rap, aggressive beats, electronic dance music, sharp treble, screaming")
    print(f"4. 가사 팁 (Lyrics):")
    print("   * 가사 내에 브랜드명 'Haste'가 최소 1회 이상 포함되도록 작성해 주세요.")
    print("   * 아래 헤이스트 슬로건 중 하나의 감성을 가사에 녹여냅니다.")
    for slogan in SLOGANS:
        print(f"     - \"{slogan}\"")
    print(f"5. 권장 로컬 PC 저장 경로 (Local Save Path):")
    print(f"   => {vocal_rec_path}")
    print(f"\n[안내] 위 정보를 Suno/Udio 등 AI 음원 서비스에 복사하여 입력하세요.")


def cmd_generate_cover(args):
    """앨범 아트 이미지 생성용 프롬프트 및 지침 출력"""
    concept = args.concept
    title = args.title
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_title = title.lower().replace(' ', '_')
    filename = f"cover_{clean_title}_{timestamp}.png"
    target_path = os.path.join("outputs", "covers", filename)
    
    # 골드/블랙 럭셔리 테마를 입힌 16:9 비율의 프롬프트 문안 생성
    cover_prompt = (
        f"A luxury gold and dark-bronze themed concept art of: {concept}. "
        "Aesthetic composition, warm ambient lighting, elegant, detailed, 16:9 aspect ratio illustration."
    )
    
    print("=== 🎨 앨범 커버 이미지 생성 지침 ===")
    print("아래 프롬프트 문구를 사용하여 'generate_image' 도구를 실행하세요:")
    print(f"\nPrompt: {cover_prompt}")
    print(f"ImageName: cover_{clean_title}_{timestamp}")
    print(f"권장 로컬 PC 저장 경로: {target_path}")
    print("\n*주의: 숏츠 비디오 합성 시 이미지는 1080x1920 세로형으로 크롭 또는 리사이징되어 반영됩니다.")


def cmd_setup_youtube(args):
    """유튜브 API 최초 인증 설정"""
    build, MediaFileUpload, InstalledAppFlow, Request, Credentials = import_youtube_libs()
    
    client_secret_file = args.client_secret
    token_file = args.token

    creds = None
    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(client_secret_file):
                print(f"[ERROR] '{client_secret_file}' 파일이 존재하지 않습니다.", file=sys.stderr)
                print("구글 클라우드 콘솔에서 클라이언트 보안 자격증명 JSON을 다운로드하여 루트에 놓아주세요.", file=sys.stderr)
                sys.exit(1)
            
            flow = InstalledAppFlow.from_client_secrets_file(
                client_secret_file, 
                scopes=['https://www.googleapis.com/auth/youtube.upload']
            )
            creds = flow.run_local_server(port=0)
            
        with open(token_file, 'w') as token:
            token.write(creds.to_json())
            
    print("[SUCCESS] 유튜브 API 인증 세션이 성공적으로 설정되었습니다. (token.json 저장됨)")

def cmd_generate_video(args):
    """ffmpeg를 이용하여 이미지와 오디오를 세로형 mp4 숏츠 비디오로 합성"""
    image_path = args.image
    audio_path = args.audio
    category = args.category
    output_path = args.output

    if not os.path.exists(image_path):
        print(f"[ERROR] 이미지가 존재하지 않습니다: {image_path}", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(audio_path):
        print(f"[ERROR] 오디오가 존재하지 않습니다: {audio_path}", file=sys.stderr)
        sys.exit(1)

    # 출력 경로가 주어지지 않은 경우 자동 생성 규칙 작동
    if not output_path:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.basename(audio_path)
        base, _ = os.path.splitext(filename)
        # 기존 파일명에 타임스탬프가 이미 들어가 있지 않은 경우 날짜 추가
        if len(base.split('_')) < 3:
            base = f"{base}_{timestamp}"
        output_path = os.path.join("outputs", "videos", category, f"{base}.mp4")

    # 상위 디렉토리 자동 생성
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # 16:9 가로형 이미지를 9:16 세로형(1080x1920) 비디오로 크롭/스케일링 및 합성하는 ffmpeg 명령어
    command = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", image_path,
        "-i", audio_path,
        "-c:v", "libx264", "-tune", "stillimage",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
        "-shortest", output_path
    ]

    print(f"[RUNNING] 비디오 합성 중: {' '.join(command)}")
    try:
        result = subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"[SUCCESS] 숏츠 비디오가 성공적으로 생성되었습니다: {output_path}")
    except subprocess.CalledProcessError as e:
        print("[ERROR] ffmpeg 실행 실패. 상세 에러:", file=sys.stderr)
        print(e.stderr.decode('utf-8', errors='ignore'), file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("[ERROR] 시스템에 'ffmpeg'가 설치되어 있지 않거나 환경변수 PATH에 등록되지 않았습니다.", file=sys.stderr)
        sys.exit(1)


def cmd_upload_youtube(args):
    """유튜브 숏츠 동영상 업로드"""
    build, MediaFileUpload, InstalledAppFlow, Request, Credentials = import_youtube_libs()
    
    video_path = args.video
    title = args.title
    description = args.description
    token_file = args.token

    if not os.path.exists(token_file):
        print(f"[ERROR] 인증 토큰 파일({token_file})이 없습니다. 'setup-youtube'를 먼저 실행해 주세요.", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(video_path):
        print(f"[ERROR] 업로드할 비디오 파일이 없습니다: {video_path}", file=sys.stderr)
        sys.exit(1)

    creds = Credentials.from_authorized_user_file(token_file)
    youtube = build('youtube', 'v3', credentials=creds)

    body = {
        'snippet': {
            'title': title[:100],  # 제목 글자수 제한 100자
            'description': description,
            'categoryId': '10'  # 10: Music
        },
        'status': {
            'privacyStatus': args.privacy,  # public, private, unlisted
            'selfDeclaredMadeForKids': False
        }
    }

    print(f"[RUNNING] 유튜브에 동영상 업로드 시작: {video_path}")
    media = MediaFileUpload(video_path, chunksize=-1, resumable=True, mimetype='video/mp4')
    
    try:
        request = youtube.videos().insert(
            part=','.join(body.keys()),
            body=body,
            media_body=media
        )
        
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"[UPLOAD] 진행률: {int(status.progress() * 100)}%")
                
        video_id = response.get('id')
        print(f"[SUCCESS] 유튜브 쇼츠 업로드 완료! Video ID: {video_id}")
        print(f"확인 링크: https://youtube.com/shorts/{video_id}")
        
    except Exception as e:
        print(f"[ERROR] 업로드 실패: {str(e)}", file=sys.stderr)
        sys.exit(1)

def cmd_register_song(args):
    """로컬 DB (local_music_songs.json) 에 소프트 패칭 등록"""
    db_path = args.db_path
    
    try:
        song_data = json.loads(args.json_data)
    except json.JSONDecodeError:
        print("[ERROR] 유효하지 않은 JSON 데이터 포맷입니다.", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(db_path):
        # 만약 DB가 없으면 빈 구조 생성
        songs = []
    else:
        with open(db_path, 'r', encoding='utf-8') as f:
            songs = json.load(f)

    # 새로운 ID 결정
    new_id = max([s.get('id', 0) for s in songs]) + 1 if songs else 1
    song_data['id'] = new_id

    # 필수 필드 보완
    if 'title' not in song_data:
        print("[ERROR] 'title' 필드가 존재하지 않습니다.", file=sys.stderr)
        sys.exit(1)
    
    # 덮어쓰지 않고 추가 (Soft-patching)
    songs.append(song_data)

    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(songs, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] 로컬 DB({db_path})에 곡이 정상 등록되었습니다. (ID: {new_id})")

def main():
    parser = argparse.ArgumentParser(description="HASTE 브랜드 음악 자동 생성 및 업로드 CLI 헬퍼")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # 1. generate-prompt
    p_prompt = subparsers.add_parser("generate-prompt", help="AI 프롬프트 생성")
    p_prompt.add_argument("--title", required=True, help="곡 제목")
    p_prompt.add_argument("--genre", default="인디팝", choices=["Lo-Fi", "보사노바", "인디팝", "재즈", "어쿠스틱"], help="곡 장르")
    p_prompt.add_argument("--mood", default="차분", help="곡 분위기")
    p_prompt.add_argument("--description", required=True, help="곡 정보 설명")

    # 2. generate-cover
    p_cover = subparsers.add_parser("generate-cover", help="커버 아트 프롬프트 제안")
    p_cover.add_argument("--title", required=True, help="곡 제목")
    p_cover.add_argument("--concept", required=True, help="디자인 이미지 콘셉트")

    # 3. setup-youtube
    p_setup = subparsers.add_parser("setup-youtube", help="유튜브 API 로그인 자격증명 초기화")
    p_setup.add_argument("--client-secret", default="client_secret.json", help="클라이언트 보안 비밀번호 JSON")
    p_setup.add_argument("--token", default="token.json", help="저장할 인증 토큰 JSON")

    # 4. generate-video
    p_video = subparsers.add_parser("generate-video", help="ffmpeg 기반 비디오 합성")
    p_video.add_argument("--image", required=True, help="이미지 파일 (.png)")
    p_video.add_argument("--audio", required=True, help="오디오 파일 (.mp3/.wav)")
    p_video.add_argument("--category", default="음료홍보", help="동영상 카테고리 (예: 인테리어, 음료홍보, 가이드)")
    p_video.add_argument("--output", default="", help="생성할 비디오 파일 (.mp4) [생략시 outputs/videos/카테고리/ 하위에 자동 생성]")


    # 5. upload-youtube
    p_upload = subparsers.add_parser("upload-youtube", help="유튜브 채널 업로드")
    p_upload.add_argument("--video", required=True, help="업로드할 비디오 파일 (.mp4)")
    p_upload.add_argument("--title", required=True, help="유튜브 동영상 제목")
    p_upload.add_argument("--description", required=True, help="유튜브 동영상 설명란")
    p_upload.add_argument("--privacy", default="unlisted", choices=["public", "private", "unlisted"], help="공개 방식")
    p_upload.add_argument("--token", default="token.json", help="인증 토큰 JSON 파일")

    # 6. register-song
    p_reg = subparsers.add_parser("register-song", help="로컬 DB 등록")
    p_reg.add_argument("--json-data", required=True, help="등록할 JSON 데이터")
    p_reg.add_argument("--db-path", default="local_music_songs.json", help="로컬 DB 파일 경로")

    args = parser.parse_args()

    commands = {
        "generate-prompt": cmd_generate_prompt,
        "generate-cover": cmd_generate_cover,
        "setup-youtube": cmd_setup_youtube,
        "generate-video": cmd_generate_video,
        "upload-youtube": cmd_upload_youtube,
        "register-song": cmd_register_song
    }

    commands[args.command](args)

if __name__ == "__main__":
    main()
