import React from 'react';
import { X, Shield, BookOpen, UserCheck, Key, Clock } from 'lucide-react';

interface LicenseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseGuideModal: React.FC<LicenseGuideModalProps> = ({ isOpen, onClose }) => {
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
            <Shield size={22} className="text-[#C5A059]" />
            <span>라이선스 가이드북 및 처리 로직 (v1.2.0)</span>
          </h3>

          <div className="space-y-4 text-base text-stone-650 leading-relaxed font-light font-sans font-normal text-stone-650">
            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#C5A059]" />
                <span>1. 라이선스 게시판 구성 및 주요 항목</span>
              </span>
              <p className="text-stone-750 font-bold mb-2">
                등록된 모든 가맹점의 솔루션 라이선스 정보를 통합 관리하고 제어하는 화면입니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>매장 코드 (Store ID)</strong>: 매장 고유의 알파뉴메릭 식별 코드 (예: store123456)</li>
                <li><strong>점주 성함</strong>: 라이선스 계약 주체인 점주의 성명</li>
                <li><strong>라이선스 키 (License Key)</strong>: 매장 로컬 서버 프로그램 인증용 고유 난수 키</li>
                <li><strong>솔루션 등급</strong>: BASIC / PREMIUM 등 매장 규모별 약정 등급</li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <UserCheck size={13} className="text-[#C5A059]" />
                <span>2. 라이선스 상태별 작동 로직 (Status Flow)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                각 매장의 활성화 상태에 따라 클라이언트 로컬 서버 프로그램의 권한 제어가 이루어집니다.
              </p>
              <div className="space-y-2 text-sm text-stone-600">
                <div className="flex items-start gap-2">
                  <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-200/50 shrink-0">인증 대기</span>
                  <p className="leading-normal text-xs">회원가입 심사 중으로, 아직 정식 라이선스가 활성화되지 않았습니다. API 인증 및 데이터 송수신이 전면 제한됩니다.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded text-[11px] border border-green-200/50 shrink-0">인증 완료</span>
                  <p className="leading-normal text-xs">약정 체결 및 결제가 확인되어 연동 자격이 주어진 정상 가동 매장입니다. **커피머신 로컬서버 가동 시** 필요한 모든 스마트 연동 시스템 권한을 획득합니다.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px] border border-rose-200/50 shrink-0">가동 정지</span>
                  <p className="leading-normal text-xs">헤이스트의 영구 정지 처분 또는 오프라인 유예기간(7일)이 최종 경과하여 잠금 상태인 매장입니다. 로컬 프로그램 구동이 즉시 이모빌라이징(Lock) 처리됩니다.</p>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Key size={13} className="text-[#C5A059]" />
                <span>3. 라이선스 발급 및 유예제(Grace Period) 연동 로직</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                프로그램 비정상 가동으로 인한 점주 피해 방지를 위해 다음과 같이 자동화 유예 제어를 실행합니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>7일 오프라인 유예 적용</strong>: 라이선스 기간이 만료되더라도, 매장 인터넷 장애나 일시적 신용카드 한도 초과 상황을 감안하여 만료일 기준 최대 7일간 임시 오프라인 구동을 보장하는 <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[11px]">allowOfflineGrace: true</code> 파라미터가 반환됩니다.</li>
                <li><strong>소프트 패칭(Soft-patching) 우선 규칙</strong>: 헤이스트 백업 서버 복원 또는 동기화 시 기존 유효 운영 데이터를 덮어쓰거나 지우지 않고, 변경된 상태(Soft-state)만 감지하여 점진 업데이트합니다.</li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Clock size={13} className="text-[#C5A059]" />
                <span>4. 라이선스 만료 임박 및 만료 처리 프로세스 (Expiration Alert)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                약정 계약 종료 14일 전부터 점주 화면에 경고 알림이 표시되며, 만료 시 강제 제어가 실행됩니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li><strong>만료 14일 전 (종료 임박)</strong>: 점주 마이페이지 상단에 <code className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded text-xs border border-amber-200/50">만료 임박 (D-14)</code> 경고 씰이 활성화되며, 결제 갱신 유도 안내창이 자동으로 표시됩니다.</li>
                <li><strong>만료 당일 (만료 처리)</strong>: 즉시 상태가 <code className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded text-xs border border-amber-200/50">인증 대기</code> 또는 비활성 상태로 강제 전환을 개시하되, 위 3항의 7일 오프라인 유예(Grace Period) 카운트다운 타이머가 시작됩니다.</li>
                <li><strong>유예기간(7일) 경과 후 (가동 정지)</strong>: 7일간의 유예 타이머가 소진되는 즉시 원격 명령을 통해 매장의 상태가 <code className="bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded text-xs border border-rose-200/50">가동 정지</code> 상태로 영구 락(Lock) 다운됩니다.</li>
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
