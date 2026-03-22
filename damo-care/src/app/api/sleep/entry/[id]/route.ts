import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { SleepRecord } from '@/lib/models';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  await SleepRecord.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
