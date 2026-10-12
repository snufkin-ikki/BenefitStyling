import { env } from "cloudflare:workers";
import type { Registration } from "./pre-registration";

const destination = "info@benefitstyling.jp";
const sender = "Benefit Styling <notifications@fashion-attendant.com>";

export async function sendRegistrationNotification(id: number, input: Registration) {
  if (!env.RESEND_API_KEY) throw new Error("Resend API key unavailable");

  const rows = [
    ["登録番号", String(id)],
    ["企業・団体・学校・病院名", input.company],
    ["法人メールアドレス", input.email],
    ["担当部署", input.department],
    ["役職", input.title || "記入なし"],
    ["従業員・職員規模", input.employeeSize],
    ["人事・総務・決裁者の紹介可否", input.canReferDecisionMaker ? "はい" : "いいえ"],
    ["ローンチ後の導入見込み", `${input.introductionLikelihood}%`],
    ["希望するサービス・プラン・コース", input.desiredServicesDisplay || "記入なし"],
    ["応援メッセージ", input.supportMessage || "記入なし"],
  ];
  const text = ["Benefit Stylingに事前登録がありました。", "", ...rows.map(([label, value]) => `【${label}】\n${value}`), "", "このメールは事前登録フォームから自動送信されています。"].join("\n\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `benefit-styling-preregistration-${id}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [destination],
      reply_to: input.email,
      subject: `【Benefit Styling】事前登録 #${id}：${input.company}`,
      text,
    }),
  });
  if (!response.ok) throw new Error(`Resend rejected notification: ${response.status}`);
}
