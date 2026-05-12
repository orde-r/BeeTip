import type { User } from "./user";

export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateWalletBalance: (userId: string, delta: number) => void;
}
