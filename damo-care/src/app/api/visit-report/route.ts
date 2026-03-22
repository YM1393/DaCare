import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VisitReport } from '@/lib/models';

// GET: 도우미 본인 기록 or 관리자 전체 조회
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const helperId = searchParams.get('helperId');
  const admin = searchParams.get('admin');

  const filter = admin === 'true' ? {} : helperId ? { helperId } : {};
  const reports = await VisitReport.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(reports);
}

// POST: 방문 기록 작성 (도우미)
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { reservationId, helperId, helperEmail, helperName, userEmail, date, activities, notes } = body;

  if (!reservationId || !helperId || !date) {
    return NextResponse.json({ error: '필수 값 누락' }, { status: 400 });
  }

  // 중복 방지
  const existing = await VisitReport.findOne({ reservationId });
  if (existing) {
    const updated = await VisitReport.findOneAndUpdate(
      { reservationId },
      { activities, notes },
      { new: true }
    );
    return NextResponse.json(updated);
  }

  const report = await VisitReport.create({ reservationId, helperId, helperEmail, helperName, userEmail, date, activities, notes });
  return NextResponse.json(report, { status: 201 });
}
