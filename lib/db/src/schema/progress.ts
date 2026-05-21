import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { careersTable } from "./careers";

export const careerProgressTable = pgTable("career_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  careerId: integer("career_id").notNull().references(() => careersTable.id),
  completedSteps: integer("completed_steps").notNull().default(0),
  totalSteps: integer("total_steps").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertCareerProgressSchema = createInsertSchema(careerProgressTable).omit({ id: true, startedAt: true });
export type InsertCareerProgress = z.infer<typeof insertCareerProgressSchema>;
export type CareerProgress = typeof careerProgressTable.$inferSelect;
