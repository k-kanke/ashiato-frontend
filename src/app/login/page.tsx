'use client'; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
// import Link from 'next/link'; // Next.jsのルーティング用

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login: authLogin } = useAuth(); // AuthContextのlogin関数

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. GoバックエンドAPIを呼び出す
      const response = await login({ email, password });
      
      // 2. 成功したらトークンをコンテキストとLocalStorageに保存
      authLogin(response.token); 
      
      // 3. メインの地図画面に遷移
      router.push('/map'); 
    } catch (err: any) {
      // 認証失敗やAPIエラー
      setError(err.message || 'ログインに失敗しました');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-150"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}