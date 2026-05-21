import { Router } from "express";
import { eq, count, desc, gte } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, usersTable, careersTable } from "@workspace/db";
import {
  AdminListUsersQueryParams,
  AdminListUsersResponse,
  AdminBanUserParams,
  AdminBanUserBody,
  AdminBanUserResponse,
  AdminSetRoleParams,
  AdminSetRoleBody,
  AdminSetRoleResponse,
  AdminGetStatsResponse,
} from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "002159@walesschool.com";

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

function formatUser(u: any) {
  return {
    id: u.id,
    clerkId: u.clerkId,
    displayName: u.displayName,
    grade: u.grade,
    role: u.email === ADMIN_EMAIL ? "admin" : u.role,
    isBanned: u.isBanned,
    email: u.email,
    createdAt: u.createdAt.toISOString(),
  };
}

// GET /admin/users
router.get("/admin/users", requireAdmin, async (req: any, res): Promise<void> => {
  const params = AdminListUsersQueryParams.safeParse(req.query);
  const page = (params.success && params.data.page) ? params.data.page : 1;
  const limit = (params.success && params.data.limit) ? params.data.limit : 20;
  const offset = (page - 1) * limit;

  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
  const [{ value: total }] = await db.select({ value: count() }).from(usersTable);

  res.json(AdminListUsersResponse.parse({
    users: users.map(formatUser),
    total,
    page,
    limit,
  }));
});

// PATCH /admin/users/:userId/ban
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
  const [updated] = await db
    .update(usersTable)
    .set({ isBanned: body.data.banned, banReason: body.data.reason ?? null })
    .where(eq(usersTable.clerkId, params.data.userId))
    .returning();
  res.json(AdminBanUserResponse.parse(formatUser(updated)));
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
  res.json(AdminSetRoleResponse.parse(formatUser(updated)));
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
      role: u.email === ADMIN_EMAIL ? "admin" : u.role,
      isBanned: u.isBanned,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
    })),
  }));
});

export default router;
