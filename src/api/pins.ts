// ashiato-frontend/src/api/pins.ts

import { Pin } from '@/types/api'; // Pin型は事前に定義済み
import { getStoredToken } from '@/utils/token'; // トークンを取得するヘルパー関数

const API_BASE_URL = 'http://localhost:8080/v1'; 

interface GetPinsResponse {
  pins: Pin[];
}

/**
 * マップの表示範囲に基づいてピンを取得する
 */
type BoundsQueryParams = {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
};

export const getPins = async (bounds: BoundsQueryParams): Promise<Pin[]> => {
  const token = getStoredToken(); // AuthContextからトークンを取得するヘルパー関数を実装
  if (!token) throw new Error('Authentication required');

  // クエリパラメータを構築
  const params = new URLSearchParams({
    ne_lat: bounds.ne_lat.toString(),
    ne_lng: bounds.ne_lng.toString(),
    sw_lat: bounds.sw_lat.toString(),
    sw_lng: bounds.sw_lng.toString(),
  }).toString(); 
  
  const response = await fetch(`${API_BASE_URL}/pins?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // JWTトークンをAuthorizationヘッダーに含める
      'Authorization': `Bearer ${token}`, 
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const error = new Error('Unauthorized');
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    let message = `Failed to fetch pins with status: ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string') {
        message = body.error;
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }

  const data: GetPinsResponse = await response.json();
  return data.pins;
};
