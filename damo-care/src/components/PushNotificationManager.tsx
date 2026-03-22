'use client';

import { useEffect, useRef } from 'react';

export default function PushNotificationManager() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 서비스 워커 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // 로그인된 유저가 있고 알림 권한이 없으면 요청
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;

    if ('Notification' in window && Notification.permission === 'default') {
      // 약간 딜레이 후 권한 요청 (UX 개선)
      setTimeout(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted' && 'serviceWorker' in navigator && 'PushManager' in window) {
            subscribeToPush(JSON.parse(savedUser).email);
          }
        });
      }, 3000);
    } else if (Notification.permission === 'granted' && 'PushManager' in window) {
      subscribeToPush(JSON.parse(savedUser).email);
    }
  }, []);

  return null;
}

async function subscribeToPush(email: string) {
  try {
    const reg = await navigator.serviceWorker.ready;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return;

    const existing = await reg.pushManager.getSubscription();
    const subscription = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subscription }),
    });
  } catch {}
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
