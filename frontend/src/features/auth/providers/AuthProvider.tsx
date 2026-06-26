'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

type AuthContextType = {
  authUserId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  authUserId: null,
  loading: true,
  logout: async () => {},
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/authentication/status');
      if (res.ok) {
        const data = await res.json();
        setAuthUserId(data.userId);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    authService.logout()
    .then(() => setAuthUserId(null))
    .catch((error) => console.error(error));
  }, []);

  return (
    <AuthContext.Provider value={{ authUserId, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}