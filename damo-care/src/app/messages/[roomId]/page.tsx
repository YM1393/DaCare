'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSend, FiChevronLeft } from 'react-icons/fi';
import type { StoredUser, Message } from '@/types';

export default function ChatRoomPage() {
  const router = useRouter();
  const { roomId } = useParams() as { roomId: string };
  const [user, setUser] = useState<StoredUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherName, setOtherName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    loadMessages(u.email, u);
  }, [roomId, router]);

  const loadMessages = async (email: string, u?: StoredUser) => {
    const res = await fetch(`/api/messages/${roomId}?reader=${encodeURIComponent(email)}`);
    const data = await res.json();
    setMessages(data);

    // Determine the other party for display and notifications
    if (data.length > 0 && u) {
      const otherMsg = data.find((m: Message) => m.senderEmail !== email);
      if (otherMsg) {
        setOtherName(otherMsg.senderName || '상대방');
        setRecipientEmail(otherMsg.senderEmail || '');
      }
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Polling every 3 seconds
  useEffect(() => {
    if (!user) return;
    pollRef.current = setInterval(() => loadMessages(user.email), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, roomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const msg = input.trim();
    setInput('');

    const res = await fetch(`/api/messages/${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderEmail: user.email,
        senderName: user.name,
        message: msg,
        recipientEmail,
      }),
    });

    if (res.ok) {
      await loadMessages(user.email);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-100 px-6 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-pink-500 transition-colors">
          <FiChevronLeft size={22} />
        </button>
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 text-lg">
          👤
        </div>
        <div>
          <p className="font-bold text-gray-800">{otherName || '채팅'}</p>
          <p className="text-xs text-gray-400">1:1 채팅</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">대화를 시작해보세요 💬</p>
          </div>
        )}
        {messages.map((msg: Message) => {
          const isMe = msg.senderEmail === user.email;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 self-end">
                  👤
                </div>
              )}
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMe && <p className="text-xs text-gray-500 ml-1">{msg.senderName}</p>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-pink-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>
                  {msg.message}
                </div>
                <p className="text-[10px] text-gray-300 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t border-pink-100 p-4 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-pink-200 transition-all"
        />
        <button type="submit"
          disabled={!input.trim()}
          className="w-11 h-11 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors disabled:opacity-40 flex-shrink-0">
          <FiSend size={16} />
        </button>
      </form>
    </div>
  );
}
