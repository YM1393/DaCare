'use client';

import { useState, useEffect } from 'react';

const STAGES = [
  {
    range: [0, 7],
    title: '1단계: 초기 회복 (D+0~7)',
    desc: '침대에서 할 수 있는 가벼운 운동만 권장합니다.',
    exercises: [
      { name: '복식 호흡', duration: '5분', desc: '누운 상태에서 배로 숨쉬기. 하루 3회', emoji: '🫁' },
      { name: '발목 운동', duration: '3분', desc: '발목 돌리기, 위아래 움직이기', emoji: '🦶' },
      { name: '케겔 운동', duration: '5분', desc: '골반 근육 수축-이완 10회 반복', emoji: '💪' },
    ],
    caution: '아직 격렬한 운동은 금물! 통증이 있으면 즉시 중단하세요.',
  },
  {
    range: [8, 21],
    title: '2단계: 점진적 회복 (D+8~21)',
    desc: '가벼운 스트레칭과 걷기를 시작할 수 있어요.',
    exercises: [
      { name: '실내 걷기', duration: '10분', desc: '천천히 집 안을 걷기. 하루 2-3회', emoji: '🚶' },
      { name: '골반 기울이기', duration: '5분', desc: '누워서 골반을 앞뒤로 기울이기 10회', emoji: '🧘' },
      { name: '어깨 스트레칭', duration: '5분', desc: '수유 자세로 뭉친 어깨 풀기', emoji: '💆' },
    ],
    caution: '오로가 증가하면 운동 강도를 줄이세요.',
  },
  {
    range: [22, 42],
    title: '3단계: 활동 증가 (D+22~42)',
    desc: '야외 산책과 코어 운동을 시작할 수 있어요.',
    exercises: [
      { name: '야외 산책', duration: '20-30분', desc: '아기와 함께 가벼운 산책', emoji: '🌸' },
      { name: '브릿지 운동', duration: '10분', desc: '누워서 엉덩이 들기 15회 3세트', emoji: '🌉' },
      { name: '복근 운동 (초급)', duration: '10분', desc: '무릎 구부린 상태의 크런치 10회', emoji: '💪' },
    ],
    caution: '산부인과 6주 검진 후 의사 허가 받은 뒤 강도를 높이세요.',
  },
  {
    range: [43, 999],
    title: '4단계: 일상 복귀 (D+43~)',
    desc: '6주 검진을 마쳤다면 본격적인 운동을 시작해요.',
    exercises: [
      { name: '필라테스/요가', duration: '30-40분', desc: '산후 전문 클래스 추천', emoji: '🧘' },
      { name: '수영', duration: '30분', desc: '관절에 부담 없는 전신 운동', emoji: '🏊' },
      { name: '조깅', duration: '20-30분', desc: '골반 회복 확인 후 천천히 시작', emoji: '🏃' },
      { name: '근력 운동', duration: '30분', desc: '가벼운 무게부터 시작', emoji: '🏋️' },
    ],
    caution: '몸 신호에 귀 기울이고 무리하지 마세요.',
  },
];

export default function ExercisePage() {
  const [daysAfter, setDaysAfter] = useState<number | null>(null);
  const [openStages, setOpenStages] = useState<number[]>([]);

  useEffect(() => {
    const savedBirth = localStorage.getItem('birthDate');
    if (savedBirth) {
      const diff = Math.floor((Date.now() - new Date(savedBirth).getTime()) / 86400000);
      setDaysAfter(diff);
    }
  }, []);

  const currentStageIdx = daysAfter !== null
    ? STAGES.findIndex(s => daysAfter >= s.range[0] && daysAfter <= s.range[1])
    : -1;

  const toggleStage = (idx: number) => {
    setOpenStages(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const nextStageIn = (stageIdx: number) => {
    if (stageIdx < 0 || stageIdx >= STAGES.length - 1) return null;
    const nextRange = STAGES[stageIdx + 1].range[0];
    return nextRange - (daysAfter ?? 0);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">산후 운동 가이드 🤸</h1>
      {daysAfter !== null ? (
        <p className="text-sm text-gray-500 mb-6">출산 후 <span className="font-bold text-pink-500">D+{daysAfter}</span>일째예요</p>
      ) : (
        <p className="text-sm text-orange-500 mb-6">마이페이지에서 출산일을 입력하면 맞춤 단계를 볼 수 있어요.</p>
      )}

      {/* Current stage card */}
      {currentStageIdx >= 0 && (
        <div className="bg-pink-50 border-2 border-pink-400 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">현재 단계</span>
          </div>
          <h2 className="font-bold text-gray-800 mb-1">{STAGES[currentStageIdx].title}</h2>
          <p className="text-sm text-gray-600 mb-4">{STAGES[currentStageIdx].desc}</p>
          <div className="space-y-3 mb-4">
            {STAGES[currentStageIdx].exercises.map((ex, i) => (
              <div key={i} className="flex gap-3 bg-white rounded-xl p-3 border border-pink-100">
                <span className="text-2xl">{ex.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-gray-800">{ex.name}</p>
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{ex.duration}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{ex.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
            ⚠️ {STAGES[currentStageIdx].caution}
          </div>
          {nextStageIn(currentStageIdx) !== null && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">다음 단계까지 {nextStageIn(currentStageIdx)}일</p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-pink-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, 100 - (nextStageIn(currentStageIdx)! / (STAGES[currentStageIdx + 1].range[0] - STAGES[currentStageIdx].range[0])) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* All stages accordion */}
      <h2 className="font-bold text-gray-700 mb-3 text-sm">전체 운동 단계</h2>
      <div className="space-y-2">
        {STAGES.map((stage, idx) => {
          const isCurrent = idx === currentStageIdx;
          const isOpen = openStages.includes(idx);
          return (
            <div key={idx} className={`bg-white border rounded-2xl overflow-hidden ${isCurrent ? 'border-pink-300' : 'border-gray-100'}`}>
              <button onClick={() => toggleStage(idx)} className="w-full flex justify-between items-center p-4 text-left">
                <div>
                  {isCurrent && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold mr-2">현재</span>}
                  <span className="font-bold text-sm text-gray-700">{stage.title}</span>
                </div>
                <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-500 mb-3">{stage.desc}</p>
                  {stage.exercises.map((ex, i) => (
                    <div key={i} className="flex gap-3 mb-2 p-3 bg-gray-50 rounded-xl">
                      <span className="text-xl">{ex.emoji}</span>
                      <div>
                        <p className="font-bold text-xs text-gray-700">{ex.name} <span className="font-normal text-gray-400">· {ex.duration}</span></p>
                        <p className="text-xs text-gray-500">{ex.desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2 text-xs text-yellow-700 mt-2">⚠️ {stage.caution}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
