'use client';

import { useState, useEffect } from 'react';

const QUESTIONS = [
  { q: '웃을 수 있었고 사물의 재미있는 면을 볼 수 있었다.', opts: ['평소와 마찬가지였다', '평소보다 덜했다', '확실히 평소보다 덜했다', '전혀 그렇지 못했다'], reverse: true },
  { q: '즐거운 일들을 기대할 수 있었다.', opts: ['평소와 마찬가지였다', '평소보다 덜했다', '확실히 평소보다 덜했다', '전혀 그렇지 못했다'], reverse: true },
  { q: '일이 잘못되면 나 자신을 불필요하게 자책하였다.', opts: ['아니오, 전혀 그렇지 않았다', '별로 그렇지 않았다', '가끔 그랬다', '예, 자주 그랬다'], reverse: false },
  { q: '별 이유 없이 불안하거나 걱정이 되었다.', opts: ['아니오, 전혀 그렇지 않았다', '거의 그렇지 않았다', '가끔 그랬다', '자주 그랬다'], reverse: false },
  { q: '별 이유 없이 무섭거나 당황스러운 느낌이 들었다.', opts: ['아니오, 전혀 그렇지 않았다', '별로 그렇지 않았다', '가끔 그랬다', '자주 그랬다'], reverse: false },
  { q: '여러 가지 일들이 힘들게 느껴졌다.', opts: ['아니오, 평소와 다름없이 잘 해냈다', '아니오, 대체로 잘 해냈다', '예, 가끔 평소처럼 잘 해내지 못했다', '예, 대부분 해낼 수가 없었다'], reverse: false },
  { q: '너무 불행해서 잠을 잘 자지 못했다.', opts: ['아니오, 전혀 그렇지 않았다', '별로 그렇지 않았다', '가끔 그랬다', '자주 그랬다'], reverse: false },
  { q: '슬프거나 비참한 느낌이 들었다.', opts: ['아니오, 전혀 그렇지 않았다', '별로 그렇지 않았다', '가끔 그랬다', '자주 그랬다'], reverse: false },
  { q: '너무 불행해서 울었다.', opts: ['아니오, 전혀 그렇지 않았다', '별로 그렇지 않았다', '가끔 그랬다', '예, 자주 그랬다'], reverse: false },
  { q: '자해하고 싶은 생각이 들었다.', opts: ['전혀 없었다', '거의 없었다', '가끔 있었다', '자주 있었다'], reverse: false },
];

export default function DepressionCheckPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<{ score: number; date: string } | null>(null);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('epds_result');
    if (saved) { try { setLastResult(JSON.parse(saved)); } catch {} }
  }, []);

  const selectAnswer = (optIdx: number) => {
    const q = QUESTIONS[current];
    const rawScore = q.reverse ? 3 - optIdx : optIdx;
    const newAnswers = [...answers, rawScore];
    setAnswers(newAnswers);
    if (current + 1 >= QUESTIONS.length) {
      const total = newAnswers.reduce((a, b) => a + b, 0);
      setScore(total);
      setDone(true);
      localStorage.setItem('epds_result', JSON.stringify({ score: total, date: new Date().toLocaleDateString('ko-KR') }));
    } else {
      setCurrent(current + 1);
    }
  };

  const reset = () => { setCurrent(0); setAnswers([]); setDone(false); setScore(0); setShowCheck(true); };

  const getResult = (s: number) => {
    if (s <= 8) return { level: '정상', color: 'bg-green-100 text-green-700 border-green-200', msg: '산후 우울증 위험이 낮아요 😊', detail: '현재 정서 상태가 양호합니다. 앞으로도 충분한 휴식과 사랑하는 사람들과의 소통을 유지하세요.' };
    if (s <= 12) return { level: '경증', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', msg: '가벼운 우울감이 있어요', detail: '가족과 대화해보세요. 가벼운 우울감은 도움을 요청하면 나아질 수 있어요.' };
    return { level: '주의', color: 'bg-red-100 text-red-700 border-red-200', msg: '전문가 상담을 권장합니다', detail: '산모 안심센터(☎ 1588-7100)를 이용해보세요. 혼자 이겨내려 하지 말고 전문가의 도움을 받으세요.' };
  };

  if (!showCheck && lastResult) {
    const r = getResult(lastResult.score);
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">산후 우울증 자가 체크 💙</h1>
        <div className={`border rounded-2xl p-6 mb-6 ${r.color}`}>
          <p className="text-xs mb-1">마지막 검사: {lastResult.date}</p>
          <p className="text-3xl font-bold mb-2">{lastResult.score}점</p>
          <p className="font-bold text-lg mb-2">{r.msg}</p>
          <p className="text-sm">{r.detail}</p>
        </div>
        <button onClick={() => setShowCheck(true)}
          className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600">
          다시 검사하기
        </button>
      </div>
    );
  }

  if (done) {
    const r = getResult(score);
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">검사 결과 💙</h1>
        <div className={`border-2 rounded-3xl p-8 mb-6 text-center ${r.color}`}>
          <p className="text-5xl font-bold mb-3">{score}<span className="text-xl font-normal">점</span></p>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-3 border ${r.color}`}>{r.level}</span>
          <p className="text-xl font-bold mb-3">{r.msg}</p>
          <p className="text-sm leading-relaxed">{r.detail}</p>
        </div>
        <button onClick={reset} className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600">
          다시 검사하기
        </button>
      </div>
    );
  }

  const q = QUESTIONS[current];
  const progress = Math.round((current / QUESTIONS.length) * 100);

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">산후 우울증 자가 체크 💙</h1>
      <p className="text-xs text-gray-400 mb-4">EPDS (Edinburgh Postnatal Depression Scale)</p>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div className="bg-blue-400 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{current + 1}/10</span>
      </div>

      {/* Question */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
        <p className="text-sm font-bold text-gray-700 leading-relaxed">{q.q}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => selectAnswer(i)}
            className="w-full text-left p-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
