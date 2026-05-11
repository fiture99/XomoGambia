import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/jobs", async (req, res) => {
  const { userId, companyId } = req.query as { userId?: string; companyId?: string };

  if (!userId && !companyId) {
    res.status(400).json({ error: "userId or companyId query param required" });
    return;
  }

  const jobs = userId
    ? await db.select().from(jobsTable).where(eq(jobsTable.userId, userId))
    : await db.select().from(jobsTable).where(eq(jobsTable.companyId, companyId!));

  res.json(jobs);
});

router.post("/jobs", async (req, res) => {
  const {
    userId, companyId, companyName, categoryId, categoryName,
    description, location, status, amount, scheduledDate,
  } = req.body as {
    userId?: string;
    companyId?: string;
    companyName?: string;
    categoryId?: string;
    categoryName?: string;
    description?: string;
    location?: string;
    status?: "upcoming" | "in_progress" | "completed" | "cancelled";
    amount?: number;
    scheduledDate?: string;
  };

  if (!userId || !companyId || !companyName || !categoryId || !categoryName || !description || !location || amount === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);

  const [job] = await db
    .insert(jobsTable)
    .values({
      id,
      userId,
      companyId,
      companyName,
      categoryId,
      categoryName,
      description,
      location,
      status: status ?? "upcoming",
      amount,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
    })
    .returning();

  res.status(201).json(job);
});

router.patch("/jobs/:id/status", async (req, res) => {
  const { status } = req.body as { status?: "upcoming" | "in_progress" | "completed" | "cancelled" };
  if (!status) { res.status(400).json({ error: "status required" }); return; }

  const updates: Record<string, unknown> = { status };
  if (status === "completed") updates.completedDate = new Date();

  const [updated] = await db
    .update(jobsTable)
    .set(updates)
    .where(eq(jobsTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.patch("/jobs/:id/review", async (_req, res) => {
  const [updated] = await db
    .update(jobsTable)
    .set({ reviewed: true })
    .where(eq(jobsTable.id, _req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.patch("/jobs/:id/pay", async (req, res) => {
  const { paymentMethod, transactionRef } = req.body as {
    paymentMethod?: string;
    transactionRef?: string;
  };

  if (!paymentMethod || !transactionRef) {
    res.status(400).json({ error: "paymentMethod and transactionRef required" });
    return;
  }

  const [updated] = await db
    .update(jobsTable)
    .set({ paymentStatus: "paid", paymentMethod, transactionRef, paidAt: new Date() })
    .where(eq(jobsTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

export default router;
