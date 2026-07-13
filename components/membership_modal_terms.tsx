import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ShieldAlert, AlertCircle } from 'lucide-react';

interface HasteTermsModalProps {
  isOpen: boolean;
  docType: 'TERMS' | 'PRIVACY' | 'EMAIL' | null;
  onClose: () => void;
}

export const HasteTermsModal: React.FC<HasteTermsModalProps> = ({ isOpen, docType, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !docType) return null;

  let title = '';
  let engSub = '';
  let icon = <FileText size={14} />;

  if (docType === 'TERMS') {
    title = '서비스 이용약관';
    engSub = 'TERMS OF SERVICE';
    icon = <FileText size={14} className="text-[#C5A059]" />;
  } else if (docType === 'PRIVACY') {
    title = '개인정보처리방침';
    engSub = 'PRIVACY POLICY';
    icon = <ShieldAlert size={14} className="text-[#C5A059]" />;
  } else if (docType === 'EMAIL') {
    title = '이메일 무단수집거부';
    engSub = 'EMAIL REFUSAL POLICY';
    icon = <AlertCircle size={14} className="text-[#C5A059]" />;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* elegant backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative bg-[#F4EADB] rounded-[28px] shadow-2xl max-w-2xl w-full overflow-hidden font-sans z-50 flex flex-col justify-between max-h-[85vh]"
        >
          {/* Top Brand Header */}
          <div className="bg-[#15141D] border-b border-stone-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                {icon}
              </div>
              <div>
                <span className="haste-category-label-en mb-0.5">
                  {engSub}
                </span>
                <span className="haste-section-title-3 !text-white leading-tight pr-4 block">
                  {title}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 px-2.5 rounded-lg border border-stone-800/80 hover:border-stone-700 hover:text-[#C5A059] bg-stone-900 text-stone-400 text-xs tracking-tight transition-colors cursor-pointer flex items-center gap-1"
            >
              <X size={13} />
              <span>닫기</span>
            </button>
          </div>

          {/* Body content based on docType */}
          <div className="overflow-y-auto p-6 md:p-8 flex-grow custom-scrollbar bg-amber-50/20 text-stone-800">
            {docType === 'TERMS' && (
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-stone-750 font-sans">
                <p className="text-stone-500 font-semibold mb-4 bg-stone-200/50 p-3 rounded-lg border border-stone-300 font-mono">
                  공고일자: 2026년 5월 28일<br />
                  시행일자: 2026년 5월 28일
                </p>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    제 1 조 (목적)
                  </h4>
                  <p>
                    본 약관은 주식회사 헤이스트 에이아이(이하 "회사"라 함)가 기획 및 공급하고, 당사 웹 플랫폼(이하 "서비스")을 통해 제공하는 점포 연동 솔루션 제공 웹 서비스와 관련된 전반적인 서비스 이용 조건 및 절차를 정하는 것을 목적으로 합니다.
                  </p>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    제 2 조 (용어의 정의)
                  </h4>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>"서비스"라 함은 이용자가 PC, 모바일 기기를 통해 접속하여 카페 브랜드 아이덴티티, 도면, 미디어 자원, 실시간 제공 음료 목록 구성 정돈 등을 활용할 수 있는 웹 애플리케이션 전반을 의미합니다.</li>
                    <li>"매장주 회원(이하 회원)"이라 함은 서비스에 점포 데이터베이스 및 멤버십 연동 가상 코드를 입력하고 실시간 행렬을 공유하는 실사용 업주를 의미합니다.</li>
                    <li>"로컬 장부 시뮬레이터"라 함은 영속적 서버 인프라 보조를 보충하는 브라우저 가상 임시 저장소를 기반으로 하는 매장 대조 모의 시스템을 의미합니다.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    제 3 조 (약관의 명시와 개정)
                  </h4>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>회사는 본 약관의 내용을 이용자가 용이하게 알 수 있도록 플랫폼 하단 및 가입 과정에 게시합니다.</li>
                    <li>회사는 관련 법령을 위배하지 않는 범위 내에서 상생 및 플랫폼 발전 규격 보완을 위해 본 약관을 개정할 수 있으며 개정 사항은 공지사항 또는 전자공지 등을 통해 즉시 공포합니다.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    제 4 조 (가입의 승인과 계약 성립)
                  </h4>
                  <p>
                    이용자가 가입 양식상 필요한 모든 항목을 입증 및 서명 동의 후 매장 전산망 등록을 마치는 시점에 상호 간 클라우드 동기화 파트너 계약이 정식 승인되어 발송된 것으로 간주합니다. 허위 지표 입력 등은 통보 없이 무효화 처분될 수 있습니다.
                  </p>
                </div>

                <div className="bg-[#15141D]/5 p-4 rounded-xl border border-stone-300">
                  <p className="text-[11px] text-stone-605">
                    * 귀하는 본 이용약관에 동의하지 않을 권리가 있으며, 거부할 시 헤이스트 월 가입 시스템에 무단 가입 신청 데이터를 기재하는 등의 서비스 이용에 일부 제약이 따를 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {docType === 'PRIVACY' && (
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-stone-750 font-sans">
                <p className="text-stone-500 font-semibold mb-4 bg-stone-200/50 p-3 rounded-lg border border-stone-300 font-mono">
                  최종 갱신일자: 2026년 5월 28일
                </p>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    1. 개인정보의 수집 및 이용 목적
                  </h4>
                  <p>
                    회사는 수집한 개인정보를 다음의 목적 이외의 용도로는 사용하지 않으며, 이용 목적이 변경될 시에는 사전 동의를 충실히 구할 예정입니다.
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>매장 신청 상담 내역 유지 및 실시간 가입 심사 대조</li>
                    <li>가상 전산 환경 하의 모의 멤버십 연동 승인 프로세스 운영 및 고충 처리</li>
                    <li>실시간 점포 위치 데이터 및 완공 조감도 게시 대장 등록 대조</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    2. 수집하는 개인정보 항목
                  </h4>
                  <p>
                    회사는 서비스 신청 접수를 처리하기 위해 최소한의 식별 필수 필드를 보관합니다:
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li><b>필수항목:</b> 점주 성함, 점포명(상호), 연락처, 점포희망지역 또는 주소, 상담 희망내용</li>
                    <li><b>선택항목:</b> 점포 이메일 주소, 초기 창업 가용 자금 규모, 기존 소유 매장 유무</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    3. 개인정보의 보유 및 이용기간
                  </h4>
                  <p>
                    원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 법령에서 정한 일정 기간 동안 개인정보를 보관합니다.
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li><b>계약 또는 청약철회 등에 관한 기록:</b> 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                    <li><b>소비자의 불만 또는 분쟁처리에 관한 기록:</b> 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                    <li><b>웹사이트 방문에 관한 인가 기록:</b> 3개월 (통신비밀보호법)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    4. 개인정보의 안전성 확보 조치
                  </h4>
                  <p>
                    수집된 데이터베이스 내 매장 정보는 업계 표준 암호화 및 TLS 통신 기법이 적용된 서버와 프라이빗 로컬 스토리지를 통해 이중 격리 보관되며, 관계자 외의 접근을 전면 원천 차단하고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {docType === 'EMAIL' && (
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-stone-750 font-sans">
                <div className="bg-red-50 p-4 border border-red-250 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-red-950 text-xs sm:text-sm">
                      이메일 무단 수집 및 스팸 전송 금지 고지
                    </h5>
                    <p className="text-[11px] sm:text-xs text-red-800 mt-1">
                      본 플랫폼을 지탱하는 모든 전자우편 주소를 무단 추출하거나 로봇 프로그램을 동원하여 광고성 정보를 전송하는 일체의 행위를 강력히 반대합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    추출 금지 원칙
                  </h4>
                  <p>
                    본 웹사이트에 게재되어 있는 대표 이메일 주소(<span className="font-bold underline text-[#C5A059]">cafehaste@gmail.com</span> 등) 및 매장 신청 기록망은 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집될 수 없음을 선고합니다.
                  </p>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-950 text-sm sm:text-base border-b border-[#C5A059]/30 pb-1.5 mb-2.5">
                    법적 근거 및 처벌의 경고
                  </h4>
                  <p>
                    이메일을 전산 장비로 무단 수집하여 광고 배포에 사용하거나 타사에 불법 권리 양도하는 자는 [정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의 2항]에 근거하여 강력한 민형사상의 책임 추궁 및 벌금형 처벌을 받게 됨을 고지합니다.
                  </p>
                </div>

                <div className="bg-[#15141D] text-[#C5A059] p-4 rounded-xl text-[11px] space-y-1 font-mono tracking-tight text-center">
                  <p>◆ 정보통신망법 제50조의2 (전자우편주소의 무단 수집행위 등 금지) ◆</p>
                  <p className="text-stone-300 font-sans text-[10px] mt-1 text-left">
                    누구든지 인터넷 홈페이지 운영자 또는 관리자의 명시적인 동의 없이 인터넷 홈페이지에서 자동 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여선 아니 된다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="bg-stone-150 border-t border-stone-300 px-6 py-4 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="py-2.5 px-6 bg-[#15141D] hover:bg-stone-850 active:scale-95 text-white text-xs font-bold rounded-full shadow-md transition-all cursor-pointer"
            >
              확인하였습니다
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
