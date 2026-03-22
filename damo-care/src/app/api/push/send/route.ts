import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PushSubscription } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, title, body } = await req.json();
  if (!email || !title) return NextResponse.json({ message: '필수 항목 누락' }, { status: 400 });

  const record = await PushSubscription.findOne({ email });
  if (!record) return NextResponse.json({ message: '구독 정보 없음' }, { status: 404 });

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@dacare.com';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ message: 'VAPID 키 미설정' }, { status: 500 });
  }

  try {
    const webpush = (await import('web-push')).default;
    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);
    await webpush.sendNotification(record.subscription, JSON.stringify({ title, body }));
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ message }, { status: 500 });
  }
}
