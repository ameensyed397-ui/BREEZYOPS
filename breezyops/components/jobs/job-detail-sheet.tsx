"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wrench, MapPin, User, Calendar, Shield, CheckCircle, XCircle, Camera } from "lucide-react";
import { toast } from "sonner";
import type { MockJob } from "@/lib/db/mock";

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

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
  job: MockJob | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!job} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {job && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                {job.customerName}
                <Badge variant={statusVariant[job.status]} className="text-[10px]">
                  {job.status.replace("_", " ")}
                </Badge>
              </SheetTitle>
              <SheetDescription>{job.serviceName}</SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="checklist" className="flex-1">Checklist</TabsTrigger>
                <TabsTrigger value="photos" className="flex-1">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard icon={Calendar} label="Scheduled" value={`${formatDate(job.scheduledAt)} ${formatTime(job.scheduledAt)}`} />
                  <InfoCard icon={MapPin} label="Site" value={job.siteAddress ?? "—"} />
                  <InfoCard icon={User} label="Technician" value={job.technicianName ?? "—"} />
                  {job.warrantyUntil && (
                    <InfoCard icon={Shield} label="Warranty until" value={formatDate(new Date(job.warrantyUntil))} />
                  )}
                </div>
                {job.summary && (
                  <div>
                    <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Summary</div>
                    <p className="rounded-md bg-secondary/60 p-3 text-sm">{job.summary}</p>
                  </div>
                )}
                {(job.status === "scheduled" || job.status === "dispatched") && (
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => toast.success("Job started — technician en route.")}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Start job
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground" onClick={() => toast("Job cancelled.")}>
                      <XCircle className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                )}
                {job.status === "in_progress" && (
                  <Button className="w-full" onClick={() => toast.success("Job completed — draft invoice created.")}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark complete
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="checklist" className="pt-4">
                <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                  Checklist will appear here once checklist templates (F04) are connected.
                </div>
              </TabsContent>

              <TabsContent value="photos" className="pt-4">
                <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                  <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  No photos yet. Photos are captured during the job visit.
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/40 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
        <Icon className="h-3 w-3" />{label}
      </div>
      <div className="truncate text-sm">{value}</div>
    </div>
  );
}
