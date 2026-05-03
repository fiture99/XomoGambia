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

async function fetchApiProviders(): Promise<Provider[]> {
  try {
    const res = await fetch("/api/providers", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json() as Provider[];
    return data;
  } catch {
    return [];
  }
}

async function patchApiProvider(id: string, action: "approve" | "reject", reason?: string): Promise<void> {
  try {
    const url = `/api/providers/${id}/${action}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: action === "reject" ? JSON.stringify({ reason }) : undefined,
      signal: AbortSignal.timeout(3000),
    });
  } catch {
  }
}

export function ProvidersProvider({ children }: { children: React.ReactNode }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(MOCK_CATEGORIES));
      setCategories(MOCK_CATEGORIES);
    }

    const storedProviders = localStorage.getItem(PROVIDERS_KEY);
    const localProviders: Provider[] = storedProviders ? JSON.parse(storedProviders) : MOCK_PROVIDERS;
    if (!storedProviders) {
      localStorage.setItem(PROVIDERS_KEY, JSON.stringify(MOCK_PROVIDERS));
    }

    fetchApiProviders().then((apiProviders) => {
      const localIds = new Set(localProviders.map((p) => p.id));
      const newFromApi = apiProviders.filter((p) => !localIds.has(p.id));
      const merged = [...localProviders, ...newFromApi];
      setProviders(merged);
      setInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(async () => {
      const apiProviders = await fetchApiProviders();
      setProviders((current) => {
        const localIds = new Set(current.filter((p) => !p.id.startsWith("api-")).map((p) => p.id));
        const newFromApi = apiProviders.filter((p) => !localIds.has(p.id) && p.id.startsWith("api-"));
        if (newFromApi.length === 0) return current;
        return [...current, ...newFromApi];
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [initialized]);

  const saveProviders = (newProviders: Provider[]) => {
    setProviders(newProviders);
    localStorage.setItem(PROVIDERS_KEY, JSON.stringify(newProviders));
  };

  const approveProvider = (id: string) => {
    const updated = providers.map((p) =>
      p.id === id ? { ...p, approvalStatus: "approved" as const, verified: true, rejectionReason: undefined } : p
    );
    saveProviders(updated);
    if (id.startsWith("api-")) patchApiProvider(id, "approve");
  };

  const rejectProvider = (id: string, reason: string) => {
    const updated = providers.map((p) =>
      p.id === id ? { ...p, approvalStatus: "rejected" as const, verified: false, rejectionReason: reason } : p
    );
    saveProviders(updated);
    if (id.startsWith("api-")) patchApiProvider(id, "reject", reason);
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
