import { fetchAppointments, fetchCustomers, fetchTechnicians } from "@/lib/db/queries";
import { ScheduleBoard } from "@/components/schedule/schedule-board";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [appointments, technicians, customers] = await Promise.all([
    fetchAppointments(), fetchTechnicians(), fetchCustomers(),
  ]);

  return (
    <div className="w-full px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-sm text-muted-foreground">
          Day and week view across the 5 service localities. No map yet — see Phase 2.
        </p>
      </header>
      <ScheduleBoard
        appointments={appointments}
        customers={customers}
        technicians={technicians}
      />
    </div>
  );
}
