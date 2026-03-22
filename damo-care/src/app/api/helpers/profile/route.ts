import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function PUT(req: NextRequest) {
  await connectDB();
  const { email, area, price, experience, intro, helperType, specialties, certifications, portfolioImages } = await req.json();
  const update: Record<string, unknown> = { area, price, experience, intro };
  if (helperType !== undefined) update.helperType = helperType;
  if (specialties !== undefined) update.specialties = specialties;
  if (certifications !== undefined) update.certifications = certifications;
  if (portfolioImages !== undefined) update.portfolioImages = portfolioImages;
  await User.findOneAndUpdate({ email }, update);
  return NextResponse.json({ success: true });
}
