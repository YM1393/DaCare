'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { StoredUser, DiaperLog } from '@/types';

export default function DiaperPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [logs, setLogs] = useState<DiaperLog[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    fetchLogs(u.email);
  }, [router]);

  const fetchLogs = async (email: string) => {
    const res = await fetch(`/api/diaper/${encodeURIComponent(email)}`);
    const data = await res.json();
    setLogs(data);
  };

  const logDiaper = async (type: '소변' | '대변' | '혼합') => {
    if (!user || loading) return;
    setLoading(true);
    await fetch(`/api/diaper/${encodeURIComponent(user.email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, notes }),
    });
    setNotes('');
    await fetchLogs(user.email);
    setLoading(false);
  };

  const deleteLog = async (id: string) => {
    if (!user) return;
    await fetch(`/api/diaper/${encodeURIComponent(user.email)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setLogs(prev => prev.filter((l: DiaperLog) => l._id !== id));
  };

  const todayStr = new Date().toDateString();
  const todayLogs = logs.filter(l => new Date(l.createdAt ?? '').toDateString() === todayStr);
  const todayCounts = {
    소변: todayLogs.filter(l => l.type === '소변').length,
    대변: todayLogs.filter(l => l.type === '대변').length,
    혼합: todayLogs.filter(l => l.type === '혼합').length,
  };

  const formatTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const typeStyle: Record<string, string> = {
    소변: 'bg-yellow-100 text-yellow-700',
    대변: 'bg-amber-100 text-amber-800',
    혼합: 'bg-orange-100 text-orange-700',
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">기저귀 교체 기록 🍼</h1>
      <p className="text-gray-500 text-sm mb-6">버튼을 눌러 바로 기록하세요</p>

      {/* Today summary */}
      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-6 flex justify-around text-center">
        <div><p className="text-xs text-gray-500 mb-1">오늘 소변</p><p className="text-2xl font-bold text-yellow-500">{todayCounts.소변}<span className="text-sm font-normal text-gray-500">회</span></p></div>
        <div><p className="text-xs text-gray-500 mb-1">오늘 대변</p><p className="text-2xl font-bold text-amber-600">{todayCounts.대변}<span className="text-sm font-normal text-gray-500">회</span></p></div>
        <div><p className="text-xs text-gray-500 mb-1">오늘 혼합</p><p className="text-2xl font-bold text-orange-500">{todayCounts.혼합}<span className="text-sm font-normal text-gray-500">회</span></p></div>
      </div>

      {/* Log buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button onClick={() => logDiaper('소변')} disabled={loading}
          className="py-6 rounded-2xl font-bold text-lg bg-yellow-400 hover:bg-yellow-500 text-white shadow-md shadow-yellow-100 active:scale-95 transition-transform disabled:opacity-60">
          소변<br /><span className="text-sm font-normal">💛</span>
        </button>
        <button onClick={() => logDiaper('대변')} disabled={loading}
          className="py-6 rounded-2xl font-bold text-lg bg-amber-600 hover:bg-amber-700 text-white shadow-md active:scale-95 transition-transform disabled:opacity-60">
          대변<br /><span className="text-sm font-normal">🟫</span>
        </button>
        <button onClick={() => logDiaper('혼합')} disabled={loading}
          className="py-6 rounded-2xl font-bold text-lg bg-orange-400 hover:bg-orange-500 text-white shadow-md shadow-orange-100 active:scale-95 transition-transform disabled:opacity-60">
          혼합<br /><span className="text-sm font-normal">🧡</span>
        </button>
      </div>

      {/* Notes */}
      <input
        type="text"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="메모 (선택)"
        className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-8 focus:outline-none focus:border-pink-300"
      />

      {/* History */}
      <h2 className="font-bold text-gray-700 mb-3">최근 기록</h2>
      {logs.length === 0 ? (
        <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-sm">
          아직 기록이 없어요.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.slice(0, 20).map((log: DiaperLog) => (
            <div key={log._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeStyle[log.type ?? '']}`}>{log.type}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{formatDate(log.createdAt ?? '')} {formatTime(log.createdAt ?? '')}</p>
                  {log.notes && <p className="text-xs text-gray-400">{log.notes}</p>}
                </div>
              </div>
              <button onClick={() => deleteLog(log._id)} className="text-gray-300 hover:text-red-400 text-lg transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
