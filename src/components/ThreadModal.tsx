/* eslint-disable @next/next/no-img-element */
'use client';

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  threadFabStyle,
  threadComposerContainerStyle,
  threadComposerActionsStyle,
  threadIconButtonStyle,
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
  const [newCommentMedia, setNewCommentMedia] = useState<File | null>(null);
  const [newCommentPreview, setNewCommentPreview] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pinID = pin?.pin_id;

  const handleCommentImageChange = useCallback((file: File | null) => {
    setNewCommentPreview(prev => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : null;
    });
    setNewCommentMedia(file);
  }, []);

  const clearCommentImage = useCallback(() => {
    setNewCommentMedia(null);
    setNewCommentPreview(prev => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  }, []);

  const handleComposerClose = useCallback(() => {
    setIsComposerOpen(false);
    setFormError(null);
    setNewComment('');
    clearCommentImage();
  }, [clearCommentImage]);

  useEffect(() => {
    if (!isOpen || !pinID) {
      if (!isOpen) {
        setComments([]);
        setError(null);
        handleComposerClose();
      }
      return;
    }

    handleComposerClose();

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
  }, [isOpen, pinID, logout, handleComposerClose]);

  useEffect(() => {
    return () => {
      clearCommentImage();
    };
  }, [clearCommentImage]);

  const handleComposerOpen = useCallback(() => {
    setIsComposerOpen(true);
    setFormError(null);
  }, []);

  const handleOpenFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
      const created = await postComment(pinID, {
        contentText: trimmed,
        mediaFile: newCommentMedia ?? undefined,
      });
      setComments(prev => [...prev, created]);
      handleComposerClose();
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

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {comments.map(comment => (
          <div key={comment.comment_id} style={threadCommentItemStyle}>
            <p style={{ margin: '0 0 8px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {comment.content_text}
            </p>
            {comment.media_url && (
              <div style={{ marginBottom: '8px' }}>
                <img
                  src={comment.media_url}
                  alt="コメント画像"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    maxHeight: '260px',
                  }}
                />
              </div>
            )}
            <small style={{ color: '#9a9ab0' }}>
              {new Date(comment.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    );
  }, [comments, error, isLoading]);

  const pinDetails = useMemo(() => {
    if (!pin) return null;

    return (
      <section style={{ marginBottom: '20px' }}>
        {pin.media_url && (
          <img
            src={pin.media_url}
            alt="ピン画像"
            style={{
              width: '100%',
              borderRadius: '12px',
              objectFit: 'cover',
              maxHeight: '260px',
              marginBottom: '12px',
            }}
          />
        )}
        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{pin.content_text}</p>
      </section>
    );
  }, [pin]);

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
            onClick={() => {
              onClose();
              handleComposerClose();
            }}
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

        <main style={threadBodyStyle}>
          {pinDetails}
          {commentList}
        </main>

        {isComposerOpen && (
          <footer style={threadFooterStyle}>
            <form onSubmit={handleSubmit} style={threadComposerContainerStyle}>
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
                  border: '1px solid #2f2f3a',
                  background: '#1d1d27',
                  color: '#f2f2f5',
                  padding: '12px',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
              {newCommentPreview && (
                <div style={{ position: 'relative' }}>
                  <img
                    src={newCommentPreview}
                    alt="コメント画像のプレビュー"
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      maxHeight: '220px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearCommentImage}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                    }}
                    aria-label="コメント画像を削除"
                  >
                    ×
                  </button>
                </div>
              )}
              {formError && (
                <p style={{ margin: 0, color: '#ff6b6b', fontSize: '13px' }} role="alert">
                  {formError}
                </p>
              )}
              <div style={threadComposerActionsStyle}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleOpenFilePicker}
                    style={threadIconButtonStyle}
                    aria-label="画像を選択"
                    disabled={isSubmitting}
                  >
                    🖼️
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={event => {
                      handleCommentImageChange(event.target.files?.[0] ?? null);
                      event.target.value = '';
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleComposerClose}
                    style={{
                      ...threadButtonBaseStyle,
                      background: '#2a2a35',
                      color: '#c7c7d6',
                    }}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...threadButtonBaseStyle,
                      background: isSubmitting ? '#4e4e58' : '#4857c4',
                      color: '#fff',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '投稿中…' : '投稿する'}
                  </button>
                </div>
              </div>
            </form>
          </footer>
        )}

        {!isComposerOpen && (
          <button
            type="button"
            style={threadFabStyle}
            onClick={handleComposerOpen}
            aria-label="コメントを作成"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default ThreadModal;
