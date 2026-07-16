"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell, LogOut, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [newLeadCount, setNewLeadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new")
      .then(({ count }) => setNewLeadCount(count ?? 0));
  }, [supabase]);

  const handleLogout = useCallback(() => {
    supabase.auth.signOut();
    router.replace("/login");
  }, [supabase, router]);

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "AD";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-6">
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {newLeadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {newLeadCount > 9 ? "9+" : newLeadCount}
            </span>
          )}
        </Button>

        {mounted ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="h-9 w-9" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground p-0" aria-label="Account menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{userEmail ?? "Admin"}</div>
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive cursor-pointer">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
