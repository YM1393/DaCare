import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WeightRecord } from '@/lib/models';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  await WeightRecord.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
