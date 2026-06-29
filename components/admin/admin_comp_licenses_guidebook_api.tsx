import React from 'react';
import { X, FileJson, Copy } from 'lucide-react';

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productionEndpointUrl: string;
  copiedText: string | null;
  copyToClipboard: (text: string, label: string) => void;
  sampleRequestJson: string;
  sampleResponseSuccess: string;
  sampleResponseStandard: string;
  sampleResponseExpiredGrace: string;
  sampleResponseSuspended: string;
  sampleResponsePending: string;
  sampleResponseInvalidKey: string;
  javaCodeSnippet: string;
}

export const ApiGuideModal: React.FC<ApiGuideModalProps> = ({
  isOpen,
  onClose,
  productionEndpointUrl,
  copiedText,
  copyToClipboard,
  sampleRequestJson,
  sampleResponseSuccess,
  sampleResponseStandard,
  sampleResponseExpiredGrace,
  sampleResponseSuspended,
  sampleResponsePending,
  sampleResponseInvalidKey,
  javaCodeSnippet
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-white border-2 border-[#C5A059] rounded-3xl p-6 shadow-2xl relative w-full max-w-3xl max-h-[85vh] overflow-y-auto flex flex-col justify-between animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="space-y-5 text-left">
          <h3 className="text-xl font-bold text-stone-900 border-b border-stone-150 pb-3 flex items-center justify-between font-serif">
            <span className="flex items-center gap-2">
              <FileJson size={22} className="text-[#C5A059]" />
              <span>자바로컬서버연동 필수 API 규격서 (v1.2.0)</span>
            </span>
            <button 
              type="button"
              onClick={() => copyToClipboard(productionEndpointUrl, 'api-endpoint-modal')}
              className="text-xs text-[#C5A059] hover:text-[#b08e4d] font-bold mr-6 transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Copy size={13} />
              <span>{copiedText === 'api-endpoint-modal' ? '복사완료!' : 'API 주소 복사'}</span>
            </button>
          </h3>

          <div className="space-y-4 text-base text-stone-650 leading-relaxed font-light font-sans">
            <div className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-xl">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block mb-1.5">1. 개요 및 개발 원칙 (Overview)</span>
              <p className="text-stone-750 font-bold mb-2">
                매장용 자바(Java) 프로그램과 백엔드 서버 간의 안전하고 무결한 라이선스 검증 연동을 위한 규격 및 예외 처리 로직입니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>보안 키 및 타임스탬프 검증 필수</strong>: 단순 매장 고유 ID 조작을 방지하기 위한 핵심 보안 인증 레이어 필수 적용</li>
                <li><strong>오프라인 유예제(Grace Period) 필수 구현</strong>: 예기치 못한 매장 네트워크 단절이나 라이선스 만료 시 갑작스러운 차단 및 영업 정지 피해 방지</li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-xl space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block">2. 정식 엔드포인트 정보 (Production Info)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-stone-600 bg-white p-2.5 rounded-lg border border-stone-150">
                <div>
                  <span className="text-stone-400 block font-semibold">통신 방식 및 콘텐츠 규격</span>
                  <p className="font-mono text-stone-850 font-bold mt-0.5">POST | Content-Type: application/json; utf-8</p>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold">응답 수신 설정 (Accept Header)</span>
                  <p className="font-mono text-[#C5A059] font-bold mt-0.5">Accept: application/json</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-stone-400 font-semibold block mb-1">운영 서버 주소 (Host IP)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-[#C5A059]/10 text-[#C5A059] font-bold px-1.5 py-0.5 rounded text-xs uppercase">LIVE</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={productionEndpointUrl} 
                    className="bg-stone-50 font-semibold text-stone-750 p-1.5 px-2.5 border rounded border-stone-200 text-xs font-mono flex-1 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(productionEndpointUrl, 'api-endpoint-prod-modal')}
                    className="bg-white hover:bg-stone-100 text-stone-600 p-1.5 px-2.5 rounded border border-stone-205 text-xs active:scale-95 transition-all font-extrabold cursor-pointer"
                  >
                    {copiedText === 'api-endpoint-prod-modal' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-xl space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block">3. Request 헤더 (보안 인증 레이어)</span>
              <div className="space-y-1.5">
                <div className="bg-white p-2 border border-stone-150 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-stone-850 font-bold">X-Haste-API-Key</span>
                    <span className="bg-rose-50 text-rose-750 px-1 py-0.2 rounded text-[10px] font-bold">필수 | String</span>
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-1">
                    👉 담당자가 발급한 정식 마스터 시크릿 키 : <code className="font-mono text-rose-600 bg-rose-50/50 px-1.5 py-0.5 rounded text-xs font-bold select-all">HASTE_SECRET_LIVE_9363</code>
                  </p>
                </div>
                <div className="bg-white p-2 border border-stone-150 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-stone-850 font-bold">X-Haste-Timestamp</span>
                    <span className="bg-rose-50 text-rose-750 px-1 py-0.2 rounded text-[10px] font-bold">필수 | Long / String</span>
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">
                    👉 요청을 보내는 시점의 유닉스 타임스탬프 (밀리초 단위). <br/>
                    <span className="text-amber-600 font-normal">※ 서버 시간과 5분 이상 차이 날 경우 패킷 변조로 간주하여 차단됨</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-xl space-y-3">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block">4. 데이터 규격 (JSON 포맷)</span>
              <div>
                <span className="text-xs text-stone-500 font-bold block mb-1">■ 4.1 Request Body (요청 송신 규격)</span>
                <pre className="bg-stone-900 text-stone-300 p-2.5 rounded-lg text-xs font-mono leading-tight whitespace-pre select-all">
                  {sampleRequestJson}
                </pre>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-green-700 font-bold block">■ 4.2 [케이스 A-1] 정상 매장 인증 합격 (PREMIUM)</span>
                <pre className="bg-[#E8F5E9]/50 border border-[#C8E6C9] text-stone-700 p-2.5 rounded-lg text-[11px] font-mono leading-tight whitespace-pre">
                  {sampleResponseSuccess}
                </pre>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-green-700 font-bold block">■ 4.3 [케이스 A-2] 정상 매장 인증 합격 (STANDARD)</span>
                <pre className="bg-[#E8F5E9]/50 border border-[#C8E6C9] text-stone-700 p-2.5 rounded-lg text-[11px] font-mono leading-tight whitespace-pre">
                  {sampleResponseStandard}
                </pre>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-amber-700 font-bold block">■ 4.4 [케이스 B] 라이선스 기간 만료 및 유예 적용 (7일)</span>
                <pre className="bg-[#FFF8E1]/50 border border-[#FFE082] text-stone-700 p-2.5 rounded-lg text-[11px] font-mono leading-tight whitespace-pre">
                  {sampleResponseExpiredGrace}
                </pre>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-rose-700 font-bold block">■ 4.5 [케이스 C] 라이선스 가동 정지/비인가</span>
                <pre className="bg-[#FFEBEE]/50 border border-[#FFCDD2] text-stone-700 p-2.5 rounded-lg text-[11px] font-mono leading-tight whitespace-pre">
                  {sampleResponseSuspended}
                </pre>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-stone-600 font-bold block">■ 4.6 [케이스 D] 회원 심사 통과 대기 (인증 대기)</span>
                <pre className="bg-[#F5F5F5] border border-[#E0E0E0] text-stone-700 p-2.5 rounded-lg text-[11px] font-mono leading-tight whitespace-pre">
                  {sampleResponsePending}
                </pre>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-rose-700 font-bold block">■ 4.7 [케이스 E] API 마스터 인증 키 불일치 (INVALID_KEY)</span>
                <pre className="bg-[#FFEBEE]/50 border border-[#FFCDD2] text-stone-700 p-2.5 rounded-lg text-[11px] font-mono leading-tight whitespace-pre">
                  {sampleResponseInvalidKey}
                </pre>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-xl space-y-3">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block">5. Java 연동 클래스 예시 (Client Code Snippet)</span>
              <div className="relative">
                <pre className="bg-stone-900 text-stone-300 p-3 rounded-xl text-[10.5px] font-mono overflow-auto max-h-56 select-all whitespace-pre leading-normal tab-size-4">
                  {javaCodeSnippet}
                </pre>
                <button 
                  type="button"
                  onClick={() => copyToClipboard(javaCodeSnippet, 'java-modal')}
                  className="absolute top-2 right-2 bg-stone-800 hover:bg-stone-750 text-stone-300 p-1 px-2.5 rounded border border-stone-700 text-xs active:scale-95 transition-all cursor-pointer font-sans"
                >
                  {copiedText === 'java-modal' ? '✓ 전체 코드 복사됨' : 'Java 코드 복사'}
                </button>
              </div>
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
