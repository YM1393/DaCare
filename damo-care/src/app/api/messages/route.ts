import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChatRoom, DirectMessage } from '@/lib/models';

// GET /api/messages?email=xxx — get all rooms for a user
export async function GET(req: NextRequest) {
  await connectDB();
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json([], { status: 400 });

  const rooms = await ChatRoom.find({
    $or: [{ motherEmail: email }, { helperId: email }],
  }).sort({ createdAt: -1 }).lean();

  interface RoomDoc {
    _id: { toString(): string };
    motherEmail?: string;
    helperId?: string;
    helperName?: string;
    motherName?: string;
    createdAt?: Date;
    [key: string]: unknown;
  }

  const roomsWithLatest = await Promise.all(
    (rooms as RoomDoc[]).map(async (room) => {
      const latest = await DirectMessage.findOne({ roomId: room._id.toString() })
        .sort({ createdAt: -1 })
        .lean();
      const unread = await DirectMessage.countDocuments({
        roomId: room._id.toString(),
        read: false,
        senderEmail: { $ne: email },
      });
      return { ...room, id: room._id.toString(), latestMessage: latest, unreadCount: unread };
    })
  );

  return NextResponse.json(roomsWithLatest);
}

// POST /api/messages — create or find existing room
export async function POST(req: NextRequest) {
  await connectDB();
  const { motherEmail, helperId, helperName, motherName } = await req.json();
  if (!motherEmail || !helperId) {
    return NextResponse.json({ message: '필수 정보가 없습니다.' }, { status: 400 });
  }

  let room = await ChatRoom.findOne({ motherEmail, helperId });
  if (!room) {
    room = new ChatRoom({ motherEmail, helperId, helperName, motherName });
    await room.save();
  }

  return NextResponse.json({ roomId: room._id.toString() });
}
