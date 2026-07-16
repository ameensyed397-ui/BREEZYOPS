"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import { FileText, Image as ImageIcon, Calendar, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { InfoCard } from "@/components/ui/info-card";

type CombinedItem = {
  id: string;
  name: string;
  type: string;
  customerName?: string;
  storagePath: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  category?: string | null;
  source: "doc" | "media";
};

const typeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  invoice: "default",
  quote: "outline",
  contract: "secondary",
  sop: "outline",
  report: "secondary",
  other: "secondary",
};

const photoGradients: Record<string, string> = {
  before: "from-sky-400/80 to-blue-600/80",
  after: "from-emerald-400/80 to-green-600/80",
  issue: "from-amber-400/80 to-orange-600/80",
  other: "from-slate-400/80 to-gray-600/80",
};

const docGradients: Record<string, string> = {
  invoice: "from-violet-500/90 to-purple-700/90",
  quote: "from-sky-500/90 to-indigo-700/90",
  contract: "from-teal-500/90 to-cyan-700/90",
  report: "from-amber-500/90 to-orange-700/90",
  sop: "from-rose-500/90 to-pink-700/90",
  other: "from-gray-400/90 to-gray-600/90",
};

function PreviewCard({ item }: { item: CombinedItem }) {
  if (item.source === "media") {
    const grad = photoGradients[item.category ?? "other"] ?? photoGradients.other;
    return (
      <div className={`relative flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br ${grad} overflow-hidden shadow-inner`}>
        <ImageIcon className="h-14 w-14 text-white/70" />
        {item.category && (
          <span className="absolute bottom-3 left-3 rounded-md bg-black/40 px-2 py-1 text-xs font-medium text-white capitalize backdrop-blur-sm">
            {item.category}
          </span>
        )}
      </div>
    );
  }

  const grad = docGradients[item.type] ?? docGradients.other;
  const label = item.type === "invoice" ? "INV" : item.type === "quote" ? "QUO" : item.type === "contract" ? "CTR" : item.type === "report" ? "RPT" : item.type === "sop" ? "SOP" : "DOC";
  return (
    <div className={`relative flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br ${grad} overflow-hidden shadow-inner`}>
      <div className="flex flex-col items-center gap-2">
        <FileText className="h-5 w-5 text-white/80" />
        <span className="text-3xl font-bold text-white/90 leading-none tracking-tight">{label}</span>
        <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider backdrop-blur-sm">
          PDF Document
        </span>
      </div>
    </div>
  );
}

export function DocumentDetailSheet({
  item,
  onOpenChange,
}: {
  item: CombinedItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="truncate">{item?.name}</span>
            <Badge variant={typeVariant[item?.type ?? ""] ?? "secondary"} className="text-[10px]">
              {item?.type}
            </Badge>
            {item?.category && (
              <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>{item?.customerName ?? "General document"}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {item && (
            <div className="space-y-5">
              <PreviewCard item={item} />

              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={FileText} label="Type" value={item.type} />
                <InfoCard icon={Calendar} label="Created" value={formatDate(item.createdAt)} />
                <InfoCard icon={Calendar} label="Updated" value={formatDate(item.updatedAt)} />
                {item.category && (
                  <InfoCard icon={ImageIcon} label="Category" value={item.category} />
                )}
              </div>

              {item.storagePath && (
                <div>
                  <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Storage</div>
                  <p className="rounded-md bg-secondary/60 p-3 font-mono text-xs text-muted-foreground break-all">{item.storagePath}</p>
                </div>
              )}
            </div>
          )}
        </SheetBody>

        <SheetFooter>
          <Button className="flex-1 sm:flex-none" onClick={() => {
            if (item?.storagePath) {
              window.open(item.storagePath, "_blank", "noopener,noreferrer");
            } else {
              toast.info("Download coming soon — storage URL not available.");
            }
          }}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          {confirmDelete ? (
            <>
              <Button variant="destructive" onClick={() => { toast.success("Document deleted — this is a demo."); setConfirmDelete(false); }}>
                <Trash2 className="mr-2 h-4 w-4" /> Confirm delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
