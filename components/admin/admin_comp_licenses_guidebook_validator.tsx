import React from 'react';
import { X, Activity, Shield, FileText, FileJson, Clock } from 'lucide-react';

interface ValidatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidatorGuideModal: React.FC<ValidatorGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-white border-2 border-[#C5A059] rounded-3xl p-6 shadow-2xl relative w-full max-w-3xl max-h-[85vh] overflow-y-auto flex flex-col justify-between animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
        >
          <X size={22} />
        </button>

        <div className="space-y-5 text-left">
          <h3 className="text-xl font-bold text-stone-900 border-b border-stone-150 pb-3 flex items-center gap-2 font-serif">
            <Activity size={22} className="text-[#C5A059]" />
            <span>실시간 멤버십 검증기 및 로그 규격 가이드 (v1.2.0)</span>
          </h3>

          <div className="space-y-4 text-base text-stone-650 leading-relaxed font-light font-sans font-normal text-stone-650">
            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Shield size={13} className="text-[#C5A059]" />
                <span>1. 실시간 검증 엔진 개요</span>
              </span>
              <p className="text-stone-750 font-bold mb-2">
                매장 가입, 약정 서명 날인, 구독 결제 및 로컬 서버 동기화 등 실시간 상태 변화 발생 시 정합성을 크로스 체킹하는 검증기입니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>이중 검증 (Cross-Validation)</strong>: 프론트엔드 조작 탐지 및 위변조 방지를 위해 백엔드에서 원본 API 데이터와 2차 대조합니다.</li>
                <li><strong>즉시 롤백 동기화</strong>: 메타데이터 연동 실패 시 스토리지에 기적재된 임시 덤프 파일을 영구 롤백 삭제(`delete`) 처리하여 클러터를 예방합니다.</li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <FileText size={13} className="text-[#C5A059]" />
                <span>2. 검증 로그 저장 방식 (Logging Strategy - DB & Storage Hybrid)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                GCP Cloud Run의 휘발성(Stateless) 단점을 보완하고 성능 부하와 비용을 0원으로 수렴하기 위한 3단계 하이브리드 적재 아키텍처를 사수합니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>5분 램 버퍼링 적재</strong>: API 검증 요청이 들어올 때마다 매번 DB에 개별 쿼리를 날리지 않고, 서버 램 메모리 버퍼(`pendingLogBuffer`)에 5분간 수집(버퍼링)하여 DB 커넥션 과부하를 방지합니다. 호출이 0건이면 DB 쿼리가 발생하지 않습니다.</li>
                <li><strong>실시간 DB 벌크 이관 (5분 주기)</strong>: 5분마다 램 버퍼에 쌓인 당일 로그들을 모아 단일 트래픽 쿼리로 묶어 Supabase DB 테이블(`web_verify_logs`)에 일괄 벌크 적재(Bulk Insert)하고 버퍼를 비웁니다. 새로고침 시에도 DB에서 긁어오므로 실시간 데이터 정합이 보장됩니다.</li>
                <li><strong>자정 스토리지 백업 및 용량 최소화 (90일 보존)</strong>: 매일 자정(00:00 KST)에 DB에 쌓였던 직전 하루치 로그들을 긁어모아 텍스트 파일(`local_api_log_YYYY-MM-DD.txt`)로 가공해 Supabase Storage(`logs/` 버킷)에 백업하고, DB 테이블은 완전히 비워(Delete) DB 용량을 상시 최소화합니다. 스토리지의 90일 경과 로그 파일은 자동 소거합니다.</li>
                <li><strong>과거 로그 온디맨드 복원</strong>: 어제 등 과거 날짜를 조회하면 서버가 Supabase Storage에서 텍스트 파일을 가져와 파싱하므로, 서버 재기동/GCP 재배포로 서버가 초기화되어도 3달치 과거 이력을 유실 없이 복원 및 조회 가능합니다.</li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <FileJson size={13} className="text-[#C5A059]" />
                <span>3. 데이터베이스 테이블 설계 (DDL) 및 데이터 규격 (camelCase)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                웹서버와 클라이언트 간 통일된 필드 규약을 위해 모든 로그 데이터 모델은 카멜케이스(camelCase) 필드를 준수합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed mb-2">
                <strong className="text-stone-200 block mb-2 font-sans text-xs">web_verify_logs (실시간 검증 로그 테이블)</strong>
                <pre className="overflow-x-auto select-all">
{`CREATE TABLE web_verify_logs (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(100) NOT NULL, -- 매장 식별 ID (예: gangnam-01)
  ip VARCHAR(50) NOT NULL, -- 접속 IP (예: 192.168.0.1)
  is_approved BOOLEAN NOT NULL, -- 인증 통과 여부 (TRUE/FALSE)
  status_type VARCHAR(10) NOT NULL, -- PASS / WARN / RISK / DUP
  message TEXT NOT NULL, -- 전산 메시지 및 누적 카운트
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_logs_store_time ON web_verify_logs (store_id, created_at);`}
                </pre>
              </div>
              <div className="bg-stone-900 text-stone-300 p-3.5 rounded-xl text-xs font-mono whitespace-pre leading-normal overflow-x-auto select-all">
{`{
  "storeId": "gangnam-01",
  "ip": "192.168.1.45",
  "isApproved": true,
  "statusType": "pass",
  "message": "[DB 실시간 랜덤검증] 실시간 가맹 등록자 가맹 패킷 인증 성공 (APPROVED) [일간 검증요청: 12회]",
  "createdAt": "2026-06-06T19:15:20.000Z"
}`}
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Clock size={13} className="text-[#C5A059]" />
                <span>4. DB 커넥션 병목 극복 수칙</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                30개 커넥션 풀 제한을 초과하지 않기 위해 로그 검증 완료 즉시 커넥션 자원을 릴리즈합니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>즉시 릴리즈</strong>: 쿼리가 실행 완료되면 지체 없이 <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] text-rose-600">connection.release()</code>를 호출하여 풀로 반환합니다.</li>
                <li><strong>외부 API 호출 전 반환</strong>: 외부 PG사 결제 API 및 Gemini API 등의 호출 대기 전에는 무조건 DB 커넥션을 선제 반환합니다.</li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Shield size={13} className="text-[#C5A059]" />
                <span>5. 정상/이상 신호 차단 및 위협 발생 조건 (Security Protocol)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                검증기는 매장 연동 요청에서 이상 신호를 실시간 모니터링하여 즉각 차단을 수행합니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>정상 패킷 조건</strong>: 마스터 키(<code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] text-stone-750">HASTE_SECRET_LIVE_9363</code>)가 일치하고, 패킷에 포함된 타임스탬프와 서버 현재 시각의 오차가 ±5분(300,000ms) 이내인 경우 통과 처리됩니다.</li>
                <li><strong>이상 신호 감지 및 자동 차단 (위협 발생 조건)</strong>:
                  <br/> • <strong>헤더 위조</strong>: 올바르지 않은 마스터 키 또는 임의의 시크릿 키가 전달된 경우 즉시 401 Unauthorized 반환 및 IP 차단 경고를 기록합니다.
                  <br/> • <strong>리플레이 어택 (Replay Attack)</strong>: 동일 패킷을 재사용하거나 타임스탬프 오차가 5분을 초과하는 경우 비정상 위협 패킷으로 판단하여 즉각 차단합니다.
                  <br/> • <strong>비정상 다중 접속 (Duplication Detect)</strong>: 단일 라이선스 키로 서로 다른 IP에서 동시 세션 동기화가 감지되는 즉시 해당 매장의 상태를 <code className="bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded text-xs border border-rose-200/50">가동 정지</code>로 즉각 락다운 처리합니다.
                </li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Activity size={13} className="text-[#C5A059]" />
                <span>6. 시뮬레이터 검증 도구 작동법 (Validator Simulator)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                검증 패널에서 제공하는 시뮬레이터를 통해 가상으로 라이선스 검증 상황을 모의 수행해볼 수 있습니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>1회 검증 실행 (Single Run)</strong>: 지정한 매장 코드에 대해 단발성으로 1회 검증 패킷을 발생시킵니다. 즉각적인 결과 상태(OK / EXPIRED / LOCK)가 로그보드에 실시간 플로우로 적재됩니다.</li>
                <li><strong>10회 연속 검증 실행 (10-Loop Burst)</strong>: 트래픽 밀집 및 부하 상황을 시뮬레이션하기 위해 10회 연속 요청 루프를 순차적(0.1초 간격)으로 기동시킵니다.</li>
                <li><strong>테스트 고유번호 분리 규약</strong>:
                  <br/> • <strong>store[번호] (실제 DB 연동 시험용)</strong>: 실제 DB 라이선스 대장에 등록되어 상태값(정지/만료 등)을 조작하며 실시간 검증을 테스트할 수 있는 매장 계정입니다.
                  <div className="my-2 border border-stone-200 rounded-xl overflow-hidden text-[10.5px]">
                    <table className="w-full text-left text-stone-600 bg-white leading-normal">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-extrabold text-[9px] tracking-wider uppercase">
                          <th className="p-2 pl-3">테스트 계정</th>
                          <th className="p-2">매장 명칭</th>
                          <th className="p-2">라이선스 상태</th>
                          <th className="p-2 pr-3">API 예상 결과</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-stone-100">
                          <td className="p-2 pl-3 font-mono font-bold text-stone-900">store123456</td>
                          <td className="p-2 font-medium">강남본점 (PREMIUM)</td>
                          <td className="p-2 text-emerald-600 font-semibold">인증 완료 (정상)</td>
                          <td className="p-2 pr-3 text-emerald-600 font-mono font-extrabold">PASS (정상승인)</td>
                        </tr>
                        <tr className="border-b border-stone-100">
                          <td className="p-2 pl-3 font-mono font-bold text-stone-900">store123457</td>
                          <td className="p-2 font-medium">역삼지점 (STANDARD)</td>
                          <td className="p-2 text-emerald-600 font-semibold">인증 완료 (정상)</td>
                          <td className="p-2 pr-3 text-emerald-600 font-mono font-extrabold">PASS (정상승인)</td>
                        </tr>
                        <tr className="border-b border-stone-100">
                          <td className="p-2 pl-3 font-mono font-bold text-stone-900">store123458</td>
                          <td className="p-2 font-medium">홍대입구역점 (PREMIUM)</td>
                          <td className="p-2 text-amber-600 font-semibold">기간 만료 (EXPIRED)</td>
                          <td className="p-2 pr-3 text-amber-600 font-mono font-extrabold">WARN (만료유예)</td>
                        </tr>
                        <tr className="border-b border-stone-100">
                          <td className="p-2 pl-3 font-mono font-bold text-stone-900">store123459</td>
                          <td className="p-2 font-medium">부산서면점 (PREMIUM)</td>
                          <td className="p-2 text-rose-600 font-semibold">가동 정지중 (SUSPENDED)</td>
                          <td className="p-2 pr-3 text-rose-600 font-mono font-extrabold">FAIL (가동정지)</td>
                        </tr>
                        <tr>
                          <td className="p-2 pl-3 font-mono font-bold text-stone-900">store123460</td>
                          <td className="p-2 font-medium">신규가맹점 (PREMIUM)</td>
                          <td className="p-2 text-stone-500 font-semibold">인증 대기 (요청)</td>
                          <td className="p-2 pr-3 text-rose-600 font-mono font-extrabold">FAIL (승인대기)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  • <strong>storex[번호] (순수 가상 모의용)</strong>: DB 조회 없이 로컬 메모리상에서만 모의 기동되는 가상 트래픽용 계정으로, 라이선스 관리 목록에는 표시되지 않습니다. (예: <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[10px] text-stone-700">storex123456</code> ~ <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[10px] text-stone-700">storex123460</code>도 동일 상태로 즉시 가상 매핑되어 모의 응답합니다.)
                </li>
                <li><strong>실매장 관제 보호 필터</strong>: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] text-rose-600">storex</code>로 시작하는 모든 테스트 트래픽 로그는 좌측 메인 관제 보드에서 원천 배제/격리되어 우측 개발용 모니터 터미널로만 분류 적재됩니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 bg-stone-900 text-[#C5A059] font-bold rounded-xl border border-stone-850 hover:bg-stone-850 transition-all text-base cursor-pointer font-sans"
        >
          창 닫기
        </button>
      </div>
    </div>
  );
};
