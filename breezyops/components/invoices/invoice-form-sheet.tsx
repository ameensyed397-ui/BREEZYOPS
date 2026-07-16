"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createInvoiceAction, updateInvoiceAction } from "@/app/actions";
import type { InvoiceRow, CustomerRow, LineItem } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/format";

const DEFAULT_GST_RATE = "18";

type InvoiceFormData = {
  customerId: string;
  jobId: string;
  type: "invoice" | "quotation";
  status: string;
  items: LineItem[];
  gstApplicable: boolean;
  gstRate: string;
  notes: string;
  terms: string;
  validityDays: string;
  issuedAt: string;
  dueAt: string;
};

function emptyForm(): InvoiceFormData {
  return {
    customerId: "",
    jobId: "",
    type: "invoice",
    status: "draft",
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    gstApplicable: false,
    gstRate: DEFAULT_GST_RATE,
    notes: "",
    terms: "",
    validityDays: "",
    issuedAt: "",
    dueAt: "",
  };
}

function calcTotals(items: LineItem[], gstApplicable: boolean, gstRate: string) {
  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const rate = gstApplicable ? parseFloat(gstRate) || 0 : 0;
  const gstAmount = gstApplicable ? Math.round(subtotal * rate / 100) : 0;
  const total = subtotal + gstAmount;
  return { subtotal, gstAmount, total };
}

function parseInvoiceToForm(invoice: InvoiceRow): InvoiceFormData {
  return {
    customerId: invoice.customerId ?? "",
    jobId: invoice.jobId ?? "",
    type: (invoice.type as "invoice" | "quotation") ?? "invoice",
    status: invoice.status ?? "draft",
    items: invoice.items?.length
      ? invoice.items.map((i) => ({ ...i }))
      : [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    gstApplicable: invoice.gstApplicable ?? false,
    gstRate: invoice.gstRate ?? DEFAULT_GST_RATE,
    notes: invoice.notes ?? "",
    terms: invoice.terms ?? "",
    validityDays: invoice.validityDays != null ? String(invoice.validityDays) : "",
    issuedAt: invoice.issuedAt ? toDateString(invoice.issuedAt) : "",
    dueAt: invoice.dueAt ? toDateString(invoice.dueAt) : "",
  };
}

function toDateString(d: Date | string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function InvoiceFormSheet({
  open,
  onOpenChange,
  customers,
  invoice,
  type: defaultType,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  customers: CustomerRow[];
  invoice?: InvoiceRow | null;
  type?: "invoice" | "quotation";
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        {open && (
          <InvoiceFormInner
            customers={customers}
            invoice={invoice}
            defaultType={defaultType}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function InvoiceFormInner({
  customers,
  invoice,
  defaultType,
  onDone,
}: {
  customers: CustomerRow[];
  invoice?: InvoiceRow | null;
  defaultType?: "invoice" | "quotation";
  onDone: () => void;
}) {
  const router = useRouter();
  const isEdit = !!invoice;
  const initialForm = invoice ? parseInvoiceToForm(invoice) : (() => {
    const f = emptyForm();
    if (defaultType) f.type = defaultType;
    return f;
  })();
  const [form, setForm] = useState<InvoiceFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = useCallback((key: keyof InvoiceFormData, val: string | boolean | LineItem[]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const { [key]: _, ...rest } = e; return rest; });
  }, []);

  const totals = calcTotals(form.items, form.gstApplicable, form.gstRate);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setForm((f) => {
      const items = [...f.items];
      const item = { ...items[index] };
      if (field === "quantity") {
        item.quantity = typeof value === "string" ? parseFloat(value) || 0 : value;
        item.amount = item.quantity * item.rate;
      } else if (field === "rate") {
        item.rate = typeof value === "string" ? parseFloat(value) || 0 : value;
        item.amount = item.quantity * item.rate;
      } else {
        item.description = String(value);
      }
      items[index] = item;
      return { ...f, items };
    });
    setErrors((e) => { const { items: _, ...rest } = e; return rest; });
  }

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: "", quantity: 1, rate: 0, amount: 0 }],
    }));
  }

  function removeItem(index: number) {
    setForm((f) => {
      if (f.items.length <= 1) return f;
      const items = f.items.filter((_, i) => i !== index);
      return { ...f, items };
    });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.customerId) errs.customerId = "Select a customer.";
    if (!form.items.length || form.items.every((i) => !i.description.trim())) {
      errs.items = "Add at least one line item.";
    }
    if (form.type === "quotation" && form.validityDays && (parseInt(form.validityDays) < 1)) {
      errs.validityDays = "Must be at least 1 day.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const payload = {
        customer_id: form.customerId,
        job_id: form.jobId || undefined,
        type: form.type,
        status: form.status,
        items: form.items.filter((i) => i.description.trim()),
        subtotal: totals.subtotal,
        gst_applicable: form.gstApplicable,
        gst_rate: form.gstApplicable ? parseFloat(form.gstRate) || parseFloat(DEFAULT_GST_RATE) : undefined,
        gst_amount: form.gstApplicable ? totals.gstAmount : undefined,
        total: totals.total,
        issued_at: form.issuedAt || undefined,
        due_at: form.dueAt || undefined,
        notes: form.notes || undefined,
        terms: form.terms || undefined,
        validity_days: form.validityDays ? parseInt(form.validityDays) : undefined,
      };

      if (isEdit && invoice) {
        await updateInvoiceAction(invoice.id, payload);
        toast.success(`${form.type === "quotation" ? "Quotation" : "Invoice"} updated.`);
      } else {
        await createInvoiceAction(payload);
        toast.success(`${form.type === "quotation" ? "Quotation" : "Invoice"} created.`);
      }
      onDone();
      router.refresh();
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const title = isEdit
    ? `Edit ${form.type === "quotation" ? "quotation" : "invoice"}`
    : `New ${form.type === "quotation" ? "quotation" : "invoice"}`;

  return (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>
          {isEdit ? "Update the details below." : "Fill in the details to create a new document."}
        </SheetDescription>
      </SheetHeader>

      <SheetBody>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v as "invoice" | "quotation")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="quotation">Quotation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Customer</Label>
            <Select value={form.customerId} onValueChange={(v) => set("customerId", v)}>
              <SelectTrigger className="w-full" aria-invalid={!!errors.customerId}>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}{c.locality ? ` — ${c.locality}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && <p className="text-xs text-destructive">{errors.customerId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Issue date</Label>
              <Input type="date" value={form.issuedAt} onChange={(e) => set("issuedAt", e.target.value)} />
            </div>
            {form.type === "invoice" ? (
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input type="date" value={form.dueAt} onChange={(e) => set("dueAt", e.target.value)} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Valid for (days)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={form.validityDays}
                  onChange={(e) => set("validityDays", e.target.value)}
                  aria-invalid={!!errors.validityDays}
                />
                {errors.validityDays && <p className="text-xs text-destructive">{errors.validityDays}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="gstCheck"
                checked={form.gstApplicable}
                onChange={(e) => set("gstApplicable", e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="gstCheck" className="cursor-pointer">GST applicable</Label>
            </div>
            {form.gstApplicable && (
              <div className="space-y-1.5">
                <Label>GST rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.gstRate}
                  onChange={(e) => set("gstRate", e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Line items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-3 w-3" /> Add item
              </Button>
            </div>
            {errors.items && <p className="mb-2 text-xs text-destructive">{errors.items}</p>}
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="rounded-lg border bg-secondary/20 p-2.5 space-y-2">
                  <div className="flex items-start gap-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground">Qty</span>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.quantity || ""}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground">Rate</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={item.rate || ""}
                        onChange={(e) => updateItem(idx, "rate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground">Amount</span>
                      <div className="flex h-[38px] items-center justify-end rounded-md border bg-background px-3 text-sm font-medium">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-secondary/30 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            {form.gstApplicable && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST ({form.gstRate}%)</span>
                <span className="font-medium">{formatCurrency(totals.gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Internal notes (optional)"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Terms & conditions</Label>
            <Textarea
              placeholder="Payment terms, warranty info, etc. (optional)"
              value={form.terms}
              onChange={(e) => set("terms", e.target.value)}
              rows={2}
            />
          </div>
        </form>
      </SheetBody>

      <SheetFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} onClick={(e) => { e.preventDefault(); document.querySelector<HTMLFormElement>('[data-slot="sheet-body"] form')?.requestSubmit(); }}>
          {submitting ? "Saving…" : isEdit ? "Update" : "Create"}
        </Button>
      </SheetFooter>
    </>
  );
}
