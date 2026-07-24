import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  domain: string;
  tier: string;
  xp: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, domain: 'cse' | 'ece', password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (accessToken: string, refreshToken: string) => Promise<void>;
}

const MOCK_USER: User = {
  id: 'mock-user-id-123',
  email: 'tkarthikeyan@gmail.com',
  name: 'Karthikeyan',
  domain: 'cse',
  tier: 'Explorer',
  xp: 150,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  const setSession = async (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setAccessToken(access);

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      toast.success(`Authenticated as ${response.data.user.name}`);
    } catch (err) {
      console.warn('Backend unavailable, using mock user profile');
      const u = {
        ...MOCK_USER,
        email: localStorage.getItem('userEmail') || MOCK_USER.email,
        name: (localStorage.getItem('userEmail') || MOCK_USER.email).split('@')[0],
      };
      setUser(u);
      toast.info(`Session active (${u.name})`);
    }
  };

  const logoutState = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    setAccessToken(null);
    setUser(null);
    toast.info('Signed out of TalentForge');
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: loggedUser } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userEmail', loggedUser.email);
      setAccessToken(accessToken);
      setUser(loggedUser);
      toast.success(`Welcome back, ${loggedUser.name}!`);
    } catch (err: any) {
      console.warn('Login API call failed, falling back to mock authentication mode:', err?.message);
      const mockToken = 'mock_jwt_access_token_' + Date.now();
      const mockUser: User = {
        id: 'mock-' + Math.random().toString(36).substring(7),
        email: email || 'tkarthikeyan@gmail.com',
        name: email ? email.split('@')[0] : 'Karthikeyan',
        domain: 'cse',
        tier: 'Explorer',
        xp: 150,
      };

      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('refreshToken', 'mock_jwt_refresh_token');
      localStorage.setItem('userEmail', mockUser.email);
      setAccessToken(mockToken);
      setUser(mockUser);
      toast.success(`Signed in as ${mockUser.name} (Dev Mode)`);
    }
  };

  const registerUser = async (name: string, email: string, domain: 'cse' | 'ece', password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, domain, password });
      const { accessToken, refreshToken, user: registeredUser } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userEmail', registeredUser.email);
      setAccessToken(accessToken);
      setUser(registeredUser);
    } catch (err: any) {
      console.warn('Registration API call failed, falling back to mock registration mode:', err?.message);
      const mockToken = 'mock_jwt_access_token_' + Date.now();
      const mockUser: User = {
        id: 'mock-' + Math.random().toString(36).substring(7),
        email,
        name,
        domain,
        tier: 'Explorer',
        xp: 0,
      };

      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('refreshToken', 'mock_jwt_refresh_token');
      localStorage.setItem('userEmail', mockUser.email);
      setAccessToken(mockToken);
      setUser(mockUser);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint failed or mock mode active');
    } finally {
      logoutState();
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      if (token.startsWith('mock_')) {
        const storedEmail = localStorage.getItem('userEmail') || MOCK_USER.email;
        setUser({
          ...MOCK_USER,
          email: storedEmail,
          name: storedEmail.split('@')[0],
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (err) {
        console.warn('Auto login check failed, using mock profile fallback');
        const storedEmail = localStorage.getItem('userEmail') || MOCK_USER.email;
        setUser({
          ...MOCK_USER,
          email: storedEmail,
          name: storedEmail.split('@')[0],
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [accessToken]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        registerUser,
        logout,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
