export type UserRole = "READER" | "WRITER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface SessionData {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResult<T = void> {
  data: T | null;
  error: string | null;
}
