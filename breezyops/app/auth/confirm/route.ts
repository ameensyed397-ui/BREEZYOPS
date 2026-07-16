import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_REDIRECTS = ["/", "/leads", "/pipeline", "/schedule", "/jobs", "/customers", "/invoices", "/documents", "/settings"];

function safeRedirect(base: string, next: string | null): URL {
  const target = next ?? "/reset-password";
  if (
    target.startsWith("/") &&
    !target.startsWith("//") &&
    ALLOWED_REDIRECTS.some((r) => target === r || target.startsWith(r + "/"))
  ) {
    return new URL(target, base);
  }
  return new URL("/login", base);
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon";
  if (!rateLimit(`auth:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }
    return NextResponse.redirect(safeRedirect(request.url, next));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "recovery" | "signup" | "email",
    });
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }
    return NextResponse.redirect(safeRedirect(request.url, next));
  }

  return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
}
