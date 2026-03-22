import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { SleepRecord } from '@/lib/models';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const records = await SleepRecord.find({ email: decodeURIComponent(email) }).sort({ createdAt: -1 });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const body = await req.json();
  const record = new SleepRecord({ email: decodeURIComponent(email), ...body });
  await record.save();
  return NextResponse.json(record, { status: 201 });
}
