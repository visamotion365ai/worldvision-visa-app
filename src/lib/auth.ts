import crypto from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, activityLog } from "@/db/schema";

export type Role = "applicant" | "agent" | "admin";
export type SessionUser = typeof users.$inferSelect;

const COOKIE = "wv_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  return process.env.AUTH_SECRET || "wv-dev-secret-set-AUTH_SECRET-in-production";
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored?: string | null) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  return known.length === test.length && crypto.timingSafeEqual(known, test);
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createToken(uid: number, role: string) {
  const body = Buffer.from(JSON.stringify({ uid, role, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${body}.${sign(body)}`;
}

function readToken(token?: string) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data as { uid: number; role: string; exp: number };
  } catch {
    return null;
  }
}

export async function setSessionCookie(uid: number, role: string, remember = true) {
  const store = await cookies();
  store.set(COOKIE, createToken(uid, role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // "Remember me" off → browser-session cookie.
    ...(remember ? { maxAge: MAX_AGE } : {}),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const data = readToken(store.get(COOKIE)?.value);
  if (!data) return null;
  const [user] = await db.select().from(users).where(eq(users.id, data.uid)).limit(1);
  return user ?? null;
}

export function publicUser(u: SessionUser) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export const isStaff = (u: SessionUser | null) => !!u && (u.role === "agent" || u.role === "admin");

export async function logActivity(
  actor: { id?: number | null; name: string; role: string },
  action: string,
  entityType?: string,
  entityId?: number,
  detail?: string
) {
  try {
    await db.insert(activityLog).values({
      actorId: actor.id ?? null,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      entityType,
      entityId,
      detail,
    });
  } catch {}
}

export function unauthorized(msg = "Please sign in") {
  return Response.json({ success: false, error: msg }, { status: 401 });
}
export function forbidden(msg = "You do not have access to this area") {
  return Response.json({ success: false, error: msg }, { status: 403 });
}
