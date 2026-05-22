import { Router } from "express";
import { eq, desc, count, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, usersTable, careersTable, careerProgressTable } from "@workspace/db";
import {
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
  GetMyProfileResponse,
  GetMyProgressResponse,
  StartCareerBody,
  UpdateCareerProgressParams,
  UpdateCareerProgressBody,
  UpdateCareerProgressResponse,
  GetStatsResponse,
} from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "002159@walesschool.com";

async function getOrCreateUser(clerkId: string, email: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db.insert(usersTable).values({ clerkId, email, displayName: "Explorer", grade: "" }).returning();
  return created;
}

function isBanActive(user: any): boolean {
  if (!user.isBanned) return false;
  if (!user.banUntil) return true;
  return new Date() < new Date(user.banUntil);
}

async function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const email = (auth as any).sessionClaims?.email ?? "";
  req.dbUser = await getOrCreateUser(auth.userId, email);
  if (isBanActive(req.dbUser)) {
    const until = req.dbUser.banUntil
      ? `until ${new Date(req.dbUser.banUntil).toLocaleDateString()}`
      : "permanently";
    res.status(403).json({ error: `Your account has been banned ${until}.`, reason: req.dbUser.banReason });
    return;
  }
  next();
}

// GET /users/me
router.get("/users/me", requireAuth, async (req: any, res): Promise<void> => {
  const user = req.dbUser;
  res.json(GetMyProfileResponse.parse({
    id: user.id,
    clerkId: user.clerkId,
    displayName: user.displayName,
    grade: user.grade,
    role: user.email === ADMIN_EMAIL ? "admin" : user.role,
    isBanned: user.isBanned,
    activeCareer: user.activeCareer ?? null,
    createdAt: user.createdAt.toISOString(),
  }));
});

// PATCH /users/me
router.patch("/users/me", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, req.dbUser.id))
    .returning();
  res.json(UpdateMyProfileResponse.parse({
    id: updated.id,
    clerkId: updated.clerkId,
    displayName: updated.displayName,
    grade: updated.grade,
    role: updated.email === ADMIN_EMAIL ? "admin" : updated.role,
    isBanned: updated.isBanned,
    activeCareer: updated.activeCareer ?? null,
    createdAt: updated.createdAt.toISOString(),
  }));
});

// GET /users/me/progress
router.get("/users/me/progress", requireAuth, async (req: any, res): Promise<void> => {
  const progress = await db
    .select()
    .from(careerProgressTable)
    .where(eq(careerProgressTable.userId, req.dbUser.id));

  res.json(GetMyProgressResponse.parse(progress.map(p => ({
    id: p.id,
    careerId: p.careerId,
    userId: p.userId,
    completedSteps: p.completedSteps,
    totalSteps: p.totalSteps,
    completed: p.completed,
    startedAt: p.startedAt.toISOString(),
    completedAt: p.completedAt?.toISOString() ?? null,
  }))));
});

// POST /users/me/progress
router.post("/users/me/progress", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = StartCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const career = await db.select().from(careersTable).where(eq(careersTable.id, parsed.data.careerId)).limit(1);
  if (!career[0]) {
    res.status(404).json({ error: "Career not found" });
    return;
  }
  const existing = await db
    .select()
    .from(careerProgressTable)
    .where(eq(careerProgressTable.userId, req.dbUser.id))
    .where(eq(careerProgressTable.careerId, parsed.data.careerId))
    .limit(1);

  if (existing[0]) {
    res.json({
      id: existing[0].id,
      careerId: existing[0].careerId,
      userId: existing[0].userId,
      completedSteps: existing[0].completedSteps,
      totalSteps: existing[0].totalSteps,
      completed: existing[0].completed,
      startedAt: existing[0].startedAt.toISOString(),
      completedAt: existing[0].completedAt?.toISOString() ?? null,
    });
    return;
  }

  await db.update(usersTable).set({ activeCareer: parsed.data.careerId }).where(eq(usersTable.id, req.dbUser.id));

  const [progress] = await db.insert(careerProgressTable).values({
    userId: req.dbUser.id,
    careerId: parsed.data.careerId,
    totalSteps: career[0].stepCount,
    completedSteps: 0,
    completed: false,
  }).returning();

  res.status(201).json({
    id: progress.id,
    careerId: progress.careerId,
    userId: progress.userId,
    completedSteps: progress.completedSteps,
    totalSteps: progress.totalSteps,
    completed: progress.completed,
    startedAt: progress.startedAt.toISOString(),
    completedAt: null,
  });
});

// PATCH /users/me/progress/:careerId
router.patch("/users/me/progress/:careerId", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateCareerProgressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCareerProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existingArr = await db
    .select()
    .from(careerProgressTable)
    .where(eq(careerProgressTable.userId, req.dbUser.id))
    .where(eq(careerProgressTable.careerId, params.data.careerId))
    .limit(1);

  if (!existingArr[0]) {
    res.status(404).json({ error: "Progress not found" });
    return;
  }

  const updateData: any = { completedSteps: parsed.data.completedSteps };
  if (parsed.data.completed) {
    updateData.completed = true;
    updateData.completedAt = new Date();
  }

  const [updated] = await db
    .update(careerProgressTable)
    .set(updateData)
    .where(eq(careerProgressTable.id, existingArr[0].id))
    .returning();

  res.json(UpdateCareerProgressResponse.parse({
    id: updated.id,
    careerId: updated.careerId,
    userId: updated.userId,
    completedSteps: updated.completedSteps,
    totalSteps: updated.totalSteps,
    completed: updated.completed,
    startedAt: updated.startedAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() ?? null,
  }));
});

// GET /stats
router.get("/stats", async (_req, res): Promise<void> => {
  const [{ value: totalUsers }] = await db.select({ value: count() }).from(usersTable);
  const [{ value: totalCareers }] = await db.select({ value: count() }).from(careersTable);
  const popular = await db.select().from(careersTable).where(eq(careersTable.featured, true)).limit(6);

  res.json(GetStatsResponse.parse({
    totalUsers,
    totalCareers,
    popularCareers: popular.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      icon: c.icon,
      description: c.description,
      stepCount: c.stepCount,
      featured: c.featured,
    })),
  }));
});

export default router;
