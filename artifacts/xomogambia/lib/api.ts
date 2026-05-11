import { Platform } from "react-native";

export function getApiBase(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, "");

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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Provider Registration ─────────────────────────────────────────────────────

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
  return apiFetch("/api/providers", { method: "POST", body: JSON.stringify(data) });
}

// ── Companies ─────────────────────────────────────────────────────────────────

export interface ApiCompany {
  id: string;
  name: string;
  categoryIds: string[];
  description: string;
  location: string;
  phone: string;
  services: string[];
  yearsActive: number;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
}

export async function fetchCompanies(categoryId?: string): Promise<ApiCompany[]> {
  const qs = categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
  return apiFetch(`/api/companies${qs}`);
}

export async function fetchCompany(id: string): Promise<ApiCompany> {
  return apiFetch(`/api/companies/${id}`);
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ApiReview {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export async function fetchReviews(companyId: string): Promise<ApiReview[]> {
  return apiFetch(`/api/companies/${companyId}/reviews`);
}

export async function postReview(companyId: string, data: {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}): Promise<ApiReview> {
  return apiFetch(`/api/companies/${companyId}/reviews`, { method: "POST", body: JSON.stringify(data) });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "provider";
  companyId: string | null;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password?: string;
  role?: "customer" | "provider";
  companyId?: string;
}): Promise<ApiUser> {
  return apiFetch("/api/users/register", { method: "POST", body: JSON.stringify(data) });
}

export async function loginUser(email: string, password?: string): Promise<ApiUser> {
  return apiFetch("/api/users/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function updateUserApi(id: string, updates: Partial<ApiUser>): Promise<ApiUser> {
  return apiFetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
}

// ── Quotes ────────────────────────────────────────────────────────────────────

export interface ApiQuote {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  location: string;
  status: "pending" | "received" | "accepted" | "declined";
  amount: number | null;
  createdAt: string;
}

export async function fetchQuotes(userId: string): Promise<ApiQuote[]> {
  return apiFetch(`/api/quotes?userId=${encodeURIComponent(userId)}`);
}

export async function fetchProviderQuotes(companyId: string): Promise<ApiQuote[]> {
  return apiFetch(`/api/quotes?companyId=${encodeURIComponent(companyId)}`);
}

export async function createQuote(data: Omit<ApiQuote, "id" | "createdAt">): Promise<ApiQuote> {
  return apiFetch("/api/quotes", { method: "POST", body: JSON.stringify(data) });
}

export async function updateQuote(id: string, data: { status?: ApiQuote["status"]; amount?: number }): Promise<ApiQuote> {
  return apiFetch(`/api/quotes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface ApiJob {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  location: string;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  amount: number;
  scheduledDate: string | null;
  completedDate: string | null;
  reviewed: boolean;
  paymentStatus: "unpaid" | "paid";
  paymentMethod: string | null;
  transactionRef: string | null;
  paidAt: string | null;
  createdAt: string;
}

export async function fetchJobs(userId: string): Promise<ApiJob[]> {
  return apiFetch(`/api/jobs?userId=${encodeURIComponent(userId)}`);
}

export async function fetchProviderJobs(companyId: string): Promise<ApiJob[]> {
  return apiFetch(`/api/jobs?companyId=${encodeURIComponent(companyId)}`);
}

export async function createJob(data: Omit<ApiJob, "id" | "createdAt" | "reviewed" | "completedDate" | "paymentStatus" | "paymentMethod" | "transactionRef" | "paidAt">): Promise<ApiJob> {
  return apiFetch("/api/jobs", { method: "POST", body: JSON.stringify(data) });
}

export async function updateJobStatus(id: string, status: ApiJob["status"]): Promise<ApiJob> {
  return apiFetch(`/api/jobs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function markJobReviewedApi(id: string): Promise<ApiJob> {
  return apiFetch(`/api/jobs/${id}/review`, { method: "PATCH" });
}

export async function markJobPaidApi(id: string, paymentMethod: string, transactionRef: string): Promise<ApiJob> {
  return apiFetch(`/api/jobs/${id}/pay`, { method: "PATCH", body: JSON.stringify({ paymentMethod, transactionRef }) });
}
