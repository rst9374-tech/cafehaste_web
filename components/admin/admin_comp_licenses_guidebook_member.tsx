import React from 'react';
import { X, BookOpen, UserCheck, FileText, Key, Shield } from 'lucide-react';

interface MemberGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberGuideModal: React.FC<MemberGuideModalProps> = ({ isOpen, onClose }) => {
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
            <BookOpen size={22} className="text-[#C5A059]" />
            <span>가입자 상태별 업무 처리 가이드북 (v1.2.0)</span>
          </h3>

          <div className="space-y-4 text-base text-stone-650 leading-relaxed font-light font-sans">
            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <UserCheck size={13} className="text-[#C5A059]" />
                <span>1. 신규 가입자 초기 상태 및 분류 (Category Triage)</span>
              </span>
              <p className="text-stone-750 font-bold mb-2">
                홈페이지 Membership 탭에 신규 가입 신청 및 문의가 들어오면 전산망에 기본 등록됩니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                <div className="bg-white p-2.5 border border-purple-150 rounded-lg">
                  <span className="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-700 font-bold border border-purple-200 rounded text-xs mb-1">창업문의</span>
                  <p className="text-stone-600 leading-normal text-sm">
                    • <strong>최우선 유선 해피콜 대상</strong><br/>
                    • \'문의내용\'을 유심히 분석하여 창업 상호, 예상 지역, 예산 범위를 우선 인지한 뒤 24시간 이내에 점주 점포 안내 상담 전화를 수행합니다.
                  </p>
                </div>
                <div className="bg-white p-2.5 border border-amber-105 rounded-lg">
                  <span className="inline-block px-1.5 py-0.5 bg-amber-50 text-[#C5A059] font-bold border border-[#C5A059]/30 rounded text-xs mb-1">멤버십 가입신청</span>
                  <p className="text-stone-600 leading-normal text-sm">
                    • <strong>멤버십 정식 멤버 신청 대상</strong><br/>
                    • 점포 사업자 정보의 실존 여부 확인 및 본점 상호명, 점주 전화 연락망 정보 검수의 1차 대기 프로세스를 진행합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <FileText size={13} className="text-[#C5A059]" />
                <span>2. 필수 정보 및 증빙 서류 검수 가이드 (Document Audit)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                데이터의 신뢰성 확보 및 허위 신청 방지를 위해 실명 및 제출 증빙 서류를 교차 검증해야 합니다.
              </p>
              <ul className="list-disc pl-4 text-sm space-y-1.5 text-stone-600">
                <li>
                  <strong className="text-rose-700 font-bold">사업자등록번호 검증</strong>: 번호가 <code className="bg-white px-1.5 py-0.5 rounded text-rose-600 font-bold">없음</code>, <code className="bg-white px-1.5 py-0.5 rounded text-rose-600 font-bold">기재 안 됨</code>인 회원 또는 가짜 식별 번호로 기재된 경우 승인이 즉각 <strong className="text-rose-700 font-bold">보류/거절</strong> 처리됩니다.
                </li>
                <li>
                  <strong className="text-stone-850 font-bold">사업자등록증 [확인] 검수</strong>: 등록증 열을 통해 점주 실명과 사업자등록증 상의 실질 대표자명이 완전히 정확하게 부합하는지 교차 인증처리를 진행하십시오.
                </li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Key size={13} className="text-[#C5A059]" />
                <span>3. 라이선스 마이그레이션 및 발급 조건 (License Copy)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                승인 처리가 완료되면 데이터 유실을 막고 신속하게 매장 연동을 수행하기 위해 라이선스를 이전 발행합니다.
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                • <strong>라이선스이동 버튼 클릭</strong>: 회원 정보의 교차가 정상적으로 검증되면 우측 끝 조작 열의 <code className="bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded border border-sky-100 text-[11px]">라이선스이동</code> 단추를 눌러 라이선스 관리 대장으로 레코드를 즉시 이전 완료합니다.<br/>
                • <strong>연동됨 자동 적용</strong>: 라이선스 대장으로 정식 이전된 회원은 자동으로 회원 목록 우측 버튼이 <code className="bg-stone-100 text-stone-400 font-bold px-1.5 py-0.5 rounded text-xs border border-stone-200">✔️ 연동됨</code> 태그 상태로 변화하며, 마이그레이션이 정상 종결되었음을 헤이스트 시스템이 스마트하게 보여줍니다.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl text-left space-y-2">
              <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Shield size={13} className="text-[#C5A059]" />
                <span>4. 이중 라이선스 정합성 및 자동 삭제보호 (🔒 System Lock)</span>
              </span>
              <p className="text-stone-750 font-bold mb-1">
                실제 운용 중인 시스템 자산을 대외적 위험 또는 오작동으로부터 보호하기 위한 헤이스트 원격 자동 장치입니다.
              </p>
              <p className="text-sm text-stone-600 leading-relaxed text-left">
                👉 <strong className="text-amber-600 font-bold">인증자 삭제보호 잠금 (🔒 자물쇠)</strong>: 라이선스 발급이 끝나 매장과 웹서버 간 실제 데이터 패킷 연동이 살아 움직이는 회원은 회원 리트리브에서 임의로 삭제할 수 없도록 <code className="bg-amber-50 text-amber-700 border border-amber-100 font-mono font-bold text-xs px-1 py-0.5 rounded">🔒</code> 잠금 상태로 자동 변형 보호가 실행됩니다.<br/>
                <span className="text-stone-400 block mt-1.5">• ※ 삭제 조치가 부득이 필요할 경우, 우측 라이선스 대장에서 먼저 해당 라이선스 정보 혹은 매장 코드를 발급 취소/영구 일시정지 처리한 후 순차적으로 회원 목록에서 완전히 삭제해주셔야 안전합니다.</span>
              </p>
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
