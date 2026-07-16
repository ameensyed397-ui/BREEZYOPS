import Link from "next/link";
import { fetchDashboardKPIs } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/format";
import { statusLabel } from "@/lib/format";
import { DashboardRefreshButton } from "@/components/dashboard-refresh-button";
import {
  Inbox, Calendar, FileText, Users, Wrench, ArrowRight,
  TrendingUp, AlertTriangle, Clock, CheckCircle2, IndianRupee
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const kpis = await fetchDashboardKPIs();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { newLeads, activeJobs, completedJobs, paidInvoices, overdueInvoices,
    totalRevenue, completionRate, totalCustomers, recentLeads, upcoming } = kpis;

  const insights: { icon: React.ElementType; color: string; text: string; href: string }[] = [];
  if (newLeads.length > 0) {
    insights.push({ icon: Inbox, color: "text-primary", text: `${newLeads.length} new lead${newLeads.length > 1 ? "s" : ""} waiting for response`, href: "/leads" });
  }
  if (overdueInvoices.length > 0) {
    insights.push({ icon: AlertTriangle, color: "text-destructive", text: `${overdueInvoices.length} invoice${overdueInvoices.length > 1 ? "s" : ""} overdue — follow up needed`, href: "/invoices" });
  }
  if (insights.length === 0) {
    insights.push({ icon: CheckCircle2, color: "text-success", text: "All caught up! No action items.", href: "/" });
  }

  const kpiCards = [
    { label: "New Leads", value: newLeads.length, icon: Inbox, href: "/leads", color: "bg-primary/10 text-primary" },
    { label: "Active Jobs", value: activeJobs.length, icon: Wrench, href: "/jobs", color: "bg-warning/10 text-warning" },
    { label: "Revenue", value: formatCurrency(totalRevenue), icon: IndianRupee, href: "/invoices", color: "bg-success/10 text-success" },
    { label: "Overdue", value: overdueInvoices.length, icon: AlertTriangle, href: "/invoices", color: "bg-destructive/10 text-destructive" },
    { label: "Customers", value: totalCustomers, icon: Users, href: "/customers", color: "bg-accent/10 text-accent" },
    { label: "Completion", value: `${completionRate}%`, icon: CheckCircle2, href: "/jobs", color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your operations today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          <DashboardRefreshButton />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "New Lead", href: "/leads", icon: Inbox, desc: "Capture incoming lead" },
            { label: "Schedule Job", href: "/schedule", icon: Calendar, desc: "Book appointment" },
            { label: "Create Invoice", href: "/invoices", icon: FileText, desc: "Bill for services" },
            { label: "View Pipeline", href: "/pipeline", icon: TrendingUp, desc: "Track deals" },
          ].map((action) => (
            <Link key={action.label} href={action.href}
              className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-secondary/50 hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <action.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Action Items</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, i) => (
            <Link key={i} href={insight.href}
              className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              <insight.icon className={`h-5 w-5 shrink-0 ${insight.color}`} />
              <span className="flex-1">{insight.text}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {kpiCards.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}
            className="group rounded-xl border bg-card p-4 transition-all hover:bg-secondary/50 hover:shadow-md hover:border-primary/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
            <div className="flex items-center justify-between mb-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Recent Leads</h2>
            <Link href="/leads" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {lead.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.message ?? ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    lead.status === "new" ? "bg-primary/10 text-primary" :
                    lead.status === "qualified" ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  }`}>
                    {statusLabel(lead.status ?? "new")}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{lead.createdAt?.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) ?? ""}</span>
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                No leads yet
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Upcoming</h2>
            <Link href="/schedule" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              Schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {upcoming.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                No upcoming appointments
              </div>
            ) : (
              upcoming.map((apt) => (
                <div key={apt.id} className="px-4 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">
                      {apt.startAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{apt.serviceName}</span>
                  </div>
                  <p className="text-sm font-medium">{apt.customerName}</p>
                  {apt.locality && <p className="text-xs text-muted-foreground">{apt.locality}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
