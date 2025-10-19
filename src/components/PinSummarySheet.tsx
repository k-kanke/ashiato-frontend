'use client';

import React from 'react';
import { Pin } from '@/types/api';
import {
  sheetBackdropStyle,
  sheetStyle,
  buttonStyle,
  fieldLabelStyle,
} from '@/components/ui/styles';

type PinSummarySheetProps = {
  pin: Pin | null;
  onClose: () => void;
  onShowThread: () => void;
};

const summarySheetStyle: React.CSSProperties = {
  ...sheetStyle,
  zIndex: 6,
};

const summaryBackdropStyle: React.CSSProperties = {
  ...sheetBackdropStyle,
  zIndex: 5,
};

const PinSummarySheet: React.FC<PinSummarySheetProps> = ({ pin, onClose, onShowThread }) => {
  if (!pin) {
    return null;
  }

  const createdAt = new Date(pin.created_at).toLocaleString();

  return (
    <>
      <div
        style={summaryBackdropStyle}
        role="presentation"
        onClick={onClose}
      />
      <div style={summarySheetStyle}>
        <header style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>足跡の概要</h2>
            <p style={{ margin: '4px 0 0', color: '#a8a8b3', fontSize: '13px' }}>{createdAt}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="シートを閉じる"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a8a8b3',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section style={{ marginBottom: '20px' }}>
          <label style={fieldLabelStyle}>メモ</label>
          <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{pin.content_text}</p>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <label style={fieldLabelStyle}>公開範囲</label>
          <p style={{ margin: 0 }}>
            {pin.privacy_setting === 'friends' ? 'フレンド限定' : '公開'}
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <label style={fieldLabelStyle}>位置情報</label>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', opacity: 0.8 }}>
            lat {pin.latitude.toFixed(5)}, lng {pin.longitude.toFixed(5)}
          </p>
        </section>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onShowThread}
            style={{
              ...buttonStyle,
              backgroundColor: '#4654c9',
              borderColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            スレッドを表示
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...buttonStyle,
              backgroundColor: '#262630',
              borderColor: '#3a3a43',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </>
  );
};

export default PinSummarySheet;

