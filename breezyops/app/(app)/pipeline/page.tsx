import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { B2CBoard } from "@/components/pipeline/b2c-board";
import { B2BBoard } from "@/components/pipeline/b2b-board";
import { fetchLeads, fetchDeals } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const [leads, deals] = await Promise.all([fetchLeads(), fetchDeals()]);

  return (
    <div className="w-full px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Drag cards to move stage. B2C is fast-cycle; B2B tracks the deal through to contract.
        </p>
      </header>
      <Tabs defaultValue="b2c" className="mt-1">
        <TabsList className="mb-4">
          <TabsTrigger value="b2c">B2C</TabsTrigger>
          <TabsTrigger value="b2b">B2B</TabsTrigger>
        </TabsList>
        <TabsContent value="b2c">
          <B2CBoard leads={leads} />
        </TabsContent>
        <TabsContent value="b2b">
          <B2BBoard deals={deals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
