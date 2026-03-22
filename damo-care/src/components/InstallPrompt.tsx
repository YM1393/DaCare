'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 이미 설치됨 or 이미 dismissed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      localStorage.getItem('pwa-dismissed') === 'true'
    ) return;

    // iOS 감지
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as { standalone?: boolean }).standalone;
    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Android/Chrome: beforeinstallprompt 이벤트
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true');
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-pink-100 p-4 flex items-center gap-3 max-w-sm mx-auto">
      <img src="/icon-192.png" alt="다케어" className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm">다케어 앱 설치</p>
        {isIOS ? (
          <p className="text-xs text-gray-500 mt-0.5">
            Safari 하단 공유버튼 → <span className="font-medium">"홈 화면에 추가"</span>
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-0.5">홈화면에 추가하고 앱처럼 사용하세요</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="bg-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors"
          >
            설치
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-gray-400 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
