import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { mockJobs } from "@/lib/db/mock";
import { JobList } from "@/components/jobs/job-list";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = db
    ? await db.select().from(schema.jobs).orderBy(desc(schema.jobs.scheduledAt)).limit(50)
    : mockJobs;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Every work order, scheduled to completed. Run the checklist, capture photos, close the job.
        </p>
      </header>
      <JobList jobs={jobs as any} />
    </div>
  );
}
