"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { FileText, IndianRupee, Calendar, Building2, Send, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MockInvoice } from "@/lib/db/mock";

function formatCurrency(amount: string) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  paid: "default",
  overdue: "destructive",
  void: "secondary",
};

export function InvoiceDetailSheet({
  invoice,
  onOpenChange,
}: {
  invoice: MockInvoice | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!invoice} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {invoice && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {invoice.number}
                <Badge variant={statusVariant[invoice.status]} className="text-[10px]">
                  {invoice.status}
                </Badge>
              </SheetTitle>
              <SheetDescription>{invoice.customerName}</SheetDescription>
            </SheetHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={IndianRupee} label="Total" value={formatCurrency(invoice.total)} highlight />
                {invoice.gstApplicable && (
                  <>
                    <InfoCard icon={IndianRupee} label="Subtotal" value={formatCurrency(invoice.subtotal)} />
                    <InfoCard icon={IndianRupee} label={`GST (${invoice.gstRate}%)`} value={formatCurrency(invoice.gstAmount ?? "0")} />
                  </>
                )}
                <InfoCard icon={Calendar} label="Issued" value={formatDate(invoice.issuedAt)} />
                <InfoCard icon={Calendar} label="Due" value={formatDate(invoice.dueAt)} />
              </div>

              {invoice.items && invoice.items.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">Line items</div>
                  <div className="rounded-lg border overflow-hidden">
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
                            <td className="px-3 py-2 text-right text-muted-foreground">{formatCurrency(String(item.rate))}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(String(item.amount))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-secondary/20 font-medium">
                          <td colSpan={3} className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Total</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(invoice.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {invoice.status === "draft" && (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => toast.success("Invoice sent — status updated to 'sent'.")}>
                    <Send className="mr-2 h-4 w-4" /> Send invoice
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground" onClick={() => toast("Invoice voided.")}>
                    <XCircle className="mr-2 h-4 w-4" /> Void
                  </Button>
                </div>
              )}
              {invoice.status === "sent" && (
                <Button className="w-full" onClick={() => toast.success("Payment recorded — status updated to 'paid'.")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark paid
                </Button>
              )}
              {invoice.status === "overdue" && (
                <Button className="w-full" variant="destructive" onClick={() => toast.success("Payment recorded — status updated to 'paid'.")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Record payment
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoCard({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md p-3 ${highlight ? "bg-primary/10" : "bg-secondary/40"}`}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
        <Icon className="h-3 w-3" />{label}
      </div>
      <div className={`truncate text-sm ${highlight ? "text-lg font-semibold text-primary" : ""}`}>{value}</div>
    </div>
  );
}
