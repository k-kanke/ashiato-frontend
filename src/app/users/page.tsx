'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const UsersPage = () => {
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
          <h1 className="text-2xl font-semibold text-indigo-200">ユーザー検索</h1>
          <p className="mt-3 text-sm text-slate-400">
            この画面は準備中です。まもなくフレンドを探せるようになります。
          </p>
        </div>
      </main>
      <TabBar activeTab="search" onCreateClick={handleCreateClick} />
    </div>
  );
};

export default UsersPage;
