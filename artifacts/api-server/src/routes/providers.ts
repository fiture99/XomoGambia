import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "providers.json");

interface ProviderSubmission {
  id: string;
  name: string;
  categoryIds: string[];
  description: string;
  location: string;
  phone: string;
  services: string[];
  yearsActive: number;
  submitterName: string;
  submitterEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  submittedAt: string;
}

function readProviders(): ProviderSubmission[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeProviders(providers: ProviderSubmission[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(providers, null, 2));
  } catch {
  }
}

router.get("/providers", (req, res) => {
  const providers = readProviders();
  res.json(providers);
});

router.post("/providers", (req, res) => {
  const {
    name, categoryIds, description, location, phone,
    services, yearsActive, submitterName, submitterEmail,
  } = req.body as Partial<ProviderSubmission & { submitterName: string; submitterEmail: string }>;

  if (!name || !categoryIds?.length || !description || !location || !phone || !services?.length) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newProvider: ProviderSubmission = {
    id: "api-" + Date.now().toString() + Math.random().toString(36).substring(2, 6),
    name,
    categoryIds,
    description,
    location,
    phone,
    services,
    yearsActive: yearsActive ?? 1,
    submitterName: submitterName ?? "",
    submitterEmail: submitterEmail ?? "",
    approvalStatus: "pending",
    verified: false,
    rating: 0,
    reviewCount: 0,
    completedJobs: 0,
    submittedAt: new Date().toISOString(),
  };

  const providers = readProviders();
  providers.push(newProvider);
  writeProviders(providers);

  res.status(201).json(newProvider);
});

router.patch("/providers/:id/approve", (req, res) => {
  const providers = readProviders();
  const idx = providers.findIndex((p) => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  providers[idx] = { ...providers[idx], approvalStatus: "approved", verified: true, rejectionReason: undefined };
  writeProviders(providers);
  res.json(providers[idx]);
});

router.patch("/providers/:id/reject", (req, res) => {
  const { reason } = req.body as { reason?: string };
  const providers = readProviders();
  const idx = providers.findIndex((p) => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  providers[idx] = { ...providers[idx], approvalStatus: "rejected", verified: false, rejectionReason: reason ?? "" };
  writeProviders(providers);
  res.json(providers[idx]);
});

export default router;
