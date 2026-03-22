import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function GET() {
  await connectDB();
  const pending = await User.find({ role: 'helper', approved: false }).select('-password');
  return NextResponse.json(pending);
}
