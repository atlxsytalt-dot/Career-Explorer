import { Router, type IRouter } from "express";
import healthRouter from "./health";
import careersRouter from "./careers";
import usersRouter from "./users";
import challengesRouter from "./challenges";
import adminRouter from "./admin";
import announcementsRouter from "./announcements";
import teacherRouter from "./teacher";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(careersRouter);
router.use(usersRouter);
router.use(challengesRouter);
router.use(adminRouter);
router.use(announcementsRouter);
router.use(teacherRouter);
router.use(leaderboardRouter);

export default router;
