"use client";

import { useMemo, useState } from "react";
import { KanbanBoard, type KanbanColumn } from "./kanban-board";
import { DealPipelineCard } from "./deal-pipeline-card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Deal } from "@/lib/db/schema";
import { toast } from "sonner";

type DealStage = Exclude<Deal["stage"], "lost">;
type D = Deal & { customerName: string; locality?: string };

const columns: KanbanColumn<DealStage>[] = [
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "survey", label: "Survey" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiation", label: "Negotiation" },
  { id: "won", label: "Won" },
];

export function B2BBoard({ deals }: { deals: D[] }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(deals);
  const [gstWarning, setGstWarning] = useState<{ id: string } | null>(null);

  const filtered = useMemo(
    () =>
      items
        .filter((d) => d.stage !== "lost")
        .filter(
          (d) =>
            !search ||
            d.title.toLowerCase().includes(search.toLowerCase()) ||
            d.customerName.toLowerCase().includes(search.toLowerCase())
        )
        .map((d) => ({ ...d, stage: d.stage as DealStage })),
    [items, search]
  );

  // Stage changes are optimistic-only until deals persist for real (see Gaps #4 in the vault).
  async function handleMove(id: string, stage: DealStage) {
    const deal = items.find((d) => d.id === id);
    if (stage === "won" && deal?.gstRequired) {
      setGstWarning({ id });
      throw new Error("blocked-pending-gst-confirmation");
    }
    toast.success(`Moved to ${stage}.`);
  }

  function confirmWon() {
    if (!gstWarning) return;
    setItems((cur) => cur.map((d) => (d.id === gstWarning.id ? { ...d, stage: "won" } : d)));
    toast.success("Marked won — contract + subscription creation queued (F07/F08, not yet built).");
    setGstWarning(null);
  }

  return (
    <div>
      <Input
        placeholder="Search by deal or customer…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
      />
      <KanbanBoard
        columns={columns}
        items={filtered}
        renderCard={(item, aging) => <DealPipelineCard deal={item} aging={aging} />}
        onMove={handleMove}
        getLastActivity={(item) => item.lastActivityAt}
        emptyHint="No deals at this stage."
      />
      <Dialog open={!!gstWarning} onOpenChange={(o) => !o && setGstWarning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GST invoice required, but Breezyair is pre-GST</DialogTitle>
            <DialogDescription>
              This client needs a GST invoice to claim input credit. Confirm this is resolved
              (or accepted) before marking the deal won.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setGstWarning(null)}>Go back</Button>
            <Button onClick={confirmWon}>Mark won anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
