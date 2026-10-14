import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { eq, inArray } from "drizzle-orm";
import {
  clearSessionCookie,
  getSessionUser,
  hashPassword,
  logActivity,
  publicUser,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    const user = await getSessionUser();
    return NextResponse.json({ success: true, user: user ? publicUser(user) : null });
  } catch (e) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const body = await req.json();
    const action = body.action as string;

    if (action === "logout") {
      await clearSessionCookie();
      return NextResponse.json({ success: true });
    }

    if (action === "login") {
      const identifier = String(body.identifier || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!identifier || !password) {
        return NextResponse.json({ success: false, error: "Enter your email/phone and password" }, { status: 400 });
      }
      const all = await db.select().from(users);
      const user = all.find(
        (u) => u.email.toLowerCase() === identifier || (u.phone && u.phone.replace(/\s/g, "") === identifier.replace(/\s/g, ""))
      );
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ success: false, error: "Incorrect email/phone or password" }, { status: 401 });
      }
      await setSessionCookie(user.id, user.role || "applicant", body.remember !== false);
      await logActivity({ id: user.id, name: user.fullName, role: user.role || "applicant" }, "signed_in");
      return NextResponse.json({ success: true, user: publicUser(user) });
    }

    if (action === "signup") {
      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();
      const password = String(body.password || "");
      const country = String(body.country || "Bangladesh");

      if (fullName.length < 2) return NextResponse.json({ success: false, error: "Enter your full name" }, { status: 400 });
      if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ success: false, error: "Enter a valid email address" }, { status: 400 });
      if (password.length < 8) return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });

      const [exists] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (exists) return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });

      const [created] = await db
        .insert(users)
        .values({ fullName, email, phone: phone || null, country, passwordHash: hashPassword(password), role: "applicant" })
        .returning();

      await db.insert(notifications).values({
        userId: created.id,
        title: "Welcome to World Vision",
        message: "Your account is ready. Pick a destination and start your first visa application.",
        type: "application",
      });
      await setSessionCookie(created.id, "applicant");
      await logActivity({ id: created.id, name: created.fullName, role: "applicant" }, "signed_up", "user", created.id);
      return NextResponse.json({ success: true, user: publicUser(created) });
    }

    if (action === "forgot") {
      const email = String(body.email || "").trim().toLowerCase();
      const [target] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      // Always answer the same way so accounts cannot be enumerated.
      if (target) {
        const staff = await db.select().from(users).where(inArray(users.role, ["admin", "agent"]));
        for (const s of staff) {
          await db.insert(notifications).values({
            userId: s.id,
            title: "Password reset requested",
            message: `${target.fullName} (${target.email}) asked for a password reset. Set a new password in Settings → Team.`,
            type: "system",
          });
        }
        await logActivity({ id: target.id, name: target.fullName, role: target.role || "applicant" }, "password_reset_requested", "user", target.id);
      }
      return NextResponse.json({ success: true, message: "If that account exists, our desk has been notified and will contact you." });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("POST /api/auth", e);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
