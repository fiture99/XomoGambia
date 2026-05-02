import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, Provider, MOCK_CATEGORIES, MOCK_PROVIDERS } from "@/lib/data";

interface ProvidersContextType {
  providers: Provider[];
  categories: Category[];
  approveProvider: (id: string) => void;
  rejectProvider: (id: string, reason: string) => void;
  revokeProvider: (id: string) => void;
  getProvider: (id: string) => Provider | undefined;
  getCategory: (id: string) => Category | undefined;
}

const ProvidersContext = createContext<ProvidersContextType | undefined>(undefined);

const PROVIDERS_KEY = "xomo_admin_providers";
const CATEGORIES_KEY = "xomo_admin_categories";

export function ProvidersProvider({ children }: { children: React.ReactNode }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedProviders = localStorage.getItem(PROVIDERS_KEY);
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);

    if (storedProviders && storedCategories) {
      setProviders(JSON.parse(storedProviders));
      setCategories(JSON.parse(storedCategories));
    } else {
      localStorage.setItem(PROVIDERS_KEY, JSON.stringify(MOCK_PROVIDERS));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(MOCK_CATEGORIES));
      setProviders(MOCK_PROVIDERS);
      setCategories(MOCK_CATEGORIES);
    }
    setInitialized(true);
  }, []);

  const saveProviders = (newProviders: Provider[]) => {
    setProviders(newProviders);
    localStorage.setItem(PROVIDERS_KEY, JSON.stringify(newProviders));
  };

  const approveProvider = (id: string) => {
    const updated = providers.map((p) =>
      p.id === id ? { ...p, approvalStatus: "approved" as const, verified: true, rejectionReason: undefined } : p
    );
    saveProviders(updated);
  };

  const rejectProvider = (id: string, reason: string) => {
    const updated = providers.map((p) =>
      p.id === id ? { ...p, approvalStatus: "rejected" as const, verified: false, rejectionReason: reason } : p
    );
    saveProviders(updated);
  };

  const revokeProvider = (id: string) => {
    const updated = providers.map((p) =>
      p.id === id ? { ...p, approvalStatus: "pending" as const, verified: false, rejectionReason: undefined } : p
    );
    saveProviders(updated);
  };

  const getProvider = (id: string) => providers.find((p) => p.id === id);
  const getCategory = (id: string) => categories.find((c) => c.id === id);

  if (!initialized) return null;

  return (
    <ProvidersContext.Provider
      value={{
        providers,
        categories,
        approveProvider,
        rejectProvider,
        revokeProvider,
        getProvider,
        getCategory,
      }}
    >
      {children}
    </ProvidersContext.Provider>
  );
}

export function useProviders() {
  const context = useContext(ProvidersContext);
  if (context === undefined) {
    throw new Error("useProviders must be used within a ProvidersProvider");
  }
  return context;
}