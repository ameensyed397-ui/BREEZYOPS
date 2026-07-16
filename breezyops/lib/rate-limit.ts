type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

function cleanup() {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

/**
 * Simple sliding-window rate limiter (in-memory).
 * Returns true if the request is allowed, false if rate-limited.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  if (buckets.size > 10_000) cleanup();

  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
