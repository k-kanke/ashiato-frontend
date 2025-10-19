
export interface AuthResponse {
  message: string;
  token: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface ErrorResponse {
  error: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  comment_on_my_pin: boolean;
  friend_new_pin: boolean;
  friend_request_received: boolean;
  friend_request_accepted: boolean;
  created_at: string;
}

export interface Pin {
  pin_id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  content_text: string;
  media_url: string | null;
  privacy_setting: string;
  status: string;
  created_at: string;
}

export interface Comment {
  comment_id: string;
  pin_id: string;
  user_id: string;
  content_text: string;
  created_at: string;
}

export interface UpdateUserSettingsPayload {
  comment_on_my_pin: boolean;
  friend_new_pin: boolean;
  friend_request_received: boolean;
  friend_request_accepted: boolean;
}

export interface UpdateUserSettingsResponse {
  message: string;
  profile: UserProfile;
}
