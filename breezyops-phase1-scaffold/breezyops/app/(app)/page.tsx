import { Card } from "@/components/ui/card";
import { AlertTriangle, Inbox, IndianRupee, CalendarClock } from "lucide-react";

const kpis = [
  { label: "New leads", value: "3", hint: "1 urgent", icon: Inbox },
  { label: "SLA at risk", value: "1", hint: "Priya K. · 20m left", icon: AlertTriangle, danger: true },
  { label: "Jobs today", value: "4", hint: "2 in Koramangala", icon: CalendarClock },
  { label: "Unpaid invoices", value: "₹2,297", hint: "1 invoice", icon: IndianRupee },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Good morning, Asad</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what needs you today.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.danger ? "text-destructive" : "text-primary"}`} />
            </div>
            <div className="text-2xl font-semibold">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.hint}</div>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Go to <a href="/leads" className="font-medium text-primary underline-offset-2 hover:underline">Leads</a> to triage the inbox.
      </p>
    </div>
  );
}
