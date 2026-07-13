"use client";

import type { Lead } from "@/lib/db/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";

type L = Lead & { locality?: string };

export function LeadDetailSheet({ lead, onOpenChange }: { lead: L | null; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={!!lead} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {lead.name ?? "Unknown caller"}
                {lead.segment === "b2b" && <Badge variant="outline" className="border-accent text-accent">B2B</Badge>}
              </SheetTitle>
              <SheetDescription>{lead.phone} · via {lead.channel} · {lead.source}</SheetDescription>
            </SheetHeader>

            <div className="space-y-4 py-4 text-sm">
              <div>
                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Message</div>
                <p className="rounded-md bg-secondary/60 p-3">{lead.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Info label="Locality" value={lead.locality ?? "—"} />
                <Info label="Urgent" value={lead.urgent ? "Yes" : "No"} />
                <Info label="AI disclosed" value={lead.aiDisclosed ? "Yes" : "No"} />
                <Info label="Status" value={lead.status ?? "new"} />
              </div>
              {lead.segment === "b2b" && (
                <p className="rounded-md border border-accent/40 bg-accent/5 p-3 text-xs text-accent">
                  B2B lead — confirm whether the client needs a GST invoice before quoting. Breezyair is currently pre-GST.
                </p>
              )}
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button className="w-full" onClick={() => toast.success("Qualified — booking flow opens next (F03).")}>
                <UserPlus className="mr-2 h-4 w-4" /> Qualify &amp; create customer
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => toast("Opening scheduler (F03)…")}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Book now
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground"
                onClick={() => toast("Mark lost — reason required.")}>
                <XCircle className="mr-2 h-4 w-4" /> Mark lost
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="capitalize">{value}</div>
    </div>
  );
}
