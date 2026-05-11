import { Router } from "express";
import { db } from "@workspace/db";
import { providersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/providers", async (_req, res) => {
  const providers = await db.select().from(providersTable).orderBy(providersTable.submittedAt);
  res.json(providers);
});

router.post("/providers", async (req, res) => {
  const {
    name, categoryIds, description, location, phone,
    services, yearsActive, submitterName, submitterEmail,
  } = req.body as {
    name?: string;
    categoryIds?: string[];
    description?: string;
    location?: string;
    phone?: string;
    services?: string[];
    yearsActive?: number;
    submitterName?: string;
    submitterEmail?: string;
  };

  if (!name || !categoryIds?.length || !description || !location || !phone || !services?.length) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const id = "api-" + Date.now().toString() + Math.random().toString(36).substring(2, 6);

  const [newProvider] = await db
    .insert(providersTable)
    .values({
      id,
      name,
      categoryIds,
      description,
      location,
      phone,
      services,
      yearsActive: yearsActive ?? 1,
      submitterName: submitterName ?? "",
      submitterEmail: submitterEmail ?? "",
    })
    .returning();

  res.status(201).json(newProvider);
});

router.patch("/providers/:id/approve", async (req, res) => {
  const [updated] = await db
    .update(providersTable)
    .set({ approvalStatus: "approved", verified: true, rejectionReason: null })
    .where(eq(providersTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.patch("/providers/:id/reject", async (req, res) => {
  const { reason } = req.body as { reason?: string };
  const [updated] = await db
    .update(providersTable)
    .set({ approvalStatus: "rejected", verified: false, rejectionReason: reason ?? "" })
    .where(eq(providersTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

export default router;
