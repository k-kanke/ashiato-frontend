'use client';

import { Notification } from '@/types/api';
import { getStoredToken } from '@/utils/token';

const API_BASE_URL = 'http://localhost:8080/v1';

const buildAuthHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const handleErrorResponse = async (response: Response): Promise<never> => {
  let message = `Request failed with status ${response.status}`;

  try {
    const body = await response.json();
    if (body && typeof body.error === 'string') {
      message = body.error;
    }
  } catch {
    // ignore
  }

  const error = new Error(message) as Error & { status?: number };
  error.status = response.status;
  throw error;
};

type NotificationListResponse = {
  notifications: Notification[];
};

type UnreadCountResponse = {
  unread_count: number;
};

type ListNotificationParams = {
  limit?: number;
  before?: string;
};

export const listNotifications = async (params: ListNotificationParams = {}): Promise<Notification[]> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const searchParams = new URLSearchParams();
  if (typeof params.limit === 'number' && params.limit > 0) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params.before) {
    searchParams.set('before', params.before);
  }

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/notifications${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: NotificationListResponse = await response.json();
  return data.notifications;
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: UnreadCountResponse = await response.json();
  return data.unread_count;
};

export const markNotificationAsRead = async (notificationID: string): Promise<void> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(
    `${API_BASE_URL}/notifications/${encodeURIComponent(notificationID)}/read`,
    {
      method: 'POST',
      headers: buildAuthHeaders(token),
    },
  );

  if (!response.ok) {
    await handleErrorResponse(response);
  }
};
