import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { HealthJournal } from '@/lib/models';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const entries = await HealthJournal.find({ userEmail: decodeURIComponent(email) }).sort({ date: -1 });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const body = await req.json();
  const entry = new HealthJournal({ userEmail: decodeURIComponent(email), ...body });
  await entry.save();
  return NextResponse.json(entry, { status: 201 });
}
