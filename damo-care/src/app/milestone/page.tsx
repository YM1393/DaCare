'use client';

import { useState, useEffect } from 'react';

const MILESTONES = [
  { month: 1, items: ['눈으로 빛 따라가기', '소리에 반응하기', '배 위에서 머리 들기 시도'] },
  { month: 2, items: ['사회적 미소 짓기', '소리 내어 웃기', '얼굴 인식하기'] },
  { month: 3, items: ['목 가누기 시작', '손 바라보기', '옹알이 시작'] },
  { month: 4, items: ['웃음 소리 내기', '장난감 잡기 시도', '뒤집기 시도'] },
  { month: 5, items: ['뒤집기 성공', '양손으로 물건 잡기', '발 탐색하기'] },
  { month: 6, items: ['혼자 앉기 시도', '이유식 시작 준비', '낯가림 시작'] },
  { month: 7, items: ['기기 시작', '두 손으로 물체 전달', '짝짜꿍 반응'] },
  { month: 8, items: ['혼자 앉기 성공', '엄마·아빠 인식', '물건 입에 넣기'] },
  { month: 9, items: ['붙잡고 서기 시도', '엄마 소리 모방', '"안 돼" 이해 시작'] },
  { month: 10, items: ['전진 기기', '손가락으로 집기', '잡고 서기'] },
  { month: 11, items: ['가구 잡고 걷기', '간단한 지시 따르기', '손뼉 치기'] },
  { month: 12, items: ['첫 걸음마', '"엄마", "아빠" 의미 있게 말하기', '컵으로 마시기'] },
];

export default function MilestonePage() {
  const [birthDate, setBirthDate] = useState('');
  const [ageMonths, setAgeMonths] = useState<number | null>(null);
  const [ageWeeks, setAgeWeeks] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openMonths, setOpenMonths] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('birthDate');
    if (saved) { setBirthDate(saved); calcAge(saved); }
    const savedChecked = localStorage.getItem('milestones');
    if (savedChecked) { try { setChecked(JSON.parse(savedChecked)); } catch {} }
  }, []);

  const calcAge = (dateStr: string) => {
    const birth = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    const months = Math.floor(weeks / 4.33);
    setAgeWeeks(weeks);
    setAgeMonths(months);
    // Open current month group
    const cur = Math.min(months + 1, 12);
    setOpenMonths([cur]);
  };

  const handleBirthSave = () => {
    if (!birthDate) return;
    localStorage.setItem('birthDate', birthDate);
    calcAge(birthDate);
  };

  const toggleCheck = (key: string) => {
    const updated = { ...checked, [key]: !checked[key] };
    setChecked(updated);
    localStorage.setItem('milestones', JSON.stringify(updated));
  };

  const toggleMonth = (month: number) => {
    setOpenMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const currentMonth = ageMonths !== null ? Math.min(ageMonths + 1, 12) : null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">아기 발달 마일스톤 🌱</h1>

      {/* Birth date input */}
      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-500 mb-2">아기 출생일</p>
        <div className="flex gap-2">
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
            className="flex-1 p-2.5 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
          <button onClick={handleBirthSave}
            className="bg-pink-500 text-white px-4 rounded-xl text-sm font-bold hover:bg-pink-600">확인</button>
        </div>
        {ageMonths !== null && (
          <p className="text-sm font-bold text-pink-600 mt-2">
            현재 {ageWeeks}주 ({ageMonths}개월)
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        {MILESTONES.map(({ month, items }) => {
          const completedCount = items.filter((_, i) => checked[`${month}-${i}`]).length;
          const pct = Math.round((completedCount / items.length) * 100);
          const isCurrent = currentMonth === month;
          const isOpen = openMonths.includes(month);

          return (
            <div key={month}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${isCurrent ? 'border-pink-400 shadow-pink-100' : 'border-gray-100'}`}>
              <button onClick={() => toggleMonth(month)}
                className={`w-full flex items-center justify-between p-4 text-left ${isCurrent ? 'bg-pink-50' : ''}`}>
                <div className="flex items-center gap-3">
                  {isCurrent && <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">현재</span>}
                  <span className="font-bold text-gray-700 text-sm">{month}개월</span>
                  <span className="text-xs text-gray-400">{completedCount}/{items.length} 달성</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${pct === 100 ? 'text-green-500' : 'text-gray-400'}`}>{pct}%</span>
                  <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Progress bar */}
              <div className="px-4 pb-1">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-green-400' : 'bg-pink-400'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 pt-2 space-y-2">
                  {items.map((item, i) => {
                    const key = `${month}-${i}`;
                    const done = checked[key];
                    return (
                      <label key={i} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!done} onChange={() => toggleCheck(key)}
                          className="w-4 h-4 accent-pink-500 rounded" />
                        <span className={`text-sm ${done ? 'line-through text-green-500' : 'text-gray-700'}`}>{item}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
