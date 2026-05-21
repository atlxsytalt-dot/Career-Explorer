import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, usersTable, announcementsTable } from "@workspace/db";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "002159@walesschool.com";

async function requireAdmin(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);
  if (!users[0] || users[0].email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
  req.dbUser = users[0];
  next();
}

// GET /announcements/active — public, returns latest active announcement
router.get("/announcements/active", async (_req, res): Promise<void> => {
  const announcements = await db
    .select()
    .from(announcementsTable)
    .where(eq(announcementsTable.active, true))
    .orderBy(desc(announcementsTable.createdAt))
    .limit(1);
  res.json(announcements[0] ?? null);
});

// GET /admin/announcements — admin only, list all
router.get("/admin/announcements", requireAdmin, async (_req: any, res): Promise<void> => {
  const announcements = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.createdAt))
    .limit(50);
  res.json(announcements);
});

// POST /admin/announcements — admin only, create new
router.post("/admin/announcements", requireAdmin, async (req: any, res): Promise<void> => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 500) { res.status(400).json({ error: "Invalid message" }); return; }

  // Deactivate all existing
  await db.update(announcementsTable).set({ active: false });

  const [created] = await db.insert(announcementsTable).values({
    message,
    active: true,
  }).returning();

  res.status(201).json(created);
});

// DELETE /admin/announcements/:id — admin only, deactivate
router.delete("/admin/announcements/:id", requireAdmin, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(announcementsTable).set({ active: false }).where(eq(announcementsTable.id, id));
  res.json({ success: true });
});

export default router;
