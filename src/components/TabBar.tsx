'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { CSSProperties } from 'react';

type TabKey = 'map' | 'search' | 'notifications' | 'profile';

interface TabBarProps {
  activeTab: TabKey;
  onCreateClick?: () => void;
  messageBadgeCount?: number;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onCreateClick, messageBadgeCount = 0 }) => {
  const router = useRouter();

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
      return;
    }
    router.push('/map?create=1');
  };

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: string;
    href: string;
  }> = [
    { key: 'map', label: 'map', icon: '🏠', href: '/map' },
    { key: 'search', label: 'search', icon: '🔍', href: '/users' },
    { key: 'notifications', label: 'message', icon: '💬', href: '/notifications' },
    { key: 'profile', label: 'profile', icon: '👤', href: '/profile' },
  ];

  const navWrapperStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(10, 14, 28, 0.94)',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 -18px 36px rgba(6, 8, 20, 0.55)',
  };

  const navInnerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    height: '96px',
    maxWidth: '960px',
    margin: '0 auto',
    padding: '0 24px 16px',
    boxSizing: 'border-box',
  };

  const renderTabItem = (tab: (typeof tabs)[number]) => {
    const isActive = activeTab === tab.key;
    const showBadge = tab.key === 'notifications' && messageBadgeCount > 0;

    const linkStyle: CSSProperties = {
      display: 'flex',
      flex: '1 1 0',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      fontWeight: 500,
      color: isActive ? '#c4ceff' : '#a3acc7',
      textDecoration: 'none',
      transition: 'color 0.2s ease',
    };

    const iconCircleStyle: CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: isActive ? '1px solid rgba(99, 123, 255, 0.6)' : '1px solid transparent',
      background: isActive ? 'rgba(88, 101, 242, 0.2)' : 'rgba(30, 34, 52, 0.8)',
      boxShadow: isActive ? '0 0 18px rgba(88, 101, 242, 0.35)' : 'none',
      color: isActive ? '#d4dcff' : '#e4e8f7',
      fontSize: '20px',
      transition: 'all 0.2s ease',
    };

    const underlineStyle: CSSProperties = {
      width: '32px',
      height: '4px',
      borderRadius: '999px',
      background: isActive ? 'rgba(99, 123, 255, 0.85)' : 'transparent',
      boxShadow: isActive ? '0 0 8px rgba(88, 101, 242, 0.45)' : 'none',
      transition: 'all 0.2s ease',
    };

    const badgeStyle: CSSProperties = {
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

    return (
      <Link
        key={tab.key}
        href={tab.href}
        style={linkStyle}
      >
        <span style={iconCircleStyle}>
          <span>{tab.icon}</span>
          {showBadge && (
            <span style={badgeStyle}>
              {messageBadgeCount > 9 ? '9+' : messageBadgeCount}
            </span>
          )}
        </span>
        <span>{tab.label}</span>
        <span style={underlineStyle} />
      </Link>
    );
  };

  const actionWrapperStyle: CSSProperties = {
    display: 'flex',
    flex: '1 1 0',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  };

  const actionButtonStyle: CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7b8cfd, #5967ff)',
    color: '#ffffff',
    fontSize: '30px',
    fontWeight: 600,
    border: 'none',
    boxShadow: '0 22px 44px rgba(72, 89, 255, 0.55)',
    cursor: 'pointer',
    transform: 'translateY(-12px)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const actionLabelStyle: CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#ced6ff',
  };

  const actionUnderlineStyle: CSSProperties = {
    width: '32px',
    height: '4px',
    borderRadius: '999px',
    background: 'rgba(99, 123, 255, 0.75)',
    boxShadow: '0 0 8px rgba(88, 101, 242, 0.45)',
  };

  const handleActionButtonMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.transform = 'translateY(-16px) scale(1.04)';
    event.currentTarget.style.boxShadow = '0 30px 56px rgba(72, 89, 255, 0.65)';
  };

  const handleActionButtonMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.transform = 'translateY(-12px) scale(1)';
    event.currentTarget.style.boxShadow = '0 22px 44px rgba(72, 89, 255, 0.55)';
  };

  const handleActionButtonFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    event.currentTarget.style.boxShadow = '0 30px 56px rgba(72, 89, 255, 0.7)';
  };

  const handleActionButtonBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    event.currentTarget.style.boxShadow = '0 22px 44px rgba(72, 89, 255, 0.55)';
  };

  return (
    <nav style={navWrapperStyle}>
      <div style={navInnerStyle}>
        {renderTabItem(tabs[0])}
        {renderTabItem(tabs[1])}
        <div style={actionWrapperStyle}>
          <button
            type="button"
            onClick={handleCreateClick}
            style={actionButtonStyle}
            onMouseEnter={handleActionButtonMouseEnter}
            onMouseLeave={handleActionButtonMouseLeave}
            onFocus={handleActionButtonFocus}
            onBlur={handleActionButtonBlur}
            aria-label="ピンを立てる"
          >
            ＋
          </button>
          <span style={actionLabelStyle}>作成</span>
          <span style={actionUnderlineStyle} />
        </div>
        {renderTabItem(tabs[2])}
        {renderTabItem(tabs[3])}
      </div>
    </nav>
  );
};

export default TabBar;
