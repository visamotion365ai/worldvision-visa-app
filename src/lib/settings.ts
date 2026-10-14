import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const SETTING_KEYS = [
  "AI_PROVIDER",
  "AI_BASE_URL",
  "AI_MODEL",
  "META_AI_KEY",
  "BROWSERBASE_API_KEY",
  "BROWSERBASE_PROJECT_ID",
  "BASE44_API_KEY",
  "BASE44_APP_ID",
  "BASE44_FUNCTION_URL",
  "AUTO_REVIEW_APPLICATIONS",
] as const;

export const SECRET_KEYS = new Set(["META_AI_KEY", "BROWSERBASE_API_KEY", "BASE44_API_KEY"]);

/** DB value wins, environment variable is the fallback. */
export async function getSetting(key: string): Promise<string> {
  try {
    const [row] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
    if (row && row.value) return row.value;
  } catch {}
  return process.env[key] || "";
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(systemSettings)
    .values({ key, value, description: "Managed from Admin → Integrations" })
    .onConflictDoUpdate({ target: systemSettings.key, set: { value, updatedAt: new Date() } });
}

export function mask(value: string) {
  if (!value) return "";
  return value.length <= 8 ? "••••" : `••••••••${value.slice(-4)}`;
}

export async function getAllSettingsMasked() {
  const out: Record<string, { value: string; configured: boolean; secret: boolean }> = {};
  for (const k of SETTING_KEYS) {
    const v = await getSetting(k);
    const secret = SECRET_KEYS.has(k);
    out[k] = { value: secret ? mask(v) : v, configured: !!v, secret };
  }
  return out;
}
