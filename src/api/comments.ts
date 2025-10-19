'use client';

import { Comment } from '@/types/api';
import { getStoredToken } from '@/utils/token';

const API_BASE_URL = 'http://localhost:8080/v1';

type GetThreadOptions = {
  limit?: number;
  after?: string;
};

interface GetThreadResponse {
  comments: Comment[];
}

interface PostCommentResponse {
  comment: Comment;
}

const buildAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const isUnauthorized = (error: unknown): boolean => {
  if (error instanceof Error) {
    const maybeStatus = (error as Error & { status?: number }).status;
    if (maybeStatus === 401) {
      return true;
    }
    if (typeof error.message === 'string' && error.message.includes('401')) {
      return true;
    }
  }
  return false;
};

const handleResponseError = async (response: Response): Promise<never> => {
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

export const getThread = async (
  pinID: string,
  options?: GetThreadOptions,
): Promise<Comment[]> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const params = new URLSearchParams();
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options?.after) {
    params.append('after', options.after);
  }

  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/pins/${encodeURIComponent(pinID)}/thread${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      headers: buildAuthHeaders(token),
    },
  );

  if (!response.ok) {
    await handleResponseError(response);
  }

  const data: GetThreadResponse = await response.json();
  return data.comments;
};

type PostCommentPayload = {
  contentText: string;
  mediaFile?: File | null;
};

export const postComment = async (pinID: string, payload: PostCommentPayload): Promise<Comment> => {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const formData = new FormData();
  formData.append('content_text', payload.contentText);
  if (payload.mediaFile) {
    formData.append('image', payload.mediaFile);
  }

  const response = await fetch(`${API_BASE_URL}/pins/${encodeURIComponent(pinID)}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  const data: PostCommentResponse = await response.json();
  return data.comment;
};

export { isUnauthorized };
