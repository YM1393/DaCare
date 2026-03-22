import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HelperDoc {
  _id: { toString(): string };
  name?: string;
  area?: string;
  profileImage?: string | null;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json([]);

  const safeQ = escapeRegex(q);
  const helpers = await User.find({
    role: 'helper',
    approved: true,
    $or: [
      { name: { $regex: safeQ, $options: 'i' } },
      { area: { $regex: safeQ, $options: 'i' } },
    ],
  }).select('_id name area profileImage').limit(8).lean() as HelperDoc[];

  return NextResponse.json(helpers.map((h) => ({
    id: h._id.toString(),
    name: h.name,
    area: h.area,
    profileImage: h.profileImage || null,
  })));
}
