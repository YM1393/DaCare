'use client';

import { useState, useEffect } from 'react';
import { FiCoffee, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const STAGES = [
  {
    range: [0, 7],
    label: '초기 회복기 (출산 후 1주)',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    desc: '자궁 수축과 산후 출혈 회복에 집중할 시기입니다. 소화가 쉬운 음식을 소량씩 드세요.',
    recommended: [
      { name: '미역국', why: '요오드와 철분이 풍부해 산후 회복에 필수' },
      { name: '흰 쌀죽', why: '소화 부담이 적고 영양 보충에 좋음' },
      { name: '연두부', why: '단백질 공급, 소화 흡수 쉬움' },
      { name: '따뜻한 물/보리차', why: '수분 보충, 모유 분비 촉진' },
      { name: '닭고기 (닭죽)', why: '고단백 저지방, 체력 회복' },
    ],
    avoid: ['차가운 음식', '생선회', '날음식', '자극적인 음식', '카페인'],
    tip: '하루 8~10컵 이상의 따뜻한 수분을 섭취하세요. 모유수유 중이라면 더 많은 수분이 필요합니다.',
  },
  {
    range: [8, 14],
    label: '회복 진행기 (2주차)',
    color: 'from-orange-400 to-rose-400',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: '체력이 서서히 돌아오는 시기입니다. 단백질과 철분 보충에 집중하세요.',
    recommended: [
      { name: '미역국', why: '지속적으로 섭취 권장' },
      { name: '소고기 국물', why: '철분과 아연 보충, 빈혈 예방' },
      { name: '시금치 나물', why: '엽산과 철분 풍부' },
      { name: '두부 요리', why: '식물성 단백질, 칼슘 공급' },
      { name: '달걀', why: '완전 단백질, DHA 함유로 모유 품질 향상' },
    ],
    avoid: ['술', '탄산음료', '인스턴트 식품', '고염 음식'],
    tip: '철분 흡수를 위해 비타민C가 풍부한 채소·과일을 함께 드세요.',
  },
  {
    range: [15, 42],
    label: '일반 산후 조리기 (3~6주)',
    color: 'from-pink-400 to-fuchsia-400',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    desc: '영양 균형을 맞추며 모유 분비를 최적화할 시기입니다.',
    recommended: [
      { name: '현미밥', why: '복합 탄수화물, 에너지 지속 공급' },
      { name: '연어·고등어', why: '오메가-3 풍부, 산후 우울감 완화' },
      { name: '견과류 (호두·아몬드)', why: 'DHA·비타민E, 모유 영양 강화' },
      { name: '우유·두유', why: '칼슘 보충, 골밀도 유지' },
      { name: '각종 채소 비빔밥', why: '비타민·미네랄 균형 섭취' },
    ],
    avoid: ['알코올', '고카페인 음료', '날음식', '과도한 자극성 음식'],
    tip: '모유수유 중이라면 하루 약 500kcal를 추가로 섭취해야 합니다.',
  },
  {
    range: [43, 9999],
    label: '산후 조리 이후',
    color: 'from-purple-400 to-pink-400',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: '일상으로 돌아가면서 균형 잡힌 식단을 유지하세요.',
    recommended: [
      { name: '다양한 채소·과일', why: '항산화 영양소로 면역력 강화' },
      { name: '통곡물 위주 식사', why: '혈당 안정, 지속적인 에너지' },
      { name: '등푸른 생선', why: '오메가-3로 뇌 건강, 기분 향상' },
      { name: '발효 식품 (요거트·김치)', why: '장 건강, 면역력 향상' },
      { name: '철분·칼슘 보충제', why: '수유 중 영양 결핍 예방' },
    ],
    avoid: ['과도한 다이어트', '단기간 체중 감량 식단'],
    tip: '수유 중 급격한 다이어트는 모유 품질을 떨어뜨릴 수 있어요. 서서히 건강하게 회복하세요.',
  },
];

function getStage(days: number | null) {
  if (days === null) return null;
  return STAGES.find(s => days >= s.range[0] && days <= s.range[1]) || STAGES[STAGES.length - 1];
}

export default function NutritionPage() {
  const [daysAfter, setDaysAfter] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<(typeof STAGES)[0] | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('birthDate');
    if (saved) {
      const birth = new Date(saved);
      const diff = Math.floor((new Date().getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      setDaysAfter(diff);
      setSelectedStage(getStage(diff));
    }
  }, []);

  const stage = selectedStage || STAGES[0];

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FiCoffee className="text-pink-500" /> 영양 식단 추천
        </h1>
        <p className="text-gray-500 mt-1 text-sm">산후 회복 단계별 맞춤 영양 정보를 확인하세요.</p>
      </div>

      {daysAfter !== null && (
        <div className={`bg-gradient-to-r ${stage.color} text-white rounded-3xl p-6 mb-8 shadow-lg`}>
          <p className="text-sm opacity-80">현재 단계</p>
          <h2 className="text-xl font-bold mt-1">{stage.label}</h2>
          <p className="text-sm opacity-90 mt-2">{stage.desc}</p>
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 inline-block">
            <span className="font-bold">D+{daysAfter}</span>
            <span className="text-sm ml-1 opacity-80">출산 후 {daysAfter}일째</span>
          </div>
        </div>
      )}

      {/* Stage selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STAGES.map((s, i) => (
          <button key={i} onClick={() => setSelectedStage(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              selectedStage === s || (!selectedStage && i === 0)
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
            }`}>
            {i + 1}단계: {s.label.split('(')[0].trim()}
          </button>
        ))}
      </div>

      <div className={`${stage.bg} border ${stage.border} rounded-3xl p-6 mb-6`}>
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiCheckCircle className="text-green-500" /> 권장 식품
        </h3>
        <div className="space-y-3">
          {stage.recommended.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm">
              <span className="text-lg">🍽️</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FiAlertCircle className="text-red-400" /> 피해야 할 식품
        </h3>
        <div className="flex flex-wrap gap-2">
          {stage.avoid.map((item, i) => (
            <span key={i} className="px-3 py-1.5 bg-white border border-red-100 text-red-500 rounded-full text-xs font-medium">
              ✕ {item}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5">
        <p className="text-sm text-yellow-800 font-medium flex items-start gap-2">
          <span className="text-base">💡</span>
          {stage.tip}
        </p>
      </div>

      {!daysAfter && (
        <div className="mt-8 bg-pink-50 border border-pink-100 rounded-3xl p-6 text-center">
          <p className="text-gray-600 text-sm">
            마이페이지에서 출산일을 입력하면<br />
            <span className="text-pink-500 font-bold">현재 단계에 맞는 식단이 자동으로 표시됩니다.</span>
          </p>
        </div>
      )}
    </div>
  );
}
