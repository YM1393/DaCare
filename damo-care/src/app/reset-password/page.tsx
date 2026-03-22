'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || '비밀번호 변경에 실패했습니다.');
      } else {
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 px-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
          <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">변경 완료!</h2>
          <p className="text-gray-500 text-sm mb-6">비밀번호가 성공적으로 변경되었습니다.</p>
          <button onClick={() => router.push('/login')}
            className="w-full bg-pink-500 text-white py-3 rounded-2xl font-bold hover:bg-pink-600">
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-pink-500 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">비밀번호 재설정</h1>
          <p className="text-gray-500 text-sm mt-1">현재 비밀번호를 확인 후 새 비밀번호로 변경합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="가입한 이메일 주소"
              required
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">현재 비밀번호</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="현재 비밀번호 입력"
                required
                className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300 pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">새 비밀번호</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                placeholder="새 비밀번호 (6자 이상)"
                required
                className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300 pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">새 비밀번호 확인</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="새 비밀번호 다시 입력"
              required
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-pink-300"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-pink-500 text-white py-3.5 rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-60 mt-2">
            {loading ? '처리 중...' : '비밀번호 변경하기'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-gray-400 hover:text-pink-500">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
