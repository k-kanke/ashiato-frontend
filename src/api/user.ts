'use client';

import {
  UpdateUserSettingsPayload,
  UpdateUserSettingsResponse,
  UserProfile,
} from '@/types/api';
import { getStoredToken } from '@/utils/token';

const API_BASE_URL = 'http://localhost:8080/v1';

const buildAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const handleErrorResponse = async (response: Response): Promise<never> => {
  let message = `Request failed with status ${response.status}`;

  try {
    const body = await response.json();
    if (body && typeof body.error === 'string') {
      message = body.error;
    }
  } catch {
    // ignore JSON parse errors
  }

  const error = new Error(message) as Error & { status?: number };
  error.status = response.status;
  throw error;
};

export const getProfile = async (): Promise<UserProfile> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const profile: UserProfile = await response.json();
  return profile;
};

export const updateUserSettings = async (
  payload: UpdateUserSettingsPayload,
): Promise<UpdateUserSettingsResponse> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/me/settings`, {
    method: 'PUT',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: UpdateUserSettingsResponse = await response.json();
  return data;
};

