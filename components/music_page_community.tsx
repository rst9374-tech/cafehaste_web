import React, { useState, useEffect } from 'react';
import { MessageSquare, Share2, Plus, Sparkles, Send, Heart, User } from 'lucide-react';

interface CommunityPost {
  id: number;
  category: 'LOUNGE' | 'SHARE';
  title: string;
  content: string;
  storeName: string;
  ownerName: string;
  likesCount: number;
  createdAt: string;
}

export const MusicCommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'LOUNGE' | 'SHARE'>('ALL');
  const [showWriteForm, setShowWriteForm] = useState(false);
  
  // Write form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState<'LOUNGE' | 'SHARE'>('LOUNGE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<number, number>>({});
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());

  // Fetch community posts
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/music/posts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      }
    } catch (err) {
      console.warn('Failed to load community posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !storeName.trim() || !ownerName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/music/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title.trim(),
          content: content.trim(),
          storeName: storeName.trim(),
          ownerName: ownerName.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTitle('');
          setContent('');
          setShowWriteForm(false);
          await fetchPosts();
        }
      }
    } catch (err) {
      console.warn('Failed to publish community post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    if (likedPostIds.has(postId)) return;

    try {
      const res = await fetch('/api/music/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLikedPostIds(prev => {
            const next = new Set(prev);
            next.add(postId);
            return next;
          });
          setPostLikes(prev => ({
            ...prev,
            [postId]: (prev[postId] || 0) + 1
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to like post:', err);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeSubTab === 'ALL') return true;
    return post.category === activeSubTab;
  });

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Tab Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C5A059]/15 pb-4">
        <div className="flex flex-wrap bg-stone-950/80 border border-[#C5A059]/10 p-1 rounded-xl gap-1 select-none">
          {[
            { id: 'ALL', label: '전체 피드' },
            { id: 'LOUNGE', label: '사장님 라운지' },
            { id: 'SHARE', label: '플레이리스트 공유' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-1.5 text-xs rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#C5A059] text-stone-950 shadow-sm'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowWriteForm(!showWriteForm)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B8964C] text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_15px_rgba(197,160,89,0.15)] cursor-pointer active:scale-95 transition-all"
        >
          <Plus size={14} />
          피드 작성하기
        </button>
      </div>

      {/* Inline Write Form */}
      {showWriteForm && (
        <form onSubmit={handleCreatePost} className="bg-stone-950/90 border border-[#C5A059]/20 p-5 md:p-6 rounded-3xl space-y-4 shadow-2xl relative">
          <div className="flex justify-between items-center pb-2 border-b border-[#C5A059]/10">
            <span className="text-[10px] font-mono font-bold text-[#C5A059] flex items-center gap-1.5 uppercase">
              <Sparkles size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
              PUBLISH FEED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-stone-500">피드 카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-stone-900 border border-[#C5A059]/10 rounded-xl py-2 px-3 text-xs text-stone-200 focus:outline-none focus:border-[#C5A059]/40"
              >
                <option value="LOUNGE">사장님 라운지 (곡 추천 및 분위기 피드백)</option>
                <option value="SHARE">플레이리스트 공유 (매장용 테마 믹스)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-stone-500">피드 제목</label>
              <input
                type="text"
                placeholder="제목을 적어주세요..."
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-900 border border-[#C5A059]/10 rounded-xl py-2 px-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-stone-500">매장명 (가맹지점)</label>
              <input
                type="text"
                placeholder="예: 헤이스트 강남서초점"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-stone-900 border border-[#C5A059]/10 rounded-xl py-2 px-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-stone-500">점주 성함</label>
              <input
                type="text"
                placeholder="대표자 실명"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-stone-900 border border-[#C5A059]/10 rounded-xl py-2 px-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-stone-500">본문 내용</label>
            <textarea
              placeholder="내용을 적어주세요..."
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-stone-900 border border-[#C5A059]/10 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#C5A059]/40 resize-none"
            />
          </div>

          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={() => setShowWriteForm(false)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-xs font-bold text-stone-400 rounded-xl border border-[#C5A059]/10 cursor-pointer active:scale-95 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#C5A059] hover:bg-[#B8964C] disabled:bg-stone-900 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_15px_rgba(197,160,89,0.15)] cursor-pointer active:scale-95 transition-all"
            >
              <Send size={12} />
              {isSubmitting ? '저장 중...' : '피드 등록'}
            </button>
          </div>
        </form>
      )}

      {/* Community Feed List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="w-full py-32 bg-stone-950/30 border border-[#C5A059]/10 rounded-3xl flex flex-col items-center justify-center gap-3.5 text-stone-500">
            <MessageSquare className="w-8 h-8 text-stone-700" />
            <span className="text-xs font-light">등록된 커뮤니티 피드가 존재하지 않습니다. 첫 소식을 전해보세요!</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const displayLikes = (postLikes[post.id] !== undefined)
                ? postLikes[post.id]
                : post.likesCount;

              return (
                <div
                  key={post.id}
                  className="bg-stone-950/60 border border-[#C5A059]/10 rounded-3xl p-5 md:p-6 space-y-4 hover:border-[#C5A059]/30 transition-all duration-300 shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[8.5px] font-bold rounded ${
                        post.category === 'LOUNGE'
                          ? 'bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059]'
                          : 'bg-stone-900 border border-stone-800 text-[#C5A059]'
                      }`}>
                        {post.category === 'LOUNGE' ? '라운지' : '믹스 공유'}
                      </span>
                      <h4 className="text-xs font-serif font-black text-stone-500">NO. {post.id}</h4>
                    </div>
                    
                    <span className="text-[9px] font-mono text-stone-500">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <h2 className="text-sm md:text-base font-bold text-white leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-xs text-stone-400 font-light leading-relaxed whitespace-pre-wrap pt-1.5">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-stone-900/60">
                    <div className="flex items-center gap-1.5 text-stone-500 font-sans text-[10px]">
                      <User size={12} className="text-[#C5A059]" />
                      <span className="text-stone-300 font-bold">{post.storeName}</span>
                      <span className="text-stone-600">|</span>
                      <span>점주: {post.ownerName}</span>
                    </div>

                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1 text-[10.5px] font-mono text-stone-500 hover:text-[#C5A059] transition-colors ${
                        likedPostIds.has(post.id) ? 'text-[#C5A059] font-bold' : ''
                      }`}
                    >
                      <Heart size={12} className={likedPostIds.has(post.id) ? 'fill-[#C5A059] text-[#C5A059] animate-ping-once' : ''} />
                      추천 {displayLikes}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
