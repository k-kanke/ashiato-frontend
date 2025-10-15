'use client';

import React, { ChangeEvent, FormEvent } from 'react';
import {
  sheetBackdropStyle,
  sheetStyle,
  fieldLabelStyle,
  inputBaseStyle,
  disabledInputStyle,
  errorStyle,
  buttonStyle,
} from '@/components/ui/styles';

export type PrivacySetting = 'public' | 'friends';

export type CreatePinState = {
  isOpen: boolean;
  isLocating: boolean;
  isSubmitting: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  contentText: string;
  privacySetting: PrivacySetting;
};

export const createInitialState = (): CreatePinState => ({
  isOpen: false,
  isLocating: false,
  isSubmitting: false,
  error: null,
  latitude: null,
  longitude: null,
  contentText: '',
  privacySetting: 'public',
});

type CreatePinSheetProps = {
  state: CreatePinState;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onContentChange: (value: string) => void;
  onPrivacyChange: (value: PrivacySetting) => void;
};

const CreatePinSheet: React.FC<CreatePinSheetProps> = ({
  state,
  onClose,
  onSubmit,
  onContentChange,
  onPrivacyChange,
}) => {
  if (!state.isOpen) {
    return null;
  }

  return (
    <>
      <div
        style={sheetBackdropStyle}
        role="presentation"
        onClick={onClose}
      />
      <div style={sheetStyle}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>新しい足跡を残す</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={fieldLabelStyle}>現在地</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                style={disabledInputStyle}
                value={
                  state.latitude !== null
                    ? state.latitude.toFixed(6)
                    : state.isLocating
                      ? '現在地を取得中...'
                      : ''
                }
                disabled
              />
              <input
                style={disabledInputStyle}
                value={
                  state.longitude !== null
                    ? state.longitude.toFixed(6)
                    : state.isLocating
                      ? '現在地を取得中...'
                      : ''
                }
                disabled
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={fieldLabelStyle} htmlFor="pin-content">
              メモ
            </label>
            <textarea
              id="pin-content"
              style={{ ...inputBaseStyle, minHeight: '96px', resize: 'vertical' }}
              placeholder="今いる場所での思い出を書き残しましょう"
              value={state.contentText}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                onContentChange(event.target.value)
              }
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={fieldLabelStyle} htmlFor="pin-privacy">
              公開範囲
            </label>
            <select
              id="pin-privacy"
              style={inputBaseStyle}
              value={state.privacySetting}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                onPrivacyChange(event.target.value as PrivacySetting)
              }
            >
              <option value="public">公開</option>
              <option value="friends">フレンド限定</option>
            </select>
          </div>

          {state.error && (
            <div style={errorStyle} role="alert">
              {state.error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...buttonStyle,
                backgroundColor: '#262630',
                borderColor: '#3a3a43',
              }}
              disabled={state.isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              style={{
                ...buttonStyle,
                backgroundColor: state.isSubmitting ? '#4e4e58' : '#4857c4',
                borderColor: 'transparent',
                cursor: state.isSubmitting ? 'not-allowed' : 'pointer',
              }}
              disabled={
                state.isSubmitting ||
                state.latitude === null ||
                state.longitude === null ||
                !state.contentText.trim()
              }
            >
              {state.isSubmitting ? '投稿中…' : '投稿'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePinSheet;
