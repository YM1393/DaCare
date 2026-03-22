import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Post } from '@/lib/models';

export async function GET(req: NextRequest) {
  await connectDB();
  const search = req.nextUrl.searchParams.get('search') || '';
  const tag = req.nextUrl.searchParams.get('tag') || '';
  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  const filter: Record<string, unknown> = {};
  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { content: { $regex: safeSearch, $options: 'i' } },
    ];
  }
  if (tag) filter.tags = tag;
  const posts = await Post.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { title, content, category, author, authorEmail, imageUrl, tags } = await req.json();
  const post = new Post({ title, content, category, author, authorEmail, imageUrl, tags: tags || [] });
  await post.save();
  return NextResponse.json({ success: true }, { status: 201 });
}
