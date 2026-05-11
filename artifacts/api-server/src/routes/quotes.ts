import { Router } from "express";
import { db } from "@workspace/db";
import { quotesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/quotes", async (req, res) => {
  const { userId, companyId } = req.query as { userId?: string; companyId?: string };

  if (!userId && !companyId) {
    res.status(400).json({ error: "userId or companyId query param required" });
    return;
  }

  const quotes = userId
    ? await db.select().from(quotesTable).where(eq(quotesTable.userId, userId))
    : await db.select().from(quotesTable).where(eq(quotesTable.companyId, companyId!));

  res.json(quotes);
});

router.post("/quotes", async (req, res) => {
  const { userId, companyId, companyName, categoryId, categoryName, description, location, status, amount } =
    req.body as {
      userId?: string;
      companyId?: string;
      companyName?: string;
      categoryId?: string;
      categoryName?: string;
      description?: string;
      location?: string;
      status?: "pending" | "received" | "accepted" | "declined";
      amount?: number;
    };

  if (!userId || !companyId || !companyName || !categoryId || !categoryName || !description || !location) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);

  const [quote] = await db
    .insert(quotesTable)
    .values({
      id,
      userId,
      companyId,
      companyName,
      categoryId,
      categoryName,
      description,
      location,
      status: status ?? "pending",
      amount: amount ?? null,
    })
    .returning();

  res.status(201).json(quote);
});

router.patch("/quotes/:id", async (req, res) => {
  const { status, amount } = req.body as {
    status?: "pending" | "received" | "accepted" | "declined";
    amount?: number;
  };

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (amount !== undefined) updates.amount = amount;

  const [updated] = await db
    .update(quotesTable)
    .set(updates)
    .where(eq(quotesTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

export default router;
