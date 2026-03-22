import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GrowthPhoto } from '@/lib/models';

export async function GET(req: NextRequest) {
  await connectDB();
  const email = req.nextUrl.searchParams.get('email') || '';
  const photos = await GrowthPhoto.find({ email: decodeURIComponent(email) }).sort({ createdAt: -1 });
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const photo = new GrowthPhoto(body);
  await photo.save();
  return NextResponse.json(photo, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { id } = await req.json();
  await GrowthPhoto.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
