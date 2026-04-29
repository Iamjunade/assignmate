interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, RateLimitEntry>();

const cleanup = (now: number, windowMs: number) => {
  for (const [key, value] of buckets.entries()) {
    if (now - value.windowStart > windowMs) {
      buckets.delete(key);
    }
  }
};

export const checkRateLimit = (
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec?: number } => {
  const now = Date.now();

  if (buckets.size > 10000) {
    cleanup(now, windowMs);
  }

  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  buckets.set(key, entry);
  return { allowed: true };
};
