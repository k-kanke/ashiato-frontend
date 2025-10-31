'use client';

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getProfile } from '@/api/user';
import { getFriends } from '@/api/friends';
import type { FriendSummary, UserProfile } from '@/types/api';

const ProfilePage = () => {
  const auth = useRequireAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [friendError, setFriendError] = useState<string | null>(null);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);

  useEffect(() => {
    if (auth.isInitializing || !auth.isAuthenticated) {
      return;
    }

    let isCancelled = false;
    setError(null);
    setFriendError(null);
    setIsFriendsLoading(true);

    void (async () => {
      try {
        const profileData = await getProfile();
        if (!isCancelled) {
          setProfile(profileData);
        }
      } catch (err) {
        if (isCancelled) return;
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

      try {
        const friendList = await getFriends();
        if (!isCancelled) {
          setFriends(friendList);
        }
      } catch (err) {
        if (isCancelled) return;
        if (err instanceof Error) {
          const status = (err as Error & { status?: number }).status;
          if (status === 401 || err.message.includes('Authentication')) {
            router.replace('/login');
            return;
          }
          setFriendError(err.message);
        } else {
          setFriendError('フレンド情報を取得できませんでした。');
        }
      } finally {
        if (!isCancelled) {
          setIsFriendsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [auth.isAuthenticated, auth.isInitializing, router]);

  const friendCount = useMemo(() => friends.length, [friends]);

  const handleCreateClick = useCallback(() => {
    router.push('/map?create=1');
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const renderFriendAvatar = useCallback((friend: FriendSummary) => {
    const displayName = friend.username?.trim() || 'ユーザー';

    if (friend.profile_image_url) {
      return (
        <img
          src={friend.profile_image_url}
          alt={`${displayName}のプロフィール画像`}
          className="h-12 w-12 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/60 to-slate-600/70 text-lg font-semibold text-white">
        {displayName.slice(0, 1).toUpperCase()}
      </div>
    );
  }, []);

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
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
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

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/30">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-indigo-200">フレンド</h2>
                <p className="text-sm text-slate-400">現在のフレンド一覧です。</p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {friendCount}人
              </span>
            </header>

            {friendError && (
              <p className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {friendError}
              </p>
            )}

            {isFriendsLoading ? (
              <p className="text-sm text-slate-400">フレンド情報を読み込み中です…</p>
            ) : friends.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
                まだフレンドがいません。ユーザー検索からフレンドを追加してみましょう。
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {friends.map(friend => (
                  <li
                    key={friend.user_id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 shadow-[0_16px_32px_rgba(0,0,0,0.35)]"
                  >
                    {renderFriendAvatar(friend)}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {friend.username?.trim() || 'ユーザー'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <TabBar activeTab="profile" onCreateClick={handleCreateClick} />
    </div>
  );
};

export default ProfilePage;
