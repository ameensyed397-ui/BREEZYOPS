"use client";

import { useRouter } from "next/navigation";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoCard } from "@/components/ui/info-card";
import { MapPin, Phone, User, Calendar, MessageSquare, ExternalLink, AlertTriangle } from "lucide-react";
import type { LeadRow } from "@/lib/db/queries";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  qualified: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  booked: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  retained: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function LeadDetailPipelineSheet({
  lead,
  onOpenChange,
}: {
  lead: LeadRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <Sheet open={!!lead} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {lead?.name ?? "Unknown caller"}
            <Badge variant="outline" className={statusColors[lead?.status ?? "new"] ?? ""}>
              {lead?.status ?? "new"}
            </Badge>
            {lead?.urgent && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </SheetTitle>
          <SheetDescription>{lead?.phone} · via {lead?.channel} · {lead?.source}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {lead && (
            <div className="space-y-5">
              {lead.message && (
                <div>
                  <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Message</div>
                  <p className="rounded-md bg-secondary/60 p-3 text-sm">{lead.message}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={Phone} label="Phone" value={lead.phone ?? "—"} />
                <InfoCard icon={MapPin} label="Locality" value={lead.locality ?? "—"} />
                <InfoCard icon={User} label="Segment" value={lead.segment?.toUpperCase() ?? "B2C"} />
                <InfoCard icon={Calendar} label="Created" value={lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "—"} />
                <InfoCard icon={MessageSquare} label="Channel" value={lead.channel ?? "—"} />
                <InfoCard icon={AlertTriangle} label="Urgent" value={lead.urgent ? "Yes" : "No"} />
              </div>
              {lead.segment === "b2b" && (
                <p className="rounded-md border border-accent/40 bg-accent/5 p-3 text-xs text-accent">
                  B2B lead — confirm whether the client needs a GST invoice before quoting.
                </p>
              )}
            </div>
          )}
        </SheetBody>

        <SheetFooter>
          {lead && (
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => { onOpenChange(false); router.push(`/leads`); }}>
              <ExternalLink className="mr-2 h-4 w-4" /> View in inbox
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
