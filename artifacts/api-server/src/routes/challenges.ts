import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, usersTable, challengesTable, challengeAttemptsTable } from "@workspace/db";
import {
  GetMyChallengesQueryParams,
  GetMyChallengesResponse,
  AnswerChallengeParams,
  AnswerChallengeBody,
  AnswerChallengeResponse,
} from "@workspace/api-zod";

const router = Router();

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
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);
  if (!users[0]) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  if (isBanActive(users[0])) {
    const until = users[0].banUntil
      ? `until ${new Date(users[0].banUntil).toLocaleDateString()}`
      : "permanently";
    res.status(403).json({ error: `Your account has been banned ${until}.`, reason: users[0].banReason });
    return;
  }
  req.dbUser = users[0];
  next();
}

// GET /users/me/challenges
router.get("/users/me/challenges", requireAuth, async (req: any, res): Promise<void> => {
  const params = GetMyChallengesQueryParams.safeParse(req.query);
  const careerId = (params.success && params.data.careerId) ? params.data.careerId : req.dbUser.activeCareer;
  if (!careerId) {
    res.json([]);
    return;
  }

  // Get all challenges for this career
  const allChallenges = await db
    .select()
    .from(challengesTable)
    .where(eq(challengesTable.careerId, careerId));

  if (allChallenges.length === 0) {
    res.json([]);
    return;
  }

  // Get already-answered challenge IDs for this user (for this career)
  const answered = await db
    .select({ challengeId: challengeAttemptsTable.challengeId })
    .from(challengeAttemptsTable)
    .where(eq(challengeAttemptsTable.userId, req.dbUser.id));

  const answeredIds = answered.map(a => a.challengeId);

  // Filter out answered challenges
  const unanswered = answeredIds.length > 0
    ? allChallenges.filter(c => !answeredIds.includes(c.id))
    : allChallenges;

  // If all answered, return empty array (frontend shows badge)
  const toReturn = unanswered.slice(0, 30);

  res.json(GetMyChallengesResponse.parse(toReturn.map(c => ({
    id: c.id,
    careerId: c.careerId,
    question: c.question,
    options: c.options,
    difficulty: c.difficulty,
  }))));
});

// GET /users/me/challenges/status
router.get("/users/me/challenges/status", requireAuth, async (req: any, res): Promise<void> => {
  const careerId = Number(req.query.careerId) || req.dbUser.activeCareer;
  if (!careerId) {
    res.json({ total: 0, completed: 0, allDone: false });
    return;
  }

  const allChallengeIds = (await db.select({ id: challengesTable.id })
    .from(challengesTable)
    .where(eq(challengesTable.careerId, careerId)))
    .map(c => c.id);

  const totalForCareer = allChallengeIds.length;

  if (totalForCareer === 0) {
    res.json({ total: 0, completed: 0, allDone: false });
    return;
  }

  const answered = await db
    .select()
    .from(challengeAttemptsTable)
    .where(eq(challengeAttemptsTable.userId, req.dbUser.id));

  const completedForCareer = answered.filter(a => allChallengeIds.includes(a.challengeId)).length;

  res.json({
    total: totalForCareer,
    completed: completedForCareer,
    allDone: completedForCareer >= totalForCareer,
  });
});

// POST /users/me/challenges/:challengeId/answer
router.post("/users/me/challenges/:challengeId/answer", requireAuth, async (req: any, res): Promise<void> => {
  const params = AnswerChallengeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AnswerChallengeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [challenge] = await db
    .select()
    .from(challengesTable)
    .where(eq(challengesTable.id, params.data.challengeId));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }
  const correct = body.data.answer.trim().toLowerCase() === challenge.correctAnswer.trim().toLowerCase();

  // Record the attempt (upsert - don't overwrite if already answered correctly)
  await db.insert(challengeAttemptsTable).values({
    userId: req.dbUser.id,
    challengeId: challenge.id,
    answeredCorrectly: correct,
  }).onConflictDoNothing();

  res.json(AnswerChallengeResponse.parse({
    correct,
    explanation: challenge.explanation,
    points: correct ? challenge.points : 0,
  }));
});

// POST /users/me/challenges/reset — reset challenge progress for a career
router.post("/users/me/challenges/reset", requireAuth, async (req: any, res): Promise<void> => {
  const careerId = Number(req.body?.careerId) || req.dbUser.activeCareer;
  if (!careerId) {
    res.status(400).json({ error: "No career selected" });
    return;
  }

  const allChallengeIds = (await db.select({ id: challengesTable.id })
    .from(challengesTable)
    .where(eq(challengesTable.careerId, careerId)))
    .map(c => c.id);

  let resetCount = 0;
  for (const cId of allChallengeIds) {
    await db.delete(challengeAttemptsTable).where(
      and(
        eq(challengeAttemptsTable.userId, req.dbUser.id),
        eq(challengeAttemptsTable.challengeId, cId)
      )
    );
    resetCount++;
  }

  res.json({ success: true, reset: resetCount });
});

export default router;
