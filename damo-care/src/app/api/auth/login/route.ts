import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ message: '로그인 정보 불일치' }, { status: 401 });
  }
  if (user.role === 'helper' && !user.approved) {
    return NextResponse.json({ message: '관리자 승인 대기 중입니다.' }, { status: 403 });
  }
  const secret = process.env.DACARE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: '서버 설정 오류' }, { status: 500 });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn: '1h' }
  );
  return NextResponse.json({
    success: true,
    token,
    user: {
      _id: user._id.toString(),
      name: user.name,
      role: user.role,
      email: user.email,
      profileImage: user.profileImage || null,
      helperType: user.helperType || '',
    },
  });
}
