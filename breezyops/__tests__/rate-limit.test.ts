import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    expect(rateLimit("test1", 3, 60_000)).toBe(true);
    expect(rateLimit("test1", 3, 60_000)).toBe(true);
    expect(rateLimit("test1", 3, 60_000)).toBe(true);
  });

  it("blocks requests over the limit", () => {
    rateLimit("test2", 2, 60_000);
    rateLimit("test2", 2, 60_000);
    expect(rateLimit("test2", 2, 60_000)).toBe(false);
  });

  it("tracks keys independently", () => {
    rateLimit("a", 1, 60_000);
    expect(rateLimit("a", 1, 60_000)).toBe(false);
    expect(rateLimit("b", 1, 60_000)).toBe(true);
  });
});
