import { Router } from "express";
import { eq, count, desc, gte, like } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, usersTable, careersTable, careerProgressTable } from "@workspace/db";
import {
  AdminListUsersQueryParams,
  AdminBanUserParams,
  AdminBanUserBody,
  AdminSetRoleParams,
  AdminSetRoleBody,
  AdminGetStatsResponse,
} from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "002159@walesschool.com";
const TEACHER_EMAIL = "saeedparker@walesschool.com";
const SCHOOL_DOMAIN = "@walesschool.com";

async function requireAdmin(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);
  const user = users[0];
  if (!user || user.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: "Forbidden - Admin only" });
    return;
  }
  req.dbUser = user;
  next();
}

function isSchoolAccount(email: string) {
  return email.endsWith(SCHOOL_DOMAIN);
}

function formatUser(u: any) {
  const role = u.email === ADMIN_EMAIL ? "admin"
    : u.email === TEACHER_EMAIL ? "mr_saeed"
    : u.role;
  const banActive = u.isBanned && (!u.banUntil || new Date() < new Date(u.banUntil));
  return {
    id: u.id,
    clerkId: u.clerkId,
    displayName: u.displayName,
    grade: u.grade,
    role,
    isBanned: banActive,
    banUntil: u.banUntil ? u.banUntil.toISOString() : null,
    banReason: u.banReason ?? null,
    email: u.email,
    isSchoolAccount: isSchoolAccount(u.email),
    createdAt: u.createdAt.toISOString(),
  };
}

// GET /admin/users
router.get("/admin/users", requireAdmin, async (req: any, res): Promise<void> => {
  const params = AdminListUsersQueryParams.safeParse(req.query);
  const page = (params.success && params.data.page) ? params.data.page : 1;
  const limit = (params.success && params.data.limit) ? params.data.limit : 50;
  const offset = (page - 1) * limit;
  const filterType = req.query.type as string | undefined; // "school" | "external"

  let query = db.select().from(usersTable).$dynamic();
  if (filterType === "school") {
    query = query.where(like(usersTable.email, `%${SCHOOL_DOMAIN}`));
  } else if (filterType === "external") {
    // Not using like for negation easily — fetch all and filter
  }

  const allUsers = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(500);

  let filtered = allUsers;
  if (filterType === "school") {
    filtered = allUsers.filter(u => isSchoolAccount(u.email));
  } else if (filterType === "external") {
    filtered = allUsers.filter(u => !isSchoolAccount(u.email));
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  // Use raw JSON (not Zod parse) so extra fields like isSchoolAccount/banUntil pass through
  res.json({ users: paginated.map(formatUser), total, page, limit });
});

// PATCH /admin/users/:userId/ban  — supports timed bans
router.patch("/admin/users/:userId/ban", requireAdmin, async (req: any, res): Promise<void> => {
  const params = AdminBanUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AdminBanUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, params.data.userId)).limit(1);
  if (!users[0]) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Duration: "1d", "3d", "7d", "30d", "forever", or undefined (unban)
  const duration = req.body.duration as string | undefined;
  let banUntil: Date | null = null;

  if (body.data.banned && duration && duration !== "forever") {
    const days = parseInt(duration);
    if (!isNaN(days)) {
      banUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }

  const [updated] = await db
    .update(usersTable)
    .set({
      isBanned: body.data.banned,
      banReason: body.data.reason ?? null,
      banUntil: body.data.banned ? banUntil : null,
    })
    .where(eq(usersTable.clerkId, params.data.userId))
    .returning();

  res.json(formatUser(updated));
});

// DELETE /admin/users/:userId — permanently delete account from DB (user can re-register)
router.delete("/admin/users/:userId", requireAdmin, async (req: any, res): Promise<void> => {
  const clerkId = req.params.userId;
  if (!clerkId) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (!users[0]) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (users[0].email === ADMIN_EMAIL) {
    res.status(403).json({ error: "Cannot delete the admin account" });
    return;
  }

  // Delete progress first (FK), then user
  await db.delete(careerProgressTable).where(eq(careerProgressTable.userId, users[0].id));
  await db.delete(usersTable).where(eq(usersTable.id, users[0].id));

  res.json({ success: true, deleted: users[0].displayName });
});

// PATCH /admin/users/:userId/role
router.patch("/admin/users/:userId/role", requireAdmin, async (req: any, res): Promise<void> => {
  const params = AdminSetRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AdminSetRoleBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, params.data.userId)).limit(1);
  if (!users[0]) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set({ role: body.data.role })
    .where(eq(usersTable.clerkId, params.data.userId))
    .returning();
  res.json(formatUser(updated));
});

// GET /admin/stats
router.get("/admin/stats", requireAdmin, async (_req: any, res): Promise<void> => {
  const [{ value: totalUsers }] = await db.select({ value: count() }).from(usersTable);
  const [{ value: totalCareers }] = await db.select({ value: count() }).from(careersTable);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [{ value: activeThisWeek }] = await db
    .select({ value: count() })
    .from(usersTable)
    .where(gte(usersTable.createdAt, oneWeekAgo));

  const popularCareers = await db
    .select()
    .from(careersTable)
    .where(eq(careersTable.featured, true))
    .limit(5);

  const recentUsers = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(10);

  res.json(AdminGetStatsResponse.parse({
    totalUsers,
    totalCareers,
    activeThisWeek,
    popularCareers: popularCareers.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      icon: c.icon,
      description: c.description,
      stepCount: c.stepCount,
      featured: c.featured,
    })),
    recentUsers: recentUsers.map(u => ({
      id: u.id,
      clerkId: u.clerkId,
      displayName: u.displayName,
      grade: u.grade,
      role: u.email === ADMIN_EMAIL ? "admin" : u.email === TEACHER_EMAIL ? "mr_saeed" : u.role,
      isBanned: u.isBanned,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
    })),
  }));
});

export default router;
