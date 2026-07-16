"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Package, MapPin, Plug, ClipboardList, Save, X, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { updateCatalogItemAction, addLocalityAction } from "@/app/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Profile = { id: string; name: string; role: string; active: boolean };
type CatalogItem = { id: string; name: string; segment: string; price: number; cost: number; active: boolean };
type AuditEntry = { id: string; actor: string; action: string; entity: string; time: string };
type Locality = { id: string; name: string; active: boolean };

const roleVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  ops: "default",
  technician: "secondary",
  b2b_manager: "outline",
  finance: "outline",
  viewer: "secondary",
};

export function SettingsPanel({
  profiles,
  catalog,
  activityLog,
  localities,
}: {
  profiles: Profile[];
  catalog: CatalogItem[];
  activityLog: AuditEntry[];
  localities: Locality[];
}) {
  const [catalogSearch, setCatalogSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCost, setEditCost] = useState("");
  const [isPending, startTransition] = useTransition();
  const [newLocality, setNewLocality] = useState("");
  const [addingLocality, setAddingLocality] = useState(false);

  const filteredCatalog = useMemo(() => {
    if (!catalogSearch) return catalog;
    const q = catalogSearch.toLowerCase();
    return catalog.filter((s) => s.name.toLowerCase().includes(q));
  }, [catalogSearch, catalog]);

  function handleSaveCatalog(id: string) {
    const price = Number(editPrice) || 0;
    const cost = Number(editCost) || 0;
    startTransition(async () => {
      try {
        await updateCatalogItemAction(id, price, cost);
        toast.success("Catalog updated.");
        setEditingId(null);
      } catch {
        toast.error("Failed to update catalog.");
      }
    });
  }

  function handleAddLocality() {
    if (!newLocality.trim()) return;
    setAddingLocality(true);
    startTransition(async () => {
      try {
        await addLocalityAction(newLocality.trim());
        toast.success("Locality added.");
        setNewLocality("");
        setAddingLocality(false);
      } catch {
        toast.error("Failed to add locality.");
        setAddingLocality(false);
      }
    });
  }

  return (
    <Tabs defaultValue="catalog" className="w-full overflow-x-auto">
      <TabsList className="mb-4 w-full justify-start flex-nowrap">
        <TabsTrigger value="catalog" className="gap-1.5"><Package className="h-3.5 w-3.5" />Catalog</TabsTrigger>
        <TabsTrigger value="users" className="gap-1.5"><Users className="h-3.5 w-3.5" />Users</TabsTrigger>
        <TabsTrigger value="localities" className="gap-1.5"><MapPin className="h-3.5 w-3.5" />Localities</TabsTrigger>
        <TabsTrigger value="integrations" className="gap-1.5"><Plug className="h-3.5 w-3.5" />Integrations</TabsTrigger>
        <TabsTrigger value="audit" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Audit</TabsTrigger>
      </TabsList>

      <TabsContent value="catalog">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Service catalog</h3>
              <p className="text-xs text-muted-foreground">Manage services, pricing, and cost margins.</p>
            </div>
          </div>
          <div className="mb-3">
            <Input
              placeholder="Search services..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-secondary/40 text-left text-xs uppercase text-muted-foreground">
                  <TableHead className="px-3 py-2 font-medium">Service</TableHead>
                  <TableHead className="px-3 py-2 font-medium text-right">Price</TableHead>
                  <TableHead className="px-3 py-2 font-medium text-right">Cost</TableHead>
                  <TableHead className="px-3 py-2 font-medium text-right">Margin</TableHead>
                  <TableHead className="px-3 py-2 font-medium">Status</TableHead>
                  <TableHead className="px-3 py-2 font-medium"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y">
                {filteredCatalog.map((s) => {
                  const isEditing = editingId === s.id;
                  const currentPrice = isEditing ? Number(editPrice) || 0 : s.price;
                  const currentCost = isEditing ? Number(editCost) || 0 : s.cost;
                  const margin = currentPrice > 0 ? Math.round(((currentPrice - currentCost) / currentPrice) * 100) : 0;
                  return (
                    <TableRow key={s.id} className={isEditing ? "bg-secondary/20" : ""}>
                      <TableCell className="px-3 py-2 font-medium">{s.name}</TableCell>
                      <TableCell className="px-3 py-2 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-7 w-24 text-right text-xs"
                          />
                        ) : (
                          formatCurrency(s.price)
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editCost}
                            onChange={(e) => setEditCost(e.target.value)}
                            className="h-7 w-24 text-right text-xs"
                          />
                        ) : (
                          formatCurrency(s.cost)
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right font-medium text-primary">
                        {margin}%
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <Badge variant={s.active ? "default" : "secondary"} className="text-[10px]">
                          {s.active ? "Active" : "Retired"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              disabled={isPending}
                              onClick={() => handleSaveCatalog(s.id)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setEditingId(s.id);
                              setEditPrice(String(s.price));
                              setEditCost(String(s.cost));
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Team members</h3>
              <p className="text-xs text-muted-foreground">Invite, assign roles, activate or deactivate.</p>
            </div>
            <Button size="sm" onClick={() => toast("Invite flow — coming soon. Ask admin to create a profile directly in Supabase.")}>Invite user</Button>
          </div>
          <ul className="divide-y rounded-lg border">
            {profiles.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.name}</span>
                    <Badge variant={roleVariant[u.role] ?? "secondary"} className="text-[10px]">{u.role}</Badge>
                  </div>
                </div>
                <Badge variant={u.active ? "default" : "secondary"} className="text-[10px]">
                  {u.active ? "Active" : "Inactive"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </TabsContent>

      <TabsContent value="localities">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Service areas</h3>
              <p className="text-xs text-muted-foreground">Localities Breezyops covers.</p>
            </div>
          </div>
          <div className="mb-3 flex gap-2">
            <Input
              placeholder="New locality name..."
              value={newLocality}
              onChange={(e) => setNewLocality(e.target.value)}
              className="max-w-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAddLocality()}
            />
            <Button
              size="sm"
              onClick={handleAddLocality}
              disabled={isPending || !newLocality.trim()}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />Add
            </Button>
          </div>
          <ul className="divide-y rounded-lg border">
            {localities.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{l.name}</span>
                </div>
                <Badge variant={l.active ? "default" : "secondary"} className="text-[10px]">
                  {l.active ? "Active" : "Inactive"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </TabsContent>

      <TabsContent value="integrations">
        <Card className="p-4">
          <h3 className="mb-4 text-sm font-medium">Integrations</h3>
          <div className="space-y-3">
            <IntegrationRow name="Supabase" desc="Database, auth, storage" status="connected" />
            <IntegrationRow name="AiSensy" desc="WhatsApp Business API" status="not_configured" />
            <IntegrationRow name="Razorpay" desc="Payment gateway" status="not_configured" />
            <IntegrationRow name="Resend" desc="Transactional email" status="not_configured" />
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <Card className="p-4">
          <h3 className="mb-4 text-sm font-medium">Activity log</h3>
          {activityLog.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {activityLog.map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm"><span className="font-medium">{a.actor}</span> {a.action}</span>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(a.time)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function IntegrationRow({ name, desc, status }: { name: string; desc: string; status: "connected" | "not_configured" }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div>
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Badge variant={status === "connected" ? "default" : "secondary"} className="text-[10px]">
        {status === "connected" ? "Connected" : "Not configured"}
      </Badge>
    </div>
  );
}
