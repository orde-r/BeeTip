import { useState, type ReactNode } from "react";
import type { User } from "../../types/user";
import { mockUsers } from "../../mockdata/MockData/mockData";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const user = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (user) {
      setCurrentUser(user);
      return true;
    }

    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
    if (users.some((user) => user.email === email)) {
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = (): void => {
    setCurrentUser(null);
  };

  const updateWalletBalance = (userId: string, difference: number): void => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, walletBalance: user.walletBalance + difference }
          : user,
      ),
    );
    setCurrentUser((prev) =>
      prev && prev.id === userId
        ? { ...prev, walletBalance: prev.walletBalance + difference }
        : prev,
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        logout,
        updateWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
