import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
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

export function LeadPipelineCard({
  lead,
  aging,
}: {
  lead: LeadRow;
  aging: boolean;
}) {
  return (
    <Card className="p-3 select-none">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{lead.name ?? "Unknown"}</span>
        <div className="flex items-center gap-1">
          {lead.urgent && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
          {aging && <Badge variant="destructive" className="shrink-0 text-[10px]">Stalled</Badge>}
        </div>
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{lead.message}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground">{lead.locality ?? "—"}</span>
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusColors[lead.status ?? "new"] ?? "bg-secondary text-muted-foreground"}`}>
          {lead.status ?? "new"}
        </span>
      </div>
    </Card>
  );
}
