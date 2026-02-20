export type AuthMode = 'login' | 'signup';

export interface AuthError {
  message: string;
  field?: string;
}
