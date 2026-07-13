import React from 'react';
import { X, MessageSquare, UserCheck, Calendar, Filter, Sparkles, AlertCircle, Image, RefreshCw } from 'lucide-react';
import pkg from '../../package.json';

interface TipsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsGuideModal: React.FC<TipsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white border border-stone-200 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-6 max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-[#FAF9F6] border-b border-stone-150 py-4.5 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-stone-900">
            <MessageSquare className="text-[#C5A059]" size={22} />
            <h3 className="font-bold text-base tracking-tight">카톡글 꿀팁 자동화 가이드북 (v2.4.0)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-750 transition-all rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs md:text-sm text-stone-650 max-h-[600px]">
          
          <div className="text-center pb-2 border-b border-stone-100">
            <span className="text-xs font-mono font-bold text-[#C5A059] tracking-[0.3em] uppercase block mb-1">
              KAKAOTALK TIPS AUTOMATION & MAPPING (v{pkg.version})
            </span>
            <h4 className="text-stone-900 font-bold text-lg">카톡글 꿀팁 자동화 및 회원·게시글 매핑 가이드</h4>
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">
              카카오톡 소통방 대화 덤프를 분석하여 가상 카톡 회원 매핑, 게시글 단일 주제 통합 가공, 그리고 DB 및 로컬 백업에 안전하게 주입하는 지침서입니다.
            </p>
          </div>

          <div className="flex flex-col gap-6 font-sans text-stone-700">
            
            {/* 1. Member Mapping */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <UserCheck size={14} className="text-[#C5A059]" /> 1. 가상 카톡 회원 매핑 및 작성자 지정 규약
              </h5>
              <div className="text-stone-550 mb-3 text-xs leading-relaxed space-y-2">
                <p>
                  카톡 대화 덤프 내에서 문제를 해결하거나 유익한 팁을 제시한 점주를 판별하여 글의 <strong>최종 작성자(글쓴이)</strong>로 지정합니다.
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1.5">
                  <li><strong>가상 회원 대역 지정</strong>: 카톡 제보 점주들은 일반 회원과 혼선이 생기지 않도록 <strong>90000대 ID 대역</strong>을 부여합니다. (예: `김포구래럭스나인점` 90342, `김포운양역점` 90343)</li>
                  <li><strong>점주 성함 표준화</strong>: 제보 점주들의 성함은 친근함과 통일성을 주기 위해 일관되게 <strong>`베테랑 점주`</strong>로 지정하여 등록합니다.</li>
                  <li><strong>회원 정보 보존</strong>: 신규 가상 점주는 `local_kakao_members.json` 및 `web_kakao_members` DB 테이블에 사전 등록하여, 글 작성 시 회원 참조 무결성(`member_id`)을 보존합니다.</li>
                </ul>
              </div>
            </div>

            {/* 2. Consolidation */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <Filter size={14} className="text-[#C5A059]" /> 2. 단일 주제 통합(Consolidation) 및 가공 원칙
              </h5>
              <div className="text-stone-550 mb-3 text-xs leading-relaxed space-y-2">
                <p>
                  카톡 대화방 특성상 실시간으로 파편화된 정보를 사용자가 직관적으로 습득할 수 있도록 하나의 고도화된 정보 게시글로 재구성합니다.
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1.5">
                  <li><strong>유사 주제 통합</strong>: 비슷한 성격의 해결책(예: 그라인더 락 분해 건들, 디저트 사입 팁들)은 여러 개의 게시글로 쪼개지 않고 <strong>하나의 완성형 게시글</strong>로 병합합니다.</li>
                  <li><strong>문답 관계 본문 기록</strong>: 본문 중간에 질문자와 답변자(해결 지점)의 기여도를 명확히 표현하기 위해 다음과 같이 문답 정보를 삽입합니다.
                    <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg font-mono text-[11px] mt-1 text-stone-600 leading-normal">
                      [1. 원두 상태에 따른 분쇄도 및 추출량 조정]<br/>
                      (질문 지점: 군포금정점 / 조치 해결 지점: 김포구래럭스나인점)<br/>
                      - 갓 볶은 원두...
                    </div>
                  </li>
                  <li><strong>소제목 대괄호 스타일</strong>: 프론트엔드 뷰어가 자동으로 소제목을 굵은 글씨로 변환할 수 있게 단락 제목은 반드시 <strong>`[소제목 내용]`</strong> 형식으로 작성합니다.</li>
                </ul>
              </div>
            </div>

            {/* 3. CreatedAt Mapping */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#C5A059]" /> 3. 등록 시점(created_at) 타임스탬프 매핑
              </h5>
              <p className="text-stone-550 mb-2 text-xs leading-relaxed">
                임의의 현재 시각 대신, <strong>카카오톡 본문 대화 속에서 실제 질문과 해결책이 논의된 타임스탬프</strong>를 정교하게 파싱하여 게시글의 `created_at`으로 등록합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`// 카톡 덤프 본문 날짜 추출 및 매핑 예시
"created_at": "2026-05-06T11:34:00.000Z" // 2026년 5월 6일 오전 11:34 대화 기준`}
              </div>
            </div>

            {/* 4. Prohibited Words */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-rose-500" /> 4. 금지어 보안 필터링 및 대체 규약 (Strict Prohibited Words)
              </h5>
              <p className="text-stone-550 mb-3 text-xs leading-relaxed">
                대화 내용을 홈페이지 게시글로 정제할 때, 헤이스트 공식 브랜드 지침에 따라 가맹본부 직원 지칭 및 과장적 표현을 방지하도록 아래 대체 단어로 필터링을 강제 적용합니다.
              </p>
              <div className="overflow-hidden border border-stone-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-[11px] md:text-xs">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-stone-200 text-stone-950 font-bold">
                      <th className="p-2.5">검출된 금지어</th>
                      <th className="p-2.5">대체 반영 단어</th>
                      <th className="p-2.5">변환 사유</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 text-stone-600">
                    <tr>
                      <td className="p-2.5 font-bold text-rose-600">본사</td>
                      <td className="p-2.5 font-bold text-emerald-600">가맹지원팀 / 플랫폼 운영팀</td>
                      <td className="p-2.5">가맹점주 주도형 플랫폼 지향성 사수</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-rose-600">기사 / 엔지니어 / 임원</td>
                      <td className="p-2.5 font-bold text-emerald-600">기기 제조사 서비스 / 디지털 매뉴얼</td>
                      <td className="p-2.5">본사 소속 직원 지칭을 배제하여 운영 책임 명확화</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-rose-600">WMF</td>
                      <td className="p-2.5 font-bold text-emerald-600">커피머신</td>
                      <td className="p-2.5">특정 제조사 브랜드 키워드 외부 노출 제한 (보안 규정)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-rose-600">무상 / 무료 (확약형)</td>
                      <td className="p-2.5 font-bold text-emerald-600">기본 지원 / 제공</td>
                      <td className="p-2.5">점주 오인에 따른 분쟁 소지 예방을 위한 단어 완화</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-rose-600">100% / 완벽</td>
                      <td className="p-2.5 font-bold text-emerald-600">기본 / 상당수 / 효과적</td>
                      <td className="p-2.5">절대적 수치 과장에 의한 브랜드 품격 저해 예방</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Similar Links */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#C5A059]" /> 5. 유사 게시글 링크(Similar Links) 자동 연동
              </h5>
              <p className="text-stone-550 mb-2 text-xs leading-relaxed">
                점주들이 관련 노하우를 쉽게 유기적으로 교차 탐색할 수 있도록, 새로 등록되는 글의 내용과 유사한 성격의 기존 게시글을 탐색하여 링크로 자동 연동합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`// 게시판 본문(Content) 최하단에 결합되는 마크다운 링크 스펙
---
[비슷한 글: [커피머신] 48시간 우유 강제 세척 락 에러 해결을 위한 완전 재부팅 조치법](/board/167)`}
              </div>
            </div>

            {/* 6. KakaoTalk Manual Tips Injection */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-[#C5A059]" /> 6. 카톡 수동 주입 (KakaoTalk Manual Injection) 사용 방법
              </h5>
              <p className="text-stone-550 mb-2 text-xs leading-relaxed">
                원본 대화록 텍스트(`.txt`) 파일과 캡처한 이미지 파일들을 지정된 작업 폴더에 넣고, 시작 날짜 조건에 따른 AI 요약 및 데이터 주입 CLI를 실행합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`# 작업 디렉토리: C:\\Users\\김성규\\Desktop\\HASTE-Company\\cafehaste-etc\\kakao

# [로컬 실행 명령어] package.json 스크립트 실행 (cafehaste-web 디렉토리에서 구동)
$ npm run tips:cli [주입할_JSON_파일_경로]

# (예시 1) 실제 데이터베이스와 로컬 시뮬레이터에 동시에 주입
$ npm run tips:cli scratch/payload.json

# (예시 2) 실서버 DB는 제외하고 로컬 개발 서버(localhost:3000)에만 반영
$ npm run tips:cli scratch/payload.json --local-only`}
              </div>
            </div>

            {/* 7. KakaoTalk Image Classification & Synchronization */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <Image size={14} className="text-[#C5A059]" /> 7. 카톡 이미지 관리 및 스마트 매칭 자동화
              </h5>
              <p className="text-stone-550 mb-2 text-xs leading-relaxed">
                다운로드한 이미지 파일들을 점주 지점명 및 전송일자 기준 표준 파일명으로 리네임하고, 자동으로 DB 메뉴 아이템과 맵핑하여 Supabase Storage에 동기화합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`# [로컬 실행 명령어] 메뉴 이미지 스마트 매칭 및 업로드
$ npx tsx ../cafehaste-etc/kakao/scripts/upload_and_map.ts`}
              </div>
            </div>

            {/* 8. KakaoTalk Image Re-synchronization */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <RefreshCw size={14} className="text-[#C5A059]" /> 8. 카톡이미지 재동기화 (Image Re-synchronization) 자동화
              </h5>
              <p className="text-stone-550 mb-2 text-xs leading-relaxed">
                DB에 주입된 카톡 노하우 글들의 이미지가 맞지 않는 경우, 대화 시점 기준의 진짜 이미지를 역추적·압축하여 Supabase Storage에 재등록하고 DB 본문을 자동 일괄 갱신합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`# [로컬 실행 명령어] package.json 스크립트 실행
$ npm run kakao-img-sync`}
              </div>
            </div>

            {/* 9. Version Auto-Update */}
            <div>
              <h5 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <RefreshCw size={14} className="text-[#C5A059]" /> 9. 버전 통합 동기화 및 자동 업데이트 (Version Auto-Update)
              </h5>
              <p className="text-stone-550 mb-2 text-xs leading-relaxed">
                각 카테고리별(license, kiosk, recipe) 버전 업데이트 명령어를 사용하여 <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[11px]">version.json</code>을 갱신하고, 관련된 모든 가이드 문서 및 코드 내 버전 표시를 자동으로 동기화합니다.
              </p>
              <div className="bg-stone-950 text-stone-300 p-4 rounded-2xl border border-stone-850 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`# [로컬 실행 명령어] npm 스크립트를 통한 카테고리 버전 업데이트
$ npm run version:update <category> <version>

# (예시 1) 라이선스/로컬 API 버전을 v1.2.0으로 갱신
$ npm run version:update license 1.2.0

# (예시 2) 키오스크 연동 규격 버전을 v2.3.0으로 갱신
$ npm run version:update kiosk 2.3.0

# (예시 3) 레시피 표준 코드 규격 버전을 v4.1.0으로 갱신
$ npm run version:update recipe 4.1.0`}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
