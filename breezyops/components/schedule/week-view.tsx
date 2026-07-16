import { cn } from "@/lib/utils";
import type { AppointmentRow } from "@/lib/db/queries";

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

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function WeekView({
  weekOf,
  appointments,
  onSelectDay,
  onSelectAppointment,
}: {
  weekOf: Date;
  appointments: AppointmentRow[];
  onSelectDay: (d: Date) => void;
  onSelectAppointment?: (appt: AppointmentRow) => void;
}) {
  const start = startOfWeek(weekOf);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const today = new Date();

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-2 min-w-[700px]">
      {days.map((day) => {
        const dayAppts = appointments
          .filter((a) => sameDay(new Date(a.startAt), day))
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        const isToday = sameDay(day, today);
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDay(day)}
            aria-label={`${dayNames[(day.getDay() + 6) % 7]}, ${day.getDate()} ${monthNames[day.getMonth()]}`}
            className={cn(
              "flex min-h-24 flex-col gap-1 rounded-lg border p-2 text-left transition-colors hover:bg-secondary/60 sm:min-h-40",
              isToday && "border-primary bg-primary/5"
            )}
          >
            <div className={cn("mb-1 text-xs font-medium text-muted-foreground", isToday && "font-semibold text-foreground")}>
              {day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
            </div>
            {dayAppts.length === 0 ? (
              <span className="text-xs text-muted-foreground/60">—</span>
            ) : (
              dayAppts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-md bg-secondary px-1.5 py-1 text-[11px] leading-tight cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onSelectAppointment?.(a); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onSelectAppointment?.(a); } }}
                  aria-label={`View appointment for ${a.customerName}`}
                >
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
    </div>
  );
}
