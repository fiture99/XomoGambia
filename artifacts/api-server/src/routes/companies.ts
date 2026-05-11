import { Router } from "express";
import { db } from "@workspace/db";
import { providersTable, reviewsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/companies", async (req, res) => {
  const { category } = req.query as { category?: string };

  const companies = await db
    .select()
    .from(providersTable)
    .where(
      category
        ? and(
            eq(providersTable.approvalStatus, "approved"),
            sql`${providersTable.categoryIds} @> ARRAY[${category}]::text[]`
          )
        : eq(providersTable.approvalStatus, "approved")
    )
    .orderBy(providersTable.name);

  res.json(companies);
});

router.get("/companies/:id", async (req, res) => {
  const [company] = await db
    .select()
    .from(providersTable)
    .where(and(eq(providersTable.id, req.params.id), eq(providersTable.approvalStatus, "approved")));

  if (!company) { res.status(404).json({ error: "Not found" }); return; }
  res.json(company);
});

router.get("/companies/:id/reviews", async (req, res) => {
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.companyId, req.params.id));

  res.json(reviews);
});

router.post("/companies/:id/reviews", async (req, res) => {
  const { userId, userName, rating, comment } = req.body as {
    userId?: string;
    userName?: string;
    rating?: number;
    comment?: string;
  };

  if (!userId || !userName || !rating || !comment) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
  const date = new Date().toISOString().split("T")[0];

  const [review] = await db
    .insert(reviewsTable)
    .values({ id, companyId: req.params.id, userId, userName, rating, comment, date })
    .returning();

  await db
    .update(providersTable)
    .set({
      reviewCount: sql`${providersTable.reviewCount} + 1`,
      rating: sql`(${providersTable.rating} * ${providersTable.reviewCount} + ${rating}) / (${providersTable.reviewCount} + 1)`,
    })
    .where(eq(providersTable.id, req.params.id));

  res.status(201).json(review);
});

export default router;
