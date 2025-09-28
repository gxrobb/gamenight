// Mock Request for testing
global.Request = class Request {
  constructor(
    public url: string,
    public init?: {headers?: Record<string, string>}
  ) {}

  headers = {
    get: (name: string) => this.init?.headers?.[name] || null,
  };
} as unknown as typeof Request;

import {RateLimiter, getClientIP} from '../rate-limit';

describe('Rate Limiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 1000, // 1 second for testing
      maxRequests: 3, // 3 requests per second
    });
  });

  afterEach(() => {
    rateLimiter.destroy();
  });

  describe('isAllowed', () => {
    it('should allow requests within the limit', () => {
      const ip = '192.168.1.1';
      const userAgent = 'test-agent';

      // First request
      let result = rateLimiter.isAllowed(ip, userAgent);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);

      // Second request
      result = rateLimiter.isAllowed(ip, userAgent);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);

      // Third request
      result = rateLimiter.isAllowed(ip, userAgent);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should block requests exceeding the limit', () => {
      const ip = '192.168.1.1';
      const userAgent = 'test-agent';

      // Make 3 requests (at the limit)
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed(ip, userAgent);
      }

      // Fourth request should be blocked
      const result = rateLimiter.isAllowed(ip, userAgent);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after the time window', async () => {
      const ip = '192.168.1.1';
      const userAgent = 'test-agent';

      // Make 3 requests (at the limit)
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed(ip, userAgent);
      }

      // Fourth request should be blocked
      let result = rateLimiter.isAllowed(ip, userAgent);
      expect(result.allowed).toBe(false);

      // Wait for the window to reset
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be allowed again
      result = rateLimiter.isAllowed(ip, userAgent);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should track different IPs separately', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';
      const userAgent = 'test-agent';

      // Make 3 requests from IP1
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed(ip1, userAgent);
      }

      // IP1 should be blocked
      const result = rateLimiter.isAllowed(ip1, userAgent);
      expect(result.allowed).toBe(false);

      // IP2 should still be allowed
      const result2 = rateLimiter.isAllowed(ip2, userAgent);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(2);
    });

    it('should track different user agents separately', () => {
      const ip = '192.168.1.1';
      const userAgent1 = 'agent1';
      const userAgent2 = 'agent2';

      // Make 3 requests with userAgent1
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed(ip, userAgent1);
      }

      // userAgent1 should be blocked
      const result = rateLimiter.isAllowed(ip, userAgent1);
      expect(result.allowed).toBe(false);

      // userAgent2 should still be allowed
      const result3 = rateLimiter.isAllowed(ip, userAgent2);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries', () => {
      const ip = '192.168.1.1';
      const userAgent = 'test-agent';

      // Make a request
      rateLimiter.isAllowed(ip, userAgent);

      // Manually trigger cleanup by accessing private method
      (rateLimiter as unknown as {cleanup: () => void}).cleanup();

      // Should still work (entry not expired yet)
      const result = rateLimiter.isAllowed(ip, userAgent);
      expect(result.allowed).toBe(true);
    });
  });
});

describe('getClientIP', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    });

    const ip = getClientIP(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'x-real-ip': '192.168.1.1',
      },
    });

    const ip = getClientIP(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should extract IP from cf-connecting-ip header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'cf-connecting-ip': '192.168.1.1',
      },
    });

    const ip = getClientIP(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should fallback to default IP when no headers present', () => {
    const request = new Request('http://example.com');

    const ip = getClientIP(request);
    expect(ip).toBe('127.0.0.1');
  });
});
