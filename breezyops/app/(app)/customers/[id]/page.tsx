import { notFound } from "next/navigation";
import { fetchCustomerById } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, Building2, FileText, Wrench, Calendar, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatRevenue } from "@/lib/format";

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

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await fetchCustomerById(id);

  if (!c) notFound();

  return (
    <div className="w-full px-6 py-8">
      <Link href="/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            {c.name}
            <Badge variant="outline" className={
              c.segment === "b2b"
                ? "border-accent text-accent"
                : "border-muted-foreground/40 text-muted-foreground"
            }>
              {c.segment.toUpperCase()}
            </Badge>
            {c.gstRequired && (
              <Badge variant="secondary" className="text-[10px]">GST</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Customer since {c.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4 text-primary" /> Jobs
          </div>
          <div className="text-2xl font-semibold">{c.jobCount ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" /> Revenue
          </div>
          <div className="text-2xl font-semibold">{formatRevenue(c.totalRevenue)}</div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" /> Sites
          </div>
          <div className="text-2xl font-semibold">{c.sites?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" /> Last job
          </div>
          <div className="text-2xl font-semibold truncate">{c.lastJob ?? "None"}</div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-medium">Contact Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" /> {c.phone ?? "—"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" /> {c.email ?? "—"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {c.locality ?? "—"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" /> {c.gstRequired ? (c.gstin ?? "GST required") : "No GST"}
              </div>
            </div>
          </Card>
          {c.notes && (
            <Card className="p-4">
              <h3 className="mb-2 text-sm font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">{c.notes}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <Card className="p-4">
            {(!c.jobs || c.jobs.length === 0) ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No jobs yet for this customer.</div>
            ) : (
              <div className="space-y-2">
                {c.jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-md border px-4 py-2.5">
                    <span className="text-sm">{job.summary ?? "Service visit"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={jobStatusVariant[job.status] ?? "secondary"} className="text-[10px]">
                        {job.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card className="p-4">
            {(!c.invoices || c.invoices.length === 0) ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                No invoices for this customer yet.
              </div>
            ) : (
              <div className="space-y-2">
                {c.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-md border px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{inv.number ?? "Draft"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={invoiceStatusVariant[inv.status] ?? "secondary"} className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="mt-4">
          <Card className="p-4">
            {(!c.sites || c.sites.length === 0) ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No sites registered.</div>
            ) : (
              <ul className="divide-y rounded-lg border">
                {c.sites.map((site) => (
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
