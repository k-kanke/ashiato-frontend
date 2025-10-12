
export interface AuthResponse {
  message: string;
  token: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  username?: string;
}

export interface ErrorResponse {
  error: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  comment_on_my_pin: boolean;
  created_at: string;
}