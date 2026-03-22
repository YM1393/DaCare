import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Review, User, Notification } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { helperId, userEmail, user, rating, comment } = await req.json();
  if (!helperId || !userEmail) return NextResponse.json({ error: '필수값 누락' }, { status: 400 });

  // 중복 방지 — 이미 작성한 리뷰는 수정
  const existing = await Review.findOne({ helperId, userEmail });
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
    existing.date = new Date().toLocaleDateString('ko-KR');
    await existing.save();
    return NextResponse.json({ success: true, updated: true });
  }

  const review = new Review({ helperId, userEmail, user, rating, comment });
  await review.save();

  // 도우미에게 알림
  const helper = await User.findById(helperId).select('email').lean() as { email?: string } | null;
  if (helper?.email) {
    await Notification.create({
      userEmail: helper.email,
      message: `${user}님이 리뷰를 남겼습니다 ⭐${rating} — "${comment.slice(0, 30)}${comment.length > 30 ? '…' : ''}"`,
    });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
