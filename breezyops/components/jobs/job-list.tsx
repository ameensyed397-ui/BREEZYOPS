"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, MapPin, User, Calendar, AlertTriangle } from "lucide-react";
import { JobDetailSheet } from "./job-detail-sheet";
import type { MockJob } from "@/lib/db/mock";

type J = MockJob;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  dispatched: "secondary",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
};

const statusLabel: Record<string, string> = {
  scheduled: "Scheduled",
  dispatched: "Dispatched",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function isToday(d?: Date | null) {
  if (!d) return false;
  const today = new Date();
  const date = new Date(d);
  return date.toDateString() === today.toDateString();
}

function isTomorrow(d?: Date | null) {
  if (!d) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(d);
  return date.toDateString() === tomorrow.toDateString();
}

function relativeDate(d?: Date | null) {
  if (!d) return "—";
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return formatDate(d);
}

export function JobList({ jobs }: { jobs: J[] }) {
  const [tab, setTab] = useState<"all" | "scheduled" | "in_progress" | "completed">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<J | null>(null);

  const filtered = useMemo(() => {
    return jobs
      .filter((j) => {
        if (tab === "all") return true;
        if (tab === "in_progress") return j.status === "in_progress" || j.status === "dispatched";
        return j.status === tab;
      })
      .filter((j) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          j.customerName?.toLowerCase().includes(q) ||
          j.serviceName?.toLowerCase().includes(q) ||
          j.locality?.toLowerCase().includes(q)
        );
      });
  }, [jobs, tab, search]);

  const stats = useMemo(() => ({
    total: jobs.length,
    scheduled: jobs.filter((j) => j.status === "scheduled").length,
    dispatched: jobs.filter((j) => j.status === "dispatched").length,
    inProgress: jobs.filter((j) => j.status === "in_progress").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    today: jobs.filter((j) => isToday(j.scheduledAt)).length,
  }), [jobs]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({stats.scheduled})</TabsTrigger>
            <TabsTrigger value="in_progress">Active ({stats.dispatched + stats.inProgress})</TabsTrigger>
            <TabsTrigger value="completed">Done ({stats.completed})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search customer, service, locality…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-64"
          />
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            {stats.today} job{stats.today !== 1 ? "s" : ""} today
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {search ? "No jobs match your search." : "No jobs assigned."}
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {filtered.map((job) => (
            <li key={job.id}>
              <button
                onClick={() => setSelected(job)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Wrench className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{job.customerName}</span>
                    <Badge variant={statusVariant[job.status]} className="text-[10px]">
                      {statusLabel[job.status]}
                    </Badge>
                    {isToday(job.scheduledAt) && job.status !== "completed" && job.status !== "cancelled" && (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <AlertTriangle className="h-3 w-3" />Today
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{job.serviceName}</p>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />{relativeDate(job.scheduledAt)} {formatTime(job.scheduledAt)}
                  </span>
                  {job.locality && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />{job.locality}
                    </span>
                  )}
                  {job.technicianName && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />{job.technicianName}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <JobDetailSheet job={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}
