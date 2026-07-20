import React, { useState, useEffect } from 'react';

interface LillyDashboardMyPostsProps {
  user: any;
}

export const LillyDashboardMyPosts: React.FC<LillyDashboardMyPostsProps> = ({ user }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/posts?memberId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.posts)) {
          // 로그인한 점주가 작성한 게시글만 필터링 (member_id가 일치하는 레코드)
          const filtered = data.posts.filter(
            (p: any) => p.member_id === user.id || String(p.member_id) === String(user.id)
          );
          setPosts(filtered);
        }
      })
      .catch((err) => {
        console.error('내가 쓴 게시글 로드 실패:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  return (
    <div className="flex flex-col gap-0 min-h-0 w-full text-left">
      {/* ─── 헤더 (릴리 Header 100% 동일) ─── */}
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="flex min-h-10 flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#FAFAFA] font-sans">내가 쓴 게시글</h1>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-[#A1A1AA] font-sans font-light">
              점주 커뮤니티 및 1:1 인테리어 게시판에 등록한 마스터의 작성 이력을 확인합니다.
            </p>
          </div>
        </div>
        <div className="h-px bg-[#27272A]/50 w-full" />
      </div>

      <div className="flex w-full flex-col gap-4 px-6 pb-6">
        <div className="dashboard-card p-5">

      <div className="overflow-x-auto border border-stone-800 rounded-xl bg-stone-955/20">
        <table className="dashboard-table w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-800 bg-stone-900/40 text-stone-400 text-xs">
              <th className="w-24">구분</th>
              <th>제목</th>
              <th className="w-36">등록일자</th>
              <th className="w-24 text-right">상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-stone-500 text-xs">
                   게시글을 로드하는 중입니다...
                </td>
              </tr>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-stone-800/80 hover:bg-stone-900/20 transition-all text-[12.5px]">
                  <td className="text-stone-400 py-3">{post.category}</td>
                  <td className="hover:text-[#C5A059] transition-all cursor-pointer py-3">{post.title}</td>
                  <td className="text-stone-500 font-mono text-[11.5px] py-3">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="text-right py-3">
                    <span className="px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 rounded-md text-[10px] font-bold">
                      {post.comment_count > 0 ? '답변완료' : '답변대기'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-stone-500 text-xs">
                  작성하신 게시글 내역이 존재하지 않습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
    </div>
  );
};
