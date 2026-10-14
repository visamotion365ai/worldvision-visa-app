import { pgTable, text, timestamp, integer, boolean, jsonb, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  country: text("country").default("Bangladesh"),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  isVerified: boolean("is_verified").default(true),
  biometricEnabled: boolean("biometric_enabled").default(false),
  role: text("role").default("applicant"), // applicant | agent | admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  applicationNumber: text("application_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  country: text("country").notNull(),
  visaType: text("visa_type").notNull(),
  status: text("status").notNull().default("under_review"),
  progressPct: integer("progress_pct").notNull().default(25),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  feeAmount: integer("fee_amount").default(1250),
  paymentStatus: text("payment_status").default("paid"),
  currentStep: integer("current_step").default(10),
  details: jsonb("details").$type<Record<string, any>>(),
  nextAction: text("next_action").default("Consular verification in progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  applicationId: integer("application_id").references(() => applications.id),
  docType: text("doc_type").notNull(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").default("0 KB"),
  fileUrl: text("file_url"),
  fileData: text("file_data"), // base64 payload (<= 6MB)
  mimeType: text("mime_type"),
  status: text("status").notNull().default("under_review"),
  rejectionReason: text("rejection_reason"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  country: text("country").notNull(),
  flag: text("flag").notNull(),
  location: text("location").notNull(),
  salary: text("salary").notNull(),
  experience: text("experience").notNull(),
  jobType: text("job_type").notNull(),
  category: text("category").notNull(),
  vacancies: integer("vacancies").default(5),
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<string[]>(),
  benefits: jsonb("benefits").$type<string[]>(),
  isFeatured: boolean("is_featured").default(false),
  imageUrl: text("image_url"),
  deadline: text("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  resumeName: text("resume_name"),
  experienceYears: text("experience_years"),
  coverNote: text("cover_note"),
  status: text("status").default("submitted"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sender: text("sender").notNull(),
  senderName: text("sender_name").default("Assistant"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiAgentTasks = pgTable("ai_agent_tasks", {
  id: serial("id").primaryKey(),
  taskType: text("task_type").notNull(),
  country: text("country").notNull(),
  targetUrl: text("target_url"),
  provider: text("provider").notNull().default("browserbase"),
  status: text("status").notNull().default("completed"),
  prompt: text("prompt").notNull(),
  result: jsonb("result"),
  logs: jsonb("logs").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id"),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(), // applicant | agent | admin | ai
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
