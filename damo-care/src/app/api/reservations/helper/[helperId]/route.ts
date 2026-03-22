import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Reservation } from '@/lib/models';

export async function GET(req: NextRequest, { params }: { params: Promise<{ helperId: string }> }) {
  await connectDB();
  const { helperId } = await params;
  const full = req.nextUrl.searchParams.get('full') === 'true';
  const query = Reservation.find({ helperId });
  if (!full) query.where('status').in(['pending', 'confirmed']);
  const reservations = await query.lean();
  return NextResponse.json(reservations);
}
