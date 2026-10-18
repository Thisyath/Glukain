import api from './client';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export const authApi = {
  // UC-01: Register
  register: async (data: RegisterData) => {
    const { data: response } = await api.post('/auth/register', data);
    return response.data;
  },

  // UC-18: Verify Email
  verifyEmail: async (token: string) => {
    const { data: response } = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // UC-02: Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const { data: response } = await api.post('/auth/login', data);
    const authData = response.data;

    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));

    return authData;
  },

  // UC-03: Logout
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  // UC-19: Forgot Password
  forgotPassword: async (email: string) => {
    const { data: response } = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // UC-19: Reset Password
  resetPassword: async (token: string, newPassword: string) => {
    const { data: response } = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
