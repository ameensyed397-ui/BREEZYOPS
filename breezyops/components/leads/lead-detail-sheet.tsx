"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadRow } from "@/lib/db/queries";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoCard } from "@/components/ui/info-card";
import { CalendarPlus, UserPlus, XCircle, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { updateLeadStatusAction } from "@/app/actions";

type L = LeadRow;

export function LeadDetailSheet({ lead, onOpenChange }: { lead: L | null; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [markingLost, setMarkingLost] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [lostError, setLostError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleQualify() {
    if (!lead) return;
    setLoading(true);
    try {
      await updateLeadStatusAction(lead.id, "qualified");
      toast.success("Lead qualified.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to qualify lead.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkLost() {
    if (!lead) return;
    if (!lostReason.trim()) {
      setLostError("Please provide a reason for marking this lead as lost.");
      return;
    }
    setLostError("");
    setLoading(true);
    try {
      await updateLeadStatusAction(lead.id, "lost", lostReason.trim());
      toast.success("Lead marked as lost.");
      setMarkingLost(false);
      setLostReason("");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to mark lead as lost.");
    } finally {
      setLoading(false);
    }
  }

  function handleBookNow() {
    if (!lead) return;
    const params = new URLSearchParams();
    if (lead.name) params.set("name", lead.name);
    if (lead.phone) params.set("phone", lead.phone);
    if (lead.locality) params.set("locality", lead.locality);
    params.set("leadId", lead.id);
    onOpenChange(false);
    router.push(`/schedule?${params.toString()}`);
  }

  return (
    <Sheet open={!!lead} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {lead?.name ?? "Unknown caller"}
            {lead?.segment === "b2b" && <Badge variant="outline" className="border-accent text-accent">B2B</Badge>}
          </SheetTitle>
          <SheetDescription>{lead?.phone} · via {lead?.channel} · {lead?.source}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {lead && (
            <div className="space-y-5 text-sm">
              <div>
                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Message</div>
                <p className="rounded-md bg-secondary/60 p-3">{lead.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={MapPin} label="Locality" value={lead.locality ?? "—"} />
                <InfoCard icon={Phone} label="Phone" value={lead.phone ?? "—"} />
                <InfoCard icon={UserPlus} label="Status" value={lead.status ?? "new"} />
                <InfoCard icon={XCircle} label="Urgent" value={lead.urgent ? "Yes" : "No"} />
              </div>
              {lead.segment === "b2b" && (
                <p className="rounded-md border border-accent/40 bg-accent/5 p-3 text-xs text-accent">
                  B2B lead — confirm whether the client needs a GST invoice before quoting.
                </p>
              )}
              {markingLost && (
                <div className="space-y-1.5">
                  <Label htmlFor="lost-reason">Reason for marking lost</Label>
                  <Input
                    id="lost-reason"
                    placeholder="e.g. Customer went with competitor"
                    value={lostReason}
                    onChange={(e) => { setLostReason(e.target.value); setLostError(""); }}
                  />
                  {lostError && <p className="text-xs text-destructive">{lostError}</p>}
                </div>
              )}
            </div>
          )}
        </SheetBody>

        <SheetFooter>
          <Button className="w-full" disabled={loading} onClick={handleQualify}>
            <UserPlus className="mr-2 h-4 w-4" /> Qualify
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleBookNow}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Book now
          </Button>
          {markingLost ? (
            <Button variant="destructive" className="w-full" disabled={loading} onClick={handleMarkLost}>
              <XCircle className="mr-2 h-4 w-4" /> Confirm lost
            </Button>
          ) : (
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setMarkingLost(true)}>
              <XCircle className="mr-2 h-4 w-4" /> Mark lost
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
