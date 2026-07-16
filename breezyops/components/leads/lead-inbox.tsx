"use client";

import { useEffect, useState } from "react";
import type { LeadRow } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageCircle, MessageSquare, FileText, Users, MapPin, AlertTriangle, Search } from "lucide-react";
import { LeadDetailSheet } from "./lead-detail-sheet";
import { cn } from "@/lib/utils";

type L = LeadRow;

const channelIcon: Record<string, React.ElementType> = {
  voice: Phone, whatsapp: MessageCircle, webchat: MessageSquare, webform: FileText, referral: Users, walkin: MapPin,
};

export function LeadInbox({ leads }: { leads: L[] }) {
  const [tab, setTab] = useState<"all" | "urgent" | "b2b">("all");
  const [selected, setSelected] = useState<L | null>(null);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  function slaLabel(slaDueAt: Date | null): string | null {
    if (!slaDueAt) return null;
    const diff = slaDueAt.getTime() - now.getTime();
    if (diff <= 0) return "Overdue";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m left`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m left`;
  }

  const filtered = leads
    .filter((l) => (tab === "all" ? true : tab === "urgent" ? l.urgent : l.segment === "b2b"))
    .filter((l) => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search) || l.message?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, phone, or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "urgent" | "b2b")} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="b2b">B2B</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          No leads here — you&apos;re all caught up.
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {filtered.map((lead) => {
            const Icon = channelIcon[lead.channel] ?? Phone;
            const sla = slaLabel(lead.slaDueAt);
            return (
              <li key={lead.id}>
                <button onClick={() => setSelected(lead)}
                  aria-label={`View lead ${lead.name ?? "Unknown caller"}`}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/60">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{lead.name ?? "Unknown caller"}</span>
                      {lead.segment === "b2b" && <Badge variant="outline" className="border-accent text-accent">B2B</Badge>}
                      {lead.urgent && (
                        <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Urgent</Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{lead.message}</p>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                    <span className="text-xs text-muted-foreground">{lead.locality ?? "—"} · {lead.source}</span>
                    {sla && (
                      <span className={cn("text-xs font-medium", sla === "Overdue" ? "text-destructive" : "text-primary")}>
                        {sla}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <LeadDetailSheet lead={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}
