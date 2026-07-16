import { fetchInvoices, fetchCustomers } from "@/lib/db/queries";
import { InvoiceList } from "@/components/invoices/invoice-list";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const [invoices, customers] = await Promise.all([fetchInvoices(), fetchCustomers()]);

  return (
    <div className="w-full px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices &amp; Quotations</h1>
        <p className="text-sm text-muted-foreground">
          Draft, send, collect. Every invoice and quotation in one place.
        </p>
      </header>
      <InvoiceList invoices={invoices} customers={customers} />
    </div>
  );
}
