import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "customer" | "provider";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (name: string, email: string, role: UserRole, password?: string, companyId?: string) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithCredentials: async () => false,
  updateUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("xomo_user")
      .then((data) => {
        if (data) setUser(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function login(name: string, email: string, role: UserRole, password?: string, companyId?: string) {
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      password,
      companyId,
    };
    await AsyncStorage.setItem("xomo_user", JSON.stringify(newUser));
    setUser(newUser);
  }

  async function loginWithCredentials(email: string, password: string): Promise<boolean> {
    const data = await AsyncStorage.getItem("xomo_user");
    if (!data) return false;
    const stored: User = JSON.parse(data);
    if (stored.email.toLowerCase() === email.toLowerCase() && stored.password === password) {
      setUser(stored);
      return true;
    }
    return false;
  }

  async function updateUser(updates: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem("xomo_user", JSON.stringify(updated));
    setUser(updated);
  }

  async function logout() {
    await AsyncStorage.removeItem("xomo_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithCredentials, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
