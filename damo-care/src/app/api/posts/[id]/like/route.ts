import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Post, Notification } from '@/lib/models';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const { email } = await req.json();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const likedBy: string[] = post.likedBy || [];
  const alreadyLiked = likedBy.includes(email);
  if (alreadyLiked) {
    post.likedBy = likedBy.filter((e: string) => e !== email);
    post.likes = Math.max(0, (post.likes || 0) - 1);
  } else {
    post.likedBy.push(email);
    post.likes = (post.likes || 0) + 1;
  }
  await post.save();

  // 좋아요 눌렀을 때(취소 아닐 때) 작성자에게 알림
  if (!alreadyLiked && post.authorEmail && post.authorEmail !== email) {
    await Notification.create({
      userEmail: post.authorEmail,
      message: `"${(post.title ?? '').slice(0, 20)}" 게시글에 좋아요가 눌렸습니다 ❤️`,
    });
  }

  return NextResponse.json({ likes: post.likes, liked: !alreadyLiked });
}
