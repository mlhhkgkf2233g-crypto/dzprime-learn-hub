import { createHmac, timingSafeEqual } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface TelegramIdentity {
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  language_code: string | null;
}

export class ConfigError extends Error {
  code = "CONFIG_REQUIRED";
}
export class AuthError extends Error {
  code = "TELEGRAM_AUTH_REQUIRED";
}

export function admin(): SupabaseClient {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new ConfigError("Backend keys are not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Verifies Telegram WebApp initData server-side (HMAC-SHA256 with the bot token).
 * Never trusts any identity value sent by the browser.
 */
export function verifyInitData(initData: string): TelegramIdentity {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new ConfigError("TELEGRAM_BOT_TOKEN is not configured");
  if (!initData) throw new AuthError("Telegram authentication is required");

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new AuthError("Invalid Telegram session");
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const computed = createHmac("sha256", secret).update(dataCheckString).digest("hex");

  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new AuthError("Invalid Telegram signature");
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400) {
    throw new AuthError("Telegram session expired");
  }

  const rawUser = params.get("user");
  if (!rawUser) throw new AuthError("Telegram user missing");
  const u = JSON.parse(rawUser) as {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    language_code?: string;
  };
  if (!u?.id) throw new AuthError("Telegram user missing");

  return {
    telegram_id: u.id,
    username: u.username ?? null,
    first_name: u.first_name ?? null,
    last_name: u.last_name ?? null,
    photo_url: u.photo_url ?? null,
    language_code: u.language_code ?? null,
  };
}

/** Verifies the session and upserts the REAL Telegram user, returning its row. */
export async function requireUser(initData: string) {
  const identity = verifyInitData(initData);
  const db = admin();
  const { data, error } = await db
    .from("users")
    .upsert(
      { ...identity, last_seen_at: new Date().toISOString() },
      { onConflict: "telegram_id" },
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { db, user: data as Record<string, unknown> & { id: string; telegram_id: number } };
}

export function toClientError(e: unknown) {
  const code =
    e instanceof ConfigError ? "CONFIG_REQUIRED" : e instanceof AuthError ? "TELEGRAM_AUTH_REQUIRED" : "ERROR";
  return { code, message: e instanceof Error ? e.message : "Unexpected error" };
}

/**
 * Web (browser) identity. Verifies the Supabase Auth bearer token server-side
 * and maps it to the existing public.users row (creating it on first sign-in).
 * Telegram identity above is kept and remains supported.
 */
export async function requireWebUser(accessToken: string | null) {
  if (!accessToken) throw new AuthError("Authentication required");
  const db = admin();
  const { data: authData, error: authErr } = await db.auth.getUser(accessToken);
  if (authErr || !authData?.user) throw new AuthError("Invalid or expired session");
  const authUser = authData.user;

  const { data: existing } = await db
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = typeof meta["full_name"] === "string" ? (meta["full_name"] as string) : null;

  if (existing) {
    await db.from("users").update({ last_seen_at: new Date().toISOString() }).eq("id", existing.id);
    return { db, user: existing as Record<string, unknown> & { id: string } };
  }

  const { data, error } = await db
    .from("users")
    .insert({
      auth_user_id: authUser.id,
      email: authUser.email ?? null,
      first_name: fullName?.split(" ")[0] ?? null,
      last_name: fullName?.split(" ").slice(1).join(" ") || null,
      last_seen_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { db, user: data as Record<string, unknown> & { id: string } };
}
