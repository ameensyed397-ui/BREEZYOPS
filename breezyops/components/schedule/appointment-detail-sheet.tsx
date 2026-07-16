"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Calendar, Clock, MapPin, User, CheckCircle, XCircle, RotateCcw, Ban,
} from "lucide-react";
import { updateAppointmentStatusAction } from "@/app/actions";
import type { AppointmentRow } from "@/lib/db/queries";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  rescheduled: "secondary",
  done: "secondary",
  no_show: "destructive",
  cancelled: "destructive",
};

const statusActions: Record<string, { label: string; icon: typeof CheckCircle; next: string; variant: "default" | "outline" | "destructive" }[]> = {
  scheduled: [
    { label: "Mark complete", icon: CheckCircle, next: "done", variant: "default" },
    { label: "Reschedule", icon: RotateCcw, next: "rescheduled", variant: "outline" },
    { label: "No show", icon: XCircle, next: "no_show", variant: "outline" },
    { label: "Cancel", icon: Ban, next: "cancelled", variant: "destructive" },
  ],
  rescheduled: [
    { label: "Mark complete", icon: CheckCircle, next: "done", variant: "default" },
    { label: "No show", icon: XCircle, next: "no_show", variant: "outline" },
    { label: "Cancel", icon: Ban, next: "cancelled", variant: "destructive" },
  ],
  done: [],
  no_show: [],
  cancelled: [],
};

function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function fmtTime(d: Date) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function AppointmentDetailSheet({
  open, onOpenChange, appointment, onStatusChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  appointment: AppointmentRow | null;
  onStatusChange: (id: string, status: string) => void;
}) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<{ label: string; next: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!appointment) return null;

  const actions = statusActions[appointment.status] ?? [];

  async function handleStatusChange(nextStatus: string) {
    setSaving(true);
    try {
      await updateAppointmentStatusAction(appointment!.id, nextStatus);
      onStatusChange(appointment!.id, nextStatus);
      toast.success(`Appointment ${nextStatus === "done" ? "completed" : nextStatus.replaceAll("_", " ")}`);
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to update appointment");
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Appointment details</SheetTitle>
            <SheetDescription>
              {fmtDate(appointment.startAt)} · {fmtTime(appointment.startAt)} – {fmtTime(appointment.endAt)}
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={statusVariant[appointment.status] ?? "default"}>
                  {appointment.status.replaceAll("_", " ")}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{appointment.customerName}</p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>

                {appointment.technicianName && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {initials(appointment.technicianName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{appointment.technicianName}</p>
                      <p className="text-xs text-muted-foreground">Technician</p>
                    </div>
                  </div>
                )}

                {appointment.serviceName && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{appointment.serviceName}</p>
                      <p className="text-xs text-muted-foreground">Service</p>
                    </div>
                  </div>
                )}

                {appointment.locality && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{appointment.locality}</p>
                      <p className="text-xs text-muted-foreground">Locality</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {fmtTime(appointment.startAt)} – {fmtTime(appointment.endAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">Time slot</p>
                  </div>
                </div>
              </div>

              {appointment.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
                  </div>
                </>
              )}
            </div>
          </SheetBody>

          {actions.length > 0 && (
            <SheetFooter>
              <div className="flex flex-col gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.next}
                    variant={action.variant}
                    size="sm"
                    className="w-full"
                    onClick={() => setConfirmAction({ label: action.label, next: action.next })}
                  >
                    <action.icon className="mr-1.5 h-3.5 w-3.5" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this appointment as{" "}
              <span className="font-medium text-foreground">
                {confirmAction?.next.replaceAll("_", " ")}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col">
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={() => confirmAction && handleStatusChange(confirmAction.next)}
              className={confirmAction?.next === "cancelled" || confirmAction?.next === "no_show"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
              }
            >
              {saving ? "Saving…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
