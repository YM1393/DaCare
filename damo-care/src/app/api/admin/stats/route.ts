import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Reservation } from '@/lib/models';

export async function GET() {
  await connectDB();
  const totalUsers = await User.countDocuments();
  const totalBookings = await Reservation.countDocuments();
  const pendingBookings = await Reservation.countDocuments({ status: 'pending' });
  return NextResponse.json({ totalUsers, totalBookings, pendingBookings });
}
