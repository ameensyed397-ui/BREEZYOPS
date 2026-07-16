import type { Lead, Deal, Appointment, Document } from "./schema";

// ---- Appointment types ----
export type MockTechnician = { id: string; fullName: string };

export const mockTechnicians: MockTechnician[] = [
  { id: "t1", fullName: "Asad Khan" },
  { id: "t2", fullName: "Vikram Patel" },
  { id: "t3", fullName: "Ravi Sharma" },
  { id: "t4", fullName: "Amit Joshi" },
];

export type MockAppointment = Appointment & { customerName: string; locality?: string; technicianName?: string };

function atToday(hour: number, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}
function atDayOffset(days: number, hour: number, minute = 0) {
  const d = atToday(hour, minute);
  d.setDate(d.getDate() + days);
  return d;
}

// Reuses customer records from mockCustomers below (same c1..c8 ids) so
// appointments, jobs, and invoices point at one consistent customer set.
export const mockAppointments: MockAppointment[] = [
  { id: "a1", jobId: "j1", customerId: "c1", siteId: "s1", technicianId: "t1", localityId: "loc1",
    serviceName: "AC gas top-up", startAt: atToday(10, 0), endAt: atToday(11, 0), status: "scheduled",
    notes: null, createdAt: atDayOffset(-2, 9), updatedAt: atDayOffset(-2, 9),
    customerName: "Priya K.", locality: "HSR Layout", technicianName: "Asad Khan" },
  { id: "a2", jobId: "j4", customerId: "c4", siteId: "s6", technicianId: "t1", localityId: "loc4",
    serviceName: "Split AC installation — follow-up check", startAt: atToday(14, 0), endAt: atToday(15, 0), status: "scheduled",
    notes: null, createdAt: atDayOffset(-1, 9), updatedAt: atDayOffset(-1, 9),
    customerName: "Meera N.", locality: "Whitefield", technicianName: "Asad Khan" },
  { id: "a3", jobId: null, customerId: "c8", siteId: "s11", technicianId: "t1", localityId: "loc2",
    serviceName: "Gas top-up recheck", startAt: atToday(16, 30), endAt: atToday(17, 15), status: "scheduled",
    notes: null, createdAt: atDayOffset(-1, 9), updatedAt: atDayOffset(-1, 9),
    customerName: "Divya S.", locality: "Koramangala", technicianName: "Asad Khan" },
  { id: "a4", jobId: "j5", customerId: "c6", siteId: "s9", technicianId: "t1", localityId: "loc5",
    serviceName: "AMC routine visit 4/6", startAt: atDayOffset(1, 9, 0), endAt: atDayOffset(1, 10, 0), status: "scheduled",
    notes: null, createdAt: atDayOffset(-3, 9), updatedAt: atDayOffset(-3, 9),
    customerName: "Karthik R.", locality: "Bellandur", technicianName: "Asad Khan" },
  { id: "a5", jobId: "j3", customerId: "c3", siteId: "s3", technicianId: "t1", localityId: "loc3",
    serviceName: "VRF quarterly maintenance — Floor 1", startAt: atDayOffset(1, 11, 0), endAt: atDayOffset(1, 12, 30), status: "scheduled",
    notes: "GST invoice required.", createdAt: atDayOffset(-5, 9), updatedAt: atDayOffset(-5, 9),
    customerName: "Anish M. (Indiranagar office)", locality: "Indiranagar", technicianName: "Asad Khan" },
  { id: "a6", jobId: "j2", customerId: "c2", siteId: "s2", technicianId: "t1", localityId: "loc2",
    serviceName: "Deep clean", startAt: atDayOffset(-1, 11, 0), endAt: atDayOffset(-1, 12, 0), status: "done",
    notes: null, createdAt: atDayOffset(-2, 9), updatedAt: atDayOffset(-1, 12),
    customerName: "Rahul S.", locality: "Koramangala", technicianName: "Asad Khan" },
];

// ---- Job types ----
export type MockJob = {
  id: string;
  customerId: string;
  siteId: string | null;
  leadId: string | null;
  technicianId: string | null;
  status: "scheduled" | "dispatched" | "in_progress" | "completed" | "cancelled";
  scheduledAt: Date | null;
  summary: string | null;
  warrantyUntil: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
  locality?: string;
  technicianName?: string;
  serviceName?: string;
  siteAddress?: string;
};

export const mockJobs: MockJob[] = [
  { id: "j1", customerId: "c1", siteId: "s1", leadId: "1", technicianId: "t1", status: "completed",
    scheduledAt: new Date(Date.now() - 26 * 24 * 3600000), summary: "AC gas top-up — split AC, outdoor unit cleaning",
    warrantyUntil: "2026-10-26", createdAt: new Date(Date.now() - 27 * 24 * 3600000), updatedAt: new Date(Date.now() - 26 * 24 * 3600000),
    customerName: "Priya K.", locality: "HSR Layout", technicianName: "Asad Khan", serviceName: "AC gas top-up",
    siteAddress: "HSR Layout Sector 2, Block A" },
  { id: "j2", customerId: "c2", siteId: "s2", leadId: "2", technicianId: "t1", status: "completed",
    scheduledAt: new Date(Date.now() - 41 * 24 * 3600000), summary: "Deep clean — 2 ton split AC, anti-bacterial treatment",
    warrantyUntil: null, createdAt: new Date(Date.now() - 42 * 24 * 3600000), updatedAt: new Date(Date.now() - 41 * 24 * 3600000),
    customerName: "Rahul S.", locality: "Koramangala", technicianName: "Asad Khan", serviceName: "Deep clean",
    siteAddress: "Koramangala 4th Block" },
  { id: "j3", customerId: "c3", siteId: "s3", leadId: "3", technicianId: "t1", status: "completed",
    scheduledAt: new Date(Date.now() - 6 * 24 * 3600000), summary: "VRF quarterly maintenance — Floor 1 (Open Office)",
    warrantyUntil: null, createdAt: new Date(Date.now() - 7 * 24 * 3600000), updatedAt: new Date(Date.now() - 6 * 24 * 3600000),
    customerName: "Anish M. (Indiranagar office)", locality: "Indiranagar", technicianName: "Asad Khan",
    serviceName: "VRF quarterly maintenance", siteAddress: "Indiranagar 100ft Road, 2nd Floor" },
  { id: "j4", customerId: "c4", siteId: "s6", leadId: "4", technicianId: "t1", status: "scheduled",
    scheduledAt: new Date(Date.now() + 3 * 24 * 3600000), summary: "Split AC installation — 2 units, new flat",
    warrantyUntil: "2027-07-13", createdAt: new Date(Date.now() - 3 * 24 * 3600000), updatedAt: new Date(Date.now() - 3 * 24 * 3600000),
    customerName: "Meera N.", locality: "Whitefield", technicianName: "Asad Khan", serviceName: "Split AC installation",
    siteAddress: "Whitefield, Prestige Shantiniketan" },
  { id: "j5", customerId: "c6", siteId: "s9", leadId: "5", technicianId: "t1", status: "scheduled",
    scheduledAt: new Date(Date.now() + 1 * 24 * 3600000), summary: "AMC routine service — visit 4/6",
    warrantyUntil: null, createdAt: new Date(Date.now() - 3 * 24 * 3600000), updatedAt: new Date(Date.now() - 3 * 24 * 3600000),
    customerName: "Karthik R.", locality: "Bellandur", technicianName: "Asad Khan", serviceName: "AMC routine service",
    siteAddress: "Bellandur, Lakeview Apartments" },
  { id: "j6", customerId: "c7", siteId: "s10", leadId: null, technicianId: "t1", status: "dispatched",
    scheduledAt: new Date(Date.now()), summary: "Quarterly AMC — Q3 2026, filter replacement, emergency callout cover",
    warrantyUntil: null, createdAt: new Date(Date.now() - 3 * 24 * 3600000), updatedAt: new Date(Date.now() - 1 * 24 * 3600000),
    customerName: "Koramangala Co-work", locality: "Koramangala", technicianName: "Asad Khan", serviceName: "Quarterly AMC",
    siteAddress: "Koramangala 5th Block, 80 Feet Road" },
  { id: "j7", customerId: "c8", siteId: "s11", leadId: "6", technicianId: "t1", status: "completed",
    scheduledAt: new Date(Date.now() - 8 * 24 * 3600000), summary: "Gas top-up — R410A, leak test & vacuum",
    warrantyUntil: null, createdAt: new Date(Date.now() - 9 * 24 * 3600000), updatedAt: new Date(Date.now() - 8 * 24 * 3600000),
    customerName: "Divya S.", locality: "Koramangala", technicianName: "Asad Khan", serviceName: "Gas top-up",
    siteAddress: "Koramangala 1st Block" },
];

// ---- Invoice types ----
export type MockLineItem = { description: string; quantity: number; rate: number; amount: number };

export type MockInvoice = {
  id: string;
  customerId: string;
  jobId: string | null;
  number: string;
  type: "invoice" | "quotation";
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "accepted" | "rejected" | "expired";
  subtotal: string;
  gstApplicable: boolean;
  gstRate: string | null;
  gstAmount: string | null;
  total: string;
  issuedAt: Date | null;
  dueAt: Date | null;
  pdfPath: string | null;
  notes: string | null;
  terms: string | null;
  validityDays: number | null;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
  items?: MockLineItem[];
};

// ---- Customer types ----
export type MockCustomer = {
  id: string;
  segment: "b2c" | "b2b";
  name: string;
  phone: string | null;
  email: string | null;
  localityId: string | null;
  gstRequired: boolean;
  gstin: string | null;
  notes: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  locality?: string;
  jobCount?: number;
  lastJob?: string;
  totalRevenue?: number;
  sites?: { id: string; label: string; address: string; localityId?: string | null }[];
};

export type MockSite = {
  id: string;
  customerId: string;
  label: string | null;
  address: string | null;
  localityId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const mockLeads: (Lead & { locality?: string })[] = [
  { id: "1", channel: "whatsapp", source: "reactivation", segment: "b2c", name: "Priya K.",
    phone: "+91 98765 43210", message: "AC not cooling since morning, HSR Layout Sector 2.",
    urgent: true, localityId: "loc1", status: "new", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: new Date(Date.now() + 20 * 60000), lostReason: null,
    createdAt: new Date(Date.now() - 6 * 60000), updatedAt: new Date(), locality: "HSR Layout" },
  { id: "2", channel: "voice", source: "google", segment: "b2c", name: "Rahul S.",
    phone: "+91 96789 01455", message: "Wants deep clean before guests arrive this weekend.",
    urgent: false, localityId: "loc2", status: "qualified", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: new Date(Date.now() + 24 * 60000), lostReason: null,
    createdAt: new Date(Date.now() - 22 * 60000), updatedAt: new Date(), locality: "Koramangala" },
  { id: "3", channel: "webform", source: "website", segment: "b2b", name: "Anish M. (Indiranagar office)",
    phone: "+91 80456 78901", message: "Quarterly VRF maintenance for 3 floors. Do you provide GST invoice?",
    urgent: false, localityId: "loc3", status: "new", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: null, lostReason: null,
    createdAt: new Date(Date.now() - 90 * 60000), updatedAt: new Date(), locality: "Indiranagar" },
  { id: "4", channel: "whatsapp", source: "referral", segment: "b2c", name: "Meera N.",
    phone: "+91 99876 54120", message: "Split AC installation, 2 units, new flat in Whitefield.",
    urgent: false, localityId: "loc4", status: "booked", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: null, lostReason: null,
    createdAt: new Date(Date.now() - 3 * 24 * 3600000), updatedAt: new Date(), locality: "Whitefield" },
  { id: "5", channel: "voice", source: "google", segment: "b2c", name: "Karthik R.",
    phone: "+91 97654 32330", message: "AMC service visit, routine cleaning.",
    urgent: false, localityId: "loc5", status: "completed", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: null, lostReason: null,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000), updatedAt: new Date(), locality: "Bellandur" },
  { id: "6", channel: "webform", source: "website", segment: "b2c", name: "Divya S.",
    phone: "+91 95321 09882", message: "Gas top-up, quoted ₹1,800.",
    urgent: false, localityId: "loc2", status: "paid", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: null, lostReason: null,
    createdAt: new Date(Date.now() - 8 * 24 * 3600000), updatedAt: new Date(), locality: "Koramangala" },
];

export const mockDeals: (Deal & { customerName: string; locality?: string })[] = [
  { id: "d1", customerId: null, leadId: "3", title: "Anish M. — Indiranagar office VRF AMC",
    stage: "new", value: "180000", localityId: "loc3", ownerId: null, gstRequired: true,
    lastActivityAt: new Date(Date.now() - 90 * 60000), lostReason: null,
    createdAt: new Date(Date.now() - 90 * 60000), updatedAt: new Date(),
    customerName: "Anish M.", locality: "Indiranagar" },
  { id: "d2", customerId: null, leadId: null, title: "Whitefield Tech Park — 4-floor VRF survey",
    stage: "survey", value: "420000", localityId: "loc4", ownerId: null, gstRequired: true,
    lastActivityAt: new Date(Date.now() - 9 * 24 * 3600000), lostReason: null,
    createdAt: new Date(Date.now() - 12 * 24 * 3600000), updatedAt: new Date(),
    customerName: "Whitefield Tech Park", locality: "Whitefield" },
  { id: "d3", customerId: null, leadId: null, title: "Koramangala Co-work — quarterly AMC renewal",
    stage: "proposal", value: "95000", localityId: "loc2", ownerId: null, gstRequired: false,
    lastActivityAt: new Date(Date.now() - 2 * 24 * 3600000), lostReason: null,
    createdAt: new Date(Date.now() - 20 * 24 * 3600000), updatedAt: new Date(),
    customerName: "Koramangala Co-work", locality: "Koramangala" },
  { id: "d4", customerId: null, leadId: null, title: "HSR Business Center — negotiation on 6-unit contract",
    stage: "negotiation", value: "260000", localityId: "loc1", ownerId: null, gstRequired: true,
    lastActivityAt: new Date(Date.now() - 1 * 24 * 3600000), lostReason: null,
    createdAt: new Date(Date.now() - 30 * 24 * 3600000), updatedAt: new Date(),
    customerName: "HSR Business Center", locality: "HSR Layout" },
];

export const mockCustomers: MockCustomer[] = [
  { id: "c1", segment: "b2c", name: "Priya K.", phone: "+91 98765 43210", email: null,
    localityId: "loc1", gstRequired: false, gstin: null, notes: "Repeat customer, HSR Layout.",
    deletedAt: null, createdAt: new Date(Date.now() - 30 * 24 * 3600000), updatedAt: new Date(),
    locality: "HSR Layout", jobCount: 3, lastJob: "AC gas top-up", totalRevenue: 8400,
    sites: [{ id: "s1", label: "Home", address: "HSR Layout Sector 2, Block A", localityId: "loc1" }] },
  { id: "c2", segment: "b2c", name: "Rahul S.", phone: "+91 96789 01455", email: "rahul.s@gmail.com",
    localityId: "loc2", gstRequired: false, gstin: null, notes: null,
    deletedAt: null, createdAt: new Date(Date.now() - 45 * 24 * 3600000), updatedAt: new Date(),
    locality: "Koramangala", jobCount: 1, lastJob: "Deep clean", totalRevenue: 3200,
    sites: [{ id: "s2", label: "Home", address: "Koramangala 4th Block", localityId: "loc2" }] },
  { id: "c3", segment: "b2b", name: "Anish M. (Indiranagar office)", phone: "+91 80456 78901",
    email: "anish@indiranagar-corp.com", localityId: "loc3", gstRequired: true,
    gstin: "29AABCU9603R1ZM", notes: "Quarterly VRF maintenance. 3 floors.",
    deletedAt: null, createdAt: new Date(Date.now() - 90 * 24 * 3600000), updatedAt: new Date(),
    locality: "Indiranagar", jobCount: 4, lastJob: "VRF quarterly AMC", totalRevenue: 72000,
    sites: [
      { id: "s3", label: "Floor 1 — Open Office", address: "Indiranagar 100ft Road, 2nd Floor", localityId: "loc3" },
      { id: "s4", label: "Floor 2 — Conference", address: "Indiranagar 100ft Road, 3rd Floor", localityId: "loc3" },
      { id: "s5", label: "Floor 3 — Server Room", address: "Indiranagar 100ft Road, 4th Floor", localityId: "loc3" },
    ] },
  { id: "c4", segment: "b2c", name: "Meera N.", phone: "+91 99876 54120", email: null,
    localityId: "loc4", gstRequired: false, gstin: null, notes: "New flat, Whitefield. 2 split AC installs.",
    deletedAt: null, createdAt: new Date(Date.now() - 3 * 24 * 3600000), updatedAt: new Date(),
    locality: "Whitefield", jobCount: 2, lastJob: "Split AC installation", totalRevenue: 14000,
    sites: [{ id: "s6", label: "New Flat", address: "Whitefield, Prestige Shantiniketan", localityId: "loc4" }] },
  { id: "c5", segment: "b2b", name: "Whitefield Tech Park", phone: "+91 80123 45500",
    email: "facilities@wtp.in", localityId: "loc4", gstRequired: true,
    gstin: "29AAACW5050R1ZP", notes: "4-floor VRF survey pending. Large potential deal.",
    deletedAt: null, createdAt: new Date(Date.now() - 12 * 24 * 3600000), updatedAt: new Date(),
    locality: "Whitefield", jobCount: 0, lastJob: undefined, totalRevenue: 0,
    sites: [
      { id: "s7", label: "Building A", address: "Whitefield ITPL Main Road", localityId: "loc4" },
      { id: "s8", label: "Building B", address: "Whitefield ITPL Main Road, Block B", localityId: "loc4" },
    ] },
  { id: "c6", segment: "b2c", name: "Karthik R.", phone: "+91 97654 32330", email: null,
    localityId: "loc5", gstRequired: false, gstin: null, notes: "AMC customer, routine visits.",
    deletedAt: null, createdAt: new Date(Date.now() - 60 * 24 * 3600000), updatedAt: new Date(),
    locality: "Bellandur", jobCount: 6, lastJob: "AMC routine service", totalRevenue: 18000,
    sites: [{ id: "s9", label: "Home", address: "Bellandur, Lakeview Apartments", localityId: "loc5" }] },
  { id: "c7", segment: "b2b", name: "Koramangala Co-work", phone: "+91 80987 65777",
    email: "ops@kmcl.co", localityId: "loc2", gstRequired: true,
    gstin: "29AABCK7890R1ZQ", notes: "Quarterly AMC renewal in progress.",
    deletedAt: null, createdAt: new Date(Date.now() - 120 * 24 * 3600000), updatedAt: new Date(),
    locality: "Koramangala", jobCount: 8, lastJob: "Quarterly AMC", totalRevenue: 380000,
    sites: [{ id: "s10", label: "Main Office", address: "Koramangala 5th Block, 80 Feet Road", localityId: "loc2" }] },
  { id: "c8", segment: "b2c", name: "Divya S.", phone: "+91 95321 09882", email: "divya.s@outlook.com",
    localityId: "loc2", gstRequired: false, gstin: null, notes: null,
    deletedAt: null, createdAt: new Date(Date.now() - 8 * 24 * 3600000), updatedAt: new Date(),
    locality: "Koramangala", jobCount: 1, lastJob: "Gas top-up", totalRevenue: 1800,
    sites: [{ id: "s11", label: "Home", address: "Koramangala 1st Block", localityId: "loc2" }] },
];

export const mockInvoices: MockInvoice[] = [
  { id: "inv1", customerId: "c1", jobId: "j1", number: "BRZ-2026-001", type: "invoice", status: "paid",
    subtotal: "2498", gstApplicable: false, gstRate: null, gstAmount: null, total: "2498",
    issuedAt: new Date(Date.now() - 25 * 24 * 3600000), dueAt: new Date(Date.now() - 18 * 24 * 3600000),
    pdfPath: null, notes: null, terms: null, validityDays: null,
    createdAt: new Date(Date.now() - 25 * 24 * 3600000), updatedAt: new Date(Date.now() - 20 * 24 * 3600000),
    customerName: "Priya K.",
    items: [
      { description: "Gas top-up — 1.5 ton", quantity: 1, rate: 1500, amount: 1500 },
      { description: "AC Basic Service", quantity: 1, rate: 499, amount: 499 },
      { description: "Drain pipe cleaning", quantity: 1, rate: 399, amount: 399 },
      { description: "Emergency surcharge", quantity: 1, rate: 299, amount: 299 },
    ] },
  { id: "inv2", customerId: "c2", jobId: "j2", number: "BRZ-2026-002", type: "invoice", status: "paid",
    subtotal: "1598", gstApplicable: false, gstRate: null, gstAmount: null, total: "1598",
    issuedAt: new Date(Date.now() - 40 * 24 * 3600000), dueAt: new Date(Date.now() - 33 * 24 * 3600000),
    pdfPath: null, notes: null, terms: null, validityDays: null,
    createdAt: new Date(Date.now() - 40 * 24 * 3600000), updatedAt: new Date(Date.now() - 35 * 24 * 3600000),
    customerName: "Rahul S.",
    items: [
      { description: "Wet Deep Clean", quantity: 1, rate: 899, amount: 899 },
      { description: "AC Full Service", quantity: 1, rate: 699, amount: 699 },
    ] },
  { id: "inv3", customerId: "c3", jobId: "j3", number: "BRZ-2026-003", type: "invoice", status: "sent",
    subtotal: "60000", gstApplicable: true, gstRate: "18", gstAmount: "10800", total: "70800",
    issuedAt: new Date(Date.now() - 5 * 24 * 3600000), dueAt: new Date(Date.now() + 25 * 24 * 3600000),
    pdfPath: null, notes: "Quarterly VRF maintenance for 3 floors.", terms: "Payment due within 30 days of invoice date.",
    validityDays: null,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000), updatedAt: new Date(Date.now() - 5 * 24 * 3600000),
    customerName: "Anish M. (Indiranagar office)",
    items: [
      { description: "VRF quarterly maintenance — Floor 1", quantity: 1, rate: 20000, amount: 20000 },
      { description: "VRF quarterly maintenance — Floor 2", quantity: 1, rate: 20000, amount: 20000 },
      { description: "VRF quarterly maintenance — Floor 3 (server room)", quantity: 1, rate: 20000, amount: 20000 },
    ] },
  { id: "inv4", customerId: "c4", jobId: "j4", number: "BRZ-2026-004", type: "invoice", status: "overdue",
    subtotal: "4796", gstApplicable: false, gstRate: null, gstAmount: null, total: "4796",
    issuedAt: new Date(Date.now() - 15 * 24 * 3600000), dueAt: new Date(Date.now() - 8 * 24 * 3600000),
    pdfPath: null, notes: null, terms: null, validityDays: null,
    createdAt: new Date(Date.now() - 15 * 24 * 3600000), updatedAt: new Date(Date.now() - 15 * 24 * 3600000),
    customerName: "Meera N.",
    items: [
      { description: "AC Installation — unit 1 (1.5 ton)", quantity: 1, rate: 1499, amount: 1499 },
      { description: "AC Installation — unit 2 (1 ton)", quantity: 1, rate: 1499, amount: 1499 },
      { description: "Copper pipe (per metre)", quantity: 2, rate: 899, amount: 1798 },
    ] },
  { id: "inv5", customerId: "c6", jobId: "j5", number: "BRZ-2026-005", type: "invoice", status: "draft",
    subtotal: "2248", gstApplicable: false, gstRate: null, gstAmount: null, total: "2248",
    issuedAt: null, dueAt: null,
    pdfPath: null, notes: null, terms: null, validityDays: null,
    createdAt: new Date(Date.now() - 1 * 24 * 3600000), updatedAt: new Date(Date.now() - 1 * 24 * 3600000),
    customerName: "Karthik R.",
    items: [
      { description: "AMC — Chill Basic (2 visits/yr) — visit 2/2", quantity: 1, rate: 1499, amount: 1499 },
      { description: "Capacitor replacement", quantity: 1, rate: 749, amount: 749 },
    ] },
  { id: "inv6", customerId: "c7", jobId: "j6", number: "BRZ-2026-006", type: "invoice", status: "sent",
    subtotal: "95000", gstApplicable: true, gstRate: "18", gstAmount: "17100", total: "112100",
    issuedAt: new Date(Date.now() - 3 * 24 * 3600000), dueAt: new Date(Date.now() + 27 * 24 * 3600000),
    pdfPath: null, notes: "Includes filter replacement for 12 AC units.", terms: "Payment due within 30 days. Late fee 2% per month.",
    validityDays: null,
    createdAt: new Date(Date.now() - 3 * 24 * 3600000), updatedAt: new Date(Date.now() - 3 * 24 * 3600000),
    customerName: "Koramangala Co-work",
    items: [
      { description: "Quarterly AMC — Q3 2026", quantity: 1, rate: 75000, amount: 75000 },
      { description: "Filter replacement (12 units)", quantity: 12, rate: 500, amount: 6000 },
      { description: "Emergency callout cover", quantity: 1, rate: 14000, amount: 14000 },
    ] },
  { id: "inv7", customerId: "c8", jobId: "j7", number: "BRZ-2026-007", type: "invoice", status: "paid",
    subtotal: "1898", gstApplicable: false, gstRate: null, gstAmount: null, total: "1898",
    issuedAt: new Date(Date.now() - 7 * 24 * 3600000), dueAt: new Date(Date.now() - 1 * 24 * 3600000),
    pdfPath: null, notes: null, terms: null, validityDays: null,
    createdAt: new Date(Date.now() - 7 * 24 * 3600000), updatedAt: new Date(Date.now() - 2 * 24 * 3600000),
    customerName: "Divya S.",
    items: [
      { description: "Gas top-up — 1 ton", quantity: 1, rate: 1200, amount: 1200 },
      { description: "Inspection Visit", quantity: 1, rate: 350, amount: 350 },
      { description: "Drain pipe cleaning", quantity: 1, rate: 399, amount: 399 },
    ] },
  // ---- Quotations ----
  { id: "qt1", customerId: "c5", jobId: null, number: "QT-2026-001", type: "quotation", status: "sent",
    subtotal: "420000", gstApplicable: true, gstRate: "18", gstAmount: "75600", total: "495600",
    issuedAt: new Date(Date.now() - 9 * 24 * 3600000), dueAt: null,
    pdfPath: null, notes: "4-floor VRF system survey + installation proposal.",
    terms: "This quotation is valid for 30 days from the date of issue. Prices are inclusive of standard installation. Electrical work not included.",
    validityDays: 30,
    createdAt: new Date(Date.now() - 9 * 24 * 3600000), updatedAt: new Date(Date.now() - 9 * 24 * 3600000),
    customerName: "Whitefield Tech Park",
    items: [
      { description: "VRF system — Floor A (12 ton)", quantity: 1, rate: 120000, amount: 120000 },
      { description: "VRF system — Floor B (10 ton)", quantity: 1, rate: 100000, amount: 100000 },
      { description: "VRF system — Floor C (8 ton)", quantity: 1, rate: 85000, amount: 85000 },
      { description: "VRF system — Floor D (8 ton)", quantity: 1, rate: 85000, amount: 85000 },
      { description: "Installation + commissioning", quantity: 4, rate: 7500, amount: 30000 },
    ] },
  { id: "qt2", customerId: "c3", jobId: null, number: "QT-2026-002", type: "quotation", status: "accepted",
    subtotal: "200000", gstApplicable: true, gstRate: "18", gstAmount: "36000", total: "236000",
    issuedAt: new Date(Date.now() - 30 * 24 * 3600000), dueAt: null,
    pdfPath: null, notes: "Annual VRF maintenance contract — 3 floors, 4 quarterly visits.",
    terms: "Valid for 15 days. Includes all labor and standard consumables. Refrigerant charges extra if below optimal levels.",
    validityDays: 15,
    createdAt: new Date(Date.now() - 30 * 24 * 3600000), updatedAt: new Date(Date.now() - 25 * 24 * 3600000),
    customerName: "Anish M. (Indiranagar office)",
    items: [
      { description: "Quarterly VRF maintenance — Floor 1 (4 visits)", quantity: 4, rate: 20000, amount: 80000 },
      { description: "Quarterly VRF maintenance — Floor 2 (4 visits)", quantity: 4, rate: 20000, amount: 80000 },
      { description: "Quarterly VRF maintenance — Floor 3 (4 visits)", quantity: 4, rate: 10000, amount: 40000 },
    ] },
];

// ---- Document types ----
export type MockDocument = Document & { customerName?: string };

export const mockDocuments: MockDocument[] = [
  { id: "doc1", customerId: "c1", jobId: "j1", type: "invoice", name: "BRZ-2026-001_Priya-K.pdf",
    storagePath: "c1/invoices/BRZ-2026-001.pdf", createdBy: null,
    createdAt: new Date(Date.now() - 25 * 24 * 3600000), updatedAt: new Date(Date.now() - 25 * 24 * 3600000),
    customerName: "Priya K." },
  { id: "doc2", customerId: "c3", jobId: "j3", type: "invoice", name: "BRZ-2026-003_Anish-M.pdf",
    storagePath: "c3/invoices/BRZ-2026-003.pdf", createdBy: null,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000), updatedAt: new Date(Date.now() - 5 * 24 * 3600000),
    customerName: "Anish M. (Indiranagar office)" },
  { id: "doc3", customerId: "c3", jobId: null, type: "contract", name: "VRF_AMC_Contract_2026.pdf",
    storagePath: "c3/contracts/VRF_AMC_2026.pdf", createdBy: null,
    createdAt: new Date(Date.now() - 90 * 24 * 3600000), updatedAt: new Date(Date.now() - 90 * 24 * 3600000),
    customerName: "Anish M. (Indiranagar office)" },
  { id: "doc4", customerId: "c7", jobId: null, type: "contract", name: "KMC_Quarterly_AMC_Agreement.pdf",
    storagePath: "c7/contracts/KMC_AMC_Q3.pdf", createdBy: null,
    createdAt: new Date(Date.now() - 120 * 24 * 3600000), updatedAt: new Date(Date.now() - 120 * 24 * 3600000),
    customerName: "Koramangala Co-work" },
  { id: "doc5", customerId: null, jobId: null, type: "sop", name: "SOP_AC_Gas_TopUp_v3.pdf",
    storagePath: "sops/SOP_AC_Gas_TopUp_v3.pdf", createdBy: null,
    createdAt: new Date(Date.now() - 60 * 24 * 3600000), updatedAt: new Date(Date.now() - 30 * 24 * 3600000),
    customerName: undefined },
  { id: "doc6", customerId: null, jobId: null, type: "sop", name: "SOP_Split_AC_Install_v2.pdf",
    storagePath: "sops/SOP_Split_AC_Install_v2.pdf", createdBy: null,
    createdAt: new Date(Date.now() - 45 * 24 * 3600000), updatedAt: new Date(Date.now() - 15 * 24 * 3600000),
    customerName: undefined },
  { id: "doc7", customerId: "c1", jobId: "j1", type: "other", name: "before_AC_unit_c1_j1.jpg",
    storagePath: "c1/photos/j1/before/AC_unit.jpg", createdBy: null,
    createdAt: new Date(Date.now() - 27 * 24 * 3600000), updatedAt: new Date(Date.now() - 27 * 24 * 3600000),
    customerName: "Priya K." },
  { id: "doc8", customerId: "c1", jobId: "j1", type: "other", name: "after_AC_unit_c1_j1.jpg",
    storagePath: "c1/photos/j1/after/AC_unit.jpg", createdBy: null,
    createdAt: new Date(Date.now() - 26 * 24 * 3600000), updatedAt: new Date(Date.now() - 26 * 24 * 3600000),
    customerName: "Priya K." },
];

// ---- Media types ----
export type MockMedia = {
  id: string;
  customerId: string | null;
  jobId: string | null;
  category: "before" | "after" | "issue" | "other";
  storagePath: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
};

export const mockMedia: MockMedia[] = [
  { id: "m1", customerId: "c1", jobId: "j1", category: "before", storagePath: "c1/photos/j1/before/outdoor_unit.jpg",
    createdBy: null, createdAt: new Date(Date.now() - 27 * 24 * 3600000), updatedAt: new Date(Date.now() - 27 * 24 * 3600000),
    customerName: "Priya K." },
  { id: "m2", customerId: "c1", jobId: "j1", category: "after", storagePath: "c1/photos/j1/after/outdoor_unit.jpg",
    createdBy: null, createdAt: new Date(Date.now() - 26 * 24 * 3600000), updatedAt: new Date(Date.now() - 26 * 24 * 3600000),
    customerName: "Priya K." },
  { id: "m3", customerId: "c2", jobId: "j2", category: "before", storagePath: "c2/photos/j2/before/indoor_unit.jpg",
    createdBy: null, createdAt: new Date(Date.now() - 42 * 24 * 3600000), updatedAt: new Date(Date.now() - 42 * 24 * 3600000),
    customerName: "Rahul S." },
  { id: "m4", customerId: "c2", jobId: "j2", category: "after", storagePath: "c2/photos/j2/after/indoor_unit.jpg",
    createdBy: null, createdAt: new Date(Date.now() - 41 * 24 * 3600000), updatedAt: new Date(Date.now() - 41 * 24 * 3600000),
    customerName: "Rahul S." },
  { id: "m5", customerId: "c2", jobId: "j2", category: "issue", storagePath: "c2/photos/j2/issue/mold_buildup.jpg",
    createdBy: null, createdAt: new Date(Date.now() - 42 * 24 * 3600000), updatedAt: new Date(Date.now() - 42 * 24 * 3600000),
    customerName: "Rahul S." },
  { id: "m6", customerId: "c3", jobId: "j3", category: "before", storagePath: "c3/photos/j3/before/vrf_outdoor.jpg",
    createdBy: null, createdAt: new Date(Date.now() - 7 * 24 * 3600000), updatedAt: new Date(Date.now() - 7 * 24 * 3600000),
    customerName: "Anish M. (Indiranagar office)" },
];

// ---- Localities ----
export const mockLocalities = [
  { id: "loc1", name: "HSR Layout", active: true },
  { id: "loc2", name: "Koramangala", active: true },
  { id: "loc3", name: "Indiranagar", active: true },
  { id: "loc4", name: "Whitefield", active: true },
  { id: "loc5", name: "Bellandur", active: true },
];

// ---- Profiles ----
export const mockProfiles = [
  { id: "t1", name: "Asad Khan", role: "admin", active: true },
  { id: "t2", name: "Vikram Patel", role: "technician", active: true },
  { id: "t3", name: "Ravi Sharma", role: "technician", active: true },
  { id: "t4", name: "Amit Joshi", role: "b2b_manager", active: true },
];

// ---- Service Catalog ----
export const mockServiceCatalog = [
  { id: "sc1", name: "AC gas top-up", segment: "b2c", price: 1800, cost: 600, active: true },
  { id: "sc2", name: "Deep clean", segment: "b2c", price: 3200, cost: 1100, active: true },
  { id: "sc3", name: "Split AC installation", segment: "b2c", price: 7000, cost: 2800, active: true },
  { id: "sc4", name: "AMC routine service", segment: "b2c", price: 3000, cost: 1000, active: true },
  { id: "sc5", name: "VRF quarterly maintenance", segment: "b2b", price: 18000, cost: 6000, active: true },
  { id: "sc6", name: "Gas top-up — R410A", segment: "b2c", price: 1800, cost: 700, active: true },
];

// ---- Activity Log ----
export const mockActivityLog = [
  { id: "al1", actor: "Asad Khan", action: "qualified", entity: "lead", time: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "al2", actor: "Asad Khan", action: "booked", entity: "appointment", time: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "al3", actor: "System", action: "created", entity: "invoice", time: new Date(Date.now() - 24 * 3600000).toISOString() },
];

// ---- Invoice Templates ----
export type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  accent: string;
  fontFamily: string;
};

export const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional layout with borders and formal styling",
    accent: "#1a1a2e",
    fontFamily: "helvetica",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean lines, bold accent color, contemporary feel",
    accent: "#2563eb",
    fontFamily: "helvetica",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Lots of whitespace, subtle typography, elegant",
    accent: "#6b7280",
    fontFamily: "helvetica",
  },
];
