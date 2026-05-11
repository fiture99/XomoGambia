import { pgTable, text, integer, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Enums ────────────────────────────────────────────────────────────────────

export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected"]);
export const userRoleEnum = pgEnum("user_role", ["customer", "provider"]);
export const quoteStatusEnum = pgEnum("quote_status", ["pending", "received", "accepted", "declined"]);
export const jobStatusEnum = pgEnum("job_status", ["upcoming", "in_progress", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid"]);

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: userRoleEnum("role").notNull().default("customer"),
  companyId: text("company_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true });
export const selectUserSchema = createSelectSchema(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// ── Providers (submissions → approved companies) ──────────────────────────────
// approvalStatus "approved" rows are the live marketplace companies.

export const providersTable = pgTable("providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  categoryIds: text("category_ids").array().notNull().default([]),
  description: text("description").notNull(),
  location: text("location").notNull(),
  phone: text("phone").notNull(),
  services: text("services").array().notNull().default([]),
  yearsActive: integer("years_active").notNull().default(1),
  submitterName: text("submitter_name").notNull().default(""),
  submitterEmail: text("submitter_email").notNull().default(""),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  verified: boolean("verified").notNull().default(false),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  completedJobs: integer("completed_jobs").notNull().default(0),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({ submittedAt: true });
export const selectProviderSchema = createSelectSchema(providersTable);
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;

// ── Quotes ────────────────────────────────────────────────────────────────────

export const quotesTable = pgTable("quotes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  companyId: text("company_id").notNull(),
  companyName: text("company_name").notNull(),
  categoryId: text("category_id").notNull(),
  categoryName: text("category_name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  status: quoteStatusEnum("status").notNull().default("pending"),
  amount: real("amount"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ createdAt: true });
export const selectQuoteSchema = createSelectSchema(quotesTable);
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;

// ── Jobs ──────────────────────────────────────────────────────────────────────

export const jobsTable = pgTable("jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  companyId: text("company_id").notNull(),
  companyName: text("company_name").notNull(),
  categoryId: text("category_id").notNull(),
  categoryName: text("category_name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  status: jobStatusEnum("status").notNull().default("upcoming"),
  amount: real("amount").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  reviewed: boolean("reviewed").notNull().default(false),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  paymentMethod: text("payment_method"),
  transactionRef: text("transaction_ref"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ createdAt: true });
export const selectJobSchema = createSelectSchema(jobsTable);
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;

// ── Reviews ───────────────────────────────────────────────────────────────────

export const reviewsTable = pgTable("reviews", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  date: text("date").notNull(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable);
export const selectReviewSchema = createSelectSchema(reviewsTable);
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
