"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type KanbanColumn<S extends string> = { id: S; label: string };
export type KanbanItem<S extends string> = { id: string; stage: S };

export function KanbanBoard<S extends string, T extends KanbanItem<S>>({
  columns,
  items,
  renderCard,
  onMove,
  getLastActivity,
  agingDays = 5,
  emptyHint = "No cards here yet.",
}: {
  columns: KanbanColumn<S>[];
  items: T[];
  renderCard: (item: T, aging: boolean) => ReactNode;
  onMove: (id: string, stage: S) => Promise<void>;
  getLastActivity?: (item: T) => Date | null | undefined;
  agingDays?: number;
  emptyHint?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [local, setLocal] = useState(items);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => setLocal(items), [items]);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const byColumn = useMemo(() => {
    const map = new Map<S, T[]>();
    for (const col of columns) map.set(col.id, []);
    for (const item of local) map.get(item.stage)?.push(item);
    return map;
  }, [local, columns]);

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const itemId = String(active.id);
    const newStage = over.id as S;
    const item = local.find((i) => i.id === itemId);
    if (!item || item.stage === newStage) return;

    const prev = local;
    setLocal((cur) => cur.map((i) => (i.id === itemId ? { ...i, stage: newStage } : i)));
    try {
      await onMove(itemId, newStage);
    } catch {
      setLocal(prev);
    }
  }

  const activeItem = local.find((i) => i.id === activeId);

  return (
    <DndContext
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumnView
            key={col.id}
            column={col}
            items={byColumn.get(col.id) ?? []}
            loading={loading}
            renderCard={renderCard}
            getLastActivity={getLastActivity}
            agingDays={agingDays}
            emptyHint={emptyHint}
          />
        ))}
      </div>
      <DragOverlay>{activeItem ? renderCard(activeItem, false) : null}</DragOverlay>
    </DndContext>
  );
}

function KanbanColumnView<S extends string, T extends KanbanItem<S>>({
  column,
  items,
  loading,
  renderCard,
  getLastActivity,
  agingDays,
  emptyHint,
}: {
  column: KanbanColumn<S>;
  items: T[];
  loading: boolean;
  renderCard: (item: T, aging: boolean) => ReactNode;
  getLastActivity?: (item: T) => Date | null | undefined;
  agingDays: number;
  emptyHint: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-secondary/30 p-2",
        isOver && "ring-2 ring-primary"
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-medium">{column.label}</span>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {loading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-dashed py-8 text-center text-xs text-muted-foreground">
            {emptyHint}
          </div>
        ) : (
          items.map((item) => {
            const last = getLastActivity?.(item);
            const age = last ? (Date.now() - new Date(last).getTime()) / 86400000 : 0;
            return (
              <DraggableCard key={item.id} id={item.id}>
                {renderCard(item, age > agingDays)}
              </DraggableCard>
            );
          })
        )}
      </div>
    </div>
  );
}

function DraggableCard({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
    >
      {children}
    </div>
  );
}
