import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { mockCustomers } from "@/lib/db/mock";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, Building2, FileText, Wrench, Calendar, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatRevenue(amount?: number) {
  if (!amount) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let customer = null;
  if (db) {
    const rows = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
    customer = rows[0] ?? null;
  } else {
    customer = mockCustomers.find((c) => c.id === id) ?? null;
  }

  if (!customer) notFound();

  const c = customer as typeof mockCustomers[number];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
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
            Customer since {formatDate(c.createdAt)}
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
          <div className="text-sm font-medium truncate">{c.lastJob ?? "None"}</div>
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
            {(c.jobCount ?? 0) === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No jobs yet for this customer.</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border px-4 py-2.5">
                  <span className="text-sm">{c.lastJob ?? "Service visit"}</span>
                  <Badge variant="default" className="text-[10px]">completed</Badge>
                </div>
                {(c.jobCount ?? 0) > 1 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    + {(c.jobCount ?? 1) - 1} more jobs
                  </p>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card className="p-4">
            <div className="py-10 text-center text-sm text-muted-foreground">
              Invoices will appear here once invoicing (F09) is connected.
            </div>
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
