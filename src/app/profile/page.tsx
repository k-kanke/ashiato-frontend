'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getProfile } from '@/api/user';
import { UserProfile } from '@/types/api';

const ProfilePage = () => {
  const auth = useRequireAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isInitializing && auth.isAuthenticated) {
      void (async () => {
        try {
          const data = await getProfile();
          setProfile(data);
        } catch (err) {
          if (err instanceof Error) {
            const status = (err as Error & { status?: number }).status;
            if (status === 401 || err.message.includes('Authentication')) {
              router.replace('/login');
              return;
            }
            setError(err.message);
          } else {
            setError('プロフィール情報を取得できませんでした。');
          }
        }
      })();
    }
  }, [auth.isAuthenticated, auth.isInitializing, router]);

  const handleCreateClick = useCallback(() => {
    router.push('/map?create=1');
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  if (auth.isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading...
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.token) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 pb-28 text-slate-100">
      <main className="flex-1 px-6 py-8">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/30">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-indigo-200">プロフィール</h1>
              <p className="text-sm text-slate-400">あなたの基本情報を確認できます。</p>
            </div>
            <button
              type="button"
              onClick={handleOpenSettings}
              className="flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-indigo-300"
            >
              <span className="text-lg">⚙</span>
              <span>アカウント設定</span>
            </button>
          </header>

          {error && (
            <p className="rounded-md border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          {profile ? (
            <dl className="space-y-4 text-sm text-slate-300">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <dt className="text-slate-400">ユーザー名</dt>
                <dd>{profile.username}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <dt className="text-slate-400">メールアドレス</dt>
                <dd>{profile.email}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <dt className="text-slate-400">コメント通知</dt>
                <dd>{profile.comment_on_my_pin ? '受け取る' : '受け取らない'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <dt className="text-slate-400">フレンド新規ピン</dt>
                <dd>{profile.friend_new_pin ? '通知する' : '通知しない'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <dt className="text-slate-400">申請受信</dt>
                <dd>{profile.friend_request_received ? '通知する' : '通知しない'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <dt className="text-slate-400">申請承認</dt>
                <dd>{profile.friend_request_accepted ? '通知する' : '通知しない'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">登録日</dt>
                <dd>{profile.created_at}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">プロフィール情報を読み込み中です…</p>
          )}
        </section>
      </main>
      <TabBar activeTab="profile" onCreateClick={handleCreateClick} />
    </div>
  );
};

export default ProfilePage;
