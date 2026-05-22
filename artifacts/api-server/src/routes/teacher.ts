import { Router } from "express";
import { eq, desc, count } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, usersTable, careerProgressTable, careersTable } from "@workspace/db";

const router = Router();

const TEACHER_EMAIL = "saeedparker@walesschool.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "002159@walesschool.com";

async function requireTeacher(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);
  const user = users[0];
  if (!user || (user.email !== TEACHER_EMAIL && user.email !== ADMIN_EMAIL)) {
    res.status(403).json({ error: "Forbidden - Teacher only" });
    return;
  }
  req.dbUser = user;
  next();
}

// GET /teacher/students — all students with their career progress
router.get("/teacher/students", requireTeacher, async (_req: any, res): Promise<void> => {
  const allUsers = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  const allProgress = await db
    .select()
    .from(careerProgressTable);

  const allCareers = await db.select().from(careersTable);
  const careerMap = new Map(allCareers.map(c => [c.id, c.title]));

  const students = allUsers.map(u => {
    const userProgress = allProgress.filter(p => p.userId === u.id);
    const completedCareers = userProgress.filter(p => p.completed).length;
    const activeCareers = userProgress.filter(p => !p.completed).length;
    return {
      id: u.id,
      clerkId: u.clerkId,
      displayName: u.displayName,
      email: u.email,
      grade: u.grade,
      role: u.email === ADMIN_EMAIL ? "admin" : u.email === TEACHER_EMAIL ? "mr_saeed" : u.role,
      isSchoolAccount: u.email.endsWith("@walesschool.com"),
      isBanned: u.isBanned,
      completedCareers,
      activeCareers,
      totalCareers: userProgress.length,
      careers: userProgress.slice(0, 5).map(p => ({
        careerId: p.careerId,
        careerTitle: careerMap.get(p.careerId) ?? "Unknown",
        completed: p.completed,
        completedSteps: p.completedSteps,
        totalSteps: p.totalSteps,
      })),
      joinedAt: u.createdAt.toISOString(),
    };
  });

  // Sort by completedCareers desc
  students.sort((a, b) => b.completedCareers - a.completedCareers || b.totalCareers - a.totalCareers);

  res.json({ students, total: students.length });
});

// GET /teacher/stats — overview stats
router.get("/teacher/stats", requireTeacher, async (_req: any, res): Promise<void> => {
  const [{ value: totalStudents }] = await db.select({ value: count() }).from(usersTable);
  const [{ value: totalCareers }] = await db.select({ value: count() }).from(careersTable);

  const allProgress = await db.select().from(careerProgressTable);
  const completedCount = allProgress.filter(p => p.completed).length;

  // Grade breakdown
  const allUsers = await db.select().from(usersTable);
  const gradeBreakdown: Record<string, number> = {};
  for (const u of allUsers) {
    const g = u.grade || "Unknown";
    gradeBreakdown[g] = (gradeBreakdown[g] ?? 0) + 1;
  }

  // Top 5 students by completed careers
  const progressByUser: Record<number, number> = {};
  for (const p of allProgress) {
    if (p.completed) progressByUser[p.userId] = (progressByUser[p.userId] ?? 0) + 1;
  }
  const topStudentIds = Object.entries(progressByUser)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5)
    .map(([id]) => Number(id));

  const topStudents = allUsers
    .filter(u => topStudentIds.includes(u.id))
    .map(u => ({
      displayName: u.displayName,
      grade: u.grade,
      completedCareers: progressByUser[u.id] ?? 0,
    }))
    .sort((a, b) => b.completedCareers - a.completedCareers);

  res.json({
    totalStudents,
    totalCareers,
    completedJourneys: completedCount,
    gradeBreakdown,
    topStudents,
  });
});

export default router;
