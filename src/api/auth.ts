import { AuthRequest, AuthResponse, ErrorResponse } from "@/types/api";

const API_BASE_URL = 'http://localhost:8080/v1/auth';

// 共通フェッチ関数 (JSON形式の POST/PUT/GETを処理)
const fetchApi = async <T>(url: string, method: string, data?: object): Promise<T> => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorBody: ErrorResponse = await response.json();
    throw new Error(errorBody.error || `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

// POST /v1/auth/register
export const register = (data: AuthRequest): Promise<AuthResponse> => {
  return fetchApi<AuthResponse>(`${API_BASE_URL}/register`, 'POST', data);
};

// POST /v1/auth/login
export const login = (data: AuthRequest): Promise<AuthResponse> => {
  return fetchApi<AuthResponse>(`${API_BASE_URL}/login`, 'POST', data);
};