import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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

export const COMPANIES: Company[] = [
  {
    id: "c1", name: "Gamtel Power Solutions", categoryIds: ["electrical"],
    description: "Leading electrical contractors in Greater Banjul with over 12 years of experience. We handle industrial, commercial and residential projects with full compliance to national electrical standards.",
    location: "Banjul", verified: true, rating: 4.8, reviewCount: 47, completedJobs: 89, yearsActive: 12,
    phone: "+220 7001234",
    services: ["Wiring & Rewiring", "Distribution Boards", "Solar Installations", "Emergency Repairs", "Generator Connections"],
  },
  {
    id: "c2", name: "Banjul Electrical Contractors", categoryIds: ["electrical"],
    description: "Certified electrical engineers serving hotels, offices, and homes in Serekunda. Known for clean, reliable workmanship and transparent pricing.",
    location: "Serekunda", verified: true, rating: 4.6, reviewCount: 32, completedJobs: 61, yearsActive: 8,
    phone: "+220 7012345",
    services: ["New Installations", "Fault Finding", "LED Lighting", "Cable Management", "Safety Inspections"],
  },
  {
    id: "c3", name: "Westside Plumbing Co", categoryIds: ["plumbing"],
    description: "Expert plumbing contractors operating across Kololi, Kotu, and the Atlantic coast. Specialists in hotel and resort plumbing systems with 24/7 emergency availability.",
    location: "Kololi", verified: true, rating: 4.7, reviewCount: 28, completedJobs: 54, yearsActive: 9,
    phone: "+220 7023456",
    services: ["Pipe Installation", "Leak Detection", "Bathroom Fitting", "Water Pumps", "Drainage Systems"],
  },
  {
    id: "c4", name: "Atlantic Water Works", categoryIds: ["plumbing"],
    description: "Reliable plumbing services for commercial properties and residences in Banjul. Fully registered with the Gambia Plumbers Association.",
    location: "Banjul", verified: true, rating: 4.5, reviewCount: 19, completedJobs: 38, yearsActive: 6,
    phone: "+220 7034567",
    services: ["Plumbing Repairs", "Water Tank Installation", "Toilet Fitting", "Waterproofing", "Borehole Connections"],
  },
  {
    id: "c5", name: "SecureVision Systems", categoryIds: ["cctv"],
    description: "The Gambia's most trusted CCTV and security company. We have installed over 120 systems across hotels, banks, schools, and government buildings.",
    location: "Kanifing", verified: true, rating: 4.9, reviewCount: 56, completedJobs: 120, yearsActive: 14,
    phone: "+220 7045678",
    services: ["CCTV Installation", "IP Camera Systems", "Access Control", "Alarm Systems", "Remote Monitoring"],
  },
  {
    id: "c6", name: "Gambia Security Solutions", categoryIds: ["cctv"],
    description: "Professional security system installers with expertise in Hikvision and Dahua camera systems. Servicing corporate and residential clients.",
    location: "Banjul", verified: true, rating: 4.4, reviewCount: 23, completedJobs: 41, yearsActive: 5,
    phone: "+220 7056789",
    services: ["Camera Installation", "DVR/NVR Setup", "System Maintenance", "Security Audits", "Cabling"],
  },
  {
    id: "c7", name: "ProClean Gambia", categoryIds: ["cleaning"],
    description: "Premium commercial cleaning company trusted by hotels, offices, and NGOs. Our trained teams use eco-friendly products and industrial equipment for spotless results.",
    location: "Serekunda", verified: true, rating: 4.8, reviewCount: 41, completedJobs: 95, yearsActive: 7,
    phone: "+220 7067890",
    services: ["Office Cleaning", "Deep Cleaning", "Post-Construction", "Carpet Cleaning", "Window Cleaning"],
  },
  {
    id: "c8", name: "Shine Cleaning Services", categoryIds: ["cleaning"],
    description: "Affordable and professional cleaning services for homes and small businesses in Kololi and surrounding areas.",
    location: "Kololi", verified: true, rating: 4.5, reviewCount: 17, completedJobs: 33, yearsActive: 4,
    phone: "+220 7078901",
    services: ["House Cleaning", "Move-in/Move-out", "Kitchen Deep Clean", "Bathroom Sanitization"],
  },
  {
    id: "c9", name: "CoolAir Gambia", categoryIds: ["ac"],
    description: "Authorized installers for Midea, Samsung, and LG air conditioning systems. Serving hotels, offices, and residences across The Gambia for 10 years.",
    location: "Banjul", verified: true, rating: 4.7, reviewCount: 35, completedJobs: 78, yearsActive: 10,
    phone: "+220 7089012",
    services: ["AC Installation", "Servicing & Maintenance", "Gas Refilling", "Repairs", "Multi-Split Systems"],
  },
  {
    id: "c10", name: "ArcticBreeze Services", categoryIds: ["ac"],
    description: "Fast, affordable air conditioning installation and repair. Same-day service available for urgent breakdowns across Serekunda, Kotu, and Kololi.",
    location: "Serekunda", verified: true, rating: 4.5, reviewCount: 22, completedJobs: 46, yearsActive: 6,
    phone: "+220 7090123",
    services: ["Split Unit Installation", "AC Cleaning", "Breakdown Repairs", "Annual Contracts"],
  },
  {
    id: "c11", name: "PowerGen Gambia", categoryIds: ["generators"],
    description: "Specialists in generator supply, installation, and maintenance for hotels, hospitals, and factories. Authorized Perkins and Cummins dealer.",
    location: "Kanifing", verified: true, rating: 4.8, reviewCount: 39, completedJobs: 82, yearsActive: 11,
    phone: "+220 7001357",
    services: ["Generator Supply", "Installation & Commission", "Preventive Maintenance", "Emergency Repairs", "Load Calculations"],
  },
  {
    id: "c12", name: "Reliable Power Co", categoryIds: ["generators"],
    description: "Practical generator solutions for small and medium businesses. We source, install and maintain diesel generators from 5KVA to 100KVA.",
    location: "Banjul", verified: true, rating: 4.3, reviewCount: 15, completedJobs: 29, yearsActive: 5,
    phone: "+220 7002468",
    services: ["Generator Sales", "Installation", "Servicing", "Fuel Management"],
  },
  {
    id: "c13", name: "Artisan Painters Gambia", categoryIds: ["painting"],
    description: "High-quality interior and exterior painting for commercial and residential properties. Trained in modern techniques including textured finishes and anti-mold coatings.",
    location: "Serekunda", verified: true, rating: 4.7, reviewCount: 26, completedJobs: 58, yearsActive: 8,
    phone: "+220 7003579",
    services: ["Interior Painting", "Exterior Painting", "Textured Finishes", "Waterproofing Coatings", "Epoxy Floors"],
  },
  {
    id: "c14", name: "Gambia Master Carpenters", categoryIds: ["carpentry"],
    description: "The finest custom carpentry in The Gambia. From hotel reception desks to bespoke home furniture, our craftsmen deliver exceptional quality using locally sourced hardwoods.",
    location: "Banjul", verified: true, rating: 4.9, reviewCount: 44, completedJobs: 97, yearsActive: 15,
    phone: "+220 7004680",
    services: ["Custom Furniture", "Kitchen Cabinets", "Doors & Windows", "Roofing Frames", "Office Fitouts"],
  },
  {
    id: "c15", name: "Green Gambia Landscapes", categoryIds: ["landscaping"],
    description: "Professional garden design and landscaping for hotels, resorts, and private estates. We create beautiful outdoor spaces that thrive in The Gambia's tropical climate.",
    location: "Kololi", verified: true, rating: 4.6, reviewCount: 21, completedJobs: 45, yearsActive: 7,
    phone: "+220 7005791",
    services: ["Garden Design", "Lawn Maintenance", "Irrigation Systems", "Tree Planting", "Hardscaping"],
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: "r1", companyId: "c1", userId: "u1", userName: "Fatou Jallow", rating: 5, comment: "Excellent work on our hotel's electrical system. Very professional and completed on time.", date: "2026-03-15" },
  { id: "r2", companyId: "c1", userId: "u2", userName: "Lamin Dibba", rating: 5, comment: "Fixed our distribution board quickly. Would highly recommend to any business.", date: "2026-02-28" },
  { id: "r3", companyId: "c2", userId: "u14", userName: "Nyima Jallow", rating: 4, comment: "Good electrical team. Completed the rewiring of our office efficiently.", date: "2026-04-08" },
  { id: "r4", companyId: "c3", userId: "u11", userName: "Binta Jammeh", rating: 5, comment: "Westside fixed a major leak in our hotel quickly. Called them at 10pm and they responded.", date: "2026-03-30" },
  { id: "r5", companyId: "c5", userId: "u3", userName: "Aminata Ceesay", rating: 5, comment: "SecureVision installed 24 cameras across our property. Exceptional service and clean cabling.", date: "2026-04-02" },
  { id: "r6", companyId: "c5", userId: "u4", userName: "Omar Sanneh", rating: 5, comment: "The best CCTV company in Banjul. Professional team, great pricing.", date: "2026-03-18" },
  { id: "r7", companyId: "c5", userId: "u16", userName: "Seedy Drammeh", rating: 5, comment: "Highly professional installation. Our school now has full coverage.", date: "2026-01-22" },
  { id: "r8", companyId: "c7", userId: "u5", userName: "Isatou Touray", rating: 5, comment: "ProClean transformed our office. Spotless results and they brought all their own equipment.", date: "2026-04-10" },
  { id: "r9", companyId: "c7", userId: "u6", userName: "Bakary Gaye", rating: 4, comment: "Good service overall. Thorough cleaning and the team was polite and efficient.", date: "2026-03-25" },
  { id: "r10", companyId: "c9", userId: "u7", userName: "Mariama Barry", rating: 5, comment: "Installed 8 AC units in our guesthouse. Great workmanship and competitive pricing.", date: "2026-03-08" },
  { id: "r11", companyId: "c10", userId: "u15", userName: "Pa Sowe", rating: 4, comment: "Quick response for our AC breakdown. Fixed it same day which was impressive.", date: "2026-03-12" },
  { id: "r12", companyId: "c11", userId: "u8", userName: "Ousman Jobe", rating: 5, comment: "PowerGen handled our 100KVA generator installation perfectly. Reliable and professional.", date: "2026-04-15" },
  { id: "r13", companyId: "c13", userId: "u12", userName: "Sering Ndong", rating: 5, comment: "Beautiful textured finish on our walls. The team was tidy and worked quickly.", date: "2026-04-05" },
  { id: "r14", companyId: "c14", userId: "u9", userName: "Hawa Kanteh", rating: 5, comment: "Our custom reception desk and cabinets are stunning. True craftsmen.", date: "2026-04-01" },
  { id: "r15", companyId: "c14", userId: "u10", userName: "Modou Faye", rating: 5, comment: "Best carpenters in The Gambia, no question. Delivered exactly what we wanted.", date: "2026-02-20" },
  { id: "r16", companyId: "c15", userId: "u13", userName: "Adama Camara", rating: 5, comment: "Our resort gardens look incredible after Green Gambia redesigned them. Truly talented.", date: "2026-03-22" },
];

interface AppContextType {
  categories: ServiceCategory[];
  companies: Company[];
  getCompany: (id: string) => Company | undefined;
  getCompaniesByCategory: (categoryId: string) => Company[];
  getReviews: (companyId: string) => Review[];
  getCompaniesForProvider: (companyId?: string) => Company[];
  getQuotesForProvider: (companyId?: string) => QuoteRequest[];
  getJobsForProvider: (companyId?: string) => Job[];
  addCompany: (data: {
    name: string;
    email?: string;
    phone: string;
    categoryIds: string[];
    description: string;
    location: string;
    services: string[];
    yearsActive: number;
  }) => Company;
  isCompanyEmailTaken: (email: string) => boolean;
  isCompanyPhoneTaken: (phone: string) => boolean;
  quotes: QuoteRequest[];
  addQuote: (quote: Omit<QuoteRequest, "id" | "createdAt">) => void;
  updateQuoteStatus: (id: string, status: QuoteRequest["status"], amount?: number) => void;
  jobs: Job[];
  addJob: (job: Omit<Job, "id" | "createdAt" | "reviewed">) => void;
  updateJobStatus: (id: string, status: Job["status"]) => void;
  addReview: (review: Omit<Review, "id" | "date">) => void;
  markJobReviewed: (jobId: string) => void;
  markJobPaid: (jobId: string, paymentMethod: string, transactionRef: string) => void;
  userReviews: Review[];
}

const AppContext = createContext<AppContextType>({
  categories: CATEGORIES,
  companies: COMPANIES,
  getCompany: () => undefined,
  getCompaniesByCategory: () => [],
  getReviews: () => [],
  getCompaniesForProvider: () => [],
  getQuotesForProvider: () => [],
  getJobsForProvider: () => [],
  addCompany: () => { throw new Error("addCompany not initialized"); },
  isCompanyEmailTaken: () => false,
  isCompanyPhoneTaken: () => false,
  quotes: [],
  addQuote: () => {},
  updateQuoteStatus: () => {},
  jobs: [],
  addJob: () => {},
  updateJobStatus: () => {},
  addReview: () => {},
  markJobReviewed: () => {},
  markJobPaid: () => {},
  userReviews: [],
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [extraCompanies, setExtraCompanies] = useState<Company[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("xomo_quotes"),
      AsyncStorage.getItem("xomo_jobs"),
      AsyncStorage.getItem("xomo_user_reviews"),
      AsyncStorage.getItem("xomo_extra_companies"),
    ]).then(([q, j, r, ec]) => {
      if (q) setQuotes(JSON.parse(q));
      if (j) setJobs(JSON.parse(j));
      if (r) setUserReviews(JSON.parse(r));
      if (ec) setExtraCompanies(JSON.parse(ec));
    }).catch(() => {});
  }, []);

  const saveQuotes = useCallback((updated: QuoteRequest[]) => {
    setQuotes(updated);
    AsyncStorage.setItem("xomo_quotes", JSON.stringify(updated)).catch(() => {});
  }, []);

  const saveJobs = useCallback((updated: Job[]) => {
    setJobs(updated);
    AsyncStorage.setItem("xomo_jobs", JSON.stringify(updated)).catch(() => {});
  }, []);

  const saveUserReviews = useCallback((updated: Review[]) => {
    setUserReviews(updated);
    AsyncStorage.setItem("xomo_user_reviews", JSON.stringify(updated)).catch(() => {});
  }, []);

  const allCompanies = [...COMPANIES, ...extraCompanies];

  const addCompany = useCallback(
    (data: {
      name: string;
      email?: string;
      phone: string;
      categoryIds: string[];
      description: string;
      location: string;
      services: string[];
      yearsActive: number;
    }): Company => {
      const newCompany: Company = {
        ...data,
        id: "p" + Date.now().toString() + Math.random().toString(36).substring(2, 6),
        verified: false,
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
      };
      const updated = [...extraCompanies, newCompany];
      setExtraCompanies(updated);
      AsyncStorage.setItem("xomo_extra_companies", JSON.stringify(updated)).catch(() => {});
      return newCompany;
    },
    [extraCompanies]
  );

  const isCompanyEmailTaken = useCallback(
    (email: string) => {
      const needle = email.trim().toLowerCase();
      if (!needle) return false;
      return allCompanies.some((company) => (company as any).email?.toLowerCase() === needle);
    },
    [allCompanies]
  );

  const isCompanyPhoneTaken = useCallback(
    (phone: string) => {
      const needle = phone.replace(/\D/g, "");
      if (!needle) return false;
      return allCompanies.some((company) => company.phone.replace(/\D/g, "") === needle);
    },
    [allCompanies]
  );

  const getCompany = useCallback((id: string) => allCompanies.find((c) => c.id === id), [allCompanies]);
  const getCompaniesForProvider = useCallback(
    (companyId?: string) => (companyId ? allCompanies.filter((c) => c.id === companyId) : []),
    [allCompanies]
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
    (categoryId: string) => allCompanies.filter((c) => c.categoryIds.includes(categoryId)),
    [allCompanies]
  );

  const getReviews = useCallback(
    (companyId: string) => [
      ...MOCK_REVIEWS.filter((r) => r.companyId === companyId),
      ...userReviews.filter((r) => r.companyId === companyId),
    ],
    [userReviews]
  );

  const addQuote = useCallback(
    (quote: Omit<QuoteRequest, "id" | "createdAt">) => {
      const newQuote: QuoteRequest = {
        ...quote,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
      };
      saveQuotes([newQuote, ...quotes]);
    },
    [quotes, saveQuotes]
  );

  const updateQuoteStatus = useCallback(
    (id: string, status: QuoteRequest["status"], amount?: number) => {
      saveQuotes(quotes.map((q) => (q.id === id ? { ...q, status, ...(amount !== undefined ? { amount } : {}) } : q)));
    },
    [quotes, saveQuotes]
  );

  const addJob = useCallback(
    (job: Omit<Job, "id" | "createdAt" | "reviewed">) => {
      const newJob: Job = {
        ...job,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        reviewed: false,
      };
      saveJobs([newJob, ...jobs]);
    },
    [jobs, saveJobs]
  );

  const updateJobStatus = useCallback(
    (id: string, status: Job["status"]) => {
      saveJobs(
        jobs.map((j) =>
          j.id === id
            ? { ...j, status, ...(status === "completed" ? { completedDate: new Date().toISOString() } : {}) }
            : j
        )
      );
    },
    [jobs, saveJobs]
  );

  const addReview = useCallback(
    (review: Omit<Review, "id" | "date">) => {
      const newReview: Review = {
        ...review,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        date: new Date().toISOString().split("T")[0],
      };
      saveUserReviews([...userReviews, newReview]);
    },
    [userReviews, saveUserReviews]
  );

  const markJobReviewed = useCallback(
    (jobId: string) => {
      saveJobs(jobs.map((j) => (j.id === jobId ? { ...j, reviewed: true } : j)));
    },
    [jobs, saveJobs]
  );

  const markJobPaid = useCallback(
    (jobId: string, paymentMethod: string, transactionRef: string) => {
      saveJobs(
        jobs.map((j) =>
          j.id === jobId
            ? { ...j, paymentStatus: "paid", paymentMethod, transactionRef, paidAt: new Date().toISOString() }
            : j
        )
      );
    },
    [jobs, saveJobs]
  );

  return (
    <AppContext.Provider
      value={{
        categories: CATEGORIES,
        companies: allCompanies,
        getCompany,
        getCompaniesByCategory,
      getReviews,
      getCompaniesForProvider,
      getQuotesForProvider,
      getJobsForProvider,
        addCompany,
        isCompanyEmailTaken,
        isCompanyPhoneTaken,
        quotes,
        addQuote,
        updateQuoteStatus,
        jobs,
        addJob,
        updateJobStatus,
        addReview,
        markJobReviewed,
        markJobPaid,
        userReviews,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
