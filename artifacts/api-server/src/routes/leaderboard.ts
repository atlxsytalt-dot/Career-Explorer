import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, careerProgressTable, challengeAttemptsTable } from "@workspace/db";
import { desc, count, eq, sql } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select({
        id: usersTable.id,
        displayName: usersTable.displayName,
        grade: usersTable.grade,
        role: usersTable.role,
        completedCareers: sql<number>`cast(count(distinct case when ${careerProgressTable.completed} = true then ${careerProgressTable.careerId} end) as int)`,
        totalChallenges: sql<number>`cast(count(distinct ${challengeAttemptsTable.id}) as int)`,
      })
      .from(usersTable)
      .leftJoin(careerProgressTable, eq(careerProgressTable.userId, usersTable.id))
      .leftJoin(challengeAttemptsTable, eq(challengeAttemptsTable.userId, usersTable.id))
      .where(eq(usersTable.isBanned, false))
      .groupBy(usersTable.id)
      .orderBy(
        desc(sql`cast(count(distinct case when ${careerProgressTable.completed} = true then ${careerProgressTable.careerId} end) as int)`),
        desc(sql`cast(count(distinct ${challengeAttemptsTable.id}) as int)`)
      )
      .limit(50);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "leaderboard error");
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

export default router;
