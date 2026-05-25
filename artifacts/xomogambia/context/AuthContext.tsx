import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, updateUserApi, type ApiUser } from "../lib/api";

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
  hasRegistered: boolean;
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
  hasRegistered: false,
  login: async () => {},
  loginWithCredentials: async () => false,
  getStoredUser: async () => null,
  getLastUser: async () => null,
  updateUser: async () => {},
  logout: async () => {},
});

function apiUserToUser(u: ApiUser, password?: string): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    companyId: u.companyId ?? undefined,
    password,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("xomo_current_user"),
      AsyncStorage.getItem("xomo_has_registered"),
    ])
      .then(([userData, registered]) => {
        if (userData) setUser(JSON.parse(userData));
        if (registered === "true") setHasRegistered(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persistUser = useCallback(async (u: User | null) => {
    if (u) {
      await AsyncStorage.setItem("xomo_current_user", JSON.stringify(u));
    } else {
      await AsyncStorage.removeItem("xomo_current_user");
    }
    setUser(u);
  }, []);

  async function login(name: string, email: string, role: UserRole, password?: string, companyId?: string) {
    const apiUser = await registerUser({ name, email, password, role, companyId });
    await AsyncStorage.setItem("xomo_has_registered", "true");
    setHasRegistered(true);
    await persistUser(apiUserToUser(apiUser, password));
  }

  async function loginWithCredentials(email: string, password: string): Promise<boolean> {
    try {
      const apiUser = await loginUser(email, password);
      await persistUser(apiUserToUser(apiUser, password));
      return true;
    } catch {
      const data = await AsyncStorage.getItem("xomo_current_user");
      if (data) {
        const stored: User = JSON.parse(data);
        if (stored.email.toLowerCase() === email.toLowerCase() && stored.password === password) {
          setUser(stored);
          return true;
        }
      }
      return false;
    }
  }

  async function getStoredUser(email: string): Promise<User | null> {
    try {
      const apiUser = await loginUser(email);
      return apiUserToUser(apiUser);
    } catch {
      return null;
    }
  }

  async function getLastUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem("xomo_current_user");
    return data ? JSON.parse(data) : null;
  }

  async function updateUser(updates: Partial<User>) {
    if (!user) return;
    try {
      const apiUser = await updateUserApi(user.id, {
        name: updates.name,
        companyId: updates.companyId ?? null,
        role: updates.role,
      });
      await persistUser({ ...apiUserToUser(apiUser, user.password), password: updates.password ?? user.password });
    } catch {
      await persistUser({ ...user, ...updates });
    }
  }

  async function logout() {
    await AsyncStorage.removeItem("xomo_current_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, hasRegistered, login, loginWithCredentials, getStoredUser, getLastUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
