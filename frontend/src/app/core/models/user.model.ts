export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
