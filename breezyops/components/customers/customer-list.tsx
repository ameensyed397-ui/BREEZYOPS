"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, MapPin, Wrench, IndianRupee } from "lucide-react";
import { CustomerDetailSheet } from "./customer-detail-sheet";
import type { MockCustomer } from "@/lib/db/mock";

type C = MockCustomer;

function formatRevenue(amount?: number) {
  if (!amount) return "—";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function CustomerList({ customers }: { customers: C[] }) {
  const [tab, setTab] = useState<"all" | "b2c" | "b2b">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<C | null>(null);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (tab === "b2c") return c.segment === "b2c";
      if (tab === "b2b") return c.segment === "b2b";
      return true;
    }).filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.locality?.toLowerCase().includes(q)
      );
    });
  }, [customers, tab, search]);

  const stats = useMemo(() => ({
    total: customers.length,
    b2c: customers.filter((c) => c.segment === "b2c").length,
    b2b: customers.filter((c) => c.segment === "b2b").length,
    revenue: customers.reduce((sum, c) => sum + (c.totalRevenue ?? 0), 0),
  }), [customers]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="b2c">B2C ({stats.b2c})</TabsTrigger>
            <TabsTrigger value="b2b">B2B ({stats.b2b})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search name, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-64"
          />
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            Total revenue: <span className="font-medium text-foreground">{formatRevenue(stats.revenue)}</span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {search ? "No customers match your search." : "No customers yet — convert a lead."}
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {filtered.map((customer) => (
            <li key={customer.id}>
              <button
                onClick={() => setSelected(customer)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  {customer.segment === "b2b"
                    ? <Building2 className="h-4 w-4" />
                    : <User className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{customer.name}</span>
                    <Badge variant="outline" className={
                      customer.segment === "b2b"
                        ? "border-accent text-accent"
                        : "border-muted-foreground/40 text-muted-foreground"
                    }>
                      {customer.segment.toUpperCase()}
                    </Badge>
                    {customer.gstRequired && (
                      <Badge variant="secondary" className="text-[10px]">GST</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {customer.locality && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{customer.locality}
                      </span>
                    )}
                    {customer.phone && <span>{customer.phone}</span>}
                  </div>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />{customer.jobCount ?? 0} jobs
                    </span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <IndianRupee className="h-3 w-3" />{formatRevenue(customer.totalRevenue)}
                    </span>
                  </div>
                  {customer.lastJob && (
                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                      Last: {customer.lastJob}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CustomerDetailSheet
        customer={selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}
