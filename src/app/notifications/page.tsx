'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { listNotifications } from '@/api/notifications';
import { Notification } from '@/types/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { acceptFriend } from '@/api/friends';
import PageBackground from '@/components/ui/PageBackground';
import {
  glassCardClass,
  glassInsetCardClass,
  headlineDescriptionClass,
  headlineLabelClass,
  headlineTitleClass,
  pageContentWrapperClass,
  subtleButtonClass,
  subduedTextClass,
} from '@/components/ui/pageStyles';

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
    <>
      <PageBackground className="pb-24">
        <main className="flex-1">
          <div className={pageContentWrapperClass}>
            <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <p className={headlineLabelClass}>notifications</p>
                <h1 className={headlineTitleClass}>通知センター</h1>
                <p className={headlineDescriptionClass}>
                フレンド申請やアクションの最新情報をまとめて確認できます。
              </p>
            </div>
            <button type="button" onClick={fetchNotifications} className={subtleButtonClass}>
              再読み込み
            </button>
          </header>

          <section className={glassCardClass}>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">受信トレイ</h2>
                <p className={subduedTextClass}>
                  未読通知 <span className="font-semibold text-white">{unreadCount}</span> 件
                </p>
              </div>
            </div>

            {error && (
              <p className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100 shadow-[0_18px_40px_rgba(248,113,113,0.25)]">
                {error}
              </p>
            )}

            {isLoading ? (
              <div className={`${glassInsetCardClass} text-center`}>
                <p className={subduedTextClass}>通知を読み込み中です…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className={`${glassInsetCardClass} text-center`}>
                <p className={subduedTextClass}>現在表示できる通知はありません。</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {notifications.map(notification => {
                  const isFriendRequest = notification.type === 'friend_request_received';
                  const isProcessing = !!processing[notification.notification_id];
                  const message = buildNotificationMessage(notification);
                  const accepted = acceptedRequests[notification.notification_id];

                  return (
                    <div
                      key={notification.notification_id}
                      className={`${glassInsetCardClass} border border-white/12 transition hover:border-white/20`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <p className="text-left text-sm leading-relaxed text-white">{message}</p>
                          {accepted && (
                            <p className="mt-2 text-xs text-emerald-300">この申請を承認しました。</p>
                          )}
                          <p className="mt-1 text-xs text-white/50">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="inline-flex h-6 items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white">
                            未読
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                        {isFriendRequest && !accepted && (
                          <button
                            type="button"
                            onClick={() => handleAcceptFriend(notification)}
                            disabled={isProcessing}
                            className="rounded-full bg-gradient-to-r from-[#4f5afe] via-[#6874ff] to-[#37b7ff] px-4 py-2 text-sm font-semibold text-white shadow-[0_22px_44px_rgba(72,89,255,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing ? '処理中…' : '申請を承認'}
                          </button>
                        )}
                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification.notification_id)}
                            disabled={isProcessing}
                            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing ? '処理中…' : '既読にする'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
        </main>
      </PageBackground>
      <TabBar activeTab="notifications" onCreateClick={handleCreateClick} />
    </>
  );
};

export default NotificationsPage;
