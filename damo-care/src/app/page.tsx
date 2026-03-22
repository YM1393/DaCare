'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiHeart, FiUsers, FiShield, FiStar, FiMapPin, FiArrowRight,
  FiMessageCircle, FiBookOpen, FiSmile, FiPlay, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { SkeletonCard } from '@/components/Skeleton';
import type { Helper } from '@/types';

// 히어로 슬라이드 데이터
const slides = [
  {
    bg: 'from-pink-400 via-pink-300 to-rose-200',
    badge: '🏅 검증된 전문가',
    title: '출산 후 가장\n소중한 시간,\n다케어와 함께해요',
    sub: '자격증 보유 전문 도우미의 1:1 산후케어로\n산모와 아기 모두 건강하게.',
  },
  {
    bg: 'from-purple-400 via-purple-300 to-pink-200',
    badge: '💬 24시간 상담',
    title: '언제든지 물어보세요,\n산모 안심센터가 함께해요',
    sub: '운영시간엔 전문 상담사, 그 외엔 AI가\n24시간 365일 응답해드립니다.',
  },
  {
    bg: 'from-rose-400 via-pink-300 to-orange-200',
    badge: '⭐ 실제 후기',
    title: '수백 명의 산모가 선택한\n믿을 수 있는 도우미',
    sub: '산모님들의 솔직한 후기를 확인하고\n나에게 맞는 도우미를 선택해보세요.',
  },
];

// 퀵 서비스 타일
const quickServices = [
  { icon: FiHeart, label: '산후도우미\n찾기', href: '/postpartum', color: 'bg-pink-500', desc: '전문\n도우미 탐색' },
  { icon: FiSmile, label: '산모\n안심센터', href: '/comfort', color: 'bg-rose-400', desc: '24시간\n상담' },
  { icon: FiUsers, label: '커뮤니티', href: '/community', color: 'bg-purple-500', desc: '산모 이야기\n공유' },
  { icon: FiBookOpen, label: '영양\n정보', href: '/nutrition', color: 'bg-orange-400', desc: '산모·아기\n영양관리' },
  { icon: FiMessageCircle, label: '채팅\n상담', href: '/messages', color: 'bg-blue-400', desc: '도우미와\n직접 대화' },
  { icon: FiStar, label: '성장\n기록', href: '/growth', color: 'bg-green-400', desc: '우리 아기\n성장 트래킹' },
];

// 신뢰 통계
const stats = [
  { num: '500+', label: '등록 도우미' },
  { num: '2,000+', label: '이용 산모' },
  { num: '4.9', label: '평균 평점' },
  { num: '24h', label: '상담 응답' },
];

// 후기 데이터
const testimonials = [
  { name: '김○○ 산모', area: '서울 강남', rating: 5, text: '처음엔 낯설었는데 도우미 선생님이 너무 친절하시고 전문적이었어요. 산후조리 기간이 정말 편안하게 지나갔습니다. 강력 추천드려요!' },
  { name: '이○○ 산모', area: '경기 수원', rating: 5, text: '다케어 덕분에 첫째 때보다 훨씬 수월하게 회복했어요. 모유수유 지도도 꼼꼼히 해주셔서 아기도 잘 먹고 있어요.' },
  { name: '박○○ 산모', area: '인천 연수', rating: 5, text: '24시간 채팅 상담이 정말 유용했어요. 새벽에 갑자기 걱정되는 게 생겨도 바로 답변해주셔서 너무 안심이 됐습니다.' },
  { name: '최○○ 산모', area: '서울 마포', rating: 5, text: '도우미 선생님 실력이 너무 좋으셔서 회복이 빨랐어요. 아이 목욕, 수유 자세 교정까지 꼼꼼하게 챙겨주셨습니다.' },
];

// 유튜브 영상 목록 (산후조리 관련 유튜브 ID)
const videos = [
  { id: 'xbPeUxcsMjs', title: '2026 산후케어 트렌드', sub: '선우케어TV · 최신 산후케어 트렌드를 알아보세요' },
  { id: 'R7cnvdJVZ38', title: '모유수유를 말하다!', sub: '리얼딱토크 · 모유수유 실전 이야기' },
  { id: 'rD6uJE90IUY', title: '엄마들이 가장 많이 하는 수면 실수', sub: '권향화 원장의 다울아이TV' },
  { id: 'RA6w8uXae9k', title: '수면교육으로 통잠 재우기', sub: '맘트미(MomTMI) · 만성피로 아기 수면교육' },
  { id: 'Pp1Dau9ChGI', title: '자연분만 성공을 위한 임산부 요가', sub: '안녕, 한빛 · 출산 전 필수 동작' },
  { id: '0WVg1DzqeGU', title: '임신 중 부종, 압박스타킹 착용해도 될까?', sub: '부천 서울여성병원TV' },
];

export default function Home() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/helpers')
      .then(res => res.json())
      .then(data => { setHelpers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // 슬라이드 자동 전환
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // 후기 자동 전환
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleReserve = async (helperName: string) => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return alert("로그인 후 이용 가능합니다.");
    const user = JSON.parse(savedUser);
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: user.email, helperName, date: new Date().toLocaleDateString() })
    });
    if (res.ok) alert(`${helperName} 도우미님 예약이 접수되었습니다!`);
  };

  const slide = slides[currentSlide];

  return (
    <>
      {/* ─── 히어로 슬라이더 ─── */}
      <section className="relative h-[560px] flex flex-col overflow-hidden">

        {/* 배경 사진 전체 — 왼쪽 중앙 기준으로 3명이 왼쪽에 보이게 */}
        <img
          src="/hero-bg.png"
          alt="산후케어"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '30% center' }}
        />

        {/* 오른쪽 절반 — 사진이 은은하게 비치는 흰 오버레이 */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, transparent 42%, rgba(255,255,255,0.72) 58%, rgba(255,255,255,0.82) 100%)' }} />

        {/* 슬라이드 컬러 — 오른쪽에만 아주 연하게 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} opacity-10 transition-all duration-700 pointer-events-none`}
          style={{ clipPath: 'inset(0 0 0 42%)' }} />

        {/* 내용 — 오른쪽 절반 */}
        <div className="relative z-10 flex-1 min-h-0 flex items-center overflow-hidden">
          <div className="w-full flex justify-end pr-6 md:pr-16">
            <div className="w-full md:w-1/2 text-right">
              <span className="inline-block bg-pink-100/80 text-pink-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                {slide.badge}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-5 whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-gray-500 text-base mb-8 whitespace-pre-line leading-relaxed">
                {slide.sub}
              </p>
              <div className="flex gap-4 justify-end flex-wrap">
                <Link href="/postpartum" className="bg-pink-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-lg flex items-center gap-2">
                  도우미 찾기 <FiArrowRight />
                </Link>
                <Link href="/comfort" className="bg-white text-pink-500 border border-pink-200 px-8 py-3.5 rounded-2xl font-bold hover:bg-pink-50 transition-all shadow-sm">
                  산모 안심센터
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 인디케이터 */}
        <div className="relative z-10 flex justify-end pr-16 gap-2 py-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 h-2.5 bg-pink-400' : 'w-2.5 h-2.5 bg-pink-200'
              }`}
            />
          ))}
        </div>

        {/* 좌우 화살표 */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-pink-400 rounded-full p-2 transition-all shadow-md z-10"
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-pink-400 rounded-full p-2 transition-all shadow-md z-10"
        >
          <FiChevronRight size={20} />
        </button>
      </section>

      {/* ─── 퀵 서비스 타일 ─── */}
      <section className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {quickServices.map((s, i) => (
            <Link key={i} href={s.href}
              className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`${s.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <s.icon size={22} />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight whitespace-pre-line">{s.label}</span>
              <span className="text-[10px] text-gray-400 text-center hidden md:block whitespace-pre-line">{s.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 신뢰 통계 ─── */}
      <section className="bg-pink-500 py-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-white">{s.num}</p>
                <p className="text-pink-100 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 영상 섹션 ─── */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block bg-pink-100 text-pink-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">동영상 가이드</span>
            <h2 className="text-3xl font-bold text-gray-800">전문가가 알려주는 산후조리 꿀팁</h2>
            <p className="text-gray-500 text-sm mt-2">산후케어·모유수유·수면교육까지, 전문가가 알려주는 실전 영상을 확인해보세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="relative bg-gray-900" style={{ paddingTop: '75%' }}>
                  <div className="absolute inset-0">
                    {playingVideo === i ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${v.id}?autoplay=1`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                          alt={v.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <button
                          onClick={() => setPlayingVideo(i)}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="bg-pink-500 hover:bg-pink-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                            <FiPlay size={26} className="ml-1" />
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-base mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-400">{v.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 왜 다케어? 특징 ─── */}
      <section className="container mx-auto px-6 py-16 max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">왜 다케어인가요?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: '🏅', title: '전문 산후케어', desc: '자격증 보유 도우미의 체계적인 산모·신생아 케어', bg: 'bg-pink-50', border: 'border-pink-100' },
            { icon: '🔍', title: '검증된 도우미', desc: '관리자 심사를 통과한 신뢰할 수 있는 전문가', bg: 'bg-blue-50', border: 'border-blue-100' },
            { icon: '💬', title: '24시간 상담', desc: '운영시간엔 도우미, 그 외엔 AI가 항상 응답', bg: 'bg-purple-50', border: 'border-purple-100' },
            { icon: '⭐', title: '실제 후기', desc: '산모님들의 솔직한 리뷰로 도우미를 선택', bg: 'bg-yellow-50', border: 'border-yellow-100' },
          ].map((f, i) => (
            <div key={i} className={`${f.bg} border ${f.border} rounded-2xl p-6 text-center hover:shadow-md transition-shadow`}>
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 후기 캐러셀 ─── */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <span className="inline-block bg-pink-100 text-pink-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">고객 후기</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-10">산모님들의 솔직한 이야기</h2>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100 min-h-[180px] flex flex-col justify-between transition-all duration-500">
            <p className="text-gray-600 leading-relaxed text-base mb-6">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-lg">👤</div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">{testimonials[currentTestimonial].name}</p>
                <p className="text-xs text-gray-400">{testimonials[currentTestimonial].area}</p>
              </div>
              <div className="ml-2 flex gap-0.5">
                {Array(testimonials[currentTestimonial].rating).fill(0).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
            </div>
          </div>

          {/* 후기 인디케이터 */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentTestimonial ? 'w-6 h-2 bg-pink-400' : 'w-2 h-2 bg-pink-200'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 추천 도우미 ─── */}
      <section className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-sm text-pink-500 font-semibold">지금 바로 만나보세요</span>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">추천 도우미</h2>
          </div>
          <Link href="/postpartum" className="text-pink-500 text-sm font-medium hover:underline flex items-center gap-1">
            전체 보기 <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : helpers.length > 0
              ? helpers.slice(0, 3).map((helper: Helper) => (
                  <div key={helper.id ?? helper._id ?? ''} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="h-44 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl">👤</div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{helper.name}</h3>
                          <p className="text-xs text-gray-400 flex items-center mt-0.5"><FiMapPin size={10} className="mr-1" />{helper.area}</p>
                        </div>
                        <div className="flex items-center text-yellow-500 text-sm font-bold">
                          <FiStar className="mr-0.5" size={14} />{helper.rating}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">경력 {helper.experience}년 · ₩{helper.price}/일</p>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/postpartum/${helper.id ?? helper._id ?? ''}`)} className="flex-1 border border-pink-400 text-pink-500 py-2 rounded-xl text-sm font-bold hover:bg-pink-50">상세보기</button>
                        <button onClick={() => handleReserve(helper.name ?? '')} className="flex-1 bg-pink-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-pink-600">예약하기</button>
                      </div>
                    </div>
                  </div>
                ))
              : (
                <div className="col-span-3 text-center py-16 text-gray-300 text-sm">
                  등록된 도우미가 없습니다.<br />
                  <Link href="/signup" className="text-pink-400 underline mt-2 inline-block">도우미로 가입하기</Link>
                </div>
              )
          }
        </div>
      </section>

      {/* ─── CTA 배너 ─── */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-400 py-16 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">지금 바로 시작해보세요</h2>
          <p className="text-pink-100 mb-8">전문 도우미와 함께라면 산후조리가 달라집니다.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup" className="bg-white text-pink-500 px-8 py-3.5 rounded-2xl font-bold hover:bg-pink-50 transition-all shadow-lg">
              회원가입 하기
            </Link>
            <Link href="/postpartum" className="bg-pink-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-pink-700 transition-all border border-pink-400">
              도우미 탐색하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
