export type AuthMode = "login" | "register";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthSuccessPayload {
  message: string;
  user: AuthUser;
}

export interface AuthBackendPayload extends AuthSuccessPayload {
  token: string;
}

export interface AuthErrorPayload {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export interface AuthenticatedUserPayload {
  authenticated: true;
  user: AuthUser;
}

