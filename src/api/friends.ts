'use client';

import { FriendSummary } from '@/types/api';
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

type FriendResponse = {
  message: string;
};

type FriendListResponse = {
  friends: FriendSummary[];
};

export const getFriends = async (): Promise<FriendSummary[]> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/friends`, {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: FriendListResponse = await response.json();
  return data.friends;
};

export const requestFriend = async (userID: string): Promise<FriendResponse> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(
    `${API_BASE_URL}/friends/${encodeURIComponent(userID)}/request`,
    {
      method: 'POST',
      headers: buildAuthHeaders(token),
    },
  );

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: FriendResponse = await response.json();
  return data;
};

export const acceptFriend = async (userID: string): Promise<FriendResponse> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(
    `${API_BASE_URL}/friends/${encodeURIComponent(userID)}/accept`,
    {
      method: 'POST',
      headers: buildAuthHeaders(token),
    },
  );

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: FriendResponse = await response.json();
  return data;
};
