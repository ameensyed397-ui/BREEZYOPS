"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Inbox, Kanban, Users, Calendar, Wrench, FileText,
  Settings, FolderOpen, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge,
  SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Inbox, badge: true },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const supabase = createClient();
  const [newLeadCount, setNewLeadCount] = useState<number>(0);

  useEffect(() => {
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new")
      .then(({ count }) => setNewLeadCount(count ?? 0));
  }, [supabase]);

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="relative h-10 w-10 shrink-0 rounded-lg bg-primary/10 ring-2 ring-primary/30 hover:ring-primary/60 transition-all cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Image src="/brand/doodle-breezyops.png" alt="Breezyops mascot" fill className="object-contain p-0.5" />
          </button>
          <span className="flex-1 truncate font-caveat text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            Breezy<span className="text-primary">ops</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:hidden"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ href, label, icon: Icon, badge }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                    <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                      className={active ? "bg-primary/10 text-primary font-semibold border-l-3 border-l-primary" : ""}
                    >
                      <Link href={href} aria-current={active ? "page" : undefined}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badge && newLeadCount > 0 && (
                      <SidebarMenuBadge>
                        {newLeadCount > 9 ? "9+" : newLeadCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
