import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Reservation, User } from '@/lib/models';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);

  // 도우미 계정이면 helperId 기준, 산모/관리자면 userEmail 기준으로 조회
  const user = await User.findOne({ email: decodedEmail }).select('_id role').lean() as any;
  const query = user?.role === 'helper'
    ? { helperId: user._id.toString() }
    : { userEmail: decodedEmail };

  const reservations = await Reservation.find(query).sort({ createdAt: -1 });
  return NextResponse.json(reservations, {
    headers: { 'Cache-Control': 's-maxage=10, stale-while-revalidate=30' },
  });
}
