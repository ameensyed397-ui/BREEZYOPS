import { cn } from "@/lib/utils";
import type { MockAppointment } from "@/lib/db/mock";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function WeekView({
  weekOf,
  appointments,
  onSelectDay,
}: {
  weekOf: Date;
  appointments: MockAppointment[];
  onSelectDay: (d: Date) => void;
}) {
  const start = startOfWeek(weekOf);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayAppts = appointments
          .filter((a) => sameDay(new Date(a.startAt), day))
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        const isToday = sameDay(day, today);
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDay(day)}
            className={cn(
              "flex min-h-40 flex-col gap-1 rounded-lg border p-2 text-left transition-colors hover:bg-secondary/60",
              isToday && "border-primary"
            )}
          >
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              {day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
            </div>
            {dayAppts.length === 0 ? (
              <span className="text-xs text-muted-foreground/60">—</span>
            ) : (
              dayAppts.map((a) => (
                <div key={a.id} className="rounded-md bg-secondary px-1.5 py-1 text-[11px] leading-tight">
                  <span className="font-medium">
                    {new Date(a.startAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>{" "}
                  {a.customerName}
                </div>
              ))
            )}
          </button>
        );
      })}
    </div>
  );
}
