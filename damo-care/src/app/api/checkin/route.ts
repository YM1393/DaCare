import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CheckIn, Notification } from '@/lib/models';

export async function GET(req: NextRequest) {
  await connectDB();
  const helperId = req.nextUrl.searchParams.get('helperId');
  const date = req.nextUrl.searchParams.get('date');
  const query: Record<string, string> = {};
  if (helperId) query.helperId = helperId;
  if (date) query.date = date;
  const records = await CheckIn.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { helperId, helperEmail, helperName, motherEmail, reservationId, date, type } = await req.json();
  if (!helperId || !date || !type) return NextResponse.json({ error: '필수값 누락' }, { status: 400 });

  let record = await CheckIn.findOne({ helperId, date });
  if (!record) {
    record = new CheckIn({ helperId, helperEmail, helperName, motherEmail, reservationId, date });
  }

  const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (type === 'checkin') {
    record.checkInTime = now;
  } else {
    record.checkOutTime = now;
  }
  await record.save();

  // 산모에게 푸시 알림
  if (motherEmail) {
    const msg = type === 'checkin'
      ? `${helperName} 도우미님이 출근했습니다 🌸 (${now})`
      : `${helperName} 도우미님이 퇴근했습니다 👋 (${now})`;
    await Notification.create({ userEmail: motherEmail, message: msg });
  }

  return NextResponse.json(record);
}
