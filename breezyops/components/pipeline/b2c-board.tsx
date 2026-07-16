"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KanbanBoard, type KanbanColumn } from "./kanban-board";
import { LeadPipelineCard } from "./lead-pipeline-card";
import { LeadDetailPipelineSheet } from "./lead-detail-pipeline-sheet";
import { Input } from "@/components/ui/input";
import type { LeadRow } from "@/lib/db/queries";
import { toast } from "sonner";
import { updateLeadStatusAction } from "@/app/actions";

type LeadStage = "new" | "qualified" | "booked" | "completed" | "paid" | "retained";
type L = LeadRow & { stage: LeadStage };

const columns: KanbanColumn<LeadStage>[] = [
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "booked", label: "Booked" },
  { id: "completed", label: "Completed" },
  { id: "paid", label: "Paid" },
  { id: "retained", label: "Retained" },
];

export function B2CBoard({ leads }: { leads: LeadRow[] }) {
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<L | null>(null);
  const router = useRouter();

  const items: L[] = useMemo(
    () =>
      leads
        .filter((l) => l.status !== "lost")
        .filter(
          (l) =>
            !search ||
            l.name?.toLowerCase().includes(search.toLowerCase()) ||
            l.phone?.includes(search)
        )
        .map((l) => ({ ...l, stage: (l.status ?? "new") as LeadStage })),
    [leads, search]
  );

  async function handleMove(id: string, stage: LeadStage) {
    try {
      await updateLeadStatusAction(id, stage);
      toast.success(`Moved to ${stage}.`);
      router.refresh();
    } catch {
      toast.error("Failed to move. Please try again.");
    }
  }

  return (
    <div>
      <Input
        placeholder="Search by name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
        aria-label="Search leads"
      />
      <KanbanBoard
        columns={columns}
        items={items}
        renderCard={(item, aging) => <LeadPipelineCard lead={item} aging={aging} />}
        onMove={handleMove}
        onSelectItem={(id) => { const l = items.find((x) => x.id === id); if (l) setSelectedLead(l); }}
        getLastActivity={(item) => item.updatedAt}
        emptyHint="No leads at this stage."
      />
      <LeadDetailPipelineSheet lead={selectedLead} onOpenChange={(o) => !o && setSelectedLead(null)} />
    </div>
  );
}
