export interface User {
  userId: string;

  email: string;

  role: string;

  sessionId: string;
}

export interface AuthContextType {
  user: User | null;

  token: string | null;

  loading: boolean;

  login: (
    token: string,
  ) => void;

  logout: () => void;
}