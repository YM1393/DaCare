'use client';

import { useState, useEffect } from 'react';

const VACCINES = [
  { id: 'hepb1', name: 'B형 간염 1차', daysFromBirth: 0, desc: '출생 직후 접종' },
  { id: 'bcg', name: 'BCG (결핵)', daysFromBirth: 28, desc: '생후 4주 이내' },
  { id: 'hepb2', name: 'B형 간염 2차', daysFromBirth: 30, desc: '생후 1개월' },
  { id: 'dtap1', name: 'DTaP 1차', daysFromBirth: 60, desc: '디프테리아/파상풍/백일해' },
  { id: 'ipv1', name: '폴리오 1차', daysFromBirth: 60, desc: '소아마비 예방' },
  { id: 'hib1', name: 'Hib 1차', daysFromBirth: 60, desc: '뇌수막염 예방' },
  { id: 'pcv1', name: '폐렴구균 1차', daysFromBirth: 60, desc: '폐렴 예방' },
  { id: 'rota1', name: '로타바이러스 1차', daysFromBirth: 60, desc: '장염 예방' },
  { id: 'dtap2', name: 'DTaP 2차', daysFromBirth: 120, desc: '생후 4개월' },
  { id: 'ipv2', name: '폴리오 2차', daysFromBirth: 120, desc: '생후 4개월' },
  { id: 'hib2', name: 'Hib 2차', daysFromBirth: 120, desc: '생후 4개월' },
  { id: 'pcv2', name: '폐렴구균 2차', daysFromBirth: 120, desc: '생후 4개월' },
  { id: 'rota2', name: '로타바이러스 2차', daysFromBirth: 120, desc: '생후 4개월' },
  { id: 'hepb3', name: 'B형 간염 3차', daysFromBirth: 180, desc: '생후 6개월' },
  { id: 'dtap3', name: 'DTaP 3차', daysFromBirth: 180, desc: '생후 6개월' },
  { id: 'ipv3', name: '폴리오 3차', daysFromBirth: 180, desc: '생후 6개월' },
  { id: 'flu1', name: '인플루엔자 1차', daysFromBirth: 180, desc: '생후 6개월 이후 매년' },
  { id: 'mmr1', name: 'MMR 1차', daysFromBirth: 365, desc: '홍역/유행이하선염/풍진' },
  { id: 'var1', name: '수두 1차', daysFromBirth: 365, desc: '생후 12-15개월' },
];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

type VaccineStatus = 'completed' | 'overdue' | 'upcoming' | 'this-month';

export default function VaccinationPage() {
  const [birthDate, setBirthDate] = useState('');
  const [inputBirth, setInputBirth] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('birthDate');
    if (saved) { setBirthDate(saved); setInputBirth(saved); }
    const savedCompleted = localStorage.getItem('vaccinationCompleted');
    if (savedCompleted) {
      try { setCompleted(JSON.parse(savedCompleted)); } catch {}
    }
  }, []);

  const saveBirthDate = () => {
    if (!inputBirth) return;
    setBirthDate(inputBirth);
    localStorage.setItem('birthDate', inputBirth);
  };

  const toggleCompleted = (id: string) => {
    const updated = completed.includes(id)
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(updated);
    localStorage.setItem('vaccinationCompleted', JSON.stringify(updated));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const vaccinesWithStatus = birthDate
    ? VACCINES.map(v => {
        const dueDate = addDays(new Date(birthDate), v.daysFromBirth);
        dueDate.setHours(0, 0, 0, 0);
        let status: VaccineStatus;
        if (completed.includes(v.id)) {
          status = 'completed';
        } else if (dueDate < today) {
          status = 'overdue';
        } else if (dueDate >= startOfMonth && dueDate <= endOfMonth) {
          status = 'this-month';
        } else {
          status = 'upcoming';
        }
        return { ...v, dueDate, status };
      })
    : [];

  const thisMonth = vaccinesWithStatus.filter(v => v.status === 'this-month');
  const upcoming = vaccinesWithStatus.filter(v => v.status === 'upcoming');
  const overdue = vaccinesWithStatus.filter(v => v.status === 'overdue');
  const completedList = vaccinesWithStatus.filter(v => v.status === 'completed');

  const VaccineCard = ({ v }: { v: typeof vaccinesWithStatus[0] }) => {
    const statusStyle = {
      completed: 'border-green-200 bg-green-50',
      overdue: 'border-red-200 bg-red-50',
      'this-month': 'border-blue-200 bg-blue-50',
      upcoming: 'border-gray-100 bg-white',
    }[v.status];

    const badgeStyle = {
      completed: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      'this-month': 'bg-blue-100 text-blue-700',
      upcoming: 'bg-gray-100 text-gray-500',
    }[v.status];

    const badgeLabel = {
      completed: '완료',
      overdue: '기간 초과',
      'this-month': '이번 달',
      upcoming: '예정',
    }[v.status];

    return (
      <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${statusStyle}`}>
        <input
          type="checkbox"
          checked={completed.includes(v.id)}
          onChange={() => toggleCompleted(v.id)}
          className="w-5 h-5 accent-green-500 cursor-pointer shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-bold text-sm ${v.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {v.name}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badgeStyle}`}>{badgeLabel}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{v.desc}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-gray-600">{formatDate(v.dueDate)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          💉 예방접종 일정
        </h1>
        <p className="text-gray-500 mt-1 text-sm">아기의 출생일을 입력하면 예방접종 일정을 자동으로 알려드려요.</p>
      </div>

      {/* Birth date input */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 mb-8">
        <label className="text-sm font-bold text-gray-700 block mb-3">아기 출생일</label>
        <div className="flex gap-3">
          <input
            type="date"
            value={inputBirth}
            onChange={e => setInputBirth(e.target.value)}
            className="flex-1 p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300"
          />
          <button
            onClick={saveBirthDate}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-pink-600 whitespace-nowrap"
          >
            확인
          </button>
        </div>
      </div>

      {!birthDate ? (
        <div className="bg-gray-50 rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
          <p className="text-4xl mb-3">💉</p>
          <p className="text-gray-400 text-sm">출생일을 입력하면 예방접종 일정이 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{thisMonth.length}</p>
              <p className="text-xs text-blue-400 mt-1">이번 달 예정</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{overdue.length}</p>
              <p className="text-xs text-red-400 mt-1">기간 초과</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{completedList.length}</p>
              <p className="text-xs text-green-400 mt-1">완료됨</p>
            </div>
          </div>

          {/* Overdue */}
          {overdue.length > 0 && (
            <section>
              <h2 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                기간 초과 ({overdue.length}건)
              </h2>
              <div className="space-y-2">
                {overdue.map(v => <VaccineCard key={v.id} v={v} />)}
              </div>
            </section>
          )}

          {/* This month */}
          {thisMonth.length > 0 && (
            <section>
              <h2 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                이번 달 예정 ({thisMonth.length}건)
              </h2>
              <div className="space-y-2">
                {thisMonth.map(v => <VaccineCard key={v.id} v={v} />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                향후 예정 ({upcoming.length}건)
              </h2>
              <div className="space-y-2">
                {upcoming.map(v => <VaccineCard key={v.id} v={v} />)}
              </div>
            </section>
          )}

          {/* Completed */}
          {completedList.length > 0 && (
            <section>
              <h2 className="font-bold text-green-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                완료됨 ({completedList.length}건)
              </h2>
              <div className="space-y-2">
                {completedList.map(v => <VaccineCard key={v.id} v={v} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
