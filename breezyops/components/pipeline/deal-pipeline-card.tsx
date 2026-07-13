import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Deal } from "@/lib/db/schema";

function formatInr(value: string | null) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(value)
  );
}

export function DealPipelineCard({
  deal,
  aging,
}: {
  deal: Deal & { customerName: string; locality?: string };
  aging: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{deal.customerName}</span>
        {deal.gstRequired && (
          <Badge variant="outline" className="shrink-0 border-accent text-[10px] text-accent">GST</Badge>
        )}
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{deal.title}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{formatInr(deal.value)}</span>
        <div className="flex items-center gap-1">
          <span className="truncate text-xs text-muted-foreground">{deal.locality ?? "—"}</span>
          {aging && <Badge variant="destructive" className="shrink-0 text-[10px]">Stalled</Badge>}
        </div>
      </div>
    </Card>
  );
}
