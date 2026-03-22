'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiTrendingUp, FiCamera } from 'react-icons/fi';
import type { StoredUser, GrowthRecord, GrowthPhoto } from '@/types';

const today = () => new Date().toISOString().split('T')[0];

export default function GrowthPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [tab, setTab] = useState<'기록' | '사진 앨범'>('기록');
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [photos, setPhotos] = useState<GrowthPhoto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ date: today(), babyName: '', weight: '', height: '', headCircumference: '', notes: '' });

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    fetchRecords(u.email);
    fetchPhotos(u.email);
  }, [router]);

  const fetchRecords = async (email: string) => {
    const res = await fetch(`/api/growth/${encodeURIComponent(email)}`);
    setRecords(await res.json());
  };

  const fetchPhotos = async (email: string) => {
    const res = await fetch(`/api/growth/photo?email=${encodeURIComponent(email)}`);
    setPhotos(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const body = {
      date: form.date, babyName: form.babyName || '아기',
      weight: form.weight ? parseFloat(form.weight) : undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      headCircumference: form.headCircumference ? parseFloat(form.headCircumference) : undefined,
      notes: form.notes,
    };
    const res = await fetch(`/api/growth/${encodeURIComponent(user.email)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ date: today(), babyName: '', weight: '', height: '', headCircumference: '', notes: '' });
      fetchRecords(user.email);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    if (!user) return;
    await fetch(`/api/growth/entry/${id}`, { method: 'DELETE' });
    fetchRecords(user.email);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) { alert('2MB 이하 이미지만 가능합니다.'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      await fetch('/api/growth/photo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, imageBase64: reader.result, date: today() }),
      });
      await fetchPhotos(user.email);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePhoto = async (id: string) => {
    await fetch('/api/growth/photo', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    setPhotos(prev => prev.filter((p: GrowthPhoto) => p._id !== id));
  };

  const latest = records[records.length - 1];
  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiTrendingUp className="text-pink-500" /> 신생아 성장 트래커
          </h1>
          <p className="text-gray-500 mt-1 text-sm">아기의 성장 기록을 관리하세요.</p>
        </div>
        {tab === '기록' && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-full font-bold hover:bg-pink-600 transition-colors shadow-md shadow-pink-100">
            <FiPlus /> 기록 추가
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1">
        {(['기록', '사진 앨범'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === t ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === '사진 앨범' ? '📷 사진 앨범' : '📈 기록'}
          </button>
        ))}
      </div>

      {tab === '기록' && (
        <>
          {latest && (
            <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-3xl p-6 mb-8 shadow-xl shadow-pink-100">
              <p className="text-sm opacity-80 mb-1">최근 기록 · {latest.date}</p>
              <h2 className="text-xl font-bold mb-4">{latest.babyName}의 성장 현황</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-2xl p-3 text-center"><p className="text-xs opacity-80">몸무게</p><p className="text-xl font-bold">{latest.weight ?? '—'}<span className="text-sm ml-0.5">kg</span></p></div>
                <div className="bg-white/20 rounded-2xl p-3 text-center"><p className="text-xs opacity-80">키</p><p className="text-xl font-bold">{latest.height ?? '—'}<span className="text-sm ml-0.5">cm</span></p></div>
                <div className="bg-white/20 rounded-2xl p-3 text-center"><p className="text-xs opacity-80">두위</p><p className="text-xl font-bold">{latest.headCircumference ?? '—'}<span className="text-sm ml-0.5">cm</span></p></div>
              </div>
            </div>
          )}

          {records.length >= 2 && (() => {
            const chartData = records.filter(r => r.weight != null).slice(-10);
            if (chartData.length < 2) return null;
            const svgW = 500, svgH = 200, padL = 40, padR = 20, padT = 20, padB = 40;
            const innerW = svgW - padL - padR, innerH = svgH - padT - padB;
            const weights = chartData.map(r => r.weight as number);
            const minW = Math.min(...weights), maxW = Math.max(...weights), wRange = maxW - minW || 1;
            const toX = (i: number) => padL + (i / (chartData.length - 1)) * innerW;
            const toY = (w: number) => padT + innerH - ((w - minW) / wRange) * innerH;
            const pathD = chartData.map((r, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(r.weight ?? 0)}`).join(' ');
            return (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8 overflow-hidden">
                <h2 className="font-bold text-gray-700 text-sm mb-3">몸무게 변화 추이</h2>
                <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
                  {[0, 0.25, 0.5, 0.75, 1].map(t => { const y = padT + innerH * (1 - t); return (<g key={t}><line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f3f4f6" strokeWidth="1" /><text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{(minW + wRange * t).toFixed(2)}</text></g>); })}
                  <path d={pathD} fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  <path d={`${pathD} L${toX(chartData.length - 1)},${padT + innerH} L${padL},${padT + innerH} Z`} fill="#fdf2f8" opacity="0.5" />
                  {chartData.map((r, i) => (<g key={i}><circle cx={toX(i)} cy={toY(r.weight ?? 0)} r="4" fill="#ec4899" /><text x={toX(i)} y={padT + innerH + 16} textAnchor="middle" fontSize="8" fill="#9ca3af">{(r.date || '').slice(5)}</text></g>))}
                </svg>
              </div>
            );
          })()}

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-pink-50 p-8 mb-8">
              <h2 className="font-bold text-lg text-gray-800 mb-6">성장 기록 입력</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">날짜</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" required /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">아기 이름 (선택)</label><input type="text" value={form.babyName} onChange={e => setForm({ ...form, babyName: e.target.value })} placeholder="우리 아기" className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">몸무게 (kg)</label><input type="number" step="0.01" min="0" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="3.5" className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">키 (cm)</label><input type="number" step="0.1" min="0" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} placeholder="50.5" className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">두위 (cm)</label><input type="number" step="0.1" min="0" value={form.headCircumference} onChange={e => setForm({ ...form, headCircumference: e.target.value })} placeholder="34.0" className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" /></div>
              </div>
              <div className="mb-6"><label className="text-xs font-bold text-gray-500 mb-1 block">메모 (선택)</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="특이 사항" className="w-full p-3 border rounded-xl text-sm resize-none h-20 focus:outline-none focus:border-pink-300" /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm text-gray-500 hover:bg-gray-50">취소</button>
                <button type="submit" className="flex-1 py-3 bg-pink-500 text-white rounded-2xl text-sm font-bold hover:bg-pink-600">저장하기</button>
              </div>
            </form>
          )}

          {records.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-pink-50 text-pink-700">
                    <tr>
                      <th className="p-4 text-left font-bold">날짜</th>
                      <th className="p-4 text-center font-bold">몸무게</th>
                      <th className="p-4 text-center font-bold">키</th>
                      <th className="p-4 text-center font-bold">두위</th>
                      <th className="p-4 text-center font-bold">메모</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...records].reverse().map((rec: GrowthRecord) => (
                      <tr key={rec._id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">{rec.date}</td>
                        <td className="p-4 text-center text-gray-600">{rec.weight ? `${rec.weight}kg` : '—'}</td>
                        <td className="p-4 text-center text-gray-600">{rec.height ? `${rec.height}cm` : '—'}</td>
                        <td className="p-4 text-center text-gray-600">{rec.headCircumference ? `${rec.headCircumference}cm` : '—'}</td>
                        <td className="p-4 text-center text-gray-500 text-xs max-w-[120px] truncate">{rec.notes || '—'}</td>
                        <td className="p-4 text-center"><button onClick={() => handleDelete(rec._id)} className="text-gray-300 hover:text-red-400 transition-colors"><FiTrash2 size={15} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !showForm && (
            <div className="bg-gray-50 rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
              <FiTrendingUp className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">아직 기록된 성장 데이터가 없어요.</p>
            </div>
          )}
        </>
      )}

      {tab === '사진 앨범' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">아기 사진을 업로드하세요</p>
            <label className={`flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-pink-600 ${uploading ? 'opacity-60' : ''}`}>
              <FiCamera size={14} /> {uploading ? '업로드 중...' : '사진 추가'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
          {photos.length === 0 ? (
            <div className="text-center text-gray-400 py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <FiCamera className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-sm">아직 사진이 없어요. 첫 사진을 추가해보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((photo: GrowthPhoto) => (
                <div key={photo._id} className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                  <img src={photo.imageBase64} alt="아기 사진" className="w-full aspect-square object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs p-2 flex justify-between items-center">
                    <span>{photo.date}</span>
                    <button onClick={() => handleDeletePhoto(photo._id)}
                      className="text-white hover:text-red-300 transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
