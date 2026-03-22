'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { StoredUser, EmotionLog } from '@/types';

const MOODS = [
  { val: 1, emoji: '😭', label: '매우 힘들어요', color: 'bg-red-100 border-red-300 text-red-600' },
  { val: 2, emoji: '😢', label: '힘들어요', color: 'bg-orange-100 border-orange-300 text-orange-600' },
  { val: 3, emoji: '😐', label: '보통이에요', color: 'bg-yellow-100 border-yellow-300 text-yellow-600' },
  { val: 4, emoji: '🙂', label: '괜찮아요', color: 'bg-green-100 border-green-300 text-green-600' },
  { val: 5, emoji: '😄', label: '좋아요!', color: 'bg-blue-100 border-blue-300 text-blue-600' },
];

function getMoodEmoji(val: number) {
  return MOODS.find(m => m.val === val)?.emoji || '—';
}

function getMoodColor(val: number) {
  const colors = ['', 'bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100'];
  return colors[val] || 'bg-gray-100';
}

export default function EmotionPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [todayMood, setTodayMood] = useState(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    const userData = JSON.parse(u);
    setUser(userData);
    fetch(`/api/emotion/${encodeURIComponent(userData.email)}`)
      .then(r => r.json())
      .then(data => {
        setLogs(data);
        const todayLog = data.find((l: EmotionLog) => l.date === todayStr);
        if (todayLog) { setTodayMood(todayLog.mood); setNote(todayLog.note || ''); setSaved(true); }
      });
  }, [router, todayStr]);

  const handleSave = async () => {
    if (!todayMood || !user) return;
    setSaving(true);
    const res = await fetch(`/api/emotion/${encodeURIComponent(user.email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayStr, mood: todayMood, note }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLogs(prev => {
        const idx = prev.findIndex(l => l.date === todayStr);
        if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n; }
        return [updated, ...prev];
      });
      setSaved(true);
    }
    setSaving(false);
  };

  // Last 14 days for timeline
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    return { dateStr, day: d.getDate(), mood: log?.mood || 0 };
  });

  const recentLogs = logs.slice(0, 7);
  const avgMood = recentLogs.length > 0
    ? (recentLogs.reduce((s, l) => s + l.mood, 0) / recentLogs.length).toFixed(1)
    : null;
  const totalDays = logs.length;
  const moodCounts = [1, 2, 3, 4, 5].map(v => ({ val: v, count: logs.filter(l => l.mood === v).length }));
  const topMood = moodCounts.sort((a, b) => b.count - a.count)[0];

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">💙 오늘의 감정 기록</h1>
        <p className="text-gray-500 text-sm mt-1">매일 기분을 기록하며 산후 회복을 추적해요.</p>
      </div>

      {/* Today Mood Picker */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 mb-6">
        <p className="text-sm font-bold text-gray-700 mb-4">오늘 기분이 어때요?</p>
        <div className="flex justify-between gap-2 mb-5">
          {MOODS.map(m => (
            <button
              key={m.val}
              onClick={() => { setTodayMood(m.val); setSaved(false); }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                todayMood === m.val ? m.color + ' scale-105 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-gray-500 leading-tight text-center">{m.label}</span>
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={e => { setNote(e.target.value); setSaved(false); }}
          placeholder="오늘 어떤 하루였나요? (선택)"
          className="w-full p-3 border border-gray-100 rounded-xl text-sm h-20 resize-none focus:outline-none focus:border-pink-300"
          maxLength={200}
        />
        <button
          onClick={handleSave}
          disabled={!todayMood || saving}
          className={`w-full mt-3 py-3 rounded-2xl font-bold text-sm transition-all ${
            saved ? 'bg-green-100 text-green-700' : 'bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50'
          }`}
        >
          {saving ? '저장 중...' : saved ? '✓ 오늘 기분 저장됨' : '기분 저장하기'}
        </button>
      </div>

      {/* 14-day Timeline */}
      {logs.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-700 text-sm mb-4">최근 14일 기분 타임라인</h2>
          <div className="flex gap-1 justify-between">
            {last14.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {d.mood > 0 ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getMoodColor(d.mood)}`}>
                    {getMoodEmoji(d.mood)}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                    <span className="text-gray-300 text-xs">—</span>
                  </div>
                )}
                <span className="text-[9px] text-gray-400">{d.day}일</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {logs.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{totalDays}</p>
            <p className="text-xs text-blue-400 mt-1">총 기록 일수</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{avgMood}</p>
            <p className="text-xs text-purple-400 mt-1">최근 7일 평균</p>
          </div>
          <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 text-center">
            <p className="text-2xl">{topMood?.count > 0 ? getMoodEmoji(topMood.val) : '—'}</p>
            <p className="text-xs text-pink-400 mt-1">가장 많은 기분</p>
          </div>
        </div>
      )}

      {/* SVG Mood Chart */}
      {recentLogs.length >= 3 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-700 text-sm mb-3">기분 변화 그래프</h2>
          <svg width="100%" viewBox="0 0 300 100" className="overflow-visible">
            {[1, 2, 3, 4, 5].map(v => (
              <line key={v} x1="0" y1={85 - (v - 1) * 18} x2="300" y2={85 - (v - 1) * 18}
                stroke="#f3f4f6" strokeWidth="1" />
            ))}
            {recentLogs.slice().reverse().map((l, i, arr) => {
              const x = (i / Math.max(arr.length - 1, 1)) * 280 + 10;
              const y = 85 - (l.mood - 1) * 18;
              const nextLog = arr[i + 1];
              const nx = nextLog ? ((i + 1) / Math.max(arr.length - 1, 1)) * 280 + 10 : null;
              const ny = nextLog ? 85 - (nextLog.mood - 1) * 18 : null;
              return (
                <g key={l._id || i}>
                  {nx !== null && ny !== null && (
                    <line x1={x} y1={y} x2={nx} y2={ny} stroke="#ec4899" strokeWidth="2" opacity="0.5" />
                  )}
                  <circle cx={x} cy={y} r="5" fill="#ec4899" />
                  <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#6b7280">
                    {getMoodEmoji(l.mood)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-700 text-sm mb-4">최근 기록</h2>
          <div className="space-y-3">
            {logs.slice(0, 10).map((l: EmotionLog) => {
              const m = MOODS.find(m => m.val === l.mood);
              return (
                <div key={l._id} className={`flex items-center gap-3 p-3 rounded-2xl ${getMoodColor(l.mood)}`}>
                  <span className="text-2xl">{m?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-700">{m?.label}</p>
                    {l.note && <p className="text-xs text-gray-500 truncate">{l.note}</p>}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{l.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {logs.length === 0 && !todayMood && (
        <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">💙</p>
          <p className="text-gray-400 text-sm">위에서 오늘 기분을 선택해 첫 기록을 남겨보세요.</p>
        </div>
      )}
    </div>
  );
}
