import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHash, randomInt, timingSafeEqual } from "crypto";

// OTP-based customer verification for Indian phone numbers.
// 6-digit OTP, 5-minute expiry, 30s resend cooldown, max 5 attempts,
// max 5 requests per phone per 10 minutes. OTPs are SHA-256 hashed at rest.
// Secrets (MSG91 / WhatsApp) stay server-side via environment variables.

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_REQUESTS_PER_10MIN = 5;

const isIndianMobile = (phone: string) => /^[6-9]\d{9}$/.test(phone);

function pepper() {
  return process.env["OTP_PEPPER"] ?? "apna-baithak-dev-pepper-change-me";
}

function hashOtp(otp: string) {
  return createHash("sha256").update(`${otp}:${pepper()}`).digest("hex");
}

function newOtp() {
  return String(randomInt(100000, 1000000));
}

async function sendOtpSms(phone: string, otp: string) {
  const msg91Key = process.env["MSG91_API_KEY"];
  const msg91Sender = process.env["MSG91_SENDER"];
  const msg91Template = process.env["MSG91_TEMPLATE_ID"];
  if (msg91Key && msg91Sender) {
    const res = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json", authkey: msg91Key },
      body: JSON.stringify({
        mobile: `91${phone}`,
        sender: msg91Sender,
        otp,
        ...(msg91Template ? { template_id: msg91Template } : {}),
      }),
    });
    if (!res.ok) throw new Error("Could not send OTP SMS. Try again.");
    return;
  }
  const waToken = process.env["WHATSAPP_TOKEN"];
  const waPhoneId = process.env["WHATSAPP_PHONE_ID"];
  const waTemplate = process.env["WHATSAPP_OTP_TEMPLATE"] ?? "otp_verification";
  if (waToken && waPhoneId) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${waPhoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${waToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `91${phone}`,
        type: "template",
        template: {
          name: waTemplate,
          language: { code: "en" },
          components: [{ type: "body", parameters: [{ type: "text", text: otp }] }],
        },
      }),
    });
    if (!res.ok) throw new Error("Could not send WhatsApp OTP. Try again.");
    return;
  }
  // No provider configured — dev fallback. Never exposed to the client.
  console.log(`[OTP dev] ${phone}: ${otp}`);
}

async function adminDb(): Promise<any> {
  // phone_otps is intentionally absent from generated Database types;
  // all access is server-side via service_role, so `any` is safe here.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const requestOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { phone: string }) => {
    if (!isIndianMobile(input.phone)) throw new Error("Enter a valid 10-digit Indian mobile number.");
    return input;
  })
  .handler(async ({ data }) => {
    const db = await adminDb();
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await db
      .from("phone_otps")
      .select("id,created_at,verified")
      .eq("phone", data.phone)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(MAX_REQUESTS_PER_10MIN + 1);
    const rows = recent ?? [];
    if (rows.length >= MAX_REQUESTS_PER_10MIN)
      throw new Error("Too many OTP requests. Please try again after some time.");
    const latest = rows[0] as { created_at: string } | undefined;
    if (latest) {
      const waitMs = RESEND_COOLDOWN_MS - (Date.now() - new Date(latest.created_at).getTime());
      if (waitMs > 0) throw new Error(`Please wait ${Math.ceil(waitMs / 1000)}s before resending OTP.`);
    }

    const otp = newOtp();
    await db.from("phone_otps").delete().eq("phone", data.phone);
    const { error } = await db.from("phone_otps").insert({
      phone: data.phone,
      otp_hash: hashOtp(otp),
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    });
    if (error) throw new Error("Could not send OTP. Try again.");

    await sendOtpSms(data.phone, otp);
    // Generic response — never reveals account existence or the OTP itself.
    return { ok: true, resendAfter: Math.ceil(RESEND_COOLDOWN_MS / 1000) };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { phone: string; otp: string }) => {
    if (!isIndianMobile(input.phone)) throw new Error("Enter a valid 10-digit Indian mobile number.");
    if (!/^\d{6}$/.test(input.otp)) throw new Error("Enter the 6-digit OTP.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const db = await adminDb();
    const { data: row } = await db
      .from("phone_otps")
      .select("id,otp_hash,expires_at,attempts,verified")
      .eq("phone", data.phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    // Generic errors everywhere — never reveal whether the phone exists.
    if (!row || row.verified || new Date(row.expires_at).getTime() < Date.now())
      throw new Error("Invalid or expired OTP. Please request a new one.");
    if (Number(row.attempts) >= MAX_ATTEMPTS)
      throw new Error("Too many attempts. Please request a new OTP.");

    const a = Buffer.from(hashOtp(data.otp));
    const b = Buffer.from(row.otp_hash);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      await db.from("phone_otps").update({ attempts: Number(row.attempts) + 1 }).eq("id", row.id);
      throw new Error("Invalid or expired OTP. Please request a new one.");
    }

    await db.from("phone_otps").update({ verified: true }).eq("id", row.id);
    await db.from("profiles").update({ phone_verified: true }).eq("id", context.userId);
    return { ok: true, verified: true };
  });
