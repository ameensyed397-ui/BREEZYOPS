"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench, MapPin, User, Calendar, Shield, CheckCircle, XCircle, Camera } from "lucide-react";
import { toast } from "sonner";
import type { JobRow } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";
import { updateJobStatusAction } from "@/app/actions";
import { InfoCard } from "@/components/ui/info-card";

function formatTime(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  dispatched: "secondary",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
};

export function JobDetailSheet({
  job,
  onOpenChange,
}: {
  job: JobRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const defaultChecklist = [
    { id: "arrived", label: "Arrived on site" },
    { id: "diagnosed", label: "Diagnosed issue" },
    { id: "parts", label: "Parts replaced" },
    { id: "signoff", label: "Customer sign-off" },
  ];
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const effectiveStatus = jobStatus ?? job?.status ?? "scheduled";

  async function handleStatusChange(status: string) {
    if (!job) return;
    setIsUpdating(true);
    try {
      await updateJobStatusAction(job.id, status);
      setJobStatus(status);
      toast.success(`Job ${status.replace(/_/g, " ")}.`);
      router.refresh();
    } catch {
      toast.error("Failed to update job status.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Sheet open={!!job} onOpenChange={(open) => {
      if (!open) { setJobStatus(null); setIsUpdating(false); setConfirmCancel(false); }
      onOpenChange(open);
    }}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            {job?.customerName}
            <Badge variant={statusVariant[effectiveStatus]} className="text-[10px]">
              {effectiveStatus.replace(/_/g, " ")}
            </Badge>
          </SheetTitle>
          <SheetDescription>{job?.serviceName}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {job && (
            <Tabs defaultValue="overview" className="mt-1">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="checklist" className="flex-1">Checklist</TabsTrigger>
                <TabsTrigger value="photos" className="flex-1">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard icon={Calendar} label="Scheduled" value={`${formatDate(job.scheduledAt)} ${formatTime(job.scheduledAt)}`} />
                  <InfoCard icon={MapPin} label="Site" value={job.siteAddress ?? "—"} />
                  <InfoCard icon={User} label="Technician" value={job.technicianName ?? "—"} />
                  {job.warrantyUntil && (
                    <InfoCard icon={Shield} label="Warranty until" value={formatDate(job.warrantyUntil)} />
                  )}
                </div>
                {job.summary && (
                  <div>
                    <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Summary</div>
                    <p className="rounded-md bg-secondary/60 p-3 text-sm">{job.summary}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="checklist" className="pt-4">
                <div className="space-y-1">
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">Job checklist</div>
                  {defaultChecklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md p-3 transition-colors hover:bg-secondary/60"
                    >
                      <Checkbox
                        checked={checklist[item.id] ?? false}
                        onCheckedChange={(v: boolean | "indeterminate") =>
                          setChecklist((prev) => ({ ...prev, [item.id]: v === true }))
                        }
                      />
                      <span className={`text-sm ${checklist[item.id] ? "line-through text-muted-foreground" : ""}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="pt-4">
                <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                  <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  No photos yet. Photos are captured during the job visit.
                </div>
              </TabsContent>
            </Tabs>
          )}
        </SheetBody>

        <SheetFooter>
          {(effectiveStatus === "scheduled" || effectiveStatus === "dispatched") && (
            confirmCancel ? (
              <>
                <Button variant="destructive" className="w-full" disabled={isUpdating} onClick={() => handleStatusChange("cancelled")}>
                  Are you sure? Cancel
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setConfirmCancel(false)}>
                  Never mind
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" disabled={isUpdating} onClick={() => handleStatusChange("in_progress")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Start job
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setConfirmCancel(true)}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            )
          )}
          {effectiveStatus === "in_progress" && (
            <Button className="w-full" disabled={isUpdating} onClick={() => handleStatusChange("completed")}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark complete
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
