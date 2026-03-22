import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GrowthRecord } from '@/lib/models';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  await GrowthRecord.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
