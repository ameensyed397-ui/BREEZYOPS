import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

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
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  if (!rateLimit(`webhook:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  // Timing-safe secret comparison
  const incoming = req.headers.get("x-webhook-secret") ?? "";
  const expected = process.env.LEAD_WEBHOOK_SECRET ?? "";
  if (!expected || incoming.length !== expected.length) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const a = new TextEncoder().encode(incoming);
  const b = new TextEncoder().encode(expected);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = LeadPayload.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload", detail: parsed.error.flatten() }, { status: 422 });
  }
  const p = parsed.data;

  const sb = await createClient();
  const slaMinutes = p.urgent ? 30 : p.channel === "webform" ? 15 : null;
  const slaDueAt = slaMinutes ? new Date(Date.now() + slaMinutes * 60000) : null;

  try {
    // Resolve locality name to ID if provided
    let localityId: string | null = null;
    if (p.locality) {
      const { data: loc } = await sb.from("localities").select("id").ilike("name", p.locality).single();
      localityId = loc?.id ?? null;
    }

    const { data: lead, error } = await sb.from("leads").insert({
      channel: p.channel,
      source: p.source,
      segment: p.segment,
      name: p.name,
      phone: p.phone,
      message: p.message,
      urgent: p.urgent,
      ai_disclosed: p.ai_disclosed,
      sla_due_at: slaDueAt,
      locality_id: localityId,
    }).select("id").single();

    if (error) {
      return NextResponse.json({ error: "failed to create lead" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
