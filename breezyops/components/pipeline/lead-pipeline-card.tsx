import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { Lead } from "@/lib/db/schema";

export function LeadPipelineCard({
  lead,
  aging,
}: {
  lead: Lead & { locality?: string };
  aging: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{lead.name ?? "Unknown"}</span>
        {lead.urgent && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{lead.message}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground">{lead.locality ?? "—"}</span>
        {aging && (
          <Badge variant="destructive" className="shrink-0 text-[10px]">Stalled</Badge>
        )}
      </div>
    </Card>
  );
}
