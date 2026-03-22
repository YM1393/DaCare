import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Comment, Post, Notification } from '@/lib/models';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const comments = await Comment.find({ postId: id }).sort({ createdAt: 1 });
  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const { authorEmail, authorName, content } = await req.json();
  const comment = new Comment({ postId: id, authorEmail, authorName, content });
  await comment.save();

  // 게시글 작성자에게 알림 (본인 댓글 제외)
  const post = await Post.findById(id).select('authorEmail title').lean() as { authorEmail?: string; title?: string } | null;
  if (post?.authorEmail && post.authorEmail !== authorEmail) {
    await Notification.create({
      userEmail: post.authorEmail,
      message: `"${(post.title ?? '').slice(0, 20)}" 게시글에 ${authorName}님이 댓글을 남겼습니다 💬`,
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
