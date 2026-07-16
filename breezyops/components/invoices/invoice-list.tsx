"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, IndianRupee, Calendar, AlertTriangle, Plus } from "lucide-react";
import { InvoiceDetailSheet } from "./invoice-detail-sheet";
import { InvoiceFormSheet } from "./invoice-form-sheet";
import type { InvoiceRow, CustomerRow } from "@/lib/db/queries";
import { formatCurrencyShort, formatDate } from "@/lib/format";

type I = InvoiceRow;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  paid: "default",
  overdue: "destructive",
  void: "secondary",
  accepted: "default",
  rejected: "destructive",
  expired: "secondary",
};

function daysUntil(d?: Date | null) {
  if (!d) return null;
  const days = Math.round((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `${days}d left`;
}

type TabValue = "all" | "invoices" | "quotations" | "draft" | "sent" | "paid" | "overdue";

export function InvoiceList({
  invoices,
  customers,
}: {
  invoices: I[];
  customers: CustomerRow[];
}) {
  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<I | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<"invoice" | "quotation">("invoice");
  const [editInvoice, setEditInvoice] = useState<I | null>(null);

  const filtered = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (tab === "all") return true;
        if (tab === "invoices") return inv.type === "invoice";
        if (tab === "quotations") return inv.type === "quotation";
        return inv.status === tab;
      })
      .filter((inv) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          inv.number?.toLowerCase().includes(q) ||
          inv.customerName?.toLowerCase().includes(q)
        );
      });
  }, [invoices, tab, search]);

  const stats = useMemo(() => ({
    total: invoices.length,
    invoiceCount: invoices.filter((i) => i.type === "invoice").length,
    quotationCount: invoices.filter((i) => i.type === "quotation").length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalRevenue: invoices.reduce((sum, i) => sum + Number(i.total ?? 0), 0),
    outstanding: invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + Number(i.total ?? 0), 0),
  }), [invoices]);

  function openCreate(type: "invoice" | "quotation") {
    setFormType(type);
    setEditInvoice(null);
    setFormOpen(true);
  }

  function openEdit(invoice: I) {
    setEditInvoice(invoice);
    setFormType(invoice.type as "invoice" | "quotation");
    setFormOpen(true);
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="overflow-x-auto">
            <TabsList className="flex-nowrap">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="invoices">Invoices ({stats.invoiceCount})</TabsTrigger>
              <TabsTrigger value="quotations">Quotes ({stats.quotationCount})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({stats.paid})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Search #, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search invoices"
            className="sm:w-52"
          />
          <Button size="sm" onClick={() => openCreate("invoice")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Invoice
          </Button>
          <Button size="sm" variant="outline" onClick={() => openCreate("quotation")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Quote
          </Button>
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            <div>Outstanding: <span className="font-medium text-destructive">{formatCurrencyShort(stats.outstanding)}</span></div>
            <div>Total: <span className="font-medium text-foreground">{formatCurrencyShort(stats.totalRevenue)}</span></div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {search ? "No results match your search." : "No documents yet — create an invoice or quotation."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ul className="divide-y rounded-lg border bg-card">
            {filtered.map((invoice) => {
              const due = daysUntil(invoice.dueAt);
              const isOverdue = invoice.status === "overdue";
              return (
                <li key={invoice.id}>
                  <button
                    onClick={() => setSelected(invoice)}
                    aria-label={`View ${invoice.type} ${invoice.number}`}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{invoice.number}</span>
                        <Badge variant={statusVariant[invoice.status] ?? "secondary"} className="text-[10px]">
                          {invoice.status}
                        </Badge>
                        {invoice.type === "quotation" && (
                          <Badge variant="outline" className="text-[10px]">Quote</Badge>
                        )}
                        {invoice.gstApplicable && (
                          <Badge variant="secondary" className="text-[10px]">GST</Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{invoice.customerName}</p>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <IndianRupee className="h-3 w-3" />{formatCurrencyShort(Number(invoice.total ?? 0))}
                      </span>
                      {invoice.status !== "paid" && invoice.status !== "void" && invoice.status !== "draft" && due && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          {due}
                        </span>
                      )}
                      {invoice.issuedAt && (
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="mr-1 inline h-3 w-3" />{formatDate(invoice.issuedAt)}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <InvoiceDetailSheet
        invoice={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onEdit={openEdit}
      />

      <InvoiceFormSheet
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditInvoice(null); }}
        customers={customers}
        invoice={editInvoice}
        type={formType}
      />
    </>
  );
}
