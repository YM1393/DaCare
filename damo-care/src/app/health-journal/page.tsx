'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiHeart, FiPlus, FiTrash2, FiDroplet, FiMoon, FiSmile } from 'react-icons/fi';
import type { StoredUser, HealthEntry } from '@/types';

const MOODS = ['😞', '😔', '😐', '🙂', '😊'];
const SYMPTOM_LIST = ['두통', '피로감', '부종', '요통', '유방통', '산후통', '우울감', '불안감', '수면 장애', '식욕 부진'];

const today = () => new Date().toISOString().split('T')[0];

export default function HealthJournalPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    mood: 3,
    sleep: 0,
    water: 0,
    symptoms: [] as string[],
    notes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    fetchEntries(u.email);
  }, [router]);

  const fetchEntries = async (email: string) => {
    const res = await fetch(`/api/health-journal/${encodeURIComponent(email)}`);
    const data = await res.json();
    setEntries(data);
  };

  const toggleSymptom = (s: string) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter(x => x !== s)
        : [...prev.symptoms, s],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const res = await fetch(`/api/health-journal/${encodeURIComponent(user.email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ date: today(), mood: 3, sleep: 0, water: 0, symptoms: [], notes: '' });
      fetchEntries(user?.email ?? '');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 일지를 삭제하시겠습니까?')) return;
    await fetch(`/api/health-journal/entry/${id}`, { method: 'DELETE' });
    fetchEntries(user?.email ?? '');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiHeart className="text-pink-500" /> 산후 건강 일지
          </h1>
          <p className="text-gray-500 mt-1 text-sm">매일의 건강 상태를 기록해보세요.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-full font-bold hover:bg-pink-600 transition-colors shadow-md shadow-pink-100"
        >
          <FiPlus /> 기록 추가
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-pink-50 p-8 mb-8">
          <h2 className="font-bold text-lg text-gray-800 mb-6">오늘의 건강 기록</h2>

          <div className="mb-5">
            <label className="text-xs font-bold text-gray-500 mb-2 block">날짜</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
          </div>

          <div className="mb-5">
            <label className="text-xs font-bold text-gray-500 mb-2 block">오늘 기분</label>
            <div className="flex gap-3">
              {MOODS.map((emoji, i) => (
                <button type="button" key={i}
                  onClick={() => setForm({ ...form, mood: i + 1 })}
                  className={`text-3xl p-2 rounded-xl transition-all ${form.mood === i + 1 ? 'bg-pink-100 scale-110' : 'opacity-50 hover:opacity-80'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                <FiMoon className="text-indigo-400" /> 수면 시간 (시간)
              </label>
              <input type="number" min={0} max={24} step={0.5} value={form.sleep}
                onChange={e => setForm({ ...form, sleep: parseFloat(e.target.value) })}
                className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                <FiDroplet className="text-blue-400" /> 수분 섭취 (잔)
              </label>
              <input type="number" min={0} max={20} value={form.water}
                onChange={e => setForm({ ...form, water: parseInt(e.target.value) })}
                className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-bold text-gray-500 mb-2 block">증상 (해당하는 것 선택)</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_LIST.map(s => (
                <button type="button" key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    form.symptoms.includes(s)
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold text-gray-500 mb-2 block">메모</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="오늘 느낀 점이나 특이 사항을 기록하세요."
              className="w-full p-3 border rounded-xl text-sm resize-none h-24 focus:outline-none focus:border-pink-300" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm text-gray-500 hover:bg-gray-50">
              취소
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-pink-500 text-white rounded-2xl text-sm font-bold hover:bg-pink-600">
              저장하기
            </button>
          </div>
        </form>
      )}

      {/* SVG Mini Charts */}
      {entries.length >= 2 && (() => {
        const last7 = [...entries].slice(0, 7).reverse();
        const chartW = 120;
        const chartH = 60;
        const barW = Math.floor(chartW / last7.length) - 2;

        const moodMax = 5;
        const sleepMax = Math.max(...last7.map(e => e.sleep || 0), 12);
        const waterMax = Math.max(...last7.map(e => e.water || 0), 8);

        const MiniChart = ({
          data, max, color, label
        }: { data: number[]; max: number; color: string; label: string }) => (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 mb-2 text-center">{label}</p>
            <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 16}`} className="overflow-visible">
              {data.map((val, i) => {
                const barH = max > 0 ? Math.max(2, (val / max) * chartH) : 2;
                const x = i * (barW + 2) + 2;
                const y = chartH - barH;
                const dateStr = last7[i]?.date?.slice(-2) || '';
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={barW} height={barH} rx="2" fill={color} opacity="0.85" />
                    <text x={x + barW / 2} y={chartH + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">{dateStr}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        );

        return (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
            <h2 className="font-bold text-gray-800 mb-4 text-sm">최근 7일 건강 현황</h2>
            <div className="flex gap-4">
              <MiniChart
                data={last7.map(e => e.mood || 0)}
                max={moodMax}
                color="#f472b6"
                label="기분"
              />
              <MiniChart
                data={last7.map(e => e.sleep || 0)}
                max={sleepMax}
                color="#818cf8"
                label="수면(h)"
              />
              <MiniChart
                data={last7.map(e => e.water || 0)}
                max={waterMax}
                color="#60a5fa"
                label="수분(잔)"
              />
            </div>
          </div>
        );
      })()}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
            <FiSmile className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">아직 기록된 건강 일지가 없어요.</p>
            <p className="text-gray-300 text-xs mt-1">위의 &apos;기록 추가&apos; 버튼을 눌러 시작하세요.</p>
          </div>
        ) : (
          entries.map((entry: HealthEntry) => (
            <div key={entry._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{MOODS[(entry.mood ?? 3) - 1]}</span>
                  <div>
                    <p className="font-bold text-gray-800">{entry.date}</p>
                    <p className="text-xs text-gray-400">기분 {entry.mood ?? 3}/5</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(entry._id)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1">
                  <FiTrash2 size={16} />
                </button>
              </div>
              <div className="flex gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1"><FiMoon className="text-indigo-400" /> {entry.sleep}시간 수면</span>
                <span className="flex items-center gap-1"><FiDroplet className="text-blue-400" /> {entry.water}잔 수분</span>
              </div>
              {(entry.symptoms?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {entry.symptoms?.map((s: string) => (
                    <span key={s} className="text-xs px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full">{s}</span>
                  ))}
                </div>
              )}
              {entry.notes && <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl italic">"{entry.notes}"</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
