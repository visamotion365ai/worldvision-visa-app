import { db } from "./index";
import { sql } from "drizzle-orm";
import { seedDatabase } from "./seed";
import { hashPassword } from "@/lib/auth";

let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function runInit() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      country TEXT DEFAULT 'Bangladesh',
      avatar_url TEXT,
      password_hash TEXT,
      is_verified BOOLEAN DEFAULT true,
      biometric_enabled BOOLEAN DEFAULT false,
      role TEXT DEFAULT 'applicant',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      application_number TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      country TEXT NOT NULL,
      visa_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'under_review',
      progress_pct INTEGER NOT NULL DEFAULT 25,
      submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      fee_amount INTEGER DEFAULT 1250,
      payment_status TEXT DEFAULT 'paid',
      current_step INTEGER DEFAULT 10,
      details JSONB,
      next_action TEXT DEFAULT 'Consular verification in progress',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
      doc_type TEXT NOT NULL,
      title TEXT NOT NULL,
      file_name TEXT NOT NULL DEFAULT 'document',
      file_size TEXT DEFAULT '0 KB',
      file_url TEXT,
      status TEXT NOT NULL DEFAULT 'under_review',
      rejection_reason TEXT,
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      verified_at TIMESTAMP WITH TIME ZONE
    );
  `);
  await db.execute(sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_data TEXT;`);
  await db.execute(sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT;`);
  await db.execute(sql`ALTER TABLE documents ALTER COLUMN file_name SET DEFAULT 'document';`);
  await db.execute(sql`UPDATE documents SET file_name = 'document' WHERE file_name IS NULL;`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL, company TEXT NOT NULL, country TEXT NOT NULL, flag TEXT NOT NULL,
      location TEXT NOT NULL, salary TEXT NOT NULL, experience TEXT NOT NULL, job_type TEXT NOT NULL,
      category TEXT NOT NULL, vacancies INTEGER DEFAULT 5, description TEXT NOT NULL,
      requirements JSONB, benefits JSONB, is_featured BOOLEAN DEFAULT false, image_url TEXT, deadline TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS job_applications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
      resume_name TEXT, experience_years TEXT, cover_note TEXT, status TEXT DEFAULT 'submitted',
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false, link TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sender TEXT NOT NULL, sender_name TEXT DEFAULT 'Assistant', message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ai_agent_tasks (
      id SERIAL PRIMARY KEY,
      task_type TEXT NOT NULL, country TEXT NOT NULL, target_url TEXT,
      provider TEXT DEFAULT 'browserbase' NOT NULL, status TEXT DEFAULT 'completed' NOT NULL,
      prompt TEXT NOT NULL, result JSONB, logs JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS system_settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE, value TEXT NOT NULL, description TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      actor_id INTEGER, actor_name TEXT NOT NULL, actor_role TEXT NOT NULL,
      action TEXT NOT NULL, entity_type TEXT, entity_id INTEGER, detail TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);

  // Remove placeholder keys / simulated agent output created by earlier builds.
  await db.execute(sql`
    DELETE FROM system_settings WHERE value IN (
      'bb_live_wv_74932018a9fc482d','proj_wv_consular_8892',
      'b44_live_wv_agency_agent_92014','meta_llama3_wv_consular_84129'
    );
  `);
  await db.execute(sql`DELETE FROM system_settings WHERE key IN ('AUTO_PROCESS_APPLICATIONS','EMBASSY_LIVE_SCRAPING');`);
  await db.execute(sql`DELETE FROM ai_agent_tasks WHERE logs::text LIKE '%Initialized Browserbase headless session%' OR logs::text LIKE '%Meta AI knowledge agent queried%' OR logs::text LIKE '%Base44 agent triggered MOM%';`);
  await db.execute(sql`DELETE FROM ai_agent_tasks WHERE logs::text LIKE '%[Browserbase Cloud] Initializing%' OR logs::text LIKE '%[Meta AI Agent]%' OR logs::text LIKE '%[Base44 Agent]%';`);
  // Demo documents had no real files behind them.
  await db.execute(sql`DELETE FROM documents WHERE file_data IS NULL AND (file_url IS NULL OR file_url LIKE '/sample-%');`);

  await seedDatabase();

  // Role accounts (set ADMIN_EMAIL / ADMIN_PASSWORD / AGENT_* / DEMO_* in the environment to override).
  const accounts = [
    {
      name: "World Vision Admin",
      email: (process.env.ADMIN_EMAIL || "admin@worldvision.com").toLowerCase(),
      password: process.env.ADMIN_PASSWORD || "WorldVision@2026",
      role: "admin",
    },
    {
      name: "Senior Visa Agent",
      email: (process.env.AGENT_EMAIL || "agent@worldvision.com").toLowerCase(),
      password: process.env.AGENT_PASSWORD || "Agent@2026",
      role: "agent",
    },
    {
      name: "Tanvir Hasan",
      email: "tanvir.hasan@worldvision.com",
      password: process.env.DEMO_PASSWORD || "Applicant@2026",
      role: "applicant",
    },
  ];
  for (const a of accounts) {
    const existing = await db.execute(sql`SELECT id, password_hash, role FROM users WHERE email = ${a.email} LIMIT 1`);
    const row = (existing.rows as any[])[0];
    if (!row) {
      await db.execute(
        sql`INSERT INTO users (full_name, email, role, password_hash, is_verified) VALUES (${a.name}, ${a.email}, ${a.role}, ${hashPassword(a.password)}, true)`
      );
    } else if (!row.password_hash) {
      await db.execute(sql`UPDATE users SET password_hash = ${hashPassword(a.password)} WHERE id = ${row.id}`);
    }
  }
  await db.execute(sql`UPDATE users SET role = 'applicant' WHERE role IS NULL;`);
}

export async function ensureDbInitialized() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = runInit()
      .then(() => {
        isInitialized = true;
      })
      .catch((err) => {
        console.error("Database initialization error:", err);
        initPromise = null;
        throw err;
      });
  }
  await initPromise;
}
