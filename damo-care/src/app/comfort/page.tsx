'use client';

import { FiHeart, FiShield, FiSun, FiUsers, FiMessageCircle, FiStar } from 'react-icons/fi';

const comfortMessages = [
  "출산 후의 몸과 마음이 회복되는 데는 시간이 필요합니다. 조급해하지 마세요.",
  "아기를 잘 돌보려면 먼저 엄마가 건강해야 합니다. 당신의 쉼도 중요해요.",
  "완벽한 엄마는 없어요. 최선을 다하는 당신, 이미 충분히 훌륭합니다.",
  "힘들다고 느끼는 순간도 모두 지나갑니다. 다케어가 곁에 있을게요.",
  "도움을 요청하는 것은 약함이 아니라 용기입니다.",
];

const services = [
  {
    icon: FiHeart,
    title: '산후 신체 회복 케어',
    desc: '전문 도우미가 산모의 체력 회복을 돕습니다. 마사지, 좌욕, 영양 관리를 지원해드려요.',
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
  {
    icon: FiShield,
    title: '신생아 전문 케어',
    desc: '목욕, 수유 지도, 신생아 건강 체크까지. 아기의 첫 시작을 전문가와 함께해요.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: FiSun,
    title: '산후 정서 지원',
    desc: '산후우울증 예방을 위한 정서적 지지와 상담을 제공합니다. 언제든 이야기를 나눠요.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
  },
  {
    icon: FiUsers,
    title: '가족 교육 프로그램',
    desc: '배우자와 함께하는 육아 교육. 가족 모두가 아기를 맞이할 준비를 할 수 있어요.',
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
];

const faqs = [
  {
    q: '도우미는 어떻게 선발되나요?',
    a: '다케어 도우미는 산후조리 관련 자격증 보유자 또는 현장 경력자를 대상으로 엄격한 심사와 관리자 승인 과정을 거칩니다.',
  },
  {
    q: '서비스 이용 기간은 어떻게 되나요?',
    a: '출산 후 2주~4주를 기본으로 하며, 산모와 가족의 상황에 따라 유동적으로 조정 가능합니다.',
  },
  {
    q: '야간 케어도 가능한가요?',
    a: '야간 전담 도우미를 별도로 연결해드릴 수 있습니다. 예약 시 야간 케어 옵션을 선택해주세요.',
  },
  {
    q: '갑작스러운 일정 변경이 생기면 어떻게 하나요?',
    a: '예약 변경은 서비스 시작 24시간 전까지 가능합니다. 채팅 상담이나 마이페이지에서 변경 요청을 남겨주세요.',
  },
];

export default function ComfortPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">

      {/* 히어로 섹션 */}
      <section className="text-center py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <FiHeart size={14} /> 다케어와 함께라면 괜찮아요
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
            출산 후 가장 특별한 시간,<br />
            <span className="text-pink-500">다케어가 함께합니다</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            산모와 신생아를 위한 전문 케어 서비스.<br />
            지치고 불안한 순간에도 다케어가 든든하게 옆을 지킵니다.
          </p>
        </div>
      </section>

      {/* 오늘의 안심 메시지 */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-5 flex items-center gap-2">
            <FiStar className="text-yellow-400" /> 오늘의 응원 메시지
          </h2>
          <div className="space-y-3">
            {comfortMessages.map((msg, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-pink-50/60 rounded-2xl">
                <span className="text-pink-400 mt-0.5">💗</span>
                <p className="text-gray-700 text-sm leading-relaxed">{msg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">다케어 서비스 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((s, i) => (
            <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-6`}>
              <s.icon className={`${s.color} mb-3`} size={28} />
              <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">이용 방법</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          {[
            { step: '01', title: '회원가입', desc: '산모로 회원가입' },
            { step: '02', title: '도우미 탐색', desc: '지역·경력별 도우미 검색' },
            { step: '03', title: '예약 신청', desc: '원하는 날짜와 서비스 선택' },
            { step: '04', title: '케어 시작', desc: '전문 도우미와 함께' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-2">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center mx-auto mb-2 text-sm">
                  {item.step}
                </div>
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
              {i < 3 && <div className="hidden md:block text-pink-300 text-xl font-light">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">자주 묻는 질문</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="font-bold text-gray-800 mb-2 flex items-start gap-2">
                <span className="text-pink-500 font-bold">Q.</span> {faq.q}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed pl-5">
                <span className="text-blue-400 font-bold">A.</span> {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 상담 CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="bg-pink-500 text-white rounded-3xl p-10">
          <FiMessageCircle className="mx-auto mb-4" size={36} />
          <h3 className="text-2xl font-bold mb-3">궁금한 점이 있으신가요?</h3>
          <p className="text-pink-100 mb-6 text-sm">
            오전 10시~오후 6시에는 전문 도우미가,<br />
            그 외 시간에는 AI가 24시간 답변해드립니다.
          </p>
          <button
            onClick={() => document.querySelector<HTMLButtonElement>('.fixed.bottom-6')?.click()}
            className="bg-white text-pink-500 font-bold px-8 py-3 rounded-xl hover:bg-pink-50 transition-colors"
          >
            채팅 상담 시작하기
          </button>
        </div>
      </section>

    </div>
  );
}
