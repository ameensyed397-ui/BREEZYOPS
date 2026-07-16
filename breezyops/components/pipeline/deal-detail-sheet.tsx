"use client";

import { useRouter } from "next/navigation";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoCard } from "@/components/ui/info-card";
import { MapPin, User, IndianRupee, Calendar, ExternalLink } from "lucide-react";
import type { DealRow } from "@/lib/db/queries";

function formatInr(value: string | null) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}

const stageColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  qualified: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  survey: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  proposal: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  negotiation: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function DealDetailSheet({
  deal,
  onOpenChange,
}: {
  deal: DealRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <Sheet open={!!deal} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {deal?.customerName ?? "Deal"}
            <Badge variant="outline" className={stageColors[deal?.stage ?? "new"] ?? ""}>
              {deal?.stage}
            </Badge>
            {deal?.gstRequired && (
              <Badge variant="secondary" className="text-[10px]">GST</Badge>
            )}
          </SheetTitle>
          <SheetDescription>{deal?.title}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {deal && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={User} label="Customer" value={deal.customerName} />
                <InfoCard icon={IndianRupee} label="Value" value={formatInr(deal.value)} highlight />
                <InfoCard icon={MapPin} label="Locality" value={deal.locality ?? "—"} />
                <InfoCard icon={Calendar} label="Created" value={new Date(deal.createdAt).toLocaleDateString("en-IN")} />
              </div>

              {deal.gstRequired && (
                <p className="rounded-md border border-accent/40 bg-accent/5 p-3 text-xs text-accent">
                  GST invoice required for this deal.
                </p>
              )}

              {deal.lostReason && (
                <div>
                  <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Lost reason</div>
                  <p className="rounded-md bg-secondary/60 p-3 text-sm">{deal.lostReason}</p>
                </div>
              )}
            </div>
          )}
        </SheetBody>

        <SheetFooter>
          {deal && (
            <Button variant="outline" className="w-full" onClick={() => { onOpenChange(false); router.push(`/customers/${deal.customerId}`); }}>
              <ExternalLink className="mr-2 h-4 w-4" /> View customer
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
