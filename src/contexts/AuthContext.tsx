import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '@/utils/api';

interface AuthContextType {
  isAdmin: boolean;
  adminUser: string;
  loading: boolean;
  loginAdmin: (token: string, username: string) => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sw_token');
    if (token) {
      verifyToken()
        .then(res => {
          setIsAdmin(true);
          setAdminUser(res.data.username);
        })
        .catch(() => {
          localStorage.removeItem('sw_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginAdmin = (token: string, username: string) => {
    localStorage.setItem('sw_token', token);
    setIsAdmin(true);
    setAdminUser(username);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('sw_token');
    setIsAdmin(false);
    setAdminUser('');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminUser, loginAdmin, logoutAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
