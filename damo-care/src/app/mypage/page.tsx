'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiUser, FiPackage, FiLogOut, FiCalendar,
  FiSettings, FiSave, FiHeart, FiX,
  FiBookOpen, FiLock, FiStar, FiCamera,
  FiMapPin, FiDollarSign, FiAward, FiMessageSquare,
  FiChevronLeft, FiChevronRight, FiCheck,
} from 'react-icons/fi';
import { SkeletonProfile } from '@/components/Skeleton';
import type { StoredUser, Reservation, Favorite, Reminder } from '@/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: '대기중',  color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '확정',    color: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료',    color: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소됨',  color: 'bg-gray-100 text-gray-500' },
};

// ─── 달력 컴포넌트 ─────────────────────────────────────────
function AvailabilityCalendar({
  selectedDates,
  onToggle,
}: {
  selectedDates: string[];
  onToggle: (date: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // 달력 날짜 배열 생성
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=일
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // 최대 3개월 앞까지 선택 가능
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);

  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(viewYear, viewMonth, i + 1);
      return d.toISOString().split('T')[0];
    }),
  ];
  // 6행으로 맞추기
  while (cells.length % 7 !== 0) cells.push(null);

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <button onClick={prevMonth} className="p-1.5 hover:bg-blue-400 rounded-lg transition-colors">
          <FiChevronLeft size={18} />
        </button>
        <span className="font-bold text-base">{viewYear}년 {MONTH_NAMES[viewMonth]}</span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-blue-400 rounded-lg transition-colors">
          <FiChevronRight size={18} />
        </button>
      </div>

      <div className="p-4">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-xs font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {w}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((dateStr, idx) => {
            if (!dateStr) return <div key={idx} />;

            const isPast = dateStr < todayStr;
            const isTooFar = dateStr > maxDate.toISOString().split('T')[0];
            const isDisabled = isPast || isTooFar;
            const isSelected = selectedDates.includes(dateStr);
            const isToday = dateStr === todayStr;
            const dayOfWeek = idx % 7;
            const day = parseInt(dateStr.split('-')[2]);

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => !isDisabled && onToggle(dateStr)}
                disabled={isDisabled}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${isSelected
                    ? 'bg-green-500 text-white shadow-sm scale-105'
                    : isToday
                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-300 font-bold'
                    : isDisabled
                    ? 'text-gray-200 cursor-not-allowed'
                    : dayOfWeek === 0
                    ? 'text-red-400 hover:bg-red-50'
                    : dayOfWeek === 6
                    ? 'text-blue-400 hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {day}
                {isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 선택된 날짜 요약 */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-600">
              {selectedDates.length > 0 ? `${selectedDates.length}일 선택됨` : '날짜를 선택해주세요'}
            </span>
            {selectedDates.length > 0 && (
              <button
                type="button"
                onClick={() => selectedDates.forEach(d => onToggle(d))}
                className="text-xs text-red-400 hover:text-red-500 font-medium"
              >
                전체 초기화
              </button>
            )}
          </div>
          {selectedDates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {[...selectedDates].sort().map(d => {
                const date = new Date(d);
                return (
                  <span key={d} className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    {date.getMonth() + 1}/{date.getDate()}
                    <button type="button" onClick={() => onToggle(d)} className="text-green-400 hover:text-red-400 ml-0.5">
                      <FiX size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────
export default function MyPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [profile, setProfile] = useState({ area: '', price: '', experience: '', intro: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [daysAfter, setDaysAfter] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperAvailableDates, setHelperAvailableDates] = useState<string[]>([]);
  const [helperType, setHelperType] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [reminderList, setReminderList] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'reservations'>('profile');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const HELPER_TYPES = ['산후도우미', '산후조리도우미', '신생아전문 도우미', '가사도우미', '청소도우미', '베이비시터', '요리전문 도우미', '산모케어 전문'];
  const SPECIALTY_OPTIONS = ['신생아케어', '모유수유지도', '산모마사지', '요리/가사', '쌍둥이케어', '산후우울상담'];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) { alert('로그인이 필요한 페이지입니다.'); router.push('/login'); return; }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    if (userData.profileImage) setProfileImage(userData.profileImage);

    // 기존 프로필 값 불러오기
    setProfile({
      area: userData.area || '',
      price: userData.price || '',
      experience: userData.experience || '',
      intro: userData.intro || '',
    });
    setHelperType(userData.helperType || '');
    setSpecialties(userData.specialties || []);
    setCertifications(userData.certifications || []);

    const savedBirth = localStorage.getItem('birthDate');
    if (savedBirth) { setBirthDate(savedBirth); calcDays(savedBirth); }

    fetch(`/api/reservations/${userData.email}`)
      .then(res => res.json())
      .then(data => {
        setMyReservations(data);
        setLoading(false);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleDateString();
        const tomorrowISO = tomorrow.toISOString().split('T')[0];
        const upcoming = data.filter((r: Reservation) =>
          r.status !== 'cancelled' && (r.date === tomorrowStr || r.date === tomorrowISO)
        );
        setReminderList(upcoming);
      })
      .catch(() => setLoading(false));

    if (userData.role === 'mother') {
      fetch(`/api/favorites/${encodeURIComponent(userData.email)}`)
        .then(r => r.json()).then(data => setFavorites(data)).catch(() => {});
    }
    if (userData.role === 'helper') {
      const savedDates = localStorage.getItem('helperAvailableDates');
      if (savedDates) { try { setHelperAvailableDates(JSON.parse(savedDates)); } catch {} }
    }
  }, [router]);

  const calcDays = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    setDaysAfter(diff);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const res = await fetch('/api/helpers/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, ...profile, helperType, specialties, certifications }),
    });
    setSaving(false);
    if (res.ok) alert('프로필이 저장되었습니다!');
  };

  const toggleAvailableDate = (dateStr: string) => {
    const updated = helperAvailableDates.includes(dateStr)
      ? helperAvailableDates.filter(d => d !== dateStr)
      : [...helperAvailableDates, dateStr];
    setHelperAvailableDates(updated);
    localStorage.setItem('helperAvailableDates', JSON.stringify(updated));
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;
    const res = await fetch('/api/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    });
    if (res.ok) setMyReservations(prev => prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r));
  };

  const removeFavorite = async (helperId: string) => {
    if (!user) return;
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motherEmail: user.email, helperId }),
    });
    setFavorites(prev => prev.filter(f => f.helperId !== helperId));
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) { alert('1MB 이하 이미지만 업로드 가능합니다.'); return; }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      if (!user) return;
      const base64 = reader.result as string;
      const res = await fetch('/api/upload/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, imageBase64: base64 }),
      });
      if (res.ok) {
        setProfileImage(base64);
        setUser(prev => prev ? { ...prev, profileImage: base64 } : prev);
        localStorage.setItem('user', JSON.stringify({ ...user, profileImage: base64 }));
      }
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) return <div className="container mx-auto px-6 py-12 max-w-2xl"><SkeletonProfile /></div>;
  if (!user) return null;

  // ── 산모 전용 레이아웃 (기존 유지) ──────────────────────────
  if (user.role !== 'helper') {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-pink-50">
          <div className="bg-pink-500 p-8 text-center text-white">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-pink-500 text-3xl shadow-inner overflow-hidden">
                {profileImage ? <img src={profileImage} alt="프로필" className="w-full h-full object-cover" /> : <FiUser />}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                {uploadingImage ? <span className="text-[8px] text-white">...</span> : <FiCamera size={13} className="text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
              </label>
            </div>
            <h1 className="text-2xl font-bold">{user.name}님, 반갑습니다!</h1>
            <p className="opacity-80 text-sm mt-1">🏠 산모 회원 · {user.email}</p>
          </div>
          <div className="p-8 space-y-10">
            {/* 산후 D+N 트래커 */}
            <section className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
              <h2 className="text-lg font-bold mb-4 flex items-center text-pink-600"><FiHeart className="mr-2" /> 산후 회복 트래커</h2>
              {daysAfter !== null ? (
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-pink-500">D+{daysAfter}</p>
                  <p className="text-gray-500 mt-2 text-sm">출산 후 {daysAfter}일째예요 💗</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {daysAfter <= 14 ? '초기 회복기 – 충분한 휴식이 가장 중요해요.' : daysAfter <= 42 ? '회복 진행 중 – 조금씩 움직임을 늘려보세요.' : '산후조리 기간 종료 – 천천히 일상으로 돌아가고 있어요!'}
                  </p>
                  <button onClick={() => { setDaysAfter(null); setBirthDate(''); localStorage.removeItem('birthDate'); }} className="mt-3 text-xs text-gray-400 underline">날짜 재설정</button>
                </div>
              ) : (
                <div className="flex gap-3 items-end">
                  <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">출산일 입력</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-pink-300 text-sm" /></div>
                  <button onClick={() => { localStorage.setItem('birthDate', birthDate); calcDays(birthDate); }} className="bg-pink-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-pink-600 text-sm">확인</button>
                </div>
              )}
            </section>
            {/* 빠른 메뉴 */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800"><FiBookOpen className="mr-2 text-pink-500" /> 나의 건강 관리</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { href: '/baby-log', emoji: '🍼', label: '아기 케어 대시보드', sub: '수유·수면·기저귀 현황', bg: 'bg-rose-50', border: 'border-rose-100' },
                  { href: '/emotion', emoji: '💙', label: '감정 일기', sub: '오늘의 기분 기록', bg: 'bg-blue-50', border: 'border-blue-100' },
                  { href: '/health-journal', emoji: '📓', label: '산후 건강 일지', sub: '매일 건강 기록', bg: 'bg-pink-50', border: 'border-pink-100' },
                  { href: '/growth', emoji: '📈', label: '성장 트래커', sub: '아기 성장 기록', bg: 'bg-blue-50', border: 'border-blue-100' },
                  { href: '/messages', emoji: '💬', label: '1:1 채팅', sub: '도우미와 대화', bg: 'bg-purple-50', border: 'border-purple-100' },
                  { href: '/emergency', emoji: '🚨', label: '응급 연락처', sub: '긴급 전화번호', bg: 'bg-red-50', border: 'border-red-100' },
                ].map(item => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-4 ${item.bg} rounded-2xl border ${item.border} hover:opacity-80 transition-opacity`}>
                    <span className="text-2xl">{item.emoji}</span>
                    <div><p className="font-bold text-sm text-gray-800">{item.label}</p><p className="text-xs text-gray-500">{item.sub}</p></div>
                  </Link>
                ))}
              </div>
            </section>
            {/* 즐겨찾기 */}
            {favorites.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800"><FiStar className="mr-2 text-pink-500" /> 즐겨찾기 도우미</h2>
                <div className="space-y-3">
                  {favorites.map(fav => (
                    <div key={fav._id} className="flex items-center justify-between p-4 bg-pink-50 border border-pink-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center text-lg">👤</div>
                        <div><p className="font-bold text-sm text-gray-800">{fav.helperName}</p><p className="text-xs text-gray-400">즐겨찾기 도우미</p></div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/postpartum/${fav.helperId}`} className="text-xs text-pink-500 border border-pink-300 px-3 py-1.5 rounded-full hover:bg-pink-100">상세 보기</Link>
                        <button onClick={() => removeFavorite(fav.helperId)} className="text-gray-300 hover:text-red-400 p-1"><FiX size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* 예약 현황 */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800"><FiPackage className="mr-2 text-pink-500" /> 내 서비스 이용 현황</h2>
              {myReservations.length > 0 ? (
                <div className="space-y-3">
                  {myReservations.map(rev => {
                    const st = STATUS_MAP[rev.status] || STATUS_MAP.pending;
                    return (
                      <div key={rev._id} className="p-4 bg-pink-50 border border-pink-100 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FiCalendar className="text-pink-400" />
                          <div><p className="font-semibold text-gray-700 text-sm">{rev.helperName} 도우미</p><p className="text-xs text-gray-400">{rev.date}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold ${st.color}`}>{st.label}</span>
                          {rev.status === 'pending' && (
                            <button onClick={() => handleCancelReservation(rev._id)} className="text-gray-300 hover:text-red-400"><FiX size={16} /></button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 p-10 rounded-2xl text-center text-gray-400 border-2 border-dashed text-sm">아직 예약 내역이 없어요.</div>
              )}
            </section>
            <div className="border-t pt-6 flex flex-col gap-3">
              <Link href="/reset-password" className="flex items-center justify-center gap-2 text-gray-400 hover:text-pink-500 text-sm"><FiLock size={15} /> 비밀번호 변경</Link>
              <button onClick={handleLogout} className="flex items-center justify-center text-gray-400 hover:text-red-500 text-sm"><FiLogOut className="mr-2" /> 로그아웃</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 도우미 전용 와이드 레이아웃 ─────────────────────────────
  const TABS = [
    { key: 'profile' as const, label: '프로필 편집', icon: <FiSettings size={15} /> },
    { key: 'calendar' as const, label: '가능한 날짜', icon: <FiCalendar size={15} /> },
    { key: 'reservations' as const, label: '예약 현황', icon: <FiPackage size={15} />, badge: myReservations.filter(r => r.status === 'pending').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* 리마인더 배너 */}
        {reminderList.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-bold text-yellow-700 text-sm">내일 예약이 있어요!</p>
              {reminderList.map((r, i) => (
                <p key={i} className="text-xs text-yellow-600 mt-0.5">
                  {r.userEmail?.split('@')[0]} 산모님과의 예약 — {r.date}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── 왼쪽 사이드바 프로필 카드 ─────────────────────── */}
          <aside className="lg:w-72 shrink-0 space-y-4">

            {/* 프로필 카드 */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              {/* 배경 그라디언트 헤더 */}
              <div className="h-24 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-500 relative">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>

              <div className="px-6 pb-6">
                {/* 프로필 이미지 */}
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-blue-400 text-3xl">
                    {profileImage ? <img src={profileImage} alt="프로필" className="w-full h-full object-cover" /> : <FiUser />}
                  </div>
                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                    {uploadingImage ? <span className="text-[8px] text-white animate-pulse">...</span> : <FiCamera size={13} className="text-white" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                  </label>
                </div>

                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-blue-500 font-medium mb-3">✨ 전문 도우미</p>

                {/* 도우미 유형 뱃지 */}
                {helperType && (
                  <span className="inline-block bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {helperType}
                  </span>
                )}

                {/* 기본 정보 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiUser size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  {profile.area && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMapPin size={13} className="text-blue-400 shrink-0" />
                      <span className="text-xs">{profile.area}</span>
                    </div>
                  )}
                  {profile.price && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiDollarSign size={13} className="text-green-500 shrink-0" />
                      <span className="text-xs">일당 {profile.price}원</span>
                    </div>
                  )}
                  {profile.experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiAward size={13} className="text-yellow-500 shrink-0" />
                      <span className="text-xs">경력 {profile.experience}년</span>
                    </div>
                  )}
                </div>

                {/* 전문 분야 뱃지 */}
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {specialties.map(s => (
                      <span key={s} className="text-[11px] bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                )}

                {/* 자격증 */}
                {certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {certifications.map((c, i) => (
                      <span key={i} className="text-[11px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">🎓 {c}</span>
                    ))}
                  </div>
                )}

                {/* 가능 날짜 요약 */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FiCalendar size={13} className="text-green-500" />
                    <span className="text-xs font-bold text-green-700">가능한 날짜</span>
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {helperAvailableDates.length > 0 ? `${helperAvailableDates.length}일 등록됨` : '미설정'}
                  </p>
                  {helperAvailableDates.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[...helperAvailableDates].sort().slice(0, 4).map(d => {
                        const date = new Date(d);
                        return (
                          <span key={d} className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-medium">
                            {date.getMonth() + 1}/{date.getDate()}
                          </span>
                        );
                      })}
                      {helperAvailableDates.length > 4 && (
                        <span className="text-[10px] text-green-500">+{helperAvailableDates.length - 4}개</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 소개 */}
                {profile.intro && (
                  <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl p-3">{profile.intro}</p>
                )}
              </div>
            </div>

            {/* 빠른 메뉴 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">빠른 메뉴</p>
              <Link href="/helper-schedule" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-sm text-gray-700">
                <FiCalendar className="text-blue-500" size={16} /> 예약 캘린더
              </Link>
              <Link href="/messages" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors text-sm text-gray-700">
                <FiMessageSquare className="text-purple-500" size={16} /> 1:1 채팅
              </Link>
              <Link href="/reset-password" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <FiLock className="text-gray-400" size={16} /> 비밀번호 변경
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-sm text-gray-500 hover:text-red-500">
                <FiLogOut size={16} /> 로그아웃
              </button>
            </div>
          </aside>

          {/* ── 오른쪽 메인 콘텐츠 ────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* 탭 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-1.5 flex gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-white text-blue-500' : 'bg-red-500 text-white'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── 탭 1: 프로필 편집 ─── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiSettings className="text-blue-500" /> 프로필 편집
                </h3>

                {/* 도우미 유형 */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">도우미 유형 <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HELPER_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => setHelperType(prev => prev === t ? '' : t)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          helperType === t ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 기본 정보 2열 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block flex items-center gap-1">
                      <FiMapPin size={11} className="text-blue-400" /> 활동 지역
                    </label>
                    <input value={profile.area} onChange={e => setProfile({ ...profile, area: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="예: 서울 강남구" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block flex items-center gap-1">
                      <FiDollarSign size={11} className="text-green-500" /> 희망 일당 (원)
                    </label>
                    <input value={profile.price} onChange={e => setProfile({ ...profile, price: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="예: 120,000" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block flex items-center gap-1">
                      <FiAward size={11} className="text-yellow-500" /> 경력 (년)
                    </label>
                    <input value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="예: 5" />
                  </div>
                </div>

                {/* 자기소개 */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">자기 소개</label>
                  <textarea value={profile.intro} onChange={e => setProfile({ ...profile, intro: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 text-sm bg-gray-50 focus:bg-white transition-colors resize-none"
                    rows={3} placeholder="산모님들께 소개글을 작성해주세요." />
                </div>

                {/* 전문 분야 + 자격증 2열 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 전문 분야 */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">전문 분야 (복수 선택)</label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTY_OPTIONS.map(s => (
                        <button key={s} type="button"
                          onClick={() => setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            specialties.includes(s) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                          }`}>
                          {specialties.includes(s) && <FiCheck size={10} />} {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 자격증 */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">보유 자격증</label>
                    <div className="flex gap-2 mb-2">
                      <input value={certInput} onChange={e => setCertInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (certInput.trim()) { setCertifications(prev => [...prev, certInput.trim()]); setCertInput(''); } } }}
                        placeholder="예: 산후조리사 1급"
                        className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300 bg-gray-50" />
                      <button type="button"
                        onClick={() => { if (certInput.trim()) { setCertifications(prev => [...prev, certInput.trim()]); setCertInput(''); } }}
                        className="bg-blue-500 text-white px-4 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors">추가</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((c, i) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                          🎓 {c}
                          <button type="button" onClick={() => setCertifications(prev => prev.filter((_, j) => j !== i))} className="text-blue-300 hover:text-red-400 ml-1">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <button onClick={handleUpdateProfile} disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-70 text-base">
                  {saving ? <><span className="animate-spin">⏳</span> 저장 중...</> : <><FiSave size={18} /> 프로필 저장하기</>}
                </button>
              </div>
            )}

            {/* ── 탭 2: 가능한 날짜 ─── */}
            {activeTab === 'calendar' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FiCalendar className="text-blue-500" /> 가능한 날짜 설정
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">클릭으로 가능한 날짜를 선택하거나 취소하세요 (최대 3개월 앞)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-500">{helperAvailableDates.length}</p>
                    <p className="text-xs text-gray-400">일 선택됨</p>
                  </div>
                </div>

                {/* 달력 2열 레이아웃 (PC에서) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AvailabilityCalendar
                    selectedDates={helperAvailableDates}
                    onToggle={toggleAvailableDate}
                  />

                  {/* 선택된 날짜 전체 목록 */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <FiCheck className="text-green-500" /> 선택된 날짜 목록
                    </h4>
                    {helperAvailableDates.length === 0 ? (
                      <div className="text-center py-12 text-gray-300">
                        <FiCalendar size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">선택된 날짜가 없습니다</p>
                        <p className="text-xs mt-1">달력에서 날짜를 클릭해 추가하세요</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {[...helperAvailableDates].sort().map(d => {
                          const date = new Date(d);
                          const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                          const wd = weekdays[date.getDay()];
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                          return (
                            <div key={d} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isWeekend ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                  {wd}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-700">
                                    {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
                                  </p>
                                </div>
                              </div>
                              <button onClick={() => toggleAvailableDate(d)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                                <FiX size={15} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {helperAvailableDates.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          💡 선택한 날짜는 자동 저장되며 산모님들에게 공개됩니다
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── 탭 3: 예약 현황 ─── */}
            {activeTab === 'reservations' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <FiPackage className="text-blue-500" /> 접수된 예약 현황
                </h3>

                {myReservations.length === 0 ? (
                  <div className="bg-gray-50 p-16 rounded-2xl text-center text-gray-400 border-2 border-dashed">
                    <FiCalendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">아직 예약 내역이 없어요.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReservations.map(rev => {
                      const st = STATUS_MAP[rev.status] || STATUS_MAP.pending;
                      return (
                        <div key={rev._id} className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <FiCalendar className="text-blue-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{rev.userEmail?.split('@')[0]} 산모님</p>
                              <p className="text-xs text-gray-500 mt-0.5">{rev.date}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-4 py-1.5 rounded-full font-bold ${st.color}`}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
