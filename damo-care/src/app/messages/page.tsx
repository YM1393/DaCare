'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import type { StoredUser, Room } from '@/types';

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    fetch(`/api/messages?email=${encodeURIComponent(u.email)}`)
      .then(r => r.json())
      .then(data => { setRooms(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (!user) return null;

  const getOtherParty = (room: Room) => {
    if (user.role === 'mother') return { name: room.helperName || '도우미', sub: '산후도우미' };
    return { name: room.motherName || '산모', sub: '산모님' };
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-8">
        <FiMessageSquare className="text-pink-500" /> 1:1 채팅
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
          <FiMessageSquare className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">아직 채팅 내역이 없습니다.</p>
          {user.role === 'mother' && (
            <Link href="/postpartum"
              className="mt-4 inline-block text-pink-500 text-sm font-bold hover:underline">
              도우미 찾으러 가기 →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room: Room) => {
            const other = getOtherParty(room);
            const latest = room.latestMessage;
            return (
              <Link key={room.id} href={`/messages/${room.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-pink-100 transition-all">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 text-xl flex-shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">{other.name}</p>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{other.sub}</span>
                    {(room.unreadCount ?? 0) > 0 && (
                      <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {latest ? latest.message : '대화를 시작해보세요.'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {latest && (
                    <p className="text-xs text-gray-300">
                      {new Date(latest.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  <FiChevronRight className="text-gray-300 mt-1 ml-auto" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
