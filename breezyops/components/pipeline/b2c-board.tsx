"use client";

import { useMemo, useState } from "react";
import { KanbanBoard, type KanbanColumn } from "./kanban-board";
import { LeadPipelineCard } from "./lead-pipeline-card";
import { Input } from "@/components/ui/input";
import type { Lead } from "@/lib/db/schema";
import { toast } from "sonner";

type LeadStage = Exclude<NonNullable<Lead["status"]>, "lost">;
type L = Lead & { locality?: string; stage: LeadStage };

const columns: KanbanColumn<LeadStage>[] = [
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "booked", label: "Booked" },
  { id: "completed", label: "Completed" },
  { id: "paid", label: "Paid" },
  { id: "retained", label: "Retained" },
];

export function B2CBoard({ leads }: { leads: (Lead & { locality?: string })[] }) {
  const [search, setSearch] = useState("");

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

  // Stage changes are optimistic-only until the DB is wired (see lib/db/index.ts).
  async function handleMove(id: string, stage: LeadStage) {
    toast.success(`Moved to ${stage}.`);
  }

  return (
    <div>
      <Input
        placeholder="Search by name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
      />
      <KanbanBoard
        columns={columns}
        items={items}
        renderCard={(item, aging) => <LeadPipelineCard lead={item} aging={aging} />}
        onMove={handleMove}
        getLastActivity={(item) => item.updatedAt}
        emptyHint="No leads at this stage."
      />
    </div>
  );
}
