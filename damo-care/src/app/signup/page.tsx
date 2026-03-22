'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'mother' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert("회원가입이 완료되었습니다. 로그인해주세요!");
      router.push('/login');
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-pink-500 mb-6 text-center">다케어 회원가입</h2>
        <div className="space-y-4">
          <input type="text" placeholder="이름" className="w-full p-3 border rounded-xl" 
            onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="이메일" className="w-full p-3 border rounded-xl" 
            onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="비밀번호" className="w-full p-3 border rounded-xl" 
            onChange={e => setFormData({...formData, password: e.target.value})} required />
          <select className="w-full p-3 border rounded-xl bg-white" 
            onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="mother">산모</option>
            <option value="helper">도우미</option>
          </select>
          <button className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600">
            가입하기
          </button>
        </div>
      </form>
    </div>
  );
}