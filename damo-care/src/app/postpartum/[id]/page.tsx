'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FiMapPin, FiStar, FiCalendar, FiMessageCircle,
  FiChevronLeft, FiSend, FiHeart, FiMessageSquare
} from 'react-icons/fi';
import CalendarModal from '@/components/CalendarModal';
import { StoredUser, Helper, Favorite, Review } from '@/types';

export default function HelperDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [helper, setHelper] = useState<Helper | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      if (u.role === 'mother') {
        fetch(`/api/favorites/${encodeURIComponent(u.email)}`)
          .then(r => r.json())
          .then(data => setIsFavorite(data.some((f: Favorite) => f.helperId === id)));
      }
    }

    fetch(`/api/helpers`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((h: Helper) => h.id === id || h._id === id);
        setHelper(found);
      });

    fetch(`/api/reviews/${id}`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, [id]);

  const handleReserve = async (date: string) => {
    if (!user) return;
    if (!helper) return;
    setShowCalendar(false);
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: user.email,
        helperName: helper.name,
        helperId: id,
        date,
      }),
    });
    if (res.ok) {
      alert(`${helper.name} 도우미님 ${date} 예약이 접수되었습니다!`);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('예약 접수 완료!', { body: `${helper.name} 도우미님 ${date} 예약이 접수되었습니다.`, icon: '/favicon.ico' });
      }
    }
  };

  const toggleFavorite = async () => {
    if (!user) return alert('로그인 후 이용 가능합니다.');
    if (isFavorite) {
      await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherEmail: user.email, helperId: id }) });
      setIsFavorite(false);
    } else {
      await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherEmail: user.email, helperId: id, helperName: helper?.name }) });
      setIsFavorite(true);
    }
  };

  const startChat = async () => {
    if (!user) return alert('로그인 후 이용 가능합니다.');
    if (user.role !== 'mother') return alert('산모 회원만 채팅을 시작할 수 있습니다.');
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motherEmail: user.email, helperId: id, helperName: helper?.name, motherName: user.name }),
    });
    const data = await res.json();
    if (data.roomId) router.push(`/messages/${data.roomId}`);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('로그인 후 리뷰를 남길 수 있습니다.');
    if (!comment.trim()) return alert('후기 내용을 입력해주세요.');
    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helperId: id, user: user.name, rating, comment }),
    });
    setSubmitting(false);
    if (res.ok) {
      alert('리뷰가 등록되었습니다!');
      setComment('');
      setRating(5);
      window.location.reload();
    }
  };

  if (!helper) return <div className="p-20 text-center text-gray-400">정보를 불러오는 중...</div>;

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 mb-8 hover:text-pink-500 transition-colors">
        <FiChevronLeft className="mr-1" /> 뒤로가기
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 왼쪽: 프로필 카드 */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-pink-50 sticky top-24">
            <div className="h-48 bg-pink-100 flex items-center justify-center relative overflow-hidden">
              {helper.profileImage
                ? <img src={helper.profileImage} alt={helper.name} className="w-full h-full object-cover" />
                : <span className="text-6xl">👤</span>
              }
              {user?.role === 'mother' && (
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <FiHeart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
              )}
            </div>
            <div className="p-6 text-center">
              {helper.helperType && (
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-600 mb-3">
                  {helper.helperType}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-800">{helper.name}</h1>
              <p className="text-pink-500 font-medium flex items-center justify-center mt-2">
                <FiMapPin className="mr-1" /> {helper.area}
              </p>
              <div className="flex items-center justify-center mt-3 text-yellow-500">
                <FiStar className="fill-current mr-1" />
                <span className="font-bold">{helper.rating}</span>
                <span className="text-gray-300 text-sm ml-2">({reviews.length}개의 리뷰)</span>
              </div>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => { if (!user) { alert('로그인 후 이용 가능합니다.'); return; } setShowCalendar(true); }}
                  className="w-full bg-pink-500 text-white py-3 rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 flex items-center justify-center gap-2"
                >
                  <FiCalendar size={16} /> 예약 신청하기
                </button>
                {user?.role === 'mother' && (
                  <button
                    onClick={startChat}
                    className="w-full bg-white text-pink-500 border border-pink-300 py-3 rounded-2xl font-bold hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
                  >
                    <FiMessageSquare size={16} /> 1:1 채팅
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 상세 내용 & 리뷰 */}
        <div className="md:col-span-2 space-y-10">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <FiCalendar className="mr-2 text-pink-500" /> 도우미 소개
            </h2>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl italic">
              &quot;{helper.intro || '안녕하세요, 정성을 다해 산모님과 아기를 돌보는 도우미입니다. 언제든 편하게 문의주세요.'}&quot;
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border rounded-2xl text-center">
                <p className="text-xs text-gray-400">경력</p>
                <p className="font-bold text-gray-700">{helper.experience}년</p>
              </div>
              <div className="p-4 bg-white border rounded-2xl text-center">
                <p className="text-xs text-gray-400">희망 가격</p>
                <p className="font-bold text-pink-600">₩{helper.price}</p>
              </div>
            </div>
          </section>

          {/* 포트폴리오 섹션 */}
          {(((helper.specialties?.length ?? 0) > 0) || ((helper.certifications?.length ?? 0) > 0) || ((helper.portfolioImages?.length ?? 0) > 0)) && (
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
              <h2 className="text-xl font-bold mb-5 flex items-center text-gray-800">
                🏅 자격 & 포트폴리오
              </h2>
              {(helper.specialties?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">전문 분야</p>
                  <div className="flex flex-wrap gap-2">
                    {helper.specialties?.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-bold border border-pink-100">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {(helper.certifications?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">보유 자격증</p>
                  <div className="flex flex-wrap gap-2">
                    {helper.certifications?.map((c: string) => (
                      <span key={c} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">🎓 {c}</span>
                    ))}
                  </div>
                </div>
              )}
              {(helper.portfolioImages?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">활동 사진</p>
                  <div className="grid grid-cols-3 gap-2">
                    {helper.portfolioImages?.map((img: string, i: number) => (
                      <img key={i} src={img} alt={`포트폴리오 ${i + 1}`} className="w-full aspect-square object-cover rounded-xl" />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 리뷰 섹션 */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
            <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <FiMessageCircle className="mr-2 text-pink-500" /> 이용 후기
            </h2>

            {user?.role === 'mother' && (
              <form onSubmit={submitReview} className="mb-10 bg-pink-50 p-6 rounded-2xl border border-pink-100">
                <p className="text-sm font-bold text-gray-700 mb-3">후기 남기기</p>
                {/* 별점 선택 (호버 효과) */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500">만족도</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <FiStar
                          size={22}
                          className={`transition-colors ${num <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 ml-1">{rating}점</span>
                </div>
                <textarea
                  className="w-full p-4 bg-white border border-pink-100 rounded-xl h-24 focus:ring-2 focus:ring-pink-300 outline-none text-sm resize-none"
                  placeholder="다른 산모님들을 위해 솔직한 후기를 남겨주세요. (최소 10자)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-300">{comment.length}/500</span>
                  <button
                    type="submit"
                    disabled={submitting || comment.length < 10}
                    className="flex items-center gap-2 bg-pink-500 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-pink-600 disabled:opacity-50 transition-colors"
                  >
                    <FiSend size={13} /> {submitting ? '등록 중...' : '후기 등록'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {reviews.length > 0 ? reviews.map((rev: Review) => (
                <div key={rev._id || rev.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-sm">👤</div>
                      <span className="font-bold text-gray-700 text-sm">{rev.user} 산모님</span>
                    </div>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(rev.rating)].map((_, i) => <FiStar key={i} className="fill-current" size={14} />)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-gray-300">{rev.date}</span>
                </div>
              )) : (
                <p className="text-center text-gray-400 py-10">아직 등록된 후기가 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {showCalendar && (
        <CalendarModal
          helperName={helper.name || ''}
          helperId={id}
          onClose={() => setShowCalendar(false)}
          onConfirm={handleReserve}
        />
      )}
    </div>
  );
}
