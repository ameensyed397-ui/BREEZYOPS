"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { BookingSheet } from "./booking-sheet";
import { AppointmentDetailSheet } from "./appointment-detail-sheet";
import type { AppointmentRow, CustomerRow } from "@/lib/db/queries";

type Technician = { id: string; fullName: string };

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function ScheduleBoard({
  appointments,
  customers,
  technicians,
}: {
  appointments: AppointmentRow[];
  customers: CustomerRow[];
  technicians: Technician[];
}) {
  const searchParams = useSearchParams();
  const leadName = searchParams.get("name");
  const leadPhone = searchParams.get("phone");
  const leadLocality = searchParams.get("locality");
  const leadId = searchParams.get("leadId");

  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [items, setItems] = useState(appointments);
  const [bookingOpen, setBookingOpen] = useState(() => !!leadId);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const loading = !appointments;

  const dayItems = useMemo(
    () => items.filter((a) => sameDay(new Date(a.startAt), selectedDate)),
    [items, selectedDate]
  );

  function shiftDay(delta: number) {
    setSelectedDate((d) => {
      const nd = new Date(d);
      if (view === "month") {
        nd.setMonth(nd.getMonth() + (delta > 0 ? 1 : -1));
      } else if (view === "week") {
        nd.setDate(nd.getDate() + delta * 7);
      } else {
        nd.setDate(nd.getDate() + delta);
      }
      return nd;
    });
  }

  function handleSelectAppointment(appt: AppointmentRow) {
    setSelectedAppointment(appt);
    setDetailOpen(true);
  }

  function handleStatusChange(id: string, status: string) {
    setItems((cur) => cur.map((a) => a.id === id ? { ...a, status } : a));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftDay(view === "day" ? -1 : -7)} aria-label="Previous day">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[11rem] justify-start gap-2">
                <CalendarIcon className="h-4 w-4" />
                {selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => shiftDay(view === "day" ? 1 : 7)} aria-label="Next day">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => setSelectedDate(new Date())}>Today</Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setBookingOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New appointment
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : view === "day" ? (
        <DayView appointments={dayItems} date={selectedDate} loading={false} onSelectAppointment={handleSelectAppointment} />
      ) : view === "week" ? (
        <WeekView weekOf={selectedDate} appointments={items} onSelectDay={(d) => { setSelectedDate(d); setView("day"); }} onSelectAppointment={handleSelectAppointment} />
      ) : (
        <MonthView monthOf={selectedDate} appointments={items} onSelectDay={(d) => { setSelectedDate(d); setView("day"); }} onSelectAppointment={handleSelectAppointment} />
      )}

      <BookingSheet
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        date={selectedDate}
        customers={customers}
        technicians={technicians}
        existing={items}
        onCreate={(appt) => setItems((cur) => [...cur, appt])}
        leadData={leadName ? { name: leadName, phone: leadPhone, locality: leadLocality, leadId } : null}
      />

      <AppointmentDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        appointment={selectedAppointment}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
