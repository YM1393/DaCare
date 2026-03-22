'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiMapPin, FiStar, FiFilter, FiHeart, FiSearch, FiX, FiZap } from 'react-icons/fi';
import CalendarModal from '@/components/CalendarModal';
import { StoredUser, Helper, Favorite } from '@/types';

const AREAS = ['전체 지역', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '제주'];
const HELPER_TYPES = ['전체', '산후도우미', '산후조리도우미', '신생아전문 도우미', '가사도우미', '청소도우미', '베이비시터', '요리전문 도우미', '산모케어 전문', '마사지사'];
const TYPE_COLORS: Record<string, string> = {
  '산후도우미': 'bg-pink-100 text-pink-700',
  '산후조리도우미': 'bg-rose-100 text-rose-700',
  '신생아전문 도우미': 'bg-blue-100 text-blue-700',
  '가사도우미': 'bg-green-100 text-green-700',
  '청소도우미': 'bg-teal-100 text-teal-700',
  '베이비시터': 'bg-purple-100 text-purple-700',
  '요리전문 도우미': 'bg-orange-100 text-orange-700',
  '산모케어 전문': 'bg-red-100 text-red-700',
  '마사지사': 'bg-amber-100 text-amber-700',
};
const AREA_EMOJIS: Record<string, string> = {
  '서울': '🏙️', '경기': '🌿', '인천': '✈️', '부산': '🌊', '대구': '🌸',
  '대전': '🔬', '광주': '🎨', '울산': '🏭', '제주': '🌺',
};
const SORT_OPTIONS = [
  { value: '', label: '기본 정렬' },
  { value: 'rating', label: '평점 높은순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
  { value: 'experience', label: '경력 많은순' },
];

export default function PostpartumPage() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [area, setArea] = useState('');
  const [sort, setSort] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);

  // 검색 자동완성
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Helper[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CalendarModal
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState<{ id: string; name: string } | null>(null);

  // View mode: 'list' | 'region'
  const [viewMode, setViewMode] = useState<'list' | 'region'>('list');
  const [selectedType, setSelectedType] = useState('');

  // AI Matching
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchArea, setMatchArea] = useState('');
  const [matchMaxPrice, setMatchMaxPrice] = useState(200000);
  const [matchMinExp, setMatchMinExp] = useState(0);
  const [matchResults, setMatchResults] = useState<Helper[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  const router = useRouter();

  const fetchHelpers = async (selectedArea = '', selectedSort = '', type = '') => {
    const params = new URLSearchParams();
    if (selectedArea) params.set('area', selectedArea);
    if (selectedSort) params.set('sort', selectedSort);
    if (type) params.set('type', type);
    const res = await fetch(`/api/helpers?${params.toString()}`);
    const data = await res.json();
    setHelpers(data);
  };

  const fetchFavorites = async (email: string) => {
    const res = await fetch(`/api/favorites/${encodeURIComponent(email)}`);
    const data = await res.json();
    setFavorites(data.map((f: Favorite) => f.helperId));
  };

  useEffect(() => {
    fetchHelpers();
    const saved = localStorage.getItem('user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      if (u.role === 'mother') fetchFavorites(u.email);
    }
  }, []);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 검색어 디바운스
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/helpers/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    }, 250);
  };

  const handleSuggestionClick = (id: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(`/postpartum/${id}`);
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setArea(val);
    fetchHelpers(val, sort, selectedType);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSort(val);
    fetchHelpers(area, val, selectedType);
  };

  const handleTypeSelect = (t: string) => {
    const newType = t === '전체' ? '' : t;
    setSelectedType(newType);
    fetchHelpers(area, sort, newType);
  };

  const openCalendar = (helper: Helper) => {
    if (!user) { alert('로그인 후 이용 가능합니다.'); return; }
    setSelectedHelper({ id: helper.id, name: helper.name || '' });
    setShowCalendar(true);
  };

  const handleReserve = async (date: string) => {
    if (!user || !selectedHelper) return;
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: user.email,
        helperName: selectedHelper.name,
        helperId: selectedHelper.id,
        date,
      }),
    });
    setShowCalendar(false);
    if (res.ok) {
      alert(`${selectedHelper.name} 도우미님 ${date} 예약이 접수되었습니다!`);
      // 브라우저 푸시 알림
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('예약 접수 완료!', { body: `${selectedHelper.name} 도우미님 ${date} 예약이 접수되었습니다.`, icon: '/favicon.ico' });
      }
    } else {
      alert('예약에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleMatchSubmit = async () => {
    setMatchLoading(true);
    const params = new URLSearchParams();
    if (matchArea) params.set('area', matchArea);
    params.set('maxPrice', matchMaxPrice.toString());
    params.set('minExperience', matchMinExp.toString());
    const res = await fetch(`/api/helpers/match?${params.toString()}`);
    const data = await res.json();
    setMatchResults(data);
    setMatchLoading(false);
  };

  const toggleFavorite = async (helper: Helper) => {
    if (!user) { alert('로그인 후 이용 가능합니다.'); return; }
    const isFav = favorites.includes(helper.id);
    if (isFav) {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motherEmail: user.email, helperId: helper.id }),
      });
      setFavorites(prev => prev.filter(id => id !== helper.id));
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motherEmail: user.email, helperId: helper.id, helperName: helper.name }),
      });
      setFavorites(prev => [...prev, helper.id]);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">산후도우미 찾기</h1>
          <p className="text-gray-500 mt-2">전문 교육을 이수한 베테랑 도우미를 만나보세요.</p>
        </div>
      </div>

      {/* 검색 + 필터 바 */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        {/* 검색 자동완성 */}
        <div ref={searchRef} className="relative flex-1 min-w-[200px]">
          <div className="flex items-center bg-white rounded-xl shadow-sm border px-3 py-2 gap-2">
            <FiSearch className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="이름 또는 지역으로 검색..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="outline-none text-sm flex-1 bg-transparent"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}>
                <FiX size={14} className="text-gray-300" />
              </button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-xl rounded-2xl mt-1 z-30 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center shrink-0">
                    {s.profileImage
                      ? <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
                      : <span className="text-sm">👤</span>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.area}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border">
          <FiFilter className="ml-2 text-gray-400 mr-1" />
          <select className="outline-none p-2 bg-transparent text-sm" value={area} onChange={handleAreaChange}>
            {AREAS.map(a => (
              <option key={a} value={a === '전체 지역' ? '' : a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border">
          <select className="outline-none p-2 bg-transparent text-sm" value={sort} onChange={handleSortChange}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setShowMatchModal(true); setMatchResults([]); }}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-pink-100 transition-all"
        >
          <FiZap size={16} /> AI 맞춤 추천
        </button>
        {/* View mode toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
          >
            목록
          </button>
          <button
            onClick={() => setViewMode('region')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'region' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
          >
            지역별
          </button>
        </div>
      </div>

      {/* 도우미 유형 필터 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {HELPER_TYPES.map(t => {
          const isActive = t === '전체' ? !selectedType : selectedType === t;
          return (
            <button
              key={t}
              onClick={() => handleTypeSelect(t)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                isActive
                  ? 'bg-pink-500 text-white border-pink-500 shadow-sm shadow-pink-100'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Region View */}
      {viewMode === 'region' && (
        <div className="mb-8">
          <p className="text-gray-500 text-sm mb-5">지역을 선택하면 해당 지역 도우미만 보여드려요.</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {AREAS.slice(1).map(regionName => {
              const count = helpers.filter((h: Helper) => h.area?.includes(regionName)).length;
              const isSelected = area === regionName;
              return (
                <button
                  key={regionName}
                  onClick={() => {
                    const newArea = isSelected ? '' : regionName;
                    setArea(newArea);
                    fetchHelpers(newArea, sort);
                    setViewMode('list');
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-pink-400 bg-pink-50 shadow-md shadow-pink-100'
                      : 'border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm'
                  }`}
                >
                  <span className="text-2xl">{AREA_EMOJIS[regionName] || '📍'}</span>
                  <p className="font-bold text-sm text-gray-800">{regionName}</p>
                  <p className="text-xs text-gray-400">{count}명</p>
                </button>
              );
            })}
          </div>
          {area && (
            <div className="mt-4 flex items-center gap-2">
              <span className="bg-pink-100 text-pink-600 text-sm font-bold px-3 py-1.5 rounded-full">
                {area} 선택됨
              </span>
              <button
                onClick={() => { setArea(''); fetchHelpers('', sort); }}
                className="text-gray-400 hover:text-red-400 text-sm transition-colors"
              >
                ✕ 초기화
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {helpers.map((helper: Helper) => (
          <div key={helper.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="h-48 bg-pink-100 flex items-center justify-center relative overflow-hidden">
              {helper.profileImage
                ? <img src={helper.profileImage} alt={helper.name} className="w-full h-full object-cover" />
                : <span className="text-pink-300 text-5xl">👤</span>
              }
              {user?.role === 'mother' && (
                <button
                  onClick={() => toggleFavorite(helper)}
                  className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <FiHeart size={18} className={favorites.includes(helper.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {helper.helperType && (
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${TYPE_COLORS[helper.helperType] || 'bg-gray-100 text-gray-600'}`}>
                      {helper.helperType}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-800">{helper.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <FiMapPin className="mr-1" /> {helper.area}
                  </p>
                </div>
                <div className="flex items-center text-yellow-500 font-bold">
                  <FiStar className="mr-1" /> {helper.rating}
                  {(helper.reviewCount ?? 0) > 0 && (
                    <span className="text-gray-300 font-normal text-xs ml-1">({helper.reviewCount})</span>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p>✔️ 경력: {helper.experience}년</p>
                <p>✔️ 특징: 모유수유 전문가, 산모 식단 특화</p>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-lg font-bold text-pink-600">
                  ₩{helper.price} <small className="text-gray-400 font-normal">/ 일</small>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/postpartum/${helper.id}`)}
                    className="flex-1 bg-white text-pink-500 border border-pink-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-50 transition-colors"
                  >
                    상세 보기
                  </button>
                  <button
                    onClick={() => openCalendar(helper)}
                    className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-600 transition-colors"
                  >
                    예약하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {helpers.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">해당 지역의 도우미가 없습니다.</p>
          <p className="text-sm mt-2">다른 지역을 선택해보세요.</p>
        </div>
      )}

      {showCalendar && selectedHelper && (
        <CalendarModal
          helperName={selectedHelper.name}
          helperId={selectedHelper.id}
          onClose={() => setShowCalendar(false)}
          onConfirm={handleReserve}
        />
      )}

      {/* AI Matching Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiZap className="text-pink-500" /> AI 맞춤 도우미 추천
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">조건을 입력하면 최적의 도우미를 찾아드려요</p>
              </div>
              <button onClick={() => setShowMatchModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiX size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">지역</label>
                <select
                  value={matchArea}
                  onChange={e => setMatchArea(e.target.value)}
                  className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300"
                >
                  {AREAS.map(a => (
                    <option key={a} value={a === '전체 지역' ? '' : a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">
                  최대 일당: <span className="text-pink-500">₩{matchMaxPrice.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={50000} max={300000} step={10000}
                  value={matchMaxPrice}
                  onChange={e => setMatchMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>₩50,000</span><span>₩300,000</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">
                  최소 경력: <span className="text-pink-500">{matchMinExp}년 이상</span>
                </label>
                <input
                  type="range"
                  min={0} max={10} step={1}
                  value={matchMinExp}
                  onChange={e => setMatchMinExp(parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>0년</span><span>10년</span>
                </div>
              </div>

              <button
                onClick={handleMatchSubmit}
                disabled={matchLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {matchLoading ? '분석 중...' : '추천 받기'}
              </button>

              {matchResults.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-gray-700 text-sm">추천 도우미 TOP {matchResults.length}</h3>
                  {matchResults.map((h, idx) => (
                    <div key={h.id} className="bg-pink-50 border border-pink-100 rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center text-lg shrink-0 overflow-hidden">
                            {h.profileImage
                              ? <img src={h.profileImage} alt={h.name} className="w-full h-full object-cover" />
                              : <span>👤</span>
                            }
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{h.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <FiMapPin size={10} /> {h.area}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                            <FiStar size={10} /> {h.rating}
                          </div>
                          <p className="text-xs text-pink-500 font-bold">₩{h.price?.toLocaleString()}/일</p>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>매칭 점수</span>
                          <span className="font-bold text-pink-500">{h.score}점</span>
                        </div>
                        <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all"
                            style={{ width: `${Math.min(100, ((h.score ?? 0) / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowMatchModal(false); router.push(`/postpartum/${h.id}`); }}
                        className="w-full text-center text-pink-500 border border-pink-300 py-2 rounded-xl text-xs font-bold hover:bg-pink-100 transition-colors"
                      >
                        상세보기
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {matchResults.length === 0 && !matchLoading && matchResults !== null && (
                <p className="text-center text-gray-300 text-xs py-2">조건에 맞는 도우미가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
