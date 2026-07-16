"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KanbanBoard, type KanbanColumn } from "./kanban-board";
import { DealPipelineCard } from "./deal-pipeline-card";
import { DealDetailSheet } from "./deal-detail-sheet";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DealRow } from "@/lib/db/queries";
import { toast } from "sonner";
import { updateDealStageAction } from "@/app/actions";

type DealStage = Exclude<DealRow["stage"], "lost">;
type D = DealRow;

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
  const [optimisticOverride, setOptimisticOverride] = useState<D[] | null>(null);
  const items = optimisticOverride ?? deals;
  const [gstWarning, setGstWarning] = useState<{ id: string } | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<D | null>(null);
  const router = useRouter();

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

  async function handleMove(id: string, stage: DealStage) {
    const deal = items.find((d) => d.id === id);
    if (stage === "won" && deal?.gstRequired) {
      setGstWarning({ id });
      throw new Error("blocked-pending-gst-confirmation");
    }
    await updateDealStageAction(id, stage);
    setOptimisticOverride((cur) => (cur ?? items).map((d) => (d.id === id ? { ...d, stage } : d)));
    toast.success(`Moved to ${stage}.`);
    router.refresh();
  }

  async function confirmWon() {
    if (!gstWarning) return;
    await updateDealStageAction(gstWarning.id, "won");
    setOptimisticOverride((cur) => (cur ?? items).map((d) => (d.id === gstWarning.id ? { ...d, stage: "won" as DealStage } : d)));
    toast.success("Marked won.");
    setGstWarning(null);
    router.refresh();
  }

  return (
    <div>
      <Input
        placeholder="Search by deal or customer…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
        aria-label="Search deals"
      />
      <KanbanBoard
        columns={columns}
        items={filtered}
        renderCard={(item, aging) => <DealPipelineCard deal={item} aging={aging} />}
        onMove={handleMove}
        onSelectItem={(id) => { const d = items.find((x) => x.id === id); if (d) setSelectedDeal(d); }}
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
      <DealDetailSheet deal={selectedDeal} onOpenChange={(o) => !o && setSelectedDeal(null)} />
    </div>
  );
}
