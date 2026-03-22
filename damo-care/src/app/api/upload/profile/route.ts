import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, imageBase64 } = await req.json();
  if (!email || !imageBase64) {
    return NextResponse.json({ message: '필수 항목 누락' }, { status: 400 });
  }
  // Base64 size check (~1MB limit after encoding ≈ 750KB original)
  if (imageBase64.length > 1_400_000) {
    return NextResponse.json({ message: '이미지 크기는 1MB 이하로 올려주세요.' }, { status: 400 });
  }
  await User.findOneAndUpdate({ email }, { profileImage: imageBase64 });
  return NextResponse.json({ success: true });
}
