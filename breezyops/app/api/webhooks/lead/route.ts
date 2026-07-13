import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { z } from "zod";

// Single intake endpoint for Breezy (voice/chat), AiSensy (WhatsApp), and web forms.
// See vault: Integrations. One normalised payload -> one row in `leads`.
const LeadPayload = z.object({
  channel: z.enum(["voice", "whatsapp", "webchat", "webform", "referral", "walkin"]),
  source: z.string().optional(),
  segment: z.enum(["b2c", "b2b"]).default("b2c"),
  name: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  urgent: z.boolean().default(false),
  locality: z.string().optional(),
  ai_disclosed: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  // Verify shared secret
  if (req.headers.get("x-webhook-secret") !== process.env.LEAD_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = LeadPayload.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload", detail: parsed.error.flatten() }, { status: 422 });
  }
  const p = parsed.data;
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  // SLA: urgent 30m; callback-style webform 15m; else null
  const slaMinutes = p.urgent ? 30 : p.channel === "webform" ? 15 : null;
  const slaDueAt = slaMinutes ? new Date(Date.now() + slaMinutes * 60000) : null;

  const [lead] = await db.insert(schema.leads).values({
    channel: p.channel, source: p.source, segment: p.segment,
    name: p.name, phone: p.phone, message: p.message,
    urgent: p.urgent, aiDisclosed: p.ai_disclosed, slaDueAt,
  }).returning({ id: schema.leads.id });

  // TODO: match `p.locality` -> localities.id; notify on-duty staff; realtime push.
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
