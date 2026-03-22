import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, name, role } = await req.json();
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: '이미 가입된 이메일입니다.' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role,
      approved: role === 'helper' ? false : true,
    });
    await newUser.save();
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ message: '이미 가입된 이메일입니다.' }, { status: 400 });
    }
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
