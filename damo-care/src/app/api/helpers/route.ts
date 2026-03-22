import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Review } from '@/lib/models';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HelperDoc {
  _id: { toString(): string };
  name?: string;
  area?: string;
  price?: string;
  experience?: string;
  profileImage?: string | null;
  helperType?: string;
  [key: string]: unknown;
}

interface ReviewDoc {
  helperId: string;
  rating: number;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const area = req.nextUrl.searchParams.get('area');
  const sort = req.nextUrl.searchParams.get('sort') || '';
  const type = req.nextUrl.searchParams.get('type') || '';
  const filter: Record<string, unknown> = { role: 'helper', approved: true };
  if (area) filter.area = { $regex: escapeRegex(area), $options: 'i' };
  if (type) filter.helperType = type;
  const helpers = await User.find(filter).select('-password').lean() as HelperDoc[];

  const helperIds = helpers.map((h) => h._id.toString());
  const reviews = await Review.find({ helperId: { $in: helperIds } }).lean() as unknown as ReviewDoc[];

  const ratingMap: Record<string, { sum: number; count: number }> = {};
  reviews.forEach((r) => {
    if (!ratingMap[r.helperId]) ratingMap[r.helperId] = { sum: 0, count: 0 };
    ratingMap[r.helperId].sum += r.rating;
    ratingMap[r.helperId].count += 1;
  });

  const result = helpers.map((h) => {
    const rm = ratingMap[h._id.toString()];
    return {
      ...h,
      id: h._id.toString(),
      rating: rm ? (rm.sum / rm.count).toFixed(1) : '0.0',
      reviewCount: rm?.count || 0,
    };
  });

  if (sort === 'rating') {
    result.sort((a, b) => parseFloat(b.rating as string) - parseFloat(a.rating as string));
  } else if (sort === 'price_asc') {
    result.sort((a, b) => parseInt(String(a.price).replace(/,/g, '') || '0') - parseInt(String(b.price).replace(/,/g, '') || '0'));
  } else if (sort === 'price_desc') {
    result.sort((a, b) => parseInt(String(b.price).replace(/,/g, '') || '0') - parseInt(String(a.price).replace(/,/g, '') || '0'));
  } else if (sort === 'experience') {
    result.sort((a, b) => parseInt(String(b.experience) || '0') - parseInt(String(a.experience) || '0'));
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
