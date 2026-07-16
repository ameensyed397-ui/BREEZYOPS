"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DocumentDetailSheet } from "./document-detail-sheet";
import type { DocumentRow, MediaRow } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";

type D = DocumentRow;
type M = MediaRow;

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
  doc?: D;
  media?: M;
};

function Thumbnail({ item }: { item: CombinedItem }) {
  if (item.source === "media") {
    const grad = photoGradients[item.category ?? "other"] ?? photoGradients.other;
    return (
      <div className={`relative flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br ${grad} overflow-hidden`}>
        <ImageIcon className="h-8 w-8 text-white/80" />
        {item.category && (
          <span className="absolute bottom-1.5 left-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white capitalize backdrop-blur-sm">
            {item.category}
          </span>
        )}
      </div>
    );
  }

  const grad = docGradients[item.type] ?? docGradients.other;
  const label = item.type === "invoice" ? "INV" : item.type === "quote" ? "QUO" : item.type === "contract" ? "CTR" : item.type === "report" ? "RPT" : item.type === "sop" ? "SOP" : "DOC";
  return (
    <div className={`relative flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br ${grad} overflow-hidden`}>
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl font-bold text-white/90 leading-none">{label}</span>
        <span className="text-[10px] font-medium text-white/60">PDF</span>
      </div>
    </div>
  );
}

export function DocumentLibrary({ documents, media }: { documents: D[]; media: M[] }) {
  const [tab, setTab] = useState<"all" | "docs" | "photos">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CombinedItem | null>(null);

  const items: CombinedItem[] = useMemo(() => {
    const docs: CombinedItem[] = documents.map((d) => ({
      id: d.id, name: d.name, type: d.type, customerName: d.customerName,
      storagePath: d.storagePath, createdAt: d.createdAt, updatedAt: d.updatedAt,
      source: "doc" as const, doc: d,
    }));
    const photos: CombinedItem[] = media.map((m) => ({
      id: m.id, name: m.storagePath?.split("/").pop() ?? "Photo",
      type: "photo", customerName: m.customerName,
      storagePath: m.storagePath, createdAt: m.createdAt, updatedAt: m.updatedAt,
      category: m.category, source: "media" as const, media: m,
    }));
    return [...docs, ...photos];
  }, [documents, media]);

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        if (tab === "docs") return item.source === "doc";
        if (tab === "photos") return item.source === "media";
        return true;
      })
      .filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.customerName?.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        );
      });
  }, [items, tab, search]);

  const stats = useMemo(() => ({
    total: items.length,
    docs: items.filter((i) => i.source === "doc").length,
    photos: items.filter((i) => i.source === "media").length,
  }), [items]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "docs" | "photos")}>
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="docs">Documents ({stats.docs})</TabsTrigger>
            <TabsTrigger value="photos">Photos ({stats.photos})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, customer, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search documents"
            className="pl-9 sm:w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {search ? "No files match your search." : "No documents or photos yet — files auto-appear from jobs and invoices."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <button
              key={`${item.source}-${item.id}`}
              onClick={() => setSelected(item)}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
            >
              <div className="aspect-[4/3] w-full p-2">
                <Thumbnail item={item} />
              </div>
              <div className="flex flex-col gap-1 px-3 pb-3 pt-1">
                <span className="truncate text-sm font-medium leading-tight">{item.name}</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant={typeVariant[item.type] ?? "secondary"} className="text-[9px] px-1.5 py-0">
                    {item.type}
                  </Badge>
                  {item.customerName && (
                    <span className="truncate text-[11px] text-muted-foreground">{item.customerName}</span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-2.5 w-2.5" />{formatDate(item.createdAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <DocumentDetailSheet
        item={selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}
