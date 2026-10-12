import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { markNotificationFailed, markNotificationSent, saveRegistration } from "@/db/pre-registration";
import { sendRegistrationNotification } from "@/db/registration-notification";

const sizes = ["1〜9人", "10〜19人", "20〜49人", "50〜99人", "100〜299人", "300〜999人", "1,000〜4,999人", "5,000人以上"] as const;
const services = [
  "買い物同行",
  "自宅訪問レクチャー",
  "断捨離サポート",
  "オンライン通販サポート",
  "マッチングアプリ写真撮影",
  "コーディネート診断サポート（お茶のみ）",
  "メイクレッスン（自宅）",
  "メイク相談&簡易レッスン（カフェ、フードコート等）",
  "コスメ買い物同行",
  "オンライン相談&レッスン",
  "ウェルネス/マインドフルビューティーカウンセリング（カフェ等）",
] as const;
const schema = z.object({
  company: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  department: z.string().trim().min(1).max(120),
  title: z.string().trim().max(120).optional().default(""),
  employeeSize: z.enum(sizes),
  canReferDecisionMaker: z.boolean(),
  introductionLikelihood: z.number().int().min(10).max(99),
  desiredServices: z.union([
    z.array(z.enum(services)).max(services.length).refine((values) => new Set(values).size === values.length),
    z.string().trim().max(2000),
  ]).optional().default([]),
  desiredServiceOther: z.string().trim().max(1500).optional().default(""),
  supportMessage: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

const freeDomains = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.jp", "ymail.com", "outlook.com", "outlook.jp",
  "hotmail.com", "hotmail.co.jp", "live.com", "icloud.com", "me.com", "mac.com", "aol.com",
  "docomo.ne.jp", "ezweb.ne.jp", "au.com", "softbank.ne.jp", "i.softbank.jp", "nifty.com",
  "proton.me", "protonmail.com", "mail.com", "qq.com",
]);

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "送信元を確認できません。" }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "入力形式を確認してください。" }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 7500) return NextResponse.json({ error: "入力内容が長すぎます。" }, { status: 413 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "入力内容を読み取れませんでした。" }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "必須項目と入力内容をご確認ください。" }, { status: 400 });
  const { company, email, department, title, employeeSize, canReferDecisionMaker, introductionLikelihood, desiredServices, desiredServiceOther, supportMessage } = parsed.data;
  const domain = email.split("@")[1];
  if (!domain || freeDomains.has(domain) || !domain.includes(".")) {
    return NextResponse.json({ error: "会社・団体・学校・病院から付与されたメールアドレスを入力してください。" }, { status: 400 });
  }
  const selectedServices = Array.isArray(desiredServices) ? desiredServices : [];
  const legacyServiceText = typeof desiredServices === "string" ? desiredServices : "";
  const desiredServicesData = selectedServices.length || legacyServiceText || desiredServiceOther
    ? JSON.stringify({
      ranked: selectedServices.map((service, index) => ({ rank: index + 1, service })),
      other: desiredServiceOther,
      legacyText: legacyServiceText || null,
    })
    : null;
  const desiredServiceSummary = [
    ...selectedServices.map((service, index) => `${index + 1}位：${service}`),
    ...(legacyServiceText ? [`その他・自由記載：${legacyServiceText}`] : []),
    ...(desiredServiceOther ? [`その他：${desiredServiceOther}`] : []),
  ].join("\n");
  const registration = { company, email, department, title: title || null, employeeSize, canReferDecisionMaker, introductionLikelihood, desiredServices: desiredServicesData, desiredServicesDisplay: desiredServiceSummary || null, supportMessage: supportMessage || null };
  let registrationId: number;
  try {
    registrationId = await saveRegistration(registration);
  } catch (error) {
    if (String(error).includes("UNIQUE constraint failed")) return NextResponse.json({ error: "このメールアドレスはすでに登録されています。" }, { status: 409 });
    console.error("Pre-registration save failed", error);
    return NextResponse.json({ error: "保存できませんでした。入力内容を残したまま、少し時間を置いて再度お試しください。" }, { status: 503 });
  }
  try {
    await sendRegistrationNotification(registrationId, registration);
  } catch (error) {
    console.error("Pre-registration notification failed", { registrationId, error });
    try { await markNotificationFailed(registrationId); } catch (statusError) {
      console.error("Notification status update failed", { registrationId, statusError });
    }
    return NextResponse.json({ success: true }, { status: 201 });
  }
  try {
    await markNotificationSent(registrationId);
  } catch (statusError) {
    console.error("Notification status update failed", { registrationId, statusError });
  }
  return NextResponse.json({ success: true }, { status: 201 });
}
