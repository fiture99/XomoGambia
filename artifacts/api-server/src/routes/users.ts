import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/users/register", async (req, res) => {
  const { name, email, password, role, companyId } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: "customer" | "provider";
    companyId?: string;
  };

  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    const u = existing[0];
    res.json({ id: u.id, name: u.name, email: u.email, role: u.role, companyId: u.companyId });
    return;
  }

  const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);

  const [user] = await db
    .insert(usersTable)
    .values({
      id,
      name,
      email: email.toLowerCase(),
      password: password ?? null,
      role: role ?? "customer",
      companyId: companyId ?? null,
    })
    .returning();

  const { password: _pw, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email) { res.status(400).json({ error: "email is required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));

  if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }

  if (password && user.password && user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

router.patch("/users/:id", async (req, res) => {
  const { name, companyId, role } = req.body as {
    name?: string;
    companyId?: string;
    role?: "customer" | "provider";
  };

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (companyId !== undefined) updates.companyId = companyId;
  if (role !== undefined) updates.role = role;

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  const { password: _pw, ...safeUser } = updated;
  res.json(safeUser);
});

export default router;
