import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Category, Provider, MOCK_CATEGORIES } from "@/lib/data";

interface ProvidersContextType {
  providers: Provider[];
  categories: Category[];
  loading: boolean;
  approveProvider: (id: string) => Promise<void>;
  rejectProvider: (id: string, reason: string) => Promise<void>;
  revokeProvider: (id: string) => Promise<void>;
  getProvider: (id: string) => Provider | undefined;
  getCategory: (id: string) => Category | undefined;
}

const ProvidersContext = createContext<ProvidersContextType | undefined>(undefined);

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, { signal: AbortSignal.timeout(8000), ...options });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export function ProvidersProvider({ children }: { children: React.ReactNode }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const loadProviders = useCallback(async () => {
    try {
      const data = await apiFetch("/api/providers") as Provider[];
      setProviders(data);
    } catch (err) {
      console.error("Failed to load providers from API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const approveProvider = useCallback(async (id: string) => {
    await apiFetch(`/api/providers/${id}/approve`, { method: "PATCH" });
    await loadProviders();
  }, [loadProviders]);

  const rejectProvider = useCallback(async (id: string, reason: string) => {
    await apiFetch(`/api/providers/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    await loadProviders();
  }, [loadProviders]);

  const revokeProvider = useCallback(async (id: string) => {
    await apiFetch(`/api/providers/${id}/revoke`, { method: "PATCH" });
    await loadProviders();
  }, [loadProviders]);

  const getProvider = (id: string) => providers.find((p) => p.id === id);
  const getCategory = (id: string) => categories.find((c) => c.id === id);

  return (
    <ProvidersContext.Provider
      value={{
        providers,
        categories,
        loading,
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
