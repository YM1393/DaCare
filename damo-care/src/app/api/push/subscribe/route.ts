import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PushSubscription } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, subscription } = await req.json();
  if (!email || !subscription) return NextResponse.json({ message: '필수 항목 누락' }, { status: 400 });

  await PushSubscription.findOneAndUpdate(
    { email },
    { email, subscription },
    { upsert: true, new: true }
  );
  return NextResponse.json({ success: true });
}
