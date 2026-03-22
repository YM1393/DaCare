'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiEdit3, FiImage, FiUser, FiMessageSquare, FiHeart, FiSearch, FiSend, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { SkeletonPost } from '@/components/Skeleton';
import type { StoredUser, Post, PostComment } from '@/types';

const CATEGORIES = ['전체', '고민상담', '정보공유'];
const ALL_TAGS = ['산후조리', '모유수유', '신생아', '수면교육', '이유식', '육아용품', '산후우울', '운동'];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('고민상담');
  const [selectedWriteTags, setSelectedWriteTags] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState('전체');
  const [filterTag, setFilterTag] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const fetchPosts = (q = search, tag = filterTag) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (tag) params.set('tag', tag);
    fetch(`/api/posts?${params}`)
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchPosts();
  }, []);

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearch(val);
      fetchPosts(val, filterTag);
    }, 350);
  };

  const handleTagFilter = (tag: string) => {
    const next = filterTag === tag ? '' : tag;
    setFilterTag(next);
    fetchPosts(search, next);
  };

  const filteredPosts = filterCategory === '전체'
    ? posts
    : posts.filter((p: Post) => p.category === filterCategory);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleWriteTag = (tag: string) => {
    setSelectedWriteTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요한 기능입니다.');
    if (!title || !content) return alert('내용을 입력해주세요.');
    let finalImageUrl = '';
    try {
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      }
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, author: user.name, authorEmail: user.email, imageUrl: finalImageUrl, tags: selectedWriteTags }),
      });
      if (res.ok) {
        setTitle(''); setContent(''); setImage(null); setPreview(''); setSelectedWriteTags([]);
        setShowForm(false);
        fetchPosts(search, filterTag);
      }
    } catch {
      alert('등록에 실패했습니다.');
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return alert('로그인 후 이용 가능합니다.');
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    });
    const data = await res.json();
    setPosts(prev => prev.map(p =>
      (p._id === postId || p.id === postId)
        ? { ...p, likes: data.likes, likedBy: data.liked ? [...(p.likedBy || []), user.email] : (p.likedBy || []).filter((e: string) => e !== user.email) }
        : p
    ));
  };

  const toggleComments = async (postId: string) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    if (!commentsMap[postId]) {
      const data = await fetch(`/api/posts/${postId}/comments`).then(r => r.json());
      setCommentsMap(prev => ({ ...prev, [postId]: data }));
    }
  };

  const submitComment = async (postId: string) => {
    if (!user) return alert('로그인 후 이용 가능합니다.');
    if (!commentInput.trim()) return;
    setSubmittingComment(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorEmail: user.email, authorName: user.name, content: commentInput }),
    });
    const newComment = await res.json();
    setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
    setCommentInput('');
    setSubmittingComment(false);
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FiMessageSquare className="mr-3 text-pink-500" /> 커뮤니티
          </h1>
          <p className="text-gray-500 mt-1 text-sm">산모님들과 도우미님들이 함께 나누는 공간</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-600 shadow-lg shadow-pink-100">
          {showForm ? '닫기' : <><FiEdit3 size={16} /> 글쓰기</>}
        </button>
      </div>

      {/* 글쓰기 폼 */}
      {showForm && (
        user ? (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl mb-8 border border-pink-50">
            <div className="flex gap-3 mb-4">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-pink-200 text-sm font-bold bg-gray-50">
                <option value="고민상담">고민상담</option>
                <option value="정보공유">정보공유</option>
              </select>
              <input type="text" placeholder="제목을 입력하세요"
                className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <textarea placeholder={`${user.name}님, 무엇이 궁금하신가요?`}
              className="w-full p-4 border rounded-xl mb-4 h-36 outline-none focus:ring-2 focus:ring-pink-200 resize-none text-sm"
              value={content} onChange={e => setContent(e.target.value)} />
            {/* 태그 선택 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">태그 선택 (복수 가능)</p>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleWriteTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                      selectedWriteTags.includes(tag)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300'
                    }`}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-pink-500 text-sm">
                <FiImage size={18} /> 사진 첨부
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <button className="bg-pink-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-pink-600 text-sm">등록하기</button>
            </div>
            {preview && (
              <div className="mt-4 relative w-24 h-24">
                <img src={preview} alt="미리보기" className="w-full h-full object-cover rounded-xl" />
                <button type="button" onClick={() => { setImage(null); setPreview(''); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
              </div>
            )}
          </form>
        ) : (
          <div className="bg-gray-50 p-10 rounded-3xl mb-8 text-center border-2 border-dashed border-gray-200">
            <FiLock className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 mb-3 text-sm">로그인한 회원만 글을 남길 수 있습니다.</p>
            <button onClick={() => router.push('/login')} className="text-pink-500 font-bold hover:underline text-sm">로그인하러 가기 →</button>
          </div>
        )
      )}

      {/* 검색 */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="제목이나 내용으로 검색..."
          value={searchInput}
          onChange={e => handleSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-200 bg-white"
        />
      </div>

      {/* 카테고리 + 태그 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              filterCategory === cat ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-pink-300'
            }`}>
            {cat}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => handleTagFilter(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterTag === tag ? 'bg-purple-500 text-white' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-purple-300'
            }`}>
            #{tag}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {loading
          ? Array(3).fill(0).map((_, i) => <SkeletonPost key={i} />)
          : filteredPosts.length > 0
            ? filteredPosts.map((post: Post) => {
                const postId = post._id || post.id || '';
                const isLiked = user && (post.likedBy || []).includes(user.email);
                const isCommentsOpen = openComments === postId;
                const comments = commentsMap[postId] || [];
                return (
                  <div key={postId} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                    <div className="p-7">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          post.category === '고민상담' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'
                        }`}>{post.category || '일반'}</span>
                        {(post.tags || []).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-500 font-bold">#{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{post.title}</h3>
                      <p className="text-gray-500 mt-2 line-clamp-2 text-sm leading-relaxed">{post.content}</p>
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="이미지" className="mt-4 rounded-2xl max-h-48 object-cover" />
                      )}
                      <div className="mt-5 flex justify-between items-center border-t border-gray-50 pt-4">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <FiUser className="text-pink-300" size={12} /> {post.author}
                          <span className="ml-2">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          {/* 좋아요 */}
                          <button onClick={() => handleLike(postId)}
                            className={`flex items-center gap-1 text-xs font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                            <FiHeart size={14} className={isLiked ? 'fill-red-500' : ''} />
                            {post.likes || 0}
                          </button>
                          {/* 댓글 토글 */}
                          <button onClick={() => toggleComments(postId)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-500 font-bold transition-colors">
                            <FiMessageSquare size={14} />
                            {comments.length > 0 ? comments.length : (isCommentsOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 댓글 섹션 */}
                    {isCommentsOpen && (
                      <div className="border-t border-gray-50 px-7 pb-5">
                        <div className="pt-4 space-y-3 max-h-60 overflow-y-auto">
                          {comments.length === 0
                            ? <p className="text-xs text-gray-300 text-center py-3">첫 댓글을 남겨보세요!</p>
                            : comments.map((c: PostComment) => (
                                <div key={c._id} className="flex gap-2 items-start">
                                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs shrink-0">👤</div>
                                  <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                                    <p className="text-xs font-bold text-gray-700">{c.authorName}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                                  </div>
                                </div>
                              ))
                          }
                        </div>
                        {user ? (
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              placeholder="댓글을 입력하세요..."
                              value={commentInput}
                              onChange={e => setCommentInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') submitComment(postId); }}
                              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-pink-200"
                            />
                            <button onClick={() => submitComment(postId)} disabled={submittingComment}
                              className="bg-pink-500 text-white px-3 py-2 rounded-xl hover:bg-pink-600 disabled:opacity-50 transition-colors">
                              <FiSend size={13} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center mt-3">댓글은 로그인 후 작성할 수 있습니다.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            : (
              <div className="text-center py-16 text-gray-300 text-sm">
                {search ? `"${search}" 검색 결과가 없어요.` : filterCategory === '전체' ? '아직 게시글이 없어요.' : `${filterCategory} 게시글이 없어요.`}
              </div>
            )
        }
      </div>
    </div>
  );
}
