import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { mockCustomers } from "@/lib/db/mock";
import { CustomerList } from "@/components/customers/customer-list";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = db
    ? await db.select().from(schema.customers).orderBy(desc(schema.customers.createdAt)).limit(50)
    : mockCustomers;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Every customer, B2C and B2B. Open for the full 360° view.
        </p>
      </header>
      <CustomerList customers={customers as any} />
    </div>
  );
}
