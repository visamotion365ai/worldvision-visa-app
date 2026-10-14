import { NextRequest, NextResponse } from "next/server";
import { ensureDbInitialized } from "@/db/init";
import { forbidden, getSessionUser, logActivity, unauthorized } from "@/lib/auth";
import { SETTING_KEYS, SECRET_KEYS, getAllSettingsMasked, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  if (me.role !== "admin") return forbidden("Admins only");
  return NextResponse.json({ success: true, settings: await getAllSettingsMasked() });
}

export async function POST(req: NextRequest) {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  if (me.role !== "admin") return forbidden("Admins only");
  const { settings } = await req.json();
  const saved: string[] = [];
  for (const k of SETTING_KEYS) {
    if (!(k in (settings || {}))) continue;
    const v = String(settings[k] ?? "").trim();
    // Secrets are only overwritten when a new value is typed (masked values start with •).
    if (SECRET_KEYS.has(k) && (v === "" || v.startsWith("•"))) continue;
    await setSetting(k, v);
    saved.push(k);
  }
  await logActivity({ id: me.id, name: me.fullName, role: "admin" }, "updated_integrations", "settings", undefined, saved.join(", "));
  return NextResponse.json({ success: true, saved, settings: await getAllSettingsMasked() });
}
