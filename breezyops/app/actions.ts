"use server";

import { revalidatePath } from "next/cache";
import {
  updateLeadStatus as _updateLeadStatus,
  updateDealStage as _updateDealStage,
  createAppointment as _createAppointment,
  updateJobStatus as _updateJobStatus,
  updateInvoiceStatus as _updateInvoiceStatus,
  createInvoice as _createInvoice,
  updateInvoice as _updateInvoice,
  deleteInvoice as _deleteInvoice,
  updateCatalogItem as _updateCatalogItem,
  addLocality as _addLocality,
} from "@/lib/db/queries";

export async function updateLeadStatusAction(id: string, status: string, lostReason?: string) {
  try {
    await _updateLeadStatus(id, status, lostReason);
    revalidatePath("/leads");
    revalidatePath("/pipeline");
    revalidatePath("/");
  } catch (e) {
    console.error("[Action] updateLeadStatusAction failed:", e);
    throw e;
  }
}

export async function updateDealStageAction(id: string, stage: string) {
  try {
    await _updateDealStage(id, stage);
    revalidatePath("/pipeline");
    revalidatePath("/");
  } catch (e) {
    console.error("[Action] updateDealStageAction failed:", e);
    throw e;
  }
}

export async function createAppointmentAction(appt: {
  customer_id: string; technician_id: string; locality_id?: string | null;
  service_name: string; start_at: string; end_at: string;
  site_id?: string | null; job_id?: string | null; notes?: string | null;
}) {
  try {
    const result = await _createAppointment(appt);
    revalidatePath("/schedule");
    revalidatePath("/");
    return result;
  } catch (e) {
    console.error("[Action] createAppointmentAction failed:", e);
    throw e;
  }
}

export async function updateJobStatusAction(id: string, status: string) {
  try {
    await _updateJobStatus(id, status);
    revalidatePath("/jobs");
    revalidatePath("/schedule");
    revalidatePath("/");
  } catch (e) {
    console.error("[Action] updateJobStatusAction failed:", e);
    throw e;
  }
}

export async function updateInvoiceStatusAction(id: string, status: string) {
  try {
    await _updateInvoiceStatus(id, status);
    revalidatePath("/invoices");
    revalidatePath("/");
  } catch (e) {
    console.error("[Action] updateInvoiceStatusAction failed:", e);
    throw e;
  }
}

export async function createInvoiceAction(data: {
  customer_id: string; job_id?: string | null; type?: string;
  items?: { description: string; quantity: number; rate: number; amount: number }[];
  subtotal?: number; gst_applicable?: boolean; gst_rate?: number;
  gst_amount?: number; total?: number;
  issued_at?: string | null; due_at?: string | null;
  notes?: string | null; terms?: string | null; validity_days?: number | null;
  status?: string;
}) {
  try {
    const result = await _createInvoice(data);
    revalidatePath("/invoices");
    revalidatePath("/");
    return result;
  } catch (e) {
    console.error("[Action] createInvoiceAction failed:", e);
    throw e;
  }
}

export async function updateInvoiceAction(id: string, data: {
  customer_id?: string; job_id?: string | null; type?: string;
  items?: { description: string; quantity: number; rate: number; amount: number }[];
  subtotal?: number; gst_applicable?: boolean; gst_rate?: number | null;
  gst_amount?: number | null; total?: number;
  issued_at?: string | null; due_at?: string | null;
  notes?: string | null; terms?: string | null; validity_days?: number | null;
  status?: string;
}) {
  try {
    await _updateInvoice(id, data);
    revalidatePath("/invoices");
    revalidatePath("/");
  } catch (e) {
    console.error("[Action] updateInvoiceAction failed:", e);
    throw e;
  }
}

export async function deleteInvoiceAction(id: string) {
  try {
    await _deleteInvoice(id);
    revalidatePath("/invoices");
    revalidatePath("/");
  } catch (e) {
    console.error("[Action] deleteInvoiceAction failed:", e);
    throw e;
  }
}

export async function updateCatalogItemAction(id: string, price: number, cost: number) {
  try {
    await _updateCatalogItem(id, price, cost);
    revalidatePath("/settings");
  } catch (e) {
    console.error("[Action] updateCatalogItemAction failed:", e);
    throw e;
  }
}

export async function addLocalityAction(name: string) {
  try {
    await _addLocality(name);
    revalidatePath("/settings");
  } catch (e) {
    console.error("[Action] addLocalityAction failed:", e);
    throw e;
  }
}
