import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const speakerApplications = mysqlTable("speaker_applications", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  age: int("age").notNull(),
  cityCountry: varchar("cityCountry", { length: 160 }).notNull(),
  currentStatus: varchar("currentStatus", { length: 80 }).notNull(),
  currentWork: varchar("currentWork", { length: 320 }).notNull(),
  links: varchar("links", { length: 700 }),
  idea: text("idea").notNull(),
  disagreement: text("disagreement").notNull(),
  oneThing: text("oneThing").notNull(),
  area: varchar("area", { length: 100 }).notNull(),
  spokenBefore: mysqlEnum("spokenBefore", ["Yes", "No"]).notNull(),
  speakingWhere: varchar("speakingWhere", { length: 500 }),
  whySpeak: text("whySpeak").notNull(),
  photoUrl: varchar("photoUrl", { length: 1000 }).notNull(),
  anythingElse: text("anythingElse"),
  consent: int("consent").notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "contacted"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SpeakerApplication = typeof speakerApplications.$inferSelect;
export type InsertSpeakerApplication = typeof speakerApplications.$inferInsert;
