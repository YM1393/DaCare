'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiHome, FiHeart, FiSettings, FiUser, FiLogOut,
  FiLogIn, FiUserPlus, FiBell, FiSmile, FiMenu, FiX, FiMessageSquare,
  FiMoon, FiSun, FiCamera, FiCpu, FiInfo
} from 'react-icons/fi';
import type { StoredUser, Notification } from '@/types';

export default function Header() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        fetch(`/api/notifications/${encodeURIComponent(userData.email)}`, {
            cache: 'no-store',
            headers: { 'x-from-header': '1' },
          })
          .then(res => res.json())
          .then(data => setNotifications(data))
          .catch(() => {});
      } catch {}
    }
    // Dark mode init
    const dark = localStorage.getItem('darkMode') === 'true';
    setIsDark(dark);
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', next.toString());
  };

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleOpenNoti = async () => {
    const next = !showNoti;
    setShowNoti(next);
    // Mark as read when opening
    if (next && unreadCount > 0 && user) {
      await fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    alert('로그아웃 되었습니다.');
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/community', label: '커뮤니티', icon: FiHome },
    { href: '/postpartum', label: '산후도우미', icon: FiHeart },
    { href: '/comfort', label: '산모 안심센터', icon: FiSmile },
    { href: '/government-support', label: '정부 지원', icon: FiInfo },
    ...(user ? [
      { href: '/messages', label: '채팅', icon: FiMessageSquare },
      { href: '/baby-album', label: '아기앨범', icon: FiCamera },
      { href: '/ai-consult', label: 'AI상담', icon: FiCpu },
    ] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', label: '관리 대시보드', icon: FiSettings }] : []),
  ];

  return (
    <header className="bg-white border-b border-pink-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-2 flex items-center">
        {/* 로고 */}
        <Link href="/" className="text-3xl font-bold text-pink-500 font-serif tracking-tight lg:hidden">
          DaCare
        </Link>
        <Link href="/" className="hidden lg:flex flex-col items-start leading-tight">
          <span className="text-2xl font-bold text-pink-500 tracking-tight">다-케어</span>
          <span className="text-sm font-semibold text-pink-300 tracking-widest">DaCare</span>
        </Link>

        {/* 데스크탑: 심볼+네비 중앙 */}
        <nav className="hidden lg:flex flex-1 flex-col items-center gap-2 py-1">
          <Link href="/"><img src="/dacare-symbol.png" alt="DaCare" style={{ height: '48px', width: 'auto', cursor: 'pointer' }} /></Link>
          <ul className="flex items-center space-x-8">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={`flex items-center transition-colors font-medium ${
                  link.href === '/admin' ? 'text-blue-500 hover:text-blue-700' : 'text-gray-600 hover:text-pink-500'
                }`}>
                  <link.icon className="mr-2" size={16} /> {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 우측 버튼 */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {/* 알림 */}
              <div className="relative">
                <button onClick={handleOpenNoti}
                  className="relative p-2 text-gray-600 hover:bg-pink-50 rounded-full transition-colors">
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNoti && (
                  <div className="absolute right-0 mt-3 w-72 bg-white border border-pink-100 shadow-2xl rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold border-b border-pink-50 pb-2 mb-2 text-sm text-gray-800">최근 알림</h3>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length > 0 ? notifications.map((n: Notification) => (
                        <div key={n._id || n.id}
                          className={`text-xs p-3 rounded-xl border-l-4 ${
                            n.read
                              ? 'bg-gray-50 border-gray-200 text-gray-500'
                              : 'bg-pink-50 border-pink-400 text-gray-700'
                          }`}>
                          {n.message}
                        </div>
                      )) : (
                        <p className="text-gray-400 text-center py-4 text-xs">새로운 알림이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 마이페이지 (데스크탑) */}
              <Link href="/mypage" className="hidden sm:flex items-center text-gray-600 hover:text-pink-500 text-sm font-medium">
                <FiUser className="mr-1" size={16} /> {user.name}님
              </Link>
              <button onClick={handleLogout}
                className="hidden sm:flex items-center text-gray-400 hover:text-red-500 text-sm font-medium border-l border-gray-100 pl-3">
                <FiLogOut className="mr-1" size={16} /> 로그아웃
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="flex items-center text-gray-600 hover:text-pink-500 text-sm font-medium">
                <FiLogIn className="mr-1" size={16} /> 로그인
              </Link>
              <Link href="/signup" className="bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600 text-sm font-medium flex items-center">
                <FiUserPlus className="mr-1" size={14} /> 회원가입
              </Link>
            </div>
          )}

          {/* 다크 모드 토글 */}
          <button onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 transition-colors">
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* 모바일 햄버거 버튼 */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-pink-50 rounded-xl transition-colors">
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-pink-50 px-6 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-500 font-medium text-sm transition-colors">
              <link.icon size={18} /> {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-50 pt-3 mt-2">
            {user ? (
              <>
                <Link href="/mypage" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 text-sm font-medium">
                  <FiUser size={18} /> {user.name}님 (마이페이지)
                </Link>
                <button onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 text-sm font-medium w-full">
                  <FiLogOut size={18} /> 로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 text-sm font-medium">
                  <FiLogIn size={18} /> 로그인
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-pink-500 hover:bg-pink-50 text-sm font-bold">
                  <FiUserPlus size={18} /> 회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
