'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { StoredUser, SleepRecord } from '@/types';

const VACCINES = [
  { id: 'hepb1', name: 'B형 간염 1차', daysFromBirth: 0 },
  { id: 'bcg', name: 'BCG (결핵)', daysFromBirth: 28 },
  { id: 'hepb2', name: 'B형 간염 2차', daysFromBirth: 30 },
  { id: 'dtap1', name: 'DTaP 1차', daysFromBirth: 60 },
  { id: 'ipv1', name: '폴리오 1차', daysFromBirth: 60 },
  { id: 'hib1', name: 'Hib 1차', daysFromBirth: 60 },
  { id: 'pcv1', name: '폐렴구균 1차', daysFromBirth: 60 },
  { id: 'rota1', name: '로타바이러스 1차', daysFromBirth: 60 },
  { id: 'dtap2', name: 'DTaP 2차', daysFromBirth: 120 },
  { id: 'dtap3', name: 'DTaP 3차', daysFromBirth: 180 },
  { id: 'hepb3', name: 'B형 간염 3차', daysFromBirth: 180 },
  { id: 'flu1', name: '인플루엔자 1차', daysFromBirth: 180 },
  { id: 'mmr1', name: 'MMR 1차', daysFromBirth: 365 },
  { id: 'var1', name: '수두 1차', daysFromBirth: 365 },
];

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

function fmtTime(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function BabyLogPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [sleepRecords, setSleepRecords] = useState<any[]>([]);
  const [diaperLogs, setDiaperLogs] = useState<any[]>([]);
  const [feedingSessions, setFeedingSessions] = useState<any[]>([]);
  const [babyAge, setBabyAge] = useState<number | null>(null);
  const [overdueVaccines, setOverdueVaccines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toDateString();
  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);

    Promise.all([
      fetch(`/api/sleep/${encodeURIComponent(u.email)}`).then(r => r.json()),
      fetch(`/api/diaper/${encodeURIComponent(u.email)}`).then(r => r.json()),
    ]).then(([sleep, diaper]) => {
      setSleepRecords(sleep);
      setDiaperLogs(diaper);
      setLoading(false);
    });

    // Feeding from localStorage
    const feedingSaved = localStorage.getItem('breastfeedingSessions');
    if (feedingSaved) {
      try { setFeedingSessions(JSON.parse(feedingSaved)); } catch {}
    }

    // Birth date & baby age
    const birthSaved = localStorage.getItem('birthDate');
    if (birthSaved) {
      const diff = Math.floor((Date.now() - new Date(birthSaved).getTime()) / (1000 * 60 * 60 * 24));
      setBabyAge(diff);

      // Check overdue vaccines
      const completedIds: string[] = JSON.parse(localStorage.getItem('vaccinationCompleted') || '[]');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const overdue = VACCINES.filter(v => {
        if (completedIds.includes(v.id)) return false;
        const due = new Date(new Date(birthSaved).getTime() + v.daysFromBirth * 86400000);
        due.setHours(0, 0, 0, 0);
        return due < today;
      }).map(v => v.name);
      setOverdueVaccines(overdue.slice(0, 3));
    }
  }, [router]);

  // Today stats
  const todayDiapers = diaperLogs.filter(l => new Date(l.createdAt).toDateString() === todayStr);
  const todaySleep = sleepRecords.filter(r => (r.startTime || '').startsWith(todayISO));
  const todaySleepTotal = todaySleep.reduce((s: number, r: SleepRecord) => s + (r.duration || 0), 0);
  const todayFeeding = feedingSessions.filter(s => new Date(s.time).toDateString() === todayStr);
  const lastFeeding = feedingSessions[0];
  const nextFeedingTime = lastFeeding
    ? new Date(new Date(lastFeeding.time).getTime() + 2.5 * 3600000)
    : null;

  // Recent activity (merged, last 5 total)
  const recentActivity = [
    ...diaperLogs.slice(0, 5).map(l => ({
      type: '기저귀', icon: '🍼', desc: `${l.type} 교체`,
      time: l.createdAt, color: 'bg-yellow-50',
    })),
    ...sleepRecords.slice(0, 3).map(r => ({
      type: '수면', icon: '😴', desc: fmtDuration(r.duration || 0),
      time: r.createdAt, color: 'bg-indigo-50',
    })),
    ...feedingSessions.slice(0, 3).map(s => ({
      type: '수유', icon: '🤱', desc: `${s.side === 'left' ? '왼쪽' : '오른쪽'} 수유`,
      time: s.time, color: 'bg-rose-50',
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  const trackers = [
    { href: '/breastfeeding', emoji: '🤱', label: '수유 타이머', sub: `오늘 ${todayFeeding.length}회`, color: 'bg-rose-50 border-rose-100' },
    { href: '/sleep-tracker', emoji: '😴', label: '수면 기록', sub: `오늘 ${fmtDuration(todaySleepTotal)}`, color: 'bg-indigo-50 border-indigo-100' },
    { href: '/diaper', emoji: '🍼', label: '기저귀 기록', sub: `오늘 ${todayDiapers.length}회`, color: 'bg-yellow-50 border-yellow-100' },
    { href: '/growth', emoji: '📈', label: '성장 기록', sub: '키·몸무게 기록', color: 'bg-blue-50 border-blue-100' },
    { href: '/vaccination', emoji: '💉', label: '예방접종', sub: overdueVaccines.length > 0 ? `⚠️ ${overdueVaccines.length}건 미접종` : '일정 확인', color: overdueVaccines.length > 0 ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100' },
    { href: '/emotion', emoji: '💙', label: '오늘의 감정', sub: '기분 일기 쓰기', color: 'bg-purple-50 border-purple-100' },
  ];

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">아기 케어 대시보드 🍼</h1>
          <p className="text-gray-500 text-sm mt-1">오늘의 아기 케어 현황을 한눈에 확인해요.</p>
        </div>
        {babyAge !== null && (
          <div className="bg-pink-500 text-white rounded-2xl px-4 py-2 text-center shrink-0">
            <p className="text-2xl font-bold leading-tight">D+{babyAge}</p>
            <p className="text-xs opacity-80">출생 후 {babyAge}일</p>
          </div>
        )}
      </div>

      {/* Overdue Vaccine Alert */}
      {overdueVaccines.length > 0 && (
        <Link href="/vaccination" className="block mb-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-red-700 text-sm">미접종 예방접종이 있어요!</p>
              <p className="text-xs text-red-500 mt-0.5">{overdueVaccines.join(' · ')} 등 확인이 필요해요.</p>
            </div>
            <span className="ml-auto text-red-300 text-sm">→</span>
          </div>
        </Link>
      )}

      {/* Today Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <p className="text-xs text-rose-400 font-bold mb-1">오늘 수유</p>
          <p className="text-3xl font-bold text-rose-500">{todayFeeding.length}<span className="text-sm font-normal text-gray-400 ml-1">회</span></p>
          {nextFeedingTime && (
            <p className="text-xs text-gray-400 mt-1">다음 예정 {fmtTime(nextFeedingTime.toISOString())}</p>
          )}
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-xs text-indigo-400 font-bold mb-1">오늘 수면</p>
          <p className="text-2xl font-bold text-indigo-500">{fmtDuration(todaySleepTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{todaySleep.length}회 기록</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <p className="text-xs text-yellow-500 font-bold mb-1">오늘 기저귀</p>
          <p className="text-3xl font-bold text-yellow-500">{todayDiapers.length}<span className="text-sm font-normal text-gray-400 ml-1">회</span></p>
          <p className="text-xs text-gray-400 mt-1">
            소변 {todayDiapers.filter(l => l.type === '소변').length} · 대변 {todayDiapers.filter(l => l.type === '대변').length}
          </p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
          <p className="text-xs text-teal-500 font-bold mb-1">마지막 수유</p>
          {lastFeeding ? (
            <>
              <p className="text-sm font-bold text-teal-600">{fmtTime(lastFeeding.time)}</p>
              <p className="text-xs text-gray-400 mt-1">{lastFeeding.side === 'left' ? '왼쪽' : '오른쪽'} 수유</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">기록 없음</p>
          )}
        </div>
      </div>

      {/* Quick Nav Tiles */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {trackers.map(t => (
          <Link key={t.href} href={t.href}
            className={`flex flex-col items-center gap-1 p-4 rounded-2xl border ${t.color} hover:opacity-80 transition-opacity text-center`}>
            <span className="text-2xl">{t.emoji}</span>
            <p className="text-xs font-bold text-gray-700 leading-tight">{t.label}</p>
            <p className="text-[10px] text-gray-500">{t.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-700 text-sm mb-4">최근 활동</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${a.color}`}>
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-600">{a.type}</p>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{fmtTime(a.time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {recentActivity.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">🍼</p>
          <p className="text-gray-400 text-sm">위의 트래커를 눌러 첫 기록을 남겨보세요!</p>
        </div>
      )}
    </div>
  );
}
