import { createClient } from "@/lib/supabase/server";
import {
  mockLeads, mockDeals, mockAppointments, mockJobs, mockCustomers,
  mockInvoices, mockDocuments, mockMedia, mockTechnicians,
  mockLocalities, mockProfiles, mockServiceCatalog, mockActivityLog,
} from "./mock";

class QueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryError";
  }
}

function throwIfError(error: { message: string; code?: string } | null, context: string): void {
  if (!error) return;
  console.error(`[DB ${context}]`, error.message, error.code);
  throw new QueryError(`Failed to load ${context}. Please try again.`);
}

// ---- Snake-to-camel helpers ----
function sc(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function mapKeys<T>(obj: Record<string, any>, overrides?: Record<string, string>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = overrides?.[k] ?? sc(k);
    out[key] = v;
  }
  return out as T;
}

// ---- Mock-compatible types (camelCase, matching components) ----
export type LeadRow = {
  id: string; channel: string; source: string | null; segment: string;
  name: string | null; phone: string | null; message: string | null;
  urgent: boolean | null; localityId: string | null; status: string | null;
  aiDisclosed: boolean | null; customerId: string | null;
  assignedTo: string | null; slaDueAt: Date | null; lostReason: string | null;
  createdAt: Date; updatedAt: Date;
  locality?: string;
};

export type DealRow = {
  id: string; customerId: string | null; leadId: string | null;
  title: string; stage: string; value: string | null;
  localityId: string | null; ownerId: string | null;
  gstRequired: boolean | null; lastActivityAt: Date | null;
  lostReason: string | null; createdAt: Date; updatedAt: Date;
  customerName: string; locality?: string;
};

export type AppointmentRow = {
  id: string; jobId: string | null; customerId: string;
  siteId: string | null; technicianId: string | null;
  localityId: string | null; serviceName: string | null;
  startAt: Date; endAt: Date; status: string;
  notes: string | null; createdAt: Date; updatedAt: Date;
  customerName: string; locality?: string; technicianName?: string;
};

export type JobRow = {
  id: string; customerId: string; siteId: string | null;
  leadId: string | null; technicianId: string | null;
  status: string; scheduledAt: Date | null;
  summary: string | null; warrantyUntil: string | null;
  createdAt: Date; updatedAt: Date;
  customerName: string; locality?: string;
  technicianName: string; serviceName?: string; siteAddress?: string;
};

export type CustomerRow = {
  id: string; segment: "b2c" | "b2b"; name: string;
  phone: string | null; email: string | null;
  localityId: string | null; gstRequired: boolean;
  gstin: string | null; notes: string | null;
  deletedAt: Date | null; createdAt: Date; updatedAt: Date;
  locality?: string;
  jobCount?: number; lastJob?: string; totalRevenue?: number;
  sites?: { id: string; label: string | null; address: string | null; localityId?: string | null }[];
  jobs?: { id: string; status: string; summary: string | null; scheduledAt: Date | null; serviceName?: string }[];
  invoices?: { id: string; number: string | null; status: string; total: string | null; issuedAt: Date | null }[];
};

export type LineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoiceRow = {
  id: string; customerId: string; jobId: string | null;
  number: string | null; type: string; status: string;
  items: LineItem[] | null;
  subtotal: string | null; gstApplicable: boolean | null;
  gstRate: string | null; gstAmount: string | null;
  total: string | null; issuedAt: Date | null;
  dueAt: Date | null; notes: string | null; terms: string | null;
  validityDays: number | null;
  pdfPath: string | null;
  createdAt: Date; updatedAt: Date;
  customerName?: string;
};

export type DocumentRow = {
  id: string; customerId: string | null; jobId: string | null;
  type: string; name: string; storagePath: string;
  createdBy: string | null; createdAt: Date; updatedAt: Date;
  customerName?: string;
};

// ---- Raw row type (snake_case from Supabase) ----
type Raw = Record<string, any>;

const dateFields = new Set(["created_at", "updated_at", "start_at", "end_at", "scheduled_at", "sla_due_at", "issued_at", "due_at", "warranty_until", "last_activity_at", "deleted_at"]);

function transformRow<T>(row: Raw, camelOverrides?: Record<string, string>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = camelOverrides?.[k] ?? sc(k);
    if (dateFields.has(k) && v !== null && typeof v === "string") {
      out[key] = new Date(v);
    } else {
      out[key] = v;
    }
  }
  return out as T;
}

// ---- Leads ----
export async function fetchLeads(): Promise<LeadRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("leads")
      .select("*, localities!leads_locality_id_fkey(name)")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return mockLeads as unknown as LeadRow[];
    return data.map((r: any) => {
      const row = transformRow<LeadRow>(r, { customer_name: "customerName" });
      row.locality = r.localities?.name ?? null;
      return row;
    });
  } catch { return mockLeads as unknown as LeadRow[]; }
}

// ---- Deals ----
export async function fetchDeals(): Promise<DealRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("deals")
      .select("*, customers!deals_customer_id_fkey(name), localities!deals_locality_id_fkey(name)")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return mockDeals as unknown as DealRow[];
    return data.map((r: any) => {
      const row = transformRow<DealRow>(r, { customer_name: "customerName" });
      row.customerName = r.customers?.name ?? "Unknown";
      row.locality = r.localities?.name ?? null;
      return row;
    });
  } catch { return mockDeals as unknown as DealRow[]; }
}

// ---- Appointments ----
export async function fetchAppointments(): Promise<AppointmentRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("appointments")
      .select("*, customers!appointments_customer_id_fkey(name), localities!appointments_locality_id_fkey(name), profiles!appointments_technician_id_fkey(full_name)")
      .order("start_at", { ascending: true });
    if (error || !data || data.length === 0) return mockAppointments as unknown as AppointmentRow[];
    return data.map((r: any) => {
      const row = transformRow<AppointmentRow>(r);
      row.customerName = r.customers?.name ?? "Unknown";
      row.locality = r.localities?.name ?? null;
      row.technicianName = r.profiles?.full_name ?? null;
      return row;
    });
  } catch { return mockAppointments as unknown as AppointmentRow[]; }
}

// ---- Jobs ----
export async function fetchJobs(): Promise<JobRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("jobs")
      .select("*, customers!jobs_customer_id_fkey(name), profiles!jobs_technician_id_fkey(full_name), sites!jobs_site_id_fkey(address)")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return mockJobs as unknown as JobRow[];
    return data.map((r: any) => {
      const row = transformRow<JobRow>(r);
      row.customerName = r.customers?.name ?? "Unknown";
      row.technicianName = r.profiles?.full_name ?? null;
      row.siteAddress = r.sites?.address ?? null;
      return row;
    });
  } catch { return mockJobs as unknown as JobRow[]; }
}

// ---- Customers ----
export async function fetchCustomers(): Promise<CustomerRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("customers")
      .select("*, localities!customers_locality_id_fkey(name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return mockCustomers;

    const enriched = await Promise.all(
      data.map(async (c: any) => {
      const [jobsRes, invoicesRes, sitesRes] = await Promise.all([
        sb.from("jobs").select("id, status, summary").eq("customer_id", c.id),
        sb.from("invoices").select("total").eq("customer_id", c.id),
        sb.from("sites").select("id, label, address, locality_id").eq("customer_id", c.id),
      ]);
      const jobs = jobsRes.data ?? [];
      const invoices = invoicesRes.data ?? [];
      const lastJob = jobs.length > 0 ? jobs[0].summary ?? jobs[0].id : null;
      const totalRevenue = invoices.reduce((sum: number, i: any) => sum + Number(i.total ?? 0), 0);
      const row = transformRow<CustomerRow>(c);
      row.locality = c.localities?.name ?? null;
      row.jobCount = jobs.length;
      row.lastJob = lastJob;
      row.totalRevenue = totalRevenue;
      row.sites = (sitesRes.data ?? []).map((s: any) => ({
        id: s.id as string,
        label: s.label as string | null,
        address: s.address as string | null,
        localityId: s.locality_id as string | null,
      }));
      return row;
    })
  );
  return enriched;
  } catch { return mockCustomers as unknown as CustomerRow[]; }
}

export async function fetchCustomerById(id: string): Promise<CustomerRow | null> {
  try {
    const sb = await createClient();
    const { data: c, error } = await sb
      .from("customers")
      .select("*, localities!customers_locality_id_fkey(name)")
      .eq("id", id)
      .single();
  if (error || !c) {
    const fallback = mockCustomers.find((mc) => mc.id === id);
    return fallback ?? null;
  }

  const [jobsRes, invoicesRes, sitesRes] = await Promise.all([
    sb.from("jobs").select("id, status, summary, scheduled_at").eq("customer_id", c.id).order("created_at", { ascending: false }),
    sb.from("invoices").select("id, number, status, total, issued_at").eq("customer_id", c.id).order("created_at", { ascending: false }),
    sb.from("sites").select("id, label, address, locality_id").eq("customer_id", c.id),
  ]);
  const jobs = jobsRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const lastJob = jobs.length > 0 ? jobs[0].summary ?? null : null;
  const totalRevenue = invoices.reduce((sum: number, i: any) => sum + Number(i.total ?? 0), 0);
  const row = transformRow<CustomerRow>(c);
  row.locality = c.localities?.name ?? null;
  row.jobCount = jobs.length;
  row.lastJob = lastJob;
  row.totalRevenue = totalRevenue;
  row.sites = (sitesRes.data ?? []).map((s: any) => ({
    id: s.id as string,
    label: s.label as string | null,
    address: s.address as string | null,
    localityId: s.locality_id as string | null,
  }));
  row.jobs = jobs.map((j: any) => ({
    id: j.id as string,
    status: j.status as string,
    summary: j.summary as string | null,
    scheduledAt: j.scheduled_at ? new Date(j.scheduled_at) : null,
  }));
  row.invoices = invoices.map((i: any) => ({
    id: i.id as string,
    number: i.number as string | null,
    status: i.status as string,
    total: i.total as string | null,
    issuedAt: i.issued_at ? new Date(i.issued_at) : null,
  }));
  return row;
  } catch {
    const fallback = mockCustomers.find((mc) => mc.id === id);
    return fallback ?? null;
  }
}

// ---- Invoices ----
export async function fetchInvoices(): Promise<InvoiceRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("invoices")
      .select("*, customers!invoices_customer_id_fkey(name)")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return mockInvoices as unknown as InvoiceRow[];
    return data.map((r: any) => {
      const row = transformRow<InvoiceRow>(r);
      row.customerName = r.customers?.name ?? "Unknown";
      return row;
    });
  } catch { return mockInvoices as unknown as InvoiceRow[]; }
}

// ---- Documents ----
export async function fetchDocuments(): Promise<DocumentRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("documents")
      .select("*, customers!documents_customer_id_fkey(name)")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return mockDocuments as unknown as DocumentRow[];
    return data.map((r: any) => {
      const row = transformRow<DocumentRow>(r);
      row.customerName = r.customers?.name ?? undefined;
      return row;
    });
  } catch { return mockDocuments as unknown as DocumentRow[]; }
}

// ---- Media ----
export type MediaRow = {
  id: string; customerId: string | null; jobId: string | null;
  category: string | null; storagePath: string | null;
  createdBy: string | null; createdAt: Date; updatedAt: Date;
  customerName?: string;
};

export async function fetchMedia(): Promise<MediaRow[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("media")
      .select("*, customers!media_customer_id_fkey(name)")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return mockMedia as unknown as MediaRow[];
    return data.map((r: any) => {
      const row = transformRow<MediaRow>(r);
      row.customerName = r.customers?.name ?? undefined;
      return row;
    });
  } catch { return mockMedia as unknown as MediaRow[]; }
}

// ---- Localities ----
export async function fetchLocalities() {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("localities").select("*").eq("active", true).order("name");
    if (error || !data || data.length === 0) return mockLocalities;
    return data;
  } catch { return mockLocalities; }
}

// ---- Technicians ----
export async function fetchTechnicians() {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("profiles").select("id, full_name").eq("active", true).order("full_name");
    if (error || !data || data.length === 0) return mockTechnicians;
    return data.map((p: any) => ({ id: p.id as string, fullName: p.full_name as string }));
  } catch { return mockTechnicians; }
}

// ---- Dashboard KPIs ----
export async function fetchDashboardKPIs() {
  const mockDashboard = {
    newLeads: mockLeads.filter((l) => l.status === "new").map((l) => ({
      id: l.id, name: l.name, message: l.message, status: l.status,
      createdAt: l.createdAt, channel: l.channel,
    })),
    activeJobs: mockJobs.filter((j) => ["scheduled", "in_progress", "dispatched"].includes(j.status)),
    completedJobs: mockJobs.filter((j) => j.status === "completed"),
    paidInvoices: mockInvoices.filter((i) => i.status === "paid"),
    overdueInvoices: mockInvoices.filter((i) => i.status === "overdue"),
    totalRevenue: mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total ?? 0), 0),
    completionRate: Math.round((mockJobs.filter((j) => j.status === "completed").length / mockJobs.length) * 100),
    totalCustomers: mockCustomers.length,
    recentLeads: mockLeads.slice(0, 5).map((l) => ({
      id: l.id, name: l.name, message: l.message, status: l.status,
      createdAt: l.createdAt, channel: l.channel,
    })),
    upcoming: mockAppointments.filter((a) => a.status === "scheduled").slice(0, 4).map((a) => ({
      id: a.id, customerName: a.customerName, serviceName: a.serviceName,
      startAt: a.startAt, locality: a.locality, technicianName: a.technicianName,
    })),
    leadCount: mockLeads.length,
  };

  try {
    const sb = await createClient();
    const [leadsRes, jobsRes, invoicesRes, customersRes, appointmentsRes] = await Promise.all([
      sb.from("leads").select("id, status, created_at, sla_due_at"),
      sb.from("jobs").select("id, status, scheduled_at"),
      sb.from("invoices").select("id, status, total"),
      sb.from("customers").select("id").is("deleted_at", null),
      sb.from("appointments")
        .select("id, customer_id, service_name, start_at, end_at, status, locality_id, customers(name), localities(name), profiles(full_name)")
        .eq("status", "scheduled")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(4),
    ]);

    const errors: string[] = [];
    if (leadsRes.error) errors.push("leads");
    if (jobsRes.error) errors.push("jobs");
    if (invoicesRes.error) errors.push("invoices");
    if (customersRes.error) errors.push("customers");
    if (appointmentsRes.error) errors.push("appointments");
    if (errors.length > 0) {
      console.error("[Dashboard KPIs] Failed to fetch:", errors.join(", "));
    }

    const leads = leadsRes.data ?? [];
    const jobs = jobsRes.data ?? [];
    const invoices = invoicesRes.data ?? [];
    const customers = customersRes.data ?? [];
    if (leads.length === 0 && jobs.length === 0 && invoices.length === 0) return mockDashboard;

  const newLeads = leads.filter((l: any) => l.status === "new");
  const activeJobs = jobs.filter((j: any) => ["scheduled", "in_progress", "dispatched"].includes(j.status));
  const completedJobs = jobs.filter((j: any) => j.status === "completed");
  const paidInvoices = invoices.filter((i: any) => i.status === "paid");
  const overdueInvoices = invoices.filter((i: any) => i.status === "overdue");
  const totalRevenue = paidInvoices.reduce((sum: number, i: any) => sum + Number(i.total ?? 0), 0);
  const completionRate = jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0;

  const recentLeads = leads
    .filter((l: any) => l.created_at)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((l: any) => ({
      id: l.id,
      name: null as string | null,
      message: null as string | null,
      status: l.status as string | null,
      createdAt: new Date(l.created_at),
      channel: "webform" as string,
    }));

  const upcoming = (appointmentsRes.data ?? []).map((a: any) => ({
    id: a.id,
    customerName: a.customers?.name ?? "Unknown",
    serviceName: a.service_name,
    startAt: new Date(a.start_at),
    locality: a.localities?.name ?? null,
    technicianName: a.profiles?.full_name ?? null,
  }));

  return {
    newLeads, activeJobs, completedJobs, paidInvoices, overdueInvoices,
    totalRevenue, completionRate, totalCustomers: customers.length,
    recentLeads, upcoming,
    leadCount: leads.length,
  };
  } catch { return mockDashboard; }
}

// ---- Mutations ----
export async function updateLeadStatus(id: string, status: string, lostReason?: string) {
  try {
    const sb = await createClient();
    const update: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (lostReason) update.lost_reason = lostReason;
    const { error } = await sb.from("leads").update(update).eq("id", id);
    throwIfError(error, "update lead");
  } catch {
    // mock fallback — no real DB
  }
}

export async function updateDealStage(id: string, stage: string) {
  try {
    const sb = await createClient();
    const { error } = await sb.from("deals").update({
      stage, last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("id", id);
    throwIfError(error, "update deal");
  } catch {
    // mock fallback — no real DB
  }
}

export async function createAppointment(appt: {
  customer_id: string; technician_id: string; locality_id?: string | null;
  service_name: string; start_at: string; end_at: string;
  site_id?: string | null; job_id?: string | null; notes?: string | null;
}) {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("appointments").insert({
      ...appt, status: "scheduled",
    }).select().single();
    throwIfError(error, "create appointment");
    return data;
  } catch {
    // mock fallback — return a synthetic record
    return { id: `mock-${Date.now()}`, ...appt, status: "scheduled", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const sb = await createClient();
    const { error } = await sb.from("appointments").update({
      status, updated_at: new Date().toISOString(),
    }).eq("id", id);
    throwIfError(error, "update appointment");
  } catch {
    // mock fallback
  }
}

export async function updateJobStatus(id: string, status: string) {
  try {
    const sb = await createClient();
    const { error } = await sb.from("jobs").update({
      status, updated_at: new Date().toISOString(),
    }).eq("id", id);
    throwIfError(error, "update job");
  } catch {
    // mock fallback — no real DB
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  try {
    const sb = await createClient();
    const update: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (status === "paid") update.paid_at = new Date().toISOString();
    const { error } = await sb.from("invoices").update(update).eq("id", id);
    throwIfError(error, "update invoice");
  } catch {
    // mock fallback — no real DB
  }
}

// ---- Invoices: CRUD ----
export async function fetchInvoiceById(id: string): Promise<InvoiceRow | null> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("invoices")
      .select("*, customers!invoices_customer_id_fkey(name)")
      .eq("id", id)
      .single();
    if (error || !data) {
      const fallback = mockInvoices.find((inv) => inv.id === id);
      return fallback ? { ...fallback, type: "invoice", notes: null, terms: null, validityDays: null } as InvoiceRow : null;
    }
    const row = transformRow<InvoiceRow>(data);
    row.customerName = data.customers?.name ?? "Unknown";
    return row;
  } catch {
    const fallback = mockInvoices.find((inv) => inv.id === id);
    return fallback ? { ...fallback, type: "invoice", notes: null, terms: null, validityDays: null } as InvoiceRow : null;
  }
}

export async function createInvoice(data: {
  customer_id: string; job_id?: string | null; type?: string;
  items?: LineItem[]; subtotal?: number; gst_applicable?: boolean;
  gst_rate?: number; gst_amount?: number; total?: number;
  issued_at?: string | null; due_at?: string | null;
  notes?: string | null; terms?: string | null; validity_days?: number | null;
  status?: string;
}) {
  try {
    const sb = await createClient();
    const now = new Date().toISOString();
    const countRes = await sb.from("invoices").select("id", { count: "exact", head: true });
    const count = (countRes.count ?? 0) + 1;
    const prefix = data.type === "quotation" ? "QT" : "BRZ";
    const year = new Date().getFullYear();
    const number = `${prefix}-${year}-${String(count).padStart(3, "0")}`;
    const insert: Record<string, any> = {
      customer_id: data.customer_id,
      job_id: data.job_id ?? null,
      type: data.type ?? "invoice",
      number,
      status: data.status ?? "draft",
      items: data.items ?? null,
      subtotal: data.subtotal ?? null,
      gst_applicable: data.gst_applicable ?? false,
      gst_rate: data.gst_rate ?? null,
      gst_amount: data.gst_amount ?? null,
      total: data.total ?? null,
      issued_at: data.issued_at ?? null,
      due_at: data.due_at ?? null,
      notes: data.notes ?? null,
      terms: data.terms ?? null,
      validity_days: data.validity_days ?? null,
      created_at: now,
      updated_at: now,
    };
    const { data: created, error } = await sb.from("invoices").insert(insert).select().single();
    throwIfError(error, "create invoice");
    return created;
  } catch {
    const number = nextInvoiceNumber(data.type ?? "invoice");
    const now = new Date();
    const created = {
      id: `mock-${Date.now()}`,
      customer_id: data.customer_id,
      job_id: data.job_id ?? null,
      type: data.type ?? "invoice",
      number,
      status: data.status ?? "draft",
      items: data.items ?? null,
      subtotal: data.subtotal ?? null,
      gst_applicable: data.gst_applicable ?? false,
      gst_rate: data.gst_rate ?? null,
      gst_amount: data.gst_amount ?? null,
      total: data.total ?? null,
      issued_at: data.issued_at ? new Date(data.issued_at) : null,
      due_at: data.due_at ? new Date(data.due_at) : null,
      notes: data.notes ?? null,
      terms: data.terms ?? null,
      validity_days: data.validity_days ?? null,
      created_at: now,
      updated_at: now,
    };
    return created;
  }
}

export async function updateInvoice(id: string, data: {
  customer_id?: string; job_id?: string | null; type?: string;
  items?: LineItem[]; subtotal?: number; gst_applicable?: boolean;
  gst_rate?: number | null; gst_amount?: number | null; total?: number;
  issued_at?: string | null; due_at?: string | null;
  notes?: string | null; terms?: string | null; validity_days?: number | null;
  status?: string;
}) {
  try {
    const sb = await createClient();
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (data.customer_id !== undefined) update.customer_id = data.customer_id;
    if (data.job_id !== undefined) update.job_id = data.job_id;
    if (data.type !== undefined) update.type = data.type;
    if (data.items !== undefined) update.items = data.items;
    if (data.subtotal !== undefined) update.subtotal = data.subtotal;
    if (data.gst_applicable !== undefined) update.gst_applicable = data.gst_applicable;
    if (data.gst_rate !== undefined) update.gst_rate = data.gst_rate;
    if (data.gst_amount !== undefined) update.gst_amount = data.gst_amount;
    if (data.total !== undefined) update.total = data.total;
    if (data.issued_at !== undefined) update.issued_at = data.issued_at;
    if (data.due_at !== undefined) update.due_at = data.due_at;
    if (data.notes !== undefined) update.notes = data.notes;
    if (data.terms !== undefined) update.terms = data.terms;
    if (data.validity_days !== undefined) update.validity_days = data.validity_days;
    if (data.status !== undefined) update.status = data.status;
    const { error } = await sb.from("invoices").update(update).eq("id", id);
    throwIfError(error, "update invoice");
  } catch {
    // mock fallback — no real DB
  }
}

export async function deleteInvoice(id: string) {
  try {
    const sb = await createClient();
    const { error } = await sb.from("invoices").delete().eq("id", id);
    throwIfError(error, "delete invoice");
  } catch {
    // mock fallback — no real DB
  }
}

// ---- Invoice number generation (for mock mode) ----
let mockInvoiceCounter = 1;
export function nextInvoiceNumber(type: string): string {
  const year = new Date().getFullYear();
  const prefix = type === "quotation" ? "QT" : "BRZ";
  return `${prefix}-${year}-${String(mockInvoiceCounter++).padStart(3, "0")}`;
}

// ---- Settings: Profiles ----
export async function fetchProfiles() {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("profiles").select("id, full_name, role, active").order("full_name");
    if (error || !data || data.length === 0) return mockProfiles;
    return data.map((p: any) => ({
      id: p.id as string,
      name: (p.full_name ?? "Unnamed") as string,
      role: p.role as string,
      active: p.active as boolean,
    }));
  } catch { return mockProfiles; }
}

// ---- Settings: Service Catalog ----
export async function fetchServiceCatalog() {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("service_catalog").select("*").order("name");
    if (error || !data || data.length === 0) return mockServiceCatalog;
    return data.map((r: any) => ({
      id: r.id as string,
      name: r.name as string,
      segment: r.segment as string,
      price: Number(r.price ?? 0),
      cost: Number(r.cost ?? 0),
      active: r.active as boolean,
    }));
  } catch { return mockServiceCatalog; }
}

// ---- Settings: Activity Log ----
export async function fetchActivityLog() {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("activity_log")
      .select("id, action, entity, created_at, profiles!activity_log_actor_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error || !data || data.length === 0) return mockActivityLog;
    return data.map((r: any) => ({
      id: String(r.id),
      actor: r.profiles?.full_name ?? "System",
      action: r.action as string,
      entity: r.entity as string,
      time: r.created_at as string,
    }));
  } catch { return mockActivityLog; }
}

// ---- Settings: All Localities (including inactive) ----
export async function fetchAllLocalities() {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("localities").select("*").order("name");
    if (error || !data || data.length === 0) return mockLocalities;
    return data.map((l: any) => ({
      id: l.id as string,
      name: l.name as string,
      active: l.active as boolean,
    }));
  } catch { return mockLocalities; }
}

// ---- Settings Mutations ----
export async function updateCatalogItem(id: string, price: number, cost: number) {
  try {
    const sb = await createClient();
    const { error } = await sb.from("service_catalog").update({
      price, cost, updated_at: new Date().toISOString(),
    }).eq("id", id);
    throwIfError(error, "update catalog item");
  } catch {
    // mock fallback — no real DB
  }
}

export async function addLocality(name: string) {
  try {
    const sb = await createClient();
    const { error } = await sb.from("localities").insert({ name, active: true });
    throwIfError(error, "add locality");
  } catch {
    // mock fallback — no real DB
  }
}
