'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'register';

const headlineByMode: Record<AuthMode, string> = {
  login: '足跡にログイン',
  register: '新しい足跡を作成',
};

const descriptionByMode: Record<AuthMode, string> = {
  login: '保存してきた思い出が待っています。認証情報を入力してください。',
  register: '旅の記録を始めましょう。必要なのはメールアドレスとパスワードだけです。',
};

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === 'register';
  const headline = useMemo(() => headlineByMode[mode], [mode]);
  const description = useMemo(() => descriptionByMode[mode], [mode]);

  const handleModeSwitch = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isRegisterMode && username.trim().length < 3) {
      setError('ユーザー名は3文字以上で入力してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = isRegisterMode
        ? await register({
            username: username.trim(),
            email,
            password,
          })
        : await login({
            email,
            password,
          });

      authLogin(response.token);
      router.push('/map');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('処理に失敗しました。時間をおいて再度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070f]">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0b101f] via-[#151b36] to-[#05070f]"
        aria-hidden
      />
      <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-[#4654c9]/30 blur-3xl" aria-hidden />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#23a6d5]/20 blur-3xl" aria-hidden />

      <div className="relative z-10 w-[min(420px,90%)] space-y-8 rounded-2xl border border-white/5 bg-white/5 p-10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">ashiato</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">{headline}</h1>
          <p className="mt-3 text-sm text-white/60">{description}</p>
        </header>

        {error && (
          <div
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegisterMode && (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-white/80">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                minLength={3}
                onChange={event => setUsername(event.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
                placeholder="例: ashiato_taro"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-[#6f7dff] focus:ring-2 focus:ring-[#6f7dff]/40"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white/80">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-[#6f7dff] focus:ring-2 focus:ring-[#6f7dff]/40"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white/80">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              disabled={isSubmitting}
              placeholder={isRegisterMode ? '8文字以上で設定してください' : 'パスワードを入力'}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-[#6f7dff] focus:ring-2 focus:ring-[#6f7dff]/40"
              minLength={isRegisterMode ? 8 : undefined}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#4654c9] via-[#5660ff] to-[#28b2f6] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(70,84,201,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegisterMode ? (isSubmitting ? '作成中…' : 'アカウントを作成') : isSubmitting ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>

        <footer className="text-center text-sm text-white/60">
          {isRegisterMode ? (
            <>
              すでにアカウントをお持ちですか？{' '}
              <button
                type="button"
                onClick={handleModeSwitch}
                className="font-semibold text-[#8ea2ff] transition hover:text-white"
              >
                ログインする
              </button>
            </>
          ) : (
            <>
              まだアカウントをお持ちでない方は{' '}
              <button
                type="button"
                onClick={handleModeSwitch}
                className="font-semibold text-[#8ea2ff] transition hover:text-white"
              >
                新規登録
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
