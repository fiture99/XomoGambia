import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  fetchCompanies, fetchReviews, postReview,
  fetchQuotes, createQuote, updateQuote,
  fetchJobs, createJob, updateJobStatus,
  markJobReviewedApi, markJobPaidApi,
  type ApiCompany, type ApiReview, type ApiQuote, type ApiJob,
} from "../lib/api";

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

export interface Company {
  id: string;
  name: string;
  categoryIds: string[];
  description: string;
  location: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  yearsActive: number;
  phone: string;
  services: string[];
}

export interface Review {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface QuoteRequest {
  id: string;
  companyId: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  location: string;
  status: "pending" | "received" | "accepted" | "declined";
  amount?: number;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  location: string;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  amount: number;
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  reviewed: boolean;
  paymentStatus?: "unpaid" | "paid";
  paymentMethod?: string;
  transactionRef?: string;
  paidAt?: string;
}

export const CATEGORIES: ServiceCategory[] = [
  { id: "electrical", name: "Electrical", slug: "electrical", icon: "zap", color: "#F59E0B", description: "Wiring, installations & repairs" },
  { id: "plumbing", name: "Plumbing", slug: "plumbing", icon: "droplet", color: "#3B82F6", description: "Pipes, fixtures & waterproofing" },
  { id: "cctv", name: "CCTV & Security", slug: "cctv", icon: "video", color: "#8B5CF6", description: "Camera systems, alarms & access" },
  { id: "cleaning", name: "Cleaning", slug: "cleaning", icon: "wind", color: "#06B6D4", description: "Commercial & residential cleaning" },
  { id: "ac", name: "Air Conditioning", slug: "ac", icon: "thermometer", color: "#0EA5E9", description: "Installation, servicing & repairs" },
  { id: "generators", name: "Generators", slug: "generators", icon: "battery-charging", color: "#EF4444", description: "Supply, install & maintenance" },
  { id: "painting", name: "Painting", slug: "painting", icon: "edit-3", color: "#EC4899", description: "Interior & exterior painting" },
  { id: "carpentry", name: "Carpentry", slug: "carpentry", icon: "tool", color: "#92400E", description: "Custom woodwork & joinery" },
  { id: "landscaping", name: "Landscaping", slug: "landscaping", icon: "feather", color: "#10B981", description: "Garden design & maintenance" },
];

function apiCompanyToCompany(c: ApiCompany): Company {
  return {
    id: c.id, name: c.name, categoryIds: c.categoryIds,
    description: c.description, location: c.location,
    verified: c.verified, rating: c.rating, reviewCount: c.reviewCount,
    completedJobs: c.completedJobs, yearsActive: c.yearsActive,
    phone: c.phone, services: c.services,
  };
}

function apiQuoteToQuote(q: ApiQuote): QuoteRequest {
  return {
    id: q.id, companyId: q.companyId, companyName: q.companyName,
    categoryId: q.categoryId, categoryName: q.categoryName,
    description: q.description, location: q.location, status: q.status,
    amount: q.amount ?? undefined,
    createdAt: typeof q.createdAt === "string" ? q.createdAt : new Date(q.createdAt).toISOString(),
  };
}

function apiJobToJob(j: ApiJob): Job {
  return {
    id: j.id, companyId: j.companyId, companyName: j.companyName,
    categoryId: j.categoryId, categoryName: j.categoryName,
    description: j.description, location: j.location, status: j.status,
    amount: j.amount,
    scheduledDate: j.scheduledDate ?? undefined,
    completedDate: j.completedDate ?? undefined,
    createdAt: typeof j.createdAt === "string" ? j.createdAt : new Date(j.createdAt).toISOString(),
    reviewed: j.reviewed, paymentStatus: j.paymentStatus,
    paymentMethod: j.paymentMethod ?? undefined,
    transactionRef: j.transactionRef ?? undefined,
    paidAt: j.paidAt ?? undefined,
  };
}

interface AppContextType {
  categories: ServiceCategory[];
  companies: Company[];
  loadingCompanies: boolean;
  reloadCompanies: () => Promise<void>;
  getCompany: (id: string) => Company | undefined;
  getCompaniesByCategory: (categoryId: string) => Company[];
  getReviews: (companyId: string) => Review[];
  loadReviews: (companyId: string) => Promise<void>;
  getCompaniesForProvider: (companyId?: string) => Company[];
  getQuotesForProvider: (companyId?: string) => QuoteRequest[];
  getJobsForProvider: (companyId?: string) => Job[];
  addCompany: (data: {
    name: string; email?: string; phone: string; categoryIds: string[];
    description: string; location: string; services: string[]; yearsActive: number;
  }) => Company;
  isCompanyEmailTaken: (email: string) => boolean;
  isCompanyPhoneTaken: (phone: string) => boolean;
  quotes: QuoteRequest[];
  loadQuotes: (userId: string) => Promise<void>;
  addQuote: (userId: string, quote: Omit<QuoteRequest, "id" | "createdAt">) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteRequest["status"], amount?: number) => Promise<void>;
  jobs: Job[];
  loadJobs: (userId: string) => Promise<void>;
  addJob: (userId: string, job: Omit<Job, "id" | "createdAt" | "reviewed">) => Promise<void>;
  updateJobStatus: (id: string, status: Job["status"]) => Promise<void>;
  addReview: (review: Omit<Review, "id" | "date">) => Promise<void>;
  markJobReviewed: (jobId: string) => Promise<void>;
  markJobPaid: (jobId: string, paymentMethod: string, transactionRef: string) => Promise<void>;
  userReviews: Review[];
}

const AppContext = createContext<AppContextType>({
  categories: CATEGORIES, companies: [], loadingCompanies: true,
  reloadCompanies: async () => {},
  getCompany: () => undefined, getCompaniesByCategory: () => [],
  getReviews: () => [], loadReviews: async () => {},
  getCompaniesForProvider: () => [], getQuotesForProvider: () => [], getJobsForProvider: () => [],
  addCompany: () => { throw new Error("not initialized"); },
  isCompanyEmailTaken: () => false, isCompanyPhoneTaken: () => false,
  quotes: [], loadQuotes: async () => {},
  addQuote: async () => {}, updateQuoteStatus: async () => {},
  jobs: [], loadJobs: async () => {},
  addJob: async () => {}, updateJobStatus: async () => {},
  addReview: async () => {}, markJobReviewed: async () => {}, markJobPaid: async () => {},
  userReviews: [],
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [reviewsCache, setReviewsCache] = useState<Record<string, Review[]>>({});
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  const reloadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const data = await fetchCompanies();
      const mapped = data.map(apiCompanyToCompany);
      setCompanies(mapped);
      AsyncStorage.setItem("xomo_companies_cache", JSON.stringify(mapped)).catch(() => {});
    } catch {
      const cached = await AsyncStorage.getItem("xomo_companies_cache").catch(() => null);
      if (cached) setCompanies(JSON.parse(cached));
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => { reloadCompanies(); }, [reloadCompanies]);

  const loadReviews = useCallback(async (companyId: string) => {
    try {
      const data = await fetchReviews(companyId);
      setReviewsCache((prev) => ({ ...prev, [companyId]: data }));
    } catch {}
  }, []);

  const loadQuotes = useCallback(async (userId: string) => {
    try {
      const data = await fetchQuotes(userId);
      setQuotes(data.map(apiQuoteToQuote));
    } catch {
      const cached = await AsyncStorage.getItem(`xomo_quotes_${userId}`).catch(() => null);
      if (cached) setQuotes(JSON.parse(cached));
    }
  }, []);

  const loadJobs = useCallback(async (userId: string) => {
    try {
      const data = await fetchJobs(userId);
      setJobs(data.map(apiJobToJob));
    } catch {
      const cached = await AsyncStorage.getItem(`xomo_jobs_${userId}`).catch(() => null);
      if (cached) setJobs(JSON.parse(cached));
    }
  }, []);

  const getCompany = useCallback((id: string) => companies.find((c) => c.id === id), [companies]);

  const getCompaniesForProvider = useCallback(
    (companyId?: string) => (companyId ? companies.filter((c) => c.id === companyId) : []),
    [companies]
  );

  const getQuotesForProvider = useCallback(
    (companyId?: string) => (companyId ? quotes.filter((q) => q.companyId === companyId) : []),
    [quotes]
  );

  const getJobsForProvider = useCallback(
    (companyId?: string) => (companyId ? jobs.filter((j) => j.companyId === companyId) : []),
    [jobs]
  );

  const getCompaniesByCategory = useCallback(
    (categoryId: string) => companies.filter((c) => c.categoryIds.includes(categoryId)),
    [companies]
  );

  const getReviews = useCallback(
    (companyId: string) => [
      ...(reviewsCache[companyId] ?? []),
      ...userReviews.filter((r) => r.companyId === companyId),
    ],
    [reviewsCache, userReviews]
  );

  const addCompany = useCallback(
    (data: { name: string; email?: string; phone: string; categoryIds: string[]; description: string; location: string; services: string[]; yearsActive: number; }): Company => {
      const newCompany: Company = {
        ...data, id: "p" + Date.now().toString() + Math.random().toString(36).substring(2, 6),
        verified: false, rating: 0, reviewCount: 0, completedJobs: 0,
      };
      setCompanies((prev) => [...prev, newCompany]);
      return newCompany;
    },
    []
  );

  const isCompanyEmailTaken = useCallback(
    (email: string) => {
      const needle = email.trim().toLowerCase();
      if (!needle) return false;
      return companies.some((c) => (c as Company & { email?: string }).email?.toLowerCase() === needle);
    },
    [companies]
  );

  const isCompanyPhoneTaken = useCallback(
    (phone: string) => {
      const needle = phone.replace(/\D/g, "");
      if (!needle) return false;
      return companies.some((c) => c.phone.replace(/\D/g, "") === needle);
    },
    [companies]
  );

  const addQuote = useCallback(async (userId: string, quote: Omit<QuoteRequest, "id" | "createdAt">) => {
    try {
      const created = await createQuote({
        userId, companyId: quote.companyId, companyName: quote.companyName,
        categoryId: quote.categoryId, categoryName: quote.categoryName,
        description: quote.description, location: quote.location,
        status: quote.status, amount: quote.amount ?? null,
      });
      setQuotes((prev) => [apiQuoteToQuote(created), ...prev]);
    } catch {
      const local: QuoteRequest = {
        ...quote,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
      };
      setQuotes((prev) => [local, ...prev]);
    }
  }, []);

  const handleUpdateQuoteStatus = useCallback(async (id: string, status: QuoteRequest["status"], amount?: number) => {
    try {
      const updated = await updateQuote(id, { status, ...(amount !== undefined ? { amount } : {}) });
      setQuotes((prev) => prev.map((q) => (q.id === id ? apiQuoteToQuote(updated) : q)));
    } catch {
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status, ...(amount !== undefined ? { amount } : {}) } : q)));
    }
  }, []);

  const addJob = useCallback(async (userId: string, job: Omit<Job, "id" | "createdAt" | "reviewed">) => {
    try {
      const created = await createJob({
        userId, companyId: job.companyId, companyName: job.companyName,
        categoryId: job.categoryId, categoryName: job.categoryName,
        description: job.description, location: job.location,
        status: job.status, amount: job.amount,
        scheduledDate: job.scheduledDate ?? null,
      });
      setJobs((prev) => [apiJobToJob(created), ...prev]);
    } catch {
      const local: Job = {
        ...job,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        reviewed: false,
      };
      setJobs((prev) => [local, ...prev]);
    }
  }, []);

  const handleUpdateJobStatus = useCallback(async (id: string, status: Job["status"]) => {
    try {
      const updated = await updateJobStatus(id, status);
      setJobs((prev) => prev.map((j) => (j.id === id ? apiJobToJob(updated) : j)));
    } catch {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? { ...j, status, ...(status === "completed" ? { completedDate: new Date().toISOString() } : {}) }
            : j
        )
      );
    }
  }, []);

  const addReview = useCallback(async (review: Omit<Review, "id" | "date">) => {
    try {
      const created = await postReview(review.companyId, {
        userId: review.userId, userName: review.userName,
        rating: review.rating, comment: review.comment,
      });
      setUserReviews((prev) => [...prev, created]);
      setReviewsCache((prev) => ({
        ...prev,
        [review.companyId]: [...(prev[review.companyId] ?? []), created],
      }));
      await reloadCompanies();
    } catch {
      const local: Review = {
        ...review,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        date: new Date().toISOString().split("T")[0],
      };
      setUserReviews((prev) => [...prev, local]);
    }
  }, [reloadCompanies]);

  const markJobReviewed = useCallback(async (jobId: string) => {
    try {
      const updated = await markJobReviewedApi(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? apiJobToJob(updated) : j)));
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, reviewed: true } : j)));
    }
  }, []);

  const markJobPaid = useCallback(async (jobId: string, paymentMethod: string, transactionRef: string) => {
    try {
      const updated = await markJobPaidApi(jobId, paymentMethod, transactionRef);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? apiJobToJob(updated) : j)));
    } catch {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, paymentStatus: "paid", paymentMethod, transactionRef, paidAt: new Date().toISOString() }
            : j
        )
      );
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        categories: CATEGORIES, companies, loadingCompanies, reloadCompanies,
        getCompany, getCompaniesByCategory, getReviews, loadReviews,
        getCompaniesForProvider, getQuotesForProvider, getJobsForProvider,
        addCompany, isCompanyEmailTaken, isCompanyPhoneTaken,
        quotes, loadQuotes, addQuote, updateQuoteStatus: handleUpdateQuoteStatus,
        jobs, loadJobs, addJob, updateJobStatus: handleUpdateJobStatus,
        addReview, markJobReviewed, markJobPaid, userReviews,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
