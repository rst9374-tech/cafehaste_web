import React from 'react';

export const MembershipCompMyPosts: React.FC = () => {
  const myPosts = [
    { id: 1, title: '김포운양점 원격 노즐 세척 매뉴얼 피드백', category: '건의사항', date: '2026-07-10', status: '답변완료' },
    { id: 2, title: '토스 키오스크 신규 이미지 업데이트 요청의 건', category: '시스템문의', date: '2026-07-08', status: '답변완료' },
    { id: 3, title: '상생협약 월정액 멤버십 영수증 세부내역 발급 요청', category: '결제문의', date: '2026-07-05', status: '처리완료' }
  ];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <span className="dashboard-card-subtitle">MY POSTS & INQUIRIES</span>
          <h3 className="dashboard-card-title">내가 쓴 게시글</h3>
        </div>
      </div>
      
      <p className="dashboard-desc mb-4">
        헬프데스크에 접수한 건의사항 및 점주 커뮤니티에 작성한 게시글 내역입니다.
      </p>

      <div className="overflow-x-auto border border-stone-800 rounded-xl bg-stone-955/20">
        <table className="dashboard-table w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-800 bg-stone-900/40 text-stone-400">
              <th className="w-24">구분</th>
              <th>제목</th>
              <th className="w-28">등록일자</th>
              <th className="w-24 text-right">상태</th>
            </tr>
          </thead>
          <tbody>
            {myPosts.map((post) => (
              <tr key={post.id} className="border-b border-stone-800/80 hover:bg-stone-900/20 transition-all">
                <td className="text-stone-400">{post.category}</td>
                <td className="hover:text-[#C5A059] transition-all cursor-pointer">{post.title}</td>
                <td className="text-stone-500 font-mono">{post.date}</td>
                <td className="text-right">
                  <span className="px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 rounded-md dashboard-badge-text">
                    {post.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
