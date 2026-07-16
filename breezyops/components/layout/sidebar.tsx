"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Inbox, Kanban, Users, Calendar, Wrench, FileText,
  Settings, ChevronLeft, ChevronRight, FolderOpen,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [newLeadCount, setNewLeadCount] = useState<number>(0);

  useEffect(() => {
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new")
      .then(({ count }) => setNewLeadCount(count ?? 0));
  }, [supabase]);

  const nav = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Inbox, badge: newLeadCount || undefined },
    { href: "/pipeline", label: "Pipeline", icon: Kanban },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/jobs", label: "Jobs", icon: Wrench },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/documents", label: "Documents", icon: FolderOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r bg-card py-4 transition-all duration-300 md:flex ${
        collapsed ? "w-16 px-2" : "w-60 px-3"
      }`}
    >
      <div className={`mb-6 flex items-center gap-2 px-2 ${collapsed ? "justify-center" : ""}`}>
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-primary">
          <Image src="/brand/doodle-breezyops.png" alt="Breezyops mascot" fill className="object-cover" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">
            Breezy<span className="text-primary">ops</span>
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const link = (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              } ${collapsed ? "justify-center" : "justify-between"}`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && label}
              </span>
              {!collapsed && badge && badge > 0 && (
                <span className="rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">{badge}</span>
              )}
            </Link>
          );
          if (collapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors mx-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
