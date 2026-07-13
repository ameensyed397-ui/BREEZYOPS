import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { B2CBoard } from "@/components/pipeline/b2c-board";
import { B2BBoard } from "@/components/pipeline/b2b-board";
import { db, schema } from "@/lib/db";
import { mockLeads, mockDeals } from "@/lib/db/mock";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  // Real leads when the DB is configured; sample data otherwise so the UI is visible.
  const leads = db ? await db.select().from(schema.leads) : mockLeads;
  // deals table has no writers yet (F02 doesn't persist), so this stays mock until F06/F07 land.
  const deals = mockDeals;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Drag cards to move stage. B2C is fast-cycle; B2B tracks the deal through to contract.
        </p>
      </header>
      <Tabs defaultValue="b2c">
        <TabsList className="mb-4">
          <TabsTrigger value="b2c">B2C</TabsTrigger>
          <TabsTrigger value="b2b">B2B</TabsTrigger>
        </TabsList>
        <TabsContent value="b2c">
          <B2CBoard leads={leads as any} />
        </TabsContent>
        <TabsContent value="b2b">
          <B2BBoard deals={deals as any} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
