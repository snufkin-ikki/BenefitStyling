import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const preRegistrations = sqliteTable("pre_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  title: text("title"),
  employeeSize: text("employee_size").notNull(),
  canReferDecisionMaker: integer("can_refer_decision_maker", { mode: "boolean" }).notNull(),
  introductionLikelihood: integer("introduction_likelihood").notNull(),
  desiredServices: text("desired_services"),
  supportMessage: text("support_message"),
  notificationStatus: text("notification_status").notNull().default("pending"),
  notificationSentAt: text("notification_sent_at"),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_pre_registrations_email").on(table.email)]);
