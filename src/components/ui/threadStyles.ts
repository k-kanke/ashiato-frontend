'use client';

import type { CSSProperties } from 'react';

export const threadOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  zIndex: 2000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export const threadModalStyle: CSSProperties = {
  background: '#1c1c24',
  color: '#f2f2f5',
  borderRadius: '16px',
  width: 'min(720px, 94%)',
  maxHeight: '92vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
};

export const threadHeaderStyle: CSSProperties = {
  padding: '20px 24px',
  borderBottom: '1px solid #2b2b35',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const threadBodyStyle: CSSProperties = {
  padding: '20px 24px',
  overflowY: 'auto',
  flex: 1,
};

export const threadFooterStyle: CSSProperties = {
  padding: '18px 24px 24px',
  borderTop: '1px solid #2b2b35',
};

export const threadCommentItemStyle: CSSProperties = {
  background: '#23232e',
  borderRadius: '12px',
  padding: '12px 16px',
  marginBottom: '12px',
  border: '1px solid #2f2f3a',
};

export const threadButtonBaseStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
};
