import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Reservation, Notification } from '@/lib/models';

export async function GET() {
  await connectDB();
  const reservations = await Reservation.find({ status: 'pending' }).sort({ _id: -1 }).lean();
  return NextResponse.json(reservations);
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, status } = await req.json();
  const updated = await Reservation.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) return NextResponse.json({ message: '예약을 찾을 수 없습니다.' }, { status: 404 });
  // Send notification to user
  const msg = status === 'confirmed' ? `✅ ${updated.helperName} 도우미님 예약이 확정되었습니다! (${updated.date})` : `❌ ${updated.helperName} 도우미님 예약이 취소되었습니다. (${updated.date})`;
  await new Notification({ userEmail: updated.userEmail, message: msg }).save();
  return NextResponse.json({ success: true });
}
