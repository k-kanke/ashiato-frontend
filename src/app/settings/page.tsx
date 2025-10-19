'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateUserSettings } from '@/api/user';
import {
  UpdateUserSettingsPayload,
  UpdateUserSettingsResponse,
  UserProfile,
} from '@/types/api';

const checkboxLabel =
  'flex items-center justify-between rounded-lg border border-slate-600/60 bg-slate-800/60 px-4 py-3 transition hover:border-indigo-400/80';

const SettingsPage = () => {
  const { isAuthenticated, token, isInitializing, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<UpdateUserSettingsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, router]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
      setFormState({
        comment_on_my_pin: data.comment_on_my_pin,
        friend_new_pin: data.friend_new_pin ?? true,
        friend_request_received: data.friend_request_received ?? true,
        friend_request_accepted: data.friend_request_accepted ?? true,
      });
    } catch (err) {
      if (err instanceof Error) {
        const status = (err as Error & { status?: number }).status;
        if (status === 401 || err.message.includes('Authentication')) {
          logout();
          router.replace('/login');
          return;
        }
        setError(err.message);
      } else {
        setError('設定を取得できませんでした。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout, router]);

  useEffect(() => {
    if (!isInitializing && isAuthenticated && token) {
      void loadProfile();
    }
  }, [isAuthenticated, isInitializing, token, loadProfile]);

  if (isInitializing || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-200">
        設定を読み込み中…
      </div>
    );
  }

  if (!isAuthenticated || !token || !formState || !profile) {
    return null;
  }

  const handleCheckboxChange = (field: keyof UpdateUserSettingsPayload) => {
    setFormState(prev => (prev ? { ...prev, [field]: !prev[field] } : prev));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response: UpdateUserSettingsResponse = await updateUserSettings(formState);
      setProfile(response.profile);
      setFormState({
        comment_on_my_pin: response.profile.comment_on_my_pin,
        friend_new_pin: response.profile.friend_new_pin ?? true,
        friend_request_received: response.profile.friend_request_received ?? true,
        friend_request_accepted: response.profile.friend_request_accepted ?? true,
      });
      setSuccessMessage('設定を保存しました。');
    } catch (err) {
      if (err instanceof Error) {
        const status = (err as Error & { status?: number }).status;
        if (status === 401 || err.message.includes('Authentication')) {
          logout();
          router.replace('/login');
          return;
        }
        setError(err.message);
      } else {
        setError('設定の保存に失敗しました。');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">アカウント設定</h1>
          <p className="text-sm text-slate-400">
            通知やコメントに関する設定を更新できます。変更後は即座に反映されます。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-indigo-300"
            onClick={() => router.push('/map')}
          >
            地図に戻る
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-indigo-200">アカウント情報</h2>
          <dl className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <dt className="text-slate-400">ユーザー名</dt>
              <dd>{profile.username}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <dt className="text-slate-400">メールアドレス</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">登録日</dt>
              <dd>{profile.created_at}</dd>
            </div>
          </dl>
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-black/30"
        >
          <h2 className="text-lg font-semibold text-indigo-200">通知設定</h2>

          <div className="space-y-4">
            <label className={checkboxLabel}>
              <span>
                <span className="text-sm font-medium text-slate-100">自分のピンへのコメント通知</span>
                <span className="mt-1 block text-xs text-slate-400">
                  誰かがあなたの足跡にコメントしたら通知します。
                </span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-indigo-500"
                checked={formState.comment_on_my_pin}
                onChange={() => handleCheckboxChange('comment_on_my_pin')}
              />
            </label>

            <label className={checkboxLabel}>
              <span>
                <span className="text-sm font-medium text-slate-100">フレンドの新規ピン通知</span>
                <span className="mt-1 block text-xs text-slate-400">
                  フレンドが新しい足跡を残したらお知らせします。
                </span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-indigo-500"
                checked={formState.friend_new_pin}
                onChange={() => handleCheckboxChange('friend_new_pin')}
              />
            </label>

            <label className={checkboxLabel}>
              <span>
                <span className="text-sm font-medium text-slate-100">フレンド申請通知</span>
                <span className="mt-1 block text-xs text-slate-400">
                  フレンドリクエストを受け取った際に通知します。
                </span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-indigo-500"
                checked={formState.friend_request_received}
                onChange={() => handleCheckboxChange('friend_request_received')}
              />
            </label>

            <label className={checkboxLabel}>
              <span>
                <span className="text-sm font-medium text-slate-100">フレンド承認通知</span>
                <span className="mt-1 block text-xs text-slate-400">
                  送ったフレンドリクエストが承認されたら通知します。
                </span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-indigo-500"
                checked={formState.friend_request_accepted}
                onChange={() => handleCheckboxChange('friend_request_accepted')}
              />
            </label>
          </div>

          {error && (
            <p className="rounded-md border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {successMessage}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400"
              onClick={() => router.push('/map')}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-700/70"
            >
              {isSaving ? '保存中…' : '設定を保存'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SettingsPage;

