"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { BookingSheet } from "./booking-sheet";
import type { MockAppointment, MockCustomer, MockTechnician } from "@/lib/db/mock";

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function ScheduleBoard({
  appointments,
  customers,
  technicians,
}: {
  appointments: MockAppointment[];
  customers: MockCustomer[];
  technicians: MockTechnician[];
}) {
  const [view, setView] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [items, setItems] = useState(appointments);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loading] = useState(false);

  const dayItems = useMemo(
    () => items.filter((a) => sameDay(new Date(a.startAt), selectedDate)),
    [items, selectedDate]
  );

  function shiftDay(delta: number) {
    setSelectedDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + delta);
      return nd;
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftDay(view === "day" ? -1 : -7)}>
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
          <Button variant="outline" size="icon" onClick={() => shiftDay(view === "day" ? 1 : 7)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => setSelectedDate(new Date())}>Today</Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setBookingOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New appointment
          </Button>
        </div>
      </div>

      {view === "day" ? (
        <DayView appointments={dayItems} loading={loading} />
      ) : (
        <WeekView weekOf={selectedDate} appointments={items} onSelectDay={(d) => { setSelectedDate(d); setView("day"); }} />
      )}

      <BookingSheet
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        date={selectedDate}
        customers={customers}
        technicians={technicians}
        existing={items}
        onCreate={(appt) => setItems((cur) => [...cur, appt])}
      />
    </div>
  );
}
