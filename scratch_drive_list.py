import sys
import io
from gdown.download_folder import download_folder

def capture_gdown_metadata():
    folder_id = "1lTJR3rud7-kiZmXiPP1kYHDNvTQgsUQf"
    url = f"https://drive.google.com/drive/folders/{folder_id}"
    
    # stdout 캡처 설정
    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    
    try:
        print("Starting download_folder metadata fetch...")
        # skip_download=True 로 실행하면 다운로드 없이 콘솔에 파일 목록을 로깅함
        download_folder(url=url, skip_download=True, quiet=False)
        output = sys.stdout.getvalue()
    except Exception as e:
        output = f"Error occurred: {e}\n{sys.stdout.getvalue()}"
    finally:
        sys.stdout = old_stdout

    # 캡처된 콘솔 아웃풋 출력
    print("Gdown output length:", len(output))
    
    # KST 7월 8일 오후 3시 40분 (KST 15:40) 경의 파일이름 패턴 검색
    # 카톡 저장 작명 예시:
    # 1) KakaoTalk_20260708_1540
    # 2) Talk_Photo_2026-07-08-15-40
    # 3) 20260708_1540
    lines = output.split('\n')
    matches = []
    for line in lines:
        if "20260708_154" in line or "2026-07-08-15-4" in line or "소다" in line or "탄산" in line:
            matches.append(line)
            
    print(f"\nFound {len(matches)} matched files in logs:")
    for m in matches:
        print(m)

    # 7월 8일자 전체 파일 목록을 날짜별로 좁혀보기 위해 7월 8일(20260708 또는 2026-07-08) 패턴 검색
    day_matches = [line for line in lines if "20260708" in line or "2026-07-08" in line]
    print(f"\nFound {len(day_matches)} files for date 2026-07-08:")
    for m in day_matches[:30]:  # 상위 30개만
        print(m)

    # 만약 이름 매칭이 안되면, 전체 덤프 파일로 저장해서 우리가 7월 8일 부근 파일을 직접 검색할 수 있게 함
    with open("gdown_files.txt", "w", encoding="utf-8") as f:
        f.write(output)
    print("\nSaved full files list to gdown_files.txt")

if __name__ == "__main__":
    capture_gdown_metadata()
