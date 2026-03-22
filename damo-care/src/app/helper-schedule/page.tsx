'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiX, FiFileText } from 'react-icons/fi';
import type { StoredUser, Reservation } from '@/types';

interface CheckInRecord {
  _id?: string;
  helperId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
}

interface VisitReport {
  _id?: string;
  reservationId: string;
  activities: string[];
  notes: string;
}

const ACTIVITY_OPTIONS = [
  '산모 식사 준비',
  '모유수유 지원',
  '아기 목욕',
  '신생아 케어',
  '가사 도움',
  '산모 마사지',
  '산모 상태 체크',
  '외출 동행',
  '빨래 및 청소',
  '기타',
];

const STATUS_MAP: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: '대기중', dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '확정',   dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료',   dot: 'bg-green-400',  badge: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소',   dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500' },
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function HelperSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [checkIns, setCheckIns] = useState<Record<string, CheckInRecord>>({});
  const [checkInLoading, setCheckInLoading] = useState(false);
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  // 방문 기록 관련 state
  const [visitReports, setVisitReports] = useState<Record<string, VisitReport>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<Reservation | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState('');
  const [reportSaving, setReportSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    if (u.role !== 'helper') { router.push('/mypage'); return; }
    setUser(u);

    const helperId = u._id || u.id;
    const endpoint = helperId
      ? `/api/reservations/helper/${helperId}?full=true`
      : `/api/reservations/${encodeURIComponent(u.email)}`;

    fetch(endpoint)
      .then(r => r.json())
      .then(data => { setReservations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));

    if (helperId) {
      fetch(`/api/checkin?helperId=${helperId}`)
        .then(r => r.json())
        .then((data: CheckInRecord[]) => {
          const map: Record<string, CheckInRecord> = {};
          data.forEach(c => { map[c.date] = c; });
          setCheckIns(map);
        })
        .catch(() => {});

      fetch(`/api/visit-report?helperId=${helperId}`)
        .then(r => r.json())
        .then((data: VisitReport[]) => {
          const map: Record<string, VisitReport> = {};
          data.forEach(v => { map[v.reservationId] = v; });
          setVisitReports(map);
        })
        .catch(() => {});
    }
  }, [router]);

  // 캘린더 계산
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const reservationsByDate: Record<string, Reservation[]> = {};
  reservations.forEach(r => {
    if (!r.date) return;
    if (!reservationsByDate[r.date]) reservationsByDate[r.date] = [];
    reservationsByDate[r.date].push(r);
  });

  const toDateKey = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === currentYear &&
    today.getMonth() === currentMonth &&
    today.getDate() === day;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate('');
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate('');
  };

  const selectedReservations = selectedDate ? (reservationsByDate[selectedDate] || []) : [];

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const thisMonthReservations = reservations.filter(r => r.date?.startsWith(monthPrefix));
  const pendingCount = thisMonthReservations.filter(r => r.status === 'pending').length;
  const confirmedCount = thisMonthReservations.filter(r => r.status === 'confirmed').length;

  const handleCheckIn = async (type: 'checkin' | 'checkout') => {
    if (!user) return;
    const helperId = user._id || user.id || '';
    const todayReservations = reservationsByDate[todayKey] || [];
    const motherEmail = todayReservations[0]?.userEmail;
    setCheckInLoading(true);
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helperId, helperEmail: user.email, helperName: user.name, motherEmail, date: todayKey, type }),
    });
    const data = await res.json();
    setCheckIns(prev => ({ ...prev, [todayKey]: data }));
    setCheckInLoading(false);
  };

  const openReportModal = (reservation: Reservation) => {
    setReportTarget(reservation);
    const existing = visitReports[reservation._id];
    setSelectedActivities(existing?.activities || []);
    setReportNotes(existing?.notes || '');
    setShowReportModal(true);
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleSaveReport = async () => {
    if (!user || !reportTarget) return;
    setReportSaving(true);
    const helperId = user._id || user.id || '';
    await fetch('/api/visit-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: reportTarget._id,
        helperId,
        helperEmail: user.email,
        helperName: user.name,
        userEmail: reportTarget.userEmail,
        date: reportTarget.date,
        activities: selectedActivities,
        notes: reportNotes,
      }),
    });
    // 기록 새로고침
    const res = await fetch(`/api/visit-report?helperId=${helperId}`);
    const data: VisitReport[] = await res.json();
    const map: Record<string, VisitReport> = {};
    data.forEach(v => { map[v.reservationId] = v; });
    setVisitReports(map);
    setReportSaving(false);
    setShowReportModal(false);
    alert('방문 기록이 저장되었습니다.');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mypage" className="text-gray-400 hover:text-pink-500 transition-colors text-sm">← 마이페이지</Link>
        <h1 className="text-2xl font-bold text-gray-800">📅 예약 일정 캘린더</h1>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">{thisMonthReservations.length}</p>
          <p className="text-xs text-blue-400 mt-1">이번 달 예약</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-xs text-yellow-400 mt-1">대기중</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{confirmedCount}</p>
          <p className="text-xs text-green-400 mt-1">확정됨</p>
        </div>
      </div>

      {/* 오늘 출퇴근 체크 */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-5">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">🕐 오늘 출퇴근 ({todayKey})</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleCheckIn('checkin')}
            disabled={checkInLoading || !!checkIns[todayKey]?.checkInTime}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
              checkIns[todayKey]?.checkInTime
                ? 'bg-green-100 text-green-600 border border-green-200 cursor-default'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
            } disabled:opacity-60`}
          >
            {checkIns[todayKey]?.checkInTime ? `✅ 출근 ${checkIns[todayKey].checkInTime}` : '🌅 출근 체크'}
          </button>
          <button
            onClick={() => handleCheckIn('checkout')}
            disabled={checkInLoading || !checkIns[todayKey]?.checkInTime || !!checkIns[todayKey]?.checkOutTime}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
              checkIns[todayKey]?.checkOutTime
                ? 'bg-blue-100 text-blue-600 border border-blue-200 cursor-default'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
            } disabled:opacity-60`}
          >
            {checkIns[todayKey]?.checkOutTime ? `✅ 퇴근 ${checkIns[todayKey].checkOutTime}` : '🌙 퇴근 체크'}
          </button>
        </div>
        {(reservationsByDate[todayKey] || []).length > 0 && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            오늘 예약 {(reservationsByDate[todayKey] || []).length}건 · 체크 시 산모님께 알림이 전송됩니다
          </p>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">‹</button>
          <h2 className="font-bold text-gray-800">{currentYear}년 {currentMonth + 1}월</h2>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">›</button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`text-center text-xs font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dateKey = toDateKey(day);
            const dayReservations = reservationsByDate[dateKey] || [];
            const hasReservation = dayReservations.length > 0;
            const isSelected = selectedDate === dateKey;
            const dayOfWeek = idx % 7;
            const statusPriority = ['confirmed', 'pending', 'completed', 'cancelled'];
            const topStatus = statusPriority.find(s => dayReservations.some(r => r.status === s));
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(isSelected ? '' : dateKey)}
                className={`relative flex flex-col items-center py-2 rounded-xl transition-all ${
                  isSelected ? 'bg-pink-500 text-white shadow-md' :
                  isToday(day) ? 'bg-pink-50 border border-pink-300' :
                  hasReservation ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`text-sm font-bold ${
                  isSelected ? 'text-white' :
                  dayOfWeek === 0 ? 'text-red-400' :
                  dayOfWeek === 6 ? 'text-blue-400' :
                  isToday(day) ? 'text-pink-600' : 'text-gray-700'
                }`}>{day}</span>
                {hasReservation && topStatus && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : STATUS_MAP[topStatus]?.dot}`} />
                )}
                {hasReservation && dayReservations.length > 1 && (
                  <span className={`text-[9px] font-bold mt-0.5 ${isSelected ? 'text-pink-100' : 'text-gray-400'}`}>+{dayReservations.length}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
          {Object.entries(STATUS_MAP).slice(0, 3).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${val.dot}`} />
              <span className="text-xs text-gray-400">{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">
            {selectedDate} 예약 {selectedReservations.length > 0 ? `(${selectedReservations.length}건)` : '없음'}
          </h3>
          {selectedReservations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">이 날은 예약이 없어요.</p>
          ) : (
            <div className="space-y-3">
              {selectedReservations.map((r: Reservation) => {
                const st = STATUS_MAP[r.status] || STATUS_MAP.pending;
                const hasReport = !!visitReports[r._id];
                return (
                  <div key={r._id} className="p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-700">
                          {r.userEmail ? r.userEmail.split('@')[0] : '산모'} 산모님
                        </p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${st.badge}`}>{st.label}</span>
                    </div>
                    {/* 방문 기록 버튼 */}
                    <button
                      onClick={() => openReportModal(r)}
                      className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        hasReport
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100'
                      }`}
                    >
                      <FiFileText size={13} />
                      {hasReport ? '✅ 방문 기록 수정' : '방문 기록 작성'}
                    </button>
                    {hasReport && (
                      <div className="mt-2 px-3 py-2 bg-white rounded-xl border border-gray-100 text-xs text-gray-500">
                        <p className="font-bold text-gray-600 mb-1">기록된 활동:</p>
                        <p>{visitReports[r._id].activities.join(', ')}</p>
                        {visitReports[r._id].notes && <p className="mt-1 text-gray-400">{visitReports[r._id].notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 전체 예약 목록 */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">📅</p>
          <p className="text-gray-400 text-sm">아직 예약이 없어요.</p>
          <p className="text-gray-400 text-xs mt-1">산모님들이 예약하면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">전체 예약 목록</h3>
          <div className="space-y-2">
            {reservations.map((r: Reservation) => {
              const st = STATUS_MAP[r.status] || STATUS_MAP.pending;
              const hasReport = !!visitReports[r._id];
              return (
                <div key={r._id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700">
                        {r.userEmail ? r.userEmail.split('@')[0] : '—'} 산모님
                      </p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.badge}`}>{st.label}</span>
                    <button
                      onClick={() => openReportModal(r)}
                      className={`p-1.5 rounded-lg transition-colors ${hasReport ? 'text-green-500' : 'text-gray-300 hover:text-pink-400'}`}
                      title="방문 기록"
                    >
                      <FiFileText size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 방문 기록 작성 모달 */}
      {showReportModal && reportTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
              <div>
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiFileText className="text-pink-500" /> 방문 기록 작성
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {reportTarget.date} · {reportTarget.userEmail?.split('@')[0]} 산모님
                </p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <FiX size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* 활동 체크박스 */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">오늘 수행한 활동 (복수 선택)</p>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map(activity => (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border ${
                        selectedActivities.includes(activity)
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {selectedActivities.includes(activity) ? '✓ ' : ''}{activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">추가 메모 (선택)</p>
                <textarea
                  value={reportNotes}
                  onChange={e => setReportNotes(e.target.value)}
                  placeholder="산모님 상태, 특이사항, 전달사항 등을 자유롭게 기록하세요."
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 resize-none"
                />
              </div>

              <button
                onClick={handleSaveReport}
                disabled={reportSaving || selectedActivities.length === 0}
                className="w-full bg-pink-500 text-white py-3 rounded-2xl font-bold text-sm hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {reportSaving ? '저장 중...' : '기록 저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
