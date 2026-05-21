import { Router } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, careersTable, careerStepsTable } from "@workspace/db";
import {
  ListCareersQueryParams,
  ListCareersResponse,
  GetCareerParams,
  GetCareerResponse,
} from "@workspace/api-zod";

const router = Router();

// GET /careers
router.get("/careers", async (req, res): Promise<void> => {
  const params = ListCareersQueryParams.safeParse(req.query);
  let query = db.select().from(careersTable).$dynamic();
  if (params.success && params.data.category) {
    query = query.where(ilike(careersTable.category, params.data.category));
  }
  const careers = await query.orderBy(careersTable.title);
  res.json(ListCareersResponse.parse(careers.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    icon: c.icon,
    description: c.description,
    stepCount: c.stepCount,
    featured: c.featured,
  }))));
});

// GET /careers/:id
router.get("/careers/:id", async (req, res): Promise<void> => {
  const params = GetCareerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [career] = await db.select().from(careersTable).where(eq(careersTable.id, params.data.id));
  if (!career) {
    res.status(404).json({ error: "Career not found" });
    return;
  }
  const steps = await db
    .select()
    .from(careerStepsTable)
    .where(eq(careerStepsTable.careerId, career.id))
    .orderBy(careerStepsTable.order);

  res.json(GetCareerResponse.parse({
    id: career.id,
    title: career.title,
    category: career.category,
    icon: career.icon,
    description: career.description,
    stepCount: career.stepCount,
    featured: career.featured,
    steps: steps.map(s => ({
      id: s.id,
      careerId: s.careerId,
      order: s.order,
      title: s.title,
      description: s.description,
      tip: s.tip ?? null,
    })),
  }));
});

export default router;
