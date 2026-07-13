export const boardApiClient = {
  fetchPosts: async (page: number, keyword: string, category: string, memberId: any, isAdmin: boolean, searchType: string = 'all') => {
    const catParam = category === '전체' ? '' : category;
    const res = await fetch(`/api/posts?page=${page}&limit=100&keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(catParam)}&memberId=${memberId}&isAdmin=${isAdmin}&searchType=${searchType}`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  fetchPostDetail: async (postId: number, memberId: any, isAdmin: boolean) => {
    const res = await fetch(`/api/posts/${postId}?memberId=${memberId}&isAdmin=${isAdmin}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch post detail');
    }
    return res.json();
  },

  fetchPostComments: async (postId: number) => {
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  deletePost: async (postId: number) => {
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
  },

  deletePostsBulk: async (postIds: number[]) => {
    const res = await fetch('/api/posts/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postIds })
    });
    if (!res.ok) throw new Error('Failed bulk delete');
    return res.json();
  },

  setNoticePostsBulk: async (postIds: number[], isNotice: boolean) => {
    const res = await fetch('/api/posts/bulk-notice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postIds, isNotice })
    });
    if (!res.ok) throw new Error('Failed bulk notice setting');
    return res.json();
  },

  movePostsCategoryBulk: async (postIds: number[], category: string) => {
    const res = await fetch('/api/posts/bulk-category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postIds, category })
    });
    if (!res.ok) throw new Error('Failed bulk category move');
    return res.json();
  },

  addComment: async (postId: number, memberId: any, content: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, content })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  deleteComment: async (commentId: number) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete comment');
    return res.json();
  },

  toggleLike: async (postId: number, memberId: any) => {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId })
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },

  deleteAttachment: async (attachmentId: number) => {
    const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete attachment');
    return res.json();
  }
};
