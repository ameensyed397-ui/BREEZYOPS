import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { DealRow } from "@/lib/db/queries";

function formatInr(value: string | null) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(value)
  );
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

export function DealPipelineCard({
  deal,
  aging,
}: {
  deal: DealRow;
  aging: boolean;
}) {
  return (
    <Card className="p-3 select-none">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{deal.customerName}</span>
        <div className="flex items-center gap-1">
          {deal.gstRequired && (
            <Badge variant="outline" className="shrink-0 border-accent text-[10px] text-accent">GST</Badge>
          )}
          {aging && <Badge variant="destructive" className="shrink-0 text-[10px]">Stalled</Badge>}
        </div>
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{deal.title}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{formatInr(deal.value)}</span>
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs text-muted-foreground">{deal.locality ?? "—"}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${stageColors[deal.stage] ?? "bg-secondary text-muted-foreground"}`}>
            {deal.stage}
          </span>
        </div>
      </div>
    </Card>
  );
}
