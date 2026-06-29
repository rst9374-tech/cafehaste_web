import { useState, useEffect, useRef } from 'react';
import { boardApiClient } from './board_api_client';

interface UseBoardStateProps {
  loggedUser: any;
  setActivePlayFilm?: (film: any) => void;
}

export const useBoardState = ({ loggedUser, setActivePlayFilm }: UseBoardStateProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchKwd, setSearchKwd] = useState('');
  const [activeKwd, setActiveKwd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [writeCategory, setWriteCategory] = useState('Q&A');
  const [isInlineWriteOpen, setIsInlineWriteOpen] = useState(false);
  const [viewState, setViewState] = useState<'LIST' | 'WRITE' | 'DETAIL'>('LIST');

  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);
  const [gradePermissions, setGradePermissions] = useState<any[]>([]);

  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeIsSecret, setWriteIsSecret] = useState(false);
  const [writeIsNotice, setWriteIsNotice] = useState(false);
  const [writeSkinType, setWriteSkinType] = useState<number>(1);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; type: string; base64: string }>>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const isAdmin = localStorage.getItem('haste_admin_auth') === 'true' || loggedUser?.role === 'ADMIN' || loggedUser?.username === 'admin';
  const memberId = loggedUser?.id || (isAdmin ? 1 : '');

  useEffect(() => {
    fetch('/api/grade-permissions')
      .then(res => res.json())
      .then(data => { if (data.success) setGradePermissions(data.permissions || []); })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedPost === null) {
      setIsEditing(false);
      setEditingPostId(null);
    }
  }, [selectedPost]);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, activeKwd, selectedCategory]);

  useEffect(() => {
    const sharedPostId = sessionStorage.getItem('haste_shared_postId');
    if (sharedPostId) {
      sessionStorage.removeItem('haste_shared_postId');
      const postIdNum = parseInt(sharedPostId, 10);
      if (!isNaN(postIdNum)) loadSharedPostDetail(postIdNum);
    }
  }, []);

  const checkWritePermissionForCategory = (catName: string): boolean => {
    if (isAdmin) return true;
    if (!loggedUser) return false;
    const userGrade = loggedUser.store_type || loggedUser.storeType || '일반';
    const cat = catName === '전체' ? 'Q&A' : catName;
    const perm = gradePermissions.find((p: any) => p.gradeType === userGrade && p.categoryKey === cat);
    return perm ? perm.canWrite === 1 : true;
  };

  const showWriteButton = isAdmin || (loggedUser && checkWritePermissionForCategory(selectedCategory));

  const loadSharedPostDetail = async (postId: number) => {
    setIsDetailLoading(true);
    try {
      const data = await boardApiClient.fetchPostDetail(postId, memberId, isAdmin);
      if (data.success) {
        const post = data.post;
        if (post.is_secret === 1 || post.is_secret === true) {
          if (!loggedUser || (loggedUser.id !== post.member_id && !isAdmin)) {
            alert('본 질문글은 비밀글로 설정되어 있어 작성자 본인 및 헤이스트 마스터 관리자만 조회 가능합니다.');
            return;
          }
        }
        setSelectedPost(post);
        setAttachments(data.attachments || []);
        setViewState('LIST');
        fetchPostComments(postId);
      }
    } catch (e) {
      console.error('Error deep linking post:', e);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await boardApiClient.fetchPosts(currentPage, activeKwd, selectedCategory, memberId, isAdmin);
      if (data.success) {
        setPosts(data.posts || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalPosts(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed fetching posts:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSelectPost = async (post: any) => {
    setIsEditing(false);
    setEditingPostId(null);
    if (post.is_secret === 1 || post.is_secret === true) {
      if (!loggedUser || (loggedUser.id !== post.member_id && !isAdmin)) {
        alert('본 질문글은 비밀글로 설정되어 있어 작성자 본인 및 헤이스트 마스터 관리자만 조회 가능합니다.');
        return;
      }
    }
    setIsDetailLoading(true);
    try {
      const data = await boardApiClient.fetchPostDetail(post.id, memberId, isAdmin);
      if (data.success) {
        const fetchedPost = data.post;
        if (fetchedPost.is_secret === 1 || fetchedPost.is_secret === true) {
          if (!loggedUser || (loggedUser.id !== fetchedPost.member_id && !isAdmin)) {
            alert('본 질문글은 비밀글로 설정되어 있어 작성자 본인 및 헤이스트 마스터 관리자만 조회 가능합니다.');
            return;
          }
        }
        setSelectedPost(fetchedPost);
        setAttachments(data.attachments || []);
        fetchPostComments(post.id);
      }
    } catch (e) {
      console.error('Error fetching post detail:', e);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const fetchPostComments = async (postId: number) => {
    try {
      const data = await boardApiClient.fetchPostComments(postId);
      if (data.success) setComments(data.comments || []);
    } catch (e) {
      console.error('Failed fetching comments:', e);
    }
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFiles(prev => [...prev, { name: file.name, type: file.type, base64: reader.result as string }]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => processUploadedFile(file));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => processUploadedFile(file));
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetTitle = writeTitle.trim();
    const targetContent = writeContent.trim();
    
    if (!targetTitle && targetContent) {
      const lines = targetContent.split('\n');
      const firstLine = lines.find(line => line.trim().length > 0);
      if (firstLine) {
        targetTitle = firstLine.trim();
        setWriteTitle(targetTitle);
      }
    }

    if (!targetTitle || !targetContent) {
      alert('제목과 상세 문의 내용을 기재해 주셔야 합니다.');
      return;
    }
    setIsWriting(true);
    try {
      if (isEditing && editingPostId) {
        const res = await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: targetTitle,
            content: writeContent,
            isSecret: writeIsSecret,
            category: writeCategory,
            skinType: writeSkinType,
            files: attachedFiles,
            deletedFileIds: deletedFileIds,
            memberId,
            isAdmin,
            isNotice: writeIsNotice
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const finishedPostId = editingPostId;
          setWriteTitle('');
          setWriteContent('');
          setWriteIsSecret(false);
          setWriteIsNotice(false);
          setWriteSkinType(1);
          setAttachedFiles([]);
          setDeletedFileIds([]);
          setIsEditing(false);
          setEditingPostId(null);
          setIsInlineWriteOpen(false);
          
          const detailData = await boardApiClient.fetchPostDetail(finishedPostId, memberId, isAdmin);
          if (detailData.success) {
            setSelectedPost(detailData.post);
            setAttachments(detailData.attachments || []);
          }
          fetchPosts();
        } else {
          alert(data.message || '게시글 수정 중 오류가 발생했습니다.');
        }
      } else {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId,
            title: targetTitle,
            content: writeContent,
            isSecret: writeIsSecret,
            category: writeCategory,
            skinType: writeSkinType,
            files: attachedFiles,
            isAdmin,
            isNotice: writeIsNotice
          })
        });
        const writeData = await res.json();
        if (res.ok && writeData.success) {
          setWriteTitle('');
          setWriteContent('');
          setWriteIsSecret(false);
          setWriteIsNotice(false);
          setWriteSkinType(1);
          setAttachedFiles([]);
          setIsInlineWriteOpen(false);
          setViewState('LIST');
          setCurrentPage(1);
          fetchPosts();
        } else {
          alert(writeData.message || '게시글 저장 중 오류가 발생했습니다.');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('데이터베이스 게시 중 오류가 발생했습니다.');
    } finally {
      setIsWriting(false);
    }
  };

  const handleDeletePost = (postId: number) => {
    setConfirmModal({
      message: '작성하신 문의글을 정말 삭제처리 하시겠습니까? 복원할 수 없습니다.',
      onConfirm: async () => {
        try {
          const data = await boardApiClient.deletePost(postId);
          if (data.success) {
            setSelectedPost(null);
            setViewState('LIST');
            setCurrentPage(1);
            fetchPosts();
          } else {
            alert(data.message || '게시글 삭제 처리에 실패했습니다.');
          }
        } catch (e: any) {
          console.error(e);
          alert('게시글 삭제 중 네트워크 오류가 발생했습니다: ' + e.message);
        }
      }
    });
  };

  const handleDeletePosts = (postIds: number[]) => {
    setConfirmModal({
      message: `선택하신 ${postIds.length}개의 문의글을 정말 일괄 삭제하시겠습니까? 복원할 수 없습니다.`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const data = await boardApiClient.deletePostsBulk(postIds);
          if (data.success) {
            setSelectedPost(null);
            setViewState('LIST');
            setCurrentPage(1);
            fetchPosts();
          } else {
            alert(data.message || '일괄 삭제 처리에 실패했습니다.');
          }
        } catch (e: any) {
          console.error('Failed to bulk delete posts:', e);
          alert('일괄 삭제 중 오류가 발생했습니다: ' + e.message);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleSetNoticePosts = (postIds: number[]) => {
    setConfirmModal({
      message: `선택하신 ${postIds.length}개의 문의글을 공지사항으로 일괄 등록하시겠습니까?`,
      onConfirm: async () => {
        try {
          const data = await boardApiClient.setNoticePostsBulk(postIds, true);
          if (data.success) {
            setSelectedPost(null);
            setViewState('LIST');
            fetchPosts();
          } else {
            alert(data.message || '일괄 공지 등록 처리에 실패했습니다.');
          }
        } catch (e: any) {
          console.error('Failed to bulk set notice:', e);
          alert('일괄 공지 등록 중 오류가 발생했습니다: ' + e.message);
        }
      }
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const data = await boardApiClient.addComment(selectedPost.id, memberId, newComment);
      if (data.success) {
        setNewComment('');
        fetchPostComments(selectedPost.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setConfirmModal({
      message: '선택한 댓글을 안전하게 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await boardApiClient.deleteComment(commentId);
          fetchPostComments(selectedPost.id);
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleDeleteAttachment = (attachmentId: number) => {
    setConfirmModal({
      message: '선택한 첨부파일을 즉시 삭제하시겠습니까? 복원할 수 없습니다.',
      onConfirm: async () => {
        try {
          const data = await boardApiClient.deleteAttachment(attachmentId);
          if (data.success) {
            setAttachments(prev => prev.filter(att => att.id !== attachmentId));
            alert('첨부파일이 삭제되었습니다.');
          } else {
            alert(data.message || '첨부파일 삭제 처리에 실패했습니다.');
          }
        } catch (e: any) {
          console.error(e);
          alert('첨부파일 삭제 중 오류가 발생했습니다: ' + e.message);
        }
      }
    });
  };

  const handleToggleLike = async (postId: number) => {
    if (!loggedUser) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    try {
      const data = await boardApiClient.toggleLike(postId, memberId);
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, liked: data.liked, like_count: data.likeCount };
          }
          return p;
        }));
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => ({
            ...prev,
            liked: data.liked,
            like_count: data.likeCount
          }));
        }
      }
    } catch (e) {
      console.error('Failed to toggle like:', e);
    }
  };

  return {
    posts,
    setPosts,
    searchKwd,
    setSearchKwd,
    activeKwd,
    setActiveKwd,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalPosts,
    setTotalPosts,
    isLoading,
    setIsLoading,
    isRefreshing,
    setIsRefreshing,
    selectedCategory,
    setSelectedCategory,
    writeCategory,
    setWriteCategory,
    isInlineWriteOpen,
    setIsInlineWriteOpen,
    viewState,
    setViewState,
    selectedPost,
    setSelectedPost,
    editingPostId,
    setEditingPostId,
    attachments,
    setAttachments,
    comments,
    setComments,
    newComment,
    setNewComment,
    isDetailLoading,
    setIsDetailLoading,
    isEditing,
    setIsEditing,
    deletedFileIds,
    setDeletedFileIds,
    gradePermissions,
    writeTitle,
    setWriteTitle,
    writeContent,
    setWriteContent,
    writeIsSecret,
    setWriteIsSecret,
    writeIsNotice,
    setWriteIsNotice,
    writeSkinType,
    setWriteSkinType,
    attachedFiles,
    setAttachedFiles,
    isWriting,
    isDragOver,
    setIsDragOver,
    fileInputRef,
    confirmModal,
    setConfirmModal,
    isAdmin,
    memberId,
    showWriteButton,
    checkWritePermissionForCategory,
    fetchPosts,
    handleSelectPost,
    handleFileDrop,
    handleFileSelect,
    handleSavePost,
    handleDeletePost,
    handleDeletePosts,
    handleSetNoticePosts,
    handleAddComment,
    handleDeleteComment,
    handleDeleteAttachment,
    handleToggleLike
  };
};
