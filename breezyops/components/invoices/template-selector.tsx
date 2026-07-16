"use client";

import { Badge } from "@/components/ui/badge";
import { invoiceTemplates } from "@/lib/db/mock";
import type { InvoiceTemplate } from "@/lib/db/mock";
import { cn } from "@/lib/utils";

export function TemplateSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase text-muted-foreground">Template</div>
      <div className="grid grid-cols-3 gap-2">
        {invoiceTemplates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors",
              selected === t.id
                ? "border-foreground bg-secondary/60"
                : "hover:bg-secondary/40"
            )}
          >
            <div
              className="h-8 w-full rounded"
              style={{ backgroundColor: t.accent }}
            />
            <span className="text-xs font-medium">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getTemplateById(id: string): InvoiceTemplate {
  return invoiceTemplates.find((t) => t.id === id) ?? invoiceTemplates[0];
}
