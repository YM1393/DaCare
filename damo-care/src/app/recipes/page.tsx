'use client';

import { useState, useEffect } from 'react';

const RECIPES = [
  { id: 1, category: '국/탕', emoji: '🍲', name: '미역국', time: '30분', difficulty: '쉬움', tags: ['산모 필수', '요오드 풍부'], desc: '출산 후 반드시 먹어야 할 산모 대표 음식', ingredients: ['미역 30g', '소고기 100g', '참기름 1T', '국간장 2T', '마늘 1T', '물 1.5L'], steps: ['미역을 30분 찬물에 불린 후 먹기 좋게 썬다', '냄비에 참기름 두르고 소고기 볶기', '미역 넣고 함께 볶다가 물 붓기', '끓어오르면 약불로 20분 더 끓이기', '국간장, 마늘로 간 맞추기'] },
  { id: 2, category: '국/탕', emoji: '🥣', name: '가물치 미역국', time: '40분', difficulty: '보통', tags: ['부기 제거', '단백질'], desc: '부종 제거와 회복에 탁월한 전통 산모 음식', ingredients: ['가물치 1마리', '미역 50g', '생강 1조각', '소금 약간', '물 2L'], steps: ['가물치 깨끗이 손질', '미역 불리기', '가물치와 물 넣고 1시간 끓이기', '미역 넣고 20분 더 끓이기', '소금으로 간하기'] },
  { id: 3, category: '반찬', emoji: '🥬', name: '시금치 나물', time: '15분', difficulty: '쉬움', tags: ['철분 풍부', '빈혈 예방'], desc: '출산 후 철분 보충에 좋은 간단 반찬', ingredients: ['시금치 200g', '참기름 1T', '간장 1T', '깨소금 1t', '마늘 1/2T'], steps: ['시금치 끓는 물에 30초 데치기', '찬물에 헹구고 물기 짜기', '양념 재료 넣고 조물조물 무치기'] },
  { id: 4, category: '반찬', emoji: '🐟', name: '북어 조림', time: '20분', difficulty: '쉬움', tags: ['단백질', '해독'], desc: '숙취 해소와 단백질 보충에 좋은 북어 조림', ingredients: ['북어채 100g', '간장 3T', '설탕 1T', '참기름 1T', '깨소금', '파 1대'], steps: ['북어채 물에 10분 불리기', '양념장 만들기', '팬에 북어채 볶다가 양념 넣기', '약불에서 졸이기', '깨소금 뿌려 마무리'] },
  { id: 5, category: '간식', emoji: '🌰', name: '호두 죽', time: '25분', difficulty: '쉬움', tags: ['두뇌 발달', '오메가3'], desc: '모유를 통해 아기 두뇌 발달을 돕는 호두 죽', ingredients: ['찹쌀 1/2컵', '호두 50g', '물 4컵', '소금 약간', '꿀 1T'], steps: ['찹쌀 1시간 불리기', '호두 믹서로 갈기', '찹쌀과 물 넣고 끓이기', '호두 넣고 약불로 10분', '소금, 꿀로 간하기'] },
  { id: 6, category: '음료', emoji: '🫖', name: '산모 보리차', time: '10분', difficulty: '쉬움', tags: ['수분 보충', '카페인 없음'], desc: '카페인 없이 수분을 보충할 수 있는 건강 차', ingredients: ['볶은 보리 2T', '물 1L', '대추 3알 (선택)'], steps: ['물에 보리와 대추 넣기', '끓어오르면 약불로 10분', '체로 걸러 따뜻하게 마시기'] },
  { id: 7, category: '음료', emoji: '🥛', name: '두유 호박죽', time: '20분', difficulty: '쉬움', tags: ['부기 제거', '비타민'], desc: '부기 제거에 효과적인 달콤한 호박죽', ingredients: ['단호박 1/4개', '두유 200ml', '찹쌀가루 2T', '꿀 1T', '소금 약간'], steps: ['단호박 찜기에 15분 찌기', '껍질 제거하고 으깨기', '두유, 찹쌀가루 넣고 중불로 끓이기', '걸쭉해지면 꿀, 소금으로 간하기'] },
  { id: 8, category: '간식', emoji: '🍌', name: '바나나 귀리 쿠키', time: '30분', difficulty: '보통', tags: ['에너지 보충', '수유 중 간식'], desc: '수유 중 에너지 보충을 위한 건강 간식', ingredients: ['바나나 2개', '귀리 1컵', '아몬드 30g', '꿀 2T', '계핏가루 1/2t'], steps: ['바나나 으깨기', '모든 재료 섞기', '한 스푼씩 베이킹 시트에 올리기', '180도 오븐 15분 굽기'] },
];

const CATEGORIES = ['전체', '국/탕', '반찬', '간식', '음료'];

export default function RecipesPage() {
  const [category, setCategory] = useState('전체');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recipe_favorites');
    if (saved) { try { setFavorites(JSON.parse(saved)); } catch {} }
  }, []);

  const toggleFav = (id: number) => {
    const updated = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('recipe_favorites', JSON.stringify(updated));
  };

  const filtered = category === '전체' ? RECIPES : RECIPES.filter(r => r.category === category);

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">산후 회복 레시피 🍲</h1>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${category === cat ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(recipe => {
          const isExpanded = expanded === recipe.id;
          const isFav = favorites.includes(recipe.id);
          return (
            <div key={recipe.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all cursor-pointer ${isExpanded ? 'col-span-2 md:col-span-3' : ''}`}>
              <div onClick={() => setExpanded(isExpanded ? null : recipe.id)} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl">{recipe.emoji}</span>
                  <button onClick={e => { e.stopPropagation(); toggleFav(recipe.id); }}
                    className={`text-lg transition-colors ${isFav ? 'text-red-400' : 'text-gray-200 hover:text-red-300'}`}>
                    ♥
                  </button>
                </div>
                <p className="font-bold text-gray-800 text-sm mb-1">{recipe.name}</p>
                <p className="text-xs text-gray-500 mb-2">{recipe.desc}</p>
                <div className="flex gap-1 flex-wrap mb-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">⏱ {recipe.time}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${recipe.difficulty === '쉬움' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{recipe.difficulty}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="text-xs bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full border border-pink-100">{tag}</span>
                  ))}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-sm text-gray-700 mb-2">재료</h3>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full flex-shrink-0" />{ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-700 mb-2">조리 방법</h3>
                      <ol className="space-y-1">
                        {recipe.steps.map((step, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-2">
                            <span className="font-bold text-pink-500 flex-shrink-0">{i + 1}.</span>{step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
