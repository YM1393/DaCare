import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email } = await req.json();
  await User.findOneAndUpdate({ email }, { approved: true });
  return NextResponse.json({ success: true });
}
