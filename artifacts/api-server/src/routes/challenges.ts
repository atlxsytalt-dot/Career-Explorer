import { Router } from "express";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, usersTable, challengesTable } from "@workspace/db";
import {
  GetMyChallengesQueryParams,
  GetMyChallengesResponse,
  AnswerChallengeParams,
  AnswerChallengeBody,
  AnswerChallengeResponse,
} from "@workspace/api-zod";

const router = Router();

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
  if (users[0].isBanned) {
    res.status(403).json({ error: "Your account has been banned." });
    return;
  }
  req.dbUser = users[0];
  next();
}

// GET /users/me/challenges
router.get("/users/me/challenges", requireAuth, async (req: any, res): Promise<void> => {
  const params = GetMyChallengesQueryParams.safeParse(req.query);
  let careerId = params.success && params.data.careerId ? params.data.careerId : req.dbUser.activeCareer;
  if (!careerId) {
    res.json([]);
    return;
  }
  const challenges = await db
    .select()
    .from(challengesTable)
    .where(eq(challengesTable.careerId, careerId))
    .limit(10);

  res.json(GetMyChallengesResponse.parse(challenges.map(c => ({
    id: c.id,
    careerId: c.careerId,
    question: c.question,
    options: c.options,
    difficulty: c.difficulty,
  }))));
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
  res.json(AnswerChallengeResponse.parse({
    correct,
    explanation: challenge.explanation,
    points: correct ? challenge.points : 0,
  }));
});

export default router;
