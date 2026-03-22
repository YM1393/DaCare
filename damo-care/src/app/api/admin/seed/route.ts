import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const { secretKey, email, password, name } = await req.json();

    const adminSecret = process.env.ADMIN_SECRET_KEY;
    if (!adminSecret || secretKey !== adminSecret) {
      return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
    }

    await connectDB();

    const exists = await User.findOne({ role: 'admin' });
    if (exists) {
      return NextResponse.json({ message: '이미 관리자 계정이 존재합니다.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      email: email || 'admin@dacare.com',
      password: hashedPassword,
      name: name || '관리자',
      role: 'admin',
      approved: true,
    });
    await admin.save();

    return NextResponse.json({ success: true, message: '관리자 계정이 생성되었습니다.' }, { status: 201 });
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
