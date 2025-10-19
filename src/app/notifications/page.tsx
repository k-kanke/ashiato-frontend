'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const NotificationsPage = () => {
  const auth = useRequireAuth();
  const router = useRouter();

  const handleCreateClick = useCallback(() => {
    router.push('/map?create=1');
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
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-indigo-200">通知</h1>
          <p className="mt-3 text-sm text-slate-400">
            通知ボックスは準備中です。新しいコメントやフレンド申請がここに表示されます。
          </p>
        </div>
      </main>
      <TabBar activeTab="notifications" onCreateClick={handleCreateClick} />
    </div>
  );
};

export default NotificationsPage;
