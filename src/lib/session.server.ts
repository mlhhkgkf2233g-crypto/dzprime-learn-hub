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
