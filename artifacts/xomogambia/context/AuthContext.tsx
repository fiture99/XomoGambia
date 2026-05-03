import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "customer" | "provider";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  companyId?: string;
}

type StoredUserMap = Record<string, User>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (name: string, email: string, role: UserRole, password?: string, companyId?: string) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  getStoredUser: (email: string) => Promise<User | null>;
  getLastUser: () => Promise<User | null>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithCredentials: async () => false,
  getStoredUser: async () => null,
  getLastUser: async () => null,
  updateUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("xomo_users")
      .then((data) => {
        if (!data) return;
        const users: StoredUserMap = JSON.parse(data);
        const values = Object.values(users);
        if (values.length > 0) setUser(values[values.length - 1]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const readUsers = useCallback(async (): Promise<StoredUserMap> => {
    const data = await AsyncStorage.getItem("xomo_users");
    if (!data) return {};
    return JSON.parse(data);
  }, []);

  const saveUsers = useCallback(async (users: StoredUserMap) => {
    await AsyncStorage.setItem("xomo_users", JSON.stringify(users));
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
    const users = await readUsers();
    users[newUser.email.toLowerCase()] = newUser;
    await saveUsers(users);
    setUser(newUser);
  }

  async function loginWithCredentials(email: string, password: string): Promise<boolean> {
    const users = await readUsers();
    const stored = users[email.toLowerCase()];
    if (stored && stored.password === password) {
      setUser(stored);
      return true;
    }
    return false;
  }

  async function getStoredUser(email: string): Promise<User | null> {
    const users = await readUsers();
    return users[email.toLowerCase()] ?? null;
  }

  async function getLastUser(): Promise<User | null> {
    const users = await readUsers();
    const values = Object.values(users);
    return values.length > 0 ? values[values.length - 1] : null;
  }

  async function updateUser(updates: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    const users = await readUsers();
    users[updated.email.toLowerCase()] = updated;
    await saveUsers(users);
    setUser(updated);
  }

  async function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithCredentials, getStoredUser, getLastUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
