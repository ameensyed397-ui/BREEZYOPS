import { db, schema } from "@/lib/db";
import { mockAppointments, mockCustomers, mockTechnicians } from "@/lib/db/mock";
import { ScheduleBoard } from "@/components/schedule/schedule-board";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  // Real appointments when the DB is configured; sample data otherwise.
  const appointments = db ? await db.select().from(schema.appointments) : mockAppointments;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-sm text-muted-foreground">
          Day and week view across the 5 service localities. No map yet — see Phase 2.
        </p>
      </header>
      <ScheduleBoard
        appointments={appointments as any}
        customers={mockCustomers}
        technicians={mockTechnicians}
      />
    </div>
  );
}
