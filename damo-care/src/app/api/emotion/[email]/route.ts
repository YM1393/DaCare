import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { EmotionLog } from '@/lib/models';

export async function GET(_: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const logs = await EmotionLog.find({ email: decodeURIComponent(email) }).sort({ date: -1 }).limit(60).lean();
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);
  const { date, mood, note } = await req.json();
  const log = await EmotionLog.findOneAndUpdate(
    { email: decodedEmail, date },
    { mood, note, createdAt: new Date() },
    { upsert: true, new: true }
  );
  return NextResponse.json(log);
}
