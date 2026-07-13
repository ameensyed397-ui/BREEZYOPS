import Link from "next/link";
import { Inbox, LayoutDashboard, Users, Calendar, Wrench, FileText, Settings, Wind, Kanban } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Inbox, badge: "3" },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card px-3 py-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wind className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Breezy<span className="text-primary">ops</span></span>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{label}</span>
              {badge && <span className="rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">{badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3 text-xs text-muted-foreground">Asad Khan · Admin</div>
      </aside>
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
