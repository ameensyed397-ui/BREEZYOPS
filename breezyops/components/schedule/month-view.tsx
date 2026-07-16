"use client";

import { cn } from "@/lib/utils";
import type { AppointmentRow } from "@/lib/db/queries";

function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusDot: Record<string, string> = {
  scheduled: "bg-primary",
  rescheduled: "bg-amber-500",
  done: "bg-green-500",
  no_show: "bg-red-500",
  cancelled: "bg-muted-foreground/40",
};

export function MonthView({
  monthOf,
  appointments,
  onSelectDay,
  onSelectAppointment,
}: {
  monthOf: Date;
  appointments: AppointmentRow[];
  onSelectDay: (d: Date) => void;
  onSelectAppointment?: (appt: AppointmentRow) => void;
}) {
  const monthStart = startOfMonth(monthOf);
  const monthEnd = endOfMonth(monthOf);
  const calStart = startOfWeek(monthStart);
  const today = new Date();

  const cells: Date[] = [];
  let cursor = calStart;
  while (cells.length < 42) {
    cells.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const isCurrentMonth = cell.getMonth() === monthOf.getMonth();
          const isToday = sameDay(cell, today);
          const dayAppts = appointments
            .filter((a) => sameDay(new Date(a.startAt), cell))
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

          return (
            <button
              key={i}
              onClick={() => onSelectDay(cell)}
              className={cn(
                "relative flex min-h-[80px] flex-col border-b border-r p-1.5 text-left transition-colors hover:bg-secondary/40 sm:min-h-[100px] sm:p-2",
                !isCurrentMonth && "bg-secondary/20 text-muted-foreground/40",
                isToday && "bg-primary/5",
                (i + 1) % 7 === 0 && "border-r-0"
              )}
            >
              <span
                className={cn(
                  "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday && "bg-primary text-primary-foreground",
                  !isToday && isCurrentMonth && "text-foreground",
                  !isToday && !isCurrentMonth && "text-muted-foreground/40"
                )}
              >
                {cell.getDate()}
              </span>

              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayAppts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight bg-secondary/80 truncate cursor-pointer hover:bg-secondary transition-colors"
                    onClick={(e) => { e.stopPropagation(); onSelectAppointment?.(a); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onSelectAppointment?.(a); } }}
                    aria-label={`View appointment for ${a.customerName}`}
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDot[a.status] ?? "bg-muted-foreground")} />
                    <span className="font-medium truncate">
                      {new Date(a.startAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="truncate text-muted-foreground">{a.customerName}</span>
                  </div>
                ))}
                {dayAppts.length > 3 && (
                  <span className="text-[9px] text-muted-foreground pl-1">
                    +{dayAppts.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
