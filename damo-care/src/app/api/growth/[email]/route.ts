import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GrowthRecord } from '@/lib/models';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const records = await GrowthRecord.find({ userEmail: decodeURIComponent(email) }).sort({ date: 1 });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const body = await req.json();
  const record = new GrowthRecord({ userEmail: decodeURIComponent(email), ...body });
  await record.save();
  return NextResponse.json(record, { status: 201 });
}
