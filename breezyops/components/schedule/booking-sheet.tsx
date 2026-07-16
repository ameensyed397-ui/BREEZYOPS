"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { AppointmentRow, CustomerRow } from "@/lib/db/queries";

type Technician = { id: string; fullName: string };
import { createAppointmentAction } from "@/app/actions";

export function BookingSheet({
  open, onOpenChange, date, customers, technicians, existing, onCreate, leadData,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  date: Date;
  customers: CustomerRow[];
  technicians: Technician[];
  existing: AppointmentRow[];
  onCreate: (appt: AppointmentRow) => void;
  leadData?: { name: string | null; phone: string | null; locality: string | null; leadId: string | null } | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        {open && (
          <BookingSheetForm
            date={date}
            customers={customers}
            technicians={technicians}
            existing={existing}
            onCreate={onCreate}
            onDone={() => onOpenChange(false)}
            leadData={leadData}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function BookingSheetForm({
  date, customers, technicians, existing, onCreate, onDone, leadData,
}: {
  date: Date;
  customers: CustomerRow[];
  technicians: Technician[];
  existing: AppointmentRow[];
  onCreate: (appt: AppointmentRow) => void;
  onDone: () => void;
  leadData?: { name: string | null; phone: string | null; locality: string | null; leadId: string | null } | null;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [technicianId, setTechnicianId] = useState(technicians[0]?.id ?? "");
  const [service, setService] = useState(leadData?.name ? `Service for ${leadData.name}` : "");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);

  function toDateTime(time: string) {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!customerId) errs.customer = "Please select a customer.";
    if (!technicianId) errs.technician = "Please select a technician.";
    if (!service.trim()) errs.service = "Please enter a service.";
    if (!/^\d{2}:\d{2}$/.test(startTime)) errs.startTime = "Invalid time format (HH:MM).";
    if (!/^\d{2}:\d{2}$/.test(endTime)) errs.endTime = "Invalid time format (HH:MM).";
    const startAt = toDateTime(startTime);
    const endAt = toDateTime(endTime);
    if (!errs.startTime && !errs.endTime && endAt <= startAt) errs.endTime = "End time must be after start time.";
    const conflict = existing.find(
      (a) =>
        a.status !== "cancelled" &&
        a.technicianId === technicianId &&
        new Date(a.startAt) < endAt &&
        new Date(a.endAt) > startAt
    );
    if (conflict) {
      errs.conflict = `Conflict: this technician is already booked ${new Date(
        conflict.startAt
      ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}–${new Date(
        conflict.endAt
      ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} for ${conflict.customerName}.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const startAt = toDateTime(startTime);
    const endAt = toDateTime(endTime);
    const customer = customers.find((c) => c.id === customerId);
    const tech = technicians.find((t) => t.id === technicianId);

    try {
      const result = await createAppointmentAction({
        customer_id: customerId,
        technician_id: technicianId,
        locality_id: customer?.localityId ?? null,
        service_name: service.trim(),
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        site_id: customer?.sites?.[0]?.id ?? null,
      });

      onCreate({
        id: result?.id ?? `local-${Date.now()}`,
        jobId: null,
        customerId,
        siteId: customer?.sites?.[0]?.id ?? null,
        technicianId,
        localityId: customer?.localityId ?? null,
        serviceName: service.trim(),
        startAt,
        endAt,
        status: "scheduled",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        customerName: customer?.name ?? "Unknown",
        locality: customer?.locality,
        technicianName: tech?.fullName,
      });

      toast.success("Appointment booked.");
      router.refresh();
    } catch {
      toast.error("Failed to book appointment.");
    } finally {
      setSubmitting(false);
      onDone();
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>New appointment</SheetTitle>
        <SheetDescription>
          {date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </SheetDescription>
      </SheetHeader>

      <SheetBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={(v) => {
              if (v === "_new") {
                setNewCustomerDialogOpen(true);
                return;
              }
              setCustomerId(v);
              setErrors((e) => { const { customer, ...rest } = e; return rest; });
            }}>
              <SelectTrigger className="w-full" aria-describedby={errors.customer ? "err-customer" : undefined} aria-invalid={!!errors.customer}>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {customers.length === 0 && (
                  <SelectItem value="_none" disabled>No customers available</SelectItem>
                )}
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} {c.locality ? `— ${c.locality}` : ""}</SelectItem>
                ))}
                <SelectItem value="_new" className="text-primary font-medium">＋ Create new customer…</SelectItem>
              </SelectContent>
            </Select>
            {errors.customer && <p id="err-customer" role="alert" className="text-xs text-destructive">{errors.customer}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Service</Label>
            <Input placeholder="e.g. AC gas top-up" value={service}
              onChange={(e) => { setService(e.target.value); setErrors((er) => { const { service: _, ...rest } = er; return rest; }); }}
              aria-describedby={errors.service ? "err-service" : undefined} aria-invalid={!!errors.service} />
            {errors.service && <p id="err-service" role="alert" className="text-xs text-destructive">{errors.service}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Technician</Label>
            <Select value={technicianId} onValueChange={(v) => { setTechnicianId(v); setErrors((e) => { const { technician, ...rest } = e; return rest; }); }}>
              <SelectTrigger className="w-full" aria-describedby={errors.technician ? "err-technician" : undefined} aria-invalid={!!errors.technician}>
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.technician && <p id="err-technician" role="alert" className="text-xs text-destructive">{errors.technician}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start time</Label>
              <Input type="time" value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setErrors((er) => { const { startTime: _, ...rest } = er; return rest; }); }}
                aria-describedby={errors.startTime ? "err-start" : undefined} aria-invalid={!!errors.startTime} />
              {errors.startTime && <p id="err-start" role="alert" className="text-xs text-destructive">{errors.startTime}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>End time</Label>
              <Input type="time" value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setErrors((er) => { const { endTime: _, ...rest } = er; return rest; }); }}
                aria-describedby={errors.endTime ? "err-end" : undefined} aria-invalid={!!errors.endTime} />
              {errors.endTime && <p id="err-end" role="alert" className="text-xs text-destructive">{errors.endTime}</p>}
            </div>
          </div>

          {errors.conflict && <p id="err-conflict" role="alert" className="text-xs text-destructive">{errors.conflict}</p>}
        </form>
      </SheetBody>

      <SheetFooter>
        <Button type="button" variant="outline" className="w-full" onClick={onDone}>Cancel</Button>
        <Button type="button" className="w-full" disabled={submitting} onClick={() => {
          const form = document.querySelector<HTMLFormElement>('[data-slot="sheet-body"] form');
          form?.requestSubmit();
        }}>
          {submitting ? "Booking…" : "Book appointment"}
        </Button>
      </SheetFooter>

      <AlertDialog open={newCustomerDialogOpen} onOpenChange={setNewCustomerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create new customer</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll be taken to the customer creation page. After creating the customer, come back here to book the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDone();
              router.push("/customers?new=1&returnTo=/schedule");
            }}>
              Go to customers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
