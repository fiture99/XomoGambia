import { Platform } from "react-native";

function getApiBase(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes(".expo.")) {
      const mainHost = host.replace(".expo.", ".");
      return `https://${mainHost}`;
    }
    return window.location.origin;
  }
  return "";
}

export async function submitProviderRegistration(data: {
  name: string;
  categoryIds: string[];
  description: string;
  location: string;
  phone: string;
  services: string[];
  yearsActive: number;
  submitterName: string;
  submitterEmail: string;
}): Promise<{ id: string }> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/providers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
