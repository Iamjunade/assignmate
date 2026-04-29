import { describe, expect, it } from 'vitest';
import { checkRateLimit } from '../api/_utils/rateLimit';

describe('rate limiter', () => {
  it('allows requests within limit', () => {
    const key = `test-allow-${Date.now()}`;
    const first = checkRateLimit(key, 2, 1000);
    const second = checkRateLimit(key, 2, 1000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const key = `test-block-${Date.now()}`;
    checkRateLimit(key, 1, 10_000);
    const blocked = checkRateLimit(key, 1, 10_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
