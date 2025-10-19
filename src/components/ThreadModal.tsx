'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Pin, Comment } from '@/types/api';
import { getThread, postComment } from '@/api/comments';
import { useAuth } from '@/contexts/AuthContext';
import {
  threadOverlayStyle,
  threadModalStyle,
  threadHeaderStyle,
  threadBodyStyle,
  threadFooterStyle,
  threadCommentItemStyle,
  threadButtonBaseStyle,
} from '@/components/ui/threadStyles';

type ThreadModalProps = {
  isOpen: boolean;
  pin: Pin | null;
  onClose: () => void;
};

const ThreadModal: React.FC<ThreadModalProps> = ({ isOpen, pin, onClose }) => {
  const { logout } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pinID = pin?.pin_id;

  useEffect(() => {
    if (!isOpen || !pinID) {
      if (!isOpen) {
        setComments([]);
        setNewComment('');
        setError(null);
        setFormError(null);
      }
      return;
    }

    let isCancelled = false;

    const fetchThread = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getThread(pinID);
        if (!isCancelled) {
          setComments(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          const status = (err as Error & { status?: number }).status;
          if (status === 401 || err.message.includes('Authentication')) {
            logout();
          }
          if (!isCancelled) {
            setError(err.message);
          }
        } else if (!isCancelled) {
          setError('スレッドの取得に失敗しました。');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchThread();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, pinID, logout]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pinID) return;

    const trimmed = newComment.trim();
    if (!trimmed) {
      setFormError('コメントを入力してください。');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const created = await postComment(pinID, trimmed);
      setComments(prev => [...prev, created]);
      setNewComment('');
    } catch (err) {
      if (err instanceof Error) {
        const status = (err as Error & { status?: number }).status;
        if (status === 401 || err.message.includes('Authentication')) {
          logout();
        }
        setFormError(err.message);
      } else {
        setFormError('コメントの投稿に失敗しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentList = useMemo(() => {
    if (isLoading) {
      return <p>スレッドを読み込み中です…</p>;
    }

    if (error) {
      return <p style={{ color: '#ff6b6b' }}>{error}</p>;
    }

    if (comments.length === 0) {
      return <p>まだコメントはありません。最初の足跡を残しましょう。</p>;
    }

    return comments.map(comment => (
      <div key={comment.comment_id} style={threadCommentItemStyle}>
        <p style={{ margin: '0 0 8px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {comment.content_text}
        </p>
        <small style={{ color: '#9a9ab0' }}>
          {new Date(comment.created_at).toLocaleString()}
        </small>
      </div>
    ));
  }, [comments, error, isLoading]);

  if (!isOpen || !pin) {
    return null;
  }

  return (
    <div style={threadOverlayStyle} role="dialog" aria-modal="true">
      <div style={threadModalStyle}>
        <header style={threadHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>スレッド</h2>
            <p style={{ margin: '4px 0 0', color: '#9a9ab0', fontSize: '13px' }}>
              {new Date(pin.created_at).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...threadButtonBaseStyle,
              background: 'transparent',
              color: '#a8a8b3',
              padding: '6px 12px',
              fontSize: '16px',
            }}
            aria-label="スレッドを閉じる"
          >
            ×
          </button>
        </header>

        <div style={{ padding: '16px 24px 0', borderBottom: '1px solid #2b2b35' }}>
          <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{pin.content_text}</p>
        </div>

        <main style={threadBodyStyle}>{commentList}</main>

        <footer style={threadFooterStyle}>
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="new-comment"
              style={{ display: 'block', marginBottom: '8px', color: '#a8a8b3', fontSize: '13px' }}
            >
              新しいコメント
            </label>
            <textarea
              id="new-comment"
              value={newComment}
              onChange={event => {
                setNewComment(event.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="感じたことを記録しよう"
              style={{
                width: '100%',
                minHeight: '96px',
                borderRadius: '12px',
                border: '1px solid #3a3a43',
                background: '#23232e',
                color: '#f2f2f5',
                padding: '12px 14px',
                boxSizing: 'border-box',
                marginBottom: '12px',
              }}
            />
            {formError && (
              <p style={{ color: '#ff6b6b', marginTop: 0, marginBottom: '12px' }}>{formError}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  ...threadButtonBaseStyle,
                  background: '#2c2c36',
                  color: '#f2f2f5',
                }}
              >
                閉じる
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...threadButtonBaseStyle,
                  background: isSubmitting ? '#4b4b5a' : '#4654c9',
                  color: '#ffffff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? '送信中…' : 'コメントする'}
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ThreadModal;
