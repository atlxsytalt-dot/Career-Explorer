import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const careersTable = pgTable("careers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  stepCount: integer("step_count").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
});

export const careerStepsTable = pgTable("career_steps", {
  id: serial("id").primaryKey(),
  careerId: integer("career_id").notNull().references(() => careersTable.id),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tip: text("tip"),
});

export const insertCareerSchema = createInsertSchema(careersTable).omit({ id: true });
export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type Career = typeof careersTable.$inferSelect;

export const insertCareerStepSchema = createInsertSchema(careerStepsTable).omit({ id: true });
export type InsertCareerStep = z.infer<typeof insertCareerStepSchema>;
export type CareerStep = typeof careerStepsTable.$inferSelect;
