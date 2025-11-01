'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FiMap } from 'react-icons/fi';
import { HiOutlineSearch } from 'react-icons/hi';
import { FiMessageCircle } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { IoAdd } from 'react-icons/io5';
import type { IconType } from 'react-icons';
import {
  tabActionButtonStyle,
  tabActionLabelStyle,
  tabActionUnderlineStyle,
  tabActionWrapperStyle,
  tabBadgeStyle,
  tabBarInnerStyle,
  tabBarWrapperStyle,
  tabIconCircleStyleBase,
  tabLinkStyleBase,
  tabUnderlineStyleBase,
} from '@/components/ui/styles';
import { useNotifications } from '@/contexts/NotificationContext';

type TabKey = 'map' | 'search' | 'notifications' | 'profile';

interface TabBarProps {
  activeTab: TabKey;
  onCreateClick?: () => void;
  messageBadgeCount?: number;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onCreateClick, messageBadgeCount }) => {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
      return;
    }
    router.push('/map?create=1');
  };

  const badgeCount = typeof messageBadgeCount === 'number' ? messageBadgeCount : unreadCount;

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: IconType;
    href: string;
    iconSize: number;
  }> = [
    { key: 'map', label: 'map', icon: FiMap, href: '/map', iconSize: 22 },
    { key: 'search', label: 'search', icon: HiOutlineSearch, href: '/users', iconSize: 23 },
    { key: 'notifications', label: 'mail', icon: FiMessageCircle, href: '/notifications', iconSize: 23 },
    { key: 'profile', label: 'profile', icon: FiUser, href: '/profile', iconSize: 22 },
  ];

  const renderTabItem = (tab: (typeof tabs)[number]) => {
    const isActive = activeTab === tab.key;
    const showBadge = tab.key === 'notifications' && badgeCount > 0;

    const Icon = tab.icon;

    return (
      <Link
        key={tab.key}
        href={tab.href}
        style={{
          ...tabLinkStyleBase,
          color: isActive ? '#c4ceff' : '#a3acc7',
        }}
      >
        <span
          style={{
            ...tabIconCircleStyleBase,
            border: isActive ? '1px solid rgba(99, 123, 255, 0.6)' : '1px solid transparent',
            background: isActive ? 'rgba(88, 101, 242, 0.2)' : 'rgba(30, 34, 52, 0.8)',
            boxShadow: isActive ? '0 0 18px rgba(88, 101, 242, 0.35)' : 'none',
          }}
        >
          <Icon
            size={tab.iconSize}
            color={isActive ? '#d4dcff' : '#e4e8f7'}
            style={{ display: 'block' }}
          />
          {showBadge && (
            <span style={tabBadgeStyle}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}
        </span>
        <span>{tab.label}</span>
        <span
          style={{
            ...tabUnderlineStyleBase,
            background: isActive ? 'rgba(99, 123, 255, 0.85)' : 'transparent',
            boxShadow: isActive ? '0 0 8px rgba(88, 101, 242, 0.45)' : 'none',
          }}
        />
      </Link>
    );
  };

  const handleActionButtonMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.transform = 'translateY(-16px) scale(1.04)';
    event.currentTarget.style.boxShadow = '0 30px 56px rgba(72, 89, 255, 0.65)';
  };

  const handleActionButtonMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.transform = 'translateY(-6px) scale(1)';
    event.currentTarget.style.boxShadow = '0 22px 44px rgba(72, 89, 255, 0.55)';
  };

  const handleActionButtonFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    event.currentTarget.style.boxShadow = '0 30px 56px rgba(72, 89, 255, 0.7)';
  };

  const handleActionButtonBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    event.currentTarget.style.boxShadow = '0 22px 44px rgba(72, 89, 255, 0.55)';
  };

  return (
    <nav style={tabBarWrapperStyle}>
      <div style={tabBarInnerStyle}>
        {renderTabItem(tabs[0])}
        {renderTabItem(tabs[1])}
        <div style={tabActionWrapperStyle}>
          <button
            type="button"
            onClick={handleCreateClick}
            style={tabActionButtonStyle}
            onMouseEnter={handleActionButtonMouseEnter}
            onMouseLeave={handleActionButtonMouseLeave}
            onFocus={handleActionButtonFocus}
            onBlur={handleActionButtonBlur}
            aria-label="ピンを立てる"
          >
            <IoAdd size={35} color="#ffffff" />
          </button>
          <span style={tabActionLabelStyle}>pin</span>
          <span style={tabActionUnderlineStyle} />
        </div>
        {renderTabItem(tabs[2])}
        {renderTabItem(tabs[3])}
      </div>
    </nav>
  );
};

export default TabBar;
