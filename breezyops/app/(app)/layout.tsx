"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import {
  Menu, X, LayoutDashboard, Inbox, Kanban, Users, Calendar,
  Wrench, FileText, Settings, FolderOpen, type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/layout/header";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Inbox },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

function MobileNavLink({ href, label, icon: Icon, active, onClick }: {
  href: string; label: string; icon: LucideIcon; active: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}>
      <Icon className="h-4 w-4" />{label}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        <div className="flex flex-1 flex-col">
          {/* Mobile header */}
          <header className="flex h-14 items-center border-b bg-card px-4 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <div className="flex h-full flex-col p-3">
                  <div className="mb-6 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
                        <Image src="/brand/doodle-hvac.png" alt="Breezyops mascot" width={36} height={36} className="object-cover" />
                      </span>
                      <span className="font-caveat text-xl font-bold tracking-tight">Breezy<span className="text-primary">ops</span></span>
                    </div>
                    <button onClick={() => setOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      aria-label="Close navigation">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navItems.map(({ href, label, icon }) => (
                      <MobileNavLink key={href} href={href} label={label} icon={icon}
                        active={href === "/" ? pathname === "/" : pathname.startsWith(href)}
                        onClick={() => setOpen(false)} />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <span className="ml-2 font-caveat text-xl font-bold tracking-tight">Breezy<span className="text-primary">ops</span></span>
          </header>

          {/* Desktop header */}
          <div className="hidden md:block">
            <Header />
          </div>

          <main className="flex-1 bg-background">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
