'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.api';

type AuthContextType = {
  authId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  authId: null,
  loading: true,
  logout: async () => {},
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authId, setAuthId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/authentication/status');
      if (res.ok) {
        const data = await res.json();
        setAuthId(data.userId);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    authService.logout()
    .then(() => setAuthId(null))
    .catch((error) => console.error(error));
  }, []);

  return (
    <AuthContext.Provider value={{ authId, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}