import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, currentPassword, newPassword } = await req.json();

  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json({ message: '모든 필드를 입력해주세요.' }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ message: '새 비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return NextResponse.json({ message: '현재 비밀번호가 틀렸습니다.' }, { status: 401 });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return NextResponse.json({ success: true });
}
