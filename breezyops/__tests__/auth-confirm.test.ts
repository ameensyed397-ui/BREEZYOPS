import { describe, it, expect } from "vitest";

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

const BASE = "https://app.breezyops.com";

describe("safeRedirect", () => {
  it("redirects to allowed paths", () => {
    expect(safeRedirect(BASE, "/leads").pathname).toBe("/leads");
    expect(safeRedirect(BASE, "/pipeline").pathname).toBe("/pipeline");
    expect(safeRedirect(BASE, "/").pathname).toBe("/");
  });

  it("redirects to allowed nested paths", () => {
    expect(safeRedirect(BASE, "/customers/123").pathname).toBe("/customers/123");
  });

  it("blocks protocol-relative URLs", () => {
    expect(safeRedirect(BASE, "//evil.com").pathname).toBe("/login");
  });

  it("blocks unknown paths", () => {
    expect(safeRedirect(BASE, "/admin/delete").pathname).toBe("/login");
  });

  it("defaults to /login when next is null (reset-password not in allowlist)", () => {
    expect(safeRedirect(BASE, null).pathname).toBe("/login");
  });
});
