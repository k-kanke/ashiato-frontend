
export interface AuthResponse {
  message: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  username: string;
}

export type FriendshipStatus =
  | 'none'
  | 'friends'
  | 'pending_sent'
  | 'pending_received';

export type RawFriendshipStatus = FriendshipStatus | 'pending';

export interface FriendSummary {
  user_id: string;
  username: string;
  profile_image_url?: string | null;
}

export interface UserSearchItem {
  user_id: string;
  username: string;
  profile_image_url?: string | null;
  friendship_status: RawFriendshipStatus;
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
  media_url: string | null;
  created_at: string;
}

export interface Notification {
  notification_id: string;
  type: string;
  actor_user_id?: string | null;
  actor_username?: string | null;
  actor_profile_image_url?: string | null;
  related_entity_id?: string | null;
  is_read: boolean;
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
