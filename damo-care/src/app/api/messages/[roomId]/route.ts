import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DirectMessage, Notification } from '@/lib/models';

// GET /api/messages/[roomId] — get messages in room & mark as read
export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  await connectDB();
  const { roomId } = await params;
  const readerEmail = req.nextUrl.searchParams.get('reader') || '';

  const messages = await DirectMessage.find({ roomId }).sort({ createdAt: 1 });

  if (readerEmail) {
    await DirectMessage.updateMany(
      { roomId, senderEmail: { $ne: readerEmail }, read: false },
      { read: true }
    );
  }

  return NextResponse.json(messages);
}

// POST /api/messages/[roomId] — send a message
export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  await connectDB();
  const { roomId } = await params;
  const { senderEmail, senderName, message, recipientEmail } = await req.json();

  if (!message?.trim()) return NextResponse.json({ message: '메시지를 입력하세요.' }, { status: 400 });

  const dm = new DirectMessage({ roomId, senderEmail, senderName, message });
  await dm.save();

  if (recipientEmail) {
    const notice = new Notification({
      userEmail: recipientEmail,
      message: `💬 ${senderName}님이 메시지를 보냈습니다.`,
    });
    await notice.save();
  }

  return NextResponse.json(dm, { status: 201 });
}
