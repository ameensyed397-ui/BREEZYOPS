"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, Building2, FileText, Wrench, Calendar, Shield, IndianRupee } from "lucide-react";
import Link from "next/link";
import type { CustomerRow } from "@/lib/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { InfoCard } from "@/components/ui/info-card";

const jobStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  dispatched: "secondary",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
};

const invoiceStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  paid: "default",
  overdue: "destructive",
  void: "secondary",
  accepted: "default",
  rejected: "destructive",
  expired: "secondary",
};

export function CustomerDetailSheet({
  customer,
  onOpenChange,
}: {
  customer: CustomerRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const jobs = customer?.jobs ?? [];
  const invoices = customer?.invoices ?? [];

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {customer?.name}
            <Badge variant="outline" className={
              customer?.segment === "b2b"
                ? "border-accent text-accent"
                : "border-muted-foreground/40 text-muted-foreground"
            }>
              {customer?.segment?.toUpperCase()}
            </Badge>
            {customer?.gstRequired && (
              <Badge variant="secondary" className="text-[10px]">GST</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Customer since {formatDate(customer?.createdAt ?? null)}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          {customer && (
            <Tabs defaultValue="overview" className="mt-1">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="jobs" className="flex-1">Jobs</TabsTrigger>
                <TabsTrigger value="invoices" className="flex-1">Invoices</TabsTrigger>
                <TabsTrigger value="sites" className="flex-1">Sites</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard icon={Phone} label="Phone" value={customer.phone ?? "—"} />
                  <InfoCard icon={Mail} label="Email" value={customer.email ?? "—"} />
                  <InfoCard icon={MapPin} label="Locality" value={customer.locality ?? "—"} />
                  <InfoCard icon={Shield} label="GST" value={customer.gstRequired ? (customer.gstin ?? "Required") : "Not required"} />
                </div>
                {customer.notes && (
                  <div>
                    <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Notes</div>
                    <p className="rounded-md bg-secondary/60 p-3 text-sm">{customer.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard icon={Wrench} label="Jobs" value={String(customer.jobCount ?? 0)} />
                  <StatCard icon={FileText} label="Revenue" value={formatCurrency(customer.totalRevenue ?? 0)} />
                  <StatCard icon={Calendar} label="Last job" value={customer.lastJob ?? "None"} />
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="pt-4">
                {jobs.length === 0 ? (
                  <EmptyState message="No jobs yet for this customer." />
                ) : (
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between rounded-md border px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{job.summary ?? "Service visit"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={jobStatusVariant[job.status] ?? "secondary"} className="text-[10px]">
                            {job.status.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(job.scheduledAt)}</span>
                        </div>
                      </div>
                    ))}
                    <Link href="/jobs" className="block text-center text-xs text-primary hover:underline pt-2">
                      View all jobs →
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invoices" className="pt-4">
                {invoices.length === 0 ? (
                  <EmptyState message="No invoices yet for this customer." />
                ) : (
                  <div className="space-y-2">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between rounded-md border px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{inv.number ?? "Draft"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={invoiceStatusVariant[inv.status] ?? "secondary"} className="text-[10px]">
                            {inv.status}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                            <IndianRupee className="h-3 w-3" />{formatCurrency(Number(inv.total ?? 0))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sites" className="pt-4">
                {(!customer.sites || customer.sites.length === 0) ? (
                  <EmptyState message="No sites registered." />
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {customer.sites.map((site) => (
                      <li key={site.id} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{site.label ?? "Unnamed site"}</span>
                        </div>
                        {site.address && (
                          <p className="mt-1 pl-6 text-xs text-muted-foreground">{site.address}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-md border p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
