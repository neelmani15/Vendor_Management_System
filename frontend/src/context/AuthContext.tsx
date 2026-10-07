import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setApiToken, getApiToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  register: (payload: { email: string; password: string; name: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const ROLE_ACCOUNTS: Record<UserRole, { email: string; name: string; label: string; desc: string }> = {
  ADMIN: {
    email: 'admin@fieldnerve.com',
    name: 'Eleanor Vance',
    label: 'Admin',
    desc: 'Full system privileges, vendor deletions, audit trails, and security settings.',
  },
  PROCUREMENT_MANAGER: {
    email: 'manager@fieldnerve.com',
    name: 'Marcus Brody',
    label: 'Procurement Manager',
    desc: 'Vendor onboarding, compliance review & approval, contract and document auditing.',
  },
  PROCUREMENT_USER: {
    email: 'buyer@fieldnerve.com',
    name: 'Sophia Chen',
    label: 'Procurement Buyer',
    desc: 'Create work requirements, execute AI recommendation engine, select vendors.',
  },
  VIEWER: {
    email: 'viewer@fieldnerve.com',
    name: 'David Kim',
    label: 'Auditor / Viewer',
    desc: 'Read-only access across vendor directory, compliance records, and requirements.',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const token = getApiToken();
      if (token) {
        const profile = await api.me();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      // Invalid or expired token: clear session
      setApiToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const switchRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const account = ROLE_ACCOUNTS[role];
      const res = await api.login(account.email, 'Password123!');
      setUser(res.user);
    } catch (err) {
      console.warn('Backend login unavailable or unseeded, using mock context session', err);
      const account = ROLE_ACCOUNTS[role];
      setUser({
        id: 'mock-user-id',
        name: account.name,
        email: account.email,
        role: role,
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password = 'Password123!') => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { email: string; password: string; name: string; role?: UserRole }) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setApiToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, switchRole, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
