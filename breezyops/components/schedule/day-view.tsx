"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppointmentRow } from "@/lib/db/queries";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  rescheduled: "secondary",
  done: "secondary",
  no_show: "destructive",
  cancelled: "destructive",
};

function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function timeRange(start: Date, end: Date) {
  const fmt = (d: Date) =>
    new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}

const HOUR_HEIGHT = 56;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;
const GRID_HEIGHT = HOUR_HEIGHT * TOTAL_HOURS;
const LEFT_GUTTER = 64;

function minutesToTop(minutes: number): number {
  const clamped = Math.max(0, Math.min(TOTAL_HOURS * 60, minutes));
  return (clamped / (TOTAL_HOURS * 60)) * GRID_HEIGHT;
}

function dateToMinutes(d: Date): number {
  const dt = new Date(d);
  const hours = dt.getHours();
  const mins = dt.getMinutes();
  return Math.max(0, Math.min(TOTAL_HOURS * 60, (hours - DAY_START_HOUR) * 60 + mins));
}

function durationToHeight(start: Date, end: Date): number {
  const startMin = dateToMinutes(start);
  const endMin = dateToMinutes(end);
  const minutes = Math.max(0, endMin - startMin);
  return Math.max(28, (minutes / (TOTAL_HOURS * 60)) * GRID_HEIGHT);
}

interface PositionedAppointment {
  appointment: AppointmentRow;
  column: number;
  totalColumns: number;
}

function layoutColumns(appointments: AppointmentRow[]): PositionedAppointment[] {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  const result: PositionedAppointment[] = [];
  const columns: { end: number; count: number }[] = [];

  for (const appt of sorted) {
    const startMin = dateToMinutes(appt.startAt);

    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      if (columns[col].end <= startMin) {
        columns[col].end = dateToMinutes(appt.endAt);
        columns[col].count++;
        result.push({ appointment: appt, column: col, totalColumns: 0 });
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push({ end: dateToMinutes(appt.endAt), count: 1 });
      result.push({ appointment: appt, column: columns.length - 1, totalColumns: 0 });
    }
  }

  for (const appt of result) {
    let maxCol = appt.column;
    const myStart = dateToMinutes(appt.appointment.startAt);
    const myEnd = dateToMinutes(appt.appointment.endAt);

    for (const other of result) {
      if (other.appointment.id === appt.appointment.id) continue;
      const otherStart = dateToMinutes(other.appointment.startAt);
      const otherEnd = dateToMinutes(other.appointment.endAt);

      if (otherStart < myEnd && otherEnd > myStart) {
        maxCol = Math.max(maxCol, other.column);
      }
    }

    appt.totalColumns = maxCol + 1;
  }

  const maxTotal = Math.max(1, ...result.map((r) => r.totalColumns));
  for (const appt of result) {
    appt.totalColumns = maxTotal;
  }

  return result;
}

export function DayView({
  appointments,
  date,
  loading,
}: {
  appointments: AppointmentRow[];
  date?: Date;
  loading: boolean;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const positioned = useMemo(() => layoutColumns(appointments), [appointments]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => DAY_START_HOUR + i);

  const viewingToday = date
    ? new Date(date).toDateString() === now.toDateString()
    : true;
  const nowMinutes = dateToMinutes(now);
  const showIndicator = viewingToday && nowMinutes >= 0 && nowMinutes <= TOTAL_HOURS * 60;
  const nowProgress = Math.max(0, Math.min(1, nowMinutes / (TOTAL_HOURS * 60)));

  return (
    <div className="relative w-full" style={{ height: GRID_HEIGHT + 1 }}>
      <div className="absolute inset-0" style={{ left: LEFT_GUTTER }}>
        {hours.map((hour, i) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-b border-border/40"
            style={{ top: i * HOUR_HEIGHT }}
          >
            <span
              className="pointer-events-none absolute -top-3 select-none"
              style={{ left: -LEFT_GUTTER, width: LEFT_GUTTER }}
            >
              <span className="block text-center text-[11px] font-medium text-muted-foreground">
                {hour}:00
              </span>
            </span>
          </div>
        ))}

        {showIndicator && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-20"
            style={{ top: `${nowProgress * 100}%` }}
            aria-hidden="true"
          >
            <div className="absolute left-0 top-0 h-3 w-3 -translate-y-1/2 rounded-full bg-red-500" />
            <div className="h-[2px] w-full bg-red-500" />
          </div>
        )}

        {positioned.map(({ appointment: a, column, totalColumns }) => {
          const top = minutesToTop(dateToMinutes(a.startAt));
          const height = durationToHeight(a.startAt, a.endAt);
          const widthPct = totalColumns > 1 ? 100 / totalColumns : 100;
          const leftPct = column * widthPct;

          return (
            <div
              key={a.id}
              className="absolute"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left: `${leftPct}%`,
                width: `${widthPct - (totalColumns > 1 ? 1 : 0)}%`,
                paddingRight: totalColumns > 1 ? 4 : 0,
              }}
            >
              <Card className="flex h-full w-full gap-0 overflow-hidden border-l-4 border-l-primary p-0">
                <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{a.customerName}</span>
                    <Badge
                      variant={statusVariant[a.status] ?? "default"}
                      className="shrink-0 text-[10px]"
                    >
                      {a.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{a.serviceName}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{timeRange(a.startAt, a.endAt)}</span>
                    {a.locality && (
                      <>
                        <span>·</span>
                        <span className="truncate">{a.locality}</span>
                      </>
                    )}
                  </div>
                </div>
                <Avatar className="m-2 h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px]">
                    {initials(a.technicianName)}
                  </AvatarFallback>
                </Avatar>
              </Card>
            </div>
          );
        })}

        {positioned.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No appointments today.
          </div>
        )}
      </div>
    </div>
  );
}
