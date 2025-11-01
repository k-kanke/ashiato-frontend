/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { searchUsers } from '@/api/user';
import { acceptFriend, requestFriend } from '@/api/friends';
import PageBackground from '@/components/ui/PageBackground';
import {
  glassCardClass,
  glassInsetCardClass,
  headlineDescriptionClass,
  headlineLabelClass,
  headlineTitleClass,
  pageContentWrapperClass,
  subduedTextClass,
} from '@/components/ui/pageStyles';
import type {
  FriendshipStatus,
  UserSearchItem as RawUserSearchItem,
} from '@/types/api';

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 350;

type UserSearchResult = Omit<RawUserSearchItem, 'friendship_status'> & {
  friendship_status: FriendshipStatus;
};

const normalizeFriendshipStatus = (
  status: RawUserSearchItem['friendship_status'],
): FriendshipStatus => {
  switch (status) {
    case 'friends':
    case 'pending_sent':
    case 'pending_received':
      return status;
    case 'pending':
      return 'pending_sent';
    default:
      return 'none';
  }
};

const UsersPage = () => {
  const auth = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState>(null);

  const handleCreateClick = useCallback(() => {
    router.push('/map?create=1');
  }, [router]);

  const isKeywordTooShort =
    trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      return;
    }

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    let isCancelled = false;
    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(trimmedQuery, 20);
        if (isCancelled) {
          return;
        }
        const normalized: UserSearchResult[] = data.map(user => ({
          ...user,
          friendship_status: normalizeFriendshipStatus(user.friendship_status),
        }));
        setResults(normalized);
        setSearchError(normalized.length === 0 ? '該当するユーザーが見つかりませんでした。' : null);
      } catch (error) {
        if (isCancelled) {
          return;
        }
        if (error instanceof Error) {
          const status = (error as Error & { status?: number }).status;
          if (status === 401 || error.message.includes('Authentication')) {
            logout();
            return;
          }
          setSearchError(error.message);
        } else {
          setSearchError('ユーザー検索に失敗しました。');
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [auth.isAuthenticated, auth.token, logout, trimmedQuery]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const setActionLoading = (userID: string, loading: boolean) => {
    setPendingActions(prev => {
      if (loading) {
        return { ...prev, [userID]: true };
      }
      const next = { ...prev };
      delete next[userID];
      return next;
    });
  };

  const updateUserStatus = (userID: string, status: FriendshipStatus) => {
    setResults(prev =>
      prev.map(item =>
        item.user_id === userID
          ? { ...item, friendship_status: status }
          : item,
      ),
    );
  };

  const handleRequestFriend = async (user: UserSearchResult) => {
    setActionLoading(user.user_id, true);
    setToast(null);
    try {
      await requestFriend(user.user_id);
      updateUserStatus(user.user_id, 'pending_sent');
      setToast({
        type: 'success',
        message: `${user.username} にフレンド申請を送りました。`,
      });
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as Error & { status?: number }).status;
        if (status === 401 || error.message.includes('Authentication')) {
          logout();
          return;
        }
        setToast({ type: 'error', message: error.message });
      } else {
        setToast({ type: 'error', message: 'フレンド申請に失敗しました。' });
      }
    } finally {
      setActionLoading(user.user_id, false);
    }
  };

  const handleAcceptFriend = async (user: UserSearchResult) => {
    setActionLoading(user.user_id, true);
    setToast(null);
    try {
      await acceptFriend(user.user_id);
      updateUserStatus(user.user_id, 'friends');
      setToast({
        type: 'success',
        message: `${user.username} とフレンドになりました。`,
      });
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as Error & { status?: number }).status;
        if (status === 401 || error.message.includes('Authentication')) {
          logout();
          return;
        }
        setToast({ type: 'error', message: error.message });
      } else {
        setToast({ type: 'error', message: 'フレンド申請の承認に失敗しました。' });
      }
    } finally {
      setActionLoading(user.user_id, false);
    }
  };

  const renderStatusBadge = (status: FriendshipStatus) => {
    switch (status) {
      case 'friends':
        return (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
            フレンド
          </span>
        );
      case 'pending_sent':
        return (
          <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-200">
            申請中
          </span>
        );
      case 'pending_received':
        return (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200">
            承認待ち
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-300">
            未フレンド
          </span>
        );
    }
  };

  const renderActionButton = (user: UserSearchResult) => {
    const normalizedStatus = user.friendship_status;
    const isLoading = Boolean(pendingActions[user.user_id]);

    switch (normalizedStatus) {
      case 'none':
        return (
          <button
            type="button"
            onClick={() => handleRequestFriend(user)}
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-[#4654c9] via-[#5660ff] to-[#28b2f6] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(70,84,201,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? '送信中…' : 'フレンド申請'}
          </button>
        );
      case 'pending_sent':
        return (
          <button
            type="button"
            disabled
            className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200"
          >
            申請中
          </button>
        );
      case 'pending_received':
        return (
          <button
            type="button"
            onClick={() => handleAcceptFriend(user)}
            disabled={isLoading}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(16,185,129,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? '処理中…' : '承認する'}
          </button>
        );
      case 'friends':
        return (
          <span className="text-sm font-semibold text-emerald-200">フレンドです</span>
        );
      default:
        return null;
    }
  };

  const renderAvatar = (user: UserSearchResult) => {
    if (user.profile_image_url) {
      return (
        <img
          src={user.profile_image_url}
          alt={`${user.username}のプロフィール画像`}
          className="h-12 w-12 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/60 to-slate-600/70 text-lg font-semibold text-white">
        {user.username.slice(0, 1).toUpperCase()}
      </div>
    );
  };

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
        {toast && (
          <div className="absolute inset-x-0 top-6 z-20 flex justify-center px-4">
            <div
              className={`w-full max-w-md rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
                toast.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                  : 'border-red-500/30 bg-red-500/10 text-red-100'
              }`}
              role="status"
            >
              {toast.message}
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className={pageContentWrapperClass}>
            <header className="space-y-3 text-center sm:text-left">
              <p className={headlineLabelClass}>discover</p>
              <h1 className={headlineTitleClass}>フレンドを見つける</h1>
              <p className={headlineDescriptionClass}>
                ユーザー名またはメールアドレスの一部を入力して、つながりたい相手を探しましょう。
              </p>
            </header>

            <section className={glassCardClass}>
              <div className="space-y-3">
                <div className={`${glassInsetCardClass} relative`}>
                  <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="2文字以上を入力してください"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder-white/35 outline-none transition focus:border-[#6f7dff] focus:ring-2 focus:ring-[#6f7dff]/40"
                  />
                  {isSearching && (
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-white/50">
                      検索中…
                    </span>
                  )}
                </div>
                {isKeywordTooShort && (
                  <p className="text-xs text-white/55">検索には2文字以上入力してください。</p>
                )}
                {searchError && !isKeywordTooShort && (
                  <p className="text-xs text-red-300">{searchError}</p>
                )}
              </div>
            </section>

            <section className={glassCardClass}>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">検索結果</h2>
                  <p className={subduedTextClass}>
                    {trimmedQuery.length >= MIN_QUERY_LENGTH
                      ? `「${trimmedQuery}」の候補が表示されます。`
                      : '検索キーワードを入力してください。'}
                  </p>
                </div>
                {trimmedQuery.length >= MIN_QUERY_LENGTH && (
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">
                    {results.length} 件
                  </span>
                )}
              </div>

              {trimmedQuery.length < MIN_QUERY_LENGTH ? (
                <div className={`${glassInsetCardClass} text-center`}>
                  <p className={subduedTextClass}>キーワードを2文字以上入力すると候補が表示されます。</p>
                </div>
              ) : isSearching ? (
                <div className={`${glassInsetCardClass} text-center`}>
                  <p className={subduedTextClass}>ユーザーを検索中です…</p>
                </div>
              ) : searchError ? (
                <div className={`${glassInsetCardClass} border border-red-500/30 bg-red-500/10 text-center text-red-100`}>
                  <p className="text-sm">{searchError}</p>
                </div>
              ) : results.length === 0 ? (
                <div className={`${glassInsetCardClass} text-center`}>
                  <p className={subduedTextClass}>該当するユーザーが見つかりませんでした。</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {results.map(user => (
                    <div
                      key={user.user_id}
                      className={`${glassInsetCardClass} flex items-center justify-between gap-4 border border-white/12`}
                    >
                      <div className="flex items-center gap-4">
                        {renderAvatar(user)}
                        <div>
                          <p className="text-base font-semibold text-white">{user.username}</p>
                          <div className="mt-1 flex items-center gap-2">{renderStatusBadge(user.friendship_status)}</div>
                        </div>
                      </div>
                      {renderActionButton(user)}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </PageBackground>

      <TabBar activeTab="search" onCreateClick={handleCreateClick} />
    </>
  );
};

export default UsersPage;
