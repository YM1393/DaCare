'use client';

import { useState } from 'react';
import {
  FiHome,
  FiCheckCircle,
  FiInfo,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiPhoneCall,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
} from 'react-icons/fi';

interface ServiceDetail {
  label: string;
  value: string;
}

interface Program {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  tag: string;
  tagBg: string;
  tagText: string;
  summary: string;
  details: ServiceDetail[];
  eligibility: string[];
  howToApply: string[];
  contact: string;
}

const programs: Program[] = [
  {
    id: 'sanmo-shinseongah',
    title: '산모·신생아 건강관리 지원사업',
    subtitle: '정부 바우처 지원',
    icon: FiHome,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    tag: '대표 지원',
    tagBg: 'bg-pink-100',
    tagText: 'text-pink-600',
    summary:
      '출산 가정에 산모·신생아 건강관리사를 파견하여 산모 건강관리 및 신생아 돌봄을 지원하는 정부 바우처 서비스입니다.',
    details: [
      { label: '지원 내용', value: '산모 건강관리(체조, 유방 관리, 영양 관리 등) + 신생아 돌봄(목욕, 수유 지도 등) + 산모 식사 준비 등 가사 지원' },
      { label: '서비스 기간', value: '표준형 10일 / 연장형 최대 20일 (쌍태아 이상·기저질환 등 단태아 최대 25일, 다태아 최대 40일)' },
      { label: '지원 금액', value: '가구 소득에 따라 정부 지원금 차등 지급 (A~라형 등급별 본인부담금 상이)' },
      { label: '신청 시기', value: '출산 예정일 40일 전부터 출산 후 30일 이내 신청 (출산일 기준)' },
    ],
    eligibility: [
      '출산(예정)일 기준 주민등록상 해당 시·군·구에 거주하는 출산 가정',
      '건강보험료 기준 중위소득 150% 이하 가구 (소득 무관 단태아 1자녀 지원 폐지 → 2024년부터 전 출산 가구 지원으로 확대)',
      '쌍태아·희귀·중증 질환 산모 등 우선 지원',
      '외국인 산모는 내국인 배우자와 혼인 관계여야 함',
    ],
    howToApply: [
      '복지로(www.bokjiro.go.kr) 온라인 신청 또는 주소지 관할 시·군·구 보건소 방문 신청',
      '신청서, 출산(예정)증명서, 건강보험료 납부확인서 제출',
      '바우처 발급 후 제공기관(다케어 포함) 직접 연결',
    ],
    contact: '보건복지부 콜센터 ☎ 129 / 복지로 www.bokjiro.go.kr',
  },
  {
    id: 'chulsan-jiwon',
    title: '출산 지원금 (첫만남이용권)',
    subtitle: '일시 현금 지급',
    icon: FiUsers,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    tag: '현금 지원',
    tagBg: 'bg-blue-100',
    tagText: 'text-blue-600',
    summary:
      '2022년부터 모든 출생아에게 지급하는 첫만남이용권(바우처)으로, 아기용품·의료비 등 초기 양육비를 지원합니다.',
    details: [
      { label: '지원 금액', value: '첫째아 200만 원 / 둘째아 이상 300만 원 (바우처 형태)' },
      { label: '지급 방식', value: '국민행복카드(바우처)로 지급 — 아기용품, 의료비, 산후조리원 등 사용 가능' },
      { label: '사용 기간', value: '출생일로부터 1년 이내' },
      { label: '지원 대상', value: '2022년 1월 1일 이후 출생아 전원 (소득 무관)' },
    ],
    eligibility: [
      '주민등록법상 출생신고 된 모든 신생아',
      '소득·재산 기준 없음 (전 가구 지원)',
      '외국 국적 아동도 부모 중 한 명이 내국인이면 지원 가능',
    ],
    howToApply: [
      '정부24(www.gov.kr) 또는 주민센터(동 행정복지센터) 출생신고 시 함께 신청',
      '출생신고 후 60일 이내 신청 권장',
      '국민행복카드 발급 금융기관(삼성·롯데·BC카드 등)에서 카드 수령',
    ],
    contact: '행정안전부 / 복지로 ☎ 129 / 정부24 www.gov.kr',
  },
  {
    id: 'bumogeupyeo',
    title: '부모급여',
    subtitle: '월 현금 지급',
    icon: FiCalendar,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
    tag: '매월 지원',
    tagBg: 'bg-green-100',
    tagText: 'text-green-600',
    summary:
      '만 0~1세 아동을 가정에서 양육하는 부모에게 매월 현금을 지급하여 초기 양육 부담을 줄여주는 제도입니다.',
    details: [
      { label: '지원 금액', value: '만 0세(0~11개월): 월 100만 원 / 만 1세(12~23개월): 월 50만 원' },
      { label: '지급 방식', value: '부모 계좌로 매월 25일 현금 직접 지급 (어린이집 이용 시 보육료 바우처로 대체)' },
      { label: '신청 기한', value: '출생일로부터 60일 이내 신청 시 소급 지급 (이후 신청은 신청 월부터 지급)' },
      { label: '지원 대상', value: '만 2세 미만 아동을 가정에서 양육하는 모든 부모 (소득 무관)' },
    ],
    eligibility: [
      '주민등록상 대한민국에 거주하는 만 0~1세(0~23개월) 아동의 부모',
      '소득·재산 기준 없음',
      '어린이집 이용 시 보육료 바우처로 차액 지급',
      '외국 국적 아동은 별도 기준 적용',
    ],
    howToApply: [
      '복지로(www.bokjiro.go.kr), 정부24(www.gov.kr), 행복출산 원스톱서비스 온라인 신청',
      '주민센터 방문 신청도 가능',
      '아동 주민등록 등록 후 신청 (출생신고와 동시 신청 권장)',
    ],
    contact: '보건복지부 콜센터 ☎ 129',
  },
  {
    id: 'yuah-hyeokeum',
    title: '아동수당',
    subtitle: '월 정기 지급',
    icon: FiCheckCircle,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    tag: '정기 지원',
    tagBg: 'bg-purple-100',
    tagText: 'text-purple-600',
    summary:
      '만 8세 미만 아동에게 매월 10만 원을 지급하여 아동 양육 가정의 경제적 부담을 경감하고 아동의 건강한 성장을 지원합니다.',
    details: [
      { label: '지원 금액', value: '월 10만 원 (현금 또는 지역상품권)' },
      { label: '지급 대상', value: '만 8세 미만(0~95개월) 모든 아동' },
      { label: '지급 방식', value: '부모 또는 보호자 계좌로 매월 25일 지급' },
      { label: '소득 기준', value: '없음 (전 가구 지원)' },
    ],
    eligibility: [
      '주민등록법상 대한민국에 거주하는 만 8세 미만 아동',
      '소득·재산 기준 없음',
      '복수 국적 또는 외국인 아동은 별도 요건 확인 필요',
    ],
    howToApply: [
      '복지로(www.bokjiro.go.kr) 온라인 신청 또는 주민센터 방문 신청',
      '출생신고 시 아동수당 함께 신청 가능 (원스톱 서비스)',
      '신청 월부터 지급 (소급 적용 없음, 빠른 신청 권장)',
    ],
    contact: '보건복지부 콜센터 ☎ 129 / 복지로 www.bokjiro.go.kr',
  },
  {
    id: 'sanhu-jori',
    title: '산후조리원 비용 지원',
    subtitle: '지자체별 지원',
    icon: FiFileText,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    tag: '지자체 지원',
    tagBg: 'bg-orange-100',
    tagText: 'text-orange-600',
    summary:
      '지방자치단체별로 산후조리원 비용 일부를 지원하는 사업으로, 거주 지역과 소득 수준에 따라 지원 금액이 다릅니다.',
    details: [
      { label: '지원 금액', value: '지자체별 상이 (예: 서울시 100만 원 내외, 일부 지자체 50~200만 원)' },
      { label: '지원 방식', value: '바우처 또는 현금 지원 (지자체에 따라 다름)' },
      { label: '신청 기한', value: '출산 후 일정 기간 이내 (지자체마다 상이, 보통 6개월 이내)' },
      { label: '소득 기준', value: '일부 지자체는 소득 제한 없음, 일부는 기준 중위소득 이하' },
    ],
    eligibility: [
      '해당 시·군·구에 주민등록이 된 출산 산모',
      '지자체별 거주 기간 요건 있음 (보통 3~6개월 이상)',
      '지자체별 소득 기준 상이',
    ],
    howToApply: [
      '주소지 관할 주민센터 또는 보건소 방문 신청',
      '일부 지자체는 복지로·정부24에서 온라인 신청 가능',
      '출생증명서, 주민등록등본, 산후조리원 영수증 등 구비서류 지참',
    ],
    contact: '거주지 시·군·구청 또는 보건소 문의',
  },
];

const faqs = [
  {
    q: '산모·신생아 건강관리 지원사업 신청은 언제 해야 하나요?',
    a: '출산 예정일 40일 전부터 출산 후 30일 이내에 신청할 수 있습니다. 바우처 발급 후 제공기관과 직접 일정을 조율하시면 됩니다. 서비스는 출산 후 60일 이내에 시작해야 합니다.',
  },
  {
    q: '소득 기준이 초과하면 이용이 불가능한가요?',
    a: '2024년부터 산모·신생아 건강관리 지원사업은 소득 기준이 대폭 완화되었습니다. 일부 유형은 전 소득 계층에 지원되며, 소득 초과 시에도 본인 부담금을 내고 이용할 수 있습니다. 구체적인 내용은 보건소 또는 복지로에서 확인하세요.',
  },
  {
    q: '부모급여와 아동수당을 동시에 받을 수 있나요?',
    a: '네, 중복 수혜가 가능합니다. 만 0~1세 아동은 부모급여(월 50~100만 원)와 아동수당(월 10만 원)을 동시에 받을 수 있습니다.',
  },
  {
    q: '다케어 서비스와 정부 바우처를 연계할 수 있나요?',
    a: '다케어는 정부 바우처 제공기관으로 등록된 파트너 도우미와 연결해 드립니다. 바우처 발급 후 다케어를 통해 도우미를 예약하시면 바우처로 비용을 결제할 수 있습니다.',
  },
  {
    q: '쌍둥이를 출산했을 때 지원이 달라지나요?',
    a: '다태아(쌍태아 이상)의 경우 산모·신생아 건강관리 지원 기간이 단태아보다 연장되며, 첫만남이용권도 아이 수만큼 지급됩니다. 부모급여와 아동수당도 아동 수만큼 지급됩니다.',
  },
];

export default function GovernmentSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const toggleProgram = (id: string) => {
    setExpandedProgram(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* 히어로 섹션 */}
      <section className="text-center py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <FiInfo size={14} /> 정부 공식 지원 안내
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
            산모·신생아를 위한<br />
            <span className="text-blue-500">정부 지원 사업 안내</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            출산 가정이 받을 수 있는 다양한 정부 지원 제도를 한눈에 확인하세요.<br />
            신청 방법부터 자격 요건까지 꼼꼼히 안내해드립니다.
          </p>
        </div>
      </section>

      {/* 알림 배너 */}
      <section className="max-w-4xl mx-auto px-6 mb-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <FiAlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <p className="text-amber-800 text-sm leading-relaxed">
            지원 내용 및 금액은 정부 정책 변경에 따라 달라질 수 있습니다. 신청 전 <strong>보건복지부(☎ 129)</strong> 또는 <strong>복지로(www.bokjiro.go.kr)</strong>에서 최신 정보를 반드시 확인하세요.
          </p>
        </div>
      </section>

      {/* 지원 사업 목록 */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">주요 지원 사업</h2>
        <div className="space-y-4">
          {programs.map((program) => {
            const Icon = program.icon;
            const isOpen = expandedProgram === program.id;
            return (
              <div
                key={program.id}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${program.border}`}
              >
                {/* 헤더 (항상 표시) */}
                <button
                  onClick={() => toggleProgram(program.id)}
                  className="w-full text-left p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`${program.bg} p-3 rounded-xl shrink-0`}>
                    <Icon className={program.color} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-800 text-base">{program.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${program.tagBg} ${program.tagText}`}>
                        {program.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{program.subtitle}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{program.summary}</p>
                  </div>
                  <div className="shrink-0 mt-1">
                    {isOpen
                      ? <FiChevronUp className="text-gray-400" size={20} />
                      : <FiChevronDown className="text-gray-400" size={20} />
                    }
                  </div>
                </button>

                {/* 상세 내용 (펼침) */}
                {isOpen && (
                  <div className={`px-6 pb-6 border-t ${program.border}`}>
                    {/* 지원 내용 */}
                    <div className="mt-5 mb-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FiInfo size={14} className={program.color} /> 지원 내용
                      </h4>
                      <div className="space-y-2">
                        {program.details.map((detail, i) => (
                          <div key={i} className={`${program.bg} rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:gap-3`}>
                            <span className={`text-xs font-bold ${program.color} shrink-0 mb-0.5 sm:mb-0 sm:w-24`}>
                              {detail.label}
                            </span>
                            <span className="text-sm text-gray-700 leading-relaxed">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 신청 자격 */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FiCheckCircle size={14} className={program.color} /> 신청 자격
                      </h4>
                      <ul className="space-y-1.5">
                        {program.eligibility.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className={`${program.color} mt-0.5 shrink-0`}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 신청 방법 */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FiFileText size={14} className={program.color} /> 신청 방법
                      </h4>
                      <ol className="space-y-1.5">
                        {program.howToApply.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                            <span className={`${program.bg} ${program.color} font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* 문의처 */}
                    <div className={`${program.bg} rounded-xl p-3 flex items-center gap-2`}>
                      <FiPhoneCall size={14} className={program.color} />
                      <p className="text-sm text-gray-700">{program.contact}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 단계별 신청 가이드 */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">신청 단계별 가이드</h2>
        <div className="relative">
          {/* 연결선 */}
          <div className="absolute left-5 top-8 bottom-8 w-px bg-blue-200 hidden sm:block" />
          <div className="space-y-4">
            {[
              {
                step: '01',
                title: '출생신고 (출산 후 1개월 이내)',
                desc: '주민센터 방문 또는 정부24 온라인 신청. 아동수당·첫만남이용권·부모급여 함께 신청 가능.',
                icon: '🏥',
              },
              {
                step: '02',
                title: '산모·신생아 건강관리 바우처 신청 (출산 후 30일 이내)',
                desc: '복지로 또는 관할 보건소에서 신청. 바우처 발급 후 다케어 등 제공기관에 연락.',
                icon: '📋',
              },
              {
                step: '03',
                title: '첫만남이용권 수령 및 사용',
                desc: '국민행복카드로 발급되며 출생일로부터 1년 이내 아기용품·의료비 등에 사용.',
                icon: '💳',
              },
              {
                step: '04',
                title: '부모급여 & 아동수당 수령 (매월)',
                desc: '신청 월부터 매월 25일 계좌로 지급. 아동이 만 2세(부모급여) / 만 8세(아동수당)가 될 때까지.',
                icon: '💰',
              },
              {
                step: '05',
                title: '지자체 추가 지원 확인',
                desc: '거주지 주민센터·보건소에서 산후조리원 지원, 출산 장려금 등 추가 혜택 조회.',
                icon: '🔍',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 text-sm z-10">
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <span>{item.icon}</span> {item.title}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-800 text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-blue-500 font-bold shrink-0">Q.</span> {faq.q}
                </p>
                {openFaq === i
                  ? <FiChevronUp className="text-gray-400 shrink-0 mt-0.5" size={18} />
                  : <FiChevronDown className="text-gray-400 shrink-0 mt-0.5" size={18} />
                }
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed pt-4 flex items-start gap-2">
                    <span className="text-blue-400 font-bold shrink-0">A.</span> {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 유용한 링크 */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">유용한 정보 링크</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: '복지로', desc: '정부 복지 서비스 통합 신청', url: 'https://www.bokjiro.go.kr', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
            { name: '정부24', desc: '출생신고 및 각종 증명서 발급', url: 'https://www.gov.kr', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
            { name: '건강보험공단', desc: '건강보험료 조회 및 임신·출산 진료비 지원', url: 'https://www.nhis.or.kr', color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
            { name: '보건복지부 콜센터', desc: '☎ 129 (24시간 운영)', url: 'tel:129', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
          ].map((link, i) => (
            <a
              key={i}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-4 ${link.bg} border ${link.border} rounded-2xl p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex-1">
                <p className={`font-bold ${link.color} mb-1`}>{link.name}</p>
                <p className="text-gray-500 text-sm">{link.desc}</p>
              </div>
              <FiExternalLink className={link.color} size={18} />
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="bg-blue-500 text-white rounded-3xl p-10">
          <FiPhoneCall className="mx-auto mb-4" size={36} />
          <h3 className="text-2xl font-bold mb-3">지원 신청이 어려우신가요?</h3>
          <p className="text-blue-100 mb-6 text-sm leading-relaxed">
            다케어 AI 상담사가 어떤 지원을 받을 수 있는지<br />
            맞춤으로 안내해드립니다.
          </p>
          <button
            onClick={() => document.querySelector<HTMLButtonElement>('.fixed.bottom-6')?.click()}
            className="bg-white text-blue-500 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            AI 상담 시작하기
          </button>
        </div>
      </section>

    </div>
  );
}
