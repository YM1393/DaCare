'use client';

import { useState, useEffect } from 'react';

type TimeSlot = '아침' | '점심' | '저녁' | '취침전';
const TIME_SLOTS: TimeSlot[] = ['아침', '점심', '저녁', '취침전'];
const SLOT_COLORS: Record<TimeSlot, string> = {
  아침: 'bg-orange-100 text-orange-700 border-orange-200',
  점심: 'bg-green-100 text-green-700 border-green-200',
  저녁: 'bg-blue-100 text-blue-700 border-blue-200',
  취침전: 'bg-purple-100 text-purple-700 border-purple-200',
};

interface Med { id: string; name: string; dosage: string; times: TimeSlot[]; startDate: string; endDate: string; }

const todayKey = () => new Date().toISOString().split('T')[0];

export default function MedicationPage() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [takenToday, setTakenToday] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '1정', times: [] as TimeSlot[], startDate: todayKey(), endDate: '' });

  useEffect(() => {
    const savedMeds = localStorage.getItem('medications');
    if (savedMeds) { try { setMeds(JSON.parse(savedMeds)); } catch {} }
    const savedTaken = localStorage.getItem(`med_taken_${todayKey()}`);
    if (savedTaken) { try { setTakenToday(JSON.parse(savedTaken)); } catch {} }
  }, []);

  const saveMeds = (updated: Med[]) => {
    setMeds(updated);
    localStorage.setItem('medications', JSON.stringify(updated));
  };

  const addMed = () => {
    if (!form.name || form.times.length === 0) return;
    const newMed: Med = { id: Date.now().toString(), ...form };
    saveMeds([...meds, newMed]);
    setForm({ name: '', dosage: '1정', times: [], startDate: todayKey(), endDate: '' });
    setShowForm(false);
  };

  const deleteMed = (id: string) => {
    saveMeds(meds.filter(m => m.id !== id));
  };

  const toggleTaken = (medId: string, slot: TimeSlot) => {
    const key = `${medId}_${slot}`;
    const updated = { ...takenToday, [key]: !takenToday[key] };
    setTakenToday(updated);
    localStorage.setItem(`med_taken_${todayKey()}`, JSON.stringify(updated));
  };

  const toggleTime = (slot: TimeSlot) => {
    setForm(prev => ({
      ...prev,
      times: prev.times.includes(slot) ? prev.times.filter(t => t !== slot) : [...prev.times, slot],
    }));
  };

  const today = todayKey();
  const activeMeds = meds.filter(m => m.startDate <= today && (!m.endDate || m.endDate >= today));
  const totalDoses = activeMeds.reduce((sum, m) => sum + m.times.length, 0);
  const takenCount = activeMeds.reduce((sum, m) =>
    sum + m.times.filter(t => takenToday[`${m.id}_${t}`]).length, 0);
  const pct = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">약 복용 알림 💊</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-pink-600">
          + 약 추가
        </button>
      </div>

      {/* Today completion */}
      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-gray-700">오늘 복용 완료율</p>
          <p className="text-sm font-bold text-pink-600">{takenCount}/{totalDoses} ({pct}%)</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-pink-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && totalDoses > 0 && <p className="text-xs text-green-600 mt-1 font-bold">오늘 모든 약을 복용했어요! 👏</p>}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4 text-sm">새 약 추가</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">약 이름</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="예: 철분제" className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">용량</label>
              <input value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })}
                placeholder="예: 1정" className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-2 block">복용 시간 (복수 선택)</label>
            <div className="flex gap-2">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => toggleTime(slot)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${form.times.includes(slot) ? SLOT_COLORS[slot] : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">시작일</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">종료일 (선택)</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:border-pink-300" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border rounded-xl text-sm text-gray-500 hover:bg-gray-50">취소</button>
            <button onClick={addMed} className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600">추가</button>
          </div>
        </div>
      )}

      {/* Today's schedule */}
      {activeMeds.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3 text-sm">오늘 복용 일정</h2>
          <div className="space-y-3">
            {activeMeds.map(med => (
              <div key={med.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{med.name}</p>
                    <p className="text-xs text-gray-400">{med.dosage}</p>
                  </div>
                  <button onClick={() => deleteMed(med.id)} className="text-gray-300 hover:text-red-400 text-sm transition-colors">✕</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {med.times.map(slot => {
                    const key = `${med.id}_${slot}`;
                    const taken = takenToday[key];
                    return (
                      <button key={slot} onClick={() => toggleTaken(med.id, slot)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${taken ? 'opacity-50 line-through ' + SLOT_COLORS[slot] : SLOT_COLORS[slot]}`}>
                        {taken ? '✓ ' : ''}{slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meds.length === 0 && !showForm && (
        <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-sm">
          약을 추가하고 복용 알림을 관리하세요.
        </div>
      )}
    </div>
  );
}
