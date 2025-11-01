'use client';

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getProfile } from '@/api/user';
import { getFriends } from '@/api/friends';
import PageBackground from '@/components/ui/PageBackground';
import {
  glassCardClass,
  glassInsetCardClass,
  headlineDescriptionClass,
  headlineLabelClass,
  headlineTitleClass,
  pageContentWrapperClass,
  statChipClass,
  subtleButtonClass,
  subduedTextClass,
} from '@/components/ui/pageStyles';
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
    <>
      <PageBackground className="pb-24">
        <main className="flex-1">
          <div className={pageContentWrapperClass}>
            <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <p className={headlineLabelClass}>profile</p>
                <h1 className={headlineTitleClass}>マイページ</h1>
                <p className={headlineDescriptionClass}>
                あなたの基本情報と通知設定、フレンド状況をチェックできます。
              </p>
            </div>
            <button type="button" onClick={handleOpenSettings} className={subtleButtonClass}>
              アカウント設定を開く
            </button>
          </header>

          <section className={glassCardClass}>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">プロフィール情報</h2>
                <p className={subduedTextClass}>ログイン情報や通知設定を一覧できます。</p>
              </div>
              <span className={statChipClass}>account</span>
            </div>

            {error && (
              <p className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100 shadow-[0_18px_40px_rgba(248,113,113,0.25)]">
                {error}
              </p>
            )}

            {profile ? (
              <dl className="grid gap-4 text-sm text-white/80">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-white/50">ユーザー名</dt>
                  <dd className="font-medium text-white">{profile.username}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-white/50">メールアドレス</dt>
                  <dd className="font-medium text-white">{profile.email}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-white/50">コメント通知</dt>
                  <dd className="font-medium text-white">
                    {profile.comment_on_my_pin ? '受け取る' : '受け取らない'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-white/50">フレンド新規ピン</dt>
                  <dd className="font-medium text-white">
                    {profile.friend_new_pin ? '通知する' : '通知しない'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-white/50">申請受信</dt>
                  <dd className="font-medium text-white">
                    {profile.friend_request_received ? '通知する' : '通知しない'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-white/50">申請承認</dt>
                  <dd className="font-medium text-white">
                    {profile.friend_request_accepted ? '通知する' : '通知しない'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-white/50">登録日</dt>
                  <dd className="font-medium text-white">{profile.created_at}</dd>
                </div>
              </dl>
            ) : (
              <p className={subduedTextClass}>プロフィール情報を読み込み中です…</p>
            )}
          </section>

          <section className={glassCardClass}>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">フレンド</h2>
                <p className={subduedTextClass}>つながっているユーザーを確認できます。</p>
              </div>
              <span className={statChipClass}>{friendCount} friends</span>
            </div>

            {friendError && (
              <p className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100 shadow-[0_18px_40px_rgba(248,113,113,0.25)]">
                {friendError}
              </p>
            )}

            {isFriendsLoading ? (
              <p className={subduedTextClass}>フレンド情報を読み込み中です…</p>
            ) : friends.length === 0 ? (
              <div className={`${glassInsetCardClass} border-dashed border-white/15 bg-transparent text-center`}>
                <p className="text-sm text-white/60">
                  まだフレンドがいません。ユーザー検索からフレンドを追加してみましょう。
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {friends.map(friend => (
                  <li key={friend.user_id} className={glassInsetCardClass}>
                    <div className="flex items-center gap-4">
                      {renderFriendAvatar(friend)}
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {friend.username?.trim() || 'ユーザー'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        </main>
      </PageBackground>
      <TabBar activeTab="profile" onCreateClick={handleCreateClick} />
    </>
  );
};

export default ProfilePage;
