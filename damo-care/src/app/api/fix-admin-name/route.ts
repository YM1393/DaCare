import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, name } = await req.json();
  const result = await User.findOneAndUpdate({ email }, { name }, { new: true });
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ success: true, name: result.name });
}
