import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/lib/models';

export async function PATCH(req: NextRequest) {
  await connectDB();
  const { email } = await req.json();
  await Notification.updateMany({ userEmail: email, read: false }, { read: true });
  return NextResponse.json({ success: true });
}
