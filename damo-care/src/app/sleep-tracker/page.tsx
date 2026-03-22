'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { StoredUser, SleepRecord } from '@/types';

const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

const calcDuration = (start: string, end: string) => {
  if (!start || !end) return 0;
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  return Math.max(0, Math.round(diff));
};

export default function SleepTrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [form, setForm] = useState({ startTime: '', endTime: '', notes: '' });
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    fetch(`/api/sleep/${encodeURIComponent(u.email)}`).then(r => r.json()).then(setRecords);
  }, [router]);

  const handleTimeChange = (field: string, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    setDuration(calcDuration(updated.startTime, updated.endTime));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime || duration <= 0) return;
    if (!user) return;
    const res = await fetch(`/api/sleep/${encodeURIComponent(user.email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, duration }),
    });
    if (res.ok) {
      setForm({ startTime: '', endTime: '', notes: '' });
      setDuration(0);
      const data = await fetch(`/api/sleep/${encodeURIComponent(user.email)}`).then(r => r.json());
      setRecords(data);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/sleep/entry/${id}`, { method: 'DELETE' });
    setRecords(prev => prev.filter((r: SleepRecord) => r._id !== id));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => (r.startTime || '').startsWith(todayStr));
  const todayTotal = todayRecords.reduce((sum: number, r: SleepRecord) => sum + (r.duration || 0), 0);

  // Last 7 days bar chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const total = records
      .filter(r => (r.startTime || '').startsWith(dateStr))
      .reduce((s: number, r: SleepRecord) => s + (r.duration || 0), 0);
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, total };
  });
  const maxBar = Math.max(...last7.map(d => d.total), 60);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">아기 수면 패턴 😴</h1>

      {/* Summary */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex gap-6">
        <div className="text-center flex-1">
          <p className="text-xs text-gray-500 mb-1">오늘 총 수면</p>
          <p className="text-2xl font-bold text-indigo-600">{fmtDuration(todayTotal)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-gray-500 mb-1">낮잠 횟수</p>
          <p className="text-2xl font-bold text-indigo-500">{todayRecords.length}<span className="text-sm font-normal text-gray-500">회</span></p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
        <h2 className="font-bold text-gray-700 mb-4 text-sm">수면 기록 추가</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">시작 시간</label>
            <input type="datetime-local" value={form.startTime}
              onChange={e => handleTimeChange('startTime', e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-300" required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">종료 시간</label>
            <input type="datetime-local" value={form.endTime}
              onChange={e => handleTimeChange('endTime', e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-300" required />
          </div>
        </div>
        {duration > 0 && (
          <p className="text-sm text-indigo-600 font-bold mb-3">수면 시간: {fmtDuration(duration)}</p>
        )}
        <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="메모 (선택)" className="w-full p-2.5 border rounded-xl text-sm mb-3 focus:outline-none focus:border-indigo-300" />
        <button type="submit" className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 text-sm">
          저장하기
        </button>
      </form>

      {/* SVG Bar Chart */}
      {records.length >= 2 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-700 text-sm mb-3">최근 7일 수면량</h2>
          <svg width="100%" viewBox="0 0 420 160" className="overflow-visible">
            {last7.map((d, i) => {
              const barH = maxBar > 0 ? (d.total / maxBar) * 100 : 0;
              const x = 30 + i * 56;
              const y = 110 - barH;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={36} height={barH} rx={6} fill="#6366f1" opacity="0.8" />
                  <text x={x + 18} y={128} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.date}</text>
                  {d.total > 0 && (
                    <text x={x + 18} y={y - 4} textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="bold">
                      {Math.floor(d.total / 60)}h
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Records list */}
      <h2 className="font-bold text-gray-700 mb-3">수면 기록</h2>
      {records.length === 0 ? (
        <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-sm">
          아직 기록이 없어요.
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((rec: SleepRecord) => (
            <div key={rec._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div>
                <p className="font-bold text-indigo-600 text-sm">{fmtDuration(rec.duration || 0)}</p>
                <p className="text-xs text-gray-400">
                  {rec.startTime?.slice(0, 16).replace('T', ' ')} → {rec.endTime?.slice(11, 16)}
                </p>
                {rec.notes && <p className="text-xs text-gray-400">{rec.notes}</p>}
              </div>
              <button onClick={() => handleDelete(rec._id)} className="text-gray-300 hover:text-red-400 text-lg transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
