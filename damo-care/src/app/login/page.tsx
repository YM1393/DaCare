'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        // 1. 로컬 스토리지에 유저 정보 저장
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`${data.user.name}님, 환영합니다!`);
        
        // 2. 역할에 따라 페이지 이동
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        alert(data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">로그인</h2>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="이메일" 
            className="w-full p-3 border rounded-xl focus:outline-pink-300" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            className="w-full p-3 border rounded-xl focus:outline-pink-300" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors"
          >
            로그인하기
          </button>
        </div>
        <div className="text-center mt-4">
          <Link href="/reset-password" className="text-sm text-gray-400 hover:text-pink-500">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </form>
    </div>
  );
}