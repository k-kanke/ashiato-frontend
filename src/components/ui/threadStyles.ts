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
  position: 'relative',
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

export const threadFabStyle: CSSProperties = {
  position: 'absolute',
  bottom: '24px',
  right: '24px',
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  backgroundColor: '#4654c9',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '26px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.45)',
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

export const threadComposerContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

export const threadComposerActionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
};

export const threadIconButtonStyle: CSSProperties = {
  background: '#2d2d38',
  borderRadius: '10px',
  border: '1px solid #3a3a45',
  color: '#f2f2f5',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: '16px',
};
