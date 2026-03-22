import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Reservation, PushSubscription, User } from '@/lib/models';

export async function POST(req: NextRequest) {
  await connectDB();
  const { userEmail, message } = await req.json();
  if (!userEmail) return NextResponse.json({ message: '이메일 필요' }, { status: 400 });

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@dacare.com';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ message: 'VAPID 키 미설정' }, { status: 500 });
  }

  // 1. 현재 예약된 도우미 찾기
  const activeReservation = await Reservation.findOne({
    userEmail,
    status: { $in: ['pending', 'confirmed'] },
  }).sort({ createdAt: -1 }).lean() as { helperId?: string; helperName?: string } | null;

  // 2. 알림을 받을 이메일 목록 수집
  const targetEmails: string[] = [];

  if (activeReservation?.helperId) {
    // 예약된 도우미가 있으면 그 도우미에게만
    const helper = await User.findById(activeReservation.helperId).select('email').lean() as { email?: string } | null;
    if (helper?.email) targetEmails.push(helper.email);
  }

  if (targetEmails.length === 0) {
    // 예약된 도우미 없으면 승인된 전체 도우미에게
    const helpers = await User.find({ role: 'helper', approved: true }).select('email').lean() as { email?: string }[];
    helpers.forEach(h => { if (h.email) targetEmails.push(h.email); });
  }

  if (targetEmails.length === 0) {
    return NextResponse.json({ message: '알림을 받을 도우미가 없습니다.', sent: 0 });
  }

  // 3. 각 도우미의 push 구독 정보 조회 후 알림 발송
  const webpush = (await import('web-push')).default;
  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const subscriptions = await PushSubscription.find({ email: { $in: targetEmails } }).lean() as unknown as { subscription: object }[];

  let sent = 0;
  const payload = JSON.stringify({
    title: '🚨 긴급 알림 — 다케어',
    body: message || `${userEmail.split('@')[0]} 산모님이 긴급 도움을 요청했습니다.`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'dacare-emergency',
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription as Parameters<typeof webpush.sendNotification>[0], payload);
        sent++;
      } catch {
        // 구독 만료 등 개별 실패 무시
      }
    })
  );

  return NextResponse.json({
    success: true,
    sent,
    helperName: activeReservation?.helperName || null,
  });
}
