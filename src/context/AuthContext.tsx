import { createContext, useContext, useState, ReactNode } from "react";
import { getUserById, User } from "@/data/mockData";

interface AuthContextType {
  currentUser: User;
  setCurrentUserId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState('t1');
  const currentUser = getUserById(currentUserId)!;

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
