import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Reservation, Notification } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { userEmail, helperName, helperId, date } = await req.json();
  const newRes = new Reservation({ userEmail, helperName, helperId, date, status: 'pending' });
  await newRes.save();
  const notice = new Notification({ userEmail, message: `🔔 ${helperName} 예약 접수 완료` });
  await notice.save();
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const { id, status } = await req.json();
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ message: '유효하지 않은 상태입니다.' }, { status: 400 });
  }
  const updated = await Reservation.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) return NextResponse.json({ message: '예약을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json({ success: true, reservation: updated });
}
