import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { User } from "../../types/user";
import { authApi } from "../../services/api";
import { AuthContext } from "./AuthContext";

const TOKEN_KEY = "beetip_access_token";
const USER_KEY = "beetip_user";

const readStoredUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [currentUser, setCurrentUser] = useState<User | null>(readStoredUser);

  const persistSession = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAccessToken(token);
    setCurrentUser(user);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!accessToken) return;

    const response = await authApi.me(accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setCurrentUser(response.user);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isActive = true;

    authApi
      .me(accessToken)
      .then((response) => {
        if (!isActive) return;
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setCurrentUser(response.user);
      })
      .catch(() => {
        if (!isActive) return;
        clearSession();
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, clearSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      persistSession(response.accessToken, response.user);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      await authApi.register(email, password);
      return await login(email, password);
    } catch {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout(accessToken);
    } finally {
      clearSession();
    }
  };

  const updateBalance = (balance: number): void => {
    setCurrentUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, balance };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accessToken,
        isAuthenticated: Boolean(currentUser && accessToken),
        isLoading: false,
        login,
        register,
        logout,
        refreshUser,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
