import { fetchDocuments, fetchMedia } from "@/lib/db/queries";
import { DocumentLibrary } from "@/components/docs/document-library";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const [docs, media] = await Promise.all([fetchDocuments(), fetchMedia()]);

  return (
    <div className="w-full px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Documents &amp; Media</h1>
        <p className="text-sm text-muted-foreground">
          Every file, every photo, one place. Auto-filed from jobs and invoices.
        </p>
      </header>
      <DocumentLibrary documents={docs} media={media} />
    </div>
  );
}
