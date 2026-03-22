'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend, FiCpu, FiChevronLeft } from 'react-icons/fi';
import type { StoredUser } from '@/types';

interface Message {
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  '모유수유 자세 어떻게 해야 하나요?',
  '신생아가 계속 울어요. 어떻게 달래나요?',
  '산후 회복 기간이 얼마나 걸리나요?',
  '아기 수면 교육은 언제부터 하나요?',
  '산후우울감이 오는 것 같아요',
  '아기 목욕은 얼마나 자주 시켜야 하나요?',
];

export default function AIConsultPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: '안녕하세요! 다케어 AI 육아 상담사입니다 🌸\n산후 회복, 신생아 케어, 모유수유, 육아 고민 등 무엇이든 편하게 물어보세요. 24시간 답변드립니다 💗',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) { router.push('/login'); return; }
    setUser(JSON.parse(saved));
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.aiReply || '잠시 후 다시 시도해주세요.',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-900 border-b border-pink-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-pink-500 transition-colors">
          <FiChevronLeft size={22} />
        </button>
        <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
          <FiCpu className="text-white" size={18} />
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">AI 육아 상담사</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            24시간 상담 가능
          </p>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <FiCpu className="text-white" size={14} />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-pink-500 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400">{msg.time}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiCpu className="text-white" size={14} />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 질문 */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2 font-medium">자주 묻는 질문</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-xs bg-white dark:bg-gray-800 border border-pink-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:border-pink-300 hover:text-pink-500 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력창 */}
      <div className="bg-white dark:bg-gray-900 border-t border-pink-100 dark:border-gray-700 px-4 py-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="육아 고민을 편하게 물어보세요..."
          rows={1}
          className="flex-1 resize-none bg-pink-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-pink-200 dark:focus:border-pink-700 transition-colors max-h-32"
          style={{ minHeight: '44px' }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-11 h-11 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
        >
          <FiSend size={16} />
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 pb-2">
        AI 답변은 참고용이며 의료적 진단을 대체하지 않습니다
      </p>
    </div>
  );
}
