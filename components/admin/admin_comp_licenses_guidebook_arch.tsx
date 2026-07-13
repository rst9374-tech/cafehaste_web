import React from 'react';
import { X, Network, Database, Cpu, FileText, Code } from 'lucide-react';

interface ArchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchGuideModal: React.FC<ArchGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white border border-stone-200 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-6 max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-[#FAF9F6] border-b border-stone-150 py-4.5 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-stone-900">
            <FileText className="text-[#C5A059]" size={22} />
            <h3 className="font-bold text-base tracking-tight">원격제어 및 레시피 관리 시스템 아키텍처 설계서</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-750 transition-all rounded-lg cursor-pointer"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs md:text-sm text-stone-650 max-h-[600px]">
          
          <div className="text-center pb-2 border-b border-stone-100">
            <span className="text-xs font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">HQ SYSTEM ARCHITECTURE</span>
            <h4 className="text-stone-900 font-bold text-lg">원격 제어 및 레시피 관리 아키텍처 설계서</h4>
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">헤이스트 웹 제어반(Supabase)과 매장 내 로컬 자바 서버 간의 데이터 연동 및 원격 제어 설계서 전문입니다.</p>
          </div>

          <div className="flex flex-col gap-6 font-sans text-stone-700">
            
            {/* 1. Topology */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Network size={14} className="text-[#C5A059]" /> 1. 시스템 통합 네트워크 구성 (Topology)</h5>
              <p className="text-stone-550 mb-3 text-xs leading-relaxed">
                NAT 사설망 내부의 매장 로컬 서버 제어 한계를 극복하기 위해, 웹 서버를 중간 큐(Command Queue)로 활용하는 **비동기 Pull 방식**을 채택합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed overflow-x-auto">
{` [ 점주 웹 브라우저 ]  <--- (HTTPS) --->  [ 헤이스트 웹 서버 (Node.js / Supabase) ]
                                                    │
                                           (Cloud DB / Command Queue)
                                                    │
 [ 매장 로컬 자바 서버 ] <--- (아웃바운드 Polling / WebSocket) ┘
         │
         ├─── (TCP/IP socket) ───> [ 무인 키오스크 ]
         └─── (Serial / Modbus) ──> [ 커피머신 및 컵 배출 장치 ]`}
              </div>
            </div>

            {/* 2. Sequence Description */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Code size={14} className="text-[#C5A059]" /> 2. 실시간 원격 제어 흐름 (Sequence Diagram)</h5>
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2 text-xs leading-relaxed">
                <p><strong>[원격 제어 흐름 단계]</strong></p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-stone-550">
                  <li><strong>제어 명령 발행</strong>: 점주 마이페이지 웹에서 컵배출/레시피동기화/결제취소 명령 요청 ➔ DB `web_store_commands` 테이블에 PENDING 상태로 적재.</li>
                  <li><strong>주기적 명령 감지</strong>: 매장 자바 로컬서버가 3초 주기로 `GET /api/store/commands` API를 호출(Polling)하여 대기 명령을 파싱.</li>
                  <li><strong>상태 천이(PROCESSING)</strong>: 명령 접수 시 `status`를 PROCESSING으로 갱신하여 중복 실행 방지.</li>
                  <li><strong>하드웨어 구동</strong>: 자바 로컬서버가 키오스크(TCP/IP) 또는 컵배출 장치(Serial 통신) 제어 모듈을 호출하여 물리 제어 개시.</li>
                  <li><strong>결과 보고(COMPLETED/FAILED)</strong>: 처리 여부에 따라 최종 결과를 `POST /api/store/commands/result` API를 통해 헤이스트 클라우드로 전송.</li>
                </ol>
              </div>
            </div>

            {/* 3. Database Schema (DDL) */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Database size={14} className="text-[#C5A059]" /> 3. 데이터베이스 테이블 설계 (DDL)</h5>
              <p className="text-stone-550 mb-3 text-xs leading-relaxed">
                카멜케이스(camelCase) 통합 규약을 따르는 3대 테이블 DDL 스펙 사양입니다.
              </p>
              <div className="space-y-4 font-mono text-[11px] leading-relaxed">
                {/* DDL 1 */}
                <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850">
                  <strong className="text-stone-200 block mb-2 font-sans text-xs">3.1. web_store_recipes (매장 레시피 테이블)</strong>
                  <pre className="overflow-x-auto">
{`CREATE TABLE web_store_recipes (
  id SERIAL PRIMARY KEY,
  store_code VARCHAR(20) NOT NULL, -- 매장 고유 코드 (표준은 SYSTEM_STD)
  menu_code VARCHAR(20) NOT NULL, -- 메뉴 고유 번호
  menu_name VARCHAR(50) NOT NULL, -- 메뉴 이름
  water_ml INT DEFAULT 0, -- 물 셋팅값 (ml)
  ice_g INT DEFAULT 0, -- 얼음 셋팅값 (g)
  syrup_ml INT DEFAULT 0, -- 시럽 셋팅값 (ml)
  is_customized BOOLEAN DEFAULT FALSE, -- 점주 커스텀 여부
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT idx_store_menu UNIQUE (store_code, menu_code)
);`}
                  </pre>
                </div>

                {/* DDL 2 */}
                <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850">
                  <strong className="text-stone-200 block mb-2 font-sans text-xs">3.2. web_store_servers (매장 서버 정보 테이블)</strong>
                  <pre className="overflow-x-auto">
{`CREATE TABLE web_store_servers (
  id SERIAL PRIMARY KEY,
  store_code VARCHAR(20) UNIQUE NOT NULL, -- 매장 고유 코드
  applied_version VARCHAR(20) NOT NULL, -- 로컬서버 적용 버전
  latest_version VARCHAR(20) NOT NULL, -- 서버 배포 최종 버전
  connection_status VARCHAR(20) DEFAULT '정지', -- 서버 통신 상태 (정상, 지연, 정지)
  last_ping_at TIMESTAMP NULL, -- 최종 신호 감지 시간
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                  </pre>
                </div>

                {/* DDL 3 */}
                <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850">
                  <strong className="text-stone-200 block mb-2 font-sans text-xs">3.3. web_store_commands (원격 제어 명령 큐 테이블)</strong>
                  <pre className="overflow-x-auto">
{`CREATE TABLE web_store_commands (
  id BIGSERIAL PRIMARY KEY,
  store_code VARCHAR(20) NOT NULL, -- 매장 고유 코드
  command_type VARCHAR(30) NOT NULL, -- 명령 종류 (DISPENSE_CUP, REFRESH_RECIPE, CANCEL_PAYMENT)
  parameter_json JSONB NULL, -- 명령별 상세 파라미터
  status VARCHAR(20) DEFAULT 'PENDING', -- 진행 상태 (PENDING, PROCESSING, COMPLETED, FAILED)
  error_message TEXT NULL, -- 실패 시 에러 원인 기록
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL
);
CREATE INDEX idx_store_pending ON web_store_commands (store_code, status);`}
                  </pre>
                </div>
              </div>
            </div>

            {/* 4. API Spec */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Cpu size={14} className="text-[#C5A059]" /> 4. 백엔드 API Endpoints 스펙</h5>
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-4">
                <div className="space-y-1.5">
                  <strong className="text-stone-900 text-xs block">4.1. [GET] 매장별 대기 중인 명령 목록 조회</strong>
                  <span className="text-[11px] text-stone-400 font-mono block">GET /api/store/commands?store_code=075575&status=PENDING</span>
                  <pre className="bg-stone-950 text-stone-300 p-3 rounded-xl font-mono text-[10.5px] overflow-x-auto">
{`{
  "success": true,
  "commands": [
    {
      "id": 1042,
      "commandType": "DISPENSE_CUP",
      "parameterJson": { "cupType": "ICE_PAPER", "quantity": 1 }
    }
  ]
}`}
                  </pre>
                </div>
                <div className="space-y-1.5 border-t border-stone-200 pt-3">
                  <strong className="text-stone-900 text-xs block">4.2. [POST] 명령 처리 결과 리포트</strong>
                  <span className="text-[11px] text-stone-400 font-mono block">POST /api/store/commands/result</span>
                  <pre className="bg-stone-950 text-stone-300 p-3 rounded-xl font-mono text-[10.5px] overflow-x-auto">
{`{
  "commandId": 1042,
  "status": "COMPLETED",
  "errorMessage": null
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* 5. Java Code Snippet */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5"><Code size={14} className="text-[#C5A059]" /> 5. 로컬 자바 서버(Java) 명령 수집 핸들러 예시 코드</h5>
              <p className="text-stone-555 mb-3 text-xs leading-relaxed">
                매장용 로컬 프로그램 내부에서 동작할 비동기 Pull/Execute 핸들러 샘플 자바 소스코드입니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed max-h-[300px] overflow-y-auto">
                <pre>
{`import java.net.URI;
import java.net.http.*;
import org.json.JSONArray;
import org.json.JSONObject;

public class HasteRemoteController implements Runnable {
    private final String storeCode = "075575";
    private final String serverUrl = "https://cafehaste-web-sdb.asia-northeast1.run.app/api/store/commands";
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public void run() {
        while (true) {
            try {
                // 1. PENDING 상태의 제어 명령 폴링
                String requestUri = serverUrl + "?store_code=" + storeCode + "&status=PENDING";
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(requestUri))
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                JSONObject jsonResponse = new JSONObject(response.body());

                if (jsonResponse.getBoolean("success")) {
                    JSONArray commands = jsonResponse.getJSONArray("commands");
                    for (int i = 0; i < commands.length(); i++) {
                        JSONObject cmd = commands.getJSONObject(i);
                        executeCommand(cmd);
                    }
                }
                
                // 2. 3초 대기 후 루프 반복
                Thread.sleep(3000);
            } catch (Exception e) {
                System.err.println("[오류] 원격 명령 폴링 실패: " + e.getMessage());
            }
        }
    }

    private void executeCommand(JSONObject cmd) {
        long commandId = cmd.getLong("id");
        String type = cmd.getString("commandType");
        JSONObject params = cmd.optJSONObject("parameterJson");
        
        System.out.println("[원격 제어 수신] ID: " + commandId + ", 유형: " + type);
        
        boolean success = false;
        String errorMsg = null;

        try {
            switch (type) {
                case "DISPENSE_CUP":
                    success = DeviceController.dispenseCup(params.getString("cupType"));
                    break;
                case "CANCEL_PAYMENT":
                    success = KioskController.cancelPayment(params.getString("tid"), params.getInt("amount"));
                    break;
                default:
                    errorMsg = "지원되지 않는 원격 명령 유형입니다.";
            }
        } catch (Exception e) {
            errorMsg = e.getMessage();
        }

        // 처리 결과 백엔드로 피드백 전송
        reportResult(commandId, success ? "COMPLETED" : "FAILED", errorMsg);
    }

    private void reportResult(long commandId, String status, String errorMsg) {
        // HTTP POST를 이용한 결과 전송 로직 구현...
    }
}`}
                </pre>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-150 p-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-[#C5A059] font-bold rounded-xl text-sm transition-all active:scale-97 cursor-pointer"
          >
            설계서 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
