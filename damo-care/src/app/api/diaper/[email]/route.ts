import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DiaperLog } from '@/lib/models';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const logs = await DiaperLog.find({ email: decodeURIComponent(email) })
    .sort({ createdAt: -1 })
    .limit(50);
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const body = await req.json();
  const log = new DiaperLog({ email: decodeURIComponent(email), ...body, createdAt: Date.now() });
  await log.save();
  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { id } = await req.json();
  await DiaperLog.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
