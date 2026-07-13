"use client";

import { useMemo, useState } from "react";
import type { Lead } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageCircle, Globe, Mic, AlertTriangle } from "lucide-react";
import { LeadDetailSheet } from "./lead-detail-sheet";
import { cn } from "@/lib/utils";

type L = Lead & { locality?: string };

const channelIcon: Record<string, React.ElementType> = {
  whatsapp: MessageCircle, voice: Mic, webchat: Globe, webform: Globe, referral: Phone, walkin: Phone,
};

function slaLabel(due?: Date | null) {
  if (!due) return null;
  const mins = Math.round((new Date(due).getTime() - Date.now()) / 60000);
  if (mins < 0) return { text: "SLA overdue", danger: true };
  return { text: `${mins}m left`, danger: mins <= 10 };
}

export function LeadInbox({ leads }: { leads: L[] }) {
  const [tab, setTab] = useState<"all" | "urgent" | "b2b">("all");
  const [selected, setSelected] = useState<L | null>(null);

  const filtered = useMemo(() => leads.filter((l) =>
    tab === "all" ? true : tab === "urgent" ? l.urgent : l.segment === "b2b"
  ), [leads, tab]);

  return (
    <>
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
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
            const Icon = channelIcon[lead.channel] ?? Globe;
            const sla = slaLabel(lead.slaDueAt);
            return (
              <li key={lead.id}>
                <button onClick={() => setSelected(lead)}
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
                      <span className={cn("text-xs font-medium", sla.danger ? "text-destructive" : "text-primary")}>
                        {sla.text}
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
