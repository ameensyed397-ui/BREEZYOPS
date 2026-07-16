"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";

export type KanbanColumn<S extends string> = { id: S; label: string };
export type KanbanItem<S extends string> = { id: string; stage: S };

export function KanbanBoard<S extends string, T extends KanbanItem<S>>({
  columns,
  items,
  renderCard,
  onMove,
  onSelectItem,
  getLastActivity,
  agingDays = 5,
  emptyHint = "No cards here yet.",
}: {
  columns: KanbanColumn<S>[];
  items: T[];
  renderCard: (item: T, aging: boolean) => ReactNode;
  onMove: (id: string, stage: S) => Promise<void>;
  onSelectItem?: (id: string) => void;
  getLastActivity?: (item: T) => Date | null | undefined;
  agingDays?: number;
  emptyHint?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const [dragOptimistic, setDragOptimistic] = useState<T[] | null>(null);
  const displayItems = dragOptimistic ?? items;
  const [activeId, setActiveId] = useState<string | null>(null);

  const agingMap = useMemo(() => {
    const now = Date.now(); // eslint-disable-line react-hooks/purity -- Date.now() in useMemo is deterministic per render
    const map = new Map<string, boolean>();
    for (const item of displayItems) {
      const last = getLastActivity?.(item);
      const age = last ? (now - new Date(last).getTime()) / 86400000 : 0;
      map.set(item.id, age > agingDays);
    }
    return map;
  }, [displayItems, getLastActivity, agingDays]);

  const byColumn = useMemo(() => {
    const map = new Map<S, T[]>();
    for (const col of columns) map.set(col.id, []);
    for (const item of displayItems) map.get(item.stage)?.push(item);
    return map;
  }, [displayItems, columns]);

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const itemId = String(active.id);
    const newStage = over.id as S;
    const item = displayItems.find((i) => i.id === itemId);
    if (!item || item.stage === newStage) return;

    const optimistic = displayItems.map((i) => (i.id === itemId ? { ...i, stage: newStage } : i));
    setDragOptimistic(optimistic);
    try {
      await onMove(itemId, newStage);
    } catch {
      setDragOptimistic(null);
      toast.error("Move failed. Please try again.");
    }
  }

  const activeItem = displayItems.find((i) => i.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div aria-live="polite" className="sr-only">{activeId ? `Moving card ${activeId}` : ""}</div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumnView
            key={col.id}
            column={col}
            items={byColumn.get(col.id) ?? []}
            renderCard={renderCard}
            agingMap={agingMap}
            emptyHint={emptyHint}
            onSelectItem={onSelectItem}
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
  renderCard,
  agingMap,
  emptyHint,
  onSelectItem,
}: {
  column: KanbanColumn<S>;
  items: T[];
  renderCard: (item: T, aging: boolean) => ReactNode;
  agingMap: Map<string, boolean>;
  emptyHint: string;
  onSelectItem?: (id: string) => void;
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
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed py-8 text-center text-xs text-muted-foreground">
            {emptyHint}
          </div>
        ) : (
          items.map((item) => (
              <DraggableCard key={item.id} id={item.id} onSelect={onSelectItem ? () => onSelectItem(item.id) : undefined}>
                {renderCard(item, agingMap.get(item.id) ?? false)}
              </DraggableCard>
          ))
        )}
      </div>
    </div>
  );
}

function DraggableCard({ id, children, onSelect }: { id: string; children: ReactNode; onSelect?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/card relative rounded-lg transition-shadow",
        isDragging && "opacity-40",
        onSelect && "cursor-pointer"
      )}
      onClick={onSelect}
    >
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 left-2 z-10 cursor-grab touch-none active:cursor-grabbing rounded-md bg-secondary/80 p-1 text-muted-foreground/50 opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-secondary hover:text-muted-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      {children}
    </div>
  );
}
