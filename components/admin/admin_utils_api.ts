interface AdminFetchOptions extends RequestInit {
  showTemporaryToast?: (msg: string) => void;
  showTemporaryError?: (msg: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export async function adminFetch<T = any>(
  url: string,
  options: AdminFetchOptions = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const {
    showTemporaryToast,
    showTemporaryError,
    successMessage,
    errorMessage,
    ...fetchOptions
  } = options;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (data.success) {
      if (successMessage && showTemporaryToast) {
        showTemporaryToast(successMessage);
      }
      return { success: true, data: data };
    } else {
      const errMsg = data.error || errorMessage || "요청 처리 중 오류가 발생했습니다.";
      if (showTemporaryError) {
        showTemporaryError(errMsg);
      }
      return { success: false, error: errMsg };
    }
  } catch (err: any) {
    const errMsg = errorMessage || err.message || "서버 통신 실패";
    if (showTemporaryError) {
      showTemporaryError(errMsg);
    }
    return { success: false, error: errMsg };
  }
}

export const JAVA_CODE_SNIPPET = `import java.io.BufferedReader;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class LicenseVerifier {
    public static void main(String[] args) {
        // [1] 커피머신 홈페이지 연동 API 검문소 주소
        String apiURL = "https://cafehaste.com/api/v1/store/verify";
        String storeId = "store123456"; // 연동 테스트할 매장고유번호
        String masterKey = "HASTE_SECRET_LIVE_9363"; // 최종 마스터 비밀키 (Fix: 9363)

        try {
            URL url = new URL(apiURL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; utf-8");
            conn.setRequestProperty("Accept", "application/json");
            
            // [보안 헤더 1] API 마스터 시크릿 키 주입 (대소문자 보안 레이어 필수 준수)
            conn.setRequestProperty("X-Haste-API-Key", masterKey);
            // [보안 헤더 2] 리플레이 방어 및 타임스탬프 검증 (밀리초 단위)
            conn.setRequestProperty("X-Haste-Timestamp", String.valueOf(System.currentTimeMillis()));
            
            conn.setDoOutput(true);

            // [2] Request Body 전송 (JSON 포맷)
            String jsonInputString = "{\\"storeId\\": \\"" + storeId + "\\"}";
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int code = conn.getResponseCode();
            System.out.println("HTTP Response Code: " + code);

            // [3] Response 결과 읽기
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                
                // [4] JSON 응답에서 오프라인 유예제(Grace Period) 검증 토큰 추출 및 로컬 갱신 처리
                String resultJson = response.toString();
                System.out.println("응답 내용 (JSON): " + resultJson);
                
                // 간단한 정규식 기반 토큰 추출 예시 (실서비스 환경에서는 Jackson/Gson 사용 권장)
                String token = "";
                java.util.regex.Pattern tokenPattern = java.util.regex.Pattern.compile("\\"offlineLicenseToken\\"\\s*:\\s*\\"([^\\"]+)\\"");
                java.util.regex.Matcher matcher = tokenPattern.matcher(resultJson);
                if (matcher.find()) {
                    token = matcher.group(1);
                }
                
                if (resultJson.contains("\\"isApproved\\":true")) {
                    System.out.println("★ [인증 합격] 정식 승인 통과! 발급된 신규 토큰(" + token + ")을 로컬 파일(license.token)에 저장하고 유예 기간을 초기화합니다.");
                    // TODO: 로컬 설정 파일에 token 문자열 쓰기/갱신을 수행하여 오프라인 통신 단절에 대비합니다.
                } else if (resultJson.contains("\\"allowOfflineGrace\\":true")) {
                    System.out.println("⚠️ [만료 유예] 라이선스는 만료되었으나 오프라인 임시 구동이 허용됩니다. 유예 토큰(" + token + ")을 로컬에 저장하고 7일간 비상 작동을 허용합니다.");
                    // TODO: 로컬에 토큰을 저장하고 로컬 타임스탬프를 기록하여 7일 오프라인 경과 시간을 자가 판정합니다.
                } else {
                    System.out.println("❌ [구동 차단] 비인가 또는 정지 상태의 매장입니다. 즉각적인 이모빌라이징 Lock(프로그램 화면 차단 및 기능 잠금)을 작동합니다.");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`;
