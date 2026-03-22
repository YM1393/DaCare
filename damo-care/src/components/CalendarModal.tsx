'use client';

import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import type { Reservation } from '@/types';

interface CalendarModalProps {
  helperName: string;
  helperId: string;
  onClose: () => void;
  onConfirm: (date: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarModal({ helperName, helperId, onClose, onConfirm }: CalendarModalProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [reservedDates, setReservedDates] = useState<string[]>([]);

  useEffect(() => {
    if (!helperId) return;
    fetch(`/api/reservations/helper/${helperId}`)
      .then(r => r.json())
      .then(data => setReservedDates(data.map((r: Pick<Reservation, 'date'>) => r.date)))
      .catch(() => {});
  }, [helperId]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toDateStr = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const isToday = (d: number) => {
    const t = today;
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d;
  };
  const isPast = (d: number) => new Date(year, month, d) < new Date(today.toDateString());
  const isReserved = (d: number) => reservedDates.includes(toDateStr(d));
  const isSelected = (d: number) => selectedDate === toDateStr(d);

  const handleSelect = (d: number) => {
    if (isPast(d) || isReserved(d)) return;
    setSelectedDate(toDateStr(d));
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-in fade-in slide-in-from-bottom-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-800">예약 날짜 선택</h2>
            <p className="text-xs text-pink-500 font-medium mt-0.5">{helperName} 도우미님</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FiX size={20} />
          </button>
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between px-6 py-3">
          <button onClick={prevMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-gray-500">
            <FiChevronLeft size={18} />
          </button>
          <span className="font-bold text-gray-700">{year}년 {month + 1}월</span>
          <button onClick={nextMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-gray-500">
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 px-4 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-xs font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {w}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 px-4 pb-4 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const past = isPast(d);
            const reserved = isReserved(d);
            const selected = isSelected(d);
            const today_ = isToday(d);
            const dow = (firstDay + d - 1) % 7;

            let cellClass = 'w-full aspect-square flex items-center justify-center text-sm rounded-full transition-all ';
            if (selected) {
              cellClass += 'bg-pink-500 text-white font-bold shadow-md';
            } else if (reserved) {
              cellClass += 'bg-red-50 text-red-300 line-through cursor-not-allowed text-xs';
            } else if (past) {
              cellClass += 'text-gray-200 cursor-not-allowed';
            } else if (today_) {
              cellClass += 'border-2 border-pink-400 text-pink-500 font-bold cursor-pointer hover:bg-pink-50';
            } else {
              cellClass += `cursor-pointer hover:bg-pink-50 font-medium ${dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-700'}`;
            }

            return (
              <button key={d} onClick={() => handleSelect(d)} className={cellClass} disabled={past || reserved}>
                {d}
              </button>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="flex gap-4 px-6 pb-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />선택</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-200 inline-block" />예약됨</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-pink-400 inline-block" />오늘</span>
        </div>

        {/* 선택된 날짜 표시 & 확인 버튼 */}
        <div className="px-6 pb-6 pt-2 border-t border-gray-50">
          {selectedDate ? (
            <p className="text-center text-sm text-gray-500 mb-3">
              <span className="font-bold text-pink-500">{selectedDate}</span> 예약하시겠어요?
            </p>
          ) : (
            <p className="text-center text-xs text-gray-400 mb-3">날짜를 선택해주세요</p>
          )}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm text-gray-500 hover:bg-gray-50 font-medium">
              취소
            </button>
            <button
              onClick={() => selectedDate && onConfirm(selectedDate)}
              disabled={!selectedDate}
              className="flex-1 py-3 bg-pink-500 text-white rounded-2xl text-sm font-bold hover:bg-pink-600 disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <FiCalendar size={14} /> 예약 신청
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
