'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiCheckCircle, FiTrendingUp, FiTrash2, FiMessageSquare, FiUserCheck, FiCheck, FiXCircle } from 'react-icons/fi';
import type { Helper, Reservation, Post } from '@/types';

export default function AdminPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, pendingBookings: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingHelpers, setPendingHelpers] = useState<Helper[]>([]);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    setAuthorized(true);
    fetchData();
  }, []);

  // 데이터 통합 불러오기 함수
  const fetchData = async () => {
    try {
      // 1. 통계 데이터
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. 게시글 목록
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      setPosts(postsData);

      // 3. 승인 대기 도우미 목록 호출
      fetchPending();

      // 4. 예약 확정 대기 목록
      fetchPendingReservations();
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  // 승인 대기 목록만 따로 불러오는 함수
  const fetchPending = async () => {
    try {
      const res = await fetch('/api/admin/pending-helpers');
      const data = await res.json();
      setPendingHelpers(data);
    } catch (err) {
      console.error("대기 목록 로드 실패:", err);
    }
  };

  // 예약 확정 대기 목록
  const fetchPendingReservations = async () => {
    try {
      const res = await fetch('/api/admin/reservations');
      const data = await res.json();
      setPendingReservations(data);
    } catch (err) {
      console.error("예약 목록 로드 실패:", err);
    }
  };

  // 예약 상태 변경
  const handleReservationAction = async (id: string, status: 'confirmed' | 'cancelled') => {
    const label = status === 'confirmed' ? '확정' : '취소';
    if (!confirm(`이 예약을 ${label}하시겠습니까?`)) return;
    const res = await fetch('/api/admin/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      alert(`예약이 ${label}되었습니다.`);
      fetchPendingReservations();
    }
  };


  // 도우미 승인 처리 함수
  const approveHelper = async (email: string) => {
    if (!confirm(`${email} 사용자를 도우미로 승인하시겠습니까?`)) return;

    const res = await fetch('/api/admin/approve-helper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      alert("승인되었습니다! 이제 도우미 목록에 나타납니다.");
      fetchData(); // 전체 데이터 갱신
    }
  };

  // 게시글 삭제 함수
  const deletePost = async (id: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까? (부적절한 게시글 관리)")) return;
    
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert("게시글이 성공적으로 삭제되었습니다.");
      fetchData();
    }
  };

  if (!authorized) return null;

  return (
    <div className="container mx-auto px-6 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <FiTrendingUp className="mr-3 text-pink-500" /> 관리자 대시보드
      </h1>

      {/* 1. 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">전체 가입자</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}명</h3>
            </div>
            <FiUsers className="text-3xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">전체 예약 건수</p>
              <h3 className="text-2xl font-bold">{stats.totalBookings}건</h3>
            </div>
            <FiCalendar className="text-3xl text-pink-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">승인 대기 중</p>
              <h3 className="text-2xl font-bold">{stats.pendingBookings}건</h3>
            </div>
            <FiCheckCircle className="text-3xl text-yellow-500" />
          </div>
        </div>
      </div>

      {/* 2. 신규 도우미 승인 대기 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-yellow-100">
        <h2 className="text-xl font-bold mb-6 flex items-center text-yellow-600">
          <FiUserCheck className="mr-2" /> 신규 도우미 승인 대기
        </h2>
        <div className="space-y-4">
          {pendingHelpers.length > 0 ? pendingHelpers.map((h: Helper) => (
            <div key={h.email} className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl border border-yellow-100 transition-all hover:shadow-md">
              <div>
                <span className="font-bold text-gray-800">{h.name}</span>
                <p className="text-xs text-gray-500">{h.email}</p>
              </div>
              <button 
                onClick={() => approveHelper(h.email || '')}
                className="bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-green-600 shadow-sm transition-colors"
              >
                승인하기
              </button>
            </div>
          )) : (
            <p className="text-gray-400 text-center py-6">대기 중인 신규 도우미가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 2-B. 예약 확정 관리 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-blue-100">
        <h2 className="text-xl font-bold mb-6 flex items-center text-blue-600">
          <FiCalendar className="mr-2" /> 예약 확정 관리
        </h2>
        <div className="space-y-4">
          {pendingReservations.length > 0 ? pendingReservations.map((r: Reservation) => (
            <div key={r._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 transition-all hover:shadow-md">
              <div>
                <span className="font-bold text-gray-800">{r.userEmail?.split('@')[0]} 산모님</span>
                <p className="text-xs text-gray-500">{r.helperName} 도우미 · {r.date}</p>
                <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">대기중</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReservationAction(r._id, 'confirmed')}
                  className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 shadow-sm transition-colors"
                >
                  <FiCheck size={14} /> 확정
                </button>
                <button
                  onClick={() => handleReservationAction(r._id, 'cancelled')}
                  className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 shadow-sm transition-colors"
                >
                  <FiXCircle size={14} /> 취소
                </button>
              </div>
            </div>
          )) : (
            <p className="text-gray-400 text-center py-6">확정 대기 중인 예약이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 3. 게시글 관리 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <FiMessageSquare className="mr-2 text-pink-500" /> 커뮤니티 게시글 관리
        </h2>
        
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post: Post) => (
              <div key={post.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <span className="font-semibold text-gray-800">{post.title}</span>
                  <p className="text-sm text-gray-500">작성자: {post.author}</p>
                </div>
                <button 
                  onClick={() => deletePost(parseInt(post.id ?? '0'))}
                  className="flex items-center text-red-500 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <FiTrash2 className="mr-1" /> 삭제
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-6">현재 관리할 게시글이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}