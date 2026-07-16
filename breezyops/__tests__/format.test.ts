import { describe, it, expect, vi, afterEach } from "vitest";
import { formatCurrency, formatCurrencyShort, formatDate, formatDateTime, formatRelativeTime, statusLabel } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats INR amounts", () => {
    expect(formatCurrency(1500)).toContain("1,500");
  });
  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});

describe("formatCurrencyShort", () => {
  it("shortens lakhs", () => {
    expect(formatCurrencyShort(100000)).toBe("₹1.0L");
  });
  it("shortens thousands", () => {
    expect(formatCurrencyShort(5000)).toBe("₹5.0K");
  });
  it("does not shorten small amounts", () => {
    expect(formatCurrencyShort(500)).toContain("500");
  });
});

describe("formatDate", () => {
  it("returns — for null", () => {
    expect(formatDate(null)).toBe("—");
  });
  it("formats a date string", () => {
    const result = formatDate("2026-01-15");
    expect(result).toContain("Jan");
    expect(result).toContain("2026");
  });
});

describe("formatDateTime", () => {
  it("returns — for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  it("returns — for null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });
  it("returns 'just now' for very recent times", () => {
    expect(formatRelativeTime(new Date())).toBe("just now");
  });
  it("returns minutes ago", () => {
    const d = new Date(Date.now() - 5 * 60_000);
    expect(formatRelativeTime(d)).toBe("5m ago");
  });
  it("returns hours ago", () => {
    const d = new Date(Date.now() - 3 * 3_600_000);
    expect(formatRelativeTime(d)).toBe("3h ago");
  });
});

describe("statusLabel", () => {
  it("capitalizes and replaces underscores", () => {
    expect(statusLabel("in_progress")).toBe("In Progress");
    expect(statusLabel("paid")).toBe("Paid");
  });
});
