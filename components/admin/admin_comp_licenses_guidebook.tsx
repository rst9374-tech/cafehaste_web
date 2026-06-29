import React, { useState } from 'react';
import { 
  Users, Shield, FileJson, Activity, Settings, MessageSquare, Layers, RefreshCw
} from 'lucide-react';
import { MemberGuideModal } from './admin_comp_licenses_guidebook_member';
import { ApiGuideModal } from './admin_comp_licenses_guidebook_api';
import { LicenseGuideModal } from './admin_comp_licenses_guidebook_license';
import { ValidatorGuideModal } from './admin_comp_licenses_guidebook_validator';
import { ArchGuideModal } from './admin_comp_licenses_guidebook_arch';
import { TipsGuideModal } from './admin_comp_licenses_guidebook_tips';
import { KioskGuideModal } from './admin_comp_licenses_guidebook_kiosk';
import { RecipeGuideModal } from './admin_comp_licenses_guidebook_recipe';

interface AdminLicensesGuidebookProps {
  cloudDbInfo: any;
  dbSize: number | null;
}

export const AdminLicensesGuidebook: React.FC<AdminLicensesGuidebookProps> = ({
  cloudDbInfo,
  dbSize
}) => {
  const [activeModal, setActiveModal] = useState<'MEMBER_GUIDE' | 'API_GUIDE' | 'LICENSE_BOARD_GUIDE' | 'VALIDATOR_GUIDE' | 'ARCH_GUIDE' | 'TIPS_GUIDE' | 'KIOSK_GUIDE' | 'RECIPE_GUIDE' | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const productionEndpointUrl = `https://cafehaste.com/api/v1/store/verify`;

  const sampleRequestJson = JSON.stringify({ storeId: 'store123456' }, null, 2);
  
  const sampleResponseSuccess = JSON.stringify({
    isApproved: true,
    storeGrade: "PREMIUM",
    storeName: "강남본점",
    expireDate: "2026-12-31",
    offlineLicenseToken: "Haste_SecureToken_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }, null, 2);

  const sampleResponseStandard = JSON.stringify({
    isApproved: true,
    storeGrade: "STANDARD",
    storeName: "역삼지점",
    expireDate: "2026-08-15",
    offlineLicenseToken: "Haste_SecureToken_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }, null, 2);

  const sampleResponseExpiredGrace = JSON.stringify({
    isApproved: false,
    reason: "EXPIRED",
    allowOfflineGrace: true,
    offlineLicenseToken: "Haste_Expired_GraceToken_Sample_9363"
  }, null, 2);

  const sampleResponseSuspended = JSON.stringify({
    isApproved: false,
    reason: "SUSPENDED",
    allowOfflineGrace: false,
    offlineLicenseToken: null
  }, null, 2);

  const sampleResponsePending = JSON.stringify({
    isApproved: false,
    reason: "PENDING_APPROVAL",
    allowOfflineGrace: false,
    offlineLicenseToken: null
  }, null, 2);

  const sampleResponseInvalidKey = JSON.stringify({
    isApproved: false,
    reason: "INVALID_KEY",
    allowOfflineGrace: false,
    offlineLicenseToken: null
  }, null, 2);

  const javaCodeSnippet = `import java.io.BufferedReader;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class LicenseVerifier {
    public static void main(String[] args) {
        // [1] HASTE 홈페이지 연동 API 검문소 주소 (제작 시 실 운영 서버 주소 권장)
        String apiURL = "${productionEndpointUrl}";
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
                
                // [4] JSON 파싱 및 오프라인 유예제(Grace Period) 및 차단 제어 분기
                String resultJson = response.toString();
                System.out.println("응답 내용 (JSON): " + resultJson);
                
                if (resultJson.contains("\\"isApproved\\":true")) {
                    System.out.println("★ [인증 합격] 헤이스트 정상 매장 인증 합격! 오프라인 토큰 로컬 갱신 및 유예 카운트다운 7일 리셋");
                } else if (resultJson.contains("\\"allowOfflineGrace\\":true")) {
                    System.out.println("⚠️ [유예 구동] 라이선스는 만료되었으나, 7일 동안의 임시 오프라인 구동 허용!");
                } else {
                    System.out.println("❌ [구동 차단] 유예기간 없는 영구 구동 정지 매장! 즉각적인 프로그램 이모빌라이징 Lock 기동");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`;

  return (
    <div className="space-y-6">
      {/* 5대 가이드북 카드 셀렉터 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카드 1: 가입자 상태별 업무 처리 가이드북 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-[#C5A059]">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block mb-1">
                MEMBERSHIP TRIAGE & AUDIT
              </span>
              <h4 className="text-base font-bold text-stone-900 font-sans">
                가입자 업무 처리 가이드북 (v1.2.0)
              </h4>
              <p className="text-stone-550 font-sans font-light text-xs mt-2 leading-relaxed">
                홈페이지 멤버십 신규 가맹 신청 및 문의 접수 시 초기 상태별 처리 요령과 서류 검증(사업자등록번호, 증빙 상태) 지침, 그리고 안전한 이중 라이선스 정합성 및 자동 삭제보호 정책을 수록하고 있습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('MEMBER_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            가이드북 전문 조회
          </button>
        </div>

        {/* 카드 2: 자바로컬서버연동 API 가이드북 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-[#C5A059]">
              <FileJson size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block mb-1">
                JAVA LOCAL SERVER API SPEC
              </span>
              <h4 className="text-base font-bold text-stone-900 font-sans">
                로컬 프로그램 연동 API 규격서 (v1.2.0)
              </h4>
              <p className="text-stone-555 font-sans font-light text-xs mt-2 leading-relaxed">
                매장 포스/키오스크 자바 프로그램과의 검증 연동 규약입니다. 보안 인증 헤더 규칙, JSON 요청/응답 포맷 및 오프라인 유예 타이머(Grace Period) 예외 처리 모듈 설계 방침과 Java 참조 스니펫 코드를 제공합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('API_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            연동 API 규격서 조회
          </button>
        </div>

        {/* 카드 3: 라이선스 가이드북 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-[#C5A059]">
              <Shield size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block mb-1">
                LICENSE LIFE-CYCLE & LOGIC
              </span>
              <h4 className="text-base font-bold text-stone-900 font-sans">
                라이선스 업무 처리 가이드북 (v1.2.0)
              </h4>
              <p className="text-stone-555 font-sans font-light text-xs mt-2 leading-relaxed">
                라이선스 게시판의 관리 데이터 구성, 라이선스 상태 값에 따른 처리 로직, 오프라인 유예기간(Grace Period) 및 가동 제한 시스템 연동 방식에 대한 통합 지침서입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('LICENSE_BOARD_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            라이선스 가이드북 조회
          </button>
        </div>

        {/* 카드 4: 실시간 멤버십 검증기 가이드북 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-[#C5A059]">
              <Activity size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block mb-1">
                REAL-TIME VALIDATION & LOGS
              </span>
              <h4 className="text-base font-bold text-stone-900 font-sans">
                실시간 검증기 및 로그 규격서 (v1.2.0)
              </h4>
              <p className="text-stone-555 font-sans font-light text-xs mt-2 leading-relaxed">
                실시간 멤버십 검증 엔진의 오토 트랙킹 로그 수집, 파일 및 데이터베이스 로그 적재 포맷(camelCase) 및 대량 트래픽 최적화 가이드입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('VALIDATOR_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            검증기 규격서 조회
          </button>
        </div>

        {/* 카드 5: 토스플레이스 키오스크 연동 규격서 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-[#C5A059]">
              <Layers size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block mb-1">
                TOSS KIOSK INTEGRATION SPEC
              </span>
              <h4 className="text-base font-bold text-stone-900 font-sans">
                토스플레이스 키오스크 연동 규격서 (v2.3.0)
              </h4>
              <p className="text-stone-555 font-sans font-light text-xs mt-2 leading-relaxed">
                매장용 로컬 프로그램과 토스플레이스 키오스크 단말 플러그인 간의 실시간 결제 이벤트 연동 스펙 및 HTTPS 루프백 DNS 도메인 우회 인증서 설정 지침서입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('KIOSK_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            연동 규격서 조회
          </button>
        </div>

        {/* 카드 6: 레시피 통합 변환 규격서 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-[#C5A059]">
              <RefreshCw size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block mb-1">
                RECIPE CONVERTER & SPEC
              </span>
              <h4 className="text-base font-bold text-stone-900 font-sans">
                레시피 통합 변환 규격서 (v4.1.0)
              </h4>
              <p className="text-stone-555 font-sans font-light text-xs mt-2 leading-relaxed">
                토스 POS 레시피와 무인 커피머신 간의 8자리 고정 길이 표준 코드 변환 원칙 및 자동화 변환기(recipe_converter.exe) 프로그램의 작동 절차를 수록하고 있습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('RECIPE_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            변환 규격서 조회
          </button>
        </div>

        {/* 카드 7: 원격제어 및 레시피 아키텍처 설계서 (미구현) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-stone-400">
              <Settings size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-stone-400 tracking-wider uppercase block mb-1">
                SYSTEM REMOTE ARCHITECTURE
              </span>
              <h4 className="text-base font-bold text-stone-600 font-sans">
                원격제어 및 레시피 아키텍처 설계서 <span className="text-xs text-rose-500 font-black">(미구현)</span>
              </h4>
              <p className="text-stone-400 font-sans font-light text-xs mt-2 leading-relaxed">
                헤이스트 웹 제어반과 매장 내 로컬 자바 서버 간의 데이터 통신 토폴로지, SQL DDL 스키마 설계 내용 및 실시간 제어 명령 큐를 조율하는 REST API 규격 전문을 수록하고 있습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('ARCH_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            설계서 전문 조회 (미구현)
          </button>
        </div>

        {/* 카드 8: 카톡글 꿀팁 자동화 가이드북 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-[#C5A059]">
              <MessageSquare size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C5A059] tracking-wider uppercase block mb-1">
                KAKAOTALK TIPS AUTOMATION
              </span>
              <h4 className="text-base font-bold text-stone-900 font-sans">
                카톡글 꿀팁 자동화 가이드북 (v2.3.0)
              </h4>
              <p className="text-stone-555 font-sans font-light text-xs mt-2 leading-relaxed">
                카카오톡 소통방 대화 덤프를 분석하여 가상 카톡 회원 매핑, 게시글 단일 주제 통합 가공, 금지어 대체 적용 및 DB-로컬 백업에 안전하게 주입하는 지침서입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('TIPS_GUIDE')}
            className="w-full mt-5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition-all text-xs cursor-pointer select-none active:scale-98"
          >
            가이드북 전문 조회
          </button>
        </div>
      </div>

      {/* 모달 팝업 컴포넌트 마운트 */}
      <MemberGuideModal 
        isOpen={activeModal === 'MEMBER_GUIDE'} 
        onClose={() => setActiveModal(null)} 
      />

      <ApiGuideModal 
        isOpen={activeModal === 'API_GUIDE'} 
        onClose={() => setActiveModal(null)} 
        productionEndpointUrl={productionEndpointUrl}
        copiedText={copiedText}
        copyToClipboard={copyToClipboard}
        sampleRequestJson={sampleRequestJson}
        sampleResponseSuccess={sampleResponseSuccess}
        sampleResponseStandard={sampleResponseStandard}
        sampleResponseExpiredGrace={sampleResponseExpiredGrace}
        sampleResponseSuspended={sampleResponseSuspended}
        sampleResponsePending={sampleResponsePending}
        sampleResponseInvalidKey={sampleResponseInvalidKey}
        javaCodeSnippet={javaCodeSnippet}
      />

      <LicenseGuideModal 
        isOpen={activeModal === 'LICENSE_BOARD_GUIDE'} 
        onClose={() => setActiveModal(null)} 
      />

      <ValidatorGuideModal 
        isOpen={activeModal === 'VALIDATOR_GUIDE'} 
        onClose={() => setActiveModal(null)} 
      />

      <ArchGuideModal
        isOpen={activeModal === 'ARCH_GUIDE'}
        onClose={() => setActiveModal(null)}
      />

      <TipsGuideModal
        isOpen={activeModal === 'TIPS_GUIDE'}
        onClose={() => setActiveModal(null)}
      />

      <KioskGuideModal
        isOpen={activeModal === 'KIOSK_GUIDE'}
        onClose={() => setActiveModal(null)}
      />

      <RecipeGuideModal
        isOpen={activeModal === 'RECIPE_GUIDE'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
