import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Favorite } from '@/lib/models';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  await connectDB();
  const { email } = await params;
  const favorites = await Favorite.find({ motherEmail: decodeURIComponent(email) });
  return NextResponse.json(favorites);
}
