'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { listNotifications } from '@/api/notifications';
import { Notification } from '@/types/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { acceptFriend } from '@/api/friends';

const NOTIFICATION_LIMIT = 50;

const NotificationsPage = () => {
  const auth = useRequireAuth();
  const router = useRouter();
  const { markNotificationAsRead } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCreateClick = useCallback(() => {
    router.push('/map?create=1');
  }, [router]);

  const setProcessingState = useCallback((notificationID: string, value: boolean) => {
    setProcessing(prev => {
      const next = { ...prev };
      if (!value) {
        delete next[notificationID];
      } else {
        next[notificationID] = true;
      }
      return next;
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listNotifications({ limit: NOTIFICATION_LIMIT });
      setNotifications(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : '通知の取得に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth.isInitializing && auth.isAuthenticated && auth.token) {
      fetchNotifications();
    }
  }, [auth.isAuthenticated, auth.isInitializing, auth.token, fetchNotifications]);

  const formatTimestamp = useCallback((value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const buildNotificationMessage = useCallback((notification: Notification) => {
    const actorName = notification.actor_username ?? notification.actor_user_id ?? '不明なユーザー';

    switch (notification.type) {
      case 'friend_request_received':
        return `${actorName} さんからフレンド申請が届きました。`;
      case 'friend_request_accepted':
        return `${actorName} さんがあなたのフレンド申請を承認しました。`;
      default:
        return '新しい通知があります。';
    }
  }, []);

  const handleMarkAsRead = useCallback(
    async (notificationID: string) => {
      setProcessingState(notificationID, true);
      try {
        await markNotificationAsRead(notificationID);
        setNotifications(prev =>
          prev.map(notification =>
            notification.notification_id === notificationID
              ? { ...notification, is_read: true }
              : notification,
          ),
        );
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      } finally {
        setProcessingState(notificationID, false);
      }
    },
    [markNotificationAsRead, setProcessingState],
  );

  const handleAcceptFriend = useCallback(
    async (notification: Notification) => {
      const notificationID = notification.notification_id;
      if (!notification.actor_user_id) {
        return;
      }

      setProcessingState(notificationID, true);
      try {
        await acceptFriend(notification.actor_user_id);
        await markNotificationAsRead(notificationID);
        setNotifications(prev =>
          prev.map(item =>
            item.notification_id === notificationID ? { ...item, is_read: true } : item,
          ),
        );
        setAcceptedRequests(prev => ({ ...prev, [notificationID]: true }));
      } catch (err) {
        console.error('Failed to accept friend request', err);
        setError('フレンド申請の承認に失敗しました。時間を置いて再度お試しください。');
      } finally {
        setProcessingState(notificationID, false);
      }
    },
    [markNotificationAsRead, setProcessingState],
  );

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.is_read).length,
    [notifications],
  );

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
      <main className="flex flex-1 flex-col px-6 py-8">
        <header className="mb-6 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-indigo-200">通知</h1>
              <p className="text-sm text-slate-400">
                現在の未読通知: <span className="font-semibold text-indigo-300">{unreadCount}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={fetchNotifications}
              className="rounded-md border border-indigo-500/50 px-3 py-1 text-sm text-indigo-200 transition hover:bg-indigo-500/10"
            >
              再読み込み
            </button>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </header>

        <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          {isLoading ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-6 text-center text-slate-300">
              通知を読み込み中です…
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-6 text-center text-slate-300">
              現在表示できる通知はありません。
            </div>
          ) : (
            notifications.map(notification => {
              const isFriendRequest = notification.type === 'friend_request_received';
              const isProcessing = !!processing[notification.notification_id];
              const message = buildNotificationMessage(notification);
              const accepted = acceptedRequests[notification.notification_id];

              return (
                <div
                  key={notification.notification_id}
                  className={`flex flex-col gap-3 rounded-lg border p-4 transition ${
                    notification.is_read
                      ? 'border-slate-700 bg-slate-900/60'
                      : 'border-indigo-500/40 bg-indigo-950/40 shadow-[0_0_20px_rgba(76,81,191,0.2)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-left text-sm leading-relaxed text-slate-100">{message}</p>
                      {accepted && (
                        <p className="mt-2 text-xs text-emerald-300">この申請を承認しました。</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs text-indigo-200">
                        未読
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {isFriendRequest && !accepted && (
                      <button
                        type="button"
                        onClick={() => handleAcceptFriend(notification)}
                        disabled={isProcessing}
                        className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/60"
                      >
                        {isProcessing ? '処理中…' : '申請を承認'}
                      </button>
                    )}
                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        disabled={isProcessing}
                        className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? '処理中…' : '既読にする'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
      <TabBar activeTab="notifications" onCreateClick={handleCreateClick} />
    </div>
  );
};

export default NotificationsPage;
