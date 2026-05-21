import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { careersTable } from "./careers";

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  careerId: integer("career_id").notNull().references(() => careersTable.id),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  points: integer("points").notNull().default(10),
});

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({ id: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;
