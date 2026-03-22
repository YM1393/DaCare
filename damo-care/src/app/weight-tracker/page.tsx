'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { StoredUser, WeightRecord } from '@/types';

const today = () => new Date().toISOString().split('T')[0];

export default function WeightTrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(today());

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    fetchRecords(u.email);
  }, [router]);

  const fetchRecords = async (email: string) => {
    const res = await fetch(`/api/weight/${encodeURIComponent(email)}`);
    setRecords(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    if (!user) return;
    await fetch(`/api/weight/${encodeURIComponent(user.email)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: parseFloat(weight), date }),
    });
    setWeight('');
    await fetchRecords(user.email);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/weight/entry/${id}`, { method: 'DELETE' });
    setRecords(prev => prev.filter((r: WeightRecord) => r._id !== id));
  };

  const first = records[0];
  const last = records[records.length - 1];
  const change = first && last && first._id !== last._id ? (last.weight - first.weight).toFixed(1) : null;
  const trend = change !== null ? (parseFloat(change) < 0 ? 'down' : parseFloat(change) > 0 ? 'up' : 'same') : null;

  const encouragement = () => {
    if (!trend) return '';
    if (trend === 'down') return '잘 하고 있어요! 꾸준히 회복 중이에요 💪';
    if (trend === 'same') return '변화가 없어요. 건강한 식사와 운동을 유지해보세요!';
    return '조금 늘었지만 괜찮아요. 산후 회복은 천천히 이루어져요 💗';
  };

  // SVG line chart
  const renderChart = () => {
    if (records.length < 2) return null;
    const svgW = 500, svgH = 200, padL = 45, padR = 20, padT = 20, padB = 40;
    const innerW = svgW - padL - padR, innerH = svgH - padT - padB;
    const weights = records.map(r => r.weight as number);
    const minW = Math.min(...weights), maxW = Math.max(...weights), wRange = maxW - minW || 1;
    const toX = (i: number) => padL + (i / (records.length - 1)) * innerW;
    const toY = (w: number) => padT + innerH - ((w - minW) / wRange) * innerH;
    const pathD = records.map((r, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(r.weight)}`).join(' ');
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-700 text-sm mb-3">체중 변화 추이</h2>
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
          {[0, 0.5, 1].map(t => { const y = padT + innerH * (1 - t); return (<g key={t}><line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f3f4f6" strokeWidth="1" /><text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{(minW + wRange * t).toFixed(1)}</text></g>); })}
          <path d={pathD} fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={`${pathD} L${toX(records.length - 1)},${padT + innerH} L${padL},${padT + innerH} Z`} fill="#fdf2f8" opacity="0.5" />
          {records.map((r, i) => (
            <g key={i}>
              <circle cx={toX(i)} cy={toY(r.weight)} r="4" fill="#ec4899" />
              <text x={toX(i)} y={padT + innerH + 16} textAnchor="middle" fontSize="8" fill="#9ca3af">{(r.date || '').slice(5)}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">체중 회복 트래커 ⚖️</h1>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">체중 (kg)</label>
            <input type="number" step="0.1" min="30" max="200" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="예: 58.5" className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" required />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">날짜</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
          </div>
        </div>
        <button type="submit" className="w-full mt-3 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 text-sm">
          기록하기
        </button>
      </form>

      {/* Summary */}
      {first && last && (
        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <div><p className="text-xs text-gray-500">첫 기록</p><p className="font-bold text-gray-700">{first.weight}kg <span className="text-xs text-gray-400">({first.date})</span></p></div>
            <div className="text-right"><p className="text-xs text-gray-500">최근 기록</p><p className="font-bold text-gray-700">{last.weight}kg <span className="text-xs text-gray-400">({last.date})</span></p></div>
          </div>
          {change !== null && (
            <p className={`text-sm font-bold ${parseFloat(change) < 0 ? 'text-green-600' : 'text-orange-500'}`}>
              변화량: {parseFloat(change) > 0 ? '+' : ''}{change}kg
            </p>
          )}
          {encouragement() && <p className="text-xs text-pink-500 mt-1">{encouragement()}</p>}
        </div>
      )}

      {renderChart()}

      {/* Records list */}
      <h2 className="font-bold text-gray-700 mb-3">기록 목록</h2>
      {records.length === 0 ? (
        <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-sm">
          아직 기록이 없어요.
        </div>
      ) : (
        <div className="space-y-2">
          {[...records].reverse().map((rec: WeightRecord) => (
            <div key={rec._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div>
                <p className="font-bold text-gray-700">{rec.weight}<span className="text-sm font-normal text-gray-500"> kg</span></p>
                <p className="text-xs text-gray-400">{rec.date}</p>
              </div>
              <button onClick={() => handleDelete(rec._id)} className="text-gray-300 hover:text-red-400 text-lg transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
