import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `당신은 다케어(DaCare) 서비스의 AI 육아·산후 상담사입니다.
산모의 산후 회복, 신생아 케어, 모유수유, 육아 고민에 대해 따뜻하고 전문적으로 답변합니다.
의료적 진단은 제공하지 않으며, 심각한 증상(고열, 심한 통증 등)은 반드시 병원 방문을 권고합니다.
한국어로 간결하고 따뜻하게 답변하세요. 이모지를 적절히 사용하고 200자 이내로 답변하세요.`;

const keywordReplies: { keywords: string[]; reply: string }[] = [
  { keywords: ['수유', '모유', '분유', '젖'], reply: '수유는 처음엔 누구나 힘들어요 💗 아기가 잘 먹고 있다면 충분합니다. 수유 자세와 횟수에 너무 부담 갖지 마세요.' },
  { keywords: ['잠', '수면', '못자', '피곤', '지쳐'], reply: '산후 수면 부족은 정말 힘드시죠 😢 아기가 자는 틈에 짧게라도 눈을 붙이세요. 혼자 다 하려 하지 마시고 도움을 요청하는 것도 용기예요 💪' },
  { keywords: ['우울', '눈물', '슬프', '불안', '걱정'], reply: '산후우울감은 많은 산모분들이 겪는 자연스러운 반응이에요 🌸 혼자 참지 마시고 가족에게 솔직하게 이야기해 보세요. 다케어가 응원합니다 💗' },
  { keywords: ['아기', '신생아', '울음', '달래'], reply: '신생아는 울음으로 소통해요 👶 배고픔, 졸음, 안아달라는 신호가 대부분이에요. 2~3주 지나면 패턴이 보이기 시작합니다. 잘 하고 계세요!' },
  { keywords: ['몸', '회복', '통증', '아파', '상처'], reply: '출산 후 몸 회복엔 최소 6~8주가 필요해요 🌿 통증이 심하거나 열이 나면 꼭 병원에 가세요. 천천히 쉬시는 게 가장 중요합니다 💗' },
  { keywords: ['예약', '도우미', '신청'], reply: '도우미 예약은 상단 메뉴 [산후도우미]에서 하실 수 있어요 😊 지역과 경력별로 원하시는 도우미를 찾아보세요!' },
];

function getKeywordReply(message: string): string {
  const lower = message.toLowerCase();
  for (const item of keywordReplies) {
    if (item.keywords.some((kw) => lower.includes(kw))) return item.reply;
  }
  return '다케어 AI입니다 🤖 궁금하신 점을 편하게 물어보세요. 산후 회복, 모유수유, 신생아 케어 등 무엇이든 도와드릴게요 💗';
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ aiReply: null }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ aiReply: getKeywordReply(message), businessHour: false });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : getKeywordReply(message);
    return NextResponse.json({ aiReply: text, businessHour: false });
  } catch {
    return NextResponse.json({ aiReply: getKeywordReply(message), businessHour: false });
  }
}
