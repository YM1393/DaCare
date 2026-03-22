'use client';

import { useState } from 'react';

const AVOID_FOODS = [
  { emoji: '☕', name: '카페인', examples: '커피, 홍차, 에너지 음료', reason: '아기 수면 방해, 신경계 자극', level: '주의' },
  { emoji: '🍺', name: '알코올', examples: '맥주, 와인, 소주', reason: '모유로 전달되어 아기 발달에 영향', level: '금지' },
  { emoji: '🌶️', name: '매운 음식', examples: '고추장, 청양고추', reason: '아기 복통, 소화 문제 유발 가능', level: '주의' },
  { emoji: '🐟', name: '수은 함유 생선', examples: '참치(대형), 황새치, 상어', reason: '수은이 모유로 전달', level: '금지' },
  { emoji: '🥜', name: '땅콩류', examples: '땅콩, 땅콩버터', reason: '알레르기 반응 유발 가능', level: '주의' },
  { emoji: '🧅', name: '가스 유발 식품', examples: '양파, 마늘, 양배추', reason: '아기 복통, 가스 유발', level: '주의' },
  { emoji: '🍫', name: '초콜릿', examples: '다크 초콜릿, 카카오', reason: '카페인 성분 포함', level: '주의' },
  { emoji: '🥤', name: '탄산음료', examples: '콜라, 사이다', reason: '카페인 및 당분 과다', level: '주의' },
];

const GOOD_FOODS = [
  { emoji: '🥬', name: '시금치', benefit: '철분, 칼슘 풍부 → 빈혈 예방', tip: '데쳐서 나물로' },
  { emoji: '🐟', name: '연어 (소량)', benefit: 'DHA 풍부 → 아기 두뇌 발달', tip: '주 1-2회 섭취 권장' },
  { emoji: '🌰', name: '호두·견과류', benefit: '오메가3, 건강한 지방 공급', tip: '하루 한 줌 간식으로' },
  { emoji: '🥛', name: '저지방 유제품', benefit: '칼슘 공급 → 뼈 건강', tip: '우유, 요거트, 치즈' },
  { emoji: '🥦', name: '브로콜리', benefit: '비타민C, 칼슘, 철분', tip: '살짝 데쳐서 섭취' },
  { emoji: '🫚', name: '들기름', benefit: '오메가3 함유, 모유 질 향상', tip: '나물에 참기름 대신 활용' },
  { emoji: '🍠', name: '고구마', benefit: '비타민A, 식이섬유 풍부', tip: '변비 예방에 효과적' },
  { emoji: '🥚', name: '달걀', benefit: '완전 단백질, 콜린 풍부', tip: '하루 1-2개 권장' },
  { emoji: '💧', name: '물', benefit: '모유 생산의 핵심', tip: '하루 2-3L 충분한 수분 섭취' },
];

export default function BreastfeedingFoodsPage() {
  const [tab, setTab] = useState<'주의' | '권장'>('주의');
  const [search, setSearch] = useState('');

  const filteredAvoid = AVOID_FOODS.filter(f =>
    f.name.includes(search) || f.examples.includes(search) || f.reason.includes(search)
  );
  const filteredGood = GOOD_FOODS.filter(f =>
    f.name.includes(search) || f.benefit.includes(search) || f.tip.includes(search)
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">수유 중 식품 가이드 🥗</h1>
      <p className="text-sm text-gray-500 mb-6">수유 중 먹어야 할 것과 피해야 할 식품을 알아보세요</p>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="식품 검색..."
        className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-pink-300"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1">
        <button onClick={() => setTab('주의')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === '주의' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          🚫 주의 식품
        </button>
        <button onClick={() => setTab('권장')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === '권장' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          ✅ 권장 식품
        </button>
      </div>

      {tab === '주의' && (
        <div className="space-y-3">
          {filteredAvoid.map((food, i) => (
            <div key={i}
              className={`border rounded-2xl p-4 ${food.level === '금지' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{food.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-800 text-sm">{food.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${food.level === '금지' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {food.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{food.examples}</p>
                  <p className="text-xs text-gray-600">{food.reason}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredAvoid.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">검색 결과가 없어요.</p>}
        </div>
      )}

      {tab === '권장' && (
        <div className="space-y-3">
          {filteredGood.map((food, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{food.emoji}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm mb-1">{food.name}</p>
                  <p className="text-xs text-gray-600 mb-1">{food.benefit}</p>
                  <p className="text-xs text-green-600 font-medium">💡 {food.tip}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredGood.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">검색 결과가 없어요.</p>}
        </div>
      )}
    </div>
  );
}
