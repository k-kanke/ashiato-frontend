import type { CSSProperties } from 'react';

export const sheetBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  zIndex: 1500,
};

export const sheetStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  top: 0,
  backgroundColor: '#1d1d25',
  color: '#f2f2f5',
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px',
  padding: '24px',
  boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.35)',
  zIndex: 1501,
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

export const tabBarWrapperStyle: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1200,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(10, 14, 28, 0.94)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 -18px 36px rgba(6, 8, 20, 0.55)',
};

export const tabBarInnerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-evenly',
  height: '96px',
  maxWidth: '960px',
  width: '100%',
  margin: '0 auto',
  padding: '0 24px 16px',
  boxSizing: 'border-box',
};

export const tabLinkStyleBase: CSSProperties = {
  display: 'flex',
  flex: '1 1 0',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};

export const tabIconCircleStyleBase: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  transition: 'all 0.2s ease',
  lineHeight: '0',
};

export const tabUnderlineStyleBase: CSSProperties = {
  width: '32px',
  height: '4px',
  borderRadius: '999px',
  transition: 'all 0.2s ease',
};

export const tabBadgeStyle: CSSProperties = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  minWidth: '20px',
  height: '20px',
  padding: '0 6px',
  backgroundColor: '#f0506e',
  borderRadius: '999px',
  color: '#ffffff',
  fontSize: '10px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 6px rgba(240, 80, 110, 0.5)',
};

export const tabActionWrapperStyle: CSSProperties = {
  display: 'flex',
  flex: '1 1 0',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
};

export const tabActionButtonStyle: CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #7b8cfd, #5967ff)',
  border: 'none',
  boxShadow: '0 22px 44px rgba(72, 89, 255, 0.55)',
  cursor: 'pointer',
  transform: 'translateY(-6px)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const tabActionLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#ced6ff',
};

export const tabActionUnderlineStyle: CSSProperties = {
  width: '32px',
  height: '4px',
  borderRadius: '999px',
  background: 'rgba(99, 123, 255, 0.75)',
  boxShadow: '0 0 8px rgba(88, 101, 242, 0.45)',
};

export const buttonStyle: CSSProperties = {
  ...inputBaseStyle,
  textAlign: 'center',
};
