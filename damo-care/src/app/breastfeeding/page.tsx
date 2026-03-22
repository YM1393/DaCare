'use client';

import { useState, useEffect, useRef } from 'react';

interface Session {
  side: 'left' | 'right';
  duration: number;
  time: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatKoreanTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatKoreanDate(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function BreastfeedingPage() {
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);
  const [leftSeconds, setLeftSeconds] = useState(0);
  const [rightSeconds, setRightSeconds] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);

  const leftRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rightRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('breastfeedingSessions');
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch {}
    }
    return () => {
      if (leftRef.current) clearInterval(leftRef.current);
      if (rightRef.current) clearInterval(rightRef.current);
    };
  }, []);

  const saveSessions = (newSessions: Session[]) => {
    setSessions(newSessions);
    localStorage.setItem('breastfeedingSessions', JSON.stringify(newSessions));
  };

  const toggleLeft = () => {
    if (leftActive) {
      // Stop
      if (leftRef.current) clearInterval(leftRef.current);
      setLeftActive(false);
      if (leftSeconds > 0) {
        const session: Session = { side: 'left', duration: leftSeconds, time: new Date().toISOString() };
        const updated = [session, ...sessions].slice(0, 50);
        saveSessions(updated);
      }
      setLeftSeconds(0);
    } else {
      // Start
      if (rightActive) {
        // Stop right first
        if (rightRef.current) clearInterval(rightRef.current);
        setRightActive(false);
        if (rightSeconds > 0) {
          const session: Session = { side: 'right', duration: rightSeconds, time: new Date().toISOString() };
          const updated = [session, ...sessions].slice(0, 50);
          saveSessions(updated);
        }
        setRightSeconds(0);
      }
      setLeftActive(true);
      leftRef.current = setInterval(() => {
        setLeftSeconds(s => s + 1);
      }, 1000);
    }
  };

  const toggleRight = () => {
    if (rightActive) {
      if (rightRef.current) clearInterval(rightRef.current);
      setRightActive(false);
      if (rightSeconds > 0) {
        const session: Session = { side: 'right', duration: rightSeconds, time: new Date().toISOString() };
        const updated = [session, ...sessions].slice(0, 50);
        saveSessions(updated);
      }
      setRightSeconds(0);
    } else {
      if (leftActive) {
        if (leftRef.current) clearInterval(leftRef.current);
        setLeftActive(false);
        if (leftSeconds > 0) {
          const session: Session = { side: 'left', duration: leftSeconds, time: new Date().toISOString() };
          const updated = [session, ...sessions].slice(0, 50);
          saveSessions(updated);
        }
        setLeftSeconds(0);
      }
      setRightActive(true);
      rightRef.current = setInterval(() => {
        setRightSeconds(s => s + 1);
      }, 1000);
    }
  };

  const lastSession = sessions[0] || null;
  const todayStr = new Date().toDateString();
  const todayCount = sessions.filter(s => new Date(s.time).toDateString() === todayStr).length;
  const last10 = sessions.slice(0, 10);

  // Next feeding suggestion: last session time + 2.5 hours
  const nextFeeding = lastSession
    ? new Date(new Date(lastSession.time).getTime() + 2.5 * 60 * 60 * 1000)
    : null;

  const clearAll = () => {
    if (!confirm('모든 수유 기록을 삭제하시겠습니까?')) return;
    saveSessions([]);
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🤱 모유수유 타이머
        </h1>
        <p className="text-gray-500 mt-1 text-sm">수유 시간을 기록하고 패턴을 파악하세요.</p>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-rose-400 font-bold mb-1">오늘 수유 횟수</p>
          <p className="text-3xl font-bold text-rose-500">{todayCount}회</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-purple-400 font-bold mb-1">다음 수유 예정</p>
          <p className="text-lg font-bold text-purple-500">
            {nextFeeding ? formatKoreanTime(nextFeeding.toISOString()) : '—'}
          </p>
        </div>
      </div>

      {lastSession && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">{lastSession.side === 'left' ? '⬅️' : '➡️'}</span>
          <div>
            <p className="text-xs text-gray-400">마지막 수유</p>
            <p className="font-bold text-gray-700 text-sm">
              {lastSession.side === 'left' ? '왼쪽' : '오른쪽'} · {formatTime(lastSession.duration)} · {formatKoreanDate(lastSession.time)} {formatKoreanTime(lastSession.time)}
            </p>
          </div>
        </div>
      )}

      {/* Timer buttons */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Left */}
        <div className={`rounded-3xl border-2 p-6 text-center transition-all ${leftActive ? 'border-rose-400 bg-rose-50 shadow-lg shadow-rose-100' : 'border-rose-100 bg-white'}`}>
          <p className="text-4xl mb-2">⬅️</p>
          <p className="font-bold text-gray-700 mb-1">왼쪽</p>
          <p className={`text-4xl font-mono font-bold mb-4 ${leftActive ? 'text-rose-500' : 'text-gray-300'}`}>
            {formatTime(leftSeconds)}
          </p>
          <button
            onClick={toggleLeft}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
              leftActive
                ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-200'
                : 'bg-rose-100 text-rose-500 hover:bg-rose-200'
            }`}
          >
            {leftActive ? '⏹ 정지' : '▶ 시작'}
          </button>
        </div>

        {/* Right */}
        <div className={`rounded-3xl border-2 p-6 text-center transition-all ${rightActive ? 'border-purple-400 bg-purple-50 shadow-lg shadow-purple-100' : 'border-purple-100 bg-white'}`}>
          <p className="text-4xl mb-2">➡️</p>
          <p className="font-bold text-gray-700 mb-1">오른쪽</p>
          <p className={`text-4xl font-mono font-bold mb-4 ${rightActive ? 'text-purple-500' : 'text-gray-300'}`}>
            {formatTime(rightSeconds)}
          </p>
          <button
            onClick={toggleRight}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
              rightActive
                ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-md shadow-purple-200'
                : 'bg-purple-100 text-purple-500 hover:bg-purple-200'
            }`}
          >
            {rightActive ? '⏹ 정지' : '▶ 시작'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">수유 기록 (최근 10회)</h2>
          {sessions.length > 0 && (
            <button onClick={clearAll} className="text-xs text-gray-300 hover:text-red-400 transition-colors">
              전체 삭제
            </button>
          )}
        </div>
        {last10.length === 0 ? (
          <p className="text-center text-gray-300 py-8 text-sm">아직 기록이 없어요. 타이머를 시작해보세요!</p>
        ) : (
          <div className="space-y-2">
            {last10.map((s, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-2xl ${s.side === 'left' ? 'bg-rose-50' : 'bg-purple-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.side === 'left' ? '⬅️' : '➡️'}</span>
                  <div>
                    <p className={`text-xs font-bold ${s.side === 'left' ? 'text-rose-500' : 'text-purple-500'}`}>
                      {s.side === 'left' ? '왼쪽' : '오른쪽'}
                    </p>
                    <p className="text-xs text-gray-400">{formatKoreanDate(s.time)} {formatKoreanTime(s.time)}</p>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${s.side === 'left' ? 'text-rose-400' : 'text-purple-400'}`}>
                  {formatTime(s.duration)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
