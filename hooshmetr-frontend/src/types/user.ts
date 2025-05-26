export interface User {
  id: number;
  phone_number: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
  review_count?: number;
  comparison_count?: number;
  is_active: boolean;
}

export interface UserProfile {
  id: number;
  phone_number: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  review_count: number;
  comparison_count: number;
}

export interface UserProfileUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  bio?: string;
}

export interface VerificationCodeRequest {
  phone_number: string;
}

export interface VerificationCodeVerify {
  phone_number: string;
  code: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
