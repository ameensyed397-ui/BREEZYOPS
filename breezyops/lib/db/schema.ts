import {
  pgTable, pgEnum, uuid, text, boolean, timestamp, numeric, date, jsonb, bigint,
} from "drizzle-orm/pg-core";

// ---- Enums ----
export const userRole = pgEnum("user_role", ["admin", "ops", "technician", "b2b_manager", "finance", "viewer"]);
export const segment = pgEnum("segment", ["b2c", "b2b"]);
export const leadChannel = pgEnum("lead_channel", ["voice", "whatsapp", "webchat", "webform", "referral", "walkin"]);
export const leadStatus = pgEnum("lead_status", ["new", "qualified", "booked", "completed", "paid", "retained", "lost"]);
export const dealStage = pgEnum("deal_stage", ["new", "qualified", "survey", "proposal", "negotiation", "won", "lost"]);
export const jobStatus = pgEnum("job_status", ["scheduled", "dispatched", "in_progress", "completed", "cancelled"]);
export const invoiceStatus = pgEnum("invoice_status", ["draft", "sent", "paid", "overdue", "void"]);
export const mediaCategory = pgEnum("media_category", ["before", "after", "issue", "other"]);

const base = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

export const localities = pgTable("localities", {
  ...base,
  name: text("name").notNull(),
  active: boolean("active").default(true),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  role: userRole("role").notNull().default("viewer"),
  phone: text("phone"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const customers = pgTable("customers", {
  ...base,
  segment: segment("segment").notNull().default("b2c"),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  localityId: uuid("locality_id").references(() => localities.id),
  gstRequired: boolean("gst_required").default(false),
  gstin: text("gstin"),
  notes: text("notes"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const sites = pgTable("sites", {
  ...base,
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  label: text("label"),
  address: text("address"),
  localityId: uuid("locality_id").references(() => localities.id),
});

export const leads = pgTable("leads", {
  ...base,
  channel: leadChannel("channel").notNull(),
  source: text("source"),
  segment: segment("segment").default("b2c"),
  name: text("name"),
  phone: text("phone"),
  message: text("message"),
  urgent: boolean("urgent").default(false),
  localityId: uuid("locality_id").references(() => localities.id),
  status: leadStatus("status").default("new"),
  aiDisclosed: boolean("ai_disclosed").default(true),
  customerId: uuid("customer_id").references(() => customers.id),
  assignedTo: uuid("assigned_to").references(() => profiles.id),
  slaDueAt: timestamp("sla_due_at", { withTimezone: true }),
  lostReason: text("lost_reason"),
});

export const deals = pgTable("deals", {
  ...base,
  customerId: uuid("customer_id").references(() => customers.id),
  leadId: uuid("lead_id").references(() => leads.id),
  title: text("title").notNull(),
  stage: dealStage("stage").notNull().default("new"),
  value: numeric("value"),
  localityId: uuid("locality_id").references(() => localities.id),
  ownerId: uuid("owner_id").references(() => profiles.id),
  gstRequired: boolean("gst_required").default(false),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).defaultNow(),
  lostReason: text("lost_reason"),
});

export const serviceCatalog = pgTable("service_catalog", {
  ...base,
  name: text("name").notNull(),
  segment: segment("segment").default("b2c"),
  price: numeric("price"),
  cost: numeric("cost"),
  active: boolean("active").default(true),
});

export const jobs = pgTable("jobs", {
  ...base,
  customerId: uuid("customer_id").references(() => customers.id),
  siteId: uuid("site_id").references(() => sites.id),
  leadId: uuid("lead_id").references(() => leads.id),
  technicianId: uuid("technician_id").references(() => profiles.id),
  status: jobStatus("status").default("scheduled"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  summary: text("summary"),
  warrantyUntil: date("warranty_until"),
});

export const invoices = pgTable("invoices", {
  ...base,
  customerId: uuid("customer_id").references(() => customers.id),
  jobId: uuid("job_id").references(() => jobs.id),
  number: text("number").unique(),
  status: invoiceStatus("status").default("draft"),
  subtotal: numeric("subtotal"),
  gstApplicable: boolean("gst_applicable").default(false),
  gstRate: numeric("gst_rate"),
  gstAmount: numeric("gst_amount"),
  total: numeric("total"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  pdfPath: text("pdf_path"),
});

export const media = pgTable("media", {
  ...base,
  customerId: uuid("customer_id").references(() => customers.id),
  jobId: uuid("job_id").references(() => jobs.id),
  category: mediaCategory("category").default("other"),
  storagePath: text("storage_path"),
  createdBy: uuid("created_by").references(() => profiles.id),
});

export const consents = pgTable("consents", {
  ...base,
  customerId: uuid("customer_id").references(() => customers.id),
  channel: text("channel"),
  optedIn: boolean("opted_in").default(false),
  source: text("source"),
});

export const activityLog = pgTable("activity_log", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  actor: uuid("actor").references(() => profiles.id),
  entity: text("entity"),
  entityId: uuid("entity_id"),
  action: text("action"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type Deal = typeof deals.$inferSelect;
