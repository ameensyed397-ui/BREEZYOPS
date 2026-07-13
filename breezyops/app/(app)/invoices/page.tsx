import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { mockInvoices } from "@/lib/db/mock";
import { InvoiceList } from "@/components/invoices/invoice-list";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = db
    ? await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt)).limit(50)
    : mockInvoices;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Draft, send, collect. Every invoice for every job.
        </p>
      </header>
      <InvoiceList invoices={invoices as any} />
    </div>
  );
}
