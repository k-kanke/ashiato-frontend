import type { CSSProperties } from 'react';

export const fabStyle: CSSProperties = {
  position: 'fixed',
  right: '24px',
  bottom: '24px',
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  border: 'none',
  background: '#3f4d9b',
  color: '#ffffff',
  fontSize: '32px',
  lineHeight: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
  zIndex: 2,
};

export const sheetBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  zIndex: 3,
};

export const sheetStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#1d1d25',
  color: '#f2f2f5',
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',
  padding: '24px',
  boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.35)',
  zIndex: 4,
};

export const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '14px',
  marginBottom: '6px',
  color: '#a8a8b3',
};

export const inputBaseStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #3a3a43',
  backgroundColor: '#2a2a33',
  color: '#f2f2f5',
  fontSize: '14px',
  boxSizing: 'border-box',
};

export const disabledInputStyle: CSSProperties = {
  ...inputBaseStyle,
  opacity: 0.7,
  cursor: 'not-allowed',
};

export const errorStyle: CSSProperties = {
  color: '#ff6b6b',
  fontSize: '13px',
  marginTop: '8px',
};

export const buttonStyle: CSSProperties = {
  ...inputBaseStyle,
  textAlign: 'center',
};
