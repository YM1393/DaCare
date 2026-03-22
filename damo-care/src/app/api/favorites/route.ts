import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Favorite } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { motherEmail, helperId, helperName } = await req.json();
  const existing = await Favorite.findOne({ motherEmail, helperId });
  if (existing) return NextResponse.json({ message: '이미 즐겨찾기에 추가되었습니다.' }, { status: 409 });
  const fav = new Favorite({ motherEmail, helperId, helperName });
  await fav.save();
  return NextResponse.json(fav, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { motherEmail, helperId } = await req.json();
  await Favorite.findOneAndDelete({ motherEmail, helperId });
  return NextResponse.json({ success: true });
}
