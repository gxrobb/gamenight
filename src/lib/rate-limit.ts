interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (ip: string, userAgent: string) => string;
}

export class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private options: RateLimitOptions) {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  private generateKey(ip: string, userAgent: string): string {
    if (this.options.keyGenerator) {
      return this.options.keyGenerator(ip, userAgent);
    }
    return `${ip}:${userAgent}`;
  }

  isAllowed(
    ip: string,
    userAgent: string
  ): {allowed: boolean; remaining: number; resetTime: number} {
    const key = this.generateKey(ip, userAgent);
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.options.windowMs,
      });
      return {
        allowed: true,
        remaining: this.options.maxRequests - 1,
        resetTime: now + this.options.windowMs,
      };
    }

    if (entry.count >= this.options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(key, entry);

    return {
      allowed: true,
      remaining: this.options.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Create rate limiter instances for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 auth attempts per 15 minutes (more strict)
});

export const userDataRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 30, // 30 requests per 5 minutes
});

// Helper function to get client IP
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a default IP (this shouldn't happen in production)
  return '127.0.0.1';
}

// Rate limiting middleware
export function withRateLimit(
  limiter: RateLimiter,
  errorMessage: string = 'Too many requests'
) {
  return function rateLimitMiddleware(
    handler: (request: Request, ...args: unknown[]) => Promise<Response>
  ) {
    return async function (request: Request, ...args: unknown[]) {
      const ip = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const result = limiter.isAllowed(ip, userAgent);

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: errorMessage,
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(
                (result.resetTime - Date.now()) / 1000
              ).toString(),
              'X-RateLimit-Limit': limiter['options'].maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args);

      if (response instanceof Response) {
        response.headers.set(
          'X-RateLimit-Limit',
          limiter['options'].maxRequests.toString()
        );
        response.headers.set(
          'X-RateLimit-Remaining',
          result.remaining.toString()
        );
        response.headers.set(
          'X-RateLimit-Reset',
          new Date(result.resetTime).toISOString()
        );
      }

      return response;
    };
  };
}
