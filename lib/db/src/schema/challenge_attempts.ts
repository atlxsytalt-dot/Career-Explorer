import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { challengesTable } from "./challenges";

export const challengeAttemptsTable = pgTable("challenge_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id").notNull().references(() => challengesTable.id, { onDelete: "cascade" }),
  answeredCorrectly: boolean("answered_correctly").notNull().default(false),
  answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
});
