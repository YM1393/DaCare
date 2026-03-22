'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiCamera, FiTrash2, FiX, FiChevronLeft, FiCalendar } from 'react-icons/fi';
import type { StoredUser, GrowthPhoto } from '@/types';

export default function BabyAlbumPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [photos, setPhotos] = useState<GrowthPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<GrowthPhoto | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    fetchPhotos(u.email);
  }, [router]);

  const fetchPhotos = (email: string) => {
    setLoading(true);
    fetch(`/api/growth/photo?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => { setPhotos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { alert('5MB 이하 이미지를 선택해주세요.'); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      await fetch('/api/growth/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, imageBase64: base64, date: selectedDate }),
      });
      fetchPhotos(user.email);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 사진을 삭제할까요?')) return;
    await fetch('/api/growth/photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPhotos(prev => prev.filter(p => p._id !== id));
    if (lightbox && lightbox._id === id) setLightbox(null);
  };

  // 날짜별 그룹화
  const grouped: Record<string, GrowthPhoto[]> = {};
  photos.forEach(p => {
    const key = p.date || '날짜 없음';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatDate = (d: string) => {
    if (!d || d === '날짜 없음') return d;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  };

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-pink-500 transition-colors">
            <FiChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">📸 아기 성장 앨범</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{photos.length}장의 추억</p>
          </div>
        </div>

        {/* 업로드 영역 */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-pink-100 dark:border-gray-700 shadow-sm p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 촬영 날짜</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-pink-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1">
              <FiCalendar className="text-pink-400" size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none flex-1"
              />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <FiCamera size={16} />
              {uploading ? '업로드 중...' : '사진 추가'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* 사진 목록 */}
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍼</div>
            <p className="text-gray-400 dark:text-gray-500 font-medium">아직 사진이 없어요</p>
            <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">아기의 소중한 순간을 기록해보세요</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <p className="text-sm font-bold text-pink-500 mb-3 flex items-center gap-1.5">
                  <FiCalendar size={13} />
                  {formatDate(date)}
                  <span className="text-gray-400 font-normal">({grouped[date].length}장)</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {grouped[date].map(photo => (
                    <div
                      key={photo._id}
                      className="relative aspect-square cursor-pointer group rounded-2xl overflow-hidden shadow-sm"
                      onClick={() => setLightbox(photo)}
                    >
                      <img
                        src={photo.imageBase64}
                        alt="아기 사진"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(photo._id!); }}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow-md"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center"
          >
            <FiX size={20} />
          </button>
          <img
            src={lightbox.imageBase64}
            alt="아기 사진"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-white/80 text-sm">{formatDate(lightbox.date ?? '')}</p>
            <button
              onClick={e => { e.stopPropagation(); handleDelete(lightbox._id!); }}
              className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mx-auto"
            >
              <FiTrash2 size={13} /> 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
