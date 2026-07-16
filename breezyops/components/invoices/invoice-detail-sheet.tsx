"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import {
  FileText, IndianRupee, Calendar, Send, CheckCircle, XCircle,
  Pencil, Trash2, Download, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { InvoiceRow } from "@/lib/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  updateInvoiceStatusAction, deleteInvoiceAction,
} from "@/app/actions";
import { InfoCard } from "@/components/ui/info-card";
import { generateInvoicePDF, downloadPDF, getPDFDataUri } from "@/lib/invoice/pdf-generator";
import { getTemplateById } from "./template-selector";

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

export function InvoiceDetailSheet({
  invoice,
  onOpenChange,
  onEdit,
}: {
  invoice: InvoiceRow | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (invoice: InvoiceRow) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  function handlePreview() {
    if (!invoice) return;
    try {
      const template = getTemplateById("classic");
      const doc = generateInvoicePDF({
        number: invoice.number ?? "DRAFT",
        type: invoice.type ?? "invoice",
        customerName: invoice.customerName ?? "Customer",
        items: invoice.items ?? [],
        subtotal: Number(invoice.subtotal ?? 0),
        gstApplicable: invoice.gstApplicable ?? false,
        gstRate: invoice.gstRate ? Number(invoice.gstRate) : null,
        gstAmount: invoice.gstAmount ? Number(invoice.gstAmount) : null,
        total: Number(invoice.total ?? 0),
        issuedAt: invoice.issuedAt,
        dueAt: invoice.dueAt,
        notes: invoice.notes,
        terms: invoice.terms,
        validityDays: invoice.validityDays,
      }, template);
      setPreviewUri(getPDFDataUri(doc));
      setPreviewOpen(true);
    } catch {
      toast.error("Failed to generate preview.");
    }
  }

  async function handleStatusChange(status: string) {
    if (!invoice) return;
    setLoading(true);
    try {
      await updateInvoiceStatusAction(invoice.id, status);
      toast.success(`Invoice ${status}.`);
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to update invoice.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!invoice) return;
    setLoading(true);
    try {
      await deleteInvoiceAction(invoice.id);
      toast.success("Invoice deleted.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete invoice.");
    } finally {
      setLoading(false);
    }
  }

  function handleGeneratePDF() {
    if (!invoice) return;
    try {
      const template = getTemplateById("classic");
      const doc = generateInvoicePDF({
        number: invoice.number ?? "DRAFT",
        type: invoice.type ?? "invoice",
        customerName: invoice.customerName ?? "Customer",
        items: invoice.items ?? [],
        subtotal: Number(invoice.subtotal ?? 0),
        gstApplicable: invoice.gstApplicable ?? false,
        gstRate: invoice.gstRate ? Number(invoice.gstRate) : null,
        gstAmount: invoice.gstAmount ? Number(invoice.gstAmount) : null,
        total: Number(invoice.total ?? 0),
        issuedAt: invoice.issuedAt,
        dueAt: invoice.dueAt,
        notes: invoice.notes,
        terms: invoice.terms,
        validityDays: invoice.validityDays,
      }, template);
      const suffix = invoice.type === "quotation" ? "Quotation" : "Invoice";
      downloadPDF(doc, `${invoice.number ?? "draft"}_${suffix}.pdf`);
      toast.success("PDF downloaded.");
    } catch {
      toast.error("Failed to generate PDF.");
    }
  }

  return (
    <Sheet open={!!invoice} onOpenChange={(open) => {
      if (!open) { setConfirmVoid(false); setConfirmDelete(false); }
      onOpenChange(open);
    }}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {invoice?.number}
            <Badge variant={statusVariant[invoice?.status ?? ""] ?? "secondary"} className="text-[10px]">
              {invoice?.status}
            </Badge>
            {invoice?.type === "quotation" && (
              <Badge variant="outline" className="text-[10px]">Quotation</Badge>
            )}
          </SheetTitle>
          <SheetDescription>{invoice?.customerName}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {invoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={IndianRupee} label="Total" value={formatCurrency(Number(invoice.total ?? 0))} highlight />
                {invoice.gstApplicable && (
                  <>
                    <InfoCard icon={IndianRupee} label="Subtotal" value={formatCurrency(Number(invoice.subtotal ?? 0))} />
                    <InfoCard icon={IndianRupee} label={`GST (${invoice.gstRate}%)`} value={formatCurrency(Number(invoice.gstAmount ?? 0))} />
                  </>
                )}
                <InfoCard icon={Calendar} label="Issued" value={formatDate(invoice.issuedAt)} />
                {invoice.type === "quotation" && invoice.validityDays ? (
                  <InfoCard icon={Calendar} label="Valid for" value={`${invoice.validityDays} days`} />
                ) : (
                  <InfoCard icon={Calendar} label="Due" value={formatDate(invoice.dueAt)} />
                )}
              </div>

              {invoice.items && invoice.items.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">Line items</div>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-secondary/40 text-left text-xs uppercase text-muted-foreground">
                          <th className="px-3 py-2 font-medium">Description</th>
                          <th className="px-3 py-2 font-medium text-right">Qty</th>
                          <th className="px-3 py-2 font-medium text-right">Rate</th>
                          <th className="px-3 py-2 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoice.items.map((item, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">{item.description}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{formatCurrency(item.rate)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-secondary/20 font-medium">
                          <td colSpan={3} className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Total</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(Number(invoice.total ?? 0))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {invoice.notes && (
                <div>
                  <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Notes</div>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Terms</div>
                  <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </SheetBody>

        <SheetFooter className="flex-wrap gap-2">
          {onEdit && (invoice?.status === "draft" || invoice?.status === "sent") && (
            <Button variant="outline" onClick={() => { onOpenChange(false); onEdit(invoice); }}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button variant="outline" onClick={handleGeneratePDF}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          {invoice?.status === "draft" && (
            <>
              <Button disabled={loading} onClick={() => handleStatusChange("sent")}>
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
              {confirmVoid ? (
                <>
                  <Button variant="destructive" disabled={loading} onClick={() => handleStatusChange("void")}>
                    Confirm void
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmVoid(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirmVoid(true)}>
                  <XCircle className="mr-2 h-4 w-4" /> Void
                </Button>
              )}
            </>
          )}
          {invoice?.status === "sent" && (
            <Button disabled={loading} onClick={() => handleStatusChange("paid")}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark paid
            </Button>
          )}
          {invoice?.status === "overdue" && (
            <>
              <Button variant="destructive" disabled={loading} onClick={() => handleStatusChange("paid")}>
                <CheckCircle className="mr-2 h-4 w-4" /> Record payment
              </Button>
              {confirmVoid ? (
                <>
                  <Button variant="destructive" disabled={loading} onClick={() => handleStatusChange("void")}>
                    Confirm void
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmVoid(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirmVoid(true)}>
                  <XCircle className="mr-2 h-4 w-4" /> Void
                </Button>
              )}
            </>
          )}
          {invoice?.status === "draft" && (
            confirmDelete ? (
              <>
                <Button variant="destructive" disabled={loading} onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Confirm delete
                </Button>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>

      <Dialog open={previewOpen} onOpenChange={(o) => { setPreviewOpen(o); if (!o) setPreviewUri(null); }}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {invoice?.number ?? "Invoice"} — Preview
            </DialogTitle>
            <DialogDescription>
              {invoice?.type === "quotation" ? "Quotation" : "Invoice"} for {invoice?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 p-4">
            {previewUri ? (
              <iframe
                src={previewUri}
                className="w-full rounded-lg border bg-white"
                style={{ height: "70vh" }}
                title="Invoice preview"
              />
            ) : (
              <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
                Loading preview…
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => { setPreviewOpen(false); setPreviewUri(null); }}>
              Close
            </Button>
            <Button onClick={handleGeneratePDF}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
