import { env } from "cloudflare:workers";

export type Registration = {
  company: string;
  email: string;
  department: string;
  title: string | null;
  employeeSize: string;
  canReferDecisionMaker: boolean;
  introductionLikelihood: number;
  desiredServices: string | null;
  desiredServicesDisplay: string | null;
  supportMessage: string | null;
};

export async function saveRegistration(input: Registration) {
  if (!env.DB) throw new Error("Database binding unavailable");
  const result = await env.DB.prepare(`
    INSERT INTO pre_registrations
      (company, email, department, title, employee_size, can_refer_decision_maker,
       introduction_likelihood, desired_services, support_message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    input.company, input.email, input.department, input.title, input.employeeSize,
    input.canReferDecisionMaker ? 1 : 0, input.introductionLikelihood,
    input.desiredServices, input.supportMessage, new Date().toISOString()
  ).run();
  return result.meta.last_row_id;
}

export async function markNotificationSent(id: number) {
  if (!env.DB) throw new Error("Database binding unavailable");
  await env.DB.prepare("UPDATE pre_registrations SET notification_status = 'sent', notification_sent_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), id).run();
}

export async function markNotificationFailed(id: number) {
  if (!env.DB) throw new Error("Database binding unavailable");
  await env.DB.prepare("UPDATE pre_registrations SET notification_status = 'failed' WHERE id = ?")
    .bind(id).run();
}
