'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiStar, FiMapPin, FiChevronLeft, FiCamera, FiTrash2, FiCalendar, FiAward } from 'react-icons/fi';
import type { StoredUser, Helper, Review } from '@/types';

export default function HelperPortfolioPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [helper, setHelper] = useState<Helper | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isOwner = user && (user._id === id || user.id === id);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));

    fetch(`/api/helpers`)
      .then(r => r.json())
      .then(data => {
        const found = data.find((h: Helper) => h.id === id || h._id === id);
        if (found) {
          setHelper(found);
          setPortfolioImages(found.portfolioImages || []);
        }
      });

    fetch(`/api/reviews/${id}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []));
  }, [id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { alert('5MB 이하 이미지를 선택해주세요.'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const newImages = [...portfolioImages, base64];
      await fetch('/api/helpers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, portfolioImages: newImages }),
      });
      setPortfolioImages(newImages);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteImage = async (idx: number) => {
    if (!confirm('이 사진을 삭제할까요?') || !user) return;
    const newImages = portfolioImages.filter((_, i) => i !== idx);
    await fetch('/api/helpers/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, portfolioImages: newImages }),
    });
    setPortfolioImages(newImages);
    if (lightbox === portfolioImages[idx]) setLightbox(null);
  };

  if (!helper) return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-pink-300 border-t-pink-500 rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-400 hover:text-pink-500 mb-6 transition-colors text-sm">
          <FiChevronLeft size={18} /> 돌아가기
        </button>

        {/* 프로필 카드 */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-pink-100 dark:border-gray-700 overflow-hidden mb-5">
          <div className="h-24 bg-gradient-to-r from-pink-400 to-rose-400" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 shadow-md overflow-hidden bg-pink-100 flex-shrink-0">
                {helper.profileImage ? (
                  <img src={helper.profileImage} alt={helper.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">👩</div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{helper.name}</h1>
                {helper.helperType && (
                  <span className="text-xs bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 px-2.5 py-0.5 rounded-full font-medium">
                    {helper.helperType}
                  </span>
                )}
              </div>
              {avgRating && (
                <div className="ml-auto flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-700">
                  <FiStar className="text-yellow-400 fill-yellow-400" size={15} />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{avgRating}</span>
                  <span className="text-xs text-gray-400">({reviews.length})</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              {helper.area && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiMapPin size={14} className="text-pink-400" /> {helper.area}
                </div>
              )}
              {helper.experience && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiCalendar size={14} className="text-pink-400" /> 경력 {helper.experience}년
                </div>
              )}
              {helper.price && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                  💰 시간당 {helper.price}원
                </div>
              )}
            </div>

            {helper.intro && (
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-pink-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">{helper.intro}</p>
            )}

            {/* 자격증 */}
            {(helper.certifications?.length ?? 0) > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiAward size={12} /> 자격증
                </p>
                <div className="flex flex-wrap gap-2">
                  {helper.certifications!.map((c, i) => (
                    <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-700">
                      🏅 {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 특기 */}
            {(helper.specialties?.length ?? 0) > 0 && (
              <div className="mt-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">특기</p>
                <div className="flex flex-wrap gap-2">
                  {helper.specialties!.map((s, i) => (
                    <span key={i} className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-2.5 py-1 rounded-full border border-green-100 dark:border-green-700">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 포트폴리오 사진 */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-pink-100 dark:border-gray-700 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">📷 포트폴리오</h2>
            {isOwner && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-sm bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <FiCamera size={13} /> {uploading ? '업로드 중...' : '사진 추가'}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

          {portfolioImages.length === 0 ? (
            <div className="text-center py-10 text-gray-300 dark:text-gray-600">
              <div className="text-4xl mb-2">📂</div>
              <p className="text-sm">{isOwner ? '사진을 추가해 포트폴리오를 완성해보세요' : '등록된 포트폴리오 사진이 없습니다'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {portfolioImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer" onClick={() => setLightbox(img)}>
                  <img src={img} alt="포트폴리오" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  {isOwner && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteImage(i); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center"
                    >
                      <FiTrash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 리뷰 */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-pink-100 dark:border-gray-700 p-5">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">
            ⭐ 이용 후기 <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>
          </h2>
          {reviews.length === 0 ? (
            <p className="text-center text-gray-300 dark:text-gray-600 text-sm py-6">아직 리뷰가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-pink-100 dark:bg-pink-900/40 rounded-full flex items-center justify-center text-xs">👤</div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{r.user}</span>
                    <div className="flex ml-auto">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <FiStar key={si} size={12} className={si < (r.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
                  {r.date && <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{r.date}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="포트폴리오" className="max-w-full max-h-[85vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center">✕</button>
        </div>
      )}
    </div>
  );
}
