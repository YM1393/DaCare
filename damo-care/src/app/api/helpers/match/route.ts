import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Review } from '@/lib/models';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const area = searchParams.get('area') || '';
  const maxPrice = parseInt(searchParams.get('maxPrice') || '300000');
  const minExperience = parseInt(searchParams.get('minExperience') || '0');

  interface HelperDoc {
    _id: { toString(): string };
    name?: string;
    area?: string;
    price?: string;
    experience?: string;
    profileImage?: string | null;
    [key: string]: unknown;
  }
  interface ReviewDoc { helperId: string; rating: number; }

  const helpers = await User.find({ role: 'helper', approved: true }).lean() as HelperDoc[];

  // 리뷰에서 평점 계산
  const helperIds = helpers.map((h) => h._id.toString());
  const reviews = await Review.find({ helperId: { $in: helperIds } }).lean() as unknown as ReviewDoc[];
  const ratingMap: Record<string, number> = {};
  reviews.forEach((r) => {
    if (!ratingMap[r.helperId]) ratingMap[r.helperId] = 0;
    ratingMap[r.helperId] = (ratingMap[r.helperId] + r.rating) / 2;
  });

  const scored = helpers.map((h) => {
    const id = h._id.toString();
    const rating = ratingMap[id] || 0;
    const priceNum = parseInt(String(h.price).replace(/,/g, '') || '0');
    const expNum = parseInt(String(h.experience) || '0');
    let score = 0;
    if (area && h.area && h.area.includes(area)) score += 40;
    if (expNum >= minExperience) score += 30;
    if (priceNum <= maxPrice) score += 20;
    score += rating * 2;
    return { ...h, score, rating: rating.toFixed(1) };
  });

  const top3 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(h => ({
      id: h._id?.toString(),
      name: h.name,
      area: h.area,
      rating: h.rating,
      price: h.price,
      experience: h.experience,
      profileImage: h.profileImage,
      score: h.score,
    }));

  return NextResponse.json(top3);
}
